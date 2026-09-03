/**
 * Fee Collection Page - Collect and Process Fee Payments
 *
 * Features:
 * - Search students by name/ID
 * - View fee dues and history
 * - Process payments (Cash, Cheque, Online)
 * - Generate receipts
 * - Apply discounts/concessions
 *
 * Note: Currently using demo data. Full Supabase integration pending.
 */
import { useState } from "react";
import {
  IndianRupee,
  Search,
  User,
  CreditCard,
  Banknote,
  Building2,
  QrCode,
  Receipt,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  Printer,
  Download,
  History,
  Percent,
  ArrowRight,
  GraduationCap,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Demo student search results
const demoStudents = [
  {
    id: "STU001",
    name: "Arjun Sharma",
    class: "8A",
    rollNo: "12",
    parentName: "Priya Sharma",
    phone: "+91 9876543210",
    email: "priya.sharma@email.com",
    totalDues: 25000,
    photo: null,
  },
  {
    id: "STU002",
    name: "Sneha Patel",
    class: "10B",
    rollNo: "08",
    parentName: "Rajesh Patel",
    phone: "+91 9876543211",
    email: "rajesh.patel@email.com",
    totalDues: 45000,
    photo: null,
  },
  {
    id: "STU003",
    name: "Rahul Kumar",
    class: "5C",
    rollNo: "22",
    parentName: "Meena Kumar",
    phone: "+91 9876543212",
    email: "meena.kumar@email.com",
    totalDues: 0,
    photo: null,
  },
];

// Demo fee components
const demoFeeComponents = [
  { id: 1, name: "Tuition Fee", amount: 15000, dueDate: "2026-01-10", status: "pending", term: "January 2026" },
  { id: 2, name: "Transport Fee", amount: 3000, dueDate: "2026-01-10", status: "pending", term: "January 2026" },
  { id: 3, name: "Activity Fee", amount: 2000, dueDate: "2026-01-10", status: "pending", term: "January 2026" },
  { id: 4, name: "Lab Fee", amount: 1500, dueDate: "2026-01-10", status: "pending", term: "January 2026" },
  { id: 5, name: "Library Fee", amount: 500, dueDate: "2026-01-10", status: "pending", term: "January 2026" },
  { id: 6, name: "Sports Fee", amount: 1000, dueDate: "2026-01-10", status: "pending", term: "January 2026" },
  { id: 7, name: "Late Fee", amount: 500, dueDate: "2026-01-10", status: "penalty", term: "December 2025" },
];

// Demo payment history
const demoPaymentHistory = [
  { id: 1, date: "2025-12-05", amount: 22000, method: "Online", receipt: "RCP-2025-1234", status: "success" },
  { id: 2, date: "2025-11-03", amount: 22000, method: "Cash", receipt: "RCP-2025-1189", status: "success" },
  { id: 3, date: "2025-10-05", amount: 22000, method: "Cheque", receipt: "RCP-2025-1102", status: "success" },
];

const paymentMethods = [
  { id: "cash", label: "Cash", icon: Banknote, description: "Pay with cash at counter" },
  { id: "cheque", label: "Cheque", icon: Building2, description: "Pay with bank cheque" },
  { id: "online", label: "Online/UPI", icon: QrCode, description: "Pay via UPI, Net Banking" },
  { id: "card", label: "Card", icon: CreditCard, description: "Debit/Credit card payment" },
];

export const FeeCollectPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<typeof demoStudents[0] | null>(null);
  const [selectedFees, setSelectedFees] = useState<number[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const filteredStudents = searchQuery.length > 0 
    ? demoStudents.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const selectedFeeItems = demoFeeComponents.filter(f => selectedFees.includes(f.id));
  const subtotal = selectedFeeItems.reduce((acc, f) => acc + f.amount, 0);
  const discount = discountPercent ? (subtotal * parseFloat(discountPercent)) / 100 : 0;
  const total = subtotal - discount;

  const handleSelectStudent = (student: typeof demoStudents[0]) => {
    setSelectedStudent(student);
    setSearchQuery("");
    setSelectedFees([]);
  };

  const handleToggleFee = (feeId: number) => {
    setSelectedFees(prev => 
      prev.includes(feeId) 
        ? prev.filter(id => id !== feeId)
        : [...prev, feeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFees.length === demoFeeComponents.length) {
      setSelectedFees([]);
    } else {
      setSelectedFees(demoFeeComponents.map(f => f.id));
    }
  };

  const handleProcessPayment = () => {
    toast({
      title: "Payment processed successfully",
      description: `Receipt generated for ₹${total.toLocaleString()}`,
    });
    setIsConfirmOpen(false);
    setIsReceiptOpen(true);
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <IndianRupee className="h-6 w-6" />
            Collect Fee
          </h1>
          <p className="text-muted-foreground mt-1">
            Search student and process fee payment
          </p>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Student
          </CardTitle>
          <CardDescription>
            Search by student name, admission number, or ID
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter student name or ID..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Search Results Dropdown */}
          {filteredStudents.length > 0 && (
            <div className="mt-2 border rounded-lg divide-y">
              {filteredStudents.map(student => (
                <button
                  key={student.id}
                  onClick={() => handleSelectStudent(student)}
                  className="w-full p-3 flex items-center gap-4 hover:bg-muted transition-colors text-left"
                >
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(student.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.id} • Class {student.class} • Roll #{student.rollNo}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={student.totalDues > 0 ? "destructive" : "default"}>
                      {student.totalDues > 0 ? `₹${student.totalDues.toLocaleString()} Due` : "No Dues"}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Student Details */}
      {selectedStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle>Student Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {getInitials(selectedStudent.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedStudent.name}</h3>
                  <p className="text-muted-foreground">{selectedStudent.id}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>Class {selectedStudent.class} • Roll #{selectedStudent.rollNo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedStudent.parentName} (Parent)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedStudent.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedStudent.email}</span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Total Outstanding</span>
                <span className="text-xl font-bold text-destructive">
                  ₹{selectedStudent.totalDues.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Fee Components & Payment */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Fee Components</CardTitle>
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedFees.length === demoFeeComponents.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoFeeComponents.map(fee => (
                    <TableRow key={fee.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedFees.includes(fee.id)}
                          onCheckedChange={() => handleToggleFee(fee.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {fee.name}
                          {fee.status === "penalty" && (
                            <Badge variant="destructive" className="text-xs">Penalty</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{fee.term}</TableCell>
                      <TableCell>
                        <span className={new Date(fee.dueDate) < new Date() ? "text-destructive" : ""}>
                          {format(new Date(fee.dueDate), "MMM d, yyyy")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{fee.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-6" />

              {/* Payment Summary */}
              <div className="space-y-4">
                <h4 className="font-semibold">Payment Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                        <div className="grid grid-cols-2 gap-3">
                          {paymentMethods.map(method => (
                            <div key={method.id}>
                              <RadioGroupItem
                                value={method.id}
                                id={method.id}
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor={method.id}
                                className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                              >
                                <method.icon className="h-5 w-5" />
                                <span>{method.label}</span>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    {paymentMethod === "cheque" && (
                      <div className="space-y-2">
                        <Label>Cheque Number</Label>
                        <Input
                          placeholder="Enter cheque number"
                          value={chequeNumber}
                          onChange={(e) => setChequeNumber(e.target.value)}
                        />
                      </div>
                    )}

                    {(paymentMethod === "online" || paymentMethod === "card") && (
                      <div className="space-y-2">
                        <Label>Transaction ID</Label>
                        <Input
                          placeholder="Enter transaction reference"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Discount (%)</Label>
                      <div className="relative">
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          className="pl-10"
                          placeholder="0"
                          value={discountPercent}
                          onChange={(e) => setDiscountPercent(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({selectedFees.length} items)</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({discountPercent}%)</span>
                        <span>-₹{discount.toLocaleString()}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                    <Button
                      className="w-full mt-4"
                      size="lg"
                      disabled={selectedFees.length === 0}
                      onClick={() => setIsConfirmOpen(true)}
                    >
                      <IndianRupee className="h-4 w-4 mr-2" />
                      Process Payment
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Payment History */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Recent Payment History
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Receipt No</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demoPaymentHistory.map(payment => (
                      <TableRow key={payment.id}>
                        <TableCell>{format(new Date(payment.date), "MMM d, yyyy")}</TableCell>
                        <TableCell className="font-mono text-sm">{payment.receipt}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{payment.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirm Payment Modal */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Student</span>
                <span className="font-medium">{selectedStudent?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items</span>
                <span className="font-medium">{selectedFees.length} fee components</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium capitalize">{paymentMethod}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              By confirming, you acknowledge that you have received the payment from the parent/guardian.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProcessPayment} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Payment Successful
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">₹{total.toLocaleString()}</p>
              <p className="text-muted-foreground mt-1">Payment Received</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receipt No</span>
                <span className="font-mono">RCP-2026-{Math.floor(Math.random() * 10000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{format(new Date(), "MMM d, yyyy 'at' h:mm a")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Student</span>
                <span>{selectedStudent?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="capitalize">{paymentMethod}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={() => {
              setIsReceiptOpen(false);
              setSelectedStudent(null);
              setSelectedFees([]);
            }} className="flex-1">
              New Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeeCollectPage;
