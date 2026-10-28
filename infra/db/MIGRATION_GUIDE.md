# คู่มือการย้าย MySQL จาก OS Native ไปรันบน Docker (Zero Data Loss)

คู่มือนี้จัดทำขึ้นสำหรับการย้าย MySQL 8.0 ที่ติดตั้งอยู่บนระบบปฏิบัติการโดยตรง (Host OS) ไปรันผ่าน Docker Compose บนเครื่อง **DB VM** โดย **รับประกันว่าข้อมูลเดิมจะไม่สูญหาย 100%** และมีแผน Rollback ที่สามารถย้อนกลับได้ภายใน 30 วินาทีหากเกิดปัญหา

---

## 0. หลักความปลอดภัย (ทำไมข้อมูลจึงไม่หาย 100%)
1. เราจะทำการ **Dump ข้อมูลทั้งหมดออกเป็นไฟล์ `.sql` แยกไว้ต่างหาก** ก่อนแตะต้อง Service ใดๆ
2. เรา **ไม่ลบ** โฟลเดอร์ข้อมูลเดิมของ OS (`/var/lib/mysql`) ดังนั้นข้อมูลดิบต้นฉบับจะยังคงอยู่ครบ
3. ถ้าติดปัญหาใดๆ ระหว่างทำ สามารถสั่งปิด Docker แล้วเปิด MySQL ของ OS กลับคืนมาได้ทันที

---

## ขั้นตอนที่ 1: ตรวจสอบและ Dump ข้อมูลจาก MySQL เดิมบน Host OS

SSH เข้าไปยังเครื่อง **DB VM**:

```bash
# 1.1 สร้างโฟลเดอร์สำหรับเก็บไฟล์ Backup ฉุกเฉิน
mkdir -p /root/db-migration-backup
cd /root/db-migration-backup

# 1.2 สั่ง Dump ข้อมูลทั้งหมด (รวม Stored Procedures, Triggers, Routines)
# (ใส่รหัสผ่าน root เดิมของ MySQL บน Host)
mysqldump -u root -p \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  --default-character-set=utf8mb4 \
  --all-databases > full_backup_before_docker.sql

# 1.3 ตรวจสอบขนาดไฟล์และความสมบูรณ์ (ต้องมีขนาด > 0 byte และมีคำสั่ง CREATE TABLE)
ls -lh full_backup_before_docker.sql
head -n 25 full_backup_before_docker.sql
tail -n 10 full_backup_before_docker.sql
```

> [!IMPORTANT]
> ห้ามข้ามขั้นตอนที่ 1.3 โดยเด็ดขาด ต้องแน่ใจว่าไฟล์ `full_backup_before_docker.sql` มีข้อมูลอยู่จริง

---

## ขั้นตอนที่ 2: หยุดการทำงานของ MySQL บน Host OS

เมื่อมั่นใจว่าไฟล์ Dump เรียบร้อยแล้ว ให้หยุด Service MySQL ของระบบ และปิดไม่ให้ Auto-start ตอนบูตเครื่องใหม่:

```bash
# 2.1 หยุด Service เดิม
sudo systemctl stop mysql

# 2.2 ปิดไม่ให้ Auto-start
sudo systemctl disable mysql

# 2.3 ตรวจสอบว่าพอร์ต 3306 ว่างแล้ว
sudo ss -tulpn | grep 3306
# (ผลลัพธ์ต้องว่าง ไม่มีโปรเซสใดใช้งานพอร์ต 3306)
```

---

## ขั้นตอนที่ 3: เตรียมโฟลเดอร์ Docker บน DB VM

นำโฟลเดอร์ `infra/db` จาก repository นี้ไปวางไว้ที่เครื่อง DB VM (เช่น ไว้ที่ `/root/infra-db`):

```bash
mkdir -p /root/infra-db
cd /root/infra-db

# คัดลอกไฟล์จากโปรเจกต์มาวาง:
# - docker-compose.yml
# - conf.d/my.cnf
# - backup.sh
# - .env.example
```

สร้างไฟล์ `.env` สำหรับโปรดักชัน:
```bash
cp .env.example .env
nano .env
```
ตั้งค่ารหัสผ่านใน `.env`:
* `MYSQL_ROOT_PASSWORD`: ตั้งรหัสผ่าน root ให้ตรงกับรหัสผ่านเดิม หรือตั้งใหม่ตามต้องการ
* `MYSQL_DATABASE`: `openhouse-prod`
* `MYSQL_USER`: `kmutt_user`
* `MYSQL_PASSWORD`: รหัสผ่านสำหรับ user
* `MYSQL_PORT`: `3306`

---

## ขั้นตอนที่ 4: สตาร์ท MySQL ผ่าน Docker Compose

```bash
cd /root/infra-db

# 4.1 สตาร์ทคอนเทนเนอร์
docker compose up -d

# 4.2 ตรวจสอบสถานะการทำงาน
docker compose ps
docker compose logs -f mysql
# (กด Ctrl+C เพื่อออกเมื่อเห็นข้อความ "ready for connections")
```

---

## ขั้นตอนที่ 5: นำเข้าข้อมูล (Import) เข้าสู่ Docker MySQL

นำไฟล์ Dump ที่เราเตรียมไว้ในขั้นตอนที่ 1 นำเข้าไปยังคอนเทนเนอร์ MySQL ใหม่:

```bash
# 5.1 Import ข้อมูลทั้งหมดกลับเข้าไป
docker exec -i openhouse_mysql mysql -u root -p$(grep MYSQL_ROOT_PASSWORD .env | cut -d '=' -f2) < /root/db-migration-backup/full_backup_before_docker.sql

# 5.2 Flush privileges
docker exec -it openhouse_mysql mysql -u root -p$(grep MYSQL_ROOT_PASSWORD .env | cut -d '=' -f2) -e "FLUSH PRIVILEGES;"
```

---

## ขั้นตอนที่ 6: ตรวจสอบความถูกต้องของข้อมูล (Verification)

เข้าไปตรวจสอบตารางและจำนวนแถวในฐานข้อมูล:

```bash
docker exec -it openhouse_mysql mysql -u root -p$(grep MYSQL_ROOT_PASSWORD .env | cut -d '=' -f2) openhouse-prod -e "
SHOW TABLES;
SELECT 'Students' as TableName, COUNT(*) FROM Students
UNION ALL
SELECT 'Registrations', COUNT(*) FROM Registrations
UNION ALL
SELECT '_prisma_migrations', COUNT(*) FROM _prisma_migrations;
"
```

และทดสอบการเชื่อมต่อจากเครื่อง **App VM**:
```bash
# รันบน App VM เพื่อยืนยันว่า App VM คุยกับ DB VM บนพอร์ต 3306 ได้ปกติ
nc -zv <IP_DB_VM> 3306
```

---

## ขั้นตอนที่ 7: เข้าใช้งาน phpMyAdmin และ RustFS

1. **เข้าใช้งาน phpMyAdmin:**
   เปิด Browser ไปที่ `http://<IP_DB_VM>:8080`
   * **ด่านที่ 1:** HTTP Basic Auth ป้องกันหน้าเว็บ กรอกตามที่ตั้งใน `.env` (`PMA_AUTH_USER` และ `PMA_AUTH_PASSWORD`)
   * **ด่านที่ 2:** หน้าล็อกอิน phpMyAdmin เข้าสู่ MySQL กรอก Username และ Password ของ MySQL ตาม `.env`

2. **เข้าใช้งาน RustFS Object Storage Console:**
   เปิด Browser ไปที่ `http://<IP_DB_VM>:9001`
   * **Access Key:** ตามที่ตั้งใน `.env` (`RUSTFS_ACCESS_KEY`)
   * **Secret Key:** ตามที่ตั้งใน `.env` (`RUSTFS_SECRET_KEY`)
   * สำหรับ App VM เชื่อมต่อ S3 API ที่พอร์ต `http://<IP_DB_VM>:9000`

---

## แผน Rollback ฉุกเฉิน (หากต้องการย้อนกลับสู่ระบบเดิม)

หากเกิดเหตุขัดข้องใดๆ แล้วต้องการย้อนกลับไปใช้ MySQL บน Host OS ทันที สามารถทำได้ใน 2 คำสั่ง:

```bash
# 1. ปิด Docker MySQL
cd /root/infra-db && docker compose down

# 2. เปิด MySQL เดิมของ Host กลับขึ้นมา
sudo systemctl enable --now mysql
```
ข้อมูลและระบบเดิมบน Host OS จะกลับมาทำงานตามปกติ 100% ทันที
