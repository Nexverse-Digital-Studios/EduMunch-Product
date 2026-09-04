/**
 * Analytics Page - School Performance Dashboard
 *
 * Features:
 * - Overview of key metrics
 * - Student performance analytics
 * - Attendance trends
 * - Fee collection insights
 * - Teacher performance metrics
 *
 * Note: Currently using demo data. Full Supabase integration pending.
 */
import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  IndianRupee,
  Calendar,
  Download,
  Filter,
  UserCheck,
  BookOpen,
  Award,
  Clock,
  Target,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Demo analytics data
const overviewStats = [
  {
    title: "Total Students",
    value: "1,248",
    change: "+12%",
    trend: "up",
    icon: GraduationCap,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Active Teachers",
    value: "48",
    change: "+4%",
    trend: "up",
    icon: Users,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Avg Attendance",
    value: "94.2%",
    change: "+2.1%",
    trend: "up",
    icon: UserCheck,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Fee Collection",
    value: "₹24.5L",
    change: "-3%",
    trend: "down",
    icon: IndianRupee,
    color: "bg-yellow-100 text-yellow-600",
  },
];

const attendanceByClass = [
  { class: "Class 1", attendance: 96.5 },
  { class: "Class 2", attendance: 95.8 },
  { class: "Class 3", attendance: 94.2 },
  { class: "Class 4", attendance: 93.7 },
  { class: "Class 5", attendance: 95.1 },
  { class: "Class 6", attendance: 92.4 },
  { class: "Class 7", attendance: 91.8 },
  { class: "Class 8", attendance: 90.5 },
  { class: "Class 9", attendance: 93.2 },
  { class: "Class 10", attendance: 94.8 },
  { class: "Class 11", attendance: 89.6 },
  { class: "Class 12", attendance: 91.2 },
];

const subjectPerformance = [
  { subject: "Mathematics", avgScore: 78, passRate: 92 },
  { subject: "Science", avgScore: 82, passRate: 95 },
  { subject: "English", avgScore: 85, passRate: 97 },
  { subject: "Hindi", avgScore: 80, passRate: 94 },
  { subject: "Social Studies", avgScore: 76, passRate: 90 },
  { subject: "Computer Science", avgScore: 88, passRate: 98 },
];

const monthlyTrends = [
  { month: "Jul", students: 1180, attendance: 92.1, fees: 18.2 },
  { month: "Aug", students: 1195, attendance: 93.5, fees: 20.5 },
  { month: "Sep", students: 1210, attendance: 94.2, fees: 22.1 },
  { month: "Oct", students: 1225, attendance: 93.8, fees: 21.8 },
  { month: "Nov", students: 1238, attendance: 94.5, fees: 23.2 },
  { month: "Dec", students: 1248, attendance: 94.2, fees: 24.5 },
];

const topPerformers = [
  { name: "Aarav Sharma", class: "Class 10-A", score: 98.5, rank: 1 },
  { name: "Priya Patel", class: "Class 10-B", score: 97.8, rank: 2 },
  { name: "Rahul Kumar", class: "Class 12-A", score: 97.2, rank: 3 },
  { name: "Ananya Gupta", class: "Class 10-A", score: 96.8, rank: 4 },
  { name: "Vikram Singh", class: "Class 12-B", score: 96.5, rank: 5 },
];

const feeStatus = {
  collected: 78,
  pending: 15,
  overdue: 7,
};

export const AnalyticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("this-month");
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track school performance and key metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {overviewStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <Badge 
                  variant="outline" 
                  className={stat.trend === "up" ? "text-green-600 border-green-200" : "text-red-600 border-red-200"}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {stat.change}
                </Badge>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academics">Academics</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Monthly Trends Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Monthly Trends
                </CardTitle>
                <CardDescription>Student enrollment and attendance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {monthlyTrends.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-primary/20 rounded-t relative"
                        style={{ height: `${(data.attendance - 85) * 15}px` }}
                      >
                        <div 
                          className="absolute bottom-0 w-full bg-primary rounded-t"
                          style={{ height: `${(data.attendance - 88) * 12}px` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{data.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-primary" />
                    <span>Attendance %</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-primary/20" />
                    <span>Target</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fee Collection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Fee Collection Status
                </CardTitle>
                <CardDescription>Current academic year fee status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-4">
                  <div className="relative h-40 w-40">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                      />
                      <circle
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="12"
                        strokeDasharray={`${feeStatus.collected * 2.51} 251`}
                        strokeLinecap="round"
                      />
                      <circle
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke="#eab308"
                        strokeWidth="12"
                        strokeDasharray={`${feeStatus.pending * 2.51} 251`}
                        strokeDashoffset={`${-feeStatus.collected * 2.51}`}
                        strokeLinecap="round"
                      />
                      <circle
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="12"
                        strokeDasharray={`${feeStatus.overdue * 2.51} 251`}
                        strokeDashoffset={`${-(feeStatus.collected + feeStatus.pending) * 2.51}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{feeStatus.collected}%</span>
                      <span className="text-sm text-muted-foreground">Collected</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span>Collected ({feeStatus.collected}%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <span>Pending ({feeStatus.pending}%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span>Overdue ({feeStatus.overdue}%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top Performers
              </CardTitle>
              <CardDescription>Highest scoring students this term</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((student, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? "bg-yellow-500" : 
                      index === 1 ? "bg-gray-400" : 
                      index === 2 ? "bg-amber-600" : "bg-primary"
                    }`}>
                      {student.rank}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.class}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{student.score}%</p>
                      <p className="text-xs text-muted-foreground">Average Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academics" className="space-y-6">
          {/* Subject Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Subject-wise Performance
              </CardTitle>
              <CardDescription>Average scores and pass rates by subject</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectPerformance.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{subject.subject}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Avg: <strong>{subject.avgScore}%</strong></span>
                        <Badge variant="outline" className="text-green-600">
                          {subject.passRate}% Pass
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Progress value={subject.avgScore} className="h-2 flex-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Distribution */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600">32%</p>
                <p className="text-sm text-muted-foreground">Above 90%</p>
                <p className="text-xs text-muted-foreground mt-1">399 students</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600">45%</p>
                <p className="text-sm text-muted-foreground">70% - 90%</p>
                <p className="text-xs text-muted-foreground mt-1">562 students</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <p className="text-3xl font-bold text-yellow-600">23%</p>
                <p className="text-sm text-muted-foreground">Below 70%</p>
                <p className="text-xs text-muted-foreground mt-1">287 students</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          {/* Class-wise Attendance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Class-wise Attendance
              </CardTitle>
              <CardDescription>Average attendance percentage by class</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {attendanceByClass.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">{item.class}</p>
                    <p className={`text-2xl font-bold mt-1 ${
                      item.attendance >= 95 ? "text-green-600" :
                      item.attendance >= 90 ? "text-blue-600" :
                      "text-yellow-600"
                    }`}>
                      {item.attendance}%
                    </p>
                    <Progress 
                      value={item.attendance} 
                      className="h-1 mt-2" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">1,176</p>
                    <p className="text-sm text-muted-foreground">Present Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">72</p>
                    <p className="text-sm text-muted-foreground">Absent Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">24</p>
                    <p className="text-sm text-muted-foreground">On Leave</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          {/* Financial Overview */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <IndianRupee className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">₹24.5L</p>
                    <p className="text-sm text-muted-foreground">Collected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">₹4.7L</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">₹2.2L</p>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">₹31.4L</p>
                    <p className="text-sm text-muted-foreground">Total Expected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Collection Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Collection Trend
              </CardTitle>
              <CardDescription>Fee collection over the past 6 months (in Lakhs)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-4 pt-4">
                {monthlyTrends.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-sm font-medium">₹{data.fees}L</span>
                    <div 
                      className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                      style={{ height: `${data.fees * 8}px` }}
                    />
                    <span className="text-sm text-muted-foreground">{data.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
