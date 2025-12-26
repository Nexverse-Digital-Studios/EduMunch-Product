/**
 * StudentPerformanceReport Component
 * ===================================
 * Generate detailed student performance reports
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileText,
  Filter,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Search,
  Printer,
  BarChart3,
  Users,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import {
  StudentPerformanceAnalytics,
  ClassInfo,
  SectionInfo,
  SubjectInfo,
  AcademicYearInfo,
} from "./types";

const INDEX_TOKEN = "1emaet";

interface StudentWithPerformance {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  class_id: string;
  section_id: string;
  status: string;
}

export function StudentPerformanceReport() {
  const [classFilter, setClassFilter] = useState<string>("all");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { canView } = useModulePermissions("reports");
  const { toast } = useToast();

  // Fetch data
  const { data: students, isLoading: loadingStudents } =
    useSupabaseTable<StudentWithPerformance>(`students_${INDEX_TOKEN}`, {
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

  const { data: performanceData } =
    useSupabaseTable<StudentPerformanceAnalytics>(
      `analytics_student_performance_${INDEX_TOKEN}`,
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

  const performanceMap = useMemo(() => {
    if (!performanceData) return new Map<string, StudentPerformanceAnalytics>();
    return new Map(performanceData.map((p) => [p.student_id, p]));
  }, [performanceData]);

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
    const studentsWithPerformance = filteredStudents.map((s) => ({
      ...s,
      performance: performanceMap.get(s.id),
    }));

    const withData = studentsWithPerformance.filter((s) => s.performance);
    const avgPercentage =
      withData.length > 0
        ? withData.reduce(
            (sum, s) => sum + (s.performance?.current_percentage || 0),
            0
          ) / withData.length
        : 0;

    const riskCounts = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0,
    };

    withData.forEach((s) => {
      if (s.performance?.risk_level) {
        riskCounts[s.performance.risk_level]++;
      }
    });

    return {
      totalStudents: filteredStudents.length,
      avgPercentage: avgPercentage.toFixed(1),
      riskCounts,
      dataAvailable: withData.length,
    };
  }, [filteredStudents, performanceMap]);

  const handleExportPDF = () => {
    toast({
      title: "Exporting Report",
      description: "Generating PDF report...",
    });
    // In production, this would generate actual PDF
    window.print();
  };

  const handleExportExcel = () => {
    toast({
      title: "Exporting Report",
      description: "Generating Excel report...",
    });
    // In production, this would generate actual Excel file
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
            <h1 className="text-2xl font-bold">Student Performance Report</h1>
            <p className="text-muted-foreground">
              Detailed analysis of student academic performance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Avg. Performance
                </p>
                <p className="text-2xl font-bold">{stats.avgPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50">
                <TrendingDown className="h-5 w-5 text-red-600" />
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
              <div className="p-2 rounded-lg bg-purple-50">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data Available</p>
                <p className="text-2xl font-bold">{stats.dataAvailable}</p>
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
            Performance Data ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
                  <TableHead>Current %</TableHead>
                  <TableHead>Predicted %</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Improvement</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const classInfo = classMap.get(student.class_id);
                  const sectionInfo = sectionMap.get(student.section_id);
                  const performance = performanceMap.get(student.id);

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
                        {performance?.current_percentage ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {performance.current_percentage}%
                            </span>
                            <Progress
                              value={performance.current_percentage}
                              className="w-16 h-2"
                            />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {performance?.predicted_percentage ? (
                          <span className="font-medium">
                            {performance.predicted_percentage}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {performance?.risk_level ? (
                          <Badge
                            variant={getRiskBadgeVariant(
                              performance.risk_level
                            )}
                          >
                            {performance.risk_level}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Unknown</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {performance?.improvement_rate !== null &&
                        performance?.improvement_rate !== undefined ? (
                          <div className="flex items-center gap-1">
                            {performance.improvement_rate >= 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span
                              className={
                                performance.improvement_rate >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {performance.improvement_rate > 0 ? "+" : ""}
                              {performance.improvement_rate}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/students/${student.id}`}>View</Link>
                        </Button>
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
