# ADR 0004: การกำหนดให้ Event Master Data ใน JSON เป็น Single Source of Truth (SSOT)

## สถานะ (Status)
Accepted (เห็นชอบร่วมกันใน Grilling Session วันที่ 11 พฤศจิกายน 2569)

## บริบท (Context)
ในระบบ KMUTT OpenHouse มีการจัดกิจกรรมสัญจร (Roadshow) หลายรอบในแต่ละปี เช่น รอบ มจธ. (มดอีสาน) ณ จ.ร้อยเอ็ด (30 ตุลาคม 2569) และรอบถัดมาคือ มจธ.ราชบุรี มดออนทัวร์ ณ โรงแรมเซ็น จ.นครปฐม (21 พฤศจิกายน 2569)

เดิมทีเมื่อมีการเปลี่ยนรอบกิจกรรม ผู้พัฒนาได้แก้ไขข้อมูลเฉพาะในฝั่ง React Component (Hardcoded `useState` fallbacks), [`src/interfaces/LandingContent.ts`](../../src/interfaces/LandingContent.ts) และ [`src/constants/event.ts`](../../src/constants/event.ts) แต่ไม่ได้ปรับปรุงไฟล์ชุดข้อมูล Master Data ใน [`prisma/data/`](../../prisma/data/)

ส่งผลให้เกิดปัญหาขัดแย้งเชิงโครงสร้าง (Split Brain / Conflicting Sources of Truth):
1. **ข้อมูลถูกย้อนกลับเมื่อรัน Pipeline**: เมื่อผู้ดูแลระบบรัน [`scripts/backup.sh`](../../scripts/backup.sh) หรือทำวงรอบ `backup -> truncate -> seed` ระบบจะสั่งรัน `node prisma/seed.js` ซึ่งโหลดข้อมูลเก่าของรอบร้อยเอ็ดจาก `prisma/data/landing-*.json` ลงใน MySQL
2. **หน้าบ้านถูกเขียนทับ**: แม้ในโค้ด React จะมี fallback เป็นข้อมูลนครปฐม แต่เนื่องจากคอมโพเนนต์จะ fetch ข้อมูลจาก `/api/landing/*` (ซึ่งอ่านจาก MySQL) ทันทีที่โหลดเสร็จ ข้อมูลหน้าบ้านจึงถูกแทนที่กลับไปเป็นข้อมูลมดอีสานของร้อยเอ็ด
3. **การกระจายตัวของข้อมูล (Scattered Configuration)**: มีการฮาร์ดโค้ดข้อมูลซ้ำซ้อนกันมากกว่า 10 ไฟล์ใน `src/views/pages/landing/` และมี Technical Debt เชิงชื่อไฟล์ เช่น [`ThirtyOctTable.tsx`](../../src/views/pages/landing/Tables/ThirtyOctTable.tsx) ที่ผูกกับวันที่ 30 ต.ค. เดิม

## การตัดสินใจ (Decision)
1. **กำหนดให้ `prisma/data/landing-*.json` เป็น Single Source of Truth (SSOT)**:
   - ข้อมูลงานกิจกรรมทั้งหมด (ชื่องาน, วันที่, สถานที่, ผู้ประสานงาน, ลิงก์, บูท, กำหนดการ, แบนเนอร์, การตั้งค่าแบบสอบถาม) จะต้องถูกจัดเก็บและอ้างอิงจากไฟล์ JSON ใน `prisma/data/` เป็นหลัก
   - ไฟล์ประกอบด้วย:
     - `prisma/data/landing-configs.json` (ข้อมูลและคอนฟิกหลักของงาน)
     - `prisma/data/landing-banners.json` (แบนเนอร์ประชาสัมพันธ์)
     - `prisma/data/landing-schedules.json` (กำหนดการกิจกรรมตลอดวัน)
     - `prisma/data/landing-booths.json` (ข้อมูลบูทและการจัดแสดง)
2. **การผูกค่าในโค้ด TypeScript เข้ากับ JSON โดยตรง (Import JSON Directly)**:
   - ปรับ [`src/interfaces/LandingContent.ts`](../../src/interfaces/LandingContent.ts) และ [`src/constants/event.ts`](../../src/constants/event.ts) ให้ `import` ค่าจาก `landing-configs.json` โดยตรงเพื่อใช้เป็น default fallbacks ในระดับโค้ด
   - ป้องกันปัญหาความซ้ำซ้อน: เมื่อทีมงานแก้ไขข้อมูลใน `prisma/data/` ที่เดียว ทั้ง Database Seeder และ Code Fallback จะได้รับค่าใหม่พร้อมกันทันที
3. **การล้าง Technical Debt และคอมโพเนนต์กำหนดการ (Schedule Component Refactor)**:
   - เปลี่ยนชื่อ [`ThirtyOctTable.tsx`](../../src/views/pages/landing/Tables/ThirtyOctTable.tsx) เป็น [`ScheduleTable.tsx`](../../src/views/pages/landing/Tables/ScheduleTable.tsx) เพื่อให้เป็น Generic Component สำหรับทุกรอบงาน
   - ให้คอมโพเนนต์นำเข้าค่าเริ่มต้นจาก `prisma/data/landing-schedules.json` และ fetch อัปเดตจาก `/api/landing/schedule` โดยไม่ต้องฮาร์ดโค้ดข้อมูล 135 บรรทัดซ้ำใน `.tsx`
   - นำเข้าค่าเริ่มต้นของบูทและแบนเนอร์จาก `landing-booths.json` และ `landing-banners.json` ใน `BoothSection.tsx` และ `BannerSection.tsx`
4. **การรองรับ Back-Office CMS ร่วมกับ Seed Baseline**:
   - ผู้ดูแลระบบยังสามารถแก้ไขข้อมูลหน้างานได้ตามปกติผ่าน Back-Office (`/_km/landing-*`) โดยระบบจะบันทึกลงใน MySQL
   - ไฟล์ใน `prisma/data/` ทำหน้าที่เป็น **Master Seed Baseline** เมื่อมีการสั่ง Reset ระบบ (`backup.sh`) หรือ Deploy ติดตั้งระบบใหม่

## ผลกระทบ (Consequences)
- **เชิงบวก (Positive)**:
  - วงรอบ `backup -> truncate -> seed` จะได้ข้อมูลรอบจัดงานปัจจุบันอย่างถูกต้อง 100% ไม่ย้อนกลับไปเป็นงานเก่า
  - ทีมงานแก้ข้อมูลรอบงานใหม่ที่โฟลเดอร์ `prisma/data/` เพียงจุดเดียว จบครบทั้งฐานข้อมูลและหน้าบ้าน
  - คอมโพเนนต์หน้าบ้านเป็นอิสระจากชื่องานและวันที่เฉพาะเจาะจง รองรับ Roadshow ทุกรอบในอนาคต
  - ขจัดปัญหา UI กระพริบหรือข้อมูลเปลี่ยนไปมาระหว่าง SSR/CSR
- **ข้อพึงระวัง (Trade-offs & Considerations)**:
  - หากมีการแก้ไขข้อมูลสดผ่าน Back-Office CMS แล้วต้องการให้ข้อมูลนั้นกลายเป็นค่าตั้งต้นถาวรใน Git จะต้องนำค่านั้นมาบันทึกกลับลงใน `prisma/data/` ด้วย
