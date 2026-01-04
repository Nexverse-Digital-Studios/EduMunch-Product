/**
 * Homework Page - Homework Assignment & Tracking
 *
 * Features:
 * - Assign homework to classes
 * - Track submissions
 * - Grade homework
 * - View submission statistics
 *
 * Note: Currently using demo data. Full Supabase integration pending.
 */
import { useState } from "react";
import {
  ClipboardList,
  Plus,
  Search,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  FileText,
  Download,
  Upload,
  Star,
  GraduationCap,
  BookOpen,
  Filter,
  BarChart3,
  Send,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Demo homework data
const demoHomework = [
  {
    id: 1,
    title: "Quadratic Equations Practice",
    subject: "Mathematics",
    class: "10A",
    teacher: "Mr. Sharma",
    assignedDate: "2026-01-02",
    dueDate: "2026-01-06",
    status: "active",
    totalStudents: 35,
    submitted: 22,
    graded: 15,
    avgScore: 78,
    description: "Solve exercises 5.1 to 5.3 from the textbook. Show all working steps.",
    attachments: 2,
    maxMarks: 20,
  },
  {
    id: 2,
    title: "Essay: Climate Change Effects",
    subject: "English",
    class: "9B",
    teacher: "Ms. Johnson",
    assignedDate: "2026-01-01",
    dueDate: "2026-01-05",
    status: "active",
    totalStudents: 38,
    submitted: 30,
    graded: 28,
    avgScore: 82,
    description: "Write a 500-word essay on the effects of climate change on local ecosystems.",
    attachments: 1,
    maxMarks: 25,
  },
  {
    id: 3,
    title: "Lab Report: Acid-Base Titration",
    subject: "Chemistry",
    class: "11A",
    teacher: "Mrs. Patel",
    assignedDate: "2025-12-28",
    dueDate: "2026-01-03",
    status: "overdue",
    totalStudents: 32,
    submitted: 28,
    graded: 28,
    avgScore: 75,
    description: "Complete the lab report for the titration experiment conducted in class.",
    attachments: 3,
    maxMarks: 30,
  },
  {
    id: 4,
    title: "French Revolution Timeline",
    subject: "History",
    class: "8C",
    teacher: "Mr. Singh",
    assignedDate: "2025-12-25",
    dueDate: "2025-12-30",
    status: "completed",
    totalStudents: 36,
    submitted: 36,
    graded: 36,
    avgScore: 85,
    description: "Create a detailed timeline of major events during the French Revolution.",
    attachments: 0,
    maxMarks: 15,
  },
  {
    id: 5,
    title: "Physics Numericals - Motion",
    subject: "Physics",
    class: "11B",
    teacher: "Dr. Kumar",
    assignedDate: "2026-01-03",
    dueDate: "2026-01-08",
    status: "active",
    totalStudents: 34,
    submitted: 10,
    graded: 0,
    avgScore: 0,
    description: "Solve numerical problems on laws of motion from chapter 4.",
    attachments: 1,
    maxMarks: 25,
  },
];

// Demo submissions for a homework
const demoSubmissions = [
  { id: 1, student: "Arjun Sharma", rollNo: "12", submittedAt: "2026-01-04T10:30:00", status: "submitted", score: null },
  { id: 2, student: "Sneha Patel", rollNo: "08", submittedAt: "2026-01-03T15:45:00", status: "graded", score: 18 },
  { id: 3, student: "Rahul Kumar", rollNo: "22", submittedAt: "2026-01-04T09:00:00", status: "graded", score: 16 },
  { id: 4, student: "Priya Verma", rollNo: "15", submittedAt: null, status: "pending", score: null },
  { id: 5, student: "Amit Singh", rollNo: "03", submittedAt: "2026-01-03T20:00:00", status: "graded", score: 19 },
];

const statusColors: Record<string, string> = {
  active: "bg-blue-100 text-blue-700",
  overdue: "bg-red-100 text-red-700",
  completed: "bg-green-100 text-green-700",
};

const submissionStatusColors: Record<string, string> = {
  submitted: "bg-yellow-100 text-yellow-700",
  graded: "bg-green-100 text-green-700",
  pending: "bg-gray-100 text-gray-600",
  late: "bg-red-100 text-red-700",
};

export const HomeworkPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<typeof demoHomework[0] | null>(null);

  const stats = {
    total: demoHomework.length,
    active: demoHomework.filter(h => h.status === "active").length,
    overdue: demoHomework.filter(h => h.status === "overdue").length,
    avgSubmission: Math.round(
      (demoHomework.reduce((acc, h) => acc + (h.submitted / h.totalStudents) * 100, 0)) / demoHomework.length
    ),
  };

  const filteredHomework = demoHomework.filter(hw => {
    const matchesSearch = hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hw.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "all" || hw.subject.toLowerCase() === selectedSubject;
    const matchesTab = activeTab === "all" || hw.status === activeTab;
    
    return matchesSearch && matchesSubject && matchesTab;
  });

  const handleAssign = () => {
    toast({
      title: "Homework assigned",
      description: "Homework has been assigned to the class successfully.",
    });
    setIsAssignOpen(false);
  };

  const handleView = (hw: typeof demoHomework[0]) => {
    setSelectedHomework(hw);
    setIsViewOpen(true);
  };

  const getSubmissionProgress = (submitted: number, total: number) => {
    return Math.round((submitted / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            Homework
          </h1>
          <p className="text-muted-foreground mt-1">
            Assign and track homework submissions
          </p>
        </div>
        <Button onClick={() => setIsAssignOpen(true)} className="bg-primary">
          <Plus className="h-4 w-4 mr-2" />
          Assign Homework
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
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
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.overdue}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgSubmission}%</p>
                <p className="text-sm text-muted-foreground">Avg. Submission</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search homework..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="mathematics">Mathematics</SelectItem>
            <SelectItem value="physics">Physics</SelectItem>
            <SelectItem value="chemistry">Chemistry</SelectItem>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="history">History</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-0">
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            All ({demoHomework.length})
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Active ({demoHomework.filter(h => h.status === "active").length})
          </TabsTrigger>
          <TabsTrigger
            value="overdue"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Overdue ({demoHomework.filter(h => h.status === "overdue").length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Completed ({demoHomework.filter(h => h.status === "completed").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredHomework.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No homework found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredHomework.map(hw => (
                <Card key={hw.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{hw.title}</h3>
                          <Badge className={statusColors[hw.status]}>
                            {hw.status.charAt(0).toUpperCase() + hw.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{hw.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {hw.subject}
                          </span>
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            Class {hw.class}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due: {format(new Date(hw.dueDate), "MMM d, yyyy")}
                          </span>
                          {hw.attachments > 0 && (
                            <span className="flex items-center gap-1">
                              <Paperclip className="h-4 w-4" />
                              {hw.attachments} files
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            {hw.maxMarks} marks
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-full sm:w-40">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Submissions</span>
                            <span className="font-medium">{hw.submitted}/{hw.totalStudents}</span>
                          </div>
                          <Progress value={getSubmissionProgress(hw.submitted, hw.totalStudents)} className="h-2" />
                        </div>
                        <div className="text-center">
                          {hw.avgScore > 0 ? (
                            <>
                              <p className="text-2xl font-bold text-foreground">{hw.avgScore}%</p>
                              <p className="text-xs text-muted-foreground">Avg. Score</p>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not graded</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleView(hw)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download All
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Assign Homework Modal */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Assign Homework
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="e.g., Chapter 5 Practice Problems" />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea placeholder="Detailed instructions for the homework..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Class/Section *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8a">8A</SelectItem>
                    <SelectItem value="9a">9A</SelectItem>
                    <SelectItem value="10a">10A</SelectItem>
                    <SelectItem value="11a">11A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Max Marks</Label>
                <Input type="number" placeholder="e.g., 20" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop or click to upload
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Browse Files
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} className="bg-primary">
              <Send className="h-4 w-4 mr-2" />
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Submissions Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedHomework?.title}</DialogTitle>
          </DialogHeader>
          {selectedHomework && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedHomework.totalStudents}</p>
                  <p className="text-xs text-muted-foreground">Total Students</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedHomework.submitted}</p>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedHomework.graded}</p>
                  <p className="text-xs text-muted-foreground">Graded</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{selectedHomework.totalStudents - selectedHomework.submitted}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoSubmissions.map(sub => (
                    <TableRow key={sub.id}>
                      <TableCell>{sub.rollNo}</TableCell>
                      <TableCell className="font-medium">{sub.student}</TableCell>
                      <TableCell>
                        {sub.submittedAt 
                          ? format(new Date(sub.submittedAt), "MMM d, h:mm a")
                          : "-"
                        }
                      </TableCell>
                      <TableCell>
                        <Badge className={submissionStatusColors[sub.status]}>
                          {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {sub.score !== null ? `${sub.score}/${selectedHomework.maxMarks}` : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {sub.status === "submitted" && (
                            <Button variant="outline" size="sm">
                              Grade
                            </Button>
                          )}
                          {sub.submittedAt && (
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomeworkPage;
