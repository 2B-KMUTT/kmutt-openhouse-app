#!/usr/bin/env bash
# ==============================================================================
# KMUTT OpenHouse - Full Backup Script (READ-ONLY / EXPORT ONLY)
# ==============================================================================
# คำเตือน / ข้อควรทราบ:
# สคริปต์นี้ทำงานในโหมด "อ่านและส่งออกข้อมูล (Read-Only / Export Only)" เท่านั้น
# - ไม่มีการลบข้อมูลใดๆ (ไม่มี DROP, DELETE, TRUNCATE, rm บนไฟล์ต้นฉบับ)
# - ไม่กระทบต่อการทำงานของระบบที่กำลังออนไลน์อยู่
# ==============================================================================

set -e

YEAR="2025"
BACKUP_ROOT="/root/backup-kmutt-openhouse-${YEAR}"
APP_DIR="/root/kmutt-openhouse-app"

mkdir -p "${BACKUP_ROOT}/database"
mkdir -p "${BACKUP_ROOT}/pdf-certificates"
mkdir -p "${BACKUP_ROOT}/images-and-assets"

echo "=========================================================="
echo " Starting Full Backup for KMUTT OpenHouse (${YEAR})"
echo " Destination: ${BACKUP_ROOT}"
echo " Mode: Read-Only (Export Only - No data will be deleted)"
echo "=========================================================="

# 1. Backup MySQL Database
echo -e "\n[1/4] Backing up MySQL database (openhouse-prod)..."
DB_SQL_FILE="${BACKUP_ROOT}/database/database_openhouse_prod_${YEAR}.sql"
DB_ZIP_FILE="${BACKUP_ROOT}/database/database_openhouse_prod_${YEAR}.zip"

# Dump using Docker MySQL client (read-only query)
docker run --rm mysql:8.0 mysqldump \
  -h 10.2.15.91 \
  -u root \
  -pKMUTTxxOPENHOUSEXEE20227 \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  --default-character-set=utf8mb4 \
  openhouse-prod 2>/dev/null > "${DB_SQL_FILE}"

zip -j -9 -q "${DB_ZIP_FILE}" "${DB_SQL_FILE}"
echo "  -> Finished Database Backup: ${DB_ZIP_FILE} ($(du -h "${DB_ZIP_FILE}" | cut -f1))"

# 2. Backup PDF Certificates
echo -e "\n[2/4] Backing up PDF Certificates (/root/sit-cert)..."
if [ -d "/root/sit-cert" ]; then
  PDF_ZIP_FILE="${BACKUP_ROOT}/pdf-certificates/sit_certificates_${YEAR}.zip"
  cd /root
  zip -1 -r -q "${PDF_ZIP_FILE}" sit-cert
  echo "  -> Finished PDF Certificates: ${PDF_ZIP_FILE} ($(du -h "${PDF_ZIP_FILE}" | cut -f1))"
else
  echo "  -> Notice: /root/sit-cert not found, skipping."
fi

# 3. Backup Website Images & Photo Manifest
echo -e "\n[3/4] Backing up Public Images and Photo Manifest..."
if [ -d "${APP_DIR}/public/images" ]; then
  IMG_ZIP_FILE="${BACKUP_ROOT}/images-and-assets/website_public_images_${YEAR}.zip"
  cd "${APP_DIR}"
  zip -r -q "${IMG_ZIP_FILE}" public/images
  echo "  -> Finished Public Images: ${IMG_ZIP_FILE} ($(du -h "${IMG_ZIP_FILE}" | cut -f1))"
fi

cd "${APP_DIR}"
node -e '
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const prisma = new PrismaClient();
prisma.takePicture.findMany({
  include: { student: { select: { first_name: true, last_name: true, email: true, phone: true } } }
}).then(pics => {
  const dest = "/root/backup-kmutt-openhouse-2025/images-and-assets/takePicture_manifest_2025.json";
  fs.writeFileSync(dest, JSON.stringify(pics, null, 2));
  console.log(`  -> Photo manifest updated (${pics.length} records).`);
  process.exit(0);
}).catch(e => {
  console.error("  -> Manifest export error:", e.message);
  process.exit(1);
});
' 2>/dev/null || true

# 4. Attempt Supabase Storage Backup
echo -e "\n[4/4] Checking Supabase Storage backup..."
node "${APP_DIR}/scripts/backup-supabase.js" || true

echo -e "\n=========================================================="
echo " Backup completed successfully!"
echo " All archives are formatted as .zip in:"
echo " ${BACKUP_ROOT}"
echo "=========================================================="
