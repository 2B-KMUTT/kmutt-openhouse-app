// pages/api/student/activities/[id]/register.ts
import type { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/libs/authGuard";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const activityId = Number(id);
    const studentId = req.user.id;
    const { action, portfolio_url } = req.body || {};
    const trimmedPortfolio = typeof portfolio_url === "string" ? portfolio_url.trim() : null;

    // ดึงข้อมูลกิจกรรมที่ต้องการลงทะเบียน
    const activity = await prisma.activities.findUnique({
      where: { id: activityId },
      include: { _count: { select: { RegisterActivities: true } } },
    });

    if (!activity) {
      return res.status(404).json({ message: "กิจกรรมไม่พบ" });
    }

    // ตรวจสอบว่าผู้ใช้งานเคยลงทะเบียนแล้วหรือยัง
    const registration = await prisma.registerActivities.findUnique({
      where: { studentId_activityId: { studentId, activityId } },
    });

    if (registration) {
      // หากส่ง action เพื่ออัปเดตลิงก์พอร์ตโฟลิโอโดยเฉพาะ ไม่ต้องลบการลงทะเบียน (ไม่เสียสิทธิ์ที่นั่ง)
      if (action === "update_portfolio") {
        const updatedReg = await prisma.registerActivities.update({
          where: { studentId_activityId: { studentId, activityId } },
          data: { portfolio_url: trimmedPortfolio },
        });
        return res.status(200).json({
          registered: true,
          portfolio_url: updatedReg.portfolio_url,
          message: "อัปเดตลิงก์ Portfolio เรียบร้อย",
        });
      }

      // ถ้าไม่มี action อัปเดต => ลบ (ยกเลิกการลงทะเบียน)
      await prisma.registerActivities.delete({
        where: { studentId_activityId: { studentId, activityId } },
      });
      return res.status(200).json({ registered: false, message: "ยกเลิกการลงทะเบียนเรียบร้อย" });
    }

    // ตรวจสอบกิจกรรมที่ชนกันตามวันและเวลา
    const conflicting = await prisma.registerActivities.findFirst({
      where: {
        studentId,
        activity: {
          date: activity.date,
          AND: [
            { start_time: { lt: activity.end_time } },
            { end_time: { gt: activity.start_time } },
          ],
        },
      },
      include: {
        activity: true,
      },
    });

    if (conflicting) {
      return res.status(400).json({
        registered: false,
        message: `คุณมีการลงทะเบียนกิจกรรม "${conflicting.activity.title}" ในช่วงเวลาเดียวกันแล้ว`,
      });
    }

    // ตรวจสอบว่ากิจกรรมเต็มหรือไม่ (max_participants = 999 คือไม่จำกัด)
    if (activity.max_participants !== 999 && activity._count.RegisterActivities >= activity.max_participants) {
      return res.status(400).json({ registered: false, message: "จำนวนผู้เข้าร่วมเต็มแล้ว" });
    }

    // ลงทะเบียนใหม่
    const newReg = await prisma.registerActivities.create({
      data: {
        studentId,
        activityId,
        portfolio_url: trimmedPortfolio,
      },
    });

    return res.status(200).json({
      registered: true,
      portfolio_url: newReg.portfolio_url,
      message: "ลงทะเบียนเรียบร้อย",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export default withAuth(handler, ["student"]);
