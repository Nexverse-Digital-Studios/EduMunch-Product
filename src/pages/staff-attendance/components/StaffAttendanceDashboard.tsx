/**
 * Staff Attendance Dashboard Page (CONSOLIDATED)
 * ================================================
 * Main dashboard for staff attendance management with tabs
 * Route: /staff/attendance
 *
 * CONSOLIDATED: All features accessible via tabs (no sub-routes)
 * - Dashboard: Overview with stats
 * - Mark: Mark daily attendance
 * - View: View and filter attendance records
 * - Reports: Generate attendance reports
 */

import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckSquare,
  Eye,
  BarChart3,
  Users,
  Clock,
  UserCheck,
  UserX,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import type {
  StaffAttendanceDB,
  EmployeeReference,
  DailyAttendanceStats,
} from "./types";
import MarkStaffAttendancePage from "./MarkStaffAttendancePage";
import ViewStaffAttendancePage from "./ViewStaffAttendancePage";
import StaffAttendanceReportsPage from "./StaffAttendanceReportsPage";

const StaffAttendanceDashboard = () => {
  const { canView, canCreate } = useModulePermissions("staff_attendance");
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };
  const today = new Date().toISOString().split("T")[0];

  // Fetch today's attendance records
  const { data: todayAttendance, isLoading: isLoadingAttendance } =
    useSupabaseTable<StaffAttendanceDB>(TABLES.TEACHER_ATTENDANCE, {
      filters: { attendance_date: today },
    });

  // Fetch all active employees
  const { data: employees, isLoading: isLoadingEmployees } =
    useSupabaseTable<EmployeeReference>(TABLES.EMPLOYEES, {
      filters: { status: "active" },
    });

  // Calculate today's stats
  const calculateTodayStats = (): DailyAttendanceStats => {
    const records = todayAttendance || [];
    const totalEmployees = employees?.length || 0;

    return {
      date: today,
      total_employees: totalEmployees,
      present: records.filter((r) => r.status === "Present").length,
      absent: records.filter((r) => r.status === "Absent").length,
      late: records.filter((r) => r.status === "Late").length,
      half_day: records.filter((r) => r.status === "Half-day").length,
      on_leave: records.filter((r) => r.status === "On-leave").length,
    };
  };

  const stats = calculateTodayStats();
  const notMarked =
    stats.total_employees -
    (stats.present +
      stats.absent +
      stats.late +
      stats.half_day +
      stats.on_leave);

  const isLoading = isLoadingAttendance || isLoadingEmployees;

  // Tab configuration with permissions
  const tabs = [
    {
      value: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      permission: canView,
    },
    {
      value: "mark",
      label: "Mark Attendance",
      icon: CheckSquare,
      permission: canCreate,
    },
    { value: "view", label: "View Records", icon: Eye, permission: canView },
    {
      value: "reports",
      label: "Reports",
      icon: BarChart3,
      permission: canView,
    },
  ];

  // Dashboard content component
  const DashboardContent = () => (
    <div className="space-y-6">
      {/* Today's Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.total_employees}
            </div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? "..." : stats.present}
            </div>
            <p className="text-xs text-muted-foreground">On time arrivals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {isLoading ? "..." : stats.late}
            </div>
            <p className="text-xs text-muted-foreground">
              Half-day: {stats.half_day}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? "..." : stats.absent}
            </div>
            <p className="text-xs text-muted-foreground">
              On leave: {stats.on_leave}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Marked</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : notMarked}
            </div>
            <p className="text-xs text-muted-foreground">Pending today</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Activity</CardTitle>
          <CardDescription>
            Attendance marked for{" "}
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : todayAttendance && todayAttendance.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">{todayAttendance.length}</span>{" "}
                attendance records marked today
              </p>
              {notMarked > 0 && canCreate && (
                <p className="text-sm text-muted-foreground">
                  {notMarked} staff member(s) attendance pending - use the "Mark
                  Attendance" tab
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-muted-foreground">
                No attendance marked yet today. Use the "Mark Attendance" tab to
                get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff Attendance</h1>
        <p className="text-muted-foreground">
          Manage and track attendance for all staff members
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          {tabs
            .filter((tab) => tab.permission)
            .map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                <tab.icon className="h-4 w-4 hidden sm:inline" />
                {tab.label}
              </TabsTrigger>
            ))}
        </TabsList>

        {isLoading && activeTab === "dashboard" ? (
          <div className="flex items-center justify-center h-64 mt-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading attendance data...</span>
          </div>
        ) : (
          <>
            <TabsContent value="dashboard" className="mt-6">
              <DashboardContent />
            </TabsContent>

            <TabsContent value="mark" className="mt-6">
              <MarkStaffAttendancePage />
            </TabsContent>

            <TabsContent value="view" className="mt-6">
              <ViewStaffAttendancePage />
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <StaffAttendanceReportsPage />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default StaffAttendanceDashboard;
