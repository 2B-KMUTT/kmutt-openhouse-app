import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const configs = await prisma.landingConfig.findMany();
    const configMap: Record<string, string> = {};
    const updatedAtMap: Record<string, Date> = {};
    for (const c of configs) {
      configMap[c.key] = c.value;
      updatedAtMap[c.key] = c.updated_at;
    }

    // Harmonize location: prefer the more recently updated one if both exist
    if (configMap.heroLocationText && configMap.eventLocationTh) {
      if (updatedAtMap.heroLocationText > updatedAtMap.eventLocationTh) {
        configMap.eventLocationTh = configMap.heroLocationText;
      } else {
        configMap.heroLocationText = configMap.eventLocationTh;
      }
    } else if (configMap.heroLocationText) {
      configMap.eventLocationTh = configMap.heroLocationText;
    } else if (configMap.eventLocationTh) {
      configMap.heroLocationText = configMap.eventLocationTh;
    }

    // Harmonize date: prefer the more recently updated one if both exist
    if (configMap.heroDateText && configMap.eventDateTh) {
      if (updatedAtMap.heroDateText > updatedAtMap.eventDateTh) {
        configMap.eventDateTh = configMap.heroDateText;
      } else {
        configMap.heroDateText = configMap.eventDateTh;
      }
    } else if (configMap.heroDateText) {
      configMap.eventDateTh = configMap.heroDateText;
    } else if (configMap.eventDateTh) {
      configMap.heroDateText = configMap.eventDateTh;
    }

    return res.status(200).json(configMap);
  } catch (error) {
    console.error("Error fetching landing config:", error);
    return res.status(500).json({ message: "Failed to fetch config" });
  }
}

