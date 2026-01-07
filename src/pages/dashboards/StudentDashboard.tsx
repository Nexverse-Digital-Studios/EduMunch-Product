/**
 * Student Dashboard - EduMunch
 * =============================
 * 
 * Dashboard specifically for student role.
 * Focuses on personal academics, attendance, and learning resources.
 * 
 * Features:
 * - My attendance and performance
 * - Today's timetable
 * - Assignments and homework
 * - Exam schedule and results
 * - Study materials
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  FileText,
  Award,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ClipboardList,
  PlayCircle,
  Edit3,
  Eye,
  Bell,
  DollarSign,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

// Demo data for student dashboard
const studentInfo = {
  class: "Class 10-A",
  rollNo: "15",
  attendance: 94.5,
  avgMarks: 87.2,
  rank: 5,
  pendingFees: 15000,
};

const todaySchedule = [
  { id: 1, time: "09:00 AM", subject: "Mathematics", teacher: "Mr. Sharma", room: "Room 101", status: "completed" },
  { id: 2, time: "10:00 AM", subject: "Physics", teacher: "Mrs. Gupta", room: "Lab 1", status: "ongoing" },
  { id: 3, time: "11:30 AM", subject: "English", teacher: "Ms. Patel", room: "Room 103", status: "upcoming" },
  { id: 4, time: "02:00 PM", subject: "Chemistry", teacher: "Mr. Kumar", room: "Lab 2", status: "upcoming" },
];

const pendingAssignments = [
  { id: 1, subject: "Mathematics", title: "Chapter 5 Problems", due: "Jan 10, 2026", status: "pending" },
  { id: 2, subject: "Physics", title: "Lab Report - Optics", due: "Jan 12, 2026", status: "pending" },
  { id: 3, subject: "English", title: "Essay Writing", due: "Jan 15, 2026", status: "in-progress" },
];

const upcomingExams = [
  { id: 1, subject: "Mathematics", date: "Jan 20, 2026", type: "Unit Test" },
  { id: 2, subject: "Physics", date: "Jan 22, 2026", type: "Unit Test" },
  { id: 3, subject: "Chemistry", date: "Jan 25, 2026", type: "Lab Practical" },
];

const recentResults = [
  { id: 1, subject: "Mathematics", exam: "Unit Test 3", marks: 85, total: 100 },
  { id: 2, subject: "Physics", exam: "Unit Test 3", marks: 78, total: 100 },
  { id: 3, subject: "English", exam: "Unit Test 3", marks: 92, total: 100 },
];

const quickActions = [
  { label: "My Timetable", icon: Calendar, path: "/my-timetable", color: "text-blue-500" },
  { label: "Assignments", icon: FileText, path: "/assignments", color: "text-purple-500" },
  { label: "Study Materials", icon: BookOpen, path: "/study-materials", color: "text-green-500" },
  { label: "My Results", icon: Award, path: "/results", color: "text-orange-500" },
];

export function StudentDashboard() {
  const navigate = useNavigate();
  const { userProfile, permissions } = useAuth();
  const roleName = permissions?.primaryRole?.name || userProfile?.primary_role?.role_name || "Student";

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userProfile?.full_name?.split(" ").map(n => n[0]).join("") || "ST"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome, {userProfile?.full_name || "Student"}!
            </h1>
            <p className="text-muted-foreground">
              {studentInfo.class} • Roll No: {studentInfo.rollNo}
              <Badge variant="secondary" className="ml-2">{roleName}</Badge>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Attendance</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentInfo.attendance}%</div>
            <Progress value={studentInfo.attendance} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Marks</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentInfo.avgMarks}%</div>
            <p className="text-xs text-muted-foreground">
              Class Rank: #{studentInfo.rank}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
            <ClipboardList className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAssignments.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingAssignments.filter(a => a.status === "in-progress").length} in progress
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingExams.length}</div>
            <p className="text-xs text-muted-foreground">
              Next: {upcomingExams[0]?.date}
            </p>
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

      {/* Today's Schedule & Assignments */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Classes
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
                    <div className="text-center min-w-[60px]">
                      <p className="text-sm font-medium">{schedule.time}</p>
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <div>
                      <p className="font-medium">{schedule.subject}</p>
                      <p className="text-xs text-muted-foreground">{schedule.teacher} • {schedule.room}</p>
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
                      <><PlayCircle className="h-3 w-3 mr-1" /> Now</>
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

        {/* Pending Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Pending Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate("/assignments")}
                >
                  <div>
                    <p className="font-medium">{assignment.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {assignment.subject} • Due: {assignment.due}
                    </p>
                  </div>
                  <Badge
                    variant={assignment.status === "in-progress" ? "default" : "outline"}
                  >
                    {assignment.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/assignments")}>
              View All Assignments <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Exams & Recent Results */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Upcoming Exams */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Upcoming Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">{exam.subject}</p>
                      <p className="text-xs text-muted-foreground">{exam.type}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{exam.date}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{result.subject}</p>
                    <p className="text-xs text-muted-foreground">{result.exam}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {result.marks}/{result.total}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {((result.marks / result.total) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/results")}>
              View All Results <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
