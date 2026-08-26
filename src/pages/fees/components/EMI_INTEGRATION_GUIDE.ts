/**
 * EMI Integration Guide for FeeCollectPage
 * 
 * This file shows how to integrate EMI payment option into the existing
 * FeeCollectPage component
 */

/**
 * STEP 1: Update imports in FeeCollectPage.tsx
 * 
 * Add these imports:
 */

// import { EMIPaymentSelector } from "./EMIPaymentSelector";
// import { EMIScheduleViewer } from "./EMIScheduleViewer";
// import { isAmountEligibleForEMI } from "@/config/emiConfig";
// import { generateEMISchedule } from "@/lib/emiCalculations";

/**
 * STEP 2: Add state variables to FeeCollectPage component
 */

// Add these state variables in the FeeCollectPage component:

/*
const [paymentPlan, setPaymentPlan] = useState<"Full Payment" | "EMI" | null>(null);
const [emiTenure, setEmiTenure] = useState<number | null>(null);
const [emiInterestRate, setEmiInterestRate] = useState<number | null>(null);
const [emiMonthlyAmount, setEmiMonthlyAmount] = useState<number | null>(null);
const [emiTotalInterest, setEmiTotalInterest] = useState<number | null>(null);
const [showEmiSchedule, setShowEmiSchedule] = useState(false);
*/

/**
 * STEP 3: Create handler for payment option selection
 */

/*
const handlePaymentOptionSelected = (option: {
  paymentPlan: string;
  tenureMonths?: number;
  interestRate?: number;
  monthlyEMI?: number;
  totalInterest?: number;
}) => {
  setPaymentPlan(option.paymentPlan as "Full Payment" | "EMI");
  
  if (option.paymentPlan === "EMI") {
    setEmiTenure(option.tenureMonths || null);
    setEmiInterestRate(option.interestRate || null);
    setEmiMonthlyAmount(option.monthlyEMI || null);
    setEmiTotalInterest(option.totalInterest || null);
    setShowEmiSchedule(true);
  } else {
    // Reset EMI fields for full payment
    setEmiTenure(null);
    setEmiInterestRate(null);
    setEmiMonthlyAmount(null);
    setEmiTotalInterest(null);
    setShowEmiSchedule(false);
  }
};
*/

/**
 * STEP 4: Add EMI payment selector to the UI
 * 
 * Add this in the payment dialog, after student selection and before fee selection:
 */

/*
{selectedStudent && (
  <>
    <Separator className="my-4" />
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">Payment Plan</h3>
      <EMIPaymentSelector
        feeAmount={total}
        onPaymentOptionSelected={handlePaymentOptionSelected}
      />
    </div>
  </>
)}
*/

/**
 * STEP 5: Show EMI schedule if selected
 */

/*
{showEmiSchedule && selectedStudent && emiTenure && emiInterestRate && (
  <>
    <Separator className="my-4" />
    <EMIScheduleViewer
      feeAmount={total}
      tenureMonths={emiTenure}
      interestRate={emiInterestRate}
      startDate={new Date()}
      studentName={selectedStudent.name}
      studentId={selectedStudent.id}
    />
  </>
)}
*/

/**
 * STEP 6: Update payment processing logic
 */

/*
const handleProcessPayment = async () => {
  if (!selectedStudent) return;

  try {
    // Create payment record
    const paymentData = {
      student_id: selectedStudent.id,
      student_fee_id: selectedFees[0], // Would need proper fee ID
      payment_date: new Date().toISOString(),
      amount: paymentPlan === "EMI" ? emiMonthlyAmount : total,
      payment_mode: paymentMethod,
      payment_option: paymentPlan || "Full Payment",
      transaction_id: transactionId || null,
      cheque_number: chequeNumber || null,
      remarks: null,
    };

    // If EMI, also create EMI schedule
    if (paymentPlan === "EMI" && emiTenure && emiInterestRate) {
      const emiSchedule = generateEMISchedule(
        {
          principal: total,
          annualInterestRate: emiInterestRate,
          tenureMonths: emiTenure,
        },
        new Date()
      );

      // Save EMI schedule to database
      // await createEMISchedule(emiSchedule);
    }

    // Save payment record
    // const { error } = await supabase
    //   .from(`fee_payments_${INDEX_TOKEN}`)
    //   .insert([paymentData]);

    toast({
      title: "Payment processed successfully",
      description: paymentPlan === "EMI" 
        ? `EMI schedule created. First payment: ₹${emiMonthlyAmount}`
        : `Receipt generated for ₹${total.toLocaleString()}`,
    });

    setIsConfirmOpen(false);
    setIsReceiptOpen(true);
  } catch (error) {
    toast({
      title: "Payment failed",
      description: "Please try again",
      variant: "destructive",
    });
  }
};
*/

/**
 * STEP 7: Update receipt to show EMI details
 */

/*
{paymentPlan === "EMI" && (
  <div className="bg-blue-50 p-4 rounded-lg space-y-2 mt-4">
    <h4 className="font-semibold text-foreground">EMI Details</h4>
    <div className="text-sm space-y-1">
      <div className="flex justify-between">
        <span>Tenure:</span>
        <span className="font-semibold">{emiTenure} months</span>
      </div>
      <div className="flex justify-between">
        <span>Monthly Amount:</span>
        <span className="font-semibold">₹{emiMonthlyAmount?.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span>Total Interest:</span>
        <span className="font-semibold">₹{emiTotalInterest?.toLocaleString()}</span>
      </div>
      <div className="border-t pt-1 mt-1 flex justify-between font-semibold">
        <span>Total Amount:</span>
        <span>₹{((emiMonthlyAmount || 0) * (emiTenure || 0)).toLocaleString()}</span>
      </div>
    </div>
  </div>
)}
*/

/**
 * COMPLETE INTEGRATION EXAMPLE
 * 
 * Here's how it would look in the actual FeeCollectPage:
 */

// import { useState } from "react";
// import { EMIPaymentSelector } from "./EMIPaymentSelector";
// import { EMIScheduleViewer } from "./EMIScheduleViewer";
// import { isAmountEligibleForEMI } from "@/config/emiConfig";

// export const FeeCollectPage = () => {
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [selectedFees, setSelectedFees] = useState<number[]>([]);
//   const [paymentMethod, setPaymentMethod] = useState("cash");
//   const [paymentPlan, setPaymentPlan] = useState<"Full Payment" | "EMI" | null>(null);
//   const [emiTenure, setEmiTenure] = useState<number | null>(null);
//   const [emiInterestRate, setEmiInterestRate] = useState<number | null>(null);
//   const [emiMonthlyAmount, setEmiMonthlyAmount] = useState<number | null>(null);
//   const [emiTotalInterest, setEmiTotalInterest] = useState<number | null>(null);

//   const selectedFeeItems = demoFeeComponents.filter(f => selectedFees.includes(f.id));
//   const subtotal = selectedFeeItems.reduce((acc, f) => acc + f.amount, 0);
//   const discount = discountPercent ? (subtotal * parseFloat(discountPercent)) / 100 : 0;
//   const total = subtotal - discount;

//   const handlePaymentOptionSelected = (option: {
//     paymentPlan: string;
//     tenureMonths?: number;
//     interestRate?: number;
//     monthlyEMI?: number;
//     totalInterest?: number;
//   }) => {
//     setPaymentPlan(option.paymentPlan as "Full Payment" | "EMI");
//     if (option.paymentPlan === "EMI") {
//       setEmiTenure(option.tenureMonths || null);
//       setEmiInterestRate(option.interestRate || null);
//       setEmiMonthlyAmount(option.monthlyEMI || null);
//       setEmiTotalInterest(option.totalInterest || null);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* ... existing student and fee selection code ... */}

//       {/* Payment Plan Selection */}
//       {selectedStudent && total > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Select Payment Plan</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <EMIPaymentSelector
//               feeAmount={total}
//               onPaymentOptionSelected={handlePaymentOptionSelected}
//             />
//           </CardContent>
//         </Card>
//       )}

//       {/* EMI Schedule Preview */}
//       {paymentPlan === "EMI" && emiTenure && emiInterestRate && selectedStudent && (
//         <EMIScheduleViewer
//           feeAmount={total}
//           tenureMonths={emiTenure}
//           interestRate={emiInterestRate}
//           studentName={selectedStudent.name}
//           studentId={selectedStudent.id}
//         />
//       )}

//       {/* ... rest of the component ... */}
//     </div>
//   );
// };

export default {};
