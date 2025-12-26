/**
 * Staff Attendance Dashboard Page
 * ================================
 * Main dashboard for staff attendance management
 * Route: /staff/attendance
 */

import { Link } from "react-router-dom";
import {
  CheckSquare,
  Eye,
  BarChart3,
  FileDown,
  Users,
  Clock,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import type {
  StaffAttendanceDB,
  EmployeeReference,
  DailyAttendanceStats,
} from "./types";

const StaffAttendanceDashboard = () => {
  const { canView, canCreate, canExport } =
    useModulePermissions("staff_attendance");
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

  const quickActions = [
    {
      title: "Mark Attendance",
      description: "Record today's staff attendance",
      icon: CheckSquare,
      href: "/staff/attendance/mark",
      permission: canCreate,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "View Attendance",
      description: "View and filter attendance records",
      icon: Eye,
      href: "/staff/attendance/view",
      permission: canView,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Reports",
      description: "Generate attendance reports",
      icon: BarChart3,
      href: "/staff/attendance/reports",
      permission: canView,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Export Data",
      description: "Export attendance data",
      icon: FileDown,
      href: "/staff/attendance/export",
      permission: canExport,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const isLoading = isLoadingAttendance || isLoadingEmployees;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff Attendance</h1>
        <p className="text-muted-foreground">
          Manage and track attendance for all staff members
        </p>
      </div>

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

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions
            .filter((action) => action.permission)
            .map((action) => (
              <Card
                key={action.href}
                className="hover:shadow-md transition-shadow"
              >
                <Link to={action.href}>
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center mb-2`}
                    >
                      <action.icon className={`h-6 w-6 ${action.color}`} />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            ))}
        </div>
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
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/staff/attendance/view">View Details</Link>
                </Button>
                {notMarked > 0 && canCreate && (
                  <Button size="sm" asChild>
                    <Link to="/staff/attendance/mark">
                      Mark Remaining ({notMarked})
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-muted-foreground">
                No attendance marked yet today
              </p>
              {canCreate && (
                <Button asChild>
                  <Link to="/staff/attendance/mark">
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Mark Attendance
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffAttendanceDashboard;
