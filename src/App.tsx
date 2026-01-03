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
const UserCreate = lazy(() => import("@/pages/users/UserCreate"));
const UserDetail = lazy(() => import("@/pages/users/UserDetail"));
const UserEdit = lazy(() => import("@/pages/users/UserEdit"));
const PermissionsList = lazy(() => import("@/pages/set-roles/SetRolesList"));

// Role Management
const RolesList = lazy(() => import("@/pages/roles/RolesList"));
const RoleCreate = lazy(() => import("@/pages/roles/RoleCreate"));
const RoleDetail = lazy(() => import("@/pages/roles/RoleDetail"));
const RoleEdit = lazy(() => import("@/pages/roles/RoleEdit"));

// Set Roles
const SetRolesList = lazy(() => import("@/pages/set-roles").then(m => ({ default: m.SetRolesList })));

// Students
const StudentsList = lazy(() => import("@/pages/students").then(m => ({ default: m.StudentsList })));
const StudentCreate = lazy(() => import("@/pages/students").then(m => ({ default: m.StudentCreate })));
const StudentDetail = lazy(() => import("@/pages/students").then(m => ({ default: m.StudentDetail })));
const StudentEdit = lazy(() => import("@/pages/students").then(m => ({ default: m.StudentEdit })));
const StudentsExport = lazy(() => import("@/pages/students").then(m => ({ default: m.StudentsExport })));

// Parents
const ParentsList = lazy(() => import("@/pages/parents").then(m => ({ default: m.ParentsList })));
const ParentCreate = lazy(() => import("@/pages/parents").then(m => ({ default: m.ParentCreate })));
const ParentDetail = lazy(() => import("@/pages/parents").then(m => ({ default: m.ParentDetail })));
const ParentEdit = lazy(() => import("@/pages/parents").then(m => ({ default: m.ParentEdit })));

// Teachers
const TeachersList = lazy(() => import("@/pages/teachers").then(m => ({ default: m.TeachersList })));
const TeacherCreate = lazy(() => import("@/pages/teachers").then(m => ({ default: m.TeacherCreate })));
const TeacherDetail = lazy(() => import("@/pages/teachers").then(m => ({ default: m.TeacherDetail })));
const TeacherEdit = lazy(() => import("@/pages/teachers").then(m => ({ default: m.TeacherEdit })));
const TeachersExport = lazy(() => import("@/pages/teachers").then(m => ({ default: m.TeachersExport })));

// Employees
const EmployeesList = lazy(() => import("@/pages/employees").then(m => ({ default: m.EmployeesList })));
const EmployeeCreate = lazy(() => import("@/pages/employees").then(m => ({ default: m.EmployeeCreate })));
const EmployeeDetail = lazy(() => import("@/pages/employees").then(m => ({ default: m.EmployeeDetail })));
const EmployeeEdit = lazy(() => import("@/pages/employees").then(m => ({ default: m.EmployeeEdit })));

// Academic Years
const AcademicYearsList = lazy(() => import("@/pages/academic-years").then(m => ({ default: m.AcademicYearsList })));
const AcademicYearCreate = lazy(() => import("@/pages/academic-years").then(m => ({ default: m.AcademicYearCreate })));
const AcademicYearDetail = lazy(() => import("@/pages/academic-years").then(m => ({ default: m.AcademicYearDetail })));
const AcademicYearEdit = lazy(() => import("@/pages/academic-years").then(m => ({ default: m.AcademicYearEdit })));

// Classes
const ClassesList = lazy(() => import("@/pages/classes").then(m => ({ default: m.ClassesList })));
const ClassCreate = lazy(() => import("@/pages/classes").then(m => ({ default: m.ClassCreate })));
const ClassDetail = lazy(() => import("@/pages/classes").then(m => ({ default: m.ClassDetail })));
const ClassEdit = lazy(() => import("@/pages/classes").then(m => ({ default: m.ClassEdit })));

// Sections
const SectionsList = lazy(() => import("@/pages/sections").then(m => ({ default: m.SectionsList })));
const SectionCreate = lazy(() => import("@/pages/sections").then(m => ({ default: m.SectionCreate })));
const SectionDetail = lazy(() => import("@/pages/sections").then(m => ({ default: m.SectionDetail })));
const SectionEdit = lazy(() => import("@/pages/sections").then(m => ({ default: m.SectionEdit })));

// Batches
const BatchesList = lazy(() => import("@/pages/batches").then(m => ({ default: m.BatchesList })));
const BatchCreate = lazy(() => import("@/pages/batches").then(m => ({ default: m.BatchCreate })));
const BatchDetail = lazy(() => import("@/pages/batches").then(m => ({ default: m.BatchDetail })));
const BatchEdit = lazy(() => import("@/pages/batches").then(m => ({ default: m.BatchEdit })));

// Subjects
const SubjectsList = lazy(() => import("@/pages/subjects").then(m => ({ default: m.SubjectsList })));
const SubjectCreate = lazy(() => import("@/pages/subjects").then(m => ({ default: m.SubjectCreate })));
const SubjectDetail = lazy(() => import("@/pages/subjects").then(m => ({ default: m.SubjectDetail })));
const SubjectEdit = lazy(() => import("@/pages/subjects").then(m => ({ default: m.SubjectEdit })));

// Topics
const TopicsList = lazy(() => import("@/pages/topics").then(m => ({ default: m.TopicsList })));
const TopicCreate = lazy(() => import("@/pages/topics").then(m => ({ default: m.TopicCreate })));
const TopicDetail = lazy(() => import("@/pages/topics").then(m => ({ default: m.TopicDetail })));
const TopicEdit = lazy(() => import("@/pages/topics").then(m => ({ default: m.TopicEdit })));

// Attendance (CONSOLIDATED)
const AttendanceList = lazy(() => import("@/pages/attendance").then(m => ({ default: m.AttendanceList })));

// Staff Attendance (CONSOLIDATED)
const StaffAttendanceDashboard = lazy(() => import("@/pages/staff-attendance").then(m => ({ default: m.StaffAttendanceDashboard })));

// Leave Management (CONSOLIDATED)
const LeaveRequestsPage = lazy(() => import("@/pages/attendance").then(m => ({ default: m.LeaveRequestsPage })));
const LeaveManagement = lazy(() => import("@/pages/LeaveManagement"));

// Timetables (CONSOLIDATED)
const TimetableDashboard = lazy(() => import("@/pages/timetables").then(m => ({ default: m.TimetableDashboard })));
const MyTimetablePage = lazy(() => import("@/pages/timetables").then(m => ({ default: m.MyTimetablePage })));

// Lecture Templates (CONSOLIDATED)
const LectureTemplatesList = lazy(() => import("@/pages/lecture-templates").then(m => ({ default: m.LectureTemplatesList })));

// Exams (CONSOLIDATED: 2 routes only)
const ExamsList = lazy(() => import("@/pages/exams").then(m => ({ default: m.ExamsList })));
const ExamDetail = lazy(() => import("@/pages/exams").then(m => ({ default: m.ExamDetail })));
const ReportCardsPage = lazy(() => import("@/pages/exams").then(m => ({ default: m.ReportCardsPage })));

// Results
const ResultsList = lazy(() => import("@/pages/results").then(m => ({ default: m.ResultsList })));

// Fees (CONSOLIDATED: 2 routes only)
const FeeStructuresList = lazy(() => import("@/pages/fees").then(m => ({ default: m.FeeStructuresList })));
const FeeCollectionPage = lazy(() => import("@/pages/fees").then(m => ({ default: m.FeeCollectionPage })));

// Payments
const PaymentsList = lazy(() => import("@/pages/payments").then(m => ({ default: m.PaymentsList })));

// Other Core Pages
const Admissions = lazy(() => import("@/pages/Admissions"));
const Enrollments = lazy(() => import("@/pages/Enrollments"));
const Notifications = lazy(() => import("@/pages/Notifications"));

// Tier 2 Pages
const AssignmentsList = lazy(() => import("@/pages/assignments").then(m => ({ default: m.AssignmentsList })));
const DoubtsList = lazy(() => import("@/pages/doubts").then(m => ({ default: m.DoubtsList })));
const AvailabilitySlots = lazy(() => import("@/pages/AvailabilitySlots"));
const PTMRequests = lazy(() => import("@/pages/PTMRequests"));
const Feedback = lazy(() => import("@/pages/Feedback"));
const Grievances = lazy(() => import("@/pages/Grievances"));
const SupportTickets = lazy(() => import("@/pages/SupportTickets"));
const SalaryStructures = lazy(() => import("@/pages/SalaryStructures"));
const Payslips = lazy(() => import("@/pages/Payslips"));

// Transport (CONSOLIDATED: Single dashboard with tabs)
const TransportDashboard = lazy(() => import("@/pages/transport").then(m => ({ default: m.TransportDashboard })));

// Tier 3 Pages
const Branches = lazy(() => import("@/pages/Branches"));
const InventoryList = lazy(() => import("@/pages/inventory").then(m => ({ default: m.InventoryList })));

// ID Cards (CONSOLIDATED: Single dashboard with tabs)
const IDCardsDashboard = lazy(() => import("@/pages/id-cards").then(m => ({ default: m.IDCardsDashboard })));

// Reports (CONSOLIDATED: Single dashboard with report type selector)
const ReportsDashboard = lazy(() => import("@/pages/reports").then(m => ({ default: m.ReportsDashboard })));

// Library
const LibraryDashboard = lazy(() => import("@/pages/library").then(m => ({ default: m.LibraryDashboard })));
const BooksList = lazy(() => import("@/pages/library").then(m => ({ default: m.BooksList })));
const BookIssue = lazy(() => import("@/pages/library").then(m => ({ default: m.BookIssue })));
const BookReturn = lazy(() => import("@/pages/library").then(m => ({ default: m.BookReturn })));
const LibraryMembers = lazy(() => import("@/pages/library").then(m => ({ default: m.LibraryMembers })));

// Hostel
const HostelDashboard = lazy(() => import("@/pages/hostel").then(m => ({ default: m.HostelDashboard })));
const BlocksList = lazy(() => import("@/pages/hostel").then(m => ({ default: m.BlocksList })));
const RoomsList = lazy(() => import("@/pages/hostel").then(m => ({ default: m.RoomsList })));
const AllocationsList = lazy(() => import("@/pages/hostel").then(m => ({ default: m.AllocationsList })));
const ComplaintsList = lazy(() => import("@/pages/hostel").then(m => ({ default: m.ComplaintsList })));

// ==========================================
// ROUTE TO COMPONENT MAPPING
// ==========================================

type LazyComponent = React.LazyExoticComponent<ComponentType<any>> | ComponentType<any>;

/**
 * Maps route paths to their React components.
 * This provides a single source of truth for route-component associations.
 */
const routeComponentMap: Record<string, LazyComponent> = {
  // Users
  '/users': UsersList,
  '/users/create': UserCreate,
  '/users/:id': UserDetail,
  '/users/:id/edit': UserEdit,
  '/permissions': PermissionsList,
  
  // Roles
  '/roles': RolesList,
  '/roles/create': RoleCreate,
  '/roles/:id': RoleDetail,
  '/roles/:id/edit': RoleEdit,
  
  // Set Roles
  '/set-roles': SetRolesList,
  
  // Students
  '/students': StudentsList,
  '/students/create': StudentCreate,
  '/students/:id': StudentDetail,
  '/students/:id/edit': StudentEdit,
  '/students/export': StudentsExport,
  
  // Parents
  '/parents': ParentsList,
  '/parents/create': ParentCreate,
  '/parents/:id': ParentDetail,
  '/parents/:id/edit': ParentEdit,
  
  // Teachers
  '/teachers': TeachersList,
  '/teachers/create': TeacherCreate,
  '/teachers/:id': TeacherDetail,
  '/teachers/:id/edit': TeacherEdit,
  '/teachers/export': TeachersExport,
  
  // Employees
  '/employees': EmployeesList,
  '/employees/create': EmployeeCreate,
  '/employees/:id': EmployeeDetail,
  '/employees/:id/edit': EmployeeEdit,
  
  // Academic Years
  '/academic-years': AcademicYearsList,
  '/academic-years/create': AcademicYearCreate,
  '/academic-years/:id': AcademicYearDetail,
  '/academic-years/:id/edit': AcademicYearEdit,
  
  // Classes
  '/classes': ClassesList,
  '/classes/create': ClassCreate,
  '/classes/:id': ClassDetail,
  '/classes/:id/edit': ClassEdit,
  
  // Sections
  '/sections': SectionsList,
  '/sections/create': SectionCreate,
  '/sections/:id': SectionDetail,
  '/sections/:id/edit': SectionEdit,
  
  // Batches
  '/batches': BatchesList,
  '/batches/create': BatchCreate,
  '/batches/:id': BatchDetail,
  '/batches/:id/edit': BatchEdit,
  
  // Subjects
  '/subjects': SubjectsList,
  '/subjects/create': SubjectCreate,
  '/subjects/:id': SubjectDetail,
  '/subjects/:id/edit': SubjectEdit,
  
  // Topics
  '/topics': TopicsList,
  '/topics/create': TopicCreate,
  '/topics/:id': TopicDetail,
  '/topics/:id/edit': TopicEdit,
  
  // Attendance (CONSOLIDATED: All features via tabs on main dashboard)
  '/attendance': AttendanceList,
  
  // Staff Attendance (CONSOLIDATED: All features via tabs on main dashboard)
  '/staff/attendance': StaffAttendanceDashboard,
  
  // Leave Management (CONSOLIDATED: Create/Edit via modal)
  '/leave-requests': LeaveRequestsPage,
  '/staff/leave': LeaveManagement,
  
  // Timetables (CONSOLIDATED: All features via tabs on dashboard)
  '/timetable': TimetableDashboard,
  '/my-timetable': MyTimetablePage,
  
  // Lecture Templates (CONSOLIDATED: Create/Edit via modals)
  '/lecture-templates': LectureTemplatesList,
  
  // Exams (CONSOLIDATED)
  '/exams': ExamsList,
  '/exams/:id': ExamDetail,
  '/report-cards': ReportCardsPage,
  
  // Results
  '/results': ResultsList,
  
  // Fees (CONSOLIDATED)
  '/fees': FeeStructuresList,
  '/fees/collect': FeeCollectionPage,
  
  // Payments & Enrollments
  '/payments': PaymentsList,
  '/enrollments': Enrollments,
  
  // Admissions
  '/admissions': Admissions,
  
  // Notifications
  '/notifications': Notifications,
  
  // Tier 2 - LMS
  '/assignments': AssignmentsList,
  '/doubts': DoubtsList,
  
  // Tier 2 - Advanced
  '/availability-slots': AvailabilitySlots,
  '/ptm-requests': PTMRequests,
  '/feedback': Feedback,
  '/grievances': Grievances,
  '/support-tickets': SupportTickets,
  
  // Tier 2 - HR
  '/salary-structures': SalaryStructures,
  '/payslips': Payslips,
  
  // Tier 2 - Transport (CONSOLIDATED: Single dashboard with tabs)
  '/transport': TransportDashboard,
  
  // Tier 3 - Branches
  '/branches': Branches,
  
  // Tier 3 - Inventory
  '/inventory': InventoryList,
  
  // Tier 3 - ID Cards (CONSOLIDATED: Single dashboard with tabs)
  '/id-cards': IDCardsDashboard,
  
  // Tier 3 - Reports (CONSOLIDATED: Single dashboard with report selector)
  '/reports': ReportsDashboard,
  
  // Tier 3 - Library
  '/library': LibraryDashboard,
  '/library/books': BooksList,
  '/library/issue': BookIssue,
  '/library/return': BookReturn,
  '/library/members': LibraryMembers,
  
  // Tier 3 - Hostel
  '/hostel': HostelDashboard,
  '/hostel/blocks': BlocksList,
  '/hostel/rooms': RoomsList,
  '/hostel/allocations': AllocationsList,
  '/hostel/complaints': ComplaintsList,
};

// ==========================================
// FEATURE FLAG MAPPING
// ==========================================

/**
 * Maps module codes to their feature flag keys
 */
const moduleToFeatureMap: Record<string, keyof typeof FEATURES> = {
  'users': 'users',
  'roles': 'roles',
  'permissions': 'permissions',
  'students': 'students',
  'parents': 'parents',
  'teachers': 'teachers',
  'employees': 'employees',
  'attendance': 'attendance',
  'staff_attendance': 'attendance',
  'leave': 'leaveManagement',
  'staff_leave': 'leaveManagement',
  'academic_years': 'classes',
  'classes': 'classes',
  'sections': 'sections',
  'subjects': 'subjects',
  'topics': 'topics',
  'timetable': 'timetables',
  'lecture_templates': 'lectureTemplates',
  'exams': 'exams',
  'marks': 'results',
  'report_cards': 'reportCards',
  'fees': 'fees',
  'payments': 'payments',
  'notifications': 'notifications',
  'announcements': 'announcements',
  'admissions': 'admissions',
  'assignments': 'assignments',
  'study_materials': 'lmsContent',
  'online_classes': 'lmsContent',
  'homework': 'homework',
  'doubts': 'doubts',
  'transport': 'transport',
  'salary_structures': 'salaryStructures',
  'payslips': 'payslips',
  'feedback': 'feedback',
  'grievances': 'grievances',
  'support_tickets': 'supportTickets',
  'availability_slots': 'availabilitySlots',
  'working_hours': 'workingHours',
  'ptm_requests': 'ptmRequests',
  'inventory': 'inventory',
  'branches': 'branches',
  'tie_up_schools': 'tieUpSchools',
  'id_cards': 'idCards',
  'library': 'library',
  'hostel': 'hostel',
  'reports': 'reports',
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
  if (route.path === '/dashboard' || route.path === '/' || route.path === '/profile') {
    return null;
  }
  
  // Check if module's feature is enabled
  if (!isModuleEnabled(route.module)) {
    return null;
  }
  
  const Component = getRouteComponent(route.path);
  const requiresAction = route.action && route.action !== 'view';
  
  return (
    <Route
      key={route.path}
      path={route.path}
      element={
        <ProtectedRoute
          requiredModule={route.module}
          requiredAction={requiresAction ? route.action : undefined}
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
                  {/* Core Routes - Always Available (eagerly loaded) */}
                  <Route path="/" element={<Dashboard />} />
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
                </Route>

                {/* 404 - Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </PermissionProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
