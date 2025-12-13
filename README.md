# EduMunch - Education Management System

A comprehensive, modular SaaS platform for managing educational institutions with support for multiple user roles and features.

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment Variables**
Create a `.env.local` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **Start Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── components/       # Reusable React components
│   ├── common/      # Shared components (Sidebar, Navbar, etc.)
│   └── ...          # Feature-specific components
├── pages/           # Page components (Dashboards, Pages)
├── constants/       # Constants (navigation config, etc.)
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
├── router.tsx       # React Router configuration
└── App.tsx          # Root app component
```

## Features

### Admin Portal
- Dashboard with key metrics
- User management
- Academic management (Courses, Batches, Subjects, etc.)
- HR & Payroll management
- Financial management
- Communication & Notifications
- Analytics & Reporting

### Student Portal
- Dashboard with attendance and grades
- Course management
- Assignment tracking
- Results and progress
- Payment management

### Teacher Portal
- Class management
- Attendance marking
- Assignment management
- Results and grading
- Communication

### Parent Portal
- Children progress tracking
- Attendance and performance
- Fee payment management
- Communication with teachers

## Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop (1920px and above)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (Below 768px)

### Mobile Features
- Collapsible sidebar with hamburger menu
- Touch-friendly buttons and inputs
- Optimized layouts for small screens
- Floating action button for quick access

## Navigation Structure

### Admin Navigation
- Dashboard
- Academics
  - Admissions
  - Courses
  - Subjects
  - Batches
  - Timetables
  - Attendance
  - Assignments
  - Results
- Administration
  - Users
  - Roles & Permissions
  - Branches
  - Inventory
- Human Resources
  - Employees
  - Payroll
  - Leave Management
- Communications
  - Announcements
  - Doubts/Q&A
  - Feedback
  - Grievances
  - Support Tickets
- Analytics
  - Reports
  - Analytics Dashboard
  - Audit Logs

## Color Scheme

The application uses a modern color palette:

**Primary Colors**
- Primary Blue: #0ea5e9 - Used for main actions and highlights
- Success Green: #22c55e - Used for positive feedback
- Warning Yellow: #f59e0b - Used for cautions
- Danger Red: #ef4444 - Used for errors and critical items

**Neutral Colors**
- Used for text, backgrounds, and borders
- Multiple shades for hierarchy

## Theme & Styling

- **Framework**: Tailwind CSS
- **UI Components**: Shadcn/ui inspired design
- **Icons**: Lucide React
- **Dark Mode**: Ready for implementation
- **Responsive**: Mobile-first approach

## Database

The application uses Supabase with PostgreSQL for:
- User authentication and management
- Data storage
- Real-time capabilities
- File storage
- Row-level security

## Next Steps

1. Configure Supabase credentials
2. Set up authentication
3. Implement data models
4. Connect API endpoints
5. Add feature-specific pages and components
6. Implement payment gateway (Razorpay)
7. Set up email/SMS services
8. Deploy to production

## Support

For documentation, refer to the `/docs` folder in the project root.

## License

This project is part of the EduMunch SaaS platform.
