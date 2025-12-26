# EduMunch: Route Structure & Permission Mapping

> Complete route listing for all features with CRUD operations and permission requirements

---

## TIER 1: BASIC FEATURES - Route Structure

### 1.1 User Management & Authentication

| Route              | Functionality               | Permissions Required | Module Code |
| ------------------ | --------------------------- | -------------------- | ----------- |
| `/login`           | User login page             | Public (no auth)     | -           |
| `/logout`          | User logout action          | Authenticated user   | -           |
| `/forgot-password` | Password reset request      | Public (no auth)     | -           |
| `/reset-password`  | Password reset confirmation | Public (no auth)     | -           |
| `/profile`         | View/edit own profile       | `profile.view`       | `profile`   |

---

### 1.2 Student Management

| Route                                | Functionality                       | Permissions Required                   | Module Code |
| ------------------------------------ | ----------------------------------- | -------------------------------------- | ----------- |
| `/students`                          | List all students                   | `students.view`                        | `students`  |
| `/students/create`                   | Add new student                     | `students.create`                      | `students`  |
| `/students/:id`                      | View student details                | `students.view`                        | `students`  |
| `/students/:id/edit`                 | Edit student details                | `students.update`                      | `students`  |
| `/students/:id/delete`               | Delete student (soft delete)        | `students.delete`                      | `students`  |
| `/students/:id/documents`            | View student documents              | `students.view`                        | `students`  |
| `/students/:id/documents/upload`     | Upload student documents            | `students.update`                      | `students`  |
| `/students/:id/medical-records`      | View medical records                | `students.view`                        | `students`  |
| `/students/:id/medical-records/edit` | Edit medical records                | `students.update`                      | `students`  |
| `/students/:id/parents`              | View parent/guardian info           | `students.view`                        | `students`  |
| `/students/:id/parents/add`          | Add parent/guardian                 | `students.update`                      | `students`  |
| `/students/:id/id-card`              | Generate student ID card            | `students.view`                        | `students`  |
| `/students/bulk-upload`              | Bulk student upload via Excel       | `students.create`                      | `students`  |
| `/students/promotion`                | Student promotion dashboard         | `students.view`                        | `students`  |
| `/students/promotion/configure`      | Configure promotion rules           | `students.update`                      | `students`  |
| `/students/promotion/preview`        | Preview promotion list              | `students.view`                        | `students`  |
| `/students/promotion/execute`        | Execute student promotion           | `students.approve`                     | `students`  |
| `/students/promote`                  | Bulk promote students to next class | `students.update` + `students.approve` | `students`  |
| `/students/transfer`                 | Bulk transfer between sections      | `students.update`                      | `students`  |
| `/students/export`                   | Export students list                | `students.export`                      | `students`  |

---

### 1.3 Parent Management

| Route                 | Functionality       | Permissions Required | Module Code |
| --------------------- | ------------------- | -------------------- | ----------- |
| `/parents`            | List all parents    | `parents.view`       | `parents`   |
| `/parents/create`     | Add new parent      | `parents.create`     | `parents`   |
| `/parents/:id`        | View parent details | `parents.view`       | `parents`   |
| `/parents/:id/edit`   | Edit parent details | `parents.update`     | `parents`   |
| `/parents/:id/delete` | Delete parent       | `parents.delete`     | `parents`   |
| `/parents/export`     | Export parents list | `parents.export`     | `parents`   |

#### Parent Portal

| Route                             | Functionality             | Permissions Required | Module Code |
| --------------------------------- | ------------------------- | -------------------- | ----------- |
| `/parent/dashboard`               | Parent-specific dashboard | `parent.view`        | `parent`    |
| `/parent/children`                | View all children         | `parent.view`        | `parent`    |
| `/parent/children/:id/profile`    | View child profile        | `parent.view`        | `parent`    |
| `/parent/children/:id/attendance` | View child attendance     | `parent.view`        | `parent`    |
| `/parent/children/:id/results`    | View child exam results   | `parent.view`        | `parent`    |
| `/parent/children/:id/fees`       | View child fee status     | `parent.view`        | `parent`    |
| `/parent/children/:id/homework`   | View child homework       | `parent.view`        | `parent`    |
| `/parent/children/:id/timetable`  | View child timetable      | `parent.view`        | `parent`    |
| `/parent/children/:id/teachers`   | View child's teachers     | `parent.view`        | `parent`    |
| `/parent/fee-payment`             | Pay fees online           | `parent.create`      | `parent`    |

---

### 1.4 Attendance Management

#### Student Attendance

| Route                               | Functionality             | Permissions Required | Module Code  |
| ----------------------------------- | ------------------------- | -------------------- | ------------ |
| `/attendance`                       | Attendance dashboard      | `attendance.view`    | `attendance` |
| `/attendance/mark`                  | Mark attendance           | `attendance.create`  | `attendance` |
| `/attendance/mark/:sectionId/:date` | Mark section attendance   | `attendance.create`  | `attendance` |
| `/attendance/view`                  | View attendance records   | `attendance.view`    | `attendance` |
| `/attendance/student/:studentId`    | View student attendance   | `attendance.view`    | `attendance` |
| `/attendance/reports`               | Attendance reports        | `attendance.view`    | `attendance` |
| `/attendance/reports/daily`         | Daily attendance report   | `attendance.view`    | `attendance` |
| `/attendance/reports/monthly`       | Monthly attendance report | `attendance.view`    | `attendance` |
| `/attendance/reports/defaulters`    | Low attendance students   | `attendance.view`    | `attendance` |
| `/attendance/export`                | Export attendance data    | `attendance.export`  | `attendance` |

#### Staff Attendance

| Route                       | Functionality              | Permissions Required      | Module Code        |
| --------------------------- | -------------------------- | ------------------------- | ------------------ |
| `/staff-attendance`         | Staff attendance dashboard | `staff_attendance.view`   | `staff_attendance` |
| `/staff-attendance/mark`    | Mark staff attendance      | `staff_attendance.create` | `staff_attendance` |
| `/staff-attendance/view`    | View staff attendance      | `staff_attendance.view`   | `staff_attendance` |
| `/staff-attendance/reports` | Staff attendance reports   | `staff_attendance.view`   | `staff_attendance` |
| `/staff-attendance/export`  | Export staff attendance    | `staff_attendance.export` | `staff_attendance` |

#### Leave Management

| Route                         | Functionality           | Permissions Required | Module Code |
| ----------------------------- | ----------------------- | -------------------- | ----------- |
| `/leave-requests`             | View leave applications | `leave.view`         | `leave`     |
| `/leave-requests/create`      | Apply for leave         | `leave.create`       | `leave`     |
| `/leave-requests/:id`         | View leave request      | `leave.view`         | `leave`     |
| `/leave-requests/:id/approve` | Approve/reject leave    | `leave.approve`      | `leave`     |

---

### 1.5 Academic Management

#### Academic Years

| Route                        | Functionality        | Permissions Required    | Module Code      |
| ---------------------------- | -------------------- | ----------------------- | ---------------- |
| `/academic-years`            | List academic years  | `academic_years.view`   | `academic_years` |
| `/academic-years/create`     | Create academic year | `academic_years.create` | `academic_years` |
| `/academic-years/:id/edit`   | Edit academic year   | `academic_years.update` | `academic_years` |
| `/academic-years/:id/delete` | Delete academic year | `academic_years.delete` | `academic_years` |
| `/academic-years/set-active` | Set active year      | `academic_years.update` | `academic_years` |

#### Classes

| Route                 | Functionality      | Permissions Required | Module Code |
| --------------------- | ------------------ | -------------------- | ----------- |
| `/classes`            | List all classes   | `classes.view`       | `classes`   |
| `/classes/create`     | Create new class   | `classes.create`     | `classes`   |
| `/classes/:id`        | View class details | `classes.view`       | `classes`   |
| `/classes/:id/edit`   | Edit class         | `classes.update`     | `classes`   |
| `/classes/:id/delete` | Delete class       | `classes.delete`     | `classes`   |

#### Sections

| Route                  | Functionality        | Permissions Required | Module Code |
| ---------------------- | -------------------- | -------------------- | ----------- |
| `/sections`            | List all sections    | `sections.view`      | `sections`  |
| `/sections/create`     | Create new section   | `sections.create`    | `sections`  |
| `/sections/:id`        | View section details | `sections.view`      | `sections`  |
| `/sections/:id/edit`   | Edit section         | `sections.update`    | `sections`  |
| `/sections/:id/delete` | Delete section       | `sections.delete`    | `sections`  |

#### Subjects

| Route                  | Functionality        | Permissions Required | Module Code |
| ---------------------- | -------------------- | -------------------- | ----------- |
| `/subjects`            | List all subjects    | `subjects.view`      | `subjects`  |
| `/subjects/create`     | Create new subject   | `subjects.create`    | `subjects`  |
| `/subjects/:id`        | View subject details | `subjects.view`      | `subjects`  |
| `/subjects/:id/edit`   | Edit subject         | `subjects.update`    | `subjects`  |
| `/subjects/:id/delete` | Delete subject       | `subjects.delete`    | `subjects`  |

#### Topics

| Route                | Functionality      | Permissions Required | Module Code |
| -------------------- | ------------------ | -------------------- | ----------- |
| `/topics`            | List all topics    | `topics.view`        | `topics`    |
| `/topics/create`     | Create new topic   | `topics.create`      | `topics`    |
| `/topics/:id`        | View topic details | `topics.view`        | `topics`    |
| `/topics/:id/edit`   | Edit topic         | `topics.update`      | `topics`    |
| `/topics/:id/delete` | Delete topic       | `topics.delete`      | `topics`    |

#### Teachers

| Route                    | Functionality        | Permissions Required | Module Code |
| ------------------------ | -------------------- | -------------------- | ----------- |
| `/teachers`              | List all teachers    | `teachers.view`      | `teachers`  |
| `/teachers/create`       | Add new teacher      | `teachers.create`    | `teachers`  |
| `/teachers/:id`          | View teacher details | `teachers.view`      | `teachers`  |
| `/teachers/:id/edit`     | Edit teacher         | `teachers.update`    | `teachers`  |
| `/teachers/:id/delete`   | Delete teacher       | `teachers.delete`    | `teachers`  |
| `/teachers/:id/subjects` | Assign subjects      | `teachers.update`    | `teachers`  |
| `/teachers/export`       | Export teachers list | `teachers.export`    | `teachers`  |

#### Timetable

| Route                            | Functionality            | Permissions Required | Module Code |
| -------------------------------- | ------------------------ | -------------------- | ----------- |
| `/timetable`                     | Timetable dashboard      | `timetable.view`     | `timetable` |
| `/timetable/sections/:sectionId` | View section timetable   | `timetable.view`     | `timetable` |
| `/timetable/teachers/:teacherId` | View teacher timetable   | `timetable.view`     | `timetable` |
| `/timetable/create`              | Create timetable         | `timetable.create`   | `timetable` |
| `/timetable/:id/edit`            | Edit timetable           | `timetable.update`   | `timetable` |
| `/timetable/:id/delete`          | Delete timetable         | `timetable.delete`   | `timetable` |
| `/timetable/generate`            | Auto-generate timetable  | `timetable.create`   | `timetable` |
| `/timetable/conflicts`           | View timetable conflicts | `timetable.view`     | `timetable` |
| `/timetable/export`              | Export timetable         | `timetable.export`   | `timetable` |

#### Lecture Templates

| Route                           | Functionality           | Permissions Required       | Module Code         |
| ------------------------------- | ----------------------- | -------------------------- | ------------------- |
| `/lecture-templates`            | List lecture templates  | `lecture_templates.view`   | `lecture_templates` |
| `/lecture-templates/create`     | Create lecture template | `lecture_templates.create` | `lecture_templates` |
| `/lecture-templates/:id`        | View template details   | `lecture_templates.view`   | `lecture_templates` |
| `/lecture-templates/:id/edit`   | Edit template           | `lecture_templates.update` | `lecture_templates` |
| `/lecture-templates/:id/delete` | Delete template         | `lecture_templates.delete` | `lecture_templates` |

---

### 1.6 Examination System

| Route                          | Functionality                | Permissions Required  | Module Code    |
| ------------------------------ | ---------------------------- | --------------------- | -------------- |
| `/exams`                       | Exams dashboard              | `exams.view`          | `exams`        |
| `/exams/list`                  | List all exams               | `exams.view`          | `exams`        |
| `/exams/create`                | Create new exam              | `exams.create`        | `exams`        |
| `/exams/:id`                   | View exam details            | `exams.view`          | `exams`        |
| `/exams/:id/edit`              | Edit exam details            | `exams.update`        | `exams`        |
| `/exams/:id/delete`            | Delete exam                  | `exams.delete`        | `exams`        |
| `/exams/:id/schedule`          | View exam schedule           | `exams.view`          | `exams`        |
| `/exams/:id/seating`           | Generate seating arrangement | `exams.create`        | `exams`        |
| `/exams/:id/admit-cards`       | Generate admit cards         | `exams.create`        | `exams`        |
| `/exams/:id/marks`             | Marks entry dashboard        | `marks.view`          | `marks`        |
| `/exams/:id/marks/enter`       | Enter marks                  | `marks.create`        | `marks`        |
| `/exams/:id/marks/bulk-upload` | Bulk marks upload via Excel  | `marks.create`        | `marks`        |
| `/exams/:id/marks/verify`      | Verify marks                 | `marks.approve`       | `marks`        |
| `/exams/:id/marks/:studentId`  | View student marks           | `marks.view`          | `marks`        |
| `/exams/:id/grades`            | Calculate grades             | `marks.update`        | `marks`        |
| `/exams/:id/report-cards`      | Generate report cards        | `report_cards.create` | `report_cards` |
| `/report-cards`                | View all report cards        | `report_cards.view`   | `report_cards` |
| `/report-cards/:id`            | View specific report card    | `report_cards.view`   | `report_cards` |
| `/report-cards/:id/download`   | Download report card PDF     | `report_cards.view`   | `report_cards` |
| `/report-cards/templates`      | Manage report card templates | `report_cards.update` | `report_cards` |
| `/exams/export`                | Export exam data             | `exams.export`        | `exams`        |

---

### 1.7 Fee Management

| Route                            | Functionality                 | Permissions Required | Module Code |
| -------------------------------- | ----------------------------- | -------------------- | ----------- |
| `/fees`                          | Fee management dashboard      | `fees.view`          | `fees`      |
| `/fees/structure`                | View fee structures           | `fees.view`          | `fees`      |
| `/fees/structure/create`         | Create fee structure          | `fees.create`        | `fees`      |
| `/fees/structure/:id/edit`       | Edit fee structure            | `fees.update`        | `fees`      |
| `/fees/structure/:id/delete`     | Delete fee structure          | `fees.delete`        | `fees`      |
| `/fees/assign`                   | Assign fees to students       | `fees.create`        | `fees`      |
| `/fees/assign/:studentId`        | Assign custom fee to student  | `fees.update`        | `fees`      |
| `/fees/discounts`                | Manage discounts/scholarships | `fees.update`        | `fees`      |
| `/fees/collection`               | Fee collection dashboard      | `fees.view`          | `fees`      |
| `/fees/collect`                  | Collect fee payment           | `fees.create`        | `fees`      |
| `/fees/collect/:studentId`       | Collect fee from student      | `fees.create`        | `fees`      |
| `/fees/receipts`                 | View all receipts             | `fees.view`          | `fees`      |
| `/fees/receipts/:id`             | View receipt details          | `fees.view`          | `fees`      |
| `/fees/receipts/:id/print`       | Print receipt                 | `fees.view`          | `fees`      |
| `/fees/reports`                  | Fee reports dashboard         | `fees.view`          | `fees`      |
| `/fees/reports/daily-collection` | Daily collection report       | `fees.view`          | `fees`      |
| `/fees/reports/pending-dues`     | Pending dues list             | `fees.view`          | `fees`      |
| `/fees/reports/defaulters`       | Defaulter tracking            | `fees.view`          | `fees`      |
| `/fees/reports/class-wise`       | Class-wise collection         | `fees.view`          | `fees`      |
| `/fees/export`                   | Export fee data               | `fees.export`        | `fees`      |

---

### 1.8 ID Cards Management

| Route                             | Functionality             | Permissions Required | Module Code |
| --------------------------------- | ------------------------- | -------------------- | ----------- |
| `/id-cards`                       | ID cards dashboard        | `id_cards.view`      | `id_cards`  |
| `/id-cards/students`              | Student ID cards          | `id_cards.view`      | `id_cards`  |
| `/id-cards/students/generate`     | Generate student ID cards | `id_cards.create`    | `id_cards`  |
| `/id-cards/students/:id`          | View student ID card      | `id_cards.view`      | `id_cards`  |
| `/id-cards/students/:id/download` | Download student ID card  | `id_cards.view`      | `id_cards`  |
| `/id-cards/staff`                 | Staff ID cards            | `id_cards.view`      | `id_cards`  |
| `/id-cards/staff/generate`        | Generate staff ID cards   | `id_cards.create`    | `id_cards`  |
| `/id-cards/staff/:id`             | View staff ID card        | `id_cards.view`      | `id_cards`  |
| `/id-cards/staff/:id/download`    | Download staff ID card    | `id_cards.view`      | `id_cards`  |
| `/id-cards/templates`             | Manage ID card templates  | `id_cards.update`    | `id_cards`  |

---

### 1.9 Reports & Analytics

| Route                          | Functionality               | Permissions Required | Module Code |
| ------------------------------ | --------------------------- | -------------------- | ----------- |
| `/reports`                     | Reports dashboard           | `reports.view`       | `reports`   |
| `/reports/student-performance` | Student performance reports | `reports.view`       | `reports`   |
| `/reports/attendance-summary`  | Attendance summary          | `reports.view`       | `reports`   |
| `/reports/fee-collection`      | Fee collection reports      | `reports.view`       | `reports`   |
| `/reports/exam-analysis`       | Exam analysis reports       | `reports.view`       | `reports`   |
| `/reports/class-wise`          | Class-wise reports          | `reports.view`       | `reports`   |
| `/reports/teacher-performance` | Teacher performance         | `reports.view`       | `reports`   |
| `/reports/transport`           | Transport reports           | `reports.view`       | `reports`   |
| `/reports/financial`           | Financial reports           | `reports.view`       | `reports`   |
| `/reports/custom`              | Custom report builder       | `reports.create`     | `reports`   |
| `/reports/export`              | Export reports              | `reports.export`     | `reports`   |
| `/reports/scheduled`           | Scheduled reports           | `reports.view`       | `reports`   |

---

### 1.10 Parent-Teacher Meetings (PTM)

| Route                   | Functionality          | Permissions Required | Module Code |
| ----------------------- | ---------------------- | -------------------- | ----------- |
| `/ptm`                  | PTM dashboard          | `ptm.view`           | `ptm`       |
| `/ptm/schedule`         | Schedule PTM           | `ptm.create`         | `ptm`       |
| `/ptm/list`             | List all PTMs          | `ptm.view`           | `ptm`       |
| `/ptm/:id`              | View PTM details       | `ptm.view`           | `ptm`       |
| `/ptm/:id/edit`         | Edit PTM               | `ptm.update`         | `ptm`       |
| `/ptm/:id/delete`       | Delete/Cancel PTM      | `ptm.delete`         | `ptm`       |
| `/ptm/:id/slots`        | View/manage time slots | `ptm.view`           | `ptm`       |
| `/ptm/:id/book-slot`    | Book PTM slot (parent) | `ptm.create`         | `ptm`       |
| `/ptm/:id/appointments` | View appointments      | `ptm.view`           | `ptm`       |
| `/ptm/:id/feedback`     | Add PTM feedback       | `ptm.update`         | `ptm`       |
| `/ptm/reports`          | PTM reports            | `ptm.view`           | `ptm`       |

---

## Common Routes (Available to All)

| Route           | Functionality            | Permissions Required | Module Code |
| --------------- | ------------------------ | -------------------- | ----------- |
| `/dashboard`    | Main dashboard           | `dashboard.view`     | `dashboard` |
| `/profile`      | Own profile              | `profile.view`       | `profile`   |
| `/help`         | Help & documentation     | Public               | -           |
| `/unauthorized` | Unauthorized access page | Public               | -           |
| `/404`          | Page not found           | Public               | -           |

---

## Route Naming Convention

**Pattern**: `/<module>/<action>/<optional-params>`

**Examples**:

- List: `/students` → students.view
- Create: `/students/create` → students.create
- View: `/students/:id` → students.view
- Edit: `/students/:id/edit` → students.update
- Delete: `/students/:id/delete` → students.delete
- Bulk: `/students/bulk-upload` → students.create
- Export: `/students/export` → students.export

---

## Permission Action Mapping

| Action        | Permission Required               | Use Case                   |
| ------------- | --------------------------------- | -------------------------- |
| **View/List** | `module.view` or `can_read`       | Display data, view details |
| **Create**    | `module.create` or `can_create`   | Add new records            |
| **Edit**      | `module.update` or `can_update`   | Modify existing records    |
| **Delete**    | `module.delete` or `can_delete`   | Remove records             |
| **Approve**   | `module.approve` or `can_approve` | Workflow approvals         |
| **Export**    | `module.export` or `can_export`   | Download data              |

---

## Database Integration

### How Routes Map to Permissions Table

```sql
-- Example: Attendance route permissions
INSERT INTO permissions_1EMAET (module_id, permission_code, permission_name, resource_type, resource_path, http_method)
VALUES
  (module_id, 'attendance.view', 'View Attendance', 'route', '/attendance', 'GET'),
  (module_id, 'attendance.create', 'Mark Attendance', 'route', '/attendance/mark', 'POST'),
  (module_id, 'attendance.update', 'Edit Attendance', 'route', '/attendance/mark/:sectionId/:date', 'PUT'),
  (module_id, 'attendance.export', 'Export Attendance', 'route', '/attendance/export', 'GET');
```

### Frontend Route Protection

```typescript
// src/routes/AppRoutes.tsx
<Route
  path="/attendance/mark"
  element={
    <ProtectedRoute requiredModule="attendance" requiredAction="create">
      <MarkAttendance />
    </ProtectedRoute>
  }
/>
```

---

## Summary

**TIER 1 Total Routes**: ~182 routes covering:

- ✅ Profile Management (1 route)
- ✅ Student Management (21 routes)
- ✅ Parent Management (6 routes)
- ✅ Parent Portal (10 routes)
- ✅ Attendance Management - Students (10 routes)
- ✅ Attendance Management - Staff (5 routes)
- ✅ Leave Management (4 routes)
- ✅ Academic Management - Academic Years (5 routes)
- ✅ Academic Management - Classes (5 routes)
- ✅ Academic Management - Sections (5 routes)
- ✅ Academic Management - Subjects (5 routes)
- ✅ Academic Management - Topics (5 routes)
- ✅ Academic Management - Teachers (7 routes)
- ✅ Academic Management - Timetable (9 routes)
- ✅ Academic Management - Lecture Templates (5 routes)
- ✅ Examination System (21 routes)
- ✅ Fee Management (20 routes)
- ✅ ID Cards Management (10 routes)
- ✅ Reports & Analytics (12 routes)
- ✅ Parent-Teacher Meetings (11 routes)
- ✅ Common Routes (5 routes)

---

## TIER 2: STANDARD FEATURES - Route Structure

### 2.1 Online Learning Management (LMS)

#### Assignments

| Route                                              | Functionality                  | Permissions Required  | Module Code   |
| -------------------------------------------------- | ------------------------------ | --------------------- | ------------- |
| `/assignments`                                     | Assignments dashboard          | `assignments.view`    | `assignments` |
| `/assignments/list`                                | List all assignments           | `assignments.view`    | `assignments` |
| `/assignments/create`                              | Create new assignment          | `assignments.create`  | `assignments` |
| `/assignments/:id`                                 | View assignment details        | `assignments.view`    | `assignments` |
| `/assignments/:id/edit`                            | Edit assignment                | `assignments.update`  | `assignments` |
| `/assignments/:id/delete`                          | Delete assignment              | `assignments.delete`  | `assignments` |
| `/assignments/:id/publish`                         | Publish assignment             | `assignments.approve` | `assignments` |
| `/assignments/:id/submissions`                     | View submissions               | `assignments.view`    | `assignments` |
| `/assignments/:id/submissions/:studentId`          | View student submission        | `assignments.view`    | `assignments` |
| `/assignments/:id/submissions/:studentId/evaluate` | Evaluate submission            | `assignments.update`  | `assignments` |
| `/assignments/my-assignments`                      | View own assignments (student) | `assignments.view`    | `assignments` |
| `/assignments/:id/submit`                          | Submit assignment (student)    | `assignments.create`  | `assignments` |
| `/assignments/export`                              | Export assignments data        | `assignments.export`  | `assignments` |

#### Study Materials

| Route                                    | Functionality             | Permissions Required     | Module Code       |
| ---------------------------------------- | ------------------------- | ------------------------ | ----------------- |
| `/study-materials`                       | Study materials dashboard | `study_materials.view`   | `study_materials` |
| `/study-materials/list`                  | List all materials        | `study_materials.view`   | `study_materials` |
| `/study-materials/create`                | Upload new material       | `study_materials.create` | `study_materials` |
| `/study-materials/:id`                   | View material details     | `study_materials.view`   | `study_materials` |
| `/study-materials/:id/edit`              | Edit material             | `study_materials.update` | `study_materials` |
| `/study-materials/:id/delete`            | Delete material           | `study_materials.delete` | `study_materials` |
| `/study-materials/by-class/:classId`     | View class materials      | `study_materials.view`   | `study_materials` |
| `/study-materials/by-subject/:subjectId` | View subject materials    | `study_materials.view`   | `study_materials` |
| `/study-materials/:id/download`          | Download material         | `study_materials.view`   | `study_materials` |

#### Online Classes

| Route                            | Functionality                | Permissions Required    | Module Code      |
| -------------------------------- | ---------------------------- | ----------------------- | ---------------- |
| `/online-classes`                | Online classes dashboard     | `online_classes.view`   | `online_classes` |
| `/online-classes/schedule`       | View class schedule          | `online_classes.view`   | `online_classes` |
| `/online-classes/create`         | Schedule new class           | `online_classes.create` | `online_classes` |
| `/online-classes/:id`            | View class details           | `online_classes.view`   | `online_classes` |
| `/online-classes/:id/edit`       | Edit class details           | `online_classes.update` | `online_classes` |
| `/online-classes/:id/cancel`     | Cancel class                 | `online_classes.delete` | `online_classes` |
| `/online-classes/:id/join`       | Join class meeting           | `online_classes.view`   | `online_classes` |
| `/online-classes/:id/recordings` | View class recordings        | `online_classes.view`   | `online_classes` |
| `/online-classes/recordings`     | All recordings library       | `online_classes.view`   | `online_classes` |
| `/online-classes/:id/attendance` | Mark online class attendance | `online_classes.update` | `online_classes` |

---

### 2.2 Transport Management

#### Routes

| Route                                 | Functionality                  | Permissions Required | Module Code |
| ------------------------------------- | ------------------------------ | -------------------- | ----------- |
| `/transport`                          | Transport management dashboard | `transport.view`     | `transport` |
| `/transport/routes`                   | List all routes                | `transport.view`     | `transport` |
| `/transport/routes/create`            | Create new route               | `transport.create`   | `transport` |
| `/transport/routes/:id`               | View route details             | `transport.view`     | `transport` |
| `/transport/routes/:id/edit`          | Edit route                     | `transport.update`   | `transport` |
| `/transport/routes/:id/delete`        | Delete route                   | `transport.delete`   | `transport` |
| `/transport/routes/:id/stops`         | View route stops               | `transport.view`     | `transport` |
| `/transport/routes/:id/stops/add`     | Add stop to route              | `transport.update`   | `transport` |
| `/transport/routes/:id/calculate-fee` | Calculate route fee            | `transport.view`     | `transport` |

#### Vehicles

| Route                                     | Functionality            | Permissions Required | Module Code |
| ----------------------------------------- | ------------------------ | -------------------- | ----------- |
| `/transport/vehicles`                     | List all vehicles        | `transport.view`     | `transport` |
| `/transport/vehicles/create`              | Add new vehicle          | `transport.create`   | `transport` |
| `/transport/vehicles/:id`                 | View vehicle details     | `transport.view`     | `transport` |
| `/transport/vehicles/:id/edit`            | Edit vehicle             | `transport.update`   | `transport` |
| `/transport/vehicles/:id/delete`          | Delete vehicle           | `transport.delete`   | `transport` |
| `/transport/vehicles/:id/maintenance`     | View maintenance history | `transport.view`     | `transport` |
| `/transport/vehicles/:id/maintenance/add` | Add maintenance record   | `transport.create`   | `transport` |
| `/transport/vehicles/:id/assign-route`    | Assign vehicle to route  | `transport.update`   | `transport` |

#### Drivers

| Route                           | Functionality            | Permissions Required | Module Code |
| ------------------------------- | ------------------------ | -------------------- | ----------- |
| `/transport/drivers`            | List all drivers         | `transport.view`     | `transport` |
| `/transport/drivers/create`     | Add new driver           | `transport.create`   | `transport` |
| `/transport/drivers/:id`        | View driver details      | `transport.view`     | `transport` |
| `/transport/drivers/:id/edit`   | Edit driver              | `transport.update`   | `transport` |
| `/transport/drivers/:id/delete` | Delete driver            | `transport.delete`   | `transport` |
| `/transport/drivers/:id/assign` | Assign driver to vehicle | `transport.update`   | `transport` |

#### Student Allocation

| Route                                    | Functionality                  | Permissions Required | Module Code |
| ---------------------------------------- | ------------------------------ | -------------------- | ----------- |
| `/transport/allocations`                 | View student allocations       | `transport.view`     | `transport` |
| `/transport/allocations/assign`          | Assign student to route        | `transport.update`   | `transport` |
| `/transport/allocations/:studentId`      | View student transport details | `transport.view`     | `transport` |
| `/transport/allocations/:studentId/edit` | Edit student transport         | `transport.update`   | `transport` |
| `/transport/pickup-lists`                | View pickup/drop lists         | `transport.view`     | `transport` |
| `/transport/export`                      | Export transport data          | `transport.export`   | `transport` |

---

### 2.3 Advanced HR & Payroll

#### Employees

| Route                             | Functionality           | Permissions Required | Module Code |
| --------------------------------- | ----------------------- | -------------------- | ----------- |
| `/employees`                      | List all employees      | `employees.view`     | `employees` |
| `/employees/create`               | Add new employee        | `employees.create`   | `employees` |
| `/employees/:id`                  | View employee details   | `employees.view`     | `employees` |
| `/employees/:id/edit`             | Edit employee           | `employees.update`   | `employees` |
| `/employees/:id/delete`           | Delete employee         | `employees.delete`   | `employees` |
| `/employees/:id/documents`        | View employee documents | `employees.view`     | `employees` |
| `/employees/:id/documents/upload` | Upload documents        | `employees.update`   | `employees` |
| `/employees/bulk-upload`          | Bulk employee upload    | `employees.create`   | `employees` |
| `/employees/export`               | Export employees list   | `employees.export`   | `employees` |

#### Payroll

| Route                                 | Functionality           | Permissions Required | Module Code |
| ------------------------------------- | ----------------------- | -------------------- | ----------- |
| `/payroll`                            | Payroll dashboard       | `payroll.view`       | `payroll`   |
| `/payroll/salary-structures`          | View salary structures  | `payroll.view`       | `payroll`   |
| `/payroll/salary-structures/create`   | Create salary structure | `payroll.create`     | `payroll`   |
| `/payroll/salary-structures/:id/edit` | Edit salary structure   | `payroll.update`     | `payroll`   |
| `/payroll/process`                    | Process monthly payroll | `payroll.create`     | `payroll`   |
| `/payroll/process/:month`             | View payroll for month  | `payroll.view`       | `payroll`   |
| `/payroll/:id/approve`                | Approve payroll         | `payroll.approve`    | `payroll`   |
| `/payroll/payslips`                   | View all payslips       | `payroll.view`       | `payroll`   |
| `/payroll/payslips/:id`               | View payslip            | `payroll.view`       | `payroll`   |
| `/payroll/payslips/:id/download`      | Download payslip PDF    | `payroll.view`       | `payroll`   |
| `/payroll/reports`                    | Payroll reports         | `payroll.view`       | `payroll`   |
| `/payroll/export`                     | Export payroll data     | `payroll.export`     | `payroll`   |

#### PF/ESI

| Route                             | Functionality              | Permissions Required | Module Code |
| --------------------------------- | -------------------------- | -------------------- | ----------- |
| `/payroll/pf-esi`                 | PF/ESI dashboard           | `payroll.view`       | `payroll`   |
| `/payroll/pf-esi/records`         | View PF/ESI records        | `payroll.view`       | `payroll`   |
| `/payroll/pf-esi/generate-report` | Generate compliance report | `payroll.view`       | `payroll`   |
| `/payroll/pf-esi/forms`           | Generate statutory forms   | `payroll.create`     | `payroll`   |

#### Performance Appraisal

| Route                        | Functionality          | Permissions Required | Module Code  |
| ---------------------------- | ---------------------- | -------------------- | ------------ |
| `/hr/appraisals`             | Appraisals dashboard   | `appraisals.view`    | `appraisals` |
| `/hr/appraisals/create`      | Create appraisal cycle | `appraisals.create`  | `appraisals` |
| `/hr/appraisals/:id`         | View appraisal details | `appraisals.view`    | `appraisals` |
| `/hr/appraisals/:id/submit`  | Submit appraisal       | `appraisals.update`  | `appraisals` |
| `/hr/appraisals/:id/approve` | Approve appraisal      | `appraisals.approve` | `appraisals` |
| `/hr/appraisals/reports`     | Appraisal reports      | `appraisals.view`    | `appraisals` |

#### Recruitment

| Route                                        | Functionality            | Permissions Required | Module Code   |
| -------------------------------------------- | ------------------------ | -------------------- | ------------- |
| `/hr/recruitment`                            | Recruitment dashboard    | `recruitment.view`   | `recruitment` |
| `/hr/recruitment/jobs`                       | View job postings        | `recruitment.view`   | `recruitment` |
| `/hr/recruitment/jobs/create`                | Create job posting       | `recruitment.create` | `recruitment` |
| `/hr/recruitment/jobs/:id/edit`              | Edit job posting         | `recruitment.update` | `recruitment` |
| `/hr/recruitment/applications`               | View applications        | `recruitment.view`   | `recruitment` |
| `/hr/recruitment/applications/:id`           | View application details | `recruitment.view`   | `recruitment` |
| `/hr/recruitment/applications/:id/shortlist` | Shortlist candidate      | `recruitment.update` | `recruitment` |
| `/hr/recruitment/interviews`                 | Schedule interviews      | `recruitment.create` | `recruitment` |
| `/hr/recruitment/interviews/:id`             | View interview details   | `recruitment.view`   | `recruitment` |

#### Staff Leave

| Route                            | Functionality         | Permissions Required  | Module Code   |
| -------------------------------- | --------------------- | --------------------- | ------------- |
| `/hr/leave`                      | Staff leave dashboard | `staff_leave.view`    | `staff_leave` |
| `/hr/leave/apply`                | Apply for leave       | `staff_leave.create`  | `staff_leave` |
| `/hr/leave/requests`             | View leave requests   | `staff_leave.view`    | `staff_leave` |
| `/hr/leave/requests/:id`         | View leave request    | `staff_leave.view`    | `staff_leave` |
| `/hr/leave/requests/:id/approve` | Approve/reject leave  | `staff_leave.approve` | `staff_leave` |
| `/hr/leave/balance`              | View leave balance    | `staff_leave.view`    | `staff_leave` |
| `/hr/leave/calendar`             | Leave calendar        | `staff_leave.view`    | `staff_leave` |

---

---

## TIER 3: ADVANCED FEATURES - Route Structure

### 3.1 Admission Management

| Route                                    | Functionality              | Permissions Required | Module Code  |
| ---------------------------------------- | -------------------------- | -------------------- | ------------ |
| `/admissions`                            | Admissions dashboard       | `admissions.view`    | `admissions` |
| `/admissions/apply`                      | Online application form    | Public               | `admissions` |
| `/admissions/applications`               | View all applications      | `admissions.view`    | `admissions` |
| `/admissions/applications/:id`           | View application details   | `admissions.view`    | `admissions` |
| `/admissions/applications/:id/review`    | Review application         | `admissions.update`  | `admissions` |
| `/admissions/applications/:id/approve`   | Approve/reject application | `admissions.approve` | `admissions` |
| `/admissions/applications/:id/documents` | View application documents | `admissions.view`    | `admissions` |
| `/admissions/interviews`                 | Interview schedule         | `admissions.view`    | `admissions` |
| `/admissions/interviews/schedule`        | Schedule interview         | `admissions.create`  | `admissions` |
| `/admissions/interviews/:id`             | View interview details     | `admissions.view`    | `admissions` |
| `/admissions/interviews/:id/feedback`    | Add interview feedback     | `admissions.update`  | `admissions` |
| `/admissions/entrance-tests`             | Entrance tests             | `admissions.view`    | `admissions` |
| `/admissions/entrance-tests/create`      | Create entrance test       | `admissions.create`  | `admissions` |
| `/admissions/entrance-tests/:id`         | View test details          | `admissions.view`    | `admissions` |
| `/admissions/entrance-tests/:id/results` | Enter test results         | `admissions.update`  | `admissions` |
| `/admissions/merit-list`                 | View merit list            | `admissions.view`    | `admissions` |
| `/admissions/merit-list/generate`        | Generate merit list        | `admissions.create`  | `admissions` |
| `/admissions/seat-allocation`            | Seat allocation            | `admissions.update`  | `admissions` |
| `/admissions/export`                     | Export admissions data     | `admissions.export`  | `admissions` |

---

### 3.2 Inventory & Asset Management

#### Assets

| Route                                        | Functionality             | Permissions Required | Module Code |
| -------------------------------------------- | ------------------------- | -------------------- | ----------- |
| `/inventory`                                 | Inventory dashboard       | `inventory.view`     | `inventory` |
| `/inventory/assets`                          | List all assets           | `inventory.view`     | `inventory` |
| `/inventory/assets/create`                   | Add new asset             | `inventory.create`   | `inventory` |
| `/inventory/assets/:id`                      | View asset details        | `inventory.view`     | `inventory` |
| `/inventory/assets/:id/edit`                 | Edit asset                | `inventory.update`   | `inventory` |
| `/inventory/assets/:id/delete`               | Delete asset              | `inventory.delete`   | `inventory` |
| `/inventory/assets/:id/assign`               | Assign asset to user      | `inventory.update`   | `inventory` |
| `/inventory/assets/:id/maintenance`          | Asset maintenance history | `inventory.view`     | `inventory` |
| `/inventory/assets/:id/maintenance/schedule` | Schedule maintenance      | `inventory.create`   | `inventory` |
| `/inventory/assets/depreciation`             | View depreciation reports | `inventory.view`     | `inventory` |

#### Lab Equipment

| Route                                      | Functionality          | Permissions Required | Module Code |
| ------------------------------------------ | ---------------------- | -------------------- | ----------- |
| `/inventory/lab-equipment`                 | List lab equipment     | `inventory.view`     | `inventory` |
| `/inventory/lab-equipment/create`          | Add lab equipment      | `inventory.create`   | `inventory` |
| `/inventory/lab-equipment/:id`             | View equipment details | `inventory.view`     | `inventory` |
| `/inventory/lab-equipment/:id/edit`        | Edit equipment         | `inventory.update`   | `inventory` |
| `/inventory/lab-equipment/:id/calibration` | Calibration records    | `inventory.view`     | `inventory` |

#### Lab Chemicals

| Route                                    | Functionality            | Permissions Required | Module Code |
| ---------------------------------------- | ------------------------ | -------------------- | ----------- |
| `/inventory/lab-chemicals`               | List chemicals/specimens | `inventory.view`     | `inventory` |
| `/inventory/lab-chemicals/create`        | Add chemical             | `inventory.create`   | `inventory` |
| `/inventory/lab-chemicals/:id`           | View chemical details    | `inventory.view`     | `inventory` |
| `/inventory/lab-chemicals/:id/edit`      | Edit chemical            | `inventory.update`   | `inventory` |
| `/inventory/lab-chemicals/expiring-soon` | Expiring chemicals alert | `inventory.view`     | `inventory` |

#### Stationery

| Route                                  | Functionality         | Permissions Required | Module Code |
| -------------------------------------- | --------------------- | -------------------- | ----------- |
| `/inventory/stationery`                | Stationery dashboard  | `inventory.view`     | `inventory` |
| `/inventory/stationery/items`          | List stationery items | `inventory.view`     | `inventory` |
| `/inventory/stationery/items/create`   | Add stationery item   | `inventory.create`   | `inventory` |
| `/inventory/stationery/items/:id/edit` | Edit item             | `inventory.update`   | `inventory` |
| `/inventory/stationery/issue`          | Issue stationery      | `inventory.create`   | `inventory` |
| `/inventory/stationery/transactions`   | View transactions     | `inventory.view`     | `inventory` |
| `/inventory/stationery/reorder-alerts` | Low stock alerts      | `inventory.view`     | `inventory` |
| `/inventory/export`                    | Export inventory data | `inventory.export`   | `inventory` |

---

## Route Summary by Tier

## Route Summary by Tier

### TIER 1: BASIC FEATURES

- **Profile Management**: 1 route
- **Student Management**: 21 routes
- **Parent Management**: 6 routes
- **Parent Portal**: 10 routes
- **Attendance Management (Students)**: 10 routes
- **Staff Attendance**: 5 routes
- **Leave Management**: 4 routes
- **Academic Years**: 5 routes
- **Classes**: 5 routes
- **Sections**: 5 routes
- **Subjects**: 5 routes
- **Topics**: 5 routes
- **Teachers**: 7 routes
- **Timetable**: 9 routes
- **Lecture Templates**: 5 routes
- **Examination System**: 21 routes
- **Fee Management**: 20 routes
- **ID Cards Management**: 10 routes
- **Reports & Analytics**: 12 routes
- **Parent-Teacher Meetings (PTM)**: 11 routes
- **Common Routes**: 5 routes
- **TIER 1 Total**: ~182 routes

### TIER 2: STANDARD FEATURES

- **Assignments**: 13 routes
- **Study Materials**: 9 routes
- **Online Classes**: 10 routes
- **Transport Management**: 26 routes
- **HR & Payroll (Employees)**: 9 routes
- **Payroll**: 12 routes
- **PF/ESI**: 4 routes
- **Performance Appraisal**: 6 routes
- **Recruitment**: 9 routes
- **Staff Leave**: 7 routes
- **TIER 2 Total**: ~105 routes

### TIER 3: ADVANCED FEATURES

- **Admission Management**: 19 routes
- **Inventory & Asset Management**: 30 routes
- **TIER 3 Total**: ~49 routes

### GRAND TOTAL: ~336 routes

---

## Implementation Priority

### Phase 1 - Core Features (TIER 1)

1. Profile Management
2. Student & Parent Management
3. Attendance Management (Students & Staff)
4. Academic Management (Years, Classes, Sections, Subjects, Topics, Teachers, Timetable, Lectures)
5. Examination System
6. Fee Management
7. ID Cards Management
8. Reports & Analytics
9. Parent-Teacher Meetings (PTM)

### Phase 2 - Extended Features (TIER 2)

1. Online Learning (Assignments, Study Materials, Online Classes)
2. Transport Management
3. HR & Payroll

### Phase 3 - Advanced Features (TIER 3)

1. Admission Management
2. Inventory & Asset Management

---

**Status**: Route structure refined based on actual implementation needs | Ready for development
