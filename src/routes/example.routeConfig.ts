/**
 * EduMunch Route Configuration
 * ==============================
 * 
 * Centralized route configuration mapping each route to:
 * - Path: URL path
 * - Module: Permission module code
 * - Action: Required permission action (view, create, update, delete, approve, export)
 * - Tier: Feature tier (1, 2, or 3)
 * - Public: Whether route is public (no auth required)
 * 
 * This configuration is used by:
 * - Route registration in App.tsx
 * - Sidebar navigation
 * - Permission-based access control
 */

export type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'approve' | 'export';

export interface RouteConfig {
  path: string;
  title: string;
  module: string;
  action: PermissionAction;
  tier: 1 | 2 | 3;
  public?: boolean;
  adminOnly?: boolean;
  parentPath?: string; // For nested routes
}

// ==========================================
// TIER 1: BASIC FEATURES
// ==========================================

// 1.1 Authentication Routes (Public)
export const authRoutes: RouteConfig[] = [
  { path: '/login', title: 'Login', module: '', action: 'view', tier: 1, public: true },
  { path: '/logout', title: 'Logout', module: '', action: 'view', tier: 1, public: false },
  { path: '/forgot-password', title: 'Forgot Password', module: '', action: 'view', tier: 1, public: true },
  { path: '/reset-password', title: 'Reset Password', module: '', action: 'view', tier: 1, public: true },
];

// 1.1 Profile Routes
export const profileRoutes: RouteConfig[] = [
  { path: '/profile', title: 'Profile', module: 'profile', action: 'view', tier: 1 },
  { path: '/profile/edit', title: 'Edit Profile', module: 'profile', action: 'update', tier: 1 },
  { path: '/profile/change-password', title: 'Change Password', module: 'profile', action: 'update', tier: 1 },
  { path: '/profile/upload-photo', title: 'Upload Photo', module: 'profile', action: 'update', tier: 1 },
];

// 1.1 User Management Routes
export const userRoutes: RouteConfig[] = [
  { path: '/users', title: 'Users', module: 'users', action: 'view', tier: 1 },
  { path: '/users/create', title: 'Create User', module: 'users', action: 'create', tier: 1 },
  { path: '/users/:id', title: 'User Details', module: 'users', action: 'view', tier: 1 },
  { path: '/users/:id/edit', title: 'Edit User', module: 'users', action: 'update', tier: 1 },
  { path: '/users/:id/delete', title: 'Delete User', module: 'users', action: 'delete', tier: 1 },
  { path: '/users/bulk-upload', title: 'Bulk Upload Users', module: 'users', action: 'create', tier: 1 },
  { path: '/users/:id/assign-role', title: 'Assign Role', module: 'users', action: 'update', tier: 1 },
  { path: '/users/:id/grant-permission', title: 'Grant Permission', module: 'users', action: 'update', tier: 1 },
];

// 1.1 Role Management Routes
export const roleRoutes: RouteConfig[] = [
  { path: '/roles', title: 'Roles', module: 'roles', action: 'view', tier: 1 },
  { path: '/roles/create', title: 'Create Role', module: 'roles', action: 'create', tier: 1 },
  { path: '/roles/:id/edit', title: 'Edit Role', module: 'roles', action: 'update', tier: 1 },
  { path: '/roles/:id/permissions', title: 'Role Permissions', module: 'roles', action: 'update', tier: 1 },
  { path: '/roles/:id/delete', title: 'Delete Role', module: 'roles', action: 'delete', tier: 1 },
  { path: '/permissions', title: 'Permissions', module: 'permissions', action: 'view', tier: 1 },
];

// 1.2 Student Management Routes
export const studentRoutes: RouteConfig[] = [
  { path: '/students', title: 'Students', module: 'students', action: 'view', tier: 1 },
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

// 1.2 Parent Management Routes
export const parentRoutes: RouteConfig[] = [
  { path: '/parents', title: 'Parents', module: 'parents', action: 'view', tier: 1 },
  { path: '/parents/create', title: 'Add Parent', module: 'parents', action: 'create', tier: 1 },
  { path: '/parents/:id', title: 'Parent Details', module: 'parents', action: 'view', tier: 1 },
  { path: '/parents/:id/edit', title: 'Edit Parent', module: 'parents', action: 'update', tier: 1 },
];

// 1.2 Parent Portal Routes
export const parentPortalRoutes: RouteConfig[] = [
  { path: '/parent/dashboard', title: 'Parent Dashboard', module: 'parent', action: 'view', tier: 1 },
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

// 1.3 Attendance Management Routes
export const attendanceRoutes: RouteConfig[] = [
  { path: '/attendance', title: 'Attendance', module: 'attendance', action: 'view', tier: 1 },
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

// 1.3 Leave Request Routes
export const leaveRequestRoutes: RouteConfig[] = [
  { path: '/leave-requests', title: 'Leave Requests', module: 'leave', action: 'view', tier: 1 },
  { path: '/leave-requests/create', title: 'Apply Leave', module: 'leave', action: 'create', tier: 1 },
  { path: '/leave-requests/:id', title: 'Leave Details', module: 'leave', action: 'view', tier: 1 },
  { path: '/leave-requests/:id/approve', title: 'Approve Leave', module: 'leave', action: 'approve', tier: 1 },
  { path: '/leave-requests/student/:studentId', title: 'Student Leave History', module: 'leave', action: 'view', tier: 1 },
];

// 1.3 Staff Attendance Routes
export const staffAttendanceRoutes: RouteConfig[] = [
  { path: '/staff/attendance', title: 'Staff Attendance', module: 'staff_attendance', action: 'view', tier: 1 },
  { path: '/staff/attendance/mark', title: 'Mark Staff Attendance', module: 'staff_attendance', action: 'create', tier: 1 },
  { path: '/staff/attendance/view', title: 'View Staff Attendance', module: 'staff_attendance', action: 'view', tier: 1 },
  { path: '/staff/attendance/view/:employeeId', title: 'Employee Attendance', module: 'staff_attendance', action: 'view', tier: 1 },
  { path: '/staff/attendance/reports', title: 'Staff Attendance Reports', module: 'staff_attendance', action: 'view', tier: 1 },
  { path: '/staff/attendance/reports/monthly', title: 'Monthly Staff Report', module: 'staff_attendance', action: 'view', tier: 1 },
  { path: '/staff/attendance/export', title: 'Export Staff Attendance', module: 'staff_attendance', action: 'export', tier: 1 },
];

// 1.4 Academic Year Routes
export const academicYearRoutes: RouteConfig[] = [
  { path: '/academic-years', title: 'Academic Years', module: 'academic_years', action: 'view', tier: 1 },
  { path: '/academic-years/create', title: 'Create Academic Year', module: 'academic_years', action: 'create', tier: 1 },
  { path: '/academic-years/:id', title: 'Academic Year Details', module: 'academic_years', action: 'view', tier: 1 },
  { path: '/academic-years/:id/edit', title: 'Edit Academic Year', module: 'academic_years', action: 'update', tier: 1 },
  { path: '/academic-years/:id/delete', title: 'Delete Academic Year', module: 'academic_years', action: 'delete', tier: 1 },
  { path: '/academic-years/:id/set-current', title: 'Set Current Year', module: 'academic_years', action: 'update', tier: 1 },
];

// 1.4 Class Routes
export const classRoutes: RouteConfig[] = [
  { path: '/classes', title: 'Classes', module: 'classes', action: 'view', tier: 1 },
  { path: '/classes/create', title: 'Create Class', module: 'classes', action: 'create', tier: 1 },
  { path: '/classes/:id', title: 'Class Details', module: 'classes', action: 'view', tier: 1 },
  { path: '/classes/:id/edit', title: 'Edit Class', module: 'classes', action: 'update', tier: 1 },
  { path: '/classes/:id/delete', title: 'Delete Class', module: 'classes', action: 'delete', tier: 1 },
];

// 1.4 Section Routes
export const sectionRoutes: RouteConfig[] = [
  { path: '/sections', title: 'Sections', module: 'sections', action: 'view', tier: 1 },
  { path: '/sections/create', title: 'Create Section', module: 'sections', action: 'create', tier: 1 },
  { path: '/sections/:id', title: 'Section Details', module: 'sections', action: 'view', tier: 1 },
  { path: '/sections/:id/edit', title: 'Edit Section', module: 'sections', action: 'update', tier: 1 },
  { path: '/sections/:id/delete', title: 'Delete Section', module: 'sections', action: 'delete', tier: 1 },
  { path: '/sections/:id/students', title: 'Section Students', module: 'sections', action: 'view', tier: 1 },
  { path: '/sections/:id/assign-teacher', title: 'Assign Teacher', module: 'sections', action: 'update', tier: 1 },
];

// 1.4 Subject Routes
export const subjectRoutes: RouteConfig[] = [
  { path: '/subjects', title: 'Subjects', module: 'subjects', action: 'view', tier: 1 },
  { path: '/subjects/create', title: 'Create Subject', module: 'subjects', action: 'create', tier: 1 },
  { path: '/subjects/:id', title: 'Subject Details', module: 'subjects', action: 'view', tier: 1 },
  { path: '/subjects/:id/edit', title: 'Edit Subject', module: 'subjects', action: 'update', tier: 1 },
  { path: '/subjects/:id/delete', title: 'Delete Subject', module: 'subjects', action: 'delete', tier: 1 },
  { path: '/subjects/:id/assign-class', title: 'Assign to Class', module: 'subjects', action: 'update', tier: 1 },
  { path: '/subjects/:id/topics', title: 'Subject Topics', module: 'subjects', action: 'view', tier: 1 },
];

// 1.4 Topic Routes
export const topicRoutes: RouteConfig[] = [
  { path: '/topics', title: 'Topics', module: 'topics', action: 'view', tier: 1 },
  { path: '/topics/create', title: 'Create Topic', module: 'topics', action: 'create', tier: 1 },
  { path: '/topics/:id', title: 'Topic Details', module: 'topics', action: 'view', tier: 1 },
  { path: '/topics/:id/edit', title: 'Edit Topic', module: 'topics', action: 'update', tier: 1 },
  { path: '/topics/:id/delete', title: 'Delete Topic', module: 'topics', action: 'delete', tier: 1 },
  { path: '/topics/:id/content', title: 'Topic Content', module: 'topics', action: 'view', tier: 1 },
  { path: '/topics/:id/content/upload', title: 'Upload Content', module: 'topics', action: 'update', tier: 1 },
];

// 1.4 Teacher Routes
export const teacherRoutes: RouteConfig[] = [
  { path: '/teachers', title: 'Teachers', module: 'teachers', action: 'view', tier: 1 },
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

// 1.4 Timetable Routes
export const timetableRoutes: RouteConfig[] = [
  { path: '/timetable', title: 'Timetable', module: 'timetable', action: 'view', tier: 1 },
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
  { path: '/my-timetable', title: 'My Timetable', module: 'timetable', action: 'view', tier: 1 },
  { path: '/class-timetable', title: 'Class Timetable', module: 'timetable', action: 'view', tier: 1 },
];

// 1.4 Lecture Template Routes
export const lectureTemplateRoutes: RouteConfig[] = [
  { path: '/lecture-templates', title: 'Lecture Templates', module: 'lecture_templates', action: 'view', tier: 1 },
  { path: '/lecture-templates/create', title: 'Create Template', module: 'lecture_templates', action: 'create', tier: 1 },
  { path: '/lecture-templates/:id', title: 'Template Details', module: 'lecture_templates', action: 'view', tier: 1 },
  { path: '/lecture-templates/:id/edit', title: 'Edit Template', module: 'lecture_templates', action: 'update', tier: 1 },
  { path: '/lecture-templates/:id/delete', title: 'Delete Template', module: 'lecture_templates', action: 'delete', tier: 1 },
];

// 1.5 Exam Routes
export const examRoutes: RouteConfig[] = [
  { path: '/exams', title: 'Exams', module: 'exams', action: 'view', tier: 1 },
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

// 1.5 Marks Routes
export const marksRoutes: RouteConfig[] = [
  { path: '/exams/:id/marks', title: 'Marks Dashboard', module: 'marks', action: 'view', tier: 1 },
  { path: '/exams/:id/marks/enter', title: 'Enter Marks', module: 'marks', action: 'create', tier: 1 },
  { path: '/exams/:id/marks/bulk-upload', title: 'Bulk Upload Marks', module: 'marks', action: 'create', tier: 1 },
  { path: '/exams/:id/marks/verify', title: 'Verify Marks', module: 'marks', action: 'approve', tier: 1 },
  { path: '/exams/:id/marks/:studentId', title: 'Student Marks', module: 'marks', action: 'view', tier: 1 },
  { path: '/exams/:id/grades', title: 'Calculate Grades', module: 'marks', action: 'update', tier: 1 },
];

// 1.5 Report Card Routes
export const reportCardRoutes: RouteConfig[] = [
  { path: '/exams/:id/report-cards', title: 'Generate Report Cards', module: 'report_cards', action: 'create', tier: 1 },
  { path: '/report-cards', title: 'Report Cards', module: 'report_cards', action: 'view', tier: 1 },
  { path: '/report-cards/:id', title: 'View Report Card', module: 'report_cards', action: 'view', tier: 1 },
  { path: '/report-cards/:id/download', title: 'Download Report Card', module: 'report_cards', action: 'view', tier: 1 },
  { path: '/report-cards/templates', title: 'Report Card Templates', module: 'report_cards', action: 'update', tier: 1 },
];

// 1.6 Fee Management Routes
export const feeRoutes: RouteConfig[] = [
  { path: '/fees', title: 'Fee Management', module: 'fees', action: 'view', tier: 1 },
  { path: '/fees/structure', title: 'Fee Structures', module: 'fees', action: 'view', tier: 1 },
  { path: '/fees/structure/create', title: 'Create Fee Structure', module: 'fees', action: 'create', tier: 1 },
  { path: '/fees/structure/:id/edit', title: 'Edit Fee Structure', module: 'fees', action: 'update', tier: 1 },
  { path: '/fees/structure/:id/delete', title: 'Delete Fee Structure', module: 'fees', action: 'delete', tier: 1 },
  { path: '/fees/assign', title: 'Assign Fees', module: 'fees', action: 'create', tier: 1 },
  { path: '/fees/assign/:studentId', title: 'Assign Student Fee', module: 'fees', action: 'update', tier: 1 },
  { path: '/fees/discounts', title: 'Discounts', module: 'fees', action: 'update', tier: 1 },
  { path: '/fees/collection', title: 'Fee Collection', module: 'fees', action: 'view', tier: 1 },
  { path: '/fees/collect', title: 'Collect Fee', module: 'fees', action: 'create', tier: 1 },
  { path: '/fees/collect/:studentId', title: 'Collect Student Fee', module: 'fees', action: 'create', tier: 1 },
  { path: '/fees/receipts', title: 'Fee Receipts', module: 'fees', action: 'view', tier: 1 },
  { path: '/fees/receipts/:id', title: 'Receipt Details', module: 'fees', action: 'view', tier: 1 },
  { path: '/fees/receipts/:id/print', title: 'Print Receipt', module: 'fees', action: 'view', tier: 1 },
  { path: '/fees/reports', title: 'Fee Reports', module: 'fees', action: 'view', tier: 1 },
  { path: '/fees/reports/daily-collection', title: 'Daily Collection', module: 'fees', action: 'view', tier: 1 },
  { path: '/fees/reports/pending-dues', title: 'Pending Dues', module: 'fees', action: 'view', tier: 1 },
  { path: '/fees/reports/defaulters', title: 'Defaulters', module: 'fees', action: 'view', tier: 1 },
  { path: '/fees/reports/class-wise', title: 'Class-wise Collection', module: 'fees', action: 'view', tier: 1 },
  { path: '/fees/export', title: 'Export Fees', module: 'fees', action: 'export', tier: 1 },
];

// 1.7 Settings Routes
export const settingsRoutes: RouteConfig[] = [
  { path: '/settings', title: 'Settings', module: 'settings', action: 'view', tier: 1 },
  { path: '/settings/school-info', title: 'School Info', module: 'settings', action: 'view', tier: 1 },
  { path: '/settings/school-info/edit', title: 'Edit School Info', module: 'settings', action: 'update', tier: 1 },
  { path: '/settings/academic-calendar', title: 'Academic Calendar', module: 'settings', action: 'view', tier: 1 },
  { path: '/settings/academic-calendar/events', title: 'Calendar Events', module: 'settings', action: 'create', tier: 1 },
  { path: '/settings/periods', title: 'Period Timings', module: 'settings', action: 'view', tier: 1 },
  { path: '/settings/periods/edit', title: 'Edit Periods', module: 'settings', action: 'update', tier: 1 },
  { path: '/settings/grading', title: 'Grading System', module: 'settings', action: 'view', tier: 1 },
  { path: '/settings/grading/configure', title: 'Configure Grading', module: 'settings', action: 'update', tier: 1 },
  { path: '/settings/backup', title: 'Backup', module: 'settings', action: 'view', tier: 1 },
  { path: '/settings/backup/create', title: 'Create Backup', module: 'settings', action: 'create', tier: 1 },
  { path: '/settings/backup/download', title: 'Download Backup', module: 'settings', action: 'view', tier: 1 },
  { path: '/settings/backup/history', title: 'Backup History', module: 'settings', action: 'view', tier: 1 },
  { path: '/settings/data-export', title: 'Data Export', module: 'settings', action: 'export', tier: 1 },
  { path: '/settings/data-export/students', title: 'Export Students', module: 'settings', action: 'export', tier: 1 },
  { path: '/settings/data-export/staff', title: 'Export Staff', module: 'settings', action: 'export', tier: 1 },
  { path: '/settings/data-export/financial', title: 'Export Financial', module: 'settings', action: 'export', tier: 1 },
];

// 1.8 ID Card Routes
export const idCardRoutes: RouteConfig[] = [
  { path: '/id-cards', title: 'ID Cards', module: 'id_cards', action: 'view', tier: 1 },
  { path: '/id-cards/students', title: 'Student ID Cards', module: 'id_cards', action: 'view', tier: 1 },
  { path: '/id-cards/students/generate', title: 'Generate Student IDs', module: 'id_cards', action: 'create', tier: 1 },
  { path: '/id-cards/students/:id/print', title: 'Print Student ID', module: 'id_cards', action: 'view', tier: 1 },
  { path: '/id-cards/staff', title: 'Staff ID Cards', module: 'id_cards', action: 'view', tier: 1 },
  { path: '/id-cards/staff/generate', title: 'Generate Staff IDs', module: 'id_cards', action: 'create', tier: 1 },
  { path: '/id-cards/staff/:id/print', title: 'Print Staff ID', module: 'id_cards', action: 'view', tier: 1 },
  { path: '/id-cards/templates', title: 'ID Card Templates', module: 'id_cards', action: 'view', tier: 1 },
  { path: '/id-cards/templates/edit', title: 'Edit Templates', module: 'id_cards', action: 'update', tier: 1 },
  { path: '/id-cards/bulk-generate', title: 'Bulk Generate', module: 'id_cards', action: 'create', tier: 1 },
];

// 1.9 Reports Routes
export const reportsRoutes: RouteConfig[] = [
  { path: '/reports', title: 'Reports', module: 'reports', action: 'view', tier: 1 },
  { path: '/reports/students', title: 'Student Reports', module: 'reports', action: 'view', tier: 1 },
  { path: '/reports/students/attendance', title: 'Student Attendance Report', module: 'reports', action: 'view', tier: 1 },
  { path: '/reports/students/academic', title: 'Student Academic Report', module: 'reports', action: 'view', tier: 1 },
  { path: '/reports/students/fee-status', title: 'Student Fee Status', module: 'reports', action: 'view', tier: 1 },
  { path: '/reports/attendance', title: 'Attendance Reports', module: 'reports', action: 'view', tier: 1 },
  { path: '/reports/attendance/class-wise', title: 'Class-wise Attendance', module: 'reports', action: 'view', tier: 1 },
  { path: '/reports/attendance/teacher-wise', title: 'Teacher-wise Attendance', module: 'reports', action: 'view', tier: 1 },
  { path: '/reports/academic', title: 'Academic Reports', module: 'reports', action: 'view', tier: 1 },
  { path: '/reports/academic/class-performance', title: 'Class Performance', module: 'reports', action: 'view', tier: 1 },
  { path: '/reports/academic/subject-analysis', title: 'Subject Analysis', module: 'reports', action: 'view', tier: 1 },
  { path: '/reports/financial', title: 'Financial Reports', module: 'reports', action: 'view', tier: 1 },
  { path: '/reports/financial/fee-collection', title: 'Fee Collection Report', module: 'reports', action: 'view', tier: 1 },
  { path: '/reports/financial/outstanding', title: 'Outstanding Dues', module: 'reports', action: 'view', tier: 1 },
  { path: '/reports/custom', title: 'Custom Reports', module: 'reports', action: 'create', tier: 1 },
  { path: '/reports/export', title: 'Export Reports', module: 'reports', action: 'export', tier: 1 },
];

// 1.10 Announcement Routes
export const announcementRoutes: RouteConfig[] = [
  { path: '/announcements', title: 'Announcements', module: 'announcements', action: 'view', tier: 1 },
  { path: '/announcements/create', title: 'Create Announcement', module: 'announcements', action: 'create', tier: 1 },
  { path: '/announcements/:id', title: 'Announcement Details', module: 'announcements', action: 'view', tier: 1 },
  { path: '/announcements/:id/edit', title: 'Edit Announcement', module: 'announcements', action: 'update', tier: 1 },
  { path: '/announcements/:id/delete', title: 'Delete Announcement', module: 'announcements', action: 'delete', tier: 1 },
];

// 1.10 Notification Routes
export const notificationRoutes: RouteConfig[] = [
  { path: '/notifications', title: 'Notifications', module: 'notifications', action: 'view', tier: 1 },
  { path: '/notifications/:id', title: 'Notification Details', module: 'notifications', action: 'view', tier: 1 },
  { path: '/notifications/:id/mark-read', title: 'Mark as Read', module: 'notifications', action: 'update', tier: 1 },
  { path: '/notifications/settings', title: 'Notification Settings', module: 'notifications', action: 'update', tier: 1 },
  { path: '/notifications/send', title: 'Send Notification', module: 'notifications', action: 'create', tier: 1 },
  { path: '/notifications/send-bulk', title: 'Bulk Notifications', module: 'notifications', action: 'create', tier: 1 },
];

// 1.10 Message Routes
export const messageRoutes: RouteConfig[] = [
  { path: '/messages', title: 'Messages', module: 'messages', action: 'view', tier: 1 },
  { path: '/messages/send', title: 'Send Message', module: 'messages', action: 'create', tier: 1 },
  { path: '/messages/send-bulk', title: 'Bulk Messages', module: 'messages', action: 'create', tier: 1 },
  { path: '/messages/templates', title: 'Message Templates', module: 'messages', action: 'view', tier: 1 },
  { path: '/messages/templates/create', title: 'Create Template', module: 'messages', action: 'create', tier: 1 },
  { path: '/messages/history', title: 'Message History', module: 'messages', action: 'view', tier: 1 },
  { path: '/messages/reports', title: 'Delivery Reports', module: 'messages', action: 'view', tier: 1 },
];

// Common Routes
export const commonRoutes: RouteConfig[] = [
  { path: '/dashboard', title: 'Dashboard', module: 'dashboard', action: 'view', tier: 1 },
  { path: '/help', title: 'Help', module: '', action: 'view', tier: 1, public: true },
  { path: '/support', title: 'Support', module: 'support', action: 'view', tier: 1 },
  { path: '/unauthorized', title: 'Unauthorized', module: '', action: 'view', tier: 1, public: true },
  { path: '/404', title: 'Not Found', module: '', action: 'view', tier: 1, public: true },
];

// ==========================================
// ALL TIER 1 ROUTES
// ==========================================
export const tier1Routes: RouteConfig[] = [
  ...authRoutes,
  ...profileRoutes,
  ...userRoutes,
  ...roleRoutes,
  ...studentRoutes,
  ...parentRoutes,
  ...parentPortalRoutes,
  ...attendanceRoutes,
  ...leaveRequestRoutes,
  ...staffAttendanceRoutes,
  ...academicYearRoutes,
  ...classRoutes,
  ...sectionRoutes,
  ...subjectRoutes,
  ...topicRoutes,
  ...teacherRoutes,
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
  ...commonRoutes,
];

// Helper function to get route config by path
export function getRouteConfig(path: string): RouteConfig | undefined {
  return tier1Routes.find(route => route.path === path);
}

// Helper function to get all routes for a module
export function getModuleRoutes(module: string): RouteConfig[] {
  return tier1Routes.filter(route => route.module === module);
}

// Count total routes
export const TIER1_ROUTE_COUNT = tier1Routes.length;
