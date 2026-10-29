import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const VALID_ROLES: Role[] = ["student", "parent", "teacher", "guest"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    first_name,
    last_name,
    school,
    province,
    email,
    phone,
    password,
    citizen_id,
    passport_id,
    role,
  } = req.body ?? {};

  const trimmedEmail = typeof email === "string" ? email.trim() : "";
  const trimmedFirstName = typeof first_name === "string" ? first_name.trim() : "";
  const trimmedLastName = typeof last_name === "string" ? last_name.trim() : "";
  const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
  const trimmedCitizenId = typeof citizen_id === "string" && citizen_id.trim() ? citizen_id.trim() : null;
  const trimmedPassportId = typeof passport_id === "string" && passport_id.trim() ? passport_id.trim() : null;
  const normalizedRole: Role = VALID_ROLES.includes(role) ? role : "student";

  if (!trimmedFirstName || !trimmedLastName || !trimmedEmail || !trimmedPhone || !password) {
    return res.status(400).json({ message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" });
  }

  try {
    const existingByEmail = await prisma.students.findUnique({
      where: { email: trimmedEmail },
    });
    if (existingByEmail) {
      return res.status(400).json({ message: "อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่นหรือเข้าสู่ระบบ" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.students.create({
      data: {
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
        citizen_id: trimmedCitizenId,
        school: typeof school === "string" && school.trim() ? school.trim() : null,
        province: typeof province === "string" && province.trim() ? province.trim() : null,
        email: trimmedEmail,
        phone: trimmedPhone,
        password_hash: hashedPassword,
        role: normalizedRole,
        passport_id: trimmedPassportId,
      }
    });

    res.status(200).json({ message: "Registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Error registering" });
  }
}
