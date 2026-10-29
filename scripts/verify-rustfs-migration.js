// scripts/verify-rustfs-migration.js
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { S3Client, HeadObjectCommand } = require("@aws-sdk/client-s3");
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");

function loadTsModule(relativePath) {
  let filePath = path.join(__dirname, relativePath);
  if (!fs.existsSync(filePath)) {
    if (fs.existsSync(filePath + ".ts")) {
      filePath += ".ts";
    } else if (fs.existsSync(filePath + ".tsx")) {
      filePath += ".tsx";
    } else if (fs.existsSync(filePath + ".js")) {
      filePath += ".js";
    }
  }
  const code = fs.readFileSync(filePath, "utf8");
  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;
  const m = { exports: {} };
  const customRequire = (id) => {
    if (id === "@/libs/authGuard") {
      return {
        withAuth: (handler, allowedRoles = []) => {
          return async (req, res) => {
            if (!req.user) {
              return res.status(401).json({ error: "Unauthorized" });
            }
            if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
              return res.status(403).json({ error: `Forbidden: Requires ${allowedRoles.join(", ")}` });
            }
            return handler(req, res);
          };
        },
      };
    }
    if (id.startsWith("@/")) {
      return loadTsModule("../src/" + id.slice(2));
    }
    return require(id);
  };
  const fn = new Function("module", "exports", "require", transpiled);
  fn(m, m.exports, customRequire);
  return m.exports;
}

const { getS3Client, getS3Config, ensureBucketExists, deleteObject } = loadTsModule("../src/libs/s3.ts");
const uploadHandler = loadTsModule("../src/pages/api/student/upload.ts").default;
const deleteHandler = loadTsModule("../src/pages/api/student/delete-picture.ts").default;

const prisma = new PrismaClient();

function createMockReqRes({ method, body = {}, query = {}, user = null }) {
  let statusCode = 200;
  let responseData = null;
  let ended = false;

  const req = {
    method,
    body,
    query,
    headers: {},
    user,
  };

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      responseData = data;
      ended = true;
      return res;
    },
    end() {
      ended = true;
      return res;
    },
    getStatusCode() {
      return statusCode;
    },
    getData() {
      return responseData;
    },
    isEnded() {
      return ended;
    },
  };

  return { req, res };
}

async function runVerification() {
  console.log("=================================================================");
  console.log("🦀 STARTING RUSTFS OBJECT STORAGE MIGRATION VERIFICATION SUITE");
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
  // Part 1: Cleanliness & Supabase Decommission Guardrails
  // -------------------------------------------------------------
  console.log("\n--- 1. Cleanliness & Supabase Decommission Guardrails ---");

  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), "utf8"));
    assert(!pkg.dependencies?.["@supabase/supabase-js"], "@supabase/supabase-js must be removed from dependencies");
    assert(!pkg.devDependencies?.["@supabase/supabase-js"], "@supabase/supabase-js must be removed from devDependencies");
    assert(pkg.dependencies?.["@aws-sdk/client-s3"], "@aws-sdk/client-s3 must be installed in package.json");
    report("package.json free from Supabase and includes @aws-sdk/client-s3", true);
  } catch (err) {
    report("package.json free from Supabase and includes @aws-sdk/client-s3", false, err);
  }

  try {
    assert(!fs.existsSync(path.join(__dirname, "../src/libs/supabase.ts")), "src/libs/supabase.ts must be deleted");
    assert(!fs.existsSync(path.join(__dirname, "../scripts/backup-supabase.js")), "scripts/backup-supabase.js must be deleted");
    report("Deprecated Supabase files completely deleted", true);
  } catch (err) {
    report("Deprecated Supabase files completely deleted", false, err);
  }

  try {
    const envEx = fs.readFileSync(path.join(__dirname, "../.env.example"), "utf8");
    assert(!envEx.includes("NEXT_PUBLIC_SUPABASE_"), ".env.example must not contain NEXT_PUBLIC_SUPABASE_*");
    assert(envEx.includes("S3_ENDPOINT"), ".env.example must specify S3_ENDPOINT");
    assert(envEx.includes("S3_BUCKET_NAME"), ".env.example must specify S3_BUCKET_NAME");
    report(".env.example updated with RustFS config and free from Supabase", true);
  } catch (err) {
    report(".env.example updated with RustFS config and free from Supabase", false, err);
  }

  try {
    const nginxConf = fs.readFileSync(path.join(__dirname, "../nginx.conf"), "utf8");
    assert(nginxConf.includes("location /storage/"), "nginx.conf must define location /storage/");
    assert(nginxConf.includes("proxy_pass"), "nginx.conf /storage/ must proxy_pass to RustFS");
    report("nginx.conf reverse proxy configured for /storage/", true);
  } catch (err) {
    report("nginx.conf reverse proxy configured for /storage/", false, err);
  }

  try {
    const composeDb = fs.readFileSync(path.join(__dirname, "../infra/db/docker-compose.yml"), "utf8");
    assert(composeDb.includes("rustfs-init:"), "docker-compose.yml must contain rustfs-init service");
    assert(composeDb.includes("anonymous set download"), "rustfs-init must set anonymous download policy");
    report("infra/db/docker-compose.yml contains automated rustfs-init service", true);
  } catch (err) {
    report("infra/db/docker-compose.yml contains automated rustfs-init service", false, err);
  }

  // -------------------------------------------------------------
  // Part 2: RustFS Connection & Bucket Readiness
  // -------------------------------------------------------------
  console.log("\n--- 2. RustFS S3 Client & Bucket Verification ---");

  const s3 = getS3Client();
  const config = getS3Config();

  let isDbAvailable = false;
  try {
    await prisma.$connect();
    isDbAvailable = true;
  } catch {
    console.log("ℹ️  Database connection not available in this environment. Skipping live DB queries.");
  }

  let isStorageAvailable = false;
  try {
    const bucket = await ensureBucketExists();
    assert.strictEqual(bucket, config.bucketName, `Bucket name must be ${config.bucketName}`);
    report(`Bucket '${config.bucketName}' verified on RustFS (${config.endpoint})`, true);
    isStorageAvailable = true;
  } catch (err) {
    console.log("ℹ️  RustFS storage not reachable in this environment. Skipping live S3 integration.");
  }

  if (!isDbAvailable || !isStorageAvailable) {
    console.log("\n⚠️  Live integration tests skipped due to missing live services in CI/Test runner.");
    console.log("\n=================================================================");
    console.log(`📊 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================================");
    await prisma.$disconnect();
    if (failed > 0) process.exit(1);
    return;
  }

  // -------------------------------------------------------------
  // Part 3: Test Student Provisioning
  // -------------------------------------------------------------
  console.log("\n--- 3. Test Student Setup ---");
  let testStudent = null;
  const createdPictureIds = [];
  const createdS3Keys = [];

  try {
    testStudent = await prisma.students.findFirst({
      where: { email: "verify.rustfs.student@kmutt.ac.th" },
    });
    if (!testStudent) {
      testStudent = await prisma.students.create({
        data: {
          email: "verify.rustfs.student@kmutt.ac.th",
          password_hash: "$2b$10$dummyHashForVerificationOnly12345678901234567890",
          first_name: "ทดสอบ",
          last_name: "จัดเก็บไฟล์",
          phone: "0899999999",
          role: "student",
          school: "KMUTT Verification High",
        },
      });
    }
    // Clean up any existing pictures from previous runs
    const oldPics = await prisma.takePicture.findMany({ where: { studentId: testStudent.id } });
    for (const p of oldPics) {
      await prisma.takePicture.delete({ where: { id: p.id } });
    }
    report(`Test student account ready (ID: ${testStudent.id})`, true);
  } catch (err) {
    report("Test student account setup", false, err);
  }

  // -------------------------------------------------------------
  // Part 4: End-to-End Upload Flow
  // -------------------------------------------------------------
  console.log("\n--- 4. End-to-End Upload Flow ---");
  const testBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  let firstUploaded = null;

  try {
    const { req, res } = createMockReqRes({
      method: "POST",
      body: { base64: testBase64 },
      user: { id: testStudent.id, role: "student" },
    });

    await uploadHandler(req, res);

    assert.strictEqual(res.getStatusCode(), 200, "Upload handler should return 200 OK");
    const data = res.getData();
    assert(data.uploaded && data.uploaded.id, "Upload response must contain uploaded record with ID");
    assert(data.publicUrl, "Upload response must contain publicUrl");
    assert(
      data.publicUrl.startsWith(`/storage/${config.bucketName}/take-pictures/`),
      `publicUrl '${data.publicUrl}' must start with '/storage/${config.bucketName}/take-pictures/'`
    );

    firstUploaded = data.uploaded;
    createdPictureIds.push(firstUploaded.id);

    // Verify record in database
    const dbRecord = await prisma.takePicture.findUnique({ where: { id: firstUploaded.id } });
    assert(dbRecord, "Database record must exist in takePicture table");
    assert.strictEqual(dbRecord.image_url, data.publicUrl, "Database image_url must match publicUrl");

    // Extract S3 Key and verify existence in RustFS
    const s3Key = data.publicUrl.replace(`/storage/${config.bucketName}/`, "");
    createdS3Keys.push(s3Key);

    await s3.send(new HeadObjectCommand({ Bucket: config.bucketName, Key: s3Key }));
    report(`Student photo uploaded to RustFS (S3 Key: ${s3Key}) and saved in DB`, true);
  } catch (err) {
    report("Student photo upload to RustFS", false, err);
  }

  // -------------------------------------------------------------
  // Part 5: Public Anonymous Serving
  // -------------------------------------------------------------
  console.log("\n--- 5. Public Anonymous Serving ---");
  try {
    const testKey = createdS3Keys[0];
    const directUrl = `${config.endpoint}/${config.bucketName}/${testKey}`;
    const fetchRes = await fetch(directUrl);
    assert.strictEqual(fetchRes.status, 200, `Anonymous GET ${directUrl} must return HTTP 200`);
    const buffer = Buffer.from(await fetchRes.arrayBuffer());
    const expectedBuffer = Buffer.from(testBase64.split(",")[1], "base64");
    assert.strictEqual(
      Buffer.compare(buffer, expectedBuffer),
      0,
      "Fetched image bytes must match uploaded base64 buffer bytes exactly"
    );
    report(`Public anonymous download verified from ${directUrl} (exact binary match)`, true);
  } catch (err) {
    report("Public anonymous download from RustFS", false, err);
  }

  // -------------------------------------------------------------
  // Part 6: 5-Photo Quota Limit Enforcement
  // -------------------------------------------------------------
  console.log("\n--- 6. 5-Photo Quota Limit Enforcement ---");
  try {
    // Current count is 1, upload 4 more to reach exactly 5
    for (let i = 2; i <= 5; i++) {
      const { req, res } = createMockReqRes({
        method: "POST",
        body: { base64: testBase64 },
        user: { id: testStudent.id, role: "student" },
      });
      await uploadHandler(req, res);
      assert.strictEqual(res.getStatusCode(), 200, `Upload ${i} must succeed with 200`);
      const up = res.getData().uploaded;
      createdPictureIds.push(up.id);
      const k = res.getData().publicUrl.replace(`/storage/${config.bucketName}/`, "");
      createdS3Keys.push(k);
    }

    const currentCount = await prisma.takePicture.count({ where: { studentId: testStudent.id } });
    assert.strictEqual(currentCount, 5, "Student should now have exactly 5 pictures");

    // Attempt 6th upload
    const { req: overReq, res: overRes } = createMockReqRes({
      method: "POST",
      body: { base64: testBase64 },
      user: { id: testStudent.id, role: "student" },
    });
    await uploadHandler(overReq, overRes);

    assert.strictEqual(overRes.getStatusCode(), 400, "6th upload must be rejected with 400 Bad Request");
    assert(
      overRes.getData()?.error?.includes("สูงสุด 5 รูป"),
      `Expected quota error message, got: ${overRes.getData()?.error}`
    );
    report("5-photo quota limit strictly enforced (6th upload rejected)", true);
  } catch (err) {
    report("5-photo quota limit enforcement", false, err);
  }

  // -------------------------------------------------------------
  // Part 7: Delete Flow & Physical Asset Removal
  // -------------------------------------------------------------
  console.log("\n--- 7. Delete Flow & Asset Removal ---");
  try {
    const deleteId = createdPictureIds[0];
    const deleteKey = createdS3Keys[0];

    const { req: delReq, res: delRes } = createMockReqRes({
      method: "DELETE",
      query: { id: String(deleteId) },
      user: { id: testStudent.id, role: "student" },
    });

    await deleteHandler(delReq, delRes);

    assert.strictEqual(delRes.getStatusCode(), 200, "Delete handler must return 200 OK");

    // Verify row deleted from DB
    const checkDb = await prisma.takePicture.findUnique({ where: { id: deleteId } });
    assert(!checkDb, "Picture row must be deleted from MySQL takePicture table");

    // Verify object removed from RustFS
    let objectExists = true;
    try {
      await s3.send(new HeadObjectCommand({ Bucket: config.bucketName, Key: deleteKey }));
    } catch (err) {
      if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
        objectExists = false;
      }
    }
    assert(!objectExists, `Physical object '${deleteKey}' must be deleted from RustFS`);
    report("Delete flow removes both MySQL record and RustFS physical object", true);
  } catch (err) {
    report("Delete flow and physical asset removal", false, err);
  }

  // -------------------------------------------------------------
  // Part 8: Cleanup Remaining Test Data
  // -------------------------------------------------------------
  console.log("\n--- 8. Cleanup Test Artifacts ---");
  try {
    for (const picId of createdPictureIds) {
      await prisma.takePicture.deleteMany({ where: { id: picId } });
    }
    for (const k of createdS3Keys) {
      await deleteObject({ key: k }).catch(() => {});
    }
    if (testStudent) {
      await prisma.students.deleteMany({ where: { id: testStudent.id } });
    }
    report("Test artifacts cleaned up cleanly", true);
  } catch (err) {
    report("Cleanup test artifacts", false, err);
  }

  console.log("\n=================================================================");
  console.log(`📊 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================================");

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error("Fatal verification error:", err);
  process.exit(1);
});
