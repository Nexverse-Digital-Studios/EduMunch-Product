/**
 * Staff Attendance Reports Page
 * ==============================
 * Reports dashboard with multiple report types
 * Route: /staff/attendance/reports
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  FileText,
  TrendingUp,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModulePermissions } from "@/contexts/PermissionContext";

const StaffAttendanceReportsPage = () => {
  const navigate = useNavigate();
  const { canView } = useModulePermissions("staff_attendance");
  const [activeTab, setActiveTab] = useState("overview");

  const reportTypes = [
    {
      id: "monthly",
      title: "Monthly Report",
      description: "Month-by-month attendance summary for all staff",
      icon: Calendar,
      href: "/staff/attendance/reports/monthly",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "department",
      title: "Department Report",
      description: "Attendance breakdown by department",
      icon: Users,
      href: "/staff/attendance/reports?type=department",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: "trends",
      title: "Attendance Trends",
      description: "Analyze attendance patterns over time",
      icon: TrendingUp,
      href: "/staff/attendance/reports?type=trends",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      id: "individual",
      title: "Individual Reports",
      description: "Detailed attendance for specific employees",
      icon: FileText,
      href: "/staff/attendance/view",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Attendance Reports
          </h1>
          <p className="text-muted-foreground">
            Generate and view staff attendance reports
          </p>
        </div>
      </div>

      {/* Report Type Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reportTypes.map((report) => (
          <Card
            key={report.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
          >
            <Link to={report.href}>
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg ${report.bgColor} flex items-center justify-center mb-2`}
                >
                  <report.icon className={`h-6 w-6 ${report.color}`} />
                </div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        ))}
      </div>

      {/* Tabs for quick reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Quick Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Avg. Attendance Rate</CardDescription>
                    <CardTitle className="text-3xl">94.5%</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      +2.1% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Staff</CardDescription>
                    <CardTitle className="text-3xl">45</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Active employees
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Leave This Month</CardDescription>
                    <CardTitle className="text-3xl">12</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Days of approved leave
                    </p>
                  </CardContent>
                </Card>
              </div>
              <p className="text-sm text-muted-foreground">
                Click on a report type above to view detailed reports.
              </p>
            </TabsContent>

            <TabsContent value="today" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-5">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Present</CardDescription>
                    <CardTitle className="text-2xl text-green-600">
                      38
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Absent</CardDescription>
                    <CardTitle className="text-2xl text-red-600">2</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Late</CardDescription>
                    <CardTitle className="text-2xl text-yellow-600">
                      3
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Half-day</CardDescription>
                    <CardTitle className="text-2xl text-orange-600">
                      1
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>On Leave</CardDescription>
                    <CardTitle className="text-2xl text-blue-600">1</CardTitle>
                  </CardHeader>
                </Card>
              </div>
              <Button variant="outline" asChild>
                <Link to="/staff/attendance/view">View Today's Details</Link>
              </Button>
            </TabsContent>

            <TabsContent value="week" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Avg. Daily Attendance</CardDescription>
                    <CardTitle className="text-3xl">42</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Out of 45 employees
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Late Arrivals</CardDescription>
                    <CardTitle className="text-3xl text-yellow-600">
                      8
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">This week</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Absences</CardDescription>
                    <CardTitle className="text-3xl text-red-600">5</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">This week</p>
                  </CardContent>
                </Card>
              </div>
              <Button variant="outline" asChild>
                <Link to="/staff/attendance/reports/monthly">
                  View Detailed Report
                </Link>
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffAttendanceReportsPage;
