/**
 * ClassFormDialog Component
 * ==========================
 * Modal dialog for creating and editing classes
 */

import { useState, useEffect } from "react";
import { School, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import type { ClassDB } from "./ClassTable";
import type { ClassFormData } from "./ClassForm";

interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: string | null;
  onSuccess?: () => void;
}

export function ClassFormDialog({
  open,
  onOpenChange,
  editId,
  onSuccess,
}: ClassFormDialogProps) {
  const { toast } = useToast();
  const isEditMode = !!editId;

  const [formData, setFormData] = useState<ClassFormData>({
    class_name: "",
    class_code: "",
    class_order: null,
    description: "",
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch classes for edit mode
  const { data: classes, createMutation, updateMutation } = 
    useSupabaseTable<ClassDB>(TABLES.CLASSES);

  // Load data for edit mode
  useEffect(() => {
    if (isEditMode && classes && open) {
      const classToEdit = classes.find((c) => c.id === editId);
      if (classToEdit) {
        setFormData({
          class_name: classToEdit.class_name,
          class_code: classToEdit.class_code,
          class_order: classToEdit.class_order,
          description: classToEdit.description || "",
          is_active: classToEdit.is_active,
        });
      }
    } else if (!isEditMode && open) {
      // Reset form for create mode
      setFormData({
        class_name: "",
        class_code: "",
        class_order: null,
        description: "",
        is_active: true,
      });
    }
    setErrors({});
  }, [editId, classes, isEditMode, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.class_name.trim()) {
      newErrors.class_name = "Class name is required";
    }
    if (!formData.class_code.trim()) {
      newErrors.class_code = "Class code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        description: formData.description || null,
      };

      if (isEditMode && editId) {
        await updateMutation.mutateAsync({
          id: editId,
          updates: submitData,
        });
        toast({
          title: "Success",
          description: "Class updated successfully",
        });
      } else {
        await createMutation.mutateAsync(submitData);
        toast({
          title: "Success",
          description: "Class created successfully",
        });
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save class",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            {isEditMode ? "Edit Class" : "Create Class"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the class details below."
              : "Fill in the details to create a new class."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <form onSubmit={handleSubmit} className="space-y-4 px-1">
            <div className="space-y-2">
              <Label htmlFor="class_name">
                Class Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="class_name"
                placeholder="e.g., Grade 10, Class A"
                value={formData.class_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, class_name: e.target.value }))
                }
              />
              {errors.class_name && (
                <p className="text-sm text-destructive">{errors.class_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="class_code">
                Class Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="class_code"
                placeholder="e.g., GR10-A, CLS-001"
                value={formData.class_code}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, class_code: e.target.value }))
                }
              />
              {errors.class_code && (
                <p className="text-sm text-destructive">{errors.class_code}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="class_order">Class Order</Label>
              <Input
                id="class_order"
                type="number"
                placeholder="e.g., 1, 2, 3..."
                value={formData.class_order ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    class_order: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Optional: Used for sorting classes in lists
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter class description (optional)"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.is_active
                    ? "This class is currently active"
                    : "This class is currently inactive"}
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_active: checked }))
                }
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default ClassFormDialog;
