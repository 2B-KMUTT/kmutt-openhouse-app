import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const DEFAULT_SURVEY_CONFIG = {
  provinces: [
    "ร้อยเอ็ด",
    "มหาสารคาม",
    "กาฬสินธุ์",
    "ยโสธร",
    "ขอนแก่น",
    "มุกดาหาร",
    "สกลนคร",
    "นครราชสีมา",
    "นครพนม",
    "อุดรธานี",
    "อื่น ๆ",
  ],
  sourceChannels: [
    "ครูที่โรงเรียน",
    "Facebook",
    "TikTok",
    "LINE",
    "รุ่นพี่ / เพื่อน",
    "ผู้ปกครอง",
    "อื่น ๆ",
  ],
  studentGrades: ["ม.4", "ม.5", "ม.6", "ปวช.", "อื่น ๆ"],
  studentStreams: ["วิทย์–คณิต", "ศิลป์–คำนวณ", "ศิลป์–ภาษา", "สายอาชีพ"],
  studentFaculties: [
    "วิศวกรรม",
    "วิทยาศาสตร์",
    "คอมพิวเตอร์ / IT",
    "สถาปัตย์ / ออกแบบ",
    "ครุศาสตร์อุตสาหกรรม",
    "ยังไม่แน่ใจ",
  ],
  studentFactors: [
    "ชื่อเสียง / Ranking",
    "จบแล้วมีงานทำ",
    "มีสาขาที่อยากเรียน",
    "ทุนการศึกษา",
    "ค่าใช้จ่าย",
    "อุปกรณ์ / แลปทันสมัย",
    "ใกล้บ้าน",
    "ครู / พ่อแม่แนะนำ",
  ],
  studentWorries: [
    "ค่าใช้จ่าย / ค่าครองชีพ",
    "ไกลบ้าน",
    "กลัวเรียนไม่ไหว",
    "ไม่รู้ขั้นตอนสมัคร TCAS",
    "ไม่กังวล",
  ],
  parentGrades: ["ม.4", "ม.5", "ม.6", "ปวช.", "อื่น ๆ"],
  parentWorries: [
    "ค่าเทอม / ค่าครองชีพ",
    "หอพัก / ความปลอดภัย",
    "การเดินทางไกล",
    "งานหลังเรียนจบ",
    "การดูแลจากมหาวิทยาลัย",
  ],
  parentInfoNeeded: ["ทุน / กู้ยืม กยศ.", "หอพัก", "รอบการรับสมัคร", "อัตราการได้งาน"],
  parentChannels: ["LINE", "Facebook", "ผ่านครูที่โรงเรียน", "โทรศัพท์ / SMS"],
  teacherNeeds: [
    "Roadshow ที่โรงเรียน",
    "ค่ายวิชาการ",
    "ข้อมูลทุน / โรงเรียนเครือข่าย",
    "ติวเตรียม TCAS",
    "หลักสูตรเรียนล่วงหน้า เทียบโอนหน่วยกิต",
  ],
  threeJomQuestion: {
    enabled: false,
    title: "ความสนใจในกลุ่ม 3 พระจอม (เรียงลำดับความสนใจที่ท่านชื่นชอบ 1-3)",
    options: [
      "มจธ. - มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี (บางมด)",
      "สจล. - สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง",
      "มจพ. - มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
    ],
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const configs = await prisma.landingConfig.findMany({
      where: {
        key: {
          in: ["surveyStatus", "surveyStartDate", "surveyEndDate", "surveyConfig"],
        },
      },
    });

    const configMap: Record<string, string> = {};
    for (const c of configs) {
      configMap[c.key] = c.value;
    }

    const surveyStatus = configMap.surveyStatus || "auto";
    const startDateStr = configMap.surveyStartDate || "2026-10-30T00:00:00+07:00";
    const endDateStr = configMap.surveyEndDate || "2026-11-06T23:59:59+07:00";

    let parsedConfig = DEFAULT_SURVEY_CONFIG;
    if (configMap.surveyConfig) {
      try {
        parsedConfig = JSON.parse(configMap.surveyConfig);
      } catch (e) {
        console.error("Failed to parse surveyConfig JSON, using default:", e);
      }
    }

    // Real-world time evaluation
    const now = new Date();
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    let isOpen = false;
    let status: "not_started" | "open" | "ended" | "closed" = "closed";

    if (surveyStatus === "open") {
      isOpen = true;
      status = "open";
    } else if (surveyStatus === "closed") {
      isOpen = false;
      status = "closed";
    } else {
      // Auto mode based on real world time
      if (now < start) {
        isOpen = false;
        status = "not_started";
      } else if (now > end) {
        isOpen = false;
        status = "ended";
      } else {
        isOpen = true;
        status = "open";
      }
    }

    return res.status(200).json({
      isOpen,
      status,
      surveyConfig: parsedConfig,
      startDate: startDateStr,
      endDate: endDateStr,
      surveyStatusMode: surveyStatus,
      currentTime: now.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching survey config:", error);
    return res.status(500).json({ message: "Failed to fetch survey config" });
  }
}

