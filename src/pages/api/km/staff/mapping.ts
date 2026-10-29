import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { withAuth, AuthenticatedRequest } from "@/libs/authGuard";

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user?.id;
  const isSuperAdmin = req.user.adminRole === "SUPER_ADMIN";

  switch (req.method) {
    // 🔹 ดึง mapping ของ staff คนนึง
    case "GET": {
      try {
        const staffId = parseInt(req.query.staffId as string);

        if (isNaN(staffId)) {
          return res.status(400).json({ message: "Invalid staffId" });
        }

        const whereClause = isSuperAdmin
          ? { staffId }
          : {
              staffId,
              activity: {
                ownerId: userId,
              },
            };

        const mappings = await prisma.staffMapping.findMany({
          where: whereClause,
          include: { activity: true },
        });

        return res.json(mappings.map((m) => m.activityId));
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching staff mapping" });
      }
    }

    // 🔹 อัพเดทกิจกรรมที่ staff ดูแล
    case "POST": {
      try {
        const { staffId, activityIds } = req.body;

        if (!staffId || !Array.isArray(activityIds)) {
          return res.status(400).json({ message: "Invalid body" });
        }

        // ตรวจสอบว่ากิจกรรมทั้งหมดที่เลือกถูกต้อง (ถ้า Super Admin เลือกกิจกรรมใดก็ได้, ถ้า regular admin ต้องเป็นของตัวเอง)
        const whereActivities = isSuperAdmin
          ? { id: { in: activityIds } }
          : { id: { in: activityIds }, ownerId: userId };

        const validActivities = await prisma.activities.findMany({
          where: whereActivities,
          select: { id: true },
        });
        const validIds = validActivities.map((a) => a.id);

        // ลบ mapping เก่าของ staffId
        const deleteWhere = isSuperAdmin
          ? { staffId }
          : {
              staffId,
              activity: { ownerId: userId },
            };

        await prisma.staffMapping.deleteMany({
          where: deleteWhere,
        });

        // เพิ่ม mapping ใหม่
        const newMappings = await prisma.staffMapping.createMany({
          data: validIds.map((id) => ({
            staffId,
            activityId: id,
          })),
          skipDuplicates: true,
        });

        return res.json({ success: true, count: newMappings.count });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error updating staff mapping" });
      }
    }

    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}

export default withAuth(handler, ["kmuser"]);
