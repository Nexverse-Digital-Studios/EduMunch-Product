/**
 * BatchesList Page
 * =================
 * Main batches/sections listing page with tabs for managing batches, subjects, and faculty
 * Route: /batches
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Layers,
  RefreshCw,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import {
  BatchTable,
  BatchCard,
  DeleteBatchDialog,
  DualListTransfer,
  type SectionDB,
  type ClassDB,
  type BatchDisplay,
  type ListItem,
} from "./components";

// Additional types for subjects and teachers
interface SubjectDB {
  id: string;
  subject_name: string;
  subject_code: string;
  is_active: boolean;
}

interface TeacherDB {
  id: string;
  user_id?: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  status: string;
}

export default function BatchesList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [onlyActive, setOnlyActive] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>("");

  // Permission checks
  const { canCreate, canUpdate, canDelete } = useModulePermissions("batches");

  // Fetch classes
  const { data: classes, isLoading: loadingClasses } =
    useSupabaseTable<ClassDB>(TABLES.CLASSES, {
      orderBy: { column: "class_order", ascending: true },
    });

  // Fetch sections (batches)
  const {
    data: sections,
    isLoading: loadingSections,
    deleteMutation,
    refetch,
  } = useSupabaseTable<SectionDB>(TABLES.SECTIONS, {
    orderBy: { column: "section_name", ascending: true },
  });

  // Fetch subjects
  const { data: subjects, isLoading: loadingSubjects } =
    useSupabaseTable<SubjectDB>(TABLES.SUBJECTS, {
      orderBy: { column: "subject_name", ascending: true },
    });

  // Fetch teachers
  const { data: teachers, isLoading: loadingTeachers } =
    useSupabaseTable<TeacherDB>(TABLES.TEACHERS, {
      orderBy: { column: "first_name", ascending: true },
    });

  const isLoading = loadingClasses || loadingSections;

  // Map sections to batch display format
  const batches: BatchDisplay[] =
    sections?.map((section) => {
      const parentClass = classes?.find((c) => c.id === section.class_id);
      return {
        id: section.id,
        name: section.section_name,
        code: section.section_code,
        className: parentClass?.class_name || "Unknown",
        classCode: parentClass?.class_code || "",
        capacity: section.capacity,
        roomNumber: section.room_number,
        isActive: section.is_active,
      };
    }) || [];

  // Filter batches
  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass =
      classFilter === "all" ||
      classes?.find((c) => c.id === classFilter)?.class_name ===
        batch.className;
    const matchesActive = !onlyActive || batch.isActive;
    return matchesSearch && matchesClass && matchesActive;
  });

  // Delete handler
  const handleDelete = (batchId: string) => {
    setBatchToDelete(batchId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (batchToDelete) {
      deleteMutation.mutate(batchToDelete, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Batch deleted successfully",
          });
          setDeleteDialogOpen(false);
          setBatchToDelete(null);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to delete batch",
            variant: "destructive",
          });
        },
      });
    }
  };

  // Subject list items for transfer
  const availableSubjectItems: ListItem[] =
    subjects
      ?.filter((s) => s.is_active)
      .map((s) => ({
        id: s.id,
        label: `${s.subject_name} (${s.subject_code})`,
      })) || [];

  // Teacher list items for transfer
  const availableTeacherItems: ListItem[] =
    teachers
      ?.filter((t) => t.status === "active")
      .map((t) => ({
        id: t.id,
        label: `${t.first_name} ${t.last_name} (${t.employee_code})`,
      })) || [];

  const selectedBatch = batchToDelete
    ? batches.find((b) => b.id === batchToDelete)
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading batches...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Layers className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Batch Management
            </h1>
            <p className="text-muted-foreground">
              Manage sections, assign subjects and faculty
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
          <TabsTrigger
            value="details"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Batch Details
          </TabsTrigger>
          <TabsTrigger
            value="subjects"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Manage Subjects
          </TabsTrigger>
          <TabsTrigger
            value="faculty"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Manage Faculty
          </TabsTrigger>
        </TabsList>

        {/* Batch Details Tab */}
        <TabsContent value="details" className="mt-6 space-y-4">
          {/* Actions & Filters */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {canCreate && (
                <Button
                  className="gap-2"
                  onClick={() => navigate("/batches/create")}
                >
                  <Plus className="h-4 w-4" />
                  Create Batch
                </Button>
              )}
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="only-active"
              checked={onlyActive}
              onCheckedChange={(checked) => setOnlyActive(checked as boolean)}
            />
            <label htmlFor="only-active" className="text-sm">
              Only Active
            </label>
          </div>

          {/* Batches List */}
          {filteredBatches.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Layers className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">
                  {searchQuery ? "No batches found" : "No batches yet"}
                </p>
                <p className="text-muted-foreground text-center mt-2 max-w-md">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Get started by creating your first batch"}
                </p>
                {canCreate && !searchQuery && (
                  <Button
                    onClick={() => navigate("/batches/create")}
                    className="mt-6"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Batch
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Desktop Table View */}
              <Card className="hidden md:block">
                <CardContent className="pt-6">
                  <BatchTable
                    batches={filteredBatches}
                    onDelete={handleDelete}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                  />
                </CardContent>
              </Card>

              {/* Mobile Card View */}
              <div className="md:hidden grid gap-4">
                {filteredBatches.map((batch) => (
                  <BatchCard
                    key={batch.id}
                    batch={batch}
                    onDelete={handleDelete}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Manage Subjects Tab */}
        <TabsContent value="subjects" className="mt-6 space-y-6">
          {loadingSubjects ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Select Batch
                </label>
                <Select
                  value={selectedSection}
                  onValueChange={setSelectedSection}
                >
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="Select a batch/section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.section_name} ({s.section_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedSection ? (
                <DualListTransfer
                  assignedTitle="Assigned Subjects"
                  assignedItems={[]} // Would come from class_subjects table
                  availableTitle="Available Subjects"
                  availableItems={availableSubjectItems}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Select a batch to manage subjects</p>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Manage Faculty Tab */}
        <TabsContent value="faculty" className="mt-6 space-y-6">
          {loadingTeachers ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Select Batch
                </label>
                <Select
                  value={selectedSection}
                  onValueChange={setSelectedSection}
                >
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="Select a batch/section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.section_name} ({s.section_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedSection ? (
                <DualListTransfer
                  assignedTitle="Assigned Faculty"
                  assignedItems={[]} // Would come from teacher_subject_sections table
                  availableTitle="Available Faculty"
                  availableItems={availableTeacherItems}
                  emptyMessage="No available teachers"
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Select a batch to manage faculty</p>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <DeleteBatchDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        batchName={selectedBatch?.name}
      />
    </div>
  );
}
