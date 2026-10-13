import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import { withAuth } from "@/libs/authGuard"

const prisma = new PrismaClient()

export default withAuth(async function handler(req, res) {
  if (req.method !== "POST") res.status(405).end()

  const { studentId, newPassword } = req.body
  if (!studentId || !newPassword)
    return res.status(400).json({ error: "ข้อมูลไม่ครบ" })

  const hashed = await bcrypt.hash(newPassword, 10)

  await prisma.students.update({
    where: { id: studentId },
    data: { password_hash: hashed },
  })

  res.status(200).json({ success: true })
}, ["staff"])
