/**
 * Assignment Detail Page - View Assignment Details and Submissions
 *
 * Features:
 * - Full assignment description
 * - Attachments and resources
 * - Student submissions list
 * - Grading interface
 * - Statistics
 *
 * Note: Currently using demo data. Full Supabase integration pending.
 */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Users,
  Award,
  Eye,
  MessageSquare,
  Paperclip,
  BookOpen,
  BarChart3,
  Star,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, formatDistanceToNow, isPast } from "date-fns";

// Demo assignment data
const demoAssignment = {
  id: 1,
  title: "Chapter 5: Quadratic Equations - Practice Problems",
  subject: "Mathematics",
  class: "Class 10-A",
  teacher: "Mr. Rajesh Kumar",
  createdAt: "2025-12-28",
  dueDate: "2026-01-10",
  maxMarks: 50,
  description: `
Complete the following practice problems from Chapter 5 - Quadratic Equations:

1. **Section A (10 marks)**: Solve problems 1-10 from Exercise 5.1
2. **Section B (15 marks)**: Solve problems 1-8 from Exercise 5.2
3. **Section C (15 marks)**: Word problems - Exercise 5.3 (all problems)
4. **Section D (10 marks)**: Application problems from Exercise 5.4

**Instructions:**
- Show all working steps clearly
- Use proper mathematical notation
- Draw diagrams where necessary
- Submit in a clean, organized format

**Note:** Late submissions will have 5 marks deducted per day.
  `,
  attachments: [
    { id: 1, name: "Chapter_5_Reference.pdf", size: "2.4 MB", type: "pdf" },
    { id: 2, name: "Formula_Sheet.pdf", size: "512 KB", type: "pdf" },
    { id: 3, name: "Sample_Solutions.docx", size: "1.1 MB", type: "docx" },
  ],
  status: "active",
  totalStudents: 45,
  submitted: 32,
  graded: 18,
  pending: 13,
};

// Demo submissions data
const demoSubmissions = [
  { id: 1, studentName: "Aarav Sharma", rollNo: "15", submittedAt: "2026-01-08T10:30:00", status: "graded", marks: 45, grade: "A", feedback: "Excellent work!" },
  { id: 2, studentName: "Ananya Patel", rollNo: "03", submittedAt: "2026-01-08T14:15:00", status: "graded", marks: 42, grade: "A", feedback: "Good understanding" },
  { id: 3, studentName: "Vikram Singh", rollNo: "42", submittedAt: "2026-01-09T09:00:00", status: "graded", marks: 38, grade: "B+", feedback: "Can improve on word problems" },
  { id: 4, studentName: "Priya Gupta", rollNo: "28", submittedAt: "2026-01-09T11:45:00", status: "submitted", marks: null, grade: null, feedback: null },
  { id: 5, studentName: "Rahul Verma", rollNo: "30", submittedAt: "2026-01-09T16:20:00", status: "submitted", marks: null, grade: null, feedback: null },
  { id: 6, studentName: "Neha Kapoor", rollNo: "22", submittedAt: null, status: "pending", marks: null, grade: null, feedback: null },
  { id: 7, studentName: "Arjun Reddy", rollNo: "05", submittedAt: null, status: "pending", marks: null, grade: null, feedback: null },
  { id: 8, studentName: "Kavya Nair", rollNo: "18", submittedAt: null, status: "pending", marks: null, grade: null, feedback: null },
];

// Grade distribution for stats
const gradeDistribution = [
  { grade: "A+", count: 4, percentage: 12.5 },
  { grade: "A", count: 8, percentage: 25 },
  { grade: "B+", count: 6, percentage: 18.75 },
  { grade: "B", count: 5, percentage: 15.6 },
  { grade: "C+", count: 3, percentage: 9.4 },
  { grade: "C", count: 2, percentage: 6.25 },
  { grade: "Pending", count: 4, percentage: 12.5 },
];

const statusColors: Record<string, string> = {
  graded: "bg-green-100 text-green-700",
  submitted: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
  late: "bg-red-100 text-red-700",
};

const gradeColors: Record<string, string> = {
  "A+": "bg-green-600",
  "A": "bg-green-500",
  "B+": "bg-blue-500",
  "B": "bg-blue-400",
  "C+": "bg-yellow-500",
  "C": "bg-yellow-400",
  "D": "bg-orange-400",
  "F": "bg-red-500",
};

export const AssignmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<typeof demoSubmissions[0] | null>(null);
  const [gradeInput, setGradeInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleGrade = (submission: typeof demoSubmissions[0]) => {
    setSelectedSubmission(submission);
    setGradeInput(submission.marks?.toString() || "");
    setFeedbackInput(submission.feedback || "");
    setGradeDialogOpen(true);
  };

  const submissionRate = Math.round((demoAssignment.submitted / demoAssignment.totalStudents) * 100);
  const gradedRate = Math.round((demoAssignment.graded / demoAssignment.submitted) * 100);

  const filteredSubmissions = demoSubmissions.filter(s => 
    filterStatus === "all" || s.status === filterStatus
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline">{demoAssignment.subject}</Badge>
            <Badge variant="secondary">{demoAssignment.class}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{demoAssignment.title}</h1>
          <p className="text-muted-foreground">
            By {demoAssignment.teacher} • Created {format(new Date(demoAssignment.createdAt), "MMM d, yyyy")}
          </p>
        </div>
        <Button variant="outline">
          <MessageSquare className="h-4 w-4 mr-2" />
          Send Reminder
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium">{format(new Date(demoAssignment.dueDate), "MMM d, yyyy")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Max Marks</p>
                <p className="font-medium">{demoAssignment.maxMarks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="font-medium">{demoAssignment.submitted}/{demoAssignment.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Graded</p>
                <p className="font-medium">{demoAssignment.graded}/{demoAssignment.submitted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="font-medium">{demoAssignment.totalStudents - demoAssignment.submitted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Assignment Description */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Assignment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-muted p-4 rounded-lg">
                    {demoAssignment.description}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Attachments & Progress */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Paperclip className="h-5 w-5" />
                    Attachments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {demoAssignment.attachments.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{file.size}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Submission Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Submissions</span>
                      <span>{submissionRate}%</span>
                    </div>
                    <Progress value={submissionRate} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Graded</span>
                      <span>{gradedRate}%</span>
                    </div>
                    <Progress value={gradedRate} className="h-2 bg-muted" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Submissions</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1" />
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>

          {/* Submissions Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map(submission => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(submission.studentName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{submission.studentName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{submission.rollNo}</TableCell>
                      <TableCell>
                        {submission.submittedAt 
                          ? format(new Date(submission.submittedAt), "MMM d, h:mm a")
                          : <span className="text-muted-foreground">-</span>
                        }
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[submission.status]}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {submission.marks !== null ? (
                          <span className="font-medium">
                            {submission.marks}/{demoAssignment.maxMarks}
                            <span className="ml-2 text-muted-foreground">({submission.grade})</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {submission.status !== "pending" && (
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {submission.status === "submitted" && (
                            <Button size="sm" onClick={() => handleGrade(submission)}>
                              Grade
                            </Button>
                          )}
                          {submission.status === "graded" && (
                            <Button variant="outline" size="sm" onClick={() => handleGrade(submission)}>
                              Edit
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Grade Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gradeDistribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className="w-16 font-medium">{item.grade}</span>
                      <div className="flex-1">
                        <div className="h-6 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${gradeColors[item.grade] || "bg-gray-400"} transition-all`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-16 text-right text-sm text-muted-foreground">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Summary Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-600">38.5</p>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-3xl font-bold text-blue-600">48</p>
                    <p className="text-sm text-muted-foreground">Highest Score</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-3xl font-bold text-yellow-600">28</p>
                    <p className="text-sm text-muted-foreground">Lowest Score</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-3xl font-bold text-purple-600">40</p>
                    <p className="text-sm text-muted-foreground">Median Score</p>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pass Rate (≥20 marks)</span>
                  <span className="font-bold text-green-600">94.4%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Distinction Rate (≥40 marks)</span>
                  <span className="font-bold text-blue-600">56.3%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Grade Dialog */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(selectedSubmission.studentName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedSubmission.studentName}</p>
                  <p className="text-sm text-muted-foreground">Roll No: {selectedSubmission.rollNo}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Marks (out of {demoAssignment.maxMarks})</label>
                <Input 
                  type="number" 
                  max={demoAssignment.maxMarks}
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  placeholder="Enter marks"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Feedback</label>
                <Textarea 
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="Enter feedback for the student..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setGradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setGradeDialogOpen(false)}>
              Save Grade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentDetailPage;
