/**
 * KMUTT OpenHouse - Master Database Seeder
 * ------------------------------------------------------------
 * ไฟล์ Seed หลักแบบครบวงจร (Self-Contained)
 * 
 * หน้าที่ของสคริปต์นี้:
 * 1. Master Data จากไฟล์ JSON ที่ดึงจาก Database จริง:
 *    - 1.1 Faculty (คณะ 13 คณะ/ส่วนงาน)
 *    - 1.2 Department (ภาควิชา 39 หน่วยงาน)
 *    - 1.3 Landing Content (LandingBooth, LandingSchedule, LandingBanner, LandingConfig)
 *    - 1.4 OAuthClient (SSO Clients)
 * 2. Administrative Accounts (ดึงจาก DB จริง + Default Seed):
 *    - Admins (สุ่มรหัสผ่านด้วย OpenSSL 32 ตัวอักษร, เข้ารหัส bcrypt, ส่งออก admins.csv)
 *    - Staffs (สุ่มรหัสผ่านด้วย OpenSSL 32 ตัวอักษร, เข้ารหัส bcrypt, ผูก Admin, ส่งออก staffs.csv)
 * 
 * คำสั่งที่รองรับ:
 * - npm run seed           (หรือ npx prisma db seed): รัน Master Data + Admins + Staffs ทั้งหมด
 * - npm run seed:admins    : รันเฉพาะสร้างบัญชี Admins และออก admins.csv
 * - npm run seed:staffs    : รันเฉพาะสร้างบัญชี Staffs และออก staffs.csv
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
const { execSync } = require("child_process");
const { seedTestData } = require("./seed-test");
const {
  isForceEnabled,
  shouldResetPasswords,
  getDatabaseSummary,
  printAbortBanner,
} = require("./seed-guard");

const prisma = new PrismaClient();
const DATA_DIR = path.join(__dirname, "data");

/**
 * โหลดไฟล์ JSON จาก prisma/data/
 */
function loadJson(filename, fallback = []) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`[WARN] File not found: ${filePath}, using fallback.`);
    return fallback;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    console.error(`[ERROR] Failed to parse ${filename}:`, err.message);
    return fallback;
  }
}

/**
 * สุ่มรหัสผ่านความยาว 32 ตัวอักษรด้วย OpenSSL
 * คำสั่ง: openssl rand -base64 24
 */
function generateOpenSSLPassword(length = 32) {
  try {
    const raw = execSync("openssl rand -base64 24", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    if (raw.length === length) {
      return raw;
    }
    return raw.slice(0, length);
  } catch (error) {
    return crypto.randomBytes(24).toString("base64").slice(0, length);
  }
}

// -------------------------------------------------------------
// 1. MASTER DATA SEEDERS
// -------------------------------------------------------------

async function seedFaculties() {
  console.log("\n[1/6] Seeding Faculties (คณะ/ส่วนงาน)...");
  const faculties = loadJson("faculties.json");
  let count = 0;

  for (const item of faculties) {
    await prisma.faculty.upsert({
      where: { id: item.id },
      update: {
        name_th: item.name_th,
        name_en: item.name_en,
      },
      create: {
        id: item.id,
        name_th: item.name_th,
        name_en: item.name_en,
      },
    });
    count++;
  }
  console.log(`  -> Seeded ${count} faculties successfully.`);
}

async function seedDepartments() {
  console.log("\n[2/6] Seeding Departments (ภาควิชา/หน่วยงาน)...");
  const departments = loadJson("departments.json");
  let count = 0;

  for (const item of departments) {
    await prisma.department.upsert({
      where: { id: item.id },
      update: {
        name_th: item.name_th,
        name_en: item.name_en,
        facultyId: item.facultyId,
      },
      create: {
        id: item.id,
        name_th: item.name_th,
        name_en: item.name_en,
        facultyId: item.facultyId,
      },
    });
    count++;
  }
  console.log(`  -> Seeded ${count} departments successfully.`);
}

async function seedLandingContent() {
  console.log("\n[3/6] Seeding Landing Content (Booths, Schedules, Banners, Configs)...");

  // 1. LandingBooth
  const booths = loadJson("landing-booths.json");
  for (const item of booths) {
    await prisma.landingBooth.upsert({
      where: { id: item.id },
      update: {
        location: item.location,
        units: item.units,
        orderIndex: item.orderIndex,
        display: item.display,
      },
      create: {
        id: item.id,
        location: item.location,
        units: item.units,
        orderIndex: item.orderIndex,
        display: item.display,
      },
    });
  }
  console.log(`  -> Seeded ${booths.length} landing booths.`);

  // 2. LandingSchedule
  const schedules = loadJson("landing-schedules.json");
  for (const item of schedules) {
    await prisma.landingSchedule.upsert({
      where: { id: item.id },
      update: {
        time: item.time,
        session: item.session,
        category: item.category,
        categoryColor: item.categoryColor,
        title: item.title,
        details: item.details,
        subSectionTitle: item.subSectionTitle,
        subSectionItems: item.subSectionItems,
        isBreak: item.isBreak,
        orderIndex: item.orderIndex,
        display: item.display,
      },
      create: {
        id: item.id,
        time: item.time,
        session: item.session,
        category: item.category,
        categoryColor: item.categoryColor,
        title: item.title,
        details: item.details,
        subSectionTitle: item.subSectionTitle,
        subSectionItems: item.subSectionItems,
        isBreak: item.isBreak,
        orderIndex: item.orderIndex,
        display: item.display,
      },
    });
  }
  console.log(`  -> Seeded ${schedules.length} landing schedules.`);

  // 3. LandingBanner
  const banners = loadJson("landing-banners.json");
  for (const item of banners) {
    await prisma.landingBanner.upsert({
      where: { id: item.id },
      update: {
        imageUrl: item.imageUrl,
        altText: item.altText,
        linkUrl: item.linkUrl,
        orderIndex: item.orderIndex,
        display: item.display,
      },
      create: {
        id: item.id,
        imageUrl: item.imageUrl,
        altText: item.altText,
        linkUrl: item.linkUrl,
        orderIndex: item.orderIndex,
        display: item.display,
      },
    });
  }
  console.log(`  -> Seeded ${banners.length} landing banners.`);

  // 4. LandingConfig
  const configs = loadJson("landing-configs.json");
  for (const item of configs) {
    await prisma.landingConfig.upsert({
      where: { key: item.key },
      update: {
        value: typeof item.value === "string" ? item.value : JSON.stringify(item.value),
      },
      create: {
        key: item.key,
        value: typeof item.value === "string" ? item.value : JSON.stringify(item.value),
      },
    });
  }
  console.log(`  -> Seeded ${configs.length} landing configs.`);
}

async function seedOAuthClients() {
  console.log("\n[4/6] Seeding OAuth Clients...");
  const clients = loadJson("oauth-clients.json");
  let count = 0;

  for (const item of clients) {
    await prisma.oAuthClient.upsert({
      where: { client_id: item.client_id },
      update: {
        name: item.name,
        client_secret: item.client_secret,
        redirect_uris: item.redirect_uris,
      },
      create: {
        name: item.name,
        client_id: item.client_id,
        client_secret: item.client_secret,
        redirect_uris: item.redirect_uris,
      },
    });
    count++;
  }
  console.log(`  -> Seeded ${count} OAuth clients successfully.`);
}

// -------------------------------------------------------------
// 2. ADMIN ACCOUNTS GENERATOR (OpenSSL + DB Sync)
// -------------------------------------------------------------

async function generateAdminAccounts(options = {}) {
  const resetPasswords = options.resetPasswords ?? shouldResetPasswords();
  console.log("\n=================================================");
  console.log("KMUTT OpenHouse - Admin Accounts Generator");
  console.log("Password generation engine: OpenSSL (32 chars)");
  if (resetPasswords) {
    console.log("⚠️  Password mode: RESET ALL PASSWORDS (--reset-passwords active)");
  } else {
    console.log("🔒 Password mode: PRESERVE EXISTING PASSWORDS (Safe mode)");
  }
  console.log("=================================================");

  const defaultAdminsData = loadJson("admins-seed.json");

  // ดึงข้อมูล Admins ที่มีอยู่ใน DB ปัจจุบันก่อน เพื่อให้ไม่ตกหล่น
  let dbAdmins = [];
  try {
    dbAdmins = await prisma.admins.findMany({
      select: { username: true, email: true, name: true },
    });
    console.log(`[+] Fetched ${dbAdmins.length} existing admin accounts from current Database.`);
  } catch (err) {
    console.warn(`[!] Note: Could not fetch existing admins from DB (${err.message}). Proceeding with seed defaults.`);
  }

  const adminMap = new Map();

  for (const item of defaultAdminsData) {
    adminMap.set(item.username, {
      username: item.username,
      email: item.email,
      name: item.name,
    });
  }

  for (const item of dbAdmins) {
    adminMap.set(item.username, {
      username: item.username,
      email: item.email,
      name: item.name || adminMap.get(item.username)?.name || item.username,
    });
  }

  const combinedAdmins = Array.from(adminMap.values());
  console.log(`[+] Total admins to process: ${combinedAdmins.length}`);

  const csvRecords = [];

  for (const admin of combinedAdmins) {
    const existing = await prisma.admins.findFirst({
      where: {
        OR: [
          { username: admin.username },
          { email: admin.email },
        ],
      },
    });

    let passwordForCsv = "";

    if (existing) {
      if (resetPasswords) {
        const password = generateOpenSSLPassword(32);
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.admins.update({
          where: { id: existing.id },
          data: {
            username: admin.username,
            email: admin.email,
            name: admin.name,
            password_hash: hashedPassword,
          },
        });
        passwordForCsv = password;
        console.log(`[PASSWORD RESET] ${admin.username} (${admin.name})`);
      } else {
        await prisma.admins.update({
          where: { id: existing.id },
          data: {
            username: admin.username,
            email: admin.email,
            name: admin.name,
          },
        });
        passwordForCsv = "[PRESERVED - UNCHANGED]";
        console.log(`[PRESERVED] ${admin.username} (${admin.name}) - existing credentials kept`);
      }
    } else {
      const password = generateOpenSSLPassword(32);
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.admins.create({
        data: {
          username: admin.username,
          email: admin.email,
          name: admin.name,
          password_hash: hashedPassword,
        },
      });
      passwordForCsv = password;
      console.log(`[CREATED] ${admin.username} (${admin.name})`);
    }

    csvRecords.push({
      username: admin.username,
      password: passwordForCsv,
      email: admin.email,
      name: admin.name,
    });
  }

  // ส่งออกเป็นไฟล์ admins.csv
  const csvFileName = "admins.csv";
  const csvFilePath = path.join(process.cwd(), csvFileName);

  const header = "username,password,email,name";
  const rows = csvRecords.map(
    (record) =>
      `"${record.username.replace(/"/g, '""')}","${record.password.replace(/"/g, '""')}","${record.email.replace(/"/g, '""')}","${record.name.replace(/"/g, '""')}"`
  );

  const csvContent = "\uFEFF" + [header, ...rows].join("\n");
  fs.writeFileSync(csvFilePath, csvContent, "utf8");

  console.log("=================================================");
  console.log(`Admin generation completed! Total accounts: ${csvRecords.length}`);
  console.log(`Output CSV file generated at: ${csvFilePath}`);
  console.log("=================================================");
}

// -------------------------------------------------------------
// 3. STAFF ACCOUNTS GENERATOR (OpenSSL + DB Sync)
// -------------------------------------------------------------

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

async function generateStaffAccounts(options = {}) {
  const resetPasswords = options.resetPasswords ?? shouldResetPasswords();
  console.log("\n=================================================");
  console.log("KMUTT OpenHouse - Staff Accounts Generator");
  console.log("Password generation engine: OpenSSL (32 chars)");
  if (resetPasswords) {
    console.log("⚠️  Password mode: RESET ALL PASSWORDS (--reset-passwords active)");
  } else {
    console.log("🔒 Password mode: PRESERVE EXISTING PASSWORDS (Safe mode)");
  }
  console.log("=================================================");

  const defaultStaffsConfig = loadJson("staffs-seed.json");

  let dbStaffs = [];
  try {
    dbStaffs = await prisma.staffs.findMany({
      select: {
        username: true,
        email: true,
        name: true,
        created_by: { select: { username: true, email: true, name: true } },
      },
    });
    console.log(`[+] Fetched ${dbStaffs.length} existing staff accounts from current Database.`);
  } catch (err) {
    console.warn(`[!] Note: Could not fetch existing staffs from DB (${err.message}). Proceeding with seed defaults.`);
  }

  const staffMap = new Map();

  for (const item of defaultStaffsConfig) {
    staffMap.set(item.username, { ...item });
  }

  for (const item of dbStaffs) {
    const existingConfig = staffMap.get(item.username);
    staffMap.set(item.username, {
      username: item.username,
      email: item.email,
      name: item.name || existingConfig?.name || item.username,
      adminUsername: item.created_by?.username || existingConfig?.adminUsername || "superadmin",
      fallbackAdminName: item.created_by?.name || existingConfig?.fallbackAdminName || "ผู้ดูแลระบบส่วนกลาง (Super Admin)",
      fallbackAdminEmail: item.created_by?.email || existingConfig?.fallbackAdminEmail || "superadmin@openhouse.kmutt.ac.th",
    });
  }

  const combinedStaffs = Array.from(staffMap.values());
  console.log(`[+] Total staffs to process: ${combinedStaffs.length}`);

  const csvRecords = [];

  for (const item of combinedStaffs) {
    const adminId = await resolveAdminId(
      item.adminUsername,
      item.fallbackAdminName,
      item.fallbackAdminEmail
    );

    const existing = await prisma.staffs.findFirst({
      where: {
        OR: [
          { username: item.username },
          { email: item.email },
        ],
      },
    });

    let passwordForCsv = "";

    if (existing) {
      if (resetPasswords) {
        const password = generateOpenSSLPassword(32);
        const hashedPassword = await bcrypt.hash(password, 10);
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
        passwordForCsv = password;
        console.log(`[PASSWORD RESET] ${item.username} -> Admin ID: ${adminId}`);
      } else {
        await prisma.staffs.update({
          where: { id: existing.id },
          data: {
            username: item.username,
            email: item.email,
            name: item.name,
            create_by: adminId,
          },
        });
        passwordForCsv = "[PRESERVED - UNCHANGED]";
        console.log(`[PRESERVED] ${item.username} -> Admin ID: ${adminId} (existing password kept)`);
      }
    } else {
      const password = generateOpenSSLPassword(32);
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.staffs.create({
        data: {
          username: item.username,
          email: item.email,
          name: item.name,
          password_hash: hashedPassword,
          create_by: adminId,
        },
      });
      passwordForCsv = password;
      console.log(`[CREATED] ${item.username} -> Admin ID: ${adminId}`);
    }

    csvRecords.push({
      username: item.username,
      password: passwordForCsv,
      email: item.email,
      name: item.name,
    });
  }

  const csvFileName = "staffs.csv";
  const csvFilePath = path.join(process.cwd(), csvFileName);

  const header = "username,password,email,name";
  const rows = csvRecords.map(
    (record) =>
      `"${record.username.replace(/"/g, '""')}","${record.password.replace(/"/g, '""')}","${record.email.replace(/"/g, '""')}","${record.name.replace(/"/g, '""')}"`
  );

  const csvContent = "\uFEFF" + [header, ...rows].join("\n");
  fs.writeFileSync(csvFilePath, csvContent, "utf8");

  console.log("=================================================");
  console.log(`Staff generation completed! Total accounts: ${csvRecords.length}`);
  console.log(`Output CSV file generated at: ${csvFilePath}`);
  console.log("=================================================");
}

// -------------------------------------------------------------
// MAIN ENTRYPOINT
// -------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const force = isForceEnabled(args);

  // ตรวจสอบความปลอดภัย: ป้องกันการรัน Seed ทับ Database ที่มีข้อมูลอยู่แล้ว
  if (!force) {
    const summary = await getDatabaseSummary(prisma);

    if (args.includes("--admins-only")) {
      if (summary.tableCounts.Admins > 0) {
        printAbortBanner({
          title: "Admins already exist in Database!",
          reason: `Found ${summary.tableCounts.Admins} existing admin account(s).\nSeeding was prevented to protect administrative accounts and avoid password resets.`,
          existingEntries: [["Admins", summary.tableCounts.Admins]],
          rerunCommand: "npm run seed:admins",
        });
        return;
      }
    } else if (args.includes("--staffs-only")) {
      if (summary.tableCounts.Staffs > 0) {
        printAbortBanner({
          title: "Staffs already exist in Database!",
          reason: `Found ${summary.tableCounts.Staffs} existing staff account(s).\nSeeding was prevented to protect staff accounts and avoid password resets.`,
          existingEntries: [["Staffs", summary.tableCounts.Staffs]],
          rerunCommand: "npm run seed:staffs",
        });
        return;
      }
    } else if (args.includes("--master-only")) {
      const masterEntries = summary.existingEntries.filter(([table]) =>
        [
          "Faculties",
          "Departments",
          "Landing Configs",
          "Landing Booths",
          "Landing Schedules",
          "Landing Banners",
          "OAuth Clients",
        ].includes(table)
      );
      if (masterEntries.length > 0) {
        printAbortBanner({
          title: "Master data already exists in Database!",
          reason: "Master data tables already contain records.\nSeeding was prevented to avoid overwriting customized landing configurations or university structures.",
          existingEntries: masterEntries,
          rerunCommand: "npm run seed -- --master-only",
        });
        return;
      }
    } else {
      // Default: รัน Master Data + Admins + Staffs ทั้งหมด
      if (summary.hasData) {
        printAbortBanner({
          title: "Database already contains existing data!",
          reason: "Database is not empty. Seeding was halted to protect data integrity\nand prevent accidental overwriting of user accounts, CMS configurations, or passwords.",
          existingEntries: summary.existingEntries,
          rerunCommand: "npm run seed",
        });
        return;
      }
    }
  } else {
    console.log("\n⚠️  [FORCE SEED] Force flag detected (--force / FORCE_SEED=true). Proceeding despite existing data...\n");
  }

  if (args.includes("--admins-only")) {
    await generateAdminAccounts();
    return;
  }

  if (args.includes("--staffs-only")) {
    await generateStaffAccounts();
    return;
  }

  if (args.includes("--master-only")) {
    await seedFaculties();
    await seedDepartments();
    await seedLandingContent();
    await seedOAuthClients();
    return;
  }

  console.log("=================================================================");
  console.log("🌱 STARTING KMUTT OPENHOUSE MASTER DATABASE SEED");
  console.log("=================================================================");

  // 1. Master Data
  await seedFaculties();
  await seedDepartments();
  await seedLandingContent();
  await seedOAuthClients();

  // 2. Initial Admin & Staff Accounts
  console.log("\n[5/6] Generating Admin Accounts (with OpenSSL passwords)...");
  await generateAdminAccounts();

  console.log("\n[6/6] Generating Staff Accounts (with OpenSSL passwords)...");
  await generateStaffAccounts();

  if (args.includes("--with-test") || args.includes("--test")) {
    console.log("\n[EXTRA] Seeding Test Mock Data (--with-test)...");
    await seedTestData({ force: true });
  }

  console.log("\n=================================================================");
  console.log("✅ ALL MASTER SEEDS COMPLETED SUCCESSFULLY!");
  console.log("   - Master data (Faculties, Departments, Landing CMS, OAuth) loaded");
  console.log("   - Admins & Staffs generated with secure OpenSSL passwords");
  console.log("   - Credentials exported to admins.csv and staffs.csv (gitignored)");
  console.log("=================================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
