# AGENTS.md

## Navigation pointers

- **Auth & Multi-role Login**: `src/pages/api/auth/[...nextauth].ts` (NextAuth `authorize`/`jwt`/`session`), `src/views/pages/auth/LoginPage.tsx` (`getDashboardPathByRole`), `src/middleware.ts` (route guard), `src/libs/authGuard.ts` (API guard), `src/types/next-auth.d.ts` (`AppRole`).
- **Registration & Password Reset**: `src/views/pages/auth/RegisterPage.tsx`, `src/pages/api/register.ts`, `src/pages/api/auth/forgot-password.ts`, `src/pages/api/auth/reset-password/index.ts`, `src/pages/api/staff/search-students.ts`, `src/pages/api/staff/reset-student-password.ts`.
- **Database Schema & Seeds**: `prisma/schema.prisma`, `prisma/seed.js`, `prisma/seed-test.js`, `prisma/data/`.
- **Verification Scripts**: `scripts/verify-all-features.js` (landing & survey), `scripts/verify-auth-roles.js` (multi-role auth & routing).

## Agent skills

### Issue tracker

Issues and specs are tracked as local markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context layout (`GLOSSARY.md` at the repo root and ADRs in `docs/adr/`). See `docs/agents/domain.md`.
