// pages/api/km/activities/[id].ts
import type { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/libs/authGuard";
import { PrismaClient } from "@prisma/client";
import { syncStaffMappingsForActivity } from "@/libs/activityService";

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  const isSuperAdmin = req.user.adminRole === "SUPER_ADMIN";
  const activityId = Number(id);

  if (isNaN(activityId)) {
    return res.status(400).json({ message: "Invalid activity ID" });
  }

  if (req.method === "GET") {
    try {
      const act = await prisma.activities.findUnique({
        where: isSuperAdmin ? { id: activityId } : { id: activityId, ownerId: req.user.id },
        include: {
          Admins: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
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
          _count: {
            select: { RegisterActivities: true },
          },
          RegisterActivities: {
            include: {
              student: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      });

      if (!act) {
        return res.status(404).json({ message: "Activity not found" });
      }

      return res.status(200).json({
        id: act.id,
        display: act.display,
        activity_type: act.activity_type,
        title: act.title,
        description: act.description,
        date: act.date,
        round: act.round,
        start_time: act.start_time,
        end_time: act.end_time,
        location: act.location,
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
        registrations: act.RegisterActivities.map((r) => ({
          id: r.id,
          registered_at: r.registered_at,
          student: {
            id: r.student.id,
            first_name: r.student.first_name,
            last_name: r.student.last_name,
            email: r.student.email,
            phone: r.student.phone,
          },
        })),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  if (req.method === "PUT") {
    try {
      const existing = await prisma.activities.findUnique({
        where: isSuperAdmin ? { id: activityId } : { id: activityId, ownerId: req.user.id },
      });

      if (!existing) {
        return res.status(404).json({ message: "Activity not found or not authorized" });
      }

      const {
        title,
        display,
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
        departmentId,
        ownerId,
      } = req.body;

      let effectiveOwnerId = existing.ownerId;
      if (isSuperAdmin && ownerId) {
        effectiveOwnerId = Number(ownerId);
      }

      const effectiveDeptId = departmentId ? Number(departmentId) : existing.departmentId;

      const updated = await prisma.activities.update({
        where: { id: activityId },
        data: {
          title,
          display,
          description,
          date,
          round: Number(round) || existing.round,
          start_time,
          end_time,
          location,
          point: Number(point) || existing.point,
          form_link,
          image_url,
          max_participants: Number(max_participants) || existing.max_participants,
          departmentId: effectiveDeptId,
          ownerId: effectiveOwnerId,
        },
        include: {
          Admins: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
          _count: {
            select: { RegisterActivities: true },
          },
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
      });

      // If owner or department changed, re-sync staff mapping cleanly
      if (effectiveOwnerId !== existing.ownerId || effectiveDeptId !== existing.departmentId) {
        await prisma.staffMapping.deleteMany({
          where: { activityId },
        });
        if (effectiveOwnerId) {
          await syncStaffMappingsForActivity(activityId, effectiveOwnerId, effectiveDeptId, prisma);
        }
      }

      return res.status(200).json({
        id: updated.id,
        display: updated.display,
        activity_type: updated.activity_type,
        title: updated.title,
        description: updated.description,
        date: updated.date,
        round: updated.round,
        start_time: updated.start_time,
        end_time: updated.end_time,
        location: updated.location,
        point: updated.point,
        form_link: updated.form_link,
        image_url: updated.image_url,
        stars: updated.stars,
        max_participants: updated.max_participants,
        current_register_participants: updated._count.RegisterActivities,
        created_at: updated.created_at,
        ownerId: updated.ownerId,
        owner: updated.Admins,
        department: {
          id: updated.department.id,
          name_en: updated.department.name_en,
          name_th: updated.department.name_th,
        },
        faculty: {
          id: updated.department.faculty.id,
          name_en: updated.department.faculty.name_en,
          name_th: updated.department.faculty.name_th,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to update activity" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const existing = await prisma.activities.findUnique({
        where: isSuperAdmin ? { id: activityId } : { id: activityId, ownerId: req.user.id },
      });

      if (!existing) {
        return res.status(404).json({ message: "Activity not found or not authorized" });
      }

      // Cleanup mappings, registrations, and estamps
      await prisma.staffMapping.deleteMany({ where: { activityId } });
      await prisma.registerActivities.deleteMany({ where: { activityId } });
      await prisma.eStamp.deleteMany({ where: { activityId } });
      await prisma.activities.delete({ where: { id: activityId } });

      return res.status(200).json({ success: true, message: "Activity deleted successfully" });
    } catch (error) {
      console.error("Error deleting activity:", error);
      return res.status(500).json({ message: "Failed to delete activity" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

export default withAuth(handler, ["kmuser"]);
