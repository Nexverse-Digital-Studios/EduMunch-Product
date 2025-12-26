/**
 * FeeCollectionReport Component
 * ==============================
 * Generate fee collection and pending dues reports
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileText,
  Filter,
  IndianRupee,
  Search,
  Printer,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import { ClassInfo, SectionInfo, AcademicYearInfo } from "./types";

const INDEX_TOKEN = "1emaet";

interface StudentInfo {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  class_id: string;
  section_id: string;
  status: string;
}

interface FeeStructure {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  class_id: string | null;
}

interface FeePayment {
  id: string;
  student_id: string;
  fee_structure_id: string;
  amount_paid: number;
  payment_date: string;
  payment_mode: string;
  status: "paid" | "partial" | "pending" | "overdue";
}

interface StudentFee {
  id: string;
  student_id: string;
  fee_structure_id: string;
  total_amount: number;
  paid_amount: number;
  due_date: string;
  status: "paid" | "partial" | "pending" | "overdue";
}

export function FeeCollectionReport() {
  const [classFilter, setClassFilter] = useState<string>("all");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { canView } = useModulePermissions("reports");
  const { toast } = useToast();

  // Fetch data
  const { data: students, isLoading: loadingStudents } =
    useSupabaseTable<StudentInfo>(`students_${INDEX_TOKEN}`, {
      filters: { status: "active" },
    });

  const { data: classes } = useSupabaseTable<ClassInfo>(
    `classes_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const { data: sections } = useSupabaseTable<SectionInfo>(
    `sections_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const { data: studentFees } = useSupabaseTable<StudentFee>(
    `student_fees_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Create lookup maps
  const classMap = useMemo(() => {
    if (!classes) return new Map<string, ClassInfo>();
    return new Map(classes.map((c) => [c.id, c]));
  }, [classes]);

  const sectionMap = useMemo(() => {
    if (!sections) return new Map<string, SectionInfo>();
    return new Map(sections.map((s) => [s.id, s]));
  }, [sections]);

  // Create student fee map
  const studentFeeMap = useMemo(() => {
    if (!studentFees) return new Map<string, StudentFee[]>();
    const map = new Map<string, StudentFee[]>();
    studentFees.forEach((fee) => {
      const existing = map.get(fee.student_id) || [];
      existing.push(fee);
      map.set(fee.student_id, existing);
    });
    return map;
  }, [studentFees]);

  // Filter sections by class
  const filteredSections = useMemo(() => {
    if (!sections || classFilter === "all") return sections || [];
    return sections.filter((s) => s.class_id === classFilter);
  }, [sections, classFilter]);

  // Filtered students with fee data
  const filteredStudents = useMemo(() => {
    if (!students) return [];

    return students
      .map((student) => {
        const fees = studentFeeMap.get(student.id) || [];
        const totalDue = fees.reduce((sum, f) => sum + f.total_amount, 0);
        const totalPaid = fees.reduce((sum, f) => sum + f.paid_amount, 0);
        const pending = totalDue - totalPaid;
        const collectionRate =
          totalDue > 0 ? (totalPaid / totalDue) * 100 : 100;

        // Determine overall status
        let status: "paid" | "partial" | "pending" | "overdue" = "paid";
        if (pending > 0) {
          const hasOverdue = fees.some(
            (f) => f.status === "overdue" || new Date(f.due_date) < new Date()
          );
          if (hasOverdue) {
            status = "overdue";
          } else if (totalPaid > 0) {
            status = "partial";
          } else {
            status = "pending";
          }
        }

        return {
          ...student,
          totalDue,
          totalPaid,
          pending,
          collectionRate,
          status,
        };
      })
      .filter((student) => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          !searchQuery ||
          student.first_name.toLowerCase().includes(searchLower) ||
          student.last_name.toLowerCase().includes(searchLower) ||
          student.admission_number.toLowerCase().includes(searchLower);

        const matchesClass =
          classFilter === "all" || student.class_id === classFilter;

        const matchesSection =
          sectionFilter === "all" || student.section_id === sectionFilter;

        const matchesStatus =
          statusFilter === "all" || student.status === statusFilter;

        return matchesSearch && matchesClass && matchesSection && matchesStatus;
      });
  }, [
    students,
    studentFeeMap,
    searchQuery,
    classFilter,
    sectionFilter,
    statusFilter,
  ]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalDue = filteredStudents.reduce((sum, s) => sum + s.totalDue, 0);
    const totalPaid = filteredStudents.reduce((sum, s) => sum + s.totalPaid, 0);
    const totalPending = filteredStudents.reduce(
      (sum, s) => sum + s.pending,
      0
    );
    const collectionRate = totalDue > 0 ? (totalPaid / totalDue) * 100 : 100;

    const statusCounts = {
      paid: filteredStudents.filter((s) => s.status === "paid").length,
      partial: filteredStudents.filter((s) => s.status === "partial").length,
      pending: filteredStudents.filter((s) => s.status === "pending").length,
      overdue: filteredStudents.filter((s) => s.status === "overdue").length,
    };

    return {
      totalDue,
      totalPaid,
      totalPending,
      collectionRate: collectionRate.toFixed(1),
      statusCounts,
    };
  }, [filteredStudents]);

  const handleExportPDF = () => {
    toast({
      title: "Exporting Report",
      description: "Generating PDF report...",
    });
    window.print();
  };

  const handleExportExcel = () => {
    toast({
      title: "Exporting Report",
      description: "Generating Excel report...",
    });
  };

  const handleExportCSV = () => {
    toast({
      title: "Exporting Report",
      description: "Generating CSV report...",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Paid
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="mr-1 h-3 w-3" />
            Partial
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Overdue
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loadingStudents) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/reports">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Fee Collection Report</h1>
            <p className="text-muted-foreground">
              Fee collection status and pending dues analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button onClick={handleExportPDF}>
            <Printer className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <IndianRupee className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Due</p>
                <p className="text-xl font-bold">
                  {formatCurrency(stats.totalDue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-xl font-bold">
                  {formatCurrency(stats.totalPaid)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pending</p>
                <p className="text-xl font-bold">
                  {formatCurrency(stats.totalPending)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collection Rate</p>
                <p className="text-xl font-bold">{stats.collectionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Status Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-50">
              <p className="text-3xl font-bold text-green-700">
                {stats.statusCounts.paid}
              </p>
              <p className="text-sm text-green-600">Fully Paid</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50">
              <p className="text-3xl font-bold text-blue-700">
                {stats.statusCounts.partial}
              </p>
              <p className="text-sm text-blue-600">Partial Payment</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-amber-50">
              <p className="text-3xl font-bold text-amber-700">
                {stats.statusCounts.pending}
              </p>
              <p className="text-sm text-amber-600">Pending</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50">
              <p className="text-3xl font-bold text-red-700">
                {stats.statusCounts.overdue}
              </p>
              <p className="text-sm text-red-600">Overdue</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or admission number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={classFilter}
              onValueChange={(v) => {
                setClassFilter(v);
                setSectionFilter("all");
              }}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
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
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {filteredSections.map((sec) => (
                  <SelectItem key={sec.id} value={sec.id}>
                    Section {sec.section_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Report Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Fee Collection Data ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <IndianRupee className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No students found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Total Due</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead>Collection</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const classInfo = classMap.get(student.class_id);
                  const sectionInfo = sectionMap.get(student.section_id);

                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {student.admission_number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {classInfo && sectionInfo ? (
                          <Badge variant="outline">
                            {classInfo.class_name} - {sectionInfo.section_name}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(student.totalDue)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(student.totalPaid)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatCurrency(student.pending)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={student.collectionRate}
                            className="w-16 h-2"
                          />
                          <span className="text-xs text-muted-foreground">
                            {student.collectionRate.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(student.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/students/${student.id}/fees`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
