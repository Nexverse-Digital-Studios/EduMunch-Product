/**
 * Monthly Staff Attendance Report Page
 * =====================================
 * Detailed monthly attendance report
 * Route: /staff/attendance/reports/monthly
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Download, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import type {
  StaffAttendanceDB,
  EmployeeReference,
  EmployeeAttendanceSummary,
} from "./types";

const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const MonthlyReportPage = () => {
  const navigate = useNavigate();
  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(
    (now.getMonth() + 1).toString()
  );
  const [selectedYear, setSelectedYear] = useState(
    now.getFullYear().toString()
  );

  // Generate year options (last 5 years)
  const years = Array.from({ length: 5 }, (_, i) =>
    (now.getFullYear() - i).toString()
  );

  // Fetch all employees
  const { data: employees, isLoading: isLoadingEmployees } =
    useSupabaseTable<EmployeeReference>(TABLES.EMPLOYEES, {
      filters: { status: "active" },
    });

  // Fetch all attendance records
  const { data: attendanceRecords, isLoading: isLoadingAttendance } =
    useSupabaseTable<StaffAttendanceDB>(TABLES.TEACHER_ATTENDANCE);

  // Calculate report data
  const reportData = useMemo(() => {
    if (!employees || !attendanceRecords) return [];

    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);

    // Filter records for selected month
    const monthRecords = attendanceRecords.filter((record) => {
      const date = new Date(record.attendance_date);
      return date.getMonth() + 1 === month && date.getFullYear() === year;
    });

    // Calculate summary for each employee
    return employees
      .map((emp): EmployeeAttendanceSummary => {
        const empRecords = monthRecords.filter((r) => r.teacher_id === emp.id);
        const total = empRecords.length;
        const present = empRecords.filter((r) => r.status === "Present").length;
        const absent = empRecords.filter((r) => r.status === "Absent").length;
        const late = empRecords.filter((r) => r.status === "Late").length;
        const halfDay = empRecords.filter(
          (r) => r.status === "Half-day"
        ).length;
        const onLeave = empRecords.filter(
          (r) => r.status === "On-leave"
        ).length;

        return {
          employee_id: emp.id,
          employee_name: `${emp.first_name} ${emp.last_name}`,
          employee_code: emp.employee_code,
          designation: emp.designation,
          total_days: total,
          present,
          absent,
          late,
          half_day: halfDay,
          on_leave: onLeave,
          attendance_percentage:
            total > 0 ? Math.round((present / total) * 100) : 0,
        };
      })
      .sort((a, b) => b.attendance_percentage - a.attendance_percentage);
  }, [employees, attendanceRecords, selectedMonth, selectedYear]);

  // Calculate overall stats
  const overallStats = useMemo(() => {
    if (reportData.length === 0) return null;

    const totalPresent = reportData.reduce((sum, r) => sum + r.present, 0);
    const totalDays = reportData.reduce((sum, r) => sum + r.total_days, 0);
    const avgPercentage = Math.round(
      reportData.reduce((sum, r) => sum + r.attendance_percentage, 0) /
        reportData.length
    );

    return {
      totalEmployees: reportData.length,
      totalPresent,
      totalDays,
      avgPercentage,
      topPerformers: reportData.filter((r) => r.attendance_percentage >= 95)
        .length,
      lowAttendance: reportData.filter((r) => r.attendance_percentage < 75)
        .length,
    };
  }, [reportData]);

  const isLoading = isLoadingEmployees || isLoadingAttendance;

  const handleExport = () => {
    // In real implementation, this would generate and download a report
    console.log("Exporting monthly report...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Monthly Attendance Report
            </h1>
            <p className="text-muted-foreground">
              Detailed breakdown of staff attendance by month
            </p>
          </div>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Month/Year Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2 w-48">
              <Label>Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 w-32">
              <Label>Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Stats */}
      {overallStats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Employees</CardDescription>
              <CardTitle className="text-3xl">
                {overallStats.totalEmployees}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg. Attendance Rate</CardDescription>
              <CardTitle className="text-3xl">
                {overallStats.avgPercentage}%
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Top Performers (≥95%)</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {overallStats.topPerformers}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Low Attendance (&lt;75%)</CardDescription>
              <CardTitle className="text-3xl text-red-600">
                {overallStats.lowAttendance}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Report Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Employee Attendance Summary
          </CardTitle>
          <CardDescription>
            {months.find((m) => m.value === selectedMonth)?.label}{" "}
            {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading report data...
            </div>
          ) : reportData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No attendance data available for the selected period
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                    <TableHead className="text-center">Late</TableHead>
                    <TableHead className="text-center">Leave</TableHead>
                    <TableHead className="w-[180px]">Attendance %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row) => (
                    <TableRow key={row.employee_id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{row.employee_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {row.employee_code}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{row.designation}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700"
                        >
                          {row.present}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700"
                        >
                          {row.absent}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="bg-yellow-50 text-yellow-700"
                        >
                          {row.late}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700"
                        >
                          {row.on_leave}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={row.attendance_percentage}
                            className="h-2 flex-1"
                          />
                          <span
                            className={`text-sm font-medium w-12 text-right ${
                              row.attendance_percentage >= 90
                                ? "text-green-600"
                                : row.attendance_percentage >= 75
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {row.attendance_percentage}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyReportPage;
