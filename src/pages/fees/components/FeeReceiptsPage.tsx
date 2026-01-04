import { useState } from "react";
import {
  Search,
  Download,
  Eye,
  Printer,
  Receipt,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { FeePaymentDB, PAYMENT_MODES } from "./types";

const INDEX_TOKEN = "1emaet";

interface StudentDB {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
}

interface FeeReceiptsPageProps {
  embedded?: boolean;
}

export function FeeReceiptsPage({ embedded = false }: FeeReceiptsPageProps) {
  const { canView, canExport } = useModulePermissions("fees");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMode, setSelectedMode] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: payments, isLoading } = useSupabaseTable<FeePaymentDB>(
    `fee_payments_${INDEX_TOKEN}`,
    { orderBy: { column: "payment_date", ascending: false } }
  );

  const { data: students } = useSupabaseTable<StudentDB>(
    `students_${INDEX_TOKEN}`
  );

  const getStudentInfo = (studentId: string) => {
    const student = students?.find((s) => s.id === studentId);
    return student
      ? {
          name: `${student.first_name} ${student.last_name}`,
          admissionNo: student.admission_number,
        }
      : { name: "Unknown", admissionNo: "N/A" };
  };

  const filteredPayments = payments?.filter((payment) => {
    const studentInfo = getStudentInfo(payment.student_id);
    const matchesSearch =
      payment.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentInfo.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode =
      selectedMode === "all" || payment.payment_mode === selectedMode;
    const paymentDate = new Date(payment.payment_date);
    const matchesDateFrom = !dateFrom || paymentDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || paymentDate <= new Date(dateTo);
    return matchesSearch && matchesMode && matchesDateFrom && matchesDateTo;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalCollected =
    filteredPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;

  if (!canView) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to view fee receipts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fee Receipts</h1>
            <p className="text-muted-foreground">
              View and print payment receipts
            </p>
          </div>
          {canExport && (
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      )}

      {embedded && canExport && (
        <div className="flex justify-end">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Receipts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredPayments?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalCollected)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Average Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                filteredPayments && filteredPayments.length > 0
                  ? totalCollected / filteredPayments.length
                  : 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Receipts</CardTitle>
          <CardDescription>All fee payment receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by receipt number or student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedMode} onValueChange={setSelectedMode}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Payment mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                {PAYMENT_MODES.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="From"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full md:w-[150px]"
            />
            <Input
              type="date"
              placeholder="To"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full md:w-[150px]"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredPayments && filteredPayments.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt No.</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Mode</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => {
                    const studentInfo = getStudentInfo(payment.student_id);
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                            {payment.receipt_number}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {studentInfo.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {studentInfo.admissionNo}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {payment.payment_mode}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.transaction_id ||
                            payment.cheque_number ||
                            "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || selectedMode !== "all" || dateFrom || dateTo
                ? "No receipts match your filters."
                : "No payment receipts found."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
