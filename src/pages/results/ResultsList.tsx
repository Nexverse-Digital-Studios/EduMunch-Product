/**
 * Results List Page - Exam Results Management
 * ============================================
 *
 * Supabase Tables (Tier 1):
 * - exam_types_1EMAET: Exam type definitions (Unit Test, Mid-term, Final)
 * - exams_1EMAET: Exam master with schedules
 * - exam_schedules_1EMAET: Detailed exam schedule per subject
 * - exam_marks_1EMAET: Student marks for each exam subject
 * - report_cards_1EMAET: Consolidated report cards
 */

import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import {
  TemplatesTab,
  TestsTab,
  MarksEntryTab,
  AddTemplateModal,
  AddTestModal,
  type ExamType,
  type Exam,
  type Branch,
  type Batch,
  type Student,
} from "./components";

const INDEX_TOKEN = import.meta.env.VITE_INDEX_TOKEN || "1emaet";

const ResultsList = () => {
  const [examType, setExamType] = useState<"board" | "competitive">("board");
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "templates";

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };
  const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);
  const [isAddTestOpen, setIsAddTestOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state for new template
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateCode, setNewTemplateCode] = useState("");
  const [newTemplateType, setNewTemplateType] = useState("INTERNAL");

  // Form state for new test
  const [newTestName, setNewTestName] = useState("");
  const [newTestCode, setNewTestCode] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [newTestStartDate, setNewTestStartDate] = useState("");
  const [newTestEndDate, setNewTestEndDate] = useState("");

  // Filters for marks entry
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedExamId, setSelectedExamId] = useState("");

  const { canCreate, canUpdate, canDelete } =
    useModulePermissions("EXAMINATION");
  const { toast } = useToast();

  // Fetch exam types (templates)
  const {
    data: examTypes = [],
    isLoading: loadingTypes,
    createMutation: createTypesMutation,
    deleteMutation: deleteTypesMutation,
    refetch: refetchTypes,
  } = useSupabaseTable<ExamType>(`exam_types_${INDEX_TOKEN}`, {
    select: "*",
    orderBy: { column: "display_order", ascending: true },
  });

  // Fetch exams (tests)
  const {
    data: exams = [],
    isLoading: loadingExams,
    createMutation: createExamMutation,
    deleteMutation: deleteExamsMutation,
    refetch: refetchExams,
  } = useSupabaseTable<Exam>(`exams_${INDEX_TOKEN}`, {
    select: "*",
    orderBy: { column: "start_date", ascending: false },
  });

  // Fetch branches
  const { data: branches = [] } = useSupabaseTable<Branch>(
    `branches_${INDEX_TOKEN}`,
    { select: "id, name" }
  );

  // Fetch batches
  const { data: batches = [] } = useSupabaseTable<Batch>(
    `batches_${INDEX_TOKEN}`,
    { select: "id, name" }
  );

  // Fetch students for marks entry
  const { data: students = [] } = useSupabaseTable<Student>(
    `students_${INDEX_TOKEN}`,
    { select: "id, first_name, last_name, roll_number" }
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

  const handleAddTemplate = async () => {
    if (!newTemplateName.trim() || !newTemplateCode.trim()) {
      toast({
        title: "Error",
        description: "Name and code are required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTypesMutation.mutateAsync({
        exam_type_name: newTemplateName.trim(),
        exam_type_code: newTemplateCode.trim().toUpperCase(),
        description: newTemplateType,
        is_active: true,
      } as Partial<ExamType>);
      toast({ title: "Success", description: "Template created successfully" });
      setIsAddTemplateOpen(false);
      resetTemplateForm();
      await refetchTypes();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleAddTest = async () => {
    if (
      !newTestName.trim() ||
      !newTestCode.trim() ||
      !selectedTemplateId ||
      !newTestStartDate
    ) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createExamMutation.mutateAsync({
        exam_name: newTestName.trim(),
        exam_code: newTestCode.trim().toUpperCase(),
        exam_type_id: selectedTemplateId,
        start_date: newTestStartDate,
        end_date: newTestEndDate || newTestStartDate,
        is_active: true,
      } as Partial<Exam>);
      toast({ title: "Success", description: "Exam created successfully" });
      setIsAddTestOpen(false);
      resetTestForm();
      await refetchExams();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      try {
        await deleteTypesMutation.mutateAsync(id);
        toast({ title: "Success", description: "Template deleted" });
        await refetchTypes();
      } catch (error) {
        toast({
          title: "Error",
          description: (error as Error).message,
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (confirm("Are you sure you want to delete this exam?")) {
      try {
        await deleteExamsMutation.mutateAsync(id);
        toast({ title: "Success", description: "Exam deleted" });
        await refetchExams();
      } catch (error) {
        toast({
          title: "Error",
          description: (error as Error).message,
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveAllMarks = () => {
    toast({
      title: "Info",
      description: "Marks save functionality coming soon",
    });
  };

  // Filter templates based on search
  const filteredTemplates = useMemo(() => {
    return examTypes.filter(
      (t) =>
        t.exam_type_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.exam_type_code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [examTypes, searchQuery]);

  const isLoading = loadingTypes || loadingExams;

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

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-0">
          <TabsTrigger
            value="templates"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            {examType === "competitive" ? "Exam Templates" : "Templates"} (
            {filteredTemplates.length})
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
        <TabsContent value="templates" className="mt-6">
          <TemplatesTab
            examType={examType}
            templates={filteredTemplates}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRefresh={refetchTypes}
            onAddTemplate={() => setIsAddTemplateOpen(true)}
            onEditTemplate={() => {}}
            onDeleteTemplate={handleDeleteTemplate}
            canCreate={canCreate}
            canUpdate={canUpdate}
            canDelete={canDelete}
            isDeleting={deleteTypesMutation.isPending}
          />
        </TabsContent>

        {/* Tests Tab */}
        <TabsContent value="tests" className="mt-6">
          <TestsTab
            exams={exams}
            examTypes={examTypes}
            isLoading={isLoading}
            onRefresh={refetchExams}
            onAddTest={() => setIsAddTestOpen(true)}
            onEditTest={() => {}}
            onDeleteTest={handleDeleteExam}
            canCreate={canCreate}
            canUpdate={canUpdate}
            canDelete={canDelete}
            isDeleting={deleteExamsMutation.isPending}
          />
        </TabsContent>

        {/* Marks Entry Tab */}
        <TabsContent value="marks" className="mt-6">
          <MarksEntryTab
            exams={exams}
            branches={branches}
            batches={batches}
            students={students}
            selectedBranch={selectedBranch}
            onBranchChange={setSelectedBranch}
            selectedBatch={selectedBatch}
            onBatchChange={setSelectedBatch}
            selectedExamId={selectedExamId}
            onExamChange={setSelectedExamId}
            canUpdate={canUpdate}
            onSaveAll={handleSaveAllMarks}
          />
        </TabsContent>
      </Tabs>

      {/* Add Template Modal */}
      <AddTemplateModal
        open={isAddTemplateOpen}
        onOpenChange={setIsAddTemplateOpen}
        templateName={newTemplateName}
        onTemplateNameChange={setNewTemplateName}
        templateCode={newTemplateCode}
        onTemplateCodeChange={setNewTemplateCode}
        templateType={newTemplateType}
        onTemplateTypeChange={setNewTemplateType}
        onSubmit={handleAddTemplate}
        onCancel={() => {
          setIsAddTemplateOpen(false);
          resetTemplateForm();
        }}
        isLoading={createTypesMutation.isPending}
      />

      {/* Add Test Modal */}
      <AddTestModal
        open={isAddTestOpen}
        onOpenChange={setIsAddTestOpen}
        examTypes={examTypes}
        testName={newTestName}
        onTestNameChange={setNewTestName}
        testCode={newTestCode}
        onTestCodeChange={setNewTestCode}
        selectedTemplateId={selectedTemplateId}
        onTemplateIdChange={setSelectedTemplateId}
        startDate={newTestStartDate}
        onStartDateChange={setNewTestStartDate}
        endDate={newTestEndDate}
        onEndDateChange={setNewTestEndDate}
        onSubmit={handleAddTest}
        onCancel={() => {
          setIsAddTestOpen(false);
          resetTestForm();
        }}
        isLoading={createExamMutation.isPending}
      />
    </div>
  );
};

export default ResultsList;
