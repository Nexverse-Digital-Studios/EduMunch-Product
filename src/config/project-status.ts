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
    status: 'pending',
    progress: 0,
    tasks: [
      { id: '2.1', title: 'Supabase project creation and setup', completed: false },
      { id: '2.2', title: 'Authentication system (email/password)', completed: false },
      { id: '2.3', title: 'User profile management', completed: false },
      { id: '2.4', title: 'Roles and permissions system', completed: false },
      { id: '2.5', title: 'Organization and branch setup', completed: false },
      { id: '2.6', title: 'Feature flags implementation', completed: false },
      { id: '2.7', title: 'Row Level Security (RLS) policies', completed: false },
    ],
    nextSteps: [
      'Create Supabase account',
      'Initialize database tables',
      'Set up authentication flow',
      'Create login/register pages'
    ]
  },
  {
    phase: 3,
    title: 'Dashboard & User Management',
    status: 'pending',
    progress: 0,
    tasks: [
      { id: '3.1', title: 'User management interface', completed: false },
      { id: '3.2', title: 'Admin dashboard with real data', completed: false },
      { id: '3.3', title: 'Navigation sidebar with permissions', completed: false },
      { id: '3.4', title: 'Custom field management', completed: false },
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
  inProgressPhases: 0,
  percentComplete: Math.round((1 / 15) * 100),
  totalTasks: 120, // Approximate
  completedTasks: 10,
};

export const currentFocus = {
  phase: 2,
  title: 'Core Infrastructure - Supabase Setup',
  priority: 'HIGH',
  estimatedDays: 7,
  blockers: [],
};

export const techStack = {
  frontend: [
    { name: 'React 18', status: '✅ Configured' },
    { name: 'TypeScript 5', status: '✅ Configured' },
    { name: 'Vite', status: '✅ Configured' },
    { name: 'Tailwind CSS', status: '✅ Configured' },
    { name: 'React Router', status: '✅ Configured' },
    { name: 'Zustand', status: '⏳ Ready (not used yet)' },
    { name: 'TanStack Query', status: '⏳ Ready (not used yet)' },
  ],
  backend: [
    { name: 'Supabase', status: '❌ Not configured' },
    { name: 'PostgreSQL', status: '❌ No database yet' },
    { name: 'Supabase Auth', status: '❌ Not configured' },
    { name: 'Supabase Storage', status: '❌ Not configured' },
  ],
  external: [
    { name: 'Razorpay', status: '❌ Not integrated' },
    { name: 'SendGrid', status: '❌ Not integrated' },
    { name: 'Twilio', status: '❌ Not integrated' },
  ],
};
