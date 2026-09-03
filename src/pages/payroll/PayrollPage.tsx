/**
 * Payroll Page - Employee Salary Processing
 *
 * Features:
 * - Process monthly payroll
 * - View salary breakdowns
 * - Generate payslips
 * - Track payment history
 * - Manage deductions and allowances
 *
 * Note: Currently using demo data. Full Supabase integration pending.
 */
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Wallet,
  Plus,
  Search,
  Calendar,
  Download,
  FileText,
  Users,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  MoreVertical,
  Printer,
  Mail,
  Filter,
  Building2,
  Calculator,
  CreditCard,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Demo payroll data
const demoPayroll = [
  {
    id: 1,
    employeeId: "EMP001",
    name: "Rajesh Sharma",
    department: "Teaching",
    designation: "Senior Teacher",
    basicSalary: 45000,
    allowances: 12000,
    deductions: 5500,
    netSalary: 51500,
    status: "paid",
    paymentDate: "2025-12-30",
    bankAccount: "XXXX1234",
    paymentMode: "Bank Transfer",
  },
  {
    id: 2,
    employeeId: "EMP002",
    name: "Priya Patel",
    department: "Teaching",
    designation: "Teacher",
    basicSalary: 38000,
    allowances: 9500,
    deductions: 4200,
    netSalary: 43300,
    status: "paid",
    paymentDate: "2025-12-30",
    bankAccount: "XXXX5678",
    paymentMode: "Bank Transfer",
  },
  {
    id: 3,
    employeeId: "EMP003",
    name: "Amit Kumar",
    department: "Administration",
    designation: "Office Manager",
    basicSalary: 35000,
    allowances: 8000,
    deductions: 3800,
    netSalary: 39200,
    status: "pending",
    paymentDate: null,
    bankAccount: "XXXX9012",
    paymentMode: "Bank Transfer",
  },
  {
    id: 4,
    employeeId: "EMP004",
    name: "Sunita Verma",
    department: "Teaching",
    designation: "HOD - Science",
    basicSalary: 55000,
    allowances: 15000,
    deductions: 7200,
    netSalary: 62800,
    status: "paid",
    paymentDate: "2025-12-30",
    bankAccount: "XXXX3456",
    paymentMode: "Bank Transfer",
  },
  {
    id: 5,
    employeeId: "EMP005",
    name: "Mohan Singh",
    department: "Support",
    designation: "Lab Assistant",
    basicSalary: 22000,
    allowances: 5500,
    deductions: 2400,
    netSalary: 25100,
    status: "processing",
    paymentDate: null,
    bankAccount: "XXXX7890",
    paymentMode: "Bank Transfer",
  },
  {
    id: 6,
    employeeId: "EMP006",
    name: "Kavita Gupta",
    department: "Accounts",
    designation: "Accountant",
    basicSalary: 40000,
    allowances: 10000,
    deductions: 4500,
    netSalary: 45500,
    status: "paid",
    paymentDate: "2025-12-30",
    bankAccount: "XXXX2345",
    paymentMode: "Bank Transfer",
  },
];

const statusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  failed: "bg-red-100 text-red-700",
};

const departments = [
  "All Departments",
  "Teaching",
  "Administration",
  "Accounts",
  "Support",
  "IT",
];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const PayrollPage = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "current";

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");
  const [selectedMonth, setSelectedMonth] = useState("December");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<
    (typeof demoPayroll)[0] | null
  >(null);

  const stats = {
    totalEmployees: demoPayroll.length,
    totalPayroll: demoPayroll.reduce((acc, e) => acc + e.netSalary, 0),
    paid: demoPayroll.filter((e) => e.status === "paid").length,
    pending: demoPayroll.filter(
      (e) => e.status === "pending" || e.status === "processing"
    ).length,
  };

  const filteredPayroll = demoPayroll.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "All Departments" ||
      emp.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  const handleProcess = () => {
    toast({
      title: "Payroll processed",
      description:
        "Payroll has been processed successfully for all pending employees.",
    });
    setIsProcessOpen(false);
  };

  const handleView = (emp: (typeof demoPayroll)[0]) => {
    setSelectedEmployee(emp);
    setIsViewOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Payroll Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Process and manage employee salaries
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsProcessOpen(true)} className="bg-primary">
            <Calculator className="h-4 w-4 mr-2" />
            Process Payroll
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                <p className="text-sm text-muted-foreground">Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ₹{(stats.totalPayroll / 100000).toFixed(1)}L
                </p>
                <p className="text-sm text-muted-foreground">Total Payroll</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.paid}</p>
                <p className="text-sm text-muted-foreground">Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or employee ID..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
            >
              <SelectTrigger className="w-full lg:w-48">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full lg:w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full lg:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              Payroll - {selectedMonth} {selectedYear}
            </span>
            <Badge variant="outline">
              {stats.paid}/{stats.totalEmployees} Processed
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Processing Progress</span>
              <span className="font-medium">
                {Math.round((stats.paid / stats.totalEmployees) * 100)}%
              </span>
            </div>
            <Progress
              value={(stats.paid / stats.totalEmployees) * 100}
              className="h-2"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Basic</TableHead>
                <TableHead className="text-right">Allowances</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayroll.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getInitials(emp.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {emp.employeeId}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{emp.department}</p>
                      <p className="text-xs text-muted-foreground">
                        {emp.designation}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{emp.basicSalary.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    +₹{emp.allowances.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    -₹{emp.deductions.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ₹{emp.netSalary.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[emp.status]}>
                      {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(emp)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            View Payslip
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Email Payslip
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Salary Breakdown Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Salary Breakdown</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(selectedEmployee.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedEmployee.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedEmployee.designation}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedEmployee.employeeId}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Basic Salary</span>
                  <span className="font-medium">
                    ₹{selectedEmployee.basicSalary.toLocaleString()}
                  </span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Allowances
                  </p>
                  <div className="pl-5 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">HRA</span>
                      <span>
                        ₹
                        {Math.round(
                          selectedEmployee.allowances * 0.4
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">DA</span>
                      <span>
                        ₹
                        {Math.round(
                          selectedEmployee.allowances * 0.3
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transport</span>
                      <span>
                        ₹
                        {Math.round(
                          selectedEmployee.allowances * 0.2
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Other</span>
                      <span>
                        ₹
                        {Math.round(
                          selectedEmployee.allowances * 0.1
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total Allowances</span>
                    <span className="text-green-600">
                      +₹{selectedEmployee.allowances.toLocaleString()}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-600 flex items-center gap-1">
                    <TrendingDown className="h-4 w-4" />
                    Deductions
                  </p>
                  <div className="pl-5 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">PF</span>
                      <span>
                        ₹
                        {Math.round(
                          selectedEmployee.deductions * 0.5
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>
                        ₹
                        {Math.round(
                          selectedEmployee.deductions * 0.35
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Other</span>
                      <span>
                        ₹
                        {Math.round(
                          selectedEmployee.deductions * 0.15
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total Deductions</span>
                    <span className="text-red-600">
                      -₹{selectedEmployee.deductions.toLocaleString()}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between py-2 text-lg font-bold">
                  <span>Net Salary</span>
                  <span className="text-primary">
                    ₹{selectedEmployee.netSalary.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span>Bank A/C: {selectedEmployee.bankAccount}</span>
                </div>
                {selectedEmployee.paymentDate && (
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Paid on:{" "}
                      {format(
                        new Date(selectedEmployee.paymentDate),
                        "MMM d, yyyy"
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download Payslip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Payroll Modal */}
      <Dialog open={isProcessOpen} onOpenChange={setIsProcessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payroll</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Month</span>
                <span className="font-medium">
                  {selectedMonth} {selectedYear}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending Employees</span>
                <span className="font-medium">{stats.pending}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending Amount</span>
                <span className="font-medium">
                  ₹
                  {demoPayroll
                    .filter((e) => e.status !== "paid")
                    .reduce((acc, e) => acc + e.netSalary, 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <Banknote className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Payment Method</p>
                <p className="text-sm text-muted-foreground">
                  Bank Transfer (NEFT/RTGS)
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              This will process salaries for all pending employees and initiate
              bank transfers.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProcessOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleProcess}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Process Payroll
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayrollPage;
