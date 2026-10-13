/**
 * Script for backing up Supabase Storage files & data
 * Usage: node scripts/backup-supabase.js
 */
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const https = require("https");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Supabase credentials not found in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const BACKUP_DIR = path.join("/root/backup-kmutt-openhouse-2025/supabase_storage");

async function downloadFile(bucket, filePath, destDir) {
  const { data, error } = await supabase.storage.from(bucket).download(filePath);
  if (error) {
    console.error(`  [!] Failed downloading ${bucket}/${filePath}:`, error.message);
    return false;
  }
  const fullDest = path.join(destDir, filePath);
  fs.mkdirSync(path.dirname(fullDest), { recursive: true });
  const buffer = Buffer.from(await data.arrayBuffer());
  fs.writeFileSync(fullDest, buffer);
  console.log(`  [+] Downloaded: ${bucket}/${filePath} (${(buffer.length / 1024).toFixed(1)} KB)`);
  return true;
}

async function backupBucket(bucketName) {
  console.log(`\n--- Backing up bucket: ${bucketName} ---`);
  const targetDir = path.join(BACKUP_DIR, bucketName);
  fs.mkdirSync(targetDir, { recursive: true });

  const { data: files, error } = await supabase.storage.from(bucketName).list("", {
    limit: 1000,
    sortBy: { column: "created_at", order: "desc" }
  });

  if (error) {
    console.error(`  [!] Error listing bucket ${bucketName}:`, error.message);
    return;
  }

  if (!files || files.length === 0) {
    console.log(`  (Bucket ${bucketName} is empty)`);
    return;
  }

  console.log(`  Found ${files.length} items in bucket ${bucketName}`);
  for (const item of files) {
    if (item.id === null) {
      // It's a folder or placeholder
      continue;
    }
    await downloadFile(bucketName, item.name, targetDir);
  }
}

async function backupViaManifest() {
  const manifestPath = "/root/backup-kmutt-openhouse-2025/images-and-assets/takePicture_manifest_2025.json";
  if (!fs.existsSync(manifestPath)) return;

  console.log("\n--- Checking takePicture manifest for additional photos ---");
  const records = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const targetDir = path.join(BACKUP_DIR, "images");
  fs.mkdirSync(targetDir, { recursive: true });

  for (const item of records) {
    if (!item.image_url) continue;
    const filename = path.basename(item.image_url.split("?")[0]);
    const dest = path.join(targetDir, filename);
    if (fs.existsSync(dest)) continue;

    console.log(`  Downloading photo ${filename}...`);
    try {
      await downloadFile("images", filename, targetDir);
    } catch (e) {
      console.error(`  Failed: ${filename} - ${e.message}`);
    }
  }
}

async function main() {
  console.log("==========================================");
  console.log("Supabase Backup Utility");
  console.log(`Target URL: ${supabaseUrl}`);
  console.log(`Destination: ${BACKUP_DIR}`);
  console.log("==========================================");

  try {
    const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
    if (bErr) {
      console.error("\n[X] Could not connect to Supabase Storage!");
      console.error(`Reason: ${bErr.message}`);
      console.log("\n* Note on Supabase free-tier: Inactive projects get paused automatically.");
      console.log("* If project status is paused, log in to https://supabase.com/dashboard");
      console.log("* and click 'Restore project' / 'Resume project' to enable access again.\n");
      return;
    }

    console.log(`Found ${buckets.length} storage buckets:`, buckets.map(b => b.name).join(", "));
    for (const b of buckets) {
      await backupBucket(b.name);
    }

    await backupViaManifest();

    console.log("\n==========================================");
    console.log("Supabase backup completed successfully!");
    console.log("==========================================");
  } catch (err) {
    console.error("\nUnexpected error during Supabase backup:", err);
  }
}

main();
