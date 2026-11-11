#!/usr/bin/env bash
# ==============================================================================
# KMUTT OpenHouse - Event Backup & System Reset Pipeline (backup.sh)
# ==============================================================================
# โครงสร้างโฟลเดอร์ Backup:
# /root/backup-openhouse/
# └── YYYY/
#     └── <location>/
#         ├── database/
#         │   └── database_openhouse_prod_<location>_<year>.zip
#         └── storage/
#             └── rustfs_storage_<location>_<year>.zip
#
# การใช้งาน:
#   ./backup.sh [location] [year]
# ตัวอย่าง:
#   ./backup.sh roi-et 2026
#   ./backup.sh nakhon-pathom
#   ./backup.sh
# ==============================================================================

set -eo pipefail

REAL_SCRIPT="$(readlink -f "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(cd "$(dirname "${REAL_SCRIPT}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
DB_INFRA_DIR="${APP_DIR}/infra/db"
BACKUP_BASE_DIR="/root/backup-openhouse"

# สีสำหรับการแสดงผล
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}"
echo "======================================================================"
echo "    KMUTT OpenHouse - Event Backup & System Reset Utility"
echo "======================================================================"
echo -e "${NC}"

# ------------------------------------------------------------------------------
# 1. จัดการพารามิเตอร์ Location & Year
# ------------------------------------------------------------------------------
LOCATION="$1"
YEAR="$2"
DEFAULT_YEAR=$(date +%Y)

if [ -z "$LOCATION" ]; then
  read -r -p "Enter event location name (e.g., roi-et, nakhon-pathom): " LOCATION || true
fi

# ล้าง format ชื่อจังหวัด (lowercase, alphanumeric + dashes เท่านั้น)
LOCATION=$(echo "$LOCATION" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9-_' '-' | sed 's/^-//;s/-$//')

if [ -z "$LOCATION" ]; then
  echo -e "${RED}[ERROR] Event location name cannot be empty!${NC}"
  exit 1
fi

if [ -z "$YEAR" ]; then
  read -r -p "Enter event year [default: ${DEFAULT_YEAR}]: " INPUT_YEAR || true
  YEAR="${INPUT_YEAR:-$DEFAULT_YEAR}"
fi

TARGET_DIR="${BACKUP_BASE_DIR}/${YEAR}/${LOCATION}"
DB_TARGET_DIR="${TARGET_DIR}/database"
STORAGE_TARGET_DIR="${TARGET_DIR}/storage"

mkdir -p "${DB_TARGET_DIR}" "${STORAGE_TARGET_DIR}"

echo -e "\n${BLUE}[INFO] Destination Directory:${NC} ${TARGET_DIR}"
echo -e "${BLUE}[INFO] Event Location:${NC}       ${LOCATION}"
echo -e "${BLUE}[INFO] Event Year:${NC}           ${YEAR}\n"

# ------------------------------------------------------------------------------
# 2. ตรวจสอบรหัสผ่าน MySQL
# ------------------------------------------------------------------------------
MYSQL_PASSWORD=""
if [ -f "${DB_INFRA_DIR}/.env" ]; then
  MYSQL_PASSWORD=$(grep "^MYSQL_ROOT_PASSWORD=" "${DB_INFRA_DIR}/.env" | cut -d '=' -f2- | tr -d '\r' | tr -d '"' | tr -d "'")
fi

if [ -z "$MYSQL_PASSWORD" ] && [ -f "${APP_DIR}/.env" ]; then
  MYSQL_PASSWORD=$(grep "^DATABASE_URL=" "${APP_DIR}/.env" | sed -E 's/.*:\/\/.*:(.*)@.*/\1/' | tr -d '\r' | tr -d '"' | tr -d "'")
fi

if [ -z "$MYSQL_PASSWORD" ]; then
  echo -e "${RED}[ERROR] Could not extract MySQL root password from environment files!${NC}"
  exit 1
fi

# ------------------------------------------------------------------------------
# 3. สำรองข้อมูล MySQL Database (คลีน ไม่มีตารางขยะ, มี CREATE TABLE + Data)
# ------------------------------------------------------------------------------
echo -e "${YELLOW}[1/2] Backing up MySQL Database (openhouse-prod)...${NC}"
SQL_FILE="${DB_TARGET_DIR}/database_openhouse_prod_${LOCATION}_${YEAR}.sql"
ZIP_SQL_FILE="${DB_TARGET_DIR}/database_openhouse_prod_${LOCATION}_${YEAR}.zip"

# Dump ข้อมูลโดยตัดตารางขยะออก (ไม่ใช้ -i เพื่อไม่ให้กิน stdin)
docker exec openhouse_mysql mysqldump \
  -u root -p"${MYSQL_PASSWORD}" \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  --default-character-set=utf8mb4 \
  --ignore-table=openhouse-prod.PublicSurvey_2025_backup \
  --ignore-table=openhouse-prod.estamp-activity \
  openhouse-prod > "${SQL_FILE}"

if [ ! -s "${SQL_FILE}" ]; then
  echo -e "${RED}[ERROR] Database dump resulted in an empty file!${NC}"
  rm -f "${SQL_FILE}"
  exit 1
fi

# บีบอัดเป็น .zip (รองรับทั้ง zip command และ python3 zipfile fallback)
if command -v zip >/dev/null 2>&1; then
  zip -j -9 -q "${ZIP_SQL_FILE}" "${SQL_FILE}"
else
  python3 -c "
import zipfile, sys, os
zip_path = sys.argv[1]
src = sys.argv[2]
with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
    zf.write(src, arcname=os.path.basename(src))
" "${ZIP_SQL_FILE}" "${SQL_FILE}"
fi
rm -f "${SQL_FILE}"

SQL_SIZE=$(du -h "${ZIP_SQL_FILE}" | cut -f1)
echo -e "${GREEN}  ✓ Finished Database Backup:${NC} ${ZIP_SQL_FILE} (${SQL_SIZE})"

# ------------------------------------------------------------------------------
# 4. สำรองข้อมูล RustFS Object Storage Volume (บีบอัดเป็น .zip พร้อม root folder)
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[2/2] Backing up RustFS Volume (openhouse_rustfs_data)...${NC}"
ZIP_STORAGE_FILE="${STORAGE_TARGET_DIR}/rustfs_storage_${LOCATION}_${YEAR}.zip"

# แพ็ก Volume ครอบโฟลเดอร์ rustfs_data/
docker run --rm \
  -v openhouse_rustfs_data:/rustfs_data:ro \
  -v "${STORAGE_TARGET_DIR}:/backup" \
  alpine sh -c "
    apk add --no-cache zip >/dev/null 2>&1
    cd / && zip -r -9 -q /backup/rustfs_storage_${LOCATION}_${YEAR}.zip rustfs_data
  "

STORAGE_SIZE=$(du -h "${ZIP_STORAGE_FILE}" | cut -f1)
echo -e "${GREEN}  ✓ Finished RustFS Volume Backup:${NC} ${ZIP_STORAGE_FILE} (${STORAGE_SIZE})"

echo -e "\n${GREEN}${BOLD}======================================================================${NC}"
echo -e "${GREEN}${BOLD}  BACKUP COMPLETED SUCCESSFULLY!${NC}"
echo -e "  Location:    ${BOLD}${LOCATION}${NC}"
echo -e "  Year:        ${BOLD}${YEAR}${NC}"
echo -e "  Folder:      ${BOLD}${TARGET_DIR}${NC}"
echo -e "${GREEN}${BOLD}======================================================================${NC}"

# ------------------------------------------------------------------------------
# 5. Interactive Safety Gate (ยืนยันเพื่อล้างระบบและเริ่มใหม่)
# ------------------------------------------------------------------------------
echo -e "\n${RED}${BOLD}!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!${NC}"
echo -e "${RED}${BOLD}                 DANGER ZONE: SYSTEM RESET & RE-SEED                  ${NC}"
echo -e "${RED}${BOLD}!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!${NC}"
echo -e "${YELLOW}หากยืนยัน ระบบจะทำสิ่งต่อไปนี้:${NC}"
echo -e "  1. ${BOLD}TRUNCATE ทุกตารางในฐานข้อมูล${NC} (ล้างนักเรียน, กิจกรรม, E-Stamp, Master Data ทั้งหมด)"
echo -e "     ${CYAN}(ยกเว้นตาราง _prisma_migrations เพื่อรักษาประวัติ Schema)${NC}"
echo -e "  2. ${BOLD}DROP ตารางขยะที่ค้างอยู่${NC} (PublicSurvey_2025_backup, estamp-activity)"
echo -e "  3. ${BOLD}ล้างไฟล์ทั้งหมดใน RustFS Object Storage${NC} ให้กลับเป็นพื้นที่ว่าง 0 bytes"
echo -e "  4. ${BOLD}Restart เซอร์วิส RustFS${NC} พร้อมสร้าง bucket openhouse-uploads ใหม่อัตโนมัติ"
echo -e "  5. ${BOLD}รัน Master Seed ทั้งหมดใหม่${NC} (13 คณะ, 42 ภาควิชา, Landing, OAuth, สุ่มรหัสผ่าน OpenSSL 32 หลักใหม่ให้ Admin/Staff)"
echo -e "  6. ${BOLD}ส่งออกไฟล์ admins.csv และ staffs.csv ชุดใหม่${NC} สำหรับรอบงานถัดไป"
echo ""
echo -e "${BOLD}หากต้องการล้างและตั้งต้นระบบใหม่ ให้พิมพ์:${NC} ${RED}${BOLD}CLEAR-ALL${NC}"
echo -e "${BOLD}หากต้องการจบงาน (เก็บ Backup ไว้อย่างเดียว ไม่ล้างข้อมูล) ให้กด Enter หรือพิมพ์อะไรก็ได้${NC}"
echo ""
read -r -p "Type confirmation: " CONFIRM_ACTION || true

if [ "$CONFIRM_ACTION" != "CLEAR-ALL" ]; then
  echo -e "\n${GREEN}[SAFE EXIT] Confirmation not given. Live system was NOT touched.${NC}"
  echo -e "${GREEN}[INFO] Your backup remains safely stored at:${NC} ${TARGET_DIR}"
  exit 0
fi

# ------------------------------------------------------------------------------
# 6. ขั้นตอนการล้างระบบ (WIPE & RESET)
# ------------------------------------------------------------------------------
echo -e "\n${RED}${BOLD}==> Proceeding with WIPE & SYSTEM RESET...${NC}"

# 6.1 ล้างตารางใน MySQL
echo -e "\n${YELLOW}[Step 1/4] Truncating all MySQL tables & dropping junk tables...${NC}"

# ดึงรายชื่อตารางทั้งหมดในฐานข้อมูล ยกเว้น _prisma_migrations
TABLES=$(docker exec -i openhouse_mysql mysql -u root -p"${MYSQL_PASSWORD}" openhouse-prod -N -e "
  SELECT TABLE_NAME FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA = 'openhouse-prod' 
    AND TABLE_NAME != '_prisma_migrations'
    AND TABLE_NAME != 'PublicSurvey_2025_backup'
    AND TABLE_NAME != 'estamp-activity';
")

# สั่ง TRUNCATE ทุกตาราง และ DROP ตารางขยะ
TRUNCATE_SQL="SET FOREIGN_KEY_CHECKS = 0;\n"
for tbl in $TABLES; do
  TRUNCATE_SQL="${TRUNCATE_SQL}TRUNCATE TABLE \`${tbl}\`;\n"
done
TRUNCATE_SQL="${TRUNCATE_SQL}DROP TABLE IF EXISTS \`PublicSurvey_2025_backup\`;\n"
TRUNCATE_SQL="${TRUNCATE_SQL}DROP TABLE IF EXISTS \`estamp-activity\`;\n"
TRUNCATE_SQL="${TRUNCATE_SQL}SET FOREIGN_KEY_CHECKS = 1;\n"

echo -e "$TRUNCATE_SQL" | docker exec -i openhouse_mysql mysql -u root -p"${MYSQL_PASSWORD}" openhouse-prod

echo -e "${GREEN}  ✓ All database tables truncated and junk tables dropped.${NC}"

# 6.2 ล้าง RustFS Volume
echo -e "\n${YELLOW}[Step 2/4] Wiping RustFS storage volume & reinitializing...${NC}"
docker stop openhouse_rustfs >/dev/null 2>&1 || true

docker run --rm -v openhouse_rustfs_data:/data alpine rm -rf /data/rustfs0 /data/rustfs1 /data/rustfs2 /data/rustfs3

cd "${DB_INFRA_DIR}"
docker compose up -d rustfs rustfs-init >/dev/null 2>&1

echo -e "${GREEN}  ✓ RustFS storage wiped clean and bucket reinitialized.${NC}"

# 6.3 ตรวจสอบ Health ของ MySQL & RustFS
echo -e "\n${YELLOW}[Step 3/4] Checking services readiness...${NC}"
retries=15
while [ $retries -gt 0 ]; do
  if docker exec openhouse_mysql mysqladmin ping -h localhost -u root -p"${MYSQL_PASSWORD}" --silent >/dev/null 2>&1; then
    echo -e "${GREEN}  ✓ MySQL is healthy and ready.${NC}"
    break
  fi
  sleep 1
  retries=$((retries - 1))
done

# Restart App container if running on this host
if docker ps -q -f name=openhouse_app_ >/dev/null 2>&1; then
  docker compose -f "${APP_DIR}/docker-compose.yaml" restart >/dev/null 2>&1 || true
fi

# 6.4 รัน Seed ใหม่ทั้งหมด
echo -e "\n${YELLOW}[Step 4/4] Generating Prisma client & running Master Seeder (seed.js)...${NC}"
cd "${APP_DIR}"
if [ -f "./node_modules/.bin/prisma" ]; then
  ./node_modules/.bin/prisma generate >/dev/null 2>&1 || true
fi
node prisma/seed.js --force --reset-passwords

echo -e "\n${GREEN}${BOLD}======================================================================${NC}"
echo -e "${GREEN}${BOLD}  SYSTEM RESET & FRESH SEED COMPLETED SUCCESSFULLY!${NC}"
echo -e "${GREEN}  1. Previous state safely backed up at: ${BOLD}${TARGET_DIR}${NC}"
echo -e "${GREEN}  2. Database tables cleanly re-seeded with Master Data${NC}"
echo -e "${GREEN}  3. RustFS object storage cleaned and ready for new uploads${NC}"
echo -e "${GREEN}  4. Fresh CSV accounts exported at:${NC}"
echo -e "     • Admins: ${BOLD}${APP_DIR}/admins.csv${NC}"
echo -e "     • Staffs: ${BOLD}${APP_DIR}/staffs.csv${NC}"
echo -e "${GREEN}${BOLD}======================================================================${NC}\n"
