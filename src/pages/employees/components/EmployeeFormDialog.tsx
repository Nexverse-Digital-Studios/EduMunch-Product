/**
 * EmployeeFormDialog Component
 * =============================
 * Modal dialog wrapper for EmployeeForm component
 * Used for inline create/edit operations (consolidation - replaces separate routes)
 *
 * Route Consolidation: This component replaces:
 * - /employees/create (handled via mode="create")
 * - /employees/:id/edit (handled via mode="edit" with employeeId)
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmployeeForm, EmployeeFormData } from "./EmployeeForm";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  employeeId?: string;
  initialData?: Partial<EmployeeFormData>;
  onSuccess?: () => void;
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  mode,
  employeeId,
  initialData,
  onSuccess,
}: EmployeeFormDialogProps) {
  const { toast } = useToast();
  // Using employees table for employee creation/updates
  const { createMutation, updateMutation } = useSupabaseTable<EmployeeFormData>(
    TABLES.EMPLOYEES
  );

  const handleSubmit = async (data: EmployeeFormData) => {
    try {
      if (mode === "create") {
        await createMutation.mutateAsync(data);
        toast({
          title: "Success",
          description: "Employee created successfully",
        });
      } else if (mode === "edit" && employeeId) {
        await updateMutation.mutateAsync({ id: employeeId, updates: data });
        toast({
          title: "Success",
          description: "Employee updated successfully",
        });
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          mode === "create"
            ? "Failed to create employee"
            : "Failed to update employee",
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
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {mode === "create" ? "Add New Employee" : "Edit Employee"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Fill in the details to add a new staff member."
              : "Update the employee information."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-100px)] px-6 pb-6">
          <EmployeeForm
            defaultValues={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
            submitLabel={mode === "create" ? "Add Employee" : "Save Changes"}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default EmployeeFormDialog;
