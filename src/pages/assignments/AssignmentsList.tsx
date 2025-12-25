/**
 * AssignmentsList Page
 * =====================
 * Main assignments listing page with tabs for all assignments and grading
 * Route: /assignments
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ClipboardList, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import { CreateTemplateModal } from "@/components/assignments/CreateTemplateModal";
import { SubmissionsModal } from "@/components/assignments/SubmissionsModal";
import { AssignModal } from "@/components/assignments/AssignModal";
import {
  AssignmentTable,
  AssignmentCard,
  GradingTable,
  GradingCard,
  type AssignmentDB,
} from "./components";

const INDEX_TOKEN = import.meta.env.VITE_INDEX_TOKEN || "1emaet";

export default function AssignmentsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("assignments");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<AssignmentDB | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Permission checks
  const { canCreate, canUpdate, canDelete } =
    useModulePermissions("assignments");

  // Fetch assignments with related data
  const {
    data: assignments,
    isLoading,
    error,
    refetch,
    deleteMutation,
  } = useSupabaseTable<AssignmentDB>(`assignments_${INDEX_TOKEN}`, {
    select: `
      *,
      subjects:subject_id(name),
      sections:section_id(name, classes:class_id(name)),
      teachers:teacher_id(first_name, last_name)
    `,
    orderBy: { column: "created_at", ascending: false },
  });

  // Filter assignments
  const filteredAssignments = useMemo(() => {
    if (!assignments) return [];
    return assignments.filter((assignment) => {
      const matchesSearch =
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (assignment.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ??
          false);
      const matchesType =
        typeFilter === "all" ||
        assignment.assignment_type.toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [assignments, searchQuery, typeFilter]);

  // Published assignments (for grading tab)
  const publishedAssignments = useMemo(() => {
    return filteredAssignments.filter((a) => a.is_published);
  }, [filteredAssignments]);

  const handleViewSubmissions = (assignment: AssignmentDB) => {
    setSelectedAssignment(assignment);
    setShowSubmissionsModal(true);
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!canDelete) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete assignments",
        variant: "destructive",
      });
      return;
    }
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">
          Failed to load assignments. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Assignment Management
            </h1>
            <p className="text-muted-foreground">
              Create, assign, and grade assignments
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
          <TabsTrigger
            value="assignments"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            All Assignments
          </TabsTrigger>
          <TabsTrigger
            value="grading"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Submissions & Grading
          </TabsTrigger>
        </TabsList>

        {/* All Assignments Tab */}
        <TabsContent value="assignments" className="mt-6 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="homework">Homework</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                  <SelectItem value="lab work">Lab Work</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {canCreate && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Assignment
              </Button>
            )}
          </div>

          <Card>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No assignments found</p>
                {canCreate && (
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Assignment
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <AssignmentTable
                    assignments={filteredAssignments}
                    onViewSubmissions={handleViewSubmissions}
                    onDelete={handleDeleteAssignment}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    isDeleting={deleteMutation.isPending}
                  />
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden">
                  {filteredAssignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      onViewSubmissions={handleViewSubmissions}
                      canUpdate={canUpdate}
                    />
                  ))}
                </div>
              </>
            )}
          </Card>
        </TabsContent>

        {/* Submissions & Grading Tab */}
        <TabsContent value="grading" className="mt-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium">
                Search Published Assignments
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by title..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Card>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : publishedAssignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No published assignments yet
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <GradingTable
                    assignments={publishedAssignments}
                    onViewSubmissions={handleViewSubmissions}
                  />
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden">
                  {publishedAssignments.map((assignment) => (
                    <GradingCard
                      key={assignment.id}
                      assignment={assignment}
                      onViewSubmissions={handleViewSubmissions}
                    />
                  ))}
                </div>
              </>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateTemplateModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => refetch()}
      />
      <SubmissionsModal
        open={showSubmissionsModal}
        onOpenChange={setShowSubmissionsModal}
        assignment={selectedAssignment}
      />
      <AssignModal open={showAssignModal} onOpenChange={setShowAssignModal} />
    </div>
  );
}
