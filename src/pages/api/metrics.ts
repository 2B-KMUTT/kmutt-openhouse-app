import type { NextApiRequest, NextApiResponse } from "next";
import { getPrometheusMetricsText } from "@/libs/metrics";

/**
 * Prometheus Scrape Endpoint: /api/metrics
 * Content-Type: text/plain; version=0.0.4; charset=utf-8
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const metricsText = await getPrometheusMetricsText();
    res.setHeader("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.status(200).send(metricsText);
  } catch (err: unknown) {
    console.error("Failed to generate Prometheus metrics:", err);
    return res.status(500).send("# Error collecting metrics\n");
  }
}
