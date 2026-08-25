/**
 * SubjectFormDialog Component
 * ============================
 * Modal dialog for creating and editing subjects
 */

import { useState, useEffect } from "react";
import { BookOpen, Loader2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";

interface SubjectDB {
  id: string;
  subject_name: string;
  subject_code: string;
  subject_type: string | null;
  is_active: boolean;
  created_at: string;
}

interface SubjectFormData {
  subject_name: string;
  subject_code: string;
  subject_type: string;
  is_active: boolean;
}

interface SubjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: string | null;
  onSuccess?: () => void;
}

export function SubjectFormDialog({
  open,
  onOpenChange,
  editId,
  onSuccess,
}: SubjectFormDialogProps) {
  const { toast } = useToast();
  const isEditMode = !!editId;

  const [formData, setFormData] = useState<SubjectFormData>({
    subject_name: "",
    subject_code: "",
    subject_type: "",
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch subjects
  const { data: subjects, createMutation, updateMutation } = 
    useSupabaseTable<SubjectDB>(TABLES.SUBJECTS);

  // Load data for edit mode
  useEffect(() => {
    if (isEditMode && subjects && open) {
      const subjectToEdit = subjects.find((s) => s.id === editId);
      if (subjectToEdit) {
        setFormData({
          subject_name: subjectToEdit.subject_name,
          subject_code: subjectToEdit.subject_code,
          subject_type: subjectToEdit.subject_type || "",
          is_active: subjectToEdit.is_active,
        });
      }
    } else if (!isEditMode && open) {
      // Reset form for create mode
      setFormData({
        subject_name: "",
        subject_code: "",
        subject_type: "",
        is_active: true,
      });
    }
    setErrors({});
  }, [editId, subjects, isEditMode, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject_name.trim()) {
      newErrors.subject_name = "Subject name is required";
    }
    if (!formData.subject_code.trim()) {
      newErrors.subject_code = "Subject code is required";
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
        subject_name: formData.subject_name,
        subject_code: formData.subject_code.toUpperCase(),
        subject_type: formData.subject_type || null,
        is_active: formData.is_active,
      };

      if (isEditMode && editId) {
        await updateMutation.mutateAsync({
          id: editId,
          updates: submitData,
        });
        toast({
          title: "Success",
          description: "Subject updated successfully",
        });
      } else {
        await createMutation.mutateAsync(submitData);
        toast({
          title: "Success",
          description: "Subject created successfully",
        });
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save subject",
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
            <BookOpen className="h-5 w-5" />
            {isEditMode ? "Edit Subject" : "Create Subject"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the subject details below."
              : "Fill in the details to create a new subject."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <form onSubmit={handleSubmit} className="space-y-4 px-1">
            <div className="space-y-2">
              <Label htmlFor="subject_name">
                Subject Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject_name"
                placeholder="e.g., Mathematics, Physics"
                value={formData.subject_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subject_name: e.target.value }))
                }
              />
              {errors.subject_name && (
                <p className="text-sm text-destructive">{errors.subject_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject_code">
                Subject Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject_code"
                placeholder="e.g., MATH, PHY, ENG"
                value={formData.subject_code}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subject_code: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Code will be automatically converted to uppercase
              </p>
              {errors.subject_code && (
                <p className="text-sm text-destructive">{errors.subject_code}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject_type">Subject Type</Label>
              <Input
                id="subject_type"
                placeholder="e.g., Theory, Practical, Lab"
                value={formData.subject_type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subject_type: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Optional: Categorize the subject type
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.is_active
                    ? "This subject is currently active"
                    : "This subject is currently inactive"}
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

export default SubjectFormDialog;
