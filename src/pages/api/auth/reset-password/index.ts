import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { token, password: newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Missing token or new password" });
  }

  try {
    // หา token ตัวแรกที่ตรงกัน
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { token },
    });

    if (!resetToken) {
      return res.status(400).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });
    }

    if (resetToken.expiresAt < new Date()) {
      // ลบ token หมดอายุ
      await prisma.passwordResetToken.deleteMany({
        where: { token },
      });
      return res.status(400).json({ message: "Token หมดอายุ" });
    }

    // hash password ใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // update password ตามตารางที่มีอีเมลตรงกัน (Students, Staffs, Admins)
    const [updatedStudents, updatedStaffs, updatedAdmins] = await Promise.all([
      prisma.students.updateMany({
        where: { email: resetToken.email },
        data: { password_hash: hashedPassword },
      }),
      prisma.staffs.updateMany({
        where: { email: resetToken.email },
        data: { password_hash: hashedPassword },
      }),
      prisma.admins.updateMany({
        where: { email: resetToken.email },
        data: { password_hash: hashedPassword },
      }),
    ]);

    if (updatedStudents.count === 0 && updatedStaffs.count === 0 && updatedAdmins.count === 0) {
      return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้งานสำหรับอีเมลนี้" });
    }

    // ลบ token หลังใช้แล้ว
    await prisma.passwordResetToken.deleteMany({
      where: { token },
    });

    return res.status(200).json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
}
