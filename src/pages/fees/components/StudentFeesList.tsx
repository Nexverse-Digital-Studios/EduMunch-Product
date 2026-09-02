import { useState } from "react";
import {
  Search,
  IndianRupee,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Receipt,
  Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import { Progress } from "@/components/ui/progress";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { StudentFeeDB, FEE_STATUSES } from "./types";

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

interface StudentFeesListProps {
  embedded?: boolean;
  onCollectFee?: (feeId: string) => void;
}

export function StudentFeesList({ embedded = false, onCollectFee }: StudentFeesListProps) {
  const { toast } = useToast();
  const { canView, canExport } = useModulePermissions("fees");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { data: studentFees, isLoading } = useSupabaseTable<StudentFeeDB>(
    `student_fees_${INDEX_TOKEN}`,
    { orderBy: { column: "due_date", ascending: true } }
  );

  const { data: students } = useSupabaseTable<StudentDB>(
    `students_${INDEX_TOKEN}`,
    { orderBy: { column: "first_name", ascending: true } }
  );

  const { data: classes } = useSupabaseTable<ClassDB>(
    `classes_${INDEX_TOKEN}`,
    {
      orderBy: { column: "class_order", ascending: true },
    }
  );

  const getStudentInfo = (studentId: string) => {
    const student = students?.find((s) => s.id === studentId);
    return student
      ? {
          name: `${student.first_name} ${student.last_name}`,
          admissionNo: student.admission_number,
          classId: student.class_id,
        }
      : { name: "Unknown", admissionNo: "N/A", classId: "" };
  };

  const getClassName = (classId: string) => {
    const cls = classes?.find((c) => c.id === classId);
    return cls?.class_name || "Unknown";
  };

  const filteredFees = studentFees?.filter((fee) => {
    const studentInfo = getStudentInfo(fee.student_id);
    const matchesSearch =
      studentInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentInfo.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass =
      selectedClass === "all" || studentInfo.classId === selectedClass;
    const matchesStatus =
      selectedStatus === "all" || fee.status === selectedStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = FEE_STATUSES.find((s) => s.value === status);
    return (
      <Badge variant={(statusInfo?.color as any) || "secondary"}>
        {statusInfo?.label || status}
      </Badge>
    );
  };

  const getPaymentProgress = (paid: number, total: number) => {
    return total > 0 ? (paid / total) * 100 : 0;
  };

  // Stats calculations
  const stats = {
    totalDue: studentFees?.reduce((sum, f) => sum + f.net_amount, 0) || 0,
    totalCollected:
      studentFees?.reduce((sum, f) => sum + f.paid_amount, 0) || 0,
    totalPending:
      studentFees?.reduce((sum, f) => sum + f.balance_amount, 0) || 0,
    overdueCount:
      studentFees?.filter((f) => f.status === "overdue").length || 0,
  };

  if (!canView) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to view student fees.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Fees</h1>
            <p className="text-muted-foreground">
              View and manage student fee payments
            </p>
          </div>
          <div className="flex gap-2">
            {canExport && (
              <Button 
                variant="outline" 
                onClick={() => toast({ title: "Reports", description: "Fee reports available in Reports tab" })}
              >
                <Download className="mr-2 h-4 w-4" />
                Reports
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => toast({ title: "Receipts", description: "View receipts in Receipts tab" })}
            >
              <Receipt className="mr-2 h-4 w-4" />
              Receipts
            </Button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Due</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalDue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalCollected)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDue > 0
                ? `${((stats.totalCollected / stats.totalDue) * 100).toFixed(
                    1
                  )}% collected`
                : "0%"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.totalPending)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.overdueCount}
            </div>
            <p className="text-xs text-muted-foreground">
              students with overdue fees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Records</CardTitle>
          <CardDescription>
            All student fee records for the current academic year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or admission number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by class" />
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
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {FEE_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredFees && filteredFees.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Total Fee</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFees.map((fee) => {
                    const studentInfo = getStudentInfo(fee.student_id);
                    const progress = getPaymentProgress(
                      fee.paid_amount,
                      fee.net_amount
                    );
                    return (
                      <TableRow key={fee.id}>
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
                          {getClassName(studentInfo.classId)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(fee.net_amount)}
                        </TableCell>
                        <TableCell className="text-green-600">
                          {formatCurrency(fee.paid_amount)}
                        </TableCell>
                        <TableCell className="text-orange-600">
                          {formatCurrency(fee.balance_amount)}
                        </TableCell>
                        <TableCell>
                          <div className="w-24">
                            <Progress value={progress} className="h-2" />
                            <span className="text-xs text-muted-foreground">
                              {progress.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(fee.due_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(fee.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              if (onCollectFee) {
                                onCollectFee(fee.id);
                              } else {
                                toast({ 
                                  title: "Collect Fee", 
                                  description: "Use the Collection tab to collect this fee" 
                                });
                              }
                            }}
                          >
                            <IndianRupee className="mr-2 h-3 w-3" />
                            Collect
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || selectedClass !== "all" || selectedStatus !== "all"
                ? "No fee records match your filters."
                : "No fee records found."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
