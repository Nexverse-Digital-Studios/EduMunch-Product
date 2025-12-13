# Employee Management

## Overview
The Employee Management module provides a comprehensive system for managing all employees in the organization. This includes employee information, codes, role assignments, and departmental organization.

## Module Objectives
- Create and maintain employee directory
- Store comprehensive employee information
- Manage employee codes (APCH, ASB, etc.)
- Assign roles and responsibilities
- Track employee status and activity
- Support multi-branch employee management

## Key Features

### 1. Employee Directory
- Complete employee listing with search and filters
- Employee information cards
- Quick access to employee details
- Status indicators (Active, Inactive, On Leave)
- Department and branch wise grouping

### 2. Employee Information Management
- **Basic Information**
  - Full name
  - Email address
  - Phone number
  - Date of birth
  - Gender
  - Address details (Permanent and Current)

- **Professional Information**
  - Designation/Role
  - Department
  - Branch assignment
  - Date of joining
  - Employee code(s)
  - Reporting manager
  - Skills and qualifications

### 3. Employee Codes System
- Multiple code types support:
  - **APCH** - Assistant Principal Chemistry
  - **ASB** - Assistant Subject (with subject code)
  - **PRI** - Principal
  - **HOD** - Head of Department
  - Custom code formats
- Code generation and assignment
- Code-wise employee listing

### 4. Role Assignment
- Assign predefined roles (Teacher, Admin, HR, etc.)
- Custom role creation per organization
- Multiple roles per employee
- Role validation and conflict checking
- Permission inheritance from roles

### 5. Employee Status Management
- Status types: ACTIVE, INACTIVE, ON_LEAVE, TERMINATED, RETIRED
- Status change history
- Termination details and date
- Exit interview information
- Document archival on termination

## Database Schema

### Tables

#### `employees`
```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  
  -- Basic Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(20),
  
  -- Address Information
  permanent_address TEXT,
  current_address TEXT,
  permanent_city VARCHAR(100),
  permanent_state VARCHAR(100),
  permanent_pincode VARCHAR(10),
  current_city VARCHAR(100),
  current_state VARCHAR(100),
  current_pincode VARCHAR(10),
  
  -- Professional Information
  designation_id UUID REFERENCES designations(id),
  department_id UUID REFERENCES departments(id),
  reporting_manager_id UUID REFERENCES employees(id),
  date_of_joining DATE NOT NULL,
  employment_type VARCHAR(50), -- FULL_TIME, PART_TIME, CONTRACT
  
  -- Status
  status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, ON_LEAVE, TERMINATED, RETIRED
  termination_date DATE,
  termination_reason TEXT,
  
  -- Additional Info
  profile_photo_url TEXT,
  employee_code VARCHAR(50),
  aadhar_number VARCHAR(12),
  pan_number VARCHAR(10),
  bank_account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID NOT NULL REFERENCES auth.users(id),
  
  UNIQUE(organization_id, employee_code)
);
```

#### `employee_codes`
```sql
CREATE TABLE employee_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  code_type VARCHAR(50) NOT NULL, -- APCH, ASB, PRI, HOD, etc.
  code_value VARCHAR(100) NOT NULL,
  code_format VARCHAR(50), -- Custom format if applicable
  is_primary BOOLEAN DEFAULT FALSE,
  
  assigned_date DATE DEFAULT CURRENT_DATE,
  removed_date DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(organization_id, code_type, code_value)
);
```

#### `designations`
```sql
CREATE TABLE designations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  name VARCHAR(100) NOT NULL,
  description TEXT,
  level INT, -- For hierarchy
  department_id UUID REFERENCES departments(id),
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(organization_id, name)
);
```

#### `departments`
```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  branch_id UUID REFERENCES branches(id),
  
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20),
  description TEXT,
  head_id UUID REFERENCES employees(id),
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(organization_id, name)
);
```

#### `employee_info` (JSONB for extensibility)
```sql
CREATE TABLE employee_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID UNIQUE NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  
  -- Store custom fields and additional info as JSONB
  qualifications JSONB, -- Array of {degree, institution, year, ...}
  skills JSONB, -- Array of skills
  languages JSONB, -- Array of languages
  emergency_contacts JSONB, -- Array of emergency contacts
  documents JSONB, -- Array of document references
  custom_fields JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Views and Queries

#### Employee List with Details
```sql
SELECT 
  e.id,
  e.first_name || ' ' || e.last_name as full_name,
  e.email,
  e.phone,
  d.name as designation,
  dept.name as department,
  b.name as branch,
  e.status,
  e.date_of_joining,
  e.employee_code
FROM employees e
LEFT JOIN designations d ON e.designation_id = d.id
LEFT JOIN departments dept ON e.department_id = dept.id
LEFT JOIN branches b ON e.branch_id = b.id
WHERE e.organization_id = $1
ORDER BY e.first_name, e.last_name;
```

#### Active Employees Count
```sql
SELECT 
  branch_id,
  department_id,
  COUNT(*) as total_employees,
  COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_count
FROM employees
WHERE organization_id = $1
GROUP BY branch_id, department_id;
```

## Components

### EmployeeForm
Location: `src/features/employee/components/EmployeeForm.tsx`

**Purpose:** Create and edit employee records

**Props:**
```typescript
interface EmployeeFormProps {
  employee?: Employee;
  organizationId: string;
  branchId: string;
  onSuccess: (employee: Employee) => void;
  onCancel: () => void;
}
```

**Features:**
- Multi-section form (Basic, Professional, Address, Banking)
- Photo upload
- Code assignment interface
- Validation with error messages
- Auto-save draft feature

### EmployeeList
Location: `src/features/employee/components/EmployeeList.tsx`

**Purpose:** Display all employees with filtering and search

**Props:**
```typescript
interface EmployeeListProps {
  organizationId: string;
  branchId?: string;
  filters?: EmployeeFilters;
  onSelectEmployee: (employee: Employee) => void;
}
```

**Features:**
- Sortable table columns
- Search by name, email, code
- Filter by status, department, designation
- Bulk actions (activate, deactivate, export)
- Pagination

### EmployeeDetail
Location: `src/features/employee/components/EmployeeDetail.tsx`

**Purpose:** View complete employee information

**Props:**
```typescript
interface EmployeeDetailProps {
  employeeId: string;
  onEdit: () => void;
  onDelete: () => void;
}
```

**Features:**
- All employee information display
- Document viewing
- Related information (manager, team members)
- Action buttons for editing/deactivation
- Activity timeline

### EmployeeCard
Location: `src/features/employee/components/EmployeeCard.tsx`

**Purpose:** Quick view card for employee summary

**Props:**
```typescript
interface EmployeeCardProps {
  employee: Employee;
  onClick: () => void;
  showActions?: boolean;
}
```

**Features:**
- Profile photo
- Quick info (Name, Designation, Department)
- Status badge
- Click to expand

### DepartmentManager
Location: `src/features/employee/components/DepartmentManager.tsx`

**Purpose:** Manage departments and their hierarchy

**Features:**
- Create/edit departments
- Assign department heads
- View department staff
- Transfer employees between departments

### DesignationManager
Location: `src/features/employee/components/DesignationManager.tsx`

**Purpose:** Manage job designations

**Features:**
- Create designation levels
- Link designations to departments
- Manage designation hierarchy

## Services

### `employee.service.ts`
Location: `src/features/employee/services/employee.service.ts`

```typescript
// Core CRUD operations
async createEmployee(data: CreateEmployeeInput): Promise<Employee>
async getEmployeeById(employeeId: string): Promise<Employee>
async updateEmployee(employeeId: string, data: UpdateEmployeeInput): Promise<Employee>
async deleteEmployee(employeeId: string): Promise<void>
async getEmployeesByBranch(branchId: string): Promise<Employee[]>
async getEmployeesByDepartment(departmentId: string): Promise<Employee[]>
async getEmployeesByDesignation(designationId: string): Promise<Employee[]>

// Bulk operations
async bulkImportEmployees(file: File, organizationId: string): Promise<BulkImportResult>
async bulkUpdateStatus(employeeIds: string[], status: EmployeeStatus): Promise<void>
async bulkAssignRole(employeeIds: string[], roleId: string): Promise<void>

// Code management
async assignEmployeeCode(employeeId: string, codeType: string): Promise<EmployeeCode>
async removeEmployeeCode(codeId: string): Promise<void>
async getEmployeesByCode(codeType: string, codeValue: string): Promise<Employee[]>

// Search and filter
async searchEmployees(query: string, organizationId: string): Promise<Employee[]>
async filterEmployees(filters: EmployeeFilters): Promise<Employee[]>

// Reporting
async getEmployeeStats(organizationId: string): Promise<EmployeeStats>
async getUnderReporting(managerId: string): Promise<Employee[]>
```

### `employee.queries.ts`
Location: `src/features/employee/services/employee.queries.ts`

```typescript
// React Query hooks
export const useEmployeeList = (organizationId: string, filters?: EmployeeFilters)
export const useEmployeeById = (employeeId: string)
export const useEmployeesByBranch = (branchId: string)
export const useEmployeesByDepartment = (departmentId: string)
export const useEmployeeSearch = (query: string, organizationId: string)
export const useEmployeeStats = (organizationId: string)

// Mutations
export const useCreateEmployee = ()
export const useUpdateEmployee = ()
export const useDeleteEmployee = ()
export const useBulkImportEmployees = ()
export const useAssignEmployeeCode = ()
```

## API Endpoints

### REST API (via Supabase AutoAPI)

```
GET    /rest/v1/employees?organization_id=eq.{id}
GET    /rest/v1/employees/{id}
POST   /rest/v1/employees
PATCH  /rest/v1/employees/{id}
DELETE /rest/v1/employees/{id}

GET    /rest/v1/employee_codes?employee_id=eq.{id}
POST   /rest/v1/employee_codes
DELETE /rest/v1/employee_codes/{id}

GET    /rest/v1/departments?organization_id=eq.{id}
POST   /rest/v1/departments
PATCH  /rest/v1/departments/{id}

GET    /rest/v1/designations?organization_id=eq.{id}
POST   /rest/v1/designations
PATCH  /rest/v1/designations/{id}
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Employees: Users can view employees in their organization/branch
CREATE POLICY employees_view_policy ON employees
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organization_access WHERE user_id = auth.uid()
    )
  );

-- Employees: Only HR and above can create/edit
CREATE POLICY employees_manage_policy ON employees
  FOR INSERT, UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('HR_MANAGER', 'ADMIN', 'SUPER_ADMIN')
    )
  );

-- Employee Codes: Restrict to HR and above
CREATE POLICY employee_codes_manage ON employee_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = employee_id
        AND e.organization_id IN (
          SELECT organization_id FROM user_organization_access 
          WHERE user_id = auth.uid()
        )
    )
  );
```

## Implementation Workflow

### Phase 1: Core Setup
1. Create database tables and indexes
2. Set up Row Level Security
3. Create basic service functions

### Phase 2: UI Components
1. Build EmployeeForm component
2. Build EmployeeList component
3. Build EmployeeDetail component

### Phase 3: Integration
1. Integrate with authentication system
2. Integrate with roles & permissions
3. Add to navigation sidebar

### Phase 4: Advanced Features
1. Bulk import functionality
2. Code management interface
3. Department/Designation management

### Phase 5: Testing & Refinement
1. Unit tests for services
2. Component testing
3. Integration testing
4. Performance optimization

## Testing Strategy

### Unit Tests
- Employee CRUD operations
- Code assignment logic
- Filter and search functionality
- Bulk operations

### Component Tests
- Form validation
- List rendering and filtering
- Detail view loading

### Integration Tests
- Employee creation with role assignment
- Employee import flow
- Department management workflow

## Deployment Considerations

- Ensure proper indexing on frequently searched fields (email, employee_code)
- Set up automated backups for employee data
- Configure audit logging for sensitive data changes
- Implement encryption for PII (PAN, Aadhar numbers)

## Future Enhancements

- Integration with payroll system for automatic salary calculations
- Performance appraisal system
- Training and development tracking
- Multi-organization employee transfers
- Employee lifecycle milestones
- Advanced analytics and reporting
