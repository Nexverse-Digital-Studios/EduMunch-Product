# Roles & Permissions System

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

The Roles & Permissions system is the foundation of access control in EduMunch. It supports both predefined roles and custom role creation per organization, with granular permission control.

---

## Architecture

### Role Hierarchy

```
┌─ Super Admin (System Level)
│  └─ Can: Manage organizations, enable/disable features, view all data
│
├─ Organization Admin / Branch Admin
│  └─ Can: Manage users in organization/branch, view reports
│
├─ Department/Module Specific Roles
│  ├─ Teacher/Faculty
│  ├─ Finance Manager
│  ├─ HR Manager
│  └─ [Custom roles]
│
└─ End Users
   ├─ Student
   ├─ Parent
   └─ Employee
```

### Permission Model

```
Three-layer permission system:

1. Resource Level (Data)
   ├─ Users can access Student data
   ├─ Users can access Course data
   └─ Users can access Fee data

2. Action Level (CRUD)
   ├─ Create (C)
   ├─ Read (R)
   ├─ Update (U)
   └─ Delete (D)

3. Scope Level (Visibility)
   ├─ Own data only
   ├─ Organization data
   ├─ Branch data
   └─ All data (Super Admin)

Example: "Teacher can READ and UPDATE Results for their own batches"
         Resource: Results | Action: READ, UPDATE | Scope: own_batches
```

---

## Database Schema

### Core Tables

```sql
-- 1. Predefined Roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID,                                      -- NULL for system roles
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,                       -- Unique identifier
  description TEXT,
  
  -- Role Type
  role_type VARCHAR(50),                            -- 'predefined', 'custom'
  is_system_role BOOLEAN DEFAULT false,             -- Cannot be deleted
  
  -- Hierarchy
  parent_role_id UUID,                              -- For role inheritance
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_role UNIQUE(org_id, slug),
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_parent_role FOREIGN KEY (parent_role_id) 
    REFERENCES roles(id) ON DELETE SET NULL
);

-- System predefined roles (org_id = NULL)
INSERT INTO roles (name, slug, description, is_system_role) VALUES
  ('Super Admin', 'super_admin', 'System administrator', true),
  ('Organization Admin', 'org_admin', 'Organization administrator', true),
  ('Branch Admin', 'branch_admin', 'Branch administrator', true),
  ('Teacher', 'teacher', 'Teaching staff', true),
  ('Student', 'student', 'Student account', true),
  ('Parent', 'parent', 'Parent/Guardian account', true),
  ('Employee', 'employee', 'Staff member', true),
  ('Front Desk', 'front_desk', 'Front desk staff', true);

CREATE INDEX idx_roles_org_id ON roles(org_id);
CREATE INDEX idx_roles_slug ON roles(slug);

-- 2. Permissions
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module VARCHAR(100),                              -- 'academics', 'financial', 'users'
  resource VARCHAR(100),                            -- 'courses', 'students', 'fees'
  action VARCHAR(50),                               -- 'create', 'read', 'update', 'delete'
  description VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_permission UNIQUE(module, resource, action)
);

-- System permissions (insert these)
INSERT INTO permissions (module, resource, action, description) VALUES
  ('academics', 'courses', 'create', 'Can create new courses'),
  ('academics', 'courses', 'read', 'Can view courses'),
  ('academics', 'courses', 'update', 'Can modify courses'),
  ('academics', 'courses', 'delete', 'Can delete courses'),
  ('academics', 'students', 'read', 'Can view students'),
  ('financial', 'fees', 'read', 'Can view fee information'),
  ('financial', 'payments', 'create', 'Can create payment records'),
  ('users', 'users', 'read', 'Can view user directory'),
  ('users', 'users', 'update', 'Can modify user information'),
  -- ... (100+ more permissions for all features)
;

-- 3. Role-Permission Mapping (Many-to-Many)
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL,
  permission_id UUID NOT NULL,
  
  -- Scope control
  scope VARCHAR(50) DEFAULT 'organization',         -- 'organization', 'branch', 'own', 'all'
  conditions JSONB,                                 -- Additional conditions
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_role_perm UNIQUE(role_id, permission_id, scope),
  CONSTRAINT fk_role FOREIGN KEY (role_id) 
    REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_permission FOREIGN KEY (permission_id) 
    REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE INDEX idx_role_perms_role_id ON role_permissions(role_id);

-- 4. User Roles (Assignment)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  role_id UUID NOT NULL,
  
  -- Scope of role
  scope_type VARCHAR(50),                           -- 'organization', 'branch'
  scope_id UUID,                                    -- branch_id if branch-scoped
  
  -- Effective dates
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,                             -- NULL = no expiry
  is_active BOOLEAN DEFAULT true,
  
  assigned_by UUID,                                 -- Admin who assigned
  reason TEXT,                                      -- Why assigned
  
  CONSTRAINT unique_user_role UNIQUE(user_id, role_id, scope_id),
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_role FOREIGN KEY (role_id) 
    REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_branch FOREIGN KEY (scope_id) 
    REFERENCES branches(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_org_id ON user_roles(org_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- 5. Dynamic Roles (Temporary Role Elevation)
CREATE TABLE role_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  requested_role_id UUID NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending',             -- pending, approved, rejected, expired
  
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  approved_by UUID,
  expires_at TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_role FOREIGN KEY (requested_role_id) 
    REFERENCES roles(id) ON DELETE CASCADE
);

-- 6. Permission Cache (for performance)
CREATE TABLE user_permissions_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  
  -- Cached permissions as JSONB
  permissions JSONB,                                -- Flat list for quick lookup
  
  -- Cache validity
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_perm_cache_user_id ON user_permissions_cache(user_id);
```

---

## Predefined Roles

### 1. Super Admin
```
Permissions:
- All permissions in the system
- Access all organizations
- Can enable/disable features per organization
- Can manage Super Admins
- Full audit log access
```

### 2. Organization Admin
```
Permissions:
- Manage users (create, read, update, delete)
- Manage roles (assign roles, create custom roles)
- View financial reports
- Configure organization settings
- Manage branches
- Cannot access other organizations
```

### 3. Branch Admin
```
Permissions:
- Manage users in assigned branch only
- View branch performance
- Manage staff in branch
- Cannot access other branches or organization settings
```

### 4. Teacher
```
Permissions:
- Create and grade assignments
- Mark attendance
- Upload course content
- Communicate with parents/students
- View their student list
- Cannot modify course structure
- Cannot access financial data
```

### 5. Student
```
Permissions:
- View assigned classes
- Submit assignments
- View grades and performance
- View fees and payment history
- View attendance
- Cannot access other students' data
```

### 6. Parent
```
Permissions:
- View assigned children's data
- View fees and payments
- Communicate with teachers
- Cannot modify any data
```

### 7. Employee (HR)
```
Permissions:
- Manage employee records
- Process leave requests
- Manage payroll
- View attendance
- Cannot access student or course data
```

### 8. Front Desk
```
Permissions:
- Register new admissions
- View student list
- Mark daily attendance
- Cannot access financial or grading data
```

---

## Implementation Files

### 1. Roles & Permissions Types (src/types/roles.types.ts)

```typescript
export interface Role {
  id: string;
  org_id?: string;
  name: string;
  slug: string;
  description?: string;
  role_type: 'predefined' | 'custom';
  is_system_role: boolean;
  parent_role_id?: string;
}

export interface Permission {
  id: string;
  module: string;
  resource: string;
  action: string;
  description?: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  scope: 'organization' | 'branch' | 'own' | 'all';
  conditions?: Record<string, any>;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  scope_type?: string;
  scope_id?: string;
  is_active: boolean;
  expires_at?: string;
}

export type PermissionString = `${string}:${string}:${string}`;
// Example: 'academics:courses:create'
```

### 2. Roles Service (src/services/roles.service.ts)

```typescript
import { supabase } from '@/services/api/client';
import { Role, Permission, UserRole } from '@/types/roles.types';

export const rolesService = {
  // Get all predefined roles
  async getPredefinedRoles(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('is_system_role', true);
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Get organization roles (predefined + custom)
  async getOrgRoles(orgId: string): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .or(`org_id.eq.${orgId},is_system_role.eq.true`);
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Create custom role
  async createCustomRole(orgId: string, role: Partial<Role>) {
    const { data, error } = await supabase
      .from('roles')
      .insert({
        ...role,
        org_id: orgId,
        role_type: 'custom',
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Get all permissions
  async getPermissions(): Promise<Permission[]> {
    const { data, error } = await supabase
      .from('permissions')
      .select('*');
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Get role permissions
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const { data, error } = await supabase
      .from('role_permissions')
      .select(`
        permission:permissions(*)
      `)
      .eq('role_id', roleId);
    
    if (error) throw new Error(error.message);
    return data.map(rp => rp.permission);
  },
  
  // Assign permission to role
  async assignPermissionToRole(
    roleId: string,
    permissionId: string,
    scope: string = 'organization'
  ) {
    const { data, error } = await supabase
      .from('role_permissions')
      .insert({
        role_id: roleId,
        permission_id: permissionId,
        scope,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Assign role to user
  async assignRoleToUser(
    userId: string,
    roleId: string,
    orgId: string,
    scopeType?: string,
    scopeId?: string
  ) {
    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: roleId,
        org_id: orgId,
        scope_type: scopeType || 'organization',
        scope_id: scopeId,
        is_active: true,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Get user roles
  async getUserRoles(userId: string, orgId: string): Promise<UserRole[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .eq('is_active', true);
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Check if user has permission
  async hasPermission(
    userId: string,
    orgId: string,
    module: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    // Get user roles
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .eq('is_active', true);
    
    if (roleError) throw new Error(roleError.message);
    
    const roleIds = userRoles.map(ur => ur.role_id);
    
    // Check if any role has the permission
    const { data: permissions, error: permError } = await supabase
      .from('role_permissions')
      .select('permission:permissions(*)')
      .in('role_id', roleIds);
    
    if (permError) throw new Error(permError.message);
    
    return permissions.some(
      rp => rp.permission.module === module &&
            rp.permission.resource === resource &&
            rp.permission.action === action
    );
  },
  
  // Get user permissions (for frontend caching)
  async getUserPermissions(userId: string, orgId: string): Promise<string[]> {
    const { data, error } = await supabase
      .rpc('get_user_permissions', { p_user_id: userId, p_org_id: orgId });
    
    if (error) throw new Error(error.message);
    return data;
  },
};
```

### 3. Roles Hook (src/hooks/useUserRoles.ts)

```typescript
import { useQuery } from '@tanstack/react-query';
import { rolesService } from '@/services/roles.service';
import { useAuthStore } from '@/store/auth.store';

export function useUserRoles() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['user-roles', user?.id, user?.org_id],
    queryFn: () => 
      rolesService.getUserRoles(user!.id, user!.org_id),
    enabled: !!user,
  });
}

export function useHasPermission(
  module: string,
  resource: string,
  action: string
) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['has-permission', user?.id, user?.org_id, module, resource, action],
    queryFn: () =>
      rolesService.hasPermission(
        user!.id,
        user!.org_id,
        module,
        resource,
        action
      ),
    enabled: !!user,
  });
}

export function useUserPermissions() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['user-permissions', user?.id, user?.org_id],
    queryFn: () =>
      rolesService.getUserPermissions(user!.id, user!.org_id),
    enabled: !!user,
  });
}
```

### 4. Roles & Permissions Store (src/store/roles.store.ts)

```typescript
import { create } from 'zustand';
import { rolesService } from '@/services/roles.service';

interface RolesState {
  userRoles: string[];
  userPermissions: string[];
  
  hasRole: (role: string) => boolean;
  hasPermission: (module: string, resource: string, action: string) => boolean;
  canPerform: (action: string) => boolean;
  
  loadUserRoles: (userId: string, orgId: string) => Promise<void>;
  loadUserPermissions: (userId: string, orgId: string) => Promise<void>;
}

export const useRolesStore = create<RolesState>((set, get) => ({
  userRoles: [],
  userPermissions: [],
  
  hasRole: (role: string) => {
    // Check if user has role (can be extended with role slugs)
    return get().userRoles.some(r => r === role);
  },
  
  hasPermission: (module: string, resource: string, action: string) => {
    const permissionString = `${module}:${resource}:${action}`;
    return get().userPermissions.includes(permissionString);
  },
  
  canPerform: (action: string) => {
    return get().userPermissions.some(p => p.endsWith(`:${action}`));
  },
  
  loadUserRoles: async (userId: string, orgId: string) => {
    const roles = await rolesService.getUserRoles(userId, orgId);
    set({ userRoles: roles.map(r => r.role_id) });
  },
  
  loadUserPermissions: async (userId: string, orgId: string) => {
    const permissions = await rolesService.getUserPermissions(userId, orgId);
    set({ userPermissions: permissions });
  },
}));
```

### 5. Permission Guard Component (src/components/common/PermissionGuard.tsx)

```typescript
import React from 'react';
import { useHasPermission } from '@/hooks/useUserRoles';

interface PermissionGuardProps {
  module: string;
  resource: string;
  action: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module,
  resource,
  action,
  fallback = null,
  children,
}) => {
  const { data: hasPermission, isLoading } = useHasPermission(module, resource, action);
  
  if (isLoading) return null;
  if (!hasPermission) return <>{fallback}</>;
  
  return <>{children}</>;
};

// Usage
export function CourseForm() {
  return (
    <PermissionGuard
      module="academics"
      resource="courses"
      action="create"
      fallback={<p>You don't have permission to create courses</p>}
    >
      {/* Course form content */}
    </PermissionGuard>
  );
}
```

---

## Database Function for Permission Checking

```sql
-- RLS Policy with permission checking
CREATE OR REPLACE FUNCTION get_user_permissions(
  p_user_id UUID,
  p_org_id UUID
) RETURNS TABLE (permission_string TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT CONCAT(p.module, ':', p.resource, ':', p.action)
  FROM role_permissions rp
  JOIN user_roles ur ON rp.role_id = ur.role_id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = p_user_id
    AND ur.org_id = p_org_id
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample RLS policy using this function
CREATE POLICY "courses_with_permission" ON courses
  FOR SELECT
  USING (
    org_id = (SELECT org_id FROM users WHERE id = auth.uid())
    AND 'academics:courses:read' = ANY(
      SELECT * FROM get_user_permissions(auth.uid(), org_id)
    )
  );
```

---

## Migration Path for Custom Roles

### Step 1: Create Custom Role
```typescript
const newRole = await rolesService.createCustomRole(orgId, {
  name: 'Finance Manager',
  slug: 'finance_manager',
  description: 'Manage financial operations',
});
```

### Step 2: Assign Permissions
```typescript
// Get all payment-related permissions
const paymentPermissions = await supabase
  .from('permissions')
  .select('*')
  .eq('resource', 'payments');

// Assign to role
for (const perm of paymentPermissions) {
  await rolesService.assignPermissionToRole(
    newRole.id,
    perm.id,
    'organization'
  );
}
```

### Step 3: Assign to User
```typescript
await rolesService.assignRoleToUser(userId, newRole.id, orgId);
```

---

## Next Steps

1. ✅ Create roles and permissions tables
2. ✅ Insert system roles and permissions
3. ✅ Implement roles service
4. ✅ Create permission guard components
5. ✅ Set up RLS policies
6. ✅ Proceed to `09_ORGANIZATION_SETUP.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Roles & Permissions System Complete  
**Next Phase:** 09_ORGANIZATION_SETUP.md
