/**
 * Parent Child Detail Page - Detailed Child Information for Parents
 *
 * Features:
 * - Child's academic performance
 * - Attendance history
 * - Fee payment status
 * - Homework and assignments
 * - Report cards
 *
 * Note: Currently using demo data. Full Supabase integration pending.
 */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  GraduationCap,
  Calendar,
  BookOpen,
  IndianRupee,
  UserCheck,
  TrendingUp,
  FileText,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  MessageSquare,
  CalendarPlus,
  Phone,
  Mail,
  MapPin,
  Star,
  Target,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

// Demo child data
const demoChild = {
  id: 1,
  name: "Aarav Sharma",
  class: "Class 10-A",
  section: "A",
  rollNo: "15",
  admissionNo: "ADM2020-001",
  dob: "2010-05-15",
  gender: "Male",
  bloodGroup: "B+",
  address: "123, Green Park, New Delhi - 110016",
  photo: null,
  classTeacher: "Mrs. Sunita Verma",
  classTeacherPhone: "+91 98765 43210",
};

// Demo attendance data
const attendanceData = {
  overall: 94.5,
  present: 142,
  absent: 8,
  leave: 5,
  total: 155,
  monthly: [
    { month: "Jul", attendance: 92 },
    { month: "Aug", attendance: 95 },
    { month: "Sep", attendance: 96 },
    { month: "Oct", attendance: 93 },
    { month: "Nov", attendance: 94 },
    { month: "Dec", attendance: 97 },
  ],
};

// Demo academic performance
const academicPerformance = {
  avgMarks: 87.2,
  rank: 5,
  totalStudents: 45,
  subjects: [
    { name: "Mathematics", marks: 85, total: 100, grade: "A" },
    { name: "Science", marks: 92, total: 100, grade: "A+" },
    { name: "English", marks: 88, total: 100, grade: "A" },
    { name: "Hindi", marks: 82, total: 100, grade: "A" },
    { name: "Social Studies", marks: 78, total: 100, grade: "B+" },
    { name: "Computer Science", marks: 95, total: 100, grade: "A+" },
  ],
  exams: [
    { name: "Unit Test 1", avgMarks: 82, date: "2025-08-15" },
    { name: "Mid Term", avgMarks: 85, date: "2025-10-10" },
    { name: "Unit Test 2", avgMarks: 88, date: "2025-11-20" },
    { name: "Unit Test 3", avgMarks: 89, date: "2025-12-15" },
  ],
};

// Demo fee data
const feeData = {
  totalFees: 85000,
  paid: 70000,
  pending: 15000,
  nextDue: "2026-01-15",
  transactions: [
    { id: 1, description: "Q1 Tuition Fee", amount: 25000, date: "2025-04-10", status: "paid" },
    { id: 2, description: "Q2 Tuition Fee", amount: 25000, date: "2025-07-12", status: "paid" },
    { id: 3, description: "Annual Charges", amount: 10000, date: "2025-04-10", status: "paid" },
    { id: 4, description: "Lab Fee", amount: 5000, date: "2025-07-12", status: "paid" },
    { id: 5, description: "Sports Fee", amount: 5000, date: "2025-07-12", status: "paid" },
    { id: 6, description: "Q3 Tuition Fee", amount: 15000, date: "2026-01-15", status: "pending" },
  ],
};

// Demo homework data
const homeworkData = [
  { id: 1, subject: "Mathematics", title: "Chapter 5 Exercises", dueDate: "2026-01-08", status: "pending" },
  { id: 2, subject: "Science", title: "Lab Report - Chemical Reactions", dueDate: "2026-01-10", status: "pending" },
  { id: 3, subject: "English", title: "Essay Writing", dueDate: "2026-01-05", status: "submitted" },
  { id: 4, subject: "Hindi", title: "Grammar Exercises", dueDate: "2026-01-03", status: "graded", grade: "A" },
];

const statusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  overdue: "bg-red-100 text-red-700",
  submitted: "bg-blue-100 text-blue-700",
  graded: "bg-green-100 text-green-700",
};

const gradeColors: Record<string, string> = {
  "A+": "text-green-600",
  "A": "text-green-600",
  "B+": "text-blue-600",
  "B": "text-blue-600",
  "C+": "text-yellow-600",
  "C": "text-yellow-600",
};

export const ParentChildDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/parent/dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{demoChild.name}</h1>
          <p className="text-muted-foreground">
            {demoChild.class} • Roll No: {demoChild.rollNo}
          </p>
        </div>
        <Button variant="outline">
          <MessageSquare className="h-4 w-4 mr-2" />
          Message Teacher
        </Button>
        <Button 
          variant="default"
          onClick={() => navigate(`/parent/ptm/request?childId=${id}`)}
        >
          <CalendarPlus className="h-4 w-4 mr-2" />
          Schedule Meeting
        </Button>
      </div>

      {/* Student Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                {getInitials(demoChild.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Admission No</p>
                <p className="font-medium">{demoChild.admissionNo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{format(new Date(demoChild.dob), "MMM d, yyyy")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blood Group</p>
                <p className="font-medium">{demoChild.bloodGroup}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Class Teacher</p>
                <p className="font-medium">{demoChild.classTeacher}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teacher Contact</p>
                <p className="font-medium">{demoChild.classTeacherPhone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Section</p>
                <p className="font-medium">{demoChild.section}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{attendanceData.overall}%</p>
                <p className="text-sm text-muted-foreground">Attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{academicPerformance.avgMarks}%</p>
                <p className="text-sm text-muted-foreground">Avg Marks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">#{academicPerformance.rank}</p>
                <p className="text-sm text-muted-foreground">Class Rank</p>
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
                <p className="text-2xl font-bold">₹{(feeData.pending / 1000)}K</p>
                <p className="text-sm text-muted-foreground">Pending Fee</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academics">Academics</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="homework">Homework</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {academicPerformance.exams.map((exam, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{exam.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(exam.date), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="w-32">
                        <Progress value={exam.avgMarks} className="h-2" />
                      </div>
                      <span className="font-semibold w-12 text-right">{exam.avgMarks}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Homework */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Recent Homework
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {homeworkData.slice(0, 4).map(hw => (
                    <div key={hw.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{hw.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {hw.subject} • Due: {format(new Date(hw.dueDate), "MMM d")}
                        </p>
                      </div>
                      <Badge className={statusColors[hw.status]}>
                        {hw.status === "graded" ? `${hw.status} (${hw.grade})` : hw.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="academics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Performance</CardTitle>
              <CardDescription>Latest examination results</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {academicPerformance.subjects.map((subject, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>{subject.marks}/{subject.total}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={subject.marks} className="h-2 w-24" />
                          <span>{subject.marks}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${gradeColors[subject.grade] || ""}`}>
                          {subject.grade}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              View Report Card
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{attendanceData.present}</p>
                <p className="text-sm text-muted-foreground">Present</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-red-600">{attendanceData.absent}</p>
                <p className="text-sm text-muted-foreground">Absent</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-yellow-600">{attendanceData.leave}</p>
                <p className="text-sm text-muted-foreground">On Leave</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">{attendanceData.total}</p>
                <p className="text-sm text-muted-foreground">Total Days</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end justify-between gap-4">
                {attendanceData.monthly.map((month, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-sm font-medium">{month.attendance}%</span>
                    <div 
                      className="w-full bg-primary rounded-t transition-all"
                      style={{ height: `${(month.attendance - 80) * 6}px` }}
                    />
                    <span className="text-sm text-muted-foreground">{month.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-6">
          {/* Fee Summary */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Fees</p>
                <p className="text-2xl font-bold">₹{feeData.totalFees.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold text-green-600">₹{feeData.paid.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <p className="text-sm text-yellow-700">Pending</p>
                <p className="text-2xl font-bold text-yellow-700">₹{feeData.pending.toLocaleString()}</p>
                <p className="text-xs text-yellow-600 mt-1">
                  Due: {format(new Date(feeData.nextDue), "MMM d, yyyy")}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Fee Progress */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Payment Progress</span>
                <span className="font-medium">{Math.round((feeData.paid / feeData.totalFees) * 100)}%</span>
              </div>
              <Progress value={(feeData.paid / feeData.totalFees) * 100} className="h-3" />
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeData.transactions.map(txn => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-medium">{txn.description}</TableCell>
                      <TableCell>₹{txn.amount.toLocaleString()}</TableCell>
                      <TableCell>{format(new Date(txn.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[txn.status]}>
                          {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {feeData.pending > 0 && (
            <Button className="bg-green-600 hover:bg-green-700">
              <IndianRupee className="h-4 w-4 mr-2" />
              Pay ₹{feeData.pending.toLocaleString()} Now
            </Button>
          )}
        </TabsContent>

        <TabsContent value="homework" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Homework & Assignments</CardTitle>
              <CardDescription>Track all pending and completed homework</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {homeworkData.map(hw => (
                    <TableRow key={hw.id}>
                      <TableCell>
                        <Badge variant="outline">{hw.subject}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{hw.title}</TableCell>
                      <TableCell>{format(new Date(hw.dueDate), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[hw.status]}>
                          {hw.status === "graded" ? `Graded: ${hw.grade}` : hw.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParentChildDetailPage;
