const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding superadmin and landing data...");

  // 1. Super Admin User
  const existingSuperAdmin = await prisma.admins.findFirst({
    where: {
      OR: [
        { username: "superadmin" },
        { email: "superadmin@openhouse.kmutt.ac.th" }
      ]
    }
  });

  const superAdminPassword = "KMUTT@Admin2026!";
  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  if (!existingSuperAdmin) {
    const created = await prisma.admins.create({
      data: {
        username: "superadmin",
        email: "superadmin@openhouse.kmutt.ac.th",
        name: "ผู้ดูแลระบบส่วนกลาง (Super Admin)",
        password_hash: hashedPassword,
      }
    });
    console.log("Created superadmin account:", created.username);
  } else {
    await prisma.admins.update({
      where: { id: existingSuperAdmin.id },
      data: {
        password_hash: hashedPassword,
        name: "ผู้ดูแลระบบส่วนกลาง (Super Admin)",
      }
    });
    console.log("Updated superadmin account password.");
  }

  // 2. Seed LandingBooth if empty
  const boothCount = await prisma.landingBooth.count();
  if (boothCount === 0) {
    console.log("Seeding LandingBooth...");
    const booths = [
      {
        location: "โซนที่ 1: Admission Consult & Portfolio Clinic",
        units: [
          "ให้คำปรึกษาการสมัครเข้าศึกษาต่อ",
          "คลินิกแฟ้มสะสมผลงาน (Portfolio Clinic)",
          "แนะนำทุนการศึกษา มจธ.",
          "พบปะและปรึกษากับเจ้าหน้าที่สำนักงานคัดเลือกและสรรหานักศึกษา",
        ],
        orderIndex: 1,
        display: true,
      },
      {
        location: "โซนที่ 2: บูทคณะและหน่วยงานต่าง ๆ",
        units: [
          "ให้ข้อมูลหลักสูตรระดับปริญญาตรีและแนวทางการศึกษา",
          "คัดเลือกแฟ้มสะสมผลงานโดยคณาจารย์จาก มจธ. อย่างใกล้ชิด",
          "คณะวิศวกรรมศาสตร์",
          "คณะวิทยาศาสตร์",
          "คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี",
          "คณะเทคโนโลยีสารสนเทศ",
          "คณะสถาปัตยกรรมศาสตร์และการออกแบบ",
          "มจธ.ราชบุรี",
        ],
        orderIndex: 2,
        display: true,
      },
      {
        location: "โซนที่ 3: KMUTT Industry Consultation Clinic",
        units: [
          "ให้คำปรึกษาแก่ผู้ประกอบการและศิษย์เก่า",
          "แนะนำหลักสูตรและบริการโดยทีม LISA (Lifelong Learning Support and Administration Unit)",
          "เวลา 15.00 – 17.00 น.",
        ],
        orderIndex: 3,
        display: true,
      },
    ];

    for (const b of booths) {
      await prisma.landingBooth.create({ data: b });
    }
    console.log(`Created ${booths.length} booth zones.`);
  } else {
    console.log(`LandingBooth already has ${boothCount} records.`);
  }

  // 3. Seed LandingSchedule if empty
  const scheduleCount = await prisma.landingSchedule.count();
  if (scheduleCount === 0) {
    console.log("Seeding LandingSchedule...");
    const schedules = [
      {
        time: "09.00 – 09.30 น.",
        session: "morning",
        category: "ลงทะเบียน (รอบเช้า)",
        categoryColor: "blue",
        title: "ลงทะเบียนเข้าร่วมกิจกรรม (รอบเช้า)",
        details: null,
        subSectionTitle: null,
        subSectionItems: null,
        isBreak: false,
        orderIndex: 1,
        display: true,
      },
      {
        time: "09.30 – 11.00 น.",
        session: "morning",
        category: "เวทีหลัก",
        categoryColor: "orange",
        title: "เวทีหลัก:",
        details: [
          "รับชมวิดีทัศน์แนะนำ มจธ.",
          "กิจกรรมแลกเปลี่ยน “ทำไมต้อง มจธ. /TCAS70 กับรอบการรับสมัคร และทุนการศึกษา”",
          "บรรยายพิเศษ/แนะนำหลักสูตร โดยคณาจารย์จากคณะต่าง ๆ",
        ],
        subSectionTitle: null,
        subSectionItems: null,
        isBreak: false,
        orderIndex: 2,
        display: true,
      },
      {
        time: "11.00 – 12.00 น.",
        session: "morning",
        category: "ถาม - ตอบ & กิจกรรม",
        categoryColor: "purple",
        title: "ถาม - ตอบ พร้อมรับของที่ระลึก (เกมพันธุ์แท้ มจธ.)",
        details: null,
        subSectionTitle: "กิจกรรมภายในงาน มีทั้งหมด 3 โซน",
        subSectionItems: [
          "โซนที่ 1: Admission Consult & Portfolio Clinic",
          "โซนที่ 2: บูทคณะต่าง ๆ (ให้ข้อมูลหลักสูตรและคัดเลือกแฟ้มสะสมผลงาน)",
          "โซนที่ 3: KMUTT Industry Consultation Clinic (ให้คำปรึกษาแก่ผู้ประกอบการและศิษย์เก่า - ทีม LISA)",
        ],
        isBreak: false,
        orderIndex: 3,
        display: true,
      },
      {
        time: "12.00 – 13.00 น.",
        session: "break",
        category: "พักกลางวัน",
        categoryColor: "gray",
        title: "พักกลางวัน",
        details: null,
        subSectionTitle: null,
        subSectionItems: null,
        isBreak: true,
        orderIndex: 4,
        display: true,
      },
      {
        time: "13.00 – 13.30 น.",
        session: "afternoon",
        category: "ลงทะเบียน (รอบบ่าย)",
        categoryColor: "blue",
        title: "ลงทะเบียนเข้าร่วมกิจกรรม (รอบบ่าย)",
        details: null,
        subSectionTitle: null,
        subSectionItems: null,
        isBreak: false,
        orderIndex: 5,
        display: true,
      },
      {
        time: "13.30 – 15.00 น.",
        session: "afternoon",
        category: "เวทีหลัก",
        categoryColor: "orange",
        title: "เวทีหลัก:",
        details: [
          "รับชมวิดีทัศน์แนะนำ มจธ.",
          "กิจกรรมแลกเปลี่ยน “ทำไมต้อง มจธ. /TCAS70 กับรอบการรับสมัคร และทุนการศึกษา”",
          "บรรยายพิเศษ/แนะนำหลักสูตร โดยคณาจารย์จากคณะต่าง ๆ",
        ],
        subSectionTitle: null,
        subSectionItems: null,
        isBreak: false,
        orderIndex: 6,
        display: true,
      },
      {
        time: "15.00 – 16.00 น.",
        session: "afternoon",
        category: "ถาม - ตอบ & กิจกรรม",
        categoryColor: "purple",
        title: "ถาม - ตอบ พร้อมรับของที่ระลึก (เกมพันธุ์แท้ มจธ.)",
        details: null,
        subSectionTitle: "กิจกรรมภายในงาน มีทั้งหมด 3 โซน",
        subSectionItems: [
          "โซนที่ 1: Admission Consult & Portfolio Clinic",
          "โซนที่ 2: บูทคณะต่าง ๆ (ให้ข้อมูลหลักสูตรและคัดเลือกแฟ้มสะสมผลงาน)",
          "โซนที่ 3: KMUTT Industry Consultation Clinic (ให้คำปรึกษาแก่ผู้ประกอบการและศิษย์เก่า - ทีม LISA)",
        ],
        isBreak: false,
        orderIndex: 7,
        display: true,
      },
      {
        time: "15.00 – 17.00 น.",
        session: "afternoon",
        category: "โซน 3 (ทีม LISA)",
        categoryColor: "teal",
        title: "KMUTT Industry Consultation Clinic",
        details: [
          "ให้คำปรึกษาแก่ผู้ประกอบการและศิษย์เก่า",
          "ดำเนินกิจกรรมโดยทีม LISA (กลุ่มงานส่งเสริมและจัดการการเรียนรู้ตลอดชีวิต)",
          "เวลา 15.00 – 17.00 น.",
        ],
        subSectionTitle: null,
        subSectionItems: null,
        isBreak: false,
        orderIndex: 8,
        display: true,
      },
    ];

    for (const s of schedules) {
      await prisma.landingSchedule.create({ data: s });
    }
    console.log(`Created ${schedules.length} schedule items.`);
  } else {
    console.log(`LandingSchedule already has ${scheduleCount} records.`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
