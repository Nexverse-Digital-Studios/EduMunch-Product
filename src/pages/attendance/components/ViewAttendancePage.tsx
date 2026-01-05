/**
 * View Attendance Page
 * =====================
 * Page for viewing attendance records
 * Routes:
 * - /attendance/view - View all attendance
 * - /attendance/view/:sectionId - View section-wise attendance
 * - /attendance/view/student/:studentId - View student attendance history
 */

import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Calendar,
  Users,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import {
  SectionDB,
  ClassDB,
  StudentDB,
  AttendanceDB,
  AttendanceStatus,
} from "./types";

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  Present: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Absent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  Late: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  "Half-day":
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  "On-leave": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
};

export const ViewAttendancePage = () => {
  const { sectionId, studentId } = useParams<{
    sectionId?: string;
    studentId?: string;
  }>();
  const navigate = useNavigate();

  const [selectedSection, setSelectedSection] = useState<string>(
    sectionId || "all"
  );
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dateRange, setDateRange] = useState<"day" | "week" | "month">("day");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data
  const { data: sections, isLoading: loadingSections } =
    useSupabaseTable<SectionDB>(TABLES.SECTIONS, {
      orderBy: { column: "section_name", ascending: true },
    });

  const { data: classes } = useSupabaseTable<ClassDB>(TABLES.CLASSES, {
    orderBy: { column: "display_order", ascending: true },
  });

  const { data: students, isLoading: loadingStudents } =
    useSupabaseTable<StudentDB>(TABLES.STUDENTS, {
      orderBy: { column: "first_name", ascending: true },
    });

  const { data: attendance, isLoading: loadingAttendance } =
    useSupabaseTable<AttendanceDB>(TABLES.ATTENDANCE, {
      orderBy: { column: "attendance_date", ascending: false },
    });

  // Get class name for section
  const getClassName = (classId: string) => {
    const cls = classes?.find((c) => c.id === classId);
    return cls?.class_name || "";
  };

  // Get student name
  const getStudentName = (id: string) => {
    const student = students?.find((s) => s.id === id);
    return student ? `${student.first_name} ${student.last_name}` : "Unknown";
  };

  // Filter attendance records
  const filteredAttendance = useMemo(() => {
    if (!attendance) return [];

    let filtered = attendance;

    // Filter by section
    if (selectedSection && selectedSection !== "all") {
      filtered = filtered.filter((a) => a.section_id === selectedSection);
    }

    // Filter by student (if studentId is provided)
    if (studentId) {
      filtered = filtered.filter((a) => a.student_id === studentId);
    }

    // Filter by date range
    const selectedDateObj = new Date(selectedDate);
    if (dateRange === "day") {
      filtered = filtered.filter((a) => a.attendance_date === selectedDate);
    } else if (dateRange === "week") {
      const startOfWeek = new Date(selectedDateObj);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      filtered = filtered.filter((a) => {
        const date = new Date(a.attendance_date);
        return date >= startOfWeek && date <= endOfWeek;
      });
    } else if (dateRange === "month") {
      const month = selectedDateObj.getMonth();
      const year = selectedDateObj.getFullYear();
      filtered = filtered.filter((a) => {
        const date = new Date(a.attendance_date);
        return date.getMonth() === month && date.getFullYear() === year;
      });
    }

    // Filter by search query (student name)
    if (searchQuery) {
      filtered = filtered.filter((a) => {
        const studentName = getStudentName(a.student_id).toLowerCase();
        return studentName.includes(searchQuery.toLowerCase());
      });
    }

    return filtered;
  }, [
    attendance,
    selectedSection,
    selectedDate,
    dateRange,
    searchQuery,
    studentId,
    students,
  ]);

  // Summary stats
  const summary = useMemo(() => {
    return {
      total: filteredAttendance.length,
      present: filteredAttendance.filter((a) => a.status === "Present").length,
      absent: filteredAttendance.filter((a) => a.status === "Absent").length,
      late: filteredAttendance.filter((a) => a.status === "Late").length,
      halfDay: filteredAttendance.filter((a) => a.status === "Half-day").length,
    };
  }, [filteredAttendance]);

  const isLoading = loadingSections || loadingStudents || loadingAttendance;

  // If viewing specific student
  const viewingStudent = studentId
    ? students?.find((s) => s.id === studentId)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/attendance")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {viewingStudent
              ? `Attendance - ${viewingStudent.first_name} ${viewingStudent.last_name}`
              : "View Attendance"}
          </h1>
          <p className="text-muted-foreground">
            {viewingStudent
              ? `Admission No: ${viewingStudent.admission_number}`
              : "View and filter attendance records"}
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filter Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {!studentId && (
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Section
                </label>
                <Select
                  value={selectedSection}
                  onValueChange={setSelectedSection}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Sections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {sections?.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {getClassName(section.class_id)} -{" "}
                        {section.section_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Date</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const date = new Date(selectedDate);
                    date.setDate(date.getDate() - 1);
                    setSelectedDate(date.toISOString().split("T")[0]);
                  }}
                  title="Previous day"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const date = new Date(selectedDate);
                    date.setDate(date.getDate() + 1);
                    setSelectedDate(date.toISOString().split("T")[0]);
                  }}
                  title="Next day"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Range</label>
              <Select
                value={dateRange}
                onValueChange={(v) =>
                  setDateRange(v as "day" | "week" | "month")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Single Day</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!studentId && (
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Search Student
                </label>
                <Input
                  placeholder="Search by name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{summary.total}</p>
            <p className="text-sm text-muted-foreground">Total Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {summary.present}
            </p>
            <p className="text-sm text-muted-foreground">Present</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
            <p className="text-sm text-muted-foreground">Absent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{summary.late}</p>
            <p className="text-sm text-muted-foreground">Late</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {summary.halfDay}
            </p>
            <p className="text-sm text-muted-foreground">Half-day</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {summary.onLeave}
            </p>
            <p className="text-sm text-muted-foreground">On Leave</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading attendance records...</span>
        </div>
      ) : filteredAttendance.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No attendance records found for the selected filters</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>Marked At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map((record) => {
                  const section = sections?.find(
                    (s) => s.id === record.section_id
                  );
                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        {new Date(record.attendance_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {getStudentName(record.student_id)}
                      </TableCell>
                      <TableCell>
                        {section
                          ? `${getClassName(section.class_id)} - ${
                              section.section_name
                            }`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[record.status]}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {record.remarks || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {record.marked_at
                          ? new Date(record.marked_at).toLocaleString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredAttendance.map((record) => {
              const section = sections?.find((s) => s.id === record.section_id);
              return (
                <Card key={record.id}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {getStudentName(record.student_id)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {section
                            ? `${getClassName(section.class_id)} - ${
                                section.section_name
                              }`
                            : "-"}
                        </p>
                      </div>
                      <Badge className={STATUS_COLORS[record.status]}>
                        {record.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        {new Date(record.attendance_date).toLocaleDateString()}
                      </span>
                      {record.remarks && <span>{record.remarks}</span>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
