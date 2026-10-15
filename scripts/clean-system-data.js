/**
 * KMUTT OpenHouse - System Data Cleaner
 * Usage: node scripts/clean-system-data.js
 * 
 * Actions performed:
 * 1. TRUNCATE all transactional / user data in MySQL database
 *    (Students, Admins, Staffs, Activities, E-Stamps, Registrations, Surveys, Certificates, etc.)
 * 2. PRESERVES Master Data: Faculty (คณะ) and Department (ภาควิชา)
 * 3. PRESERVES System Tables: _prisma_migrations
 * 4. DELETES all old PDF certificates in /root/sit-cert/*.pdf (directory itself is kept)
 * 5. PRESERVES all public website assets in public/ (banners, logos, maps, cert-bg.png)
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

const TABLES_TO_TRUNCATE = [
  "SITCert",
  "TakePicture",
  "EStamp",
  "RegisterActivities",
  "StaffMapping",
  "PublicSurvey",
  "PasswordResetToken",
  "OAuthCode",
  "oAuthToken",
  "OAuthClient",
  "Students",
  "Staffs",
  "Activities",
  "Admins",
];

const PRESERVED_TABLES = ["Faculty", "Department", "_prisma_migrations"];

async function cleanDatabase() {
  console.log("\n=======================================================");
  console.log(" [1/3] Truncating Database Tables");
  console.log("=======================================================");

  // Disable FK checks to allow truncate in any order
  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0;");

  for (const table of TABLES_TO_TRUNCATE) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\`;`);
      console.log(`  [+] Truncated table: \`${table}\``);
    } catch (err) {
      console.error(`  [!] Error truncating \`${table}\`:`, err.message);
    }
  }

  // Re-enable FK checks
  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1;");

  console.log("\n  -> Verifying Preserved Master Tables:");
  const facultyCount = await prisma.faculty.count();
  const departmentCount = await prisma.department.count();
  console.log(`     - Faculty (คณะ): ${facultyCount} records (Preserved)`);
  console.log(`     - Department (ภาควิชา): ${departmentCount} records (Preserved)`);

  console.log("\n  -> Verifying Truncated Tables:");
  for (const table of TABLES_TO_TRUNCATE) {
    try {
      const result = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM \`${table}\`;`);
      const count = Number(result[0].count);
      console.log(`     - ${table}: ${count} rows`);
    } catch (err) {
      console.log(`     - ${table}: verify error (${err.message})`);
    }
  }
}

async function cleanPdfCertificates() {
  console.log("\n=======================================================");
  console.log(" [2/3] Cleaning PDF Certificates in /root/sit-cert");
  console.log("=======================================================");

  const certDir = "/root/sit-cert";
  if (!fs.existsSync(certDir)) {
    console.log("  Notice: /root/sit-cert directory does not exist, skipping.");
    return;
  }

  const files = fs.readdirSync(certDir);
  const pdfFiles = files.filter(f => f.toLowerCase().endsWith(".pdf"));

  console.log(`  Found ${pdfFiles.length} PDF files in ${certDir}`);
  let deletedCount = 0;

  for (const file of pdfFiles) {
    const fullPath = path.join(certDir, file);
    fs.unlinkSync(fullPath);
    deletedCount++;
  }

  console.log(`  [+] Successfully deleted ${deletedCount} PDF files.`);
  const remaining = fs.readdirSync(certDir);
  console.log(`  -> Remaining items in ${certDir}: ${remaining.length} files/dirs.`);
}

async function verifyPublicAssets() {
  console.log("\n=======================================================");
  console.log(" [3/3] Verifying Public Assets (Kept Intact)");
  console.log("=======================================================");

  const publicDir = path.join(__dirname, "../public");
  const imagesDir = path.join(publicDir, "images");

  if (fs.existsSync(publicDir)) {
    const publicFiles = fs.readdirSync(publicDir);
    console.log(`  -> Files in public/:`, publicFiles.join(", "));
  }

  if (fs.existsSync(imagesDir)) {
    const imageFiles = fs.readdirSync(imagesDir);
    console.log(`  -> Images in public/images/ (${imageFiles.length} files):`, imageFiles.join(", "));
  }

  console.log("  [+] Public assets preserved 100% (Not touched)");
}

async function main() {
  console.log("#######################################################");
  console.log("# KMUTT OpenHouse - Database & PDF Cleaner");
  console.log("#######################################################");

  try {
    await cleanDatabase();
    await cleanPdfCertificates();
    await verifyPublicAssets();

    console.log("\n=======================================================");
    console.log(" Clean operation completed successfully!");
    console.log("=======================================================\n");
  } catch (err) {
    console.error("Fatal error during clean operation:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
