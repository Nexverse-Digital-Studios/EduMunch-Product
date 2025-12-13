# Payroll Processing

## Overview
The Payroll Processing module handles the complete payroll lifecycle, from salary calculation to payslip generation, payment processing, and statutory compliance. This system ensures accurate, timely, and compliant salary disbursement.

## Module Objectives
- Calculate accurate payroll
- Generate payslips
- Track statutory deductions and compliance
- Process salary payments
- Manage reimbursements and adjustments
- Generate payroll reports

## Key Features

### 1. Payroll Cycle Management
- **Payroll Periods**
  - Monthly payroll cycles
  - Custom cycle definitions
  - Multiple payroll batches
  - Mid-month/bonus cycles

- **Payroll Status**
  - DRAFT: Initial creation
  - IN_REVIEW: Pending review
  - APPROVED: Ready for processing
  - PROCESSING: Calculations in progress
  - COMPLETED: Payroll finalized
  - PAYMENT_INITIATED: Payment processing started
  - PAYMENT_COMPLETED: Payments disbursed

### 2. Salary Calculation
- **Component Calculation**
  - Earnings calculation
  - Statutory deductions
  - Employee deductions
  - Employer contributions

- **Adjustments**
  - Manual adjustments
  - Bonus additions
  - Arrears settlement
  - Recovery deductions
  - Reimbursement additions

- **Working Day Adjustments**
  - Pro-rata calculation for leaves
  - Attendance-based adjustments
  - Holiday inclusions
  - Short month adjustments

### 3. Statutory Compliance
- **Mandatory Deductions**
  - Provident Fund (PF)
  - Employee State Insurance (ESI)
  - Professional Tax
  - Income Tax

- **Employer Contributions**
  - Employer PF
  - Employer ESI
  - Gratuity provisions
  - Other statutory contributions

- **Compliance Reports**
  - PF returns
  - ESI reports
  - Income tax returns
  - Salary register

### 4. Payslip Generation
- **Payslip Details**
  - Employee information
  - Payroll period
  - Earnings breakdown
  - Deductions breakdown
  - Net salary
  - YTD (Year-To-Date) information
  - Digital signature

- **Format Options**
  - PDF generation
  - Email distribution
  - Portal access
  - Print-ready format

### 5. Payment Processing
- **Payment Methods**
  - Bank transfer
  - Cheque issuance
  - Cash distribution
  - Digital wallets

- **Payment Tracking**
  - Payment status
  - Bank reconciliation
  - Bounce handling
  - Reversal management

### 6. Payroll Reporting
- **Internal Reports**
  - Payroll summary
  - Department-wise analysis
  - Salary register
  - Attendance impact report

- **Statutory Reports**
  - Income tax report
  - PF contribution report
  - ESI report
  - Deferred revenue report

## Database Schema

### Tables

#### `payroll_cycles`
```sql
CREATE TABLE payroll_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  cycle_name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Dates
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  salary_payment_date DATE NOT NULL,
  
  -- Type
  cycle_type VARCHAR(50) DEFAULT 'MONTHLY', -- MONTHLY, QUARTERLY, ANNUAL, CUSTOM
  
  -- Status
  status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, APPROVED, PROCESSING, COMPLETED, CLOSED
  
  -- Locking
  is_locked BOOLEAN DEFAULT FALSE,
  locked_by UUID REFERENCES employees(id),
  locked_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);
```

#### `payroll_records`
```sql
CREATE TABLE payroll_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_cycle_id UUID NOT NULL REFERENCES payroll_cycles(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Salary Structure
  salary_structure_id UUID NOT NULL REFERENCES salary_structures(id),
  
  -- Calculation fields
  days_in_month INT,
  days_present INT,
  days_absent INT,
  days_leave INT,
  days_worked INT,
  
  -- Amounts
  gross_salary DECIMAL(12,2) DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  total_deductions DECIMAL(12,2) DEFAULT 0,
  net_salary DECIMAL(12,2) DEFAULT 0,
  
  -- Employer contribution
  employer_contribution DECIMAL(12,2) DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, REVIEW, APPROVED, PROCESSED
  is_locked BOOLEAN DEFAULT FALSE,
  
  -- Approval tracking
  reviewed_by UUID REFERENCES employees(id),
  review_date TIMESTAMP,
  approved_by UUID REFERENCES employees(id),
  approval_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(payroll_cycle_id, employee_id)
);
```

#### `payroll_component_details`
```sql
CREATE TABLE payroll_component_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_record_id UUID NOT NULL REFERENCES payroll_records(id) ON DELETE CASCADE,
  
  component_id UUID NOT NULL REFERENCES salary_components(id),
  component_name VARCHAR(100) NOT NULL,
  
  -- Calculation details
  calculation_base DECIMAL(12,2),
  calculation_percentage DECIMAL(5,2),
  calculated_amount DECIMAL(12,2) DEFAULT 0,
  actual_amount DECIMAL(12,2) DEFAULT 0,
  
  -- For adjustments
  is_overridden BOOLEAN DEFAULT FALSE,
  override_amount DECIMAL(12,2),
  override_reason TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `payslips`
```sql
CREATE TABLE payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_record_id UUID NOT NULL REFERENCES payroll_records(id) ON DELETE CASCADE,
  
  employee_id UUID NOT NULL REFERENCES employees(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  payroll_cycle_id UUID NOT NULL REFERENCES payroll_cycles(id),
  
  -- Payslip details
  payslip_number VARCHAR(50) UNIQUE NOT NULL,
  payslip_date DATE NOT NULL,
  
  -- Earnings and deductions
  gross_salary DECIMAL(12,2),
  total_earnings DECIMAL(12,2),
  total_deductions DECIMAL(12,2),
  net_salary DECIMAL(12,2),
  
  -- YTD
  ytd_gross DECIMAL(12,2),
  ytd_earnings DECIMAL(12,2),
  ytd_deductions DECIMAL(12,2),
  ytd_net DECIMAL(12,2),
  
  -- Generation
  generated_date TIMESTAMP,
  pdf_url TEXT,
  
  -- Status
  is_sent BOOLEAN DEFAULT FALSE,
  sent_date TIMESTAMP,
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `payroll_adjustments`
```sql
CREATE TABLE payroll_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_record_id UUID NOT NULL REFERENCES payroll_records(id) ON DELETE CASCADE,
  
  adjustment_type VARCHAR(50) NOT NULL, -- BONUS, ARREAR, RECOVERY, REIMBURSEMENT, ADVANCE_DEDUCTION
  description TEXT NOT NULL,
  
  amount DECIMAL(12,2) NOT NULL,
  
  reason TEXT,
  reference_document_url TEXT,
  
  approved_by UUID REFERENCES employees(id),
  approval_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);
```

#### `salary_payment_records`
```sql
CREATE TABLE salary_payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_record_id UUID NOT NULL REFERENCES payroll_records(id) ON DELETE CASCADE,
  payroll_cycle_id UUID NOT NULL REFERENCES payroll_cycles(id),
  
  employee_id UUID NOT NULL REFERENCES employees(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Payment details
  payment_date DATE,
  payment_method VARCHAR(50), -- BANK_TRANSFER, CHEQUE, CASH, DIGITAL_WALLET
  payment_reference VARCHAR(100),
  payment_amount DECIMAL(12,2) NOT NULL,
  
  -- Bank details (if bank transfer)
  bank_account_id UUID REFERENCES bank_accounts(id),
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  
  -- Status
  payment_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED, REVERSED
  payment_status_date TIMESTAMP,
  
  -- Failure details
  failure_reason TEXT,
  retry_count INT DEFAULT 0,
  last_retry_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `payroll_statutory_details`
```sql
CREATE TABLE payroll_statutory_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_record_id UUID NOT NULL REFERENCES payroll_records(id) ON DELETE CASCADE,
  
  -- PF Details
  pf_contribution_employee DECIMAL(12,2) DEFAULT 0,
  pf_contribution_employer DECIMAL(12,2) DEFAULT 0,
  pf_member_id VARCHAR(50),
  
  -- ESI Details
  esi_contribution_employee DECIMAL(12,2) DEFAULT 0,
  esi_contribution_employer DECIMAL(12,2) DEFAULT 0,
  esi_member_id VARCHAR(50),
  
  -- Income Tax
  income_tax DECIMAL(12,2) DEFAULT 0,
  tax_slab_id UUID REFERENCES tax_slabs(id),
  
  -- Professional Tax
  professional_tax DECIMAL(12,2) DEFAULT 0,
  
  -- Other statutory
  other_statutory_deduction DECIMAL(12,2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `bank_accounts`
```sql
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  account_holder_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  ifsc_code VARCHAR(20) NOT NULL,
  bank_name VARCHAR(100),
  account_type VARCHAR(50), -- SAVINGS, CURRENT
  
  is_primary BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(organization_id, account_number)
);
```

### Views and Queries

#### Payroll Summary for a Cycle
```sql
SELECT 
  pc.id,
  pc.cycle_name,
  pc.start_date,
  pc.end_date,
  COUNT(pr.id) as total_employees,
  SUM(pr.gross_salary) as total_gross,
  SUM(pr.net_salary) as total_net,
  SUM(pr.total_deductions) as total_deductions,
  COUNT(CASE WHEN pr.status = 'APPROVED' THEN 1 END) as approved_count
FROM payroll_cycles pc
LEFT JOIN payroll_records pr ON pc.id = pr.payroll_cycle_id
WHERE pc.organization_id = $1
GROUP BY pc.id, pc.cycle_name, pc.start_date, pc.end_date;
```

#### Payment Status Report
```sql
SELECT 
  e.id,
  e.first_name || ' ' || e.last_name as employee_name,
  spr.payment_date,
  spr.payment_method,
  spr.payment_amount,
  spr.payment_status,
  spr.failure_reason
FROM salary_payment_records spr
JOIN employees e ON spr.employee_id = e.id
JOIN payroll_cycles pc ON spr.payroll_cycle_id = pc.id
WHERE spr.organization_id = $1
  AND pc.id = $2
ORDER BY spr.payment_status DESC, e.first_name;
```

## Components

### PayslipGenerator
Location: `src/features/payroll/components/PayslipGenerator.tsx`

**Purpose:** Generate payslips for payroll cycle

**Props:**
```typescript
interface PayslipGeneratorProps {
  payrollCycleId: string;
  organizationId: string;
  onSuccess: () => void;
}
```

**Features:**
- Batch payslip generation
- Preview payslips
- Send via email
- Download PDF
- Bulk email distribution

### PayslipView
Location: `src/features/payroll/components/PayslipView.tsx`

**Purpose:** Display and print payslip

**Props:**
```typescript
interface PayslipViewProps {
  payslipId: string;
  employeeId?: string;
}
```

**Features:**
- Formatted payslip display
- Earnings breakdown
- Deductions breakdown
- YTD information
- Print functionality
- Email option
- Digital signature

### SalaryCalculation
Location: `src/features/payroll/components/SalaryCalculation.tsx`

**Purpose:** Calculate and review salary for payroll record

**Props:**
```typescript
interface SalaryCalculationProps {
  payrollRecordId: string;
  employeeId: string;
  onComplete: () => void;
}
```

**Features:**
- Component-wise calculation display
- Adjustment interface
- Validation of calculations
- Attendance impact display
- Approval workflow

### PaymentProcessing
Location: `src/features/payroll/components/PaymentProcessing.tsx`

**Purpose:** Process salary payments

**Props:**
```typescript
interface PaymentProcessingProps {
  payrollCycleId: string;
  organizationId: string;
  onSuccess: () => void;
}
```

**Features:**
- Batch payment initiation
- Payment method selection
- Bank account mapping
- Payment status tracking
- Failure handling
- Retry mechanism

### PayrollReports
Location: `src/features/payroll/components/PayrollReports.tsx`

**Purpose:** Generate payroll reports

**Props:**
```typescript
interface PayrollReportsProps {
  organizationId: string;
  payrollCycleId?: string;
}
```

**Features:**
- Multiple report types
- Summary and detailed views
- Department-wise breakdown
- Statutory compliance reports
- Export to Excel/PDF

## Services

### `payroll.service.ts`
Location: `src/features/payroll/services/payroll.service.ts`

```typescript
// Payroll Cycle
async createPayrollCycle(data: CreatePayrollCycleInput): Promise<PayrollCycle>
async getPayrollCycle(cycleId: string): Promise<PayrollCycle>
async listPayrollCycles(organizationId: string, filters?: CycleFilters): Promise<PayrollCycle[]>
async approvePayrollCycle(cycleId: string): Promise<void>
async lockPayrollCycle(cycleId: string): Promise<void>
async closePayrollCycle(cycleId: string): Promise<void>

// Payroll Records
async createPayrollRecords(cycleId: string, employeeIds: string[]): Promise<PayrollRecord[]>
async calculatePayroll(payrollRecordId: string): Promise<PayrollRecord>
async approvePayrollRecord(payrollRecordId: string): Promise<void>
async updatePayrollRecord(payrollRecordId: string, data: UpdatePayrollRecordInput): Promise<PayrollRecord>

// Adjustments
async addPayrollAdjustment(payrollRecordId: string, adjustment: AdjustmentInput): Promise<PayrollAdjustment>
async removePayrollAdjustment(adjustmentId: string): Promise<void>
async getAdjustments(payrollRecordId: string): Promise<PayrollAdjustment[]>

// Payslips
async generatePayslips(payrollCycleId: string): Promise<Payslip[]>
async generatePayslip(payrollRecordId: string): Promise<Payslip>
async getPayslip(payslipId: string): Promise<Payslip>
async sendPayslipEmail(payslipId: string, email?: string): Promise<void>
async bulkSendPayslips(payrollCycleId: string): Promise<BulkEmailResult>
async downloadPayslipPDF(payslipId: string): Promise<Blob>

// Payment Processing
async initiatePaymentBatch(payrollCycleId: string, paymentMethod: string): Promise<PaymentBatch>
async processPayment(paymentRecordId: string): Promise<void>
async updatePaymentStatus(paymentRecordId: string, status: PaymentStatus): Promise<void>
async retryFailedPayments(payrollCycleId: string): Promise<void>
async reconcilePayments(payrollCycleId: string): Promise<ReconciliationReport>

// Statutory
async calculateStatutoryDeductions(payrollRecordId: string): Promise<StatutoryDetails>
async generatePFReport(organizationId: string, month: Date): Promise<PFReport>
async generateESIReport(organizationId: string, month: Date): Promise<ESIReport>
async generateIncomeTaxReport(organizationId: string, year: number): Promise<IncomeTaxReport>

// Reports
async generatePayrollSummary(payrollCycleId: string): Promise<PayrollSummaryReport>
async generateDepartmentReport(payrollCycleId: string, departmentId: string): Promise<DepartmentPayrollReport>
async generateSalaryRegister(payrollCycleId: string): Promise<SalaryRegister>
async generatePaymentReport(payrollCycleId: string): Promise<PaymentReport>

// Bulk Operations
async bulkApproveRecords(payrollCycleId: string, employeeIds: string[]): Promise<void>
async bulkAddAdjustment(payrollCycleId: string, adjustment: BulkAdjustmentInput): Promise<void>
```

### `payroll.queries.ts`
Location: `src/features/payroll/services/payroll.queries.ts`

```typescript
// React Query hooks
export const usePayrollCycles = (organizationId: string, filters?: CycleFilters)
export const usePayrollCycle = (cycleId: string)
export const usePayrollRecords = (cycleId: string)
export const usePayrollRecord = (recordId: string)
export const usePayslip = (payslipId: string)
export const usePayslips = (cycleId: string)
export const usePaymentRecords = (cycleId: string)
export const usePayrollSummary = (cycleId: string)

// Mutations
export const useCreatePayrollCycle = ()
export const useCalculatePayroll = ()
export const useApprovePayrollRecord = ()
export const useGeneratePayslips = ()
export const useInitiatePayment = ()
export const useAddPayrollAdjustment = ()
```

## API Endpoints

### REST API (via Supabase AutoAPI)

```
GET    /rest/v1/payroll_cycles?organization_id=eq.{id}
POST   /rest/v1/payroll_cycles
PATCH  /rest/v1/payroll_cycles/{id}

GET    /rest/v1/payroll_records?payroll_cycle_id=eq.{id}
POST   /rest/v1/payroll_records
PATCH  /rest/v1/payroll_records/{id}

GET    /rest/v1/payroll_component_details?payroll_record_id=eq.{id}
POST   /rest/v1/payroll_component_details
PATCH  /rest/v1/payroll_component_details/{id}

GET    /rest/v1/payslips?payroll_cycle_id=eq.{id}
POST   /rest/v1/payslips

GET    /rest/v1/payroll_adjustments?payroll_record_id=eq.{id}
POST   /rest/v1/payroll_adjustments
DELETE /rest/v1/payroll_adjustments/{id}

GET    /rest/v1/salary_payment_records?payroll_cycle_id=eq.{id}
POST   /rest/v1/salary_payment_records
PATCH  /rest/v1/salary_payment_records/{id}

POST   /rest/v1/bank_accounts
PATCH  /rest/v1/bank_accounts/{id}
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Employees can view their own payslips
CREATE POLICY payslips_self_view ON payslips
  FOR SELECT USING (
    employee_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
  );

-- Finance staff can view all payroll
CREATE POLICY payroll_finance_view ON payroll_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('FINANCE_MANAGER', 'ADMIN')
        AND ur.organization_id = organization_id
    )
  );

-- Only finance can manage payroll
CREATE POLICY payroll_manage ON payroll_records
  FOR INSERT, UPDATE, DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('FINANCE_MANAGER', 'ADMIN')
    )
  );
```

## Implementation Workflow

### Phase 1: Core Setup
1. Create database tables
2. Set up bank account management
3. Initialize payroll cycles

### Phase 2: Calculation Engine
1. Implement salary calculation
2. Build SalaryCalculation component
3. Integrate with salary structures

### Phase 3: Payslip Generation
1. Build PayslipGenerator
2. Build PayslipView
3. Implement PDF generation

### Phase 4: Payment Processing
1. Build PaymentProcessing component
2. Implement payment status tracking
3. Add reconciliation logic

### Phase 5: Reporting & Compliance
1. Build PayrollReports
2. Implement statutory report generation
3. Add analytics dashboard

## Testing Strategy

### Unit Tests
- Salary calculation accuracy
- Component deduction application
- Statutory calculation
- Tax slab application

### Component Tests
- PayslipView rendering
- SalaryCalculation workflow
- PaymentProcessing UI

### Integration Tests
- End-to-end payroll cycle
- Payslip generation accuracy
- Payment processing workflow

## Performance Optimization

- Batch payroll record creation
- Cache salary structure lookups
- Parallel payslip generation
- Batch payment processing
- Optimize statutory calculation queries

## Future Enhancements

- Advance salary deductions
- Leave encashment processing
- Full and Final settlement
- Gratuity calculations
- Integration with banking APIs
- Automated TDS filing
- Employee salary advance system
- Expense claim integration
