/**
 * EduMunch App Router
 * ====================
 *
 * Main application router with:
 * - Feature-based route registration (disabled features don't have routes)
 * - Permission-based access control
 * - Admin-only routes
 */

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
import { FEATURES, isFeatureEnabled } from "@/config/features.config";

// Pages
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
// Profile Management Pages (modular)
import { ProfilePage } from "@/pages/profile";
import Admissions from "@/pages/Admissions";
// Assignments Management Pages (modular)
import { AssignmentsList } from "@/pages/assignments";
// Attendance Management Pages (modular)
import {
  AttendanceList,
  MarkAttendancePage,
  ViewAttendancePage,
  AttendanceReportsPage,
  SubjectWiseAttendancePage,
  ExportAttendancePage,
  LeaveRequestsPage,
  CreateLeaveRequestPage,
  LeaveRequestDetailsPage,
} from "@/pages/attendance";
import AvailabilitySlots from "@/pages/AvailabilitySlots";
import Branches from "@/pages/Branches";
// Doubts Management Pages (modular)
import { DoubtsList } from "@/pages/doubts";
// Employees Management Pages (modular)
import {
  EmployeesList,
  EmployeeCreate,
  EmployeeDetail,
  EmployeeEdit,
} from "@/pages/employees";
// Batches Management Pages (modular)
import {
  BatchesList,
  BatchCreate,
  BatchDetail,
  BatchEdit,
} from "@/pages/batches";
import Enrollments from "@/pages/Enrollments";
import Feedback from "@/pages/Feedback";
import Grievances from "@/pages/Grievances";
// Inventory Management Pages (modular)
import { InventoryList } from "@/pages/inventory";
import LeaveManagement from "@/pages/LeaveManagement";
import LectureTemplates from "@/pages/LectureTemplates";
// Lecture Templates Management Pages (modular)
import {
  LectureTemplatesList,
  LectureTemplateCreate,
  LectureTemplateDetail,
  LectureTemplateEdit,
} from "@/pages/lecture-templates";
// Exams Management Pages (modular)
import {
  ExamsList,
  ExamCreate,
  ExamDetail,
  ExamEdit,
  ExamSchedulePage,
  MarksEntryPage,
  ReportCardsPage,
  ExamsExportPage,
} from "@/pages/exams";
// Fee Management Pages (modular)
import {
  FeeStructuresList,
  FeeStructureCreate,
  FeeStructureDetail,
  FeeStructureEdit,
  StudentFeesList,
  FeeCollectionPage,
  FeeReceiptsPage,
  FeeReportsPage,
  FeesExportPage,
} from "@/pages/fees";
// Student Management Pages (modular)
import {
  StudentsList,
  StudentCreate,
  StudentDetail,
  StudentEdit,
  StudentsExport,
} from "@/pages/students";
// Parent Management Pages (modular)
import {
  ParentsList,
  ParentCreate,
  ParentDetail,
  ParentEdit,
} from "@/pages/parents";
import Notifications from "@/pages/Notifications";
// Payments Management Pages (modular)
import { PaymentsList } from "@/pages/payments";
import Payslips from "@/pages/Payslips";
import PTMRequests from "@/pages/PTMRequests";
// Results Management Pages (modular)
import { ResultsList } from "@/pages/results";
import SalaryStructures from "@/pages/SalaryStructures";
// Set Roles Management Pages (modular)
import { SetRolesList } from "@/pages/set-roles";
import SupportTickets from "@/pages/SupportTickets";
// Timetables Management Pages (modular)
import {
  TimetablesList,
  TimetableDashboard,
  ViewTimetablesPage,
  SectionTimetablePage,
  CreateTimetablePage,
  EditTimetablePage,
  BulkCreatePage,
  CopySchedulePage,
  ConflictsPage,
  SubstitutePage,
  PeriodsPage,
  ExportTimetablePage,
  MyTimetablePage,
  ClassTimetablePage,
} from "@/pages/timetables";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFound from "@/pages/NotFound";

// User Management Pages (modular)
import { UsersList, UserCreate, UserDetail, UserEdit } from "@/pages/users";

// Role Management Pages (modular)
import { RolesList, RoleCreate, RoleDetail, RoleEdit } from "@/pages/roles";

// Classes Management Pages (modular)
import {
  ClassesList,
  ClassCreate,
  ClassDetail,
  ClassEdit,
} from "@/pages/classes";

// Sections Management Pages (modular)
import {
  SectionsList,
  SectionCreate,
  SectionDetail,
  SectionEdit,
} from "@/pages/sections";

// Subjects Management Pages (modular)
import {
  SubjectsList,
  SubjectCreate,
  SubjectDetail,
  SubjectEdit,
} from "@/pages/subjects";

// Topics Management Pages (modular)
import {
  TopicsList,
  TopicCreate,
  TopicDetail,
  TopicEdit,
} from "@/pages/topics";

// Staff Attendance Management Pages (modular)
import {
  StaffAttendanceDashboard,
  MarkStaffAttendancePage,
  ViewStaffAttendancePage,
  EmployeeAttendanceDetailPage,
  StaffAttendanceReportsPage,
  MonthlyReportPage,
  ExportStaffAttendancePage,
} from "@/pages/staff-attendance";

// Academic Years Management Pages (modular)
import {
  AcademicYearsList,
  AcademicYearCreate,
  AcademicYearDetail,
  AcademicYearEdit,
} from "@/pages/academic-years";

// Teachers Management Pages (modular)
import {
  TeachersList,
  TeacherCreate,
  TeacherDetail,
  TeacherEdit,
  TeachersExport,
} from "@/pages/teachers";

// ID Cards Management Pages (modular)
import {
  IDCardsDashboard,
  StudentIDCards,
  StaffIDCards,
  IDCardTemplates,
} from "@/pages/id-cards";

// Reports & Analytics Pages (modular)
import {
  ReportsDashboard,
  StudentPerformanceReport,
  AttendanceSummaryReport,
  AcademicTrendsReport,
  FeeCollectionReport,
} from "@/pages/reports";

// Library Management Pages (modular)
import {
  LibraryDashboard,
  BooksList,
  BookIssue,
  BookReturn,
  LibraryMembers,
} from "@/pages/library";

// Transport Management Pages (modular)
import {
  TransportDashboard,
  RoutesList,
  VehiclesList,
  DriversList,
  StudentTransportList,
} from "@/pages/transport";

// Hostel Management Pages (modular)
import {
  HostelDashboard,
  BlocksList,
  RoomsList,
  AllocationsList,
  ComplaintsList,
} from "@/pages/hostel";

const queryClient = new QueryClient();

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
                {/* Public route */}
                <Route path="/auth" element={<Auth />} />

                {/* Protected routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Core Routes - Always Available */}
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/profile" element={<ProfilePage />} />

                  {/* User Management (Tier 1) */}
                  {FEATURES.users && (
                    <>
                      <Route
                        path="/users"
                        element={
                          <ProtectedRoute requiredModule="users">
                            <UsersList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/users/create"
                        element={
                          <ProtectedRoute
                            requiredModule="users"
                            requiredAction="create"
                          >
                            <UserCreate />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/users/:id"
                        element={
                          <ProtectedRoute requiredModule="users">
                            <UserDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/users/:id/edit"
                        element={
                          <ProtectedRoute
                            requiredModule="users"
                            requiredAction="update"
                          >
                            <UserEdit />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}
                  {FEATURES.roles && (
                    <>
                      <Route
                        path="/roles"
                        element={
                          <ProtectedRoute requiredModule="roles">
                            <RolesList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/roles/create"
                        element={
                          <ProtectedRoute
                            requiredModule="roles"
                            requiredAction="create"
                          >
                            <RoleCreate />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/roles/:id"
                        element={
                          <ProtectedRoute requiredModule="roles">
                            <RoleDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/roles/:id/edit"
                        element={
                          <ProtectedRoute
                            requiredModule="roles"
                            requiredAction="update"
                          >
                            <RoleEdit />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}

                  {/* Admin Only - Set Roles */}
                  {FEATURES.setRoles && (
                    <Route
                      path="/set-roles"
                      element={
                        <ProtectedRoute adminOnly>
                          <SetRolesList />
                        </ProtectedRoute>
                      }
                    />
                  )}

                  {/* Student Management (Tier 1) */}
                  {FEATURES.admissions && (
                    <Route
                      path="/admissions"
                      element={
                        <ProtectedRoute requiredModule="admissions">
                          <Admissions />
                        </ProtectedRoute>
                      }
                    />
                  )}

                  {/* Students Module (Tier 1) */}
                  {FEATURES.students && (
                    <>
                      <Route
                        path="/students"
                        element={
                          <ProtectedRoute requiredModule="students">
                            <StudentsList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/students/create"
                        element={
                          <ProtectedRoute
                            requiredModule="students"
                            requiredAction="create"
                          >
                            <StudentCreate />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/students/export"
                        element={
                          <ProtectedRoute
                            requiredModule="students"
                            requiredAction="export"
                          >
                            <StudentsExport />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/students/:id"
                        element={
                          <ProtectedRoute requiredModule="students">
                            <StudentDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/students/:id/edit"
                        element={
                          <ProtectedRoute
                            requiredModule="students"
                            requiredAction="update"
                          >
                            <StudentEdit />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}

                  {/* Parents Module (Tier 1) */}
                  {FEATURES.parents && (
                    <>
                      <Route
                        path="/parents"
                        element={
                          <ProtectedRoute requiredModule="parents">
                            <ParentsList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/parents/create"
                        element={
                          <ProtectedRoute
                            requiredModule="parents"
                            requiredAction="create"
                          >
                            <ParentCreate />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/parents/:id"
                        element={
                          <ProtectedRoute requiredModule="parents">
                            <ParentDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/parents/:id/edit"
                        element={
                          <ProtectedRoute
                            requiredModule="parents"
                            requiredAction="update"
                          >
                            <ParentEdit />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}

                  {/* Academic Structure (Tier 1) */}
                  {FEATURES.classes && (
                    <>
                      <Route
                        path="/classes"
                        element={
                          <ProtectedRoute requiredModule="classes">
                            <ClassesList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/classes/create"
                        element={
                          <ProtectedRoute
                            requiredModule="classes"
                            requiredAction="create"
                          >
                            <ClassCreate />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/classes/:id"
                        element={
                          <ProtectedRoute requiredModule="classes">
                            <ClassDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/classes/:id/edit"
                        element={
                          <ProtectedRoute
                            requiredModule="classes"
                            requiredAction="update"
                          >
                            <ClassEdit />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}
                  {FEATURES.sections && (
                    <>
                      <Route
                        path="/batches"
                        element={
                          <ProtectedRoute requiredModule="sections">
                            <BatchesList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/batches/create"
                        element={
                          <ProtectedRoute
                            requiredModule="sections"
                            requiredAction="create"
                          >
                            <BatchCreate />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/batches/:id"
                        element={
                          <ProtectedRoute requiredModule="sections">
                            <BatchDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/batches/:id/edit"
                        element={
                          <ProtectedRoute
                            requiredModule="sections"
                            requiredAction="update"
                          >
                            <BatchEdit />
                          </ProtectedRoute>
                        }
                      />
                      {/* Sections routes */}
                      <Route
                        path="/sections"
                        element={
                          <ProtectedRoute requiredModule="sections">
                            <SectionsList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/sections/create"
                        element={
                          <ProtectedRoute
                            requiredModule="sections"
                            requiredAction="create"
                          >
                            <SectionCreate />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/sections/:id"
                        element={
                          <ProtectedRoute requiredModule="sections">
                            <SectionDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/sections/:id/edit"
                        element={
                          <ProtectedRoute
                            requiredModule="sections"
                            requiredAction="update"
                          >
                            <SectionEdit />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}
                  {FEATURES.subjects && (
                    <>
                      <Route
                        path="/subjects"
                        element={
                          <ProtectedRoute requiredModule="subjects">
                            <SubjectsList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/subjects/create"
                        element={
                          <ProtectedRoute
                            requiredModule="subjects"
                            requiredAction="create"
                          >
                            <SubjectCreate />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/subjects/:id"
                        element={
                          <ProtectedRoute requiredModule="subjects">
                            <SubjectDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/subjects/:id/edit"
                        element={
                          <ProtectedRoute
                            requiredModule="subjects"
                            requiredAction="update"
                          >
                            <SubjectEdit />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}
                  {FEATURES.topics && (
                    <>
                      <Route
                        path="/topics"
                        element={
                          <ProtectedRoute requiredModule="topics">
                            <TopicsList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/topics/create"
                        element={
                          <ProtectedRoute
                            requiredModule="topics"
                            requiredAction="create"
                          >
                            <TopicCreate />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/topics/:id"
                        element={
                          <ProtectedRoute requiredModule="topics">
                            <TopicDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/topics/:id/edit"
                        element={
                          <ProtectedRoute
                            requiredModule="topics"
                            requiredAction="update"
                          >
                            <TopicEdit />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}

                  {/* Staff Management (Tier 1) */}
                  {FEATURES.employees && (
                    <>
                      <Route
                        path="/employees"
                        element={
                          <ProtectedRoute requiredModule="employees">
                            <EmployeesList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/employees/create"
                        element={
                          <ProtectedRoute
                            requiredModule="employees"
                            requiredAction="create"
                          >
                            <EmployeeCreate />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/employees/:id"
                        element={
                          <ProtectedRoute requiredModule="employees">
                            <EmployeeDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/employees/:id/edit"
                        element={
                          <ProtectedRoute
                            requiredModule="employees"
                            requiredAction="update"
                          >
                            <EmployeeEdit />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}

                  {/* Attendance (Tier 1) */}
                  {FEATURES.attendance && (
                    <>
                      <Route
                        path="/attendance"
                        element={
                          <ProtectedRoute requiredModule="attendance">
                            <AttendanceList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/attendance/mark"
                        element={
                          <ProtectedRoute
                            requiredModule="attendance"
                            requiredAction="create"
                          >
                            <MarkAttendancePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/attendance/mark/:sectionId"
                        element={
                          <ProtectedRoute
                            requiredModule="attendance"
                            requiredAction="create"
                          >
                            <MarkAttendancePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/attendance/view"
                        element={
                          <ProtectedRoute requiredModule="attendance">
                            <ViewAttendancePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/attendance/view/:sectionId"
                        element={
                          <ProtectedRoute requiredModule="attendance">
                            <ViewAttendancePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/attendance/view/student/:studentId"
                        element={
                          <ProtectedRoute requiredModule="attendance">
                            <ViewAttendancePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/attendance/reports"
                        element={
                          <ProtectedRoute requiredModule="attendance">
                            <AttendanceReportsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/attendance/reports/:reportType"
                        element={
                          <ProtectedRoute requiredModule="attendance">
                            <AttendanceReportsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/attendance/subject-wise"
                        element={
                          <ProtectedRoute
                            requiredModule="attendance"
                            requiredAction="create"
                          >
                            <SubjectWiseAttendancePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/attendance/export"
                        element={
                          <ProtectedRoute requiredModule="attendance">
                            <ExportAttendancePage />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}

                  {/* Leave Requests */}
                  {FEATURES.leaveManagement && (
                    <>
                      <Route
                        path="/leave-requests"
                        element={
                          <ProtectedRoute requiredModule="leave">
                            <LeaveRequestsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/leave-requests/create"
                        element={
                          <ProtectedRoute
                            requiredModule="leave"
                            requiredAction="create"
                          >
                            <CreateLeaveRequestPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/leave-requests/:id"
                        element={
                          <ProtectedRoute requiredModule="leave">
                            <LeaveRequestDetailsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/leave-requests/:id/approve"
                        element={
                          <ProtectedRoute
                            requiredModule="leave"
                            requiredAction="approve"
                          >
                            <LeaveRequestDetailsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/leave-management"
                        element={
                          <ProtectedRoute requiredModule="leave">
                            <LeaveManagement />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}

                  {/* Staff Attendance (Tier 1) */}
                  {FEATURES.attendance && (
                    <>
                      <Route
                        path="/staff/attendance"
                        element={
                          <ProtectedRoute requiredModule="staff_attendance">
                            <StaffAttendanceDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/staff/attendance/mark"
                        element={
                          <ProtectedRoute
                            requiredModule="staff_attendance"
                            requiredAction="create"
                          >
                            <MarkStaffAttendancePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/staff/attendance/view"
                        element={
                          <ProtectedRoute requiredModule="staff_attendance">
                            <ViewStaffAttendancePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/staff/attendance/view/:employeeId"
                        element={
                          <ProtectedRoute requiredModule="staff_attendance">
                            <EmployeeAttendanceDetailPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/staff/attendance/reports"
                        element={
                          <ProtectedRoute requiredModule="staff_attendance">
                            <StaffAttendanceReportsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/staff/attendance/reports/monthly"
                        element={
                          <ProtectedRoute requiredModule="staff_attendance">
                            <MonthlyReportPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/staff/attendance/export"
                        element={
                          <ProtectedRoute requiredModule="staff_attendance">
                            <ExportStaffAttendancePage />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}

                  {/* Academic Years (Tier 1) */}
                  {FEATURES.classes && (
                    <>
                      <Route
                        path="/academic-years"
                        element={
                          <ProtectedRoute requiredModule="academic_years">
                            <AcademicYearsList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/academic-years/create"
                        element={
                          <ProtectedRoute
                            requiredModule="academic_years"
                            requiredAction="create"
                          >
                            <AcademicYearCreate />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/academic-years/:id"
                        element={
                          <ProtectedRoute requiredModule="academic_years">
                            <AcademicYearDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/academic-years/:id/edit"
                        element={
                          <ProtectedRoute
                            requiredModule="academic_years"
                            requiredAction="update"
                          >
                            <AcademicYearEdit />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}

                  {/* Teachers (Tier 1) */}
                  {FEATURES.teachers && (
                    <>
                      <Route
                        path="/teachers"
                        element={
                          <ProtectedRoute requiredModule="teachers">
                            <TeachersList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/teachers/create"
                        element={
                          <ProtectedRoute
                            requiredModule="teachers"
                            requiredAction="create"
                          >
                            <TeacherCreate />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/teachers/export"
                        element={
                          <ProtectedRoute
                            requiredModule="teachers"
                            requiredAction="export"
                          >
                            <TeachersExport />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/teachers/:id"
                        element={
                          <ProtectedRoute requiredModule="teachers">
                            <TeacherDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/teachers/:id/edit"
                        element={
                          <ProtectedRoute
                            requiredModule="teachers"
                            requiredAction="update"
                          >
                            <TeacherEdit />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}

                  {/* Timetable (Tier 1) */}
                  {FEATURES.timetables && (
                    <>
                      <Route
                        path="/timetables"
                        element={
                          <ProtectedRoute requiredModule="timetable">
                            <TimetablesList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/timetable"
                        element={
                          <ProtectedRoute requiredModule="timetable">
                            <TimetableDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/timetable/view"
                        element={
                          <ProtectedRoute requiredModule="timetable">
                            <ViewTimetablesPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/timetable/view/:sectionId"
                        element={
                          <ProtectedRoute requiredModule="timetable">
                            <SectionTimetablePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/timetable/create"
                        element={
                          <ProtectedRoute
                            requiredModule="timetable"
                            requiredAction="create"
                          >
                            <CreateTimetablePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/timetable/:id/edit"
                        element={
                          <ProtectedRoute
                            requiredModule="timetable"
                            requiredAction="update"
                          >
                            <EditTimetablePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/timetable/bulk-create"
                        element={
                          <ProtectedRoute
                            requiredModule="timetable"
                            requiredAction="create"
                          >
                            <BulkCreatePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/timetable/copy"
                        element={
                          <ProtectedRoute
                            requiredModule="timetable"
                            requiredAction="create"
                          >
                            <CopySchedulePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/timetable/conflicts"
                        element={
                          <ProtectedRoute requiredModule="timetable">
                            <ConflictsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/timetable/substitute"
                        element={
                          <ProtectedRoute
                            requiredModule="timetable"
                            requiredAction="update"
                          >
                            <SubstitutePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/timetable/periods"
                        element={
                          <ProtectedRoute
                            requiredModule="timetable"
                            requiredAction="update"
                          >
                            <PeriodsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/timetable/export"
                        element={
                          <ProtectedRoute
                            requiredModule="timetable"
                            requiredAction="export"
                          >
                            <ExportTimetablePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/my-timetable"
                        element={
                          <ProtectedRoute requiredModule="timetable">
                            <MyTimetablePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/class-timetable"
                        element={
                          <ProtectedRoute requiredModule="timetable">
                            <ClassTimetablePage />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}
                  {FEATURES.lectureTemplates && (
                    <>
                      <Route
                        path="/lecture-templates"
                        element={
                          <ProtectedRoute requiredModule="lecture_templates">
                            <LectureTemplatesList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/lecture-templates/create"
                        element={
                          <ProtectedRoute
                            requiredModule="lecture_templates"
                            requiredAction="create"
                          >
                            <LectureTemplateCreate />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/lecture-templates/:id"
                        element={
                          <ProtectedRoute requiredModule="lecture_templates">
                            <LectureTemplateDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/lecture-templates/:id/edit"
                        element={
                          <ProtectedRoute
                            requiredModule="lecture_templates"
                            requiredAction="update"
                          >
                            <LectureTemplateEdit />
                          </ProtectedRoute>
                        }
                      />
                      {/* Legacy route for old LectureTemplates page */}
                      <Route
                        path="/lecture-templates-legacy"
                        element={
                          <ProtectedRoute requiredModule="lecture_templates">
                            <LectureTemplates />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}

                  {/* Examinations Module (Tier 1) */}
                  {FEATURES.exams && (
                    <>
                      <Route
                        path="/exams"
                        element={
                          <ProtectedRoute requiredModule="exams">
                            <ExamsList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/exams/create"
                        element={
                          <ProtectedRoute
                            requiredModule="exams"
                            requiredAction="create"
                          >
                            <ExamCreate />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/exams/export"
                        element={
                          <ProtectedRoute
                            requiredModule="exams"
                            requiredAction="export"
                          >
                            <ExamsExportPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/exams/:id"
                        element={
                          <ProtectedRoute requiredModule="exams">
                            <ExamDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/exams/:id/edit"
                        element={
                          <ProtectedRoute
                            requiredModule="exams"
                            requiredAction="update"
                          >
                            <ExamEdit />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/exams/:id/schedule"
                        element={
                          <ProtectedRoute requiredModule="exams">
                            <ExamSchedulePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/exams/:id/marks"
                        element={
                          <ProtectedRoute requiredModule="exams">
                            <MarksEntryPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/exams/:id/marks/enter"
                        element={
                          <ProtectedRoute
                            requiredModule="exams"
                            requiredAction="update"
                          >
                            <MarksEntryPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/exams/:id/report-cards"
                        element={
                          <ProtectedRoute requiredModule="exams">
                            <ReportCardsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/report-cards"
                        element={
                          <ProtectedRoute requiredModule="exams">
                            <ReportCardsPage />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}

                  {/* Exams & Results (Tier 1) */}
                  {FEATURES.results && (
                    <Route
                      path="/results"
                      element={
                        <ProtectedRoute requiredModule="marks">
                          <ResultsList />
                        </ProtectedRoute>
                      }
                    />
                  )}

                  {/* Fee Management (Tier 1) */}
                  {FEATURES.payments && (
                    <>
                      <Route
                        path="/payments"
                        element={
                          <ProtectedRoute requiredModule="payments">
                            <PaymentsList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/enrollments"
                        element={
                          <ProtectedRoute requiredModule="payments">
                            <Enrollments />
                          </ProtectedRoute>
                        }
                      />
                      {/* Fee Structures */}
                      <Route
                        path="/fees/structures"
                        element={
                          <ProtectedRoute requiredModule="fees">
                            <FeeStructuresList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/fees/structures/create"
                        element={
                          <ProtectedRoute
                            requiredModule="fees"
                            requiredAction="create"
                          >
                            <FeeStructureCreate />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/fees/structures/:id"
                        element={
                          <ProtectedRoute requiredModule="fees">
                            <FeeStructureDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/fees/structures/:id/edit"
                        element={
                          <ProtectedRoute
                            requiredModule="fees"
                            requiredAction="update"
                          >
                            <FeeStructureEdit />
                          </ProtectedRoute>
                        }
                      />
                      {/* Student Fees */}
                      <Route
                        path="/fees/students"
                        element={
                          <ProtectedRoute requiredModule="fees">
                            <StudentFeesList />
                          </ProtectedRoute>
                        }
                      />
                      {/* Fee Collection */}
                      <Route
                        path="/fees/collect"
                        element={
                          <ProtectedRoute
                            requiredModule="fees"
                            requiredAction="create"
                          >
                            <FeeCollectionPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/fees/collect/:studentFeeId"
                        element={
                          <ProtectedRoute
                            requiredModule="fees"
                            requiredAction="create"
                          >
                            <FeeCollectionPage />
                          </ProtectedRoute>
                        }
                      />
                      {/* Fee Receipts */}
                      <Route
                        path="/fees/receipts"
                        element={
                          <ProtectedRoute requiredModule="fees">
                            <FeeReceiptsPage />
                          </ProtectedRoute>
                        }
                      />
                      {/* Fee Reports */}
                      <Route
                        path="/fees/reports"
                        element={
                          <ProtectedRoute requiredModule="fees">
                            <FeeReportsPage />
                          </ProtectedRoute>
                        }
                      />
                      {/* Fee Export */}
                      <Route
                        path="/fees/export"
                        element={
                          <ProtectedRoute
                            requiredModule="fees"
                            requiredAction="export"
                          >
                            <FeesExportPage />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}

                  {/* Communication (Tier 1) */}
                  {FEATURES.notifications && (
                    <Route
                      path="/notifications"
                      element={
                        <ProtectedRoute requiredModule="notifications">
                          <Notifications />
                        </ProtectedRoute>
                      }
                    />
                  )}
                  {FEATURES.announcements && (
                    <Route
                      path="/announcements"
                      element={
                        <ProtectedRoute requiredModule="announcements">
                          <PlaceholderPage />
                        </ProtectedRoute>
                      }
                    />
                  )}
 
                  {/* LMS Features (Tier 2) */}
                  {FEATURES.assignments && (
                    <Route
                      path="/assignments"
                      element={
                        <ProtectedRoute
                          requiredModule="assignments"
                          requiredFeature="assignments"
                        >
                          <AssignmentsList />
                        </ProtectedRoute>
                      }
                    />
                  )}
                  {FEATURES.doubts && (
                    <Route
                      path="/doubts"
                      element={
                        <ProtectedRoute
                          requiredModule="doubts"
                          requiredFeature="doubts"
                        >
                          <DoubtsList />
                        </ProtectedRoute>
                      }
                    />
                  )}

                  {/* Advanced Academic (Tier 2) */}
                  {FEATURES.availabilitySlots && (
                    <Route
                      path="/availability-slots"
                      element={
                        <ProtectedRoute
                          requiredModule="availability_slots"
                          requiredFeature="availabilitySlots"
                        >
                          <AvailabilitySlots />
                        </ProtectedRoute>
                      }
                    />
                  )}
                  {FEATURES.ptmRequests && (
                    <Route
                      path="/ptm-requests"
                      element={
                        <ProtectedRoute
                          requiredModule="ptm_requests"
                          requiredFeature="ptmRequests"
                        >
                          <PTMRequests />
                        </ProtectedRoute>
                      }
                    />
                  )}

                  {/* Feedback & Support (Tier 2) */}
                  {FEATURES.feedback && (
                    <Route
                      path="/feedback"
                      element={
                        <ProtectedRoute
                          requiredModule="feedback"
                          requiredFeature="feedback"
                        >
                          <Feedback />
                        </ProtectedRoute>
                      }
                    />
                  )}
                  {FEATURES.grievances && (
                    <Route
                      path="/grievances"
                      element={
                        <ProtectedRoute
                          requiredModule="grievances"
                          requiredFeature="grievances"
                        >
                          <Grievances />
                        </ProtectedRoute>
                      }
                    />
                  )}
                  {FEATURES.supportTickets && (
                    <Route
                      path="/support-tickets"
                      element={
                        <ProtectedRoute
                          requiredModule="support_tickets"
                          requiredFeature="supportTickets"
                        >
                          <SupportTickets />
                        </ProtectedRoute>
                      }
                    />
                  )}

                  {/* HR & Payroll (Tier 2) */}
                  {FEATURES.salaryStructures && (
                    <Route
                      path="/salary-structures"
                      element={
                        <ProtectedRoute
                          requiredModule="salary_structures"
                          requiredFeature="salaryStructures"
                        >
                          <SalaryStructures />
                        </ProtectedRoute>
                      }
                    />
                  )}
                  {FEATURES.payslips && (
                    <Route
                      path="/payslips"
                      element={
                        <ProtectedRoute
                          requiredModule="payslips"
                          requiredFeature="payslips"
                        >
                          <Payslips />
                        </ProtectedRoute>
                      }
                    />
                  )}
                  {FEATURES.workingHours && (
                    <Route
                      path="/working-hours"
                      element={
                        <ProtectedRoute
                          requiredModule="working_hours"
                          requiredFeature="workingHours"
                        >
                          <PlaceholderPage />
                        </ProtectedRoute>
                      }
                    />
                  )}

                  {/* Multi-Branch (Tier 3) */}
                  {FEATURES.branches && (
                    <Route
                      path="/branches"
                      element={
                        <ProtectedRoute
                          requiredModule="branches"
                          requiredFeature="branches"
                        >
                          <Branches />
                        </ProtectedRoute>
                      }
                    />
                  )}
                  {FEATURES.tieUpSchools && (
                    <Route
                      path="/tie-up-schools"
                      element={
                        <ProtectedRoute
                          requiredModule="tie_up_schools"
                          requiredFeature="tieUpSchools"
                        >
                          <PlaceholderPage />
                        </ProtectedRoute>
                      }
                    />
                  )}

                  {/* Inventory (Tier 3) */}
                  {FEATURES.inventory && (
                    <Route
                      path="/inventory"
                      element={
                        <ProtectedRoute
                          requiredModule="inventory"
                          requiredFeature="inventory"
                        >
                          <InventoryList />
                        </ProtectedRoute>
                      }
                    />
                  )}

                  {/* ID Cards (Tier 3) */}
                  {FEATURES.idCards && (
                    <>
                      <Route
                        path="/id-cards"
                        element={
                          <ProtectedRoute requiredModule="id_cards">
                            <IDCardsDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/id-cards/students"
                        element={
                          <ProtectedRoute requiredModule="id_cards">
                            <StudentIDCards />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/id-cards/students/generate"
                        element={
                          <ProtectedRoute
                            requiredModule="id_cards"
                            requiredAction="create"
                          >
                            <StudentIDCards />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/id-cards/staff"
                        element={
                          <ProtectedRoute requiredModule="id_cards">
                            <StaffIDCards />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/id-cards/staff/generate"
                        element={
                          <ProtectedRoute
                            requiredModule="id_cards"
                            requiredAction="create"
                          >
                            <StaffIDCards />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/id-cards/templates"
                        element={
                          <ProtectedRoute requiredModule="id_cards">
                            <IDCardTemplates />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/id-cards/bulk-generate"
                        element={
                          <ProtectedRoute
                            requiredModule="id_cards"
                            requiredAction="create"
                          >
                            <StudentIDCards />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}

                  {/* Transport Management (Tier 2) */}
                  {FEATURES.transport && (
                    <>
                      <Route
                        path="/transport"
                        element={
                          <ProtectedRoute requiredModule="transport">
                            <TransportDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/transport/routes"
                        element={
                          <ProtectedRoute requiredModule="transport">
                            <RoutesList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/transport/vehicles"
                        element={
                          <ProtectedRoute requiredModule="transport">
                            <VehiclesList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/transport/drivers"
                        element={
                          <ProtectedRoute requiredModule="transport">
                            <DriversList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/transport/students"
                        element={
                          <ProtectedRoute requiredModule="transport">
                            <StudentTransportList />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}

                  {/* Hostel Management (Tier 3) */}
                  {FEATURES.hostel && (
                    <>
                      <Route
                        path="/hostel"
                        element={
                          <ProtectedRoute requiredModule="hostel">
                            <HostelDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/hostel/blocks"
                        element={
                          <ProtectedRoute requiredModule="hostel">
                            <BlocksList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/hostel/rooms"
                        element={
                          <ProtectedRoute requiredModule="hostel">
                            <RoomsList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/hostel/allocations"
                        element={
                          <ProtectedRoute requiredModule="hostel">
                            <AllocationsList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/hostel/complaints"
                        element={
                          <ProtectedRoute requiredModule="hostel">
                            <ComplaintsList />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}

                  {/* Library Management (Tier 3) */}
                  {FEATURES.library && (
                    <>
                      <Route
                        path="/library"
                        element={
                          <ProtectedRoute requiredModule="library">
                            <LibraryDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/library/books"
                        element={
                          <ProtectedRoute requiredModule="library">
                            <BooksList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/library/issue"
                        element={
                          <ProtectedRoute
                            requiredModule="library"
                            requiredAction="create"
                          >
                            <BookIssue />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/library/return"
                        element={
                          <ProtectedRoute
                            requiredModule="library"
                            requiredAction="update"
                          >
                            <BookReturn />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/library/members"
                        element={
                          <ProtectedRoute requiredModule="library">
                            <LibraryMembers />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}

                  {/* Reports & Analytics (Tier 3) */}
                  {FEATURES.reports && (
                    <>
                      <Route
                        path="/reports"
                        element={
                          <ProtectedRoute requiredModule="reports">
                            <ReportsDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/reports/student-performance"
                        element={
                          <ProtectedRoute requiredModule="reports">
                            <StudentPerformanceReport />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/reports/attendance-summary"
                        element={
                          <ProtectedRoute requiredModule="reports">
                            <AttendanceSummaryReport />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/reports/academic-trends"
                        element={
                          <ProtectedRoute requiredModule="reports">
                            <AcademicTrendsReport />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/reports/fee-collection"
                        element={
                          <ProtectedRoute requiredModule="reports">
                            <FeeCollectionReport />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}
                </Route>

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
