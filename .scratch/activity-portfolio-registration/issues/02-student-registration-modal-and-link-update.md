# 02: Student Workshop Registration with Portfolio Modal & In-Place Link Update

**What to build:**
When a student registers for a workshop requiring a portfolio, a clean modal prompts them to submit their portfolio URL with a concise public sharing notice. Registered students can view and update their submitted link without forfeiting their reserved seat.

**Blocked by:** 01: Core Schema Migration & Admin Activity Toggle

**Status:** resolved

- [x] Update `src/pages/api/student/activities/[id]/index.ts` to return `require_portfolio` and current student's `portfolio_url` if registered.
- [x] Update `src/pages/api/student/activities/[id]/register.ts` to accept `portfolio_url` on registration (trimmed, no restrictive regex).
- [x] Support in-place `portfolio_url` update without deleting the registration or risking participant quota loss.
- [x] In `ViewActivityByID.tsx`, open clean registration modal on clicking "ลงทะเบียนกิจกรรม" when `require_portfolio = true`.
- [x] Modal displays clean URL input with concise helper notice: `* โปรดตั้งค่าลิงก์เป็นสาธารณะ (Public)` (no redundant wrapper divs or AI slop styling).
- [x] If student is already registered, display their submitted link and provide an "แก้ไขลิงก์" button.
