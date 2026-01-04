/**
 * Surveys Page - Survey Management & Feedback Collection
 *
 * Features:
 * - Create and manage surveys
 * - View survey responses
 * - Analyze survey results
 * - Target specific audiences
 *
 * Note: Currently using demo data. Full Supabase integration pending.
 */
import { useState } from "react";
import {
  ClipboardList,
  Plus,
  Search,
  Download,
  Eye,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Filter,
  Copy,
  Send,
  BarChart3,
  PieChart,
  Play,
  Pause,
  Target,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";

// Demo surveys data
const demoSurveys = [
  {
    id: 1,
    title: "Parent Satisfaction Survey 2025",
    description: "Annual survey to measure parent satisfaction with school services",
    targetAudience: "Parents",
    status: "active",
    createdDate: "2025-12-01",
    deadline: "2026-01-15",
    totalQuestions: 15,
    responses: 342,
    targetResponses: 500,
    avgRating: 4.2,
  },
  {
    id: 2,
    title: "Teacher Feedback - Online Classes",
    description: "Gather feedback on the online teaching experience",
    targetAudience: "Teachers",
    status: "active",
    createdDate: "2025-12-10",
    deadline: "2026-01-20",
    totalQuestions: 10,
    responses: 28,
    targetResponses: 48,
    avgRating: 3.8,
  },
  {
    id: 3,
    title: "Student Cafeteria Survey",
    description: "Feedback on food quality and cafeteria services",
    targetAudience: "Students",
    status: "completed",
    createdDate: "2025-11-01",
    deadline: "2025-11-30",
    totalQuestions: 8,
    responses: 856,
    targetResponses: 800,
    avgRating: 3.5,
  },
  {
    id: 4,
    title: "Sports Facilities Feedback",
    description: "Assessment of sports infrastructure and coaching",
    targetAudience: "Students",
    status: "draft",
    createdDate: "2025-12-28",
    deadline: null,
    totalQuestions: 12,
    responses: 0,
    targetResponses: 600,
    avgRating: null,
  },
  {
    id: 5,
    title: "Annual Academic Feedback",
    description: "Comprehensive feedback on academic programs and teaching quality",
    targetAudience: "Parents",
    status: "completed",
    createdDate: "2025-10-15",
    deadline: "2025-11-15",
    totalQuestions: 20,
    responses: 425,
    targetResponses: 450,
    avgRating: 4.1,
  },
];

// Demo survey response analytics
const surveyAnalytics = {
  overallSatisfaction: [
    { label: "Very Satisfied", value: 35, color: "bg-green-500" },
    { label: "Satisfied", value: 42, color: "bg-blue-500" },
    { label: "Neutral", value: 15, color: "bg-yellow-500" },
    { label: "Dissatisfied", value: 6, color: "bg-orange-500" },
    { label: "Very Dissatisfied", value: 2, color: "bg-red-500" },
  ],
  responsesByDay: [
    { day: "Mon", count: 45 },
    { day: "Tue", count: 62 },
    { day: "Wed", count: 38 },
    { day: "Thu", count: 55 },
    { day: "Fri", count: 72 },
    { day: "Sat", count: 42 },
    { day: "Sun", count: 28 },
  ],
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  draft: "bg-gray-100 text-gray-700",
  paused: "bg-yellow-100 text-yellow-700",
};

const audienceColors: Record<string, string> = {
  Students: "bg-purple-100 text-purple-700",
  Parents: "bg-indigo-100 text-indigo-700",
  Teachers: "bg-teal-100 text-teal-700",
  Staff: "bg-orange-100 text-orange-700",
  All: "bg-pink-100 text-pink-700",
};

export const SurveysPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("surveys");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<typeof demoSurveys[0] | null>(null);

  const stats = {
    total: demoSurveys.length,
    active: demoSurveys.filter(s => s.status === "active").length,
    totalResponses: demoSurveys.reduce((acc, s) => acc + s.responses, 0),
    avgRating: (demoSurveys.filter(s => s.avgRating).reduce((acc, s) => acc + (s.avgRating || 0), 0) / 
                demoSurveys.filter(s => s.avgRating).length).toFixed(1),
  };

  const filteredSurveys = demoSurveys.filter(survey => {
    const matchesSearch = survey.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || survey.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreate = () => {
    toast({
      title: "Survey created",
      description: "New survey has been created successfully.",
    });
    setIsCreateOpen(false);
  };

  const handleView = (survey: typeof demoSurveys[0]) => {
    setSelectedSurvey(survey);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            Surveys
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage feedback surveys
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Survey
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
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Surveys</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Play className="h-5 w-5 text-green-600" />
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
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalResponses.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgRating}</p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="surveys">All Surveys</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="surveys" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search surveys..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full lg:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Surveys List */}
          <div className="grid gap-4">
            {filteredSurveys.map(survey => (
              <Card key={survey.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{survey.title}</h3>
                            <Badge className={statusColors[survey.status]}>
                              {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{survey.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-4">
                        <Badge className={audienceColors[survey.targetAudience]}>
                          <Target className="h-3 w-3 mr-1" />
                          {survey.targetAudience}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {survey.totalQuestions} questions
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Created {formatDistanceToNow(new Date(survey.createdDate))} ago
                        </span>
                        {survey.deadline && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Due: {format(new Date(survey.deadline), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>

                      {/* Response Progress */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">
                            {survey.responses} of {survey.targetResponses} responses
                          </span>
                          <span className="font-medium">
                            {Math.round((survey.responses / survey.targetResponses) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={(survey.responses / survey.targetResponses) * 100} 
                          className="h-2" 
                        />
                      </div>
                    </div>

                    <div className="flex lg:flex-col items-center gap-3">
                      {survey.avgRating && (
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <p className="text-2xl font-bold text-primary">{survey.avgRating}</p>
                          <p className="text-xs text-muted-foreground">Avg Rating</p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleView(survey)}>
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
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Send className="h-4 w-4 mr-2" />
                              Share Link
                            </DropdownMenuItem>
                            {survey.status === "active" ? (
                              <DropdownMenuItem>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                              </DropdownMenuItem>
                            ) : survey.status === "draft" ? (
                              <DropdownMenuItem>
                                <Play className="h-4 w-4 mr-2" />
                                Publish
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
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
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Overall Satisfaction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Overall Satisfaction
                </CardTitle>
                <CardDescription>Response distribution across all surveys</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {surveyAnalytics.overallSatisfaction.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{item.label}</span>
                        <span className="text-sm font-medium">{item.value}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} rounded-full`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Responses by Day */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Responses This Week
                </CardTitle>
                <CardDescription>Daily response count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end justify-between gap-2">
                  {surveyAnalytics.responsesByDay.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-sm font-medium">{day.count}</span>
                      <div 
                        className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                        style={{ height: `${(day.count / 80) * 150}px` }}
                      />
                      <span className="text-xs text-muted-foreground">{day.day}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-green-600">77%</p>
                <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">68%</p>
                <p className="text-sm text-muted-foreground">Response Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">4.2</p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-yellow-600">3.5 min</p>
                <p className="text-sm text-muted-foreground">Avg Completion Time</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Survey Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Survey</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Survey Title</Label>
              <Input placeholder="e.g., Annual Parent Satisfaction Survey" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                placeholder="Describe the purpose of this survey..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="parents">Parents</SelectItem>
                    <SelectItem value="teachers">Teachers</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Target Responses</Label>
              <Input type="number" placeholder="e.g., 500" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} className="bg-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Survey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Survey Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Survey Details</DialogTitle>
          </DialogHeader>
          {selectedSurvey && (
            <div className="space-y-4 py-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{selectedSurvey.title}</h3>
                  <Badge className={statusColors[selectedSurvey.status]}>
                    {selectedSurvey.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedSurvey.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Target Audience</p>
                  <p className="font-medium">{selectedSurvey.targetAudience}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="font-medium">{selectedSurvey.totalQuestions}</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Response Progress</span>
                  <span className="font-medium">
                    {selectedSurvey.responses}/{selectedSurvey.targetResponses}
                  </span>
                </div>
                <Progress 
                  value={(selectedSurvey.responses / selectedSurvey.targetResponses) * 100} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {Math.round((selectedSurvey.responses / selectedSurvey.targetResponses) * 100)}% complete
                </p>
              </div>

              {selectedSurvey.avgRating && (
                <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{selectedSurvey.avgRating}</p>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Based on {selectedSurvey.responses} responses</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Created: {format(new Date(selectedSurvey.createdDate), "MMMM d, yyyy")}
              </div>
              {selectedSurvey.deadline && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Deadline: {format(new Date(selectedSurvey.deadline), "MMMM d, yyyy")}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Results
            </Button>
            <Button className="bg-primary">
              <Edit className="h-4 w-4 mr-2" />
              Edit Survey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SurveysPage;
