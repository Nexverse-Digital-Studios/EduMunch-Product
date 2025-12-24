/**
 * Results.tsx - Exam Results Management
 * 
 * Supabase Tables (Tier 1):
 * - exam_types_1EMAET: Exam type definitions (Unit Test, Mid-term, Final)
 * - exams_1EMAET: Exam master with schedules
 * - exam_schedules_1EMAET: Detailed exam schedule per subject
 * - exam_marks_1EMAET: Student marks for each exam subject
 * - report_cards_1EMAET: Consolidated report cards
 * 
 * Schema Reference:
 * - exam_types: exam_type_name, exam_type_code, is_active
 * - exams: exam_name, exam_code, exam_type_id, start_date, end_date
 * - exam_marks: exam_schedule_id, student_id, marks_obtained, grade
 */
import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Loader2, AlertTriangle, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/dialog";
import { useSupabaseQuery, useSupabaseInsert, useSupabaseDelete } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const INDEX_TOKEN = import.meta.env.VITE_INDEX_TOKEN || '1EMAET';

// Database types
interface ExamType {
  id: string;
  exam_type_name: string;
  exam_type_code: string;
  description: string | null;
  display_order: number | null;
  is_active: boolean;
  created_at: string;
}

interface Exam {
  id: string;
  exam_name: string;
  exam_code: string;
  exam_type_id: string;
  academic_year_id: string;
  start_date: string;
  end_date: string;
  result_publish_date: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

interface ExamSchedule {
  id: string;
  exam_id: string;
  class_id: string;
  section_id: string | null;
  subject_id: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  max_marks: number;
  passing_marks: number;
  room_number: string | null;
}

interface ExamMark {
  id: string;
  exam_schedule_id: string;
  student_id: string;
  marks_obtained: number | null;
  is_absent: boolean;
  grade: string | null;
  remarks: string | null;
}

interface Branch {
  id: string;
  name: string;
}

interface Batch {
  id: string;
  name: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  roll_number: string;
}

const Results = () => {
  const [examType, setExamType] = useState<"board" | "competitive">("board");
  const [activeTab, setActiveTab] = useState("templates");
  const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);
  const [isAddTestOpen, setIsAddTestOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state for new template/test
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateCode, setNewTemplateCode] = useState("");
  const [newTemplateType, setNewTemplateType] = useState("INTERNAL");

  const [newTestName, setNewTestName] = useState("");
  const [newTestCode, setNewTestCode] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [newTestStartDate, setNewTestStartDate] = useState("");
  const [newTestEndDate, setNewTestEndDate] = useState("");

  // Filters
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedExamId, setSelectedExamId] = useState("");

  const { canRead, canCreate, canUpdate, canDelete } = useModulePermissions('EXAMINATION');
  const { toast } = useToast();

  // Fetch exam types (templates)
  const { data: examTypes = [], isLoading: loadingTypes, error: typesError, refetch: refetchTypes } = useSupabaseQuery<ExamType>(
    `exam_types_${INDEX_TOKEN}`,
    {
      select: '*',
      orderBy: { column: 'display_order', ascending: true }
    }
  );

  // Fetch exams (tests)
  const { data: exams = [], isLoading: loadingExams, error: examsError, refetch: refetchExams } = useSupabaseQuery<Exam>(
    `exams_${INDEX_TOKEN}`,
    {
      select: '*',
      orderBy: { column: 'start_date', ascending: false }
    }
  );

  // Fetch branches
  const { data: branches = [] } = useSupabaseQuery<Branch>(
    `branches_${INDEX_TOKEN}`,
    { select: 'id, name' }
  );

  // Fetch batches
  const { data: batches = [] } = useSupabaseQuery<Batch>(
    `batches_${INDEX_TOKEN}`,
    { select: 'id, name' }
  );

  // Fetch students for marks entry
  const { data: students = [] } = useSupabaseQuery<Student>(
    `students_${INDEX_TOKEN}`,
    { select: 'id, first_name, last_name, roll_number' }
  );

  // Insert mutation for exam types
  const insertTypeMutation = useSupabaseInsert<Partial<ExamType>>(
    `exam_types_${INDEX_TOKEN}`,
    {
      onSuccess: () => {
        toast({ title: "Success", description: "Template created successfully" });
        setIsAddTemplateOpen(false);
        resetTemplateForm();
        refetchTypes();
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  );

  // Insert mutation for exams
  const insertExamMutation = useSupabaseInsert<Partial<Exam>>(
    `exams_${INDEX_TOKEN}`,
    {
      onSuccess: () => {
        toast({ title: "Success", description: "Exam created successfully" });
        setIsAddTestOpen(false);
        resetTestForm();
        refetchExams();
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  );

  // Delete mutations
  const deleteTypeMutation = useSupabaseDelete(
    `exam_types_${INDEX_TOKEN}`,
    {
      onSuccess: () => {
        toast({ title: "Success", description: "Template deleted" });
        refetchTypes();
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  );

  const deleteExamMutation = useSupabaseDelete(
    `exams_${INDEX_TOKEN}`,
    {
      onSuccess: () => {
        toast({ title: "Success", description: "Exam deleted" });
        refetchExams();
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  );

  const resetTemplateForm = () => {
    setNewTemplateName("");
    setNewTemplateCode("");
    setNewTemplateType("INTERNAL");
  };

  const resetTestForm = () => {
    setNewTestName("");
    setNewTestCode("");
    setSelectedTemplateId("");
    setNewTestStartDate("");
    setNewTestEndDate("");
  };

  const handleAddTemplate = () => {
    if (!newTemplateName.trim() || !newTemplateCode.trim()) {
      toast({ title: "Error", description: "Name and code are required", variant: "destructive" });
      return;
    }

    insertTypeMutation.mutate({
      exam_type_name: newTemplateName.trim(),
      exam_type_code: newTemplateCode.trim().toUpperCase(),
      description: newTemplateType,
      is_active: true
    });
  };

  const handleAddTest = () => {
    if (!newTestName.trim() || !newTestCode.trim() || !selectedTemplateId || !newTestStartDate) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }

    insertExamMutation.mutate({
      exam_name: newTestName.trim(),
      exam_code: newTestCode.trim().toUpperCase(),
      exam_type_id: selectedTemplateId,
      start_date: newTestStartDate,
      end_date: newTestEndDate || newTestStartDate,
      is_active: true
    });
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTypeMutation.mutate({ id });
    }
  };

  const handleDeleteExam = (id: string) => {
    if (confirm("Are you sure you want to delete this exam?")) {
      deleteExamMutation.mutate({ id });
    }
  };

  // Filter templates based on exam type
  const filteredTemplates = useMemo(() => {
    // For now show all templates, can be filtered by type if needed
    return examTypes.filter(t => 
      t.exam_type_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.exam_type_code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [examTypes, searchQuery]);

  // Get exam type name for display
  const getExamTypeName = (typeId: string) => {
    const type = examTypes.find(t => t.id === typeId);
    return type ? type.exam_type_name : 'Unknown';
  };

  const isLoading = loadingTypes || loadingExams;
  const error = typesError || examsError;

  return (
    <div className="space-y-6">
      {/* Exam Type Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-0">
          <button
            onClick={() => setExamType("board")}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              examType === "board"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Board Exams
          </button>
          <button
            onClick={() => setExamType("competitive")}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              examType === "competitive"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Competitive Exams
          </button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load data: {error.message}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-0">
          <TabsTrigger
            value="templates"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            {examType === "competitive" ? "Exam Templates" : "Templates"} ({filteredTemplates.length})
          </TabsTrigger>
          <TabsTrigger
            value="tests"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            {examType === "competitive" ? "Exams" : "Tests"} ({exams.length})
          </TabsTrigger>
          <TabsTrigger
            value="marks"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            {examType === "competitive" ? "Results Entry" : "Marks Entry"}
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-foreground">
              {examType === "competitive" ? "Competitive Exam Templates" : "Test Templates"}
            </h2>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => refetchTypes()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {canCreate && (
                <Button onClick={() => setIsAddTemplateOpen(true)} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Template
                </Button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground">{template.exam_type_name}</h3>
                        <Badge 
                          variant="outline" 
                          className={template.is_active 
                            ? "bg-primary/10 text-primary" 
                            : "bg-muted text-muted-foreground"
                          }
                        >
                          {template.exam_type_code}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{template.description || 'No description'}</p>
                    </div>
                    <div className="flex gap-2">
                      {canUpdate && (
                        <Button size="sm" variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteTemplate(template.id)}
                          disabled={deleteTypeMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredTemplates.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No templates found.</p>
              )}
            </div>
          )}
        </TabsContent>

        {/* Tests Tab */}
        <TabsContent value="tests" className="mt-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-foreground">Tests</h2>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => refetchExams()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {canCreate && (
                <Button onClick={() => setIsAddTestOpen(true)} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Test
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {exams.map((exam) => (
                <div key={exam.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground">{exam.exam_name}</h3>
                      <p className="text-sm text-primary">
                        {getExamTypeName(exam.exam_type_id)} ({exam.exam_code})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Date: {format(new Date(exam.start_date), 'MMM dd, yyyy')}
                        {exam.end_date && exam.end_date !== exam.start_date && 
                          ` - ${format(new Date(exam.end_date), 'MMM dd, yyyy')}`
                        }
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {canUpdate && (
                        <Button size="sm" variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteExam(exam.id)}
                          disabled={deleteExamMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {exams.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No exams found.</p>
              )}
            </div>
          )}
        </TabsContent>

        {/* Marks Entry Tab */}
        <TabsContent value="marks" className="mt-6 space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Marks Entry</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Branch</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Batch</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Exam</Label>
              <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.exam_name} ({format(new Date(exam.start_date), 'MM/dd/yyyy')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedExamId ? (
            <>
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Student</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Marks <span className="text-muted-foreground">/ 100</span></TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.slice(0, 10).map((student) => (
                      <TableRow key={student.id} className="hover:bg-muted/20">
                        <TableCell className="font-medium text-foreground">
                          {student.first_name} {student.last_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {student.roll_number || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            className="w-24" 
                            placeholder="0"
                            min={0}
                            max={100}
                          />
                        </TableCell>
                        <TableCell>
                          <Select>
                            <SelectTrigger className="w-20">
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A+">A+</SelectItem>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="B+">B+</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="C">C</SelectItem>
                              <SelectItem value="D">D</SelectItem>
                              <SelectItem value="F">F</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {canUpdate && (
                <div className="flex justify-end">
                  <Button className="bg-primary hover:bg-primary/90">Save All</Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Please select an exam to enter marks
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Template Modal */}
      <Dialog open={isAddTemplateOpen} onOpenChange={setIsAddTemplateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Test Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Template Name<span className="text-destructive">*</span></Label>
              <Input 
                placeholder="Enter template name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Template Code<span className="text-destructive">*</span></Label>
              <Input 
                placeholder="e.g., MIDTERM, FINAL"
                value={newTemplateCode}
                onChange={(e) => setNewTemplateCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={newTemplateType} onValueChange={setNewTemplateType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTERNAL">Internal</SelectItem>
                  <SelectItem value="EXTERNAL">External</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => { setIsAddTemplateOpen(false); resetTemplateForm(); }}>
                Cancel
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={handleAddTemplate}
                disabled={insertTypeMutation.isPending}
              >
                {insertTypeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Test Modal */}
      <Dialog open={isAddTestOpen} onOpenChange={setIsAddTestOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Test</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Test Name<span className="text-destructive">*</span></Label>
              <Input 
                placeholder="Enter test name"
                value={newTestName}
                onChange={(e) => setNewTestName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Test Code<span className="text-destructive">*</span></Label>
              <Input 
                placeholder="e.g., MID2025"
                value={newTestCode}
                onChange={(e) => setNewTestCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Template<span className="text-destructive">*</span></Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {examTypes.map((template) => (
                    <SelectItem key={template.id} value={template.id}>{template.exam_type_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date<span className="text-destructive">*</span></Label>
                <Input 
                  type="date"
                  value={newTestStartDate}
                  onChange={(e) => setNewTestStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input 
                  type="date"
                  value={newTestEndDate}
                  onChange={(e) => setNewTestEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => { setIsAddTestOpen(false); resetTestForm(); }}>
                Cancel
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={handleAddTest}
                disabled={insertExamMutation.isPending}
              >
                {insertExamMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Test
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Results;