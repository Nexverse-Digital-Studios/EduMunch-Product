/**
 * ClassEdit Page
 * ===============
 * Form page for editing an existing class
 * Route: /classes/:id/edit
 */

import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import {
  ClassForm,
  DeleteClassDialog,
  type ClassFormData,
  type ClassDB,
} from "./components";

export default function ClassEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Permission checks
  const { canDelete } = useModulePermissions("classes");

  // Fetch class data
  const { data: classes = [], isLoading } = useSupabaseTable<ClassDB>(
    TABLES.CLASSES
  );
  const classItem = classes.find((c) => c.id === id);

  // Update and delete mutations
  const { updateMutation, deleteMutation } = useSupabaseTable<ClassDB>(
    TABLES.CLASSES
  );

  // Form setup
  const form = useForm<ClassFormData>({
    defaultValues: {
      class_name: "",
      class_code: "",
      class_order: null,
      description: "",
      is_active: true,
    },
  });

  // Populate form when class data loads
  useEffect(() => {
    if (classItem) {
      form.reset({
        class_name: classItem.class_name,
        class_code: classItem.class_code,
        class_order: classItem.class_order,
        description: classItem.description || "",
        is_active: classItem.is_active,
      });
    }
  }, [classItem, form]);

  // Submit handler
  const onSubmit = (data: ClassFormData) => {
    if (!id) return;

    updateMutation.mutate(
      { id, updates: data },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Class updated successfully",
          });
          navigate(`/classes/${id}`);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to update class",
            variant: "destructive",
          });
        },
      }
    );
  };

  // Delete handler
  const handleDelete = () => {
    if (id) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Class deleted successfully",
          });
          navigate("/classes");
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
          <p className="text-muted-foreground">Loading class details...</p>
        </div>
      </div>
    );
  }

  if (!classItem) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Class Not Found</h2>
          <p className="text-muted-foreground">
            The class you're trying to edit doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate("/classes")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classes
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
          onClick={() => navigate(`/classes/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Class</h1>
          <p className="text-muted-foreground mt-1">Update class information</p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Class Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ClassForm form={form} isEdit />

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 sm:flex-none"
              >
                {updateMutation.isPending ? (
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
                onClick={() => navigate(`/classes/${id}`)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              {canDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={updateMutation.isPending}
                  className="sm:ml-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Class
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteClassDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        className={classItem.class_name}
      />
    </div>
  );
}
