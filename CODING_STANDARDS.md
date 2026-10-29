# Coding Standards

## Scope Discipline

- **Logic-only fixes must not alter UI**: When asked to fix logic, authentication, state, or backend bugs, do not modify UI copy, labels, placeholders, badges, or layout structure unless explicitly requested by the user.
- **Preserve surrounding comments and formatting**: Keep existing comments and docstrings intact unless directly invalidated by the change.

## Authentication & Multi-Role Rules

- **Supported roles (`AppRole`)**: `"student" | "parent" | "teacher" | "guest" | "staff" | "kmuser"`.
  - `Admins` table maps to `"kmuser"` (`/_km/dashboard`).
  - `Staffs` table maps to `"staff"` (`/staff/dashboard`).
  - `Students` table stores `"student"` (`/app/dashboard`) and `"parent" | "teacher" | "guest"` (`/guest/dashboard`).
- **Non-unique identifier lookup**: In the `Students` table, only `email` and `uuid` are unique (`phone`, `citizen_id`, and `passport_id` may be shared across family members or null). Always use `findMany` and verify `bcrypt.compare` across all matched rows rather than `findFirst`.
- **Input sanitization**: Always `.trim()` user-supplied login/registration identifiers (`email`, `username`, `phone`, `citizen_id`, `passport_id`) before querying or persisting.
- **PrismaClient singleton**: Reuse `globalThis.prisma` in Next.js API routes to prevent connection pool exhaustion during hot reloads and concurrent requests.

## Landing CMS & Config Key Rules

- **Bidirectional key synchronization**: To prevent key mismatches between back-office and front-end, always keep `heroLocationText` ⟷ `eventLocationTh` and `heroDateText` ⟷ `eventDateTh` synchronized in both `/api/km/landing/config` (PUT/GET) and `/api/landing/config` (GET).
- **TypeScript typed keys**: Reference `KnownLandingConfigKey` in `src/interfaces/LandingContent.ts` when introducing or querying config entries.

## Git & PR Workflow Rules

- **Branch before coding**: Never accumulate multiple uncommitted features on local `main`. Always create a descriptive branch (`fix/<slug>` or `feat/<slug>`) branched from `origin/main` before implementing changes.
- **Atomic commits**: Keep commits focused and granular following Conventional Commits (`fix:`, `feat:`, `chore:`, `docs:`, `ci:`, `test:`).
