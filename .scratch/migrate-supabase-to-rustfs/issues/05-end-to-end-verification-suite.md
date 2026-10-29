# 05: End-to-End Verification Suite (`test:storage`)

**What to build:**
Create `scripts/verify-rustfs-migration.js` and add `"test:storage"` to `package.json`. The suite tests: student upload -> public image fetch -> student delete -> physical asset removal -> 5-picture quota violation -> zero Supabase imports -> volume backup script sanity.

**Blocked by:** 04: Supabase Decommissioning & Native Docker Volume Backup

**Status:** resolved

- [x] `scripts/verify-rustfs-migration.js` executes the full end-to-end verification
- [x] `"test:storage": "node scripts/verify-rustfs-migration.js"` added to `package.json`
- [x] Verification script passes 100% green
- [x] Full test suite (`npm run typecheck`, `npm run test:auth`, `npm run test:storage`) passes without errors
