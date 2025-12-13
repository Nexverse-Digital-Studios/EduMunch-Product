# Leave Management System

## Overview
The Leave Management System provides a comprehensive solution for managing employee leave requests, approvals, balance tracking, and deduction calculations. It supports multiple leave types, approval workflows, and integration with working hours.

## Module Objectives
- Enable employees to apply for leaves
- Implement multi-level approval workflow
- Track leave balances and entitlements
- Calculate leave deductions accurately
- Generate leave reports
- Integrate with attendance system

## Key Features

### 1. Leave Application Creation
- **Leave Request Interface**
  - Select leave type
  - Specify date range (single day or multiple days)
  - Add reason/description
  - Document/attachment upload
  - Emergency leave options

- **Leave Application Types**
  - Simple leave (single day)
  - Multiple days leave
  - Half-day leave (first half, second half)
  - Bulk multi-day leave request
  - Emergency/ad-hoc leave

### 2. Leave Types Management
- **Predefined Leave Types**
  - CASUAL (Casual Leave)
  - SICK (Medical/Sick Leave)
  - EARNED (Annual/Earned Leave)
  - EARNED_CASUAL (Combined earned + casual)
  - MATERNITY
  - PATERNITY
  - OPTIONAL
  - SPECIAL
  - UNPAID
  - LEAVE_WITHOUT_PAY

- **Leave Type Configuration**
  - Annual entitlement
  - Maximum carry-over days
  - Accrual method (monthly, quarterly, annual)
  - Encashment rules
  - Combination rules with other leaves

### 3. Approval Workflow
- **Multi-level Approval**
  - Direct manager approval
  - Department head approval
  - HR approval (if configured)
  - Conditional approvals

- **Approval Rules**
  - Automatic approval for certain criteria
  - Conditional approval based on leave balance
  - Escalation on pending approvals
  - Bulk approval interface

### 4. Leave Balance Tracking
- **Balance Calculation**
  - Opening balance
  - Accruals (monthly/quarterly/annual)
  - Deductions (approved leaves)
  - Carry-over from previous year
  - Manual adjustments

- **Balance View**
  - Current balance by leave type
  - Year-wise breakdown
  - Pending leave impact
  - Projected balance

### 5. Deduction Rules
- **Automatic Deduction**
  - Deduct only on working days
  - Exclude weekends
  - Exclude holidays
  - Half-day deduction

- **Manual Deduction**
  - Manual adjustment of balance
  - Reason documentation
  - Approval requirement

### 6. Leave Calendar
- **Visual Leave Calendar**
  - Leave status by day
  - Color-coded leave types
  - Holiday visualization
  - Leave timeline
  - Batch leave view

## Database Schema

### Tables

#### `leave_types`
```sql
CREATE TABLE leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  description TEXT,
  
  -- Entitlement
  annual_entitlement INT NOT NULL, -- Days per year
  max_carryover_days INT DEFAULT 0,
  accrual_frequency VARCHAR(50) DEFAULT 'MONTHLY', -- MONTHLY, QUARTERLY, ANNUAL
  accrual_amount DECIMAL(5,2),
  
  -- Rules
  is_paid BOOLEAN DEFAULT TRUE,
  requires_document BOOLEAN DEFAULT FALSE,
  document_type VARCHAR(100), -- e.g., 'Medical Certificate'
  can_combine_with JSONB, -- Array of leave_type_ids
  max_consecutive_days INT,
  min_notice_days INT DEFAULT 0,
  
  -- Encashment
  is_encashable BOOLEAN DEFAULT FALSE,
  encashment_per_day DECIMAL(10,2),
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(organization_id, code)
);
```

#### `leave_applications`
```sql
CREATE TABLE leave_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  
  -- Dates
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  half_day_type VARCHAR(20), -- FIRST_HALF, SECOND_HALF (if applicable)
  total_days DECIMAL(5,2) NOT NULL,
  
  -- Request details
  reason TEXT NOT NULL,
  description TEXT,
  attachment_url TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, APPROVED, REJECTED, CANCELLED, WITHDRAWN
  submission_date TIMESTAMP,
  submission_by UUID REFERENCES auth.users(id),
  
  -- Emergency leave
  is_emergency BOOLEAN DEFAULT FALSE,
  emergency_reason TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);
```

#### `leave_approvals`
```sql
CREATE TABLE leave_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_application_id UUID NOT NULL REFERENCES leave_applications(id) ON DELETE CASCADE,
  
  approver_id UUID NOT NULL REFERENCES employees(id),
  approval_level INT DEFAULT 1, -- 1: Direct Manager, 2: HOD, 3: HR, etc.
  
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, ESCALATED
  approval_date TIMESTAMP,
  comments TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(leave_application_id, approver_id)
);
```

#### `leave_balance`
```sql
CREATE TABLE leave_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Balance tracking
  opening_balance DECIMAL(5,2) DEFAULT 0,
  accrued_balance DECIMAL(5,2) DEFAULT 0,
  utilized_balance DECIMAL(5,2) DEFAULT 0,
  pending_balance DECIMAL(5,2) DEFAULT 0, -- Pending approvals
  closing_balance DECIMAL(5,2) DEFAULT 0,
  
  carried_over_from_previous DECIMAL(5,2) DEFAULT 0,
  
  -- Year
  leave_year INT NOT NULL, -- e.g., 2024
  year_start_date DATE,
  year_end_date DATE,
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  
  UNIQUE(employee_id, leave_type_id, leave_year)
);
```

#### `leave_deductions`
```sql
CREATE TABLE leave_deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_application_id UUID NOT NULL REFERENCES leave_applications(id) ON DELETE CASCADE,
  leave_balance_id UUID NOT NULL REFERENCES leave_balance(id),
  
  deduction_date DATE NOT NULL,
  days_deducted DECIMAL(5,2) NOT NULL,
  
  is_working_day BOOLEAN DEFAULT TRUE,
  is_holiday BOOLEAN DEFAULT FALSE,
  deduction_type VARCHAR(50) DEFAULT 'FULL_DAY', -- FULL_DAY, HALF_DAY, ADJUSTED
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(leave_application_id, deduction_date)
);
```

#### `leave_balance_adjustments`
```sql
CREATE TABLE leave_balance_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  adjustment_type VARCHAR(50) NOT NULL, -- ACCRUAL, MANUAL_ADD, MANUAL_DEDUCT, ENCASHMENT, CARRY_OVER
  days_adjusted DECIMAL(5,2) NOT NULL,
  
  reason TEXT NOT NULL,
  reference_document_url TEXT,
  
  approved_by UUID REFERENCES employees(id),
  approval_date TIMESTAMP,
  
  effective_from DATE NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);
```

#### `leave_holidays`
```sql
CREATE TABLE leave_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  branch_id UUID REFERENCES branches(id),
  
  holiday_date DATE NOT NULL,
  holiday_name VARCHAR(100) NOT NULL,
  
  is_optional BOOLEAN DEFAULT FALSE,
  affects_leave_deduction BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(organization_id, holiday_date)
);
```

### Views and Queries

#### Employee Leave Summary
```sql
SELECT 
  e.id,
  e.first_name || ' ' || e.last_name as employee_name,
  lt.code as leave_type,
  lb.opening_balance,
  lb.accrued_balance,
  lb.utilized_balance,
  lb.pending_balance,
  lb.closing_balance,
  lb.leave_year
FROM leave_balance lb
JOIN employees e ON lb.employee_id = e.id
JOIN leave_types lt ON lb.leave_type_id = lt.id
WHERE lb.organization_id = $1
  AND lb.leave_year = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY e.first_name, lt.name;
```

#### Pending Leave Approvals
```sql
SELECT 
  la.id,
  e.first_name || ' ' || e.last_name as employee_name,
  lt.name as leave_type,
  la.from_date,
  la.to_date,
  la.total_days,
  la.status,
  la.submission_date,
  app.approval_level,
  approver.first_name || ' ' || approver.last_name as approver_name
FROM leave_applications la
JOIN employees e ON la.employee_id = e.id
JOIN leave_types lt ON la.leave_type_id = lt.id
LEFT JOIN leave_approvals app ON la.id = app.leave_application_id
LEFT JOIN employees approver ON app.approver_id = approver.id
WHERE la.organization_id = $1
  AND app.status = 'PENDING'
ORDER BY la.submission_date DESC;
```

## Components

### LeaveForm
Location: `src/features/leave/components/LeaveForm.tsx`

**Purpose:** Create and submit leave applications

**Props:**
```typescript
interface LeaveFormProps {
  employeeId: string;
  organizationId: string;
  onSuccess: (application: LeaveApplication) => void;
}
```

**Features:**
- Leave type selection with balance display
- Date range picker with day calculation
- Half-day option
- Reason input with character limit
- Document attachment
- Balance impact preview
- Submit and save draft options

### LeaveList
Location: `src/features/leave/components/LeaveList.tsx`

**Purpose:** Display leave applications with filtering

**Props:**
```typescript
interface LeaveListProps {
  employeeId?: string;
  organizationId: string;
  filters?: LeaveFilters;
  onSelectLeave: (leave: LeaveApplication) => void;
}
```

**Features:**
- Filterable leave list
- Status badges
- Date range display
- Approval status indicator
- Edit and cancel actions
- Bulk operations

### LeaveApproval
Location: `src/features/leave/components/LeaveApproval.tsx`

**Purpose:** Approve or reject leave applications

**Props:**
```typescript
interface LeaveApprovalProps {
  leaveApplicationId: string;
  approverId: string;
  onApproved: () => void;
}
```

**Features:**
- Leave details display
- Employee availability check
- Balance impact preview
- Approval/rejection buttons
- Comments section
- Escalation option

### LeaveBalance
Location: `src/features/leave/components/LeaveBalance.tsx`

**Purpose:** Display leave balance information

**Props:**
```typescript
interface LeaveBalanceProps {
  employeeId: string;
  leaveYear?: number;
}
```

**Features:**
- Balance by leave type
- Visual progress bars
- Pending leave impact
- Year-wise comparison
- Carry-over information
- Encashment details

### LeaveCalendar
Location: `src/features/leave/components/LeaveCalendar.tsx`

**Purpose:** Visual calendar view of leaves and holidays

**Props:**
```typescript
interface LeaveCalendarProps {
  employeeId: string;
  month: Date;
  onDateClick: (date: Date) => void;
}
```

**Features:**
- Color-coded leave days
- Holiday highlights
- Leave type indicators
- Approval status colors
- Leave details on hover
- Month/year navigation

## Services

### `leave.service.ts`
Location: `src/features/leave/services/leave.service.ts`

```typescript
// Leave Application
async createLeaveApplication(data: CreateLeaveApplicationInput): Promise<LeaveApplication>
async submitLeaveApplication(applicationId: string): Promise<LeaveApplication>
async updateLeaveApplication(applicationId: string, data: UpdateLeaveApplicationInput): Promise<LeaveApplication>
async cancelLeaveApplication(applicationId: string, reason: string): Promise<void>
async withdrawLeaveApplication(applicationId: string): Promise<void>

// Leave Approvals
async submitForApproval(applicationId: string): Promise<void>
async approveLeave(approvalId: string, comments?: string): Promise<void>
async rejectLeave(approvalId: string, reason: string): Promise<void>
async escalateApproval(approvalId: string, escalateToId: string): Promise<void>
async getApprovalChain(applicationId: string): Promise<LeaveApproval[]>

// Leave Balance
async getLeaveBalance(employeeId: string, leaveYear: number): Promise<LeaveBalance[]>
async getLeaveBalanceForType(employeeId: string, leaveTypeId: string, leaveYear: number): Promise<LeaveBalance>
async calculatePendingBalance(employeeId: string, leaveTypeId: string): Promise<number>
async updateLeaveBalance(employeeId: string, leaveTypeId: string, adjustment: BalanceAdjustment): Promise<void>

// Leave Deductions
async deductLeave(applicationId: string): Promise<void>
async calculateDeduction(employeeId: string, fromDate: Date, toDate: Date, leaveTypeId: string): Promise<DeductionCalculation>
async getDeductionHistory(employeeId: string, leaveTypeId: string): Promise<LeaveDeduction[]>

// Leave Types
async getLeaveTypes(organizationId: string): Promise<LeaveType[]>
async createLeaveType(data: CreateLeaveTypeInput): Promise<LeaveType>
async updateLeaveType(leaveTypeId: string, data: UpdateLeaveTypeInput): Promise<LeaveType>

// Leave Holidays
async getHolidaysForPeriod(organizationId: string, startDate: Date, endDate: Date): Promise<LeaveHoliday[]>
async addHoliday(data: HolidayInput): Promise<LeaveHoliday>
async removeHoliday(holidayId: string): Promise<void>

// Adjustments
async adjustLeaveBalance(employeeId: string, adjustment: LeaveAdjustmentInput): Promise<LeaveBalanceAdjustment>
async getAdjustmentHistory(employeeId: string, leaveTypeId: string): Promise<LeaveBalanceAdjustment[]>
async approveAdjustment(adjustmentId: string): Promise<void>

// Reports
async getLeaveReport(organizationId: string, filters: LeaveReportFilters): Promise<LeaveReport>
async getEmployeeLeaveHistory(employeeId: string): Promise<LeaveApplicationDetail[]>
```

### `leave.queries.ts`
Location: `src/features/leave/services/leave.queries.ts`

```typescript
// React Query hooks
export const useLeaveApplication = (applicationId: string)
export const useLeaveApplications = (employeeId: string, filters?: LeaveFilters)
export const usePendingApprovals = (approverId: string)
export const useLeaveBalance = (employeeId: string, leaveYear: number)
export const useLeaveTypes = (organizationId: string)
export const useHolidaysForPeriod = (organizationId: string, startDate: Date, endDate: Date)

// Mutations
export const useCreateLeaveApplication = ()
export const useSubmitLeaveApplication = ()
export const useApproveLeave = ()
export const useRejectLeave = ()
export const useAdjustLeaveBalance = ()
export const useCancelLeaveApplication = ()
```

## API Endpoints

### REST API (via Supabase AutoAPI)

```
GET    /rest/v1/leave_applications?employee_id=eq.{id}
POST   /rest/v1/leave_applications
PATCH  /rest/v1/leave_applications/{id}
DELETE /rest/v1/leave_applications/{id}

GET    /rest/v1/leave_approvals?leave_application_id=eq.{id}
PATCH  /rest/v1/leave_approvals/{id}

GET    /rest/v1/leave_balance?employee_id=eq.{id}
GET    /rest/v1/leave_balance?employee_id=eq.{id}&leave_type_id=eq.{id}

GET    /rest/v1/leave_types?organization_id=eq.{id}
POST   /rest/v1/leave_types
PATCH  /rest/v1/leave_types/{id}

GET    /rest/v1/leave_holidays?organization_id=eq.{id}
POST   /rest/v1/leave_holidays
DELETE /rest/v1/leave_holidays/{id}

GET    /rest/v1/leave_balance_adjustments?employee_id=eq.{id}
POST   /rest/v1/leave_balance_adjustments
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Employees can view their own leaves
CREATE POLICY leave_applications_self_view ON leave_applications
  FOR SELECT USING (
    employee_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
  );

-- Managers can view team member leaves
CREATE POLICY leave_applications_team_view ON leave_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = employee_id
        AND e.reporting_manager_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
    )
  );

-- HR can view all leaves in organization
CREATE POLICY leave_applications_hr_view ON leave_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('HR_MANAGER', 'ADMIN')
        AND ur.organization_id = organization_id
    )
  );

-- Only approvers can approve
CREATE POLICY leave_approvals_manage ON leave_approvals
  FOR UPDATE USING (
    approver_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
  );
```

## Implementation Workflow

### Phase 1: Core Setup
1. Create database tables
2. Set up leave types and holidays
3. Initialize leave balances

### Phase 2: Leave Application
1. Build LeaveForm component
2. Implement application service
3. Add to employee portal

### Phase 3: Approval Workflow
1. Build LeaveApproval component
2. Implement approval chain logic
3. Add to manager dashboard

### Phase 4: Balance Management
1. Build LeaveBalance component
2. Implement deduction logic
3. Implement balance adjustments

### Phase 5: Reporting
1. Build LeaveCalendar
2. Generate leave reports
3. Add analytics dashboard

## Testing Strategy

### Unit Tests
- Leave application creation validation
- Deduction calculation logic
- Balance update calculations
- Holiday detection
- Approval workflow logic

### Component Tests
- LeaveForm validation
- LeaveApproval workflow
- LeaveBalance display
- LeaveCalendar rendering

### Integration Tests
- End-to-end leave application workflow
- Approval chain processing
- Balance adjustment on approval
- Deduction calculation accuracy

## Performance Optimization

- Index on `employee_id, from_date` for leave queries
- Cache leave balances by year
- Batch deduction calculations
- Pre-calculate working days for periods

## Future Enhancements

- Leave encashment processing
- Carry-over automation
- Integration with attendance system
- Advanced approval workflows
- Leave forecast analytics
- Integration with payroll for deductions
