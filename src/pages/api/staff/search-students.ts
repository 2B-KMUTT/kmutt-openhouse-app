import { PrismaClient } from "@prisma/client"
import { withAuth } from "@/libs/authGuard"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default withAuth(async function handler(req, res) {
  const { query } = req.query
  if (!query) return res.status(400).json({ error: "Missing query" })

  const q = String(query).trim()

  const students = await prisma.students.findMany({
    where: {
      OR: [
        { email: { contains: q } },
        { first_name: { contains: q } },
        { last_name: { contains: q } },
        { phone: { contains: q } },
        { citizen_id: { contains: q } },
      ],
    },
    select: { id: true, first_name: true, last_name: true, email: true, role: true },
    take: 20,
  })

  res.status(200).json({ students })
}, ["staff"])
