/**
 * KMUTT OpenHouse - Database Seed Guard
 * ------------------------------------------------------------
 * โมดูลป้องกันการรัน Seed ซ้ำซ้อนเมื่อมีข้อมูลอยู่ใน Database แล้ว
 * เพื่อป้องกันข้อมูลสูญหาย หรือการถูกรีเซ็ตรหัสผ่านของผู้ใช้งาน/ผู้ดูแลระบบโดยไม่ตั้งใจ
 */

/**
 * ตรวจสอบว่าเปิดใช้งานโหมด Force หรือไม่
 * รองรับทั้ง argument (--force, -f) และ Environment Variables (FORCE_SEED, ALLOW_SEED_WITH_DATA)
 */
function isForceEnabled(args = process.argv.slice(2)) {
  return (
    args.includes("--force") ||
    args.includes("-f") ||
    process.env.FORCE_SEED === "true" ||
    process.env.FORCE_SEED === "1" ||
    process.env.ALLOW_SEED_WITH_DATA === "true" ||
    process.env.ALLOW_SEED_WITH_DATA === "1"
  );
}

/**
 * ตรวจสอบว่าต้องการรีเซ็ตรหัสผ่านบัญชีเดิมหรือไม่
 * ค่าเริ่มต้นคือ false เพื่อรักษาความปลอดภัยของรหัสผ่านบัญชีที่มีอยู่แล้ว
 */
function shouldResetPasswords(args = process.argv.slice(2)) {
  return (
    args.includes("--reset-passwords") ||
    process.env.RESET_PASSWORDS === "true" ||
    process.env.RESET_PASSWORDS === "1"
  );
}

/**
 * ดึงสรุปจำนวนข้อมูลปัจจุบันในแต่ละตารางสำคัญของฐานข้อมูล
 */
async function getDatabaseSummary(prisma) {
  const [
    admins,
    staffs,
    students,
    faculties,
    departments,
    activities,
    landingConfigs,
    landingBooths,
    landingSchedules,
    landingBanners,
    publicSurveys,
    registerActivities,
    oAuthClients,
  ] = await Promise.all([
    prisma.admins.count().catch(() => 0),
    prisma.staffs.count().catch(() => 0),
    prisma.students.count().catch(() => 0),
    prisma.faculty.count().catch(() => 0),
    prisma.department.count().catch(() => 0),
    prisma.activities.count().catch(() => 0),
    prisma.landingConfig.count().catch(() => 0),
    prisma.landingBooth.count().catch(() => 0),
    prisma.landingSchedule.count().catch(() => 0),
    prisma.landingBanner.count().catch(() => 0),
    prisma.publicSurvey.count().catch(() => 0),
    prisma.registerActivities.count().catch(() => 0),
    prisma.oAuthClient.count().catch(() => 0),
  ]);

  const tableCounts = {
    Admins: admins,
    Staffs: staffs,
    Students: students,
    Faculties: faculties,
    Departments: departments,
    Activities: activities,
    "Landing Configs": landingConfigs,
    "Landing Booths": landingBooths,
    "Landing Schedules": landingSchedules,
    "Landing Banners": landingBanners,
    "Public Surveys": publicSurveys,
    "Register Activities": registerActivities,
    "OAuth Clients": oAuthClients,
  };

  const existingEntries = Object.entries(tableCounts).filter(([, count]) => count > 0);
  const totalRecords = existingEntries.reduce((sum, [, count]) => sum + count, 0);

  return {
    tableCounts,
    existingEntries,
    totalRecords,
    hasData: totalRecords > 0,
  };
}

/**
 * แสดงแบนเนอร์แจ้งเตือนการหยุดทำงานเพื่อความปลอดภัย
 */
function printAbortBanner({ title, reason, existingEntries = [], rerunCommand = "npm run seed" }) {
  console.log("\n=================================================================");
  console.log(`🛑 SEED ABORTED: ${title}`);
  console.log("=================================================================");
  console.log(reason);

  if (existingEntries.length > 0) {
    console.log("\nDetected existing records in database:");
    for (const [table, count] of existingEntries) {
      console.log(`  • ${table.padEnd(20)}: ${count} record(s)`);
    }
  }

  console.log("\n-----------------------------------------------------------------");
  console.log("💡 หากต้องการบังคับรัน Seed ทับข้อมูลเดิม ให้ใช้คำสั่ง:");
  console.log(`   ${rerunCommand} -- --force`);
  console.log("   หรือ");
  console.log(`   FORCE_SEED=true ${rerunCommand}`);
  console.log("=================================================================\n");
}

module.exports = {
  isForceEnabled,
  shouldResetPasswords,
  getDatabaseSummary,
  printAbortBanner,
};
