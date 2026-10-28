/**
 * KMUTT OpenHouse - Staff Accounts Generator
 * ------------------------------------------------------------
 * หน้าที่ของสคริปต์นี้:
 * 1. สร้างบัญชี Staff สำหรับทุกคณะและหน่วยงานหลักใน KMUTT OpenHouse
 * 2. สุ่มรหัสผ่านด้วย OpenSSL ความยาว 32 ตัวอักษร (openssl rand -base64 24) และเข้ารหัสด้วย bcrypt
 * 3. บันทึกบัญชีลงในตาราง `Staffs` (พร้อมผูก foreign key create_by กับ Admin ที่ตรงกัน)
 * 4. ส่งออก (Export) ข้อมูลบัญชีและรหัสผ่านเป็นไฟล์ `staffs.csv`
 * 
 * วิธีการรัน:
 * - npm run seed:staffs
 * หรือ
 * - node scripts/generate-staff-accounts.js
 */

import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";

const prisma = new PrismaClient();

// รายชื่อบัญชี Staff ที่ต้องสร้าง (1 บัญชีต่อคณะ/หน่วยงาน)
const staffsConfig = [
  // 1. คณะหลัก (Faculties & Institutes)
  {
    username: "fen-staff01",
    email: "fen-staff01@openhouse.kmutt.ac.th",
    name: "Staff คณะวิศวกรรมศาสตร์",
    adminUsername: "KM_FEN",
    fallbackAdminName: "คณะวิศวกรรมศาสตร์ - Faculty of Engineering",
    fallbackAdminEmail: "fen@openhouse.kmutt.ac.th",
  },
  {
    username: "ratchaburi-staff01",
    email: "ratchaburi-staff01@openhouse.kmutt.ac.th",
    name: "Staff มจธ.ราชบุรี",
    adminUsername: "KM_ratchaburi",
    fallbackAdminName: "มจธ.ราชบุรี - KMUTT (Ratchaburi)",
    fallbackAdminEmail: "ratchaburi@openhouse.kmutt.ac.th",
  },
  {
    username: "fiet-staff01",
    email: "fiet-staff01@openhouse.kmutt.ac.th",
    name: "Staff คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี (FIET)",
    adminUsername: "KM_FIET",
    fallbackAdminName: "คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี (FIET) - Faculty of Industrial Education and Technology",
    fallbackAdminEmail: "fiet@openhouse.kmutt.ac.th",
  },
  {
    username: "media-staff01",
    email: "media-staff01@openhouse.kmutt.ac.th",
    name: "Staff โครงการร่วมบริหารหลักสูตรมีเดียอาตส์ฯ",
    adminUsername: "KM_media",
    fallbackAdminName: "โครงการร่วมบริหารหลักสูตรมีเดียอาตส์และเทคโนโลยีมีเดีย - Creative Media",
    fallbackAdminEmail: "media@openhouse.kmutt.ac.th",
  },
  {
    username: "soad-staff01",
    email: "soad-staff01@openhouse.kmutt.ac.th",
    name: "Staff คณะสถาปัตยกรรมศาสตร์และการออกแบบ (SoAD)",
    adminUsername: "KM_soad",
    fallbackAdminName: "คณะสถาปัตยกรรมศาสตร์และการออกแบบ - School of Architecture and Design",
    fallbackAdminEmail: "soad@openhouse.kmutt.ac.th",
  },
  {
    username: "li-staff01",
    email: "li-staff01@openhouse.kmutt.ac.th",
    name: "Staff สถาบันการเรียนรู้ (LI)",
    adminUsername: "KM_li",
    fallbackAdminName: "สถาบันการเรียนรู้ (LI) - Learning Institute",
    fallbackAdminEmail: "li@openhouse.kmutt.ac.th",
  },
  {
    username: "lisa-staff01",
    email: "lisa-staff01@openhouse.kmutt.ac.th",
    name: "Staff กลุ่มงานส่งเสริมและจัดการการเรียนรู้ตลอดชีวิต (LISA)",
    adminUsername: "KM_lisa",
    fallbackAdminName: "กลุ่มงานส่งเสริมและจัดการการเรียนรู้ตลอดชีวิต - Lifelong Learning Support and Administration Unit",
    fallbackAdminEmail: "lisa@openhouse.kmutt.ac.th",
  },
  {
    username: "admission-staff01",
    email: "admission-staff01@openhouse.kmutt.ac.th",
    name: "Staff สำนักงานคัดเลือกและสรรหานักศึกษา (Admission)",
    adminUsername: "KM_admission",
    fallbackAdminName: "สำนักงานคัดเลือกและสรรหานักศึกษา - Admissions and Recruitment Office",
    fallbackAdminEmail: "admission@openhouse.kmutt.ac.th",
  },
  {
    username: "sci-staff01",
    email: "sci-staff01@openhouse.kmutt.ac.th",
    name: "Staff คณะวิทยาศาสตร์",
    adminUsername: "KM_sci",
    fallbackAdminName: "คณะวิทยาศาสตร์ - Faculty of Science",
    fallbackAdminEmail: "sci@openhouse.kmutt.ac.th",
  },
  {
    username: "sit-staff01",
    email: "sit-staff01@openhouse.kmutt.ac.th",
    name: "Staff คณะเทคโนโลยีสารสนเทศ (SIT)",
    adminUsername: "KM_sit",
    fallbackAdminName: "คณะเทคโนโลยีสารสนเทศ - School of Information Technology",
    fallbackAdminEmail: "sit@openhouse.kmutt.ac.th",
  },
  {
    username: "fibo-staff01",
    email: "fibo-staff01@openhouse.kmutt.ac.th",
    name: "Staff สถาบันวิทยาการหุ่นยนต์ภาคสนาม (FIBO)",
    adminUsername: "KM_fibo",
    fallbackAdminName: "สถาบันวิทยาการหุ่นยนต์ภาคสนาม - Institute of field robotics",
    fallbackAdminEmail: "fibo@openhouse.kmutt.ac.th",
  },
  {
    username: "sla-staff01",
    email: "sla-staff01@openhouse.kmutt.ac.th",
    name: "Staff คณะศิลปศาสตร์ (SoLA)",
    adminUsername: "KM_sla",
    fallbackAdminName: "คณะศิลปศาสตร์ - School of Liberal Arts",
    fallbackAdminEmail: "sla@openhouse.kmutt.ac.th",
  },
  {
    username: "engenv-staff01",
    email: "engenv-staff01@openhouse.kmutt.ac.th",
    name: "Staff คณะพลังงานสิ่งแวดล้อมและวัสดุ (ENGENV)",
    adminUsername: "KM_engenv",
    fallbackAdminName: "คณะพลังงานสิ่งแวดล้อมและวัสดุ - School of Energy, Environment and Materials",
    fallbackAdminEmail: "engenv@openhouse.kmutt.ac.th",
  },
  {
    username: "gmi-staff01",
    email: "gmi-staff01@openhouse.kmutt.ac.th",
    name: "Staff บัณฑิตวิทยาลัยการจัดการและนวัตกรรม (GMI)",
    adminUsername: "KM_mainv",
    fallbackAdminName: "บัณฑิตวิทยาลัยการจัดการและนวัตกรรม - Graduate School of Management and Innovation",
    fallbackAdminEmail: "mainv@openhouse.kmutt.ac.th",
  },
  {
    username: "ddct-staff01",
    email: "ddct-staff01@openhouse.kmutt.ac.th",
    name: "Staff วิทยาลัยสหวิทยาการ (DDCT)",
    adminUsername: "KM_ddct",
    fallbackAdminName: "วิทยาลัยสหวิทยาการ (DDCT) - College of Multidisciplinary Sciences (DDCT)",
    fallbackAdminEmail: "ddct@openhouse.kmutt.ac.th",
  },

  // 2. หน่วยงานส่วนกลางและสนับสนุน (Central & Student Units)
  {
    username: "stdunion-staff01",
    email: "stdunion-staff01@openhouse.kmutt.ac.th",
    name: "Staff สโมสรนักศึกษา (Student Union)",
    adminUsername: "KM_stdunion",
    fallbackAdminName: "สโมสรนักศึกษา - Student Union",
    fallbackAdminEmail: "stdunion@openhouse.kmutt.ac.th",
  },
  {
    username: "lib-staff01",
    email: "lib-staff01@openhouse.kmutt.ac.th",
    name: "Staff สำนักหอสมุด (KMUTT Library)",
    adminUsername: "KM_lib",
    fallbackAdminName: "สำนักหอสมุด - KMUTT Library",
    fallbackAdminEmail: "lib@openhouse.kmutt.ac.th",
  },
  {
    username: "stdfinance-staff01",
    email: "stdfinance-staff01@openhouse.kmutt.ac.th",
    name: "Staff กลุ่มงานช่วยเหลือทางการเงินแก่นักศึกษา",
    adminUsername: "KM_stdfinance",
    fallbackAdminName: "กลุ่มงานช่วยเหลือทางการเงินแก่นักศึกษา - Student Financial Aid Unit",
    fallbackAdminEmail: "stdfinance@openhouse.kmutt.ac.th",
  },
  {
    username: "residen-staff01",
    email: "residen-staff01@openhouse.kmutt.ac.th",
    name: "Staff หอพักนักศึกษา",
    adminUsername: "KM_residen",
    fallbackAdminName: "หอพักนักศึกษา - Residencehall",
    fallbackAdminEmail: "residen@openhouse.kmutt.ac.th",
  },
  {
    username: "interaff-staff01",
    email: "interaff-staff01@openhouse.kmutt.ac.th",
    name: "Staff สำนักงานกิจการต่างประเทศ",
    adminUsername: "KM_interaff",
    fallbackAdminName: "สำนักงานกิจการต่างประเทศ - International Affairs Office",
    fallbackAdminEmail: "interaff@openhouse.kmutt.ac.th",
  },
  {
    username: "works-staff01",
    email: "works-staff01@openhouse.kmutt.ac.th",
    name: "Staff KMUTTWorks",
    adminUsername: "KM_works",
    fallbackAdminName: "KMUTTWorks - KMUTTWorks",
    fallbackAdminEmail: "works@openhouse.kmutt.ac.th",
  },
  {
    username: "commu-staff01",
    email: "commu-staff01@openhouse.kmutt.ac.th",
    name: "Staff ชมรมของนักศึกษา",
    adminUsername: "KM_commu",
    fallbackAdminName: "ชมรมของนักศึกษา - Student Community",
    fallbackAdminEmail: "commu@openhouse.kmutt.ac.th",
  },
];

/**
 * สุ่มรหัสผ่านความยาว 32 ตัวอักษรด้วย OpenSSL
 * คำสั่ง: openssl rand -base64 24
 * 24 ไบต์แปลงเป็น Base64 จะได้ 32 ตัวอักษรพอดี (ไม่มี =)
 */
function generateOpenSSLPassword(length = 32) {
  try {
    const raw = execSync("openssl rand -base64 24").toString().trim();
    if (raw.length === length) {
      return raw;
    }
    return raw.slice(0, length);
  } catch (error) {
    // Fallback ใช้ Node.js crypto module (ซึ่งเรียก OpenSSL ภายในเช่นกัน)
    return crypto.randomBytes(24).toString("base64").slice(0, length);
  }
}

/**
 * ตรวจสอบและดึง Admin ID ที่ตรงกับ adminUsername
 * หากยังไม่มี Admin ดังกล่าว ให้สร้างขึ้นใหม่ในตาราง Admins เพื่อใช้ผูก create_by
 */
async function resolveAdminId(adminUsername, fallbackName, fallbackEmail) {
  let admin = await prisma.admins.findFirst({
    where: {
      OR: [
        { username: adminUsername },
        { email: fallbackEmail },
      ],
    },
  });

  if (!admin) {
    const adminPassword = generateOpenSSLPassword(32);
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    admin = await prisma.admins.create({
      data: {
        username: adminUsername,
        email: fallbackEmail,
        name: fallbackName,
        password_hash: hashedPassword,
      },
    });
    console.log(`[+] Auto-created missing Admin record: ${adminUsername} (ID: ${admin.id})`);
  }

  return admin.id;
}

async function main() {
  console.log("=================================================");
  console.log(`Starting staff account generation for ${staffsConfig.length} units...`);
  console.log("Password generation engine: OpenSSL (32 chars)");
  console.log("=================================================");

  const csvRecords = [];

  for (const item of staffsConfig) {
    const adminId = await resolveAdminId(
      item.adminUsername,
      item.fallbackAdminName,
      item.fallbackAdminEmail
    );

    const password = generateOpenSSLPassword(32);
    const hashedPassword = await bcrypt.hash(password, 10);

    // ใช้ upsert เพื่อให้สามารถรันซ้ำได้อย่างปลอดภัย (Idempotent)
    const existing = await prisma.staffs.findFirst({
      where: {
        OR: [
          { username: item.username },
          { email: item.email },
        ],
      },
    });

    if (existing) {
      await prisma.staffs.update({
        where: { id: existing.id },
        data: {
          username: item.username,
          email: item.email,
          name: item.name,
          password_hash: hashedPassword,
          create_by: adminId,
        },
      });
      console.log(`[UPDATED] ${item.username} -> Admin ID: ${adminId}`);
    } else {
      await prisma.staffs.create({
        data: {
          username: item.username,
          email: item.email,
          name: item.name,
          password_hash: hashedPassword,
          create_by: adminId,
        },
      });
      console.log(`[CREATED] ${item.username} -> Admin ID: ${adminId}`);
    }

    csvRecords.push({
      username: item.username,
      password: password,
      email: item.email,
      name: item.name,
    });
  }

  // ส่งออกเป็นไฟล์ staffs.csv
  const csvFileName = "staffs.csv";
  const csvFilePath = path.join(process.cwd(), csvFileName);

  const header = "username,password,email,name";
  const rows = csvRecords.map(
    (record) =>
      `"${record.username.replace(/"/g, '""')}","${record.password.replace(/"/g, '""')}","${record.email.replace(/"/g, '""')}","${record.name.replace(/"/g, '""')}"`
  );

  // ใส่ BOM (\uFEFF) เพื่อรองรับภาษาไทยใน Microsoft Excel
  const csvContent = "\uFEFF" + [header, ...rows].join("\n");
  fs.writeFileSync(csvFilePath, csvContent, "utf8");

  console.log("=================================================");
  console.log(`Staff generation completed! Total accounts: ${csvRecords.length}`);
  console.log(`Output CSV file generated at: ${csvFilePath}`);
  console.log("=================================================");
}

main()
  .catch((e) => {
    console.error("Error generating staff accounts:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
