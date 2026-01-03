/**
 * RoleFormDialog Component
 * =========================
 * Modal dialog wrapper for RoleForm component
 * Used for inline create/edit operations (consolidation - replaces separate routes)
 * 
 * Route Consolidation: This component replaces:
 * - /roles/create (handled via mode="create")
 * - /roles/:id/edit (handled via mode="edit" with roleId)
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RoleForm, RoleFormData } from "./RoleForm";
import { useCreateRole, useUpdateRole, useRoles } from "@/hooks/useSupabaseQuery";
import { useToast } from "@/hooks/use-toast";

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  roleId?: string;
  initialData?: Partial<RoleFormData>;
}

export const RoleFormDialog = ({
  open,
  onOpenChange,
  mode,
  roleId,
  initialData,
}: RoleFormDialogProps) => {
  const { toast } = useToast();
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const { refetch } = useRoles();

  const handleSubmit = async (data: RoleFormData) => {
    try {
      if (mode === "create") {
        await createRoleMutation.mutateAsync({
          role_name: data.role_name,
          role_code: data.role_code,
          description: data.description,
          is_system_role: false,
          is_active: true,
        });
        toast({
          title: "Success",
          description: "Role created successfully",
        });
      } else if (mode === "edit" && roleId) {
        await updateRoleMutation.mutateAsync({
          id: roleId,
          data: {
            role_name: data.role_name,
            description: data.description,
          },
        });
        toast({
          title: "Success",
          description: "Role updated successfully",
        });
      }
      refetch();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: mode === "create" ? "Failed to create role" : "Failed to update role",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const isLoading = createRoleMutation.isPending || updateRoleMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Role" : "Edit Role"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Fill in the details to create a new role with module permissions."
              : "Update the role details and module permissions."}
          </DialogDescription>
        </DialogHeader>
        <RoleForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEdit={mode === "edit"}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default RoleFormDialog;
