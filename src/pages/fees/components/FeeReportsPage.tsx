import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  BarChart3,
  PieChart,
  TrendingUp,
  IndianRupee,
  Users,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { StudentFeeDB, FeePaymentDB } from "./types";

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

export function FeeReportsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canView, canExport } = useModulePermissions("fees");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [reportType, setReportType] = useState<string>("collection");

  const { data: studentFees } = useSupabaseTable<StudentFeeDB>(
    `student_fees_${INDEX_TOKEN}`
  );

  const { data: payments } = useSupabaseTable<FeePaymentDB>(
    `fee_payments_${INDEX_TOKEN}`,
    { orderBy: { column: "payment_date", ascending: false } }
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

  // Calculate overall stats
  const stats = {
    totalDue: studentFees?.reduce((sum, f) => sum + f.net_amount, 0) || 0,
    totalCollected:
      studentFees?.reduce((sum, f) => sum + f.paid_amount, 0) || 0,
    totalPending:
      studentFees?.reduce((sum, f) => sum + f.balance_amount, 0) || 0,
    totalStudents: studentFees?.length || 0,
    paidStudents: studentFees?.filter((f) => f.status === "paid").length || 0,
    pendingStudents:
      studentFees?.filter((f) => f.status === "pending").length || 0,
    partialStudents:
      studentFees?.filter((f) => f.status === "partial").length || 0,
    overdueStudents:
      studentFees?.filter((f) => f.status === "overdue").length || 0,
  };

  const collectionRate =
    stats.totalDue > 0 ? (stats.totalCollected / stats.totalDue) * 100 : 0;

  // Payment mode distribution
  const paymentModeStats =
    payments?.reduce((acc, p) => {
      acc[p.payment_mode] = (acc[p.payment_mode] || 0) + p.amount;
      return acc;
    }, {} as Record<string, number>) || {};

  // Monthly collection (last 6 months)
  const monthlyCollection =
    payments?.reduce((acc, p) => {
      const month = new Date(p.payment_date).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      acc[month] = (acc[month] || 0) + p.amount;
      return acc;
    }, {} as Record<string, number>) || {};

  const handleExport = (format: string) => {
    toast({
      title: "Export Started",
      description: `Exporting fee report in ${format.toUpperCase()} format...`,
    });
  };

  if (!canView) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to view fee reports.
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
            <h1 className="text-3xl font-bold tracking-tight">Fee Reports</h1>
            <p className="text-muted-foreground">
              Analytics and reports for fee collection
            </p>
          </div>
        </div>
        {canExport && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport("csv")}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport("pdf")}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-full md:w-[200px]">
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
          <SelectTrigger className="w-full md:w-[200px]">
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
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Report Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="collection">Collection Summary</SelectItem>
            <SelectItem value="defaulters">Defaulters List</SelectItem>
            <SelectItem value="classwise">Class-wise Report</SelectItem>
            <SelectItem value="modewise">Mode-wise Report</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Fees Due
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalDue)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats.totalStudents} students
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Collected
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalCollected)}
            </div>
            <Progress value={collectionRate} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {collectionRate.toFixed(1)}% collection rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Amount
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.totalPending)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingStudents + stats.partialStudents} students pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Users className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.overdueStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              students with overdue fees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Status Distribution
            </CardTitle>
            <CardDescription>Students by payment status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Fully Paid</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{stats.paidStudents}</span>
                  <Badge variant="default" className="bg-green-500">
                    {stats.totalStudents > 0
                      ? (
                          (stats.paidStudents / stats.totalStudents) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Partially Paid</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{stats.partialStudents}</span>
                  <Badge variant="default">
                    {stats.totalStudents > 0
                      ? (
                          (stats.partialStudents / stats.totalStudents) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{stats.pendingStudents}</span>
                  <Badge variant="secondary">
                    {stats.totalStudents > 0
                      ? (
                          (stats.pendingStudents / stats.totalStudents) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Overdue</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{stats.overdueStudents}</span>
                  <Badge variant="destructive">
                    {stats.totalStudents > 0
                      ? (
                          (stats.overdueStudents / stats.totalStudents) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Payment Mode Distribution
            </CardTitle>
            <CardDescription>Collection by payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(paymentModeStats).map(([mode, amount]) => {
                const percentage =
                  stats.totalCollected > 0
                    ? (amount / stats.totalCollected) * 100
                    : 0;
                return (
                  <div key={mode} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{mode}</span>
                      <span className="font-medium">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {percentage.toFixed(1)}% of total collection
                    </p>
                  </div>
                );
              })}
              {Object.keys(paymentModeStats).length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No payment data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Collection Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Collection Trend
          </CardTitle>
          <CardDescription>Fee collection over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-6">
            {Object.entries(monthlyCollection)
              .slice(-6)
              .map(([month, amount]) => (
                <div key={month} className="text-center p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground">{month}</div>
                  <div className="text-lg font-bold mt-1">
                    {formatCurrency(amount)}
                  </div>
                </div>
              ))}
            {Object.keys(monthlyCollection).length === 0 && (
              <div className="col-span-6 text-center text-muted-foreground py-8">
                No payment data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
