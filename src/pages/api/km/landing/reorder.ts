import type { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/libs/authGuard";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { type, items } = req.body;

    if (!type || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid payload format" });
    }

    if (type === "schedule") {
      await prisma.$transaction(
        items.map((item: { id: number; orderIndex: number }) =>
          prisma.landingSchedule.update({
            where: { id: Number(item.id) },
            data: { orderIndex: Number(item.orderIndex) },
          })
        )
      );
    } else if (type === "booth") {
      await prisma.$transaction(
        items.map((item: { id: number; orderIndex: number }) =>
          prisma.landingBooth.update({
            where: { id: Number(item.id) },
            data: { orderIndex: Number(item.orderIndex) },
          })
        )
      );
    } else if (type === "banner") {
      await prisma.$transaction(
        items.map((item: { id: number; orderIndex: number }) =>
          prisma.landingBanner.update({
            where: { id: Number(item.id) },
            data: { orderIndex: Number(item.orderIndex) },
          })
        )
      );
    } else {
      return res.status(400).json({ message: "Invalid type: must be schedule, booth, or banner" });
    }

    return res.status(200).json({ message: "Reordered successfully" });
  } catch (error) {
    console.error("Reorder error:", error);
    return res.status(500).json({ message: "Failed to reorder items" });
  }
}

export default withAuth(handler, ["kmuser"]);
