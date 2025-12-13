/**
 * Project Status Tracker
 * Updated: December 13, 2025
 */

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  date?: string;
}

export interface PhaseStatus {
  phase: number;
  title: string;
  status: 'completed' | 'in-progress' | 'pending';
  progress: number;
  tasks: TaskItem[];
  nextSteps?: string[];
}

export const projectStatus: PhaseStatus[] = [
  {
    phase: 1,
    title: 'Foundation & Frontend Setup',
    status: 'completed',
    progress: 100,
    tasks: [
      { id: '1.1', title: 'Project initialized with Vite + React + TypeScript', completed: true, date: 'Dec 13' },
      { id: '1.2', title: 'Tailwind CSS configured with custom theme', completed: true, date: 'Dec 13' },
      { id: '1.3', title: 'UI configuration file created (design system)', completed: true, date: 'Dec 13' },
      { id: '1.4', title: 'Sidebar navigation with VRaZ design', completed: true, date: 'Dec 13' },
      { id: '1.5', title: 'Navbar with search and user menu', completed: true, date: 'Dec 13' },
      { id: '1.6', title: 'Responsive MainLayout component', completed: true, date: 'Dec 13' },
      { id: '1.7', title: 'Dashboard pages (Admin/Student/Teacher/Parent)', completed: true, date: 'Dec 13' },
      { id: '1.8', title: 'Dashboard cards with exact VRaZ styling', completed: true, date: 'Dec 13' },
      { id: '1.9', title: 'React Router setup with 70+ routes', completed: true, date: 'Dec 13' },
      { id: '1.10', title: 'StatCard component with color variants', completed: true, date: 'Dec 13' },
    ],
    nextSteps: [
      'Set up Supabase project',
      'Configure environment variables',
      'Create database schema'
    ]
  },
  {
    phase: 2,
    title: 'Core Infrastructure',
    status: 'in-progress',
    progress: 85,
    tasks: [
      { id: '2.1', title: 'Supabase project creation and setup', completed: true, date: 'Dec 13' },
      { id: '2.2', title: 'Database migrations (organizations, users, roles, permissions)', completed: true, date: 'Dec 13' },
      { id: '2.3', title: 'Row Level Security (RLS) policies', completed: true, date: 'Dec 13' },
      { id: '2.4', title: 'First organization setup (Demo Institute)', completed: true, date: 'Dec 13' },
      { id: '2.5', title: 'Authentication system (email/password login)', completed: true, date: 'Dec 13' },
      { id: '2.6', title: 'Login & Register pages with VRaZ styling', completed: true, date: 'Dec 13' },
      { id: '2.7', title: 'Protected routes implementation', completed: true, date: 'Dec 13' },
      { id: '2.8', title: 'Auth state management with Zustand', completed: true, date: 'Dec 13' },
      { id: '2.9', title: 'User profile syncing from database', completed: true, date: 'Dec 13' },
      { id: '2.10', title: 'Session persistence and auto-login', completed: true, date: 'Dec 13' },
      { id: '2.11', title: 'User roles and permissions system', completed: false },
      { id: '2.12', title: 'Feature flags implementation', completed: false },
    ],
    nextSteps: [
      'Implement user roles and permissions',
      'Create feature flag management UI',
      'Set up password reset functionality',
      'Implement 2FA (optional)'
    ]
  },
  {
    phase: 3,
    title: 'Dashboard & User Management',
    status: 'in-progress',
    progress: 50,
    tasks: [
      { id: '3.1', title: 'User list/management page', completed: true, date: 'Dec 13' },
      { id: '3.2', title: 'User create/edit forms', completed: true, date: 'Dec 13' },
      { id: '3.3', title: 'Role assignment interface', completed: true, date: 'Dec 13' },
      { id: '3.4', title: 'Permission management UI', completed: true, date: 'Dec 13' },
      { id: '3.5', title: 'Admissions management page with filters & modal', completed: true, date: 'Dec 13' },
      { id: '3.6', title: 'Assignment management (templates & grading) page', completed: true, date: 'Dec 13' },
      { id: '3.7', title: 'Attendance management (schedule, reports, student report)', completed: true, date: 'Dec 13' },
      { id: '3.8', title: 'Organization management', completed: false },
      { id: '3.9', title: 'Branch management', completed: false },
      { id: '3.10', title: 'Custom field management', completed: false },
      { id: '3.11', title: 'Admin dashboard with real data', completed: false },
    ],
  },
  {
    phase: 4,
    title: 'Academic Foundation',
    status: 'pending',
    progress: 0,
    tasks: [
      { id: '4.1', title: 'Course management system', completed: false },
      { id: '4.2', title: 'Subject management', completed: false },
      { id: '4.3', title: 'Topic and content management', completed: false },
      { id: '4.4', title: 'Batch management', completed: false },
      { id: '4.5', title: 'Lecture timing templates', completed: false },
    ],
  },
  {
    phase: 5,
    title: 'Student Management',
    status: 'pending',
    progress: 0,
    tasks: [
      { id: '5.1', title: 'Student profiles', completed: false },
      { id: '5.2', title: 'Admissions workflow', completed: false },
      { id: '5.3', title: 'Fee installment management', completed: false },
      { id: '5.4', title: 'Enrollment management', completed: false },
      { id: '5.5', title: 'Admission list views', completed: false },
    ],
  },
  // Phases 6-15 collapsed for brevity
];

export const overallProgress = {
  totalPhases: 15,
  completedPhases: 1,
  inProgressPhases: 2,
  percentComplete: Math.round((1 + (0.85 * 2) + (0.50 * 3)) / 15 * 100),
  totalTasks: 150,
  completedTasks: 37,
};

export const currentFocus = {
  phase: 4,
  title: 'Academic Foundation (Courses, Subjects, Topics, Batches)',
  priority: 'HIGH',
  estimatedDays: 3,
  blockers: [],
};

export const techStack = {
  frontend: [
    { name: 'React 18', status: '✅ Configured' },
    { name: 'TypeScript 5', status: '✅ Configured' },
    { name: 'Vite', status: '✅ Configured' },
    { name: 'Tailwind CSS', status: '✅ Configured' },
    { name: 'React Router', status: '✅ Configured' },
    { name: 'Zustand', status: '✅ In use (Auth store)' },
    { name: 'TanStack Query', status: '⏳ Ready (not used yet)' },
  ],
  backend: [
    { name: 'Supabase', status: '✅ Configured' },
    { name: 'PostgreSQL', status: '✅ 9 tables created' },
    { name: 'Supabase Auth', status: '✅ Configured' },
    { name: 'RLS Policies', status: '✅ Enabled' },
    { name: 'Supabase Storage', status: '❌ Not configured' },
  ],
  external: [
    { name: 'Razorpay', status: '❌ Not integrated' },
    { name: 'SendGrid', status: '❌ Not integrated' },
    { name: 'Twilio', status: '❌ Not integrated' },
  ],
};
