const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("==========================================================");
  console.log("🚀 STARTING ADMIN PASSWORDS SYNC FROM admins.csv TO DATABASE");
  console.log("==========================================================");

  const csvPath = path.join(process.cwd(), "admins.csv");
  if (!fs.existsSync(csvPath)) {
    throw new Error(`File not found: ${csvPath}`);
  }

  const rawContent = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
  const lines = rawContent.trim().split("\n");

  const header = lines[0];
  console.log(`[CSV Header]: ${header}`);

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Match CSV fields format: "username","password","email","name"
    const match = line.match(/^"([^"]+)","([^"]+)","([^"]+)","([^"]+)"$/);
    if (!match) {
      console.warn(`[WARN] Skipping malformed line ${i}: ${line}`);
      continue;
    }
    records.push({
      username: match[1],
      password: match[2],
      email: match[3],
      name: match[4],
    });
  }

  console.log(`[INFO] Found ${records.length} valid admin records in CSV.\n`);

  let updatedCount = 0;
  let verifiedCount = 0;

  for (const record of records) {
    // 1. Hash with bcrypt rounds 10
    const hashedPassword = await bcrypt.hash(record.password, 10);

    // 2. Update DB record matching username
    const updated = await prisma.admins.update({
      where: { username: record.username },
      data: {
        password_hash: hashedPassword,
        email: record.email,
        name: record.name,
      },
    });

    updatedCount++;

    // 3. Immediately verify hash matches the plain password
    const isVerified = await bcrypt.compare(record.password, updated.password_hash);
    if (!isVerified) {
      throw new Error(`Verification failed for user ${record.username}!`);
    }
    verifiedCount++;

    if (record.username === "KM_ect" || record.username === "superadmin") {
      console.log(`⭐ [KEY ACCOUNT UPDATED] ${record.username} (${record.email}) -> Verified: ${isVerified}`);
    }
  }

  console.log("\n==========================================================");
  console.log(`✅ SYNC COMPLETE: Updated ${updatedCount}/${records.length} accounts.`);
  console.log(`✅ VERIFICATION: ${verifiedCount}/${records.length} verified successfully.`);
  console.log("==========================================================");
}

main()
  .catch((err) => {
    console.error("❌ Sync Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
