/**
 * EduMunch Sidebar Configuration
 * ================================
 * 
 * Defines the sidebar structure with module groupings.
 * Each group contains related modules that will be displayed
 * as collapsible sections in the sidebar.
 * 
 * The sidebar renders based on user permissions:
 * - Groups are shown if user has 'view' permission on ANY module in the group
 * - Modules are shown if user has 'view' permission on that module
 * - Sub-items are shown based on specific action permissions
 */

import { SidebarGroup, ModuleSidebarConfig, ModuleSubItem } from './types';

// ==========================================
// MODULE CONFIGURATIONS
// ==========================================

// Dashboard - Always visible for authenticated users
const dashboardModule: ModuleSidebarConfig = {
  moduleCode: 'dashboard',
  displayName: 'Dashboard',
  icon: 'LayoutDashboard',
  basePath: '/dashboard',
  order: 1,
};

// Profile - Always visible for authenticated users
const profileModule: ModuleSidebarConfig = {
  moduleCode: 'profile',
  displayName: 'My Profile',
  icon: 'User',
  basePath: '/profile',
  order: 2,
  subItems: [
    { title: 'Edit Profile', path: '/profile/edit', action: 'update' },
    { title: 'Change Password', path: '/profile/change-password', action: 'update' },
  ],
};

// Users Module
const usersModule: ModuleSidebarConfig = {
  moduleCode: 'users',
  displayName: 'Users',
  icon: 'Users',
  basePath: '/users',
  order: 1,
  subItems: [
    { title: 'Add User', path: '/users/create', action: 'create' },
    { title: 'Bulk Upload', path: '/users/bulk-upload', action: 'create' },
  ],
};

// Roles Module
const rolesModule: ModuleSidebarConfig = {
  moduleCode: 'roles',
  displayName: 'Roles',
  icon: 'Shield',
  basePath: '/roles',
  order: 2,
  subItems: [
    { title: 'Create Role', path: '/roles/create', action: 'create' },
  ],
};

// Permissions Module
const permissionsModule: ModuleSidebarConfig = {
  moduleCode: 'permissions',
  displayName: 'Permissions',
  icon: 'Key',
  basePath: '/permissions',
  order: 3,
};

// Students Module
const studentsModule: ModuleSidebarConfig = {
  moduleCode: 'students',
  displayName: 'Students',
  icon: 'GraduationCap',
  basePath: '/students',
  order: 1,
  subItems: [
    { title: 'Add Student', path: '/students/create', action: 'create' },
    { title: 'Bulk Upload', path: '/students/bulk-upload', action: 'create' },
    { title: 'Promotion', path: '/students/promotion', action: 'view' },
    { title: 'Transfer', path: '/students/transfer', action: 'update' },
    { title: 'Export', path: '/students/export', action: 'export' },
  ],
};

// Parents Module
const parentsModule: ModuleSidebarConfig = {
  moduleCode: 'parents',
  displayName: 'Parents',
  icon: 'Users',
  basePath: '/parents',
  order: 2,
  subItems: [
    { title: 'Add Parent', path: '/parents/create', action: 'create' },
  ],
};

// Teachers Module
const teachersModule: ModuleSidebarConfig = {
  moduleCode: 'teachers',
  displayName: 'Teachers',
  icon: 'BookOpen',
  basePath: '/teachers',
  order: 3,
  subItems: [
    { title: 'Add Teacher', path: '/teachers/create', action: 'create' },
    { title: 'Bulk Upload', path: '/teachers/bulk-upload', action: 'create' },
    { title: 'Export', path: '/teachers/export', action: 'export' },
  ],
};

// Employees Module
const employeesModule: ModuleSidebarConfig = {
  moduleCode: 'employees',
  displayName: 'Employees',
  icon: 'Briefcase',
  basePath: '/employees',
  order: 4,
  subItems: [
    { title: 'Add Employee', path: '/employees/create', action: 'create' },
    { title: 'Bulk Upload', path: '/employees/bulk-upload', action: 'create' },
    { title: 'Export', path: '/employees/export', action: 'export' },
  ],
};

// Academic Years Module
const academicYearsModule: ModuleSidebarConfig = {
  moduleCode: 'academic_years',
  displayName: 'Academic Years',
  icon: 'Calendar',
  basePath: '/academic-years',
  order: 1,
  subItems: [
    { title: 'Create Year', path: '/academic-years/create', action: 'create' },
  ],
};

// Classes Module
const classesModule: ModuleSidebarConfig = {
  moduleCode: 'classes',
  displayName: 'Classes',
  icon: 'School',
  basePath: '/classes',
  order: 2,
  subItems: [
    { title: 'Create Class', path: '/classes/create', action: 'create' },
  ],
};

// Sections Module
const sectionsModule: ModuleSidebarConfig = {
  moduleCode: 'sections',
  displayName: 'Sections',
  icon: 'Layout',
  basePath: '/sections',
  order: 3,
  subItems: [
    { title: 'Create Section', path: '/sections/create', action: 'create' },
  ],
};

// Subjects Module
const subjectsModule: ModuleSidebarConfig = {
  moduleCode: 'subjects',
  displayName: 'Subjects',
  icon: 'Book',
  basePath: '/subjects',
  order: 4,
  subItems: [
    { title: 'Create Subject', path: '/subjects/create', action: 'create' },
  ],
};

// Topics Module
const topicsModule: ModuleSidebarConfig = {
  moduleCode: 'topics',
  displayName: 'Topics',
  icon: 'FileText',
  basePath: '/topics',
  order: 5,
  subItems: [
    { title: 'Create Topic', path: '/topics/create', action: 'create' },
  ],
};

// Student Attendance Module
const attendanceModule: ModuleSidebarConfig = {
  moduleCode: 'attendance',
  displayName: 'Student Attendance',
  icon: 'CheckSquare',
  basePath: '/attendance',
  order: 1,
  subItems: [
    { title: 'Mark Attendance', path: '/attendance/mark', action: 'create' },
    { title: 'View Records', path: '/attendance/view', action: 'view' },
    { title: 'Reports', path: '/attendance/reports', action: 'view' },
    { title: 'Subject-wise', path: '/attendance/subject-wise', action: 'create' },
    { title: 'Export', path: '/attendance/export', action: 'export' },
  ],
};

// Staff Attendance Module
const staffAttendanceModule: ModuleSidebarConfig = {
  moduleCode: 'staff_attendance',
  displayName: 'Staff Attendance',
  icon: 'CheckSquare',
  basePath: '/staff/attendance',
  order: 2,
  subItems: [
    { title: 'Mark Attendance', path: '/staff/attendance/mark', action: 'create' },
    { title: 'View Records', path: '/staff/attendance/view', action: 'view' },
    { title: 'Reports', path: '/staff/attendance/reports', action: 'view' },
    { title: 'Export', path: '/staff/attendance/export', action: 'export' },
  ],
};

// Student Leave Module
const leaveModule: ModuleSidebarConfig = {
  moduleCode: 'leave',
  displayName: 'Student Leave',
  icon: 'Calendar',
  basePath: '/leave-requests',
  order: 3,
  subItems: [
    { title: 'Apply Leave', path: '/leave-requests/create', action: 'create' },
  ],
};

// Staff Leave Module
const staffLeaveModule: ModuleSidebarConfig = {
  moduleCode: 'staff_leave',
  displayName: 'Staff Leave',
  icon: 'Calendar',
  basePath: '/staff/leave',
  order: 4,
  subItems: [
    { title: 'Apply Leave', path: '/staff/leave/apply', action: 'create' },
    { title: 'My Leaves', path: '/staff/leave/my-leaves', action: 'view' },
    { title: 'Leave Balance', path: '/staff/leave/balance', action: 'view' },
  ],
};

// Timetable Module
const timetableModule: ModuleSidebarConfig = {
  moduleCode: 'timetable',
  displayName: 'Timetable',
  icon: 'Clock',
  basePath: '/timetable',
  order: 1,
  subItems: [
    { title: 'Create Timetable', path: '/timetable/create', action: 'create' },
    { title: 'Bulk Create', path: '/timetable/bulk-create', action: 'create' },
    { title: 'Conflicts', path: '/timetable/conflicts', action: 'view' },
    { title: 'Substitute', path: '/timetable/substitute', action: 'update' },
    { title: 'Export', path: '/timetable/export', action: 'export' },
  ],
};

// My Timetable (for students/teachers)
const myTimetableModule: ModuleSidebarConfig = {
  moduleCode: 'timetable',
  displayName: 'My Timetable',
  icon: 'Clock',
  basePath: '/my-timetable',
  order: 2,
};

// Lecture Templates Module
const lectureTemplatesModule: ModuleSidebarConfig = {
  moduleCode: 'lecture_templates',
  displayName: 'Lecture Templates',
  icon: 'Layout',
  basePath: '/lecture-templates',
  order: 3,
  subItems: [
    { title: 'Create Template', path: '/lecture-templates/create', action: 'create' },
  ],
};

// Exams Module
const examsModule: ModuleSidebarConfig = {
  moduleCode: 'exams',
  displayName: 'Exams',
  icon: 'ClipboardList',
  basePath: '/exams',
  order: 1,
  subItems: [
    { title: 'Create Exam', path: '/exams/create', action: 'create' },
    { title: 'All Exams', path: '/exams/list', action: 'view' },
    { title: 'Export', path: '/exams/export', action: 'export' },
  ],
};

// Marks Module
const marksModule: ModuleSidebarConfig = {
  moduleCode: 'marks',
  displayName: 'Marks Entry',
  icon: 'Edit',
  basePath: '/exams',
  order: 2,
};

// Report Cards Module
const reportCardsModule: ModuleSidebarConfig = {
  moduleCode: 'report_cards',
  displayName: 'Report Cards',
  icon: 'FileText',
  basePath: '/report-cards',
  order: 3,
  subItems: [
    { title: 'Templates', path: '/report-cards/templates', action: 'update' },
  ],
};

// Fees Module
const feesModule: ModuleSidebarConfig = {
  moduleCode: 'fees',
  displayName: 'Fee Management',
  icon: 'DollarSign',
  basePath: '/fees',
  order: 1,
  subItems: [
    { title: 'Fee Structures', path: '/fees/structures', action: 'view' },
    { title: 'Collect Fee', path: '/fees/collect', action: 'create' },
    { title: 'Receipts', path: '/fees/receipts', action: 'view' },
    { title: 'Defaulters', path: '/fees/defaulters', action: 'view' },
    { title: 'Discounts', path: '/fees/discounts', action: 'view' },
    { title: 'Reports', path: '/fees/reports', action: 'view' },
    { title: 'Export', path: '/fees/export', action: 'export' },
  ],
};

// Announcements Module
const announcementsModule: ModuleSidebarConfig = {
  moduleCode: 'announcements',
  displayName: 'Announcements',
  icon: 'Megaphone',
  basePath: '/announcements',
  order: 1,
  subItems: [
    { title: 'Create', path: '/announcements/create', action: 'create' },
  ],
};

// Notifications Module
const notificationsModule: ModuleSidebarConfig = {
  moduleCode: 'notifications',
  displayName: 'Notifications',
  icon: 'Bell',
  basePath: '/notifications',
  order: 2,
  subItems: [
    { title: 'Send', path: '/notifications/send', action: 'create' },
  ],
};

// Messages Module
const messagesModule: ModuleSidebarConfig = {
  moduleCode: 'messages',
  displayName: 'Messages',
  icon: 'Mail',
  basePath: '/messages',
  order: 3,
  subItems: [
    { title: 'Compose', path: '/messages/compose', action: 'create' },
    { title: 'Send SMS', path: '/messages/sms', action: 'create' },
    { title: 'Send Email', path: '/messages/email', action: 'create' },
    { title: 'Templates', path: '/messages/templates', action: 'view' },
    { title: 'History', path: '/messages/history', action: 'view' },
  ],
};

// Settings Module
const settingsModule: ModuleSidebarConfig = {
  moduleCode: 'settings',
  displayName: 'Settings',
  icon: 'Settings',
  basePath: '/settings',
  order: 1,
  subItems: [
    { title: 'School Info', path: '/settings/school', action: 'update' },
    { title: 'Academic', path: '/settings/academic', action: 'update' },
    { title: 'Fee Settings', path: '/settings/fees', action: 'update' },
    { title: 'Communication', path: '/settings/communication', action: 'update' },
  ],
};

// ID Cards Module
const idCardsModule: ModuleSidebarConfig = {
  moduleCode: 'id_cards',
  displayName: 'ID Cards',
  icon: 'CreditCard',
  basePath: '/id-cards',
  order: 2,
  subItems: [
    { title: 'Student IDs', path: '/id-cards/students', action: 'view' },
    { title: 'Staff IDs', path: '/id-cards/staff', action: 'view' },
    { title: 'Templates', path: '/id-cards/templates', action: 'update' },
  ],
};

// Reports Module
const reportsModule: ModuleSidebarConfig = {
  moduleCode: 'reports',
  displayName: 'Reports',
  icon: 'BarChart',
  basePath: '/reports',
  order: 3,
  subItems: [
    { title: 'Student Reports', path: '/reports/students', action: 'view' },
    { title: 'Attendance', path: '/reports/attendance', action: 'view' },
    { title: 'Academic', path: '/reports/academic', action: 'view' },
    { title: 'Financial', path: '/reports/financial', action: 'view' },
    { title: 'Staff', path: '/reports/staff', action: 'view' },
    { title: 'Custom', path: '/reports/custom', action: 'create' },
  ],
};

// Parent Portal Module
const parentPortalModule: ModuleSidebarConfig = {
  moduleCode: 'parent',
  displayName: 'Parent Portal',
  icon: 'Home',
  basePath: '/parent/dashboard',
  order: 1,
  subItems: [
    { title: 'My Children', path: '/parent/children', action: 'view' },
    { title: 'Pay Fees', path: '/parent/fee-payment', action: 'create' },
  ],
};

// ==========================================
// TIER 2 MODULES
// ==========================================

// Assignments Module
const assignmentsModule: ModuleSidebarConfig = {
  moduleCode: 'assignments',
  displayName: 'Assignments',
  icon: 'FileEdit',
  basePath: '/assignments',
  order: 1,
  subItems: [
    { title: 'Create', path: '/assignments/create', action: 'create' },
    { title: 'My Assignments', path: '/assignments/my-assignments', action: 'view' },
  ],
};

// Study Materials Module
const studyMaterialsModule: ModuleSidebarConfig = {
  moduleCode: 'study_materials',
  displayName: 'Study Materials',
  icon: 'BookOpen',
  basePath: '/study-materials',
  order: 2,
  subItems: [
    { title: 'Upload', path: '/study-materials/upload', action: 'create' },
  ],
};

// Online Classes Module
const onlineClassesModule: ModuleSidebarConfig = {
  moduleCode: 'online_classes',
  displayName: 'Online Classes',
  icon: 'Video',
  basePath: '/online-classes',
  order: 3,
  subItems: [
    { title: 'Schedule', path: '/online-classes/schedule', action: 'create' },
    { title: 'My Classes', path: '/online-classes/my-classes', action: 'view' },
  ],
};

// Homework Module
const homeworkModule: ModuleSidebarConfig = {
  moduleCode: 'homework',
  displayName: 'Homework',
  icon: 'ClipboardCheck',
  basePath: '/homework',
  order: 4,
  subItems: [
    { title: 'Create', path: '/homework/create', action: 'create' },
    { title: 'My Homework', path: '/homework/my-homework', action: 'view' },
  ],
};

// Doubts Module
const doubtsModule: ModuleSidebarConfig = {
  moduleCode: 'doubts',
  displayName: 'Doubts',
  icon: 'HelpCircle',
  basePath: '/doubts',
  order: 5,
  subItems: [
    { title: 'Ask Doubt', path: '/doubts/ask', action: 'create' },
    { title: 'My Doubts', path: '/doubts/my-doubts', action: 'view' },
  ],
};

// Transport Module
const transportModule: ModuleSidebarConfig = {
  moduleCode: 'transport',
  displayName: 'Transport',
  icon: 'Bus',
  basePath: '/transport',
  order: 1,
  subItems: [
    { title: 'Routes', path: '/transport/routes', action: 'view' },
    { title: 'Vehicles', path: '/transport/vehicles', action: 'view' },
    { title: 'Drivers', path: '/transport/drivers', action: 'view' },
    { title: 'Assignments', path: '/transport/assignments', action: 'view' },
    { title: 'Live Tracking', path: '/transport/tracking', action: 'view' },
  ],
};

// Payroll Module
const payrollModule: ModuleSidebarConfig = {
  moduleCode: 'payroll',
  displayName: 'Payroll',
  icon: 'Wallet',
  basePath: '/payroll',
  order: 1,
  subItems: [
    { title: 'Salary Structures', path: '/payroll/structures', action: 'view' },
    { title: 'Process Payroll', path: '/payroll/process', action: 'create' },
    { title: 'Payslips', path: '/payroll/payslips', action: 'view' },
    { title: 'My Payslips', path: '/payroll/my-payslips', action: 'view' },
  ],
};

// Appraisals Module
const appraisalsModule: ModuleSidebarConfig = {
  moduleCode: 'appraisals',
  displayName: 'Appraisals',
  icon: 'Star',
  basePath: '/appraisals',
  order: 2,
  subItems: [
    { title: 'Create', path: '/appraisals/create', action: 'create' },
    { title: 'My Appraisals', path: '/appraisals/my-appraisals', action: 'view' },
  ],
};

// Recruitment Module
const recruitmentModule: ModuleSidebarConfig = {
  moduleCode: 'recruitment',
  displayName: 'Recruitment',
  icon: 'UserPlus',
  basePath: '/recruitment',
  order: 3,
  subItems: [
    { title: 'Job Postings', path: '/recruitment/jobs', action: 'view' },
    { title: 'Applications', path: '/recruitment/applications', action: 'view' },
    { title: 'Interviews', path: '/recruitment/interviews', action: 'create' },
  ],
};

// Feedback Module
const feedbackModule: ModuleSidebarConfig = {
  moduleCode: 'feedback',
  displayName: 'Feedback',
  icon: 'MessageCircle',
  basePath: '/feedback',
  order: 1,
  subItems: [
    { title: 'Submit', path: '/feedback/submit', action: 'create' },
    { title: 'Forms', path: '/feedback/forms', action: 'view' },
  ],
};

// Grievances Module
const grievancesModule: ModuleSidebarConfig = {
  moduleCode: 'grievances',
  displayName: 'Grievances',
  icon: 'AlertTriangle',
  basePath: '/grievances',
  order: 2,
  subItems: [
    { title: 'Submit', path: '/grievances/submit', action: 'create' },
    { title: 'My Grievances', path: '/grievances/my-grievances', action: 'view' },
  ],
};

// Support Module
const supportModule: ModuleSidebarConfig = {
  moduleCode: 'support',
  displayName: 'Support',
  icon: 'LifeBuoy',
  basePath: '/support',
  order: 3,
  subItems: [
    { title: 'Create Ticket', path: '/support/create', action: 'create' },
    { title: 'My Tickets', path: '/support/my-tickets', action: 'view' },
  ],
};

// ==========================================
// TIER 3 MODULES
// ==========================================

// Analytics Module
const analyticsModule: ModuleSidebarConfig = {
  moduleCode: 'analytics',
  displayName: 'Analytics',
  icon: 'TrendingUp',
  basePath: '/analytics',
  order: 1,
  subItems: [
    { title: 'Students', path: '/analytics/students', action: 'view' },
    { title: 'Attendance', path: '/analytics/attendance', action: 'view' },
    { title: 'Financial', path: '/analytics/financial', action: 'view' },
    { title: 'Academic', path: '/analytics/academic', action: 'view' },
    { title: 'Predictions', path: '/analytics/predictions', action: 'view' },
    { title: 'Export', path: '/analytics/export', action: 'export' },
  ],
};

// PTM Module
const ptmModule: ModuleSidebarConfig = {
  moduleCode: 'ptm',
  displayName: 'PTM',
  icon: 'Users',
  basePath: '/ptm',
  order: 1,
  subItems: [
    { title: 'Schedule', path: '/ptm/schedule', action: 'view' },
    { title: 'Manage Slots', path: '/ptm/slots', action: 'create' },
    { title: 'Bookings', path: '/ptm/bookings', action: 'view' },
    { title: 'My Bookings', path: '/ptm/my-bookings', action: 'view' },
  ],
};

// Alumni Module
const alumniModule: ModuleSidebarConfig = {
  moduleCode: 'alumni',
  displayName: 'Alumni',
  icon: 'GraduationCap',
  basePath: '/alumni',
  order: 2,
  subItems: [
    { title: 'Register', path: '/alumni/register', action: 'create' },
    { title: 'Events', path: '/alumni/events', action: 'view' },
    { title: 'Donations', path: '/alumni/donations', action: 'view' },
  ],
};

// Admissions Module
const admissionsModule: ModuleSidebarConfig = {
  moduleCode: 'admissions',
  displayName: 'Admissions',
  icon: 'UserPlus',
  basePath: '/admissions',
  order: 1,
  subItems: [
    { title: 'Applications', path: '/admissions/applications', action: 'view' },
    { title: 'New Application', path: '/admissions/apply', action: 'create' },
    { title: 'Entrance Tests', path: '/admissions/entrance-tests', action: 'view' },
    { title: 'Interviews', path: '/admissions/interviews', action: 'view' },
  ],
};

// Inventory Module
const inventoryModule: ModuleSidebarConfig = {
  moduleCode: 'inventory',
  displayName: 'Inventory',
  icon: 'Package',
  basePath: '/inventory',
  order: 1,
  subItems: [
    { title: 'All Items', path: '/inventory/items', action: 'view' },
    { title: 'Categories', path: '/inventory/categories', action: 'view' },
    { title: 'Issue Item', path: '/inventory/issue', action: 'create' },
    { title: 'Issued Items', path: '/inventory/issued', action: 'view' },
    { title: 'Stock Report', path: '/inventory/stock', action: 'view' },
    { title: 'Library', path: '/inventory/library', action: 'view' },
  ],
};

// Certificates Module
const certificatesModule: ModuleSidebarConfig = {
  moduleCode: 'certificates',
  displayName: 'Certificates',
  icon: 'Award',
  basePath: '/certificates',
  order: 2,
  subItems: [
    { title: 'Generate', path: '/certificates/generate', action: 'create' },
    { title: 'Templates', path: '/certificates/templates', action: 'view' },
    { title: 'Issued', path: '/certificates/issued', action: 'view' },
    { title: 'Bulk Generate', path: '/certificates/bulk-generate', action: 'create' },
  ],
};

// Surveys Module
const surveysModule: ModuleSidebarConfig = {
  moduleCode: 'surveys',
  displayName: 'Surveys',
  icon: 'ClipboardList',
  basePath: '/surveys',
  order: 3,
  subItems: [
    { title: 'Create', path: '/surveys/create', action: 'create' },
  ],
};

// Branches Module
const branchesModule: ModuleSidebarConfig = {
  moduleCode: 'branches',
  displayName: 'Branches',
  icon: 'Building',
  basePath: '/branches',
  order: 1,
  subItems: [
    { title: 'Create Branch', path: '/branches/create', action: 'create' },
    { title: 'Switch Branch', path: '/branches/switch', action: 'update' },
  ],
};


// ==========================================
// SIDEBAR GROUPS
// ==========================================

export const sidebarGroups: SidebarGroup[] = [
  // ----------------------------------------
  // ALWAYS VISIBLE
  // ----------------------------------------
  {
    id: 'main',
    groupName: 'Main',
    icon: 'Home',
    order: 0,
    tier: 1,
    alwaysVisible: true,
    modules: [dashboardModule, profileModule],
  },

  // ----------------------------------------
  // TIER 1 GROUPS
  // ----------------------------------------
  {
    id: 'user-management',
    groupName: 'User Management',
    icon: 'Users',
    order: 1,
    tier: 1,
    modules: [usersModule, rolesModule, permissionsModule],
  },
  {
    id: 'people',
    groupName: 'People',
    icon: 'UserCircle',
    order: 2,
    tier: 1,
    modules: [studentsModule, parentsModule, teachersModule, employeesModule],
  },
  {
    id: 'academic-structure',
    groupName: 'Academic Structure',
    icon: 'Building2',
    order: 3,
    tier: 1,
    modules: [academicYearsModule, classesModule, sectionsModule, subjectsModule, topicsModule],
  },
  {
    id: 'attendance',
    groupName: 'Attendance',
    icon: 'CheckSquare',
    order: 4,
    tier: 1,
    modules: [attendanceModule, staffAttendanceModule, leaveModule, staffLeaveModule],
  },
  {
    id: 'timetable',
    groupName: 'Timetable',
    icon: 'Clock',
    order: 5,
    tier: 1,
    modules: [timetableModule, myTimetableModule, lectureTemplatesModule],
  },
  {
    id: 'examinations',
    groupName: 'Examinations',
    icon: 'ClipboardList',
    order: 6,
    tier: 1,
    modules: [examsModule, marksModule, reportCardsModule],
  },
  {
    id: 'finance',
    groupName: 'Finance',
    icon: 'DollarSign',
    order: 7,
    tier: 1,
    modules: [feesModule],
  },
  {
    id: 'communication',
    groupName: 'Communication',
    icon: 'MessageSquare',
    order: 8,
    tier: 1,
    modules: [announcementsModule, notificationsModule, messagesModule],
  },
  {
    id: 'settings-reports',
    groupName: 'Settings & Reports',
    icon: 'Settings',
    order: 9,
    tier: 1,
    modules: [settingsModule, idCardsModule, reportsModule],
  },
  {
    id: 'parent-portal',
    groupName: 'Parent Portal',
    icon: 'Home',
    order: 10,
    tier: 1,
    modules: [parentPortalModule],
  },

  // ----------------------------------------
  // TIER 2 GROUPS
  // ----------------------------------------
  {
    id: 'learning',
    groupName: 'Learning',
    icon: 'BookOpen',
    order: 11,
    tier: 2,
    modules: [assignmentsModule, studyMaterialsModule, onlineClassesModule, homeworkModule, doubtsModule],
  },
  {
    id: 'transport',
    groupName: 'Transport',
    icon: 'Bus',
    order: 12,
    tier: 2,
    modules: [transportModule],
  },
  {
    id: 'hr',
    groupName: 'HR & Payroll',
    icon: 'Briefcase',
    order: 13,
    tier: 2,
    modules: [payrollModule, appraisalsModule, recruitmentModule],
  },
  {
    id: 'support-feedback',
    groupName: 'Support & Feedback',
    icon: 'LifeBuoy',
    order: 14,
    tier: 2,
    modules: [feedbackModule, grievancesModule, supportModule],
  },

  // ----------------------------------------
  // TIER 3 GROUPS
  // ----------------------------------------
  {
    id: 'analytics',
    groupName: 'Analytics',
    icon: 'TrendingUp',
    order: 15,
    tier: 3,
    modules: [analyticsModule],
  },
  {
    id: 'engagement',
    groupName: 'Engagement',
    icon: 'Users',
    order: 16,
    tier: 3,
    modules: [ptmModule, alumniModule],
  },
  {
    id: 'admissions',
    groupName: 'Admissions',
    icon: 'UserPlus',
    order: 17,
    tier: 3,
    modules: [admissionsModule],
  },
  {
    id: 'assets',
    groupName: 'Assets & Inventory',
    icon: 'Package',
    order: 18,
    tier: 3,
    modules: [inventoryModule, certificatesModule, surveysModule],
  },
  {
    id: 'multi-branch',
    groupName: 'Multi-Branch',
    icon: 'Building',
    order: 19,
    tier: 3,
    modules: [branchesModule],
  },
];


// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get all sidebar groups
 */
export function getAllSidebarGroups(): SidebarGroup[] {
  return sidebarGroups.sort((a, b) => a.order - b.order);
}

/**
 * Get sidebar groups by tier
 */
export function getSidebarGroupsByTier(tier: 1 | 2 | 3): SidebarGroup[] {
  return sidebarGroups.filter(group => group.tier === tier).sort((a, b) => a.order - b.order);
}

/**
 * Get always-visible groups
 */
export function getAlwaysVisibleGroups(): SidebarGroup[] {
  return sidebarGroups.filter(group => group.alwaysVisible === true);
}

/**
 * Find a module by its code
 */
export function findModuleConfig(moduleCode: string): ModuleSidebarConfig | undefined {
  for (const group of sidebarGroups) {
    const module = group.modules.find(m => m.moduleCode === moduleCode);
    if (module) return module;
  }
  return undefined;
}

/**
 * Get the group that contains a specific module
 */
export function getGroupForModule(moduleCode: string): SidebarGroup | undefined {
  return sidebarGroups.find(group => 
    group.modules.some(m => m.moduleCode === moduleCode)
  );
}


// ==========================================
// STATISTICS
// ==========================================
export const SIDEBAR_STATS = {
  totalGroups: sidebarGroups.length,
  tier1Groups: getSidebarGroupsByTier(1).length,
  tier2Groups: getSidebarGroupsByTier(2).length,
  tier3Groups: getSidebarGroupsByTier(3).length,
  totalModules: sidebarGroups.reduce((sum, group) => sum + group.modules.length, 0),
};
