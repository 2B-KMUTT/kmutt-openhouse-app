# ADR 0002: การย้ายระบบจัดเก็บอ็อบเจกต์ (Object Storage) จาก Supabase มาเป็น RustFS

## สถานะ (Status)
Accepted (เห็นชอบร่วมกันใน Grilling Session)

## บริบท (Context)
เดิมระบบ KMUTT OpenHouse ผูกการจัดเก็บรูปภาพเข้ากับบริการภายนอกคือ Supabase Storage (`https://<project>.supabase.co`) โดยใช้งานผ่าน `@supabase/supabase-js` สำหรับการอัปโหลดรูปถ่ายกิจกรรมของนักเรียน (`TakePicture`)

อย่างไรก็ตาม มีปัญหาและข้อจำกัดสำคัญ:
1. **การพึ่งพาบริการภายนอกที่ไม่ได้ควบคุมเอง**: โครงการ Supabase เดิมไม่ทราบผู้ถือครองบัญชีหลักที่แน่นอน และบริการ Free-tier ของ Supabase เข้าสู่สถานะหยุดชั่วคราว (Paused / Unreachable) ส่งผลให้ระบบอัปโหลดและสำรองข้อมูลล้มเหลว
2. **ความต้องการ Self-hosted ภายในเครือข่าย**: ทีมพัฒนามีคอนเทนเนอร์ RustFS (`rustfs/rustfs:latest`) รันอยู่แล้วใน OpenHouse-DB VM (`10.2.15.91`) ซึ่งเป็น S3-compatible Object Storage ประสิทธิภาพสูงเขียนด้วย Rust
3. **ความปลอดภัยและประสิทธิภาพ**: การเข้าถึงไฟล์ผ่าน Nginx Reverse Proxy ภายในเครือข่ายมหาวิทยาลัยช่วยลด Latency และป้องกันการเปิดพอร์ต Storage ออกสู่อินเทอร์เน็ตสาธารณะโดยไม่จำเป็น

## การตัดสินใจ (Decision)
1. **ตัดการพึ่งพา Supabase ทั้งหมด (100% Decommission)**:
   - ถอดแพ็กเกจ `@supabase/supabase-js` ออกจาก `package.json`
   - ลบไฟล์ [`src/libs/supabase.ts`](../../src/libs/supabase.ts) และตัวแปรสภาพแวดล้อม `NEXT_PUBLIC_SUPABASE_*` ทั้งหมดออกจาก `.env` และ `.env.example`
2. **ใช้งาน AWS S3 SDK มาตรฐาน (`@aws-sdk/client-s3`)**:
   - ติดตั้ง `@aws-sdk/client-s3` ในการติดต่อกับ RustFS ผ่าน S3 Protocol
   - สร้างโมดูล [`src/libs/s3.ts`](../../src/libs/s3.ts) เป็น Singleton Client สำหรับจัดการ Direct Server Upload, Object Deletion และ Bucket Checking
3. **โครงสร้าง Single Bucket พร้อม Prefix**:
   - จัดเก็บทุกไฟล์ใน Bucket `openhouse-uploads`
   - แบ่งหมวดหมู่ไฟล์ด้วย Prefix: `take-pictures/`, `activities/`, `banners/`
4. **การให้บริการรูปภาพผ่าน Nginx Reverse Proxy**:
   - กำหนด Nginx Route สำหรับส่งต่อคำขอ `/storage/` ไปยัง RustFS พอร์ต 9000
   - กำหนดสิทธิ์ Anonymous Download สำหรับ Bucket `openhouse-uploads` ใน RustFS
   - บันทึกค่า URL ในตาราง `TakePicture.image_url` เป็น **Root-relative Path** เช่น `/storage/openhouse-uploads/take-pictures/openhouse-${timestamp}.${ext}` เพื่อความยืดหยุ่นสูง ไม่ผูกมัดกับชื่อโดเมน
5. **การสร้าง Bucket และสิทธิ์แบบ Hybrid**:
   - เพิ่ม Service `rustfs-init` ใน `infra/db/docker-compose.yml` โดยใช้ image `rustfs/rc:latest` เพื่อรันคำสั่งสร้าง Bucket `openhouse-uploads` และเปิดสิทธิ์ `anonymous set download` ตอนสตาร์ท Compose อัตโนมัติ
   - มีฟังก์ชัน fallback `ensureBucketExists()` ใน [`src/libs/s3.ts`](../../src/libs/s3.ts) เพื่อรองรับกรณีรันแยกหรือ local dev
6. **Object Deletion Lifecycle**:
   - ใน API [`src/pages/api/student/delete-picture.ts`](../../src/pages/api/student/delete-picture.ts) เมื่อนักเรียนลบรูปภาพ ระบบจะสั่งลบ Object จริงออกจาก RustFS เพื่อป้องกันปัญหาไฟล์ขยะสะสมใน Storage
7. **Native Docker Volume Backup**:
   - ปรับปรุงสคริปต์ [`scripts/backup-all.sh`](../../scripts/backup-all.sh) โดยสำรองข้อมูล Docker Volume `rustfs_data` ในรูปแบบ compressed tarball ลงใน `/root/backup-kmutt-openhouse-2025/storage/` โดยตรง ไม่ต้องพึ่งพา Node.js script ของ Supabase อีกต่อไป
   - ลบไฟล์ `scripts/backup-supabase.js` ออกจากระบบ

## ผลกระทบ (Consequences)
- **เชิงบวก (Positive)**:
  - ระบบจัดเก็บไฟล์เป็นกรรมสิทธิ์และการควบคุมของมหาวิทยาลัย 100% ปราศจากความเสี่ยงเรื่องบริการ Third-party โดนระงับ
  - ประสิทธิภาพการอัปโหลดและดาวน์โหลดรวดเร็วขึ้นเนื่องจากทำงานบน Intranet/LAN เดียวกัน
  - Codebase สะอาดขึ้น ไม่มีตัวแปรหรือไลบรารีที่ไม่ได้ใช้งาน
  - ไม่เกิดปัญหาไฟล์ตกค้างเมื่อผู้ใช้ลบรูปภาพ
- **สิ่งที่ต้องระมัดระวัง (Negative / Trade-offs)**:
  - ต้องดูแลการสำรองข้อมูล (Backup) และพื้นที่จัดเก็บของดิสก์ Docker Volume บน OpenHouse-DB VM
  - การกำหนดค่า Nginx ต้องชี้ไปยัง IP ของ RustFS (`10.2.15.91:9000`) อย่างถูกต้องใน production
