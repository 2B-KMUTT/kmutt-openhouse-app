import type { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/libs/authGuard";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // GET: Fetch all schedule items
  if (req.method === "GET") {
    try {
      const items = await prisma.landingSchedule.findMany({
        orderBy: [
          { orderIndex: "asc" },
          { id: "asc" }
        ],
      });
      return res.status(200).json(items);
    } catch (error) {
      console.error("GET schedule error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // POST: Create schedule item
  if (req.method === "POST") {
    try {
      const {
        time,
        session,
        category,
        categoryColor,
        title,
        details,
        subSectionTitle,
        subSectionItems,
        isBreak,
        orderIndex,
        display,
      } = req.body;

      if (!time || !title || !category) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลเวลา หมวดหมู่ และชื่อกิจกรรมให้ครบถ้วน" });
      }

      // If orderIndex not provided, set to max + 1
      let finalOrder = Number(orderIndex);
      if (isNaN(finalOrder)) {
        const lastItem = await prisma.landingSchedule.findFirst({
          orderBy: { orderIndex: "desc" },
          select: { orderIndex: true },
        });
        finalOrder = (lastItem?.orderIndex ?? 0) + 1;
      }

      const created = await prisma.landingSchedule.create({
        data: {
          time: String(time).trim(),
          session: session || "all",
          category: String(category).trim(),
          categoryColor: categoryColor || "orange",
          title: String(title).trim(),
          details: Array.isArray(details) ? details.filter((d: string) => d && d.trim()) : Prisma.JsonNull,
          subSectionTitle: subSectionTitle ? String(subSectionTitle).trim() : null,
          subSectionItems: Array.isArray(subSectionItems) ? subSectionItems.filter((i: string) => i && i.trim()) : Prisma.JsonNull,
          isBreak: Boolean(isBreak),
          orderIndex: finalOrder,
          display: display !== undefined ? Boolean(display) : true,
        },
      });

      return res.status(201).json(created);
    } catch (error) {
      console.error("POST schedule error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // PUT: Update schedule item
  if (req.method === "PUT") {
    try {
      const {
        id,
        time,
        session,
        category,
        categoryColor,
        title,
        details,
        subSectionTitle,
        subSectionItems,
        isBreak,
        orderIndex,
        display,
      } = req.body;

      if (!id) {
        return res.status(400).json({ message: "Missing item ID" });
      }

      const updated = await prisma.landingSchedule.update({
        where: { id: Number(id) },
        data: {
          ...(time !== undefined && { time: String(time).trim() }),
          ...(session !== undefined && { session }),
          ...(category !== undefined && { category: String(category).trim() }),
          ...(categoryColor !== undefined && { categoryColor }),
          ...(title !== undefined && { title: String(title).trim() }),
          ...(details !== undefined && {
            details: Array.isArray(details) ? details.filter((d: string) => d && d.trim()) : Prisma.JsonNull,
          }),
          ...(subSectionTitle !== undefined && {
            subSectionTitle: subSectionTitle ? String(subSectionTitle).trim() : null,
          }),
          ...(subSectionItems !== undefined && {
            subSectionItems: Array.isArray(subSectionItems) ? subSectionItems.filter((i: string) => i && i.trim()) : Prisma.JsonNull,
          }),
          ...(isBreak !== undefined && { isBreak: Boolean(isBreak) }),
          ...(orderIndex !== undefined && { orderIndex: Number(orderIndex) }),
          ...(display !== undefined && { display: Boolean(display) }),
        },
      });


      return res.status(200).json(updated);
    } catch (error) {
      console.error("PUT schedule error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // DELETE: Delete schedule item
  if (req.method === "DELETE") {
    try {
      const id = req.query.id || req.body?.id;
      if (!id) {
        return res.status(400).json({ message: "Missing item ID" });
      }

      await prisma.landingSchedule.delete({
        where: { id: Number(id) },
      });

      return res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
      console.error("DELETE schedule error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

export default withAuth(handler, ["kmuser"]);
