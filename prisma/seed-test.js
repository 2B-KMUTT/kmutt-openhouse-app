/**
 * KMUTT OpenHouse - Test / Mock Data Seeder
 * ------------------------------------------------------------
 * หน้าที่ของสคริปต์นี้:
 * 1. Seed ข้อมูลผู้ใช้ทดสอบ (Students) 5 บัญชี ครอบคลุมทุก Role:
 *    - student (ม.ปลาย), parent, teacher, guest
 *    - รหัสผ่านเข้าสู่ระบบทดสอบ: `12345678`
 * 2. Seed ข้อมูลกิจกรรมทดสอบ (Activities) 5 กิจกรรม:
 *    - workshop, regis_activity, non_regis_activity
 *    - เคสกิจกรรมที่นั่งเต็ม (Fully Booked: max=2, current=2)
 *    - เคสกิจกรรมซ่อน (Hidden: display=false)
 * 3. Seed การลงทะเบียนทดสอบ (RegisterActivities):
 *    - จับคู่นักเรียนกับกิจกรรมทดสอบ และคำนวณ current_register_participants ให้อัตโนมัติ
 * 
 * วิธีการรัน:
 * - npm run seed:test
 * หรือ
 * - node prisma/seed-test.js
 */

if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile();
  } catch (e) {
    // ignore
  }
}

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const {
  isForceEnabled,
  getDatabaseSummary,
  printAbortBanner,
} = require("./seed-guard");

const prisma = new PrismaClient();
const DATA_DIR = path.join(__dirname, "data");

function loadJson(filename, fallback = []) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`[WARN] File not found: ${filePath}`);
    return fallback;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    console.error(`[ERROR] Failed to parse ${filename}:`, err.message);
    return fallback;
  }
}

async function seedTestStudents() {
  console.log("\n[1/3] Seeding Test Students (5 บัญชี)...");
  const testStudents = loadJson("test-students.json");
  const studentMap = new Map(); // email -> id

  for (const item of testStudents) {
    const passwordHash = await bcrypt.hash(item.password || "12345678", 10);
    const uuid = crypto.randomUUID();

    const student = await prisma.students.upsert({
      where: { email: item.email },
      update: {
        first_name: item.first_name,
        last_name: item.last_name,
        school: item.school,
        province: item.province,
        phone: item.phone,
        role: item.role,
        password_hash: passwordHash,
        citizen_id: item.citizen_id,
      },
      create: {
        uuid: uuid,
        first_name: item.first_name,
        last_name: item.last_name,
        school: item.school,
        province: item.province,
        phone: item.phone,
        role: item.role,
        email: item.email,
        password_hash: passwordHash,
        citizen_id: item.citizen_id,
      },
    });

    studentMap.set(item.email, student.id);
    console.log(`  -> [${item.role}] ${student.email} (ID: ${student.id}) - Name: ${student.first_name} ${student.last_name}`);
  }

  return studentMap;
}

async function seedTestActivities() {
  console.log("\n[2/3] Seeding Test Activities (5 กิจกรรม)...");
  const testActivities = loadJson("test-activities.json");
  const activityMap = new Map(); // slug -> id

  for (const item of testActivities) {
    // Resolve ownerId from ownerUsername
    let ownerId = null;
    if (item.ownerUsername) {
      const admin = await prisma.admins.findFirst({
        where: { username: item.ownerUsername },
        select: { id: true },
      });
      ownerId = admin?.id || null;
    }

    const existing = await prisma.activities.findFirst({
      where: {
        title: item.title,
        departmentId: item.departmentId,
      },
    });

    let activityId;
    if (existing) {
      const updated = await prisma.activities.update({
        where: { id: existing.id },
        data: {
          activity_type: item.activity_type,
          description: item.description,
          date: item.date,
          round: item.round,
          start_time: item.start_time,
          end_time: item.end_time,
          location: item.location,
          point: item.point,
          form_link: item.form_link || "",
          display: item.display ?? true,
          image_url: item.image_url || "",
          max_participants: item.max_participants,
          ownerId: ownerId || existing.ownerId,
        },
      });
      activityId = updated.id;
      console.log(`  -> [UPDATED] ID: ${activityId} | ${item.activity_type} | ${item.title}`);
    } else {
      const created = await prisma.activities.create({
        data: {
          activity_type: item.activity_type,
          departmentId: item.departmentId,
          title: item.title,
          description: item.description,
          date: item.date,
          round: item.round,
          start_time: item.start_time,
          end_time: item.end_time,
          location: item.location,
          point: item.point,
          form_link: item.form_link || "",
          display: item.display ?? true,
          image_url: item.image_url || "",
          stars: item.stars || 0,
          max_participants: item.max_participants,
          current_register_participants: 0,
          ownerId: ownerId,
        },
      });
      activityId = created.id;
      console.log(`  -> [CREATED] ID: ${activityId} | ${item.activity_type} | ${item.title}`);
    }

    activityMap.set(item.slug, activityId);
  }

  return activityMap;
}

async function seedTestRegistrations(studentMap, activityMap) {
  console.log("\n[3/3] Seeding Test Registrations (RegisterActivities)...");
  const registrations = loadJson("test-registrations.json");
  const affectedActivityIds = new Set();
  let count = 0;

  for (const reg of registrations) {
    const studentId = studentMap.get(reg.studentEmail);
    const activityId = activityMap.get(reg.activitySlug);

    if (!studentId || !activityId) {
      console.warn(`  [!] Skipping registration: student (${reg.studentEmail}=${studentId}) or activity (${reg.activitySlug}=${activityId}) not found.`);
      continue;
    }

    await prisma.registerActivities.upsert({
      where: {
        studentId_activityId: {
          studentId: studentId,
          activityId: activityId,
        },
      },
      update: {},
      create: {
        studentId: studentId,
        activityId: activityId,
      },
    });

    affectedActivityIds.add(activityId);
    count++;
    console.log(`  -> Student ID ${studentId} (${reg.studentEmail}) registered to Activity ID ${activityId}`);
  }

  // อัปเดต current_register_participants ให้ถูกต้องตามจำนวนคนลงทะเบียนจริง
  for (const activityId of affectedActivityIds) {
    const currentCount = await prisma.registerActivities.count({
      where: { activityId: activityId },
    });
    await prisma.activities.update({
      where: { id: activityId },
      data: { current_register_participants: currentCount },
    });
    console.log(`  -> Updated Activity ID ${activityId}: current_register_participants = ${currentCount}`);
  }

  console.log(`  -> Processed ${count} registrations successfully.`);
}

async function seedTestAdminAndStaff(activityMap) {
  console.log("\n[4/4] Seeding Test Admin & Staff Accounts...");
  const passwordHash = await bcrypt.hash("12345678", 10);

  // 1. Test Admin
  const testAdmin = await prisma.admins.upsert({
    where: { username: "test.admin" },
    update: {
      email: "test.admin@kmutt.ac.th",
      name: "ผู้ดูแลระบบทดสอบ (Test Admin)",
      password_hash: passwordHash,
    },
    create: {
      username: "test.admin",
      email: "test.admin@kmutt.ac.th",
      name: "ผู้ดูแลระบบทดสอบ (Test Admin)",
      password_hash: passwordHash,
    },
  });

  // Update superadmin to 12345678 for convenience if it exists
  const superadmin = await prisma.admins.findFirst({ where: { username: "superadmin" } });
  if (superadmin) {
    await prisma.admins.update({
      where: { id: superadmin.id },
      data: { password_hash: passwordHash },
    });
  }

  // 2. Test Staff
  const testStaff = await prisma.staffs.upsert({
    where: { username: "test.staff" },
    update: {
      email: "test.staff@kmutt.ac.th",
      name: "เจ้าหน้าที่ทดสอบ (Test Staff)",
      password_hash: passwordHash,
      create_by: testAdmin.id,
    },
    create: {
      username: "test.staff",
      email: "test.staff@kmutt.ac.th",
      name: "เจ้าหน้าที่ทดสอบ (Test Staff)",
      password_hash: passwordHash,
      create_by: testAdmin.id,
    },
  });

  // Map test staff to first test activity if available
  const firstActivityId = activityMap?.values().next().value;
  if (firstActivityId) {
    const existingMapping = await prisma.staffMapping.findFirst({
      where: {
        staffId: testStaff.id,
        activityId: firstActivityId,
      },
    });
    if (!existingMapping) {
      await prisma.staffMapping.create({
        data: {
          staffId: testStaff.id,
          activityId: firstActivityId,
        },
      });
    }
  }

  console.log(`  -> [Admin] test.admin (ID: ${testAdmin.id}) - Password: 12345678`);
  console.log(`  -> [Staff] test.staff (ID: ${testStaff.id}) - Password: 12345678`);
}

async function main(options = {}) {
  const args = process.argv.slice(2);
  const force = options.force || isForceEnabled(args);

  // ตรวจสอบความปลอดภัย: ป้องกันการ seed ข้อมูล mock ทับ Database ที่มีข้อมูลอยู่แล้ว
  if (!force) {
    const summary = await getDatabaseSummary(prisma);
    const testRelevantCounts = summary.existingEntries.filter(([table]) =>
      ["Students", "Activities", "Register Activities"].includes(table)
    );

    if (testRelevantCounts.length > 0 || summary.hasData) {
      printAbortBanner({
        title: "Database already contains existing records!",
        reason: "Database contains existing data. Seeding test/mock accounts was halted\nto prevent polluting or colliding with existing user and activity records.",
        existingEntries: summary.existingEntries,
        rerunCommand: "npm run seed:test",
      });
      return;
    }
  } else {
    console.log("\n⚠️  [FORCE SEED] Force flag detected. Proceeding with test mock data seeding...\n");
  }

  console.log("=================================================================");
  console.log("🧪 STARTING KMUTT OPENHOUSE TEST / MOCK DATA SEED");
  console.log("=================================================================");

  const studentMap = await seedTestStudents();
  const activityMap = await seedTestActivities();
  await seedTestRegistrations(studentMap, activityMap);
  await seedTestAdminAndStaff(activityMap);

  console.log("\n=================================================================");
  console.log("✅ TEST SEED COMPLETED SUCCESSFULLY!");
  console.log("=================================================================");
  console.log("🔑 บัญชีทดสอบทั้งหมดสำหรับเข้าสู่ระบบ (รหัสผ่านคือ: 12345678)");
  console.log("-----------------------------------------------------------------");
  console.log("👤 ผู้ใช้งานทั่วไป (Students / Guests):");
  console.log("   • [นักเรียน 1]  : test.student@kmutt.ac.th  (รหัสผ่าน: 12345678)");
  console.log("   • [นักเรียน 2]  : test.student2@kmutt.ac.th (รหัสผ่าน: 12345678)");
  console.log("   • [ผู้ปกครอง]   : test.parent@kmutt.ac.th   (รหัสผ่าน: 12345678)");
  console.log("   • [ครูแนะแนว]   : test.teacher@kmutt.ac.th  (รหัสผ่าน: 12345678)");
  console.log("   • [บุคคลทั่วไป] : test.guest@kmutt.ac.th    (รหัสผ่าน: 12345678)");
  console.log("-----------------------------------------------------------------");
  console.log("🛡️ ผู้ดูแลระบบและเจ้าหน้าที่ (Admin & Staff):");
  console.log("   • [Admin กลาง]  : test.admin หรือ superadmin (รหัสผ่าน: 12345678)");
  console.log("   • [Staff สแกน]  : test.staff                (รหัสผ่าน: 12345678)");
  console.log("=================================================================\n");
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error("❌ Test seeding failed:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = {
  seedTestData: main,
};

