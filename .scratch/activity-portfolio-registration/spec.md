# Specification: Activity Portfolio Link Registration (a-Port)

## Summary
Add support for students to attach a portfolio link (e.g. Google Drive, Canva, Notion) when registering for a workshop or registration activity. Admins (such as Ratchaburi Admin and Super Admin) can toggle portfolio requirements per activity, view submitted links in the participants table, and export them to Excel.

## Key Requirements & Agreed Decisions (ADR-0005)
1. **Activity-level configuration**: Admin can toggle `require_portfolio` on/off when creating or editing activities (`AddActivityPage` and `ViewActivityPage`).
2. **Student Registration UX**:
   - For activities requiring a portfolio, clicking "ลงทะเบียนกิจกรรม" opens a clean, standard Chakra UI modal.
   - Modal contains a single input for the portfolio URL and a concise helper notice: `* โปรดตั้งค่าลิงก์เป็นสาธารณะ (Public)`.
   - No redundant wrapper divs, no weird AI slop borders/backgrounds.
   - Students can update their portfolio link later without losing their registration spot.
3. **No strict URL validation**: Accept any trimmed string without blocking obscure domains or patterns.
4. **Admin Participants View & Export**:
   - Table columns: `ชื่อ-สกุล`, `อีเมล`, `เบอร์โทร`, `ลิงก์พอร์ต`, `เวลาลงทะเบียน`.
   - Link button opens in a new tab (`target="_blank"`).
   - Export Excel includes the `ลิงก์พอร์ต` column.

## Architecture & Data Flow
1. **Prisma Schema**:
   - `Activities.require_portfolio`: `Boolean @default(false)`
   - `RegisterActivities.portfolio_url`: `String? @db.VarChar(2048)`
2. **API Endpoints**:
   - `POST /api/km/activities`: accepts `require_portfolio`.
   - `PUT /api/km/activities/[id]`: updates `require_portfolio`.
   - `GET /api/km/activities/[id]`: returns `require_portfolio` and each registration's `portfolio_url`.
   - `POST /api/student/activities/[id]/register`: accepts `{ portfolio_url?: string }`.
   - `PUT /api/student/activities/[id]/register` or action update: allows updating `portfolio_url` without unregistering.
3. **Frontend Components**:
   - `AddActivityPage.tsx`: Switch for `require_portfolio`.
   - `ViewActivityPage.tsx`: Edit modal switch, participants table column with clickable link, and Excel export.
   - `ViewActivityByID.tsx`: Registration modal with portfolio input, helper notice, and update button if registered.
