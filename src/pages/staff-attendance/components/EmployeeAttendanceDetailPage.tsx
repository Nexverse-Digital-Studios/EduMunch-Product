/**
 * Employee Attendance Detail Page
 * =================================
 * View attendance history for a specific employee
 * Route: /staff/attendance/view/:employeeId
 */

import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  Briefcase,
  Mail,
  Phone,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import type {
  StaffAttendanceDB,
  StaffAttendanceStatus,
  EmployeeReference,
  AttendanceSummary,
} from "./types";

const statusColors: Record<StaffAttendanceStatus, string> = {
  Present: "bg-green-100 text-green-800",
  Absent: "bg-red-100 text-red-800",
  Late: "bg-yellow-100 text-yellow-800",
  "Half-day": "bg-orange-100 text-orange-800",
  "On-leave": "bg-blue-100 text-blue-800",
};

const EmployeeAttendanceDetailPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();

  // Date range defaults to current month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const today = now.toISOString().split("T")[0];

  const [dateFrom, setDateFrom] = useState(firstDayOfMonth);
  const [dateTo, setDateTo] = useState(today);

  // Fetch employee details
  const { data: employees, isLoading: isLoadingEmployee } =
    useSupabaseTable<EmployeeReference>(TABLES.EMPLOYEES, {
      filters: { id: employeeId },
    });

  // Fetch attendance records for this employee
  const { data: attendanceRecords, isLoading: isLoadingAttendance } =
    useSupabaseTable<StaffAttendanceDB>(TABLES.TEACHER_ATTENDANCE, {
      filters: { teacher_id: employeeId },
    });

  const employee = employees?.[0];

  // Filter records by date range
  const filteredRecords = useMemo(() => {
    if (!attendanceRecords) return [];

    return attendanceRecords
      .filter((record) => {
        const recordDate = new Date(record.attendance_date);
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        return recordDate >= fromDate && recordDate <= toDate;
      })
      .sort(
        (a, b) =>
          new Date(b.attendance_date).getTime() -
          new Date(a.attendance_date).getTime()
      );
  }, [attendanceRecords, dateFrom, dateTo]);

  // Calculate attendance summary
  const summary: AttendanceSummary = useMemo(() => {
    const records = filteredRecords;
    const total = records.length;
    const present = records.filter((r) => r.status === "Present").length;
    const absent = records.filter((r) => r.status === "Absent").length;
    const late = records.filter((r) => r.status === "Late").length;
    const halfDay = records.filter((r) => r.status === "Half-day").length;
    const onLeave = records.filter((r) => r.status === "On-leave").length;

    return {
      total_days: total,
      present,
      absent,
      late,
      half_day: halfDay,
      on_leave: onLeave,
      attendance_percentage:
        total > 0 ? Math.round((present / total) * 100) : 0,
    };
  }, [filteredRecords]);

  const isLoading = isLoadingEmployee || isLoadingAttendance;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Employee Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              The employee you're looking for doesn't exist or has been removed.
            </p>
            <Button
              className="mt-4"
              onClick={() => navigate("/staff/attendance/view")}
            >
              Back to Attendance List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {employee.first_name} {employee.last_name}
          </h1>
          <p className="text-muted-foreground">Attendance History</p>
        </div>
      </div>

      {/* Employee Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Employee Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Code</Badge>
              <span className="font-medium">{employee.employee_code}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{employee.designation}</span>
            </div>
            {employee.department && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{employee.department}</Badge>
              </div>
            )}
            <div>
              <Badge
                className={
                  employee.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {employee.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 max-w-md">
            <div className="space-y-2">
              <Label>From</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                max={dateTo}
              />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom}
                max={today}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Attendance Summary
            </CardTitle>
            <CardDescription>
              For selected date range ({filteredRecords.length} days)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Attendance Rate</span>
                <span className="font-medium">
                  {summary.attendance_percentage}%
                </span>
              </div>
              <Progress value={summary.attendance_percentage} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-green-600">
                  {summary.present}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-red-600">
                  {summary.absent}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Late</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {summary.late}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">On Leave</p>
                <p className="text-2xl font-bold text-blue-600">
                  {summary.on_leave}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Present</span>
                </div>
                <span className="font-medium">{summary.present}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Absent</span>
                </div>
                <span className="font-medium">{summary.absent}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Late</span>
                </div>
                <span className="font-medium">{summary.late}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>Half-day</span>
                </div>
                <span className="font-medium">{summary.half_day}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>On Leave</span>
                </div>
                <span className="font-medium">{summary.on_leave}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>Day-by-day attendance log</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No attendance records found for the selected date range
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => {
                    const date = new Date(record.attendance_date);
                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          {date.toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          {date.toLocaleDateString("en-IN", {
                            weekday: "short",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[record.status]}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.check_in_time || "-"}</TableCell>
                        <TableCell>{record.check_out_time || "-"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {record.remarks || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeAttendanceDetailPage;
