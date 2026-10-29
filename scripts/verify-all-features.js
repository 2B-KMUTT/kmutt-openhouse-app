const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const BASE_URL = "http://localhost";

async function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASSED: ${message}`);
}

async function runTests() {
  console.log("=================================================================");
  console.log("🚀 STARTING AUTOMATED COMPREHENSIVE TEST SUITE");
  console.log(`   Target Server: ${BASE_URL}`);
  console.log(`   Current System Time: ${new Date().toISOString()}`);
  console.log("=================================================================\n");

  // -------------------------------------------------------------
  // TEST 1: Landing Banners & Carousel Logic
  // -------------------------------------------------------------
  console.log("--- TEST 1: Landing Banners & Carousel Logic ---");
  let res = await fetch(`${BASE_URL}/api/landing/banners`);
  assert(res.status === 200, "GET /api/landing/banners returns 200 OK");
  let banners = await res.json();
  assert(Array.isArray(banners), "Banners response is an array");
  console.log(`   Initial active banners count: ${banners.length}`);
  assert(banners.length >= 1, "At least 1 default banner exists");
  assert(banners[0].imageUrl && banners[0].imageUrl.includes("banner"), "Default banner imageUrl is valid");

  // Test adding a 2nd banner to verify multi-banner (Carousel Slider) support
  const testBanner = await prisma.landingBanner.create({
    data: {
      imageUrl: "/images/banner-test-carousel.png",
      altText: "Test Carousel Banner 2",
      linkUrl: "https://kmutt.me/test",
      orderIndex: 2,
      display: true,
    },
  });
  console.log(`   Created temporary 2nd banner ID: ${testBanner.id}`);

  res = await fetch(`${BASE_URL}/api/landing/banners`);
  banners = await res.json();
  assert(banners.length === 2, "GET /api/landing/banners returns 2 banners (Carousel Slider mode active)");
  assert(banners[1].id === testBanner.id, "2nd banner correctly present in ordered list");

  // Clean up 2nd banner
  await prisma.landingBanner.delete({ where: { id: testBanner.id } });
  console.log(`   Cleaned up temporary 2nd banner ID: ${testBanner.id}`);

  res = await fetch(`${BASE_URL}/api/landing/banners`);
  banners = await res.json();
  assert(banners.length === 1, "Back to 1 banner (Static Banner mode active)");
  console.log("");

  // -------------------------------------------------------------
  // TEST 2: Landing Page Dynamic Configuration & Layout
  // -------------------------------------------------------------
  console.log("--- TEST 2: Landing Page Dynamic Configuration ---");
  res = await fetch(`${BASE_URL}/api/landing/config`);
  assert(res.status === 200, "GET /api/landing/config returns 200 OK");
  const config = await res.json();
  assert(Boolean(config.heroTitle), "heroTitle is present in config");
  assert(Boolean(config.heroSubtitle), "heroSubtitle is present in config");
  assert(Boolean(config.coordinatorName), "coordinatorName is present in config");
  assert(Boolean(config.coordinatorPhone), "coordinatorPhone is present in config");
  assert(Boolean(config.coordinatorEmail), "coordinatorEmail is present in config");
  console.log(`   Hero Title: "${config.heroTitle}"`);
  console.log(`   Coordinator: "${config.coordinatorName}" (${config.coordinatorPhone})`);

  // Verify Landing Page HTML serves properly without layout crash
  res = await fetch(`${BASE_URL}/`);
  assert(res.status === 200, "GET / returns 200 OK");
  const landingHtml = await res.text();
  assert(landingHtml.includes("KMUTT") || landingHtml.includes("openhouse"), "Landing page HTML rendered properly");
  console.log("");

  // -------------------------------------------------------------
  // TEST 3: Survey Timing - SCENARIO A (Before Oct 30: Locked)
  // -------------------------------------------------------------
  console.log("--- TEST 3: Survey Timing - SCENARIO A: Before Start Date (Simulated Pre-Event Lock) ---");
  // Ensure mode is "auto" and set surveyStartDate to a future date to test locked pre-event state
  await prisma.landingConfig.upsert({
    where: { key: "surveyStatus" },
    update: { value: "auto" },
    create: { key: "surveyStatus", value: "auto" },
  });
  await prisma.landingConfig.upsert({
    where: { key: "surveyStartDate" },
    update: { value: "2099-10-30T00:00:00+07:00" },
    create: { key: "surveyStartDate", value: "2099-10-30T00:00:00+07:00" },
  });

  res = await fetch(`${BASE_URL}/api/survey/config`);
  assert(res.status === 200, "GET /api/survey/config returns 200 OK");
  let surveyConfig = await res.json();
  console.log(`   Server Current Time: ${surveyConfig.currentTime}`);
  console.log(`   Survey Start Date:   ${surveyConfig.startDate}`);
  console.log(`   Evaluated Status:    ${surveyConfig.status}`);
  console.log(`   isOpen:              ${surveyConfig.isOpen}`);

  assert(surveyConfig.status === "not_started", "Status is strictly 'not_started' before start date");
  assert(surveyConfig.isOpen === false, "isOpen is strictly false before start date");

  // Attempt to submit survey before Oct 30 -> MUST BE REJECTED (403)
  res = await fetch(`${BASE_URL}/api/survey`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "นักเรียน", province: "ร้อยเอ็ด" }),
  });
  assert(res.status === 403, "POST /api/survey returns 403 Forbidden before Oct 30");
  let errBody = await res.json();
  assert(
    errBody.error && errBody.error.includes("30 ตุลาคม 2569"),
    `Rejection message is correct: "${errBody.error}"`
  );

  // Check frontend /survey page HTML (should not crash)
  res = await fetch(`${BASE_URL}/survey`);
  assert(res.status === 200, "GET /survey returns 200 OK");
  console.log("");

  // -------------------------------------------------------------
  // TEST 4: Survey Timing - SCENARIO B (During Event: Oct 30 to Nov 6)
  // -------------------------------------------------------------
  console.log("--- TEST 4: Survey Timing - SCENARIO B: During Event Window (Simulated Opening) ---");
  // Set surveyStartDate to a past date to simulate real-world arrival of Oct 30
  await prisma.landingConfig.upsert({
    where: { key: "surveyStartDate" },
    update: { value: "2026-10-01T00:00:00+07:00" },
    create: { key: "surveyStartDate", value: "2026-10-01T00:00:00+07:00" },
  });

  res = await fetch(`${BASE_URL}/api/survey/config`);
  surveyConfig = await res.json();
  console.log(`   Simulated Status: ${surveyConfig.status}, isOpen: ${surveyConfig.isOpen}`);
  assert(surveyConfig.status === "open", "Status becomes 'open' during the event window");
  assert(surveyConfig.isOpen === true, "isOpen becomes true during the event window (Modal will pop up)");

  // Submit survey without 3 พระจอม
  const testSurveyPayload = {
    role: "นักเรียน",
    province: "ร้อยเอ็ด",
    sourceChannels: ["Facebook", "LINE"],
    grade: "ม.6",
    stream: "วิทย์–คณิต",
    interestedFaculty: ["คอมพิวเตอร์ / IT"],
    decisionFactors: ["ชื่อเสียง / Ranking", "จบแล้วมีงานทำ"],
    worryPoints: "ไม่กังวล",
    recommendIntent: 5,
    overallSatisfaction: 5,
    feedbackNote: "ระบบตอบสนองดีมาก",
  };

  res = await fetch(`${BASE_URL}/api/survey`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testSurveyPayload),
  });
  assert(res.status === 201, "POST /api/survey returns 201 Created during event window");
  const createdSurvey = await res.json();
  assert(Boolean(createdSurvey.survey?.id), "Survey record created with valid ID");

  // Verify in MySQL Database directly
  const dbRecord = await prisma.publicSurvey.findUnique({
    where: { id: createdSurvey.survey.id },
  });
  assert(dbRecord !== null, "Record found in MySQL database");

  // Clean up test survey record
  await prisma.publicSurvey.delete({ where: { id: createdSurvey.survey.id } });
  console.log(`   Cleaned up test survey record ID: ${createdSurvey.survey.id}`);
  console.log("");

  // -------------------------------------------------------------
  // TEST 5: Survey Timing - SCENARIO C (After 1 Week: Ended & Never Pop Up)
  // -------------------------------------------------------------
  console.log("--- TEST 5: Survey Timing - SCENARIO C: After 1 Week (> Nov 6: Closed & Never Pop Up) ---");
  // Set surveyEndDate to a past date to simulate 1 week post-event
  await prisma.landingConfig.upsert({
    where: { key: "surveyEndDate" },
    update: { value: "2026-10-15T23:59:59+07:00" },
    create: { key: "surveyEndDate", value: "2026-10-15T23:59:59+07:00" },
  });

  res = await fetch(`${BASE_URL}/api/survey/config`);
  surveyConfig = await res.json();
  console.log(`   Simulated Post-Event Status: ${surveyConfig.status}, isOpen: ${surveyConfig.isOpen}`);
  assert(surveyConfig.status === "ended", "Status strictly becomes 'ended' after 1 week post-event");
  assert(surveyConfig.isOpen === false, "isOpen strictly false (Modal will NEVER pop up again)");

  // Attempt to submit after deadline -> MUST BE REJECTED (403)
  res = await fetch(`${BASE_URL}/api/survey`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "นักเรียน", province: "ร้อยเอ็ด" }),
  });
  assert(res.status === 403, "POST /api/survey returns 403 Forbidden after 1 week post-event");
  errBody = await res.json();
  assert(
    errBody.error && errBody.error.includes("ปิดรับคำตอบแล้ว"),
    `Rejection message is correct: "${errBody.error}"`
  );

  // Restore real dates: Oct 30, 2026 to Nov 6, 2026
  await prisma.landingConfig.upsert({
    where: { key: "surveyStartDate" },
    update: { value: "2026-10-30T00:00:00+07:00" },
    create: { key: "surveyStartDate", value: "2026-10-30T00:00:00+07:00" },
  });
  await prisma.landingConfig.upsert({
    where: { key: "surveyEndDate" },
    update: { value: "2026-11-06T23:59:59+07:00" },
    create: { key: "surveyEndDate", value: "2026-11-06T23:59:59+07:00" },
  });
  console.log("   Restored survey dates to: 2026-10-30 to 2026-11-06 (UTC+7)");
  console.log("");

  // -------------------------------------------------------------
  // TEST 6: Admin Routing & Health Checks
  // -------------------------------------------------------------
  console.log("--- TEST 6: Admin Pages & Route Accessibility ---");
  const adminPages = [
    "/_km/dashboard",
    "/_km/landing-banner",
    "/_km/landing-settings",
    "/_km/landing-schedule",
    "/_km/landing-booth",
    "/_km/survey-settings",
    "/survey",
    "/survey-report",
  ];

  for (const page of adminPages) {
    res = await fetch(`${BASE_URL}${page}`);
    assert(res.status === 200, `Page ${page} responds with 200 OK`);
  }
  console.log("");

  // -------------------------------------------------------------
  // TEST 7: Superadmin Account & Password Verification
  // -------------------------------------------------------------
  console.log("--- TEST 7: Superadmin Account Verification ---");
  const bcrypt = require("bcrypt");
  const superadmin = await prisma.admins.findFirst({
    where: { username: "superadmin" },
  });
  assert(superadmin !== null, "User 'superadmin' exists in database");
  assert(Boolean(superadmin.password_hash), "superadmin password_hash exists");
  const passwordMatch = await bcrypt.compare("KMUTT@Admin2026!", superadmin.password_hash);
  assert(passwordMatch === true, "Password 'KMUTT@Admin2026!' verified with bcrypt hash");
  console.log(`   Admin ID: ${superadmin.id}, Username: ${superadmin.username}, Email: ${superadmin.email}`);
  console.log("");

  // Final check: survey status matches actual date window
  res = await fetch(`${BASE_URL}/api/survey/config`);
  surveyConfig = await res.json();
  const now = new Date();
  const start = new Date(surveyConfig.startDate);
  const end = new Date(surveyConfig.endDate);
  const expectedStatus = now < start ? "not_started" : (now > end ? "ended" : "open");
  assert(surveyConfig.status === expectedStatus, `Final check: Status is '${expectedStatus}' as expected for current date`);
  assert(surveyConfig.isOpen === (expectedStatus === "open"), `Final check: isOpen is ${expectedStatus === "open"}`);

  console.log("=================================================================");
  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! (100% VERIFIED)");
  console.log("=================================================================");
  await prisma.$disconnect();
}

runTests().catch((err) => {
  console.error("Test Suite Execution Failed:", err);
  process.exit(1);
});
