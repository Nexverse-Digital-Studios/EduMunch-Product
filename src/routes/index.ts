/**
 * EduMunch Routes - Central Export
 * ==================================
 * 
 * This file exports all route configurations, sidebar settings,
 * and helper functions from a single location.
 * 
 * Usage:
 * import { allRoutes, sidebarGroups, getRouteConfig } from '@/routes';
 */

// ==========================================
// TYPE EXPORTS
// ==========================================
export type {
  PermissionAction,
  FeatureTier,
  RouteConfig,
  ModuleSidebarConfig,
  ModuleSubItem,
  SidebarGroup,
  ModulePermissions,
  UserPermissionCache,
  RouteMatch,
  PermissionCheckResult,
} from './types';

// ==========================================
// ROUTE CONFIGURATION EXPORTS
// ==========================================
export {
  // Individual module routes (Tier 1)
  dashboardRoutes,
  profileRoutes,
  userRoutes,
  roleRoutes,
  permissionRoutes,
  studentRoutes,
  parentRoutes,
  parentPortalRoutes,
  teacherRoutes,
  employeeRoutes,
  attendanceRoutes,
  staffAttendanceRoutes,
  leaveRoutes,
  staffLeaveRoutes,
  academicYearRoutes,
  classRoutes,
  sectionRoutes,
  subjectRoutes,
  topicRoutes,
  timetableRoutes,
  lectureTemplateRoutes,
  examRoutes,
  marksRoutes,
  reportCardRoutes,
  feeRoutes,
  settingsRoutes,
  idCardRoutes,
  reportsRoutes,
  announcementRoutes,
  notificationRoutes,
  messageRoutes,
  authRoutes,
  commonRoutes,
  
  // Individual module routes (Tier 2)
  assignmentRoutes,
  studyMaterialRoutes,
  onlineClassRoutes,
  homeworkRoutes,
  doubtRoutes,
  transportRoutes,
  payrollRoutes,
  appraisalRoutes,
  recruitmentRoutes,
  feedbackRoutes,
  grievanceRoutes,
  supportRoutes,
  
  // Individual module routes (Tier 3)
  analyticsRoutes,
  ptmRoutes,
  alumniRoutes,
  admissionRoutes,
  inventoryRoutes,
  certificateRoutes,
  surveyRoutes,
  branchRoutes,
  
  // Combined route arrays
  tier1Routes,
  tier2Routes,
  tier3Routes,
  allRoutes,
  
  // Helper functions
  getRouteConfig,
  getModuleRoutes,
  getSidebarRoutes,
  getRoutesByTier,
  getPublicRoutes,
  getProtectedRoutes,
  matchRoutePath,
  findRouteForPath,
  
  // Statistics
  ROUTE_STATS,
} from './routeConfig';

// ==========================================
// SIDEBAR CONFIGURATION EXPORTS
// ==========================================
export {
  // Sidebar groups
  sidebarGroups,
  
  // Helper functions
  getAllSidebarGroups,
  getSidebarGroupsByTier,
  getAlwaysVisibleGroups,
  findModuleConfig,
  getGroupForModule,
  
  // Statistics
  SIDEBAR_STATS,
} from './sidebarConfig';
