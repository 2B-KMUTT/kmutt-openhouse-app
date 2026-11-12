# 03: Admin Participant Review & Excel Export

**What to build:**
Admins (Ratchaburi Admin and Super Admin) can view submitted portfolio links in the participants table for any activity, click directly to open them in a new tab, and export the complete participant roster including portfolio links to Excel.

**Blocked by:** 02: Student Workshop Registration with Portfolio Modal & In-Place Link Update

**Status:** resolved

- [x] In `src/pages/api/km/activities/[id].ts`, return `portfolio_url` inside each registration object in `registrations`.
- [x] In `ViewActivityPage.tsx`, add table column `ลิงก์พอร์ต` in the participants tab.
- [x] Provide a clean button / link to open the submitted URL in a new tab (`target="_blank"`, `rel="noopener noreferrer"`), or `-` if none.
- [x] Update the `handleExportExcel` function in `ViewActivityPage.tsx` to include `ลิงก์พอร์ต: reg.portfolio_url || "-"` in the exported `.xlsx` file.
