const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("==========================================================");
  console.log("🚀 STARTING STAFF PASSWORDS SYNC FROM staffs.csv TO DATABASE");
  console.log("==========================================================");

  const csvPath = path.join(process.cwd(), "staffs.csv");
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

  console.log(`[INFO] Found ${records.length} valid staff records in CSV.\n`);

  let updatedCount = 0;
  let verifiedCount = 0;

  for (const record of records) {
    // 1. Hash with bcrypt rounds 10
    const hashedPassword = await bcrypt.hash(record.password, 10);

    // 2. Update DB record matching username
    const existing = await prisma.staffs.findFirst({
      where: {
        OR: [
          { username: record.username },
          { email: record.email },
        ],
      },
    });

    if (!existing) {
      console.warn(`[WARN] Staff user ${record.username} not found in DB!`);
      continue;
    }

    const updated = await prisma.staffs.update({
      where: { id: existing.id },
      data: {
        username: record.username,
        email: record.email,
        name: record.name,
        password_hash: hashedPassword,
      },
    });

    updatedCount++;

    // 3. Immediately verify hash matches the plain password
    const isVerified = await bcrypt.compare(record.password, updated.password_hash);
    if (!isVerified) {
      throw new Error(`Verification failed for user ${record.username}!`);
    }
    verifiedCount++;

    console.log(`✅ [UPDATED] ${record.username} (${record.email}) -> Verified: ${isVerified}`);
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
