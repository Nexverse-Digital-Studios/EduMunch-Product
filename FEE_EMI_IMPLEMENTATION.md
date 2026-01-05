# Fee Payment with EMI Implementation Guide

## Overview

This guide implements an Equated Monthly Installment (EMI) payment option for student fees, allowing parents to pay fees in monthly installments instead of lump sum.

## 1. Database Schema Changes

### New Table: `fee_emi_schedules_1emaet`

```sql
CREATE TABLE public.fee_emi_schedules_1emaet (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_fee_id uuid NOT NULL,
  student_id uuid NOT NULL,
  emi_number integer NOT NULL,
  emi_amount numeric NOT NULL,
  due_date date NOT NULL,
  payment_date date,
  paid_amount numeric DEFAULT 0,
  status character varying DEFAULT 'Pending'::character varying
    CHECK (status::text = ANY (ARRAY['Pending'::character varying, 'Paid'::character varying, 'Overdue'::character varying, 'Cancelled'::character varying]::text[])),
  interest_amount numeric DEFAULT 0,
  penalty_amount numeric DEFAULT 0,
  remarks text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT fee_emi_schedules_1emaet_pkey PRIMARY KEY (id),
  CONSTRAINT fk_fee_emi_schedules_student_fee FOREIGN KEY (student_fee_id) REFERENCES public.student_fees_1emaet(id),
  CONSTRAINT fk_fee_emi_schedules_student FOREIGN KEY (student_id) REFERENCES public.students_1emaet(id)
);
```

### Alter `fee_payments_1emaet` Table

```sql
ALTER TABLE public.fee_payments_1emaet
ADD COLUMN payment_option VARCHAR(20) DEFAULT 'Full Payment'
  CHECK (payment_option::text = ANY (ARRAY['Full Payment'::character varying, 'EMI'::character varying]::text[])),
ADD COLUMN emi_schedule_id uuid REFERENCES public.fee_emi_schedules_1emaet(id),
ADD COLUMN emi_tenure_months integer DEFAULT NULL;
```

### Alter `student_fees_1emaet` Table

```sql
ALTER TABLE public.student_fees_1emaet
ADD COLUMN payment_plan VARCHAR(20) DEFAULT 'Full Payment'
  CHECK (payment_plan::text = ANY (ARRAY['Full Payment'::character varying, 'EMI'::character varying]::text[])),
ADD COLUMN emi_tenure_months integer DEFAULT NULL,
ADD COLUMN emi_interest_percent numeric DEFAULT 0,
ADD COLUMN emi_start_date date DEFAULT NULL;
```

## 2. Type Definitions

### Update Types File

```typescript
// Add these interfaces to src/pages/fees/components/types.ts

export interface FeeEMIScheduleDB {
  id: string;
  student_fee_id: string;
  student_id: string;
  emi_number: number;
  emi_amount: number;
  due_date: string;
  payment_date: string | null;
  paid_amount: number;
  status: "Pending" | "Paid" | "Overdue" | "Cancelled";
  interest_amount: number;
  penalty_amount: number;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

// Update FeePaymentDB
export interface FeePaymentDB {
  id: string;
  student_fee_id: string;
  student_id: string;
  receipt_number: string;
  payment_date: string;
  amount: number;
  payment_mode: "Cash" | "Cheque" | "UPI" | "Card" | "Net Banking" | "Other";
  payment_option: "Full Payment" | "EMI"; // NEW
  emi_schedule_id?: string | null; // NEW
  emi_tenure_months?: number | null; // NEW
  transaction_id: string | null;
  cheque_number: string | null;
  cheque_date: string | null;
  bank_name: string | null;
  collected_by: string | null;
  remarks: string | null;
  receipt_url: string | null;
  status: "pending" | "completed" | "failed" | "refunded";
  created_at: string;
}

// Update StudentFeeDB
export interface StudentFeeDB {
  id: string;
  student_id: string;
  fee_structure_id: string;
  academic_year_id: string;
  total_amount: number;
  discount_amount: number;
  discount_reason: string | null;
  net_amount: number;
  paid_amount: number;
  balance_amount: number;
  due_date: string;
  status: "pending" | "partial" | "paid" | "overdue" | "waived";
  payment_plan: "Full Payment" | "EMI"; // NEW
  emi_tenure_months?: number | null; // NEW
  emi_interest_percent?: number; // NEW
  emi_start_date?: string | null; // NEW
  created_at: string;
  updated_at: string;
}

// EMI Configuration Interface
export interface EMIConfig {
  tenureOptions: Array<{
    months: number;
    interestRate: number; // percentage
    description: string;
  }>;
}
```

## 3. EMI Calculation Logic

```typescript
// src/lib/emiCalculations.ts

export interface EMICalculationParams {
  principal: number;
  annualInterestRate: number;
  tenureMonths: number;
}

export interface EMISchedule {
  emiNumber: number;
  dueDate: Date;
  emiAmount: number;
  principalComponent: number;
  interestComponent: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
}

/**
 * Calculate EMI using standard EMI formula
 * EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
 * where:
 * P = Principal amount
 * r = Monthly interest rate
 * n = Number of months
 */
export const calculateEMI = (params: EMICalculationParams): number => {
  const { principal, annualInterestRate, tenureMonths } = params;

  if (tenureMonths === 0) return principal;

  const monthlyRate = annualInterestRate / 12 / 100;

  if (monthlyRate === 0) {
    return principal / tenureMonths;
  }

  const numerator =
    principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths);
  const denominator = Math.pow(1 + monthlyRate, tenureMonths) - 1;

  return numerator / denominator;
};

/**
 * Generate complete EMI schedule
 */
export const generateEMISchedule = (
  params: EMICalculationParams,
  startDate: Date
): EMISchedule[] => {
  const emiAmount = calculateEMI(params);
  const { principal, annualInterestRate, tenureMonths } = params;
  const monthlyRate = annualInterestRate / 12 / 100;

  const schedule: EMISchedule[] = [];
  let remainingPrincipal = principal;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;

  for (let i = 1; i <= tenureMonths; i++) {
    const interestComponent = remainingPrincipal * monthlyRate;
    const principalComponent = emiAmount - interestComponent;

    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    cumulativePrincipal += principalComponent;
    cumulativeInterest += interestComponent;
    remainingPrincipal -= principalComponent;

    schedule.push({
      emiNumber: i,
      dueDate,
      emiAmount,
      principalComponent,
      interestComponent,
      cumulativePrincipal,
      cumulativeInterest,
    });
  }

  return schedule;
};

/**
 * Calculate total interest
 */
export const calculateTotalInterest = (
  params: EMICalculationParams
): number => {
  const emiAmount = calculateEMI(params);
  const totalPayable = emiAmount * params.tenureMonths;
  return totalPayable - params.principal;
};

/**
 * Validate EMI parameters
 */
export const validateEMIParams = (params: EMICalculationParams): string[] => {
  const errors: string[] = [];

  if (params.principal <= 0) {
    errors.push("Principal amount must be greater than 0");
  }
  if (params.annualInterestRate < 0) {
    errors.push("Interest rate cannot be negative");
  }
  if (params.tenureMonths < 1) {
    errors.push("Tenure must be at least 1 month");
  }
  if (params.tenureMonths > 60) {
    errors.push("Tenure cannot exceed 60 months");
  }

  return errors;
};
```

## 4. Configuration

```typescript
// src/config/emiConfig.ts

export const EMI_CONFIG = {
  TENURE_OPTIONS: [
    { months: 3, interestRate: 0, description: "3 Months - No Interest" },
    { months: 6, interestRate: 2, description: "6 Months - 2% Interest" },
    { months: 9, interestRate: 3, description: "9 Months - 3% Interest" },
    { months: 12, interestRate: 4, description: "12 Months - 4% Interest" },
  ],
  MIN_FEE_FOR_EMI: 10000, // Only allow EMI for fees >= 10000
  MAX_TENURE_MONTHS: 12,
  DEFAULT_INTEREST_RATE: 2, // Default interest rate if no tenure selected
  LATE_PAYMENT_PENALTY_PERCENT: 1, // 1% penalty per month overdue
  PENALTY_GRACE_PERIOD_DAYS: 5, // Grace period before charging penalty
};

export const PAYMENT_PLAN_TYPES = {
  FULL_PAYMENT: "Full Payment",
  EMI: "EMI",
};
```

## 5. UI Components

See the accompanying component files:

- `EMIPaymentSelector.tsx` - Component for selecting payment plan and EMI tenure
- `EMIScheduleViewer.tsx` - Component to display EMI schedule
- `EMIPaymentProcessor.tsx` - Updated fee collection with EMI support

## 6. Backend Integration

### Create EMI Schedule Function

```typescript
// This should be called when student chooses EMI payment

async function createEMISchedule(
  studentFeeId: string,
  studentId: string,
  totalAmount: number,
  tenureMonths: number,
  interestRate: number,
  startDate: Date
) {
  const emiSchedule = generateEMISchedule(
    {
      principal: totalAmount,
      annualInterestRate: interestRate,
      tenureMonths: tenureMonths,
    },
    startDate
  );

  // Insert schedules to database
  const schedules = emiSchedule.map((schedule) => ({
    student_fee_id: studentFeeId,
    student_id: studentId,
    emi_number: schedule.emiNumber,
    emi_amount: schedule.emiAmount,
    due_date: schedule.dueDate,
    status: "Pending",
    interest_amount: schedule.interestComponent,
  }));

  // Use Supabase to insert
  const { error } = await supabase
    .from(`fee_emi_schedules_${INDEX_TOKEN}`)
    .insert(schedules);

  if (error) throw error;
}
```

## 7. Key Features to Implement

- ✅ Payment option selection (Full Payment vs EMI)
- ✅ EMI tenure selection with interest calculation
- ✅ EMI schedule generation and display
- ✅ Interest calculation on EMI
- ✅ Late payment penalty system
- ✅ EMI schedule view dashboard
- ✅ Individual EMI payment tracking
- ✅ EMI receipt generation
- ✅ EMI default/delinquency tracking

## 8. Implementation Steps

1. **Update Database Schema** - Run SQL migrations
2. **Update TypeScript Types** - Add new interfaces
3. **Create Utility Functions** - EMI calculations
4. **Update Configuration** - EMI tenure options
5. **Create UI Components** - Payment selection and schedule view
6. **Update Fee Collection Page** - Integrate EMI option
7. **Create EMI Dashboard** - Track EMI schedules
8. **Update Receipts** - Show EMI details
9. **Testing** - Test all EMI scenarios
10. **Documentation** - Document for users

## 9. Safety Considerations

- Validate all EMI parameters
- Prevent EMI on very small amounts
- Cap maximum tenure
- Track penalties properly
- Audit trail for all EMI transactions
- Automatic penalty calculation
- Grace period before penalty
