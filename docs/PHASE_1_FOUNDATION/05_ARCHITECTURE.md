# Architecture

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## System Architecture Overview

EduMunch is built on a **modern, scalable, cloud-native architecture** with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────┐
│              User Interface Layer                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │  React Components (Portals)                       │  │
│  │  - Student Portal  - Parent Portal                │  │
│  │  - Teacher Portal  - Admin Portal                 │  │
│  │  - Super Admin Portal                            │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────┘
                 │ HTTP/REST/GraphQL
┌────────────────▼────────────────────────────────────────┐
│           Application/Services Layer                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │  React Hooks (State Management)                   │  │
│  │  Services (API Integration)                       │  │
│  │  Zustand (Global State)                          │  │
│  │  React Router (Navigation)                        │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────┘
                 │ HTTP/REST/GraphQL/WebSocket
┌────────────────▼────────────────────────────────────────┐
│          Backend/Data Layer                             │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Supabase                                         │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │ PostgreSQL Database                        │ │  │
│  │  │ - 120+ Tables                              │ │  │
│  │  │ - Row Level Security (RLS)                 │ │  │
│  │  │ - Triggers & Functions (PL/pgSQL)         │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │ Authentication                             │ │  │
│  │  │ - Email/Password                           │ │  │
│  │  │ - 2FA Support                              │ │  │
│  │  │ - JWT Tokens                               │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │ File Storage                               │ │  │
│  │  │ - Documents, Images, Videos                │ │  │
│  │  │ - Public & Private Buckets                 │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │ Real-time                                  │ │  │
│  │  │ - WebSocket Updates                        │ │  │
│  │  │ - Live Notifications                       │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────┴──────────┐
        │                   │
    External Services   Other Integrations
    - Razorpay          - SendGrid
    - Twilio            - Sentry
    - Storage CDN       - Analytics
```

---

## Multi-Tenancy Architecture

### Data Isolation Model

```
┌─────────────────────────────────────────────────────────┐
│              Supabase Cloud (Shared)                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                  │  │
│  │                                                   │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │ Organization A                              │ │  │
│  │  │ ├─ Branch 1 [RLS Policy: org_id = A]       │ │  │
│  │  │ │  ├─ Users (isolated by org_id)           │ │  │
│  │  │ │  ├─ Courses (isolated by org_id)         │ │  │
│  │  │ │  └─ [All feature tables]                 │ │  │
│  │  │ ├─ Branch 2 [RLS Policy: org_id = A]       │ │  │
│  │  │ │  └─ [All feature tables]                 │ │  │
│  │  │ └─ Organization Settings (org_id = A)      │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  │                                                   │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │ Organization B                              │ │  │
│  │  │ ├─ Branch 1 [RLS Policy: org_id = B]       │ │  │
│  │  │ │  └─ [All feature tables]                 │ │  │
│  │  │ └─ Organization Settings (org_id = B)      │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  │                                                   │  │
│  │  [Same structure for infinite organizations]    │  │
│  │  Each uses RLS policies for data isolation      │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Shared Infrastructure                     │  │
│  │  - Auth Tables (users, sessions)                 │  │
│  │  - Feature Flags Table (shared lookup)           │  │
│  │  - Audit Logs (with org_id for filtering)        │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Single Database** - All organizations in one PostgreSQL instance
2. **Row Level Security (RLS)** - Database enforces data isolation
3. **Organization ID (org_id)** - Partition key for all tables
4. **Branch ID (branch_id)** - Secondary partition for multi-branch orgs
5. **User Context** - JWT includes org_id for RLS enforcement

---

## Authentication & Authorization Flow

### User Authentication (Supabase Auth)

```
1. User enters email/password on login page
   │
2. Frontend calls Supabase Auth API
   ├─ Email/password validated
   ├─ Session created
   └─ JWT token returned with claims:
      ├─ user_id
      ├─ email
      ├─ org_id
      └─ [Custom claims from user profile]
   │
3. Token stored in client
   ├─ In-memory (secure)
   └─ HTTP-only cookie (optional)
   │
4. Token sent with every request
   ├─ REST API: Authorization header
   └─ GraphQL: Authorization header
   │
5. Backend validates token
   ├─ Supabase JWT verification
   └─ Applies RLS policies
   │
6. Database enforces RLS
   ├─ Only returns data for user's org_id
   └─ Insert/update/delete blocked for other orgs
```

### User Profiles (Database)

Unlike typical setups, EduMunch stores user profiles in PostgreSQL, **not** in Supabase Auth metadata:

```sql
-- User is created in Supabase Auth (auth.users)
-- But user profile/details live in our database (public.users)

CREATE TABLE users (
  id UUID PRIMARY KEY,                    -- Links to auth.users(id)
  org_id UUID NOT NULL,                   -- Organization
  email VARCHAR UNIQUE NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  phone VARCHAR,
  avatar_url TEXT,
  role_id UUID,                           -- Custom role
  status ENUM('active', 'inactive'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  -- RLS Policy: only users from same org_id can see this
  CONSTRAINT fk_org FOREIGN KEY(org_id) REFERENCES organizations(id)
);
```

### Roles & Permissions

```
┌──────────────────────────────────────────────────────┐
│              Roles (Predefined)                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ Super Admin (System Level)                     │  │
│  │ - Access all organizations                    │  │
│  │ - Global analytics                            │  │
│  │ - Enable/disable features per org             │  │
│  │ - Manage payment plans                        │  │
│  └────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │ Branch Admin (Organization/Branch Level)      │  │
│  │ - Manage branch operations                    │  │
│  │ - User management (in branch)                 │  │
│  │ - Financial reporting (for branch)            │  │
│  │ - Limited to assigned branch                  │  │
│  └────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │ Teacher                                        │  │
│  │ - Create/grade assignments                    │  │
│  │ - Mark attendance                             │  │
│  │ - Communicate with parents                    │  │
│  │ - Upload content                              │  │
│  └────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │ Student                                        │  │
│  │ - View assigned classes                       │  │
│  │ - Submit assignments                          │  │
│  │ - View performance                            │  │
│  │ - Check fees                                  │  │
│  └────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │ Parent                                         │  │
│  │ - Monitor child progress                      │  │
│  │ - View fees and payments                      │  │
│  │ - Communicate with teachers                   │  │
│  │ - Access reports                              │  │
│  └────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │ Custom Roles (Per Organization)               │  │
│  │ - Frontend Staff                              │  │
│  │ - HR Manager                                  │  │
│  │ - Finance Manager                             │  │
│  │ - Subject Expert                              │  │
│  │ - [Any custom role defined by org]            │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘

Permissions Assignment:
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    Roles     │────────→│ Permissions  │────────→│ Resources    │
│              │ Many    │              │ Many    │              │
└──────────────┘         └──────────────┘         └──────────────┘
  (e.g., Teacher)      (e.g., grade:create)     (e.g., Result)

Example RLS Policy:
  SELECT * FROM results
  WHERE org_id = (SELECT org_id FROM users WHERE id = auth.uid())
    AND (
      -- Teacher can see results for their subjects
      created_by = auth.uid()
      -- Admin can see all results
      OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    )
```

---

## Data Flow Architecture

### Creating a Student Enrollment (Example)

```
┌─ Frontend ─────────────────────────────────────────┐
│                                                    │
│  StudentEnrollmentForm.tsx                        │
│  ├─ User fills form (student_id, batch_id)        │
│  ├─ Form validation (Zod schema)                  │
│  └─ Submits data via useStudentEnrollment hook    │
│                                                    │
└──────────────┬──────────────────────────────────────┘
               │ HTTP POST /api/enrollments
┌──────────────▼──────────────────────────────────────┐
│ Application Layer (React)                         │
│                                                    │
│  useStudentEnrollment hook                        │
│  ├─ Calls StudentEnrollmentService.create()       │
│  ├─ Uses TanStack Query for caching               │
│  └─ Triggers Zustand state update                 │
│                                                    │
└──────────────┬──────────────────────────────────────┘
               │ JSON payload + JWT token
┌──────────────▼──────────────────────────────────────┐
│ Services Layer                                    │
│                                                    │
│  student.enrollment.service.ts                    │
│  ├─ Validates input                               │
│  ├─ Calls Supabase client.from('enrollments')     │
│  └─ .insert(data)                                 │
│                                                    │
└──────────────┬──────────────────────────────────────┘
               │ PostgreSQL transaction
┌──────────────▼──────────────────────────────────────┐
│ Database Layer (PostgreSQL + RLS)                 │
│                                                    │
│  INSERT INTO enrollments (...)                    │
│  ├─ RLS Policy checks:                            │
│  │  ├─ User's org_id matches enrollment org_id   │
│  │  ├─ User has 'create_enrollment' permission   │
│  │  └─ Student belongs to same org              │
│  ├─ Triggers fire:                                │
│  │  ├─ Update student.status = 'enrolled'        │
│  │  ├─ Create fee_installments for student       │
│  │  └─ Log audit entry                           │
│  └─ Returns enrollment record with ID             │
│                                                    │
└──────────────┬──────────────────────────────────────┘
               │ JSON response with enrollment
┌──────────────▼──────────────────────────────────────┐
│ Application Layer (React)                         │
│                                                    │
│  Hook receives response                           │
│  ├─ Updates Zustand state                         │
│  ├─ Invalidates related queries (students list)   │
│  ├─ Shows success toast                           │
│  └─ Redirects to enrollment details               │
│                                                    │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│ UI Layer                                          │
│                                                    │
│  EnrollmentDetails.tsx renders with new data      │
│  └─ User sees success confirmation                │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Feature Flag System

### Architecture

```
┌─────────────────────────────────────────┐
│    Feature Flag Database Table          │
├─────────────────────────────────────────┤
│ id (PK)                                 │
│ org_id (FK)                             │
│ feature_key (e.g., 'lms')               │
│ enabled (boolean)                       │
│ config (JSONB)                          │
│ description                             │
│ created_by                              │
│ created_at                              │
│ updated_at                              │
└─────────────────────────────────────────┘

Example Records:
┌────────────┬────────────────┬─────────┐
│ org_id     │ feature_key    │ enabled │
├────────────┼────────────────┼─────────┤
│ org-123    │ lms            │ true    │
│ org-123    │ 2fa            │ true    │
│ org-123    │ payment        │ false   │
│ org-456    │ lms            │ false   │
│ org-456    │ 2fa            │ true    │
└────────────┴────────────────┴─────────┘
```

### Implementation

```typescript
// Store feature flags in Zustand
const useFeatureFlagsStore = create((set) => ({
  flags: {},
  
  loadFlags: async (orgId) => {
    const { data } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('org_id', orgId);
    
    const flagMap = data.reduce((acc, flag) => {
      acc[flag.feature_key] = flag.enabled;
      return acc;
    }, {});
    
    set({ flags: flagMap });
  },
  
  isEnabled: (featureKey) => {
    return useFeatureFlagsStore.getState().flags[featureKey] ?? false;
  }
}));

// Usage in components
if (useFeatureFlagsStore(state => state.isEnabled('lms'))) {
  return <LMSModule />;
}
```

---

## State Management Architecture

### Zustand Store Hierarchy

```
┌─ useAuthStore
│  ├─ user: User | null
│  ├─ token: string
│  ├─ login()
│  └─ logout()
│
├─ useOrganizationStore
│  ├─ currentOrg: Organization
│  ├─ selectOrganization()
│  └─ organizations[]
│
├─ useBranchStore
│  ├─ currentBranch: Branch
│  ├─ selectBranch()
│  └─ branches[]
│
├─ useUserRolesStore
│  ├─ roles: Role[]
│  ├─ permissions: Permission[]
│  └─ hasPermission(action)
│
├─ useUIStore
│  ├─ sidebarOpen: boolean
│  ├─ darkMode: boolean
│  └─ currentModal: string
│
├─ useFiltersStore
│  ├─ academicFilters: {}
│  ├─ studentFilters: {}
│  └─ [other feature filters]
│
└─ useFeatureFlagsStore
   ├─ flags: {}
   └─ isEnabled(key)
```

### Data Fetching with TanStack Query

```
useQuery Hook Flow:
│
├─ Initial Request
│  ├─ Check cache
│  └─ If not cached, fetch from Supabase
│
├─ Caching
│  ├─ Store in memory
│  ├─ Serve from cache on re-render
│  └─ Background refetch in background
│
├─ Mutations
│  ├─ POST/PUT/DELETE operations
│  ├─ Optimistic updates
│  ├─ Error handling & rollback
│  └─ Invalidate related queries
│
└─ Real-time Updates
   ├─ Supabase Realtime subscription
   ├─ Update cache on changes
   └─ Reflect updates in UI
```

---

## Real-time Architecture

### WebSocket-Based Updates

```
┌─ Frontend React App
│  ├─ Supabase Realtime Subscription
│  │  └─ useEffect(() => {
│  │      const channel = supabase
│  │        .channel('students')
│  │        .on('postgres_changes', 
│  │          { event: 'INSERT', schema: 'public', table: 'students' },
│  │          payload => {
│  │            // Update local state/UI
│  │          }
│  │        )
│  │        .subscribe();
│  │    }, [])
│  │
│  └─ UI Updates in Real-time
│
└─ Database (PostgreSQL)
   ├─ Insert/Update/Delete triggers
   ├─ Broadcast change events via WebSocket
   └─ Connected clients receive updates
```

---

## Error Handling Architecture

### Layered Error Handling

```
Frontend Layer:
  │
  ├─ Input Validation (Zod)
  │  └─ Show validation messages
  │
  ├─ API Request Errors
  │  ├─ Network errors (offline)
  │  ├─ Timeout errors
  │  └─ Authentication errors (401, 403)
  │
  └─ Application Errors
     ├─ Business logic errors
     ├─ State management errors
     └─ Component rendering errors

Backend Layer (Supabase):
  │
  ├─ Database Constraints
  │  ├─ Unique violations
  │  ├─ Foreign key violations
  │  └─ Check constraints
  │
  ├─ RLS Violations
  │  └─ Data access denied
  │
  └─ Function Errors
     └─ Custom error messages from PL/pgSQL

External Services Layer:
  │
  ├─ Razorpay Errors
  ├─ SendGrid Errors
  ├─ Twilio Errors
  └─ Sentry Error Tracking
```

---

## Performance Architecture

### Caching Strategy

```
┌─ Browser Cache (TanStack Query)
│  ├─ Caches all GET requests
│  ├─ Stale-While-Revalidate pattern
│  └─ 5-minute default TTL
│
├─ Local Storage
│  ├─ Feature flags (refreshed on login)
│  ├─ User preferences
│  └─ Temporary form data
│
├─ Database Indexes
│  ├─ org_id on all tables
│  ├─ Foreign keys
│  └─ Frequently filtered columns
│
└─ CDN (Vercel + Supabase Storage)
   ├─ Static assets cached globally
   └─ Files served from edge
```

### Query Optimization

```sql
-- Example: Efficient query with indexes
SELECT 
  s.*, 
  c.name as class_name,
  b.name as batch_name
FROM students s
JOIN classes c ON s.class_id = c.id
JOIN batches b ON c.batch_id = b.id
WHERE s.org_id = 'org-123'  -- Indexed
  AND s.batch_id = 'batch-456'  -- Indexed
  AND s.status = 'active'
LIMIT 50;
```

---

## Security Architecture

### Authentication & Authorization

```
JWT Token Structure:
┌────────────────────────────────────┐
│ Header                             │
│ {                                  │
│   "alg": "HS256",                  │
│   "type": "JWT"                    │
│ }                                  │
└────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────┐
│ Payload                            │
│ {                                  │
│   "sub": "user-id",                │
│   "email": "user@example.com",     │
│   "org_id": "org-123",             │
│   "branch_id": "branch-456",       │
│   "role": "teacher",               │
│   "iat": 1234567890,               │
│   "exp": 1234571490                │
│ }                                  │
└────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────┐
│ Signature                          │
│ HMACSHA256(header + payload)       │
└────────────────────────────────────┘
```

### Row Level Security (RLS)

```sql
-- Every table has RLS policy
CREATE POLICY "org_isolation" ON students
  USING (org_id = (
    SELECT org_id FROM users 
    WHERE id = auth.uid()
  ));

-- Prevents access to other organization's data
-- Even if someone has access to database
-- RLS policy enforces org_id check
```

### Encrypted Fields

```sql
-- Sensitive data encrypted at rest
CREATE TABLE employees (
  id UUID PRIMARY KEY,
  org_id UUID,
  name VARCHAR,
  ssn VARCHAR,  -- Encrypted in app before storing
  salary DECIMAL,  -- Encrypted in app
  bank_account VARCHAR,  -- Encrypted in app
  CONSTRAINT fk_org FOREIGN KEY(org_id) REFERENCES organizations(id)
);
```

---

## Deployment Architecture

```
┌─────────────────────────────┐
│  GitHub (Source Code)       │
└────────────┬────────────────┘
             │ Push to main
             ▼
┌─────────────────────────────┐
│  GitHub Actions (CI/CD)     │
├─────────────────────────────┤
│  1. Run tests               │
│  2. Build project           │
│  3. Check bundle size       │
│  4. Deploy if passing       │
└────────────┬────────────────┘
             │
      ┌──────┴──────┐
      ▼             ▼
┌────────────┐  ┌─────────────────┐
│  Vercel    │  │  Supabase Cloud │
│            │  │                 │
│ Frontend   │  │ Backend         │
│ - React    │  │ - PostgreSQL    │
│ - CDN      │  │ - Auth          │
│ - Logs     │  │ - Storage       │
│ - Analytics│  │ - Realtime      │
└────────────┘  └─────────────────┘
```

---

## Next Steps

1. ✅ Understand system architecture
2. ✅ Review multi-tenancy design
3. ✅ Study authentication flow
4. ✅ Proceed to Phase 2 with `06_AUTHENTICATION_SYSTEM.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Architecture Finalized  
**Next Phase:** Phase 2 - Core Infrastructure
