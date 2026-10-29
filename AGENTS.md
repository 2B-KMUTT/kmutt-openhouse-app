# AGENTS.md

## Navigation pointers

- **Auth & Multi-role Login**: `src/pages/api/auth/[...nextauth].ts` (NextAuth `authorize`/`jwt`/`session`), `src/views/pages/auth/LoginPage.tsx` (`getDashboardPathByRole`), `src/middleware.ts` (route guard), `src/libs/authGuard.ts` (API guard), `src/types/next-auth.d.ts` (`AppRole`).
- **Registration & Password Reset**: `src/views/pages/auth/RegisterPage.tsx`, `src/pages/api/register.ts`, `src/pages/api/auth/forgot-password.ts`, `src/pages/api/auth/reset-password/index.ts`, `src/pages/api/staff/search-students.ts`, `src/pages/api/staff/reset-student-password.ts`.
- **Landing Page & CMS**:
  - Front-end views: `src/views/pages/landing/LandingPage.tsx`, `ScheduleSection.tsx`, `BoothSection.tsx`, `BannerSection.tsx`, `MapSection.tsx`, `ContactSection.tsx`.
  - Back-office managers (`/_km/`): `src/views/pages/_km/LandingSettingsManager.tsx`, `LandingScheduleManager.tsx`, `LandingBoothManager.tsx`, `LandingBannerManager.tsx`.
  - APIs & Config: `src/pages/api/landing/config.ts`, `src/pages/api/km/landing/config.ts`, `src/interfaces/LandingContent.ts`.
  - Dual-key sync: `heroLocationText` ⟷ `eventLocationTh`, `heroDateText` ⟷ `eventDateTh`.
- **Survey System**: `src/views/pages/PublicSurvey.tsx`, `src/pages/api/survey.ts`, `src/pages/api/survey/config.ts`, `src/views/pages/_km/SurveySettingsManager.tsx`.
- **Database Schema & Seeds**: `prisma/schema.prisma`, `prisma/seed.js`, `prisma/seed-test.js`, `prisma/data/`.
- **Verification Scripts**: `scripts/verify-all-features.js` (landing & survey), `scripts/verify-auth-roles.js` (multi-role auth & routing).

## Agent skills

### Issue tracker

Issues and specs are tracked as local markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context layout (`GLOSSARY.md` at the repo root and ADRs in `docs/adr/`). See `docs/agents/domain.md`.
