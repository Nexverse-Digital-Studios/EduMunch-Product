/**
 * SubjectsList Page
 * ==================
 * Main subjects listing page with search and CRUD operations
 * Route: /subjects
 */

import { useState } from "react";
import { Plus, BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSubjects, useDeleteSubject } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import { SubjectTable, SubjectCard, SubjectFormDialog, DeleteSubjectDialog } from "./components";

export default function SubjectsList() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Permission checks
  const { canCreate, canUpdate, canDelete } = useModulePermissions("subjects");

  // Fetch subjects data
  const { data: subjects = [], isLoading, refetch } = useSubjects();

  // Delete mutation
  const deleteSubjectMutation = useDeleteSubject();

  // Modal handlers
  const handleCreate = () => {
    setEditId(null);
    setShowModal(true);
  };

  const handleEdit = (id: string) => {
    setEditId(id);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditId(null);
  };

  // Filter subjects by search term
  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.subject_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.subject_type?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      )
  );

  // Delete handler
  const handleDelete = (subjectId: string) => {
    setSubjectToDelete(subjectId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (subjectToDelete) {
      try {
        await deleteSubjectMutation.mutateAsync(subjectToDelete);
        toast({
          title: "Success",
          description: "Subject deleted successfully",
        });
        setDeleteDialogOpen(false);
        setSubjectToDelete(null);
        refetch();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete subject",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading subjects...</p>
        </div>
      </div>
    );
  }

  const selectedSubject = subjectToDelete
    ? subjects.find((s) => s.id === subjectToDelete)
    : null;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
            <p className="text-muted-foreground mt-1">
              Manage your school subjects and curriculum
            </p>
          </div>
        </div>
        {canCreate && (
          <Button onClick={handleCreate} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Add Subject
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by subject name, code, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Subjects List */}
      {filteredSubjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">
              {searchTerm ? "No subjects found" : "No subjects yet"}
            </p>
            <p className="text-muted-foreground text-center mt-2 max-w-md">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Get started by creating your first subject"}
            </p>
            {canCreate && !searchTerm && (
              <Button
                onClick={handleCreate}
                className="mt-6"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <Card className="hidden md:block">
            <CardContent className="pt-6">
              <SubjectTable
                subjects={filteredSubjects}
                onDelete={handleDelete}
                onEdit={handleEdit}
                canUpdate={canUpdate}
                canDelete={canDelete}
              />
            </CardContent>
          </Card>

          {/* Mobile Card View */}
          <div className="md:hidden grid gap-4">
            {filteredSubjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onDelete={handleDelete}
                onEdit={handleEdit}
                canUpdate={canUpdate}
                canDelete={canDelete}
              />
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteSubjectDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        subjectName={selectedSubject?.subject_name}
      />

      {/* Form Dialog */}
      <SubjectFormDialog
        open={showModal}
        onOpenChange={handleModalClose}
        editId={editId}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
