/**
 * EduMunch Route Configuration
 * ==============================
 * 
 * Centralized route configuration for all application routes.
 * Routes are organized by tier and module.
 * 
 * This file is used by:
 * - App.tsx for route registration
 * - AppSidebar for dynamic navigation
 * - ProtectedRoute for permission checks
 */

import { RouteConfig } from './types';

// ==========================================
// TIER 1: CORE FEATURES (31 Modules, 231 Routes)
// ==========================================

// --------------------------------------
// Module 1: Dashboard (1 route)
// --------------------------------------
export const dashboardRoutes: RouteConfig[] = [
  { path: '/dashboard', title: 'Dashboard', module: 'dashboard', action: 'view', tier: 1, showInSidebar: true, icon: 'LayoutDashboard' },
];

// --------------------------------------
// Module 2: Profile (4 routes)
// --------------------------------------
export const profileRoutes: RouteConfig[] = [
  { path: '/profile', title: 'My Profile', module: 'profile', action: 'view', tier: 1, showInSidebar: true, icon: 'User' },
  { path: '/profile/edit', title: 'Edit Profile', module: 'profile', action: 'update', tier: 1 },
  { path: '/profile/change-password', title: 'Change Password', module: 'profile', action: 'update', tier: 1 },
  { path: '/profile/upload-photo', title: 'Upload Photo', module: 'profile', action: 'update', tier: 1 },
];

// --------------------------------------
// Module 3: Users (8 routes)
// --------------------------------------
export const userRoutes: RouteConfig[] = [
  { path: '/users', title: 'Users', module: 'users', action: 'view', tier: 1, showInSidebar: true, icon: 'Users' },
  { path: '/users/create', title: 'Add User', module: 'users', action: 'create', tier: 1 },
  { path: '/users/:id', title: 'User Details', module: 'users', action: 'view', tier: 1 },
  { path: '/users/:id/edit', title: 'Edit User', module: 'users', action: 'update', tier: 1 },
  { path: '/users/:id/delete', title: 'Delete User', module: 'users', action: 'delete', tier: 1 },
  { path: '/users/:id/assign-role', title: 'Assign Role', module: 'users', action: 'update', tier: 1 },
  { path: '/users/:id/grant-permission', title: 'Grant Permission', module: 'users', action: 'update', tier: 1 },
  { path: '/users/bulk-upload', title: 'Bulk Upload Users', module: 'users', action: 'create', tier: 1 },
];

// --------------------------------------
// Module 4: Roles (5 routes)
// --------------------------------------
export const roleRoutes: RouteConfig[] = [
  { path: '/roles', title: 'Roles', module: 'roles', action: 'view', tier: 1, showInSidebar: true, icon: 'Shield' },
  { path: '/roles/create', title: 'Create Role', module: 'roles', action: 'create', tier: 1 },
  { path: '/roles/:id/edit', title: 'Edit Role', module: 'roles', action: 'update', tier: 1 },
  { path: '/roles/:id/permissions', title: 'Role Permissions', module: 'roles', action: 'update', tier: 1 },
  { path: '/roles/:id/delete', title: 'Delete Role', module: 'roles', action: 'delete', tier: 1 },
];

// --------------------------------------
// Module 5: Permissions (1 route)
// --------------------------------------
export const permissionRoutes: RouteConfig[] = [
  { path: '/permissions', title: 'Permissions', module: 'permissions', action: 'view', tier: 1, showInSidebar: true, icon: 'Key' },
];

// --------------------------------------
// Module 6: Students (20 routes)
// --------------------------------------
export const studentRoutes: RouteConfig[] = [
  { path: '/students', title: 'Students', module: 'students', action: 'view', tier: 1, showInSidebar: true, icon: 'GraduationCap' },
  { path: '/students/create', title: 'Add Student', module: 'students', action: 'create', tier: 1 },
  { path: '/students/:id', title: 'Student Details', module: 'students', action: 'view', tier: 1 },
  { path: '/students/:id/edit', title: 'Edit Student', module: 'students', action: 'update', tier: 1 },
  { path: '/students/:id/delete', title: 'Delete Student', module: 'students', action: 'delete', tier: 1 },
  { path: '/students/:id/documents', title: 'Student Documents', module: 'students', action: 'view', tier: 1 },
  { path: '/students/:id/documents/upload', title: 'Upload Documents', module: 'students', action: 'update', tier: 1 },
  { path: '/students/:id/medical-records', title: 'Medical Records', module: 'students', action: 'view', tier: 1 },
  { path: '/students/:id/medical-records/edit', title: 'Edit Medical Records', module: 'students', action: 'update', tier: 1 },
  { path: '/students/:id/parents', title: 'Parent Info', module: 'students', action: 'view', tier: 1 },
  { path: '/students/:id/parents/add', title: 'Add Parent', module: 'students', action: 'update', tier: 1 },
  { path: '/students/:id/id-card', title: 'Student ID Card', module: 'students', action: 'view', tier: 1 },
  { path: '/students/bulk-upload', title: 'Bulk Upload Students', module: 'students', action: 'create', tier: 1 },
  { path: '/students/promotion', title: 'Student Promotion', module: 'students', action: 'view', tier: 1 },
  { path: '/students/promotion/configure', title: 'Configure Promotion', module: 'students', action: 'update', tier: 1 },
  { path: '/students/promotion/preview', title: 'Preview Promotion', module: 'students', action: 'view', tier: 1 },
  { path: '/students/promotion/execute', title: 'Execute Promotion', module: 'students', action: 'approve', tier: 1 },
  { path: '/students/promote', title: 'Bulk Promote', module: 'students', action: 'approve', tier: 1 },
  { path: '/students/transfer', title: 'Transfer Students', module: 'students', action: 'update', tier: 1 },
  { path: '/students/export', title: 'Export Students', module: 'students', action: 'export', tier: 1 },
];

// --------------------------------------
// Module 7: Parents (4 routes)
// --------------------------------------
export const parentRoutes: RouteConfig[] = [
  { path: '/parents', title: 'Parents', module: 'parents', action: 'view', tier: 1, showInSidebar: true, icon: 'Users' },
  { path: '/parents/create', title: 'Add Parent', module: 'parents', action: 'create', tier: 1 },
  { path: '/parents/:id', title: 'Parent Details', module: 'parents', action: 'view', tier: 1 },
  { path: '/parents/:id/edit', title: 'Edit Parent', module: 'parents', action: 'update', tier: 1 },
];

// --------------------------------------
// Module 8: Parent Portal (10 routes)
// --------------------------------------
export const parentPortalRoutes: RouteConfig[] = [
  { path: '/parent/dashboard', title: 'Parent Dashboard', module: 'parent', action: 'view', tier: 1, showInSidebar: true, icon: 'Home' },
  { path: '/parent/children', title: 'My Children', module: 'parent', action: 'view', tier: 1 },
  { path: '/parent/children/:id/profile', title: 'Child Profile', module: 'parent', action: 'view', tier: 1 },
  { path: '/parent/children/:id/attendance', title: 'Child Attendance', module: 'parent', action: 'view', tier: 1 },
  { path: '/parent/children/:id/results', title: 'Child Results', module: 'parent', action: 'view', tier: 1 },
  { path: '/parent/children/:id/fees', title: 'Child Fees', module: 'parent', action: 'view', tier: 1 },
  { path: '/parent/children/:id/homework', title: 'Child Homework', module: 'parent', action: 'view', tier: 1 },
  { path: '/parent/children/:id/timetable', title: 'Child Timetable', module: 'parent', action: 'view', tier: 1 },
  { path: '/parent/children/:id/teachers', title: 'Child Teachers', module: 'parent', action: 'view', tier: 1 },
  { path: '/parent/fee-payment', title: 'Pay Fees', module: 'parent', action: 'create', tier: 1 },
];

// --------------------------------------
// Module 9: Teachers (10 routes)
// --------------------------------------
export const teacherRoutes: RouteConfig[] = [
  { path: '/teachers', title: 'Teachers', module: 'teachers', action: 'view', tier: 1, showInSidebar: true, icon: 'BookOpen' },
  { path: '/teachers/create', title: 'Add Teacher', module: 'teachers', action: 'create', tier: 1 },
  { path: '/teachers/:id', title: 'Teacher Details', module: 'teachers', action: 'view', tier: 1 },
  { path: '/teachers/:id/edit', title: 'Edit Teacher', module: 'teachers', action: 'update', tier: 1 },
  { path: '/teachers/:id/delete', title: 'Delete Teacher', module: 'teachers', action: 'delete', tier: 1 },
  { path: '/teachers/:id/subjects', title: 'Teacher Subjects', module: 'teachers', action: 'view', tier: 1 },
  { path: '/teachers/:id/assign-subject', title: 'Assign Subject', module: 'teachers', action: 'update', tier: 1 },
  { path: '/teachers/:id/timetable', title: 'Teacher Timetable', module: 'teachers', action: 'view', tier: 1 },
  { path: '/teachers/bulk-upload', title: 'Bulk Upload Teachers', module: 'teachers', action: 'create', tier: 1 },
  { path: '/teachers/export', title: 'Export Teachers', module: 'teachers', action: 'export', tier: 1 },
];

// --------------------------------------
// Module 10: Employees (7 routes)
// --------------------------------------
export const employeeRoutes: RouteConfig[] = [
  { path: '/employees', title: 'Employees', module: 'employees', action: 'view', tier: 1, showInSidebar: true, icon: 'Briefcase' },
  { path: '/employees/create', title: 'Add Employee', module: 'employees', action: 'create', tier: 1 },
  { path: '/employees/:id', title: 'Employee Details', module: 'employees', action: 'view', tier: 1 },
  { path: '/employees/:id/edit', title: 'Edit Employee', module: 'employees', action: 'update', tier: 1 },
  { path: '/employees/:id/delete', title: 'Delete Employee', module: 'employees', action: 'delete', tier: 1 },
  { path: '/employees/bulk-upload', title: 'Bulk Upload Employees', module: 'employees', action: 'create', tier: 1 },
  { path: '/employees/export', title: 'Export Employees', module: 'employees', action: 'export', tier: 1 },
];

// --------------------------------------
// Module 11: Student Attendance (14 routes)
// --------------------------------------
export const attendanceRoutes: RouteConfig[] = [
  { path: '/attendance', title: 'Attendance', module: 'attendance', action: 'view', tier: 1, showInSidebar: true, icon: 'CheckSquare' },
  { path: '/attendance/mark', title: 'Mark Attendance', module: 'attendance', action: 'create', tier: 1 },
  { path: '/attendance/mark/:sectionId', title: 'Mark Section Attendance', module: 'attendance', action: 'create', tier: 1 },
  { path: '/attendance/mark/:sectionId/:date', title: 'Edit Attendance', module: 'attendance', action: 'update', tier: 1 },
  { path: '/attendance/view', title: 'View Attendance', module: 'attendance', action: 'view', tier: 1 },
  { path: '/attendance/view/:sectionId', title: 'Section Attendance', module: 'attendance', action: 'view', tier: 1 },
  { path: '/attendance/view/student/:studentId', title: 'Student Attendance', module: 'attendance', action: 'view', tier: 1 },
  { path: '/attendance/reports', title: 'Attendance Reports', module: 'attendance', action: 'view', tier: 1 },
  { path: '/attendance/reports/daily', title: 'Daily Report', module: 'attendance', action: 'view', tier: 1 },
  { path: '/attendance/reports/weekly', title: 'Weekly Report', module: 'attendance', action: 'view', tier: 1 },
  { path: '/attendance/reports/monthly', title: 'Monthly Report', module: 'attendance', action: 'view', tier: 1 },
  { path: '/attendance/reports/low-attendance', title: 'Low Attendance', module: 'attendance', action: 'view', tier: 1 },
  { path: '/attendance/export', title: 'Export Attendance', module: 'attendance', action: 'export', tier: 1 },
  { path: '/attendance/subject-wise', title: 'Subject-wise Attendance', module: 'attendance', action: 'create', tier: 1 },
];

// --------------------------------------
// Module 12: Staff Attendance (7 routes)
// --------------------------------------
export const staffAttendanceRoutes: RouteConfig[] = [
  { path: '/staff/attendance', title: 'Staff Attendance', module: 'staff_attendance', action: 'view', tier: 1, showInSidebar: true, icon: 'CheckSquare' },
  { path: '/staff/attendance/mark', title: 'Mark Staff Attendance', module: 'staff_attendance', action: 'create', tier: 1 },
  { path: '/staff/attendance/view', title: 'View Staff Attendance', module: 'staff_attendance', action: 'view', tier: 1 },
  { path: '/staff/attendance/view/:employeeId', title: 'Employee Attendance', module: 'staff_attendance', action: 'view', tier: 1 },
  { path: '/staff/attendance/reports', title: 'Staff Attendance Reports', module: 'staff_attendance', action: 'view', tier: 1 },
  { path: '/staff/attendance/reports/monthly', title: 'Monthly Staff Report', module: 'staff_attendance', action: 'view', tier: 1 },
  { path: '/staff/attendance/export', title: 'Export Staff Attendance', module: 'staff_attendance', action: 'export', tier: 1 },
];

// --------------------------------------
// Module 13: Student Leave (5 routes)
// --------------------------------------
export const leaveRoutes: RouteConfig[] = [
  { path: '/leave-requests', title: 'Leave Requests', module: 'leave', action: 'view', tier: 1, showInSidebar: true, icon: 'Calendar' },
  { path: '/leave-requests/create', title: 'Apply Leave', module: 'leave', action: 'create', tier: 1 },
  { path: '/leave-requests/:id', title: 'Leave Details', module: 'leave', action: 'view', tier: 1 },
  { path: '/leave-requests/:id/approve', title: 'Approve Leave', module: 'leave', action: 'approve', tier: 1 },
  { path: '/leave-requests/student/:studentId', title: 'Student Leave History', module: 'leave', action: 'view', tier: 1 },
];

// --------------------------------------
// Module 14: Staff Leave (6 routes)
// --------------------------------------
export const staffLeaveRoutes: RouteConfig[] = [
  { path: '/staff/leave', title: 'Staff Leave', module: 'staff_leave', action: 'view', tier: 1, showInSidebar: true, icon: 'Calendar' },
  { path: '/staff/leave/apply', title: 'Apply Leave', module: 'staff_leave', action: 'create', tier: 1 },
  { path: '/staff/leave/:id', title: 'Leave Details', module: 'staff_leave', action: 'view', tier: 1 },
  { path: '/staff/leave/:id/approve', title: 'Approve Leave', module: 'staff_leave', action: 'approve', tier: 1 },
  { path: '/staff/leave/my-leaves', title: 'My Leaves', module: 'staff_leave', action: 'view', tier: 1 },
  { path: '/staff/leave/balance', title: 'Leave Balance', module: 'staff_leave', action: 'view', tier: 1 },
];

// --------------------------------------
// Module 15: Academic Years (6 routes)
// --------------------------------------
export const academicYearRoutes: RouteConfig[] = [
  { path: '/academic-years', title: 'Academic Years', module: 'academic_years', action: 'view', tier: 1, showInSidebar: true, icon: 'Calendar' },
  { path: '/academic-years/create', title: 'Create Academic Year', module: 'academic_years', action: 'create', tier: 1 },
  { path: '/academic-years/:id', title: 'Academic Year Details', module: 'academic_years', action: 'view', tier: 1 },
  { path: '/academic-years/:id/edit', title: 'Edit Academic Year', module: 'academic_years', action: 'update', tier: 1 },
  { path: '/academic-years/:id/delete', title: 'Delete Academic Year', module: 'academic_years', action: 'delete', tier: 1 },
  { path: '/academic-years/:id/set-current', title: 'Set Current Year', module: 'academic_years', action: 'update', tier: 1 },
];

// --------------------------------------
// Module 16: Classes (5 routes)
// --------------------------------------
export const classRoutes: RouteConfig[] = [
  { path: '/classes', title: 'Classes', module: 'classes', action: 'view', tier: 1, showInSidebar: true, icon: 'School' },
  { path: '/classes/create', title: 'Create Class', module: 'classes', action: 'create', tier: 1 },
  { path: '/classes/:id', title: 'Class Details', module: 'classes', action: 'view', tier: 1 },
  { path: '/classes/:id/edit', title: 'Edit Class', module: 'classes', action: 'update', tier: 1 },
  { path: '/classes/:id/delete', title: 'Delete Class', module: 'classes', action: 'delete', tier: 1 },
];

// --------------------------------------
// Module 17: Sections (7 routes)
// --------------------------------------
export const sectionRoutes: RouteConfig[] = [
  { path: '/sections', title: 'Sections', module: 'sections', action: 'view', tier: 1, showInSidebar: true, icon: 'Layout' },
  { path: '/sections/create', title: 'Create Section', module: 'sections', action: 'create', tier: 1 },
  { path: '/sections/:id', title: 'Section Details', module: 'sections', action: 'view', tier: 1 },
  { path: '/sections/:id/edit', title: 'Edit Section', module: 'sections', action: 'update', tier: 1 },
  { path: '/sections/:id/delete', title: 'Delete Section', module: 'sections', action: 'delete', tier: 1 },
  { path: '/sections/:id/students', title: 'Section Students', module: 'sections', action: 'view', tier: 1 },
  { path: '/sections/:id/assign-teacher', title: 'Assign Class Teacher', module: 'sections', action: 'update', tier: 1 },
];

// --------------------------------------
// Module 18: Subjects (7 routes)
// --------------------------------------
export const subjectRoutes: RouteConfig[] = [
  { path: '/subjects', title: 'Subjects', module: 'subjects', action: 'view', tier: 1, showInSidebar: true, icon: 'Book' },
  { path: '/subjects/create', title: 'Create Subject', module: 'subjects', action: 'create', tier: 1 },
  { path: '/subjects/:id', title: 'Subject Details', module: 'subjects', action: 'view', tier: 1 },
  { path: '/subjects/:id/edit', title: 'Edit Subject', module: 'subjects', action: 'update', tier: 1 },
  { path: '/subjects/:id/delete', title: 'Delete Subject', module: 'subjects', action: 'delete', tier: 1 },
  { path: '/subjects/:id/assign-class', title: 'Assign to Class', module: 'subjects', action: 'update', tier: 1 },
  { path: '/subjects/:id/topics', title: 'Subject Topics', module: 'subjects', action: 'view', tier: 1 },
];

// --------------------------------------
// Module 19: Topics (7 routes)
// --------------------------------------
export const topicRoutes: RouteConfig[] = [
  { path: '/topics', title: 'Topics', module: 'topics', action: 'view', tier: 1, showInSidebar: true, icon: 'FileText' },
  { path: '/topics/create', title: 'Create Topic', module: 'topics', action: 'create', tier: 1 },
  { path: '/topics/:id', title: 'Topic Details', module: 'topics', action: 'view', tier: 1 },
  { path: '/topics/:id/edit', title: 'Edit Topic', module: 'topics', action: 'update', tier: 1 },
  { path: '/topics/:id/delete', title: 'Delete Topic', module: 'topics', action: 'delete', tier: 1 },
  { path: '/topics/:id/content', title: 'Topic Content', module: 'topics', action: 'view', tier: 1 },
  { path: '/topics/:id/content/upload', title: 'Upload Content', module: 'topics', action: 'update', tier: 1 },
];

// --------------------------------------
// Module 20: Timetable (14 routes)
// --------------------------------------
export const timetableRoutes: RouteConfig[] = [
  { path: '/timetable', title: 'Timetable', module: 'timetable', action: 'view', tier: 1, showInSidebar: true, icon: 'Clock' },
  { path: '/timetable/view', title: 'View Timetables', module: 'timetable', action: 'view', tier: 1 },
  { path: '/timetable/view/:sectionId', title: 'Section Timetable', module: 'timetable', action: 'view', tier: 1 },
  { path: '/timetable/create', title: 'Create Timetable', module: 'timetable', action: 'create', tier: 1 },
  { path: '/timetable/:id/edit', title: 'Edit Timetable', module: 'timetable', action: 'update', tier: 1 },
  { path: '/timetable/:id/delete', title: 'Delete Timetable', module: 'timetable', action: 'delete', tier: 1 },
  { path: '/timetable/bulk-create', title: 'Bulk Create', module: 'timetable', action: 'create', tier: 1 },
  { path: '/timetable/copy', title: 'Copy Timetable', module: 'timetable', action: 'create', tier: 1 },
  { path: '/timetable/conflicts', title: 'Schedule Conflicts', module: 'timetable', action: 'view', tier: 1 },
  { path: '/timetable/substitute', title: 'Substitute Teacher', module: 'timetable', action: 'update', tier: 1 },
  { path: '/timetable/periods', title: 'Period Configuration', module: 'timetable', action: 'update', tier: 1 },
  { path: '/timetable/export', title: 'Export Timetable', module: 'timetable', action: 'export', tier: 1 },
  { path: '/my-timetable', title: 'My Timetable', module: 'timetable', action: 'view', tier: 1, showInSidebar: true, icon: 'Clock' },
  { path: '/class-timetable', title: 'Class Timetable', module: 'timetable', action: 'view', tier: 1 },
];

// --------------------------------------
// Module 21: Lecture Templates (5 routes)
// --------------------------------------
export const lectureTemplateRoutes: RouteConfig[] = [
  { path: '/lecture-templates', title: 'Lecture Templates', module: 'lecture_templates', action: 'view', tier: 1, showInSidebar: true, icon: 'Layout' },
  { path: '/lecture-templates/create', title: 'Create Template', module: 'lecture_templates', action: 'create', tier: 1 },
  { path: '/lecture-templates/:id', title: 'Template Details', module: 'lecture_templates', action: 'view', tier: 1 },
  { path: '/lecture-templates/:id/edit', title: 'Edit Template', module: 'lecture_templates', action: 'update', tier: 1 },
  { path: '/lecture-templates/:id/delete', title: 'Delete Template', module: 'lecture_templates', action: 'delete', tier: 1 },
];

// --------------------------------------
// Module 22: Exams (10 routes)
// --------------------------------------
export const examRoutes: RouteConfig[] = [
  { path: '/exams', title: 'Exams', module: 'exams', action: 'view', tier: 1, showInSidebar: true, icon: 'ClipboardList' },
  { path: '/exams/list', title: 'All Exams', module: 'exams', action: 'view', tier: 1 },
  { path: '/exams/create', title: 'Create Exam', module: 'exams', action: 'create', tier: 1 },
  { path: '/exams/:id', title: 'Exam Details', module: 'exams', action: 'view', tier: 1 },
  { path: '/exams/:id/edit', title: 'Edit Exam', module: 'exams', action: 'update', tier: 1 },
  { path: '/exams/:id/delete', title: 'Delete Exam', module: 'exams', action: 'delete', tier: 1 },
  { path: '/exams/:id/schedule', title: 'Exam Schedule', module: 'exams', action: 'view', tier: 1 },
  { path: '/exams/:id/seating', title: 'Seating Arrangement', module: 'exams', action: 'create', tier: 1 },
  { path: '/exams/:id/admit-cards', title: 'Admit Cards', module: 'exams', action: 'create', tier: 1 },
  { path: '/exams/export', title: 'Export Exams', module: 'exams', action: 'export', tier: 1 },
];

// --------------------------------------
// Module 23: Marks (6 routes)
// --------------------------------------
export const marksRoutes: RouteConfig[] = [
  { path: '/exams/:id/marks', title: 'Marks Dashboard', module: 'marks', action: 'view', tier: 1, showInSidebar: false },
  { path: '/exams/:id/marks/enter', title: 'Enter Marks', module: 'marks', action: 'create', tier: 1 },
  { path: '/exams/:id/marks/bulk-upload', title: 'Bulk Upload Marks', module: 'marks', action: 'create', tier: 1 },
  { path: '/exams/:id/marks/verify', title: 'Verify Marks', module: 'marks', action: 'approve', tier: 1 },
  { path: '/exams/:id/marks/:studentId', title: 'Student Marks', module: 'marks', action: 'view', tier: 1 },
  { path: '/exams/:id/grades', title: 'Calculate Grades', module: 'marks', action: 'update', tier: 1 },
];

// --------------------------------------
// Module 24: Report Cards (5 routes)
// --------------------------------------
export const reportCardRoutes: RouteConfig[] = [
  { path: '/report-cards', title: 'Report Cards', module: 'report_cards', action: 'view', tier: 1, showInSidebar: true, icon: 'FileText' },
  { path: '/exams/:id/report-cards', title: 'Generate Report Cards', module: 'report_cards', action: 'create', tier: 1 },
  { path: '/report-cards/:id', title: 'View Report Card', module: 'report_cards', action: 'view', tier: 1 },
  { path: '/report-cards/:id/download', title: 'Download Report Card', module: 'report_cards', action: 'view', tier: 1 },
  { path: '/report-cards/templates', title: 'Report Card Templates', module: 'report_cards', action: 'update', tier: 1 },
];

// --------------------------------------
// Module 25: Fees (22 routes)
// --------------------------------------
export const feeRoutes: RouteConfig[] = [
  { path: '/fees', title: 'Fee Management', module: 'fees', action: 'view', tier: 1, showInSidebar: true, icon: 'DollarSign' },
  { path: '/fees/structures', title: 'Fee Structures', module: 'fees', action: 'view', tier: 1 },
  { path: '/fees/structures/create', title: 'Create Fee Structure', module: 'fees', action: 'create', tier: 1 },
  { path: '/fees/structures/:id/edit', title: 'Edit Fee Structure', module: 'fees', action: 'update', tier: 1 },
  { path: '/fees/assign', title: 'Assign Fees', module: 'fees', action: 'create', tier: 1 },
  { path: '/fees/payments', title: 'View Payments', module: 'fees', action: 'view', tier: 1 },
  { path: '/fees/collect', title: 'Collect Fee', module: 'fees', action: 'create', tier: 1 },
  { path: '/fees/collect/:studentId', title: 'Collect Student Fee', module: 'fees', action: 'create', tier: 1 },
  { path: '/fees/receipts', title: 'Fee Receipts', module: 'fees', action: 'view', tier: 1 },
  { path: '/fees/receipts/:id', title: 'Receipt Details', module: 'fees', action: 'view', tier: 1 },
  { path: '/fees/receipts/:id/download', title: 'Download Receipt', module: 'fees', action: 'view', tier: 1 },
  { path: '/fees/receipts/:id/print', title: 'Print Receipt', module: 'fees', action: 'view', tier: 1 },
  { path: '/fees/defaulters', title: 'Fee Defaulters', module: 'fees', action: 'view', tier: 1 },
  { path: '/fees/reminders', title: 'Send Reminders', module: 'fees', action: 'create', tier: 1 },
  { path: '/fees/reports', title: 'Fee Reports', module: 'fees', action: 'view', tier: 1 },
  { path: '/fees/reports/daily', title: 'Daily Collection', module: 'fees', action: 'view', tier: 1 },
  { path: '/fees/reports/monthly', title: 'Monthly Collection', module: 'fees', action: 'view', tier: 1 },
  { path: '/fees/reports/class-wise', title: 'Class-wise Collection', module: 'fees', action: 'view', tier: 1 },
  { path: '/fees/discounts', title: 'Fee Discounts', module: 'fees', action: 'view', tier: 1 },
  { path: '/fees/discounts/apply', title: 'Apply Discount', module: 'fees', action: 'create', tier: 1 },
  { path: '/fees/refunds', title: 'Process Refunds', module: 'fees', action: 'create', tier: 1 },
  { path: '/fees/export', title: 'Export Fees', module: 'fees', action: 'export', tier: 1 },
];

// --------------------------------------
// Module 26: Settings (6 routes)
// --------------------------------------
export const settingsRoutes: RouteConfig[] = [
  { path: '/settings', title: 'Settings', module: 'settings', action: 'view', tier: 1, showInSidebar: true, icon: 'Settings' },
  { path: '/settings/school', title: 'School Information', module: 'settings', action: 'update', tier: 1 },
  { path: '/settings/academic', title: 'Academic Settings', module: 'settings', action: 'update', tier: 1 },
  { path: '/settings/fees', title: 'Fee Settings', module: 'settings', action: 'update', tier: 1 },
  { path: '/settings/communication', title: 'Communication Settings', module: 'settings', action: 'update', tier: 1 },
  { path: '/settings/notifications', title: 'Notification Preferences', module: 'settings', action: 'update', tier: 1 },
];

// --------------------------------------
// Module 27: ID Cards (6 routes)
// --------------------------------------
export const idCardRoutes: RouteConfig[] = [
  { path: '/id-cards', title: 'ID Cards', module: 'id_cards', action: 'view', tier: 1, showInSidebar: true, icon: 'CreditCard' },
  { path: '/id-cards/students', title: 'Student ID Cards', module: 'id_cards', action: 'view', tier: 1 },
  { path: '/id-cards/students/generate', title: 'Generate Student IDs', module: 'id_cards', action: 'create', tier: 1 },
  { path: '/id-cards/staff', title: 'Staff ID Cards', module: 'id_cards', action: 'view', tier: 1 },
  { path: '/id-cards/staff/generate', title: 'Generate Staff IDs', module: 'id_cards', action: 'create', tier: 1 },
  { path: '/id-cards/templates', title: 'ID Card Templates', module: 'id_cards', action: 'update', tier: 1 },
];

// --------------------------------------
// Module 28: Reports (7 routes)
// --------------------------------------
export const reportsRoutes: RouteConfig[] = [
  { path: '/reports', title: 'Reports', module: 'reports', action: 'view', tier: 1, showInSidebar: true, icon: 'BarChart' },
  { path: '/reports/students', title: 'Student Reports', module: 'reports', action: 'view', tier: 1 },
  { path: '/reports/attendance', title: 'Attendance Reports', module: 'reports', action: 'view', tier: 1 },
  { path: '/reports/academic', title: 'Academic Reports', module: 'reports', action: 'view', tier: 1 },
  { path: '/reports/financial', title: 'Financial Reports', module: 'reports', action: 'view', tier: 1 },
  { path: '/reports/staff', title: 'Staff Reports', module: 'reports', action: 'view', tier: 1 },
  { path: '/reports/custom', title: 'Custom Report', module: 'reports', action: 'create', tier: 1 },
];

// --------------------------------------
// Module 29: Announcements (5 routes)
// --------------------------------------
export const announcementRoutes: RouteConfig[] = [
  { path: '/announcements', title: 'Announcements', module: 'announcements', action: 'view', tier: 1, showInSidebar: true, icon: 'Megaphone' },
  { path: '/announcements/create', title: 'Create Announcement', module: 'announcements', action: 'create', tier: 1 },
  { path: '/announcements/:id', title: 'Announcement Details', module: 'announcements', action: 'view', tier: 1 },
  { path: '/announcements/:id/edit', title: 'Edit Announcement', module: 'announcements', action: 'update', tier: 1 },
  { path: '/announcements/:id/delete', title: 'Delete Announcement', module: 'announcements', action: 'delete', tier: 1 },
];

// --------------------------------------
// Module 30: Notifications (3 routes)
// --------------------------------------
export const notificationRoutes: RouteConfig[] = [
  { path: '/notifications', title: 'Notifications', module: 'notifications', action: 'view', tier: 1, showInSidebar: true, icon: 'Bell' },
  { path: '/notifications/send', title: 'Send Notification', module: 'notifications', action: 'create', tier: 1 },
  { path: '/notifications/:id/mark-read', title: 'Mark as Read', module: 'notifications', action: 'update', tier: 1 },
];

// --------------------------------------
// Module 31: Messages (6 routes)
// --------------------------------------
export const messageRoutes: RouteConfig[] = [
  { path: '/messages', title: 'Messages', module: 'messages', action: 'view', tier: 1, showInSidebar: true, icon: 'Mail' },
  { path: '/messages/compose', title: 'Compose Message', module: 'messages', action: 'create', tier: 1 },
  { path: '/messages/sms', title: 'Send SMS', module: 'messages', action: 'create', tier: 1 },
  { path: '/messages/email', title: 'Send Email', module: 'messages', action: 'create', tier: 1 },
  { path: '/messages/templates', title: 'Message Templates', module: 'messages', action: 'view', tier: 1 },
  { path: '/messages/history', title: 'Message History', module: 'messages', action: 'view', tier: 1 },
];

// --------------------------------------
// Public/Auth Routes (No permission required)
// --------------------------------------
export const authRoutes: RouteConfig[] = [
  { path: '/auth', title: 'Login', module: '', action: 'view', tier: 1, isPublic: true },
  { path: '/login', title: 'Login', module: '', action: 'view', tier: 1, isPublic: true },
  { path: '/forgot-password', title: 'Forgot Password', module: '', action: 'view', tier: 1, isPublic: true },
  { path: '/reset-password', title: 'Reset Password', module: '', action: 'view', tier: 1, isPublic: true },
];

// --------------------------------------
// Common/Error Routes
// --------------------------------------
export const commonRoutes: RouteConfig[] = [
  { path: '/', title: 'Home', module: 'dashboard', action: 'view', tier: 1 },
  { path: '/forbidden', title: 'Access Denied', module: '', action: 'view', tier: 1, isPublic: true },
  { path: '/not-found', title: 'Not Found', module: '', action: 'view', tier: 1, isPublic: true },
  { path: '*', title: 'Not Found', module: '', action: 'view', tier: 1, isPublic: true },
];


// ==========================================
// TIER 1 COMBINED (231 routes)
// ==========================================
export const tier1Routes: RouteConfig[] = [
  ...dashboardRoutes,
  ...profileRoutes,
  ...userRoutes,
  ...roleRoutes,
  ...permissionRoutes,
  ...studentRoutes,
  ...parentRoutes,
  ...parentPortalRoutes,
  ...teacherRoutes,
  ...employeeRoutes,
  ...attendanceRoutes,
  ...staffAttendanceRoutes,
  ...leaveRoutes,
  ...staffLeaveRoutes,
  ...academicYearRoutes,
  ...classRoutes,
  ...sectionRoutes,
  ...subjectRoutes,
  ...topicRoutes,
  ...timetableRoutes,
  ...lectureTemplateRoutes,
  ...examRoutes,
  ...marksRoutes,
  ...reportCardRoutes,
  ...feeRoutes,
  ...settingsRoutes,
  ...idCardRoutes,
  ...reportsRoutes,
  ...announcementRoutes,
  ...notificationRoutes,
  ...messageRoutes,
  ...authRoutes,
  ...commonRoutes,
];


// ==========================================
// TIER 2: EXTENDED FEATURES (12 Modules, 90 Routes)
// ==========================================

// --------------------------------------
// Module 32: Assignments (10 routes)
// --------------------------------------
export const assignmentRoutes: RouteConfig[] = [
  { path: '/assignments', title: 'Assignments', module: 'assignments', action: 'view', tier: 2, showInSidebar: true, icon: 'FileEdit' },
  { path: '/assignments/create', title: 'Create Assignment', module: 'assignments', action: 'create', tier: 2 },
  { path: '/assignments/:id', title: 'Assignment Details', module: 'assignments', action: 'view', tier: 2 },
  { path: '/assignments/:id/edit', title: 'Edit Assignment', module: 'assignments', action: 'update', tier: 2 },
  { path: '/assignments/:id/delete', title: 'Delete Assignment', module: 'assignments', action: 'delete', tier: 2 },
  { path: '/assignments/:id/submissions', title: 'View Submissions', module: 'assignments', action: 'view', tier: 2 },
  { path: '/assignments/:id/submissions/:studentId', title: 'Student Submission', module: 'assignments', action: 'view', tier: 2 },
  { path: '/assignments/:id/submissions/:studentId/grade', title: 'Grade Submission', module: 'assignments', action: 'approve', tier: 2 },
  { path: '/assignments/:id/submit', title: 'Submit Assignment', module: 'assignments', action: 'create', tier: 2 },
  { path: '/assignments/my-assignments', title: 'My Assignments', module: 'assignments', action: 'view', tier: 2 },
];

// --------------------------------------
// Module 33: Study Materials (7 routes)
// --------------------------------------
export const studyMaterialRoutes: RouteConfig[] = [
  { path: '/study-materials', title: 'Study Materials', module: 'study_materials', action: 'view', tier: 2, showInSidebar: true, icon: 'BookOpen' },
  { path: '/study-materials/upload', title: 'Upload Material', module: 'study_materials', action: 'create', tier: 2 },
  { path: '/study-materials/:id', title: 'Material Details', module: 'study_materials', action: 'view', tier: 2 },
  { path: '/study-materials/:id/edit', title: 'Edit Material', module: 'study_materials', action: 'update', tier: 2 },
  { path: '/study-materials/:id/delete', title: 'Delete Material', module: 'study_materials', action: 'delete', tier: 2 },
  { path: '/study-materials/by-subject/:subjectId', title: 'Materials by Subject', module: 'study_materials', action: 'view', tier: 2 },
  { path: '/study-materials/by-class/:classId', title: 'Materials by Class', module: 'study_materials', action: 'view', tier: 2 },
];

// --------------------------------------
// Module 34: Online Classes (8 routes)
// --------------------------------------
export const onlineClassRoutes: RouteConfig[] = [
  { path: '/online-classes', title: 'Online Classes', module: 'online_classes', action: 'view', tier: 2, showInSidebar: true, icon: 'Video' },
  { path: '/online-classes/schedule', title: 'Schedule Class', module: 'online_classes', action: 'create', tier: 2 },
  { path: '/online-classes/:id', title: 'Class Details', module: 'online_classes', action: 'view', tier: 2 },
  { path: '/online-classes/:id/edit', title: 'Edit Class', module: 'online_classes', action: 'update', tier: 2 },
  { path: '/online-classes/:id/cancel', title: 'Cancel Class', module: 'online_classes', action: 'delete', tier: 2 },
  { path: '/online-classes/:id/join', title: 'Join Class', module: 'online_classes', action: 'view', tier: 2 },
  { path: '/online-classes/:id/recording', title: 'View Recording', module: 'online_classes', action: 'view', tier: 2 },
  { path: '/online-classes/my-classes', title: 'My Classes', module: 'online_classes', action: 'view', tier: 2 },
];

// --------------------------------------
// Module 35: Homework (7 routes)
// --------------------------------------
export const homeworkRoutes: RouteConfig[] = [
  { path: '/homework', title: 'Homework', module: 'homework', action: 'view', tier: 2, showInSidebar: true, icon: 'ClipboardCheck' },
  { path: '/homework/create', title: 'Create Homework', module: 'homework', action: 'create', tier: 2 },
  { path: '/homework/:id', title: 'Homework Details', module: 'homework', action: 'view', tier: 2 },
  { path: '/homework/:id/edit', title: 'Edit Homework', module: 'homework', action: 'update', tier: 2 },
  { path: '/homework/:id/delete', title: 'Delete Homework', module: 'homework', action: 'delete', tier: 2 },
  { path: '/homework/my-homework', title: 'My Homework', module: 'homework', action: 'view', tier: 2 },
  { path: '/homework/by-date/:date', title: 'Homework by Date', module: 'homework', action: 'view', tier: 2 },
];

// --------------------------------------
// Module 36: Doubts (6 routes)
// --------------------------------------
export const doubtRoutes: RouteConfig[] = [
  { path: '/doubts', title: 'Doubts', module: 'doubts', action: 'view', tier: 2, showInSidebar: true, icon: 'HelpCircle' },
  { path: '/doubts/ask', title: 'Ask Doubt', module: 'doubts', action: 'create', tier: 2 },
  { path: '/doubts/:id', title: 'Doubt Details', module: 'doubts', action: 'view', tier: 2 },
  { path: '/doubts/:id/answer', title: 'Answer Doubt', module: 'doubts', action: 'create', tier: 2 },
  { path: '/doubts/:id/resolve', title: 'Mark Resolved', module: 'doubts', action: 'update', tier: 2 },
  { path: '/doubts/my-doubts', title: 'My Doubts', module: 'doubts', action: 'view', tier: 2 },
];

// --------------------------------------
// Module 37: Transport (12 routes)
// --------------------------------------
export const transportRoutes: RouteConfig[] = [
  { path: '/transport', title: 'Transport', module: 'transport', action: 'view', tier: 2, showInSidebar: true, icon: 'Bus' },
  { path: '/transport/routes', title: 'View Routes', module: 'transport', action: 'view', tier: 2 },
  { path: '/transport/routes/create', title: 'Create Route', module: 'transport', action: 'create', tier: 2 },
  { path: '/transport/routes/:id/edit', title: 'Edit Route', module: 'transport', action: 'update', tier: 2 },
  { path: '/transport/vehicles', title: 'View Vehicles', module: 'transport', action: 'view', tier: 2 },
  { path: '/transport/vehicles/create', title: 'Add Vehicle', module: 'transport', action: 'create', tier: 2 },
  { path: '/transport/vehicles/:id/edit', title: 'Edit Vehicle', module: 'transport', action: 'update', tier: 2 },
  { path: '/transport/drivers', title: 'View Drivers', module: 'transport', action: 'view', tier: 2 },
  { path: '/transport/drivers/create', title: 'Add Driver', module: 'transport', action: 'create', tier: 2 },
  { path: '/transport/drivers/:id/edit', title: 'Edit Driver', module: 'transport', action: 'update', tier: 2 },
  { path: '/transport/assignments', title: 'Student Assignments', module: 'transport', action: 'view', tier: 2 },
  { path: '/transport/tracking', title: 'Live Tracking', module: 'transport', action: 'view', tier: 2 },
];

// --------------------------------------
// Module 38: Payroll (8 routes)
// --------------------------------------
export const payrollRoutes: RouteConfig[] = [
  { path: '/payroll', title: 'Payroll', module: 'payroll', action: 'view', tier: 2, showInSidebar: true, icon: 'Wallet' },
  { path: '/payroll/structures', title: 'Salary Structures', module: 'payroll', action: 'view', tier: 2 },
  { path: '/payroll/structures/create', title: 'Create Structure', module: 'payroll', action: 'create', tier: 2 },
  { path: '/payroll/process', title: 'Process Payroll', module: 'payroll', action: 'create', tier: 2 },
  { path: '/payroll/payslips', title: 'View Payslips', module: 'payroll', action: 'view', tier: 2 },
  { path: '/payroll/payslips/:id', title: 'Payslip Details', module: 'payroll', action: 'view', tier: 2 },
  { path: '/payroll/payslips/:id/download', title: 'Download Payslip', module: 'payroll', action: 'view', tier: 2 },
  { path: '/payroll/my-payslips', title: 'My Payslips', module: 'payroll', action: 'view', tier: 2 },
];

// --------------------------------------
// Module 39: Appraisals (6 routes)
// --------------------------------------
export const appraisalRoutes: RouteConfig[] = [
  { path: '/appraisals', title: 'Appraisals', module: 'appraisals', action: 'view', tier: 2, showInSidebar: true, icon: 'Star' },
  { path: '/appraisals/create', title: 'Create Appraisal', module: 'appraisals', action: 'create', tier: 2 },
  { path: '/appraisals/:id', title: 'Appraisal Details', module: 'appraisals', action: 'view', tier: 2 },
  { path: '/appraisals/:id/edit', title: 'Edit Appraisal', module: 'appraisals', action: 'update', tier: 2 },
  { path: '/appraisals/:id/submit', title: 'Submit for Approval', module: 'appraisals', action: 'approve', tier: 2 },
  { path: '/appraisals/my-appraisals', title: 'My Appraisals', module: 'appraisals', action: 'view', tier: 2 },
];

// --------------------------------------
// Module 40: Recruitment (9 routes)
// --------------------------------------
export const recruitmentRoutes: RouteConfig[] = [
  { path: '/recruitment', title: 'Recruitment', module: 'recruitment', action: 'view', tier: 2, showInSidebar: true, icon: 'UserPlus' },
  { path: '/recruitment/jobs', title: 'Job Postings', module: 'recruitment', action: 'view', tier: 2 },
  { path: '/recruitment/jobs/create', title: 'Create Job', module: 'recruitment', action: 'create', tier: 2 },
  { path: '/recruitment/jobs/:id/edit', title: 'Edit Job', module: 'recruitment', action: 'update', tier: 2 },
  { path: '/recruitment/applications', title: 'Applications', module: 'recruitment', action: 'view', tier: 2 },
  { path: '/recruitment/applications/:id', title: 'Application Details', module: 'recruitment', action: 'view', tier: 2 },
  { path: '/recruitment/applications/:id/shortlist', title: 'Shortlist Candidate', module: 'recruitment', action: 'approve', tier: 2 },
  { path: '/recruitment/applications/:id/reject', title: 'Reject Application', module: 'recruitment', action: 'delete', tier: 2 },
  { path: '/recruitment/interviews', title: 'Schedule Interviews', module: 'recruitment', action: 'create', tier: 2 },
];

// --------------------------------------
// Module 41: Feedback (5 routes)
// --------------------------------------
export const feedbackRoutes: RouteConfig[] = [
  { path: '/feedback', title: 'Feedback', module: 'feedback', action: 'view', tier: 2, showInSidebar: true, icon: 'MessageCircle' },
  { path: '/feedback/submit', title: 'Submit Feedback', module: 'feedback', action: 'create', tier: 2 },
  { path: '/feedback/:id', title: 'Feedback Details', module: 'feedback', action: 'view', tier: 2 },
  { path: '/feedback/:id/respond', title: 'Respond to Feedback', module: 'feedback', action: 'create', tier: 2 },
  { path: '/feedback/forms', title: 'Feedback Forms', module: 'feedback', action: 'view', tier: 2 },
];

// --------------------------------------
// Module 42: Grievances (6 routes)
// --------------------------------------
export const grievanceRoutes: RouteConfig[] = [
  { path: '/grievances', title: 'Grievances', module: 'grievances', action: 'view', tier: 2, showInSidebar: true, icon: 'AlertTriangle' },
  { path: '/grievances/submit', title: 'Submit Grievance', module: 'grievances', action: 'create', tier: 2 },
  { path: '/grievances/:id', title: 'Grievance Details', module: 'grievances', action: 'view', tier: 2 },
  { path: '/grievances/:id/assign', title: 'Assign to Officer', module: 'grievances', action: 'update', tier: 2 },
  { path: '/grievances/:id/resolve', title: 'Mark Resolved', module: 'grievances', action: 'approve', tier: 2 },
  { path: '/grievances/my-grievances', title: 'My Grievances', module: 'grievances', action: 'view', tier: 2 },
];

// --------------------------------------
// Module 43: Support Tickets (6 routes)
// --------------------------------------
export const supportRoutes: RouteConfig[] = [
  { path: '/support', title: 'Support Tickets', module: 'support', action: 'view', tier: 2, showInSidebar: true, icon: 'LifeBuoy' },
  { path: '/support/create', title: 'Create Ticket', module: 'support', action: 'create', tier: 2 },
  { path: '/support/:id', title: 'Ticket Details', module: 'support', action: 'view', tier: 2 },
  { path: '/support/:id/reply', title: 'Reply to Ticket', module: 'support', action: 'create', tier: 2 },
  { path: '/support/:id/close', title: 'Close Ticket', module: 'support', action: 'update', tier: 2 },
  { path: '/support/my-tickets', title: 'My Tickets', module: 'support', action: 'view', tier: 2 },
];


// ==========================================
// TIER 2 COMBINED (90 routes)
// ==========================================
export const tier2Routes: RouteConfig[] = [
  ...assignmentRoutes,
  ...studyMaterialRoutes,
  ...onlineClassRoutes,
  ...homeworkRoutes,
  ...doubtRoutes,
  ...transportRoutes,
  ...payrollRoutes,
  ...appraisalRoutes,
  ...recruitmentRoutes,
  ...feedbackRoutes,
  ...grievanceRoutes,
  ...supportRoutes,
];


// ==========================================
// TIER 3: ADVANCED FEATURES (8 Modules, 69 Routes)
// ==========================================

// --------------------------------------
// Module 44: Analytics (8 routes)
// --------------------------------------
export const analyticsRoutes: RouteConfig[] = [
  { path: '/analytics', title: 'Analytics', module: 'analytics', action: 'view', tier: 3, showInSidebar: true, icon: 'TrendingUp' },
  { path: '/analytics/students', title: 'Student Analytics', module: 'analytics', action: 'view', tier: 3 },
  { path: '/analytics/attendance', title: 'Attendance Trends', module: 'analytics', action: 'view', tier: 3 },
  { path: '/analytics/financial', title: 'Financial Analytics', module: 'analytics', action: 'view', tier: 3 },
  { path: '/analytics/academic', title: 'Academic Insights', module: 'analytics', action: 'view', tier: 3 },
  { path: '/analytics/predictions', title: 'Predictive Analytics', module: 'analytics', action: 'view', tier: 3 },
  { path: '/analytics/custom', title: 'Custom Report', module: 'analytics', action: 'create', tier: 3 },
  { path: '/analytics/export', title: 'Export Analytics', module: 'analytics', action: 'export', tier: 3 },
];

// --------------------------------------
// Module 45: PTM - Parent Teacher Meetings (9 routes)
// --------------------------------------
export const ptmRoutes: RouteConfig[] = [
  { path: '/ptm', title: 'PTM', module: 'ptm', action: 'view', tier: 3, showInSidebar: true, icon: 'Users' },
  { path: '/ptm/schedule', title: 'PTM Schedule', module: 'ptm', action: 'view', tier: 3 },
  { path: '/ptm/slots', title: 'Manage Slots', module: 'ptm', action: 'create', tier: 3 },
  { path: '/ptm/slots/:id/book', title: 'Book Slot', module: 'ptm', action: 'create', tier: 3 },
  { path: '/ptm/bookings', title: 'View Bookings', module: 'ptm', action: 'view', tier: 3 },
  { path: '/ptm/bookings/:id', title: 'Booking Details', module: 'ptm', action: 'view', tier: 3 },
  { path: '/ptm/bookings/:id/cancel', title: 'Cancel Booking', module: 'ptm', action: 'delete', tier: 3 },
  { path: '/ptm/my-bookings', title: 'My Bookings', module: 'ptm', action: 'view', tier: 3 },
  { path: '/ptm/feedback', title: 'PTM Feedback', module: 'ptm', action: 'create', tier: 3 },
];

// --------------------------------------
// Module 46: Alumni (7 routes)
// --------------------------------------
export const alumniRoutes: RouteConfig[] = [
  { path: '/alumni', title: 'Alumni', module: 'alumni', action: 'view', tier: 3, showInSidebar: true, icon: 'GraduationCap' },
  { path: '/alumni/register', title: 'Alumni Registration', module: 'alumni', action: 'create', tier: 3 },
  { path: '/alumni/:id', title: 'Alumni Profile', module: 'alumni', action: 'view', tier: 3 },
  { path: '/alumni/:id/edit', title: 'Edit Alumni', module: 'alumni', action: 'update', tier: 3 },
  { path: '/alumni/events', title: 'Alumni Events', module: 'alumni', action: 'view', tier: 3 },
  { path: '/alumni/events/create', title: 'Create Event', module: 'alumni', action: 'create', tier: 3 },
  { path: '/alumni/donations', title: 'Alumni Donations', module: 'alumni', action: 'view', tier: 3 },
];

// --------------------------------------
// Module 47: Admissions (11 routes)
// --------------------------------------
export const admissionRoutes: RouteConfig[] = [
  { path: '/admissions', title: 'Admissions', module: 'admissions', action: 'view', tier: 3, showInSidebar: true, icon: 'UserPlus' },
  { path: '/admissions/applications', title: 'Applications', module: 'admissions', action: 'view', tier: 3 },
  { path: '/admissions/apply', title: 'New Application', module: 'admissions', action: 'create', tier: 3 },
  { path: '/admissions/applications/:id', title: 'Application Details', module: 'admissions', action: 'view', tier: 3 },
  { path: '/admissions/applications/:id/review', title: 'Review Application', module: 'admissions', action: 'update', tier: 3 },
  { path: '/admissions/applications/:id/approve', title: 'Approve Application', module: 'admissions', action: 'approve', tier: 3 },
  { path: '/admissions/applications/:id/reject', title: 'Reject Application', module: 'admissions', action: 'delete', tier: 3 },
  { path: '/admissions/entrance-tests', title: 'Entrance Tests', module: 'admissions', action: 'view', tier: 3 },
  { path: '/admissions/entrance-tests/create', title: 'Create Test', module: 'admissions', action: 'create', tier: 3 },
  { path: '/admissions/interviews', title: 'Interviews', module: 'admissions', action: 'view', tier: 3 },
  { path: '/admissions/interviews/schedule', title: 'Schedule Interview', module: 'admissions', action: 'create', tier: 3 },
];

// --------------------------------------
// Module 48: Inventory (12 routes)
// --------------------------------------
export const inventoryRoutes: RouteConfig[] = [
  { path: '/inventory', title: 'Inventory', module: 'inventory', action: 'view', tier: 3, showInSidebar: true, icon: 'Package' },
  { path: '/inventory/items', title: 'All Items', module: 'inventory', action: 'view', tier: 3 },
  { path: '/inventory/items/create', title: 'Add Item', module: 'inventory', action: 'create', tier: 3 },
  { path: '/inventory/items/:id/edit', title: 'Edit Item', module: 'inventory', action: 'update', tier: 3 },
  { path: '/inventory/categories', title: 'Categories', module: 'inventory', action: 'view', tier: 3 },
  { path: '/inventory/issue', title: 'Issue Item', module: 'inventory', action: 'create', tier: 3 },
  { path: '/inventory/return', title: 'Return Item', module: 'inventory', action: 'update', tier: 3 },
  { path: '/inventory/issued', title: 'Issued Items', module: 'inventory', action: 'view', tier: 3 },
  { path: '/inventory/stock', title: 'Stock Report', module: 'inventory', action: 'view', tier: 3 },
  { path: '/inventory/library', title: 'Library', module: 'inventory', action: 'view', tier: 3 },
  { path: '/inventory/library/books', title: 'Manage Books', module: 'inventory', action: 'view', tier: 3 },
  { path: '/inventory/library/issue', title: 'Issue Book', module: 'inventory', action: 'create', tier: 3 },
];

// --------------------------------------
// Module 49: Certificates (9 routes)
// --------------------------------------
export const certificateRoutes: RouteConfig[] = [
  { path: '/certificates', title: 'Certificates', module: 'certificates', action: 'view', tier: 3, showInSidebar: true, icon: 'Award' },
  { path: '/certificates/generate', title: 'Generate Certificate', module: 'certificates', action: 'create', tier: 3 },
  { path: '/certificates/templates', title: 'Templates', module: 'certificates', action: 'view', tier: 3 },
  { path: '/certificates/templates/create', title: 'Create Template', module: 'certificates', action: 'create', tier: 3 },
  { path: '/certificates/templates/:id/edit', title: 'Edit Template', module: 'certificates', action: 'update', tier: 3 },
  { path: '/certificates/issued', title: 'Issued Certificates', module: 'certificates', action: 'view', tier: 3 },
  { path: '/certificates/:id', title: 'Certificate Details', module: 'certificates', action: 'view', tier: 3 },
  { path: '/certificates/:id/download', title: 'Download Certificate', module: 'certificates', action: 'view', tier: 3 },
  { path: '/certificates/bulk-generate', title: 'Bulk Generate', module: 'certificates', action: 'create', tier: 3 },
];

// --------------------------------------
// Module 50: Surveys (7 routes)
// --------------------------------------
export const surveyRoutes: RouteConfig[] = [
  { path: '/surveys', title: 'Surveys', module: 'surveys', action: 'view', tier: 3, showInSidebar: true, icon: 'ClipboardList' },
  { path: '/surveys/create', title: 'Create Survey', module: 'surveys', action: 'create', tier: 3 },
  { path: '/surveys/:id', title: 'Survey Details', module: 'surveys', action: 'view', tier: 3 },
  { path: '/surveys/:id/edit', title: 'Edit Survey', module: 'surveys', action: 'update', tier: 3 },
  { path: '/surveys/:id/respond', title: 'Respond to Survey', module: 'surveys', action: 'create', tier: 3 },
  { path: '/surveys/:id/results', title: 'Survey Results', module: 'surveys', action: 'view', tier: 3 },
  { path: '/surveys/:id/export', title: 'Export Results', module: 'surveys', action: 'export', tier: 3 },
];

// --------------------------------------
// Module 51: Branches (6 routes)
// --------------------------------------
export const branchRoutes: RouteConfig[] = [
  { path: '/branches', title: 'Branches', module: 'branches', action: 'view', tier: 3, showInSidebar: true, icon: 'Building' },
  { path: '/branches/create', title: 'Create Branch', module: 'branches', action: 'create', tier: 3 },
  { path: '/branches/:id', title: 'Branch Details', module: 'branches', action: 'view', tier: 3 },
  { path: '/branches/:id/edit', title: 'Edit Branch', module: 'branches', action: 'update', tier: 3 },
  { path: '/branches/:id/delete', title: 'Delete Branch', module: 'branches', action: 'delete', tier: 3 },
  { path: '/branches/switch', title: 'Switch Branch', module: 'branches', action: 'update', tier: 3 },
];


// ==========================================
// TIER 3 COMBINED (69 routes)
// ==========================================
export const tier3Routes: RouteConfig[] = [
  ...analyticsRoutes,
  ...ptmRoutes,
  ...alumniRoutes,
  ...admissionRoutes,
  ...inventoryRoutes,
  ...certificateRoutes,
  ...surveyRoutes,
  ...branchRoutes,
];


// ==========================================
// ALL ROUTES COMBINED
// ==========================================
export const allRoutes: RouteConfig[] = [
  ...tier1Routes,
  ...tier2Routes,
  ...tier3Routes,
];


// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get route configuration by path
 */
export function getRouteConfig(path: string): RouteConfig | undefined {
  return allRoutes.find(route => route.path === path);
}

/**
 * Get all routes for a specific module
 */
export function getModuleRoutes(moduleCode: string): RouteConfig[] {
  return allRoutes.filter(route => route.module === moduleCode);
}

/**
 * Get all sidebar-visible routes
 */
export function getSidebarRoutes(): RouteConfig[] {
  return allRoutes.filter(route => route.showInSidebar === true);
}

/**
 * Get routes by tier
 */
export function getRoutesByTier(tier: 1 | 2 | 3): RouteConfig[] {
  return allRoutes.filter(route => route.tier === tier);
}

/**
 * Get public routes (no auth required)
 */
export function getPublicRoutes(): RouteConfig[] {
  return allRoutes.filter(route => route.isPublic === true);
}

/**
 * Get protected routes (auth required)
 */
export function getProtectedRoutes(): RouteConfig[] {
  return allRoutes.filter(route => route.isPublic !== true && route.module !== '');
}

/**
 * Check if a path matches a route pattern
 * Handles dynamic segments like :id, :studentId, etc.
 */
export function matchRoutePath(path: string, pattern: string): boolean {
  const pathParts = path.split('/').filter(Boolean);
  const patternParts = pattern.split('/').filter(Boolean);
  
  if (pathParts.length !== patternParts.length) return false;
  
  return patternParts.every((part, index) => {
    if (part.startsWith(':')) return true; // Dynamic segment matches anything
    return part === pathParts[index];
  });
}

/**
 * Find route config for a given URL path
 */
export function findRouteForPath(path: string): RouteConfig | undefined {
  // First try exact match
  const exactMatch = allRoutes.find(route => route.path === path);
  if (exactMatch) return exactMatch;
  
  // Then try pattern match
  return allRoutes.find(route => matchRoutePath(path, route.path));
}


// ==========================================
// STATISTICS
// ==========================================
export const ROUTE_STATS = {
  tier1: tier1Routes.length,
  tier2: tier2Routes.length,
  tier3: tier3Routes.length,
  total: allRoutes.length,
  sidebarVisible: getSidebarRoutes().length,
  public: getPublicRoutes().length,
  protected: getProtectedRoutes().length,
};
