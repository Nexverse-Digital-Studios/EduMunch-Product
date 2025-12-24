import { useState } from "react";
import { Eye, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
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

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  code: string;
  selected: boolean;
}

interface Payslip {
  id: string;
  employeeName: string;
  netSalary: number;
  paymentDate: string;
}

const employees: Employee[] = [
  { id: "1", name: "Akshay Pandey", employeeId: "41236", code: "APCH", selected: false },
  { id: "2", name: "Aniket Singh", employeeId: "52684", code: "ASB", selected: false },
  { id: "3", name: "Anup Singh", employeeId: "3", code: "ASM", selected: false },
  { id: "4", name: "Ramswaroop Chaudhary", employeeId: "12345", code: "RCH", selected: false },
  { id: "5", name: "Umesh Khandelwal", employeeId: "54321", code: "UKH", selected: false },
];

const generatedPayslips: Payslip[] = [
  { id: "1", employeeName: "Ramswaroop Chaudhary", netSalary: 50066.66, paymentDate: "11/18/2025" },
  { id: "2", employeeName: "Umesh Khandelwal", netSalary: 50069.66, paymentDate: "12/6/2025" },
  { id: "3", employeeName: "Anup Singh", netSalary: 50069.66, paymentDate: "12/6/2025" },
  { id: "4", employeeName: "Akshay Pandey", netSalary: 50069.66, paymentDate: "12/6/2025" },
  { id: "5", employeeName: "Aniket Singh", netSalary: 48574.20, paymentDate: "12/6/2025" },
];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Payslips = () => {
  const [activeTab, setActiveTab] = useState("generate");
  const [selectedMonth, setSelectedMonth] = useState("December");
  const [year, setYear] = useState("2025");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(e => e.id));
    }
    setSelectAll(!selectAll);
  };

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
            View Generated
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

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Select Employees to Include</h3>
              <ScrollArea className="h-[300px] border border-border rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 pb-3 border-b border-border">
                    <Checkbox 
                      checked={selectAll}
                      onCheckedChange={() => toggleSelectAll()}
                    />
                    <span className="font-medium text-foreground">All Eligible Employees</span>
                  </div>
                  {employees.map((employee) => (
                    <div key={employee.id} className="flex items-center gap-3">
                      <Checkbox 
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={() => toggleEmployee(employee.id)}
                      />
                      <div>
                        <span className="font-medium text-foreground">{employee.name}</span>
                        <span className="text-muted-foreground ml-2">({employee.employeeId})</span>
                        <p className="text-sm text-muted-foreground">Code: {employee.code}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="flex justify-end mt-6">
              <Button className="bg-primary hover:bg-primary/90">
                Generate Payslips
              </Button>
            </div>
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
                <Button className="bg-primary hover:bg-primary/90">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline">Reset</Button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Found {generatedPayslips.length} payslip(s)</p>
            <p className="text-sm text-muted-foreground">Period: {selectedMonth} {year}</p>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Employee</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generatedPayslips.map((payslip) => (
                  <TableRow key={payslip.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium text-foreground">{payslip.employeeName}</TableCell>
                    <TableCell className="text-foreground">₹{payslip.netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-foreground">{payslip.paymentDate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Payslips;