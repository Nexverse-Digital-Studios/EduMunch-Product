/**
 * EduMunch App Router (Refactored)
 * =================================
 *
 * Main application router with:
 * - Centralized route configuration from @/routes
 * - Dynamic route generation based on route config
 * - Feature-based route registration
 * - Permission-based access control
 * - Lazy loading with Suspense for code splitting
 *
 * This file has been refactored from ~1900 lines to ~400 lines
 * by using the centralized route configuration.
 */

import { Suspense, lazy, ComponentType } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/contexts/AuthContext";
import { PermissionProvider } from "@/contexts/PermissionContext";
import { SidebarConfigProvider } from "@/contexts/SidebarConfigContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import { FEATURES } from "@/config/features.config";

// Centralized route configuration
import { allRoutes, RouteConfig } from "@/routes";

// ==========================================
// CORE PAGES (Eagerly loaded for fast initial render)
// ==========================================
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import { ProfilePage } from "@/pages/profile";
import NotFound from "@/pages/NotFound";
import PlaceholderPage from "@/pages/PlaceholderPage";

// ==========================================
// LAZY LOADED PAGE COMPONENTS
// ==========================================

// User Management
const UsersList = lazy(() => import("@/pages/users/UsersList"));
const UserDetail = lazy(() => import("@/pages/users/UserDetail"));
const PermissionsList = lazy(() => import("@/pages/set-roles/SetRolesList"));

// Role Management
const RolesList = lazy(() => import("@/pages/roles/RolesList"));
const RoleDetail = lazy(() => import("@/pages/roles/RoleDetail"));

// Set Roles
const SetRolesList = lazy(() =>
  import("@/pages/set-roles").then((m) => ({ default: m.SetRolesList }))
);

// Students
const StudentsList = lazy(() =>
  import("@/pages/students").then((m) => ({ default: m.StudentsList }))
);
const StudentDetail = lazy(() =>
  import("@/pages/students").then((m) => ({ default: m.StudentDetail }))
);

// Parents
const ParentsList = lazy(() =>
  import("@/pages/parents").then((m) => ({ default: m.ParentsList }))
);
const ParentDetail = lazy(() =>
  import("@/pages/parents").then((m) => ({ default: m.ParentDetail }))
);

// Teachers
const TeachersList = lazy(() =>
  import("@/pages/teachers").then((m) => ({ default: m.TeachersList }))
);
const TeacherDetail = lazy(() =>
  import("@/pages/teachers").then((m) => ({ default: m.TeacherDetail }))
);

// Employees
const EmployeesList = lazy(() =>
  import("@/pages/employees").then((m) => ({ default: m.EmployeesList }))
);
const EmployeeDetail = lazy(() =>
  import("@/pages/employees").then((m) => ({ default: m.EmployeeDetail }))
);

// Academic Years
const AcademicYearsList = lazy(() =>
  import("@/pages/academic-years").then((m) => ({
    default: m.AcademicYearsList,
  }))
);

// Classes
const ClassesList = lazy(() =>
  import("@/pages/classes").then((m) => ({ default: m.ClassesList }))
);

// Sections
const SectionsList = lazy(() =>
  import("@/pages/sections").then((m) => ({ default: m.SectionsList }))
);

// Batches
const BatchesList = lazy(() =>
  import("@/pages/batches").then((m) => ({ default: m.BatchesList }))
);

// Subjects
const SubjectsList = lazy(() =>
  import("@/pages/subjects").then((m) => ({ default: m.SubjectsList }))
);

// Topics
const TopicsList = lazy(() =>
  import("@/pages/topics").then((m) => ({ default: m.TopicsList }))
);
const TopicDetail = lazy(() =>
  import("@/pages/topics").then((m) => ({ default: m.TopicDetail }))
);

// Attendance (CONSOLIDATED)
const AttendanceList = lazy(() =>
  import("@/pages/attendance").then((m) => ({ default: m.AttendanceList }))
);

// Staff Attendance (CONSOLIDATED)
const StaffAttendanceDashboard = lazy(() =>
  import("@/pages/staff-attendance").then((m) => ({
    default: m.StaffAttendanceDashboard,
  }))
);

// Leave Management (CONSOLIDATED)
const LeaveRequestsPage = lazy(() =>
  import("@/pages/attendance").then((m) => ({ default: m.LeaveRequestsPage }))
);
const LeaveManagement = lazy(() => import("@/pages/LeaveManagement"));

// Timetables (CONSOLIDATED)
const TimetableDashboard = lazy(() =>
  import("@/pages/timetables").then((m) => ({ default: m.TimetableDashboard }))
);
const MyTimetablePage = lazy(() =>
  import("@/pages/timetables").then((m) => ({ default: m.MyTimetablePage }))
);
const SectionTimetablePage = lazy(() =>
  import("@/pages/timetables").then((m) => ({
    default: m.SectionTimetablePage,
  }))
);
const EditTimetablePage = lazy(() =>
  import("@/pages/timetables").then((m) => ({
    default: m.EditTimetablePage,
  }))
);
const ViewTimetablesPage = lazy(() =>
  import("@/pages/timetables").then((m) => ({
    default: m.ViewTimetablesPage,
  }))
);

// Lecture Templates (CONSOLIDATED)
const LectureTemplatesList = lazy(() =>
  import("@/pages/lecture-templates").then((m) => ({
    default: m.LectureTemplatesList,
  }))
);

// Exams (CONSOLIDATED: 2 routes only)
const ExamsList = lazy(() =>
  import("@/pages/exams").then((m) => ({ default: m.ExamsList }))
);
const ExamDetail = lazy(() =>
  import("@/pages/exams").then((m) => ({ default: m.ExamDetail }))
);
const ReportCardsPage = lazy(() =>
  import("@/pages/exams").then((m) => ({ default: m.ReportCardsPage }))
);

// Results
const ResultsList = lazy(() =>
  import("@/pages/results").then((m) => ({ default: m.ResultsList }))
);

// Fees (CONSOLIDATED: Single dashboard with tabs)
const FeeDashboard = lazy(() =>
  import("@/pages/fees").then((m) => ({ default: m.FeeDashboard }))
);

// Payments
const PaymentsList = lazy(() =>
  import("@/pages/payments").then((m) => ({ default: m.PaymentsList }))
);

// Other Core Pages
const Admissions = lazy(() => import("@/pages/Admissions"));
const Enrollments = lazy(() => import("@/pages/Enrollments"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const NotificationDebug = lazy(() => import("@/pages/NotificationDebug"));

// Tier 2 Pages
const AssignmentsList = lazy(() =>
  import("@/pages/assignments").then((m) => ({ default: m.AssignmentsList }))
);
const DoubtsList = lazy(() =>
  import("@/pages/doubts").then((m) => ({ default: m.DoubtsList }))
);
const AvailabilitySlots = lazy(() => import("@/pages/AvailabilitySlots"));
const PTMRequests = lazy(() => import("@/pages/PTMRequests"));

// PTM Module Pages
const PTMDashboard = lazy(() =>
  import("@/pages/ptm").then((m) => ({ default: m.PTMDashboard }))
);
const SchedulePTM = lazy(() =>
  import("@/pages/ptm").then((m) => ({ default: m.SchedulePTM }))
);
const PTMRequestsQueue = lazy(() =>
  import("@/pages/ptm").then((m) => ({ default: m.PTMRequestsQueue }))
);
const TeacherPTMSchedule = lazy(() =>
  import("@/pages/ptm").then((m) => ({ default: m.TeacherPTMSchedule }))
);
const ParentRequestPTM = lazy(() =>
  import("@/pages/ptm").then((m) => ({ default: m.ParentRequestPTM }))
);
const ParentPTMBookings = lazy(() =>
  import("@/pages/ptm").then((m) => ({ default: m.ParentPTMBookings }))
);

const Feedback = lazy(() => import("@/pages/Feedback"));
const GrievancesPage = lazy(() => import("@/pages/grievances/GrievancesPage"));
const GrievanceChat = lazy(() => import("@/pages/grievances/GrievanceChat"));
const SupportTickets = lazy(() => import("@/pages/SupportTickets"));
const SalaryStructures = lazy(() => import("@/pages/SalaryStructures"));
const Payslips = lazy(() => import("@/pages/Payslips"));

// Transport (CONSOLIDATED: Single dashboard with tabs)
const TransportDashboard = lazy(() =>
  import("@/pages/transport").then((m) => ({ default: m.TransportDashboard }))
);

// Tier 3 Pages
// const Branches = lazy(() => import("@/pages/Branches")); // REMOVED: Not needed
const InventoryList = lazy(() =>
  import("@/pages/inventory").then((m) => ({ default: m.InventoryList }))
);

// ID Cards (CONSOLIDATED: Single dashboard with tabs)
const IDCardsDashboard = lazy(() =>
  import("@/pages/id-cards").then((m) => ({ default: m.IDCardsDashboard }))
);

// Reports (CONSOLIDATED: Single dashboard with report type selector)
const ReportsDashboard = lazy(() =>
  import("@/pages/reports").then((m) => ({ default: m.ReportsDashboard }))
);

// Library (CONSOLIDATED: Single dashboard with tabs)
const LibraryDashboard = lazy(() =>
  import("@/pages/library").then((m) => ({ default: m.LibraryDashboard }))
);

// Hostel - REMOVED (Not needed)
// const HostelDashboard = lazy(() => import("@/pages/hostel").then(m => ({ default: m.HostelDashboard })));

// Settings Page
const SettingsPage = lazy(() =>
  import("@/pages/settings").then((m) => ({ default: m.SettingsPage }))
);

// Announcements Page
const AnnouncementsPage = lazy(() =>
  import("@/pages/announcements").then((m) => ({
    default: m.AnnouncementsPage,
  }))
);

// Messages Page
const MessagesPage = lazy(() =>
  import("@/pages/messages").then((m) => ({ default: m.MessagesPage }))
);

// Fee Collect Page
const FeeCollectPage = lazy(() =>
  import("@/pages/fees").then((m) => ({ default: m.FeeCollectPage }))
);

// Study Materials Page
const StudyMaterialsPage = lazy(() =>
  import("@/pages/study-materials").then((m) => ({
    default: m.StudyMaterialsPage,
  }))
);

// Online Classes Page
const OnlineClassesPage = lazy(() =>
  import("@/pages/online-classes").then((m) => ({
    default: m.OnlineClassesPage,
  }))
);

// Homework Page
const HomeworkPage = lazy(() =>
  import("@/pages/homework").then((m) => ({ default: m.HomeworkPage }))
);

// Payroll Page
const PayrollPage = lazy(() =>
  import("@/pages/payroll").then((m) => ({ default: m.PayrollPage }))
);

// Appraisals Page
const AppraisalsPage = lazy(() =>
  import("@/pages/appraisals").then((m) => ({ default: m.AppraisalsPage }))
);

// Recruitment Page
const RecruitmentPage = lazy(() =>
  import("@/pages/recruitment").then((m) => ({ default: m.RecruitmentPage }))
);

// Recruitment Job Detail Page
const RecruitmentJobDetailPage = lazy(() =>
  import("@/pages/recruitment").then((m) => ({
    default: m.RecruitmentJobDetailPage,
  }))
);

// Analytics Page
const AnalyticsPage = lazy(() =>
  import("@/pages/analytics").then((m) => ({ default: m.AnalyticsPage }))
);

// Certificates Page
const CertificatesPage = lazy(() =>
  import("@/pages/certificates").then((m) => ({ default: m.CertificatesPage }))
);

// Surveys Page
const SurveysPage = lazy(() =>
  import("@/pages/surveys").then((m) => ({ default: m.SurveysPage }))
);

// Parent Dashboard Page
const ParentDashboardPage = lazy(() =>
  import("@/pages/parent").then((m) => ({ default: m.ParentDashboardPage }))
);

// Parent Child Detail Page
const ParentChildDetailPage = lazy(() =>
  import("@/pages/parent").then((m) => ({ default: m.ParentChildDetailPage }))
);

// Role-Specific Dashboard Pages
const AdminDashboard = lazy(() =>
  import("@/pages/dashboards").then((m) => ({ default: m.AdminDashboard }))
);
const TeacherDashboard = lazy(() =>
  import("@/pages/dashboards").then((m) => ({ default: m.TeacherDashboard }))
);
const StaffDashboard = lazy(() =>
  import("@/pages/dashboards").then((m) => ({ default: m.StaffDashboard }))
);
const StudentDashboard = lazy(() =>
  import("@/pages/dashboards").then((m) => ({ default: m.StudentDashboard }))
);
const CustomDashboard = lazy(() =>
  import("@/pages/dashboards").then((m) => ({ default: m.CustomDashboard }))
);
const DashboardRouter = lazy(() =>
  import("@/pages/dashboards").then((m) => ({ default: m.DashboardRouter }))
);

// Assignment Detail Page
const AssignmentDetailPage = lazy(() =>
  import("@/pages/assignments").then((m) => ({
    default: m.AssignmentDetailPage,
  }))
);

// Admission Application Detail Page
const AdmissionApplicationDetailPage = lazy(() =>
  import("@/pages/admissions/AdmissionApplicationDetailPage").then((m) => ({
    default: m.AdmissionApplicationDetailPage,
  }))
);

// ==========================================
// ROUTE TO COMPONENT MAPPING
// ==========================================

type LazyComponent =
  | React.LazyExoticComponent<ComponentType<any>>
  | ComponentType<any>;

/**
 * Maps route paths to their React components.
 * This provides a single source of truth for route-component associations.
 */
const routeComponentMap: Record<string, LazyComponent> = {
  // Users
  "/users": UsersList,
  "/users/:id": UserDetail,
  "/permissions": PermissionsList,

  // Roles
  "/roles": RolesList,
  "/roles/:id": RoleDetail,

  // Set Roles
  "/set-roles": SetRolesList,

  // Students
  "/students": StudentsList,
  "/students/:id": StudentDetail,

  // Parents
  "/parents": ParentsList,
  "/parents/:id": ParentDetail,

  // Teachers
  "/teachers": TeachersList,
  "/teachers/:id": TeacherDetail,

  // Employees
  "/employees": EmployeesList,
  "/employees/:id": EmployeeDetail,

  // Academic Years
  "/academic-years": AcademicYearsList,

  // Classes
  "/classes": ClassesList,

  // Sections
  "/sections": SectionsList,

  // Batches
  "/batches": BatchesList,

  // Subjects
  "/subjects": SubjectsList,

  // Topics
  "/topics": TopicsList,
  "/topics/:id": TopicDetail,

  // Attendance (CONSOLIDATED: All features via tabs on main dashboard)
  "/attendance": AttendanceList,

  // Staff Attendance (CONSOLIDATED: All features via tabs on main dashboard)
  "/staff/attendance": StaffAttendanceDashboard,

  // Leave Management (CONSOLIDATED: Create/Edit via modal)
  "/leave-requests": LeaveRequestsPage,
  "/staff/leave": LeaveManagement,

  // Timetables (CONSOLIDATED: All features via tabs on dashboard)
  "/timetable": TimetableDashboard,
  "/timetable/view": ViewTimetablesPage,
  "/timetable/view/:sectionId": SectionTimetablePage,
  "/timetable/:id/edit": EditTimetablePage,
  "/my-timetable": MyTimetablePage,

  // Lecture Templates (CONSOLIDATED: Create/Edit via modals)
  "/lecture-templates": LectureTemplatesList,

  // Exams (CONSOLIDATED)
  "/exams": ExamsList,
  "/exams/:id": ExamDetail,
  "/report-cards": ReportCardsPage,

  // Results
  "/results": ResultsList,

  // Fees (CONSOLIDATED: Single dashboard with tabs)
  "/fees": FeeDashboard,

  // Payments & Enrollments
  "/payments": PaymentsList,
  "/enrollments": Enrollments,

  // Admissions
  "/admissions": Admissions,
  "/admissions/applications/:id": AdmissionApplicationDetailPage,

  // Notifications
  "/notifications": Notifications,

  // Tier 2 - LMS
  "/assignments": AssignmentsList,
  "/assignments/:id": AssignmentDetailPage,
  "/doubts": DoubtsList,

  // Tier 2 - Advanced
  "/availability-slots": AvailabilitySlots,
  "/ptm-requests": PTMRequests,
  "/feedback": Feedback,
  "/grievances": GrievancesPage,
  "/grievances/:grievanceId": GrievanceChat,
  "/support-tickets": SupportTickets,

  // Tier 2 - HR
  "/salary-structures": SalaryStructures,
  "/payslips": Payslips,

  // Tier 2 - Transport (CONSOLIDATED: Single dashboard with tabs)
  "/transport": TransportDashboard,

  // Tier 3 - Branches - REMOVED (Not needed)
  // '/branches': Branches,

  // Tier 3 - Inventory
  "/inventory": InventoryList,

  // Tier 3 - ID Cards (CONSOLIDATED: Single dashboard with tabs)
  "/id-cards": IDCardsDashboard,

  // Tier 3 - Reports (CONSOLIDATED: Single dashboard with report selector)
  "/reports": ReportsDashboard,

  // Tier 3 - Library (CONSOLIDATED: Single dashboard with tabs)
  "/library": LibraryDashboard,

  // ==========================================
  // PLACEHOLDER ROUTES (Not yet implemented)
  // ==========================================

  // Settings & Communication
  "/settings": SettingsPage,
  "/announcements": AnnouncementsPage,
  "/messages": MessagesPage,

  // Fee Collection
  "/fees/collect": FeeCollectPage,

  // LMS Extended
  "/study-materials": StudyMaterialsPage,
  "/online-classes": OnlineClassesPage,
  "/homework": HomeworkPage,

  // HR Extended
  "/payroll": PayrollPage,
  "/appraisals": AppraisalsPage,

  // Recruitment
  "/recruitment": RecruitmentPage,
  "/recruitment/jobs/:id": RecruitmentJobDetailPage,

  // Analytics
  "/analytics": AnalyticsPage,

  // Certificates & Surveys
  "/certificates": CertificatesPage,
  "/surveys": SurveysPage,

  // Parent Portal
  "/parent/dashboard": ParentDashboardPage,
  "/parent/children/:id": ParentChildDetailPage,

  // Role-Specific Dashboards
  "/admin/dashboard": AdminDashboard,
  "/teacher/dashboard": TeacherDashboard,
  "/staff/dashboard": StaffDashboard,
  "/student/dashboard": StudentDashboard,
  "/custom/dashboard": CustomDashboard,

  // Support (alias for support-tickets)
  "/support": SupportTickets,

  // PTM Module Routes
  "/ptm": PTMDashboard,
  "/ptm/schedule": SchedulePTM,
  "/ptm/requests": PTMRequestsQueue,
  "/teacher/ptm": TeacherPTMSchedule,
  "/parent/ptm/request": ParentRequestPTM,
  "/parent/ptm/bookings": ParentPTMBookings,
  
  // Legacy PTM route
  "/ptm-requests": PTMRequests,
};

// ==========================================
// FEATURE FLAG MAPPING
// ==========================================

/**
 * Maps module codes to their feature flag keys
 */
const moduleToFeatureMap: Record<string, keyof typeof FEATURES> = {
  users: "users",
  roles: "roles",
  permissions: "permissions",
  students: "students",
  parents: "parents",
  teachers: "teachers",
  employees: "employees",
  attendance: "attendance",
  staff_attendance: "attendance",
  leave: "leaveManagement",
  staff_leave: "leaveManagement",
  academic_years: "classes",
  classes: "classes",
  sections: "sections",
  subjects: "subjects",
  topics: "topics",
  timetable: "timetables",
  lecture_templates: "lectureTemplates",
  exams: "exams",
  marks: "results",
  report_cards: "reportCards",
  fees: "fees",
  payments: "payments",
  notifications: "notifications",
  announcements: "announcements",
  admissions: "admissions",
  assignments: "assignments",
  study_materials: "lmsContent",
  online_classes: "lmsContent",
  homework: "homework",
  doubts: "doubts",
  transport: "transport",
  salary_structures: "salaryStructures",
  payslips: "payslips",
  feedback: "feedback",
  grievances: "grievances",
  support_tickets: "supportTickets",
  availability_slots: "availabilitySlots",
  working_hours: "workingHours",
  ptm_requests: "ptmRequests",
  inventory: "inventory",
  // 'branches': 'branches', // REMOVED: Not needed
  tie_up_schools: "tieUpSchools",
  id_cards: "idCards",
  library: "library",
  // 'hostel': 'hostel', // REMOVED: Not needed
  reports: "reports",
};

// ==========================================
// LOADING COMPONENT
// ==========================================

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// ==========================================
// QUERY CLIENT
// ==========================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// ==========================================
// ROUTE RENDERER HELPER
// ==========================================

/**
 * Checks if a module's feature is enabled
 */
const isModuleEnabled = (module: string): boolean => {
  const featureKey = moduleToFeatureMap[module];
  if (!featureKey) return true; // If no mapping, assume enabled
  return FEATURES[featureKey] === true;
};

/**
 * Gets the component for a route, falling back to PlaceholderPage
 */
const getRouteComponent = (path: string): LazyComponent => {
  return routeComponentMap[path] || PlaceholderPage;
};

/**
 * Renders a single route from the centralized configuration
 */
const renderRoute = (route: RouteConfig) => {
  // Skip dashboard and profile (handled separately as core routes)
  if (
    route.path === "/dashboard" ||
    route.path === "/" ||
    route.path === "/profile"
  ) {
    return null;
  }

  // Check if module's feature is enabled
  if (!isModuleEnabled(route.module)) {
    return null;
  }

  const Component = getRouteComponent(route.path);
  const requiresAction = route.action && route.action !== "view";

  return (
    <Route
      key={route.path}
      path={route.path}
      element={
        <ProtectedRoute
          requiredModule={route.module}
          requiredAction={requiresAction ? route.action : undefined}
          requiredRoles={route.roleRestricted}
        >
          <Suspense fallback={<PageLoader />}>
            <Component />
          </Suspense>
        </ProtectedRoute>
      }
    />
  );
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <PermissionProvider>
          <SidebarConfigProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public route - Authentication */}
                  <Route path="/auth" element={<Auth />} />

                  {/* Protected routes - Wrapped in MainLayout */}
                  <Route
                    element={
                      <ProtectedRoute>
                        <MainLayout />
                      </ProtectedRoute>
                    }
                  >
                    {/* 
                     * Root Route - Role-Based Dashboard Router
                     * =========================================
                     * The "/" path now redirects users to their role-specific dashboard:
                     * - super_admin, principal, ADMIN → /admin/dashboard
                     * - teacher → /teacher/dashboard
                     * - staff roles → /staff/dashboard
                     * - student → /student/dashboard
                     * - parent → /parent/dashboard
                     * - custom roles → /custom/dashboard
                     */}
                    <Route 
                      path="/" 
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <DashboardRouter />
                        </Suspense>
                      } 
                    />
                    
                    {/* Legacy dashboard route - kept for backward compatibility */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<ProfilePage />} />

                    {/*
                     * Dynamic Routes from Centralized Configuration
                     * ==============================================
                     * All routes are generated from the allRoutes array
                     * defined in @/routes/routeConfig.ts
                     *
                     * Each route is:
                     * 1. Filtered by feature flag
                     * 2. Protected by ProtectedRoute with module/action
                     * 3. Lazy loaded with Suspense
                     * 4. Falls back to PlaceholderPage if component not mapped
                     */}
                    {allRoutes.map(renderRoute)}

                    {/* Debug Routes - No Protection */}
                    <Route
                      path="/notification/debug"
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <NotificationDebug />
                        </Suspense>
                      }
                    />
                  </Route>

                  {/* 404 - Not Found */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </SidebarConfigProvider>
        </PermissionProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
