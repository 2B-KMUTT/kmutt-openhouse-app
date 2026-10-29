# 05: Centralized Staff Management & Cross-Faculty Overview

**What to build:**  
When a Super Admin visits the staff management page (`/_km/staff`), they can view staff members from all faculties in a single table, with a faculty filter to inspect individual departments. The Super Admin can create new staff accounts for any faculty and manually adjust activity mappings across any faculty's staff. Regular faculty admins continue to see and manage only their own staff.

**Blocked by:** 04: Centralized Activity Editing, Deletion & Ownership Transfer

**Status:** resolved

- [x] Backend staff API returns all staff across the university when called by a Super Admin.
- [x] Backend staff API allows Super Admin to specify `adminId` when creating a staff account.
- [x] Staff management UI displays a faculty filter dropdown for Super Admin.
- [x] Super Admin can open the "Assign Activities" modal for any staff and save custom assignments.
- [x] Regular faculty admins continue to only view and manage their own staff.
- [x] Automated verification in `scripts/verify-superadmin-activities.js` tests centralized staff listing, staff creation under another faculty, and cross-tenant staff mapping.
