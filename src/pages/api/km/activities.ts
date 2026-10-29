import type { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/libs/authGuard";
import { PrismaClient } from "@prisma/client";
import { createActivity } from "@/libs/activityService";

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const isSuperAdmin = req.user.adminRole === "SUPER_ADMIN";
      const ownerFilter = req.query.ownerId ? Number(req.query.ownerId) : undefined;

      const whereClause = isSuperAdmin
        ? (ownerFilter ? { ownerId: ownerFilter } : {})
        : { ownerId: req.user.id };

      const activities = await prisma.activities.findMany({
        include: {
          Admins: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
          _count: { select: { RegisterActivities: true } },
          department: {
            select: {
              id: true,
              name_en: true,
              name_th: true,
              faculty: {
                select: {
                  id: true,
                  name_en: true,
                  name_th: true,
                },
              },
            },
          },
        },
        where: whereClause,
        orderBy: {
          date: "asc",
        },
      });

      const mapped = activities.map((act) => ({
        id: act.id,
        activity_type: act.activity_type,
        title: act.title,
        description: act.description,
        date: act.date,
        round: act.round,
        start_time: act.start_time,
        end_time: act.end_time,
        location: act.location,
        display: act.display,
        point: act.point,
        form_link: act.form_link,
        image_url: act.image_url,
        stars: act.stars,
        max_participants: act.max_participants,
        current_register_participants: act._count.RegisterActivities,
        created_at: act.created_at,
        ownerId: act.ownerId,
        owner: act.Admins
          ? {
              id: act.Admins.id,
              username: act.Admins.username,
              name: act.Admins.name,
            }
          : null,
        department: {
          id: act.department.id,
          name_en: act.department.name_en,
          name_th: act.department.name_th,
        },
        faculty: {
          id: act.department.faculty.id,
          name_en: act.department.faculty.name_en,
          name_th: act.department.faculty.name_th,
        },
      }));

      return res.status(200).json(mapped);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const {
        activity_type,
        departmentId,
        title,
        description,
        date,
        start_time,
        end_time,
      } = req.body;

      // Validation
      if (!title || !description || !activity_type || !departmentId || !date || !start_time || !end_time) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const newActivity = await createActivity(req.body, req.user, prisma);

      return res.status(201).json(newActivity);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

export default withAuth(handler, ["kmuser"]);
