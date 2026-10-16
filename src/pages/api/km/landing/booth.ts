import type { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/libs/authGuard";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // GET: Fetch all booths
  if (req.method === "GET") {
    try {
      const items = await prisma.landingBooth.findMany({
        orderBy: [
          { orderIndex: "asc" },
          { id: "asc" }
        ],
      });
      return res.status(200).json(items);
    } catch (error) {
      console.error("GET booth error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // POST: Create booth
  if (req.method === "POST") {
    try {
      const { location, units, orderIndex, display } = req.body;

      if (!location) {
        return res.status(400).json({ message: "กรุณาระบุชื่อโซนหรือสถานที่บูท" });
      }

      let parsedUnits: string[] = [];
      if (Array.isArray(units)) {
        parsedUnits = units.filter((u: string) => u && String(u).trim()).map((u: string) => String(u).trim());
      } else if (typeof units === "string") {
        parsedUnits = units
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
      }

      let finalOrder = Number(orderIndex);
      if (isNaN(finalOrder)) {
        const lastItem = await prisma.landingBooth.findFirst({
          orderBy: { orderIndex: "desc" },
          select: { orderIndex: true },
        });
        finalOrder = (lastItem?.orderIndex ?? 0) + 1;
      }

      const created = await prisma.landingBooth.create({
        data: {
          location: String(location).trim(),
          units: parsedUnits,
          orderIndex: finalOrder,
          display: display !== undefined ? Boolean(display) : true,
        },
      });

      return res.status(201).json(created);
    } catch (error) {
      console.error("POST booth error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // PUT: Update booth
  if (req.method === "PUT") {
    try {
      const { id, location, units, orderIndex, display } = req.body;

      if (!id) {
        return res.status(400).json({ message: "Missing item ID" });
      }

      let parsedUnits: string[] | undefined = undefined;
      if (units !== undefined) {
        if (Array.isArray(units)) {
          parsedUnits = units.filter((u: string) => u && String(u).trim()).map((u: string) => String(u).trim());
        } else if (typeof units === "string") {
          parsedUnits = units
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
        }
      }

      const updated = await prisma.landingBooth.update({
        where: { id: Number(id) },
        data: {
          ...(location !== undefined && { location: String(location).trim() }),
          ...(parsedUnits !== undefined && { units: parsedUnits }),
          ...(orderIndex !== undefined && { orderIndex: Number(orderIndex) }),
          ...(display !== undefined && { display: Boolean(display) }),
        },
      });

      return res.status(200).json(updated);
    } catch (error) {
      console.error("PUT booth error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // DELETE: Delete booth
  if (req.method === "DELETE") {
    try {
      const id = req.query.id || req.body?.id;
      if (!id) {
        return res.status(400).json({ message: "Missing item ID" });
      }

      await prisma.landingBooth.delete({
        where: { id: Number(id) },
      });

      return res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
      console.error("DELETE booth error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

export default withAuth(handler, ["kmuser"]);
