/**
 * Admin Dashboard - EduMunch
 * ===========================
 * 
 * Dashboard for super_admin, principal, and ADMIN roles.
 * Provides comprehensive school management overview.
 * 
 * Features:
 * - School-wide statistics
 * - User management quick access
 * - System health indicators
 * - Financial overview
 * - Recent activities
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  GraduationCap,
  BookOpen,
  Briefcase,
  DollarSign,
  TrendingUp,
  Calendar,
  Bell,
  Settings,
  Shield,
  School,
  ClipboardList,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Activity,
  UserPlus,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

// Demo data for admin dashboard
const statsData = {
  totalStudents: 1250,
  totalTeachers: 85,
  totalEmployees: 120,
  totalParents: 2100,
  activeClasses: 45,
  pendingAdmissions: 23,
  todayAttendance: 94.5,
  monthlyRevenue: 1250000,
  pendingFees: 450000,
};

const recentActivities = [
  { id: 1, type: "admission", message: "New admission application from Rahul Kumar", time: "10 minutes ago", icon: UserPlus },
  { id: 2, type: "fee", message: "Fee payment received: ₹15,000 from Class 10-A", time: "25 minutes ago", icon: DollarSign },
  { id: 3, type: "leave", message: "Leave request from Mr. Sharma (Teacher)", time: "1 hour ago", icon: Calendar },
  { id: 4, type: "result", message: "Exam results uploaded for Class 12 Physics", time: "2 hours ago", icon: FileText },
  { id: 5, type: "grievance", message: "New grievance submitted by parent", time: "3 hours ago", icon: MessageSquare },
];

const quickActions = [
  { label: "Manage Users", icon: Users, path: "/users", color: "bg-blue-500" },
  { label: "View Reports", icon: BarChart3, path: "/reports", color: "bg-green-500" },
  { label: "Settings", icon: Settings, path: "/settings", color: "bg-purple-500" },
  { label: "Announcements", icon: Bell, path: "/announcements", color: "bg-orange-500" },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const { userProfile, permissions } = useAuth();
  const roleName = permissions?.primaryRole?.name || userProfile?.primary_role?.role_name || "Administrator";

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {userProfile?.full_name || "Administrator"}
              <Badge variant="secondary" className="ml-2">{roleName}</Badge>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+12</span> new this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+3</span> new this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Across all departments
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.todayAttendance}%</div>
            <Progress value={statsData.todayAttendance} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Financial Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Monthly Revenue</span>
              <span className="text-lg font-semibold text-green-600">
                ₹{(statsData.monthlyRevenue / 100000).toFixed(1)}L
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending Fees</span>
              <span className="text-lg font-semibold text-orange-600">
                ₹{(statsData.pendingFees / 100000).toFixed(1)}L
              </span>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate("/fees")}>
              View Fee Details <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-500" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Pending Admissions</span>
              </div>
              <Badge variant="secondary">{statsData.pendingAdmissions}</Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Leave Requests</span>
              </div>
              <Badge variant="secondary">8</Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Approved Today</span>
              </div>
              <Badge variant="secondary">15</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Quick Actions */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.path}
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate(action.path)}
              >
                <action.icon className="h-5 w-5" />
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from across the school</CardDescription>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
