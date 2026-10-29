import type { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/libs/authGuard";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const activities = await prisma.activities.findMany({
        include: {
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
        where: { ownerId: req.user.id },
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
        round,
        start_time,
        end_time,
        location,
        point,
        form_link,
        image_url,
        max_participants,
      } = req.body;

      // Validation (ง่ายๆก่อน)
      if (!title || !description || !activity_type || !departmentId || !date || !start_time || !end_time) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const newActivity = await prisma.activities.create({
        data: {
          activity_type,
          departmentId: Number(departmentId),
          title,
          description,
          date,
          round: Number(round) || 1,
          start_time,
          end_time,
          location,
          point: Number(point) || 0,
          form_link: form_link?.trim() || null,
          image_url: image_url?.trim() || null,
          max_participants: Number(max_participants) || 0,
          ownerId: req.user.id,
        },
      });

      return res.status(201).json(newActivity);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

export default withAuth(handler, ["kmuser"]);
