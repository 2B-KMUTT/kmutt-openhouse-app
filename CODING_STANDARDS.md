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
- **PrismaClient singleton**: Reuse `globalThis.prisma` in Next.js API routes or import the singleton from `@/libs/prisma` to prevent connection pool exhaustion during hot reloads and concurrent requests. Never instantiate `new PrismaClient()` directly in API route handlers.

## Landing CMS & Config Key Rules

- **Bidirectional key synchronization**: To prevent key mismatches between back-office and front-end, always keep `heroLocationText` ⟷ `eventLocationTh` and `heroDateText` ⟷ `eventDateTh` synchronized in both `/api/km/landing/config` (PUT/GET) and `/api/landing/config` (GET).
- **TypeScript typed keys**: Reference `KnownLandingConfigKey` in `src/interfaces/LandingContent.ts` when introducing or querying config entries.

## UI & Chakra Design Standards (Anti-"AI Slop")

- **Surface Flattening (No Card-in-Card)**: Views rendered within `KMAppLayout` or `StudentAppLayout` already sit on an outer card panel (`rounded="2xl" shadow="lg"`). Do not wrap child sections, toolbars, or list items in redundant `<Card>`, `<CardBody>`, or heavy shadow containers. Use flat grids, clean dividers (`borderColor="gray.200"`), and flat list rows with subtle hover states (`_hover={{ bg: "gray.50" }}`).
- **Native Chakra Form Primitives**: Never use raw HTML `<select>`, `<input>`, or `<textarea>` tags with inline CSS styles in views. Always use Chakra UI primitives (`<Select>`, `<Input>`, `<Textarea>`, `<Switch>`) with `focusBorderColor="orange.500"` and `rounded="lg"`.
- **Badge & Label Hygiene**:
  - Do not add decorative emojis (e.g. `👑`, `🔥`) to form labels or admin alert boxes.
  - Keep badge font sizes compact (`fontSize="xs"`). Avoid giant `1rem` badges.
  - Use KMUTT CI primary colors (`colorScheme="orange"`, `KMUTT_CI.orange = "#FA4616"`) rather than disconnected accent colors (`blue`, `purple`, `teal`) in admin views.
- **Single Source of Truth for Navigation**: Back-office navigation links must be declared once in `src/constants/kmNavigation.ts` and consumed by both `KMSidebar.tsx` (desktop) and `KMLayout.tsx` (mobile responsive menu). Never hardcode disparate menu links across screen sizes.

## Git & PR Workflow Rules

- **Branch before coding**: Never accumulate multiple uncommitted features on local `main`. Always create a descriptive branch (`fix/<slug>` or `feat/<slug>`) branched from `origin/main` before implementing changes.
- **Atomic commits**: Keep commits focused and granular following Conventional Commits (`fix:`, `feat:`, `chore:`, `docs:`, `ci:`, `test:`).
