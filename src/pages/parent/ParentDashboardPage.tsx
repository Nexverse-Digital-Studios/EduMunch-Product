/**
 * Parent Dashboard Page - Parent Portal Home
 *
 * Features:
 * - Overview of children's performance
 * - Quick access to important information
 * - Recent activities and updates
 * - Fee payment status
 *
 * Uses real data from Supabase via parentService
 */
import { useState, useEffect } from "react";
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
  CalendarPlus,
  Award,
  AlertCircle,
  ChevronRight,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { format, formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { getChildrenWithStats, getParentProfile, ChildWithStats, ParentProfile } from "@/services/parent";
import { getPTMBookingsForParent } from "@/services/ptm";

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
  const { user } = useAuth();
  
  // State for real data
  const [children, setChildren] = useState<ChildWithStats[]>([]);
  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null);
  const [ptmRequests, setPtmRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setChildren([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log('Fetching parent data for user.id:', user.id);
        
        // Fetch parent profile, children and PTM requests in parallel
        const [profile, childrenData, ptmData] = await Promise.all([
          getParentProfile(user.id),
          getChildrenWithStats(user.id),
          getPTMBookingsForParent(user.id),
        ]);

        console.log('PTM Data received:', ptmData);
        console.log('PTM Data length:', ptmData?.length);

        setParentProfile(profile);
        setChildren(childrenData || []);
        setPtmRequests(ptmData || []);
      } catch (error) {
        console.error('Error fetching parent data:', error);
        setChildren([]);
        setPtmRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getFullName = (child: ChildWithStats) => {
    return `${child.first_name} ${child.last_name}`;
  };

  const getClassSection = (child: ChildWithStats) => {
    const className = child.class?.class_name || 'N/A';
    const sectionName = child.section?.section_name || '';
    return sectionName ? `${className}-${sectionName}` : className;
  };

  // Calculate aggregate stats
  const totalPendingFees = children.reduce((sum, c) => sum + (c.pending_fees || 0), 0);
  const avgAttendance = children.length > 0 
    ? Math.round(children.reduce((sum, c) => sum + (c.attendance_percentage || 0), 0) / children.length * 10) / 10
    : 0;
  const avgPerformance = children.length > 0
    ? Math.round(children.reduce((sum, c) => sum + (c.average_marks || 0), 0) / children.length * 10) / 10
    : 0;

  const parentName = parentProfile?.full_name 
    || user?.user_metadata?.full_name 
    || 'Parent';

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Home className="h-6 w-6" />
          Welcome, {parentName}
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
                {loading ? (
                  <Skeleton className="h-8 w-8" />
                ) : (
                  <p className="text-2xl font-bold">{children.length}</p>
                )}
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
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{avgAttendance || '--'}%</p>
                )}
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
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{avgPerformance || '--'}%</p>
                )}
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
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">
                    {totalPendingFees > 0 ? `₹${(totalPendingFees / 1000).toFixed(0)}K` : '₹0'}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">Pending Fees</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Children Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Children</h2>
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : children.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Children Found</h3>
              <p className="text-muted-foreground">
                No students are linked to your account yet. Please contact the school administration.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {children.map(child => (
              <Card key={child.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {getInitials(child.first_name, child.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h3 className="font-semibold text-lg">{getFullName(child)}</h3>
                          <p className="text-sm text-muted-foreground">
                            {getClassSection(child)} • Roll No: {child.roll_number || child.admission_number}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/parent/ptm/request?childId=${child.id}`)}
                          >
                            <CalendarPlus className="h-4 w-4 mr-1" />
                            Schedule Meeting
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/parent/children/${child.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Attendance</p>
                          <p className="font-semibold text-green-600">
                            {child.attendance_percentage !== undefined ? `${child.attendance_percentage}%` : '--'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Avg Marks</p>
                          <p className="font-semibold text-blue-600">
                            {child.average_marks !== undefined ? `${child.average_marks}%` : '--'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Admission No</p>
                          <p className="font-semibold text-purple-600">{child.admission_number}</p>
                        </div>
                      </div>

                      {(child.pending_fees || 0) > 0 && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2 text-yellow-700">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">Pending: ₹{(child.pending_fees || 0).toLocaleString()}</span>
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
        )}
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
          {/* PTM Requests */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-5 w-5" />
                  PTM Requests
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/parent/ptm/bookings')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : ptmRequests.length > 0 ? (
                <div className="space-y-3">
                  {ptmRequests.slice(0, 3).map((request: any) => (
                    <div key={request.id} className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                         onClick={() => navigate('/parent/ptm/bookings')}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">
                          {request.student?.first_name} {request.student?.last_name}
                        </p>
                        <Badge variant={
                          request.status === 'Pending' ? 'secondary' :
                          request.status === 'Confirmed' ? 'default' :
                          request.status === 'Rejected' ? 'destructive' : 'outline'
                        }>
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Teacher: {request.slot?.teacher?.first_name} {request.slot?.teacher?.last_name}
                      </p>
                      {request.slot?.ptm_date && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(request.slot.ptm_date), "MMM d, yyyy")} at {request.slot.start_time?.slice(0, 5)}
                        </p>
                      )}
                    </div>
                  ))}
                  {ptmRequests.length > 3 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigate('/parent/ptm/bookings')}
                    >
                      View {ptmRequests.length - 3} More
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No PTM requests yet</p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => {
                      if (children.length > 0) {
                        navigate(`/parent/ptm/request?childId=${children[0].id}`);
                      }
                    }}
                  >
                    Schedule a Meeting
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/parent/ptm/request')}
            >
              <CalendarPlus className="h-6 w-6" />
              <span>Schedule Meeting</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentDashboardPage;
