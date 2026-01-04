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
// Module 2: Profile (1 route) - CONSOLIDATED
// Edit, Change Password, Upload Photo are handled via tabs in the main ProfilePage
// --------------------------------------
export const profileRoutes: RouteConfig[] = [
  { path: '/profile', title: 'My Profile', module: 'profile', action: 'view', tier: 1, showInSidebar: true, icon: 'User' },
];

// --------------------------------------
// Module 3: Users (2 routes) - CONSOLIDATED
// Create, Edit, Delete, Assign Role, Grant Permission, Bulk Upload are handled via modals/dialogs in the main pages
// --------------------------------------
export const userRoutes: RouteConfig[] = [
  { path: '/users', title: 'Users', module: 'users', action: 'view', tier: 1, showInSidebar: true, icon: 'Users' },
  { path: '/users/:id', title: 'User Details', module: 'users', action: 'view', tier: 1 },
];

// --------------------------------------
// Module 4: Roles (2 routes) - CONSOLIDATED
// Create, Edit, Delete are handled via modals/dialogs in the main pages
// Permissions management is a tab/section in the Role detail page
// --------------------------------------
export const roleRoutes: RouteConfig[] = [
  { path: '/roles', title: 'Roles', module: 'roles', action: 'view', tier: 1, showInSidebar: true, icon: 'Shield' },
  { path: '/roles/:id', title: 'Role Details', module: 'roles', action: 'view', tier: 1 },
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
// --------------------------------------
// Module 6: Students (20 → 2 routes - CONSOLIDATED)
// Create/Edit use modals, sub-routes become tabs in detail page
// --------------------------------------
export const studentRoutes: RouteConfig[] = [
  { path: '/students', title: 'Students', module: 'students', action: 'view', tier: 1, showInSidebar: true, icon: 'GraduationCap' },
  { path: '/students/:id', title: 'Student Details', module: 'students', action: 'view', tier: 1 },
  // CONSOLIDATED: The following routes are now handled within the pages above:
  // - /students/create → Modal in StudentsList
  // - /students/:id/edit → Modal in StudentDetail
  // - /students/:id/documents → Tab in StudentDetail
  // - /students/:id/medical-records → Tab in StudentDetail  
  // - /students/:id/parents → Tab in StudentDetail
  // - /students/bulk-upload → Button/Modal in StudentsList
  // - /students/promotion → Button/Modal in StudentsList
  // - /students/transfer → Button/Modal in StudentsList
  // - /students/export → Button in StudentsList
];

// --------------------------------------
// Module 7: Parents (4 → 1 route - CONSOLIDATED)
// All CRUD operations use modals
// --------------------------------------
export const parentRoutes: RouteConfig[] = [
  { path: '/parents', title: 'Parents', module: 'parents', action: 'view', tier: 1, showInSidebar: true, icon: 'Users' },
  // CONSOLIDATED: The following routes are now handled within the page above:
  // - /parents/create → Modal in ParentsList
  // - /parents/:id → Modal view in ParentsList
  // - /parents/:id/edit → Modal in ParentsList
];

// --------------------------------------
// Module 8: Parent Portal (CONSOLIDATED: 10 → 2 routes)
// Dashboard + Child detail page with tabs for Profile/Attendance/Results/Fees/Homework/Timetable/Teachers
// Pay Fees is modal from dashboard or child detail
// --------------------------------------
export const parentPortalRoutes: RouteConfig[] = [
  { path: '/parent/dashboard', title: 'Parent Dashboard', module: 'parent', action: 'view', tier: 1, showInSidebar: true, icon: 'Home' },
  { path: '/parent/children/:id', title: 'Child Details', module: 'parent', action: 'view', tier: 1 },
  // CONSOLIDATED: The following routes are now tabs within ChildDetail page:
  // - /parent/children → Children list shown on dashboard
  // - /parent/children/:id/profile → Profile tab
  // - /parent/children/:id/attendance → Attendance tab
  // - /parent/children/:id/results → Results tab
  // - /parent/children/:id/fees → Fees tab
  // - /parent/children/:id/homework → Homework tab
  // - /parent/children/:id/timetable → Timetable tab
  // - /parent/children/:id/teachers → Teachers tab
  // - /parent/fee-payment → Modal from dashboard or fees tab
];

// --------------------------------------
// Module 9: Teachers (10 → 2 routes - CONSOLIDATED)
// Create/Edit use modals, sub-routes become tabs in detail page
// --------------------------------------
export const teacherRoutes: RouteConfig[] = [
  { path: '/teachers', title: 'Teachers', module: 'teachers', action: 'view', tier: 1, showInSidebar: true, icon: 'BookOpen' },
  { path: '/teachers/:id', title: 'Teacher Details', module: 'teachers', action: 'view', tier: 1 },
  // CONSOLIDATED: The following routes are now handled within the pages above:
  // - /teachers/create → Modal in TeachersList
  // - /teachers/:id/edit → Modal in TeacherDetail
  // - /teachers/:id/subjects → Tab in TeacherDetail
  // - /teachers/:id/timetable → Tab in TeacherDetail
  // - /teachers/bulk-upload → Button/Modal in TeachersList
  // - /teachers/export → Button in TeachersList
];

// --------------------------------------
// Module 10: Employees (7 → 1 route - CONSOLIDATED)
// All CRUD operations use modals
// --------------------------------------
export const employeeRoutes: RouteConfig[] = [
  { path: '/employees', title: 'Employees', module: 'employees', action: 'view', tier: 1, showInSidebar: true, icon: 'Briefcase' },
  // CONSOLIDATED: The following routes are now handled within the page above:
  // - /employees/create → Modal in EmployeesList
  // - /employees/:id → Modal view in EmployeesList
  // - /employees/:id/edit → Modal in EmployeesList
  // - /employees/bulk-upload → Button/Modal in EmployeesList
  // - /employees/export → Button in EmployeesList
];

// --------------------------------------
// Module 11: Student Attendance (1 route - CONSOLIDATED)
// --------------------------------------
// CONSOLIDATION: 14 routes → 1 route
// All functionality now accessible via tabs on the main dashboard
export const attendanceRoutes: RouteConfig[] = [
  { path: '/attendance', title: 'Attendance', module: 'attendance', action: 'view', tier: 1, showInSidebar: true, icon: 'CheckSquare' },
];

// --------------------------------------
// Module 12: Staff Attendance (1 route - CONSOLIDATED)
// --------------------------------------
// CONSOLIDATION: 7 routes → 1 route
// All functionality now accessible via tabs on the main dashboard
export const staffAttendanceRoutes: RouteConfig[] = [
  { path: '/staff/attendance', title: 'Staff Attendance', module: 'staff_attendance', action: 'view', tier: 1, showInSidebar: true, icon: 'CheckSquare' },
];

// --------------------------------------
// Module 13: Student Leave (1 route - CONSOLIDATED)
// --------------------------------------
// CONSOLIDATION: 5 routes → 1 route
// Create/Edit via modal dialog, Details via expandable rows
export const leaveRoutes: RouteConfig[] = [
  { path: '/leave-requests', title: 'Leave Requests', module: 'leave', action: 'view', tier: 1, showInSidebar: true, icon: 'Calendar' },
];

// --------------------------------------
// Module 14: Staff Leave (1 route - CONSOLIDATED)
// --------------------------------------
// CONSOLIDATION: 6 routes → 1 route
// All functionality via tabs (My Leaves, Apply, Balance)
export const staffLeaveRoutes: RouteConfig[] = [
  { path: '/staff/leave', title: 'Staff Leave', module: 'staff_leave', action: 'view', tier: 1, showInSidebar: true, icon: 'Calendar' },
];

// --------------------------------------
// Module 15: Academic Years (1 route - CONSOLIDATED)
// --------------------------------------
// CONSOLIDATION: 6 routes → 1 route
// - /academic-years/create → Modal in AcademicYearsList
// - /academic-years/:id → Modal in AcademicYearsList  
// - /academic-years/:id/edit → Modal in AcademicYearsList
// - /academic-years/:id/delete → Delete confirmation in list
// - /academic-years/:id/set-current → Action button in list
export const academicYearRoutes: RouteConfig[] = [
  { path: '/academic-years', title: 'Academic Years', module: 'academic_years', action: 'view', tier: 1, showInSidebar: true, icon: 'Calendar' },
];

// --------------------------------------
// Module 16: Classes (1 route - CONSOLIDATED)
// --------------------------------------
// CONSOLIDATION: 5 routes → 1 route
// - /classes/create → Modal in ClassesList
// - /classes/:id → Modal in ClassesList
// - /classes/:id/edit → Modal in ClassesList
// - /classes/:id/delete → Delete confirmation in list
export const classRoutes: RouteConfig[] = [
  { path: '/classes', title: 'Classes', module: 'classes', action: 'view', tier: 1, showInSidebar: true, icon: 'School' },
];

// --------------------------------------
// Module 17: Sections (1 route - CONSOLIDATED)
// --------------------------------------
// CONSOLIDATION: 7 routes → 1 route
// - /sections/create → Modal in SectionsList
// - /sections/:id → Modal in SectionsList
// - /sections/:id/edit → Modal in SectionsList
// - /sections/:id/delete → Delete confirmation in list
// - /sections/:id/students → Students tab in modal
// - /sections/:id/assign-teacher → Teacher select in modal
export const sectionRoutes: RouteConfig[] = [
  { path: '/sections', title: 'Sections', module: 'sections', action: 'view', tier: 1, showInSidebar: true, icon: 'Layout' },
];

// --------------------------------------
// Module 18: Subjects (1 route - CONSOLIDATED)
// --------------------------------------
// CONSOLIDATION: 7 routes → 1 route
// - /subjects/create → Modal in SubjectsList
// - /subjects/:id → Modal in SubjectsList
// - /subjects/:id/edit → Modal in SubjectsList
// - /subjects/:id/delete → Delete confirmation in list
// - /subjects/:id/assign-class → Handled in Topics
// - /subjects/:id/topics → Navigate to Topics with filter
export const subjectRoutes: RouteConfig[] = [
  { path: '/subjects', title: 'Subjects', module: 'subjects', action: 'view', tier: 1, showInSidebar: true, icon: 'Book' },
];

// --------------------------------------
// Module 19: Topics (1 route - CONSOLIDATED)
// --------------------------------------
// CONSOLIDATION: 7 routes → 1 route
// - /topics/create → Modal in TopicsList
// - /topics/:id → Expand in TopicsList
// - /topics/:id/edit → Modal in TopicsList
// - /topics/:id/delete → Delete confirmation in list
// - /topics/:id/content → Expand in TopicsList
// - /topics/:id/content/upload → AddContentDialog in TopicsList
export const topicRoutes: RouteConfig[] = [
  { path: '/topics', title: 'Topics', module: 'topics', action: 'view', tier: 1, showInSidebar: true, icon: 'FileText' },
];

// --------------------------------------
// Module 20: Timetable (2 routes - CONSOLIDATED)
// --------------------------------------
// CONSOLIDATION: 14 routes → 2 routes
// All features accessible via tabs on TimetableDashboard
export const timetableRoutes: RouteConfig[] = [
  { path: '/timetable', title: 'Timetable', module: 'timetable', action: 'view', tier: 1, showInSidebar: true, icon: 'Clock' },
  { path: '/my-timetable', title: 'My Timetable', module: 'timetable', action: 'view', tier: 1, showInSidebar: true, icon: 'Clock' },
];

// --------------------------------------
// Module 21: Lecture Templates (1 route - CONSOLIDATED)
// --------------------------------------
// CONSOLIDATION: 5 routes → 1 route
// Create/Edit via modal dialogs
export const lectureTemplateRoutes: RouteConfig[] = [
  { path: '/lecture-templates', title: 'Lecture Templates', module: 'lecture_templates', action: 'view', tier: 1, showInSidebar: true, icon: 'Layout' },
];

// --------------------------------------
// Module 22: Exams (CONSOLIDATED: 10 → 2 routes)
// Create/Edit via modal dialogs, Schedule/Marks/Reports as tabs in Detail page
// --------------------------------------
export const examRoutes: RouteConfig[] = [
  { path: '/exams', title: 'Exams', module: 'exams', action: 'view', tier: 1, showInSidebar: true, icon: 'ClipboardList' },
  { path: '/exams/:id', title: 'Exam Details', module: 'exams', action: 'view', tier: 1 },
];

// --------------------------------------
// Module 23: Marks (CONSOLIDATED: 6 → 0 routes)
// Marks entry is now a tab in Exam Detail page (/exams/:id)
// --------------------------------------
export const marksRoutes: RouteConfig[] = [
  // All marks functionality merged into Exam Detail page
];

// --------------------------------------
// Module 24: Report Cards (CONSOLIDATED: 5 → 1 route)
// View/Download handled via modal, generation via Exam Detail page
// --------------------------------------
export const reportCardRoutes: RouteConfig[] = [
  { path: '/report-cards', title: 'Report Cards', module: 'report_cards', action: 'view', tier: 1, showInSidebar: true, icon: 'FileText' },
];

// --------------------------------------
// Module 25: Fees (CONSOLIDATED: 22 → 2 routes)
// Dashboard with tabs for structures/receipts/reports, Collection page for payments
// --------------------------------------
export const feeRoutes: RouteConfig[] = [
  { path: '/fees', title: 'Fee Management', module: 'fees', action: 'view', tier: 1, showInSidebar: true, icon: 'DollarSign' },
  { path: '/fees/collect', title: 'Collect Fee', module: 'fees', action: 'create', tier: 1 },
];

// --------------------------------------
// Module 26: Settings (CONSOLIDATED: 6 → 1 route)
// School/Academic/Fees/Communication/Notifications as tabs within single Settings page
// --------------------------------------
export const settingsRoutes: RouteConfig[] = [
  { path: '/settings', title: 'Settings', module: 'settings', action: 'view', tier: 1, showInSidebar: true, icon: 'Settings' },
];

// --------------------------------------
// Module 27: ID Cards (CONSOLIDATED: 6 → 1 route)
// Student IDs/Staff IDs/Templates as tabs, Generate via modal
// --------------------------------------
export const idCardRoutes: RouteConfig[] = [
  { path: '/id-cards', title: 'ID Cards', module: 'id_cards', action: 'view', tier: 1, showInSidebar: true, icon: 'CreditCard' },
];

// --------------------------------------
// Module 28: Reports (CONSOLIDATED: 7 → 1 route)
// Report type selector within single page (Student/Attendance/Academic/Financial/Staff/Custom)
// --------------------------------------
export const reportsRoutes: RouteConfig[] = [
  { path: '/reports', title: 'Reports', module: 'reports', action: 'view', tier: 1, showInSidebar: true, icon: 'BarChart' },
];

// --------------------------------------
// Module 29: Announcements (CONSOLIDATED: 5 → 1 route)
// Create/Edit/Delete handled via modals in the main AnnouncementsList page
// --------------------------------------
export const announcementRoutes: RouteConfig[] = [
  { path: '/announcements', title: 'Announcements', module: 'announcements', action: 'view', tier: 1, showInSidebar: true, icon: 'Megaphone' },
];

// --------------------------------------
// Module 30: Notifications (CONSOLIDATED: 3 → 1 route)
// Send notification and mark-read handled within the single Notifications page
// --------------------------------------
export const notificationRoutes: RouteConfig[] = [
  { path: '/notifications', title: 'Notifications', module: 'notifications', action: 'view', tier: 1, showInSidebar: true, icon: 'Bell' },
];

// --------------------------------------
// Module 31: Messages (CONSOLIDATED: 6 → 1 route)
// Compose, SMS, Email, Templates, History accessible via tabs within the Messages page
// --------------------------------------
export const messageRoutes: RouteConfig[] = [
  { path: '/messages', title: 'Messages', module: 'messages', action: 'view', tier: 1, showInSidebar: true, icon: 'Mail' },
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
// Module 32: Assignments (CONSOLIDATED: 10 → 2 routes)
// List + Detail page with submissions tab, create/edit via modals
// --------------------------------------
export const assignmentRoutes: RouteConfig[] = [
  { path: '/assignments', title: 'Assignments', module: 'assignments', action: 'view', tier: 2, showInSidebar: true, icon: 'FileEdit' },
  { path: '/assignments/:id', title: 'Assignment Details', module: 'assignments', action: 'view', tier: 2 },
  // CONSOLIDATED: The following routes are now handled within the pages above:
  // - /assignments/create → Modal in AssignmentsList
  // - /assignments/:id/edit → Modal in AssignmentDetail
  // - /assignments/:id/delete → Modal confirmation
  // - /assignments/:id/submissions → Tab in AssignmentDetail
  // - /assignments/:id/submissions/:studentId → Modal in submissions tab
  // - /assignments/:id/submissions/:studentId/grade → Modal in submissions tab
  // - /assignments/:id/submit → Modal/form in AssignmentDetail (student view)
  // - /assignments/my-assignments → Filter/tab in AssignmentsList
];

// --------------------------------------
// Module 33: Study Materials (CONSOLIDATED: 7 → 1 route)
// Single page with filters by subject/class, upload via modal
// --------------------------------------
export const studyMaterialRoutes: RouteConfig[] = [
  { path: '/study-materials', title: 'Study Materials', module: 'study_materials', action: 'view', tier: 2, showInSidebar: true, icon: 'BookOpen' },
  // CONSOLIDATED: The following routes are now handled within the page above:
  // - /study-materials/upload → Modal in StudyMaterialsList
  // - /study-materials/:id → Modal detail view
  // - /study-materials/:id/edit → Modal in StudyMaterialsList
  // - /study-materials/:id/delete → Modal confirmation
  // - /study-materials/by-subject/:subjectId → Filter in list
  // - /study-materials/by-class/:classId → Filter in list
];

// --------------------------------------
// Module 34: Online Classes (CONSOLIDATED: 8 → 1 route)
// Tabs: Schedule, My Classes, Upcoming, Recordings
// --------------------------------------
export const onlineClassRoutes: RouteConfig[] = [
  { path: '/online-classes', title: 'Online Classes', module: 'online_classes', action: 'view', tier: 2, showInSidebar: true, icon: 'Video' },
  // CONSOLIDATED: The following routes are now handled within the page above:
  // - /online-classes/schedule → Modal to schedule class
  // - /online-classes/:id → Modal detail view
  // - /online-classes/:id/edit → Modal edit
  // - /online-classes/:id/cancel → Modal confirmation
  // - /online-classes/:id/join → Button action
  // - /online-classes/:id/recording → Modal/embedded player
  // - /online-classes/my-classes → Tab in main page
];

// --------------------------------------
// Module 35: Homework (CONSOLIDATED: 7 → 1 route)
// Single page with date filter, create/edit via modals
// --------------------------------------
export const homeworkRoutes: RouteConfig[] = [
  { path: '/homework', title: 'Homework', module: 'homework', action: 'view', tier: 2, showInSidebar: true, icon: 'ClipboardCheck' },
  // CONSOLIDATED: The following routes are now handled within the page above:
  // - /homework/create → Modal in HomeworkList
  // - /homework/:id → Modal detail view
  // - /homework/:id/edit → Modal edit
  // - /homework/:id/delete → Modal confirmation
  // - /homework/my-homework → Tab/filter in list
  // - /homework/by-date/:date → Date filter in list
];

// --------------------------------------
// Module 36: Doubts (CONSOLIDATED: 6 → 1 route)
// Tabs: Ask Doubt, My Doubts, All Doubts
// --------------------------------------
export const doubtRoutes: RouteConfig[] = [
  { path: '/doubts', title: 'Doubts', module: 'doubts', action: 'view', tier: 2, showInSidebar: true, icon: 'HelpCircle' },
  // CONSOLIDATED: The following routes are now handled within the page above:
  // - /doubts/ask → Modal/form in Doubts page
  // - /doubts/:id → Modal detail view with answers
  // - /doubts/:id/answer → Modal/form in detail view
  // - /doubts/:id/resolve → Button action
  // - /doubts/my-doubts → Tab in main page
];

// --------------------------------------
// Module 37: Transport (CONSOLIDATED: 12 → 1 route)
// Tabs: Routes, Vehicles, Drivers, Student Assignments, Live Tracking
// Create/Edit via modals within each tab
// --------------------------------------
export const transportRoutes: RouteConfig[] = [
  { path: '/transport', title: 'Transport', module: 'transport', action: 'view', tier: 2, showInSidebar: true, icon: 'Bus' },
  // CONSOLIDATED: The following routes are now tabs within the Transport dashboard:
  // - /transport/routes → Routes tab
  // - /transport/routes/create → Modal in Routes tab
  // - /transport/routes/:id/edit → Modal in Routes tab
  // - /transport/vehicles → Vehicles tab
  // - /transport/vehicles/create → Modal in Vehicles tab
  // - /transport/vehicles/:id/edit → Modal in Vehicles tab
  // - /transport/drivers → Drivers tab
  // - /transport/drivers/create → Modal in Drivers tab
  // - /transport/drivers/:id/edit → Modal in Drivers tab
  // - /transport/assignments → Student Assignments tab
  // - /transport/tracking → Live Tracking tab
];

// --------------------------------------
// Module 38: Payroll (CONSOLIDATED: 8 → 1 route)
// Tabs: Salary Structures, Process Payroll, Payslips, My Payslips
// Create/Edit via modals, download as button action
// --------------------------------------
export const payrollRoutes: RouteConfig[] = [
  { path: '/payroll', title: 'Payroll', module: 'payroll', action: 'view', tier: 2, showInSidebar: true, icon: 'Wallet' },
  { path: '/salary-structures', title: 'Salary Structures', module: 'salary_structures', action: 'view', tier: 2, showInSidebar: false, icon: 'Wallet' },
  // CONSOLIDATED: The following routes are now tabs/modals within Payroll dashboard:
  // - /payroll/structures → Salary Structures tab
  // - /payroll/structures/create → Modal in Structures tab
  // - /payroll/process → Process Payroll tab/modal
  // - /payroll/payslips → Payslips tab
  // - /payroll/payslips/:id → Modal detail view
  // - /payroll/payslips/:id/download → Button action
  // - /payroll/my-payslips → Tab/filter in Payslips
];

// --------------------------------------
// Module 39: Appraisals (CONSOLIDATED: 6 → 1 route)
// Single page with tabs for All/My Appraisals, create/edit via modals
// --------------------------------------
export const appraisalRoutes: RouteConfig[] = [
  { path: '/appraisals', title: 'Appraisals', module: 'appraisals', action: 'view', tier: 2, showInSidebar: true, icon: 'Star' },
  // CONSOLIDATED: The following routes are now handled within the page above:
  // - /appraisals/create → Modal in Appraisals page
  // - /appraisals/:id → Modal detail view
  // - /appraisals/:id/edit → Modal edit
  // - /appraisals/:id/submit → Button action
  // - /appraisals/my-appraisals → Tab/filter in list
];

// --------------------------------------
// Module 40: Recruitment (CONSOLIDATED: 9 → 2 routes)
// Dashboard + Job detail page with applications tab
// --------------------------------------
export const recruitmentRoutes: RouteConfig[] = [
  { path: '/recruitment', title: 'Recruitment', module: 'recruitment', action: 'view', tier: 2, showInSidebar: true, icon: 'UserPlus' },
  { path: '/recruitment/jobs/:id', title: 'Job Details', module: 'recruitment', action: 'view', tier: 2 },
  // CONSOLIDATED: The following routes are now handled within the pages above:
  // - /recruitment/jobs → Tab in Recruitment dashboard
  // - /recruitment/jobs/create → Modal in Jobs tab
  // - /recruitment/jobs/:id/edit → Modal in Job detail
  // - /recruitment/applications → Tab in Recruitment dashboard
  // - /recruitment/applications/:id → Modal in applications view
  // - /recruitment/applications/:id/shortlist → Button action
  // - /recruitment/applications/:id/reject → Button action
  // - /recruitment/interviews → Tab/modal in dashboard
];

// --------------------------------------
// Module 41: Feedback (CONSOLIDATED: 5 → 1 route)
// Single page with tabs/modals for submit, view, respond, forms
// --------------------------------------
export const feedbackRoutes: RouteConfig[] = [
  { path: '/feedback', title: 'Feedback', module: 'feedback', action: 'view', tier: 2, showInSidebar: true, icon: 'MessageCircle' },
  // CONSOLIDATED: The following routes are now handled within the page above:
  // - /feedback/submit → Modal/tab in Feedback page
  // - /feedback/:id → Modal detail view
  // - /feedback/:id/respond → Modal in detail view
  // - /feedback/forms → Tab in Feedback page
];

// --------------------------------------
// Module 42: Grievances (CONSOLIDATED: 6 → 1 route)
// Single page with tabs for All/My Grievances, modals for actions
// --------------------------------------
export const grievanceRoutes: RouteConfig[] = [
  { path: '/grievances', title: 'Grievances', module: 'grievances', action: 'view', tier: 2, showInSidebar: true, icon: 'AlertTriangle' },
  // CONSOLIDATED: The following routes are now handled within the page above:
  // - /grievances/submit → Modal in Grievances page
  // - /grievances/:id → Modal detail view
  // - /grievances/:id/assign → Button action in detail
  // - /grievances/:id/resolve → Button action in detail
  // - /grievances/my-grievances → Tab/filter in list
];

// --------------------------------------
// Module 43: Support Tickets (CONSOLIDATED: 6 → 1 route)
// Single page with tabs for All/My Tickets, modals for actions
// --------------------------------------
export const supportRoutes: RouteConfig[] = [
  { path: '/support', title: 'Support Tickets', module: 'support', action: 'view', tier: 2, showInSidebar: true, icon: 'LifeBuoy' },
  // CONSOLIDATED: The following routes are now handled within the page above:
  // - /support/create → Modal in Support page
  // - /support/:id → Modal detail view
  // - /support/:id/reply → Modal in detail view
  // - /support/:id/close → Button action in detail
  // - /support/my-tickets → Tab/filter in list
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
// Module 44: Analytics (CONSOLIDATED: 8 → 1 route)
// Dashboard with tabs for Students/Attendance/Financial/Academic/Predictions
// --------------------------------------
export const analyticsRoutes: RouteConfig[] = [
  { path: '/analytics', title: 'Analytics', module: 'analytics', action: 'view', tier: 3, showInSidebar: true, icon: 'TrendingUp' },
  // CONSOLIDATED: All analytics views are tabs within the dashboard
  // - /analytics/students → Students tab
  // - /analytics/attendance → Attendance tab
  // - /analytics/financial → Financial tab
  // - /analytics/academic → Academic tab
  // - /analytics/predictions → Predictions tab
  // - /analytics/custom → Modal for custom report
  // - /analytics/export → Button action
];

// --------------------------------------
// Module 45: PTM - Parent Teacher Meetings (CONSOLIDATED: 9 → 1 route)
// Tabs: Schedule, Slots, Bookings, My Bookings
// --------------------------------------
export const ptmRoutes: RouteConfig[] = [
  { path: '/ptm', title: 'PTM', module: 'ptm', action: 'view', tier: 3, showInSidebar: true, icon: 'Users' },
  // CONSOLIDATED: All PTM features are tabs/modals
  // - /ptm/schedule → Schedule tab
  // - /ptm/slots → Manage Slots tab
  // - /ptm/slots/:id/book → Modal in slots
  // - /ptm/bookings → Bookings tab
  // - /ptm/bookings/:id → Modal detail
  // - /ptm/bookings/:id/cancel → Button action
  // - /ptm/my-bookings → Tab/filter
  // - /ptm/feedback → Modal
];

// --------------------------------------
// Module 46: Alumni - REMOVED (Not needed)
// --------------------------------------
export const alumniRoutes: RouteConfig[] = [];

// --------------------------------------
// Module 47: Admissions (CONSOLIDATED: 11 → 2 routes)
// Dashboard + Application detail page
// --------------------------------------
export const admissionRoutes: RouteConfig[] = [
  { path: '/admissions', title: 'Admissions', module: 'admissions', action: 'view', tier: 3, showInSidebar: true, icon: 'UserPlus' },
  { path: '/admissions/applications/:id', title: 'Application Details', module: 'admissions', action: 'view', tier: 3 },
  // CONSOLIDATED: Most features are tabs/modals
  // - /admissions/applications → Applications tab
  // - /admissions/apply → Modal in applications
  // - /admissions/applications/:id/review → Tab in detail
  // - /admissions/applications/:id/approve → Button action
  // - /admissions/applications/:id/reject → Button action
  // - /admissions/entrance-tests → Tab in dashboard
  // - /admissions/entrance-tests/create → Modal
  // - /admissions/interviews → Tab in dashboard
  // - /admissions/interviews/schedule → Modal
];

// --------------------------------------
// Module 48: Inventory (CONSOLIDATED: 12 → 1 route)
// Tabs: Items, Categories, Issue/Return, Issued, Stock, Library
// --------------------------------------
export const inventoryRoutes: RouteConfig[] = [
  { path: '/inventory', title: 'Inventory', module: 'inventory', action: 'view', tier: 3, showInSidebar: true, icon: 'Package' },
  // CONSOLIDATED: All inventory features are tabs/modals
  // - /inventory/items → Items tab
  // - /inventory/items/create → Modal in items
  // - /inventory/items/:id/edit → Modal edit
  // - /inventory/categories → Categories tab
  // - /inventory/issue → Modal in items
  // - /inventory/return → Modal action
  // - /inventory/issued → Issued Items tab
  // - /inventory/stock → Stock Report tab
  // - /inventory/library → Library tab
  // - /inventory/library/books → Sub-tab in library
  // - /inventory/library/issue → Modal in library
];

// --------------------------------------
// Module 48a: Library (CONSOLIDATED: 10 → 1 route)
// Tabs: Dashboard, Books, Issue, Return, Members
// Create/Edit via modals within each tab
// --------------------------------------
export const libraryRoutes: RouteConfig[] = [
  { path: '/library', title: 'Library', module: 'library', action: 'view', tier: 3, showInSidebar: true, icon: 'BookOpen' },
  // CONSOLIDATED: The following routes are now tabs within the Library dashboard:
  // - /library/books → Books tab
  // - /library/books/create → Modal in Books tab
  // - /library/books/:id/edit → Modal in Books tab
  // - /library/issue → Issue Books tab
  // - /library/return → Return Books tab
  // - /library/members → Members tab
  // - /library/members/create → Modal in Members tab
  // - /library/transactions → Transactions tab
  // - /library/fines → Fines tab (or modal)
];

// --------------------------------------
// Module 48b: Hostel - REMOVED (Not needed)
// --------------------------------------
export const hostelRoutes: RouteConfig[] = [];

// --------------------------------------
// Module 49: Certificates (CONSOLIDATED: 9 → 1 route)
// Tabs: Generate, Templates, Issued
// --------------------------------------
export const certificateRoutes: RouteConfig[] = [
  { path: '/certificates', title: 'Certificates', module: 'certificates', action: 'view', tier: 3, showInSidebar: true, icon: 'Award' },
  // CONSOLIDATED: All certificate features are tabs/modals
  // - /certificates/generate → Modal in main page
  // - /certificates/templates → Templates tab
  // - /certificates/templates/create → Modal in templates
  // - /certificates/templates/:id/edit → Modal edit
  // - /certificates/issued → Issued tab
  // - /certificates/:id → Modal detail
  // - /certificates/:id/download → Button action
  // - /certificates/bulk-generate → Modal
];

// --------------------------------------
// Module 50: Surveys (CONSOLIDATED: 7 → 1 route)
// Single page with modals for create/respond/results
// --------------------------------------
export const surveyRoutes: RouteConfig[] = [
  { path: '/surveys', title: 'Surveys', module: 'surveys', action: 'view', tier: 3, showInSidebar: true, icon: 'ClipboardList' },
  // CONSOLIDATED: All survey features are modals
  // - /surveys/create → Modal in surveys
  // - /surveys/:id → Modal detail
  // - /surveys/:id/edit → Modal edit
  // - /surveys/:id/respond → Modal/embedded form
  // - /surveys/:id/results → Modal/tab in detail
  // - /surveys/:id/export → Button action
];

// --------------------------------------
// Module 51: Branches - REMOVED (Not needed)
// --------------------------------------
export const branchRoutes: RouteConfig[] = [];


// ==========================================
// TIER 3 COMBINED (69 routes)
// ==========================================
export const tier3Routes: RouteConfig[] = [
  ...analyticsRoutes,
  ...ptmRoutes,
  ...alumniRoutes,
  ...admissionRoutes,
  ...inventoryRoutes,
  ...libraryRoutes,
  ...hostelRoutes,
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
