/**
 * SubjectEdit Page
 * =================
 * Form page for editing an existing subject
 * Route: /subjects/:id/edit
 */

import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useSubjects,
  useUpdateSubject,
  useDeleteSubject,
} from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import {
  SubjectForm,
  DeleteSubjectDialog,
  type SubjectFormData,
} from "./components";

export default function SubjectEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Permission checks
  const { canDelete } = useModulePermissions("subjects");

  // Fetch subject data
  const { data: subjects = [], isLoading, refetch } = useSubjects();
  const subject = subjects.find((s) => s.id === id);

  // Update and delete mutations
  const updateSubjectMutation = useUpdateSubject();
  const deleteSubjectMutation = useDeleteSubject();

  // Form setup
  const form = useForm<SubjectFormData>({
    defaultValues: {
      subject_name: "",
      subject_code: "",
      subject_type: "",
      is_active: true,
    },
  });

  // Populate form when subject data loads
  useEffect(() => {
    if (subject) {
      form.reset({
        subject_name: subject.subject_name,
        subject_code: subject.subject_code,
        subject_type: subject.subject_type || "",
        is_active: subject.is_active,
      });
    }
  }, [subject, form]);

  // Submit handler
  const onSubmit = async (data: SubjectFormData) => {
    if (!id) return;

    try {
      await updateSubjectMutation.mutateAsync({
        id,
        data: {
          subject_name: data.subject_name,
          subject_code: data.subject_code.toUpperCase(),
          subject_type: data.subject_type || undefined,
          is_active: data.is_active,
        },
      });
      toast({
        title: "Success",
        description: "Subject updated successfully",
      });
      refetch();
      navigate(`/subjects/${id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update subject",
        variant: "destructive",
      });
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (id) {
      try {
        await deleteSubjectMutation.mutateAsync(id);
        toast({
          title: "Success",
          description: "Subject deleted successfully",
        });
        navigate("/subjects");
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
          <p className="text-muted-foreground">Loading subject details...</p>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold">Subject Not Found</h2>
          <p className="text-muted-foreground">
            The subject you're trying to edit doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate("/subjects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subjects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(`/subjects/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Subject</h1>
            <p className="text-muted-foreground mt-1">
              Update subject information
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <SubjectForm form={form} isEdit />

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={updateSubjectMutation.isPending}
                className="flex-1 sm:flex-none"
              >
                {updateSubjectMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/subjects/${id}`)}
                disabled={updateSubjectMutation.isPending}
              >
                Cancel
              </Button>
              {canDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={updateSubjectMutation.isPending}
                  className="sm:ml-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Subject
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteSubjectDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        subjectName={subject.subject_name}
      />
    </div>
  );
}
