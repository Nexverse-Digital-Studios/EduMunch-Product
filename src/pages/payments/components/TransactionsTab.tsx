import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Transaction } from "./types";

interface TransactionsTabProps {
  transactions: Transaction[];
}

export const TransactionsTab = ({ transactions }: TransactionsTabProps) => {
  const totalTransactions = transactions.length;
  const totalRealized = transactions
    .filter((t) => t.status === "REALIZED")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalPending = transactions
    .filter((t) => t.status === "PENDING")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
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
          <h3 className="text-3xl font-bold text-foreground mt-2">
            {totalTransactions}
          </h3>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">Total Realized</p>
          <h3 className="text-3xl font-bold text-green-600 mt-2">
            ₹
            {totalRealized.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </h3>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">Total Pending</p>
          <h3 className="text-3xl font-bold text-destructive mt-2">
            ₹
            {totalPending.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </h3>
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
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">
                        {transaction.student}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Form: {transaction.formNumber}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">
                    {transaction.branch}
                  </TableCell>
                  <TableCell className="text-foreground">
                    ₹
                    {transaction.amount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {transaction.date}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {transaction.method}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        transaction.status === "REALIZED"
                          ? "bg-green-100 text-green-800 border-green-300"
                          : "bg-yellow-100 text-yellow-800 border-yellow-300"
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground">
                    {transaction.realizedBy}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
