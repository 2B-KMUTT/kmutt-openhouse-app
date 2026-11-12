// scripts/verify-portfolio-registration.js
if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile();
  } catch (e) {
    // ignore
  }
}

const { PrismaClient } = require("@prisma/client");
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");

function loadTsModule(relativePath) {
  const filePath = path.join(__dirname, relativePath);
  const code = fs.readFileSync(filePath, "utf8");
  const transpiled = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const m = { exports: {} };
  const fn = new Function("module", "exports", "require", transpiled);
  fn(m, m.exports, require);
  return m.exports;
}

const { createActivity } = loadTsModule("../src/libs/activityService.ts");
const prisma = new PrismaClient();

async function runVerification() {
  console.log("=================================================================");
  console.log("🚀 STARTING PORTFOLIO REGISTRATION VERIFICATION SUITE");
  console.log("=================================================================");

  let passed = 0;
  let failed = 0;

  function report(name, ok, err) {
    if (ok) {
      console.log(`✅ PASSED: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAILED: ${name}`);
      if (err) console.error(`   -> ${err.message || err}`);
      failed++;
    }
  }

  // 1. Static Schema & Model Verification
  console.log("\n--- 1. Schema & Model Verification ---");
  try {
    const schemaSrc = fs.readFileSync(path.join(__dirname, "../prisma/schema.prisma"), "utf8");
    assert(schemaSrc.includes("require_portfolio"), "schema.prisma must declare require_portfolio in Activities");
    assert(schemaSrc.includes("portfolio_url"), "schema.prisma must declare portfolio_url in RegisterActivities");
    report("schema.prisma declares require_portfolio and portfolio_url", true);
  } catch (err) {
    report("schema.prisma declares require_portfolio and portfolio_url", false, err);
  }

  // 2. Database Column Verification (MySQL)
  console.log("\n--- 2. Database Column Verification (MySQL) ---");
  try {
    const testAct = await prisma.activities.findFirst({ select: { id: true, require_portfolio: true } });
    assert(testAct === null || typeof testAct.require_portfolio === "boolean", "require_portfolio is a boolean column");
    report("Database table Activities has require_portfolio column", true);
  } catch (err) {
    report("Database table Activities has require_portfolio column", false, err);
  }

  try {
    const testReg = await prisma.registerActivities.findFirst({ select: { id: true, portfolio_url: true } });
    assert(testReg === null || testReg.portfolio_url === null || typeof testReg.portfolio_url === "string", "portfolio_url column is accessible");
    report("Database table RegisterActivities has portfolio_url column", true);
  } catch (err) {
    report("Database table RegisterActivities has portfolio_url column", false, err);
  }

  // 3. End-to-End Activity Creation & Portfolio Workflow
  console.log("\n--- 3. Activity Creation & Portfolio Registration Workflow ---");
  let testActivityId = null;
  let testStudent = null;

  try {
    // Find or create test student
    testStudent = await prisma.students.findUnique({ where: { email: "student@kmutt.ac.th" } });
    if (!testStudent) {
      const bcrypt = require("bcrypt");
      const hash = await bcrypt.hash("password123", 10);
      testStudent = await prisma.students.create({
        data: {
          email: "student@kmutt.ac.th",
          password_hash: hash,
          first_name: "สมชาย",
          last_name: "ใจดี",
          phone: "0811111111",
          role: "student",
        },
      });
    }

    // Find Ratchaburi admin & department
    const ratchaburiAdmin = await prisma.admins.findFirst({
      where: { username: "KM_ratchaburi" },
    });
    const ratchaburiDept = await prisma.department.findFirst({
      where: { name_th: { contains: "ราชบุรี" } },
    });

    const deptId = ratchaburiDept ? ratchaburiDept.id : 1;
    const adminId = ratchaburiAdmin ? ratchaburiAdmin.id : 1;

    // Create Activity with require_portfolio: true
    const activityInput = {
      title: "Workshop ทดสอบ: ออกแบบแฟ้มสะสมผลงาน (a-Port) มจธ.ราชบุรี",
      description: "กิจกรรมเวิร์กช็อปทดสอบการแนบลิงก์ Portfolio สำหรับผู้สมัคร",
      activity_type: "workshop",
      departmentId: deptId,
      date: "2026-11-21",
      round: 1,
      start_time: "09:00",
      end_time: "12:00",
      location: "ห้องสัมมนา 1 มจธ.ราชบุรี @นครปฐม",
      point: 2,
      max_participants: 50,
      require_portfolio: true,
      ownerId: adminId,
    };

    const createdAct = await createActivity(
      activityInput,
      { id: adminId, role: "kmuser", adminRole: "ADMIN" },
      prisma
    );

    testActivityId = createdAct.id;
    assert.strictEqual(createdAct.require_portfolio, true, "Activity created with require_portfolio = true");
    report("Create activity with require_portfolio = true", true);

    // Register student with portfolio URL
    const samplePortfolioUrl = "https://drive.google.com/drive/folders/sample-public-portfolio-link";
    const reg = await prisma.registerActivities.create({
      data: {
        studentId: testStudent.id,
        activityId: testActivityId,
        portfolio_url: samplePortfolioUrl,
      },
    });

    assert.strictEqual(reg.portfolio_url, samplePortfolioUrl, "Registered with portfolio_url correctly");
    report("Register student with portfolio URL", true);

    // Update portfolio URL in place without dropping registration
    const updatedPortfolioUrl = "https://www.canva.com/design/sample-updated-portfolio";
    const updatedReg = await prisma.registerActivities.update({
      where: { studentId_activityId: { studentId: testStudent.id, activityId: testActivityId } },
      data: { portfolio_url: updatedPortfolioUrl },
    });

    assert.strictEqual(updatedReg.id, reg.id, "Registration ID remains identical (no unregister/seat loss)");
    assert.strictEqual(updatedReg.portfolio_url, updatedPortfolioUrl, "Portfolio URL updated in-place");
    report("Update portfolio URL in-place without losing registration seat", true);

    // Query back registrations with student profile
    const fetchedAct = await prisma.activities.findUnique({
      where: { id: testActivityId },
      include: {
        RegisterActivities: {
          include: { student: true },
        },
      },
    });

    assert.strictEqual(fetchedAct.RegisterActivities.length, 1, "Activity has 1 registration");
    assert.strictEqual(fetchedAct.RegisterActivities[0].portfolio_url, updatedPortfolioUrl, "Fetched registration includes updated portfolio_url");
    report("Admin fetch activity returns portfolio_url in participant list", true);

    // Clean up test registration
    await prisma.registerActivities.delete({
      where: { studentId_activityId: { studentId: testStudent.id, activityId: testActivityId } },
    });
    report("Clean up test registration", true);

  } catch (err) {
    report("Activity creation & portfolio registration workflow", false, err);
  } finally {
    if (testActivityId) {
      // Keep this activity active in DB so user can manual test in browser right now!
      console.log(`\n📌 Sample workshop activity kept in DB for manual testing: ID = ${testActivityId}`);
      console.log(`   Title: "Workshop ทดสอบ: ออกแบบแฟ้มสะสมผลงาน (a-Port) มจธ.ราชบุรี"`);
      console.log(`   URL: http://localhost:3000/app/activities/${testActivityId}`);
    }
    await prisma.$disconnect();
  }

  // Summary
  console.log("\n=================================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification();
