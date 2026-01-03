/**
 * TeacherFormDialog Component
 * ============================
 * Modal dialog wrapper for TeacherForm component
 * Used for inline create/edit operations (consolidation - replaces separate routes)
 * 
 * Route Consolidation: This component replaces:
 * - /teachers/create (handled via mode="create")
 * - /teachers/:id/edit (handled via mode="edit" with teacherId)
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import TeacherForm from "./TeacherForm";
import { TeacherDB, TeacherFormData } from "./types";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface TeacherFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  teacherId?: string;
  initialData?: TeacherDB;
  onSuccess?: () => void;
}

export function TeacherFormDialog({
  open,
  onOpenChange,
  mode,
  teacherId,
  initialData,
  onSuccess,
}: TeacherFormDialogProps) {
  const { toast } = useToast();
  const { createMutation, updateMutation } = useSupabaseTable<TeacherFormData>(
    TABLES.TEACHERS
  );

  const handleSubmit = async (data: TeacherFormData) => {
    try {
      if (mode === "create") {
        await createMutation.mutateAsync(data);
        toast({
          title: "Success",
          description: "Teacher created successfully",
        });
      } else if (mode === "edit" && teacherId) {
        await updateMutation.mutateAsync({ id: teacherId, updates: data });
        toast({
          title: "Success",
          description: "Teacher updated successfully",
        });
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: mode === "create" ? "Failed to create teacher" : "Failed to update teacher",
        variant: "destructive",
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {mode === "create" ? "Add New Teacher" : "Edit Teacher"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Fill in the details to add a new teacher."
              : "Update the teacher information."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-100px)] px-6 pb-6">
          <TeacherForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default TeacherFormDialog;
