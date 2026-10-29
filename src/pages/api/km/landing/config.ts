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
      for (const c of configs) {
        configMap[c.key] = c.value;
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
      const updates = req.body; // e.g. { heroTitle: "...", eventDateTh: "..." }

      if (!updates || typeof updates !== "object") {
        return res.status(400).json({ message: "Invalid payload format" });
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

