import {
  LayoutGrid,
  FileText,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  DollarSign,
  ClipboardList,
  Award,
  CheckSquare,
  MessageSquare,
  FileStack,
  Users2,
  Calendar,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const navigationConfig = {
  admin: [
    {
      section: 'Main',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          path: '/admin/dashboard',
          icon: LayoutGrid,
        },
      ],
    },
    {
      section: 'Academics',
      items: [
        {
          id: 'admissions',
          label: 'Admissions',
          icon: FileText,
          children: [
            { id: 'admissions-list', label: 'Admissions', path: '/admin/admissions' },
            { id: 'enrollments', label: 'Enrollments', path: '/admin/enrollments' },
            { id: 'payments', label: 'Payments', path: '/admin/payments' },
          ],
        },
        {
          id: 'academics',
          label: 'Academics',
          icon: BookOpen,
          children: [
            { id: 'courses', label: 'Courses', path: '/admin/academics/courses' },
            { id: 'subjects', label: 'Subjects', path: '/admin/academics/subjects' },
            { id: 'topics', label: 'Topics & Content', path: '/admin/academics/topics' },
            { id: 'batches', label: 'Batches', path: '/admin/academics/batches' },
            { id: 'timetables', label: 'Timetables', path: '/admin/academics/timetables' },
            { id: 'attendance', label: 'Attendance', path: '/admin/academics/attendance' },
            { id: 'assignments', label: 'Assignments', path: '/admin/academics/assignments' },
            { id: 'results', label: 'Results', path: '/admin/academics/results' },
            { id: 'lecture-templates', label: 'Lecture Templates', path: '/admin/academics/lecture-templates' },
          ],
        },
      ],
    },
    {
      section: 'Management',
      items: [
        {
          id: 'administration',
          label: 'Administration',
          icon: Users,
          children: [
            { id: 'users', label: 'Users', path: '/admin/users' },
            { id: 'roles', label: 'Roles & Permissions', path: '/admin/roles' },
            { id: 'branches', label: 'Branches', path: '/admin/administration/branches' },
            { id: 'inventory', label: 'Inventory', path: '/admin/administration/inventory' },
            { id: 'tie-up-schools', label: 'Tie-Up Schools', path: '/admin/administration/tie-up-schools' },
          ],
        },
        {
          id: 'hr',
          label: 'Human Resources',
          icon: Users2,
          children: [
            { id: 'employees', label: 'Employees', path: '/admin/hr/employees' },
            { id: 'salary', label: 'Salary Structures', path: '/admin/hr/salary' },
            { id: 'payslips', label: 'Payslips', path: '/admin/hr/payslips' },
            { id: 'leave', label: 'Leave Management', path: '/admin/hr/leave' },
            { id: 'working-hours', label: 'Working Hours', path: '/admin/hr/working-hours' },
            { id: 'availability', label: 'Availability Slots', path: '/admin/hr/availability' },
          ],
        },
      ],
    },
    {
      section: 'Communication',
      items: [
        {
          id: 'communications',
          label: 'Communications',
          icon: MessageSquare,
          children: [
            { id: 'announcements', label: 'Announcements', path: '/admin/communications/announcements' },
            { id: 'doubts', label: 'Doubts/Q&A', path: '/admin/communications/doubts' },
            { id: 'feedback', label: 'Feedback', path: '/admin/communications/feedback' },
            { id: 'grievances', label: 'Grievances', path: '/admin/communications/grievances' },
            { id: 'ptm', label: 'Parent-Teacher Meetings', path: '/admin/communications/ptm' },
            { id: 'support', label: 'Support Tickets', path: '/admin/communications/support' },
          ],
        },
      ],
    },
    {
      section: 'Analytics',
      items: [
        {
          id: 'analytics',
          label: 'Analytics & Reports',
          icon: BarChart3,
          children: [
            { id: 'reports', label: 'Custom Reports', path: '/admin/analytics/reports' },
            { id: 'analytics-dashboard', label: 'Analytics Dashboard', path: '/admin/analytics/dashboard' },
            { id: 'audit-logs', label: 'Audit Logs', path: '/admin/analytics/audit-logs' },
          ],
        },
      ],
    },
    {
      section: 'Configuration',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          path: '/admin/settings',
        },
      ],
    },
  ],
  student: [
    {
      section: 'Main',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          path: '/student/dashboard',
          icon: LayoutGrid,
        },
      ],
    },
    {
      section: 'Academics',
      items: [
        {
          id: 'courses',
          label: 'My Courses',
          path: '/student/courses',
          icon: BookOpen,
        },
        {
          id: 'attendance',
          label: 'Attendance',
          path: '/student/attendance',
          icon: CheckSquare,
        },
        {
          id: 'assignments',
          label: 'Assignments',
          path: '/student/assignments',
          icon: ClipboardList,
        },
        {
          id: 'results',
          label: 'Results',
          path: '/student/results',
          icon: Award,
        },
      ],
    },
    {
      section: 'Learning',
      items: [
        {
          id: 'lms',
          label: 'Learning Materials',
          path: '/student/lms',
          icon: FileStack,
        },
        {
          id: 'doubts',
          label: 'Ask Doubts',
          path: '/student/doubts',
          icon: HelpCircle,
        },
      ],
    },
    {
      section: 'Finance',
      items: [
        {
          id: 'payments',
          label: 'Payments',
          path: '/student/payments',
          icon: DollarSign,
        },
      ],
    },
  ],
  teacher: [
    {
      section: 'Main',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          path: '/teacher/dashboard',
          icon: LayoutGrid,
        },
      ],
    },
    {
      section: 'Teaching',
      items: [
        {
          id: 'classes',
          label: 'My Classes',
          path: '/teacher/classes',
          icon: BookOpen,
        },
        {
          id: 'attendance',
          label: 'Mark Attendance',
          path: '/teacher/attendance',
          icon: CheckSquare,
        },
        {
          id: 'assignments',
          label: 'Assignments',
          path: '/teacher/assignments',
          icon: ClipboardList,
        },
        {
          id: 'results',
          label: 'Results & Grading',
          path: '/teacher/results',
          icon: Award,
        },
      ],
    },
    {
      section: 'Communication',
      items: [
        {
          id: 'doubts',
          label: 'Doubts/Q&A',
          path: '/teacher/doubts',
          icon: MessageSquare,
        },
        {
          id: 'announcements',
          label: 'Announcements',
          path: '/teacher/announcements',
          icon: AlertCircle,
        },
        {
          id: 'ptm',
          label: 'Parent Meetings',
          path: '/teacher/ptm',
          icon: Calendar,
        },
      ],
    },
  ],
  parent: [
    {
      section: 'Main',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          path: '/parent/dashboard',
          icon: LayoutGrid,
        },
      ],
    },
    {
      section: 'Student',
      items: [
        {
          id: 'children',
          label: 'My Children',
          path: '/parent/children',
          icon: Users,
        },
        {
          id: 'attendance',
          label: 'Attendance',
          path: '/parent/attendance',
          icon: CheckSquare,
        },
        {
          id: 'results',
          label: 'Results',
          path: '/parent/results',
          icon: Award,
        },
      ],
    },
    {
      section: 'Communication',
      items: [
        {
          id: 'announcements',
          label: 'Announcements',
          path: '/parent/announcements',
          icon: AlertCircle,
        },
        {
          id: 'messages',
          label: 'Messages',
          path: '/parent/messages',
          icon: MessageSquare,
        },
        {
          id: 'ptm',
          label: 'Meetings',
          path: '/parent/ptm',
          icon: Calendar,
        },
      ],
    },
    {
      section: 'Finance',
      items: [
        {
          id: 'fees',
          label: 'Fees & Payments',
          path: '/parent/fees',
          icon: DollarSign,
        },
      ],
    },
  ],
};
