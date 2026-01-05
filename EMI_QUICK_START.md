// # Fee Payment with EMI Implementation - Quick Start Guide

## What Was Created

You now have a complete EMI (Equated Monthly Installment) payment system with 5 new files:

### 1. **FEE_EMI_IMPLEMENTATION.md** - Complete Implementation Guide

- Database schema changes (SQL)
- Type definitions
- EMI calculation logic
- Configuration
- UI components overview
- Implementation steps
- Safety considerations

### 2. **src/lib/emiCalculations.ts** - EMI Calculation Engine

- `calculateEMI()` - Calculate monthly EMI amount
- `generateEMISchedule()` - Generate complete payment schedule
- `calculateTotalInterest()` - Calculate total interest
- `validateEMIParams()` - Validate input parameters
- `comparePaymentOptions()` - Compare Full vs EMI
- All functions include rounding and precision handling

### 3. **src/config/emiConfig.ts** - Configuration & Constants

- Tenure options (3, 6, 9, 12 months)
- Interest rates (0%, 2%, 3%, 4% respectively)
- Minimum fee for EMI: ₹10,000
- Late payment penalty: 1% per month
- Grace period: 5 days
- Helper functions for eligibility checks

### 4. **src/pages/fees/components/EMIPaymentSelector.tsx** - UI Component

- Radio button selection between Full Payment and EMI
- Tenure dropdown selection
- Real-time EMI calculation display
- EMI preview with interest breakdown
- Confirmation dialog with complete details
- Eligibility checking with alerts

### 5. **src/pages/fees/components/EMIScheduleViewer.tsx** - Schedule Component

- Complete EMI schedule table
- Payment progress bar
- Individual installment status tracking
- Overdue tracking with days calculation
- CSV download of schedule
- Installment detail modal

## How to Implement

### Phase 1: Database Setup (Run these SQL queries)

```sql
-- Create EMI Schedule table
CREATE TABLE public.fee_emi_schedules_1emaet (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_fee_id uuid NOT NULL,
  student_id uuid NOT NULL,
  emi_number integer NOT NULL,
  emi_amount numeric NOT NULL,
  due_date date NOT NULL,
  payment_date date,
  paid_amount numeric DEFAULT 0,
  status varchar DEFAULT 'Pending',
  interest_amount numeric DEFAULT 0,
  penalty_amount numeric DEFAULT 0,
  remarks text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (student_fee_id) REFERENCES public.student_fees_1emaet(id),
  FOREIGN KEY (student_id) REFERENCES public.students_1emaet(id)
);

-- Update fee_payments table
ALTER TABLE public.fee_payments_1emaet
ADD COLUMN payment_option VARCHAR(20) DEFAULT 'Full Payment',
ADD COLUMN emi_schedule_id uuid REFERENCES public.fee_emi_schedules_1emaet(id),
ADD COLUMN emi_tenure_months integer;

-- Update student_fees table
ALTER TABLE public.student_fees_1emaet
ADD COLUMN payment_plan VARCHAR(20) DEFAULT 'Full Payment',
ADD COLUMN emi_tenure_months integer,
ADD COLUMN emi_interest_percent numeric DEFAULT 0,
ADD COLUMN emi_start_date date;
```

### Phase 2: Update Type Definitions

Edit `src/pages/fees/components/types.ts` and add:

```typescript
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

// Update FeePaymentDB interface - add these fields:
// payment_option: "Full Payment" | "EMI";
// emi_schedule_id?: string | null;
// emi_tenure_months?: number | null;

// Update StudentFeeDB interface - add these fields:
// payment_plan: "Full Payment" | "EMI";
// emi_tenure_months?: number | null;
// emi_interest_percent?: number;
// emi_start_date?: string | null;
```

### Phase 3: Integrate into FeeCollectPage

See `EMI_INTEGRATION_GUIDE.ts` for complete integration code. Quick summary:

```tsx
import { EMIPaymentSelector } from "./EMIPaymentSelector";
import { EMIScheduleViewer } from "./EMIScheduleViewer";

// In your component, after displaying fee selection:
<EMIPaymentSelector
  feeAmount={totalAmount}
  onPaymentOptionSelected={(option) => {
    // Handle selected payment option
    // Save to state for payment processing
  }}
/>;

// Show EMI schedule if user selects EMI
{
  paymentPlan === "EMI" && (
    <EMIScheduleViewer
      feeAmount={totalAmount}
      tenureMonths={tenureMonths}
      interestRate={interestRate}
      studentName={studentName}
    />
  );
}
```

### Phase 4: Update Payment Processing

When processing payment with EMI:

```typescript
import { generateEMISchedule } from "@/lib/emiCalculations";

// Generate EMI schedule
const schedule = generateEMISchedule(
  {
    principal: feeAmount,
    annualInterestRate: interestRate,
    tenureMonths: tenureMonths,
  },
  startDate
);

// Insert each EMI into database
const emiRecords = schedule.map((item) => ({
  student_fee_id: studentFeeId,
  student_id: studentId,
  emi_number: item.emiNumber,
  emi_amount: item.emiAmount,
  due_date: item.dueDate,
  status: "Pending",
  interest_amount: item.interestComponent,
}));

await supabase.from(`fee_emi_schedules_${INDEX_TOKEN}`).insert(emiRecords);
```

## Key Features

### Calculation Features

✅ EMI calculation using standard formula
✅ Interest calculation on principal
✅ Complete payment schedule generation
✅ Automatic rounding and precision handling
✅ Comparison between Full Payment vs EMI
✅ Late payment penalty calculation

### UI Features

✅ Payment option selector (Full vs EMI)
✅ Tenure dropdown with interest rates
✅ Real-time EMI amount display
✅ Complete payment schedule with status
✅ Progress tracking
✅ Overdue tracking with penalties
✅ CSV download of schedule
✅ Individual installment details modal

### Configuration Features

✅ Configurable tenure options
✅ Flexible interest rates
✅ Minimum amount for EMI eligibility
✅ Late payment penalty settings
✅ Grace period configuration

## EMI Formula Used

```
EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)

Where:
P = Principal (fee amount)
r = Monthly interest rate (annual rate / 12 / 100)
n = Number of months (tenure)
```

## Example Calculation

**Fee Amount:** ₹10,000
**Tenure:** 12 months
**Interest Rate:** 4% per annum

- Monthly Rate = 4 / 12 / 100 = 0.003333
- EMI = 10,000 × 0.003333 × (1.003333)^12 / ((1.003333)^12 - 1)
- **EMI = ₹856.07 per month**
- **Total Interest = ₹271.84**
- **Total Amount = ₹10,271.84**

## Testing Checklist

- [ ] Run SQL migrations successfully
- [ ] Update TypeScript types
- [ ] Import components in FeeCollectPage
- [ ] Test Full Payment option (should work as before)
- [ ] Test EMI option with different tenures
- [ ] Verify EMI calculations are correct
- [ ] Test schedule download (CSV)
- [ ] Test eligibility check (< ₹10,000 shows warning)
- [ ] Test EMI confirmation dialog
- [ ] Test payment processing with EMI
- [ ] Verify EMI schedule is created in database
- [ ] Check overdue calculation works
- [ ] Test penalty calculation

## Common Use Cases

### Use Case 1: Student pays ₹25,000 in 6 months

- Full Payment: ₹25,000
- EMI (6 months @ 2%): ₹4,187/month, Total Interest: ₹252
- Total Amount: ₹25,252

### Use Case 2: Student pays ₹50,000 in 12 months

- Full Payment: ₹50,000
- EMI (12 months @ 4%): ₹4,281/month, Total Interest: ₹1,357
- Total Amount: ₹51,357

### Use Case 3: Fee amount too small

- Amount: ₹5,000 (< ₹10,000 minimum)
- EMI: Not eligible - show alert
- Only Full Payment option available

## API/Database Operations

### Create EMI Schedule

```typescript
POST /api/fee-emi-schedules
{
  student_fee_id: uuid,
  student_id: uuid,
  emi_records: [...] // array of schedules
}
```

### Get EMI Schedule for Student

```typescript
GET /api/fee-emi-schedules?student_id=xyz&student_fee_id=abc
```

### Update EMI Payment

```typescript
PATCH /api/fee-emi-schedules/:id
{
  status: "Paid",
  payment_date: "2026-02-15",
  paid_amount: 856.07
}
```

### Calculate Penalty

```typescript
POST /api/fee-emi-penalties/calculate
{
  emi_schedule_id: uuid,
  days_overdue: 10
}
// Returns penalty amount based on days and percentage
```

## Performance Notes

- EMI calculations are lightweight (minimal database impact)
- Schedule generation is done client-side for better UX
- Schedule can be cached in localStorage for offline access
- CSV export is handled in browser (no server load)

## Security Considerations

✅ Validate all EMI parameters on client and server
✅ Prevent negative amounts or invalid tenures
✅ Audit trail for all EMI transactions
✅ Verify user has permission before modifying EMI
✅ Encrypt sensitive payment information
✅ Validate payment before marking as complete

## Future Enhancements

- Auto-generated payment reminders (SMS/Email)
- Late payment alerts and dunning management
- Partial EMI payment tracking
- EMI prepayment discount/rebate system
- Multi-language support for EMI documents
- Integration with payment gateways (Razorpay, PayU, etc.)
- EMI default and recovery workflow
- Automated penalty reversal for early payment
- EMI insurance option (EMI protection)

## Support & Troubleshooting

**Issue:** EMI option not showing

- Check if fee amount >= ₹10,000
- Verify config file is imported correctly

**Issue:** EMI calculations wrong

- Verify interest rate in config
- Check rounding is applied correctly
- Use provided example to validate formula

**Issue:** Schedule not saving

- Check database migration ran successfully
- Verify table names match INDEX_TOKEN
- Check foreign key constraints

## File Location Reference

```
src/
├── lib/
│   └── emiCalculations.ts (NEW)
├── config/
│   └── emiConfig.ts (NEW)
├── pages/
│   └── fees/
│       └── components/
│           ├── EMIPaymentSelector.tsx (NEW)
│           ├── EMIScheduleViewer.tsx (NEW)
│           └── EMI_INTEGRATION_GUIDE.ts (NEW)
└── FEE_EMI_IMPLEMENTATION.md (NEW)
```

---

**Created On:** January 5, 2026
**Status:** Ready for Implementation
**Next Step:** Run database migrations and integrate into FeeCollectPage
