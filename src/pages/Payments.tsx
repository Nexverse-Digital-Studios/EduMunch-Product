import { useState } from "react";
import { Plus, Bell, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Installment {
  id: number;
  name: string;
  dueDate: string;
  amount: number;
  remaining: number;
  status: "PENDING" | "PAID" | "PARTIAL";
  transactions: Transaction[];
}

interface Transaction {
  id: number;
  student: string;
  formNumber: string;
  branch: string;
  date: string;
  amount: number;
  method: string;
  status: "PENDING" | "REALIZED";
  realizedBy: string;
}

interface Student {
  id: string;
  name: string;
  formNumber: string;
  course: string;
  totalDue: number;
  totalPaid: number;
  balance: number;
  installments: number;
}

interface OutstandingRecord {
  student: string;
  phone: string;
  branch: string;
  dueDate: string;
  totalDue: number;
  paid: number;
  balance: number;
  status: "PENDING" | "PARTIALLY PAID";
}

const students: Student[] = [
  { id: "1", name: "Student 2", formNumber: "VT25001", course: "JEE Foundation", totalDue: 400000, totalPaid: 0, balance: 400000, installments: 12 },
  { id: "2", name: "Kumar Kalani", formNumber: "VT25002", course: "NEET Prep", totalDue: 350000, totalPaid: 100000, balance: 250000, installments: 10 },
];

const installments: Installment[] = [
  { id: 1, name: "Installment 1", dueDate: "2/1/2025", amount: 33636.36, remaining: 33636.36, status: "PENDING", transactions: [] },
  { id: 2, name: "Installment 2", dueDate: "3/3/2025", amount: 33636.36, remaining: 33636.36, status: "PENDING", transactions: [] },
  { id: 3, name: "Installment 3", dueDate: "4/1/2025", amount: 33636.36, remaining: 33636.36, status: "PENDING", transactions: [] },
  { id: 4, name: "Installment 4", dueDate: "5/1/2025", amount: 33636.36, remaining: 33636.36, status: "PENDING", transactions: [] },
];

const transactions: Transaction[] = [
  { id: 1, student: "Kumar Kalani", formNumber: "125478", branch: "Thane HO Branch", date: "12/9/2025", amount: 14000, method: "CHEQUE", status: "PENDING", realizedBy: "N/A" },
  { id: 2, student: "Student test 1", formNumber: "VP26001", branch: "Palava Branch", date: "12/7/2025", amount: 10000, method: "CHEQUE", status: "REALIZED", realizedBy: "Super Admin" },
  { id: 3, student: "Student test 1", formNumber: "VP26001", branch: "Palava Branch", date: "12/6/2025", amount: 10000, method: "CASH", status: "REALIZED", realizedBy: "Super Admin" },
  { id: 4, student: "Student test 1", formNumber: "VP26001", branch: "Palava Branch", date: "12/6/2025", amount: 10428.57, method: "CARD", status: "REALIZED", realizedBy: "Super Admin" },
];

const outstandingData: OutstandingRecord[] = [
  { student: "Student 2", phone: "9898988888", branch: "Thane HO Branch", dueDate: "12/8/2025", totalDue: 30000, paid: 0, balance: 30000, status: "PENDING" },
  { student: "Kabir Singh", phone: "8879012345", branch: "Kalyan Branch", dueDate: "12/16/2025", totalDue: 100000, paid: 0, balance: 100000, status: "PENDING" },
  { student: "Student test 1", phone: "7485857485", branch: "Palava Branch", dueDate: "12/17/2025", totalDue: 11428.57, paid: 10428.57, balance: 1000, status: "PARTIALLY PAID" },
  { student: "Kumar Kalani", phone: "9191919191", branch: "Thane HO Branch", dueDate: "12/22/2025", totalDue: 34000, paid: 14000, balance: 20000, status: "PARTIALLY PAID" },
];

const Payments = () => {
  const [activeTab, setActiveTab] = useState("search");
  const [selectedStudent, setSelectedStudent] = useState("1");
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);

  const currentStudent = students.find(s => s.id === selectedStudent);

  const openRecordPayment = (installment: Installment) => {
    setSelectedInstallment(installment);
    setIsRecordPaymentOpen(true);
  };

  // Calculate transaction summary
  const totalTransactions = transactions.length;
  const totalRealized = transactions.filter(t => t.status === "REALIZED").reduce((sum, t) => sum + t.amount, 0);
  const totalPending = transactions.filter(t => t.status === "PENDING").reduce((sum, t) => sum + t.amount, 0);

  // Calculate outstanding summary
  const totalOutstandingInstallments = outstandingData.length;
  const totalOutstandingAmount = outstandingData.reduce((sum, r) => sum + r.balance, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Payment Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-0">
          <TabsTrigger
            value="search"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Search Student
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Filter Transactions
          </TabsTrigger>
          <TabsTrigger
            value="outstanding"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Outstanding Report
          </TabsTrigger>
        </TabsList>

        {/* Search Student Tab */}
        <TabsContent value="search" className="mt-6 space-y-6">
          <div className="flex justify-center">
            <div className="w-full max-w-md space-y-2">
              <Label className="text-muted-foreground">Select Student Admission</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.course})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {currentStudent && (
            <>
              {/* Student Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Student</p>
                  <h3 className="text-lg font-semibold text-foreground">{currentStudent.name}</h3>
                  <p className="text-sm text-muted-foreground">Form #: {currentStudent.formNumber}</p>
                  <p className="text-sm text-muted-foreground">Course: {currentStudent.course}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Total Due</p>
                  <h3 className="text-2xl font-bold text-foreground">₹{currentStudent.totalDue.toLocaleString('en-IN')}.00</h3>
                  <p className="text-sm text-muted-foreground">{currentStudent.installments} installment(s)</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Total Paid / Balance</p>
                  <h3 className="text-2xl font-bold text-green-600">₹{currentStudent.totalPaid.toLocaleString('en-IN')}.00</h3>
                  <p className="text-sm text-destructive">₹{currentStudent.balance.toLocaleString('en-IN')}.00</p>
                </div>
              </div>

              {/* Installments */}
              <div className="space-y-4">
                {installments.map((installment) => (
                  <div key={installment.id} className="bg-card border border-border rounded-lg p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-foreground">{installment.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Due Date: {installment.dueDate}</p>
                        <p className="text-lg font-bold text-foreground">₹{installment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          {installment.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground">₹{installment.remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })} remaining</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <p className="font-medium text-foreground">Transactions</p>
                        <div className="flex gap-3">
                          <Button onClick={() => openRecordPayment(installment)} className="bg-primary hover:bg-primary/90">
                            <Plus className="h-4 w-4 mr-2" />
                            Record Payment
                          </Button>
                          <Button variant="outline">
                            <Bell className="h-4 w-4 mr-2" />
                            Send Reminder
                          </Button>
                        </div>
                      </div>
                      {installment.transactions.length === 0 ? (
                        <p className="text-sm text-muted-foreground mt-4 text-center py-4">No transactions recorded.</p>
                      ) : (
                        <div className="mt-4">
                          {/* Transactions would be listed here */}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Filter Transactions Tab */}
        <TabsContent value="transactions" className="mt-6 space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Start Date</Label>
                <Input type="date" defaultValue="2025-12-01" />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">End Date</Label>
                <Input type="date" defaultValue="2025-12-13" />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Branch</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    <SelectItem value="thane">Thane HO Branch</SelectItem>
                    <SelectItem value="palava">Palava Branch</SelectItem>
                    <SelectItem value="kalyan">Kalyan Branch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Batch</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="All Batches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    <SelectItem value="jee2026">JEE Advance Batch 2026</SelectItem>
                    <SelectItem value="neet2026">NEET Batch 2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Payment Method</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Status</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="realized">Realized</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="lg:col-span-2 flex items-end justify-end">
                <Button className="bg-primary hover:bg-primary/90">
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground">Total Transactions</p>
              <h3 className="text-3xl font-bold text-foreground mt-2">{totalTransactions}</h3>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground">Total Realized</p>
              <h3 className="text-3xl font-bold text-green-600 mt-2">₹{totalRealized.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground">Total Pending</p>
              <h3 className="text-3xl font-bold text-destructive mt-2">₹{totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Student</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Realized By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{transaction.student}</p>
                        <p className="text-sm text-muted-foreground">Form: {transaction.formNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{transaction.branch}</TableCell>
                    <TableCell className="text-foreground">₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-foreground">{transaction.date}</TableCell>
                    <TableCell className="text-foreground">{transaction.method}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={transaction.status === "REALIZED" 
                          ? "bg-green-100 text-green-800 border-green-300" 
                          : "bg-yellow-100 text-yellow-800 border-yellow-300"
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground">{transaction.realizedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Outstanding Report Tab */}
        <TabsContent value="outstanding" className="mt-6 space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Due Start Date</Label>
                <Input type="date" defaultValue="2025-11-30" />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Due End Date</Label>
                <Input type="date" defaultValue="2025-12-27" />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Branch</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    <SelectItem value="thane">Thane HO Branch</SelectItem>
                    <SelectItem value="palava">Palava Branch</SelectItem>
                    <SelectItem value="kalyan">Kalyan Branch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Batch</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="All Batches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    <SelectItem value="jee2026">JEE Advance Batch 2026</SelectItem>
                    <SelectItem value="neet2026">NEET Batch 2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button className="bg-primary hover:bg-primary/90">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground">Total Outstanding Installments</p>
              <h3 className="text-3xl font-bold text-foreground mt-2">{totalOutstandingInstallments}</h3>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground">Total Outstanding Amount</p>
              <h3 className="text-3xl font-bold text-destructive mt-2">₹{totalOutstandingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            </div>
          </div>

          {/* Outstanding Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Student</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Total Due</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outstandingData.map((row, index) => (
                  <TableRow key={index} className="hover:bg-muted/20">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{row.student}</p>
                        <p className="text-sm text-muted-foreground">Ph: {row.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{row.branch}</TableCell>
                    <TableCell className="text-foreground">{row.dueDate}</TableCell>
                    <TableCell className="text-right text-foreground">₹{row.totalDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right text-green-600">₹{row.paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right text-destructive font-medium">₹{row.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={row.status === "PARTIALLY PAID" 
                          ? "bg-orange-100 text-orange-800 border-orange-300" 
                          : "bg-muted text-muted-foreground"
                        }
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Record Payment Modal */}
      <Dialog open={isRecordPaymentOpen} onOpenChange={setIsRecordPaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment - {selectedInstallment?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" placeholder="Enter amount" defaultValue={selectedInstallment?.remaining} />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select defaultValue="cash">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Reference/Transaction ID (Optional)</Label>
              <Input placeholder="Enter reference" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsRecordPaymentOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90">Record Payment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payments;