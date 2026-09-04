# EduMunch: Default System Roles & Permissions

> Comprehensive role definitions that cover all routes and make the website fully functional

---

## Overview

This document defines **12 default system roles** that collectively provide access to all features and routes in the EduMunch platform. Schools can later customize these roles by restricting permissions as needed.

**Design Principle**: When combined, these roles cover 100% of all routes across Tier 1, 2, and 3.

---

## Permission Action Types

| Action  | Database Column | Description           |
| ------- | --------------- | --------------------- |
| View    | `can_read`      | Read/view data        |
| Create  | `can_create`    | Add new records       |
| Update  | `can_update`    | Edit existing records |
| Delete  | `can_delete`    | Remove records        |
| Approve | `can_approve`   | Approve workflows     |
| Export  | `can_export`    | Export data           |

---

## Role 1: Super Admin (System Administrator)

**Role Code**: `super_admin`  
**Role Name**: Super Administrator  
**Description**: Complete system access. Can manage all features, users, roles, and permissions.

### Permissions: ALL MODULES - FULL ACCESS

| Module          | View | Create | Update | Delete | Approve | Export |
| --------------- | ---- | ------ | ------ | ------ | ------- | ------ |
| **ALL MODULES** | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |

**Route Access**: All 340+ routes across Tier 1, 2, 3

**Special Privileges**:

- Can create/edit/delete roles
- Can assign permissions to roles
- Can manage system settings
- Can access all branches (if multi-branch enabled)

---

## Role 2: Principal (School Head)

**Role Code**: `principal`  
**Role Name**: Principal  
**Description**: School head with full operational access. Cannot modify system roles but can manage all school operations.

### Tier 1 Permissions

| Module                | View | Create | Update | Delete | Approve | Export |
| --------------------- | ---- | ------ | ------ | ------ | ------- | ------ |
| **dashboard**         | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **users**             | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **roles**             | ✅   | ❌     | ❌     | ❌     | ❌      | ✅     |
| **students**          | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **parents**           | ✅   | ✅     | ✅     | ✅     | ❌      | ✅     |
| **teachers**          | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **employees**         | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **attendance**        | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **staff_attendance**  | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **leave**             | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **classes**           | ✅   | ✅     | ✅     | ✅     | ❌      | ✅     |
| **sections**          | ✅   | ✅     | ✅     | ✅     | ❌      | ✅     |
| **subjects**          | ✅   | ✅     | ✅     | ✅     | ❌      | ✅     |
| **topics**            | ✅   | ✅     | ✅     | ✅     | ❌      | ✅     |
| **academic_years**    | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **timetable**         | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **lecture_templates** | ✅   | ✅     | ✅     | ✅     | ❌      | ✅     |
| **exams**             | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **marks**             | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **report_cards**      | ✅   | ✅     | ✅     | ❌     | ✅      | ✅     |
| **fees**              | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **announcements**     | ✅   | ✅     | ✅     | ✅     | ❌      | ✅     |
| **notifications**     | ✅   | ✅     | ✅     | ❌     | ❌      | ✅     |
| **settings**          | ✅   | ✅     | ✅     | ❌     | ✅      | ✅     |
| **id_cards**          | ✅   | ✅     | ✅     | ❌     | ✅      | ✅     |
| **reports**           | ✅   | ✅     | ❌     | ❌     | ❌      | ✅     |

### Tier 2 Permissions

| Module              | View | Create | Update | Delete | Approve | Export |
| ------------------- | ---- | ------ | ------ | ------ | ------- | ------ |
| **assignments**     | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **study_materials** | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **online_classes**  | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **transport**       | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **payroll**         | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **staff_leave**     | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **appraisals**      | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **recruitment**     | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **homework**        | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **feedback**        | ✅   | ✅     | ✅     | ✅     | ❌      | ✅     |
| **grievances**      | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **support**         | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |

### Tier 3 Permissions

| Module           | View | Create | Update | Delete | Approve | Export |
| ---------------- | ---- | ------ | ------ | ------ | ------- | ------ |
| **analytics**    | ✅   | ✅     | ❌     | ❌     | ❌      | ✅     |
| **ptm**          | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **alumni**       | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **admissions**   | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **inventory**    | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **certificates** | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **branches**     | ✅   | ✅     | ✅     | ✅     | ❌      | ✅     |

---

## Role 3: Academic Coordinator

**Role Code**: `academic_coordinator`  
**Role Name**: Academic Coordinator  
**Description**: Manages academic structure, curriculum, exams, and timetables.

### Permissions

| Module                | View | Create | Update | Delete | Approve | Export |
| --------------------- | ---- | ------ | ------ | ------ | ------- | ------ |
| **dashboard**         | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **students**          | ✅   | ❌     | ❌     | ❌     | ❌      | ✅     |
| **teachers**          | ✅   | ❌     | ❌     | ❌     | ❌      | ✅     |
| **classes**           | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **sections**          | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **subjects**          | ✅   | ✅     | ✅     | ✅     | ❌      | ✅     |
| **topics**            | ✅   | ✅     | ✅     | ✅     | ❌      | ✅     |
| **academic_years**    | ✅   | ✅     | ✅     | ❌     | ✅      | ✅     |
| **timetable**         | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **lecture_templates** | ✅   | ✅     | ✅     | ✅     | ❌      | ✅     |
| **exams**             | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **marks**             | ✅   | ❌     | ❌     | ❌     | ✅      | ✅     |
| **report_cards**      | ✅   | ✅     | ❌     | ❌     | ✅      | ✅     |
| **announcements**     | ✅   | ✅     | ✅     | ✅     | ❌      | ❌     |
| **reports**           | ✅   | ✅     | ❌     | ❌     | ❌      | ✅     |
| **assignments**       | ✅   | ❌     | ❌     | ❌     | ✅      | ✅     |
| **homework**          | ✅   | ❌     | ❌     | ❌     | ✅      | ✅     |
| **study_materials**   | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |

---

## Role 4: Teacher

**Role Code**: `teacher`  
**Role Name**: Teacher  
**Description**: Teaching staff with access to classroom management, attendance, marks entry, and assignments.

### Permissions

| Module              | View | Create | Update | Delete | Approve | Export |
| ------------------- | ---- | ------ | ------ | ------ | ------- | ------ |
| **dashboard**       | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **profile**         | ✅   | ❌     | ✅     | ❌     | ❌      | ❌     |
| **students**        | ✅   | ❌     | ❌     | ❌     | ❌      | ✅     |
| **attendance**      | ✅   | ✅     | ✅     | ❌     | ❌      | ✅     |
| **leave**           | ✅   | ✅     | ❌     | ❌     | ❌      | ❌     |
| **classes**         | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **sections**        | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **subjects**        | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **timetable**       | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **exams**           | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **marks**           | ✅   | ✅     | ✅     | ❌     | ❌      | ✅     |
| **report_cards**    | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **announcements**   | ✅   | ✅     | ❌     | ❌     | ❌      | ❌     |
| **notifications**   | ✅   | ✅     | ❌     | ❌     | ❌      | ❌     |
| **assignments**     | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **homework**        | ✅   | ✅     | ✅     | ✅     | ❌      | ✅     |
| **study_materials** | ✅   | ✅     | ✅     | ✅     | ❌      | ❌     |
| **online_classes**  | ✅   | ✅     | ✅     | ✅     | ❌      | ❌     |
| **doubts**          | ✅   | ✅     | ✅     | ✅     | ❌      | ❌     |
| **ptm**             | ✅   | ✅     | ✅     | ❌     | ❌      | ✅     |
| **staff_leave**     | ✅   | ✅     | ❌     | ❌     | ❌      | ❌     |

---

## Role 5: Accountant

**Role Code**: `accountant`  
**Role Name**: Accountant  
**Description**: Financial management including fees, payments, and financial reports.

### Permissions

| Module            | View | Create | Update | Delete | Approve | Export |
| ----------------- | ---- | ------ | ------ | ------ | ------- | ------ |
| **dashboard**     | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **students**      | ✅   | ❌     | ❌     | ❌     | ❌      | ✅     |
| **fees**          | ✅   | ✅     | ✅     | ❌     | ✅      | ✅     |
| **reports**       | ✅   | ✅     | ❌     | ❌     | ❌      | ✅     |
| **announcements** | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **notifications** | ✅   | ✅     | ❌     | ❌     | ❌      | ❌     |

**Constraints**:

- Can approve fee payments up to ₹50,000
- Higher amounts require Principal approval

---

## Role 6: HR Manager

**Role Code**: `hr_manager`  
**Role Name**: HR Manager  
**Description**: Human resources management including employee records, payroll, leave, recruitment.

### Permissions

| Module               | View | Create | Update | Delete | Approve | Export |
| -------------------- | ---- | ------ | ------ | ------ | ------- | ------ |
| **dashboard**        | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **users**            | ✅   | ✅     | ✅     | ❌     | ❌      | ✅     |
| **teachers**         | ✅   | ✅     | ✅     | ❌     | ✅      | ✅     |
| **employees**        | ✅   | ✅     | ✅     | ❌     | ✅      | ✅     |
| **staff_attendance** | ✅   | ✅     | ✅     | ❌     | ❌      | ✅     |
| **staff_leave**      | ✅   | ✅     | ✅     | ❌     | ✅      | ✅     |
| **payroll**          | ✅   | ✅     | ✅     | ❌     | ✅      | ✅     |
| **appraisals**       | ✅   | ✅     | ✅     | ❌     | ✅      | ✅     |
| **recruitment**      | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **announcements**    | ✅   | ✅     | ✅     | ❌     | ❌      | ❌     |
| **reports**          | ✅   | ✅     | ❌     | ❌     | ❌      | ✅     |
| **id_cards**         | ✅   | ✅     | ❌     | ❌     | ❌      | ❌     |

---

## Role 7: Exam Controller

**Role Code**: `exam_controller`  
**Role Name**: Exam Controller  
**Description**: Examination management including exam scheduling, marks verification, report cards.

### Permissions

| Module            | View | Create | Update | Delete | Approve | Export |
| ----------------- | ---- | ------ | ------ | ------ | ------- | ------ |
| **dashboard**     | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **students**      | ✅   | ❌     | ❌     | ❌     | ❌      | ✅     |
| **classes**       | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **sections**      | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **subjects**      | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **exams**         | ✅   | ✅     | ✅     | ✅     | ✅      | ✅     |
| **marks**         | ✅   | ✅     | ✅     | ❌     | ✅      | ✅     |
| **report_cards**  | ✅   | ✅     | ✅     | ❌     | ✅      | ✅     |
| **announcements** | ✅   | ✅     | ❌     | ❌     | ❌      | ❌     |
| **notifications** | ✅   | ✅     | ❌     | ❌     | ❌      | ❌     |
| **reports**       | ✅   | ✅     | ❌     | ❌     | ❌      | ✅     |

---

## Role 8: Front Desk / Receptionist

**Role Code**: `receptionist`  
**Role Name**: Receptionist  
**Description**: Front office operations including admissions, visitor management, basic student info.

### Permissions

| Module            | View | Create | Update | Delete | Approve | Export |
| ----------------- | ---- | ------ | ------ | ------ | ------- | ------ |
| **dashboard**     | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **students**      | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **parents**       | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **teachers**      | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **admissions**    | ✅   | ✅     | ✅     | ❌     | ❌      | ✅     |
| **announcements** | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **notifications** | ✅   | ✅     | ❌     | ❌     | ❌      | ❌     |
| **support**       | ✅   | ✅     | ✅     | ❌     | ❌      | ❌     |

---

## Role 9: Librarian

**Role Code**: `librarian`  
**Role Name**: Librarian  
**Description**: Library and inventory management.

### Permissions

| Module        | View | Create | Update | Delete | Approve | Export |
| ------------- | ---- | ------ | ------ | ------ | ------- | ------ |
| **dashboard** | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **students**  | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **teachers**  | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **inventory** | ✅   | ✅     | ✅     | ✅     | ❌      | ✅     |
| **reports**   | ✅   | ✅     | ❌     | ❌     | ❌      | ✅     |

---

## Role 10: Transport Manager

**Role Code**: `transport_manager`  
**Role Name**: Transport Manager  
**Description**: Transport operations including routes, vehicles, drivers, student allocations.

### Permissions

| Module            | View | Create | Update | Delete | Approve | Export |
| ----------------- | ---- | ------ | ------ | ------ | ------- | ------ |
| **dashboard**     | ✅   | ❌     | ❌     | ❌     | ❌      | ❌     |
| **students**      | ✅   | ❌     | ❌     | ❌     | ❌      | ✅     |
| **transport**     | ✅   | ✅     | ✅     | ✅     | ❌      | ✅     |
| **reports**       | ✅   | ✅     | ❌     | ❌     | ❌      | ✅     |
| **announcements** | ✅   | ✅     | ❌     | ❌     | ❌      | ❌     |

---

## Role 11: Student

**Role Code**: `student`  
**Role Name**: Student  
**Description**: Student portal access for viewing own information.

### Permissions

| Module              | View     | Create | Update | Delete | Approve | Export |
| ------------------- | -------- | ------ | ------ | ------ | ------- | ------ |
| **dashboard**       | ✅       | ❌     | ❌     | ❌     | ❌      | ❌     |
| **profile**         | ✅       | ❌     | ✅     | ❌     | ❌      | ❌     |
| **attendance**      | ✅ (own) | ❌     | ❌     | ❌     | ❌      | ❌     |
| **timetable**       | ✅ (own) | ❌     | ❌     | ❌     | ❌      | ❌     |
| **exams**           | ✅ (own) | ❌     | ❌     | ❌     | ❌      | ❌     |
| **marks**           | ✅ (own) | ❌     | ❌     | ❌     | ❌      | ❌     |
| **report_cards**    | ✅ (own) | ❌     | ❌     | ❌     | ❌      | ✅     |
| **fees**            | ✅ (own) | ❌     | ❌     | ❌     | ❌      | ❌     |
| **assignments**     | ✅ (own) | ✅     | ❌     | ❌     | ❌      | ❌     |
| **homework**        | ✅ (own) | ✅     | ❌     | ❌     | ❌      | ❌     |
| **study_materials** | ✅       | ❌     | ❌     | ❌     | ❌      | ✅     |
| **online_classes**  | ✅ (own) | ❌     | ❌     | ❌     | ❌      | ❌     |
| **doubts**          | ✅ (own) | ✅     | ❌     | ❌     | ❌      | ❌     |
| **announcements**   | ✅       | ❌     | ❌     | ❌     | ❌      | ❌     |

**Constraints**: Row-level security - can only access own records

---

## Role 12: Parent

**Role Code**: `parent`  
**Role Name**: Parent  
**Description**: Parent portal access for viewing children's information.

### Permissions

| Module            | View                  | Create          | Update | Delete | Approve | Export |
| ----------------- | --------------------- | --------------- | ------ | ------ | ------- | ------ |
| **dashboard**     | ✅ (parent dashboard) | ❌              | ❌     | ❌     | ❌      | ❌     |
| **profile**       | ✅                    | ❌              | ✅     | ❌     | ❌      | ❌     |
| **students**      | ✅ (children only)    | ❌              | ❌     | ❌     | ❌      | ❌     |
| **attendance**    | ✅ (children only)    | ❌              | ❌     | ❌     | ❌      | ❌     |
| **timetable**     | ✅ (children only)    | ❌              | ❌     | ❌     | ❌      | ❌     |
| **exams**         | ✅ (children only)    | ❌              | ❌     | ❌     | ❌      | ❌     |
| **marks**         | ✅ (children only)    | ❌              | ❌     | ❌     | ❌      | ❌     |
| **report_cards**  | ✅ (children only)    | ❌              | ❌     | ❌     | ❌      | ✅     |
| **fees**          | ✅ (children only)    | ✅ (payment)    | ❌     | ❌     | ❌      | ❌     |
| **homework**      | ✅ (children only)    | ❌              | ❌     | ❌     | ❌      | ❌     |
| **teachers**      | ✅ (child's teachers) | ❌              | ❌     | ❌     | ❌      | ❌     |
| **announcements** | ✅                    | ❌              | ❌     | ❌     | ❌      | ❌     |
| **ptm**           | ✅                    | ✅ (book slots) | ✅     | ✅     | ❌      | ❌     |

**Constraints**: Row-level security - can only access own children's records

---

## Route Coverage Analysis

### Tier 1 Routes (~150 routes)

| Module Group                         | Covered By Roles                                                                                                |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Auth & Profile                       | All roles                                                                                                       |
| Users & Roles                        | Super Admin, Principal                                                                                          |
| Students & Parents                   | Super Admin, Principal, Academic Coordinator, Teachers (view), Accountant (view), Receptionist, Student, Parent |
| Attendance                           | Super Admin, Principal, Academic Coordinator, Teachers                                                          |
| Academic (Classes, Subjects, Topics) | Super Admin, Principal, Academic Coordinator, Teachers (view)                                                   |
| Teachers                             | Super Admin, Principal, HR Manager, Academic Coordinator (view)                                                 |
| Timetable                            | Super Admin, Principal, Academic Coordinator, Teachers (view), Students (view own)                              |
| Exams & Marks                        | Super Admin, Principal, Academic Coordinator, Exam Controller, Teachers (marks entry)                           |
| Fees                                 | Super Admin, Principal, Accountant, Parents (view + pay)                                                        |
| Settings                             | Super Admin, Principal                                                                                          |
| Communication                        | All roles (varying access levels)                                                                               |
| Reports                              | Super Admin, Principal, Academic Coordinator, Accountant, HR Manager                                            |

### Tier 2 Routes (~100 routes)

| Module Group                                 | Covered By Roles                                                 |
| -------------------------------------------- | ---------------------------------------------------------------- |
| LMS (Assignments, Homework, Study Materials) | Super Admin, Principal, Academic Coordinator, Teachers, Students |
| Online Classes                               | Super Admin, Principal, Teachers, Students                       |
| Transport                                    | Super Admin, Principal, Transport Manager                        |
| HR & Payroll                                 | Super Admin, Principal, HR Manager                               |
| Feedback & Support                           | Super Admin, Principal, Teachers, Students, Receptionist         |

### Tier 3 Routes (~90 routes)

| Module Group | Covered By Roles                          |
| ------------ | ----------------------------------------- |
| Analytics    | Super Admin, Principal                    |
| PTM          | Super Admin, Principal, Teachers, Parents |
| Alumni       | Super Admin, Principal                    |
| Admissions   | Super Admin, Principal, Receptionist      |
| Inventory    | Super Admin, Principal, Librarian         |
| Certificates | Super Admin, Principal                    |
| Branches     | Super Admin, Principal                    |

---

## Implementation Notes

### 1. SQL File Structure

```sql
-- Set INDEX_TOKEN at top
DO $$
DECLARE
    INDEX_TOKEN TEXT := '1EMAET';
BEGIN
    -- Create roles
    -- Assign permissions
    -- Create role_permissions mapping
END $$;
```

### 2. Permission Module Codes

Based on ROUTES_FOR_FEATURES.md, module codes include:

- `dashboard`, `profile`, `users`, `roles`, `permissions`
- `students`, `parents`, `teachers`, `employees`
- `attendance`, `staff_attendance`, `leave`, `staff_leave`
- `classes`, `sections`, `subjects`, `topics`, `academic_years`
- `timetable`, `lecture_templates`
- `exams`, `marks`, `report_cards`
- `fees`, `announcements`, `notifications`
- `settings`, `id_cards`, `reports`
- `assignments`, `study_materials`, `online_classes`, `doubts`, `homework`
- `transport`, `payroll`, `appraisals`, `recruitment`
- `feedback`, `grievances`, `support`
- `analytics`, `ptm`, `alumni`, `admissions`, `inventory`, `certificates`, `branches`

### 3. Row-Level Security

For Student and Parent roles, implement RLS policies:

```sql
-- Example: Students can only view their own attendance
CREATE POLICY "Students view own attendance"
ON attendance_1EMAET
FOR SELECT
USING (
  auth.uid() IN (
    SELECT auth_user_id FROM students_1EMAET
    WHERE id = student_id
  )
);
```

---

## Summary

**Total Roles**: 12  
**Total Modules**: ~40  
**Total Routes Covered**: 340+

When all 12 roles are combined, they provide 100% coverage of all features and routes, making the website fully functional for a complete school management system.

Schools can then:

1. **Disable unnecessary roles** based on their requirements
2. **Customize permissions** for existing roles
3. **Create additional roles** for specific needs
4. **Combine roles** for multi-responsibility positions

---

_Last Updated: December 24, 2025_
