/**
 * EMI Payment Selector Component
 *
 * Allows students/parents to select between full payment and EMI options
 * with tenure and interest rate display
 */

import { useState, useMemo } from "react";
import { Radio } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { EMI_CONFIG, PAYMENT_PLAN_TYPES } from "@/config/emiConfig";
import {
  calculateEMI,
  calculateTotalInterest,
  calculateTotalPayable,
  validateEMIParams,
} from "@/lib/emiCalculations";

interface EMIPaymentSelectorProps {
  feeAmount: number;
  onPaymentOptionSelected: (option: {
    paymentPlan: string;
    tenureMonths?: number;
    interestRate?: number;
    monthlyEMI?: number;
    totalInterest?: number;
  }) => void;
  disabled?: boolean;
}

export const EMIPaymentSelector = ({
  feeAmount,
  onPaymentOptionSelected,
  disabled = false,
}: EMIPaymentSelectorProps) => {
  const [paymentOption, setPaymentOption] = useState<string>("Full Payment");
  const [selectedTenure, setSelectedTenure] = useState<string>(
    EMI_CONFIG.TENURE_OPTIONS[0].months.toString()
  );
  const [showEMIDetails, setShowEMIDetails] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isEMIEligible = useMemo(() => {
    return feeAmount >= EMI_CONFIG.MIN_FEE_FOR_EMI;
  }, [feeAmount]);

  const emiDetails = useMemo(() => {
    if (paymentOption !== "EMI" || !selectedTenure) return null;

    const tenureMonths = parseInt(selectedTenure);
    const tenureOption = EMI_CONFIG.TENURE_OPTIONS.find(
      (o) => o.months === tenureMonths
    );

    if (!tenureOption) return null;

    const params = {
      principal: feeAmount,
      annualInterestRate: tenureOption.interestRate,
      tenureMonths: tenureMonths,
    };

    const errors = validateEMIParams(params);
    if (errors.length > 0) return null;

    const monthlyEMI = calculateEMI(params);
    const totalInterest = calculateTotalInterest(params);
    const totalPayable = calculateTotalPayable(params);

    return {
      monthlyEMI,
      totalInterest,
      totalPayable,
      tenure: tenureMonths,
      interestRate: tenureOption.interestRate,
    };
  }, [paymentOption, selectedTenure, feeAmount]);

  const handlePaymentOptionChange = (option: string) => {
    setPaymentOption(option);
    if (option === "Full Payment") {
      onPaymentOptionSelected({
        paymentPlan: PAYMENT_PLAN_TYPES.FULL_PAYMENT,
      });
    }
  };

  const handleConfirmEMI = () => {
    if (emiDetails) {
      onPaymentOptionSelected({
        paymentPlan: PAYMENT_PLAN_TYPES.EMI,
        tenureMonths: emiDetails.tenure,
        interestRate: emiDetails.interestRate,
        monthlyEMI: emiDetails.monthlyEMI,
        totalInterest: emiDetails.totalInterest,
      });
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {/* Full Payment Option */}
        <Card
          className={`cursor-pointer transition-colors ${
            paymentOption === "Full Payment"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => !disabled && handlePaymentOptionChange("Full Payment")}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  paymentOption === "Full Payment"
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300"
                }`}
              >
                {paymentOption === "Full Payment" && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Full Payment</p>
                <p className="text-sm text-muted-foreground">
                  Pay the complete fee now
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-foreground">
                  ₹{feeAmount.toLocaleString("en-IN")}
                </p>
                <p className="text-sm text-green-600 font-medium">
                  No Interest
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EMI Option */}
        <Card
          className={`cursor-pointer transition-colors ${
            paymentOption === "EMI"
              ? "border-blue-500 bg-blue-50"
              : isEMIEligible
              ? "border-gray-200 hover:border-gray-300"
              : "border-gray-200 opacity-50 cursor-not-allowed"
          }`}
          onClick={() =>
            isEMIEligible && !disabled && handlePaymentOptionChange("EMI")
          }
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  paymentOption === "EMI"
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300"
                }`}
              >
                {paymentOption === "EMI" && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">
                    Equated Monthly Installment
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    Pay in parts
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Spread your payment across months
                </p>
              </div>
            </div>

            {/* EMI Tenure Selection */}
            {paymentOption === "EMI" && isEMIEligible && (
              <div className="mt-4 ml-7 space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Select Tenure:
                  </label>
                  <Select
                    value={selectedTenure}
                    onValueChange={setSelectedTenure}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMI_CONFIG.TENURE_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.months}
                          value={option.months.toString()}
                        >
                          {option.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* EMI Preview */}
                {emiDetails && (
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Monthly EMI:
                      </span>
                      <span className="font-semibold text-foreground">
                        ₹
                        {emiDetails.monthlyEMI.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Total Interest:
                      </span>
                      <span className="font-semibold text-amber-600">
                        ₹
                        {emiDetails.totalInterest.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">
                        Total Payable:
                      </span>
                      <span className="font-bold text-lg text-foreground">
                        ₹
                        {emiDetails.totalPayable.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowEMIDetails(!showEMIDetails)}
                >
                  {showEMIDetails ? "Hide" : "View"} EMI Schedule
                </Button>

                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!emiDetails}
                >
                  Proceed with EMI
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Eligibility Alert */}
        {paymentOption === "EMI" && !isEMIEligible && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertDescription className="text-amber-800">
              <strong>EMI not available:</strong> Minimum fee amount for EMI is
              ₹{EMI_CONFIG.MIN_FEE_FOR_EMI.toLocaleString("en-IN")} (Current: ₹
              {feeAmount.toLocaleString("en-IN")})
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* EMI Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm EMI Payment</DialogTitle>
            <DialogDescription>
              Please review the EMI terms before proceeding
            </DialogDescription>
          </DialogHeader>

          {emiDetails && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Original Amount
                    </p>
                    <p className="font-semibold">
                      ₹{feeAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Interest Rate
                    </p>
                    <p className="font-semibold">
                      {emiDetails.interestRate}% p.a.
                    </p>
                  </div>
                </div>

                <div className="border-t pt-3 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tenure</p>
                    <p className="font-semibold">{emiDetails.tenure} Months</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly EMI</p>
                    <p className="font-semibold">
                      ₹
                      {emiDetails.monthlyEMI.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Interest
                  </p>
                  <p className="text-lg font-bold text-amber-600">
                    ₹
                    {emiDetails.totalInterest.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div className="border-t pt-3 bg-blue-50 p-2 rounded">
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Amount to Pay
                  </p>
                  <p className="text-xl font-bold text-blue-600">
                    ₹
                    {emiDetails.totalPayable.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              <Alert>
                <AlertDescription className="text-sm">
                  By confirming, you agree to pay the EMI as per the schedule.
                  Late payments may attract penalties.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmEMI}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirm EMI
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EMIPaymentSelector;
