# 04: Seed Mock Test Data & Manual Testing Playbook

**What to build:**
A dedicated test seed script and manual testing playbook so developers can test the entire workflow locally (`run dev`) with pre-seeded student and admin accounts.

**Blocked by:** 03: Admin Participant Review & Excel Export

**Status:** resolved

- [x] Provide test seed script / function to create a sample workshop activity under มจธ.ราชบุรี with `require_portfolio = true` and a registered student with a sample portfolio link.
- [x] Provide clear execution steps for `npx prisma db push`, `npx prisma generate`, and `npm run dev`.
- [x] Document verified credentials for student testing (`student@kmutt.ac.th` / `password123`) and admin testing (`KM_ratchaburi`, `KM_admin`).
- [x] End-to-end verification checklist covering activity creation, registration modal, in-place update, participant table, and Excel export.
