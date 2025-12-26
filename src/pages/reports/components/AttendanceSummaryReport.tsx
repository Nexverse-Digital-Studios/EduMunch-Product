/**
 * AttendanceSummaryReport Component
 * ==================================
 * Generate attendance summary reports
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileText,
  Filter,
  CalendarCheck,
  CalendarX,
  Search,
  Printer,
  BarChart3,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { AttendancePatternAnalytics, ClassInfo, SectionInfo } from "./types";

const INDEX_TOKEN = "1emaet";

interface StudentInfo {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  class_id: string;
  section_id: string;
  status: string;
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  marked_by: string | null;
}

export function AttendanceSummaryReport() {
  const [classFilter, setClassFilter] = useState<string>("all");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().setDate(1)), // First of current month
    to: new Date(),
  });

  const { canView } = useModulePermissions("reports");
  const { toast } = useToast();

  // Fetch data
  const { data: students, isLoading: loadingStudents } =
    useSupabaseTable<StudentInfo>(`students_${INDEX_TOKEN}`, {
      filters: { status: "active" },
    });

  const { data: classes } = useSupabaseTable<ClassInfo>(
    `classes_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const { data: sections } = useSupabaseTable<SectionInfo>(
    `sections_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const { data: attendancePatterns } =
    useSupabaseTable<AttendancePatternAnalytics>(
      `analytics_attendance_patterns_${INDEX_TOKEN}`,
      { filters: {} }
    );

  // Create lookup maps
  const classMap = useMemo(() => {
    if (!classes) return new Map<string, ClassInfo>();
    return new Map(classes.map((c) => [c.id, c]));
  }, [classes]);

  const sectionMap = useMemo(() => {
    if (!sections) return new Map<string, SectionInfo>();
    return new Map(sections.map((s) => [s.id, s]));
  }, [sections]);

  const patternMap = useMemo(() => {
    if (!attendancePatterns)
      return new Map<string, AttendancePatternAnalytics>();
    return new Map(attendancePatterns.map((p) => [p.student_id, p]));
  }, [attendancePatterns]);

  // Filter sections by class
  const filteredSections = useMemo(() => {
    if (!sections || classFilter === "all") return sections || [];
    return sections.filter((s) => s.class_id === classFilter);
  }, [sections, classFilter]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    if (!students) return [];

    return students.filter((student) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        student.first_name.toLowerCase().includes(searchLower) ||
        student.last_name.toLowerCase().includes(searchLower) ||
        student.admission_number.toLowerCase().includes(searchLower);

      const matchesClass =
        classFilter === "all" || student.class_id === classFilter;

      const matchesSection =
        sectionFilter === "all" || student.section_id === sectionFilter;

      return matchesSearch && matchesClass && matchesSection;
    });
  }, [students, searchQuery, classFilter, sectionFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const studentsWithPatterns = filteredStudents.map((s) => ({
      ...s,
      pattern: patternMap.get(s.id),
    }));

    const withData = studentsWithPatterns.filter((s) => s.pattern);
    const avgAttendance =
      withData.length > 0
        ? withData.reduce(
            (sum, s) => sum + (s.pattern?.attendance_percentage || 0),
            0
          ) / withData.length
        : 0;

    const riskCounts = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0,
    };

    const interventionRequired = withData.filter(
      (s) => s.pattern?.intervention_required
    ).length;

    withData.forEach((s) => {
      if (s.pattern?.dropout_risk_level) {
        riskCounts[s.pattern.dropout_risk_level]++;
      }
    });

    return {
      totalStudents: filteredStudents.length,
      avgAttendance: avgAttendance.toFixed(1),
      riskCounts,
      interventionRequired,
      dataAvailable: withData.length,
    };
  }, [filteredStudents, patternMap]);

  const handleExportPDF = () => {
    toast({
      title: "Exporting Report",
      description: "Generating PDF report...",
    });
    window.print();
  };

  const handleExportExcel = () => {
    toast({
      title: "Exporting Report",
      description: "Generating Excel report...",
    });
  };

  const handleExportCSV = () => {
    toast({
      title: "Exporting Report",
      description: "Generating CSV report...",
    });
  };

  const getRiskBadgeVariant = (risk: string | null | undefined) => {
    switch (risk) {
      case "Critical":
        return "destructive";
      case "High":
        return "destructive";
      case "Medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getAttendanceColor = (percentage: number | null | undefined) => {
    if (!percentage) return "bg-gray-200";
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loadingStudents) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/reports">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Attendance Summary Report</h1>
            <p className="text-muted-foreground">
              Comprehensive attendance statistics and patterns
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button onClick={handleExportPDF}>
            <Printer className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <CalendarCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Attendance</p>
                <p className="text-2xl font-bold">{stats.avgAttendance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold">
                  {stats.riskCounts.High + stats.riskCounts.Critical}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <CalendarX className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Need Intervention
                </p>
                <p className="text-2xl font-bold">
                  {stats.interventionRequired}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or admission number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={classFilter}
              onValueChange={(v) => {
                setClassFilter(v);
                setSectionFilter("all");
              }}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes?.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.class_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {filteredSections.map((sec) => (
                  <SelectItem key={sec.id} value={sec.id}>
                    Section {sec.section_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Report Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Attendance Data ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <CalendarCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No students found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Attendance %</TableHead>
                  <TableHead>Consecutive Absences</TableHead>
                  <TableHead>Dropout Risk</TableHead>
                  <TableHead>Frequent Absence Days</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const classInfo = classMap.get(student.class_id);
                  const sectionInfo = sectionMap.get(student.section_id);
                  const pattern = patternMap.get(student.id);

                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {student.admission_number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {classInfo && sectionInfo ? (
                          <Badge variant="outline">
                            {classInfo.class_name} - {sectionInfo.section_name}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {pattern?.attendance_percentage !== null &&
                        pattern?.attendance_percentage !== undefined ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {pattern.attendance_percentage}%
                            </span>
                            <div className="w-16 h-2 rounded-full bg-gray-200 overflow-hidden">
                              <div
                                className={`h-full ${getAttendanceColor(
                                  pattern.attendance_percentage
                                )}`}
                                style={{
                                  width: `${pattern.attendance_percentage}%`,
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {pattern?.consecutive_absences !== null &&
                        pattern?.consecutive_absences !== undefined ? (
                          <Badge
                            variant={
                              pattern.consecutive_absences > 3
                                ? "destructive"
                                : pattern.consecutive_absences > 1
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {pattern.consecutive_absences} days
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0 days</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {pattern?.dropout_risk_level ? (
                          <Badge
                            variant={getRiskBadgeVariant(
                              pattern.dropout_risk_level
                            )}
                          >
                            {pattern.dropout_risk_level}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Unknown</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {pattern?.frequent_absence_days &&
                        pattern.frequent_absence_days.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {pattern.frequent_absence_days
                              .slice(0, 2)
                              .map((day) => (
                                <Badge
                                  key={day}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {day}
                                </Badge>
                              ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {pattern?.intervention_required ? (
                          <Badge variant="destructive">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Needs Attention
                          </Badge>
                        ) : pattern?.irregular_pattern_detected ? (
                          <Badge variant="secondary">Irregular</Badge>
                        ) : (
                          <Badge variant="outline">Normal</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
