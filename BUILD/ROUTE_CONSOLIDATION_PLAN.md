# EduMunch: Route Consolidation Plan

> **Goal**: Reduce ~390 routes to ~62 routes (84% reduction) by consolidating multiple routes per module into single unified pages with permission-based sections, tabs, and modals.

---

## Table of Contents

1. [Overview](#overview)
2. [Consolidation Strategy](#consolidation-strategy)
3. [Section-by-Section Plan](#section-by-section-plan)
4. [Implementation Checklist](#implementation-checklist)

---

## Overview

### Current State

| Tier      | Modules | Routes  |
| --------- | ------- | ------- |
| Tier 1    | 31      | 231     |
| Tier 2    | 12      | 90      |
| Tier 3    | 8       | 69      |
| **Total** | **51**  | **390** |

### Target State

| Tier      | Modules | Routes  | Reduction |
| --------- | ------- | ------- | --------- |
| Tier 1    | 31      | ~35     | 85%       |
| Tier 2    | 12      | ~15     | 83%       |
| Tier 3    | 8       | ~12     | 83%       |
| **Total** | **51**  | **~62** | **84%**   |

---

## Consolidation Strategy

### Core Principles

1. **One Module = One Primary Route** (with possible sub-routes for complex detail views)
2. **Permission-Based UI Rendering**: Show/hide buttons, tabs, sections based on `useModulePermissions()`
3. **Modals for Create/Edit**: Instead of separate `/create` and `/:id/edit` routes
4. **Tabs for Related Views**: Group related views (Reports, History, Settings) as tabs
5. **Drawers for Quick Details**: Use slide-out drawers for viewing details without navigation

### UI Patterns

| Old Pattern                | New Pattern                     |
| -------------------------- | ------------------------------- |
| `/module/create` route     | "Add" button → Modal            |
| `/module/:id` route        | Row click → Drawer or Tab       |
| `/module/:id/edit` route   | "Edit" button in drawer → Modal |
| `/module/reports/*` routes | "Reports" tab in main page      |
| `/module/export` route     | "Export" button in toolbar      |

### What Stays as Separate Routes

- **Complex detail pages** with multiple tabs (e.g., `/students/:id`, `/exams/:id`)
- **Fundamentally different views** (e.g., `/my-timetable` vs `/timetable`)
- **Portal pages** (e.g., `/parent/children/:id`)

---

## Section-by-Section Plan

### Section 1: Core/Always Visible ✅ COMPLETED

| Module    | Current | Proposed | Strategy                          |
| --------- | ------- | -------- | --------------------------------- |
| Dashboard | 1       | 1        | Keep as is                        |
| Profile   | 4       | 1        | Tabs: View, Edit, Password, Photo |

**Routes After:**

```
/dashboard
/profile
```

**Implementation Notes:**

- ✅ Profile page already has tabs (Profile, Security, Notifications)
- ✅ Updated `routeConfig.ts` - kept only `/profile` route
- ✅ Updated `sidebarConfig.ts` - removed subItems

---

### Section 2: User Management ✅ COMPLETED

| Module      | Current | Proposed | Strategy               |
| ----------- | ------- | -------- | ---------------------- |
| Users       | 8       | 2        | List + modals for CRUD |
| Roles       | 5       | 2        | List + modals          |
| Permissions | 1       | 1        | Keep as is             |

**Routes After:**

```
/users
/users/:id          (detail view)
/roles
/roles/:id          (detail view)
/permissions
```

**Implementation Notes:**

- ✅ Created `UserFormDialog.tsx` - modal for create/edit users
- ✅ Updated `UserTable.tsx` and `UserCard.tsx` to use `onEdit` callback
- ✅ Updated `UsersList.tsx` to use modal instead of navigation
- ✅ Created `RoleFormDialog.tsx` - modal for create/edit roles
- ✅ Updated `RoleTable.tsx` and `RoleCard.tsx` to use `onEdit` callback
- ✅ Updated `RolesList.tsx` to use modal instead of navigation
- ✅ Updated `routeConfig.ts` - removed create/edit routes
- ✅ Updated `sidebarConfig.ts` - removed subItems

---

### Section 3: People Management ✅ COMPLETED

| Module    | Current | Proposed | Strategy                         |
| --------- | ------- | -------- | -------------------------------- |
| Students  | 20      | 2        | List page + Detail page (tabbed) |
| Parents   | 4       | 1        | List + modals                    |
| Teachers  | 10      | 2        | List page + Detail page          |
| Employees | 7       | 1        | List + modals                    |

**Routes After:**

```
/students
/students/:id
/parents
/teachers
/teachers/:id
/employees
```

**Implementation Notes:**

- ✅ Created `StudentFormDialog.tsx` - modal for create/edit students
- ✅ Updated `StudentsList.tsx` to use modal instead of navigation
- ✅ Created `ParentFormDialog.tsx` - modal for create/edit parents
- ✅ Updated `ParentsList.tsx` to use modal instead of navigation
- ✅ Created `TeacherFormDialog.tsx` - modal for create/edit teachers
- ✅ Updated `TeachersList.tsx` to use modal instead of navigation
- ✅ Created `EmployeeFormDialog.tsx` - modal for create/edit employees
- ✅ Updated `EmployeesList.tsx` to use modal instead of navigation
- ✅ Updated `EmployeeTable.tsx` and `EmployeeCard.tsx` to use `onEdit` callback
- ✅ Updated `routeConfig.ts` - reduced from 41 routes to 6 routes
- ✅ Updated `sidebarConfig.ts` - removed subItems

---

### Section 4: Academic Structure ✅ COMPLETED

| Module         | Current | Proposed | Strategy      |
| -------------- | ------- | -------- | ------------- |
| Academic Years | 6       | 1        | List + modals |
| Classes        | 5       | 1        | List + modals |
| Sections       | 7       | 1        | List + modals |
| Subjects       | 7       | 1        | List + modals |
| Topics         | 7       | 1        | List + modals |

**Routes After:**

```
/academic-years
/classes
/sections
/subjects
/topics
```

**Implementation Notes:**

- ✅ Created `AcademicYearFormDialog.tsx` - modal for create/edit academic years
- ✅ Updated `AcademicYearsList.tsx` to use modal instead of navigation
- ✅ Created `ClassFormDialog.tsx` - modal for create/edit classes
- ✅ Updated `ClassesList.tsx` to use modal instead of navigation
- ✅ Updated `ClassTable.tsx` and `ClassCard.tsx` to use `onEdit` callback
- ✅ Created `SectionFormDialog.tsx` - modal for create/edit sections
- ✅ Updated `SectionsList.tsx` to use modal instead of navigation
- ✅ Created `SubjectFormDialog.tsx` - modal for create/edit subjects
- ✅ Updated `SubjectsList.tsx` to use modal instead of navigation
- ✅ Updated `SubjectTable.tsx` and `SubjectCard.tsx` to use `onEdit` callback
- ✅ Created `TopicFormDialog.tsx` - modal for create/edit topics
- ✅ Updated `TopicsList.tsx` to use modal instead of navigation
- ✅ Updated `routeConfig.ts` - reduced from 32 routes to 5 routes
- ✅ Updated `sidebarConfig.ts` - removed subItems

---

### Section 5: Attendance & Leave ✅ COMPLETE

| Module             | Current | Proposed | Strategy                                  |
| ------------------ | ------- | -------- | ----------------------------------------- |
| Student Attendance | 14      | 1        | Dashboard with tabs (Mark, View, Reports) |
| Staff Attendance   | 7       | 1        | Dashboard with tabs                       |
| Student Leave      | 5       | 1        | List + modals                             |
| Staff Leave        | 6       | 1        | Tabs (My Leaves, Apply, Balance)          |

**Routes After:**

```
/attendance
/staff/attendance
/leave-requests
/staff/leave
```

**Implementation Notes:**

- ✅ Updated `routeConfig.ts` - reduced from 32 routes to 4 routes
- ✅ Updated `sidebarConfig.ts` - removed all subItems for attendance/leave modules
- ✅ Updated `App.tsx` - removed unused route mappings
- ✅ Updated `AttendanceList.tsx` - consolidated tabs (Schedule, Mark, Reports, Student Report)
- ✅ Created `LeaveFormDialog.tsx` - modal for creating leave requests
- ✅ Created `LeaveDetailsDialog.tsx` - modal for viewing/approving/rejecting leave
- ✅ Updated `LeaveRequestsPage.tsx` - uses modal dialogs instead of navigation
- ✅ Staff Leave uses existing `LeaveManagement.tsx` page

---

### Section 6: Timetable ✅ COMPLETED

| Module            | Current | Proposed | Strategy                       |
| ----------------- | ------- | -------- | ------------------------------ |
| Timetable         | 14      | 2        | Management page + My Timetable |
| Lecture Templates | 5       | 1        | List + modals                  |

**Routes After:**

```
/timetable
/my-timetable
/lecture-templates
```

**Implementation Notes:**

- ✅ Updated `routeConfig.ts` - reduced Timetable from 14 to 2 routes, Lecture Templates from 5 to 1 route
- ✅ Updated `sidebarConfig.ts` - removed subItems for timetable/lecture-templates modules
- ✅ Updated `App.tsx` - kept only TimetableDashboard, MyTimetablePage, LectureTemplatesList
- ✅ Created `LectureTemplateFormDialog.tsx` - modal for create/edit lecture templates
- ✅ Created `LectureTemplateDetailDialog.tsx` - modal for viewing template details
- ✅ Updated `LectureTemplatesList.tsx` - uses modal dialogs instead of navigation
- ✅ Updated `index.ts` exports for lecture-templates components

---

### Section 7: Examinations ✅ COMPLETED

| Module       | Current | Proposed | Strategy                |
| ------------ | ------- | -------- | ----------------------- |
| Exams        | 10      | 2        | List + Detail page      |
| Marks        | 6       | 0        | Merged into Exam detail |
| Report Cards | 5       | 1        | Single page             |

**Routes After:**

```
/exams
/exams/:id
/report-cards
```

**Implementation Notes:**

- ✅ Updated `routeConfig.ts` - Exams 10→2 routes, Marks 6→0 (merged), Report Cards 5→1
- ✅ Updated `sidebarConfig.ts` - removed subItems for exams/report cards modules
- ✅ Updated `App.tsx` - kept only ExamsList, ExamDetail, ReportCardsPage
- ✅ Created `ExamFormDialog.tsx` - modal for create/edit exams
- ✅ Updated `ExamsList.tsx` - uses modal dialogs instead of navigation
- ✅ Updated `index.ts` exports for exams components
- Note: Schedule, Marks Entry, Report Card generation accessible via tabs in ExamDetail page

---

### Section 8: Finance ✅ COMPLETED

| Module | Current | Proposed | Strategy                    |
| ------ | ------- | -------- | --------------------------- |
| Fees   | 22      | 2        | Dashboard + Collection page |

**Routes After:**

```
/fees
/fees/collect
```

**Implementation Notes:**

- ✅ Updated `routeConfig.ts` - Fees 22→2 routes (main page + collect)
- ✅ Updated `sidebarConfig.ts` - removed subItems for fees module
- ✅ Updated `App.tsx` - kept only FeeStructuresList, FeeCollectionPage
- ✅ Created `FeeStructureFormDialog.tsx` - modal for create/edit fee structures
- ✅ Created `FeeStructureDetailDialog.tsx` - modal for viewing structure details
- ✅ Updated `FeeStructuresList.tsx` - uses modal dialogs instead of navigation
- ✅ Updated `index.ts` exports for fees components
- Note: Receipts, Reports, Discounts accessible via tabs in main Fee Management page

---

### Section 9: Communication ✅ COMPLETED

| Module        | Current | Proposed | Strategy                           | Status |
| ------------- | ------- | -------- | ---------------------------------- | ------ |
| Announcements | 5       | 1        | List + modals                      | ✅     |
| Notifications | 3       | 1        | Single page                        | ✅     |
| Messages      | 6       | 1        | Tabs (Compose, Templates, History) | ✅     |

**Routes After:**

```
/announcements
/notifications
/messages
```

**Implementation Notes:**

- `Notifications.tsx` already combines announcements and notifications functionality with tabs
- Routes consolidated from 14 → 3 in routeConfig.ts
- Sidebar subItems removed for all three modules
- Messages page would use tabs for Compose/SMS/Email/Templates/History when implemented

---

### Section 10: Settings & Reports ✅ COMPLETED

| Module   | Current | Proposed | Strategy                       | Status |
| -------- | ------- | -------- | ------------------------------ | ------ |
| Settings | 6       | 1        | Tabs/Sections                  | ✅     |
| ID Cards | 6       | 1        | Tabs (Student/Staff/Templates) | ✅     |
| Reports  | 7       | 1        | Report type selector           | ✅     |

**Routes After:**

```
/settings
/id-cards
/reports
```

**Implementation Notes:**

- Routes consolidated from 19 → 3 in routeConfig.ts
- Sidebar subItems removed for all three modules
- App.tsx lazy imports reduced (ID Cards: 4→1, Reports: 5→1)
- App.tsx route mappings reduced (ID Cards: 7→1, Reports: 5→1)
- Settings page uses tabs for School/Academic/Fees/Communication/Notifications
- ID Cards dashboard uses tabs for Student IDs/Staff IDs/Templates
- Reports dashboard uses report type selector

---

### Section 11: Parent Portal ✅ COMPLETED

| Module        | Current | Proposed | Strategy                 | Status |
| ------------- | ------- | -------- | ------------------------ | ------ |
| Parent Portal | 10      | 2        | Dashboard + Child detail | ✅     |

**Routes After:**

```
/parent/dashboard
/parent/children/:id
```

**Implementation Notes:**

- Routes consolidated from 10 → 2 in routeConfig.ts
- Dashboard shows children list, child details via `/parent/children/:id` with tabs
- Tabs: Profile, Attendance, Results, Fees, Homework, Timetable, Teachers
- Pay Fees accessible via modal from dashboard or child's fees tab
- Sidebar subItems removed

---

### Section 12: Learning (Tier 2) ✅ COMPLETED

| Module          | Current | Proposed | Strategy                         | Status |
| --------------- | ------- | -------- | -------------------------------- | ------ |
| Assignments     | 10      | 2        | List + Detail (with submissions) | ✅     |
| Study Materials | 7       | 1        | Single page with filters         | ✅     |
| Online Classes  | 8       | 1        | Tabs (Schedule, My Classes)      | ✅     |
| Homework        | 7       | 1        | Single page                      | ✅     |
| Doubts          | 6       | 1        | Tabs (Ask, My Doubts)            | ✅     |

**Routes After:**

```
/assignments
/assignments/:id
/study-materials
/online-classes
/homework
/doubts
```

**Implementation Notes:**

- Routes consolidated from 38 → 6 in routeConfig.ts
- Assignments: List page + Detail with submissions tab, create/edit via modals
- Study Materials: Single page with subject/class filters, upload via modal
- Online Classes: Tabs for Schedule/My Classes/Recordings
- Homework: Single page with date filter, create/edit via modals
- Doubts: Tabs for Ask/My Doubts/All, answer via modal
- All sidebar subItems removed

---

### Section 13: Transport (Tier 2) ✅ COMPLETED

| Module    | Current | Proposed | Strategy                                   | Status |
| --------- | ------- | -------- | ------------------------------------------ | ------ |
| Transport | 12      | 1        | Tabs (Routes, Vehicles, Drivers, Tracking) | ✅     |

**Routes After:**

```
/transport
```

**Implementation Notes:**

- Routes consolidated from 12 → 1 in routeConfig.ts
- Tabs: Routes, Vehicles, Drivers, Student Assignments, Live Tracking
- All CRUD operations handled via modals within each tab
- App.tsx lazy imports reduced from 5 to 1
- App.tsx route mappings reduced from 5 to 1
- Sidebar subItems removed

---

### Section 14: HR & Payroll (Tier 2) ✅ COMPLETED

| Module      | Current | Proposed | Strategy                             | Status |
| ----------- | ------- | -------- | ------------------------------------ | ------ |
| Payroll     | 8       | 1        | Tabs (Structures, Process, Payslips) | ✅     |
| Appraisals  | 6       | 1        | Single page                          | ✅     |
| Recruitment | 9       | 2        | Jobs list + Job detail               | ✅     |

**Routes After:**

```
/payroll
/appraisals
/recruitment
/recruitment/jobs/:id
```

**Implementation Notes:**

- Routes consolidated from 23 → 4 in routeConfig.ts
- Payroll: Tabs for Structures/Process/Payslips/My Payslips
- Appraisals: Single page with All/My Appraisals tabs
- Recruitment: Dashboard + Job detail with applications
- All sidebar subItems removed
- Legacy `/salary-structures` and `/payslips` routes remain in App.tsx as standalone pages

---

### Section 15: Support & Feedback (Tier 2)

### Section 15: Support & Feedback (Tier 2) ✅ COMPLETED

| Module     | Current | Proposed | Strategy    | Status |
| ---------- | ------- | -------- | ----------- | ------ |
| Feedback   | 5       | 1        | Single page | ✅     |
| Grievances | 6       | 1        | Single page | ✅     |
| Support    | 6       | 1        | Single page | ✅     |

**Routes After:**

```
/feedback
/grievances
/support
```

**Implementation Notes:**

- Routes consolidated from 17 → 3 in routeConfig.ts
- All modules use single page with tabs for All/My items
- Submit/Create via modals, details via modal views
- Action buttons (respond, assign, resolve, close) in detail modals
- All sidebar subItems removed
- App.tsx already had single-page mappings

---

### Section 16: Tier 3 Modules ✅ COMPLETED

| Module       | Current | Proposed | Strategy                         |
| ------------ | ------- | -------- | -------------------------------- |
| Analytics    | 8       | 1        | Dashboard with tabs              |
| PTM          | 9       | 1        | Tabs (Schedule, Slots, Bookings) |
| Alumni       | 7       | 1        | Tabs (List, Events, Donations)   |
| Admissions   | 11      | 2        | Dashboard + Application detail   |
| Inventory    | 12      | 1        | Tabs (Items, Issue, Library)     |
| Certificates | 9       | 1        | Tabs                             |
| Surveys      | 7       | 1        | Single page                      |
| Branches     | 6       | 1        | Single page                      |

**Routes After:**

```
/analytics
/ptm
/alumni
/admissions
/admissions/applications/:id
/inventory
/certificates
/surveys
/branches
```

**Implementation Notes:**

- ✅ Updated `routeConfig.ts` - reduced from 69 routes to 10 routes
- ✅ Updated `sidebarConfig.ts` - removed all subItems for 8 Tier 3 modules
- ✅ App.tsx already has minimal route mappings (only main routes)
- ✅ Analytics: 8→1 (tabs for Students/Attendance/Financial/Academic/Predictions)
- ✅ PTM: 9→1 (tabs for Schedule/Slots/Bookings)
- ✅ Alumni: 7→1 (tabs for List/Events/Donations)
- ✅ Admissions: 11→2 (Dashboard + Application detail page)
- ✅ Inventory: 12→1 (tabs for Items/Categories/Issue/Library)
- ✅ Certificates: 9→1 (tabs for Generate/Templates/Issued)
- ✅ Surveys: 7→1 (modals for create/respond/results)
- ✅ Branches: 6→1 (modals for CRUD)

---

## Implementation Checklist

### Per Section Workflow

For each section:

- [ ] Update `routeConfig.ts` - consolidate routes
- [ ] Update `sidebarConfig.ts` - simplify subItems
- [ ] Update/Create unified page component
- [ ] Convert old page components to:
  - Tabs within main page
  - Modal components
  - Drawer components
- [ ] Update `App.tsx` route registrations
- [ ] Test permission-based rendering
- [ ] Remove unused page files (optional - can keep as components)

### Section Progress

| Section                | Status      | Routes Before | Routes After |
| ---------------------- | ----------- | ------------- | ------------ |
| 1. Core                | ✅ Complete | 5             | 2            |
| 2. User Management     | ✅ Complete | 14            | 3            |
| 3. People Management   | ✅ Complete | 41            | 6            |
| 4. Academic Structure  | ✅ Complete | 32            | 5            |
| 5. Attendance & Leave  | ✅ Complete | 32            | 4            |
| 6. Timetable           | ✅ Complete | 19            | 3            |
| 7. Examinations        | ✅ Complete | 21            | 3            |
| 8. Finance             | ✅ Complete | 22            | 2            |
| 9. Communication       | ✅ Complete | 14            | 3            |
| 10. Settings & Reports | ✅ Complete | 19            | 3            |
| 11. Parent Portal      | ✅ Complete | 10            | 2            |
| 12. Learning           | ✅ Complete | 38            | 6            |
| 13. Transport          | ✅ Complete | 12            | 1            |
| 14. HR & Payroll       | ✅ Complete | 23            | 4            |
| 15. Support & Feedback | ✅ Complete | 17            | 3            |
| 16. Tier 3             | ✅ Complete | 69            | 10           |

**Total Reduction: 388 routes → 60 routes (85% reduction)**

---

## Files to Modify

### Route Configuration

- `src/routes/routeConfig.ts`
- `src/routes/sidebarConfig.ts`
- `src/routes/index.ts`

### App Router

- `src/App.tsx`

### Page Components (per section)

- Consolidate multiple page files into single unified pages
- Create modal/drawer components for CRUD operations
- Add tab components for grouped views

---

## Notes

- **Permissions remain unchanged** - same `hasPermission()` checks, just used for UI rendering
- **Database schema unchanged** - only frontend routing changes
- **Existing components can be reused** as tabs/modals within unified pages
- **Old routes can redirect** to new consolidated routes for backward compatibility

---

_Last Updated: January 3, 2026_
