/**
 * StudentFormDialog Component
 * ============================
 * Modal dialog wrapper for StudentForm component
 * Used for inline create/edit operations (consolidation - replaces separate routes)
 * 
 * Route Consolidation: This component replaces:
 * - /students/create (handled via mode="create")
 * - /students/:id/edit (handled via mode="edit" with studentId)
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StudentForm } from "./StudentForm";
import { StudentFormData } from "./types";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useToast } from "@/hooks/use-toast";

const INDEX_TOKEN = "1emaet";

interface ClassDB {
  id: string;
  class_name: string;
}

interface SectionDB {
  id: string;
  section_name: string;
  class_id: string;
}

interface AcademicYearDB {
  id: string;
  year_name: string;
  is_current?: boolean;
}

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  studentId?: string;
  initialData?: Partial<StudentFormData>;
  onSuccess?: () => void;
}

export function StudentFormDialog({
  open,
  onOpenChange,
  mode,
  studentId,
  initialData,
  onSuccess,
}: StudentFormDialogProps) {
  const { toast } = useToast();
  const { createMutation, updateMutation } = useSupabaseTable<StudentFormData>(
    `students_${INDEX_TOKEN}`
  );
  
  // Fetch dropdown data
  const { data: classes } = useSupabaseTable<ClassDB>(
    `classes_${INDEX_TOKEN}`,
    { orderBy: { column: "class_order", ascending: true } }
  );
  
  const { data: sections } = useSupabaseTable<SectionDB>(
    `sections_${INDEX_TOKEN}`
  );
  
  const { data: academicYears } = useSupabaseTable<AcademicYearDB>(
    `academic_years_${INDEX_TOKEN}`,
    { orderBy: { column: "year_name", ascending: false } }
  );

  const handleSubmit = async (data: StudentFormData) => {
    try {
      if (mode === "create") {
        await createMutation.mutateAsync(data);
        toast({
          title: "Success",
          description: "Student created successfully",
        });
      } else if (mode === "edit" && studentId) {
        await updateMutation.mutateAsync({ id: studentId, updates: data });
        toast({
          title: "Success",
          description: "Student updated successfully",
        });
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: mode === "create" ? "Failed to create student" : "Failed to update student",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {mode === "create" ? "Add New Student" : "Edit Student"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Fill in the details to add a new student."
              : "Update the student information."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-100px)] px-6 pb-6">
          <StudentForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isLoading}
            classes={classes || []}
            sections={sections || []}
            academicYears={academicYears || []}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default StudentFormDialog;
