/**
 * Parent Dashboard Page - Parent Portal Home
 *
 * Features:
 * - Overview of children's performance
 * - Quick access to important information
 * - Recent activities and updates
 * - Fee payment status
 *
 * Note: Currently using demo data. Full Supabase integration pending.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  GraduationCap,
  Calendar,
  BookOpen,
  IndianRupee,
  Bell,
  MessageSquare,
  Clock,
  CheckCircle,
  TrendingUp,
  FileText,
  UserCheck,
  CalendarCheck,
  Award,
  AlertCircle,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { format, formatDistanceToNow } from "date-fns";

// Demo children data
const demoChildren = [
  {
    id: 1,
    name: "Aarav Sharma",
    class: "Class 10-A",
    rollNo: "15",
    photo: null,
    attendance: 94.5,
    avgMarks: 87.2,
    rank: 5,
    pendingFees: 15000,
    nextExam: "2026-01-15",
  },
  {
    id: 2,
    name: "Ananya Sharma",
    class: "Class 7-B",
    rollNo: "8",
    photo: null,
    attendance: 96.8,
    avgMarks: 92.5,
    rank: 2,
    pendingFees: 0,
    nextExam: "2026-01-18",
  },
];

// Demo recent activities
const recentActivities = [
  {
    id: 1,
    type: "exam_result",
    title: "Mathematics Exam Result",
    description: "Aarav scored 85/100 in Unit Test 3",
    time: "2025-12-30T10:00:00",
    icon: Award,
    color: "text-green-600",
  },
  {
    id: 2,
    type: "attendance",
    title: "Attendance Marked",
    description: "Ananya was present today",
    time: "2026-01-04T09:00:00",
    icon: UserCheck,
    color: "text-blue-600",
  },
  {
    id: 3,
    type: "homework",
    title: "New Homework Assigned",
    description: "Science homework due on Jan 8",
    time: "2026-01-03T14:00:00",
    icon: BookOpen,
    color: "text-purple-600",
  },
  {
    id: 4,
    type: "fee",
    title: "Fee Payment Reminder",
    description: "₹15,000 due for Aarav - Q3 Fees",
    time: "2026-01-02T08:00:00",
    icon: IndianRupee,
    color: "text-yellow-600",
  },
  {
    id: 5,
    type: "announcement",
    title: "School Announcement",
    description: "Annual Sports Day on Jan 26",
    time: "2025-12-28T11:00:00",
    icon: Bell,
    color: "text-orange-600",
  },
];

// Demo upcoming events
const upcomingEvents = [
  {
    id: 1,
    title: "Unit Test 4",
    date: "2026-01-15",
    type: "exam",
    child: "Aarav",
  },
  {
    id: 2,
    title: "Unit Test 4",
    date: "2026-01-18",
    type: "exam",
    child: "Ananya",
  },
  {
    id: 3,
    title: "PTM Meeting",
    date: "2026-01-20",
    type: "meeting",
    child: "All",
  },
  {
    id: 4,
    title: "Annual Sports Day",
    date: "2026-01-26",
    type: "event",
    child: "All",
  },
];

// Demo notifications
const notifications = [
  {
    id: 1,
    title: "Fee Payment Due",
    message: "Q3 fees for Aarav is pending",
    priority: "high",
    time: "2 hours ago",
  },
  {
    id: 2,
    title: "Homework Submission",
    message: "2 homework assignments pending for Ananya",
    priority: "medium",
    time: "5 hours ago",
  },
  {
    id: 3,
    title: "Report Card Available",
    message: "Term 2 report card is now available",
    priority: "low",
    time: "1 day ago",
  },
];

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-blue-100 text-blue-700",
};

export const ParentDashboardPage = () => {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Home className="h-6 w-6" />
          Welcome, Mr. Sharma
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your children's progress and stay updated
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{demoChildren.length}</p>
                <p className="text-sm text-muted-foreground">Children</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">95.6%</p>
                <p className="text-sm text-muted-foreground">Avg Attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">89.8%</p>
                <p className="text-sm text-muted-foreground">Avg Performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹15K</p>
                <p className="text-sm text-muted-foreground">Pending Fees</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Children Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Children</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {demoChildren.map(child => (
            <Card key={child.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {getInitials(child.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{child.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {child.class} • Roll No: {child.rollNo}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/parent/children/${child.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Attendance</p>
                        <p className="font-semibold text-green-600">{child.attendance}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Marks</p>
                        <p className="font-semibold text-blue-600">{child.avgMarks}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Class Rank</p>
                        <p className="font-semibold text-purple-600">#{child.rank}</p>
                      </div>
                    </div>

                    {child.pendingFees > 0 && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2 text-yellow-700">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">Pending: ₹{child.pendingFees.toLocaleString()}</span>
                        </div>
                        <Button size="sm" variant="outline" className="text-yellow-700 border-yellow-300">
                          Pay Now
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={activity.id}>
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0`}>
                      <activity.icon className={`h-5 w-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(activity.time))} ago
                      </p>
                    </div>
                  </div>
                  {index < recentActivities.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex flex-col items-center justify-center text-primary">
                      <span className="text-xs font-medium">
                        {format(new Date(event.date), "MMM")}
                      </span>
                      <span className="text-sm font-bold">
                        {format(new Date(event.date), "d")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.child}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map(notif => (
                  <div key={notif.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{notif.title}</p>
                      <Badge className={priorityColors[notif.priority]} variant="secondary">
                        {notif.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-4">
                View All Notifications
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <IndianRupee className="h-6 w-6" />
              <span>Pay Fees</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <CalendarCheck className="h-6 w-6" />
              <span>View Attendance</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span>Report Cards</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <MessageSquare className="h-6 w-6" />
              <span>Message Teacher</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentDashboardPage;
