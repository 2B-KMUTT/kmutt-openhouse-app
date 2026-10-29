# Spec: Super Admin Centralized Activity & Staff Management

**Status:** ready-for-agent  
**Feature Slug:** `superadmin-centralized-activity-management`  
**Reference ADR:** [`docs/adr/0001-superadmin-centralized-activity-management.md`](docs/adr/0001-superadmin-centralized-activity-management.md)  
**Glossary:** [`GLOSSARY.md`](GLOSSARY.md)  

---

## Problem Statement

Currently, in the KMUTT OpenHouse administrative portal, each faculty and department is provisioned as an isolated admin account (e.g., `KM_FEN`, `KM_sit`, `KM_cpe`, totaling over 40 accounts in `Admins`). In operational reality, a single central coordinator ("พี่เค้า") is tasked with creating and verifying all activities across the university.

Because each activity creation is restricted to the logged-in admin's identity (`Activities.ownerId = req.user.id`) and the dashboard only returns activities owned by the current user (`where: { ownerId: req.user.id }`), the coordinator is forced into an exhausting routine: logging in as one faculty admin, creating their activities, logging out, logging in as the next faculty admin, and repeating this across 20+ faculties and departments. Furthermore, if the coordinator makes an entry error or needs to inspect activities across faculties, there is no global dashboard, creating an operational bottleneck and high risk of human error during event preparations.

---

## Solution

Empower central administrative accounts (`KM_admin` and `superadmin`) with a `SUPER_ADMIN` role while maintaining `ADMIN` for faculty/department accounts. 

When a Super Admin logs into the portal:
1. **Activity Creation with Flexible Ownership:** The Super Admin can select any faculty or department admin as the Activity Owner (`ownerId`) via a dropdown in the activity creation form.
2. **Dual-tier Staff Auto-Assign:** When an activity is created, even if assigned to a department-level owner (such as `KM_cpe`), the system automatically assigns the activity to both the direct owner's staff and the parent faculty's staff (e.g. `fen-staff01` under `KM_FEN`), ensuring ground staff can scan students immediately.
3. **Global Dashboard with Faculty Filters:** The activity dashboard (`/_km/dashboard`) displays all activities across the entire university by default, with a filter dropdown to view by faculty/admin. The Super Admin has full view, edit, and delete permissions over any activity.
4. **Ownership Transfer Support:** The Super Admin can edit an activity and reassign its owner, automatically re-syncing the corresponding `StaffMapping`.
5. **Centralized Staff Overview:** The staff management page (`/_km/staff`) allows the Super Admin to view and filter staff across all faculties in one unified table.

---

## User Stories

1. As a Super Admin, I want to log in using my single `KM_admin` or `superadmin` account, so that I do not need to switch or juggle 40+ faculty credentials.
2. As a Super Admin, I want my session to carry an explicit `SUPER_ADMIN` authorization role, so that the portal UI and backend APIs grant me centralized permissions across all faculties.
3. As a Super Admin, I want to see an "Activity Owner" dropdown when creating a new activity, so that I can choose which faculty or department owns the activity.
4. As a Super Admin, I want the activity creation form to default to my own account if no other owner is picked, so that I can still create central/university-wide activities effortlessly.
5. As a Super Admin, I want the system to automatically assign newly created activities to the selected owner's staff, so that ground staff can scan student QR codes without manual assignment steps.
6. As a Super Admin, I want newly created activities for a department (e.g., CPE) to also be automatically assigned to the parent faculty staff (e.g., FEN staff), so that faculty-level volunteers at event booths can scan students by default.
7. As a Super Admin, I want to view all activities across all faculties in a single dashboard at `/_km/dashboard`, so that I can monitor the complete schedule and registration status of the entire university.
8. As a Super Admin, I want a faculty filter dropdown on the dashboard, so that I can quickly narrow down the list to review activities belonging to a specific faculty or unit.
9. As a Super Admin, I want to click and view any activity details regardless of which faculty owns it, so that I can review activity information without permission errors.
10. As a Super Admin, I want to edit any activity's information (title, date, capacity, location, description) across all faculties, so that I can fix errors or update details reported by faculty coordinators.
11. As a Super Admin, I want to reassign the owner of an existing activity from the edit modal, so that mistakes in faculty attribution can be corrected without recreating the activity from scratch.
12. As a Super Admin, I want the system to update staff assignments when an activity's ownership is transferred, so that staff mappings always reflect the active owner.
13. As a Super Admin, I want to delete obsolete or duplicated activities belonging to any faculty, so that the public schedule remains clean and accurate.
14. As a Super Admin, I want to view all staff members across all faculties on the `/_km/staff` page, so that I can verify that every faculty has active staff accounts before the event starts.
15. As a Super Admin, I want a faculty filter dropdown on the `/_km/staff` page, so that I can inspect staff members belonging to a specific department or faculty.
16. As a Super Admin, I want to create new staff accounts for any faculty directly from the staff management interface, so that I can assist faculties that need additional accounts created quickly.
17. As a Super Admin, I want to manually adjust activity assignments for any staff member in the system via the assignment modal, so that I can resolve exceptional scheduling requests on the day of the event.
18. As a Faculty Admin, I want to log into my faculty account (`KM_FEN`, `KM_sit`, etc.) and continue to see only my faculty's activities and staff, so that my existing workflow and privacy boundaries remain undisturbed.
19. As a Faculty Admin, I want activities created on my behalf by the Super Admin to appear in my dashboard seamlessly, so that I can see the activities representing my faculty.
20. As a Ground Staff member, I want to log into `/staff/dashboard` and see all activities assigned to my account (including those created by the Super Admin), so that I can immediately scan and stamp attending students.

---

## Implementation Decisions

### 1. Database Schema (`prisma/schema.prisma`)
- Introduce an enum `AdminRole` with values `SUPER_ADMIN` and `ADMIN`.
- Add a `role` field on the `Admins` model: `role AdminRole @default(ADMIN)`.
- Existing admin records default to `ADMIN`.
- Seed scripts (`prisma/seed.js` and `prisma/data/admins-seed.json`) configure `KM_admin` and `superadmin` with `role: "SUPER_ADMIN"`.

```prisma
enum AdminRole {
  SUPER_ADMIN
  ADMIN
}

model Admins {
  id            Int          @id @default(autoincrement())
  username      String       @unique
  password_hash String
  email         String       @unique
  name          String
  role          AdminRole    @default(ADMIN)
  created_at    DateTime     @default(now())
  Activities    Activities[]
  Staffs        Staffs[]
}
```

### 2. Authentication & Session (`src/pages/api/auth/[...nextauth].ts`)
- In NextAuth `authorize` callback, retain `role: "kmuser"` for all admin accounts to ensure middleware route guards (`/_km/*`) remain fully compatible without regressions.
- Embed `adminRole: kmuser.role` inside both the NextAuth JWT token and `session.user`.
- Update `src/types/next-auth.d.ts` to include `adminRole?: "SUPER_ADMIN" | "ADMIN"` on `Session["user"]` and `JWT`.

### 3. Activity API (`src/pages/api/km/activities.ts` & `[id].ts`)
- **GET `/api/km/activities`**:
  - If requester is `SUPER_ADMIN`, query all activities without filtering `where: { ownerId }`. Support optional query parameter `ownerId` to filter by a specific admin.
  - If requester is `ADMIN`, retain strict filtering `where: { ownerId: req.user.id }`.
  - Include admin/owner details (`Admins: { select: { id: true, name: true, username: true } }`) in the returned activity object.
- **POST `/api/km/activities`**:
  - If requester is `SUPER_ADMIN` and `ownerId` is provided in body, validate and set `ownerId: Number(ownerId)`. If omitted, default to `req.user.id`.
  - If requester is regular `ADMIN`, ignore any provided `ownerId` and enforce `ownerId: req.user.id`.
  - **Dual-tier Staff Auto-Assign**:
    - Query direct staff: `prisma.staffs.findMany({ where: { create_by: targetOwnerId } })`.
    - Query parent faculty staff: Fetch the activity's department and its parent faculty. Find faculty-level admin (e.g. matching faculty name or admin username pattern) and fetch its staff.
    - Create `StaffMapping` records for all resolved staff with `skipDuplicates: true`.
- **GET/PUT/DELETE `/api/km/activities/[id].ts`**:
  - If requester is `SUPER_ADMIN`, permit access to any activity by `id`.
  - If requester is regular `ADMIN`, enforce `where: { id, ownerId: req.user.id }`.
  - On `PUT`, if `SUPER_ADMIN` changes `ownerId`, update the activity record and trigger staff mapping re-sync for the new owner.

### 4. Staff API (`src/pages/api/km/staff/index.ts` & `mapping.ts`)
- **GET `/api/km/staff`**:
  - If requester is `SUPER_ADMIN`, return all staff across all admins, supporting an optional `adminId` query parameter.
  - If requester is regular `ADMIN`, enforce `where: { create_by: req.user.id }`.
- **POST `/api/km/staff`**:
  - If requester is `SUPER_ADMIN` and `adminId` is provided in body, assign `create_by: Number(adminId)`. Otherwise default to `req.user.id`.
- **GET/POST `/api/km/staff/mapping.ts`**:
  - If requester is `SUPER_ADMIN`, allow reading and updating mappings for any staff and any activity.
  - If regular `ADMIN`, enforce ownership validation on the activities.

### 5. Frontend Views
- **Add Activity Page (`AddActivityPage.tsx`)**:
  - If `session.user.adminRole === "SUPER_ADMIN"`, display an "เจ้าของกิจกรรม (Activity Owner)" Select input populated from `/api/km/admin-owners` (or admin list).
  - Default to current admin or allow selection.
- **Dashboard (`KMDashboard.tsx`)**:
  - If `session.user.adminRole === "SUPER_ADMIN"`, display a prominent filter dropdown at the top: "เลือกดูตามคณะ/หน่วยงาน (ทั้งหมด / คณะวิศวกรรมศาสตร์ / SIT / ...)".
  - Display owner badge/label on activity cards.
- **View/Edit Activity Page (`ViewActivityPage.tsx`)**:
  - Allow `SUPER_ADMIN` to edit and submit updates on activities owned by any admin.
  - Provide an "Owner" select field in the edit modal for Super Admin.
- **Staff Management (`KMStaff.tsx`)**:
  - If `session.user.adminRole === "SUPER_ADMIN"`, display a filter dropdown by Admin/Faculty and display the parent admin name for each staff.

---

## Testing Decisions

### What makes a good test
- Tests should test observable behaviors through API boundaries and authorization flows rather than private internal implementation details.
- Validates that Super Admin can perform cross-tenant operations while regular Faculty Admins are strictly confined to their own resources.
- Validates data integrity: changing owners re-syncs staff mappings without orphaned records.

### Testing Seam
- **Primary Seam:** Integration test suite executed via Node.js script (`scripts/verify-superadmin-activities.js`), matching existing project patterns (`scripts/verify-auth-roles.js`, `scripts/verify-all-features.js`).
- The test verifies:
  1. NextAuth / AuthGuard returns `adminRole: "SUPER_ADMIN"` for `KM_admin` and `superadmin`, and `"ADMIN"` for other admins.
  2. Super Admin creating an activity for `KM_cpe` results in `ownerId == KM_cpe.id` and auto-assigns both `KM_cpe` staff and `KM_FEN` staff (`fen-staff01`).
  3. Super Admin fetching `/api/km/activities` returns cross-faculty activities, whereas `KM_FEN` fetching only returns its own.
  4. Super Admin editing and updating activity details and ownership succeeds.
  5. Regular Faculty Admin attempting to specify another `ownerId` or view/edit another faculty's activity receives `403 Forbidden` or `404 Not Found`.

### Prior Art
- `scripts/verify-auth-roles.js`: Multi-role login, JWT claim verification, and RBAC matrix.
- `scripts/verify-all-features.js`: API verification against live Prisma and Next.js handlers.

---

## Out of Scope

- Self-service role promotion: Users cannot promote themselves or create new Super Admins via the UI; role assignment is restricted to database/seed scripts.
- Multi-owner activities: An activity can have only one primary `ownerId` (Admin), with shared scanning handled via `StaffMapping`.
- Modifying student-facing registration or mobile stamp workflows: Students continue to register and interact with activities identically.

---

## Further Notes

- The dual-tier auto-assign rule ensures that even if a central coordinator assigns a workshop specifically to a department account (`KM_cpe`), the faculty-level volunteer staff (`fen-staff01`) will automatically receive scanning permissions without needing manual intervention.
