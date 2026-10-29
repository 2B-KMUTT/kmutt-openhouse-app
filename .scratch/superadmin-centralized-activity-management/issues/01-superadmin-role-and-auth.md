# 01: Super Admin Role Foundation & Authentication

**What to build:**  
When an administrator logs into the KMUTT administrative portal, the system recognizes their authorization tier. Accounts designated as central coordinators (`KM_admin` and `superadmin`) receive the `SUPER_ADMIN` role embedded in their session and token, while all other faculty and department accounts receive the standard `ADMIN` role. An initial verification test suite is established to validate authorization boundaries end-to-end.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Model `Admins` includes an `AdminRole` enum with `SUPER_ADMIN` and `ADMIN`, defaulting to `ADMIN`.
- [x] Database seeds and sync scripts provision `KM_admin` and `superadmin` with role `SUPER_ADMIN`.
- [x] NextAuth session and JWT callbacks expose `adminRole: "SUPER_ADMIN" | "ADMIN"` to both frontend and backend handlers.
- [x] Middleware and existing route guards for `/_km/*` continue to function without regression.
- [x] Integration test script `scripts/verify-superadmin-activities.js` exists and verifies that `KM_admin` receives `SUPER_ADMIN` and regular admins receive `ADMIN`.
