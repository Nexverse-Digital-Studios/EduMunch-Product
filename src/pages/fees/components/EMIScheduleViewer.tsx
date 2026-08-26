/**
 * EMI Schedule Viewer Component
 *
 * Displays the complete EMI payment schedule with individual installments,
 * due dates, and payment status tracking
 */

import { useState, useMemo } from "react";
import { format, isPast, differenceInDays } from "date-fns";
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { EMI_CONFIG } from "@/config/emiConfig";
import { EMIScheduleItem, generateEMISchedule } from "@/lib/emiCalculations";

interface EMIScheduleViewerProps {
  feeAmount: number;
  tenureMonths: number;
  interestRate: number;
  startDate?: Date;
  paidAmount?: number;
  studentName?: string;
  studentId?: string;
}

interface ScheduleItemWithStatus extends EMIScheduleItem {
  status: "pending" | "paid" | "overdue" | "upcoming";
  daysOverdue: number;
}

export const EMIScheduleViewer = ({
  feeAmount,
  tenureMonths,
  interestRate,
  startDate = new Date(),
  paidAmount = 0,
  studentName = "Student",
  studentId = "",
}: EMIScheduleViewerProps) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<ScheduleItemWithStatus | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const schedule = useMemo(() => {
    const baseSchedule = generateEMISchedule(
      {
        principal: feeAmount,
        annualInterestRate: interestRate,
        tenureMonths: tenureMonths,
      },
      startDate
    );

    // Add status and overdue calculation
    return baseSchedule.map((item) => {
      const today = new Date();
      let status: "pending" | "paid" | "overdue" | "upcoming" = "pending";
      let daysOverdue = 0;

      if (paidAmount >= item.cumulativePrincipal + item.cumulativeInterest) {
        status = "paid";
      } else if (isPast(item.dueDate) && item.dueDate < today) {
        daysOverdue = differenceInDays(today, item.dueDate);
        status =
          daysOverdue > EMI_CONFIG.PENALTY_GRACE_PERIOD_DAYS
            ? "overdue"
            : "pending";
      } else if (differenceInDays(item.dueDate, today) > 30) {
        status = "upcoming";
      }

      return {
        ...item,
        status,
        daysOverdue,
      };
    });
  }, [feeAmount, tenureMonths, interestRate, startDate, paidAmount]);

  const stats = useMemo(() => {
    const totalPayable = schedule.reduce(
      (sum, item) => sum + item.emiAmount,
      0
    );
    const completed = schedule.filter((item) => item.status === "paid").length;
    const overdue = schedule.filter((item) => item.status === "overdue").length;
    const remaining = tenureMonths - completed;
    const progressPercent = (completed / tenureMonths) * 100;

    return {
      totalPayable,
      completed,
      overdue,
      remaining,
      progressPercent,
    };
  }, [schedule, tenureMonths]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-600" />;
      case "upcoming":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Paid
          </Badge>
        );
      case "overdue":
        return (
          <Badge
            variant="destructive"
            className="bg-red-100 text-red-800 hover:bg-red-100"
          >
            Overdue
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Due Soon
          </Badge>
        );
      case "upcoming":
        return <Badge variant="outline">Upcoming</Badge>;
      default:
        return null;
    }
  };

  const downloadSchedule = () => {
    const csv = generateCSV(schedule);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EMI_Schedule_${studentId}_${format(
      new Date(),
      "dd-MM-yyyy"
    )}.csv`;
    a.click();
  };

  const generateCSV = (data: ScheduleItemWithStatus[]): string => {
    const headers = [
      "EMI #",
      "Due Date",
      "Amount",
      "Principal",
      "Interest",
      "Status",
    ];
    const rows = data.map((item) => [
      item.emiNumber,
      format(item.dueDate, "dd-MMM-yyyy"),
      item.emiAmount.toFixed(2),
      item.principalComponent.toFixed(2),
      item.interestComponent.toFixed(2),
      item.status.charAt(0).toUpperCase() + item.status.slice(1),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    return csvContent;
  };

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">EMI Payment Schedule</CardTitle>
              <CardDescription>{studentName}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Payment Progress
              </span>
              <span className="text-sm font-semibold text-foreground">
                {stats.completed}/{tenureMonths} Paid
              </span>
            </div>
            <Progress value={stats.progressPercent} className="h-2" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Total EMI</p>
              <p className="text-sm font-bold text-foreground">
                ₹
                {stats.totalPayable.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Completed</p>
              <p className="text-sm font-bold text-green-700">
                {stats.completed}
              </p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Remaining</p>
              <p className="text-sm font-bold text-amber-700">
                {stats.remaining}
              </p>
            </div>
            {stats.overdue > 0 && (
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Overdue</p>
                <p className="text-sm font-bold text-red-700">
                  {stats.overdue}
                </p>
              </div>
            )}
          </div>

          {/* Download Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={downloadSchedule}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Schedule
          </Button>
        </CardContent>
      </Card>

      {/* Schedule Table */}
      {expanded && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Complete Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-12">EMI #</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Principal</TableHead>
                    <TableHead className="text-right">Interest</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule.map((item) => (
                    <TableRow
                      key={item.emiNumber}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelectedSchedule(item);
                        setShowDetails(true);
                      }}
                    >
                      <TableCell className="font-semibold">
                        {item.emiNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <span className="text-sm">
                            {format(item.dueDate, "dd MMM yyyy")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹
                        {item.emiAmount.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        ₹
                        {item.principalComponent.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right text-sm text-amber-600">
                        ₹
                        {item.interestComponent.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(item.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Footer Summary */}
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Principal
                  </p>
                  <p className="font-semibold">
                    ₹
                    {schedule
                      .reduce((sum, item) => sum + item.principalComponent, 0)
                      .toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Interest
                  </p>
                  <p className="font-semibold text-amber-600">
                    ₹
                    {schedule
                      .reduce((sum, item) => sum + item.interestComponent, 0)
                      .toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Payable</p>
                  <p className="font-bold text-lg">
                    ₹
                    {stats.totalPayable.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              EMI Installment #{selectedSchedule?.emiNumber}
            </DialogTitle>
            <DialogDescription>
              {selectedSchedule &&
                format(selectedSchedule.dueDate, "EEEE, dd MMMM yyyy")}
            </DialogDescription>
          </DialogHeader>

          {selectedSchedule && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    EMI Amount
                  </span>
                  <span className="font-bold text-lg">
                    ₹
                    {selectedSchedule.emiAmount.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Principal Component
                    </span>
                    <span>
                      ₹
                      {selectedSchedule.principalComponent.toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 2,
                        }
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Interest Component
                    </span>
                    <span className="text-amber-600">
                      ₹
                      {selectedSchedule.interestComponent.toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 2,
                        }
                      )}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    {getStatusBadge(selectedSchedule.status)}
                  </div>
                  {selectedSchedule.status === "overdue" && (
                    <p className="text-xs text-red-600 mt-2">
                      {selectedSchedule.daysOverdue} days overdue
                    </p>
                  )}
                </div>
              </div>

              {selectedSchedule.status !== "paid" && (
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Pay Now
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EMIScheduleViewer;
