/**
 * Staff Dashboard - EduMunch
 * ============================
 * 
 * Dashboard for non-teaching staff roles:
 * - academic_coordinator
 * - accountant
 * - hr_manager
 * - exam_controller
 * - receptionist
 * - librarian
 * - transport_manager
 * 
 * Features:
 * - Role-specific widgets
 * - Department overview
 * - Quick access to relevant modules
 * - Pending tasks and activities
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Users,
  Calendar,
  Clock,
  FileText,
  DollarSign,
  Truck,
  BookOpen,
  ClipboardList,
  Bell,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Settings,
  UserCheck,
  Package,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

// Role-specific configurations
const roleConfigs: Record<string, {
  icon: typeof Briefcase;
  title: string;
  description: string;
  color: string;
  quickActions: Array<{ label: string; icon: typeof Briefcase; path: string }>;
  stats: Array<{ label: string; value: string | number; icon: typeof Briefcase; change?: string }>;
}> = {
  academic_coordinator: {
    icon: GraduationCap,
    title: "Academic Coordinator",
    description: "Manage academic structure, curriculum, and exams",
    color: "text-blue-500",
    quickActions: [
      { label: "Timetable", icon: Calendar, path: "/timetable" },
      { label: "Exams", icon: ClipboardList, path: "/exams" },
      { label: "Classes", icon: GraduationCap, path: "/classes" },
      { label: "Report Cards", icon: FileText, path: "/report-cards" },
    ],
    stats: [
      { label: "Active Classes", value: 45, icon: GraduationCap },
      { label: "Subjects", value: 28, icon: BookOpen },
      { label: "Upcoming Exams", value: 5, icon: ClipboardList },
      { label: "Teachers", value: 85, icon: Users },
    ],
  },
  accountant: {
    icon: DollarSign,
    title: "Accountant",
    description: "Manage fees, payments, and financial reports",
    color: "text-green-500",
    quickActions: [
      { label: "Fee Management", icon: DollarSign, path: "/fees" },
      { label: "Payments", icon: FileText, path: "/payments" },
      { label: "Reports", icon: BarChart3, path: "/reports" },
      { label: "Fee Collection", icon: DollarSign, path: "/fees/collect" },
    ],
    stats: [
      { label: "Monthly Collection", value: "₹12.5L", icon: DollarSign, change: "+5%" },
      { label: "Pending Fees", value: "₹4.5L", icon: AlertCircle },
      { label: "Today's Collection", value: "₹45K", icon: CheckCircle },
      { label: "Defaulters", value: 23, icon: Users },
    ],
  },
  hr_manager: {
    icon: Users,
    title: "HR Manager",
    description: "Manage employees, payroll, and recruitment",
    color: "text-purple-500",
    quickActions: [
      { label: "Employees", icon: Users, path: "/employees" },
      { label: "Payroll", icon: DollarSign, path: "/payroll" },
      { label: "Leave Requests", icon: Calendar, path: "/staff/leave" },
      { label: "Recruitment", icon: UserCheck, path: "/recruitment" },
    ],
    stats: [
      { label: "Total Employees", value: 120, icon: Users },
      { label: "Pending Leaves", value: 8, icon: Calendar },
      { label: "Open Positions", value: 3, icon: Briefcase },
      { label: "This Month's Salary", value: "₹18.5L", icon: DollarSign },
    ],
  },
  exam_controller: {
    icon: ClipboardList,
    title: "Exam Controller",
    description: "Manage examinations, marks, and report cards",
    color: "text-orange-500",
    quickActions: [
      { label: "Exams", icon: ClipboardList, path: "/exams" },
      { label: "Results", icon: FileText, path: "/results" },
      { label: "Report Cards", icon: FileText, path: "/report-cards" },
      { label: "Reports", icon: BarChart3, path: "/reports" },
    ],
    stats: [
      { label: "Active Exams", value: 3, icon: ClipboardList },
      { label: "Pending Results", value: 5, icon: AlertCircle },
      { label: "Published Results", value: 12, icon: CheckCircle },
      { label: "Report Cards Generated", value: 850, icon: FileText },
    ],
  },
  receptionist: {
    icon: UserCheck,
    title: "Receptionist",
    description: "Manage admissions, visitors, and front desk operations",
    color: "text-teal-500",
    quickActions: [
      { label: "Admissions", icon: UserCheck, path: "/admissions" },
      { label: "Students", icon: GraduationCap, path: "/students" },
      { label: "Announcements", icon: Bell, path: "/announcements" },
      { label: "Support", icon: ClipboardList, path: "/support" },
    ],
    stats: [
      { label: "New Applications", value: 15, icon: UserCheck },
      { label: "Today's Visitors", value: 8, icon: Users },
      { label: "Pending Queries", value: 5, icon: AlertCircle },
      { label: "Enrollments This Month", value: 23, icon: GraduationCap },
    ],
  },
  librarian: {
    icon: BookOpen,
    title: "Librarian",
    description: "Manage library books, inventory, and circulation",
    color: "text-amber-500",
    quickActions: [
      { label: "Library", icon: BookOpen, path: "/library" },
      { label: "Inventory", icon: Package, path: "/inventory" },
      { label: "Students", icon: GraduationCap, path: "/students" },
      { label: "Reports", icon: BarChart3, path: "/reports" },
    ],
    stats: [
      { label: "Total Books", value: 5420, icon: BookOpen },
      { label: "Books Issued", value: 342, icon: CheckCircle },
      { label: "Overdue", value: 18, icon: AlertCircle },
      { label: "New Arrivals", value: 45, icon: Package },
    ],
  },
  transport_manager: {
    icon: Truck,
    title: "Transport Manager",
    description: "Manage routes, vehicles, and student transport",
    color: "text-indigo-500",
    quickActions: [
      { label: "Transport", icon: Truck, path: "/transport" },
      { label: "Students", icon: GraduationCap, path: "/students" },
      { label: "Announcements", icon: Bell, path: "/announcements" },
      { label: "Reports", icon: BarChart3, path: "/reports" },
    ],
    stats: [
      { label: "Active Routes", value: 12, icon: Truck },
      { label: "Vehicles", value: 18, icon: Truck },
      { label: "Students Using Transport", value: 580, icon: GraduationCap },
      { label: "Drivers", value: 22, icon: Users },
    ],
  },
};

// Default config for unknown staff roles
const defaultConfig = {
  icon: Briefcase,
  title: "Staff",
  description: "School staff member",
  color: "text-gray-500",
  quickActions: [
    { label: "My Profile", icon: Users, path: "/profile" },
    { label: "Notifications", icon: Bell, path: "/notifications" },
    { label: "Settings", icon: Settings, path: "/settings" },
    { label: "Support", icon: ClipboardList, path: "/support" },
  ],
  stats: [
    { label: "Pending Tasks", value: 5, icon: ClipboardList },
    { label: "Messages", value: 3, icon: Bell },
    { label: "Notifications", value: 8, icon: Bell },
    { label: "Completed Today", value: 12, icon: CheckCircle },
  ],
};

const pendingTasks = [
  { id: 1, title: "Review pending applications", priority: "high", due: "Today" },
  { id: 2, title: "Submit monthly report", priority: "medium", due: "Tomorrow" },
  { id: 3, title: "Staff meeting preparation", priority: "low", due: "This week" },
];

export function StaffDashboard() {
  const navigate = useNavigate();
  const { userProfile, permissions } = useAuth();
  
  const roleCode = permissions?.primaryRole?.code || userProfile?.primary_role?.role_code || "staff";
  const roleName = permissions?.primaryRole?.name || userProfile?.primary_role?.role_name || "Staff Member";
  
  const config = useMemo(() => {
    return roleConfigs[roleCode] || defaultConfig;
  }, [roleCode]);

  const IconComponent = config.icon;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <IconComponent className={`h-8 w-8 ${config.color}`} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{config.title} Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {userProfile?.full_name || "Staff Member"}
              <Badge variant="secondary" className="ml-2">{roleName}</Badge>
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {config.stats.map((stat, index) => {
          const StatIcon = stat.icon;
          return (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <StatIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change && (
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500">{stat.change}</span> from last month
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {config.quickActions.map((action) => (
              <Button
                key={action.path}
                variant="outline"
                className="h-auto py-6 flex flex-col gap-2"
                onClick={() => navigate(action.path)}
              >
                <action.icon className={`h-6 w-6 ${config.color}`} />
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Tasks & Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === "high" ? "bg-red-500" :
                      task.priority === "medium" ? "bg-orange-500" : "bg-green-500"
                    }`} />
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground">Due: {task.due}</p>
                    </div>
                  </div>
                  <Badge variant={
                    task.priority === "high" ? "destructive" :
                    task.priority === "medium" ? "default" : "secondary"
                  }>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Today's Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tasks Completed</span>
              <span className="font-semibold">8/12</span>
            </div>
            <Progress value={67} />
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending Approvals</span>
              <Badge variant="outline">5</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">New Notifications</span>
              <Badge variant="outline">3</Badge>
            </div>
            <Button variant="outline" className="w-full mt-2" onClick={() => navigate("/notifications")}>
              View All Notifications <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
