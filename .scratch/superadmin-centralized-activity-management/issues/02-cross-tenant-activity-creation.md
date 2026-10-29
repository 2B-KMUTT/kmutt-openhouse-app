# 02: Cross-Tenant Activity Creation & Dual-Tier Staff Auto-Assign

**What to build:**  
When a Super Admin creates an activity, they can select any faculty or department admin as the activity owner. Upon creation, the activity is attributed to that chosen owner, and the system automatically assigns scanning permissions to both the direct owner's staff and the parent faculty's ground staff (e.g., creating an activity for Computer Engineering `KM_cpe` automatically assigns it to both CPE staff and Faculty of Engineering staff `fen-staff01`). Regular faculty admins cannot choose an owner and can only create activities for themselves.

**Blocked by:** 01: Super Admin Role Foundation & Authentication

**Status:** resolved

- [x] Super Admin sees an "Activity Owner" select dropdown on the activity creation form.
- [x] Regular admins do not see the owner dropdown and automatically create activities owned by their own account.
- [x] Backend API accepts `ownerId` when called by a Super Admin and sets it as the activity's owner.
- [x] Backend API ignores or rejects external `ownerId` when called by regular admins, enforcing their own ID.
- [x] Creating an activity auto-assigns the activity to the staff of the target owner in `StaffMapping`.
- [x] Creating an activity for a department under a faculty auto-assigns the activity to that faculty's staff in `StaffMapping`.
- [x] Automated verification in `scripts/verify-superadmin-activities.js` tests cross-tenant creation and dual-tier staff mapping.
