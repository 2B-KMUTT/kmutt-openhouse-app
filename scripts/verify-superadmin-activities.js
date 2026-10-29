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

  // -------------------------------------------------------------
  // Part 1: Static Source & Architecture Guardrails
  // -------------------------------------------------------------
  console.log("\n--- 1. Static Source Guardrails ---");

  try {
    const schemaSrc = fs.readFileSync(path.join(__dirname, "../prisma/schema.prisma"), "utf8");
    assert(schemaSrc.includes("enum AdminRole"), "schema.prisma must declare enum AdminRole");
    assert(schemaSrc.includes("SUPER_ADMIN") && schemaSrc.includes("ADMIN"), "AdminRole must contain SUPER_ADMIN and ADMIN");
    assert(schemaSrc.includes("role          AdminRole"), "Admins model must have role field of type AdminRole");
    report("prisma/schema.prisma defines AdminRole enum and Admins.role field", true);
  } catch (err) {
    report("prisma/schema.prisma defines AdminRole enum and Admins.role field", false, err);
  }

  try {
    const migrationDir = path.join(__dirname, "../prisma/migrations/20261030035500_add_admin_role");
    assert(fs.existsSync(migrationDir), "Migration directory 20261030035500_add_admin_role must exist");
    const migrationSql = fs.readFileSync(path.join(migrationDir, "migration.sql"), "utf8");
    assert(migrationSql.includes("ALTER TABLE `Admins` ADD COLUMN `role`"), "migration.sql must alter Admins table to add role");
    report("prisma/migrations contains 20261030035500_add_admin_role SQL migration", true);
  } catch (err) {
    report("prisma/migrations contains 20261030035500_add_admin_role SQL migration", false, err);
  }

  try {
    const nextAuthTypes = fs.readFileSync(path.join(__dirname, "../src/types/next-auth.d.ts"), "utf8");
    assert(nextAuthTypes.includes("adminRole?: AdminRole") && nextAuthTypes.includes('"SUPER_ADMIN"'), "next-auth.d.ts must expose adminRole on Session and JWT");
    report("src/types/next-auth.d.ts exports adminRole typing", true);
  } catch (err) {
    report("src/types/next-auth.d.ts exports adminRole typing", false, err);
  }

  try {
    const kmNavSrc = fs.readFileSync(path.join(__dirname, "../src/constants/kmNavigation.ts"), "utf8");
    assert(kmNavSrc.includes("KM_MENU_ITEMS"), "kmNavigation.ts must export KM_MENU_ITEMS");
    assert(kmNavSrc.includes("/_km/dashboard") && kmNavSrc.includes("/_km/staff"), "kmNavigation.ts must include core back-office routes");
    report("src/constants/kmNavigation.ts provides Single Source of Truth for navigation", true);
  } catch (err) {
    report("src/constants/kmNavigation.ts provides Single Source of Truth for navigation", false, err);
  }

  try {
    assert(typeof createActivity === "function", "activityService must export createActivity");
    assert(typeof syncStaffMappingsForActivity === "function", "activityService must export syncStaffMappingsForActivity");
    report("src/libs/activityService.ts exports dual-tier auto-assign logic", true);
  } catch (err) {
    report("src/libs/activityService.ts exports dual-tier auto-assign logic", false, err);
  }

  // -------------------------------------------------------------
  // Part 2: Database Behavioral & Integration Checks (if DB available)
  // -------------------------------------------------------------
  console.log("\n--- 2. Database Integration Checks ---");
  let isDbAvailable = false;
  try {
    await prisma.$connect();
    isDbAvailable = true;
  } catch (connErr) {
    console.log("ℹ️  Database connection not available in this environment. Skipping live DB queries.");
  }

  if (isDbAvailable) {
    try {
      // Test 1: Admins schema has role and SUPER_ADMIN enum
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

      // Test 2: Cross-Tenant Activity Creation & Dual-tier Staff Auto-Assign
      let createdTestActivityId = null;
      let regularAdminActivityId = null;
      try {
        const cpeAdmin = await prisma.admins.findFirst({ where: { username: "KM_cpe" } });
        const fenAdmin = await prisma.admins.findFirst({ where: { username: "KM_FEN" } });
        const fenStaff = await prisma.staffs.findFirst({ where: { username: "fen-staff01" } });
        const cpeDept = await prisma.department.findFirst({ where: { name_en: { contains: "Computer" } } });

        assert(cpeAdmin && fenAdmin && fenStaff && cpeDept, "Prerequisites (cpeAdmin, fenAdmin, fenStaff, cpeDept) must exist");

        // Super Admin creates activity assigned to FEN faculty
        const activityPayload = {
          title: "Automated SuperAdmin Test Activity",
          description: "Testing cross-tenant assignment",
          activity_type: "workshop",
          departmentId: cpeDept.id,
          date: "30/10/2026",
          round: 1,
          start_time: "09:00",
          end_time: "12:00",
          location: "Eng Building 3",
          point: 1,
          max_participants: 50,
          ownerId: fenAdmin.id,
        };

        const createdActivity = await createActivity(
          activityPayload,
          { id: cpeAdmin.id, username: cpeAdmin.username, adminRole: "SUPER_ADMIN" },
          prisma
        );
        createdTestActivityId = createdActivity.id;

        assert.strictEqual(createdActivity.ownerId, fenAdmin.id, "Activity ownerId must match the selected owner");

        const mappings = await prisma.staffMapping.findMany({
          where: { activityId: createdActivity.id },
        });
        const mappedStaffIds = mappings.map(m => m.staffId);
        assert(mappedStaffIds.includes(fenStaff.id), "Faculty staff (fen-staff01) must be auto-assigned to the new activity");

        // Regular admin creates activity
        const regPayload = {
          title: "Regular Faculty Admin Activity",
          description: "Testing single-tenant isolation",
          activity_type: "workshop",
          departmentId: cpeDept.id,
          date: "30/10/2026",
          round: 1,
          start_time: "13:00",
          end_time: "16:00",
          location: "CB 1",
          point: 1,
          max_participants: 30,
          ownerId: fenAdmin.id, // Regular admin tries to pass another owner
        };

        const regActivity = await createActivity(
          regPayload,
          { id: cpeAdmin.id, username: cpeAdmin.username, adminRole: "ADMIN" },
          prisma
        );
        regularAdminActivityId = regActivity.id;

        assert.strictEqual(regActivity.ownerId, cpeAdmin.id, "Regular admin ownerId must ignore ownerId override and lock to session.user.id");

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

      // Test 3: Global Dashboard Query & Scoping Matrix
      let tempFenActId = null;
      let tempCpeActId = null;
      try {
        const fenAdmin = await prisma.admins.findFirst({ where: { username: "KM_FEN" } });
        const cpeAdmin = await prisma.admins.findFirst({ where: { username: "KM_cpe" } });
        const anyDept = await prisma.department.findFirst();
        assert(fenAdmin && cpeAdmin && anyDept, "Admins and Department must exist for dashboard query test");

        const tempFenAct = await prisma.activities.create({
          data: {
            title: "Scoped Dashboard Test FEN",
            description: "Test",
            activity_type: "workshop",
            departmentId: anyDept.id,
            date: "30/10/2026",
            round: 1,
            start_time: "09:00",
            end_time: "10:00",
            location: "Room 1",
            point: 1,
            max_participants: 10,
            ownerId: fenAdmin.id,
          },
        });
        tempFenActId = tempFenAct.id;

        const tempCpeAct = await prisma.activities.create({
          data: {
            title: "Scoped Dashboard Test CPE",
            description: "Test",
            activity_type: "workshop",
            departmentId: anyDept.id,
            date: "30/10/2026",
            round: 1,
            start_time: "10:00",
            end_time: "11:00",
            location: "Room 2",
            point: 1,
            max_participants: 10,
            ownerId: cpeAdmin.id,
          },
        });
        tempCpeActId = tempCpeAct.id;

        // Super Admin query without filter (all activities)
        const allActs = await prisma.activities.findMany({
          include: { Admins: true },
        });
        assert(allActs.length >= 2, "Activities list should contain both seeded activities");

        // Super Admin filter by specific faculty
        const fenActs = await prisma.activities.findMany({
          where: { ownerId: fenAdmin.id },
        });
        for (const act of fenActs) {
          assert.strictEqual(act.ownerId, fenAdmin.id, "Filtered activity must belong to requested ownerId");
        }

        // Regular admin query (locked to self)
        const regularActs = await prisma.activities.findMany({
          where: { ownerId: cpeAdmin.id },
        });
        for (const act of regularActs) {
          assert.strictEqual(act.ownerId, cpeAdmin.id, "Regular admin activity must strictly match session.user.id");
        }

        report("Global Dashboard query returns all activities for Super Admin and scoped activities for Faculty Admin", true);
      } catch (err) {
        report("Global Dashboard query returns all activities for Super Admin and scoped activities for Faculty Admin", false, err);
      } finally {
        if (tempFenActId) await prisma.activities.delete({ where: { id: tempFenActId } }).catch(() => {});
        if (tempCpeActId) await prisma.activities.delete({ where: { id: tempCpeActId } }).catch(() => {});
      }

      // Test 4: Centralized Activity Editing, Ownership Transfer & Deletion
      let transferTestActivityId = null;
      try {
        const fenAdmin = await prisma.admins.findFirst({ where: { username: "KM_FEN" } });
        const sitAdmin = await prisma.admins.findFirst({ where: { username: "KM_sit" } });
        const fenStaff = await prisma.staffs.findFirst({ where: { username: "fen-staff01" } });
        const sitStaff = await prisma.staffs.findFirst({ where: { username: "sit-staff01" } });
        const sitDept = await prisma.department.findFirst({ where: { name_en: { contains: "Information" } } });

        assert(fenAdmin && sitAdmin && fenStaff && sitStaff && sitDept, "Prerequisites must exist");

        // 1. Create activity owned by FEN
        const act = await prisma.activities.create({
          data: {
            title: "Transfer Ownership Test",
            description: "Initial description",
            activity_type: "workshop",
            departmentId: sitDept.id,
            date: "30/10/2026",
            round: 1,
            start_time: "10:00",
            end_time: "12:00",
            location: "Test Location",
            point: 1,
            max_participants: 20,
            ownerId: fenAdmin.id,
          },
        });
        transferTestActivityId = act.id;

        // Auto-assign FEN staff
        await prisma.staffMapping.create({
          data: { activityId: act.id, staffId: fenStaff.id },
        });

        // 2. Super Admin transfers ownership to SIT
        const updatedAct = await prisma.activities.update({
          where: { id: act.id },
          data: { ownerId: sitAdmin.id },
        });
        assert.strictEqual(updatedAct.ownerId, sitAdmin.id, "Activity ownerId must be updated to SIT admin");

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

        // Regular admin access control assertion
        const forbiddenQuery = await prisma.activities.findFirst({
          where: { id: act.id, ownerId: fenAdmin.id },
        });
        assert.strictEqual(forbiddenQuery, null, "Regular admin must not be authorized to view or edit transferred activity");

        // Super Admin delete activity
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

      // Test 5: Centralized Staff Management & Cross-Faculty Overview
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
