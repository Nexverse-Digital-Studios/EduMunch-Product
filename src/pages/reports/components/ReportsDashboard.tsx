/**
 * ReportsDashboard Component
 * ==========================
 * Main dashboard for Reports & Analytics
 */

import { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  CalendarCheck,
  IndianRupee,
  FileText,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle,
  Clock,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import {
  REPORT_CONFIGS,
  AcademicYearInfo,
  ClassInfo,
  StudentInfo,
} from "./types";

const INDEX_TOKEN = "1emaet";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  CalendarCheck,
  TrendingUp,
  IndianRupee,
  Users,
  BarChart3,
};

export function ReportsDashboard() {
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const { toast } = useToast();

  const { canView, canCreate } = useModulePermissions("reports");

  // Fetch academic years
  const { data: academicYears } = useSupabaseTable<AcademicYearInfo>(
    `academic_years_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Fetch students for stats
  const { data: students, isLoading: loadingStudents } =
    useSupabaseTable<StudentInfo>(`students_${INDEX_TOKEN}`, {
      filters: { status: "active" },
    });

  // Fetch classes
  const { data: classes } = useSupabaseTable<ClassInfo>(
    `classes_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    return {
      totalStudents: students?.length || 0,
      totalClasses: classes?.length || 0,
      averageAttendance: 87.5, // Would be calculated from actual data
      averagePerformance: 72.3, // Would be calculated from actual data
      feeCollectionRate: 91.2, // Would be calculated from actual data
      pendingFees: 245000, // Would be calculated from actual data
    };
  }, [students, classes]);

  // Quick stats cards data
  const quickStats = [
    {
      title: "Total Students",
      value: summaryStats.totalStudents.toLocaleString(),
      change: "+12%",
      trend: "up" as const,
      icon: GraduationCap,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Average Attendance",
      value: `${summaryStats.averageAttendance}%`,
      change: "+2.3%",
      trend: "up" as const,
      icon: CalendarCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Academic Performance",
      value: `${summaryStats.averagePerformance}%`,
      change: "-1.2%",
      trend: "down" as const,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Fee Collection",
      value: `${summaryStats.feeCollectionRate}%`,
      change: "+5.4%",
      trend: "up" as const,
      icon: IndianRupee,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  // At-risk students (mock data - would come from analytics)
  const atRiskStudents = [
    {
      id: "1",
      name: "Rahul Sharma",
      class: "Class 10-A",
      risk: "High",
      type: "Attendance",
    },
    {
      id: "2",
      name: "Priya Patel",
      class: "Class 9-B",
      risk: "Medium",
      type: "Performance",
    },
    {
      id: "3",
      name: "Amit Kumar",
      class: "Class 8-C",
      risk: "High",
      type: "Both",
    },
  ];

  // Recent trends (mock data)
  const recentTrends = [
    { label: "Math Average", value: 78, change: 3.2, improving: true },
    { label: "Science Average", value: 72, change: -1.5, improving: false },
    { label: "English Average", value: 81, change: 2.1, improving: true },
    { label: "Hindi Average", value: 75, change: 0.5, improving: true },
  ];

  if (loadingStudents) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights and data analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px]">
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
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span
                      className={`text-xs ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.change} from last month
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REPORT_CONFIGS.map((report) => {
              const IconComponent = iconMap[report.icon] || FileText;
              return (
                <Card
                  key={report.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {report.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3">
                      {report.title}
                    </CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {report.formats.map((format) => (
                          <Badge
                            key={format}
                            variant="secondary"
                            className="text-xs"
                          >
                            {format.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toast({ 
                          title: `Generate ${report.title}`, 
                          description: "Report generation feature coming soon" 
                        })}
                      >
                        Generate
                        <ArrowUpRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Subject Performance Trends
                </CardTitle>
                <CardDescription>
                  Average performance by subject this term
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentTrends.map((trend) => (
                  <div key={trend.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{trend.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{trend.value}%</span>
                        <Badge
                          variant={trend.improving ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {trend.improving ? "+" : ""}
                          {trend.change}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={trend.value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Quick Reports
                </CardTitle>
                <CardDescription>
                  Generate common reports quickly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => toast({ title: "Attendance Report", description: "Generating today's attendance report..." })}
                >
                  <CalendarCheck className="mr-2 h-4 w-4" />
                  Today's Attendance Report
                  <Download className="ml-auto h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => toast({ title: "Fee Collection Report", description: "Generating monthly fee collection report..." })}
                >
                  <IndianRupee className="mr-2 h-4 w-4" />
                  Monthly Fee Collection
                  <Download className="ml-auto h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => toast({ title: "Performance Report", description: "Generating class performance summary..." })}
                >
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Class Performance Summary
                  <Download className="ml-auto h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => toast({ title: "Workload Analysis", description: "Generating teacher workload analysis..." })}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Teacher Workload Analysis
                  <Download className="ml-auto h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                At-Risk Students
              </CardTitle>
              <CardDescription>
                Students requiring attention based on analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {atRiskStudents.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">All Clear!</h3>
                  <p className="text-muted-foreground">
                    No students currently flagged as at-risk
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {atRiskStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            student.risk === "High"
                              ? "bg-red-500"
                              : student.risk === "Medium"
                              ? "bg-amber-500"
                              : "bg-green-500"
                          }`}
                        />
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.class}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            student.risk === "High"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {student.risk} Risk
                        </Badge>
                        <Badge variant="outline">{student.type}</Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toast({ title: "View Student", description: `Viewing ${student.name}'s details` })}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
