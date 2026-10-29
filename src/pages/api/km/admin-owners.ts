import type { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/libs/authGuard";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const admins = await prisma.admins.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
      },
      orderBy: { name: "asc" },
    });

    return res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admin owners:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export default withAuth(handler, ["kmuser"]);
