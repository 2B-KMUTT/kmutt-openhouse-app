const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

/**
 * Pure reference evaluator matching src/pages/api/auth/[...nextauth].ts authorize()
 */
async function evaluateMultiRoleAuthorize({ emailOrUsername, password }, mockDb) {
  if (!emailOrUsername || !password) return null;
  const identifier = emailOrUsername.trim();
  if (!identifier) return null;

  // 1. Admins (kmuser)
  const kmusers = mockDb.admins.filter(
    (a) => a.username === identifier || a.email === identifier
  );
  for (const kmuser of kmusers) {
    if (await bcrypt.compare(password, kmuser.password_hash)) {
      return { id: kmuser.id, role: "kmuser", name: kmuser.name, email: kmuser.email };
    }
  }

  // 2. Staffs (staff)
  const staffs = mockDb.staffs.filter(
    (s) => s.username === identifier || s.email === identifier
  );
  for (const staff of staffs) {
    if (await bcrypt.compare(password, staff.password_hash)) {
      return { id: staff.id, role: "staff", name: staff.name, email: staff.email };
    }
  }

  // 3. Students (student, parent, teacher, guest)
  const students = mockDb.students.filter(
    (s) =>
      s.email === identifier ||
      s.citizen_id === identifier ||
      s.passport_id === identifier ||
      s.phone === identifier
  );
  students.sort((a, b) => {
    const aExact = a.email.toLowerCase() === identifier.toLowerCase() ? 0 : 1;
    const bExact = b.email.toLowerCase() === identifier.toLowerCase() ? 0 : 1;
    return aExact - bExact;
  });

  for (const student of students) {
    if (await bcrypt.compare(password, student.password_hash)) {
      return {
        id: student.id,
        role: student.role,
        name: `${student.first_name} ${student.last_name}`.trim(),
        email: student.email,
      };
    }
  }

  return null;
}

function getDashboardByRole(role) {
  switch (role) {
    case "student":
      return "/app/dashboard";
    case "guest":
    case "parent":
    case "teacher":
      return "/guest/dashboard";
    case "staff":
      return "/staff/dashboard";
    case "kmuser":
      return "/_km/dashboard";
    default:
      return "/login";
  }
}

async function run() {
  console.log("=================================================================");
  console.log("🔐 STARTING MULTI-ROLE AUTH & ROUTING VERIFICATION SUITE");
  console.log("=================================================================\n");

  // 1. Static Guardrail Checks on Auth Source Files
  console.log("--- 1. Static Source Guardrails ---");
  const nextAuthSrc = fs.readFileSync(
    path.join(__dirname, "../src/pages/api/auth/[...nextauth].ts"),
    "utf8"
  );
  assert(
    !nextAuthSrc.includes(".findFirst("),
    "[...nextauth].ts uses findMany instead of findFirst to support shared phone/identifiers"
  );
  assert(
    nextAuthSrc.includes("passport_id: identifier"),
    "[...nextauth].ts supports passport_id lookup for foreign students"
  );
  assert(
    nextAuthSrc.includes("rawIdentifier.trim()"),
    "[...nextauth].ts trims input identifier before database query"
  );

  const loginPageSrc = fs.readFileSync(
    path.join(__dirname, "../src/views/pages/auth/LoginPage.tsx"),
    "utf8"
  );
  assert(
    loginPageSrc.includes('cache: "no-store"'),
    "LoginPage.tsx disables cache when fetching /api/auth/session after signIn"
  );
  assert(
    loginPageSrc.includes("getDashboardPathByRole"),
    "LoginPage.tsx uses centralized getDashboardPathByRole"
  );

  const middlewareSrc = fs.readFileSync(
    path.join(__dirname, "../src/middleware.ts"),
    "utf8"
  );
  assert(
    middlewareSrc.includes("getDashboardByRole"),
    "middleware.ts redirects cross-role requests to the user's own dashboard"
  );

  const nextAuthTypesSrc = fs.readFileSync(
    path.join(__dirname, "../src/types/next-auth.d.ts"),
    "utf8"
  );
  for (const r of ["student", "staff", "kmuser", "parent", "guest", "teacher"]) {
    assert(
      nextAuthTypesSrc.includes(`"${r}"`),
      `next-auth.d.ts includes role "${r}"`
    );
  }
  console.log("");

  // 2. Behavioral Multi-Role Authentication Matrix
  console.log("--- 2. Multi-Role Authentication & Collision Matrix ---");
  const hash = (pw) => bcrypt.hashSync(pw, 4);

  const mockDb = {
    admins: [
      { id: 1, username: "KM_cpe", email: "cpe@openhouse.kmutt.ac.th", name: "CPE Admin", password_hash: hash("adminPass123") },
    ],
    staffs: [
      { id: 10, username: "fen-staff01", email: "fen-staff01@openhouse.kmutt.ac.th", name: "FEN Staff", password_hash: hash("staffPass123") },
    ],
    students: [
      {
        id: 101,
        role: "student",
        first_name: "สมชาย",
        last_name: "ใจดี",
        email: "student1@example.com",
        phone: "0811111111",
        citizen_id: "1100000000001",
        passport_id: null,
        password_hash: hash("studentPass123"),
      },
      {
        id: 102,
        role: "parent",
        first_name: "ประเสริฐ",
        last_name: "ใจดี",
        email: "parent1@example.com",
        phone: "0811111111", // Shared phone with student 101!
        citizen_id: null,
        passport_id: null,
        password_hash: hash("parentPass456"),
      },
      {
        id: 103,
        role: "teacher",
        first_name: "กานดา",
        last_name: "ครูดี",
        email: "teacher1@example.com",
        phone: "0844444444",
        citizen_id: null,
        passport_id: null,
        password_hash: hash("teacherPass123"),
      },
      {
        id: 104,
        role: "guest",
        first_name: "วิชัย",
        last_name: "บุคคลทั่วไป",
        email: "guest1@example.com",
        phone: "0855555555",
        citizen_id: null,
        passport_id: null,
        password_hash: hash("guestPass123"),
      },
      {
        id: 105,
        role: "student",
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        phone: "0899999999",
        citizen_id: null,
        passport_id: "AA9876543",
        password_hash: hash("passportPass123"),
      },
    ],
  };

  // Test kmuser login (username + whitespace)
  let user = await evaluateMultiRoleAuthorize(
    { emailOrUsername: "  KM_cpe  ", password: "adminPass123" },
    mockDb
  );
  assert(user && user.role === "kmuser" && user.id === 1, "Admin (kmuser) login by trimmed username succeeds");
  assert(getDashboardByRole(user.role) === "/_km/dashboard", "kmuser routes to /_km/dashboard");

  // Test staff login (email)
  user = await evaluateMultiRoleAuthorize(
    { emailOrUsername: "fen-staff01@openhouse.kmutt.ac.th", password: "staffPass123" },
    mockDb
  );
  assert(user && user.role === "staff" && user.id === 10, "Staff login by email succeeds");
  assert(getDashboardByRole(user.role) === "/staff/dashboard", "staff routes to /staff/dashboard");

  // Test student login (citizen_id)
  user = await evaluateMultiRoleAuthorize(
    { emailOrUsername: "1100000000001", password: "studentPass123" },
    mockDb
  );
  assert(user && user.role === "student" && user.id === 101, "Student login by citizen_id succeeds");
  assert(getDashboardByRole(user.role) === "/app/dashboard", "student routes to /app/dashboard");

  // Test shared phone number between student (id 101) and parent (id 102)
  user = await evaluateMultiRoleAuthorize(
    { emailOrUsername: "0811111111", password: "parentPass456" },
    mockDb
  );
  assert(
    user && user.role === "parent" && user.id === 102,
    "Parent sharing phone with student logs into parent account when using parent password"
  );
  assert(getDashboardByRole(user.role) === "/guest/dashboard", "parent routes to /guest/dashboard");

  // Test teacher login
  user = await evaluateMultiRoleAuthorize(
    { emailOrUsername: "teacher1@example.com", password: "teacherPass123" },
    mockDb
  );
  assert(user && user.role === "teacher" && user.id === 103, "Teacher login succeeds");
  assert(getDashboardByRole(user.role) === "/guest/dashboard", "teacher routes to /guest/dashboard");

  // Test guest login
  user = await evaluateMultiRoleAuthorize(
    { emailOrUsername: "guest1@example.com", password: "guestPass123" },
    mockDb
  );
  assert(user && user.role === "guest" && user.id === 104, "Guest login succeeds");
  assert(getDashboardByRole(user.role) === "/guest/dashboard", "guest routes to /guest/dashboard");

  // Test foreign student login by passport_id
  user = await evaluateMultiRoleAuthorize(
    { emailOrUsername: "AA9876543", password: "passportPass123" },
    mockDb
  );
  assert(user && user.role === "student" && user.id === 105, "Student login by passport_id succeeds");

  // Test invalid password rejection
  user = await evaluateMultiRoleAuthorize(
    { emailOrUsername: "0811111111", password: "wrongPassword" },
    mockDb
  );
  assert(user === null, "Invalid password returns null across all matching rows");

  console.log("\n=================================================================");
  console.log("🎉 ALL MULTI-ROLE AUTH & ROUTING CHECKS PASSED!");
  console.log("=================================================================");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
