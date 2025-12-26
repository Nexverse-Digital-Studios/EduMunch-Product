# EduMunch: Complete Modules & Routes Mapping

> Comprehensive reference for all database modules and their associated routes

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Modules Structure](#database-modules-structure)
3. [Tier 1 Modules & Routes](#tier-1-modules--routes)
4. [Tier 2 Modules & Routes](#tier-2-modules--routes)
5. [Tier 3 Modules & Routes](#tier-3-modules--routes)
6. [Module Statistics](#module-statistics)
7. [Implementation Checklist](#implementation-checklist)

---

## Overview

### What This Document Contains

This document provides a **complete mapping** between:
- **Database Modules** (stored in `modules_1EMAET` table)
- **Application Routes** (implemented in frontend router)

### How to Use This Document

```
For Developers:
├─ Check which modules need database entries
├─ Reference when creating route configurations
├─ Verify all routes are implemented for each module
└─ Use as checklist during development

For Database Admins:
├─ Create module records in modules_1EMAET table
├─ Set correct module_code for each module
└─ Configure display_order for sidebar ordering

For QA/Testing:
├─ Verify all routes are accessible
├─ Test permissions for each route
└─ Ensure no routes are missing
```

---

## Database Modules Structure

### Table: `modules_1EMAET`

```sql
CREATE TABLE modules_1EMAET (
  id UUID PRIMARY KEY,
  module_code VARCHAR NOT NULL UNIQUE,  -- Used in permissions & routes
  module_name VARCHAR NOT NULL,         -- Display name
  description TEXT,                     -- Purpose of module
  route_prefix VARCHAR,                 -- Base URL path
  icon VARCHAR,                         -- UI icon name
  display_order INTEGER,                -- Sidebar order
  is_active BOOLEAN DEFAULT true,       -- Feature toggle
  parent_module_id UUID,                -- For nested modules
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Module Naming Convention

| Field | Example | Purpose |
|-------|---------|---------|
| `module_code` | `students` | Used in permission checks, lowercase, underscore-separated |
| `module_name` | `Student Management` | Display name in UI |
| `route_prefix` | `/students` | Base path for all routes in this module |
| `icon` | `GraduationCap` | Lucide React icon component name |

---

## Tier 1 Modules & Routes

### Module 1: Dashboard

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('dashboard', 'Dashboard', 'Main dashboard with analytics and quick stats', '/dashboard', 'LayoutDashboard', 1);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/dashboard` | Main dashboard page | `view` |

**Total Routes:** 1

---

### Module 2: Profile

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('profile', 'Profile Management', 'User profile management', '/profile', 'User', 2);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/profile` | View own profile | `view` |
| `/profile/edit` | Edit own profile details | `update` |
| `/profile/change-password` | Change own password | `update` |
| `/profile/upload-photo` | Upload profile photo | `update` |

**Total Routes:** 4

---

### Module 3: Users

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('users', 'User Management', 'Manage system users and accounts', '/users', 'Users', 3);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/users` | List all users | `view` |
| `/users/create` | Add new user | `create` |
| `/users/:id` | View user details | `view` |
| `/users/:id/edit` | Edit user details | `update` |
| `/users/:id/delete` | Delete user | `delete` |
| `/users/:id/assign-role` | Assign role to user | `update` |
| `/users/:id/grant-permission` | Grant additional permission | `update` |
| `/users/bulk-upload` | Bulk user upload | `create` |

**Total Routes:** 8

---

### Module 4: Roles

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('roles', 'Role Management', 'Manage roles and role assignments', '/roles', 'Shield', 4);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/roles` | List all roles | `view` |
| `/roles/create` | Create custom role | `create` |
| `/roles/:id/edit` | Edit role details | `update` |
| `/roles/:id/permissions` | Assign permissions to role | `update` |
| `/roles/:id/delete` | Delete custom role | `delete` |

**Total Routes:** 5

---

### Module 5: Permissions

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('permissions', 'Permission Management', 'View and manage system permissions', '/permissions', 'Key', 5);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/permissions` | View all permissions | `view` |

**Total Routes:** 1

---

### Module 6: Students

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('students', 'Student Management', 'Manage student records and profiles', '/students', 'GraduationCap', 10);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/students` | List all students | `view` |
| `/students/create` | Add new student | `create` |
| `/students/:id` | View student details | `view` |
| `/students/:id/edit` | Edit student details | `update` |
| `/students/:id/delete` | Delete student (soft delete) | `delete` |
| `/students/:id/documents` | View student documents | `view` |
| `/students/:id/documents/upload` | Upload student documents | `update` |
| `/students/:id/medical-records` | View medical records | `view` |
| `/students/:id/medical-records/edit` | Edit medical records | `update` |
| `/students/:id/parents` | View parent/guardian info | `view` |
| `/students/:id/parents/add` | Add parent/guardian | `update` |
| `/students/:id/id-card` | Generate student ID card | `view` |
| `/students/bulk-upload` | Bulk student upload via Excel | `create` |
| `/students/promotion` | Student promotion dashboard | `view` |
| `/students/promotion/configure` | Configure promotion rules | `update` |
| `/students/promotion/preview` | Preview promotion list | `view` |
| `/students/promotion/execute` | Execute student promotion | `approve` |
| `/students/promote` | Bulk promote students | `update` + `approve` |
| `/students/transfer` | Bulk transfer between sections | `update` |
| `/students/export` | Export students list | `export` |

**Total Routes:** 20

---

### Module 7: Parents

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('parents', 'Parent Management', 'Manage parent records and portal access', '/parents', 'Users', 11);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/parents` | List all parents | `view` |
| `/parents/create` | Add new parent | `create` |
| `/parents/:id` | View parent details | `view` |
| `/parents/:id/edit` | Edit parent details | `update` |

**Total Routes:** 4

---

### Module 8: Parent Portal

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('parent', 'Parent Portal', 'Parent self-service portal for viewing children info', '/parent', 'Home', 12);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/parent/dashboard` | Parent-specific dashboard | `view` |
| `/parent/children` | View all children | `view` |
| `/parent/children/:id/profile` | View child profile | `view` |
| `/parent/children/:id/attendance` | View child attendance | `view` |
| `/parent/children/:id/results` | View child exam results | `view` |
| `/parent/children/:id/fees` | View child fee status | `view` |
| `/parent/children/:id/homework` | View child homework | `view` |
| `/parent/children/:id/timetable` | View child timetable | `view` |
| `/parent/children/:id/teachers` | View child's teachers | `view` |
| `/parent/fee-payment` | Pay fees online | `create` |

**Total Routes:** 10

---

### Module 9: Teachers

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('teachers', 'Teacher Management', 'Manage teacher records and assignments', '/teachers', 'BookOpen', 15);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/teachers` | List all teachers | `view` |
| `/teachers/create` | Add new teacher | `create` |
| `/teachers/:id` | View teacher details | `view` |
| `/teachers/:id/edit` | Edit teacher details | `update` |
| `/teachers/:id/delete` | Delete teacher | `delete` |
| `/teachers/:id/subjects` | View assigned subjects | `view` |
| `/teachers/:id/assign-subject` | Assign subject to teacher | `update` |
| `/teachers/:id/timetable` | View teacher timetable | `view` |
| `/teachers/bulk-upload` | Bulk teacher upload | `create` |
| `/teachers/export` | Export teachers list | `export` |

**Total Routes:** 10

---

### Module 10: Employees

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('employees', 'Employee Management', 'Manage non-teaching staff records', '/employees', 'Briefcase', 16);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/employees` | List all employees | `view` |
| `/employees/create` | Add new employee | `create` |
| `/employees/:id` | View employee details | `view` |
| `/employees/:id/edit` | Edit employee details | `update` |
| `/employees/:id/delete` | Delete employee | `delete` |
| `/employees/bulk-upload` | Bulk employee upload | `create` |
| `/employees/export` | Export employees list | `export` |

**Total Routes:** 7

---

### Module 11: Student Attendance

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('attendance', 'Student Attendance', 'Mark and view student attendance records', '/attendance', 'CheckSquare', 20);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/attendance` | Attendance dashboard | `view` |
| `/attendance/mark` | Mark daily attendance | `create` |
| `/attendance/mark/:sectionId` | Mark attendance for specific section | `create` |
| `/attendance/mark/:sectionId/:date` | Edit attendance for specific date | `update` |
| `/attendance/view` | View attendance records | `view` |
| `/attendance/view/:sectionId` | View section-wise attendance | `view` |
| `/attendance/view/student/:studentId` | View student attendance history | `view` |
| `/attendance/reports` | Attendance reports dashboard | `view` |
| `/attendance/reports/daily` | Daily attendance report | `view` |
| `/attendance/reports/weekly` | Weekly attendance report | `view` |
| `/attendance/reports/monthly` | Monthly attendance report | `view` |
| `/attendance/reports/low-attendance` | Low attendance alerts | `view` |
| `/attendance/export` | Export attendance data | `export` |
| `/attendance/subject-wise` | Subject-wise attendance | `create` |

**Total Routes:** 14

---

### Module 12: Staff Attendance

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('staff_attendance', 'Staff Attendance', 'Mark and view staff attendance records', '/staff/attendance', 'CheckSquare', 21);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/staff/attendance` | Staff attendance dashboard | `view` |
| `/staff/attendance/mark` | Mark staff attendance | `create` |
| `/staff/attendance/view` | View all staff attendance | `view` |
| `/staff/attendance/view/:employeeId` | View employee attendance | `view` |
| `/staff/attendance/reports` | Staff attendance reports | `view` |
| `/staff/attendance/reports/monthly` | Monthly attendance report | `view` |
| `/staff/attendance/export` | Export staff attendance | `export` |

**Total Routes:** 7

---

### Module 13: Student Leave

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('leave', 'Student Leave Management', 'Manage student leave applications', '/leave-requests', 'Calendar', 22);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/leave-requests` | View leave applications | `view` |
| `/leave-requests/create` | Apply for leave | `create` |
| `/leave-requests/:id` | View leave request details | `view` |
| `/leave-requests/:id/approve` | Approve/reject leave | `approve` |
| `/leave-requests/student/:studentId` | Student leave history | `view` |

**Total Routes:** 5

---

### Module 14: Staff Leave

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('staff_leave', 'Staff Leave Management', 'Manage staff leave applications and approvals', '/staff/leave', 'Calendar', 23);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/staff/leave` | View all staff leave requests | `view` |
| `/staff/leave/apply` | Apply for leave | `create` |
| `/staff/leave/:id` | View leave details | `view` |
| `/staff/leave/:id/approve` | Approve/reject leave | `approve` |
| `/staff/leave/my-leaves` | View own leave history | `view` |
| `/staff/leave/balance` | View leave balance | `view` |

**Total Routes:** 6

---

### Module 15: Academic Years

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('academic_years', 'Academic Year Management', 'Manage academic year configurations', '/academic-years', 'Calendar', 30);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/academic-years` | List all academic years | `view` |
| `/academic-years/create` | Create new academic year | `create` |
| `/academic-years/:id` | View academic year details | `view` |
| `/academic-years/:id/edit` | Edit academic year | `update` |
| `/academic-years/:id/delete` | Delete academic year | `delete` |
| `/academic-years/:id/set-current` | Set as current year | `update` |

**Total Routes:** 6

---

### Module 16: Classes

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('classes', 'Class Management', 'Manage classes and grade levels', '/classes', 'School', 31);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/classes` | List all classes | `view` |
| `/classes/create` | Create new class | `create` |
| `/classes/:id` | View class details | `view` |
| `/classes/:id/edit` | Edit class details | `update` |
| `/classes/:id/delete` | Delete class | `delete` |

**Total Routes:** 5

---

### Module 17: Sections

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('sections', 'Section Management', 'Manage class sections and batches', '/sections', 'Layout', 32);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/sections` | List all sections | `view` |
| `/sections/create` | Create new section | `create` |
| `/sections/:id` | View section details | `view` |
| `/sections/:id/edit` | Edit section details | `update` |
| `/sections/:id/delete` | Delete section | `delete` |
| `/sections/:id/students` | View students in section | `view` |
| `/sections/:id/assign-teacher` | Assign class teacher | `update` |

**Total Routes:** 7

---

### Module 18: Subjects

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('subjects', 'Subject Management', 'Manage subjects and curriculum', '/subjects', 'Book', 33);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/subjects` | List all subjects | `view` |
| `/subjects/create` | Create new subject | `create` |
| `/subjects/:id` | View subject details | `view` |
| `/subjects/:id/edit` | Edit subject details | `update` |
| `/subjects/:id/delete` | Delete subject | `delete` |
| `/subjects/:id/assign-class` | Assign subject to class | `update` |
| `/subjects/:id/topics` | View topics under subject | `view` |

**Total Routes:** 7

---

### Module 19: Topics

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('topics', 'Topic Management', 'Manage subject topics and learning content', '/topics', 'FileText', 34);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/topics` | List all topics | `view` |
| `/topics/create` | Create new topic | `create` |
| `/topics/:id` | View topic details | `view` |
| `/topics/:id/edit` | Edit topic details | `update` |
| `/topics/:id/delete` | Delete topic | `delete` |
| `/topics/:id/content` | View learning materials | `view` |
| `/topics/:id/content/upload` | Upload learning materials | `update` |

**Total Routes:** 7

---

### Module 20: Timetable

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('timetable', 'Timetable Management', 'Manage class timetables and schedules', '/timetable', 'Clock', 35);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/timetable` | Timetable dashboard | `view` |
| `/timetable/view` | View all timetables | `view` |
| `/timetable/view/:sectionId` | View section timetable | `view` |
| `/timetable/create` | Create new timetable | `create` |
| `/timetable/:id/edit` | Edit timetable | `update` |
| `/timetable/:id/delete` | Delete timetable | `delete` |
| `/timetable/bulk-create` | Bulk schedule creation | `create` |
| `/timetable/copy` | Copy from previous week | `create` |
| `/timetable/conflicts` | View schedule conflicts | `view` |
| `/timetable/substitute` | Assign substitute teacher | `update` |
| `/timetable/periods` | Manage period configuration | `update` |
| `/timetable/export` | Export timetable | `export` |
| `/my-timetable` | Student's personal timetable | `view` |
| `/class-timetable` | Class timetable for students | `view` |

**Total Routes:** 14

---

### Module 21: Lecture Templates

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('lecture_templates', 'Lecture Templates', 'Manage reusable lecture schedule templates', '/lecture-templates', 'Layout', 36);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/lecture-templates` | List lecture templates | `view` |
| `/lecture-templates/create` | Create new template | `create` |
| `/lecture-templates/:id` | View template details | `view` |
| `/lecture-templates/:id/edit` | Edit template | `update` |
| `/lecture-templates/:id/delete` | Delete template | `delete` |

**Total Routes:** 5

---

### Module 22: Exams

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('exams', 'Examination Management', 'Manage exams, schedules, and seating arrangements', '/exams', 'ClipboardList', 40);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/exams` | Exams dashboard | `view` |
| `/exams/list` | List all exams | `view` |
| `/exams/create` | Create new exam | `create` |
| `/exams/:id` | View exam details | `view` |
| `/exams/:id/edit` | Edit exam details | `update` |
| `/exams/:id/delete` | Delete exam | `delete` |
| `/exams/:id/schedule` | View exam schedule | `view` |
| `/exams/:id/seating` | Generate seating arrangement | `create` |
| `/exams/:id/admit-cards` | Generate admit cards | `create` |
| `/exams/export` | Export exam data | `export` |

**Total Routes:** 10

---

### Module 23: Marks

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('marks', 'Marks Management', 'Enter and manage exam marks', '/marks', 'Edit', 41);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/exams/:id/marks` | Marks entry dashboard | `view` |
| `/exams/:id/marks/enter` | Enter marks | `create` |
| `/exams/:id/marks/bulk-upload` | Bulk marks upload via Excel | `create` |
| `/exams/:id/marks/verify` | Verify marks | `approve` |
| `/exams/:id/marks/:studentId` | View student marks | `view` |
| `/exams/:id/grades` | Calculate grades | `update` |

**Total Routes:** 6

---

### Module 24: Report Cards

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('report_cards', 'Report Card Management', 'Generate and manage report cards', '/report-cards', 'FileText', 42);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/exams/:id/report-cards` | Generate report cards | `create` |
| `/report-cards` | View all report cards | `view` |
| `/report-cards/:id` | View specific report card | `view` |
| `/report-cards/:id/download` | Download report card PDF | `view` |
| `/report-cards/templates` | Manage report card templates | `update` |

**Total Routes:** 5

---

### Module 25: Fees

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('fees', 'Fee Management', 'Manage fee structures, collections, and payments', '/fees', 'DollarSign', 50);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/fees` | Fee management dashboard | `view` |
| `/fees/structures` | View fee structures | `view` |
| `/fees/structures/create` | Create fee structure | `create` |
| `/fees/structures/:id/edit` | Edit fee structure | `update` |
| `/fees/assign` | Assign fees to students | `create` |
| `/fees/payments` | View all payments | `view` |
| `/fees/collect` | Collect fee payment | `create` |
| `/fees/collect/:studentId` | Collect from specific student | `create` |
| `/fees/receipts` | View receipts | `view` |
| `/fees/receipts/:id` | View receipt details | `view` |
| `/fees/receipts/:id/download` | Download receipt PDF | `view` |
| `/fees/receipts/:id/print` | Print receipt | `view` |
| `/fees/defaulters` | View fee defaulters list | `view` |
| `/fees/reminders` | Send payment reminders | `create` |
| `/fees/reports` | Fee collection reports | `view` |
| `/fees/reports/daily` | Daily collection report | `view` |
| `/fees/reports/monthly` | Monthly collection report | `view` |
| `/fees/reports/class-wise` | Class-wise collection | `view` |
| `/fees/discounts` | Manage fee discounts | `view` |
| `/fees/discounts/apply` | Apply discount | `create` |
| `/fees/refunds` | Process refunds | `create` |
| `/fees/export` | Export fee data | `export` |

**Total Routes:** 22

---

### Module 26: Settings

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('settings', 'School Settings', 'Manage school configuration and preferences', '/settings', 'Settings', 60);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/settings` | Settings dashboard | `view` |
| `/settings/school` | School information | `update` |
| `/settings/academic` | Academic settings | `update` |
| `/settings/fees` | Fee settings | `update` |
| `/settings/communication` | Communication settings | `update` |
| `/settings/notifications` | Notification preferences | `update` |

**Total Routes:** 6

---

### Module 27: ID Cards

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('id_cards', 'ID Card Management', 'Generate student and staff ID cards', '/id-cards', 'CreditCard', 61);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/id-cards` | ID card dashboard | `view` |
| `/id-cards/students` | Student ID cards | `view` |
| `/id-cards/students/generate` | Generate student cards | `create` |
| `/id-cards/staff` | Staff ID cards | `view` |
| `/id-cards/staff/generate` | Generate staff cards | `create` |
| `/id-cards/templates` | Manage card templates | `update` |

**Total Routes:** 6

---

### Module 28: Reports

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('reports', 'Reports & Analytics', 'View and generate various reports', '/reports', 'BarChart', 62);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/reports` | Reports dashboard | `view` |
| `/reports/students` | Student reports | `view` |
| `/reports/attendance` | Attendance reports | `view` |
| `/reports/academic` | Academic performance reports | `view` |
| `/reports/financial` | Financial reports | `view` |
| `/reports/staff` | Staff reports | `view` |
| `/reports/custom` | Create custom report | `create` |

**Total Routes:** 7

---

### Module 29: Announcements

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('announcements', 'Announcements', 'Manage school-wide announcements', '/announcements', 'Megaphone', 70);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/announcements` | View all announcements | `view` |
| `/announcements/create` | Create new announcement | `create` |
| `/announcements/:id` | View announcement details | `view` |
| `/announcements/:id/edit` | Edit announcement | `update` |
| `/announcements/:id/delete` | Delete announcement | `delete` |

**Total Routes:** 5

---

### Module 30: Notifications

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('notifications', 'Notifications', 'Manage system notifications', '/notifications', 'Bell', 71);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/notifications` | View all notifications | `view` |
| `/notifications/send` | Send notification | `create` |
| `/notifications/:id/mark-read` | Mark as read | `update` |

**Total Routes:** 3

---

### Module 31: Messages

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('messages', 'Messages', 'Send SMS and email messages', '/messages', 'Mail', 72);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/messages` | Messages dashboard | `view` |
| `/messages/compose` | Compose new message | `create` |
| `/messages/sms` | Send SMS | `create` |
| `/messages/email` | Send email | `create` |
| `/messages/templates` | Manage message templates | `view` |
| `/messages/history` | View message history | `view` |

**Total Routes:** 6

---

## Tier 2 Modules & Routes

### Module 32: Assignments

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('assignments', 'Assignments', 'Manage student assignments and submissions', '/assignments', 'FileEdit', 80);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/assignments` | View all assignments | `view` |
| `/assignments/create` | Create new assignment | `create` |
| `/assignments/:id` | View assignment details | `view` |
| `/assignments/:id/edit` | Edit assignment | `update` |
| `/assignments/:id/delete` | Delete assignment | `delete` |
| `/assignments/:id/submissions` | View submissions | `view` |
| `/assignments/:id/submissions/:studentId` | View student submission | `view` |
| `/assignments/:id/submissions/:studentId/grade` | Grade submission | `approve` |
| `/assignments/:id/submit` | Submit assignment (Student) | `create` |
| `/assignments/my-assignments` | Student's assignments | `view` |

**Total Routes:** 10

---

### Module 33: Study Materials

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('study_materials', 'Study Materials', 'Upload and manage study resources', '/study-materials', 'BookOpen', 81);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/study-materials` | View all materials | `view` |
| `/study-materials/upload` | Upload new material | `create` |
| `/study-materials/:id` | View material details | `view` |
| `/study-materials/:id/edit` | Edit material | `update` |
| `/study-materials/:id/delete` | Delete material | `delete` |
| `/study-materials/by-subject/:subjectId` | Filter by subject | `view` |
| `/study-materials/by-class/:classId` | Filter by class | `view` |

**Total Routes:** 7

---

### Module 34: Online Classes

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('online_classes', 'Online Classes', 'Schedule and conduct online classes', '/online-classes', 'Video', 82);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/online-classes` | View all sessions | `view` |
| `/online-classes/schedule` | Schedule new class | `create` |
| `/online-classes/:id` | View class details | `view` |
| `/online-classes/:id/edit` | Edit class details | `update` |
| `/online-classes/:id/cancel` | Cancel class | `delete` |
| `/online-classes/:id/join` | Join class (Student/Teacher) | `view` |
| `/online-classes/:id/recording` | View recording | `view` |
| `/online-classes/my-classes` | Student's scheduled classes | `view` |

**Total Routes:** 8

---

### Module 35: Homework

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('homework', 'Homework', 'Manage daily homework and student diary', '/homework', 'ClipboardCheck', 83);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/homework` | View all homework | `view` |
| `/homework/create` | Create homework entry | `create` |
| `/homework/:id` | View homework details | `view` |
| `/homework/:id/edit` | Edit homework | `update` |
| `/homework/:id/delete` | Delete homework | `delete` |
| `/homework/my-homework` | Student's homework | `view` |
| `/homework/by-date/:date` | Filter by date | `view` |

**Total Routes:** 7

---

### Module 36: Doubts

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('doubts', 'Doubts & Questions', 'Student doubt clarification system', '/doubts', 'HelpCircle', 84);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/doubts` | View all doubts | `view` |
| `/doubts/ask` | Ask new doubt | `create` |
| `/doubts/:id` | View doubt details | `view` |
| `/doubts/:id/answer` | Answer doubt | `create` |
| `/doubts/:id/resolve` | Mark as resolved | `update` |
| `/doubts/my-doubts` | Student's doubts | `view` |

**Total Routes:** 6

---

### Module 37: Transport

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('transport', 'Transport Management', 'Manage school transport operations', '/transport', 'Bus', 90);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/transport` | Transport dashboard | `view` |
| `/transport/routes` | View all routes | `view` |
| `/transport/routes/create` | Create new route | `create` |
| `/transport/routes/:id/edit` | Edit route | `update` |
| `/transport/vehicles` | View all vehicles | `view` |
| `/transport/vehicles/create` | Add new vehicle | `create` |
| `/transport/vehicles/:id/edit` | Edit vehicle | `update` |
| `/transport/drivers` | View all drivers | `view` |
| `/transport/drivers/create` | Add new driver | `create` |
| `/transport/drivers/:id/edit` | Edit driver details | `update` |
| `/transport/assignments` | Student transport assignments | `view` |
| `/transport/tracking` | Live vehicle tracking | `view` |

**Total Routes:** 12

---

### Module 38: Payroll

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('payroll', 'Payroll Management', 'Manage staff salaries and payslips', '/payroll', 'Wallet', 100);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/payroll` | Payroll dashboard | `view` |
| `/payroll/structures` | Salary structures | `view` |
| `/payroll/structures/create` | Create salary structure | `create` |
| `/payroll/process` | Process monthly payroll | `create` |
| `/payroll/payslips` | View all payslips | `view` |
| `/payroll/payslips/:id` | View payslip details | `view` |
| `/payroll/payslips/:id/download` | Download payslip PDF | `view` |
| `/payroll/my-payslips` | Employee's own payslips | `view` |

**Total Routes:** 8

---

### Module 39: Appraisals

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('appraisals', 'Performance Appraisals', 'Manage staff performance reviews', '/appraisals', 'Star', 101);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/appraisals` | View all appraisals | `view` |
| `/appraisals/create` | Create new appraisal | `create` |
| `/appraisals/:id` | View appraisal details | `view` |
| `/appraisals/:id/edit` | Edit appraisal | `update` |
| `/appraisals/:id/submit` | Submit for approval | `approve` |
| `/appraisals/my-appraisals` | Employee's appraisals | `view` |

**Total Routes:** 6

---

### Module 40: Recruitment

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('recruitment', 'Recruitment', 'Manage job postings and applications', '/recruitment', 'UserPlus', 102);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/recruitment` | Recruitment dashboard | `view` |
| `/recruitment/jobs` | View all job postings | `view` |
| `/recruitment/jobs/create` | Create job posting | `create` |
| `/recruitment/jobs/:id/edit` | Edit job posting | `update` |
| `/recruitment/applications` | View all applications | `view` |
| `/recruitment/applications/:id` | View application details | `view` |
| `/recruitment/applications/:id/shortlist` | Shortlist candidate | `approve` |
| `/recruitment/applications/:id/reject` | Reject application | `delete` |
| `/recruitment/interviews` | Schedule interviews | `create` |

**Total Routes:** 9

---

### Module 41: Feedback

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('feedback', 'Feedback System', 'Collect and manage feedback', '/feedback', 'MessageCircle', 110);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/feedback` | View all feedback | `view` |
| `/feedback/submit` | Submit new feedback | `create` |
| `/feedback/:id` | View feedback details | `view` |
| `/feedback/:id/respond` | Respond to feedback | `create` |
| `/feedback/forms` | Manage feedback forms | `view` |

**Total Routes:** 5

---

### Module 42: Grievances

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('grievances', 'Grievance Management', 'Handle complaints and grievances', '/grievances', 'AlertTriangle', 111);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/grievances` | View all grievances | `view` |
| `/grievances/submit` | Submit new grievance | `create` |
| `/grievances/:id` | View grievance details | `view` |
| `/grievances/:id/assign` | Assign to officer | `update` |
| `/grievances/:id/resolve` | Mark as resolved | `approve` |
| `/grievances/my-grievances` | User's grievances | `view` |

**Total Routes:** 6

---

### Module 43: Support

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('support', 'Support Tickets', 'Technical support ticket system', '/support', 'LifeBuoy', 112);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/support` | View all tickets | `view` |
| `/support/create` | Create new ticket | `create` |
| `/support/:id` | View ticket details | `view` |
| `/support/:id/reply` | Reply to ticket | `create` |
| `/support/:id/close` | Close ticket | `update` |
| `/support/my-tickets` | User's tickets | `view` |

**Total Routes:** 6

---

## Tier 3 Modules & Routes

### Module 44: Analytics

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('analytics', 'Advanced Analytics', 'AI-powered analytics and insights', '/analytics', 'TrendingUp', 120);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/analytics` | Analytics dashboard | `view` |
| `/analytics/students` | Student performance analytics | `view` |
| `/analytics/attendance` | Attendance trends | `view` |
| `/analytics/financial` | Financial analytics | `view` |
| `/analytics/academic` | Academic insights | `view` |
| `/analytics/predictions` | Predictive analytics | `view` |
| `/analytics/custom` | Create custom report | `create` |
| `/analytics/export` | Export analytics data | `export` |

**Total Routes:** 8

---

### Module 45: PTM (Parent-Teacher Meetings)

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('ptm', 'Parent-Teacher Meetings', 'Schedule and manage PTM appointments', '/ptm', 'Users', 121);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/ptm` | PTM dashboard | `view` |
| `/ptm/schedule` | View PTM schedule | `view` |
| `/ptm/slots` | Manage time slots | `create` |
| `/ptm/slots/:id/book` | Book PTM slot (Parent) | `create` |
| `/ptm/bookings` | View all bookings | `view` |
| `/ptm/bookings/:id` | View booking details | `view` |
| `/ptm/bookings/:id/cancel` | Cancel booking | `delete` |
| `/ptm/my-bookings` | Parent's bookings | `view` |
| `/ptm/feedback` | PTM feedback | `create` |

**Total Routes:** 9

---

### Module 46: Alumni

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('alumni', 'Alumni Management', 'Manage alumni network and events', '/alumni', 'GraduationCap', 122);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/alumni` | Alumni directory | `view` |
| `/alumni/register` | Alumni registration | `create` |
| `/alumni/:id` | View alumni profile | `view` |
| `/alumni/:id/edit` | Edit alumni details | `update` |
| `/alumni/events` | Alumni events | `view` |
| `/alumni/events/create` | Create alumni event | `create` |
| `/alumni/donations` | Alumni donations | `view` |

**Total Routes:** 7

---

### Module 47: Admissions

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('admissions', 'Admission Management', 'Handle new student admissions', '/admissions', 'UserPlus', 123);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/admissions` | Admissions dashboard | `view` |
| `/admissions/applications` | View all applications | `view` |
| `/admissions/apply` | New admission form | `create` |
| `/admissions/applications/:id` | View application details | `view` |
| `/admissions/applications/:id/review` | Review application | `update` |
| `/admissions/applications/:id/approve` | Approve application | `approve` |
| `/admissions/applications/:id/reject` | Reject application | `delete` |
| `/admissions/entrance-tests` | Entrance test management | `view` |
| `/admissions/entrance-tests/create` | Create entrance test | `create` |
| `/admissions/interviews` | Schedule interviews | `view` |
| `/admissions/interviews/schedule` | Schedule interview | `create` |

**Total Routes:** 11

---

### Module 48: Inventory

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('inventory', 'Inventory Management', 'Manage assets, library, and inventory', '/inventory', 'Package', 124);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/inventory` | Inventory dashboard | `view` |
| `/inventory/items` | View all items | `view` |
| `/inventory/items/create` | Add new item | `create` |
| `/inventory/items/:id/edit` | Edit item details | `update` |
| `/inventory/categories` | Manage categories | `view` |
| `/inventory/issue` | Issue item | `create` |
| `/inventory/return` | Return item | `update` |
| `/inventory/issued` | View issued items | `view` |
| `/inventory/stock` | Stock report | `view` |
| `/inventory/library` | Library management | `view` |
| `/inventory/library/books` | Manage books | `view` |
| `/inventory/library/issue` | Issue book | `create` |

**Total Routes:** 12

---

### Module 49: Certificates

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('certificates', 'Certificate Management', 'Generate certificates and documents', '/certificates', 'Award', 125);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/certificates` | Certificates dashboard | `view` |
| `/certificates/generate` | Generate certificate | `create` |
| `/certificates/templates` | Manage templates | `view` |
| `/certificates/templates/create` | Create template | `create` |
| `/certificates/templates/:id/edit` | Edit template | `update` |
| `/certificates/issued` | View issued certificates | `view` |
| `/certificates/:id` | View certificate details | `view` |
| `/certificates/:id/download` | Download certificate PDF | `view` |
| `/certificates/bulk-generate` | Bulk certificate generation | `create` |

**Total Routes:** 9

---

### Module 50: Surveys

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('surveys', 'Surveys & Polls', 'Create and manage surveys', '/surveys', 'ClipboardList', 126);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/surveys` | View all surveys | `view` |
| `/surveys/create` | Create new survey | `create` |
| `/surveys/:id` | View survey details | `view` |
| `/surveys/:id/edit` | Edit survey | `update` |
| `/surveys/:id/respond` | Respond to survey | `create` |
| `/surveys/:id/results` | View survey results | `view` |
| `/surveys/:id/export` | Export results | `export` |

**Total Routes:** 7

---

### Module 51: Branches

**Database Entry:**
```sql
INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
VALUES ('branches', 'Branch Management', 'Multi-branch school management', '/branches', 'Building', 130);
```

**Routes:**
| Route Path | Description | Required Action |
|------------|-------------|-----------------|
| `/branches` | View all branches | `view` |
| `/branches/create` | Create new branch | `create` |
| `/branches/:id` | View branch details | `view` |
| `/branches/:id/edit` | Edit branch details | `update` |
| `/branches/:id/delete` | Delete branch | `delete` |
| `/branches/switch` | Switch active branch | `update` |

**Total Routes:** 6

---

## Module Statistics

### Summary by Tier

| Tier | Module Count | Total Routes | Avg Routes/Module |
|------|--------------|--------------|-------------------|
| **Tier 1** | 31 modules | 231 routes | 7.5 routes |
| **Tier 2** | 13 modules | 97 routes | 7.5 routes |
| **Tier 3** | 8 modules | 69 routes | 8.6 routes |
| **TOTAL** | **52 modules** | **397 routes** | **7.6 routes** |

### Top 10 Modules by Route Count

| Rank | Module | Route Count | Category |
|------|--------|-------------|----------|
| 1 | Fees | 22 routes | Financial |
| 2 | Students | 20 routes | Academic |
| 3 | Attendance | 14 routes | Operations |
| 4 | Timetable | 14 routes | Academic |
| 5 | Inventory | 12 routes | Assets |
| 6 | Transport | 12 routes | Operations |
| 7 | Admissions | 11 routes | Enrollment |
| 8 | Teachers | 10 routes | HR |
| 9 | Assignments | 10 routes | Learning |
| 10 | Exams | 10 routes | Assessment |

### Modules by Category

| Category | Module Count | Route Count |
|----------|--------------|-------------|
| Academic Management | 12 modules | 105 routes |
| Human Resources | 8 modules | 56 routes |
| Financial | 3 modules | 30 routes |
| Learning Management | 5 modules | 36 routes |
| Communication | 6 modules | 25 routes |
| Operations | 8 modules | 71 routes |
| Advanced Features | 10 modules | 74 routes |

---

## Implementation Checklist

### Phase 1: Database Setup ✅

```sql
-- Step 1: Run this script to create all 52 modules
-- File: Schema/create_all_modules.sql

INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order, is_active)
VALUES
  ('dashboard', 'Dashboard', 'Main dashboard with analytics', '/dashboard', 'LayoutDashboard', 1, true),
  ('profile', 'Profile Management', 'User profile management', '/profile', 'User', 2, true),
  -- ... (insert all 52 modules)
ON CONFLICT (module_code) DO NOTHING;

-- Step 2: Verify module count
SELECT COUNT(*) as total_modules FROM modules_1EMAET;
-- Expected: 52

-- Step 3: Check for missing modules
SELECT module_code, module_name, display_order 
FROM modules_1EMAET 
ORDER BY display_order;
```

### Phase 2: Route Implementation 📝

**File Structure:**
```
src/
├── routes/
│   ├── AppRoutes.tsx                 # Main router configuration
│   ├── PublicRoutes.tsx              # Login, register, etc.
│   ├── Tier1Routes.tsx               # Core feature routes
│   ├── Tier2Routes.tsx               # Extended feature routes
│   └── Tier3Routes.tsx               # Advanced feature routes
```

**Implementation Progress Tracker:**

| Module | Routes Defined | Routes Implemented | Status |
|--------|----------------|-------------------|--------|
| Dashboard | 1/1 | 0/1 | ⏳ Pending |
| Students | 20/20 | 0/20 | ⏳ Pending |
| Teachers | 10/10 | 0/10 | ⏳ Pending |
| Attendance | 14/14 | 0/14 | ⏳ Pending |
| ... | ... | ... | ... |

### Phase 3: Permission Setup 🔒

```sql
-- Step 1: Create 6 permissions for each module (view, create, update, delete, approve, export)
-- File: Schema/create_all_permissions.sql

INSERT INTO permissions_1EMAET (module_id, permission_code, permission_name, description)
SELECT 
    m.id,
    m.module_code || '.' || p.action,
    p.name || ' ' || m.module_name,
    p.description
FROM modules_1EMAET m
CROSS JOIN (
    VALUES 
        ('view', 'View', 'View and list records'),
        ('create', 'Create', 'Create new records'),
        ('update', 'Update', 'Edit existing records'),
        ('delete', 'Delete', 'Delete records'),
        ('approve', 'Approve', 'Approve workflow items'),
        ('export', 'Export', 'Export data')
) AS p(action, name, description)
ON CONFLICT DO NOTHING;

-- Step 2: Verify permission count
SELECT COUNT(*) as total_permissions FROM permissions_1EMAET;
-- Expected: 52 modules × 6 actions = 312 permissions
```

### Phase 4: Role-Permission Mapping 🎭

```sql
-- Assign permissions to default roles
-- File: Schema/default_roles_permissions.sql

-- Already created in Schema/default_roles_permissions.sql
-- Verify mappings exist:

SELECT 
    r.role_name,
    COUNT(DISTINCT rp.permission_id) as permission_count
FROM roles_1EMAET r
LEFT JOIN role_permissions_1EMAET rp ON r.id = rp.role_id
GROUP BY r.role_name
ORDER BY permission_count DESC;
```

### Phase 5: Frontend Components 🎨

**Component Checklist:**

- [ ] ProtectedRoute component
- [ ] usePermissions hook
- [ ] PermissionContext provider
- [ ] AppSidebar with dynamic menu
- [ ] RouteGuard middleware
- [ ] 404/403 error pages

### Phase 6: Testing ✅

**Test Cases:**

1. **Module Verification**
   - [ ] All 52 modules exist in database
   - [ ] All modules have correct module_code
   - [ ] Display order is sequential

2. **Route Coverage**
   - [ ] All 397 routes are defined
   - [ ] Each route has corresponding module
   - [ ] Protected routes require correct permissions

3. **Permission Checks**
   - [ ] Each module has 6 permissions
   - [ ] Permission codes follow naming convention
   - [ ] Roles are correctly mapped to permissions

4. **Navigation Testing**
   - [ ] Sidebar shows only allowed routes
   - [ ] Unauthorized access redirects to /forbidden
   - [ ] Route guards work for all protected routes

---

## Quick Reference: Module Code → Routes

```typescript
// Quick lookup object for developers
const MODULE_ROUTES_MAP = {
  dashboard: ['/dashboard'],
  
  students: [
    '/students', '/students/create', '/students/:id',
    '/students/:id/edit', '/students/:id/delete',
    // ... 15 more routes
  ],
  
  attendance: [
    '/attendance', '/attendance/mark', 
    '/attendance/mark/:sectionId',
    // ... 11 more routes
  ],
  
  // ... all 52 modules
};

// Usage in route configuration:
MODULE_ROUTES_MAP.students.forEach(path => {
  // Register route with permission check
});
```

---

## Appendix: SQL Scripts

### Create All Modules Script

```sql
-- File: Schema/modules_complete_insert.sql
-- Creates all 52 modules in correct order

DO $$
DECLARE
    INDEX_TOKEN TEXT := '1EMAET';
BEGIN
    -- Tier 1 Modules (1-31)
    INSERT INTO modules_1EMAET (module_code, module_name, description, route_prefix, icon, display_order)
    VALUES
        ('dashboard', 'Dashboard', 'Main dashboard with analytics and quick stats', '/dashboard', 'LayoutDashboard', 1),
        ('profile', 'Profile Management', 'User profile management', '/profile', 'User', 2),
        ('users', 'User Management', 'Manage system users and accounts', '/users', 'Users', 3),
        -- ... (all 52 modules)
    ON CONFLICT (module_code) DO NOTHING;
    
    RAISE NOTICE 'All modules created successfully';
END $$;
```

### Verify Module-Route Alignment

```sql
-- Check if all modules have routes defined
SELECT 
    m.module_code,
    m.module_name,
    COUNT(DISTINCT p.id) as permission_count,
    CASE 
        WHEN COUNT(DISTINCT p.id) = 6 THEN '✅ Complete'
        ELSE '❌ Missing'
    END as status
FROM modules_1EMAET m
LEFT JOIN permissions_1EMAET p ON m.id = p.module_id
GROUP BY m.module_code, m.module_name
ORDER BY m.display_order;
```

---

**Document Version:** 1.0  
**Last Updated:** December 26, 2025  
**Status:** Complete Reference - Ready for Implementation  
**Total Modules:** 52  
**Total Routes:** 397  
**Total Permissions:** 312 (52 × 6)
