/**
 * Mark Staff Attendance Page
 * ===========================
 * Bulk attendance marking for staff members
 * Route: /staff/attendance/mark
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Search,
  Users,
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
import { TABLES, supabase } from "@/lib/supabase";
import type {
  EmployeeReference,
  StaffAttendanceDB,
  StaffAttendanceStatus,
  MarkAttendanceEntry,
} from "./types";

const statusOptions: {
  value: StaffAttendanceStatus;
  label: string;
  color: string;
}[] = [
  { value: "Present", label: "Present", color: "bg-green-100 text-green-800" },
  { value: "Absent", label: "Absent", color: "bg-red-100 text-red-800" },
  { value: "Late", label: "Late", color: "bg-yellow-100 text-yellow-800" },
  {
    value: "Half-day",
    label: "Half-day",
    color: "bg-orange-100 text-orange-800",
  },
  { value: "On-leave", label: "On Leave", color: "bg-blue-100 text-blue-800" },
];

const MarkStaffAttendancePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [attendanceEntries, setAttendanceEntries] = useState<
    Record<string, MarkAttendanceEntry>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch active employees
  const { data: employees, isLoading: isLoadingEmployees } =
    useSupabaseTable<EmployeeReference>(TABLES.EMPLOYEES);

  // Fetch active teachers
  const { data: teachers, isLoading: isLoadingTeachers } =
    useSupabaseTable<EmployeeReference>(TABLES.TEACHERS);

  // Combine employees and teachers, filter for active status
  const allStaff = useMemo(() => {
    const combined = [
      ...(employees?.filter((e) => e.status === "active") || []),
      ...(teachers?.filter((t) => t.status === "active") || []),
    ];
    // Remove duplicates by ID
    const unique = new Map<string, EmployeeReference>();
    combined.forEach((staff) => {
      if (!unique.has(staff.id)) {
        unique.set(staff.id, staff);
      }
    });
    return Array.from(unique.values());
  }, [employees, teachers]);

  // Fetch existing attendance for selected date
  const { data: existingAttendance, isLoading: isLoadingAttendance } =
    useSupabaseTable<StaffAttendanceDB>(TABLES.TEACHER_ATTENDANCE, {
      filters: { attendance_date: selectedDate },
    });

  // Get unique departments
  const departments = useMemo(() => {
    if (!allStaff) return [];
    const depts = new Set(allStaff.map((e) => e.department).filter(Boolean));
    return Array.from(depts).sort();
  }, [allStaff]);

  // Filter staff (teachers and employees)
  const filteredStaff = useMemo(() => {
    if (!allStaff) return [];

    return allStaff.filter((staff) => {
      const matchesSearch =
        searchQuery === "" ||
        `${staff.first_name} ${staff.last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        staff.employee_code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment =
        departmentFilter === "all" || staff.department === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [allStaff, searchQuery, departmentFilter]);

  // Initialize attendance entries from existing data
  useMemo(() => {
    if (existingAttendance && existingAttendance.length > 0) {
      const entries: Record<string, MarkAttendanceEntry> = {};
      existingAttendance.forEach((record) => {
        // Find matching staff (teacher or employee)
        const staff = allStaff?.find((e) => e.id === record.teacher_id);
        if (staff) {
          entries[record.teacher_id] = {
            employee_id: record.teacher_id,
            employee_code: staff.employee_code,
            employee_name: `${staff.first_name} ${staff.last_name}`,
            designation: staff.designation,
            status: record.status,
            check_in_time: record.check_in_time,
            check_out_time: record.check_out_time,
            remarks: record.remarks,
          };
        }
      });
      setAttendanceEntries(entries);
    }
  }, [existingAttendance, allStaff]);

  // Update attendance entry for a staff member (teacher or employee)
  const updateEntry = (
    staffId: string,
    field: keyof MarkAttendanceEntry,
    value: string
  ) => {
    const staff = allStaff?.find((e) => e.id === staffId);
    if (!staff) return;

    setAttendanceEntries((prev) => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        employee_id: staffId,
        employee_code: staff.employee_code,
        employee_name: `${staff.first_name} ${staff.last_name}`,
        designation: staff.designation,
        [field]: value,
      },
    }));
  };

  // Quick action to mark all as present
  const markAllPresent = () => {
    if (!allStaff) return;

    const entries: Record<string, MarkAttendanceEntry> = {};
    filteredStaff.forEach((staff) => {
      entries[staff.id] = {
        employee_id: staff.id,
        employee_code: staff.employee_code,
        employee_name: `${staff.first_name} ${staff.last_name}`,
        designation: staff.designation,
        status: "Present",
        check_in_time: "09:00",
      };
    });
    setAttendanceEntries((prev) => ({ ...prev, ...entries }));
  };

  // Save attendance
  const handleSave = async () => {
    const entries = Object.values(attendanceEntries);

    if (entries.length === 0) {
      toast({
        title: "No attendance marked",
        description: "Please mark attendance for at least one staff member.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Prepare upsert data
      const upsertData = entries.map((entry) => ({
        teacher_id: entry.employee_id,
        attendance_date: selectedDate,
        status: entry.status,
        check_in_time: entry.check_in_time || null,
        check_out_time: entry.check_out_time || null,
        remarks: entry.remarks || null,
      }));

      // Use upsert to insert or update
      const { error } = await supabase
        .from(TABLES.TEACHER_ATTENDANCE)
        .upsert(upsertData, {
          onConflict: "teacher_id,attendance_date",
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Attendance saved for ${entries.length} staff member(s).`,
      });
      navigate("/staff/attendance");
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast({
        title: "Error",
        description: "Failed to save attendance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading =
    isLoadingEmployees || isLoadingTeachers || isLoadingAttendance;

  // Get current entry for an employee
  const getEntry = (employeeId: string): Partial<MarkAttendanceEntry> => {
    return attendanceEntries[employeeId] || {};
  };

  // Count marked entries
  const markedCount = Object.keys(attendanceEntries).length;
  const presentCount = Object.values(attendanceEntries).filter(
    (e) => e.status === "Present"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Mark Staff Attendance
          </h1>
          <p className="text-muted-foreground">
            Record daily attendance for all staff members
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={markAllPresent}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark All Present
          </Button>
          <Button onClick={handleSave} disabled={isSaving || markedCount === 0}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      </div>

      {/* Date and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Date & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Attendance Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={today}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Search Employee</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept || ""}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Summary</Label>
              <div className="flex items-center gap-4 h-10">
                <Badge variant="outline" className="h-8">
                  <Users className="mr-1 h-3 w-3" />
                  {markedCount}/{filteredStaff.length} Marked
                </Badge>
                <Badge className="h-8 bg-green-600 text-white hover:bg-green-700">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  {presentCount} Present
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Attendance</CardTitle>
          <CardDescription>
            Mark attendance status for all staff members (teachers and
            employees)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading staff...
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No staff found
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead className="w-[150px]">Status</TableHead>
                    <TableHead className="w-[120px]">Check In</TableHead>
                    <TableHead className="w-[120px]">Check Out</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((staff) => {
                    const entry = getEntry(staff.id);
                    return (
                      <TableRow key={staff.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {staff.first_name} {staff.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {staff.employee_code}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{staff.designation}</span>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={entry.status || ""}
                            onValueChange={(value) =>
                              updateEntry(staff.id, "status", value)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  <span
                                    className={`px-2 py-1 rounded text-xs ${option.color}`}
                                  >
                                    {option.label}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="time"
                            value={entry.check_in_time || ""}
                            onChange={(e) =>
                              updateEntry(
                                staff.id,
                                "check_in_time",
                                e.target.value
                              )
                            }
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="time"
                            value={entry.check_out_time || ""}
                            onChange={(e) =>
                              updateEntry(
                                staff.id,
                                "check_out_time",
                                e.target.value
                              )
                            }
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Optional remarks"
                            value={entry.remarks || ""}
                            onChange={(e) =>
                              updateEntry(staff.id, "remarks", e.target.value)
                            }
                            className="w-full"
                          />
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

export default MarkStaffAttendancePage;
