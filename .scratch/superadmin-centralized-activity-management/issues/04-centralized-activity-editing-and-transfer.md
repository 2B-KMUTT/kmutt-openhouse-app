# 04: Centralized Activity Editing, Deletion & Ownership Transfer

**What to build:**  
When a Super Admin inspects an activity in `ViewActivityPage.tsx`, they can view, edit, or delete it even if it belongs to another faculty. If an activity was assigned to the wrong faculty, the Super Admin can reassign its owner from the edit modal. When ownership changes, the system cleans up obsolete staff mappings and auto-assigns the activity to the new owner's staff. Regular admins remain strictly restricted to editing only their own activities.

**Blocked by:** 03: Global Activity Dashboard & Multi-Faculty Filtering

**Status:** resolved

- [x] Backend activity detail API allows Super Admin to view, update, and delete any activity across all faculties.
- [x] Backend activity detail API rejects edit or delete attempts from regular admins on activities they do not own (403/404).
- [x] Super Admin can edit an activity and select a different owner.
- [x] Transferring activity ownership re-syncs `StaffMapping` so that new owner staff gain access.
- [x] Automated verification in `scripts/verify-superadmin-activities.js` tests updating an activity, transferring ownership, and confirming staff mapping re-sync.
