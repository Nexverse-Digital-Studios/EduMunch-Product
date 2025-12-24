# EduMunch: Role-Based Access Control & Permission Management

> **Efficient permission management architecture that calls the database ONLY ONCE at login**

---

## Table of Contents

1. [Overview](#overview)
2. [Permission Management Strategy](#permission-management-strategy)
3. [Three-Layer Protection System](#three-layer-protection-system)
4. [Implementation Architecture](#implementation-architecture)
5. [Performance Benefits](#performance-benefits)
6. [Cache Invalidation Strategy](#cache-invalidation-strategy)

---

## Overview

### The Challenge

For every route navigation and button click, we need to verify user permissions. Traditional approaches query the database repeatedly, causing:

- **Performance degradation** (100+ DB calls per session)
- **Increased Supabase API costs**
- **Network latency issues**
- **Poor user experience**

### The Solution

**Fetch permissions ONCE at login → Cache in memory → Use for entire session**

---

## Permission Management Strategy

### Login Flow - Fetch Once, Cache Everywhere

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LOGS IN                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Call get_user_permissions_1EMAET(user_id)  [ONE DB CALL]      │
│  • Aggregates role permissions                                  │
│  • Includes additional cross-role permissions                   │
│  • Returns complete permission set                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Build Permission Cache Object                                  │
│  {                                                              │
│    userId: 'uuid',                                              │
│    primaryRole: { id, code, name },                             │
│    permissions: {                                               │
│      teachers: { canView: true, canCreate: true, ... },        │
│      students: { canView: true, canCreate: false, ... },       │
│      fees: { canView: true, canApprove: true, ... }            │
│    },                                                           │
│    routes: ['/teachers', '/students', '/fees', ...],           │
│    timestamp: 1735000000000                                     │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
         ┌─────────────────┐  ┌─────────────────┐
         │  React Context  │  │  LocalStorage   │
         │  (In-Memory)    │  │  (Persistent)   │
         └─────────────────┘  └─────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               ALL SUBSEQUENT CHECKS                             │
│                  ↓↓↓ NO DATABASE CALLS ↓↓↓                     │
│  • Route navigation checks cache                                │
│  • Button visibility checks cache                               │
│  • Form field access checks cache                               │
│  • API requests verify JWT (no DB)                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## What Gets Cached at Login

### Permission Cache Structure

```typescript
interface UserPermissionCache {
  userId: string;
  primaryRole: {
    id: string;
    code: string; // 'hr_manager', 'teacher', 'student', 'admin'
    name: string; // 'HR Manager', 'Teacher', 'Student', 'Administrator'
  };
  permissions: {
    [moduleCode: string]: {
      canView: boolean; // Read access
      canCreate: boolean; // Create new records
      canUpdate: boolean; // Edit existing records
      canDelete: boolean; // Delete records
      canApprove: boolean; // Approve workflows
      canExport: boolean; // Export data
      constraints?: {
        // Optional restrictions
        maxAmount?: number;
        departments?: string[];
        timeRestrictions?: string;
      };
    };
  };
  routes: string[]; // All allowed route paths
  timestamp: number; // For cache invalidation
}
```

### Example: HR Manager Permissions

```json
{
  "userId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "primaryRole": {
    "id": "role-uuid-hr",
    "code": "hr_manager",
    "name": "HR Manager"
  },
  "permissions": {
    "dashboard": {
      "canView": true,
      "canCreate": false,
      "canUpdate": false,
      "canDelete": false,
      "canApprove": false,
      "canExport": false
    },
    "teachers": {
      "canView": true,
      "canCreate": true,
      "canUpdate": true,
      "canDelete": false,
      "canApprove": true,
      "canExport": true
    },
    "employees": {
      "canView": true,
      "canCreate": true,
      "canUpdate": true,
      "canDelete": false,
      "canApprove": true,
      "canExport": true
    },
    "payroll": {
      "canView": true,
      "canCreate": true,
      "canUpdate": true,
      "canDelete": false,
      "canApprove": true,
      "canExport": true
    },
    "fees": {
      "canView": true,
      "canCreate": false,
      "canUpdate": false,
      "canDelete": false,
      "canApprove": true,
      "canExport": false,
      "constraints": {
        "maxAmount": 50000
      }
    },
    "students": {
      "canView": true,
      "canCreate": false,
      "canUpdate": false,
      "canDelete": false,
      "canApprove": false,
      "canExport": true
    }
  },
  "routes": [
    "/dashboard",
    "/teachers",
    "/employees",
    "/payroll",
    "/fees",
    "/students"
  ],
  "timestamp": 1735000000000
}
```

---

## Three-Layer Protection System

### Layer 1: Frontend Route Guards (React Router)

**Purpose**: Prevent unauthorized route access before component renders

**Mechanism**: Check cached permissions instantly (NO database call)

```typescript
// src/routes/AppRoutes.tsx
import { FEATURES } from "@/config/features.config";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes - Always Available */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredModule="dashboard" requiredAction="view">
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Student Management */}
      <Route
        path="/students"
        element={
          <ProtectedRoute requiredModule="students" requiredAction="view">
            <Students />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Teacher Management */}
      <Route
        path="/teachers"
        element={
          <ProtectedRoute requiredModule="teachers" requiredAction="view">
            <Teachers />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - HR (only if user has permission) */}
      <Route
        path="/employees"
        element={
          <ProtectedRoute requiredModule="employees" requiredAction="view">
            <Employees />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payroll"
        element={
          <ProtectedRoute requiredModule="payroll" requiredAction="view">
            <Payroll />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Fee Management */}
      <Route
        path="/fees"
        element={
          <ProtectedRoute requiredModule="fees" requiredAction="view">
            <Fees />
          </ProtectedRoute>
        }
      />

      {/* Feature-gated + Permission-gated routes */}
      {FEATURES.lms && (
        <Route
          path="/assignments"
          element={
            <ProtectedRoute requiredModule="lms" requiredAction="view">
              <Assignments />
            </ProtectedRoute>
          }
        />
      )}

      {FEATURES.transport && (
        <Route
          path="/transport"
          element={
            <ProtectedRoute requiredModule="transport" requiredAction="view">
              <Transport />
            </ProtectedRoute>
          }
        />
      )}

      {/* Unauthorized / Not Found */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
```

---

### Layer 2: UI Component Guards

**Purpose**: Show/hide UI elements based on permissions

**Mechanism**: Check cached permissions for button visibility

```typescript
// src/pages/Teachers.tsx
import { usePermissions } from "@/hooks/usePermissions";

export function TeachersPage() {
  const { hasPermission } = usePermissions();
  const [teachers, setTeachers] = useState([]);

  return (
    <div>
      <div className="page-header">
        <h1>Teachers</h1>

        {/* Only show if user has CREATE permission */}
        {hasPermission("teachers", "create") && (
          <Button onClick={openAddTeacherModal}>
            <Plus /> Add Teacher
          </Button>
        )}

        {/* Only show if user has EXPORT permission */}
        {hasPermission("teachers", "export") && (
          <Button onClick={exportToExcel}>
            <Download /> Export Excel
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Employee Code</TableHead>
            <TableHead>Department</TableHead>
            {/* Show Actions column only if user can update or delete */}
            {(hasPermission("teachers", "update") ||
              hasPermission("teachers", "delete")) && (
              <TableHead>Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map((teacher) => (
            <TableRow key={teacher.id}>
              <TableCell>{teacher.name}</TableCell>
              <TableCell>{teacher.code}</TableCell>
              <TableCell>{teacher.department}</TableCell>

              {(hasPermission("teachers", "update") ||
                hasPermission("teachers", "delete")) && (
                <TableCell>
                  {/* Show edit button only if UPDATE permission */}
                  {hasPermission("teachers", "update") && (
                    <Button onClick={() => editTeacher(teacher.id)}>
                      <Edit /> Edit
                    </Button>
                  )}

                  {/* Show delete button only if DELETE permission */}
                  {hasPermission("teachers", "delete") && (
                    <Button
                      variant="destructive"
                      onClick={() => deleteTeacher(teacher.id)}
                    >
                      <Trash /> Delete
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

---

### Layer 3: API Request Guards (Backend)

**Purpose**: Validate permissions on backend before processing requests

**Mechanism**: Verify JWT token contains required permission

```typescript
// Supabase Edge Function or Backend API
export async function checkPermissionMiddleware(
  req: Request,
  module: string,
  action: "view" | "create" | "update" | "delete" | "approve" | "export"
) {
  // 1. Extract JWT from Authorization header
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  // 2. Verify JWT signature (built into Supabase)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
    });
  }

  // 3. Check if JWT contains required permission
  // Permissions are embedded in JWT claims during login
  const permissions = user.app_metadata?.permissions || {};

  if (
    !permissions[module]?.[
      `can${action.charAt(0).toUpperCase() + action.slice(1)}`
    ]
  ) {
    return new Response(
      JSON.stringify({ error: "Forbidden - Insufficient permissions" }),
      { status: 403 }
    );
  }

  // Permission validated - proceed with request
  return null; // No error
}

// Example usage in API route
export async function POST(req: Request) {
  // Check permission
  const permissionError = await checkPermissionMiddleware(
    req,
    "teachers",
    "create"
  );
  if (permissionError) return permissionError;

  // Process the request
  const body = await req.json();
  const { data, error } = await supabase
    .from(`teachers_${INDEX_TOKEN}`)
    .insert(body);

  return new Response(JSON.stringify({ data }), { status: 201 });
}
```

---

## Implementation Architecture

### File Structure

```
src/
├── config/
│   └── features.config.ts          # Feature toggles (code-based)
├── contexts/
│   ├── AuthContext.tsx              # Authentication state
│   └── PermissionContext.tsx        # Permission cache & helpers
├── hooks/
│   ├── useAuth.ts                   # Authentication hooks
│   └── usePermissions.ts            # Permission check hooks
├── lib/
│   ├── permissionCache.ts           # Permission cache builder
│   └── supabase.ts                  # Supabase client
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx       # Route guard component
└── routes/
    └── AppRoutes.tsx                # Route configuration
```

---

### Step 1: Permission Cache Builder

```typescript
// src/lib/permissionCache.ts

export interface UserPermissionCache {
  userId: string;
  primaryRole: {
    id: string;
    code: string;
    name: string;
  };
  permissions: {
    [moduleCode: string]: {
      canView: boolean;
      canCreate: boolean;
      canUpdate: boolean;
      canDelete: boolean;
      canApprove: boolean;
      canExport: boolean;
      constraints?: any;
    };
  };
  routes: string[];
  timestamp: number;
}

export function buildPermissionCache(
  rawPermissions: any[]
): UserPermissionCache {
  const cache: UserPermissionCache = {
    userId: "",
    primaryRole: { id: "", code: "", name: "" },
    permissions: {},
    routes: [],
    timestamp: Date.now(),
  };

  // Group by module
  const moduleMap = new Map<string, any>();

  rawPermissions.forEach((perm) => {
    const module = perm.module_code;

    if (!moduleMap.has(module)) {
      moduleMap.set(module, {
        canView: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canApprove: false,
        canExport: false,
        constraints: perm.constraints || null,
      });
    }

    const modulePerms = moduleMap.get(module);

    // Set flags based on CRUD actions from database
    if (perm.can_read) modulePerms.canView = true;
    if (perm.can_create) modulePerms.canCreate = true;
    if (perm.can_update) modulePerms.canUpdate = true;
    if (perm.can_delete) modulePerms.canDelete = true;
    if (perm.can_approve) modulePerms.canApprove = true;
    if (perm.can_export) modulePerms.canExport = true;

    // Add route to allowed routes if this is a route-type permission
    if (perm.resource_type === "route" && perm.can_read && perm.resource_path) {
      if (!cache.routes.includes(perm.resource_path)) {
        cache.routes.push(perm.resource_path);
      }
    }
  });

  // Convert map to object
  cache.permissions = Object.fromEntries(moduleMap);

  return cache;
}
```

---

### Step 2: Login Flow with Permission Fetching (Optimized)

```typescript
// src/lib/auth.ts

import { supabase } from "./supabase";
import { buildPermissionCache, UserPermissionCache } from "./permissionCache";

const INDEX_TOKEN = import.meta.env.VITE_INDEX_TOKEN; // e.g., '1EMAET'

export async function loginAndCachePermissions(
  email: string,
  password: string
): Promise<{ user: any; permissions: UserPermissionCache }> {
  // 1. Authenticate with Supabase Auth
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError) throw authError;

  // 2. Get user record WITH primary role in single query (OPTIMIZED)
  // Using primary_role_id in users table for efficient lookup
  const { data: user, error: userError } = await supabase
    .from(`users_${INDEX_TOKEN}`)
    .select(
      `
      id, 
      email, 
      full_name, 
      index_token,
      primary_role_id,
      primary_role:primary_role_id (
        id,
        role_code,
        role_name
      )
    `
    )
    .eq("auth_user_id", authData.user.id)
    .single();

  if (userError) throw userError;

  // 3. Call permission function (ONLY DB CALL FOR PERMISSIONS)
  const { data: rawPermissions, error: permError } = await supabase.rpc(
    `get_user_permissions_${INDEX_TOKEN}`,
    {
      p_user_id: user.id,
    }
  );

  if (permError) throw permError;

  // 4. Build permission cache structure
  const permissionCache = buildPermissionCache(rawPermissions);

  // Add user details (primary_role already fetched with user query)
  permissionCache.userId = user.id;
  permissionCache.primaryRole = {
    id: user.primary_role?.id || "",
    code: user.primary_role?.role_code || "",
    name: user.primary_role?.role_name || "",
  };

  // 5. Store in localStorage for persistence across page reloads
  localStorage.setItem("user_permissions", JSON.stringify(permissionCache));
  localStorage.setItem(
    "user_info",
    JSON.stringify({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.primary_role?.role_name || "No Role",
    })
  );

  return {
    user,
    permissions: permissionCache,
  };
}

export async function logout() {
  // Clear cache
  localStorage.removeItem("user_permissions");
  localStorage.removeItem("user_info");

  // Sign out from Supabase
  await supabase.auth.signOut();
}
```

**Login Flow Optimization:**

| Step | Before (3 Queries)              | After (2 Queries)                                          |
| ---- | ------------------------------- | ---------------------------------------------------------- |
| 1    | Supabase Auth login             | Supabase Auth login                                        |
| 2    | Query `users` table             | Query `users` with JOIN to `roles` (via `primary_role_id`) |
| 3    | Query `user_roles` table        | ~~Eliminated~~                                             |
| 4    | Query `roles` table             | ~~Eliminated~~                                             |
| 5    | Call `get_user_permissions` RPC | Call `get_user_permissions` RPC                            |

**Result**: 33% reduction in login queries (3 → 2 DB calls)

---

### Step 3: Permission Context Provider

```typescript
// src/contexts/PermissionContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { UserPermissionCache } from "@/lib/permissionCache";

interface PermissionContextType {
  permissions: UserPermissionCache | null;
  hasPermission: (
    module: string,
    action: "view" | "create" | "update" | "delete" | "approve" | "export"
  ) => boolean;
  canAccessRoute: (path: string) => boolean;
  setPermissions: (perms: UserPermissionCache) => void;
  clearPermissions: () => void;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);

export function PermissionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [permissions, setPermissionsState] =
    useState<UserPermissionCache | null>(() => {
      // Load from localStorage on mount (NO DB CALL)
      const cached = localStorage.getItem("user_permissions");
      return cached ? JSON.parse(cached) : null;
    });

  const setPermissions = useCallback((perms: UserPermissionCache) => {
    setPermissionsState(perms);
    localStorage.setItem("user_permissions", JSON.stringify(perms));
  }, []);

  const clearPermissions = useCallback(() => {
    setPermissionsState(null);
    localStorage.removeItem("user_permissions");
  }, []);

  // Check if user has specific permission for a module
  const hasPermission = useCallback(
    (
      module: string,
      action: "view" | "create" | "update" | "delete" | "approve" | "export"
    ): boolean => {
      if (!permissions) return false;

      const modulePerms = permissions.permissions[module];
      if (!modulePerms) return false;

      switch (action) {
        case "view":
          return modulePerms.canView;
        case "create":
          return modulePerms.canCreate;
        case "update":
          return modulePerms.canUpdate;
        case "delete":
          return modulePerms.canDelete;
        case "approve":
          return modulePerms.canApprove;
        case "export":
          return modulePerms.canExport;
        default:
          return false;
      }
    },
    [permissions]
  );

  // Check if user can access a specific route
  const canAccessRoute = useCallback(
    (path: string): boolean => {
      if (!permissions) return false;
      return permissions.routes.includes(path);
    },
    [permissions]
  );

  // Refresh permissions from database (called only when admin changes permissions)
  const refreshPermissions = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");

      const { data: rawPermissions } = await supabase.rpc(
        `get_user_permissions_${INDEX_TOKEN}`,
        {
          p_user_id: userInfo.id,
        }
      );

      const newCache = buildPermissionCache(rawPermissions);
      newCache.userId = userInfo.id;
      newCache.primaryRole = permissions?.primaryRole || {
        id: "",
        code: "",
        name: "",
      };

      setPermissions(newCache);
    } catch (error) {
      console.error("Failed to refresh permissions:", error);
    }
  };

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        hasPermission,
        canAccessRoute,
        setPermissions,
        clearPermissions,
        refreshPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

// Custom hook for easy access
export function usePermissions() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
}
```

---

### Step 4: Protected Route Component

```typescript
// src/components/auth/ProtectedRoute.tsx

import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { usePermissions } from "@/contexts/PermissionContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredModule: string;
  requiredAction?:
    | "view"
    | "create"
    | "update"
    | "delete"
    | "approve"
    | "export";
}

export function ProtectedRoute({
  children,
  requiredModule,
  requiredAction = "view",
}: ProtectedRouteProps) {
  const { permissions, hasPermission } = usePermissions();
  const navigate = useNavigate();

  // Check if user is logged in
  if (!permissions) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required permission (NO DATABASE CALL - checks cache)
  const allowed = hasPermission(requiredModule, requiredAction);

  useEffect(() => {
    if (!allowed) {
      navigate("/unauthorized", { replace: true });
    }
  }, [allowed, navigate]);

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
```

---

### Step 5: Custom Hook for Permissions

```typescript
// src/hooks/usePermissions.ts

export { usePermissions } from "@/contexts/PermissionContext";

// Alternative: Create additional helper hooks

export function useModulePermissions(module: string) {
  const { hasPermission } = usePermissions();

  return {
    canView: hasPermission(module, "view"),
    canCreate: hasPermission(module, "create"),
    canUpdate: hasPermission(module, "update"),
    canDelete: hasPermission(module, "delete"),
    canApprove: hasPermission(module, "approve"),
    canExport: hasPermission(module, "export"),
  };
}

// Usage in component:
// const { canView, canCreate, canUpdate, canDelete } = useModulePermissions('teachers');
```

---

### Step 6: Dynamic Sidebar with Permission Checks

```typescript
// src/components/layout/AppSidebar.tsx

import { usePermissions } from "@/hooks/usePermissions";
import { FEATURES } from "@/config/features.config";
import { NavLink } from "@/components/NavLink";

export function AppSidebar() {
  const { hasPermission, permissions } = usePermissions();

  return (
    <aside className="sidebar">
      <nav>
        {/* Dashboard - Always visible */}
        <NavLink to="/dashboard" icon="home">
          Dashboard
        </NavLink>

        {/* Student Management */}
        {hasPermission("students", "view") && (
          <NavLink to="/students" icon="users">
            Students
          </NavLink>
        )}

        {/* Teacher Management */}
        {hasPermission("teachers", "view") && (
          <NavLink to="/teachers" icon="user-tie">
            Teachers
          </NavLink>
        )}

        {/* Attendance */}
        {hasPermission("attendance", "view") && (
          <NavLink to="/attendance" icon="calendar-check">
            Attendance
          </NavLink>
        )}

        {/* Examinations */}
        {hasPermission("exams", "view") && (
          <NavLink to="/exams" icon="file-text">
            Examinations
          </NavLink>
        )}

        {/* Fee Management */}
        {hasPermission("fees", "view") && (
          <NavLink to="/fees" icon="dollar-sign">
            Fee Management
          </NavLink>
        )}

        {/* HR Section - Only visible to HR role */}
        {hasPermission("hr", "view") && (
          <div className="nav-section">
            <h3>Human Resources</h3>
            <NavLink to="/employees" icon="briefcase">
              Employees
            </NavLink>
            {hasPermission("payroll", "view") && (
              <NavLink to="/payroll" icon="wallet">
                Payroll
              </NavLink>
            )}
          </div>
        )}

        {/* LMS - Feature toggle + Permission check */}
        {FEATURES.lms && hasPermission("lms", "view") && (
          <div className="nav-section">
            <h3>Learning</h3>
            <NavLink to="/assignments" icon="clipboard">
              Assignments
            </NavLink>
            <NavLink to="/study-materials" icon="book">
              Study Materials
            </NavLink>
          </div>
        )}

        {/* Transport - Feature toggle + Permission check */}
        {FEATURES.transport && hasPermission("transport", "view") && (
          <NavLink to="/transport" icon="bus">
            Transport
          </NavLink>
        )}

        {/* Library - Feature toggle + Permission check */}
        {FEATURES.library && hasPermission("library", "view") && (
          <NavLink to="/library" icon="book-open">
            Library
          </NavLink>
        )}

        {/* Reports - Usually visible to admins and managers */}
        {hasPermission("reports", "view") && (
          <NavLink to="/reports" icon="bar-chart">
            Reports & Analytics
          </NavLink>
        )}

        {/* Settings - Admin only */}
        {permissions?.primaryRole.code === "super_admin" && (
          <NavLink to="/settings" icon="settings">
            Settings
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
```

---

## Performance Benefits

### Traditional Approach vs Cached Approach

| Scenario                      | Traditional DB Queries | Cached Approach      | Improvement         |
| ----------------------------- | ---------------------- | -------------------- | ------------------- |
| User logs in                  | 1                      | 1                    | Same                |
| Navigates to 10 pages         | 10                     | 0                    | **100% reduction**  |
| Renders sidebar with 15 items | 15                     | 0                    | **100% reduction**  |
| Renders page with 20 buttons  | 20                     | 0                    | **100% reduction**  |
| Makes 100 API calls           | 100                    | 0 (JWT verification) | **100% reduction**  |
| **Total DB Calls**            | **146**                | **1**                | **99.3% reduction** |

### Cost & Performance Impact

**Without Caching (Traditional)**:

- 146 Supabase API calls per session
- ~300ms network latency per call = 43,800ms total delay
- Higher Supabase API usage costs
- Poor user experience (slow UI)

**With Caching (Our Approach)**:

- 1 Supabase API call per session
- Instant permission checks (<1ms from memory)
- Minimal API costs
- Fast, responsive UI

---

## Cache Invalidation Strategy

### When to Refresh Permissions

Permissions are cached until one of these events occurs:

#### 1. **Token Expiry** (Automatic)

```typescript
// JWT tokens typically expire after 24 hours
// On next login, permissions are automatically re-fetched

if (tokenExpired) {
  // User forced to re-login
  // loginAndCachePermissions() is called again
  // Fresh permissions loaded from database
}
```

#### 2. **Admin Changes User Permissions** (Real-time)

```typescript
// When admin updates user's role or permissions in Admin Panel
// Backend sends WebSocket notification

// Admin Panel (Backend)
socket.emit("permissions_updated", {
  userId: "user-uuid-here",
  message: "Your permissions have been updated",
});

// User's Browser (Frontend)
socket.on("permissions_updated", async (data) => {
  if (data.userId === currentUser.id) {
    await refreshPermissions(); // Re-fetch from DB
    toast.success("Your permissions have been updated. Please refresh.");
  }
});
```

#### 3. **User Manual Refresh** (Optional)

```typescript
// Add "Sync Permissions" button in user profile/settings

<Button
  onClick={async () => {
    await refreshPermissions();
    toast.success("Permissions synced successfully");
  }}
>
  <RefreshCw /> Sync Permissions
</Button>
```

#### 4. **User Logs Out** (Automatic)

```typescript
// Clear all cached data
localStorage.removeItem("user_permissions");
localStorage.removeItem("user_info");
```

---

## Security Considerations

### 1. **Frontend Caching is NOT a Security Risk**

**Why?** Because backend always validates permissions via JWT:

```typescript
// Frontend can be manipulated (user can edit localStorage)
// But backend will REJECT unauthorized requests

// User tries to manually add permission in localStorage:
localStorage.setItem(
  "user_permissions",
  JSON.stringify({
    teachers: { canDelete: true }, // ❌ Manually added
  })
);

// When API request is made:
const response = await fetch("/api/teachers/delete", {
  headers: { Authorization: `Bearer ${jwt_token}` },
});

// Backend checks JWT claims (which user cannot forge)
// JWT was signed by Supabase with secret key
// User doesn't have 'teachers.delete' in JWT → Request REJECTED
```

### 2. **JWT Contains Permission Hash**

```typescript
// During login, embed permission signature in JWT
const jwt_payload = {
  user_id: "uuid",
  role: "hr_manager",
  permissions_hash: sha256(JSON.stringify(permissions)), // Tamper detection
  exp: Date.now() + 86400000, // 24 hours
};

// Backend verifies hash matches actual permissions
```

### 3. **Row Level Security (RLS) as Final Guard**

Even if both frontend and backend checks fail, Supabase RLS prevents unauthorized data access:

```sql
-- Example RLS policy for teachers table
CREATE POLICY "Users can view teachers if they have permission"
ON teachers_1EMAET
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM get_user_permissions_1EMAET(auth.uid())
    WHERE module_code = 'teachers' AND can_read = true
  )
);
```

---

## Example: Complete Permission Flow

### Scenario: HR Manager tries to delete a teacher

```
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: User clicks "Delete Teacher" button                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: Frontend checks cached permission                      │
│  hasPermission('teachers', 'delete') → FALSE                    │
│  Button is hidden (never rendered)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: If user manipulates DOM and sends API request anyway   │
│  DELETE /api/teachers/123                                       │
│  Headers: { Authorization: Bearer JWT_TOKEN }                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: Backend validates JWT                                  │
│  JWT contains: { role: 'hr_manager', permissions: {...} }       │
│  Check: permissions.teachers.canDelete? → FALSE                 │
│  Response: 403 Forbidden                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 5: Even if backend bypassed, Supabase RLS blocks query    │
│  RLS Policy: "Allow DELETE only if user has delete permission"  │
│  Query fails at database level                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Result**: User cannot delete teacher through any means

---

## Summary

✅ **One DB call at login** - All permissions fetched via `get_user_permissions_1EMAET()`  
✅ **Cached in memory** - React Context + LocalStorage  
✅ **Frontend route guards** - Instant permission checks from cache  
✅ **UI element guards** - Show/hide buttons based on cached permissions  
✅ **Backend protection** - JWT-based verification (no additional DB hits)  
✅ **Refresh on demand** - Admin changes trigger permission re-fetch  
✅ **Multi-layer security** - Frontend cache + Backend JWT + Database RLS

**Performance**: 99.3% reduction in database calls (146 → 1 per session)

---

## Next Steps

1. ✅ Understand the architecture (this document)
2. ⏳ Implement `PermissionContext.tsx`
3. ⏳ Implement `ProtectedRoute.tsx`
4. ⏳ Update login flow to cache permissions
5. ⏳ Add permission checks to all routes
6. ⏳ Add permission checks to UI components
7. ⏳ Implement backend JWT validation
8. ⏳ Test with different user roles

---

**Status**: Architecture complete. Ready for implementation.
