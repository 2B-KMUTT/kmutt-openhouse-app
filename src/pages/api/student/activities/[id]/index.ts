import type { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/libs/authGuard";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const activity = await prisma.activities.findUnique({
            where: { id: Number(id) },
            include: {
                _count: { select: { RegisterActivities: true } },
                department: {
                    select: {
                        id: true,
                        name_th: true,
                        name_en: true,
                        faculty: {
                            select: {
                                id: true,
                                name_th: true,
                                name_en: true,
                            },
                        },
                    },
                },
            },
        });

        if (!activity) {
            return res.status(404).json({ message: "Activity not found" });
        }

        // ตรวจสอบว่าผู้เรียนคนนี้ลงทะเบียนแล้วหรือไม่
        const registration = await prisma.registerActivities.findUnique({
            where: {
                studentId_activityId: {
                    studentId: req.user.id,
                    activityId: activity.id,
                },
            },
        });

        return res.status(200).json({
            id: activity.id,
            title: activity.title,
            description: activity.description,
            date: activity.date,
            round: activity.round,
            start_time: activity.start_time,
            end_time: activity.end_time,
            location: activity.location,
            point: activity.point,
            max_participants: activity.max_participants,
            current_register_participants: activity._count.RegisterActivities,
            stars: activity.stars,
            require_portfolio: activity.require_portfolio,
            form_link: activity.form_link,
            image_url: activity.image_url,
            activity_type: activity.activity_type,
            created_at: activity.created_at,
            registered: registration ? true : false,
            portfolio_url: registration?.portfolio_url || null,
            department: {
                id: activity.department.id,
                name_th: activity.department.name_th,
                name_en: activity.department.name_en,
            },
            faculty: {
                id: activity.department.faculty.id,
                name_th: activity.department.faculty.name_th,
                name_en: activity.department.faculty.name_en,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export default withAuth(handler, ["student"]);
