# Salary Structures

## Overview
The Salary Structures module defines and manages employee salary structures, including salary components, earnings, deductions, and calculation rules. This system enables flexible salary configurations suitable for different roles and organizations.

## Module Objectives
- Create flexible salary structures
- Define salary components and rules
- Support earnings and deductions
- Enable salary customization per employee
- Calculate net and gross salaries
- Track salary modifications

## Key Features

### 1. Salary Structure Creation
- **Structure Definition**
  - Structure name and code
  - Applicable to roles/departments/employees
  - Effective dates
  - Structure versioning

- **Component-Based System**
  - Earnings (Basic, HRA, DA, etc.)
  - Deductions (PF, Income Tax, etc.)
  - Allowances (Special, Conveyance, etc.)
  - Reimbursements

### 2. Salary Components
- **Earnings Components**
  - BASIC: Base salary
  - HRA: House Rent Allowance
  - DA: Dearness Allowance
  - SPECIAL: Special allowance
  - CONVEYANCE: Travel allowance
  - MEDICAL: Medical allowance
  - Custom components

- **Deduction Components**
  - PF: Provident Fund
  - INCOME_TAX: Income Tax
  - PROFESSIONAL_TAX: Professional Tax
  - ESI: Employee State Insurance
  - LOAN_DEDUCTION: Loan EMI
  - OTHER_DEDUCTION: Other deductions
  - Custom deductions

### 3. Salary Calculation Rules
- **Fixed Components**
  - Fixed amount value
  - Fixed percentage of CTC
  - Defined in payroll period

- **Formula-Based Components**
  - Calculated based on other components
  - Percentage of basic salary
  - Dynamic calculations
  - Conditional rules

- **Tax Calculations**
  - Income tax slabs
  - Professional tax rules
  - Tax deduction at source (TDS)
  - Tax exemption limits

### 4. Salary Modification
- **Individual Modifications**
  - Override component values
  - Temporary adjustments
  - Performance-based variations
  - Increment management

- **Bulk Modifications**
  - Salary increments
  - Component adjustments
  - Cost of living adjustments
  - Bonus allocations

### 5. Salary Approval & Lock
- **Approval Workflow**
  - Salary finalization
  - Multi-level approval
  - Lock period
  - Amendment tracking

## Database Schema

### Tables

#### `salary_structures`
```sql
CREATE TABLE salary_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  description TEXT,
  
  -- Scope
  structure_type VARCHAR(50), -- ROLE_BASED, DEPARTMENT_BASED, EMPLOYEE_SPECIFIC, CUSTOM
  
  -- Applicability
  role_id UUID REFERENCES roles(id),
  department_id UUID REFERENCES departments(id),
  employee_id UUID REFERENCES employees(id),
  
  -- Date tracking
  effective_from DATE NOT NULL,
  effective_to DATE,
  
  -- Versioning
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  
  UNIQUE(organization_id, code, effective_from)
);
```

#### `salary_components`
```sql
CREATE TABLE salary_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  description TEXT,
  
  -- Component classification
  component_type VARCHAR(50) NOT NULL, -- EARNING, DEDUCTION, ALLOWANCE, REIMBURSEMENT
  category VARCHAR(50), -- BASIC, HRA, DA, PF, INCOME_TAX, etc.
  
  -- Calculation settings
  is_fixed BOOLEAN DEFAULT FALSE,
  default_amount DECIMAL(12,2) DEFAULT 0,
  default_percentage DECIMAL(5,2) DEFAULT 0, -- Percentage of CTC or another component
  
  -- Dependencies
  dependent_on_component_id UUID REFERENCES salary_components(id),
  calculation_formula TEXT, -- Custom formula if needed
  
  -- Tax implications
  affects_tax_calculation BOOLEAN DEFAULT FALSE,
  is_taxable BOOLEAN DEFAULT TRUE,
  
  -- Statutory
  is_statutory BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT TRUE,
  
  -- Employee option
  is_employee_optional BOOLEAN DEFAULT FALSE,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(organization_id, code)
);
```

#### `salary_structure_components`
```sql
CREATE TABLE salary_structure_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salary_structure_id UUID NOT NULL REFERENCES salary_structures(id) ON DELETE CASCADE,
  component_id UUID NOT NULL REFERENCES salary_components(id),
  
  -- Amount settings
  amount_type VARCHAR(50), -- FIXED_AMOUNT, PERCENTAGE, FORMULA
  amount DECIMAL(12,2) DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  formula TEXT,
  
  -- Sequence for calculation
  calculation_order INT,
  
  -- Rounding
  rounding_method VARCHAR(50), -- ROUND, CEIL, FLOOR
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(salary_structure_id, component_id)
);
```

#### `salary_component_slabs`
```sql
CREATE TABLE salary_component_slabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES salary_components(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Slab details
  slab_name VARCHAR(100) NOT NULL,
  
  -- Range
  from_amount DECIMAL(12,2),
  to_amount DECIMAL(12,2),
  
  -- Calculation
  fixed_amount DECIMAL(12,2),
  percentage DECIMAL(5,2),
  
  effective_from DATE NOT NULL,
  effective_to DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(component_id, from_amount, to_amount, effective_from)
);
```

#### `employee_salary_structures`
```sql
CREATE TABLE employee_salary_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  salary_structure_id UUID REFERENCES salary_structures(id),
  
  -- Effective period
  effective_from DATE NOT NULL,
  effective_to DATE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, APPROVED, ACTIVE, ARCHIVED
  approved_by UUID REFERENCES employees(id),
  approval_date TIMESTAMP,
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(employee_id, effective_from)
);
```

#### `salary_component_overrides`
```sql
CREATE TABLE salary_component_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  component_id UUID NOT NULL REFERENCES salary_components(id),
  
  -- Override details
  override_type VARCHAR(50) NOT NULL, -- FIXED_AMOUNT, PERCENTAGE, INCREASE, DECREASE
  override_amount DECIMAL(12,2),
  override_percentage DECIMAL(5,2),
  
  -- Effective period
  effective_from DATE NOT NULL,
  effective_to DATE,
  
  reason TEXT,
  approved_by UUID REFERENCES employees(id),
  approval_date TIMESTAMP,
  
  is_permanent BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `salary_calculation_rules`
```sql
CREATE TABLE salary_calculation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  rule_name VARCHAR(100) NOT NULL,
  description TEXT,
  
  rule_type VARCHAR(50), -- TAX_RULE, DEDUCTION_RULE, EARNING_RULE, etc.
  
  condition_logic TEXT, -- JSON for conditional logic
  calculation_formula TEXT,
  
  is_active BOOLEAN DEFAULT TRUE,
  priority INT DEFAULT 100,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(organization_id, rule_name)
);
```

#### `tax_slabs`
```sql
CREATE TABLE tax_slabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  financial_year VARCHAR(10) NOT NULL, -- e.g., 2024-25
  
  from_amount DECIMAL(12,2) NOT NULL,
  to_amount DECIMAL(12,2),
  
  tax_percentage DECIMAL(5,2) NOT NULL,
  tax_amount DECIMAL(12,2),
  
  effective_from DATE NOT NULL,
  effective_to DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(organization_id, financial_year, from_amount)
);
```

### Views and Queries

#### Salary Structure with Components
```sql
SELECT 
  ss.id as structure_id,
  ss.name as structure_name,
  sc.code as component_code,
  sc.name as component_name,
  sc.component_type,
  ssc.amount_type,
  ssc.amount,
  ssc.percentage,
  ssc.calculation_order
FROM salary_structures ss
JOIN salary_structure_components ssc ON ss.id = ssc.salary_structure_id
JOIN salary_components sc ON ssc.component_id = sc.id
WHERE ss.organization_id = $1
  AND ss.is_active = TRUE
ORDER BY ssc.calculation_order;
```

#### Employee Current Salary Structure
```sql
SELECT 
  ess.id,
  ess.employee_id,
  ss.id as structure_id,
  ss.name as structure_name,
  ess.effective_from,
  ess.effective_to,
  ess.status,
  ess.is_active
FROM employee_salary_structures ess
LEFT JOIN salary_structures ss ON ess.salary_structure_id = ss.id
WHERE ess.employee_id = $1
  AND ess.is_active = TRUE
  AND CURRENT_DATE BETWEEN ess.effective_from 
    AND COALESCE(ess.effective_to, CURRENT_DATE + INTERVAL '1 day');
```

## Components

### SalaryStructureForm
Location: `src/features/salary/components/SalaryStructureForm.tsx`

**Purpose:** Create and edit salary structures

**Props:**
```typescript
interface SalaryStructureFormProps {
  structure?: SalaryStructure;
  organizationId: string;
  onSuccess: (structure: SalaryStructure) => void;
}
```

**Features:**
- Multi-section form
- Add/remove components dynamically
- Calculation order management
- Preview salary calculation
- Effective date selection

### ComponentManager
Location: `src/features/salary/components/ComponentManager.tsx`

**Purpose:** Manage salary components

**Props:**
```typescript
interface ComponentManagerProps {
  organizationId: string;
  onComponentSelect: (component: SalaryComponent) => void;
}
```

**Features:**
- List of salary components
- Filter by type/category
- Create new components
- Edit component details
- Set calculation rules

### CalculationPreview
Location: `src/features/salary/components/CalculationPreview.tsx`

**Purpose:** Preview salary calculation for a structure

**Props:**
```typescript
interface CalculationPreviewProps {
  salaryStructureId: string;
  baseSalary: number;
  month: Date;
}
```

**Features:**
- Component-wise calculation display
- Earnings total
- Deductions total
- Net salary
- Summary breakdown
- Export functionality

### SalaryComponentOverride
Location: `src/features/salary/components/SalaryComponentOverride.tsx`

**Purpose:** Override salary components for specific employees

**Props:**
```typescript
interface SalaryComponentOverrideProps {
  employeeId: string;
  organizationId: string;
  onSuccess: () => void;
}
```

**Features:**
- Select component to override
- Set override amount/percentage
- Effective date range
- Reason documentation
- Approval workflow

### SalaryStructureAssignment
Location: `src/features/salary/components/SalaryStructureAssignment.tsx`

**Purpose:** Assign salary structures to employees

**Props:**
```typescript
interface SalaryStructureAssignmentProps {
  employeeId: string;
  organizationId: string;
  onSuccess: () => void;
}
```

**Features:**
- Browse available structures
- Select applicable structure
- Set effective date
- View structure details
- Change approval workflow

## Services

### `salaryStructure.service.ts`
Location: `src/features/salary/services/salaryStructure.service.ts`

```typescript
// Structure Management
async createSalaryStructure(data: CreateStructureInput): Promise<SalaryStructure>
async updateSalaryStructure(structureId: string, data: UpdateStructureInput): Promise<SalaryStructure>
async getSalaryStructure(structureId: string): Promise<SalaryStructure>
async listSalaryStructures(organizationId: string, filters?: StructureFilters): Promise<SalaryStructure[]>
async archiveSalaryStructure(structureId: string): Promise<void>

// Component Management
async createSalaryComponent(data: CreateComponentInput): Promise<SalaryComponent>
async updateSalaryComponent(componentId: string, data: UpdateComponentInput): Promise<SalaryComponent>
async listSalaryComponents(organizationId: string, type?: ComponentType): Promise<SalaryComponent[]>
async addComponentToStructure(structureId: string, componentId: string, data: ComponentConfigInput): Promise<void>
async removeComponentFromStructure(structureId: string, componentId: string): Promise<void>

// Employee Assignment
async assignSalaryStructure(employeeId: string, structureId: string, effectiveFrom: Date): Promise<void>
async getEmployeeCurrentStructure(employeeId: string): Promise<EmployeeSalaryStructure>
async getEmployeeStructureHistory(employeeId: string): Promise<EmployeeSalaryStructure[]>

// Overrides
async createComponentOverride(data: OverrideInput): Promise<SalaryComponentOverride>
async getComponentOverrides(employeeId: string, date: Date): Promise<SalaryComponentOverride[]>
async removeComponentOverride(overrideId: string): Promise<void>

// Calculation
async calculateSalary(employeeId: string, month: Date, overrides?: Record<string, number>): Promise<SalaryCalculation>
async calculateTaxableIncome(employeeId: string, month: Date): Promise<number>
async applyTaxSlabs(income: number, financialYear: string): Promise<TaxCalculation>

// Rules
async createCalculationRule(data: CalculationRuleInput): Promise<SalaryCalculationRule>
async evaluateRules(employeeId: string, structureId: string, salary: SalaryCalculation): Promise<void>

// Bulk Operations
async bulkAssignStructure(employeeIds: string[], structureId: string, effectiveFrom: Date): Promise<void>
async bulkApplyIncrement(employeeIds: string[], incrementPercentage: number, effectiveFrom: Date): Promise<void>
async bulkOverride(overrides: BulkOverrideInput[]): Promise<void>
```

### `salary.queries.ts`
Location: `src/features/salary/services/salary.queries.ts`

```typescript
// React Query hooks
export const useSalaryStructure = (structureId: string)
export const useSalaryStructures = (organizationId: string, filters?: StructureFilters)
export const useEmployeeCurrentStructure = (employeeId: string)
export const useSalaryComponents = (organizationId: string, type?: ComponentType)
export const useSalaryCalculation = (employeeId: string, month: Date)
export const useComponentOverrides = (employeeId: string)

// Mutations
export const useCreateSalaryStructure = ()
export const useUpdateSalaryStructure = ()
export const useAssignSalaryStructure = ()
export const useCreateComponentOverride = ()
export const useBulkAssignStructure = ()
```

## API Endpoints

### REST API (via Supabase AutoAPI)

```
GET    /rest/v1/salary_structures?organization_id=eq.{id}
POST   /rest/v1/salary_structures
PATCH  /rest/v1/salary_structures/{id}

GET    /rest/v1/salary_components?organization_id=eq.{id}
POST   /rest/v1/salary_components
PATCH  /rest/v1/salary_components/{id}

GET    /rest/v1/salary_structure_components?salary_structure_id=eq.{id}
POST   /rest/v1/salary_structure_components
DELETE /rest/v1/salary_structure_components/{id}

GET    /rest/v1/employee_salary_structures?employee_id=eq.{id}
POST   /rest/v1/employee_salary_structures
PATCH  /rest/v1/employee_salary_structures/{id}

GET    /rest/v1/salary_component_overrides?employee_id=eq.{id}
POST   /rest/v1/salary_component_overrides
DELETE /rest/v1/salary_component_overrides/{id}

GET    /rest/v1/salary_calculation_rules?organization_id=eq.{id}
POST   /rest/v1/salary_calculation_rules
PATCH  /rest/v1/salary_calculation_rules/{id}
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Employees can view their own salary structure (if allowed)
CREATE POLICY salary_structures_view ON salary_structures
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organization_access WHERE user_id = auth.uid()
    )
  );

-- Only HR and finance can manage structures
CREATE POLICY salary_structures_manage ON salary_structures
  FOR INSERT, UPDATE, DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('FINANCE_MANAGER', 'HR_MANAGER', 'ADMIN')
        AND ur.organization_id = organization_id
    )
  );
```

## Implementation Workflow

### Phase 1: Core Setup
1. Create database tables
2. Set up default components
3. Initialize tax slabs

### Phase 2: Structure Creation
1. Build SalaryStructureForm
2. Build ComponentManager
3. Implement structure creation logic

### Phase 3: Employee Assignment
1. Build SalaryStructureAssignment
2. Implement assignment logic
3. Add to employee profile

### Phase 4: Salary Calculation
1. Build CalculationPreview
2. Implement calculation engine
3. Integrate with payroll

### Phase 5: Advanced Features
1. Implement overrides
2. Build bulk operations
3. Add approval workflows

## Testing Strategy

### Unit Tests
- Salary calculation accuracy
- Tax calculation logic
- Component deduction rules
- Formula evaluation

### Component Tests
- SalaryStructureForm validation
- CalculationPreview rendering
- Component override UI

### Integration Tests
- Structure assignment workflow
- Salary calculation accuracy
- Bulk operations

## Performance Optimization

- Cache salary structure components
- Pre-calculate formula dependencies
- Batch salary calculations
- Index on effective dates

## Future Enhancements

- Contract labor management
- Performance-based salary adjustments
- Allowance combinations
- Benefit encashment
- Salary slip customization
- Integration with tax filing systems
