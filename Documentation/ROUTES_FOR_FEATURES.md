# EduMunch: Route Structure & Permission Mapping

> Complete route listing for all features with CRUD operations and permission requirements

---

## TIER 1: BASIC FEATURES - Route Structure

### 1.1 User Management & Authentication

| Route                         | Functionality               | Permissions Required | Module Code   |
| ----------------------------- | --------------------------- | -------------------- | ------------- |
| `/login`                      | User login page             | Public (no auth)     | -             |
| `/logout`                     | User logout action          | Authenticated user   | -             |
| `/forgot-password`            | Password reset request      | Public (no auth)     | -             |
| `/reset-password`             | Password reset confirmation | Public (no auth)     | -             |
| `/profile`                    | View/edit own profile       | `profile.view`       | `profile`     |
| `/profile/edit`               | Edit own profile details    | `profile.update`     | `profile`     |
| `/profile/change-password`    | Change own password         | `profile.update`     | `profile`     |
| `/profile/upload-photo`       | Upload profile photo        | `profile.update`     | `profile`     |
| `/users`                      | List all users              | `users.view`         | `users`       |
| `/users/create`               | Add new user                | `users.create`       | `users`       |
| `/users/:id`                  | View user details           | `users.view`         | `users`       |
| `/users/:id/edit`             | Edit user details           | `users.update`       | `users`       |
| `/users/:id/delete`           | Delete user                 | `users.delete`       | `users`       |
| `/users/bulk-upload`          | Bulk user upload            | `users.create`       | `users`       |
| `/roles`                      | List all roles              | `roles.view`         | `roles`       |
| `/roles/create`               | Create custom role          | `roles.create`       | `roles`       |
| `/roles/:id/edit`             | Edit role details           | `roles.update`       | `roles`       |
| `/roles/:id/permissions`      | Assign permissions to role  | `roles.update`       | `roles`       |
| `/roles/:id/delete`           | Delete custom role          | `roles.delete`       | `roles`       |
| `/permissions`                | View all permissions        | `permissions.view`   | `permissions` |
| `/users/:id/assign-role`      | Assign role to user         | `users.update`       | `users`       |
| `/users/:id/grant-permission` | Grant additional permission | `users.update`       | `users`       |

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
| `/parents`                           | List all parents                    | `parents.view`                         | `parents`   |
| `/parents/create`                    | Add new parent                      | `parents.create`                       | `parents`   |
| `/parents/:id`                       | View parent details                 | `parents.view`                         | `parents`   |
| `/parents/:id/edit`                  | Edit parent details                 | `parents.update`                       | `parents`   |

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

### 1.3 Attendance Management

| Route                                 | Functionality                        | Permissions Required | Module Code  |
| ------------------------------------- | ------------------------------------ | -------------------- | ------------ |
| `/attendance`                         | Attendance dashboard                 | `attendance.view`    | `attendance` |
| `/attendance/mark`                    | Mark daily attendance                | `attendance.create`  | `attendance` |
| `/attendance/mark/:sectionId`         | Mark attendance for specific section | `attendance.create`  | `attendance` |
| `/attendance/mark/:sectionId/:date`   | Edit attendance for specific date    | `attendance.update`  | `attendance` |
| `/attendance/view`                    | View attendance records              | `attendance.view`    | `attendance` |
| `/attendance/view/:sectionId`         | View section-wise attendance         | `attendance.view`    | `attendance` |
| `/attendance/view/student/:studentId` | View student attendance history      | `attendance.view`    | `attendance` |
| `/attendance/reports`                 | Attendance reports dashboard         | `attendance.view`    | `attendance` |
| `/attendance/reports/daily`           | Daily attendance report              | `attendance.view`    | `attendance` |
| `/attendance/reports/weekly`          | Weekly attendance report             | `attendance.view`    | `attendance` |
| `/attendance/reports/monthly`         | Monthly attendance report            | `attendance.view`    | `attendance` |
| `/attendance/reports/low-attendance`  | Low attendance alerts                | `attendance.view`    | `attendance` |
| `/attendance/export`                  | Export attendance data               | `attendance.export`  | `attendance` |
| `/attendance/subject-wise`            | Subject-wise attendance              | `attendance.create`  | `attendance` |
| `/leave-requests`                     | View leave applications              | `leave.view`         | `leave`      |
| `/leave-requests/create`              | Apply for leave                      | `leave.create`       | `leave`      |
| `/leave-requests/:id`                 | View leave request details           | `leave.view`         | `leave`      |
| `/leave-requests/:id/approve`         | Approve/reject leave                 | `leave.approve`      | `leave`      |
| `/leave-requests/student/:studentId`  | Student leave history                | `leave.view`         | `leave`      |

#### Staff Attendance

| Route                                | Functionality              | Permissions Required      | Module Code        |
| ------------------------------------ | -------------------------- | ------------------------- | ------------------ |
| `/staff/attendance`                  | Staff attendance dashboard | `staff_attendance.view`   | `staff_attendance` |
| `/staff/attendance/mark`             | Mark staff attendance      | `staff_attendance.create` | `staff_attendance` |
| `/staff/attendance/view`             | View all staff attendance  | `staff_attendance.view`   | `staff_attendance` |
| `/staff/attendance/view/:employeeId` | View employee attendance   | `staff_attendance.view`   | `staff_attendance` |
| `/staff/attendance/reports`          | Staff attendance reports   | `staff_attendance.view`   | `staff_attendance` |
| `/staff/attendance/reports/monthly`  | Monthly attendance report  | `staff_attendance.view`   | `staff_attendance` |
| `/staff/attendance/export`           | Export staff attendance    | `staff_attendance.export` | `staff_attendance` |

---

### 1.4 Academic Management

#### Academic Years

| Route                             | Functionality              | Permissions Required    | Module Code      |
| --------------------------------- | -------------------------- | ----------------------- | ---------------- |
| `/academic-years`                 | List all academic years    | `academic_years.view`   | `academic_years` |
| `/academic-years/create`          | Create new academic year   | `academic_years.create` | `academic_years` |
| `/academic-years/:id`             | View academic year details | `academic_years.view`   | `academic_years` |
| `/academic-years/:id/edit`        | Edit academic year         | `academic_years.update` | `academic_years` |
| `/academic-years/:id/delete`      | Delete academic year       | `academic_years.delete` | `academic_years` |
| `/academic-years/:id/set-current` | Set as current year        | `academic_years.update` | `academic_years` |

#### Courses/Classes

| Route                 | Functionality      | Permissions Required | Module Code |
| --------------------- | ------------------ | -------------------- | ----------- |
| `/classes`            | List all classes   | `classes.view`       | `classes`   |
| `/classes/create`     | Create new class   | `classes.create`     | `classes`   |
| `/classes/:id`        | View class details | `classes.view`       | `classes`   |
| `/classes/:id/edit`   | Edit class details | `classes.update`     | `classes`   |
| `/classes/:id/delete` | Delete class       | `classes.delete`     | `classes`   |

#### Sections/Batches

| Route                          | Functionality            | Permissions Required | Module Code |
| ------------------------------ | ------------------------ | -------------------- | ----------- |
| `/sections`                    | List all sections        | `sections.view`      | `sections`  |
| `/sections/create`             | Create new section       | `sections.create`    | `sections`  |
| `/sections/:id`                | View section details     | `sections.view`      | `sections`  |
| `/sections/:id/edit`           | Edit section details     | `sections.update`    | `sections`  |
| `/sections/:id/delete`         | Delete section           | `sections.delete`    | `sections`  |
| `/sections/:id/students`       | View students in section | `sections.view`      | `sections`  |
| `/sections/:id/assign-teacher` | Assign class teacher     | `sections.update`    | `sections`  |

#### Subjects

| Route                        | Functionality             | Permissions Required | Module Code |
| ---------------------------- | ------------------------- | -------------------- | ----------- |
| `/subjects`                  | List all subjects         | `subjects.view`      | `subjects`  |
| `/subjects/create`           | Create new subject        | `subjects.create`    | `subjects`  |
| `/subjects/:id`              | View subject details      | `subjects.view`      | `subjects`  |
| `/subjects/:id/edit`         | Edit subject details      | `subjects.update`    | `subjects`  |
| `/subjects/:id/delete`       | Delete subject            | `subjects.delete`    | `subjects`  |
| `/subjects/:id/assign-class` | Assign subject to class   | `subjects.update`    | `subjects`  |
| `/subjects/:id/topics`       | View topics under subject | `subjects.view`      | `subjects`  |

#### Topics & Content

| Route                        | Functionality             | Permissions Required | Module Code |
| ---------------------------- | ------------------------- | -------------------- | ----------- |
| `/topics`                    | List all topics           | `topics.view`        | `topics`    |
| `/topics/create`             | Create new topic          | `topics.create`      | `topics`    |
| `/topics/:id`                | View topic details        | `topics.view`        | `topics`    |
| `/topics/:id/edit`           | Edit topic details        | `topics.update`      | `topics`    |
| `/topics/:id/delete`         | Delete topic              | `topics.delete`      | `topics`    |
| `/topics/:id/content`        | View learning materials   | `topics.view`        | `topics`    |
| `/topics/:id/content/upload` | Upload learning materials | `topics.update`      | `topics`    |

#### Teachers

| Route                          | Functionality             | Permissions Required | Module Code |
| ------------------------------ | ------------------------- | -------------------- | ----------- |
| `/teachers`                    | List all teachers         | `teachers.view`      | `teachers`  |
| `/teachers/create`             | Add new teacher           | `teachers.create`    | `teachers`  |
| `/teachers/:id`                | View teacher details      | `teachers.view`      | `teachers`  |
| `/teachers/:id/edit`           | Edit teacher details      | `teachers.update`    | `teachers`  |
| `/teachers/:id/delete`         | Delete teacher            | `teachers.delete`    | `teachers`  |
| `/teachers/:id/subjects`       | View assigned subjects    | `teachers.view`      | `teachers`  |
| `/teachers/:id/assign-subject` | Assign subject to teacher | `teachers.update`    | `teachers`  |
| `/teachers/:id/timetable`      | View teacher timetable    | `teachers.view`      | `teachers`  |
| `/teachers/bulk-upload`        | Bulk teacher upload       | `teachers.create`    | `teachers`  |
| `/teachers/export`             | Export teachers list      | `teachers.export`    | `teachers`  |

#### Timetable

| Route                        | Functionality                | Permissions Required | Module Code |
| ---------------------------- | ---------------------------- | -------------------- | ----------- |
| `/timetable`                 | Timetable dashboard          | `timetable.view`     | `timetable` |
| `/timetable/view`            | View all timetables          | `timetable.view`     | `timetable` |
| `/timetable/view/:sectionId` | View section timetable       | `timetable.view`     | `timetable` |
| `/timetable/create`          | Create new timetable         | `timetable.create`   | `timetable` |
| `/timetable/:id/edit`        | Edit timetable               | `timetable.update`   | `timetable` |
| `/timetable/:id/delete`      | Delete timetable             | `timetable.delete`   | `timetable` |
| `/timetable/bulk-create`     | Bulk schedule creation       | `timetable.create`   | `timetable` |
| `/timetable/copy`            | Copy from previous week      | `timetable.create`   | `timetable` |
| `/timetable/conflicts`       | View schedule conflicts      | `timetable.view`     | `timetable` |
| `/timetable/substitute`      | Assign substitute teacher    | `timetable.update`   | `timetable` |
| `/timetable/periods`         | Manage period configuration  | `timetable.update`   | `timetable` |
| `/timetable/export`          | Export timetable             | `timetable.export`   | `timetable` |
| `/my-timetable`              | Student's personal timetable | `timetable.view`     | `timetable` |
| `/class-timetable`           | Class timetable for students | `timetable.view`     | `timetable` |

#### Lecture Templates

| Route                           | Functionality          | Permissions Required       | Module Code         |
| ------------------------------- | ---------------------- | -------------------------- | ------------------- |
| `/lecture-templates`            | List lecture templates | `lecture_templates.view`   | `lecture_templates` |
| `/lecture-templates/create`     | Create new template    | `lecture_templates.create` | `lecture_templates` |
| `/lecture-templates/:id`        | View template details  | `lecture_templates.view`   | `lecture_templates` |
| `/lecture-templates/:id/edit`   | Edit template          | `lecture_templates.update` | `lecture_templates` |
| `/lecture-templates/:id/delete` | Delete template        | `lecture_templates.delete` | `lecture_templates` |

---

### 1.5 Examination System

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

### 1.6 Fee Management

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

### 1.7 School Settings & Configuration

| Route                                | Functionality                | Permissions Required | Module Code |
| ------------------------------------ | ---------------------------- | -------------------- | ----------- |
| `/settings`                          | School settings dashboard    | `settings.view`      | `settings`  |
| `/settings/school-info`              | View/edit school information | `settings.view`      | `settings`  |
| `/settings/school-info/edit`         | Edit school details          | `settings.update`    | `settings`  |
| `/settings/academic-calendar`        | Manage academic calendar     | `settings.view`      | `settings`  |
| `/settings/academic-calendar/events` | Add calendar events          | `settings.create`    | `settings`  |
| `/settings/periods`                  | Configure period timings     | `settings.view`      | `settings`  |
| `/settings/periods/edit`             | Edit period configuration    | `settings.update`    | `settings`  |
| `/settings/grading`                  | Manage grading system        | `settings.view`      | `settings`  |
| `/settings/grading/configure`        | Configure grade boundaries   | `settings.update`    | `settings`  |
| `/settings/backup`                   | Backup management            | `settings.view`      | `settings`  |
| `/settings/backup/create`            | Create database backup       | `settings.create`    | `settings`  |
| `/settings/backup/download`          | Download backup file         | `settings.view`      | `settings`  |
| `/settings/backup/history`           | View backup history          | `settings.view`      | `settings`  |
| `/settings/data-export`              | Export all school data       | `settings.export`    | `settings`  |
| `/settings/data-export/students`     | Export students data         | `settings.export`    | `settings`  |
| `/settings/data-export/staff`        | Export staff data            | `settings.export`    | `settings`  |
| `/settings/data-export/financial`    | Export financial data        | `settings.export`    | `settings`  |

---

### 1.8 ID Card Management

| Route                          | Functionality             | Permissions Required | Module Code |
| ------------------------------ | ------------------------- | -------------------- | ----------- |
| `/id-cards`                    | ID card management        | `id_cards.view`      | `id_cards`  |
| `/id-cards/students`           | Student ID cards          | `id_cards.view`      | `id_cards`  |
| `/id-cards/students/generate`  | Generate student ID cards | `id_cards.create`    | `id_cards`  |
| `/id-cards/students/:id/print` | Print student ID card     | `id_cards.view`      | `id_cards`  |
| `/id-cards/staff`              | Staff ID cards            | `id_cards.view`      | `id_cards`  |
| `/id-cards/staff/generate`     | Generate staff ID cards   | `id_cards.create`    | `id_cards`  |
| `/id-cards/staff/:id/print`    | Print staff ID card       | `id_cards.view`      | `id_cards`  |
| `/id-cards/templates`          | ID card templates         | `id_cards.view`      | `id_cards`  |
| `/id-cards/templates/edit`     | Edit ID card template     | `id_cards.update`    | `id_cards`  |
| `/id-cards/bulk-generate`      | Bulk generate ID cards    | `id_cards.create`    | `id_cards`  |

---

### 1.9 Reports & Analytics

| Route                                 | Functionality                   | Permissions Required | Module Code |
| ------------------------------------- | ------------------------------- | -------------------- | ----------- |
| `/reports`                            | Reports dashboard               | `reports.view`       | `reports`   |
| `/reports/students`                   | Student reports                 | `reports.view`       | `reports`   |
| `/reports/students/attendance`        | Student attendance report       | `reports.view`       | `reports`   |
| `/reports/students/academic`          | Student academic report         | `reports.view`       | `reports`   |
| `/reports/students/fee-status`        | Student fee status              | `reports.view`       | `reports`   |
| `/reports/attendance`                 | Consolidated attendance reports | `reports.view`       | `reports`   |
| `/reports/attendance/class-wise`      | Class-wise attendance           | `reports.view`       | `reports`   |
| `/reports/attendance/teacher-wise`    | Teacher-wise attendance         | `reports.view`       | `reports`   |
| `/reports/academic`                   | Academic performance reports    | `reports.view`       | `reports`   |
| `/reports/academic/class-performance` | Class performance analysis      | `reports.view`       | `reports`   |
| `/reports/academic/subject-analysis`  | Subject-wise analysis           | `reports.view`       | `reports`   |
| `/reports/financial`                  | Financial reports               | `reports.view`       | `reports`   |
| `/reports/financial/fee-collection`   | Fee collection summary          | `reports.view`       | `reports`   |
| `/reports/financial/outstanding`      | Outstanding dues report         | `reports.view`       | `reports`   |
| `/reports/custom`                     | Custom report builder           | `reports.create`     | `reports`   |
| `/reports/export`                     | Export reports                  | `reports.export`     | `reports`   |

---

### 1.10 Communication System

#### Announcements

| Route                       | Functionality             | Permissions Required   | Module Code     |
| --------------------------- | ------------------------- | ---------------------- | --------------- |
| `/announcements`            | View all announcements    | `announcements.view`   | `announcements` |
| `/announcements/create`     | Create announcement       | `announcements.create` | `announcements` |
| `/announcements/:id`        | View announcement details | `announcements.view`   | `announcements` |
| `/announcements/:id/edit`   | Edit announcement         | `announcements.update` | `announcements` |
| `/announcements/:id/delete` | Delete announcement       | `announcements.delete` | `announcements` |

#### Notifications

| Route                          | Functionality             | Permissions Required   | Module Code     |
| ------------------------------ | ------------------------- | ---------------------- | --------------- |
| `/notifications`               | Notification center       | `notifications.view`   | `notifications` |
| `/notifications/:id`           | View notification details | `notifications.view`   | `notifications` |
| `/notifications/:id/mark-read` | Mark notification as read | `notifications.update` | `notifications` |
| `/notifications/settings`      | Notification preferences  | `notifications.update` | `notifications` |
| `/notifications/send`          | Send notification         | `notifications.create` | `notifications` |
| `/notifications/send-bulk`     | Send bulk notifications   | `notifications.create` | `notifications` |

---

## Common Routes (Available to All)

| Route           | Functionality            | Permissions Required | Module Code |
| --------------- | ------------------------ | -------------------- | ----------- |
| `/dashboard`    | Main dashboard           | `dashboard.view`     | `dashboard` |
| `/profile`      | Own profile              | `profile.view`       | `profile`   |
| `/help`         | Help & documentation     | Public               | -           |
| `/support`      | Support tickets          | `support.view`       | `support`   |
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

**TIER 1 Total Routes**: ~150 routes covering:

- ✅ User Management (21 routes)
- ✅ Student Management (19 routes)
- ✅ Attendance Management (18 routes)
- ✅ Academic Management (60 routes)
- ✅ Examination System (19 routes)
- ✅ Fee Management (19 routes)
- ✅ Communication System (18 routes)

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

### 2.4 Homework & Diary

| Route                                           | Functionality               | Permissions Required | Module Code |
| ----------------------------------------------- | --------------------------- | -------------------- | ----------- |
| `/homework`                                     | Homework dashboard          | `homework.view`      | `homework`  |
| `/homework/create`                              | Post homework               | `homework.create`    | `homework`  |
| `/homework/:id`                                 | View homework details       | `homework.view`      | `homework`  |
| `/homework/:id/edit`                            | Edit homework               | `homework.update`    | `homework`  |
| `/homework/:id/delete`                          | Delete homework             | `homework.delete`    | `homework`  |
| `/homework/diary`                               | Daily homework diary        | `homework.view`      | `homework`  |
| `/homework/by-section/:sectionId`               | View section homework       | `homework.view`      | `homework`  |
| `/homework/by-date/:date`                       | View homework by date       | `homework.view`      | `homework`  |
| `/homework/:id/submissions`                     | View submissions            | `homework.view`      | `homework`  |
| `/homework/:id/submissions/:studentId`          | View student submission     | `homework.view`      | `homework`  |
| `/homework/:id/submissions/:studentId/evaluate` | Evaluate homework           | `homework.update`    | `homework`  |
| `/homework/my-homework`                         | View own homework (student) | `homework.view`      | `homework`  |
| `/homework/:id/submit`                          | Submit homework             | `homework.create`    | `homework`  |

---

## TIER 3: ADVANCED FEATURES - Route Structure

### 3.1 AI-Powered Analytics

| Route                                       | Functionality                 | Permissions Required | Module Code |
| ------------------------------------------- | ----------------------------- | -------------------- | ----------- |
| `/analytics`                                | Analytics dashboard           | `analytics.view`     | `analytics` |
| `/analytics/student-performance`            | Student performance analytics | `analytics.view`     | `analytics` |
| `/analytics/student-performance/:studentId` | Individual student analysis   | `analytics.view`     | `analytics` |
| `/analytics/attendance-patterns`            | Attendance pattern analysis   | `analytics.view`     | `analytics` |
| `/analytics/dropout-risk`                   | Dropout risk detection        | `analytics.view`     | `analytics` |
| `/analytics/academic-trends`                | Academic trend reports        | `analytics.view`     | `analytics` |
| `/analytics/class-performance/:classId`     | Class performance trends      | `analytics.view`     | `analytics` |
| `/analytics/teacher-effectiveness`          | Teacher effectiveness metrics | `analytics.view`     | `analytics` |
| `/analytics/comparative-analysis`           | Comparative analysis          | `analytics.view`     | `analytics` |
| `/analytics/predictions`                    | AI predictions                | `analytics.view`     | `analytics` |
| `/analytics/export`                         | Export analytics data         | `analytics.export`   | `analytics` |

---

### 3.2 Parent-Teacher Meeting (PTM)

| Route                          | Functionality             | Permissions Required | Module Code |
| ------------------------------ | ------------------------- | -------------------- | ----------- |
| `/ptm`                         | PTM dashboard             | `ptm.view`           | `ptm`       |
| `/ptm/slots`                   | View available slots      | `ptm.view`           | `ptm`       |
| `/ptm/slots/create`            | Create availability slots | `ptm.create`         | `ptm`       |
| `/ptm/slots/:id/edit`          | Edit slot                 | `ptm.update`         | `ptm`       |
| `/ptm/bookings`                | View bookings             | `ptm.view`           | `ptm`       |
| `/ptm/bookings/create`         | Book PTM slot (parent)    | `ptm.create`         | `ptm`       |
| `/ptm/bookings/:id`            | View booking details      | `ptm.view`           | `ptm`       |
| `/ptm/bookings/:id/cancel`     | Cancel booking            | `ptm.delete`         | `ptm`       |
| `/ptm/bookings/:id/reschedule` | Reschedule booking        | `ptm.update`         | `ptm`       |
| `/ptm/meetings/:id/notes`      | View meeting notes        | `ptm.view`           | `ptm`       |
| `/ptm/meetings/:id/notes/add`  | Add meeting notes         | `ptm.create`         | `ptm`       |
| `/ptm/meetings/:id/follow-up`  | Add follow-up actions     | `ptm.update`         | `ptm`       |
| `/ptm/calendar`                | PTM calendar view         | `ptm.view`           | `ptm`       |
| `/ptm/reports`                 | PTM reports               | `ptm.view`           | `ptm`       |

---

### 3.3 Alumni Management

| Route                          | Functionality               | Permissions Required | Module Code |
| ------------------------------ | --------------------------- | -------------------- | ----------- |
| `/alumni`                      | Alumni dashboard            | `alumni.view`        | `alumni`    |
| `/alumni/directory`            | Alumni directory            | `alumni.view`        | `alumni`    |
| `/alumni/register`             | Alumni registration         | `alumni.create`      | `alumni`    |
| `/alumni/:id`                  | View alumni profile         | `alumni.view`        | `alumni`    |
| `/alumni/:id/edit`             | Edit alumni profile         | `alumni.update`      | `alumni`    |
| `/alumni/:id/delete`           | Delete alumni record        | `alumni.delete`      | `alumni`    |
| `/alumni/events`               | View alumni events          | `alumni.view`        | `alumni`    |
| `/alumni/events/create`        | Create alumni event         | `alumni.create`      | `alumni`    |
| `/alumni/events/:id`           | View event details          | `alumni.view`        | `alumni`    |
| `/alumni/events/:id/edit`      | Edit event                  | `alumni.update`      | `alumni`    |
| `/alumni/events/:id/register`  | Register for event          | `alumni.create`      | `alumni`    |
| `/alumni/events/:id/attendees` | View event attendees        | `alumni.view`        | `alumni`    |
| `/alumni/donations`            | View donations              | `alumni.view`        | `alumni`    |
| `/alumni/donations/create`     | Record donation             | `alumni.create`      | `alumni`    |
| `/alumni/donations/:id`        | View donation details       | `alumni.view`        | `alumni`    |
| `/alumni/mentorship`           | Mentorship program          | `alumni.view`        | `alumni`    |
| `/alumni/mentorship/enroll`    | Enroll as mentor            | `alumni.create`      | `alumni`    |
| `/alumni/mentorship/matches`   | View mentor-student matches | `alumni.view`        | `alumni`    |
| `/alumni/export`               | Export alumni data          | `alumni.export`      | `alumni`    |

---

### 3.4 Admission Management

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

### 3.5 Inventory & Asset Management

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

### 3.6 Certificate & Document Generation

| Route                                | Functionality                 | Permissions Required   | Module Code    |
| ------------------------------------ | ----------------------------- | ---------------------- | -------------- |
| `/certificates`                      | Certificates dashboard        | `certificates.view`    | `certificates` |
| `/certificates/templates`            | View certificate templates    | `certificates.view`    | `certificates` |
| `/certificates/templates/create`     | Create template               | `certificates.create`  | `certificates` |
| `/certificates/templates/:id/edit`   | Edit template                 | `certificates.update`  | `certificates` |
| `/certificates/requests`             | View certificate requests     | `certificates.view`    | `certificates` |
| `/certificates/requests/create`      | Request certificate (student) | `certificates.create`  | `certificates` |
| `/certificates/requests/:id`         | View request details          | `certificates.view`    | `certificates` |
| `/certificates/requests/:id/approve` | Approve/reject request        | `certificates.approve` | `certificates` |
| `/certificates/generate`             | Generate certificate          | `certificates.create`  | `certificates` |
| `/certificates/generated`            | View generated certificates   | `certificates.view`    | `certificates` |
| `/certificates/:id`                  | View certificate              | `certificates.view`    | `certificates` |
| `/certificates/:id/download`         | Download certificate PDF      | `certificates.view`    | `certificates` |
| `/certificates/:id/verify`           | Verify certificate            | Public                 | `certificates` |
| `/certificates/export`               | Export certificates data      | `certificates.export`  | `certificates` |

---

### 3.7 Advanced Fee Management (Online Payments)

| Route                       | Functionality               | Permissions Required | Module Code |
| --------------------------- | --------------------------- | -------------------- | ----------- |
| `/fees/online-payments`     | Online payments dashboard   | `fees.view`          | `fees`      |
| `/fees/pay-online`          | Pay fee online (parent)     | `fees.create`        | `fees`      |
| `/fees/payment-gateway`     | Payment gateway integration | `fees.create`        | `fees`      |
| `/fees/transactions`        | View online transactions    | `fees.view`          | `fees`      |
| `/fees/transactions/:id`    | View transaction details    | `fees.view`          | `fees`      |
| `/fees/reconciliation`      | Payment reconciliation      | `fees.approve`       | `fees`      |
| `/fees/refunds`             | Refund requests             | `fees.view`          | `fees`      |
| `/fees/refunds/:id/process` | Process refund              | `fees.approve`       | `fees`      |
| `/fees/payment-reports`     | Online payment reports      | `fees.view`          | `fees`      |

---

### 3.8 Survey & Feedback

| Route                          | Functionality              | Permissions Required | Module Code |
| ------------------------------ | -------------------------- | -------------------- | ----------- |
| `/surveys`                     | Surveys dashboard          | `surveys.view`       | `surveys`   |
| `/surveys/create`              | Create survey              | `surveys.create`     | `surveys`   |
| `/surveys/builder`             | Survey builder (drag-drop) | `surveys.create`     | `surveys`   |
| `/surveys/:id`                 | View survey                | `surveys.view`       | `surveys`   |
| `/surveys/:id/edit`            | Edit survey                | `surveys.update`     | `surveys`   |
| `/surveys/:id/delete`          | Delete survey              | `surveys.delete`     | `surveys`   |
| `/surveys/:id/publish`         | Publish survey             | `surveys.approve`    | `surveys`   |
| `/surveys/:id/respond`         | Respond to survey          | `surveys.create`     | `surveys`   |
| `/surveys/:id/responses`       | View responses             | `surveys.view`       | `surveys`   |
| `/surveys/:id/analytics`       | Survey analytics           | `surveys.view`       | `surveys`   |
| `/feedback`                    | Feedback dashboard         | `feedback.view`      | `feedback`  |
| `/feedback/teacher`            | Teacher feedback           | `feedback.view`      | `feedback`  |
| `/feedback/course`             | Course feedback            | `feedback.view`      | `feedback`  |
| `/feedback/infrastructure`     | Infrastructure feedback    | `feedback.view`      | `feedback`  |
| `/feedback/submit`             | Submit feedback            | `feedback.create`    | `feedback`  |
| `/feedback/reports`            | Feedback reports           | `feedback.view`      | `feedback`  |
| `/feedback/sentiment-analysis` | Sentiment analysis         | `feedback.view`      | `feedback`  |

---

## Route Summary by Tier

### TIER 1: BASIC FEATURES

- **User Management**: 21 routes
- **Student Management**: 29 routes (Students, Parents, Parent Portal, Promotion Workflow)
- **Attendance Management**: 25 routes (Student Attendance, Leave, Staff Attendance)
- **Academic Management**: 68 routes (Academic Years, Classes, Sections, Subjects, Topics, Teachers, Timetable with Student View, Lecture Templates)
- **Examination System**: 19 routes
- **Fee Management**: 19 routes
- **School Settings & Configuration**: 17 routes (Settings, Backup & Data Export)
- **ID Card Management**: 10 routes
- **Reports & Analytics**: 16 routes
- **Communication System**: 18 routes
- **TIER 1 Total**: ~242 routes

### TIER 2: STANDARD FEATURES

- **Online Learning (LMS)**: 34 routes (Assignments, Study Materials, Online Classes)
- **Transport Management**: 26 routes (Routes, Vehicles, Drivers, Allocations)
- **HR & Payroll**: 46 routes (Employees, Payroll, PF/ESI, Appraisals, Recruitment, Leave)
- **Homework & Diary**: 13 routes
- **TIER 2 Total**: ~119 routes

### TIER 3: ADVANCED FEATURES

- **AI Analytics**: 11 routes
- **PTM (Parent-Teacher Meeting)**: 14 routes
- **Alumni Management**: 19 routes
- **Admission Management**: 19 routes
- **Inventory & Asset Management**: 30 routes (Assets, Lab Equipment, Chemicals, Stationery)
- **Certificate Generation**: 14 routes
- **Online Payments**: 9 routes
- **Survey & Feedback**: 17 routes
- **TIER 3 Total**: ~133 routes

### GRAND TOTAL: ~494 routes across all tiers

---

## Implementation Notes

### Route Protection Pattern

```typescript
// All routes follow this protection pattern
<Route
  path="/attendance/mark"
  element={
    <ProtectedRoute requiredModule="attendance" requiredAction="create">
      <MarkAttendance />
    </ProtectedRoute>
  }
/>
```

### Permission Seeding Strategy

When setting up a new school, seed permissions in this order:

1. Create modules (dashboard, students, teachers, etc.)
2. Create permissions for each route
3. Create default roles (admin, teacher, student, parent)
4. Map permissions to roles via role_permissions table
5. Assign roles to users

### Dynamic Route Generation

Frontend can dynamically generate sidebar navigation based on user's cached permissions:

```typescript
const allowedRoutes = permissions.routes; // ['/students', '/teachers', '/attendance']
// Only render menu items for routes user can access
```

---

**Status**: Complete route structure for TIER 1, TIER 2, and TIER 3 | Ready for implementation
