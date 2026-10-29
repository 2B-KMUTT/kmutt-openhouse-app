# 04: Supabase Decommissioning & Native Docker Volume Backup

**What to build:**
Completely decommission Supabase: uninstall `@supabase/supabase-js`, delete `src/libs/supabase.ts`, delete `scripts/backup-supabase.js`, and remove all `NEXT_PUBLIC_SUPABASE_*` environment variables from `.env` and `.env.example`. Update `scripts/backup-all.sh` to archive the `rustfs_data` Docker volume directly into a compressed `.tar.gz` archive.

**Blocked by:** 03: Student Photo Upload & Deletion Migration to RustFS

**Status:** resolved

- [x] `@supabase/supabase-js` removed from `package.json` and lockfiles
- [x] `src/libs/supabase.ts` deleted
- [x] `scripts/backup-supabase.js` deleted
- [x] `NEXT_PUBLIC_SUPABASE_*` removed from `.env` and `.env.example`
- [x] `scripts/backup-all.sh` archives `rustfs_data` volume directly
- [x] `README.md` updated to reflect RustFS object storage instead of Supabase
