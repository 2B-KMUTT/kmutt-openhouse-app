# 03: Global Activity Dashboard & Multi-Faculty Filtering

**What to build:**  
When a Super Admin visits the activity dashboard (`/_km/dashboard`), they see all activities across the entire university in one unified view. A filter dropdown allows them to view activities from all faculties or filter down to a specific faculty or unit. Each activity card clearly displays its owner. Regular faculty admins continue to see only their own faculty's activities with no change to their workflow.

**Blocked by:** 02: Cross-Tenant Activity Creation & Dual-Tier Staff Auto-Assign

**Status:** resolved

- [x] Backend API returns all university activities when invoked by a Super Admin.
- [x] Backend API supports an `ownerId` query parameter for Super Admin to filter activities by specific faculty.
- [x] Backend API strictly enforces `where: { ownerId: req.user.id }` when called by regular admins.
- [x] Dashboard displays an owner badge/label on activity cards for Super Admin.
- [x] Dashboard includes a faculty filter dropdown for Super Admin that updates the displayed list.
- [x] Automated verification in `scripts/verify-superadmin-activities.js` asserts that Super Admin retrieves cross-faculty activities while regular admins receive scoped lists.
