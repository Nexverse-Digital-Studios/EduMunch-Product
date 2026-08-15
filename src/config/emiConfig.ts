/**
 * EMI Configuration
 * 
 * Centralized configuration for EMI payment options,
 * tenure choices, interest rates, and penalties
 */

export const EMI_CONFIG = {
  // EMI tenure options with interest rates
  TENURE_OPTIONS: [
    {
      months: 3,
      interestRate: 0,
      description: "3 Months - No Interest",
      label: "Quarterly",
    },
    {
      months: 6,
      interestRate: 2,
      description: "6 Months - 2% Interest P.A.",
      label: "Half-Yearly",
    },
    {
      months: 9,
      interestRate: 3,
      description: "9 Months - 3% Interest P.A.",
      label: "9 Months",
    },
    {
      months: 12,
      interestRate: 4,
      description: "12 Months - 4% Interest P.A.",
      label: "Yearly",
    },
  ],

  // Minimum fee amount for EMI eligibility
  MIN_FEE_FOR_EMI: 10000,

  // Maximum tenure in months
  MAX_TENURE_MONTHS: 12,

  // Default interest rate
  DEFAULT_INTEREST_RATE: 2,

  // Late payment penalty as percentage per month
  LATE_PAYMENT_PENALTY_PERCENT: 1,

  // Grace period before penalty (in days)
  PENALTY_GRACE_PERIOD_DAYS: 5,

  // Processing fee for EMI (if any)
  EMI_PROCESSING_FEE_PERCENT: 0,

  // Bounce charge for failed payments
  BOUNCE_CHARGE: 100,

  // Maximum number of EMI installments allowed per student per academic year
  MAX_EMI_PER_STUDENT_PER_YEAR: 3,
};

export const PAYMENT_PLAN_TYPES = {
  FULL_PAYMENT: "Full Payment",
  EMI: "EMI",
};

export const EMI_STATUS = {
  PENDING: "Pending",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
  PARTIALLY_PAID: "Partially Paid",
};

export const EMI_MESSAGES = {
  ELIGIBLE: "This fee is eligible for EMI payment",
  NOT_ELIGIBLE: "This fee amount is too small for EMI. Minimum required: ₹10,000",
  TENURE_SELECTED: "EMI tenure selected successfully",
  SCHEDULE_GENERATED: "EMI schedule has been generated",
  PAYMENT_FAILED: "EMI payment failed. Please try again.",
  PENALTY_CHARGED: "Late payment penalty has been charged",
  EMI_COMPLETED: "All EMI installments have been paid",
  CONFIRM_EMI: "You are about to convert this fee to EMI payment.",
  CONFIRM_TERMS: "Please review the terms and conditions",
};

/**
 * Get tenure option by months
 */
export const getTenureOption = (months: number) => {
  return EMI_CONFIG.TENURE_OPTIONS.find((option) => option.months === months);
};

/**
 * Get all available tenure options
 */
export const getAvailableTenures = () => {
  return EMI_CONFIG.TENURE_OPTIONS.map((option) => ({
    value: option.months.toString(),
    label: option.description,
  }));
};

/**
 * Check if amount is eligible for EMI
 */
export const isAmountEligibleForEMI = (amount: number): boolean => {
  return amount >= EMI_CONFIG.MIN_FEE_FOR_EMI;
};

/**
 * Get EMI eligibility message
 */
export const getEMIEligibilityMessage = (amount: number): string => {
  if (isAmountEligibleForEMI(amount)) {
    return EMI_MESSAGES.ELIGIBLE;
  }
  return `${EMI_MESSAGES.NOT_ELIGIBLE} (Current: ₹${amount.toLocaleString('en-IN')})`;
};

/**
 * Get tenure display label
 */
export const getTenureLabel = (months: number): string => {
  const option = getTenureOption(months);
  return option?.label || `${months} Months`;
};

/**
 * Get interest rate for tenure
 */
export const getInterestRateForTenure = (months: number): number => {
  const option = getTenureOption(months);
  return option?.interestRate || EMI_CONFIG.DEFAULT_INTEREST_RATE;
};

/**
 * Check if due date has passed grace period
 */
export const isOverdueWithGracePeriod = (dueDate: Date): boolean => {
  const today = new Date();
  const gracePeriodEnd = new Date(dueDate);
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + EMI_CONFIG.PENALTY_GRACE_PERIOD_DAYS);
  return today > gracePeriodEnd;
};

/**
 * Calculate days overdue
 */
export const calculateDaysOverdue = (dueDate: Date): number => {
  const today = new Date();
  const dueDateOnly = new Date(dueDate);
  const timeDifference = today.getTime() - dueDateOnly.getTime();
  const daysOverdue = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  return Math.max(0, daysOverdue);
};

/**
 * Get EMI status description
 */
export const getEMIStatusDescription = (
  status: string,
  dueDate?: Date
): { status: string; description: string; color: string } => {
  switch (status) {
    case EMI_STATUS.PAID:
      return {
        status: "Paid",
        description: "Payment completed",
        color: "bg-green-100 text-green-800",
      };
    case EMI_STATUS.PENDING:
      return {
        status: "Pending",
        description: "Payment due",
        color: "bg-blue-100 text-blue-800",
      };
    case EMI_STATUS.OVERDUE:
      return {
        status: "Overdue",
        description: "Payment overdue",
        color: "bg-red-100 text-red-800",
      };
    case EMI_STATUS.PARTIALLY_PAID:
      return {
        status: "Partially Paid",
        description: "Partial payment received",
        color: "bg-yellow-100 text-yellow-800",
      };
    case EMI_STATUS.CANCELLED:
      return {
        status: "Cancelled",
        description: "EMI cancelled",
        color: "bg-gray-100 text-gray-800",
      };
    default:
      return {
        status: status,
        description: status,
        color: "bg-gray-100 text-gray-800",
      };
  }
};

export default EMI_CONFIG;
