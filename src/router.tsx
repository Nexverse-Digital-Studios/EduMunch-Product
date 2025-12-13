import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import { AdminDashboard } from './pages/AdminDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { ParentDashboard } from './pages/ParentDashboard';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { StatusPage } from './pages/StatusPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import UserManagementPage from './pages/admin/UserManagementPage';
import RoleManagementPage from './pages/admin/RoleManagementPage';
import AdmissionsPage from './pages/AdmissionsPage';
import AssignmentManagementPage from './pages/AssignmentManagementPage';
import AttendanceManagementPage from './pages/AttendanceManagementPage';
import BatchManagementPage from './pages/BatchManagementPage';
import CourseManagementPage from './pages/CourseManagementPage';
import BranchManagementPage from './pages/BranchManagementPage';
import { LeaveApplicationsPage } from './pages/admin/LeaveApplicationsPage';
import { LectureTimingTemplatesPage } from './pages/admin/LectureTimingTemplatesPage';
import { NotificationsPage } from './pages/admin/NotificationsPage';
import { PaymentManagementPage } from './pages/admin/PaymentManagementPage';
import { PayslipManagementPage } from './pages/admin/PayslipManagementPage';
import { PTMRequestsPage } from './pages/admin/PTMRequestsPage';
import BoardExamsPage from './pages/admin/BoardExamsPage';
import SupportTicketsPage from './pages/admin/SupportTicketsPage';
import WorkingHoursPage from './pages/admin/WorkingHoursPage';
import SalaryStructuresPage from './pages/admin/SalaryStructuresPage';
import TopicsContentPage from './pages/admin/TopicsContentPage';
import TimetablesPage from './pages/admin/TimetablesPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: '/status',
        element: <StatusPage />,
      },
      {
        path: '/admin/dashboard',
        element: (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/users',
        element: (
          <ProtectedRoute>
            <UserManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/roles',
        element: (
          <ProtectedRoute>
            <RoleManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/admissions',
        element: (
          <ProtectedRoute>
            <AdmissionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/payments',
        element: (
          <ProtectedRoute>
            <PaymentManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/academics/courses',
        element: (
          <ProtectedRoute>
            <CourseManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/academics/subjects',
        element: <PlaceholderPage title="Subjects" description="Manage subjects" />,
      },
      {
        path: '/admin/academics/topics',
        element: (
          <ProtectedRoute>
            <TopicsContentPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/academics/batches',
        element: (
          <ProtectedRoute>
            <BatchManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/academics/timetables',
        element: (
          <ProtectedRoute>
            <TimetablesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/academics/attendance',
        element: (
          <ProtectedRoute>
            <AttendanceManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/academics/assignments',
        element: (
          <ProtectedRoute>
            <AssignmentManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/academics/results',
        element: (
          <ProtectedRoute>
            <BoardExamsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/academics/lecture-templates',
        element: (
          <ProtectedRoute>
            <LectureTimingTemplatesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/administration/users',
        element: <PlaceholderPage title="Users" description="Manage users" />,
      },
      {
        path: '/admin/administration/roles',
        element: <PlaceholderPage title="Roles & Permissions" description="Manage roles and permissions" />,
      },
      {
        path: '/admin/administration/branches',
        element: (
          <ProtectedRoute>
            <BranchManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/administration/inventory',
        element: (
          <ProtectedRoute>
            <PlaceholderPage title="Inventory" description="Manage inventory" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/administration/tie-up-schools',
        element: <PlaceholderPage title="Tie-Up Schools" description="Manage tie-up schools" />,
      },
      {
        path: '/admin/hr/employees',
        element: (
          <ProtectedRoute>
            <PlaceholderPage title="Employees" description="Manage employees" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/hr/salary',
        element: (
          <ProtectedRoute>
            <SalaryStructuresPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/hr/payslips',
        element: (
          <ProtectedRoute>
            <PayslipManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/hr/leave',
        element: (
          <ProtectedRoute>
            <LeaveApplicationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/hr/working-hours',
        element: (
          <ProtectedRoute>
            <WorkingHoursPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/hr/availability',
        element: <PlaceholderPage title="Availability Slots" description="Manage availability slots" />,
      },
      {
        path: '/admin/communications/announcements',
        element: (
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/communications/doubts',
        element: <PlaceholderPage title="Doubts/Q&A" description="Manage doubts and Q&A" />,
      },
      {
        path: '/admin/communications/feedback',
        element: (
          <ProtectedRoute>
            <PlaceholderPage title="Feedback" description="View feedback" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/communications/grievances',
        element: (
          <ProtectedRoute>
            <PlaceholderPage title="Grievances" description="Manage grievances" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/communications/ptm',
        element: (
          <ProtectedRoute>
            <PTMRequestsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/communications/support',
        element: (
          <ProtectedRoute>
            <SupportTicketsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/analytics/reports',
        element: <PlaceholderPage title="Custom Reports" description="Create custom reports" />,
      },
      {
        path: '/admin/analytics/dashboard',
        element: <PlaceholderPage title="Analytics Dashboard" description="View analytics" />,
      },
      {
        path: '/admin/analytics/audit-logs',
        element: <PlaceholderPage title="Audit Logs" description="View audit logs" />,
      },
      {
        path: '/admin/settings',
        element: <PlaceholderPage title="Settings" description="Configure system settings" />,
      },
      // Student routes
      {
        path: '/student/dashboard',
        element: (
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/student/courses',
        element: (
          <ProtectedRoute>
            <PlaceholderPage title="My Courses" description="View your courses" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/student/attendance',
        element: <PlaceholderPage title="Attendance" description="View your attendance" />,
      },
      {
        path: '/student/assignments',
        element: <PlaceholderPage title="Assignments" description="View your assignments" />,
      },
      {
        path: '/student/results',
        element: <PlaceholderPage title="Results" description="View your results" />,
      },
      {
        path: '/student/lms',
        element: <PlaceholderPage title="Learning Materials" description="Access learning materials" />,
      },
      {
        path: '/student/doubts',
        element: <PlaceholderPage title="Ask Doubts" description="Ask your doubts" />,
      },
      {
        path: '/student/payments',
        element: <PlaceholderPage title="Payments" description="Manage payments" />,
      },
      // Teacher routes
      {
        path: '/teacher/dashboard',
        element: (
          <ProtectedRoute>
            <TeacherDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/teacher/classes',
        element: (
          <ProtectedRoute>
            <PlaceholderPage title="My Classes" description="View your classes" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/teacher/attendance',
        element: <PlaceholderPage title="Mark Attendance" description="Mark attendance" />,
      },
      {
        path: '/teacher/assignments',
        element: <PlaceholderPage title="Assignments" description="Manage assignments" />,
      },
      {
        path: '/teacher/results',
        element: <PlaceholderPage title="Results & Grading" description="Manage results and grading" />,
      },
      {
        path: '/teacher/doubts',
        element: <PlaceholderPage title="Doubts/Q&A" description="Manage doubts" />,
      },
      {
        path: '/teacher/announcements',
        element: <PlaceholderPage title="Announcements" description="Create announcements" />,
      },
      {
        path: '/teacher/ptm',
        element: <PlaceholderPage title="Parent Meetings" description="Schedule meetings" />,
      },
      // Parent routes
      {
        path: '/parent/dashboard',
        element: (
          <ProtectedRoute>
            <ParentDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/parent/children',
        element: (
          <ProtectedRoute>
            <PlaceholderPage title="My Children" description="View your children's info" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/parent/attendance',
        element: <PlaceholderPage title="Attendance" description="View attendance" />,
      },
      {
        path: '/parent/results',
        element: <PlaceholderPage title="Results" description="View results" />,
      },
      {
        path: '/parent/announcements',
        element: <PlaceholderPage title="Announcements" description="View announcements" />,
      },
      {
        path: '/parent/messages',
        element: <PlaceholderPage title="Messages" description="Send and view messages" />,
      },
      {
        path: '/parent/ptm',
        element: <PlaceholderPage title="Meetings" description="Schedule meetings" />,
      },
      {
        path: '/parent/fees',
        element: <PlaceholderPage title="Fees & Payments" description="Manage fees and payments" />,
      },
    ],
  },
]);
