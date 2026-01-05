/**
 * Fee Management Types
 * ====================
 * Type definitions for fee structures, payments, and receipts
 *
 * Database Tables:
 * - fee_structures_1emaet
 * - fee_components_1emaet
 * - fee_structure_components_1emaet
 * - student_fees_1emaet
 * - fee_payments_1emaet
 * - fee_refunds_1emaet
 * - late_fee_config_1emaet
 * - fee_emi_schedules_1emaet (NEW - EMI support)
 */

export interface FeeStructureDB {
  id: string;
  structure_name: string;
  class_id: string;
  academic_year_id: string;
  total_amount: number;
  description: string | null;
  is_active: boolean;
  fee_components?: unknown; // JSON array for simpler structures
  created_at: string;
  updated_at: string;
}

export interface FeeComponentDB {
  id: string;
  component_name: string;
  component_code: string;
  description: string | null;
  is_mandatory: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeeStructureComponentDB {
  id: string;
  fee_structure_id: string;
  fee_component_id: string;
  amount: number;
  created_at: string;
}

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
  payment_plan: "Full Payment" | "EMI"; // NEW - EMI support
  emi_tenure_months: number | null; // NEW - EMI support
  emi_interest_percent: number; // NEW - EMI support
  emi_start_date: string | null; // NEW - EMI support
  created_at: string;
  updated_at: string;
}

export interface FeePaymentDB {
  id: string;
  student_fee_id: string;
  student_id: string;
  receipt_number: string;
  payment_date: string;
  amount: number;
  payment_mode: "Cash" | "Cheque" | "UPI" | "Card" | "Net Banking" | "Other";
  payment_option: "Full Payment" | "EMI"; // NEW - EMI support
  emi_schedule_id: string | null; // NEW - EMI support
  emi_tenure_months: number | null; // NEW - EMI support
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

export interface FeeRefundDB {
  id: string;
  refund_number: string;
  student_id: string;
  original_payment_id: string | null;
  original_transaction_id: string | null;
  refund_amount: number;
  refund_reason: string;
  refund_type: "Full Refund" | "Partial Refund" | "Fee Adjustment";
  requested_by: string;
  request_date: string;
  status: "Pending" | "Approved" | "Rejected" | "Processed" | "Completed";
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  refund_mode: "Bank Transfer" | "Cash" | "Cheque" | "Gateway Refund" | "Account Adjustment" | null;
  refund_processed_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface LateFeeConfigDB {
  id: string;
  class_id: string | null;
  grace_period_days: number;
  late_fee_type: "fixed" | "percentage";
  late_fee_amount: number;
  max_late_fee: number | null;
  is_active: boolean;
  created_at: string;
}

export interface FeeEMIScheduleDB {
  id: string;
  student_fee_id: string;
  student_id: string;
  emi_number: number;
  emi_amount: number;
  due_date: string;
  payment_date: string | null;
  paid_amount: number;
  status: "Pending" | "Paid" | "Overdue" | "Cancelled" | "Partially Paid";
  interest_amount: number;
  penalty_amount: number;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeeStructureFormData {
  structure_name: string;
  class_id: string;
  academic_year_id: string;
  description: string;
  components: {
    fee_component_id: string;
    amount: number;
  }[];
}

export interface PaymentFormData {
  student_fee_id: string;
  amount: number;
  payment_mode: string;
  transaction_id: string;
  cheque_number: string;
  cheque_date: string;
  bank_name: string;
  remarks: string;
}

export const PAYMENT_MODES = [
  { value: "Cash", label: "Cash" },
  { value: "Cheque", label: "Cheque" },
  { value: "UPI", label: "UPI" },
  { value: "Card", label: "Card" },
  { value: "Net Banking", label: "Net Banking" },
  { value: "Other", label: "Other" },
];

export const FEE_STATUSES = [
  { value: "pending", label: "Pending", color: "secondary" },
  { value: "partial", label: "Partially Paid", color: "default" },
  { value: "paid", label: "Paid", color: "default" },
  { value: "overdue", label: "Overdue", color: "destructive" },
  { value: "waived", label: "Waived", color: "outline" },
];

export const REFUND_STATUSES = [
  { value: "Pending", label: "Pending", color: "secondary" },
  { value: "Approved", label: "Approved", color: "default" },
  { value: "Rejected", label: "Rejected", color: "destructive" },
  { value: "Processed", label: "Processed", color: "default" },
  { value: "Completed", label: "Completed", color: "default" },
];
