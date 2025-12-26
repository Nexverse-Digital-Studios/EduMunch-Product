import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, IndianRupee, Receipt, User, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import {
  StudentFeeDB,
  FeePaymentDB,
  PAYMENT_MODES,
  FEE_STATUSES,
} from "./types";

const INDEX_TOKEN = "1emaet";

interface StudentDB {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  class_id: string;
}

interface ClassDB {
  id: string;
  class_name: string;
}

export function FeeCollectionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canUpdate } = useModulePermissions("fees");

  const [paymentData, setPaymentData] = useState({
    amount: "",
    payment_mode: "",
    transaction_id: "",
    cheque_number: "",
    cheque_date: "",
    bank_name: "",
    remarks: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: studentFees, isLoading: loadingFee } =
    useSupabaseTable<StudentFeeDB>(`student_fees_${INDEX_TOKEN}`, {
      filters: { id },
    });

  const { data: students } = useSupabaseTable<StudentDB>(
    `students_${INDEX_TOKEN}`
  );
  const { data: classes } = useSupabaseTable<ClassDB>(`classes_${INDEX_TOKEN}`);

  const { data: payments } = useSupabaseTable<FeePaymentDB>(
    `fee_payments_${INDEX_TOKEN}`,
    {
      filters: { student_fee_id: id },
      orderBy: { column: "payment_date", ascending: false },
    }
  );

  const { createMutation: createPayment } = useSupabaseTable<FeePaymentDB>(
    `fee_payments_${INDEX_TOKEN}`
  );

  const { updateMutation: updateStudentFee } = useSupabaseTable<StudentFeeDB>(
    `student_fees_${INDEX_TOKEN}`
  );

  const studentFee = studentFees?.[0];
  const student = students?.find((s) => s.id === studentFee?.student_id);
  const studentClass = classes?.find((c) => c.id === student?.class_id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const generateReceiptNumber = () => {
    const date = new Date();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `RCP${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${random}`;
  };

  const handlePaymentSubmit = async () => {
    if (!studentFee || !paymentData.amount || !paymentData.payment_mode) {
      toast({
        title: "Validation Error",
        description: "Please fill in required fields.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(paymentData.amount);
    if (amount <= 0 || amount > studentFee.balance_amount) {
      toast({
        title: "Invalid Amount",
        description: `Amount should be between 1 and ${formatCurrency(
          studentFee.balance_amount
        )}`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create payment record
      await createPayment.mutateAsync({
        student_fee_id: studentFee.id,
        student_id: studentFee.student_id,
        receipt_number: generateReceiptNumber(),
        payment_date: new Date().toISOString().split("T")[0],
        amount: amount,
        payment_mode: paymentData.payment_mode as FeePaymentDB["payment_mode"],
        transaction_id: paymentData.transaction_id || null,
        cheque_number: paymentData.cheque_number || null,
        cheque_date: paymentData.cheque_date || null,
        bank_name: paymentData.bank_name || null,
        remarks: paymentData.remarks || null,
      });

      // Update student fee record
      const newPaidAmount = studentFee.paid_amount + amount;
      const newBalanceAmount = studentFee.net_amount - newPaidAmount;
      const newStatus = newBalanceAmount <= 0 ? "paid" : "partial";

      await updateStudentFee.mutateAsync({
        id: studentFee.id,
        updates: {
          paid_amount: newPaidAmount,
          balance_amount: newBalanceAmount,
          status: newStatus,
        },
      });

      toast({
        title: "Payment recorded",
        description: `Payment of ${formatCurrency(
          amount
        )} has been recorded successfully.`,
      });

      navigate("/fees/students");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = FEE_STATUSES.find((s) => s.value === status);
    return (
      <Badge variant={(statusInfo?.color as any) || "secondary"}>
        {statusInfo?.label || status}
      </Badge>
    );
  };

  if (!canUpdate) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to collect fees.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loadingFee) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!studentFee) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-red-500">Fee record not found</p>
          <div className="flex justify-center mt-4">
            <Button onClick={() => navigate("/fees/students")}>
              Back to Fees
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/fees/students")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collect Fee</h1>
          <p className="text-muted-foreground">
            Record fee payment for student
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Student & Fee Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Student Name</p>
                <p className="font-medium">
                  {student
                    ? `${student.first_name} ${student.last_name}`
                    : "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admission No.</p>
                <p className="font-medium">
                  {student?.admission_number || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Class</p>
                <p className="font-medium">
                  {studentClass?.class_name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                {getStatusBadge(studentFee.status)}
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Fee</p>
                <p className="text-xl font-bold">
                  {formatCurrency(studentFee.net_amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid Amount</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(studentFee.paid_amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-xl font-bold text-orange-600">
                  {formatCurrency(studentFee.balance_amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(studentFee.due_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Payment Details
            </CardTitle>
            <CardDescription>Enter payment information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                placeholder={`Max: ${studentFee.balance_amount}`}
                value={paymentData.amount}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, amount: e.target.value })
                }
                max={studentFee.balance_amount}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="payment_mode">Payment Mode *</Label>
              <Select
                value={paymentData.payment_mode}
                onValueChange={(value) =>
                  setPaymentData({ ...paymentData, payment_mode: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_MODES.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {paymentData.payment_mode === "Cheque" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="cheque_number">Cheque Number</Label>
                  <Input
                    id="cheque_number"
                    placeholder="Enter cheque number"
                    value={paymentData.cheque_number}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        cheque_number: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cheque_date">Cheque Date</Label>
                  <Input
                    id="cheque_date"
                    type="date"
                    value={paymentData.cheque_date}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        cheque_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    placeholder="Enter bank name"
                    value={paymentData.bank_name}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        bank_name: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            )}

            {["UPI", "Card", "Net Banking"].includes(
              paymentData.payment_mode
            ) && (
              <div className="grid gap-2">
                <Label htmlFor="transaction_id">Transaction ID</Label>
                <Input
                  id="transaction_id"
                  placeholder="Enter transaction ID"
                  value={paymentData.transaction_id}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      transaction_id: e.target.value,
                    })
                  }
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Any additional notes..."
                value={paymentData.remarks}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, remarks: e.target.value })
                }
              />
            </div>

            <Button
              className="w-full"
              onClick={handlePaymentSubmit}
              disabled={isSubmitting || studentFee.balance_amount <= 0}
            >
              {isSubmitting ? "Processing..." : "Record Payment"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      {payments && payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <div className="font-medium">{payment.receipt_number}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(payment.payment_date).toLocaleDateString()} •{" "}
                      {payment.payment_mode}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {formatCurrency(payment.amount)}
                    </div>
                    {payment.transaction_id && (
                      <div className="text-xs text-muted-foreground">
                        Txn: {payment.transaction_id}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
