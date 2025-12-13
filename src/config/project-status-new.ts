/**
 * Project Status Tracker - Updated
 * December 13, 2025
 */

export const projectStatus = [
  {
    id: 1,
    phase: 'Phase 1: Foundation',
    description: 'UI Design, Navigation, Project Setup',
    progress: 100,
    status: 'completed',
    tasks: [
      { id: 1, title: 'VRaZ UI Design Implementation', status: 'completed' },
      { id: 2, title: 'Navigation Sidebar', status: 'completed' },
      { id: 3, title: 'Responsive Layout', status: 'completed' },
      { id: 4, title: 'Dashboard Cards & Components', status: 'completed' },
      { id: 5, title: 'UI Configuration System', status: 'completed' },
    ],
  },
  {
    id: 2,
    phase: 'Phase 2: Core Infrastructure',
    description: 'Database, Authentication, User Profiles',
    progress: 100,
    status: 'completed',
    tasks: [
      { id: 1, title: 'Database Schema Design', status: 'completed' },
      { id: 2, title: 'Supabase Setup & Migrations', status: 'completed' },
      { id: 3, title: 'Authentication System', status: 'completed' },
      { id: 4, title: 'Login/Register Pages', status: 'completed' },
      { id: 5, title: 'Protected Routes', status: 'completed' },
      { id: 6, title: 'Auth State Management', status: 'completed' },
    ],
  },
  {
    id: 3,
    phase: 'Phase 3: User Management',
    description: 'User Profiles, Roles, Permissions',
    progress: 0,
    status: 'in-progress',
    tasks: [
      { id: 1, title: 'User Profile Pages', status: 'pending' },
      { id: 2, title: 'User Management Dashboard', status: 'pending' },
      { id: 3, title: 'Role Assignment Interface', status: 'pending' },
      { id: 4, title: 'Staff Directory', status: 'pending' },
      { id: 5, title: 'User Invite System', status: 'pending' },
    ],
  },
  {
    id: 4,
    phase: 'Phase 4: Academic Foundation',
    description: 'Courses, Subjects, Topics, Batches',
    progress: 0,
    status: 'pending',
    tasks: [
      { id: 1, title: 'Course Management', status: 'pending' },
      { id: 2, title: 'Subject Management', status: 'pending' },
      { id: 3, title: 'Topic & Content Management', status: 'pending' },
      { id: 4, title: 'Batch Management', status: 'pending' },
      { id: 5, title: 'Lecture Timing Templates', status: 'pending' },
    ],
  },
  {
    id: 5,
    phase: 'Phase 5: Student Management',
    description: 'Student Profiles, Enrollment, Dashboards',
    progress: 0,
    status: 'pending',
    tasks: [
      { id: 1, title: 'Student Profiles', status: 'pending' },
      { id: 2, title: 'Enrollment Workflow', status: 'pending' },
      { id: 3, title: 'Student Dashboard', status: 'pending' },
      { id: 4, title: 'Class Assignment', status: 'pending' },
      { id: 5, title: 'Attendance Tracking', status: 'pending' },
    ],
  },
  {
    id: 6,
    phase: 'Phase 6: Academic Operations',
    description: 'Timetables, Classes, Sections',
    progress: 0,
    status: 'pending',
    tasks: [
      { id: 1, title: 'Timetable Management', status: 'pending' },
      { id: 2, title: 'Class Schedule', status: 'pending' },
      { id: 3, title: 'Section Management', status: 'pending' },
    ],
  },
  {
    id: 7,
    phase: 'Phase 7: Assignments & Results',
    description: 'Assignments, Exams, Results Management',
    progress: 0,
    status: 'pending',
    tasks: [
      { id: 1, title: 'Assignment Creation & Submission', status: 'pending' },
      { id: 2, title: 'Exam Management', status: 'pending' },
      { id: 3, title: 'Results Publishing', status: 'pending' },
      { id: 4, title: 'Grade Book', status: 'pending' },
    ],
  },
  {
    id: 8,
    phase: 'Phase 8: Financial System',
    description: 'Fees, Payments, Invoicing',
    progress: 0,
    status: 'pending',
    tasks: [
      { id: 1, title: 'Fee Management', status: 'pending' },
      { id: 2, title: 'Payment Processing', status: 'pending' },
      { id: 3, title: 'Invoice Generation', status: 'pending' },
      { id: 4, title: 'Receipt Management', status: 'pending' },
    ],
  },
  {
    id: 9,
    phase: 'Phase 9: Human Resources',
    description: 'Staff Management, Attendance, Payroll',
    progress: 0,
    status: 'pending',
    tasks: [
      { id: 1, title: 'Staff Management', status: 'pending' },
      { id: 2, title: 'Attendance Tracking', status: 'pending' },
      { id: 3, title: 'Leave Management', status: 'pending' },
      { id: 4, title: 'Payroll System', status: 'pending' },
    ],
  },
  {
    id: 10,
    phase: 'Phase 10: Communication',
    description: 'Notifications, Emails, QA System',
    progress: 0,
    status: 'pending',
    tasks: [
      { id: 1, title: 'Notification System', status: 'pending' },
      { id: 2, title: 'Email Integration', status: 'pending' },
      { id: 3, title: 'Q&A/Doubts System', status: 'pending' },
      { id: 4, title: 'Parent Communication Portal', status: 'pending' },
    ],
  },
];

export const overallProgress = 13;
export const currentFocus = 'Phase 3: User Management';
export const completedPhases = 2;

export const techStack = {
  frontend: { name: 'React 18 + TypeScript', status: 'complete' },
  styling: { name: 'Tailwind CSS', status: 'complete' },
  buildTool: { name: 'Vite 5', status: 'complete' },
  stateManagement: { name: 'Zustand', status: 'complete' },
  routing: { name: 'React Router v6', status: 'complete' },
  backend: { name: 'Supabase (PostgreSQL)', status: 'complete' },
  authentication: { name: 'Supabase Auth', status: 'complete' },
  apiClient: { name: 'TanStack Query', status: 'ready' },
  validation: { name: 'Zod/Yup', status: 'pending' },
  testing: { name: 'Vitest + React Testing Library', status: 'pending' },
};
