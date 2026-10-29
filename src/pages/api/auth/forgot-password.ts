// src/pages/api/auth/forgot-password.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER, // Gmail ของคุณ
    pass: process.env.SMTP_PASS, // App Password ของ Gmail
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const trimmedEmail = String(email).trim();

    // ตรวจสอบ email ใน Students, Staffs และ Admins
    const student = await prisma.students.findUnique({ where: { email: trimmedEmail } });
    const staff = !student ? await prisma.staffs.findUnique({ where: { email: trimmedEmail } }) : null;
    const admin = !student && !staff ? await prisma.admins.findUnique({ where: { email: trimmedEmail } }) : null;

    if (!student && !staff && !admin) {
      return res.status(404).json({ message: "Email not found" });
    }

    const displayName = student ? student.first_name : (staff?.name || admin?.name || "ผู้ใช้งาน");

    // สร้าง token แบบสุ่ม
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 ชั่วโมง

    // ใช้ upsert ป้องกัน unique constraint error
    await prisma.passwordResetToken.upsert({
      where: { email: trimmedEmail },
      update: { token, expiresAt },
      create: { email: trimmedEmail, token, expiresAt },
    });

    // ส่งอีเมล
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}&email=${encodeURIComponent(trimmedEmail)}`;
    await transporter.sendMail({
      from: `"KMUTT Open House" <${process.env.SMTP_USER}>`,
      to: trimmedEmail,
      subject: "Reset your password",
      html: `
        <p>สวัสดี ${displayName},</p>
        <p>คุณขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ กรุณาคลิกลิงก์ด้านล่างเพื่อเปลี่ยนรหัสผ่าน (ใช้ได้ 1 ชั่วโมง)</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>ถ้าไม่ได้ร้องขอ โปรดละเว้นอีเมลนี้</p>
      `,
    });

    res.status(200).json({ message: "Reset password link sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
