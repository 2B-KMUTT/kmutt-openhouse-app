import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const EXTERNAL_JWT_SECRET = process.env.EXTERNAL_JWT_SECRET!;

type LoginBody = {
  username: string;
  password: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body as LoginBody;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password" });
  }

  const identifier = username.trim();

  const admins = await prisma.admins.findMany({
    where: {
      OR: [{ username: identifier }, { email: identifier }],
    },
  });

  for (const admin of admins) {
    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (isValid) {
      const payload = {
        id: admin.id,
        role: "kmuser",
        name: admin.name,
        email: admin.email,
      };
      const accessToken = jwt.sign(payload, EXTERNAL_JWT_SECRET, { expiresIn: "1h" });
      return res.status(200).json({ accessToken });
    }
  }

  const staffs = await prisma.staffs.findMany({
    where: {
      OR: [{ username: identifier }, { email: identifier }],
    },
  });

  for (const staff of staffs) {
    const isValid = await bcrypt.compare(password, staff.password_hash);
    if (isValid) {
      const payload = {
        id: staff.id,
        role: "staff",
        name: staff.name,
        email: staff.email,
      };
      const accessToken = jwt.sign(payload, EXTERNAL_JWT_SECRET, { expiresIn: "1h" });
      return res.status(200).json({ accessToken });
    }
  }

  return res.status(401).json({ error: "Invalid credentials" });
}
