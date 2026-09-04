/**
 * ClassesList Page
 * =================
 * Main classes listing page with stats, search, and CRUD operations
 * Route: /classes
 */

import { useState } from "react";
import { Plus, BookOpen, CheckCircle2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import {
  ClassTable,
  ClassCard,
  ClassFormDialog,
  DeleteClassDialog,
  type ClassDB,
} from "./components";

export default function ClassesList() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Permission checks
  const { canCreate, canUpdate, canDelete } = useModulePermissions("classes");

  // Fetch classes data
  const { data: classes = [], isLoading } = useSupabaseTable<ClassDB>(
    TABLES.CLASSES,
    {
      orderBy: { column: "class_order", ascending: true },
    }
  );

  // Delete mutation
  const { deleteMutation } = useSupabaseTable<ClassDB>(TABLES.CLASSES);

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

  // Calculate stats
  const totalClasses = classes.length;
  const activeClasses = classes.filter((c) => c.is_active).length;

  // Filter classes by search term
  const filteredClasses = classes.filter(
    (classItem) =>
      classItem.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.class_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (classItem.description?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      )
  );

  // Delete handler
  const handleDelete = (classId: string) => {
    setClassToDelete(classId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (classToDelete) {
      deleteMutation.mutate(classToDelete, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Class deleted successfully",
          });
          setDeleteDialogOpen(false);
          setClassToDelete(null);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to delete class",
            variant: "destructive",
          });
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading classes...</p>
        </div>
      </div>
    );
  }

  const selectedClass = classToDelete
    ? classes.find((c) => c.id === classToDelete)
    : null;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground mt-1">
            Manage your school classes and grade levels
          </p>
        </div>
        {canCreate && (
          <Button onClick={handleCreate} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Add Class
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Classes
                </p>
                <p className="text-3xl font-bold mt-1">{totalClasses}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Classes
                </p>
                <p className="text-3xl font-bold mt-1">{activeClasses}</p>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by class name, code, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Classes List */}
      {filteredClasses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">
              {searchTerm ? "No classes found" : "No classes yet"}
            </p>
            <p className="text-muted-foreground text-center mt-2 max-w-md">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Get started by creating your first class"}
            </p>
            {canCreate && !searchTerm && (
              <Button
                onClick={handleCreate}
                className="mt-6"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <Card className="hidden md:block">
            <CardContent className="pt-6">
              <ClassTable
                classes={filteredClasses}
                onDelete={handleDelete}
                onEdit={handleEdit}
                canUpdate={canUpdate}
                canDelete={canDelete}
              />
            </CardContent>
          </Card>

          {/* Mobile Card View */}
          <div className="md:hidden grid gap-4">
            {filteredClasses.map((classItem) => (
              <ClassCard
                key={classItem.id}
                classItem={classItem}
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
      <DeleteClassDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        className={selectedClass?.class_name}
      />

      {/* Form Dialog */}
      <ClassFormDialog
        open={showModal}
        onOpenChange={handleModalClose}
        editId={editId}
      />
    </div>
  );
}
