import type { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/libs/authGuard";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const guest = await prisma.students.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      phone: true,
      school: true,
      province: true,
      role: true,
      created_at: true,
    },
  });

  if (!guest) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.status(200).json(guest);
}

export default withAuth(handler, ["guest", "teacher", "parent"]);
