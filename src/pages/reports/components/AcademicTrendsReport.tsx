/**
 * AcademicTrendsReport Component
 * ===============================
 * Generate academic trends and analysis reports
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileText,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Printer,
  BarChart3,
  Users,
  GraduationCap,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
  AcademicTrendAnalytics,
  ClassInfo,
  SectionInfo,
  SubjectInfo,
  AcademicYearInfo,
} from "./types";

const INDEX_TOKEN = "1emaet";

interface TeacherInfo {
  id: string;
  first_name: string;
  last_name: string;
  employee_code: string;
}

export function AcademicTrendsReport() {
  const [analysisType, setAnalysisType] = useState<string>("Class");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  const { canView } = useModulePermissions("reports");
  const { toast } = useToast();

  // Fetch data
  const { data: academicYears } = useSupabaseTable<AcademicYearInfo>(
    `academic_years_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const { data: classes, isLoading: loadingClasses } =
    useSupabaseTable<ClassInfo>(`classes_${INDEX_TOKEN}`, { filters: {} });

  const { data: sections } = useSupabaseTable<SectionInfo>(
    `sections_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const { data: subjects } = useSupabaseTable<SubjectInfo>(
    `subjects_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const { data: teachers } = useSupabaseTable<TeacherInfo>(
    `teachers_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const { data: trends } = useSupabaseTable<AcademicTrendAnalytics>(
    `analytics_academic_trends_${INDEX_TOKEN}`,
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

  const subjectMap = useMemo(() => {
    if (!subjects) return new Map<string, SubjectInfo>();
    return new Map(subjects.map((s) => [s.id, s]));
  }, [subjects]);

  const teacherMap = useMemo(() => {
    if (!teachers) return new Map<string, TeacherInfo>();
    return new Map(teachers.map((t) => [t.id, t]));
  }, [teachers]);

  // Filter trends by analysis type
  const filteredTrends = useMemo(() => {
    if (!trends) return [];
    return trends.filter((t) => {
      const matchesType = t.analysis_type === analysisType;
      const matchesYear =
        selectedYear === "all" || t.academic_year_id === selectedYear;
      return matchesType && matchesYear;
    });
  }, [trends, analysisType, selectedYear]);

  // Calculate overall stats
  const stats = useMemo(() => {
    if (filteredTrends.length === 0) {
      return {
        avgPerformance: 0,
        avgPassRate: 0,
        improving: 0,
        declining: 0,
      };
    }

    const avgPerformance =
      filteredTrends.reduce((sum, t) => sum + (t.average_percentage || 0), 0) /
      filteredTrends.length;

    const avgPassRate =
      filteredTrends.reduce((sum, t) => sum + (t.pass_percentage || 0), 0) /
      filteredTrends.length;

    const improving = filteredTrends.filter(
      (t) => t.trend_direction === "Improving"
    ).length;
    const declining = filteredTrends.filter(
      (t) => t.trend_direction === "Declining"
    ).length;

    return {
      avgPerformance: avgPerformance.toFixed(1),
      avgPassRate: avgPassRate.toFixed(1),
      improving,
      declining,
    };
  }, [filteredTrends]);

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

  const getTrendIcon = (direction: string | null) => {
    switch (direction) {
      case "Improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "Declining":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendBadge = (direction: string | null) => {
    switch (direction) {
      case "Improving":
        return <Badge className="bg-green-100 text-green-800">Improving</Badge>;
      case "Declining":
        return <Badge variant="destructive">Declining</Badge>;
      default:
        return <Badge variant="secondary">Stable</Badge>;
    }
  };

  const getEntityName = (trend: AcademicTrendAnalytics) => {
    switch (trend.analysis_type) {
      case "Class":
        const classInfo = classMap.get(trend.class_id || "");
        return classInfo?.class_name || "Unknown Class";
      case "Section":
        const sectionInfo = sectionMap.get(trend.section_id || "");
        const sectionClass = classMap.get(sectionInfo?.class_id || "");
        return sectionClass && sectionInfo
          ? `${sectionClass.class_name} - ${sectionInfo.section_name}`
          : "Unknown Section";
      case "Subject":
        const subjectInfo = subjectMap.get(trend.subject_id || "");
        return subjectInfo?.subject_name || "Unknown Subject";
      case "Teacher":
        const teacherInfo = teacherMap.get(trend.teacher_id || "");
        return teacherInfo
          ? `${teacherInfo.first_name} ${teacherInfo.last_name}`
          : "Unknown Teacher";
      case "School":
        return "School-wide";
      default:
        return "Unknown";
    }
  };

  if (loadingClasses) {
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
            <h1 className="text-2xl font-bold">Academic Trends Report</h1>
            <p className="text-muted-foreground">
              Performance trends across classes, subjects, and teachers
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
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Avg. Performance
                </p>
                <p className="text-2xl font-bold">{stats.avgPerformance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <GraduationCap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Pass Rate</p>
                <p className="text-2xl font-bold">{stats.avgPassRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Improving</p>
                <p className="text-2xl font-bold">{stats.improving}</p>
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
                <p className="text-sm text-muted-foreground">Declining</p>
                <p className="text-2xl font-bold">{stats.declining}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Analysis Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Class">By Class</SelectItem>
                <SelectItem value="Section">By Section</SelectItem>
                <SelectItem value="Subject">By Subject</SelectItem>
                <SelectItem value="Teacher">By Teacher</SelectItem>
                <SelectItem value="School">School-wide</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Academic Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {academicYears?.map((year) => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.year_name}
                    {year.is_current && " (Current)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trends Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {analysisType} Trends ({filteredTrends.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTrends.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No trend data available</h3>
              <p className="text-muted-foreground">
                Analytics data will appear here once generated
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{analysisType}</TableHead>
                  <TableHead>Avg. %</TableHead>
                  <TableHead>Pass Rate</TableHead>
                  <TableHead>Excellence Rate</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead>YoY Change</TableHead>
                  <TableHead>Rank</TableHead>
                  {analysisType === "Teacher" && (
                    <TableHead>Effectiveness</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrends.map((trend) => (
                  <TableRow key={trend.id}>
                    <TableCell>
                      <div className="font-medium">{getEntityName(trend)}</div>
                    </TableCell>
                    <TableCell>
                      {trend.average_percentage !== null ? (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {trend.average_percentage}%
                          </span>
                          <Progress
                            value={trend.average_percentage}
                            className="w-16 h-2"
                          />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {trend.pass_percentage !== null ? (
                        <Badge
                          variant={
                            trend.pass_percentage >= 80
                              ? "default"
                              : trend.pass_percentage >= 60
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {trend.pass_percentage}%
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {trend.excellence_percentage !== null ? (
                        <span>{trend.excellence_percentage}%</span>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(trend.trend_direction)}
                        {getTrendBadge(trend.trend_direction)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {trend.comparison_with_previous_year !== null ? (
                        <div className="flex items-center gap-1">
                          {trend.comparison_with_previous_year >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span
                            className={
                              trend.comparison_with_previous_year >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {trend.comparison_with_previous_year > 0 ? "+" : ""}
                            {trend.comparison_with_previous_year}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {trend.rank_in_school !== null ? (
                        <Badge variant="outline">#{trend.rank_in_school}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    {analysisType === "Teacher" && (
                      <TableCell>
                        {trend.teaching_effectiveness_rating !== null ? (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">
                              {trend.teaching_effectiveness_rating}
                            </span>
                            <span className="text-muted-foreground">/5</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Insights Section */}
      {filteredTrends.some((t) => t.key_insights || t.recommendations) && (
        <Card>
          <CardHeader>
            <CardTitle>Key Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredTrends
              .filter((t) => t.key_insights || t.recommendations)
              .slice(0, 5)
              .map((trend) => (
                <div key={trend.id} className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">{getEntityName(trend)}</h4>
                  {trend.key_insights && (
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Insights:</strong> {trend.key_insights}
                    </p>
                  )}
                  {trend.recommendations && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Recommendations:</strong> {trend.recommendations}
                    </p>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
