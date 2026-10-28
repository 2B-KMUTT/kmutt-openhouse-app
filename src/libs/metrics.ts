import { PrismaClient } from "@prisma/client";

/**
 * KMUTT OpenHouse SRE Observability Metrics Registry
 * Aligned with INT531: Prometheus Metrics, Pull Model & Cardinality Protection
 */

interface HistogramData {
  buckets: number[];
  bucketCounts: number[];
  sum: number;
  count: number;
}

interface MetricsStore {
  httpRequestsTotal: Map<string, number>;
  httpRequestDurations: Map<string, HistogramData>;
  httpRequestsInFlight: number;
  businessMetricsCache: {
    timestamp: number;
    metrics: Record<string, number>;
  } | null;
}

// Attach store to globalThis to preserve state across hot-reloads & invocations in Node runtime
const globalForMetrics = globalThis as unknown as {
  __openhouse_metrics_store?: MetricsStore;
  __openhouse_prisma_for_metrics?: PrismaClient;
};

const BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];

function getStore(): MetricsStore {
  if (!globalForMetrics.__openhouse_metrics_store) {
    globalForMetrics.__openhouse_metrics_store = {
      httpRequestsTotal: new Map(),
      httpRequestDurations: new Map(),
      httpRequestsInFlight: 0,
      businessMetricsCache: null,
    };
  }
  return globalForMetrics.__openhouse_metrics_store;
}

function getPrisma(): PrismaClient {
  if (!globalForMetrics.__openhouse_prisma_for_metrics) {
    globalForMetrics.__openhouse_prisma_for_metrics = new PrismaClient();
  }
  return globalForMetrics.__openhouse_prisma_for_metrics;
}

/**
 * Route normalization to strictly avoid the "Cardinality Trap" (INT531 Slide 1.9)
 * Maps dynamic parameters (IDs, UUIDs, hashes) to closed-set tokens.
 */
export function normalizeRoute(rawUrl: string): string {
  if (!rawUrl) return "unknown";
  
  // 1. Strip query string
  let path = rawUrl.split("?")[0] || "/";

  // 2. Handle static assets & internal Next.js routes
  if (path.startsWith("/_next/static")) return "/_next/static/*";
  if (path.startsWith("/_next/image")) return "/_next/image";
  if (path.startsWith("/_next/data")) return "/_next/data/*";
  if (path.startsWith("/images/") || path.startsWith("/fonts/")) return "/static_assets/*";
  if (path === "/favicon.ico" || path === "/robots.txt") return "/static_file";

  // 3. Normalize UUIDs (e.g. 550e8400-e29b-41d4-a716-446655440000 -> :uuid)
  path = path.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ":uuid");

  // 4. Normalize numeric IDs in path segments (e.g. /activities/123 -> /activities/:id)
  path = path.replace(/\/\d+(?=\/|$)/g, "/:id");

  return path;
}

export function incrementInFlight(): void {
  const store = getStore();
  store.httpRequestsInFlight++;
}

export function decrementInFlight(): void {
  const store = getStore();
  if (store.httpRequestsInFlight > 0) {
    store.httpRequestsInFlight--;
  }
}

export function recordHttpRequest(
  method: string,
  rawPath: string,
  statusCode: number,
  durationSeconds: number
): void {
  const store = getStore();
  const route = normalizeRoute(rawPath);
  const statusStr = statusCode ? statusCode.toString() : "0";
  const normalizedMethod = (method || "GET").toUpperCase();

  // 1. Increment Counter: http_requests_total
  const counterKey = `${normalizedMethod}|${route}|${statusStr}`;
  const currentCount = store.httpRequestsTotal.get(counterKey) || 0;
  store.httpRequestsTotal.set(counterKey, currentCount + 1);

  // 2. Observe Histogram: http_request_duration_seconds
  const histKey = `${normalizedMethod}|${route}|${statusStr}`;
  let hist = store.httpRequestDurations.get(histKey);
  if (!hist) {
    hist = {
      buckets: BUCKETS,
      bucketCounts: new Array(BUCKETS.length).fill(0),
      sum: 0,
      count: 0,
    };
    store.httpRequestDurations.set(histKey, hist);
  }

  hist.count++;
  hist.sum += durationSeconds;
  for (let i = 0; i < BUCKETS.length; i++) {
    if (durationSeconds <= BUCKETS[i]) {
      hist.bucketCounts[i]++;
    }
  }
}

/**
 * Fetch business metrics cached for 15s to avoid stressing MySQL during frequent Prometheus scrapes
 */
async function getCachedBusinessMetrics(): Promise<{
  dbUp: number;
  usersByRole: Record<string, number>;
  activityRegistrations: number;
  estamps: number;
  surveys: number;
}> {
  const store = getStore();
  const now = Date.now();
  const CACHE_TTL_MS = 15000;

  if (store.businessMetricsCache && now - store.businessMetricsCache.timestamp < CACHE_TTL_MS) {
    const m = store.businessMetricsCache.metrics;
    return {
      dbUp: m.dbUp ?? 1,
      usersByRole: {
        student: m["users_student"] ?? 0,
        parent: m["users_parent"] ?? 0,
        teacher: m["users_teacher"] ?? 0,
        guest: m["users_guest"] ?? 0,
      },
      activityRegistrations: m["activity_registrations"] ?? 0,
      estamps: m["estamps"] ?? 0,
      surveys: m["surveys"] ?? 0,
    };
  }

  const prisma = getPrisma();
  let dbUp = 1;
  const usersByRole: Record<string, number> = {
    student: 0,
    parent: 0,
    teacher: 0,
    guest: 0,
  };
  let activityRegistrations = 0;
  let estamps = 0;
  let surveys = 0;

  try {
    // Run lightweight count queries
    const [userCounts, actRegCount, estampCount, surveyCount] = await Promise.all([
      prisma.students.groupBy({
        by: ["role"],
        _count: { _all: true },
      }),
      prisma.registerActivities.count(),
      prisma.eStamp.count(),
      prisma.publicSurvey.count(),
    ]);

    for (const group of userCounts) {
      if (group.role) {
        usersByRole[group.role.toLowerCase()] = group._count._all;
      }
    }
    activityRegistrations = actRegCount;
    estamps = estampCount;
    surveys = surveyCount;
  } catch (error) {
    dbUp = 0;
  }

  // Update Cache
  store.businessMetricsCache = {
    timestamp: now,
    metrics: {
      dbUp,
      users_student: usersByRole.student,
      users_parent: usersByRole.parent,
      users_teacher: usersByRole.teacher,
      users_guest: usersByRole.guest,
      activity_registrations: activityRegistrations,
      estamps,
      surveys,
    },
  };

  return {
    dbUp,
    usersByRole,
    activityRegistrations,
    estamps,
    surveys,
  };
}

/**
 * Format all metrics into official Prometheus Text Format (0.0.4)
 */
export async function getPrometheusMetricsText(): Promise<string> {
  const store = getStore();
  const lines: string[] = [];

  // ==========================================
  // 1. Process & Node.js Runtime Telemetry
  // ==========================================
  const mem = typeof process?.memoryUsage === "function" ? process.memoryUsage() : { rss: 0, heapUsed: 0, heapTotal: 0 };
  lines.push("# HELP process_resident_memory_bytes Resident memory size in bytes.");
  lines.push("# TYPE process_resident_memory_bytes gauge");
  lines.push(`process_resident_memory_bytes ${mem.rss}`);

  lines.push("# HELP nodejs_heap_size_used_bytes Process heap size used from Node.js in bytes.");
  lines.push("# TYPE nodejs_heap_size_used_bytes gauge");
  lines.push(`nodejs_heap_size_used_bytes ${mem.heapUsed}`);

  lines.push("# HELP nodejs_heap_size_total_bytes Process heap size total from Node.js in bytes.");
  lines.push("# TYPE nodejs_heap_size_total_bytes gauge");
  lines.push(`nodejs_heap_size_total_bytes ${mem.heapTotal}`);

  const uptime = typeof process?.uptime === "function" ? process.uptime().toFixed(2) : "0.00";
  lines.push("# HELP process_uptime_seconds The time the process has been running in seconds.");
  lines.push("# TYPE process_uptime_seconds counter");
  lines.push(`process_uptime_seconds ${uptime}`);

  // ==========================================
  // 2. HTTP In-Flight Requests (Gauge)
  // ==========================================
  lines.push("# HELP http_requests_in_flight Current number of HTTP requests being processed.");
  lines.push("# TYPE http_requests_in_flight gauge");
  lines.push(`http_requests_in_flight ${store.httpRequestsInFlight}`);

  // ==========================================
  // 3. HTTP Requests Total (Counter)
  // ==========================================
  lines.push("# HELP http_requests_total Total number of HTTP requests processed.");
  lines.push("# TYPE http_requests_total counter");
  for (const [key, value] of store.httpRequestsTotal.entries()) {
    const [method, route, status] = key.split("|");
    lines.push(`http_requests_total{method="${method}",route="${route}",status="${status}"} ${value}`);
  }

  // ==========================================
  // 4. HTTP Request Duration (Histogram)
  // ==========================================
  lines.push("# HELP http_request_duration_seconds HTTP request latencies in seconds.");
  lines.push("# TYPE http_request_duration_seconds histogram");
  for (const [key, hist] of store.httpRequestDurations.entries()) {
    const [method, route, status] = key.split("|");
    for (let i = 0; i < hist.buckets.length; i++) {
      const le = hist.buckets[i];
      const count = hist.bucketCounts[i];
      lines.push(
        `http_request_duration_seconds_bucket{method="${method}",route="${route}",status="${status}",le="${le}"} ${count}`
      );
    }
    // +Inf bucket and summary stats
    lines.push(
      `http_request_duration_seconds_bucket{method="${method}",route="${route}",status="${status}",le="+Inf"} ${hist.count}`
    );
    lines.push(
      `http_request_duration_seconds_sum{method="${method}",route="${route}",status="${status}"} ${hist.sum.toFixed(6)}`
    );
    lines.push(
      `http_request_duration_seconds_count{method="${method}",route="${route}",status="${status}"} ${hist.count}`
    );
  }

  // ==========================================
  // 5. OpenHouse Business Metrics
  // ==========================================
  const biz = await getCachedBusinessMetrics();

  lines.push("# HELP openhouse_db_up Database connectivity health status from the app perspective (1 = up, 0 = down).");
  lines.push("# TYPE openhouse_db_up gauge");
  lines.push(`openhouse_db_up ${biz.dbUp}`);

  lines.push("# HELP openhouse_registered_users_total Total registered users by role.");
  lines.push("# TYPE openhouse_registered_users_total gauge");
  for (const [role, count] of Object.entries(biz.usersByRole)) {
    lines.push(`openhouse_registered_users_total{role="${role}"} ${count}`);
  }

  lines.push("# HELP openhouse_activity_registrations_total Total activity sign-ups across all events.");
  lines.push("# TYPE openhouse_activity_registrations_total gauge");
  lines.push(`openhouse_activity_registrations_total ${biz.activityRegistrations}`);

  lines.push("# HELP openhouse_estamps_total Total E-Stamps awarded to attendees.");
  lines.push("# TYPE openhouse_estamps_total gauge");
  lines.push(`openhouse_estamps_total ${biz.estamps}`);

  lines.push("# HELP openhouse_survey_responses_total Total feedback and public survey responses.");
  lines.push("# TYPE openhouse_survey_responses_total gauge");
  lines.push(`openhouse_survey_responses_total ${biz.surveys}`);

  lines.push(""); // Trailing newline
  return lines.join("\n");
}
