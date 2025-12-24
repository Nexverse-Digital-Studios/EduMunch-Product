import { useState } from "react";
import { Plus, Pencil, Trash2, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject, Subject } from "@/hooks/useSupabaseQuery";
import { useToast } from "@/hooks/use-toast";

const Subjects = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteSubjectId, setDeleteSubjectId] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({ subject_name: "", subject_code: "", subject_type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch subjects from Supabase
  const { data: subjects, isLoading, error, refetch } = useSubjects();
  const createSubjectMutation = useCreateSubject();
  const updateSubjectMutation = useUpdateSubject();
  const deleteSubjectMutation = useDeleteSubject();

  const openAddModal = () => {
    setEditingSubject(null);
    setFormData({ subject_name: "", subject_code: "", subject_type: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({ 
      subject_name: subject.subject_name, 
      subject_code: subject.subject_code, 
      subject_type: subject.subject_type || "" 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.subject_name || !formData.subject_code) {
      toast({
        title: 'Validation Error',
        description: 'Subject name and code are required',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSubject) {
        await updateSubjectMutation.mutateAsync({
          id: editingSubject.id,
          data: {
            subject_name: formData.subject_name,
            subject_code: formData.subject_code.toUpperCase(),
            subject_type: formData.subject_type || undefined,
          },
        });
      } else {
        await createSubjectMutation.mutateAsync({
          subject_name: formData.subject_name,
          subject_code: formData.subject_code.toUpperCase(),
          subject_type: formData.subject_type || undefined,
          is_active: true,
        });
      }
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteSubjectId) return;
    await deleteSubjectMutation.mutateAsync(deleteSubjectId);
    setDeleteSubjectId(null);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading subjects</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Subject Management</h1>
        </div>
        <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!subjects || subjects.length === 0) && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Subjects Found</h3>
          <p className="text-muted-foreground mb-4">Get started by creating your first subject.</p>
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </div>
      )}

      {/* Desktop Table */}
      {!isLoading && subjects && subjects.length > 0 && (
        <div className="hidden md:block border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Subject Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{subject.subject_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{subject.subject_code}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      {subject.subject_type || "General"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={subject.is_active ? "default" : "destructive"}>
                      {subject.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditModal(subject)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteSubjectId(subject.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Mobile Cards */}
      {!isLoading && subjects && subjects.length > 0 && (
        <div className="md:hidden space-y-4">
          {subjects.map((subject) => (
            <div key={subject.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-foreground">{subject.subject_name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Code: {subject.subject_code}</p>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {subject.subject_type || "General"}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEditModal(subject)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteSubjectId(subject.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {editingSubject ? "Edit Subject" : "Add Subject"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Subject Name <span className="text-destructive">*</span></Label>
              <Input 
                value={formData.subject_name} 
                onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                placeholder="e.g., Mathematics" 
              />
            </div>
            <div className="space-y-2">
              <Label>Subject Code <span className="text-destructive">*</span></Label>
              <Input 
                value={formData.subject_code} 
                onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })}
                placeholder="e.g., MATH" 
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Input 
                value={formData.subject_type} 
                onChange={(e) => setFormData({ ...formData, subject_type: e.target.value })}
                placeholder="e.g., Theory, Practical, Lab" 
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90" 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingSubject ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  editingSubject ? "Update Subject" : "Add Subject"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteSubjectId} onOpenChange={() => setDeleteSubjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the subject
              and may affect related topics and class assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Subjects;