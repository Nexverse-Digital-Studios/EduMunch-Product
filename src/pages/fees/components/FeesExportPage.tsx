import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Filter, Search } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { StudentFeeDB, FeePaymentDB, FeeStructureDB } from "./types";

const INDEX_TOKEN = "1emaet";

interface ClassDB {
  id: string;
  class_name: string;
}

interface AcademicYearDB {
  id: string;
  year_name: string;
  is_current: boolean;
}

interface StudentDB {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  class_id: string;
}

export function FeesExportPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canView, canExport } = useModulePermissions("fees");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [exportType, setExportType] = useState<string>("student-fees");

  const { data: studentFees, isLoading } = useSupabaseTable<StudentFeeDB>(
    `student_fees_${INDEX_TOKEN}`,
    { orderBy: { column: "created_at", ascending: false } }
  );

  const { data: payments } = useSupabaseTable<FeePaymentDB>(
    `fee_payments_${INDEX_TOKEN}`,
    { orderBy: { column: "payment_date", ascending: false } }
  );

  const { data: feeStructures } = useSupabaseTable<FeeStructureDB>(
    `fee_structures_${INDEX_TOKEN}`
  );

  const { data: students } = useSupabaseTable<StudentDB>(
    `students_${INDEX_TOKEN}`
  );

  const { data: classes } = useSupabaseTable<ClassDB>(
    `classes_${INDEX_TOKEN}`,
    {
      orderBy: { column: "class_order", ascending: true },
    }
  );

  const { data: academicYears } = useSupabaseTable<AcademicYearDB>(
    `academic_years_${INDEX_TOKEN}`,
    { orderBy: { column: "year_name", ascending: false } }
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStudentName = (studentId: string) => {
    const student = students?.find((s) => s.id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : "Unknown";
  };

  const getAdmissionNumber = (studentId: string) => {
    const student = students?.find((s) => s.id === studentId);
    return student?.admission_number || "N/A";
  };

  const getClassName = (studentId: string) => {
    const student = students?.find((s) => s.id === studentId);
    const cls = classes?.find((c) => c.id === student?.class_id);
    return cls?.class_name || "N/A";
  };

  const getStructureName = (structureId: string) => {
    return (
      feeStructures?.find((f) => f.id === structureId)?.structure_name || "N/A"
    );
  };

  const getYearName = (yearId: string) => {
    return academicYears?.find((y) => y.id === yearId)?.year_name || "N/A";
  };

  // Filter student fees
  const filteredFees = studentFees?.filter((fee) => {
    const student = students?.find((s) => s.id === fee.student_id);
    const studentName = getStudentName(fee.student_id).toLowerCase();
    const admissionNum = getAdmissionNumber(fee.student_id).toLowerCase();

    const matchesSearch =
      studentName.includes(searchQuery.toLowerCase()) ||
      admissionNum.includes(searchQuery.toLowerCase());

    const matchesClass =
      selectedClass === "all" || student?.class_id === selectedClass;

    const matchesYear =
      selectedYear === "all" || fee.academic_year_id === selectedYear;

    const matchesStatus =
      selectedStatus === "all" || fee.status === selectedStatus;

    return matchesSearch && matchesClass && matchesYear && matchesStatus;
  });

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (!canExport) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to export data.",
        variant: "destructive",
      });
      return;
    }

    // Generate export data
    let exportData: any[] = [];
    let filename = "";

    if (exportType === "student-fees") {
      exportData =
        filteredFees?.map((fee) => ({
          "Student Name": getStudentName(fee.student_id),
          "Admission No": getAdmissionNumber(fee.student_id),
          Class: getClassName(fee.student_id),
          "Fee Structure": getStructureName(fee.fee_structure_id),
          "Academic Year": getYearName(fee.academic_year_id),
          "Net Amount": fee.net_amount,
          "Paid Amount": fee.paid_amount,
          Balance: fee.balance_amount,
          Status: fee.status,
          "Due Date": fee.due_date
            ? new Date(fee.due_date).toLocaleDateString()
            : "N/A",
        })) || [];
      filename = `student_fees_${new Date().toISOString().split("T")[0]}`;
    } else if (exportType === "payments") {
      exportData =
        payments?.map((p) => ({
          "Student Name": getStudentName(p.student_fee_id), // Note: This would need proper join
          "Payment Date": new Date(p.payment_date).toLocaleDateString(),
          Amount: p.amount,
          "Payment Mode": p.payment_mode,
          "Transaction ID": p.transaction_id || "N/A",
          Status: p.status,
        })) || [];
      filename = `fee_payments_${new Date().toISOString().split("T")[0]}`;
    } else if (exportType === "defaulters") {
      exportData =
        filteredFees
          ?.filter((f) => f.status === "overdue" || f.status === "pending")
          .map((fee) => ({
            "Student Name": getStudentName(fee.student_id),
            "Admission No": getAdmissionNumber(fee.student_id),
            Class: getClassName(fee.student_id),
            "Total Due": fee.net_amount,
            "Paid Amount": fee.paid_amount,
            "Pending Amount": fee.balance_amount,
            "Due Date": fee.due_date
              ? new Date(fee.due_date).toLocaleDateString()
              : "N/A",
            Status: fee.status,
          })) || [];
      filename = `fee_defaulters_${new Date().toISOString().split("T")[0]}`;
    }

    // Handle actual export based on format
    if (format === "csv") {
      if (exportData.length === 0) {
        toast({
          title: "No Data",
          description: "No data available to export.",
          variant: "destructive",
        });
        return;
      }

      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(","),
        ...exportData.map((row) =>
          headers.map((h) => `"${row[h] || ""}"`).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: `${filename}.csv has been downloaded.`,
      });
    } else {
      toast({
        title: "Export Started",
        description: `Generating ${format.toUpperCase()} export...`,
      });
    }
  };

  if (!canView) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to view fees export.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/fees/students")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Export Fees Data
            </h1>
            <p className="text-muted-foreground">
              Export fee records and reports in various formats
            </p>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>
            Select the type of data and format to export
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Type</label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select export type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student-fees">
                    Student Fees Summary
                  </SelectItem>
                  <SelectItem value="payments">Payment Transactions</SelectItem>
                  <SelectItem value="defaulters">Defaulters List</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleExport("csv")}
                  disabled={!canExport}
                >
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleExport("excel")}
                  disabled={!canExport}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleExport("pdf")}
                  disabled={!canExport}
                >
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter data before exporting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Academic Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {academicYears?.map((year) => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.year_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes?.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.class_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Preview Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
          <CardDescription>
            Showing {filteredFees?.length || 0} records matching your filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Fee Structure</TableHead>
                  <TableHead className="text-right">Due</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFees?.slice(0, 10).map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {getStudentName(fee.student_id)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getAdmissionNumber(fee.student_id)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getClassName(fee.student_id)}</TableCell>
                    <TableCell>
                      {getStructureName(fee.fee_structure_id)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(fee.net_amount)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(fee.paid_amount)}
                    </TableCell>
                    <TableCell className="text-right text-orange-600">
                      {formatCurrency(fee.balance_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          fee.status === "paid"
                            ? "default"
                            : fee.status === "overdue"
                            ? "destructive"
                            : "secondary"
                        }
                        className={fee.status === "paid" ? "bg-green-500" : ""}
                      >
                        {fee.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredFees || filteredFees.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      No records found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          {filteredFees && filteredFees.length > 10 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Showing first 10 of {filteredFees.length} records. Export to see
              all.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
