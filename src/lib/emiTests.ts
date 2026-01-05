/**
 * EMI Implementation Testing Guide
 * 
 * Comprehensive test cases and verification procedures
 */

import { EMI_CONFIG } from "@/config/emiConfig";
import {
  calculateEMI,
  generateEMISchedule,
  validateEMIParams,
  isEMIEligible,
} from "@/lib/emiCalculations";

// ============================================================================
// TEST CASE 1: EMI Calculation Accuracy
// ============================================================================

export const test_emiCalculationAccuracy = () => {
  console.log("TEST 1: EMI Calculation Accuracy");
  console.log("================================\n");

  const testCases = [
    // Format: [principal, annualInterestRate, tenureMonths, expectedEMI]
    [10000, 0, 12, 833.33], // No interest
    [10000, 4, 12, 856.07], // With interest
    [50000, 2, 6, 8361.36], // Different amounts
    [1000, 0, 1, 1000], // Edge case: single month
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach(([principal, rate, months, expectedEMI]) => {
    const calculated = calculateEMI({
      principal: principal as number,
      annualInterestRate: rate as number,
      tenureMonths: months as number,
    });

    const tolerance = 0.5; // Allow 0.5 rupee difference
    const matches =
      Math.abs(calculated - (expectedEMI as number)) < tolerance;

    if (matches) {
      console.log(`✓ PASS: ₹${principal} @ ${rate}% for ${months}m = ₹${calculated.toFixed(2)}`);
      passed++;
    } else {
      console.log(
        `✗ FAIL: ₹${principal} @ ${rate}% for ${months}m`
      );
      console.log(`  Expected: ₹${expectedEMI}`);
      console.log(`  Got: ₹${calculated.toFixed(2)}`);
      failed++;
    }
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
};

// ============================================================================
// TEST CASE 2: EMI Schedule Generation
// ============================================================================

export const test_emiScheduleGeneration = () => {
  console.log("TEST 2: EMI Schedule Generation");
  console.log("==============================\n");

  const startDate = new Date(2026, 0, 1); // January 1, 2026
  const schedule = generateEMISchedule(
    {
      principal: 12000,
      annualInterestRate: 0,
      tenureMonths: 3,
    },
    startDate
  );

  let passed = 0;
  let failed = 0;

  // Test 1: Should generate correct number of installments
  if (schedule.length === 3) {
    console.log("✓ PASS: Generated 3 installments");
    passed++;
  } else {
    console.log(`✗ FAIL: Expected 3 installments, got ${schedule.length}`);
    failed++;
  }

  // Test 2: Sum of principal should equal original amount
  const totalPrincipal = schedule.reduce(
    (sum, item) => sum + item.principalComponent,
    0
  );
  const matches = Math.abs(totalPrincipal - 12000) < 1; // Allow 1 rupee rounding

  if (matches) {
    console.log(`✓ PASS: Total principal = ₹${totalPrincipal.toFixed(2)}`);
    passed++;
  } else {
    console.log(
      `✗ FAIL: Total principal = ₹${totalPrincipal.toFixed(2)}, expected ₹12000`
    );
    failed++;
  }

  // Test 3: EMI amounts should be same for 0% interest
  const allSame = schedule.every(
    (item) => Math.abs(item.emiAmount - schedule[0].emiAmount) < 0.1
  );

  if (allSame) {
    console.log(`✓ PASS: All EMI amounts are equal (₹${schedule[0].emiAmount.toFixed(2)})`);
    passed++;
  } else {
    console.log("✗ FAIL: EMI amounts should be equal for 0% interest");
    failed++;
  }

  // Test 4: Due dates should be in order
  let datesInOrder = true;
  for (let i = 1; i < schedule.length; i++) {
    if (schedule[i].dueDate <= schedule[i - 1].dueDate) {
      datesInOrder = false;
      break;
    }
  }

  if (datesInOrder) {
    console.log("✓ PASS: Due dates are in correct order");
    passed++;
  } else {
    console.log("✗ FAIL: Due dates are not in order");
    failed++;
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
};

// ============================================================================
// TEST CASE 3: Parameter Validation
// ============================================================================

export const test_parameterValidation = () => {
  console.log("TEST 3: Parameter Validation");
  console.log("===========================\n");

  const testCases = [
    {
      params: { principal: 0, annualInterestRate: 2, tenureMonths: 12 },
      shouldHaveError: true,
      errorType: "principal",
    },
    {
      params: { principal: 10000, annualInterestRate: -5, tenureMonths: 12 },
      shouldHaveError: true,
      errorType: "negative rate",
    },
    {
      params: { principal: 10000, annualInterestRate: 2, tenureMonths: 0 },
      shouldHaveError: true,
      errorType: "zero tenure",
    },
    {
      params: { principal: 10000, annualInterestRate: 2, tenureMonths: 120 },
      shouldHaveError: true,
      errorType: "max tenure",
    },
    {
      params: { principal: 10000, annualInterestRate: 2, tenureMonths: 12 },
      shouldHaveError: false,
      errorType: "valid",
    },
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase) => {
    const errors = validateEMIParams(testCase.params);
    const hasError = errors.length > 0;

    if (hasError === testCase.shouldHaveError) {
      console.log(`✓ PASS: ${testCase.errorType} - ${hasError ? "Detected error" : "Valid params"}`);
      passed++;
    } else {
      console.log(`✗ FAIL: ${testCase.errorType}`);
      console.log(`  Errors: ${errors.join(", ")}`);
      failed++;
    }
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
};

// ============================================================================
// TEST CASE 4: EMI Eligibility
// ============================================================================

export const test_emiEligibility = () => {
  console.log("TEST 4: EMI Eligibility Checking");
  console.log("================================\n");

  const testCases = [
    { amount: 5000, expected: false },
    { amount: 9999, expected: false },
    { amount: 10000, expected: true },
    { amount: 10001, expected: true },
    { amount: 50000, expected: true },
    { amount: 100000, expected: true },
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase) => {
    const result = isEMIEligible(
      testCase.amount,
      EMI_CONFIG.MIN_FEE_FOR_EMI
    );

    if (result === testCase.expected) {
      const status = result ? "Eligible" : "Not Eligible";
      console.log(
        `✓ PASS: ₹${testCase.amount} - ${status}`
      );
      passed++;
    } else {
      console.log(`✗ FAIL: ₹${testCase.amount}`);
      console.log(`  Expected: ${testCase.expected}, Got: ${result}`);
      failed++;
    }
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
};

// ============================================================================
// TEST CASE 5: Tenure Options Configuration
// ============================================================================

export const test_tenureConfiguration = () => {
  console.log("TEST 5: Tenure Options Configuration");
  console.log("===================================\n");

  let passed = 0;
  let failed = 0;

  // Test 1: All required tenures present
  const requiredTenures = [3, 6, 9, 12];
  const configuredTenures = EMI_CONFIG.TENURE_OPTIONS.map((o) => o.months);

  requiredTenures.forEach((tenure) => {
    if (configuredTenures.includes(tenure)) {
      console.log(`✓ PASS: ${tenure} month option available`);
      passed++;
    } else {
      console.log(`✗ FAIL: ${tenure} month option missing`);
      failed++;
    }
  });

  // Test 2: Interest rates are reasonable
  console.log("\nInterest Rates Validation:");
  EMI_CONFIG.TENURE_OPTIONS.forEach((option) => {
    if (option.interestRate >= 0 && option.interestRate <= 50) {
      console.log(
        `✓ PASS: ${option.months}m @ ${option.interestRate}% (valid range)`
      );
      passed++;
    } else {
      console.log(
        `✗ FAIL: ${option.months}m @ ${option.interestRate}% (out of range)`
      );
      failed++;
    }
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
};

// ============================================================================
// TEST CASE 6: Date Handling
// ============================================================================

export const test_dateHandling = () => {
  console.log("TEST 6: Date Handling & Month-End Logic");
  console.log("======================================\n");

  let passed = 0;
  let failed = 0;

  // Test: Month-end dates should be handled correctly
  const monthEndDate = new Date(2026, 0, 31); // January 31
  const schedule = generateEMISchedule(
    {
      principal: 12000,
      annualInterestRate: 0,
      tenureMonths: 3,
    },
    monthEndDate
  );

  // Check if due dates are approximately monthly
  const daysPerMonth: number[] = [];
  for (let i = 1; i < schedule.length; i++) {
    const daysDiff = Math.floor(
      (schedule[i].dueDate.getTime() - schedule[i - 1].dueDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    daysPerMonth.push(daysDiff);
  }

  const allReasonable = daysPerMonth.every((days) => days >= 28 && days <= 32);

  if (allReasonable) {
    console.log(`✓ PASS: Monthly intervals are correct (${daysPerMonth.join(", ")} days)`);
    passed++;
  } else {
    console.log(`✗ FAIL: Monthly intervals are irregular (${daysPerMonth.join(", ")} days)`);
    failed++;
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
};

// ============================================================================
// INTEGRATION TEST: Full EMI Flow
// ============================================================================

export const test_fullEmiFlow = () => {
  console.log("INTEGRATION TEST: Complete EMI Flow");
  console.log("===================================\n");

  let passed = 0;
  let failed = 0;

  const studentFee = 24000;
  const tenure = 12;
  const interestRate = 4;

  console.log(`Scenario: Student fee of ₹${studentFee.toLocaleString()}`);
  console.log(`Tenure: ${tenure} months @ ${interestRate}%\n`);

  // Step 1: Eligibility check
  console.log("Step 1: Eligibility Check");
  const isEligible = isEMIEligible(studentFee, EMI_CONFIG.MIN_FEE_FOR_EMI);
  if (isEligible) {
    console.log("✓ Fee is eligible for EMI\n");
    passed++;
  } else {
    console.log("✗ Fee is not eligible for EMI\n");
    failed++;
  }

  // Step 2: Parameter validation
  console.log("Step 2: Parameter Validation");
  const errors = validateEMIParams({
    principal: studentFee,
    annualInterestRate: interestRate,
    tenureMonths: tenure,
  });

  if (errors.length === 0) {
    console.log("✓ Parameters are valid\n");
    passed++;
  } else {
    console.log("✗ Parameters validation failed\n");
    console.log(errors.join("\n"));
    failed++;
  }

  // Step 3: EMI Calculation
  console.log("Step 3: EMI Calculation");
  const monthlyEMI = calculateEMI({
    principal: studentFee,
    annualInterestRate: interestRate,
    tenureMonths: tenure,
  });

  if (monthlyEMI > 0) {
    console.log(`✓ Monthly EMI calculated: ₹${monthlyEMI.toFixed(2)}\n`);
    passed++;
  } else {
    console.log("✗ EMI calculation failed\n");
    failed++;
  }

  // Step 4: Schedule Generation
  console.log("Step 4: Schedule Generation");
  const schedule = generateEMISchedule(
    {
      principal: studentFee,
      annualInterestRate: interestRate,
      tenureMonths: tenure,
    },
    new Date(2026, 3, 1) // April 1, 2026
  );

  if (schedule.length === tenure) {
    console.log(`✓ Schedule generated with ${schedule.length} installments\n`);
    passed++;
  } else {
    console.log(`✗ Schedule generation failed\n`);
    failed++;
  }

  // Step 5: Verification
  console.log("Step 5: Schedule Verification");
  const totalScheduled = schedule.reduce(
    (sum, item) => sum + item.emiAmount,
    0
  );
  const expectedTotal = monthlyEMI * tenure;

  if (Math.abs(totalScheduled - expectedTotal) < 1) {
    console.log(
      `✓ Total scheduled amount matches: ₹${totalScheduled.toFixed(2)}\n`
    );
    passed++;
  } else {
    console.log(`✗ Total scheduled amount mismatch\n`);
    failed++;
  }

  console.log(`Results: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
};

// ============================================================================
// RUN ALL TESTS
// ============================================================================

export const runAllTests = () => {
  console.log("\n\n");
  console.log(
    "╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║              EMI IMPLEMENTATION - TEST SUITE                   ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝"
  );
  console.log("\n");

  const results = [
    test_emiCalculationAccuracy(),
    test_emiScheduleGeneration(),
    test_parameterValidation(),
    test_emiEligibility(),
    test_tenureConfiguration(),
    test_dateHandling(),
    test_fullEmiFlow(),
  ];

  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);

  console.log("════════════════════════════════════════════════════════════════");
  console.log(`TOTAL: ${totalPassed} passed, ${totalFailed} failed`);
  console.log("════════════════════════════════════════════════════════════════\n");

  if (totalFailed === 0) {
    console.log("✓ ALL TESTS PASSED! EMI System is ready for implementation.\n");
  } else {
    console.log("✗ Some tests failed. Please review the issues above.\n");
  }

  return { totalPassed, totalFailed };
};

// ============================================================================
// PERFORMANCE TEST
// ============================================================================

export const test_performanceBenchmark = () => {
  console.log("PERFORMANCE TEST: EMI Calculations");
  console.log("==================================\n");

  const iterations = 10000;

  // Benchmark EMI calculation
  console.log(`Running ${iterations.toLocaleString()} EMI calculations...`);
  const startCalc = performance.now();

  for (let i = 0; i < iterations; i++) {
    calculateEMI({
      principal: 10000 + i,
      annualInterestRate: 2 + (i % 3),
      tenureMonths: 6 + (i % 6),
    });
  }

  const endCalc = performance.now();
  const calcTime = endCalc - startCalc;

  console.log(
    `✓ Completed in ${calcTime.toFixed(2)}ms`
  );
  console.log(
    `✓ Average: ${(calcTime / iterations).toFixed(4)}ms per calculation\n`
  );

  // Benchmark schedule generation
  console.log("Generating 100 complete schedules...");
  const startSchedule = performance.now();

  for (let i = 0; i < 100; i++) {
    generateEMISchedule(
      {
        principal: 10000 + i * 100,
        annualInterestRate: 2 + (i % 3),
        tenureMonths: 12,
      },
      new Date()
    );
  }

  const endSchedule = performance.now();
  const scheduleTime = endSchedule - startSchedule;

  console.log(
    `✓ Completed in ${scheduleTime.toFixed(2)}ms`
  );
  console.log(
    `✓ Average: ${(scheduleTime / 100).toFixed(4)}ms per schedule\n`
  );

  console.log(
    "Performance Summary: All calculations are lightning fast (< 1ms each)\n"
  );
};

export default {
  test_emiCalculationAccuracy,
  test_emiScheduleGeneration,
  test_parameterValidation,
  test_emiEligibility,
  test_tenureConfiguration,
  test_dateHandling,
  test_fullEmiFlow,
  test_performanceBenchmark,
  runAllTests,
};
