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
