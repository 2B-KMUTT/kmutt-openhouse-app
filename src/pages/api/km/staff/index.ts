import { PrismaClient } from "@prisma/client";
import type { NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { withAuth, AuthenticatedRequest } from "@/libs/authGuard";

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const currentUser = req.user;
  const isSuperAdmin = req.user.adminRole === "SUPER_ADMIN";

  try {
    if (req.method === "GET") {
      const adminFilter = req.query.adminId ? Number(req.query.adminId) : undefined;
      const whereClause = isSuperAdmin
        ? (adminFilter ? { create_by: adminFilter } : {})
        : { create_by: currentUser.id };

      const staffs = await prisma.staffs.findMany({
        where: whereClause,
        include: {
          created_by: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      });
      return res.status(200).json(staffs);
    }

    if (req.method === "POST") {
      const { username, password, name, email, adminId } = req.body;

      if (!username || !password || !name || !email) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const trimmedUsername = String(username).trim();
      const trimmedEmail = String(email).trim().toLowerCase();
      const trimmedName = String(name).trim();

      if (!trimmedUsername || !trimmedEmail || !trimmedName) {
        return res.status(400).json({ message: "Fields cannot be blank after trim" });
      }

      const targetAdminId = isSuperAdmin && adminId ? Number(adminId) : Number(currentUser.id);

      // hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const staff = await prisma.staffs.create({
        data: {
          username: trimmedUsername,
          password_hash: hashedPassword,
          name: trimmedName,
          email: trimmedEmail,
          create_by: targetAdminId,
        },
      });

      // Auto-assign กิจกรรมทั้งหมดของ Admin ให้กับ Staff ใหม่ที่เพิ่งสร้าง
      try {
        const adminActivities = await prisma.activities.findMany({
          where: { ownerId: targetAdminId },
          select: { id: true },
        });

        if (adminActivities.length > 0) {
          await prisma.staffMapping.createMany({
            data: adminActivities.map((act) => ({
              staffId: staff.id,
              activityId: act.id,
            })),
            skipDuplicates: true,
          });
        }
      } catch (assignError) {
        console.error("Warning: Failed to auto-assign activities to new staff:", assignError);
      }

      return res.status(201).json(staff);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Error in /api/km/staff:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export default withAuth(handler, ["kmuser"]);