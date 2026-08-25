/**
 * Attendance Reports Page
 * ========================
 * Page for viewing attendance reports
 * Routes:
 * - /attendance/reports - Reports dashboard
 * - /attendance/reports/daily - Daily report
 * - /attendance/reports/weekly - Weekly report
 * - /attendance/reports/monthly - Monthly report
 * - /attendance/reports/low-attendance - Low attendance alerts
 */

import { useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Calendar,
  BarChart3,
  AlertTriangle,
  FileText,
  TrendingUp,
  TrendingDown,
  Download,
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import {
  SectionDB,
  ClassDB,
  StudentDB,
  AttendanceDB,
  AttendanceSummary,
} from "./types";

type ReportType = "daily" | "weekly" | "monthly" | "low-attendance";

export const AttendanceReportsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine report type from URL
  const pathParts = location.pathname.split("/");
  const reportType: ReportType = (pathParts[3] as ReportType) || "daily";

  const [activeTab, setActiveTab] = useState<ReportType>(reportType);
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth().toString()
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [lowAttendanceThreshold, setLowAttendanceThreshold] = useState(75);

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

  const isLoading = loadingSections || loadingStudents || loadingAttendance;

  // Get class name
  const getClassName = (classId: string) => {
    const cls = classes?.find((c) => c.id === classId);
    return cls?.class_name || "";
  };

  // Calculate student attendance summaries
  const studentSummaries = useMemo<AttendanceSummary[]>(() => {
    if (!students || !attendance) return [];

    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);

    return students
      .filter(
        (student) =>
          selectedSection === "all" || student.section_id === selectedSection
      )
      .map((student) => {
        // Filter attendance for this student in selected month
        const studentAttendance = attendance.filter((a) => {
          const date = new Date(a.attendance_date);
          const matchesStudent = a.student_id === student.id;
          const matchesMonth =
            date.getMonth() === month && date.getFullYear() === year;
          return matchesStudent && matchesMonth;
        });

        const totalDays = studentAttendance.length;
        const presentDays = studentAttendance.filter(
          (a) => a.status === "Present"
        ).length;
        const absentDays = studentAttendance.filter(
          (a) => a.status === "Absent"
        ).length;
        const lateDays = studentAttendance.filter(
          (a) => a.status === "Late"
        ).length;
        const halfDays = studentAttendance.filter(
          (a) => a.status === "Half-day"
        ).length;
        const onLeaveDays = studentAttendance.filter(
          (a) => a.status === "On-leave"
        ).length;
        const attendancePercentage =
          totalDays > 0
            ? Math.round(
                ((presentDays + lateDays * 0.5 + halfDays * 0.5) / totalDays) *
                  100
              )
            : 0;

        return {
          studentId: student.id,
          studentName: `${student.first_name} ${student.last_name}`,
          admissionNumber: student.admission_number,
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          halfDays,
          onLeaveDays,
          attendancePercentage,
        };
      });
  }, [students, attendance, selectedSection, selectedMonth, selectedYear]);

  // Low attendance students
  const lowAttendanceStudents = useMemo(() => {
    return studentSummaries
      .filter(
        (s) =>
          s.attendancePercentage < lowAttendanceThreshold && s.totalDays > 0
      )
      .sort((a, b) => a.attendancePercentage - b.attendancePercentage);
  }, [studentSummaries, lowAttendanceThreshold]);

  // Daily report data
  const dailyReport = useMemo(() => {
    if (!attendance || !sections) return [];

    return sections.map((section) => {
      const sectionAttendance = attendance.filter(
        (a) => a.section_id === section.id && a.attendance_date === selectedDate
      );

      return {
        sectionId: section.id,
        sectionName: `${getClassName(section.class_id)} - ${
          section.section_name
        }`,
        totalStudents: sectionAttendance.length,
        present: sectionAttendance.filter((a) => a.status === "Present").length,
        absent: sectionAttendance.filter((a) => a.status === "Absent").length,
        late: sectionAttendance.filter((a) => a.status === "Late").length,
        halfDay: sectionAttendance.filter((a) => a.status === "Half-day")
          .length,
        onLeave: sectionAttendance.filter((a) => a.status === "On-leave")
          .length,
      };
    });
  }, [attendance, sections, selectedDate, classes]);

  // Overall stats
  const overallStats = useMemo(() => {
    const total = studentSummaries.reduce((acc, s) => acc + s.totalDays, 0);
    const present = studentSummaries.reduce((acc, s) => acc + s.presentDays, 0);
    const avgPercentage =
      studentSummaries.length > 0
        ? Math.round(
            studentSummaries.reduce(
              (acc, s) => acc + s.attendancePercentage,
              0
            ) / studentSummaries.length
          )
        : 0;

    return { total, present, avgPercentage };
  }, [studentSummaries]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as ReportType);
    navigate(`/attendance/reports/${value === "daily" ? "" : value}`);
  };

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
          <h1 className="text-2xl font-bold">Attendance Reports</h1>
          <p className="text-muted-foreground">
            Generate and view attendance reports
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Report Type Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Daily</span>
          </TabsTrigger>
          <TabsTrigger value="weekly" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Weekly</span>
          </TabsTrigger>
          <TabsTrigger value="monthly" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Monthly</span>
          </TabsTrigger>
          <TabsTrigger value="low-attendance" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Low Attendance</span>
          </TabsTrigger>
        </TabsList>

        {/* Daily Report */}
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daily Attendance Report</CardTitle>
              <CardDescription>
                View attendance summary for a specific date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="w-48">
                  <label className="mb-1.5 block text-sm font-medium">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Section</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Present</TableHead>
                      <TableHead className="text-center">Absent</TableHead>
                      <TableHead className="text-center">Late</TableHead>
                      <TableHead className="text-center">Half-day</TableHead>
                      <TableHead className="text-center">On Leave</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyReport.map((report) => (
                      <TableRow key={report.sectionId}>
                        <TableCell className="font-medium">
                          {report.sectionName}
                        </TableCell>
                        <TableCell className="text-center">
                          {report.totalStudents}
                        </TableCell>
                        <TableCell className="text-center text-green-600">
                          {report.present}
                        </TableCell>
                        <TableCell className="text-center text-red-600">
                          {report.absent}
                        </TableCell>
                        <TableCell className="text-center text-yellow-600">
                          {report.late}
                        </TableCell>
                        <TableCell className="text-center text-orange-600">
                          {report.halfDay}
                        </TableCell>
                        <TableCell className="text-center text-blue-600">
                          {report.onLeave}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Report */}
        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Weekly Attendance Report
              </CardTitle>
              <CardDescription>
                View attendance trends for the week
              </CardDescription>
            </CardHeader>
            <CardContent className="py-8 text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Weekly report visualization coming soon</p>
              <p className="text-sm">
                Charts and graphs for weekly attendance trends
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Report */}
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Monthly Attendance Summary
              </CardTitle>
              <CardDescription>
                Student-wise attendance for the month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="w-48">
                  <label className="mb-1.5 block text-sm font-medium">
                    Section
                  </label>
                  <Select
                    value={selectedSection}
                    onValueChange={setSelectedSection}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                <div className="w-36">
                  <label className="mb-1.5 block text-sm font-medium">
                    Month
                  </label>
                  <Select
                    value={selectedMonth}
                    onValueChange={setSelectedMonth}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ].map((month, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-28">
                  <label className="mb-1.5 block text-sm font-medium">
                    Year
                  </label>
                  <Input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  />
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-4 grid-cols-3 mb-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">
                      {studentSummaries.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Students
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {overallStats.avgPercentage}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Avg Attendance
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {lowAttendanceStudents.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Below {lowAttendanceThreshold}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">Present</TableHead>
                        <TableHead className="text-center">Absent</TableHead>
                        <TableHead className="text-center">%</TableHead>
                        <TableHead className="w-32">Progress</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentSummaries.map((summary) => (
                        <TableRow key={summary.studentId}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {summary.studentName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {summary.admissionNumber}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {summary.totalDays}
                          </TableCell>
                          <TableCell className="text-center text-green-600">
                            {summary.presentDays}
                          </TableCell>
                          <TableCell className="text-center text-red-600">
                            {summary.absentDays}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                summary.attendancePercentage >= 75
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {summary.attendancePercentage}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Progress
                              value={summary.attendancePercentage}
                              className="h-2"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Low Attendance */}
        <TabsContent value="low-attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Low Attendance Alerts
              </CardTitle>
              <CardDescription>
                Students with attendance below threshold
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="w-48">
                  <label className="mb-1.5 block text-sm font-medium">
                    Section
                  </label>
                  <Select
                    value={selectedSection}
                    onValueChange={setSelectedSection}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                <div className="w-36">
                  <label className="mb-1.5 block text-sm font-medium">
                    Threshold %
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={lowAttendanceThreshold}
                    onChange={(e) =>
                      setLowAttendanceThreshold(parseInt(e.target.value) || 75)
                    }
                  />
                </div>
              </div>

              {lowAttendanceStudents.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No students below {lowAttendanceThreshold}% attendance</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lowAttendanceStudents.map((student) => (
                    <Card
                      key={student.studentId}
                      className="border-destructive/50"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                              <TrendingDown className="h-5 w-5 text-destructive" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {student.studentName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {student.admissionNumber}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="destructive" className="text-lg">
                              {student.attendancePercentage}%
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {student.presentDays}/{student.totalDays} days
                            </p>
                          </div>
                        </div>
                        <Progress
                          value={student.attendancePercentage}
                          className="mt-3 h-2"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
