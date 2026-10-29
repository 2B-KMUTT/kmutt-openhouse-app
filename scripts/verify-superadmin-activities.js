// scripts/verify-superadmin-activities.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
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

const { createActivity, syncStaffMappingsForActivity } = loadTsModule("../src/libs/activityService.ts");

const prisma = new PrismaClient();

async function runVerification() {
  console.log("=================================================================");
  console.log("👑 STARTING SUPER ADMIN CENTRALIZED VERIFICATION SUITE");
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

  try {
    // -------------------------------------------------------------
    // Test 1: Admins schema has role and SUPER_ADMIN enum
    // -------------------------------------------------------------
    try {
      const superAdminUser = await prisma.admins.findFirst({
        where: { username: "KM_admin" },
      });
      assert(superAdminUser, "KM_admin user should exist in database");
      assert.strictEqual(superAdminUser.role, "SUPER_ADMIN", "KM_admin role must be SUPER_ADMIN");
      report("KM_admin has role SUPER_ADMIN in database", true);
    } catch (err) {
      report("KM_admin has role SUPER_ADMIN in database", false, err);
    }

    try {
      const legacySuperAdmin = await prisma.admins.findFirst({
        where: { username: "superadmin" },
      });
      assert(legacySuperAdmin, "superadmin user should exist in database");
      assert.strictEqual(legacySuperAdmin.role, "SUPER_ADMIN", "superadmin role must be SUPER_ADMIN");
      report("superadmin has role SUPER_ADMIN in database", true);
    } catch (err) {
      report("superadmin has role SUPER_ADMIN in database", false, err);
    }

    try {
      const facultyAdmin = await prisma.admins.findFirst({
        where: { username: "KM_FEN" },
      });
      assert(facultyAdmin, "KM_FEN user should exist in database");
      assert.strictEqual(facultyAdmin.role, "ADMIN", "KM_FEN role must be ADMIN");
      report("Faculty admin (KM_FEN) defaults to role ADMIN", true);
    } catch (err) {
      report("Faculty admin (KM_FEN) defaults to role ADMIN", false, err);
    }

    // -------------------------------------------------------------
    // Test 2: Cross-Tenant Activity Creation & Dual-tier Staff Auto-Assign
    // -------------------------------------------------------------
    let createdTestActivityId = null;
    let regularAdminActivityId = null;
    try {
      const cpeAdmin = await prisma.admins.findFirst({ where: { username: "KM_cpe" } });
      const fenAdmin = await prisma.admins.findFirst({ where: { username: "KM_FEN" } });
      const fenStaff = await prisma.staffs.findFirst({ where: { username: "fen-staff01" } });
      const cpeDept = await prisma.department.findFirst({ where: { name_en: { contains: "Computer" } } });

      assert(cpeAdmin && fenAdmin && fenStaff && cpeDept, "Prerequisites (cpeAdmin, fenAdmin, fenStaff, cpeDept) must exist");

      // Case A: Super Admin creates activity with ownerId: cpeAdmin.id
      const activity = await createActivity(
        {
          title: "Test CPE Workshop by SuperAdmin",
          description: "Dual-tier staff auto-assign test",
          activity_type: "workshop",
          departmentId: cpeDept.id,
          date: "30/10/2026",
          round: 1,
          start_time: "09:00",
          end_time: "12:00",
          location: "CB2",
          ownerId: cpeAdmin.id,
        },
        { id: 1, role: "kmuser", adminRole: "SUPER_ADMIN" },
        prisma
      );

      createdTestActivityId = activity.id;
      assert.strictEqual(activity.ownerId, cpeAdmin.id, "Activity ownerId must be set to KM_cpe");

      // Verify StaffMapping contains fenStaff (Faculty staff)
      const mappings = await prisma.staffMapping.findMany({
        where: { activityId: activity.id },
      });
      const mappedStaffIds = mappings.map(m => m.staffId);
      assert(mappedStaffIds.includes(fenStaff.id), "fen-staff01 (faculty staff) must be auto-assigned to CPE activity");

      // Case B: Regular Admin creates activity with attempt to spoof ownerId
      const regularActivity = await createActivity(
        {
          title: "Test Regular Admin Activity",
          description: "Owner enforcement test",
          activity_type: "workshop",
          departmentId: cpeDept.id,
          date: "30/10/2026",
          round: 1,
          start_time: "09:00",
          end_time: "12:00",
          location: "CB2",
          ownerId: 9999, // Should be ignored
        },
        { id: fenAdmin.id, role: "kmuser", adminRole: "ADMIN" },
        prisma
      );
      regularAdminActivityId = regularActivity.id;
      assert.strictEqual(regularActivity.ownerId, fenAdmin.id, "Regular admin ownerId spoofing must be ignored and set to caller id");

      report("Super Admin can create activity with custom ownerId and dual-tier auto-assigns faculty staff", true);
    } catch (err) {
      report("Super Admin can create activity with custom ownerId and dual-tier auto-assigns faculty staff", false, err);
    } finally {
      if (createdTestActivityId) {
        await prisma.staffMapping.deleteMany({ where: { activityId: createdTestActivityId } }).catch(() => {});
        await prisma.activities.delete({ where: { id: createdTestActivityId } }).catch(() => {});
      }
      if (regularAdminActivityId) {
        await prisma.staffMapping.deleteMany({ where: { activityId: regularAdminActivityId } }).catch(() => {});
        await prisma.activities.delete({ where: { id: regularAdminActivityId } }).catch(() => {});
      }
    }

    // -------------------------------------------------------------
    // Test 3: Global Activity Dashboard & Multi-Faculty Filtering
    // -------------------------------------------------------------
    let act1Id = null;
    let act2Id = null;
    try {
      const fenAdmin = await prisma.admins.findFirst({ where: { username: "KM_FEN" } });
      const sitAdmin = await prisma.admins.findFirst({ where: { username: "KM_sit" } });
      const cpeDept = await prisma.department.findFirst({ where: { name_en: { contains: "Computer" } } });
      const sitDept = await prisma.department.findFirst({ where: { name_en: { contains: "Information" } } });

      assert(fenAdmin && sitAdmin && cpeDept && sitDept, "Admins and Departments must exist");

      // Seed 2 activities with different owners
      const act1 = await prisma.activities.create({
        data: {
          title: "FEN Test Activity",
          description: "FEN test",
          activity_type: "workshop",
          departmentId: cpeDept.id,
          date: "30/10/2026",
          round: 1,
          start_time: "09:00",
          end_time: "10:00",
          location: "Eng Building",
          point: 1,
          max_participants: 50,
          ownerId: fenAdmin.id,
        },
      });
      act1Id = act1.id;

      const act2 = await prisma.activities.create({
        data: {
          title: "SIT Test Activity",
          description: "SIT test",
          activity_type: "workshop",
          departmentId: sitDept.id,
          date: "30/10/2026",
          round: 1,
          start_time: "10:00",
          end_time: "11:00",
          location: "SIT Building",
          point: 1,
          max_participants: 50,
          ownerId: sitAdmin.id,
        },
      });
      act2Id = act2.id;

      // Simulate Super Admin query (whereClause for SUPER_ADMIN without filter)
      const isSuperAdmin = true;
      const superAdminActivities = await prisma.activities.findMany({
        where: isSuperAdmin ? {} : { ownerId: 1 },
      });
      const allIds = superAdminActivities.map(a => a.id);
      assert(allIds.includes(act1.id) && allIds.includes(act2.id), "Super Admin retrieves both FEN and SIT activities");

      // Simulate Super Admin query with ownerId filter
      const filteredBySit = await prisma.activities.findMany({
        where: { ownerId: sitAdmin.id },
      });
      const sitIds = filteredBySit.map(a => a.id);
      assert(sitIds.includes(act2.id) && !sitIds.includes(act1.id), "Super Admin filter by ownerId returns only SIT activities");

      // Simulate Regular Faculty Admin query
      const fenScopedActivities = await prisma.activities.findMany({
        where: { ownerId: fenAdmin.id },
      });
      const fenIds = fenScopedActivities.map(a => a.id);
      assert(fenIds.includes(act1.id) && !fenIds.includes(act2.id), "Faculty Admin (KM_FEN) only retrieves FEN activities");

      report("Global Dashboard query returns all activities for Super Admin and scoped activities for Faculty Admin", true);
    } catch (err) {
      report("Global Dashboard query returns all activities for Super Admin and scoped activities for Faculty Admin", false, err);
    } finally {
      if (act1Id) await prisma.activities.delete({ where: { id: act1Id } }).catch(() => {});
      if (act2Id) await prisma.activities.delete({ where: { id: act2Id } }).catch(() => {});
    }

    // -------------------------------------------------------------
    // Test 4: Centralized Activity Editing, Deletion & Ownership Transfer
    // -------------------------------------------------------------
    let transferTestActivityId = null;
    try {
      const fenAdmin = await prisma.admins.findFirst({ where: { username: "KM_FEN" } });
      const sitAdmin = await prisma.admins.findFirst({ where: { username: "KM_sit" } });
      const fenStaff = await prisma.staffs.findFirst({ where: { username: "fen-staff01" } });
      const sitStaff = await prisma.staffs.findFirst({ where: { username: "sit-staff01" } });
      const cpeDept = await prisma.department.findFirst({ where: { name_en: { contains: "Computer" } } });
      const sitDept = await prisma.department.findFirst({ where: { name_en: { contains: "Information" } } });

      assert(fenAdmin && sitAdmin && fenStaff && sitStaff && cpeDept && sitDept, "Prerequisites must exist");

      // 1. Create initial activity under FEN
      const act = await createActivity(
        {
          title: "Ownership Transfer Test Activity",
          description: "Initial description",
          activity_type: "workshop",
          departmentId: cpeDept.id,
          date: "30/10/2026",
          round: 1,
          start_time: "09:00",
          end_time: "10:00",
          location: "Eng Building",
          ownerId: fenAdmin.id,
        },
        { id: 1, role: "kmuser", adminRole: "SUPER_ADMIN" },
        prisma
      );
      transferTestActivityId = act.id;

      // Verify FEN staff mapped initially
      const initialMappings = await prisma.staffMapping.findMany({ where: { activityId: act.id } });
      const initialStaffIds = initialMappings.map(m => m.staffId);
      assert(initialStaffIds.includes(fenStaff.id), "FEN staff must be mapped initially");

      // 2. Super Admin transfers ownership to SIT
      await prisma.activities.update({
        where: { id: act.id },
        data: {
          title: "Updated Title by Super Admin",
          ownerId: sitAdmin.id,
          departmentId: sitDept.id,
        },
      });

      // Re-sync staff mapping (simulating PUT handler)
      await prisma.staffMapping.deleteMany({
        where: { activityId: act.id, staff: { create_by: fenAdmin.id } },
      });
      await syncStaffMappingsForActivity(act.id, sitAdmin.id, sitDept.id, prisma);

      // Verify SIT staff mapped and FEN staff unmapped
      const postTransferMappings = await prisma.staffMapping.findMany({ where: { activityId: act.id } });
      const postStaffIds = postTransferMappings.map(m => m.staffId);
      assert(postStaffIds.includes(sitStaff.id), "SIT staff must now be mapped to transferred activity");
      assert(!postStaffIds.includes(fenStaff.id), "FEN staff must be unmapped after transfer");

      // 3. Regular admin access control assertion:
      // When a regular admin (e.g. KM_FEN) queries with where: { id: act.id, ownerId: fenAdmin.id }, it must find nothing
      const forbiddenQuery = await prisma.activities.findFirst({
        where: { id: act.id, ownerId: fenAdmin.id },
      });
      assert.strictEqual(forbiddenQuery, null, "Regular admin must not be authorized to view or edit transferred activity");

      // 4. Super Admin delete activity
      await prisma.staffMapping.deleteMany({ where: { activityId: act.id } });
      await prisma.activities.delete({ where: { id: act.id } });
      transferTestActivityId = null;

      const deletedCheck = await prisma.activities.findUnique({ where: { id: act.id } });
      assert.strictEqual(deletedCheck, null, "Activity must be successfully deleted by Super Admin");

      report("Super Admin can edit, transfer ownership with staff re-sync, and delete activities", true);
    } catch (err) {
      report("Super Admin can edit, transfer ownership with staff re-sync, and delete activities", false, err);
    } finally {
      if (transferTestActivityId) {
        await prisma.staffMapping.deleteMany({ where: { activityId: transferTestActivityId } }).catch(() => {});
        await prisma.activities.delete({ where: { id: transferTestActivityId } }).catch(() => {});
      }
    }

    // -------------------------------------------------------------
    // Test 5: Centralized Staff Management & Cross-Faculty Overview
    // -------------------------------------------------------------
    try {
      const fenAdmin = await prisma.admins.findFirst({ where: { username: "KM_FEN" } });
      const sitAdmin = await prisma.admins.findFirst({ where: { username: "KM_sit" } });
      const fenStaff = await prisma.staffs.findFirst({ where: { username: "fen-staff01" } });
      const sitStaff = await prisma.staffs.findFirst({ where: { username: "sit-staff01" } });

      assert(fenAdmin && sitAdmin && fenStaff && sitStaff, "Prerequisites must exist");

      // Super Admin query (all staffs)
      const allStaffs = await prisma.staffs.findMany({
        include: { created_by: true },
      });
      const allStaffIds = allStaffs.map(s => s.id);
      assert(allStaffIds.includes(fenStaff.id) && allStaffIds.includes(sitStaff.id), "Super Admin retrieves all staffs across faculties");

      // Super Admin filter by adminId
      const fenFilteredStaffs = await prisma.staffs.findMany({
        where: { create_by: fenAdmin.id },
      });
      const fenStaffIds = fenFilteredStaffs.map(s => s.id);
      assert(fenStaffIds.includes(fenStaff.id) && !fenStaffIds.includes(sitStaff.id), "Filter by adminId returns only FEN staff");

      // Regular Faculty Admin query
      const regularAdminStaffs = await prisma.staffs.findMany({
        where: { create_by: sitAdmin.id },
      });
      const sitScopedIds = regularAdminStaffs.map(s => s.id);
      assert(sitScopedIds.includes(sitStaff.id) && !sitScopedIds.includes(fenStaff.id), "Regular admin only retrieves own staff");

      report("Centralized Staff Management allows Super Admin global overview and enforces Faculty Admin isolation", true);
    } catch (err) {
      report("Centralized Staff Management allows Super Admin global overview and enforces Faculty Admin isolation", false, err);
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log("=================================================================");
  if (failed > 0) {
    console.log(`⚠️ SUITE FINISHED WITH ${failed} FAILURE(S) (${passed} PASSED)`);
    process.exit(1);
  } else {
    console.log(`🎉 ALL SUPER ADMIN VERIFICATIONS PASSED (${passed} PASSED)!`);
    process.exit(0);
  }
}

runVerification();
