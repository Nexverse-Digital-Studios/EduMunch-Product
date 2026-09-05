/**
 * AcademicYearFormDialog Component
 * =================================
 * Modal dialog for creating and editing academic years
 * Uses AcademicYearForm for the form fields
 */

import { useState, useEffect } from "react";
import { Calendar, Loader2 } from "lucide-react";
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
import type { AcademicYearDB, AcademicYearFormData } from "./types";

interface AcademicYearFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: string | null;
  onSuccess?: () => void;
}

export function AcademicYearFormDialog({
  open,
  onOpenChange,
  editId,
  onSuccess,
}: AcademicYearFormDialogProps) {
  const { toast } = useToast();
  const isEditMode = !!editId;

  const [formData, setFormData] = useState<AcademicYearFormData>({
    year_code: "",
    year_name: "",
    start_date: "",
    end_date: "",
    is_current: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch academic years for edit mode
  const { data: academicYears, createMutation, updateMutation } = 
    useSupabaseTable<AcademicYearDB>(TABLES.ACADEMIC_YEARS);

  // Load data for edit mode
  useEffect(() => {
    if (isEditMode && academicYears && open) {
      const yearToEdit = academicYears.find((y) => y.id === editId);
      if (yearToEdit) {
        setFormData({
          year_code: yearToEdit.year_code,
          year_name: yearToEdit.year_name,
          start_date: yearToEdit.start_date,
          end_date: yearToEdit.end_date,
          is_current: yearToEdit.is_current,
        });
      }
    } else if (!isEditMode && open) {
      // Reset form for create mode
      setFormData({
        year_code: "",
        year_name: "",
        start_date: "",
        end_date: "",
        is_current: false,
      });
    }
    setErrors({});
  }, [editId, academicYears, isEditMode, open]);

  // Auto-generate year code from dates
  useEffect(() => {
    if (formData.start_date && formData.end_date && !isEditMode) {
      const startYear = new Date(formData.start_date).getFullYear();
      const endYear = new Date(formData.end_date).getFullYear();
      if (startYear !== endYear) {
        setFormData((prev) => ({
          ...prev,
          year_code: `${startYear}-${endYear.toString().slice(-2)}`,
          year_name: `Academic Year ${startYear}-${endYear.toString().slice(-2)}`,
        }));
      }
    }
  }, [formData.start_date, formData.end_date, isEditMode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.year_code.trim()) {
      newErrors.year_code = "Year code is required";
    }
    if (!formData.year_name.trim()) {
      newErrors.year_name = "Year name is required";
    }
    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }
    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
    }
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        newErrors.end_date = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isEditMode && editId) {
        await updateMutation.mutateAsync({
          id: editId,
          updates: formData,
        });
        toast({
          title: "Success",
          description: "Academic year updated successfully",
        });
      } else {
        await createMutation.mutateAsync(formData);
        toast({
          title: "Success",
          description: "Academic year created successfully",
        });
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save academic year",
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
            <Calendar className="h-5 w-5" />
            {isEditMode ? "Edit Academic Year" : "Create Academic Year"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the academic year details below."
              : "Fill in the details to create a new academic year."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <form onSubmit={handleSubmit} className="space-y-4 px-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, start_date: e.target.value }))
                  }
                />
                {errors.start_date && (
                  <p className="text-sm text-destructive">{errors.start_date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">
                  End Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, end_date: e.target.value }))
                  }
                />
                {errors.end_date && (
                  <p className="text-sm text-destructive">{errors.end_date}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year_code">
                Year Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="year_code"
                placeholder="e.g., 2024-25"
                value={formData.year_code}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, year_code: e.target.value }))
                }
              />
              {errors.year_code && (
                <p className="text-sm text-destructive">{errors.year_code}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year_name">
                Year Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="year_name"
                placeholder="e.g., Academic Year 2024-25"
                value={formData.year_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, year_name: e.target.value }))
                }
              />
              {errors.year_name && (
                <p className="text-sm text-destructive">{errors.year_name}</p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="is_current">Set as Current Year</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.is_current
                    ? "This will be the active academic year"
                    : "Enable to make this the current year"}
                </p>
              </div>
              <Switch
                id="is_current"
                checked={formData.is_current}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_current: checked }))
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

export default AcademicYearFormDialog;
