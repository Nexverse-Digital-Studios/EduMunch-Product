import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Calendar,
  ClipboardList,
  Users,
  FileText,
  Download,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useToast } from "@/hooks/use-toast";
import { ExamDB, EXAM_TYPES, EXAM_STATUSES } from "./types";
import { ExamFormDialog } from "./ExamFormDialog";

// Sub-page components (embedded as tabs)
import { ExamSchedulePage } from "./ExamSchedulePage";
import { MarksEntryPage } from "./MarksEntryPage";

const INDEX_TOKEN = "1emaet";

export function ExamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canView, canUpdate, canCreate } = useModulePermissions("exams");
  const [activeTab, setActiveTab] = useState("details");
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const {
    data: exams,
    isLoading,
    error,
    refetch,
  } = useSupabaseTable<ExamDB>(`exams_${INDEX_TOKEN}`, {
    filters: { id },
  });

  const exam = exams?.[0];

  if (!canView) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to view this exam.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-red-500">
            {error ? `Error: ${error.message}` : "Exam not found"}
          </p>
          <div className="flex justify-center mt-4">
            <Button onClick={() => navigate("/exams")}>Back to Exams</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusInfo = EXAM_STATUSES.find((s) => s.value === status);
    return (
      <Badge
        variant={(statusInfo?.color as any) || "secondary"}
        className="text-sm"
      >
        {statusInfo?.label || status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeInfo = EXAM_TYPES.find((t) => t.value === type);
    return <Badge variant="outline">{typeInfo?.label || type}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/exams")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {exam.exam_name}
              </h1>
              {getStatusBadge(exam.status)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {getTypeBadge(exam.exam_type)}
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {new Date(exam.start_date).toLocaleDateString()} -{" "}
                {new Date(exam.end_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        {canUpdate && (
          <Button onClick={() => setEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Exam
          </Button>
        )}
      </div>

      {/* Tabs for all exam functionality */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="marks">Marks</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow h-full"
              onClick={() => setActiveTab("schedule")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Schedule</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Manage exam schedule
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow h-full"
              onClick={() => setActiveTab("marks")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Marks Entry</CardTitle>
                <ClipboardList className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Enter student marks
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow h-full"
              onClick={() => toast({ title: "Seating", description: "Seating arrangement coming soon" })}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Seating</CardTitle>
                <Users className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Seating arrangement
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow h-full"
              onClick={() => setActiveTab("reports")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Report Cards
                </CardTitle>
                <FileText className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Generate report cards
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Exam Details */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Exam Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Exam Type</p>
                    <p className="font-medium">
                      {EXAM_TYPES.find((t) => t.value === exam.exam_type)?.label ||
                        exam.exam_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">{getStatusBadge(exam.status)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">
                      {new Date(exam.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">
                      {new Date(exam.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Separator />
                {exam.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="mt-1">{exam.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Marks Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Maximum Marks</p>
                    <p className="text-2xl font-bold">{exam.max_marks}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Passing Marks</p>
                    <p className="text-2xl font-bold">{exam.passing_marks}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-2">
                  <CheckCircle
                    className={`h-5 w-5 ${
                      exam.is_published ? "text-green-500" : "text-gray-400"
                    }`}
                  />
                  <span>{exam.is_published ? "Published" : "Not Published"}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Actions</CardTitle>
              <CardDescription>More exam management options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => toast({ title: "Admit Cards", description: "Coming soon" })}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Admit Cards
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => toast({ title: "Grades", description: "Coming soon" })}
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Calculate Grades
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => toast({ title: "Verify Marks", description: "Coming soon" })}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify Marks
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => toast({ title: "Export", description: "Coming soon" })}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <ExamSchedulePage examId={exam.id} />
        </TabsContent>

        {/* Marks Tab */}
        <TabsContent value="marks">
          <MarksEntryPage examId={exam.id} />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Report Cards</CardTitle>
              <CardDescription>Generate and manage report cards for this exam</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Report card generation will be available here</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate("/report-cards")}
                >
                  View All Report Cards
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <ExamFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        exam={exam}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
