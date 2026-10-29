const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding LandingBanner and LandingConfig...");

  // 1. Seed LandingBanner if empty
  const bannerCount = await prisma.landingBanner.count();
  if (bannerCount === 0) {
    await prisma.landingBanner.create({
      data: {
        imageUrl: "/images/banner_new.png",
        altText: "เปิดเฮือน มจธ. KMUTT Open House 30 ตุลาคม 2569 ณ โรงแรมเพชรรัชต์ การ์เด้น จังหวัดร้อยเอ็ด",
        linkUrl: null,
        orderIndex: 1,
        display: true,
      },
    });
    console.log("Seeded default banner.");
  } else {
    console.log(`LandingBanner already has ${bannerCount} records.`);
  }

  // 2. Default Configs
  const defaultSurveyConfig = {
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
      enabled: true,
      title: "ความสนใจในกลุ่ม 3 พระจอม (เรียงลำดับความสนใจที่ท่านชื่นชอบ 1-3)",
      options: [
        "มจธ. - มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี (บางมด)",
        "สจล. - สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง",
        "มจพ. - มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
      ],
    },
  };

  const configs = [
    { key: "heroTitle", value: "KMUTT OPEN HOUSE" },
    { key: "heroSubtitle", value: "เปิดเฮือน มจธ. (มดอีสาน)" },
    { key: "eventDateTh", value: "วันที่ 30 ตุลาคม 2569 เวลา 09.00 – 17.00 น." },
    { key: "eventLocationTh", value: "ณ โรงแรมเพชรรัชต์การ์เด้น อ.เมือง จ.ร้อยเอ็ด" },
    { key: "eventDateEn", value: "October 30, 2026, from 09:00 a.m. to 5:00 p.m." },
    { key: "eventLocationEn", value: "at Petcharat Garden Hotel, Mueang, Roi Et" },
    { key: "coordinatorName", value: "นางสาวสุวะรักษ์ ศิริวรรณ์" },
    { key: "coordinatorPhone", value: "0 2470 8471" },
    { key: "coordinatorEmail", value: "admission@kmutt.ac.th" },
    { key: "openChatLink", value: "https://kmutt.me/OpenChatOPH2025" },
    { key: "surveyStatus", value: "auto" }, // 'auto' | 'open' | 'closed'
    { key: "surveyStartDate", value: "2026-10-30T00:00:00+07:00" },
    { key: "surveyEndDate", value: "2026-11-06T23:59:59+07:00" },
    { key: "surveyConfig", value: JSON.stringify(defaultSurveyConfig) },
  ];

  for (const cfg of configs) {
    await prisma.landingConfig.upsert({
      where: { key: cfg.key },
      update: { value: cfg.value },
      create: { key: cfg.key, value: cfg.value },
    });
  }

  console.log(`Seeded ${configs.length} configs.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

