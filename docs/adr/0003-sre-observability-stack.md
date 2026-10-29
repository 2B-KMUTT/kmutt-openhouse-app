# ADR 0003: SRE Observability Stack, Multi-Burn-Rate Alerting, and Cardinality Management

## Status
Accepted

## Context
During the annual KMUTT OpenHouse event, the application experiences burst traffic from thousands of prospective students accessing registration, activities, live stamp scanning, and media uploads. 

Prior monitoring lacked formal Service Level Objectives (SLOs), relied on naive single-window threshold alerts (triggering false alarms or missing slow burns), and risked Prometheus TSDB Out-Of-Memory (OOM) failures from unbounded metric labels (the Cardinality Trap). Furthermore, operational dashboards mixed low-level infrastructure statistics with business metrics, hindering rapid incident response.

## Decision

1. **3-Tier Dashboard Narrative Architecture**:
   - Organize Grafana dashboards into three strict sequential tiers:
     - **Tier 1 (Service Health & SLIs)**: Immediate symptom assessment showing 99.9% Availability SLI, 30-day Error Budget remaining, Multi-Window Burn Rate, and global HTTP throughput (RPS).
     - **Tier 2 (Traffic, Latency & Error Distribution - RED Method)**: Route-level traffic rates, tail latencies (p50/p90/p99) via histogram quantiles, and 4xx vs 5xx distributions.
     - **Tier 3 (Infrastructure Saturation - USE Method)**: CPU/Memory/Disk I/O saturation across application and database nodes, plus MySQL connection pool utilization.

2. **Google SRE Multi-Window Multi-Burn-Rate Alerting**:
   - Transition from arbitrary 5-minute error thresholds to Multi-Burn-Rate alerts based on a 30-day Availability SLO of 99.9% (error budget: 0.1% = 43.2 minutes total downtime):
     - **Fast Burn ($14.4\times$)**: 2% error budget consumed in 1 hour. Evaluated across 1h (long window) and 5m (short window) $\rightarrow$ **Page / Critical**.
     - **Slow Burn ($6\times$)**: 5% error budget consumed in 6 hours. Evaluated across 6h (long window) and 30m (short window) $\rightarrow$ **Page / Warning**.
     - **Ticket Burn ($3\times$)**: 10% error budget consumed in 24 hours. Evaluated across 24h and 2h $\rightarrow$ **Ticket / Business Hours**.

3. **Strict Label Bounding & Cardinality Guardrails**:
   - Enforce closed-set enums for all metric labels (`method`, `status`, `handler`, `instance`, `job`).
   - Strictly prohibit unbounded dynamic parameters (`user_id`, `session_id`, `order_id`, UUIDs, query strings) in metric labels. All path IDs must pass through route normalization (`normalizeRoute` in `src/libs/metrics.ts`).
   - Monitor Prometheus TSDB health directly with an alert on `prometheus_tsdb_head_series > 50000` to prevent OOM loops.

4. **Alertmanager Noise Reduction & Runbook Linkage**:
   - Implement **Inhibition rules** to silence downstream service alerts when a physical node or host is down (`TargetInstanceDown`).
   - Implement **Grouping rules** to bundle simultaneous container failures into a single notification digest.
   - Require all pageable alert definitions to include a `runbook_url` linking directly to actionable remediation documentation.

## Consequences

- **Positive**:
  - Provides a predictable, empirical foundation for uptime and performance reporting (99.9% availability).
  - Eliminates alert fatigue and notification blindness by replacing false positives with symptom-based paging.
  - Ensures TSDB memory and disk consumption remain predictable (~1.0 GB per 15-day retention at ~6,000 active series).
  - Accelerates incident response by cutting Mean Time to Detect (MTTD) and Mean Time to Resolve (MTTR).

- **Trade-offs / Mitigations**:
  - Multi-window PromQL queries consume slightly more evaluation cycles in Prometheus than single-window queries; mitigated by 15s evaluation intervals and keeping the active series count bounded.
  - Engineers must adhere strictly to route normalization when creating new API endpoints to avoid leaking dynamic parameters into metric labels.
