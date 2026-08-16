/**
 * EMI (Equated Monthly Installment) Calculation Utility
 * 
 * Provides functions to calculate EMI, generate payment schedules,
 * and handle interest calculations for fee payments
 */

export interface EMICalculationParams {
  principal: number;
  annualInterestRate: number;
  tenureMonths: number;
}

export interface EMIScheduleItem {
  emiNumber: number;
  dueDate: Date;
  emiAmount: number;
  principalComponent: number;
  interestComponent: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
}

export interface EMIResults {
  monthlyEMI: number;
  totalPayable: number;
  totalInterest: number;
  schedule: EMIScheduleItem[];
}

/**
 * Calculate EMI using standard formula:
 * EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
 * 
 * @param principal - Total fee amount
 * @param annualInterestRate - Annual interest rate (percentage)
 * @param tenureMonths - Number of months
 * @returns Monthly EMI amount
 */
export const calculateEMI = (params: EMICalculationParams): number => {
  const { principal, annualInterestRate, tenureMonths } = params;

  if (tenureMonths === 0) return principal;

  const monthlyRate = annualInterestRate / 12 / 100;

  // If no interest, simple division
  if (monthlyRate === 0) {
    return Math.round((principal / tenureMonths) * 100) / 100;
  }

  const numerator =
    principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths);
  const denominator = Math.pow(1 + monthlyRate, tenureMonths) - 1;

  return Math.round((numerator / denominator) * 100) / 100;
};

/**
 * Generate complete EMI schedule with payment breakdown
 */
export const generateEMISchedule = (
  params: EMICalculationParams,
  startDate: Date
): EMIScheduleItem[] => {
  const emiAmount = calculateEMI(params);
  const { principal, annualInterestRate, tenureMonths } = params;
  const monthlyRate = annualInterestRate / 12 / 100;

  const schedule: EMIScheduleItem[] = [];
  let remainingPrincipal = principal;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;

  for (let i = 1; i <= tenureMonths; i++) {
    const interestComponent = Math.round(remainingPrincipal * monthlyRate * 100) / 100;
    const principalComponent = Math.round((emiAmount - interestComponent) * 100) / 100;

    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    // Set to same day of month, or last day if month has fewer days
    const lastDay = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
    const dayOfMonth = Math.min(startDate.getDate(), lastDay);
    dueDate.setDate(dayOfMonth);

    cumulativePrincipal += principalComponent;
    cumulativeInterest += interestComponent;
    remainingPrincipal -= principalComponent;

    schedule.push({
      emiNumber: i,
      dueDate,
      emiAmount,
      principalComponent,
      interestComponent,
      cumulativePrincipal: Math.round(cumulativePrincipal * 100) / 100,
      cumulativeInterest: Math.round(cumulativeInterest * 100) / 100,
    });
  }

  return schedule;
};

/**
 * Calculate total interest for EMI
 */
export const calculateTotalInterest = (params: EMICalculationParams): number => {
  const emiAmount = calculateEMI(params);
  const totalPayable = emiAmount * params.tenureMonths;
  const totalInterest = totalPayable - params.principal;
  return Math.round(totalInterest * 100) / 100;
};

/**
 * Calculate total payable amount including interest
 */
export const calculateTotalPayable = (params: EMICalculationParams): number => {
  const emiAmount = calculateEMI(params);
  const totalPayable = emiAmount * params.tenureMonths;
  return Math.round(totalPayable * 100) / 100;
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
  if (params.annualInterestRate > 50) {
    errors.push("Interest rate cannot exceed 50% per annum");
  }
  if (params.tenureMonths < 1) {
    errors.push("Tenure must be at least 1 month");
  }
  if (params.tenureMonths > 60) {
    errors.push("Tenure cannot exceed 60 months");
  }

  return errors;
};

/**
 * Get EMI details for display
 */
export const getEMIDetails = (params: EMICalculationParams) => {
  const errors = validateEMIParams(params);
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const monthlyEMI = calculateEMI(params);
  const totalInterest = calculateTotalInterest(params);
  const totalPayable = calculateTotalPayable(params);
  const schedule = generateEMISchedule(params, new Date());

  return {
    valid: true,
    monthlyEMI,
    totalInterest,
    totalPayable,
    schedule,
    errors: [],
  };
};

/**
 * Calculate penalty for late payment
 */
export const calculateLatePenalty = (
  emiAmount: number,
  daysOverdue: number,
  penaltyPercentPerMonth: number = 1
): number => {
  const months = Math.ceil(daysOverdue / 30);
  const penalty = (emiAmount * penaltyPercentPerMonth * months) / 100;
  return Math.round(penalty * 100) / 100;
};

/**
 * Check if EMI is eligible based on fee amount
 */
export const isEMIEligible = (amount: number, minAmount: number = 10000): boolean => {
  return amount >= minAmount;
};

/**
 * Format EMI details for display
 */
export const formatEMIDisplay = (
  monthlyEMI: number,
  totalInterest: number,
  tenure: number
): string => {
  return `₹${monthlyEMI.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })} × ${tenure} months | Interest: ₹${totalInterest.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Compare payment options (Full vs EMI)
 */
export const comparePaymentOptions = (
  fullPaymentAmount: number,
  emiParams: EMICalculationParams
): { fullPayment: number; emi: number; extraCost: number; savingPercent: number } => {
  const emiTotalPayable = calculateTotalPayable(emiParams);
  const extraCost = emiTotalPayable - fullPaymentAmount;
  const savingPercent = (extraCost / fullPaymentAmount) * 100;

  return {
    fullPayment: fullPaymentAmount,
    emi: emiTotalPayable,
    extraCost: Math.round(extraCost * 100) / 100,
    savingPercent: Math.round(savingPercent * 100) / 100,
  };
};
