# EduMunch: Remaining Work - Route Implementation

> This document outlines what is remaining for Phase 3 (Route Implementation) after Phase 4 (Default Roles SQL) is completed.

---

## Current Status

| Phase   | Description                         | Status           |
| ------- | ----------------------------------- | ---------------- |
| Phase 1 | Foundation & Core Setup             | ✅ Completed     |
| Phase 2 | Tier 1, 2, 3 Feature Implementation | ✅ Completed     |
| Phase 3 | Route Implementation                | ⏳ Pending       |
| Phase 4 | Default Roles & Permissions SQL     | 🔄 Next Priority |

---

## Phase 4: Default Roles SQL (NEXT PRIORITY)

Create an SQL file that:

- Uses a variable `INDEX_TOKEN` at the top (e.g., `1EMAET`)
- Creates default system roles for the school
- Assigns permissions to each role
- Makes the website functional out of the box

**File to create:** `Schema/default_roles_permissions.sql`

---

## Phase 3: Route Implementation (AFTER PHASE 4)

### Reference Document

All routes are defined in: `Documentation/ROUTES_FOR_FEATURES.md`

---

### Phase 3.1: Tier 1 Routes

#### Existing Pages (Just need route mapping)

| Existing File          | Route(s) to Map                                                        |
| ---------------------- | ---------------------------------------------------------------------- |
| `Auth.tsx`             | `/login`, `/forgot-password`, `/reset-password`                        |
| `Profile.tsx`          | `/profile`, `/profile/edit`, `/profile/change-password`                |
| `Users.tsx`            | `/users`, `/users/create`, `/users/:id`, `/users/:id/edit`             |
| `Roles.tsx`            | `/roles`, `/roles/create`, `/roles/:id/edit`, `/roles/:id/permissions` |
| `Classes.tsx`          | `/classes`, `/classes/create`, `/classes/:id`, `/classes/:id/edit`     |
| `Batches.tsx`          | `/sections/*` routes                                                   |
| `Subjects.tsx`         | `/subjects/*` routes                                                   |
| `Topics.tsx`           | `/topics/*` routes                                                     |
| `Attendance.tsx`       | `/attendance/*` routes                                                 |
| `Timetables.tsx`       | `/timetable/*` routes                                                  |
| `LectureTemplates.tsx` | `/lecture-templates/*` routes                                          |
| `Results.tsx`          | `/exams/*` routes                                                      |
| `Payments.tsx`         | `/fees/*` routes                                                       |
| `Notifications.tsx`    | `/notifications/*`, `/announcements/*` routes                          |
| `Dashboard.tsx`        | `/dashboard`                                                           |

#### New Pages to Create

| Module           | Routes                           | New File(s) Needed                                                     |
| ---------------- | -------------------------------- | ---------------------------------------------------------------------- |
| Students         | 20 routes (`/students/*`)        | `Students.tsx` + sub-pages for create/edit/details/documents/promotion |
| Parents          | 4 routes (`/parents/*`)          | `Parents.tsx`                                                          |
| Parent Portal    | 10 routes (`/parent/*`)          | `ParentPortal.tsx` + child detail pages                                |
| Teachers         | 10 routes (`/teachers/*`)        | `Teachers.tsx` + sub-pages                                             |
| Academic Years   | 6 routes (`/academic-years/*`)   | `AcademicYears.tsx`                                                    |
| Staff Attendance | 7 routes (`/staff/attendance/*`) | `StaffAttendance.tsx`                                                  |
| Leave Requests   | 5 routes (`/leave-requests/*`)   | Can extend `LeaveManagement.tsx`                                       |
| Marks Entry      | 6 routes (`/exams/:id/marks/*`)  | `MarksEntry.tsx`                                                       |
| Report Cards     | 5 routes (`/report-cards/*`)     | `ReportCards.tsx`                                                      |
| Settings         | 17 routes (`/settings/*`)        | `Settings.tsx` + sub-pages (school-info, calendar, grading, backup)    |
| ID Cards         | 10 routes (`/id-cards/*`)        | `IDCards.tsx`                                                          |
| Reports          | 16 routes (`/reports/*`)         | `Reports.tsx` + sub-pages                                              |
| Messages         | 7 routes (`/messages/*`)         | `Messages.tsx`                                                         |

#### Route Count: ~150 routes

---

### Phase 3.2: Tier 2 Routes

#### Existing Pages (Just need route mapping)

| Existing File           | Route(s) to Map                       |
| ----------------------- | ------------------------------------- |
| `Assignments.tsx`       | `/assignments/*` routes               |
| `Employees.tsx`         | `/employees/*` routes                 |
| `SalaryStructures.tsx`  | `/payroll/salary-structures/*` routes |
| `Payslips.tsx`          | `/payroll/payslips/*` routes          |
| `LeaveManagement.tsx`   | `/hr/leave/*` routes                  |
| `AvailabilitySlots.tsx` | Part of PTM system                    |
| `PTMRequests.tsx`       | Part of PTM system                    |
| `Doubts.tsx`            | LMS doubts feature                    |
| `Feedback.tsx`          | `/feedback/*` routes                  |
| `Grievances.tsx`        | `/grievances/*` routes                |
| `SupportTickets.tsx`    | `/support/*` routes                   |

#### New Pages to Create

| Module             | Routes                          | New File(s) Needed                                                   |
| ------------------ | ------------------------------- | -------------------------------------------------------------------- |
| Study Materials    | 9 routes (`/study-materials/*`) | `StudyMaterials.tsx`                                                 |
| Online Classes     | 10 routes (`/online-classes/*`) | `OnlineClasses.tsx`                                                  |
| Transport          | 20 routes (`/transport/*`)      | `Transport.tsx` + sub-pages (routes, vehicles, drivers, allocations) |
| Payroll Processing | 12 routes (`/payroll/*`)        | `Payroll.tsx` (dashboard + processing)                               |
| PF/ESI             | 4 routes (`/payroll/pf-esi/*`)  | `PFESI.tsx`                                                          |
| Appraisals         | 6 routes (`/hr/appraisals/*`)   | `Appraisals.tsx`                                                     |
| Recruitment        | 9 routes (`/hr/recruitment/*`)  | `Recruitment.tsx`                                                    |
| Homework           | 13 routes (`/homework/*`)       | `Homework.tsx`                                                       |

#### Route Count: ~100 routes

---

### Phase 3.3: Tier 3 Routes

#### Existing Pages (Just need route mapping)

| Existing File    | Route(s) to Map        |
| ---------------- | ---------------------- |
| `Branches.tsx`   | `/branches/*` routes   |
| `Admissions.tsx` | `/admissions/*` routes |
| `Inventory.tsx`  | `/inventory/*` routes  |

#### New Pages to Create

| Module       | Routes                         | New File(s) Needed                           |
| ------------ | ------------------------------ | -------------------------------------------- |
| Analytics    | 11 routes (`/analytics/*`)     | `Analytics.tsx` + sub-pages                  |
| PTM Extended | 14 routes (`/ptm/*`)           | Extend `PTMRequests.tsx` or create `PTM.tsx` |
| Alumni       | 19 routes (`/alumni/*`)        | `Alumni.tsx` + sub-pages                     |
| Certificates | TBD routes (`/certificates/*`) | `Certificates.tsx`                           |

#### Route Count: ~90 routes

---

### Phase 3.4: Final Integration

#### Tasks

1. Update `App.tsx` with all routes from 3.1, 3.2, 3.3
2. Update sidebar navigation to show routes based on permissions
3. Add breadcrumb navigation
4. Clean up any duplicate or unused pages
5. Test all route guards with different roles

---

## Summary

| Phase     | New Pages to Create | Routes to Map   | Status |
| --------- | ------------------- | --------------- | ------ |
| 3.1       | ~15 new pages       | ~150 routes     | ⏳     |
| 3.2       | ~8 new pages        | ~100 routes     | ⏳     |
| 3.3       | ~4 new pages        | ~90 routes      | ⏳     |
| 3.4       | Integration only    | All routes      | ⏳     |
| **Total** | **~27 new pages**   | **~340 routes** | ⏳     |

---

## Approach for Phase 3

1. **Don't recreate existing pages** - Map them to appropriate routes
2. **Create sub-pages only when needed** - For create/edit/details views
3. **Use React Router nested routes** - For hierarchical URL structure
4. **Apply ProtectedRoute** - With specific module + action for each route
5. **Reuse components** - Use `BasePage.tsx` and existing UI patterns

---

## Files Already Created for Phase 3

| File                                 | Purpose                              | Status     |
| ------------------------------------ | ------------------------------------ | ---------- |
| `src/routes/routeConfig.ts`          | Route configuration with permissions | ✅ Created |
| `src/components/common/BasePage.tsx` | Reusable page template               | ✅ Created |

---

## Priority Order

1. ✅ Complete Phase 4 (Default Roles SQL) - **NEXT**
2. Then Phase 3.1 (Tier 1 Routes)
3. Then Phase 3.2 (Tier 2 Routes)
4. Then Phase 3.3 (Tier 3 Routes)
5. Finally Phase 3.4 (Integration)

---

_Last Updated: December 24, 2025_
