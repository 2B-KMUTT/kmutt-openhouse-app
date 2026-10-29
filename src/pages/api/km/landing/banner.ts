import type { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/libs/authGuard";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // GET: Fetch all banners
  if (req.method === "GET") {
    try {
      const banners = await prisma.landingBanner.findMany({
        orderBy: [
          { orderIndex: "asc" },
          { id: "asc" },
        ],
      });
      return res.status(200).json(banners);
    } catch (error) {
      console.error("GET banners error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // POST: Create banner
  if (req.method === "POST") {
    try {
      const { imageUrl, altText, linkUrl, orderIndex, display } = req.body;

      if (!imageUrl || !imageUrl.trim()) {
        return res.status(400).json({ message: "กรุณาระบุ URL รูปภาพแบนเนอร์" });
      }

      let finalOrder = Number(orderIndex);
      if (isNaN(finalOrder)) {
        const lastItem = await prisma.landingBanner.findFirst({
          orderBy: { orderIndex: "desc" },
          select: { orderIndex: true },
        });
        finalOrder = (lastItem?.orderIndex ?? 0) + 1;
      }

      const created = await prisma.landingBanner.create({
        data: {
          imageUrl: String(imageUrl).trim(),
          altText: altText ? String(altText).trim() : null,
          linkUrl: linkUrl ? String(linkUrl).trim() : null,
          orderIndex: finalOrder,
          display: display !== undefined ? Boolean(display) : true,
        },
      });

      return res.status(201).json(created);
    } catch (error) {
      console.error("POST banner error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // PUT: Update banner
  if (req.method === "PUT") {
    try {
      const { id, imageUrl, altText, linkUrl, orderIndex, display } = req.body;

      if (!id) {
        return res.status(400).json({ message: "Missing banner ID" });
      }

      const updated = await prisma.landingBanner.update({
        where: { id: Number(id) },
        data: {
          ...(imageUrl !== undefined && { imageUrl: String(imageUrl).trim() }),
          ...(altText !== undefined && { altText: altText ? String(altText).trim() : null }),
          ...(linkUrl !== undefined && { linkUrl: linkUrl ? String(linkUrl).trim() : null }),
          ...(orderIndex !== undefined && { orderIndex: Number(orderIndex) }),
          ...(display !== undefined && { display: Boolean(display) }),
        },
      });

      return res.status(200).json(updated);
    } catch (error) {
      console.error("PUT banner error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // DELETE: Delete banner
  if (req.method === "DELETE") {
    try {
      const id = req.query.id || req.body?.id;
      if (!id) {
        return res.status(400).json({ message: "Missing banner ID" });
      }

      await prisma.landingBanner.delete({
        where: { id: Number(id) },
      });

      return res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
      console.error("DELETE banner error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

export default withAuth(handler, ["kmuser"]);

