/**
 * Custom Role Dashboard - EduMunch
 * ==================================
 * 
 * Dashboard for custom roles that don't match any predefined role type.
 * Provides a generic interface with accessible modules based on permissions.
 * 
 * Features:
 * - Dynamic module access based on permissions
 * - Quick access to permitted features
 * - Generic overview stats
 * - Notifications and activities
 */

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Users,
  Calendar,
  Bell,
  Settings,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  DollarSign,
  FileText,
  Briefcase,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";

// Module to icon mapping
const moduleIcons: Record<string, typeof Layout> = {
  dashboard: LayoutDashboard,
  students: GraduationCap,
  teachers: BookOpen,
  parents: Users,
  employees: Briefcase,
  attendance: CheckCircle,
  fees: DollarSign,
  exams: FileText,
  timetable: Calendar,
  reports: TrendingUp,
  announcements: Bell,
  settings: Settings,
  roles: Shield,
  users: Users,
};

// Module to path mapping
const modulePaths: Record<string, string> = {
  dashboard: "/dashboard",
  students: "/students",
  teachers: "/teachers",
  parents: "/parents",
  employees: "/employees",
  attendance: "/attendance",
  fees: "/fees",
  exams: "/exams",
  timetable: "/timetable",
  reports: "/reports",
  announcements: "/announcements",
  settings: "/settings",
  roles: "/roles",
  users: "/users",
  assignments: "/assignments",
  homework: "/homework",
  transport: "/transport",
  library: "/library",
  inventory: "/inventory",
};

const recentActivities = [
  { id: 1, message: "Welcome to EduMunch! Explore your dashboard.", time: "Just now", icon: Bell },
  { id: 2, message: "Your account has been set up successfully.", time: "Today", icon: CheckCircle },
  { id: 3, message: "Check your notifications for updates.", time: "Today", icon: AlertCircle },
];

export function CustomDashboard() {
  const navigate = useNavigate();
  const { userProfile, permissions } = useAuth();
  const { hasPermission } = usePermissions();
  
  const roleCode = permissions?.primaryRole?.code || userProfile?.primary_role?.role_code || "custom";
  const roleName = permissions?.primaryRole?.name || userProfile?.primary_role?.role_name || "Custom Role";

  // Get accessible modules based on permissions
  const accessibleModules = useMemo(() => {
    const modules: Array<{ code: string; name: string; icon: typeof Layout; path: string }> = [];
    
    // Check each module for view permission
    Object.keys(modulePaths).forEach(moduleCode => {
      if (hasPermission(moduleCode, "view")) {
        modules.push({
          code: moduleCode,
          name: moduleCode.charAt(0).toUpperCase() + moduleCode.slice(1).replace(/_/g, " "),
          icon: moduleIcons[moduleCode] || Layout,
          path: modulePaths[moduleCode],
        });
      }
    });
    
    return modules.slice(0, 8); // Limit to 8 quick actions
  }, [hasPermission]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Layout className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome, {userProfile?.full_name || "User"}
              <Badge variant="secondary" className="ml-2">{roleName}</Badge>
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          You have access to {accessibleModules.length} modules based on your role permissions.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Accessible Modules</CardTitle>
            <Layout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accessibleModules.length}</div>
            <p className="text-xs text-muted-foreground">
              Based on your permissions
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Unread messages
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Access your permitted modules quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accessibleModules.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {accessibleModules.map((module) => (
                <Button
                  key={module.code}
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2"
                  onClick={() => navigate(module.path)}
                >
                  <module.icon className="h-6 w-6 text-primary" />
                  <span className="text-sm">{module.name}</span>
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No modules are currently accessible.</p>
              <p className="text-sm">Contact your administrator for permissions.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity & Info */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/notifications")}>
              View All Notifications <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="font-medium">{userProfile?.full_name || "N/A"}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="font-medium text-sm">{userProfile?.email || "N/A"}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Role</span>
              <Badge variant="secondary">{roleName}</Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Role Code</span>
              <Badge variant="outline">{roleCode}</Badge>
            </div>
            <Button variant="outline" className="w-full mt-2" onClick={() => navigate("/profile")}>
              View Profile <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
