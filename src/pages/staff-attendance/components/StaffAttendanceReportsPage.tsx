/**
 * Staff Attendance Reports Page
 * ==============================
 * Reports dashboard with multiple report types
 * All functionality contained within tabs - no external navigation
 */

import { useSearchParams } from "react-router-dom";
import { BarChart3, Calendar, FileText, TrendingUp, Users } from "lucide-react";
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
  const { canView } = useModulePermissions("staff_attendance");
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const reportTypes = [
    {
      id: "monthly",
      title: "Monthly Report",
      description: "Month-by-month attendance summary for all staff",
      icon: Calendar,
      tabValue: "overview",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "department",
      title: "Department Report",
      description: "Attendance breakdown by department",
      icon: Users,
      tabValue: "department",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: "trends",
      title: "Attendance Trends",
      description: "Analyze attendance patterns over time",
      icon: TrendingUp,
      tabValue: "trends",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      id: "individual",
      title: "Individual Reports",
      description: "Detailed attendance for specific employees",
      icon: FileText,
      tabValue: "individual",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Attendance Reports
        </h1>
        <p className="text-muted-foreground">
          Generate and view staff attendance reports
        </p>
      </div>

      {/* Report Type Cards - Click to switch tabs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reportTypes.map((report) => (
          <Card
            key={report.id}
            className={`hover:shadow-md transition-shadow cursor-pointer ${
              activeTab === report.tabValue ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => handleTabChange(report.tabValue)}
          >
            <CardHeader>
              <div
                className={`w-12 h-12 rounded-lg ${report.bgColor} flex items-center justify-center mb-2`}
              >
                <report.icon className={`h-6 w-6 ${report.color}`} />
              </div>
              <CardTitle className="text-lg">{report.title}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Tabs for reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Report Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="department">By Department</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="individual">Individual</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
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
                Click on a report card above to view detailed reports.
              </p>
            </TabsContent>

            <TabsContent value="department" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Teaching Staff</CardDescription>
                    <CardTitle className="text-3xl">96%</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      25 employees
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Administrative</CardDescription>
                    <CardTitle className="text-3xl">92%</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      10 employees
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Support Staff</CardDescription>
                    <CardTitle className="text-3xl">89%</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">8 employees</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Management</CardDescription>
                    <CardTitle className="text-3xl">100%</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">2 employees</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>This Month</CardDescription>
                    <CardTitle className="text-3xl">94.5%</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-green-600">
                      ↑ 2.1% vs last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Last Month</CardDescription>
                    <CardTitle className="text-3xl">92.4%</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Previous period
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Quarter Avg</CardDescription>
                    <CardTitle className="text-3xl">93.2%</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-green-600">
                      ↑ 1.5% vs last quarter
                    </p>
                  </CardContent>
                </Card>
              </div>
              <p className="text-sm text-muted-foreground">
                Attendance trends are calculated based on historical data.
              </p>
            </TabsContent>

            <TabsContent value="individual" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Select an employee to view their individual attendance report.
                Use the "View Records" tab to browse all staff attendance.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Perfect Attendance</CardDescription>
                    <CardTitle className="text-3xl text-green-600">
                      28
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Staff with 100% this month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Needs Attention</CardDescription>
                    <CardTitle className="text-3xl text-yellow-600">
                      3
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Staff with &lt;80% attendance
                    </p>
                  </CardContent>
                </Card>
              </div>
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
              <p className="text-sm text-muted-foreground">
                Switch to "Mark Attendance" tab to record today's attendance.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffAttendanceReportsPage;
