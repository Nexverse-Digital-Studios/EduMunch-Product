/**
 * Teacher Dashboard - EduMunch
 * =============================
 * 
 * Dashboard specifically for teacher role.
 * Focuses on classroom management, attendance, and student progress.
 * 
 * Features:
 * - My classes overview
 * - Today's schedule
 * - Attendance marking
 * - Assignment management
 * - Recent student activities
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  CheckSquare,
  FileEdit,
  Award,
  MessageSquare,
  Bell,
  TrendingUp,
  ArrowRight,
  ClipboardList,
  GraduationCap,
  PlayCircle,
  Edit3,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

// Demo data for teacher dashboard
const myClasses = [
  { id: 1, name: "Class 10-A", subject: "Mathematics", students: 45, nextClass: "10:00 AM" },
  { id: 2, name: "Class 10-B", subject: "Mathematics", students: 42, nextClass: "11:30 AM" },
  { id: 3, name: "Class 9-A", subject: "Mathematics", students: 48, nextClass: "2:00 PM" },
];

const todaySchedule = [
  { id: 1, time: "09:00 AM", class: "Class 10-A", subject: "Mathematics", room: "Room 101", status: "completed" },
  { id: 2, time: "10:00 AM", class: "Class 10-B", subject: "Mathematics", room: "Room 102", status: "ongoing" },
  { id: 3, time: "11:30 AM", class: "Class 9-A", subject: "Mathematics", room: "Room 103", status: "upcoming" },
  { id: 4, time: "02:00 PM", class: "Class 11-A", subject: "Mathematics", room: "Room 105", status: "upcoming" },
];

const pendingTasks = [
  { id: 1, type: "attendance", title: "Mark attendance for Class 10-A", due: "Today" },
  { id: 2, type: "assignment", title: "Grade Unit Test 3 papers", due: "Tomorrow" },
  { id: 3, type: "homework", title: "Review homework submissions", due: "Today" },
];

const quickActions = [
  { label: "Mark Attendance", icon: CheckSquare, path: "/attendance", color: "text-green-500" },
  { label: "My Timetable", icon: Calendar, path: "/my-timetable", color: "text-blue-500" },
  { label: "Assignments", icon: FileEdit, path: "/assignments", color: "text-purple-500" },
  { label: "View Results", icon: Award, path: "/results", color: "text-orange-500" },
];

export function TeacherDashboard() {
  const navigate = useNavigate();
  const { userProfile, permissions } = useAuth();
  const roleName = permissions?.primaryRole?.name || userProfile?.primary_role?.role_name || "Teacher";

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Teacher Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {userProfile?.full_name || "Teacher"}
              <Badge variant="secondary" className="ml-2">{roleName}</Badge>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myClasses.length}</div>
            <p className="text-xs text-muted-foreground">
              {myClasses.reduce((acc, c) => acc + c.students, 0)} total students
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySchedule.length}</div>
            <p className="text-xs text-muted-foreground">
              {todaySchedule.filter(s => s.status === "completed").length} completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingTasks.filter(t => t.due === "Today").length} due today
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.5%</div>
            <Progress value={92.5} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.path}
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate(action.path)}
              >
                <action.icon className={`h-6 w-6 ${action.color}`} />
                <span className="text-sm">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule & My Classes */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaySchedule.map((schedule) => (
                <div
                  key={schedule.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    schedule.status === "ongoing"
                      ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                      : schedule.status === "completed"
                      ? "bg-muted/50"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-sm font-medium">{schedule.time}</p>
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <div>
                      <p className="font-medium">{schedule.class}</p>
                      <p className="text-xs text-muted-foreground">{schedule.room}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      schedule.status === "ongoing"
                        ? "default"
                        : schedule.status === "completed"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {schedule.status === "ongoing" ? (
                      <><PlayCircle className="h-3 w-3 mr-1" /> Live</>
                    ) : (
                      schedule.status
                    )}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/my-timetable")}>
              View Full Timetable <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* My Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/attendance?class=${cls.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {cls.name.split("-")[1]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{cls.name}</p>
                      <p className="text-xs text-muted-foreground">{cls.subject}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{cls.students} students</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Next: {cls.nextClass}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Pending Tasks
          </CardTitle>
          <CardDescription>Tasks that need your attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  {task.type === "attendance" && <CheckSquare className="h-5 w-5 text-green-500" />}
                  {task.type === "assignment" && <FileEdit className="h-5 w-5 text-purple-500" />}
                  {task.type === "homework" && <Edit3 className="h-5 w-5 text-blue-500" />}
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">Due: {task.due}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" /> View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
