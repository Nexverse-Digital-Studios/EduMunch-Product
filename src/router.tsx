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
        path: '/admin/admissions',
        element: <PlaceholderPage title="Admissions" description="Manage student admissions" />,
      },
      {
        path: '/admin/enrollments',
        element: <PlaceholderPage title="Enrollments" description="Manage student enrollments" />,
      },
      {
        path: '/admin/payments',
        element: <PlaceholderPage title="Payments" description="Manage student payments" />,
      },
      {
        path: '/admin/academics/courses',
        element: <PlaceholderPage title="Courses" description="Manage courses" />,
      },
      {
        path: '/admin/academics/subjects',
        element: <PlaceholderPage title="Subjects" description="Manage subjects" />,
      },
      {
        path: '/admin/academics/topics',
        element: <PlaceholderPage title="Topics & Content" description="Manage topics and content" />,
      },
      {
        path: '/admin/academics/batches',
        element: <PlaceholderPage title="Batches" description="Manage batches" />,
      },
      {
        path: '/admin/academics/timetables',
        element: <PlaceholderPage title="Timetables" description="Manage timetables" />,
      },
      {
        path: '/admin/academics/attendance',
        element: <PlaceholderPage title="Attendance" description="Mark attendance" />,
      },
      {
        path: '/admin/academics/assignments',
        element: <PlaceholderPage title="Assignments" description="Manage assignments" />,
      },
      {
        path: '/admin/academics/results',
        element: <PlaceholderPage title="Results" description="Manage results" />,
      },
      {
        path: '/admin/academics/lecture-templates',
        element: <PlaceholderPage title="Lecture Templates" description="Manage lecture templates" />,
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
        element: <PlaceholderPage title="Branches" description="Manage branches" />,
      },
      {
        path: '/admin/administration/inventory',
        element: <PlaceholderPage title="Inventory" description="Manage inventory" />,
      },
      {
        path: '/admin/administration/tie-up-schools',
        element: <PlaceholderPage title="Tie-Up Schools" description="Manage tie-up schools" />,
      },
      {
        path: '/admin/hr/employees',
        element: <PlaceholderPage title="Employees" description="Manage employees" />,
      },
      {
        path: '/admin/hr/salary',
        element: <PlaceholderPage title="Salary Structures" description="Manage salary structures" />,
      },
      {
        path: '/admin/hr/payslips',
        element: <PlaceholderPage title="Payslips" description="Manage payslips" />,
      },
      {
        path: '/admin/hr/leave',
        element: <PlaceholderPage title="Leave Management" description="Manage leaves" />,
      },
      {
        path: '/admin/hr/working-hours',
        element: <PlaceholderPage title="Working Hours" description="Manage working hours" />,
      },
      {
        path: '/admin/hr/availability',
        element: <PlaceholderPage title="Availability Slots" description="Manage availability slots" />,
      },
      {
        path: '/admin/communications/announcements',
        element: <PlaceholderPage title="Announcements" description="Create announcements" />,
      },
      {
        path: '/admin/communications/doubts',
        element: <PlaceholderPage title="Doubts/Q&A" description="Manage doubts and Q&A" />,
      },
      {
        path: '/admin/communications/feedback',
        element: <PlaceholderPage title="Feedback" description="View feedback" />,
      },
      {
        path: '/admin/communications/grievances',
        element: <PlaceholderPage title="Grievances" description="Manage grievances" />,
      },
      {
        path: '/admin/communications/ptm',
        element: <PlaceholderPage title="Parent-Teacher Meetings" description="Manage PTMs" />,
      },
      {
        path: '/admin/communications/support',
        element: <PlaceholderPage title="Support Tickets" description="Manage support tickets" />,
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
