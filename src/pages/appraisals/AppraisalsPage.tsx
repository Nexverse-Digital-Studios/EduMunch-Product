/**
 * Appraisals Page - Employee Performance Reviews
 *
 * Features:
 * - Manage performance appraisal cycles
 * - View and submit appraisals
 * - Track ratings and feedback
 * - Goal setting and achievement tracking
 *
 * Note: Currently using demo data. Full Supabase integration pending.
 */
import { useState } from "react";
import {
  Award,
  Plus,
  Search,
  Calendar,
  Download,
  Users,
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  Star,
  Eye,
  MoreVertical,
  Edit,
  MessageSquare,
  BarChart3,
  ClipboardList,
  Filter,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Demo appraisal data
const demoCycles = [
  {
    id: 1,
    name: "Annual Review 2025-26",
    period: "April 2025 - March 2026",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    status: "upcoming",
    employees: 48,
    completed: 0,
  },
  {
    id: 2,
    name: "Annual Review 2024-25",
    period: "April 2024 - March 2025",
    startDate: "2025-03-01",
    endDate: "2025-03-31",
    status: "completed",
    employees: 45,
    completed: 45,
  },
];

const demoAppraisals = [
  {
    id: 1,
    employeeId: "EMP001",
    name: "Rajesh Sharma",
    department: "Teaching",
    designation: "Senior Teacher",
    reviewPeriod: "2024-25",
    selfRating: 4.2,
    managerRating: 4.5,
    finalRating: 4.4,
    status: "completed",
    submittedDate: "2025-03-15",
    goals: 8,
    goalsAchieved: 7,
    feedback: "Excellent performance in student engagement and innovative teaching methods.",
  },
  {
    id: 2,
    employeeId: "EMP002",
    name: "Priya Patel",
    department: "Teaching",
    designation: "Teacher",
    reviewPeriod: "2024-25",
    selfRating: 4.0,
    managerRating: 4.2,
    finalRating: 4.1,
    status: "completed",
    submittedDate: "2025-03-14",
    goals: 6,
    goalsAchieved: 5,
    feedback: "Great progress in curriculum development and classroom management.",
  },
  {
    id: 3,
    employeeId: "EMP003",
    name: "Amit Kumar",
    department: "Administration",
    designation: "Office Manager",
    reviewPeriod: "2024-25",
    selfRating: 3.8,
    managerRating: null,
    finalRating: null,
    status: "pending-review",
    submittedDate: "2025-03-20",
    goals: 5,
    goalsAchieved: 4,
    feedback: null,
  },
  {
    id: 4,
    employeeId: "EMP004",
    name: "Sunita Verma",
    department: "Teaching",
    designation: "HOD - Science",
    reviewPeriod: "2024-25",
    selfRating: 4.6,
    managerRating: 4.8,
    finalRating: 4.7,
    status: "completed",
    submittedDate: "2025-03-10",
    goals: 10,
    goalsAchieved: 9,
    feedback: "Outstanding leadership in department management and academic excellence.",
  },
  {
    id: 5,
    employeeId: "EMP005",
    name: "Mohan Singh",
    department: "Support",
    designation: "Lab Assistant",
    reviewPeriod: "2024-25",
    selfRating: null,
    managerRating: null,
    finalRating: null,
    status: "pending-self",
    submittedDate: null,
    goals: 4,
    goalsAchieved: 0,
    feedback: null,
  },
  {
    id: 6,
    employeeId: "EMP006",
    name: "Kavita Gupta",
    department: "Accounts",
    designation: "Accountant",
    reviewPeriod: "2024-25",
    selfRating: 4.1,
    managerRating: 4.3,
    finalRating: 4.2,
    status: "completed",
    submittedDate: "2025-03-12",
    goals: 7,
    goalsAchieved: 6,
    feedback: "Consistent performance in financial management and reporting accuracy.",
  },
];

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  "pending-review": "bg-yellow-100 text-yellow-700",
  "pending-self": "bg-orange-100 text-orange-700",
  upcoming: "bg-blue-100 text-blue-700",
  overdue: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  completed: "Completed",
  "pending-review": "Pending Review",
  "pending-self": "Self Pending",
  upcoming: "Upcoming",
  overdue: "Overdue",
};

const ratingColors = (rating: number) => {
  if (rating >= 4.5) return "text-green-600";
  if (rating >= 4.0) return "text-blue-600";
  if (rating >= 3.5) return "text-yellow-600";
  return "text-orange-600";
};

export const AppraisalsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("appraisals");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isNewCycleOpen, setIsNewCycleOpen] = useState(false);
  const [selectedAppraisal, setSelectedAppraisal] = useState<typeof demoAppraisals[0] | null>(null);

  const stats = {
    totalAppraisals: demoAppraisals.length,
    completed: demoAppraisals.filter(a => a.status === "completed").length,
    pending: demoAppraisals.filter(a => a.status.includes("pending")).length,
    avgRating: demoAppraisals
      .filter(a => a.finalRating !== null)
      .reduce((acc, a) => acc + (a.finalRating || 0), 0) / demoAppraisals.filter(a => a.finalRating !== null).length,
  };

  const filteredAppraisals = demoAppraisals.filter(appraisal => {
    const matchesSearch = appraisal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appraisal.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || appraisal.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleView = (appraisal: typeof demoAppraisals[0]) => {
    setSelectedAppraisal(appraisal);
    setIsViewOpen(true);
  };

  const handleCreateCycle = () => {
    toast({
      title: "Appraisal cycle created",
      description: "New appraisal cycle has been created successfully.",
    });
    setIsNewCycleOpen(false);
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className={`ml-1 font-semibold ${ratingColors(rating)}`}>{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Award className="h-6 w-6" />
            Performance Appraisals
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage employee performance reviews and ratings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsNewCycleOpen(true)} className="bg-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Cycle
          </Button>
        </div>
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
                <p className="text-2xl font-bold">{stats.totalAppraisals}</p>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
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
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="appraisals">Appraisals</TabsTrigger>
          <TabsTrigger value="cycles">Appraisal Cycles</TabsTrigger>
        </TabsList>

        <TabsContent value="appraisals" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or employee ID..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full lg:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending-review">Pending Review</SelectItem>
                    <SelectItem value="pending-self">Self Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Appraisals List */}
          <div className="grid gap-4">
            {filteredAppraisals.map(appraisal => (
              <Card key={appraisal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(appraisal.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{appraisal.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {appraisal.designation} • {appraisal.department}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {appraisal.employeeId} • Review: {appraisal.reviewPeriod}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 md:gap-6">
                      {/* Goals Progress */}
                      <div className="min-w-[120px]">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Goals</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={(appraisal.goalsAchieved / appraisal.goals) * 100} className="h-2 w-20" />
                          <span className="text-sm">{appraisal.goalsAchieved}/{appraisal.goals}</span>
                        </div>
                      </div>

                      {/* Ratings */}
                      <div className="min-w-[140px]">
                        <p className="text-sm text-muted-foreground mb-1">Final Rating</p>
                        {appraisal.finalRating ? (
                          renderStars(appraisal.finalRating)
                        ) : (
                          <span className="text-sm text-muted-foreground">Not yet rated</span>
                        )}
                      </div>

                      {/* Status */}
                      <Badge className={statusColors[appraisal.status]}>
                        {statusLabels[appraisal.status]}
                      </Badge>

                      {/* Actions */}
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleView(appraisal)}>
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
                              Edit Review
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Add Feedback
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              View History
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
        </TabsContent>

        <TabsContent value="cycles" className="space-y-4">
          <div className="grid gap-4">
            {demoCycles.map(cycle => (
              <Card key={cycle.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{cycle.name}</h3>
                        <p className="text-sm text-muted-foreground">{cycle.period}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Review Window: {format(new Date(cycle.startDate), "MMM d")} - {format(new Date(cycle.endDate), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{cycle.employees}</p>
                        <p className="text-sm text-muted-foreground">Employees</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{cycle.completed}</p>
                        <p className="text-sm text-muted-foreground">Completed</p>
                      </div>
                      <div className="min-w-[120px]">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{Math.round((cycle.completed / cycle.employees) * 100)}%</span>
                        </div>
                        <Progress value={(cycle.completed / cycle.employees) * 100} className="h-2" />
                      </div>
                      <Badge className={statusColors[cycle.status]}>
                        {cycle.status.charAt(0).toUpperCase() + cycle.status.slice(1)}
                      </Badge>
                      <Button variant="outline" size="sm">
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* View Appraisal Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appraisal Details</DialogTitle>
          </DialogHeader>
          {selectedAppraisal && (
            <div className="space-y-6 py-4">
              {/* Employee Info */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {getInitials(selectedAppraisal.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedAppraisal.name}</h3>
                  <p className="text-muted-foreground">{selectedAppraisal.designation}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppraisal.department} • {selectedAppraisal.employeeId}
                  </p>
                </div>
                <Badge className={statusColors[selectedAppraisal.status]}>
                  {statusLabels[selectedAppraisal.status]}
                </Badge>
              </div>

              {/* Ratings Section */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Self Rating</p>
                    {selectedAppraisal.selfRating ? (
                      <>
                        <p className={`text-2xl font-bold ${ratingColors(selectedAppraisal.selfRating)}`}>
                          {selectedAppraisal.selfRating.toFixed(1)}
                        </p>
                        <div className="flex justify-center mt-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= Math.round(selectedAppraisal.selfRating!)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-lg text-muted-foreground">Pending</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Manager Rating</p>
                    {selectedAppraisal.managerRating ? (
                      <>
                        <p className={`text-2xl font-bold ${ratingColors(selectedAppraisal.managerRating)}`}>
                          {selectedAppraisal.managerRating.toFixed(1)}
                        </p>
                        <div className="flex justify-center mt-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= Math.round(selectedAppraisal.managerRating!)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-lg text-muted-foreground">Pending</p>
                    )}
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Final Rating</p>
                    {selectedAppraisal.finalRating ? (
                      <>
                        <p className={`text-2xl font-bold ${ratingColors(selectedAppraisal.finalRating)}`}>
                          {selectedAppraisal.finalRating.toFixed(1)}
                        </p>
                        <div className="flex justify-center mt-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= Math.round(selectedAppraisal.finalRating!)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-lg text-muted-foreground">Pending</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Goals Progress */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Goals Achievement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Progress 
                      value={(selectedAppraisal.goalsAchieved / selectedAppraisal.goals) * 100} 
                      className="h-3 flex-1" 
                    />
                    <span className="font-semibold text-lg">
                      {selectedAppraisal.goalsAchieved}/{selectedAppraisal.goals} Goals
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {Math.round((selectedAppraisal.goalsAchieved / selectedAppraisal.goals) * 100)}% of goals achieved this review period
                  </p>
                </CardContent>
              </Card>

              {/* Feedback */}
              {selectedAppraisal.feedback && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Manager Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{selectedAppraisal.feedback}</p>
                  </CardContent>
                </Card>
              )}

              {/* Submission Info */}
              {selectedAppraisal.submittedDate && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Submitted on {format(new Date(selectedAppraisal.submittedDate), "MMMM d, yyyy")}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Cycle Modal */}
      <Dialog open={isNewCycleOpen} onOpenChange={setIsNewCycleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Appraisal Cycle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cycle Name</Label>
              <Input placeholder="e.g., Annual Review 2026-27" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Review Period</Label>
              <Input placeholder="e.g., April 2026 - March 2027" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Add any notes about this appraisal cycle..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewCycleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCycle} className="bg-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Cycle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppraisalsPage;
