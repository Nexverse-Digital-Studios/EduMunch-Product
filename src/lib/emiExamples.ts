/**
 * EMI Implementation Examples & Test Cases
 * 
 * Practical examples showing how to use EMI system
 */

import {
  calculateEMI,
  generateEMISchedule,
  calculateTotalInterest,
  calculateLatePenalty,
  isEMIEligible,
  comparePaymentOptions,
  getEMIDetails,
} from "@/lib/emiCalculations";
import { EMI_CONFIG } from "@/config/emiConfig";

// ============================================================================
// EXAMPLE 1: Calculate EMI for ₹20,000 with 6-month tenure at 2% interest
// ============================================================================

export const example1_BasicCalculation = () => {
  const params = {
    principal: 20000,
    annualInterestRate: 2,
    tenureMonths: 6,
  };

  const monthlyEMI = calculateEMI(params);
  const totalInterest = calculateTotalInterest(params);
  const totalPayable = monthlyEMI * params.tenureMonths;

  console.log("=== Example 1: Basic EMI Calculation ===");
  console.log(`Principal: ₹${params.principal}`);
  console.log(`Tenure: ${params.tenureMonths} months`);
  console.log(`Interest Rate: ${params.annualInterestRate}%`);
  console.log(`Monthly EMI: ₹${monthlyEMI.toFixed(2)}`);
  console.log(`Total Interest: ₹${totalInterest.toFixed(2)}`);
  console.log(`Total Payable: ₹${totalPayable.toFixed(2)}`);
  console.log("====================================\n");

  return { monthlyEMI, totalInterest, totalPayable };
};

// ============================================================================
// EXAMPLE 2: Generate Complete Payment Schedule
// ============================================================================

export const example2_CompleteSchedule = () => {
  const startDate = new Date(2026, 0, 15); // January 15, 2026

  const schedule = generateEMISchedule(
    {
      principal: 36000,
      annualInterestRate: 3,
      tenureMonths: 12,
    },
    startDate
  );

  console.log("=== Example 2: EMI Schedule (₹36,000 for 12 months @ 3%) ===");
  console.log("EMI# | Due Date | Amount | Principal | Interest");
  console.log("-----|----------|--------|-----------|----------");

  schedule.forEach((item) => {
    const dueDate = item.dueDate.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    console.log(
      `${String(item.emiNumber).padStart(4)} | ${dueDate} | ₹${item.emiAmount.toFixed(2).padStart(6)} | ₹${item.principalComponent.toFixed(2).padStart(8)} | ₹${item.interestComponent.toFixed(2).padStart(8)}`
    );
  });

  console.log("============================================================\n");
  return schedule;
};

// ============================================================================
// EXAMPLE 3: Compare Full Payment vs EMI
// ============================================================================

export const example3_ComparePaymentOptions = () => {
  const fullPaymentAmount = 50000;

  const comparison = comparePaymentOptions(
    fullPaymentAmount,
    {
      principal: fullPaymentAmount,
      annualInterestRate: 4,
      tenureMonths: 12,
    }
  );

  console.log("=== Example 3: Full Payment vs EMI Comparison ===");
  console.log(`Full Payment: ₹${comparison.fullPayment.toLocaleString("en-IN")}`);
  console.log(`EMI (12 months @ 4%): ₹${comparison.emi.toLocaleString("en-IN")}`);
  console.log(`Extra Cost: ₹${comparison.extraCost.toLocaleString("en-IN")}`);
  console.log(`Cost Percentage: ${comparison.savingPercent.toFixed(2)}%`);
  console.log("================================================\n");

  return comparison;
};

// ============================================================================
// EXAMPLE 4: Eligibility Check
// ============================================================================

export const example4_EligibilityCheck = () => {
  const testAmounts = [5000, 10000, 25000, 100000];

  console.log("=== Example 4: EMI Eligibility Check ===");
  console.log(
    `Minimum fee for EMI: ₹${EMI_CONFIG.MIN_FEE_FOR_EMI.toLocaleString("en-IN")}\n`
  );

  testAmounts.forEach((amount) => {
    const eligible = isEMIEligible(amount, EMI_CONFIG.MIN_FEE_FOR_EMI);
    console.log(`Amount ₹${amount}: ${eligible ? "✓ Eligible" : "✗ Not Eligible"}`);
  });
  console.log("======================================\n");
};

// ============================================================================
// EXAMPLE 5: Late Payment Penalty Calculation
// ============================================================================

export const example5_LatePenaltyCalculation = () => {
  const emiAmount = 3000;
  const daysOverdue = 15; // 15 days late
  const penaltyPercent = EMI_CONFIG.LATE_PAYMENT_PENALTY_PERCENT;

  const penalty = calculateLatePenalty(emiAmount, daysOverdue, penaltyPercent);

  console.log("=== Example 5: Late Payment Penalty ===");
  console.log(`EMI Amount: ₹${emiAmount}`);
  console.log(`Days Overdue: ${daysOverdue} days`);
  console.log(`Penalty Rate: ${penaltyPercent}% per month`);
  console.log(`Calculated Penalty: ₹${penalty.toFixed(2)}`);
  console.log(`Total Amount Due: ₹${(emiAmount + penalty).toFixed(2)}`);
  console.log("=====================================\n");

  return penalty;
};

// ============================================================================
// EXAMPLE 6: Get Complete EMI Details with Validation
// ============================================================================

export const example6_CompleteEMIDetails = () => {
  const result = getEMIDetails({
    principal: 45000,
    annualInterestRate: 3.5,
    tenureMonths: 9,
  });

  console.log("=== Example 6: Complete EMI Details ===");
  if (result.valid) {
    console.log(`✓ Valid Parameters\n`);
    console.log(`Monthly EMI: ₹${result.monthlyEMI.toFixed(2)}`);
    console.log(`Total Interest: ₹${result.totalInterest.toFixed(2)}`);
    console.log(`Total Payable: ₹${result.totalPayable.toFixed(2)}`);
    console.log(`Schedule Generated: ${result.schedule.length} installments`);
  } else {
    console.log(`✗ Invalid Parameters`);
    result.errors.forEach((error) => console.log(`  - ${error}`));
  }
  console.log("====================================\n");

  return result;
};

// ============================================================================
// EXAMPLE 7: Different Tenure Options
// ============================================================================

export const example7_TenureComparison = () => {
  const principal = 30000;

  console.log("=== Example 7: Tenure Comparison for ₹30,000 ===");
  console.log(
    "Tenure | Interest | Monthly EMI | Total Interest | Total Payable"
  );
  console.log(
    "-------|----------|-------------|----------------|---------------"
  );

  EMI_CONFIG.TENURE_OPTIONS.forEach((option) => {
    const monthlyEMI = calculateEMI({
      principal,
      annualInterestRate: option.interestRate,
      tenureMonths: option.months,
    });

    const totalPayable = monthlyEMI * option.months;
    const totalInterest = totalPayable - principal;

    console.log(
      `${option.months.toString().padStart(6)} | ${option.interestRate.toString().padStart(8)}% | ₹${monthlyEMI.toFixed(2).padStart(9)} | ₹${totalInterest.toFixed(2).padStart(13)} | ₹${totalPayable.toFixed(2).padStart(13)}`
    );
  });
  console.log("==============================================\n");
};

// ============================================================================
// EXAMPLE 8: EMI Schedule with Payment Status Tracking
// ============================================================================

export const example8_PaymentStatusTracking = () => {
  const startDate = new Date(2026, 0, 1);
  const schedule = generateEMISchedule(
    {
      principal: 12000,
      annualInterestRate: 2,
      tenureMonths: 3,
    },
    startDate
  );

  // Simulate some payments
  const payments = [
    { installment: 1, paidDate: new Date(2026, 0, 5), amount: 4024 },
    // Note: Installment 2 is overdue (not paid)
    { installment: 3, paidDate: new Date(2026, 2, 5), amount: 4024 },
  ];

  let paidAmount = 0;
  const today = new Date(2026, 1, 20); // February 20, 2026

  console.log("=== Example 8: Payment Status Tracking ===");
  console.log("EMI# | Due Date | Status | Paid Amount | Balance");
  console.log("-----|----------|--------|-------------|----------");

  schedule.forEach((item) => {
    const payment = payments.find((p) => p.installment === item.emiNumber);
    const isPaid = !!payment;
    const isOverdue = item.dueDate < today && !isPaid;

    const dueDate = item.dueDate.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });

    const status = isPaid ? "Paid" : isOverdue ? "Overdue" : "Pending";

    console.log(
      `${item.emiNumber} | ${dueDate} | ${status.padEnd(6)} | ₹${(payment?.amount || 0).toLocaleString("en-IN").padStart(10)} | ₹${((item.emiAmount - (payment?.amount || 0)) > 0 ? (item.emiAmount - (payment?.amount || 0)).toFixed(2) : 0).padStart(7)}`
    );

    if (isPaid) paidAmount += payment.amount;
  });

  console.log(`\nTotal Paid: ₹${paidAmount.toFixed(2)}`);
  console.log(
    `Remaining: ₹${(schedule.reduce((sum, item) => sum + item.emiAmount, 0) - paidAmount).toFixed(2)}`
  );
  console.log("======================================\n");
};

// ============================================================================
// TEST SUITE: Run all examples
// ============================================================================

export const runAllExamples = () => {
  console.log("\n");
  console.log(
    "╔═══════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║           EMI IMPLEMENTATION - EXAMPLES & TEST CASES          ║"
  );
  console.log(
    "╚═══════════════════════════════════════════════════════════════╝"
  );
  console.log("\n");

  example1_BasicCalculation();
  example2_CompleteSchedule();
  example3_ComparePaymentOptions();
  example4_EligibilityCheck();
  example5_LatePenaltyCalculation();
  example6_CompleteEMIDetails();
  example7_TenureComparison();
  example8_PaymentStatusTracking();

  console.log(
    "╔═══════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║                    ALL TESTS COMPLETED                        ║"
  );
  console.log(
    "╚═══════════════════════════════════════════════════════════════╝"
  );
};

// ============================================================================
// REAL-WORLD SCENARIO
// ============================================================================

export const realWorldScenario_SchoolFeesEMI = () => {
  /**
   * Scenario: A school has implemented EMI for annual fees
   * 
   * Student: Arjun Sharma
   * Class: 10-A
   * Academic Year: 2025-26
   * Total Annual Fees: ₹60,000
   * 
   * Fee Breakdown:
   * - Tuition: ₹30,000
   * - Transport: ₹15,000
   * - Activity: ₹8,000
   * - Lab: ₹4,000
   * - Others: ₹3,000
   */

  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║         REAL-WORLD SCENARIO: School Fees with EMI         ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const totalFees = 60000;

  console.log("Student: Arjun Sharma (Class: 10-A)");
  console.log(`Total Annual Fees: ₹${totalFees.toLocaleString("en-IN")}\n`);

  console.log("--- OPTION 1: Full Payment ---");
  console.log(`Amount: ₹${totalFees.toLocaleString("en-IN")}`);
  console.log(`Interest: ₹0`);
  console.log("Benefits: No extra cost\n");

  const emiOptions = [3, 6, 9, 12];

  console.log("--- OPTION 2: EMI Payment Options ---\n");

  emiOptions.forEach((months) => {
    const option = EMI_CONFIG.TENURE_OPTIONS.find((o) => o.months === months);
    if (!option) return;

    const monthlyEMI = calculateEMI({
      principal: totalFees,
      annualInterestRate: option.interestRate,
      tenureMonths: months,
    });

    const totalPayable = monthlyEMI * months;
    const totalInterest = totalPayable - totalFees;
    const extraCost = ((totalInterest / totalFees) * 100).toFixed(2);

    console.log(`${months} Months @ ${option.interestRate}% Interest:`);
    console.log(`  Monthly: ₹${monthlyEMI.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`);
    console.log(`  Interest: ₹${totalInterest.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`);
    console.log(`  Total: ₹${totalPayable.toLocaleString("en-IN", { maximumFractionDigits: 2 })} (${extraCost}% extra)\n`);
  });

  // Scenario: Student chose 12-month EMI
  console.log("--- STUDENT CHOICE: 12-Month EMI ---");
  const schedule = generateEMISchedule(
    {
      principal: totalFees,
      annualInterestRate: 4,
      tenureMonths: 12,
    },
    new Date(2025, 3, 1) // April 1, 2025
  );

  console.log(`✓ EMI Plan Activated`);
  console.log(`✓ Schedule Generated: ${schedule.length} installments`);
  console.log(
    `✓ First Payment Due: ${schedule[0].dueDate.toLocaleDateString("en-IN")}`
  );
  console.log(
    `✓ Last Payment Due: ${schedule[schedule.length - 1].dueDate.toLocaleDateString("en-IN")}`
  );

  // Scenario: Late payment in 3rd EMI
  console.log("\n--- SCENARIO: Late Payment in 3rd EMI ---");
  const thirdEMI = schedule[2];
  const latePenalty = calculateLatePenalty(
    thirdEMI.emiAmount,
    45, // 45 days overdue
    EMI_CONFIG.LATE_PAYMENT_PENALTY_PERCENT
  );

  console.log(`EMI #3 Amount: ₹${thirdEMI.emiAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`);
  console.log(
    `Due Date: ${thirdEMI.dueDate.toLocaleDateString("en-IN")}`
  );
  console.log(`Days Overdue: 45 days`);
  console.log(`Penalty (1% per month): ₹${latePenalty.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`);
  console.log(
    `Total Amount Now Due: ₹${(thirdEMI.emiAmount + latePenalty).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
  );

  console.log(
    "\n╚════════════════════════════════════════════════════════════╝\n"
  );
};

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

export default {
  example1_BasicCalculation,
  example2_CompleteSchedule,
  example3_ComparePaymentOptions,
  example4_EligibilityCheck,
  example5_LatePenaltyCalculation,
  example6_CompleteEMIDetails,
  example7_TenureComparison,
  example8_PaymentStatusTracking,
  runAllExamples,
  realWorldScenario_SchoolFeesEMI,
};
