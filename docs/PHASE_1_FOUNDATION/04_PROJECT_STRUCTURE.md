# Project Structure

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

The EduMunch project structure is **feature-based and modular**, allowing developers to work independently on different features without conflicts.

Each feature is self-contained with its own:
- React components
- Custom hooks
- Services/API layer
- State management
- Type definitions

---

## Root Directory Structure

```
edumunch/
├── src/                          # Source code (all development here)
├── public/                       # Static assets (images, fonts)
├── database/                     # Database-related files
├── docs/                         # Documentation (this folder)
├── .env.local                    # Environment variables (gitignored)
├── .env.production               # Production environment (gitignored)
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies and scripts
├── package-lock.json             # Locked dependency versions
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── prettier.config.js            # Code formatter configuration
├── .eslintrc.json                # ESLint configuration
└── README.md                     # Project readme
```

---

## Source Code Structure (src/)

### Directory Hierarchy

```
src/
├── components/                   # Reusable components by feature
├── pages/                        # Page-level components (per portal)
├── services/                     # API services and external integrations
├── hooks/                        # Custom React hooks
├── store/                        # Zustand state management stores
├── types/                        # TypeScript type definitions
├── utils/                        # Utility functions
├── styles/                       # Global styles
├── App.tsx                       # Root app component
├── main.tsx                      # App entry point
└── vite-env.d.ts                 # Vite type definitions
```

---

## Component Structure (src/components/)

### Feature-Based Organization

```
src/components/
├── auth/                         # Authentication feature
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── 2FA/
│   │   ├── TwoFactorSetup.tsx
│   │   └── OTPVerification.tsx
│   └── ForgotPassword.tsx
│
├── academics/                    # Academic management feature
│   ├── courses/
│   │   ├── CourseCard.tsx
│   │   ├── CourseForm.tsx
│   │   ├── CourseList.tsx
│   │   └── CourseDetails.tsx
│   │
│   ├── batches/
│   │   ├── BatchCard.tsx
│   │   ├── BatchForm.tsx
│   │   └── BatchSelector.tsx
│   │
│   ├── subjects/
│   │   ├── SubjectCard.tsx
│   │   ├── SubjectForm.tsx
│   │   └── SubjectList.tsx
│   │
│   └── timetable/
│       ├── TimetableView.tsx
│       ├── TimetableBuilder.tsx
│       └── ClassSchedule.tsx
│
├── student/                      # Student management feature
│   ├── admissions/
│   │   ├── AdmissionForm.tsx
│   │   ├── AdmissionList.tsx
│   │   ├── AdmissionPreview.tsx
│   │   └── StudentApproval.tsx
│   │
│   ├── enrollment/
│   │   ├── EnrollmentForm.tsx
│   │   └── EnrollmentList.tsx
│   │
│   ├── profiles/
│   │   ├── StudentProfile.tsx
│   │   ├── StudentEdit.tsx
│   │   └── StudentAvatar.tsx
│   │
│   └── documents/
│       ├── DocumentUpload.tsx
│       ├── DocumentList.tsx
│       └── CertificateGenerator.tsx
│
├── financial/                    # Financial management feature
│   ├── fees/
│   │   ├── FeeStructure.tsx
│   │   ├── FeeForm.tsx
│   │   └── FeeCalculator.tsx
│   │
│   ├── payments/
│   │   ├── PaymentForm.tsx
│   │   ├── PaymentHistory.tsx
│   │   ├── PaymentReceipt.tsx
│   │   └── RazorpayCheckout.tsx
│   │
│   └── invoices/
│       ├── InvoiceGenerator.tsx
│       ├── InvoicePreview.tsx
│       └── InvoiceDownload.tsx
│
├── hr/                           # Human Resources feature
│   ├── employees/
│   │   ├── EmployeeForm.tsx
│   │   ├── EmployeeList.tsx
│   │   └── EmployeeProfile.tsx
│   │
│   ├── salary/
│   │   ├── SalarySlip.tsx
│   │   ├── PayrollForm.tsx
│   │   └── PayrollHistory.tsx
│   │
│   ├── leave/
│   │   ├── LeaveApplication.tsx
│   │   ├── LeaveApproval.tsx
│   │   └── LeaveBalance.tsx
│   │
│   └── attendance/
│       ├── AttendanceMarkup.tsx
│       ├── AttendanceReport.tsx
│       └── AttendanceExport.tsx
│
├── common/                       # Shared components (NOT feature-specific)
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── MainLayout.tsx
│   │
│   ├── buttons/
│   │   ├── PrimaryButton.tsx
│   │   ├── SecondaryButton.tsx
│   │   └── IconButton.tsx
│   │
│   ├── tables/
│   │   ├── DataTable.tsx
│   │   ├── TablePagination.tsx
│   │   └── TableExport.tsx
│   │
│   ├── forms/
│   │   ├── FormInput.tsx
│   │   ├── FormSelect.tsx
│   │   ├── FormCheckbox.tsx
│   │   └── FormDatePicker.tsx
│   │
│   ├── modals/
│   │   ├── ConfirmDialog.tsx
│   │   ├── FormModal.tsx
│   │   └── AlertModal.tsx
│   │
│   ├── loaders/
│   │   ├── Skeleton.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ProgressBar.tsx
│   │
│   └── cards/
│       ├── StatCard.tsx
│       ├── InfoCard.tsx
│       └── MetricCard.tsx
│
└── portals/                      # Portal-specific layouts
    ├── student/
    │   └── StudentLayout.tsx
    ├── parent/
    │   └── ParentLayout.tsx
    ├── teacher/
    │   └── TeacherLayout.tsx
    ├── admin/
    │   └── AdminLayout.tsx
    └── superadmin/
        └── SuperAdminLayout.tsx
```

---

## File Naming Conventions

### Component Files

```
Format: [Feature][SubFeature][ComponentType].tsx

Examples:
✅ AuthLoginForm.tsx              (Auth > Login Form)
✅ AcademicsCoursesCard.tsx       (Academics > Courses > Card)
✅ StudentEnrollmentForm.tsx      (Student > Enrollment > Form)
✅ FinancialPaymentsTable.tsx     (Financial > Payments > Table)
✅ CommonDataTable.tsx            (Common > Data Table)
❌ Form.tsx                       (Too generic)
❌ student_form.tsx              (Wrong case - use PascalCase)
❌ StudentFormComponent.tsx       (Redundant "Component")
```

### Service Files

```
Format: [feature][subfeature].service.ts

Examples:
✅ auth.service.ts               (Authentication services)
✅ academics.courses.service.ts  (Academic > Courses services)
✅ student.enrollment.service.ts (Student > Enrollment services)
✅ financial.payments.service.ts (Financial > Payments services)
❌ studentService.ts             (Inconsistent naming)
❌ api.ts                        (Too generic)
```

### Hook Files

```
Format: use[Feature][SubFeature].ts

Examples:
✅ useAuthLogin.ts               (Auth login hook)
✅ useAcademicsCourses.ts        (Academics courses hook)
✅ useStudentEnrollment.ts       (Student enrollment hook)
✅ useFinancialPayments.ts       (Financial payments hook)
❌ useFetch.ts                   (Too generic)
❌ hooks.ts                      (Not a hook name)
```

### Type/Interface Files

```
Format: [feature][subfeature].types.ts

Examples:
✅ auth.types.ts                 (Auth types)
✅ academics.courses.types.ts    (Academic courses types)
✅ student.enrollment.types.ts   (Student enrollment types)
✅ common.types.ts               (Shared types)
```

### Store Files

```
Format: [feature][subfeature].store.ts

Examples:
✅ auth.store.ts                 (Authentication state)
✅ academics.courses.store.ts    (Academics courses state)
✅ student.enrollment.store.ts   (Student enrollment state)
✅ ui.store.ts                   (UI state - sidebar open, etc.)
```

---

## Pages Structure (src/pages/)

### Organization by Portal

```
src/pages/
├── auth/
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── ForgotPassword.tsx
│   ├── ResetPassword.tsx
│   └── TwoFactorSetup.tsx
│
├── student-portal/
│   ├── Dashboard.tsx
│   ├── MyClasses.tsx
│   ├── Assignments.tsx
│   ├── Performance.tsx
│   ├── Fees.tsx
│   ├── Documents.tsx
│   └── Profile.tsx
│
├── parent-portal/
│   ├── Dashboard.tsx
│   ├── ChildProgress.tsx
│   ├── Attendance.tsx
│   ├── Fees.tsx
│   └── Communication.tsx
│
├── teacher-portal/
│   ├── Dashboard.tsx
│   ├── ClassManagement.tsx
│   ├── Attendance.tsx
│   ├── Grading.tsx
│   ├── Assignments.tsx
│   └── Communication.tsx
│
├── admin-portal/
│   ├── Dashboard.tsx
│   ├── BranchManagement.tsx
│   ├── Users.tsx
│   ├── Academics.tsx
│   ├── Financial.tsx
│   ├── Reports.tsx
│   └── Settings.tsx
│
└── superadmin-portal/
    ├── Dashboard.tsx
    ├── Organizations.tsx
    ├── Users.tsx
    ├── Analytics.tsx
    ├── Features.tsx
    └── Settings.tsx
```

---

## Services Structure (src/services/)

```
src/services/
├── api/
│   ├── client.ts                 # Supabase client setup
│   ├── interceptors.ts           # Request/response interceptors
│   └── errorHandler.ts           # Centralized error handling
│
├── auth.service.ts               # Authentication API calls
├── academics.courses.service.ts  # Academics courses API
├── academics.subjects.service.ts # Academics subjects API
├── academics.batches.service.ts  # Academics batches API
├── student.enrollment.service.ts # Student enrollment API
├── student.admission.service.ts  # Student admission API
├── financial.fees.service.ts     # Financial fees API
├── financial.payments.service.ts # Financial payments API
├── hr.employees.service.ts       # HR employees API
├── hr.salary.service.ts          # HR salary API
├── hr.leave.service.ts           # HR leave API
│
├── external/
│   ├── razorpay.service.ts       # Razorpay integration
│   ├── sendgrid.service.ts       # SendGrid email integration
│   ├── twilio.service.ts         # Twilio SMS integration
│   └── storage.service.ts        # Supabase storage integration
│
└── utils/
    ├── transformers.ts           # Data transformation functions
    ├── validators.ts             # Validation functions
    └── formatters.ts             # Formatting functions (dates, currency)
```

---

## Hooks Structure (src/hooks/)

```
src/hooks/
├── auth/
│   ├── useAuthLogin.ts
│   ├── useAuthRegister.ts
│   ├── useAuthLogout.ts
│   ├── useAuthUser.ts
│   └── useTwoFactor.ts
│
├── academics/
│   ├── useAcademicsCourses.ts
│   ├── useAcademicsSubjects.ts
│   └── useAcademicsBatches.ts
│
├── student/
│   ├── useStudentEnrollment.ts
│   ├── useStudentProfile.ts
│   └── useStudentAdmission.ts
│
├── financial/
│   ├── useFinancialFees.ts
│   └── useFinancialPayments.ts
│
├── common/
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── usePrevious.ts
│   ├── useAsync.ts
│   ├── useFetch.ts
│   └── usePagination.ts
│
└── theme/
    ├── useDarkMode.ts
    └── useTheme.ts
```

---

## Store Structure (src/store/)

```
src/store/
├── auth.store.ts                 # User auth state
├── user.store.ts                 # User profile and preferences
├── organization.store.ts         # Organization selection
├── branch.store.ts               # Branch selection
├── roles.store.ts                # User roles and permissions
├── ui.store.ts                   # UI state (sidebar, theme)
├── filters.store.ts              # Current filter selections
└── featureFlags.store.ts         # Feature flag states
```

### Store Pattern

```typescript
// Example: auth.store.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: async (email, password) => {
    // Implementation
  },
  logout: () => {
    set({ user: null, token: null });
  },
}));
```

---

## Types Structure (src/types/)

```
src/types/
├── auth.types.ts                 # Authentication types
├── user.types.ts                 # User and profile types
├── academics.types.ts            # Academic feature types
├── student.types.ts              # Student management types
├── financial.types.ts            # Financial feature types
├── hr.types.ts                   # HR feature types
├── common.types.ts               # Shared types
├── api.types.ts                  # API response types
└── forms.types.ts                # Form types
```

### Type File Pattern

```typescript
// Example: auth.types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  expiresIn: number;
}
```

---

## Utils Structure (src/utils/)

```
src/utils/
├── auth/
│   ├── tokenHandling.ts          # JWT token operations
│   └── permissions.ts             # Permission checking utilities
│
├── formatting/
│   ├── currency.ts               # Currency formatting (₹)
│   ├── dates.ts                  # Date formatting
│   ├── phone.ts                  # Phone number formatting
│   └── percentage.ts             # Percentage formatting
│
├── validation/
│   ├── email.ts                  # Email validation
│   ├── phone.ts                  # Phone validation
│   ├── password.ts               # Password validation
│   └── form.ts                   # Form field validation
│
├── data/
│   ├── transformers.ts           # Transform API data
│   ├── aggregators.ts            # Aggregate data for reports
│   └── filters.ts                # Filter utilities
│
├── common/
│   ├── arrays.ts                 # Array utilities
│   ├── objects.ts                # Object utilities
│   ├── strings.ts                # String utilities
│   └── dates.ts                  # Date utilities
│
└── constants/
    ├── roles.ts                  # User role constants
    ├── permissions.ts            # Permission constants
    ├── statuses.ts               # Status constants
    └── errorCodes.ts             # Error code constants
```

---

## Database Structure (database/)

```
database/
├── migrations/
│   ├── 001_001_core_users.sql              # Core auth users
│   ├── 001_002_core_profiles.sql           # User profiles
│   ├── 001_003_core_organizations.sql      # Organizations
│   ├── 001_004_core_branches.sql           # Branches
│   ├── 001_005_core_roles.sql              # Roles and permissions
│   ├── 001_006_core_feature_flags.sql      # Feature flags
│   ├── 001_007_core_audit_logs.sql         # Audit logging
│   ├── 001_008_core_custom_fields.sql      # Custom fields
│   ├── 001_009_core_settings.sql           # Organization settings
│   │
│   ├── 010_001_academics_courses.sql       # Academic courses
│   ├── 010_002_academics_subjects.sql      # Subjects
│   ├── 010_003_academics_batches.sql       # Batches
│   ├── 010_004_academics_topics.sql        # Topics/Content
│   ├── 010_005_academics_timetable.sql     # Timetables
│   ├── 010_006_academics_lectures.sql      # Lecture recordings
│   ├── 010_007_academics_attendance.sql    # Attendance
│   ├── 010_008_academics_assignments.sql   # Assignments
│   └── 010_009_academics_results.sql       # Results/Grades
│   │
│   ├── 020_001_student_admissions.sql      # Student admissions
│   ├── 020_002_student_enrollments.sql     # Enrollments
│   ├── 020_003_student_transfers.sql       # Batch transfers
│   ├── 020_004_student_documents.sql       # Documents
│   └── 020_005_student_waiting_lists.sql   # Waiting lists
│   │
│   ├── 030_001_financial_fees.sql          # Fee structures
│   ├── 030_002_financial_payments.sql      # Payments
│   ├── 030_003_financial_invoices.sql      # Invoices
│   ├── 030_004_financial_discounts.sql     # Discounts
│   ├── 030_005_financial_refunds.sql       # Refunds
│   └── 030_006_financial_reports.sql       # Financial reports
│   │
│   ├── 040_001_hr_employees.sql            # Employee records
│   ├── 040_002_hr_salary.sql               # Salary structures
│   ├── 040_003_hr_attendance.sql           # Staff attendance
│   ├── 040_004_hr_leave.sql                # Leave management
│   ├── 040_005_hr_documents.sql            # HR documents
│   └── 040_006_hr_performance.sql          # Performance reviews
│   │
│   └── [Additional migrations for other features...]
│
└── functions/
    ├── calculate_fee_amount.sql            # Fee calculations
    ├── calculate_attendance.sql            # Attendance percentage
    ├── process_payment.sql                 # Payment processing
    └── [Additional functions...]
```

---

## Public Assets (public/)

```
public/
├── images/
│   ├── logo.png
│   ├── logo-dark.png
│   ├── favicon.ico
│   └── [Feature icons and images]
│
├── fonts/
│   ├── [Custom fonts]
│   └── [Language-specific fonts]
│
└── [Other static assets]
```

---

## Configuration Files

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
})
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### tailwind.config.js

```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        secondary: "#10B981",
      },
    },
  },
  plugins: [],
}
```

---

## Feature Module Template

When creating a new feature module, follow this structure:

```
src/components/[feature]/
├── [subfeature1]/
│   ├── [Component1].tsx
│   ├── [Component2].tsx
│   └── index.ts                 # Barrel export
├── [subfeature2]/
│   ├── [Component1].tsx
│   └── index.ts
└── index.ts                     # Barrel export

src/hooks/
└── use[Feature][SubFeature].ts

src/services/
└── [feature].[subfeature].service.ts

src/store/
└── [feature].store.ts

src/types/
└── [feature].types.ts

database/migrations/
└── [batch]_[feature]_[description].sql
```

---

## Import Aliases

Always use path aliases for cleaner imports:

```typescript
// ✅ Good
import { useAuthLogin } from '@/hooks/useAuthLogin'
import { AuthService } from '@/services/auth.service'
import { Button } from '@/components/common/buttons/Button'

// ❌ Avoid
import { useAuthLogin } from '../../hooks/useAuthLogin'
import { AuthService } from '../../../services/auth.service'
```

---

## Code Organization Principles

### 1. **Feature Isolation**
Each feature is independent with its own components, hooks, services.

### 2. **Clear Dependencies**
Features only depend on common components and shared utilities.

### 3. **Type Safety**
Each feature has dedicated type definitions in types/ folder.

### 4. **Reusability**
Common components in `common/` are reusable across all features.

### 5. **Easy to Find**
File names clearly indicate their purpose and location.

### 6. **Easy to Copy**
Entire feature folders can be copied to new projects.

---

## Adding a New Feature

### Step 1: Create Component Folder
```bash
mkdir -p src/components/[feature]/[subfeature]
```

### Step 2: Create Component File
```
src/components/[feature]/[subfeature]/[Component].tsx
```

### Step 3: Create Hook (if needed)
```
src/hooks/use[Feature][SubFeature].ts
```

### Step 4: Create Service
```
src/services/[feature].[subfeature].service.ts
```

### Step 5: Create Types
```
src/types/[feature].types.ts
```

### Step 6: Create Database Migration (if needed)
```
database/migrations/[batch]_[feature]_[description].sql
```

### Step 7: Update Barrel Exports
```typescript
// src/components/[feature]/index.ts
export { default as Component1 } from './[subfeature]/Component1'
export { default as Component2 } from './[subfeature]/Component2'
```

---

## Next Steps

1. ✅ Understand the folder structure
2. ✅ Review naming conventions
3. ✅ Proceed to `05_ARCHITECTURE.md`
4. ✅ Start Phase 2 with authentication

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Structure Defined  
**Next Phase:** 05_ARCHITECTURE.md
