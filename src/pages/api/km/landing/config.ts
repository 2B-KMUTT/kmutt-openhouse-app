import type { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/libs/authGuard";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // GET: Fetch all configs
  if (req.method === "GET") {
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
      console.error("GET config error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // PUT: Update configs (accepts key-value dictionary)
  if (req.method === "PUT") {
    try {
      const updates = { ...req.body };

      if (!updates || typeof updates !== "object") {
        return res.status(400).json({ message: "Invalid payload format" });
      }

      // Synchronize location keys if only one was provided
      if (updates.heroLocationText !== undefined && updates.eventLocationTh === undefined) {
        updates.eventLocationTh = updates.heroLocationText;
      } else if (updates.eventLocationTh !== undefined && updates.heroLocationText === undefined) {
        updates.heroLocationText = updates.eventLocationTh;
      }

      // Synchronize date keys if only one was provided
      if (updates.heroDateText !== undefined && updates.eventDateTh === undefined) {
        updates.eventDateTh = updates.heroDateText;
      } else if (updates.eventDateTh !== undefined && updates.heroDateText === undefined) {
        updates.heroDateText = updates.eventDateTh;
      }

      const keys = Object.keys(updates);
      await prisma.$transaction(
        keys.map((key) => {
          const val =
            typeof updates[key] === "object"
              ? JSON.stringify(updates[key])
              : String(updates[key] ?? "");

          return prisma.landingConfig.upsert({
            where: { key },
            update: { value: val },
            create: { key, value: val },
          });
        })
      );

      return res.status(200).json({ message: "Updated configs successfully" });
    } catch (error) {
      console.error("PUT config error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

export default withAuth(handler, ["kmuser"]);

