# 01: Core Schema Migration & Admin Activity Toggle

**What to build:**
Admins can toggle whether an activity requires/allows portfolio submission. The system stores this flag in the database and updates both the activity creation and editing interfaces in the admin back-office.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Add `require_portfolio Boolean @default(false)` to `Activities` and `portfolio_url String? @db.VarChar(2048)` to `RegisterActivities` in `prisma/schema.prisma`.
- [x] Run Prisma migration / db push and regenerate Prisma client.
- [x] Update `src/libs/activityService.ts` and `src/pages/api/km/activities.ts` to accept and persist `require_portfolio`.
- [x] Update `src/pages/api/km/activities/[id].ts` GET and PUT handlers to return and update `require_portfolio`.
- [x] Add clean Chakra UI Switch for `require_portfolio` in `AddActivityPage.tsx` and the Edit Modal in `ViewActivityPage.tsx`.
