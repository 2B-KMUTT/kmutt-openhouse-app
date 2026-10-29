import { PrismaClient } from "@prisma/client";

export interface CreateActivityInput {
  activity_type: "workshop" | "regis_activity" | "non_regis_activity";
  departmentId: number;
  title: string;
  description: string;
  date: string;
  round?: number;
  start_time: string;
  end_time: string;
  location: string;
  point?: number;
  form_link?: string | null;
  image_url?: string | null;
  max_participants?: number;
  ownerId?: number;
}

export interface ActivityUserContext {
  id: number;
  role: string;
  adminRole?: "SUPER_ADMIN" | "ADMIN";
}

/**
 * Creates an activity with authorization-aware ownership and dual-tier staff auto-assignment.
 */
export async function createActivity(
  input: CreateActivityInput,
  user: ActivityUserContext,
  prisma: PrismaClient
) {
  // Determine effective ownerId
  let effectiveOwnerId = user.id;
  if (user.adminRole === "SUPER_ADMIN" && input.ownerId) {
    const requestedOwner = await prisma.admins.findUnique({
      where: { id: Number(input.ownerId) },
    });
    if (!requestedOwner) {
      throw new Error(`Invalid ownerId: Admin with ID ${input.ownerId} does not exist`);
    }
    effectiveOwnerId = requestedOwner.id;
  }

  const newActivity = await prisma.activities.create({
    data: {
      activity_type: input.activity_type,
      departmentId: Number(input.departmentId),
      title: input.title,
      description: input.description,
      date: input.date,
      round: Number(input.round) || 1,
      start_time: input.start_time,
      end_time: input.end_time,
      location: input.location,
      point: Number(input.point) || 0,
      form_link: input.form_link?.trim() || null,
      image_url: input.image_url?.trim() || null,
      max_participants: Number(input.max_participants) || 0,
      ownerId: effectiveOwnerId,
    },
  });

  // Dual-tier staff auto-assign
  await syncStaffMappingsForActivity(newActivity.id, effectiveOwnerId, Number(input.departmentId), prisma);

  return newActivity;
}

/**
 * Automatically assigns an activity to both direct owner staff and parent faculty staff.
 */
export async function syncStaffMappingsForActivity(
  activityId: number,
  ownerId: number,
  departmentId: number,
  prisma: PrismaClient
) {
  try {
    // 1. Direct owner staff
    const directStaffs = await prisma.staffs.findMany({
      where: { create_by: ownerId },
      select: { id: true },
    });

    const staffIdSet = new Set<number>(directStaffs.map((s) => s.id));

    // 2. Parent faculty / department staff
    const dept = await prisma.department.findUnique({
      where: { id: departmentId },
      include: { faculty: true },
    });

    if (dept) {
      const facultyStaffs = await prisma.staffs.findMany({
        where: {
          OR: [
            { created_by: { name: { contains: dept.faculty.name_th } } },
            { created_by: { name: { contains: dept.name_th.trim() } } },
          ],
        },
        select: { id: true },
      });

      for (const s of facultyStaffs) {
        staffIdSet.add(s.id);
      }
    }

    const allStaffIds = Array.from(staffIdSet);

    if (allStaffIds.length > 0) {
      await prisma.staffMapping.createMany({
        data: allStaffIds.map((staffId) => ({
          staffId,
          activityId,
        })),
        skipDuplicates: true,
      });
    }
  } catch (err) {
    console.error("Warning: syncStaffMappingsForActivity failed:", err);
  }
}
