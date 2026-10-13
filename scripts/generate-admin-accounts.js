/**
 * KMUTT OpenHouse - Admin Accounts Generator
 * ------------------------------------------------------------
 * หน้าที่ของสคริปต์นี้:
 * 1. สร้างบัญชี Admin ทั้งหมด 42 ภาควิชา/หน่วยงาน ลงในตาราง `Admins`
 * 2. สุ่มรหัสผ่านความปลอดภัยสูง (Random 32 characters) และเข้ารหัสด้วย bcrypt hash
 * 3. ส่งออก (Export) ข้อมูลบัญชีและรหัสผ่านเป็นไฟล์ `admins.csv`
 * 
 * วิธีการรัน:
 * - npm run seed:admins
 * หรือ
 * - node scripts/generate-admin-accounts.js
 */

import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const prisma = new PrismaClient();

// ข้อมูล Admin ที่ดึงมาจากโมเดล Admins (username, email, name)
const adminsData = [
  {
    username: "KM_cpe",
    email: "cpe@openhouse.kmutt.ac.th",
    name: "วิศวกรรมคอมพิวเตอร์ - Computer Engineering",
  },
  {
    username: "KM_admission",
    email: "admission@openhouse.kmutt.ac.th",
    name: "สำนักงานคัดเลือกและสรรหานักศึกษา - Admissions and Recruitment Office",
  },
  {
    username: "KM_che",
    email: "che@openhouse.kmutt.ac.th",
    name: "วิศวกรรมเคมี - Chemical Engineering",
  },
  {
    username: "KM_me",
    email: "me@openhouse.kmutt.ac.th",
    name: "วิศวกรรมเครื่องกล - Mechanical Engineering",
  },
  {
    username: "KM_tme",
    email: "tme@openhouse.kmutt.ac.th",
    name: "วิศวกรรมเครื่องมือและวัสดุ - Tool and Materials Engineering",
  },
  {
    username: "KM_ee",
    email: "ee@openhouse.kmutt.ac.th",
    name: "วิศวกรรมไฟฟ้า - Electrical Engineering",
  },
  {
    username: "KM_ene",
    email: "ene@openhouse.kmutt.ac.th",
    name: "วิศวกรรมอิเล็กทรอนิกส์และโทรคมนาคม - Electronics and Telecommunication Engineering",
  },
  {
    username: "KM_pe",
    email: "pe@openhouse.kmutt.ac.th",
    name: "วิศวกรรมอุตสาหการ - Production Engineering",
  },
  {
    username: "KM_ce",
    email: "ce@openhouse.kmutt.ac.th",
    name: "วิศวกรรมโยธา - Civil Engineering",
  },
  {
    username: "KM_env",
    email: "env@openhouse.kmutt.ac.th",
    name: "วิศวกรรมสิ่งแวดล้อม - Environmental Engineering",
  },
  {
    username: "KM_inc",
    email: "inc@openhouse.kmutt.ac.th",
    name: "วิศวกรรมระบบควบคุมและเครื่องมือวัด - Control System and Instrumentation Engineering",
  },
  {
    username: "KM_stdunion",
    email: "stdunion@openhouse.kmutt.ac.th",
    name: "สโมสรนักศึกษา - Student Union",
  },
  {
    username: "KM_mth",
    email: "mth@openhouse.kmutt.ac.th",
    name: "คณิตศาสตร์ - Mathematics",
  },
  {
    username: "KM_phy",
    email: "phy@openhouse.kmutt.ac.th",
    name: "ฟิสิกส์ - Physics",
  },
  {
    username: "KM_chm",
    email: "chm@openhouse.kmutt.ac.th",
    name: "เคมี - Chemistry",
  },
  {
    username: "KM_mic",
    email: "mic@openhouse.kmutt.ac.th",
    name: "จุลชีววิทยา - Microbiology",
  },
  {
    username: "KM_sit",
    email: "sit@openhouse.kmutt.ac.th",
    name: "คณะเทคโนโลยีสารสนเทศ - School of Information Technology",
  },
  {
    username: "KM_soad",
    email: "soad@openhouse.kmutt.ac.th",
    name: "คณะสถาปัตยกรรมศาสตร์และการออกแบบ - School of Architecture and Design",
  },
  {
    username: "KM_fibo",
    email: "fibo@openhouse.kmutt.ac.th",
    name: "สถาบันวิทยาการหุ่นยนต์ภาคสนาม - Institute of field robotics",
  },
  {
    username: "KM_sla",
    email: "sla@openhouse.kmutt.ac.th",
    name: "คณะศิลปศาสตร์ - School of Liberal Arts",
  },
  {
    username: "KM_mainv",
    email: "mainv@openhouse.kmutt.ac.th",
    name: "บัณฑิตวิทยาลัยการจัดการและนวัตกรรม - Graduate School of Management and Innovation",
  },
  {
    username: "KM_ratchaburi",
    email: "ratchaburi@openhouse.kmutt.ac.th",
    name: "มจธ.ราชบุรี - KMUTT (Ratchaburi)",
  },
  {
    username: "KM_media",
    email: "media@openhouse.kmutt.ac.th",
    name: "โครงการร่วมบริหารหลักสูตรมีเดียอาตส์และเทคโนโลยีมีเดีย - Creative Media",
  },
  {
    username: "KM_ddct",
    email: "ddct@openhouse.kmutt.ac.th",
    name: "วิทยาลัยสหวิทยาการ (DDCT) - College of Multidisciplinary Sciences (DDCT)",
  },
  {
    username: "KM_stdfinance",
    email: "stdfinance@openhouse.kmutt.ac.th",
    name: "กลุ่มงานช่วยเหลือทางการเงินแก่นักศึกษา - Student Financial Aid Unit",
  },
  {
    username: "KM_residen",
    email: "residen@openhouse.kmutt.ac.th",
    name: "หอพักนักศึกษา - Residencehall",
  },
  {
    username: "KM_interaff",
    email: "interaff@openhouse.kmutt.ac.th",
    name: "สำนักงานกิจการต่างประเทศ - International Affairs Office",
  },
  {
    username: "KM_works",
    email: "works@openhouse.kmutt.ac.th",
    name: "KMUTTWorks - KMUTTWorks",
  },
  {
    username: "KM_lib",
    email: "lib@openhouse.kmutt.ac.th",
    name: "สำนักหอสมุด - KMUTT Library",
  },
  {
    username: "KM_commu",
    email: "commu@openhouse.kmutt.ac.th",
    name: "ชมรมของนักศึกษา - Student Community",
  },
  {
    username: "KM_cte",
    email: "cte@openhouse.kmutt.ac.th",
    name: "ครุศาสตร์โยธา - Civil Technology Education",
  },
  {
    username: "KM_ete",
    email: "ete@openhouse.kmutt.ac.th",
    name: "ครุศาสตร์ไฟฟ้า - Electrical Engineering Education",
  },
  {
    username: "KM_mte",
    email: "mte@openhouse.kmutt.ac.th",
    name: "ครุศาสตร์เครื่องกล - Mechanical Education",
  },
  {
    username: "KM_pte",
    email: "pte@openhouse.kmutt.ac.th",
    name: "ครุศาสตร์อุตสาหการ - Production Technology Education",
  },
  {
    username: "KM_ect",
    email: "ect@openhouse.kmutt.ac.th",
    name: "เทคโนโลยีและสื่อสารการศึกษา - Educational Communications and Technology",
  },
  {
    username: "KM_com",
    email: "com@openhouse.kmutt.ac.th",
    name: "คอมพิวเตอร์และเทคโนโลยีสารสนเทศ - Computer and Information Technology",
  },
  {
    username: "KM_print",
    email: "print@openhouse.kmutt.ac.th",
    name: "เทคโนโลยีการพิมพ์และบรรจุภัณฑ์ - Printing and Packaging Technology",
  },
  {
    username: "KM_engenv",
    email: "engenv@openhouse.kmutt.ac.th",
    name: "คณะพลังงานสิ่งแวดล้อมและวัสดุ - School of Energy, Environment and Materials",
  },
  {
    username: "KM_FEN",
    email: "fen@openhouse.kmutt.ac.th",
    name: "คณะวิศวกรรมศาสตร์ - Faculty of Engineering",
  },
  {
    username: "engineering",
    email: "engineering.api@kmutt.ac.th",
    name: "engineering-api-key",
  },
  {
    username: "KM_x",
    email: "kmx@gmail.co",
    name: "KMX",
  },
  {
    username: "KM_admin",
    email: "admin@openhouse.kmutt.ac.th",
    name: "admin",
  },
];

function generateRandomPassword(length = 32) {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const specials = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  
  const allChars = upper + lower + numbers + specials;

  // 1. ดึงตัวแทนมาอย่างละ 1 ตัว เพื่อการันตีว่ามีครบทุกเงื่อนไข
  const passwordChars = [
    upper[crypto.randomInt(0, upper.length)],
    lower[crypto.randomInt(0, lower.length)],
    numbers[crypto.randomInt(0, numbers.length)],
    specials[crypto.randomInt(0, specials.length)],
  ];

  // 2. เติมตัวที่เหลือจนครบความยาวที่กำหนด
  for (let i = passwordChars.length; i < length; i++) {
    passwordChars.push(allChars[crypto.randomInt(0, allChars.length)]);
  }

  // 3. สับตำแหน่ง (Fisher-Yates Shuffle) เพื่อไม่ให้ประเภทตัวอักษรเรียงซ้ำแบบเดิม
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.join("");
}

async function main() {
  console.log(`Starting seed process for ${adminsData.length} admins...`);

  // 1. ลบข้อมูลเก่าทั้งหมดในตาราง Admins
  console.log("Clearing existing records in Admins table...");
  await prisma.admins.deleteMany();
  console.log("Cleared Admins table successfully.");

  // 2. สร้าง record ใหม่ พร้อม random password 32 character และ bcrypt hash
  const csvRecords = [];

  for (const admin of adminsData) {
    const password = generateRandomPassword(32);
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.admins.create({
      data: {
        username: admin.username,
        email: admin.email,
        name: admin.name,
        password_hash: hashedPassword,
      },
    });

    // เก็บข้อมูลสำหรับ export ลง CSV (password ที่ยังไม่ถูก hash)
    csvRecords.push({
      username: admin.username,
      password: password,
      email: admin.email,
      name: admin.name,
    });
  }

  // 3. Export เป็นไฟล์ admins.csv
  const csvFileName = "admins.csv";
  const csvFilePath = path.join(process.cwd(), csvFileName);

  const header = "username,password,email,name";
  const rows = csvRecords.map(
    (record) =>
      `"${record.username.replace(/"/g, '""')}","${record.password.replace(/"/g, '""')}","${record.email.replace(/"/g, '""')}","${record.name.replace(/"/g, '""')}"`
  );

  // ใส่ BOM (\uFEFF) เพื่อให้เปิดใน Excel / โปรแกรมอื่นแล้วภาษาไทยไม่เพี้ยน
  const csvContent = "\uFEFF" + [header, ...rows].join("\n");
  fs.writeFileSync(csvFilePath, csvContent, "utf8");

  console.log("==========================================");
  console.log(`Seeding completed successfully! Total created: ${csvRecords.length}`);
  console.log(`Output CSV file generated at: ${csvFilePath}`);
  console.log("==========================================");
}

main()
  .catch((e) => {
    console.error("Error running seed script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });