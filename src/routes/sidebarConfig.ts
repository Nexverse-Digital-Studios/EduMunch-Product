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
// CONSOLIDATED: Edit, Change Password, Notifications are tabs within the main ProfilePage
const profileModule: ModuleSidebarConfig = {
  moduleCode: 'profile',
  displayName: 'My Profile',
  icon: 'User',
  basePath: '/profile',
  order: 2,
  // No subItems - all functionality is accessible via tabs on the main profile page
};

// Users Module
// CONSOLIDATED: Add User, Bulk Upload are modals/dialogs accessible from the main Users page
const usersModule: ModuleSidebarConfig = {
  moduleCode: 'users',
  displayName: 'Users',
  icon: 'Users',
  basePath: '/users',
  order: 1,
  // No subItems - all actions accessible via buttons on the main page
};

// Roles Module
// CONSOLIDATED: Create Role is a modal/dialog accessible from the main Roles page
const rolesModule: ModuleSidebarConfig = {
  moduleCode: 'roles',
  displayName: 'Roles',
  icon: 'Shield',
  basePath: '/roles',
  order: 2,
  // No subItems - all actions accessible via buttons on the main page
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
// Students Module (CONSOLIDATED - subItems removed, actions via modals/buttons)
const studentsModule: ModuleSidebarConfig = {
  moduleCode: 'students',
  displayName: 'Students',
  icon: 'GraduationCap',
  basePath: '/students',
  order: 1,
  // CONSOLIDATED: Create, Bulk Upload, Promotion, Transfer, Export now handled via modals/buttons in StudentsList
};

// Parents Module (CONSOLIDATED - subItems removed, all CRUD via modals)
const parentsModule: ModuleSidebarConfig = {
  moduleCode: 'parents',
  displayName: 'Parents',
  icon: 'Users',
  basePath: '/parents',
  order: 2,
  // CONSOLIDATED: Create/Edit now handled via modals in ParentsList
};

// Teachers Module (CONSOLIDATED - subItems removed, actions via modals/buttons)
const teachersModule: ModuleSidebarConfig = {
  moduleCode: 'teachers',
  displayName: 'Teachers',
  icon: 'BookOpen',
  basePath: '/teachers',
  order: 3,
  // CONSOLIDATED: Create, Bulk Upload, Export now handled via modals/buttons in TeachersList
};

// Employees Module (CONSOLIDATED - subItems removed, all CRUD via modals)
const employeesModule: ModuleSidebarConfig = {
  moduleCode: 'employees',
  displayName: 'Employees',
  icon: 'Briefcase',
  basePath: '/employees',
  order: 4,
  // CONSOLIDATED: Create, Bulk Upload, Export now handled via modals/buttons in EmployeesList
};

// Academic Years Module
const academicYearsModule: ModuleSidebarConfig = {
  moduleCode: 'academic_years',
  displayName: 'Academic Years',
  icon: 'Calendar',
  basePath: '/academic-years',
  order: 1,
  // CONSOLIDATED: Create/Edit handled via modals in AcademicYearsList
};

// Classes Module
const classesModule: ModuleSidebarConfig = {
  moduleCode: 'classes',
  displayName: 'Classes',
  icon: 'School',
  basePath: '/classes',
  order: 2,
  // CONSOLIDATED: Create/Edit handled via modals in ClassesList
};

// Sections Module
const sectionsModule: ModuleSidebarConfig = {
  moduleCode: 'sections',
  displayName: 'Sections',
  icon: 'Layout',
  basePath: '/sections',
  order: 3,
  // CONSOLIDATED: Create/Edit handled via modals in SectionsList
};

// Subjects Module
const subjectsModule: ModuleSidebarConfig = {
  moduleCode: 'subjects',
  displayName: 'Subjects',
  icon: 'Book',
  basePath: '/subjects',
  order: 4,
  // CONSOLIDATED: Create/Edit handled via modals in SubjectsList
};

// Topics Module
const topicsModule: ModuleSidebarConfig = {
  moduleCode: 'topics',
  displayName: 'Topics',
  icon: 'FileText',
  basePath: '/topics',
  order: 5,
  // CONSOLIDATED: Create/Edit handled via modals in TopicsList
};

// Student Attendance Module
const attendanceModule: ModuleSidebarConfig = {
  moduleCode: 'attendance',
  displayName: 'Student Attendance',
  icon: 'CheckSquare',
  basePath: '/attendance',
  order: 1,
  // CONSOLIDATED: All sub-features now accessible via tabs on main dashboard
};

// Staff Attendance Module
const staffAttendanceModule: ModuleSidebarConfig = {
  moduleCode: 'staff_attendance',
  displayName: 'Staff Attendance',
  icon: 'CheckSquare',
  basePath: '/staff/attendance',
  order: 2,
  // CONSOLIDATED: All sub-features now accessible via tabs on main dashboard
};

// Student Leave Module
const leaveModule: ModuleSidebarConfig = {
  moduleCode: 'leave',
  displayName: 'Student Leave',
  icon: 'Calendar',
  basePath: '/leave-requests',
  order: 3,
  // CONSOLIDATED: Create/Edit via modal, no sub-items needed
};

// Staff Leave Module
const staffLeaveModule: ModuleSidebarConfig = {
  moduleCode: 'staff_leave',
  displayName: 'Staff Leave',
  icon: 'Calendar',
  basePath: '/staff/leave',
  order: 4,
  // CONSOLIDATED: All features via tabs (My Leaves, Apply, Balance)
};

// Timetable Module
const timetableModule: ModuleSidebarConfig = {
  moduleCode: 'timetable',
  displayName: 'Timetable',
  icon: 'Clock',
  basePath: '/timetable',
  order: 1,
  // CONSOLIDATED: All features accessible via tabs on dashboard
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
  // CONSOLIDATED: Create/Edit via modal dialogs
};

// Exams Module (CONSOLIDATED: no subItems - create/edit via modals)
const examsModule: ModuleSidebarConfig = {
  moduleCode: 'exams',
  displayName: 'Exams',
  icon: 'ClipboardList',
  basePath: '/exams',
  order: 1,
};

// Marks Module (CONSOLIDATED: merged into Exam Detail page)
// const marksModule: ModuleSidebarConfig = {
//   moduleCode: 'marks',
//   displayName: 'Marks Entry',
//   icon: 'Edit',
//   basePath: '/exams',
//   order: 2,
// };

// Report Cards Module (CONSOLIDATED: no subItems)
const reportCardsModule: ModuleSidebarConfig = {
  moduleCode: 'report_cards',
  displayName: 'Report Cards',
  icon: 'FileText',
  basePath: '/report-cards',
  order: 3,
};

// Fees Module (CONSOLIDATED: no subItems - tabs in main page)
const feesModule: ModuleSidebarConfig = {
  moduleCode: 'fees',
  displayName: 'Fee Management',
  icon: 'DollarSign',
  basePath: '/fees',
  order: 1,
};

// Announcements Module (CONSOLIDATED: no subItems, modals used for create/edit)
const announcementsModule: ModuleSidebarConfig = {
  moduleCode: 'announcements',
  displayName: 'Announcements',
  icon: 'Megaphone',
  basePath: '/announcements',
  order: 1,
  subItems: [],
};

// Notifications Module (CONSOLIDATED: no subItems, all actions in single page)
const notificationsModule: ModuleSidebarConfig = {
  moduleCode: 'notifications',
  displayName: 'Notifications',
  icon: 'Bell',
  basePath: '/notifications',
  order: 2,
  subItems: [],
};

// Messages Module (CONSOLIDATED: no subItems, tabs used for compose/sms/email/templates/history)
const messagesModule: ModuleSidebarConfig = {
  moduleCode: 'messages',
  displayName: 'Messages',
  icon: 'Mail',
  basePath: '/messages',
  order: 3,
  subItems: [],
};

// Settings Module (CONSOLIDATED: no subItems, tabs within single page)
const settingsModule: ModuleSidebarConfig = {
  moduleCode: 'settings',
  displayName: 'Settings',
  icon: 'Settings',
  basePath: '/settings',
  order: 1,
  subItems: [],
};

// ID Cards Module (CONSOLIDATED: no subItems, tabs for Student/Staff/Templates)
const idCardsModule: ModuleSidebarConfig = {
  moduleCode: 'id_cards',
  displayName: 'ID Cards',
  icon: 'CreditCard',
  basePath: '/id-cards',
  order: 2,
  subItems: [],
};

// Reports Module (CONSOLIDATED: no subItems, report type selector in single page)
const reportsModule: ModuleSidebarConfig = {
  moduleCode: 'reports',
  displayName: 'Reports',
  icon: 'BarChart',
  basePath: '/reports',
  order: 3,
  subItems: [],
};

// Parent Portal Module (CONSOLIDATED: no subItems, children list on dashboard, details via tabs)
const parentPortalModule: ModuleSidebarConfig = {
  moduleCode: 'parent',
  displayName: 'Parent Portal',
  icon: 'Home',
  basePath: '/parent/dashboard',
  order: 1,
  subItems: [],
  // CONSOLIDATED: My Children list shown on dashboard, child details via /parent/children/:id with tabs
  // Pay Fees accessible via modal from dashboard or child's fees tab
};

// ==========================================
// TIER 2 MODULES
// ==========================================

// Assignments Module (CONSOLIDATED: no subItems, modals and tabs)
const assignmentsModule: ModuleSidebarConfig = {
  moduleCode: 'assignments',
  displayName: 'Assignments',
  icon: 'FileEdit',
  basePath: '/assignments',
  order: 1,
  subItems: [],
};

// Study Materials Module (CONSOLIDATED: no subItems, filters and modals)
const studyMaterialsModule: ModuleSidebarConfig = {
  moduleCode: 'study_materials',
  displayName: 'Study Materials',
  icon: 'BookOpen',
  basePath: '/study-materials',
  order: 2,
  subItems: [],
};

// Online Classes Module (CONSOLIDATED: no subItems, tabs for Schedule/My Classes)
const onlineClassesModule: ModuleSidebarConfig = {
  moduleCode: 'online_classes',
  displayName: 'Online Classes',
  icon: 'Video',
  basePath: '/online-classes',
  order: 3,
  subItems: [],
};

// Homework Module (CONSOLIDATED: no subItems, date filters and modals)
const homeworkModule: ModuleSidebarConfig = {
  moduleCode: 'homework',
  displayName: 'Homework',
  icon: 'ClipboardCheck',
  basePath: '/homework',
  order: 4,
  subItems: [],
};

// Doubts Module (CONSOLIDATED: no subItems, tabs for Ask/My Doubts)
const doubtsModule: ModuleSidebarConfig = {
  moduleCode: 'doubts',
  displayName: 'Doubts',
  icon: 'HelpCircle',
  basePath: '/doubts',
  order: 5,
  subItems: [],
};

// Transport Module (CONSOLIDATED: no subItems, tabs for Routes/Vehicles/Drivers/Assignments/Tracking)
const transportModule: ModuleSidebarConfig = {
  moduleCode: 'transport',
  displayName: 'Transport',
  icon: 'Bus',
  basePath: '/transport',
  order: 1,
  subItems: [],
};

// Payroll Module (CONSOLIDATED: no subItems, tabs for Structures/Process/Payslips)
const payrollModule: ModuleSidebarConfig = {
  moduleCode: 'payroll',
  displayName: 'Payroll',
  icon: 'Wallet',
  basePath: '/payroll',
  order: 1,
  subItems: [],
};

// Appraisals Module (CONSOLIDATED: no subItems, tabs for All/My Appraisals)
const appraisalsModule: ModuleSidebarConfig = {
  moduleCode: 'appraisals',
  displayName: 'Appraisals',
  icon: 'Star',
  basePath: '/appraisals',
  order: 2,
  subItems: [],
};

// Recruitment Module (CONSOLIDATED: no subItems, tabs for Jobs/Applications/Interviews)
const recruitmentModule: ModuleSidebarConfig = {
  moduleCode: 'recruitment',
  displayName: 'Recruitment',
  icon: 'UserPlus',
  basePath: '/recruitment',
  order: 3,
  subItems: [],
};

// Feedback Module (CONSOLIDATED: no subItems, tabs/modals in single page)
const feedbackModule: ModuleSidebarConfig = {
  moduleCode: 'feedback',
  displayName: 'Feedback',
  icon: 'MessageCircle',
  basePath: '/feedback',
  order: 1,
  subItems: [],
};

// Grievances Module (CONSOLIDATED: no subItems, tabs/modals in single page)
const grievancesModule: ModuleSidebarConfig = {
  moduleCode: 'grievances',
  displayName: 'Grievances',
  icon: 'AlertTriangle',
  basePath: '/grievances',
  order: 2,
  subItems: [],
};

// Support Module (CONSOLIDATED: no subItems, tabs/modals in single page)
const supportModule: ModuleSidebarConfig = {
  moduleCode: 'support',
  displayName: 'Support',
  icon: 'LifeBuoy',
  basePath: '/support',
  order: 3,
  subItems: [],
};

// ==========================================
// TIER 3 MODULES
// ==========================================

// Analytics Module (CONSOLIDATED - tabs for analytics types)
const analyticsModule: ModuleSidebarConfig = {
  moduleCode: 'analytics',
  displayName: 'Analytics',
  icon: 'TrendingUp',
  basePath: '/analytics',
  order: 1,
  subItems: [], // CONSOLIDATED: Students/Attendance/Financial/Academic/Predictions/Export → tabs
};

// PTM Module (CONSOLIDATED - tabs for schedule/slots/bookings)
const ptmModule: ModuleSidebarConfig = {
  moduleCode: 'ptm',
  displayName: 'PTM',
  icon: 'Users',
  basePath: '/ptm',
  order: 1,
  subItems: [], // CONSOLIDATED: Schedule/Slots/Bookings/My Bookings → tabs
};

// Alumni Module (CONSOLIDATED - tabs for list/events/donations)
const alumniModule: ModuleSidebarConfig = {
  moduleCode: 'alumni',
  displayName: 'Alumni',
  icon: 'GraduationCap',
  basePath: '/alumni',
  order: 2,
  subItems: [], // CONSOLIDATED: Register/Events/Donations → tabs/modals
};

// Admissions Module (CONSOLIDATED - tabs for applications/tests/interviews)
const admissionsModule: ModuleSidebarConfig = {
  moduleCode: 'admissions',
  displayName: 'Admissions',
  icon: 'UserPlus',
  basePath: '/admissions',
  order: 1,
  subItems: [], // CONSOLIDATED: Applications/New/Tests/Interviews → tabs/modals
};

// Inventory Module (CONSOLIDATED - tabs for items/categories/issued/library)
const inventoryModule: ModuleSidebarConfig = {
  moduleCode: 'inventory',
  displayName: 'Inventory',
  icon: 'Package',
  basePath: '/inventory',
  order: 1,
  subItems: [], // CONSOLIDATED: Items/Categories/Issue/Issued/Stock/Library → tabs
};

// Certificates Module (CONSOLIDATED - tabs for generate/templates/issued)
const certificatesModule: ModuleSidebarConfig = {
  moduleCode: 'certificates',
  displayName: 'Certificates',
  icon: 'Award',
  basePath: '/certificates',
  order: 2,
  subItems: [], // CONSOLIDATED: Generate/Templates/Issued/Bulk → tabs/modals
};

// Surveys Module (CONSOLIDATED - modals for create/edit/respond)
const surveysModule: ModuleSidebarConfig = {
  moduleCode: 'surveys',
  displayName: 'Surveys',
  icon: 'ClipboardList',
  basePath: '/surveys',
  order: 3,
  subItems: [], // CONSOLIDATED: Create → modal
};

// Branches Module (CONSOLIDATED - modals for CRUD)
const branchesModule: ModuleSidebarConfig = {
  moduleCode: 'branches',
  displayName: 'Branches',
  icon: 'Building',
  basePath: '/branches',
  order: 1,
  subItems: [], // CONSOLIDATED: Create/Switch → modals
};


// ==========================================
// SIDEBAR GROUPS
// ==========================================

export const sidebarGroups: SidebarGroup[] = [

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
    modules: [examsModule, /* marksModule, */ reportCardsModule],
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
