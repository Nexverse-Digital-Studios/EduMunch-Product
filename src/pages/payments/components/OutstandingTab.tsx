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
import { OutstandingRecord } from "./types";

interface OutstandingTabProps {
  outstandingData: OutstandingRecord[];
}

export const OutstandingTab = ({ outstandingData }: OutstandingTabProps) => {
  const totalOutstandingInstallments = outstandingData.length;
  const totalOutstandingAmount = outstandingData.reduce(
    (sum, r) => sum + r.balance,
    0
  );

  return (
    <div className="space-y-6">
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
          <p className="text-sm text-muted-foreground">
            Total Outstanding Installments
          </p>
          <h3 className="text-3xl font-bold text-foreground mt-2">
            {totalOutstandingInstallments}
          </h3>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Total Outstanding Amount
          </p>
          <h3 className="text-3xl font-bold text-destructive mt-2">
            ₹
            {totalOutstandingAmount.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </h3>
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
            {outstandingData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No outstanding records found
                </TableCell>
              </TableRow>
            ) : (
              outstandingData.map((row, index) => (
                <TableRow key={index} className="hover:bg-muted/20">
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">
                        {row.student}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ph: {row.phone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">
                    {row.branch}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {row.dueDate}
                  </TableCell>
                  <TableCell className="text-right text-foreground">
                    ₹
                    {row.totalDue.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    ₹
                    {row.paid.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right text-destructive font-medium">
                    ₹
                    {row.balance.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        row.status === "PARTIALLY PAID"
                          ? "bg-orange-100 text-orange-800 border-orange-300"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {row.status}
                    </Badge>
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
