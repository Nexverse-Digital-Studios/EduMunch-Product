# Cross-Role Access & Dynamic Permission System

## Table of Contents
1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [Solution Architecture](#solution-architecture)
4. [Database Schema Design](#database-schema-design)
5. [Implementation Steps](#implementation-steps)
6. [API Design](#api-design)
7. [Frontend Integration](#frontend-integration)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Plan](#deployment-plan)

---

## Overview

The **Cross-Role Access System** is a simplified yet powerful Role-Based Access Control (RBAC) system that enables:

- ✅ **Dynamic Role Creation**: Schools can create custom roles beyond system defaults
- ✅ **Granular Permissions**: Fine-grained control at module/action/resource level
- ✅ **Cross-Role Access**: Admin can grant specific permissions from other roles to users
- ✅ **Simple Admin Control**: Only admin can assign/revoke roles and permissions
- ✅ **Frontend Conflict Warnings**: Visual notes for potentially conflicting role combinations
- ✅ **Zero Time Constraints**: Permissions are permanent until manually revoked

---

## Problem Statement

### Current System Limitations

**Existing Schema Issues:**
```sql
-- Problem 1: Hardcoded ENUM
CREATE TYPE user_role_1EMAET AS ENUM (
  'student', 'teacher', 'principal', 'hr_manager', 'finance_manager'
);
-- ❌ Cannot add new roles without schema migration
-- ❌ Not school-specific (all schools must use same roles)
```

**Real-World Challenges:**

1. **School A** wants to add "Vice Principal" role → **NOT POSSIBLE** with hardcoded ENUMs
2. **HR Manager** needs to occasionally process fee payments → **NO MECHANISM** for cross-role access
3. **School wants custom "Sports Coordinator" role** → **REQUIRES SCHEMA MIGRATION**
4. **Different schools need different roles** → **ALL SCHOOLS FORCED TO SAME ROLES**

---

## Solution Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                    USER PERMISSION ENGINE                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────┐           ┌────────────────┐              │
│  │  Primary   │           │   Additional   │              │
│  │    Role    │     +     │  Permissions   │              │
│  │            │           │                │              │
│  │ (HR Mgr)   │           │ (fees.approve) │              │
│  └────────────┘           └────────────────┘              │
│         │                          │                       │
│         └──────────────────────────┘                       │
│                      │                                     │
│              ┌───────▼────────┐                            │
│              │  Effective     │                            │
│              │  Permissions   │                            │
│              │  (Aggregated)  │                            │
│              └───────┬────────┘                            │
│                      │                                     │
│      ┌───────────────┼───────────────┐                    │
│      │               │               │                    │
│ ┌────▼────┐    ┌─────▼─────┐   ┌────▼────┐               │
│ │ API     │    │  Route    │   │  UI     │               │
│ │ Access  │    │Protection │   │Visibility│               │
│ └─────────┘    └───────────┘   └─────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Permission Hierarchy

```
Module (e.g., Fee Management)
  └── Permissions
       ├── fees.view          → Read fee records
       ├── fees.create        → Create fee transactions
       ├── fees.update        → Update fee details
       ├── fees.delete        → Delete fee records
       ├── fees.approve       → Approve payments
       └── fees.export        → Export fee reports
```

### Access Sources

When a user attempts an action, the system checks:

1. **Primary Role Permissions** (From assigned role)
2. **Additional Permissions** (Cross-role access granted by admin)

**Rule**: If ANY source grants permission → **Access Allowed**

---

## Database Schema Design

### Core Tables (6 Tables Per School)

Each school gets **6 tables** for the permission system:

```
roles_1EMAET                              ← Dynamic roles (replaces ENUM)
modules_1EMAET                            ← Feature grouping
permissions_1EMAET                        ← Specific actions
role_permissions_1EMAET                   ← Role → Permission mapping
user_roles_1EMAET                         ← User → Role assignment
user_additional_permissions_1EMAET        ← Cross-role access grants
```

**For 5 schools = 6 tables × 5 = 30 new tables total**

---

### Core Tables

#### 1. **roles_1EMAET** - Dynamic Role Management
```sql
CREATE TABLE roles_1EMAET (
  id UUID PRIMARY KEY,
  role_code VARCHAR(50) UNIQUE NOT NULL,     -- 'hr_manager', 'custom_coordinator'
  role_name VARCHAR(100) NOT NULL,           -- 'HR Manager', 'Sports Coordinator'
  description TEXT,
  is_system_role BOOLEAN DEFAULT false,      -- System roles cannot be deleted
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users_1EMAET(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  index_token VARCHAR(6) DEFAULT '1EMAET'
);
```

**Purpose**: Replace hardcoded ENUMs with flexible role management

**Key Features**:
- `is_system_role = true` prevents deletion of core roles (admin, teacher, student)
- Schools can add unlimited custom roles
- Each school has isolated roles via `index_token`

---

#### 2. **modules_1EMAET** - Feature Grouping
```sql
CREATE TABLE modules_1EMAET (
  id UUID PRIMARY KEY,
  module_code VARCHAR(50) UNIQUE NOT NULL,   -- 'attendance', 'fees', 'hr'
  module_name VARCHAR(100) NOT NULL,         -- 'Attendance Management'
  parent_module_id UUID REFERENCES modules_1EMAET(id), -- For nested modules
  description TEXT,
  route_prefix VARCHAR(100),                 -- '/attendance', '/fees'
  icon VARCHAR(50),                          -- UI icon reference
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Organize features into logical groups

**Hierarchy Example**:
```
HR Module
  ├── Employee Management
  ├── Payroll
  └── Leave Management
```

---

#### 3. **permissions_1EMAET** - Granular Actions
```sql
CREATE TABLE permissions_1EMAET (
  id UUID PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES modules_1EMAET(id),
  permission_code VARCHAR(100) UNIQUE NOT NULL,  -- 'fees.approve'
  permission_name VARCHAR(150) NOT NULL,
  description TEXT,
  resource_type VARCHAR(50),                     -- 'route', 'api', 'ui_component'
  resource_path VARCHAR(255),                    -- '/api/fees/approve'
  http_method VARCHAR(10),                       -- 'GET', 'POST', 'PUT', 'DELETE'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Define specific actions within modules

**Permission Types**:
- **API Permissions**: Control backend access
- **Route Permissions**: Control frontend navigation
- **UI Component Permissions**: Show/hide buttons, sections

---

#### 4. **role_permissions_1EMAET** - Base Role Access
```sql
CREATE TABLE role_permissions_1EMAET (
  id UUID PRIMARY KEY,
  role_id UUID NOT NULL REFERENCES roles_1EMAET(id),
  permission_id UUID NOT NULL REFERENCES permissions_1EMAET(id),
  can_create BOOLEAN DEFAULT false,
  can_read BOOLEAN DEFAULT false,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  can_export BOOLEAN DEFAULT false,
  constraints JSONB,                            -- {"max_amount": 50000}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);
```

**Purpose**: Define what each role can do by default

**CRUD + Extras**:
- Standard: Create, Read, Update, Delete
- Custom: Approve (workflows), Export (reports)

**Constraints Example**:
```json
{
  "max_amount": 50000,
  "departments": ["IT", "HR"],
  "time_restrictions": "09:00-17:00"
}
```

---

#### 5. **user_roles_1EMAET** - User-Role Assignment
```sql
CREATE TABLE user_roles_1EMAET (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_1EMAET(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles_1EMAET(id) ON DELETE RESTRICT,
  is_primary BOOLEAN DEFAULT true,              -- One primary role per user
  assigned_by UUID REFERENCES users_1EMAET(id), -- Admin who assigned
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON user_roles_1EMAET(user_id);
CREATE INDEX idx_user_roles_role ON user_roles_1EMAET(role_id);
CREATE INDEX idx_user_roles_primary ON user_roles_1EMAET(user_id, is_primary) WHERE is_primary = true;

COMMENT ON TABLE user_roles_1EMAET IS 'Assigns roles to users - only admin can modify';
```

**Purpose**: Assign roles to users (permanent until admin changes)

**Key Features**:
- User can have **one primary role** + optional secondary roles
- **Permanent assignment** - no expiration dates
- Only admin can assign/revoke roles
- Audit trail via `assigned_by`

---

#### 6. **user_additional_permissions_1EMAET** - Cross-Role Access ⭐
```sql
CREATE TABLE user_additional_permissions_1EMAET (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_1EMAET(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions_1EMAET(id) ON DELETE CASCADE,
  granted_by UUID NOT NULL REFERENCES users_1EMAET(id), -- Admin who granted
  reason TEXT NOT NULL,                          -- Required justification
  can_create BOOLEAN DEFAULT false,
  can_read BOOLEAN DEFAULT false,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  can_export BOOLEAN DEFAULT false,
  constraints JSONB,                             -- Optional constraints like {"max_amount": 50000}
  is_active BOOLEAN DEFAULT true,                -- For soft revocation
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, permission_id)
);

CREATE INDEX idx_user_additional_permissions_user ON user_additional_permissions_1EMAET(user_id);
CREATE INDEX idx_user_additional_permissions_permission ON user_additional_permissions_1EMAET(permission_id);
CREATE INDEX idx_user_additional_permissions_active ON user_additional_permissions_1EMAET(user_id, is_active) WHERE is_active = true;

COMMENT ON TABLE user_additional_permissions_1EMAET IS 'Cross-role permissions granted by admin - permanent until revoked';
COMMENT ON COLUMN user_additional_permissions_1EMAET.is_active IS 'Admin can soft-delete by setting to false';
```

**Purpose**: Grant individual permissions outside user's primary role

**THIS IS THE KEY TABLE FOR CROSS-ROLE ACCESS**

**Key Features**:
- Admin grants specific permissions from any role to any user
- **Permanent** - no expiration dates
- Admin can revoke by setting `is_active = false`
- Optional constraints (e.g., amount limits)
- Required justification for audit purposes

**Use Cases**:
1. HR Manager needs to approve fees → Admin grants `fees.approve`
2. Teacher needs occasional admin access → Admin grants specific admin permissions
3. Accountant needs read-only HR access → Admin grants `hr.view`

---

## Permission Resolution Flow

### How Permissions Are Calculated

```sql
-- System calls this function:
SELECT * FROM get_user_permissions_1EMAET('user-uuid');

-- Function aggregates from 2 sources:

SOURCE 1: Primary Role Permissions
──────────────────────────────────
SELECT permissions FROM role_permissions_1EMAET
WHERE role_id IN (
  SELECT role_id FROM user_roles_1EMAET 
  WHERE user_id = 'user-uuid'
)

SOURCE 2: Additional Permissions (Cross-Role)
──────────────────────────────────────────────
SELECT permissions FROM user_additional_permissions_1EMAET
WHERE user_id = 'user-uuid' 
  AND is_active = true

RESULT: UNION of both sources (if ANY source grants → ALLOWED)
```

**PostgreSQL Function:**
```sql
CREATE OR REPLACE FUNCTION get_user_permissions_1EMAET(p_user_id UUID)
RETURNS TABLE (
  permission_id UUID,
  permission_code VARCHAR,
  permission_name VARCHAR,
  module_code VARCHAR,
  module_name VARCHAR,
  can_create BOOLEAN,
  can_read BOOLEAN,
  can_update BOOLEAN,
  can_delete BOOLEAN,
  can_approve BOOLEAN,
  can_export BOOLEAN,
  access_source VARCHAR,
  constraints JSONB
) AS $$
BEGIN
  RETURN QUERY
  -- Primary role permissions
  SELECT DISTINCT
    p.id,
    p.permission_code,
    p.permission_name,
    m.module_code,
    m.module_name,
    rp.can_create,
    rp.can_read,
    rp.can_update,
    rp.can_delete,
    rp.can_approve,
    rp.can_export,
    'primary_role'::VARCHAR,
    rp.constraints
  FROM user_roles_1EMAET ur
  JOIN roles_1EMAET r ON ur.role_id = r.id
  JOIN role_permissions_1EMAET rp ON r.id = rp.role_id
  JOIN permissions_1EMAET p ON rp.permission_id = p.id
  JOIN modules_1EMAET m ON p.module_id = m.id
  WHERE ur.user_id = p_user_id
    AND r.is_active = true
    AND p.is_active = true
    AND m.is_active = true

  UNION

  -- Additional permissions
  SELECT DISTINCT
    p.id,
    p.permission_code,
    p.permission_name,
    m.module_code,
    m.module_name,
    uap.can_create,
    uap.can_read,
    uap.can_update,
    uap.can_delete,
    uap.can_approve,
    uap.can_export,
    'additional_permission'::VARCHAR,
    uap.constraints
  FROM user_additional_permissions_1EMAET uap
  JOIN permissions_1EMAET p ON uap.permission_id = p.id
  JOIN modules_1EMAET m ON p.module_id = m.id
  WHERE uap.user_id = p_user_id
    AND uap.is_active = true
    AND p.is_active = true
    AND m.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_permissions_1EMAET IS 'Returns all effective permissions for a user from role and additional permissions';
```

**Final Output Example:**
```json
[
  {
    "permission_code": "fees.view",
    "can_read": true,
    "access_source": "primary_role",
    "module_name": "Fee Management"
  },
  {
    "permission_code": "fees.approve",
    "can_approve": true,
    "access_source": "additional_permission",
    "module_name": "Fee Management"
  }
]
```

---

## Frontend Conflict Warnings

### Conflict Configuration File

Since conflicts are not enforced in database, frontend shows visual warnings:

**File: `config/roleConflicts.config.ts`**
```typescript
export const ROLE_CONFLICT_WARNINGS = {
  critical: [
    {
      role1: 'cashier',
      role2: 'auditor',
      message: '⚠️ CRITICAL: Cashier and Auditor roles together violate Separation of Duties principle. This combination is strongly discouraged for fraud prevention.',
      severity: 'critical'
    },
    {
      role1: 'finance_manager',
      role2: 'auditor',
      message: '⚠️ CRITICAL: Finance Manager and Auditor roles create conflict of interest. Person handling money should not audit themselves.',
      severity: 'critical'
    }
  ],
  warning: [
    {
      role1: 'hr_manager',
      role2: 'finance_manager',
      message: '⚠️ WARNING: HR Manager + Finance Manager gives very broad access. Consider having separate personnel.',
      severity: 'medium'
    },
    {
      role1: 'teacher',
      role2: 'exam_coordinator',
      message: '⚠️ NOTE: Teachers setting exams for their own classes may create bias. Monitor closely.',
      severity: 'low'
    }
  ]
};

// Helper function
export function checkRoleConflicts(currentRoles: string[], newRole: string) {
  const conflicts = [];
  
  for (const role of currentRoles) {
    // Check critical conflicts
    const critical = ROLE_CONFLICT_WARNINGS.critical.find(
      c => (c.role1 === role && c.role2 === newRole) || 
           (c.role2 === role && c.role1 === newRole)
    );
    if (critical) conflicts.push(critical);
    
    // Check warnings
    const warning = ROLE_CONFLICT_WARNINGS.warning.find(
      c => (c.role1 === role && c.role2 === newRole) || 
           (c.role2 === role && c.role1 === newRole)
    );
    if (warning) conflicts.push(warning);
  }
  
  return conflicts;
}
```

### Frontend Conflict Display

**Component: `components/RoleConflictWarning.tsx`**
```typescript
interface RoleConflictWarningProps {
  conflicts: Array<{
    message: string;
    severity: 'critical' | 'medium' | 'low';
  }>;
  onProceed: () => void;
  onCancel: () => void;
}

export function RoleConflictWarning({ conflicts, onProceed, onCancel }: RoleConflictWarningProps) {
  const hasCritical = conflicts.some(c => c.severity === 'critical');
  
  return (
    <div className="conflict-warning-modal">
      <h2>⚠️ Role Conflict Detected</h2>
      
      {conflicts.map((conflict, idx) => (
        <div key={idx} className={`alert alert-${conflict.severity}`}>
          {conflict.message}
        </div>
      ))}
      
      {hasCritical && (
        <p className="text-danger">
          <strong>This is a critical conflict. Proceeding is NOT recommended.</strong>
        </p>
      )}
      
      <div className="actions">
        <button onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button 
          onClick={onProceed} 
          className={hasCritical ? 'btn btn-danger' : 'btn btn-warning'}
        >
          {hasCritical ? 'Proceed Anyway (Not Recommended)' : 'Proceed with Warning'}
        </button>
      </div>
    </div>
  );
}
```

**Usage in Admin Panel:**
```typescript
// pages/admin/users/[id]/assign-role.tsx
function AssignRoleForm() {
  const [selectedRole, setSelectedRole] = useState('');
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  
  const handleRoleSelect = (roleCode: string) => {
    setSelectedRole(roleCode);
    
    // Check conflicts
    const userCurrentRoles = user.roles.map(r => r.role_code);
    const foundConflicts = checkRoleConflicts(userCurrentRoles, roleCode);
    
    if (foundConflicts.length > 0) {
      setConflicts(foundConflicts);
      setShowConflictWarning(true);
    } else {
      // No conflicts, proceed directly
      assignRole(roleCode);
    }
  };
  
  const handleProceedDespiteConflict = async () => {
    // Admin explicitly chose to proceed despite warning
    await assignRole(selectedRole);
    setShowConflictWarning(false);
  };
  
  return (
    <>
      <select onChange={(e) => handleRoleSelect(e.target.value)}>
        <option value="">Select Role</option>
        {availableRoles.map(role => (
          <option key={role.code} value={role.code}>{role.name}</option>
        ))}
      </select>
      
      {showConflictWarning && (
        <RoleConflictWarning
          conflicts={conflicts}
          onProceed={handleProceedDespiteConflict}
          onCancel={() => setShowConflictWarning(false)}
        />
      )}
    </>
  );
}
```

---

## Implementation Steps

### Phase 1: Database Setup (Week 1)

**Step 1.1**: Create SQL script for one school
```sql
-- File: create_role_system_1EMAET.sql
-- Run for School 1 (1EMAET)

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles_1EMAET (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_code VARCHAR(50) UNIQUE NOT NULL,
  role_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users_1EMAET(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  index_token VARCHAR(6) DEFAULT '1EMAET'
);

-- 2. Modules Table
CREATE TABLE IF NOT EXISTS modules_1EMAET (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_code VARCHAR(50) UNIQUE NOT NULL,
  module_name VARCHAR(100) NOT NULL,
  parent_module_id UUID REFERENCES modules_1EMAET(id),
  description TEXT,
  route_prefix VARCHAR(100),
  icon VARCHAR(50),
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Permissions Table
CREATE TABLE IF NOT EXISTS permissions_1EMAET (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules_1EMAET(id) ON DELETE CASCADE,
  permission_code VARCHAR(100) UNIQUE NOT NULL,
  permission_name VARCHAR(150) NOT NULL,
  description TEXT,
  resource_type VARCHAR(50),
  resource_path VARCHAR(255),
  http_method VARCHAR(10),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Role-Permission Mapping
CREATE TABLE IF NOT EXISTS role_permissions_1EMAET (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles_1EMAET(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions_1EMAET(id) ON DELETE CASCADE,
  can_create BOOLEAN DEFAULT false,
  can_read BOOLEAN DEFAULT false,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  can_export BOOLEAN DEFAULT false,
  constraints JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- 5. User-Role Assignment
CREATE TABLE IF NOT EXISTS user_roles_1EMAET (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_1EMAET(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles_1EMAET(id) ON DELETE RESTRICT,
  is_primary BOOLEAN DEFAULT true,
  assigned_by UUID REFERENCES users_1EMAET(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- 6. Additional Permissions (Cross-Role Access)
CREATE TABLE IF NOT EXISTS user_additional_permissions_1EMAET (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_1EMAET(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions_1EMAET(id) ON DELETE CASCADE,
  granted_by UUID NOT NULL REFERENCES users_1EMAET(id),
  reason TEXT NOT NULL,
  can_create BOOLEAN DEFAULT false,
  can_read BOOLEAN DEFAULT false,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  can_export BOOLEAN DEFAULT false,
  constraints JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, permission_id)
);

-- Create all indexes
CREATE INDEX idx_roles_code ON roles_1EMAET(role_code);
CREATE INDEX idx_roles_active ON roles_1EMAET(is_active);

CREATE INDEX idx_modules_code ON modules_1EMAET(module_code);
CREATE INDEX idx_modules_parent ON modules_1EMAET(parent_module_id);

CREATE INDEX idx_permissions_module ON permissions_1EMAET(module_id);
CREATE INDEX idx_permissions_code ON permissions_1EMAET(permission_code);

CREATE INDEX idx_role_permissions_role ON role_permissions_1EMAET(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions_1EMAET(permission_id);

CREATE INDEX idx_user_roles_user ON user_roles_1EMAET(user_id);
CREATE INDEX idx_user_roles_role ON user_roles_1EMAET(role_id);
CREATE INDEX idx_user_roles_primary ON user_roles_1EMAET(user_id, is_primary) WHERE is_primary = true;

CREATE INDEX idx_user_additional_permissions_user ON user_additional_permissions_1EMAET(user_id);
CREATE INDEX idx_user_additional_permissions_permission ON user_additional_permissions_1EMAET(permission_id);
CREATE INDEX idx_user_additional_permissions_active ON user_additional_permissions_1EMAET(user_id, is_active) WHERE is_active = true;
```

**Step 1.2**: Seed system data
```sql
-- File: seed_role_system_1EMAET.sql

-- ============================================================================
-- SEED: System Roles
-- ============================================================================
INSERT INTO roles_1EMAET (role_code, role_name, is_system_role, index_token) VALUES
('super_admin', 'Super Administrator', true, '1EMAET'),
('principal', 'Principal', true, '1EMAET'),
('vice_principal', 'Vice Principal', false, '1EMAET'),
('teacher', 'Teacher', true, '1EMAET'),
('student', 'Student', true, '1EMAET'),
('parent', 'Parent', true, '1EMAET'),
('hr_manager', 'HR Manager', false, '1EMAET'),
('finance_manager', 'Finance Manager', false, '1EMAET'),
('accountant', 'Accountant', false, '1EMAET'),
('librarian', 'Librarian', false, '1EMAET'),
('transport_manager', 'Transport Manager', false, '1EMAET'),
('receptionist', 'Receptionist', false, '1EMAET');

-- ============================================================================
-- SEED: Modules
-- ============================================================================
INSERT INTO modules_1EMAET (module_code, module_name, route_prefix, icon, display_order) VALUES
('dashboard', 'Dashboard', '/dashboard', 'home', 1),
('students', 'Student Management', '/students', 'users', 2),
('teachers', 'Teacher Management', '/teachers', 'user-tie', 3),
('attendance', 'Attendance', '/attendance', 'calendar-check', 4),
('exams', 'Examinations', '/exams', 'file-text', 5),
('fees', 'Fee Management', '/fees', 'dollar-sign', 6),
('hr', 'Human Resources', '/hr', 'briefcase', 7),
('payroll', 'Payroll', '/payroll', 'wallet', 8),
('library', 'Library', '/library', 'book', 9),
('transport', 'Transport', '/transport', 'bus', 10),
('communication', 'Communication', '/communication', 'mail', 11),
('reports', 'Reports & Analytics', '/reports', 'bar-chart', 12),
('settings', 'Settings', '/settings', 'settings', 13);

-- ============================================================================
-- SEED: Permissions (Examples for Fee Module)
-- ============================================================================
INSERT INTO permissions_1EMAET (module_id, permission_code, permission_name, resource_type, resource_path, http_method)
SELECT 
  m.id,
  'fees.view',
  'View Fee Records',
  'api',
  '/api/fees',
  'GET'
FROM modules_1EMAET m WHERE m.module_code = 'fees';

INSERT INTO permissions_1EMAET (module_id, permission_code, permission_name, resource_type, resource_path, http_method)
SELECT 
  m.id,
  'fees.create',
  'Create Fee Transaction',
  'api',
  '/api/fees',
  'POST'
FROM modules_1EMAET m WHERE m.module_code = 'fees';

INSERT INTO permissions_1EMAET (module_id, permission_code, permission_name, resource_type, resource_path, http_method)
SELECT 
  m.id,
  'fees.update',
  'Update Fee Record',
  'api',
  '/api/fees/:id',
  'PUT'
FROM modules_1EMAET m WHERE m.module_code = 'fees';

INSERT INTO permissions_1EMAET (module_id, permission_code, permission_name, resource_type, resource_path, http_method)
SELECT 
  m.id,
  'fees.delete',
  'Delete Fee Record',
  'api',
  '/api/fees/:id',
  'DELETE'
FROM modules_1EMAET m WHERE m.module_code = 'fees';

INSERT INTO permissions_1EMAET (module_id, permission_code, permission_name, resource_type, resource_path, http_method)
SELECT 
  m.id,
  'fees.approve',
  'Approve Fee Payment',
  'api',
  '/api/fees/approve',
  'POST'
FROM modules_1EMAET m WHERE m.module_code = 'fees';

INSERT INTO permissions_1EMAET (module_id, permission_code, permission_name, resource_type, resource_path, http_method)
SELECT 
  m.id,
  'fees.export',
  'Export Fee Reports',
  'api',
  '/api/fees/export',
  'GET'
FROM modules_1EMAET m WHERE m.module_code = 'fees';

-- ============================================================================
-- SEED: Role-Permission Mapping
-- ============================================================================

-- Finance Manager: Full access to fees
INSERT INTO role_permissions_1EMAET (role_id, permission_id, can_create, can_read, can_update, can_delete, can_approve, can_export)
SELECT 
  r.id,
  p.id,
  true, true, true, true, true, true
FROM roles_1EMAET r
CROSS JOIN permissions_1EMAET p
JOIN modules_1EMAET m ON p.module_id = m.id
WHERE r.role_code = 'finance_manager' AND m.module_code = 'fees';

-- Accountant: Create, read, update fees (no delete or approve)
INSERT INTO role_permissions_1EMAET (role_id, permission_id, can_create, can_read, can_update)
SELECT 
  r.id,
  p.id,
  true, true, true
FROM roles_1EMAET r
CROSS JOIN permissions_1EMAET p
JOIN modules_1EMAET m ON p.module_id = m.id
WHERE r.role_code = 'accountant' 
  AND m.module_code = 'fees' 
  AND p.permission_code IN ('fees.view', 'fees.create', 'fees.update');

-- Principal: Read and approve only
INSERT INTO role_permissions_1EMAET (role_id, permission_id, can_read, can_approve)
SELECT 
  r.id,
  p.id,
  true, true
FROM roles_1EMAET r
CROSS JOIN permissions_1EMAET p
JOIN modules_1EMAET m ON p.module_id = m.id
WHERE r.role_code = 'principal' 
  AND m.module_code = 'fees' 
  AND p.permission_code IN ('fees.view', 'fees.approve');
```

**Step 1.3**: Data migration (if migrating from existing system)
```sql
-- Migrate existing users with ENUM roles to new role system
INSERT INTO user_roles_1EMAET (user_id, role_id, is_primary, assigned_by)
SELECT 
  u.id,
  r.id,
  true,
  NULL -- System migration, no specific admin
FROM users_1EMAET u
JOIN roles_1EMAET r ON r.role_code = u.role::TEXT
WHERE u.deleted_at IS NULL;
```

**Step 1.4**: Create permission resolution function
```sql
-- Already included in "Permission Resolution Flow" section above
-- Copy the get_user_permissions_1EMAET function
```

**Step 1.5**: Testing
```sql
-- Test 1: Check if roles were created
SELECT * FROM roles_1EMAET;

-- Test 2: Check if modules were created
SELECT * FROM modules_1EMAET ORDER BY display_order;

-- Test 3: Check if permissions were created
SELECT 
  m.module_name,
  p.permission_code,
  p.permission_name
FROM permissions_1EMAET p
JOIN modules_1EMAET m ON p.module_id = m.id
ORDER BY m.module_code, p.permission_code;

-- Test 4: Get permissions for a user
SELECT * FROM get_user_permissions_1EMAET('user-uuid-here');
```

---

### Phase 2: Backend API Development (Week 2-3)

**Tech Stack**: Node.js + Express + Supabase (or any backend framework)

**Step 2.1**: Create permission middleware
```typescript
// middleware/permission.middleware.ts
import { supabase } from '@/lib/supabase';

export async function checkPermission(
  requiredPermission: string,
  requiredAction: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id; // From auth middleware
    
    // Get user's effective permissions
    const { data: permissions, error } = await supabase.rpc(
      'get_user_permissions_1emaet',
      { p_user_id: userId }
    );
    
    if (error || !permissions) {
      return res.status(500).json({ error: 'Failed to fetch permissions' });
    }
    
    // Check if user has the required permission
    const hasPermission = permissions.some(p => 
      p.permission_code === requiredPermission && 
      p[`can_${requiredAction}`] === true
    );
    
    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: `${requiredPermission} (${requiredAction})`
      });
    }
    
    next();
  };
}
```

**Step 2.2**: Create API endpoints
```typescript
// routes/permissions.routes.ts

// Get user's effective permissions
router.get('/api/users/:userId/permissions', 
  authenticate, // Auth middleware
  async (req, res) => {
    const { userId } = req.params;
    
    // Ensure user can only view their own permissions (unless admin)
    if (req.user.id !== userId && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { data, error } = await supabase.rpc(
      'get_user_permissions_1emaet',
      { p_user_id: userId }
    );
    
    if (error) return res.status(500).json({ error: error.message });
    
    // Group by module for frontend
    const grouped = groupPermissionsByModule(data);
    
    res.json({ permissions: grouped });
  }
);

// Get all modules (filtered by user's access)
router.get('/api/modules',
  authenticate,
  async (req, res) => {
    const userId = req.user.id;
    
    // Get user's permissions
    const { data: permissions } = await supabase.rpc(
      'get_user_permissions_1emaet',
      { p_user_id: userId }
    );
    
    // Get unique module IDs from permissions
    const moduleIds = [...new Set(permissions.map(p => p.module_id))];
    
    // Fetch modules
    const { data: modules } = await supabase
      .from('modules_1EMAET')
      .select('*')
      .in('id', moduleIds)
      .eq('is_active', true)
      .order('display_order');
    
    res.json({ modules });
  }
);

// Admin: Grant additional permission (cross-role access)
router.post('/api/admin/users/:userId/additional-permissions', 
  authenticate,
  checkPermission('user_management.grant_permissions', 'create'),
  async (req, res) => {
    const { userId } = req.params;
    const { permissionId, reason, actions, constraints } = req.body;
    
    // Validate reason
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ 
        error: 'Reason is required and must be at least 10 characters'
      });
    }
    
    // Grant permission
    const { data, error } = await supabase
      .from('user_additional_permissions_1EMAET')
      .insert({
        user_id: userId,
        permission_id: permissionId,
        granted_by: req.user.id,
        reason,
        can_create: actions.includes('create'),
        can_read: actions.includes('read'),
        can_update: actions.includes('update'),
        can_delete: actions.includes('delete'),
        can_approve: actions.includes('approve'),
        can_export: actions.includes('export'),
        constraints: constraints || null
      });
    
    if (error) return res.status(500).json({ error: error.message });
    
    res.json({ success: true, data });
  }
);

// Admin: Revoke additional permission
router.delete('/api/admin/users/:userId/additional-permissions/:permissionId',
  authenticate,
  checkPermission('user_management.revoke_permissions', 'delete'),
  async (req, res) => {
    const { userId, permissionId } = req.params;
    
    // Soft delete by setting is_active = false
    await supabase
      .from('user_additional_permissions_1EMAET')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .match({ user_id: userId, permission_id: permissionId });
    
    res.json({ success: true });
  }
);

// Admin: Assign role to user
router.post('/api/admin/users/:userId/roles',
  authenticate,
  checkPermission('user_management.assign_roles', 'create'),
  async (req, res) => {
    const { userId } = req.params;
    const { roleId, isPrimary } = req.body;
    
    // If setting as primary, unset other primary roles
    if (isPrimary) {
      await supabase
        .from('user_roles_1EMAET')
        .update({ is_primary: false })
        .eq('user_id', userId);
    }
    
    // Assign role
    const { data, error } = await supabase
      .from('user_roles_1EMAET')
      .insert({
        user_id: userId,
        role_id: roleId,
        is_primary: isPrimary,
        assigned_by: req.user.id
      });
    
    if (error) return res.status(500).json({ error: error.message });
    
    res.json({ success: true, data });
  }
);

// Admin: Remove role from user
router.delete('/api/admin/users/:userId/roles/:roleId',
  authenticate,
  checkPermission('user_management.assign_roles', 'delete'),
  async (req, res) => {
    const { userId, roleId } = req.params;
    
    await supabase
      .from('user_roles_1EMAET')
      .delete()
      .match({ user_id: userId, role_id: roleId });
    
    res.json({ success: true });
  }
);

// Admin: Create custom role
router.post('/api/admin/roles',
  authenticate,
  checkPermission('role_management.create', 'create'),
  async (req, res) => {
    const { roleCode, roleName, description } = req.body;
    
    const { data, error } = await supabase
      .from('roles_1EMAET')
      .insert({
        role_code: roleCode,
        role_name: roleName,
        description,
        is_system_role: false, // Custom roles are not system roles
        created_by: req.user.id
      });
    
    if (error) return res.status(500).json({ error: error.message });
    
    res.json({ success: true, data });
  }
);

// Admin: Assign permissions to role
router.post('/api/admin/roles/:roleId/permissions',
  authenticate,
  checkPermission('role_management.assign_permissions', 'create'),
  async (req, res) => {
    const { roleId } = req.params;
    const { permissions } = req.body; // Array of {permissionId, actions}
    
    const inserts = permissions.map(p => ({
      role_id: roleId,
      permission_id: p.permissionId,
      can_create: p.actions.includes('create'),
      can_read: p.actions.includes('read'),
      can_update: p.actions.includes('update'),
      can_delete: p.actions.includes('delete'),
      can_approve: p.actions.includes('approve'),
      can_export: p.actions.includes('export')
    }));
    
    const { data, error } = await supabase
      .from('role_permissions_1EMAET')
      .insert(inserts);
    
    if (error) return res.status(500).json({ error: error.message });
    
    res.json({ success: true, data });
  }
);

// Helper function
function groupPermissionsByModule(permissions: any[]) {
  const modules = new Map();
  
  permissions.forEach(perm => {
    if (!modules.has(perm.module_code)) {
      modules.set(perm.module_code, {
        module_code: perm.module_code,
        module_name: perm.module_name,
        permissions: []
      });
    }
    
    modules.get(perm.module_code).permissions.push({
      code: perm.permission_code,
      name: perm.permission_name,
      actions: getActions(perm),
      source: perm.access_source
    });
  });
  
  return Array.from(modules.values());
}

function getActions(perm: any) {
  const actions = [];
  if (perm.can_create) actions.push('create');
  if (perm.can_read) actions.push('read');
  if (perm.can_update) actions.push('update');
  if (perm.can_delete) actions.push('delete');
  if (perm.can_approve) actions.push('approve');
  if (perm.can_export) actions.push('export');
  return actions;
}
```

**Step 2.3**: Apply middleware to protected routes
```typescript
// Example: Protect fee routes
router.post('/api/fees',
  authenticate,
  checkPermission('fees.create', 'create'),
  createFeeTransaction
);

router.put('/api/fees/:id/approve',
  authenticate,
  checkPermission('fees.approve', 'approve'),
  approveFeePayment
);

router.delete('/api/fees/:id',
  authenticate,
  checkPermission('fees.delete', 'delete'),
  deleteFeeTransaction
);
```

---

### Phase 3: Frontend Development (Week 4-5)

**Tech Stack**: React/Next.js + TypeScript

**Step 3.1**: Permission context provider
```typescript
// context/PermissionContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';

interface Permission {
  code: string;
  module: string;
  actions: string[];
  source: 'primary_role' | 'additional_permission' | 'delegation';
  validUntil?: string;
}

interface PermissionContextType {
  permissions: Permission[];
  hasPermission: (code: string, action: string) => boolean;
  loading: boolean;
}

const PermissionContext = createContext<PermissionContextType>(null!);

export function PermissionProvider({ children }) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadPermissions() {
      const user = await getCurrentUser();
      const response = await fetch(`/api/users/${user.id}/permissions`);
      const data = await response.json();
      setPermissions(data.permissions);
      setLoading(false);
    }
    
    loadPermissions();
  }, []);
  
  const hasPermission = (code: string, action: string) => {
    const perm = permissions.find(p => p.code === code);
    return perm?.actions.includes(action) || false;
  };
  
  return (
    <PermissionContext.Provider value={{ permissions, hasPermission, loading }}>
      {children}
    </PermissionContext.Provider>
  );
}

export const usePermissions = () => useContext(PermissionContext);
```

**Step 3.2**: Protected route component
```typescript
// components/ProtectedRoute.tsx
import { usePermissions } from '@/context/PermissionContext';
import { useRouter } from 'next/router';

export function ProtectedRoute({ 
  permission, 
  action = 'read',
  fallback = <AccessDenied />,
  children 
}) {
  const { hasPermission, loading } = usePermissions();
  const router = useRouter();
  
  if (loading) return <LoadingSpinner />;
  
  if (!hasPermission(permission, action)) {
    return fallback;
  }
  
  return <>{children}</>;
}

// Usage
<ProtectedRoute permission="fees.approve" action="approve">
  <ApproveButton onClick={handleApprove} />
</ProtectedRoute>
```

**Step 3.3**: Permission-based UI components
```typescript
// components/PermissionButton.tsx
export function PermissionButton({ 
  permission, 
  action, 
  onClick, 
  children 
}) {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(permission, action)) {
    return null; // Hide button if no permission
  }
  
  return <button onClick={onClick}>{children}</button>;
}

// Usage in Fee page
<PermissionButton permission="fees.create" action="create" onClick={handleCreate}>
  Create Fee
</PermissionButton>

<PermissionButton permission="fees.approve" action="approve" onClick={handleApprove}>
  Approve Payment
</PermissionButton>
```

**Step 3.4**: Admin UI for granting permissions
```typescript
// pages/admin/users/[id]/permissions.tsx
export default function UserPermissionsPage() {
  const { userId } = useParams();
  const [permissions, setPermissions] = useState([]);
  const [additionalPermissions, setAdditionalPermissions] = useState([]);
  
  async function grantPermission(permissionId: string) {
    const response = await fetch(`/api/users/${userId}/additional-permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        permissionId,
        reason: 'Temporary access for leave coverage',
        validFrom: new Date().toISOString(),
        validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        actions: ['read', 'approve']
      })
    });
    
    if (response.ok) {
      toast.success('Permission granted successfully');
      reloadPermissions();
    }
  }
  
  return (
    <div>
      <h1>User Permissions</h1>
      
      <section>
        <h2>Primary Role Permissions</h2>
        <PermissionList permissions={permissions} />
      </section>
      
      <section>
        <h2>Additional Permissions (Cross-Role Access)</h2>
        <AdditionalPermissionList 
          permissions={additionalPermissions}
          onRevoke={handleRevoke}
        />
        
        <button onClick={() => setShowGrantModal(true)}>
          Grant Additional Permission
        </button>
      </section>
      
      <GrantPermissionModal 
        open={showGrantModal}
        onClose={() => setShowGrantModal(false)}
        onGrant={grantPermission}
      />
    </div>
  );
}
```

---

### Phase 4: Testing & Security (Week 6)

**Step 4.1**: Unit tests
```typescript
// tests/permissions.test.ts
describe('Permission System', () => {
  it('should grant primary role permissions', async () => {
    const user = await createUser({ role: 'hr_manager' });
    const permissions = await getUserPermissions(user.id);
    
    expect(permissions).toContainEqual(
      expect.objectContaining({ code: 'hr.view', can_read: true })
    );
  });
  
  it('should grant additional permissions', async () => {
    const user = await createUser({ role: 'hr_manager' });
    
    await grantAdditionalPermission({
      userId: user.id,
      permissionCode: 'fees.approve',
      actions: ['approve'],
      validFrom: new Date(),
      validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    
    const permissions = await getUserPermissions(user.id);
    expect(permissions).toContainEqual(
      expect.objectContaining({ 
        code: 'fees.approve', 
        can_approve: true,
        source: 'additional_permission'
      })
    );
  });
  
  it('should detect role conflicts', async () => {
    const conflicts = await checkRoleConflicts(userId, 'auditor');
    
    expect(conflicts).toContainEqual(
      expect.objectContaining({
        existingRole: 'finance_manager',
        severity: 'critical'
      })
    );
  });
  
  it('should auto-expire permissions', async () => {
    const user = await createUser({ role: 'hr_manager' });
    
    await grantAdditionalPermission({
      userId: user.id,
      permissionCode: 'fees.approve',
      validFrom: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      validTo: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // Expired yesterday
    });
    
    const permissions = await getUserPermissions(user.id);
    
    expect(permissions).not.toContainEqual(
      expect.objectContaining({ code: 'fees.approve' })
    );
  });
});
```

**Step 4.2**: Security audit checklist
- [ ] SQL injection prevention (use parameterized queries)
- [ ] Permission escalation prevention (validate granter has permission)
- [ ] Time-bound enforcement (scheduled job to disable expired permissions)
- [ ] Audit log integrity (append-only, no updates/deletes)
- [ ] Role conflict validation (block critical conflicts)
- [ ] CSRF protection on permission grant endpoints
- [ ] Rate limiting on permission check endpoints

---

## API Design

### Core Endpoints

#### 1. Get User Permissions
```
GET /api/users/{userId}/permissions
```

**Response:**
```json
{
  "permissions": [
    {
      "module": "Fee Management",
      "moduleCode": "fees",
      "permissions": [
        {
          "code": "fees.view",
          "name": "View Fee Records",
          "actions": ["read"],
          "source": "primary_role"
        },
        {
          "code": "fees.approve",
          "name": "Approve Fee Payment",
          "actions": ["approve"],
          "source": "additional_permission",
          "grantedBy": "principal@school.com",
          "grantedAt": "2025-12-23T10:00:00Z",
          "validUntil": "2025-12-30T23:59:59Z",
          "reason": "Finance Manager on leave"
        }
      ]
    }
  ]
}
```

---

#### 2. Grant Additional Permission
```
POST /api/users/{userId}/additional-permissions
```

**Request:**
```json
{
  "permissionCode": "fees.approve",
  "actions": ["approve", "read"],
  "reason": "Finance Manager on leave",
  "validFrom": "2025-12-23T00:00:00Z",
  "validTo": "2025-12-30T23:59:59Z",
  "constraints": {
    "maxAmount": 50000
  }
}
```

**Response:**
```json
{
  "success": true,
  "permissionId": "uuid-here",
  "conflicts": [
    {
      "type": "warning",
      "severity": "medium",
      "message": "User already has partial access to fees module"
    }
  ]
}
```

---

#### 3. Create Delegation
```
POST /api/delegations
```

**Request:**
```json
{
  "delegateUserId": "assistant-uuid",
  "permissionCode": "reports.generate",
  "actions": ["read", "export"],
  "reason": "Delegate report generation during peak season",
  "validFrom": "2025-12-23T00:00:00Z",
  "validTo": "2025-12-31T23:59:59Z"
}
```

---

#### 4. Check Permission (Real-time)
```
POST /api/permissions/check
```

**Request:**
```json
{
  "userId": "user-uuid",
  "permissionCode": "fees.approve",
  "action": "approve",
  "resourceId": "fee-transaction-uuid"
}
```

**Response:**
```json
{
  "allowed": true,
  "source": "additional_permission",
  "constraints": {
    "maxAmount": 50000
  },
  "validUntil": "2025-12-30T23:59:59Z"
}
```

---

## Frontend Integration

### Route Protection Example (Next.js)
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await getSession(request);
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Check permission based on route
  const requiredPermission = getPermissionForRoute(request.nextUrl.pathname);
  
  if (requiredPermission) {
    const hasAccess = await checkUserPermission(
      session.userId,
      requiredPermission.code,
      requiredPermission.action
    );
    
    if (!hasAccess) {
      return NextResponse.redirect(new URL('/403', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/fees/:path*', '/hr/:path*', '/admin/:path*']
};
```

---

## Security & Conflict Prevention

### 1. Separation of Duties (SoD)

**Critical Conflicts to Prevent:**
```sql
-- Cashier cannot be Auditor
INSERT INTO role_conflict_rules_1EMAET (role1_id, role2_id, conflict_type, severity)
VALUES (
  (SELECT id FROM roles_1EMAET WHERE role_code = 'cashier'),
  (SELECT id FROM roles_1EMAET WHERE role_code = 'auditor'),
  'incompatible',
  'critical'
);

-- Teacher cannot set exam papers for their own class
-- (Handled via constraints in role_permissions)
```

### 2. Time-Bound Enforcement

**Scheduled Job (Run Daily):**
```sql
-- Disable expired additional permissions
UPDATE user_additional_permissions_1EMAET
SET is_active = false
WHERE valid_to < NOW() AND is_active = true;

-- Disable expired delegations
UPDATE permission_delegations_1EMAET
SET is_active = false
WHERE valid_to < NOW() AND is_active = true;
```

### 3. Audit Alerts

**Daily Security Report:**
```sql
-- Find users with suspicious cross-role access
SELECT 
  u.email,
  COUNT(*) as additional_permission_count,
  STRING_AGG(p.permission_code, ', ') as permissions
FROM user_additional_permissions_1EMAET uap
JOIN users_1EMAET u ON uap.user_id = u.id
JOIN permissions_1EMAET p ON uap.permission_id = p.id
WHERE uap.is_active = true
  AND uap.valid_to IS NULL -- Permanent additional permissions
GROUP BY u.email
HAVING COUNT(*) > 5; -- Alert if >5 additional permissions
```

### 4. Approval Workflows

For high-risk permissions (e.g., `fees.approve`), require multi-level approval:

```sql
-- Add approval requirement
CREATE TABLE permission_grant_approvals_1EMAET (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  additional_permission_id UUID REFERENCES user_additional_permissions_1EMAET(id),
  approved_by UUID REFERENCES users_1EMAET(id),
  approval_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  approval_comment TEXT,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Real-World Scenarios

### Scenario 1: Finance Manager on Leave

**Situation**: Finance Manager will be on leave Dec 23-30. HR Manager needs to process urgent payments.

**Solution:**
```sql
-- Principal grants temporary access
INSERT INTO user_additional_permissions_1EMAET (
  user_id,
  permission_id,
  granted_by,
  reason,
  can_approve,
  valid_from,
  valid_to
)
SELECT
  (SELECT id FROM users_1EMAET WHERE email = 'hr@school.com'),
  p.id,
  (SELECT id FROM users_1EMAET WHERE email = 'principal@school.com'),
  'Finance Manager on leave - cover urgent payments',
  true,
  '2025-12-23 00:00:00',
  '2025-12-30 23:59:59'
FROM permissions_1EMAET p
WHERE p.permission_code IN ('fees.approve', 'fees.view');
```

**Result:**
- HR Manager can approve fees from Dec 23-30
- Access auto-expires on Dec 31
- All actions logged with `access_source = 'additional_permission'`
- Audit report shows who granted access and why

---

### Scenario 2: School Creates Custom Role

**Situation**: School 1 wants to create "Sports Coordinator" role with specific permissions.

**Solution:**
```sql
-- Step 1: Create role
INSERT INTO roles_1EMAET (role_code, role_name, description, is_system_role)
VALUES (
  'sports_coordinator',
  'Sports Coordinator',
  'Manages sports activities, events, and equipment',
  false
);

-- Step 2: Assign permissions
INSERT INTO role_permissions_1EMAET (role_id, permission_id, can_create, can_read, can_update)
SELECT
  (SELECT id FROM roles_1EMAET WHERE role_code = 'sports_coordinator'),
  p.id,
  true, true, true
FROM permissions_1EMAET p
JOIN modules_1EMAET m ON p.module_id = m.id
WHERE m.module_code IN ('events', 'inventory', 'students');

-- Step 3: Assign to user
INSERT INTO user_roles_1EMAET (user_id, role_id, is_primary)
VALUES (
  (SELECT id FROM users_1EMAET WHERE email = 'sports@school.com'),
  (SELECT id FROM roles_1EMAET WHERE role_code = 'sports_coordinator'),
  true
);
```

**Result:**
- New role available only in School 1
- Can be assigned to users
- Has defined permissions
- Other schools unaffected

---

### Scenario 3: Delegation Chain

**Situation**: Principal delegates "approve_leave" to Vice Principal, who further delegates report viewing to Admin Assistant.

**Solution:**
```sql
-- Principal → Vice Principal
INSERT INTO permission_delegations_1EMAET (
  delegator_user_id,
  delegate_user_id,
  permission_id,
  delegation_reason,
  can_approve,
  valid_from,
  valid_to
)
VALUES (
  (SELECT id FROM users_1EMAET WHERE email = 'principal@school.com'),
  (SELECT id FROM users_1EMAET WHERE email = 'vice.principal@school.com'),
  (SELECT id FROM permissions_1EMAET WHERE permission_code = 'leave.approve'),
  'Principal on business trip',
  true,
  NOW(),
  NOW() + INTERVAL '7 days'
);

-- Vice Principal → Admin Assistant (separate delegation from their primary role)
INSERT INTO permission_delegations_1EMAET (
  delegator_user_id,
  delegate_user_id,
  permission_id,
  delegation_reason,
  can_read,
  valid_from,
  valid_to
)
VALUES (
  (SELECT id FROM users_1EMAET WHERE email = 'vice.principal@school.com'),
  (SELECT id FROM users_1EMAET WHERE email = 'assistant@school.com'),
  (SELECT id FROM permissions_1EMAET WHERE permission_code = 'leave.view'),
  'Assistant needs read access for report preparation',
  true,
  NOW(),
  NOW() + INTERVAL '7 days'
);
```

---

### Scenario 4: Conflict Detection

**Situation**: Attempt to assign "Auditor" role to user who is already "Finance Manager".

**Solution:**
```sql
-- Before assignment, check conflicts
SELECT * FROM check_role_conflicts_1EMAET(
  (SELECT id FROM users_1EMAET WHERE email = 'finance@school.com'),
  (SELECT id FROM roles_1EMAET WHERE role_code = 'auditor')
);

-- Returns:
-- conflict_type: 'incompatible'
-- existing_role_name: 'Finance Manager'
-- severity: 'critical'
-- description: 'Finance Manager cannot be Auditor - Separation of Duties violation'
```

**Result:**
- Assignment blocked by application
- User notified of conflict
- Admin must remove Finance Manager role first

---

## Testing Strategy

### Test Cases

#### 1. Permission Inheritance
```
✓ User with 'HR Manager' role gets all HR permissions
✓ User with additional permission gets aggregated permissions
✓ Delegated permission appears in effective permissions
```

#### 2. Time-Bound Access
```
✓ Permission not accessible before valid_from
✓ Permission accessible between valid_from and valid_to
✓ Permission not accessible after valid_to
✓ Scheduled job disables expired permissions
```

#### 3. Conflict Detection
```
✓ Critical conflicts block role assignment
✓ Warning conflicts allow assignment with notification
✓ Conflict check considers all active roles
```

#### 4. Audit Trail
```
✓ Every permission usage logged
✓ Access source correctly attributed
✓ Audit log immutable (no updates/deletes)
```

#### 5. Edge Cases
```
✓ User with no roles gets zero permissions
✓ Revoked permission immediately inaccessible
✓ Deleted role cascades to permissions
✓ Inactive permission not granted
```

---

## Deployment Plan

### Rollout Strategy

**Phase 1: School 1 (Pilot) - 2 Weeks**
- Deploy to production for School 1 only
- Monitor performance and issues
- Gather feedback from admin users

**Phase 2: Schools 2-3 - 1 Week**
- Deploy to 2 more schools
- Validate multi-school isolation

**Phase 3: Schools 4-5 - 1 Week**
- Complete rollout to all schools

**Phase 4: Monitoring - Ongoing**
- Daily audit reports
- Weekly permission usage analytics
- Monthly security reviews

---

### Post-Deployment Monitoring

**Metrics to Track:**
1. Permission check latency (should be <50ms)
2. Number of additional permissions granted per day
3. Audit log growth rate
4. Conflict detection frequency
5. Expired permission cleanup efficiency

**Alerts:**
- Critical conflict violations
- Permanent additional permissions (>30 days)
- Excessive permission grants (>10 per user)
- Failed permission checks (potential attacks)

---

## Conclusion

This Cross-Role Access System provides:

✅ **Flexibility**: Schools can create unlimited custom roles  
✅ **Simplicity**: Admin-only permission management (no complex delegation)  
✅ **Granular Control**: Fine-grained CRUD + Approve + Export permissions  
✅ **Scalability**: Supports unlimited roles/permissions per school  
✅ **Frontend Warnings**: Visual conflict alerts (no database enforcement)  
✅ **Permanent Permissions**: No time-bound complexity - granted until revoked  

**Key Simplifications:**
- ❌ No time-bound permissions (no expiration dates)
- ❌ No delegation system (no user-to-user permission transfers)
- ❌ No audit trail table (can be added later if needed)
- ❌ No conflict database table (frontend warnings only)
- ✅ Only admin can assign/revoke roles and permissions

**Migration Path**: Seamless migration from current ENUM-based system with zero downtime.

**Next Steps**: Review this document → Approve architecture → Begin Phase 1 implementation.

---

## System Summary

### Database Tables (6 per school)
```
1. roles_1EMAET                          → Dynamic role management
2. modules_1EMAET                        → Feature grouping  
3. permissions_1EMAET                    → Granular actions
4. role_permissions_1EMAET               → Role → Permission mapping
5. user_roles_1EMAET                     → User → Role assignment
6. user_additional_permissions_1EMAET    → Cross-role access
```

### Permission Flow
```
User requests action
  ↓
get_user_permissions_1EMAET(user_id)
  ↓
Aggregate from:
  - Primary Role Permissions
  - Additional Permissions (cross-role)
  ↓
Return effective permissions
  ↓
Check if action allowed
  ↓
Allow/Deny API call
```

### Admin Workflow
```
1. Admin creates custom roles (optional)
2. Admin assigns permissions to roles
3. Admin assigns roles to users
4. Admin grants additional permissions (cross-role) if needed
5. Admin can revoke additional permissions anytime
```

### Frontend Behavior
```
- Sidebar: Shows only modules user has access to
- Buttons: Auto-hide if no permission
- Routes: Protected via middleware
- Conflicts: Visual warnings before role assignment (no blocking)
```

**This is a production-ready, simplified RBAC system suitable for multi-tenant school management platforms.**
