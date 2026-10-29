import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const banners = await prisma.landingBanner.findMany({
      where: { display: true },
      orderBy: [
        { orderIndex: "asc" },
        { id: "asc" },
      ],
    });

    return res.status(200).json(banners);
  } catch (error) {
    console.error("Error fetching landing banners:", error);
    return res.status(500).json({ message: "Failed to fetch banners" });
  }
}

