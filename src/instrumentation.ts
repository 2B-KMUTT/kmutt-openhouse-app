import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Next.js Instrumentation Hook
 * Automatically captures HTTP request latencies, status codes, and in-flight counts
 * without requiring manual wrapper code in individual API routes.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const http = await import("node:http");
    const { recordHttpRequest, incrementInFlight, decrementInFlight } = await import("@/libs/metrics");

    const serverProto = http.Server.prototype as unknown as {
      __openhouse_instrumented?: boolean;
      emit: (event: string, ...args: unknown[]) => boolean;
    };

    if (serverProto.__openhouse_instrumented) {
      return;
    }
    serverProto.__openhouse_instrumented = true;

    const originalEmit = serverProto.emit;

    serverProto.emit = function (event: string, ...args: unknown[]) {
      if (event === "request") {
        const req = args[0] as IncomingMessage | undefined;
        const res = args[1] as ServerResponse | undefined;

        if (req && res && req.url) {
          const url = req.url;

          // Skip scraping endpoint and static assets to prevent skewing user traffic SLIs
          if (
            url.startsWith("/api/metrics") ||
            url.startsWith("/_next/static") ||
            url === "/favicon.ico"
          ) {
            return originalEmit.apply(this, [event, ...args]);
          }

          const startHrTime = process.hrtime();
          incrementInFlight();

          let completed = false;
          const onComplete = () => {
            if (completed) return;
            completed = true;
            decrementInFlight();
            const diff = process.hrtime(startHrTime);
            const durationSeconds = diff[0] + diff[1] / 1e9;
            recordHttpRequest(
              req.method || "GET",
              url,
              res.statusCode || 200,
              durationSeconds
            );
          };

          res.once("finish", onComplete);
          res.once("close", onComplete);
        }
      }
      return originalEmit.apply(this, [event, ...args]);
    };
  }
}
