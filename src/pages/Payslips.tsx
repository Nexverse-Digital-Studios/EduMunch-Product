/**
 * Payslips.tsx - Payslip Generation and Management
 * 
 * Supabase Tables (Tier 2):
 * - monthly_payroll_1EMAET: Monthly salary records
 * - teachers_1EMAET: Teacher records (for payroll)
 * - employees_1EMAET: Staff records (for payroll)
 * 
 * Schema Reference:
 * - employee_id, teacher_id, employee_type (Teacher/Staff)
 * - salary_month, basic_salary, total_earnings, total_deductions, net_salary
 * - payment_date, payment_mode, status (Pending/Processed/Paid)
 */
import { useState, useMemo } from "react";
import { Eye, Trash2, Search, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { useSupabaseQuery, useSupabaseInsert, useSupabaseDelete } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import { format, parse } from "date-fns";

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  teacher_code: string;
  email: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_code: string;
  email: string;
}

interface MonthlyPayroll {
  id: string;
  employee_id: string | null;
  teacher_id: string | null;
  employee_type: 'Teacher' | 'Staff';
  salary_month: string;
  basic_salary: number;
  total_earnings: number;
  total_deductions: number;
  net_salary: number;
  payment_date: string | null;
  payment_mode: string | null;
  status: 'Pending' | 'Processed' | 'Paid';
  created_at: string;
  teachers_1EMAET?: Teacher;
  employees_1EMAET?: Employee;
}

const INDEX_TOKEN = import.meta.env.VITE_INDEX_TOKEN || '1EMAET';

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Payslips = () => {
  const [activeTab, setActiveTab] = useState("generate");
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [selectAllTeachers, setSelectAllTeachers] = useState(false);
  const [selectAllStaff, setSelectAllStaff] = useState(false);

  const { canRead, canCreate, canUpdate, canDelete } = useModulePermissions('HR');
  const { toast } = useToast();

  // Fetch teachers
  const { data: teachers = [], isLoading: loadingTeachers } = useSupabaseQuery<Teacher>(
    `teachers_${INDEX_TOKEN}`,
    { select: 'id, first_name, last_name, teacher_code, email', orderBy: { column: 'first_name', ascending: true } }
  );

  // Fetch employees (staff)
  const { data: employees = [], isLoading: loadingEmployees } = useSupabaseQuery<Employee>(
    `employees_${INDEX_TOKEN}`,
    { select: 'id, first_name, last_name, employee_code, email', orderBy: { column: 'first_name', ascending: true } }
  );

  // Fetch payroll records with joins
  const { data: payrollRecords = [], isLoading: loadingPayroll, refetch } = useSupabaseQuery<MonthlyPayroll>(
    `monthly_payroll_${INDEX_TOKEN}`,
    { 
      select: `*, teachers_${INDEX_TOKEN}(id, first_name, last_name, teacher_code), employees_${INDEX_TOKEN}(id, first_name, last_name, employee_code)`,
      orderBy: { column: 'created_at', ascending: false }
    }
  );

  // Filter payroll by selected month/year
  const filteredPayroll = useMemo(() => {
    const monthIndex = months.indexOf(selectedMonth);
    return payrollRecords.filter(record => {
      const recordDate = new Date(record.salary_month);
      return recordDate.getMonth() === monthIndex && recordDate.getFullYear() === parseInt(year);
    });
  }, [payrollRecords, selectedMonth, year]);

  // Insert mutation for generating payslips
  const insertMutation = useSupabaseInsert<Partial<MonthlyPayroll>>(
    `monthly_payroll_${INDEX_TOKEN}`,
    {
      onSuccess: () => {
        toast({ title: "Success", description: "Payslips generated successfully" });
        setSelectedTeachers([]);
        setSelectedStaff([]);
        refetch();
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  );

  // Delete mutation
  const deleteMutation = useSupabaseDelete(
    `monthly_payroll_${INDEX_TOKEN}`,
    {
      onSuccess: () => {
        toast({ title: "Success", description: "Payslip deleted successfully" });
        refetch();
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  );

  const toggleTeacher = (id: string) => {
    setSelectedTeachers(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleStaff = (id: string) => {
    setSelectedStaff(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllTeachers = () => {
    if (selectAllTeachers) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(teachers.map(t => t.id));
    }
    setSelectAllTeachers(!selectAllTeachers);
  };

  const toggleSelectAllStaff = () => {
    if (selectAllStaff) {
      setSelectedStaff([]);
    } else {
      setSelectedStaff(employees.map(e => e.id));
    }
    setSelectAllStaff(!selectAllStaff);
  };

  const handleGeneratePayslips = () => {
    if (selectedTeachers.length === 0 && selectedStaff.length === 0) {
      toast({ title: "Error", description: "Please select at least one employee", variant: "destructive" });
      return;
    }

    const monthIndex = months.indexOf(selectedMonth) + 1;
    const salaryMonth = `${year}-${monthIndex.toString().padStart(2, '0')}-01`;

    // Generate for teachers
    selectedTeachers.forEach(teacherId => {
      insertMutation.mutate({
        teacher_id: teacherId,
        employee_id: null,
        employee_type: 'Teacher',
        salary_month: salaryMonth,
        basic_salary: 0, // Would be fetched from salary structure in production
        total_earnings: 0,
        total_deductions: 0,
        net_salary: 0,
        status: 'Pending'
      });
    });

    // Generate for staff
    selectedStaff.forEach(employeeId => {
      insertMutation.mutate({
        teacher_id: null,
        employee_id: employeeId,
        employee_type: 'Staff',
        salary_month: salaryMonth,
        basic_salary: 0,
        total_earnings: 0,
        total_deductions: 0,
        net_salary: 0,
        status: 'Pending'
      });
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this payslip?')) {
      deleteMutation.mutate(id);
    }
  };

  const getEmployeeName = (record: MonthlyPayroll) => {
    if (record.employee_type === 'Teacher' && record[`teachers_${INDEX_TOKEN}`]) {
      const teacher = record[`teachers_${INDEX_TOKEN}`] as Teacher;
      return `${teacher.first_name} ${teacher.last_name}`;
    } else if (record[`employees_${INDEX_TOKEN}`]) {
      const employee = record[`employees_${INDEX_TOKEN}`] as Employee;
      return `${employee.first_name} ${employee.last_name}`;
    }
    return 'Unknown';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'Processed':
        return <Badge className="bg-blue-500">Processed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const isLoading = loadingTeachers || loadingEmployees || loadingPayroll;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Payslip Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-0">
          <TabsTrigger
            value="generate"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Generate Payslips
          </TabsTrigger>
          <TabsTrigger
            value="view"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            View Generated ({payrollRecords.length})
          </TabsTrigger>
        </TabsList>

        {/* Generate Payslips Tab */}
        <TabsContent value="generate" className="mt-6 space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Year</Label>
                <Input value={year} onChange={(e) => setYear(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Teachers */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Teachers ({teachers.length})</h3>
                <ScrollArea className="h-[250px] border border-border rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 pb-3 border-b border-border">
                      <Checkbox 
                        checked={selectAllTeachers}
                        onCheckedChange={() => toggleSelectAllTeachers()}
                      />
                      <span className="font-medium text-foreground">All Teachers</span>
                    </div>
                    {teachers.map((teacher) => (
                      <div key={teacher.id} className="flex items-center gap-3">
                        <Checkbox 
                          checked={selectedTeachers.includes(teacher.id)}
                          onCheckedChange={() => toggleTeacher(teacher.id)}
                        />
                        <div>
                          <span className="font-medium text-foreground">{teacher.first_name} {teacher.last_name}</span>
                          <p className="text-sm text-muted-foreground">Code: {teacher.teacher_code}</p>
                        </div>
                      </div>
                    ))}
                    {teachers.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No teachers found</p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Staff */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Staff ({employees.length})</h3>
                <ScrollArea className="h-[250px] border border-border rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 pb-3 border-b border-border">
                      <Checkbox 
                        checked={selectAllStaff}
                        onCheckedChange={() => toggleSelectAllStaff()}
                      />
                      <span className="font-medium text-foreground">All Staff</span>
                    </div>
                    {employees.map((employee) => (
                      <div key={employee.id} className="flex items-center gap-3">
                        <Checkbox 
                          checked={selectedStaff.includes(employee.id)}
                          onCheckedChange={() => toggleStaff(employee.id)}
                        />
                        <div>
                          <span className="font-medium text-foreground">{employee.first_name} {employee.last_name}</span>
                          <p className="text-sm text-muted-foreground">Code: {employee.employee_code}</p>
                        </div>
                      </div>
                    ))}
                    {employees.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No staff found</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {canCreate && (
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={handleGeneratePayslips}
                  disabled={insertMutation.isPending || (selectedTeachers.length === 0 && selectedStaff.length === 0)}
                  className="bg-primary hover:bg-primary/90"
                >
                  {insertMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Generate Payslips ({selectedTeachers.length + selectedStaff.length} selected)
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* View Generated Tab */}
        <TabsContent value="view" className="mt-6 space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Year</Label>
                <Input value={year} onChange={(e) => setYear(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => refetch()} className="bg-primary hover:bg-primary/90">
                  <Search className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Found {filteredPayroll.length} payslip(s)</p>
            <p className="text-sm text-muted-foreground">Period: {selectedMonth} {year}</p>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayroll.map((payslip) => (
                  <TableRow key={payslip.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium text-foreground">{getEmployeeName(payslip)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{payslip.employee_type}</Badge>
                    </TableCell>
                    <TableCell className="text-foreground">₹{payslip.net_salary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>{getStatusBadge(payslip.status)}</TableCell>
                    <TableCell className="text-foreground">
                      {payslip.payment_date ? format(new Date(payslip.payment_date), 'MMM dd, yyyy') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canDelete && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDelete(payslip.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPayroll.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No payslips found for {selectedMonth} {year}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Payslips;