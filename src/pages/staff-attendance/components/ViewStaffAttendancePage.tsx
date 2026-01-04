/**
 * View Staff Attendance Page
 * ===========================
 * View and filter all staff attendance records
 * Route: /staff/attendance/view
 */

import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Calendar,
  Eye,
  Download,
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
import { useToast } from "@/hooks/use-toast";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import type {
  StaffAttendanceDB,
  StaffAttendanceStatus,
  EmployeeReference,
} from "./types";

const statusColors: Record<StaffAttendanceStatus, string> = {
  Present: "bg-green-100 text-green-800",
  Absent: "bg-red-100 text-red-800",
  Late: "bg-yellow-100 text-yellow-800",
  "Half-day": "bg-orange-100 text-orange-800",
  "On-leave": "bg-blue-100 text-blue-800",
};

const ViewStaffAttendancePage = () => {
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];

  // Filter states
  const [dateFrom, setDateFrom] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [dateTo, setDateTo] = useState(today);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch attendance records
  const { data: attendanceRecords, isLoading: isLoadingAttendance } =
    useSupabaseTable<StaffAttendanceDB>(TABLES.TEACHER_ATTENDANCE);

  // Fetch employees for reference
  const { data: employees, isLoading: isLoadingEmployees } =
    useSupabaseTable<EmployeeReference>(TABLES.EMPLOYEES);

  // Create employee lookup
  const employeeMap = useMemo(() => {
    const map = new Map<string, EmployeeReference>();
    employees?.forEach((emp) => map.set(emp.id, emp));
    return map;
  }, [employees]);

  // Filter and enrich attendance records
  const filteredRecords = useMemo(() => {
    if (!attendanceRecords) return [];

    return attendanceRecords
      .filter((record) => {
        // Date range filter
        const recordDate = new Date(record.attendance_date);
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        if (recordDate < fromDate || recordDate > toDate) return false;

        // Status filter
        if (statusFilter !== "all" && record.status !== statusFilter)
          return false;

        // Search filter (by employee name or code)
        if (searchQuery) {
          const emp = employeeMap.get(record.teacher_id);
          if (emp) {
            const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
            const code = emp.employee_code.toLowerCase();
            const query = searchQuery.toLowerCase();
            if (!fullName.includes(query) && !code.includes(query))
              return false;
          } else {
            return false;
          }
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.attendance_date).getTime() -
          new Date(a.attendance_date).getTime()
      );
  }, [
    attendanceRecords,
    dateFrom,
    dateTo,
    statusFilter,
    searchQuery,
    employeeMap,
  ]);

  const isLoading = isLoadingAttendance || isLoadingEmployees;

  // Get employee name
  const getEmployeeName = (teacherId: string) => {
    const emp = employeeMap.get(teacherId);
    return emp ? `${emp.first_name} ${emp.last_name}` : "Unknown";
  };

  const getEmployeeCode = (teacherId: string) => {
    const emp = employeeMap.get(teacherId);
    return emp?.employee_code || "N/A";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            View Staff Attendance
          </h1>
          <p className="text-muted-foreground">
            Browse and filter attendance records
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => toast({
            title: "Export",
            description: "Export functionality coming soon"
          })}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  max={dateTo}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  min={dateFrom}
                  max={today}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="Half-day">Half-day</SelectItem>
                  <SelectItem value="On-leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Search Employee</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            {filteredRecords.length} record(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading records...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No attendance records found for the selected filters
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {new Date(record.attendance_date).toLocaleDateString(
                          "en-IN"
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {getEmployeeName(record.teacher_id)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getEmployeeCode(record.teacher_id)}
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
                      <TableCell>
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            to={`/staff/attendance/view/${record.teacher_id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
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

export default ViewStaffAttendancePage;
