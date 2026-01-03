/**
 * ParentFormDialog Component
 * ===========================
 * Modal dialog wrapper for ParentForm component
 * Used for inline create/edit operations (consolidation - replaces separate routes)
 * 
 * Route Consolidation: This component replaces:
 * - /parents/create (handled via mode="create")
 * - /parents/:id/edit (handled via mode="edit" with parentId)
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ParentForm } from "./ParentForm";
import { ParentFormData } from "./types";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useToast } from "@/hooks/use-toast";

const INDEX_TOKEN = "1emaet";

interface ParentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  parentId?: string;
  initialData?: Partial<ParentFormData>;
  onSuccess?: () => void;
}

export function ParentFormDialog({
  open,
  onOpenChange,
  mode,
  parentId,
  initialData,
  onSuccess,
}: ParentFormDialogProps) {
  const { toast } = useToast();
  const { createMutation, updateMutation } = useSupabaseTable<ParentFormData>(
    `parents_${INDEX_TOKEN}`
  );

  const handleSubmit = async (data: ParentFormData) => {
    try {
      if (mode === "create") {
        await createMutation.mutateAsync(data);
        toast({
          title: "Success",
          description: "Parent created successfully",
        });
      } else if (mode === "edit" && parentId) {
        await updateMutation.mutateAsync({ id: parentId, updates: data });
        toast({
          title: "Success",
          description: "Parent updated successfully",
        });
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: mode === "create" ? "Failed to create parent" : "Failed to update parent",
        variant: "destructive",
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {mode === "create" ? "Add New Parent" : "Edit Parent"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Fill in the details to add a new parent/guardian."
              : "Update the parent/guardian information."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-100px)] px-6 pb-6">
          <ParentForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel={mode === "create" ? "Add Parent" : "Save Changes"}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default ParentFormDialog;
