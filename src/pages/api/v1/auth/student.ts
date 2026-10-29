import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const EXTERNAL_JWT_SECRET = process.env.EXTERNAL_JWT_SECRET!;

type LoginBody = {
  email: string;
  password: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body as LoginBody;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  const identifier = email.trim();

  const students = await prisma.students.findMany({
    where: {
      OR: [
        { email: identifier },
        { citizen_id: identifier },
        { passport_id: identifier },
        { phone: identifier },
      ],
    },
  });

  let matchedStudent = null;
  for (const s of students) {
    const isValid = await bcrypt.compare(password, s.password_hash);
    if (isValid) {
      matchedStudent = s;
      break;
    }
  }

  if (!matchedStudent) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const payload = {
    id: matchedStudent.id,
    role: matchedStudent.role,
    name: `${matchedStudent.first_name} ${matchedStudent.last_name}`.trim(),
    school: matchedStudent.school,
    province: matchedStudent.province,
    uuid: matchedStudent.uuid,
    citizen_id: matchedStudent.citizen_id,
    phone: matchedStudent.phone,
    email: matchedStudent.email,
  };

  const accessToken = jwt.sign(payload, EXTERNAL_JWT_SECRET, { expiresIn: "1h" });

  return res.status(200).json({ accessToken });
}
