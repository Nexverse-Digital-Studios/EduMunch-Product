/**
 * SectionFormDialog Component
 * ============================
 * Modal dialog for creating and editing sections
 */

import { useState, useEffect, useMemo } from "react";
import { LayoutGrid, Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import type { SectionDB, ClassDB, TeacherDB, SectionFormData, DEFAULT_SECTION_FORM } from "./types";

const SECTION_NAME_OPTIONS = [
  { value: "A", label: "Section A" },
  { value: "B", label: "Section B" },
  { value: "C", label: "Section C" },
  { value: "D", label: "Section D" },
  { value: "E", label: "Section E" },
  { value: "F", label: "Section F" },
];

const INDEX_TOKEN = "1emaet";

interface SectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: string | null;
  onSuccess?: () => void;
}

export function SectionFormDialog({
  open,
  onOpenChange,
  editId,
  onSuccess,
}: SectionFormDialogProps) {
  const { toast } = useToast();
  const isEditMode = !!editId;

  const [formData, setFormData] = useState<SectionFormData>({
    class_id: "",
    section_name: "",
    section_code: "",
    capacity: "40",
    class_teacher_id: "",
    room_number: "",
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch sections
  const { data: sections, createMutation, updateMutation } = 
    useSupabaseTable<SectionDB>(`sections_${INDEX_TOKEN}`);

  // Fetch classes
  const { data: classes } = useSupabaseTable<ClassDB>(`classes_${INDEX_TOKEN}`);

  // Fetch teachers
  const { data: teachers } = useSupabaseTable<TeacherDB>(`employees_${INDEX_TOKEN}`);

  // Sort classes by order
  const sortedClasses = useMemo(() => {
    if (!classes) return [];
    return [...classes].sort((a, b) => (a.class_order || 0) - (b.class_order || 0));
  }, [classes]);

  // Load data for edit mode
  useEffect(() => {
    if (isEditMode && sections && open) {
      const sectionToEdit = sections.find((s) => s.id === editId);
      if (sectionToEdit) {
        setFormData({
          class_id: sectionToEdit.class_id,
          section_name: sectionToEdit.section_name,
          section_code: sectionToEdit.section_code,
          capacity: String(sectionToEdit.capacity),
          class_teacher_id: sectionToEdit.class_teacher_id || "",
          room_number: sectionToEdit.room_number || "",
          is_active: sectionToEdit.is_active,
        });
      }
    } else if (!isEditMode && open) {
      // Reset form for create mode
      setFormData({
        class_id: "",
        section_name: "",
        section_code: "",
        capacity: "40",
        class_teacher_id: "",
        room_number: "",
        is_active: true,
      });
    }
    setErrors({});
  }, [editId, sections, isEditMode, open]);

  // Auto-generate section code
  useEffect(() => {
    if (formData.class_id && formData.section_name && !isEditMode) {
      const selectedClass = classes?.find((c) => c.id === formData.class_id);
      if (selectedClass) {
        setFormData((prev) => ({
          ...prev,
          section_code: `${selectedClass.class_code}-${formData.section_name}`,
        }));
      }
    }
  }, [formData.class_id, formData.section_name, classes, isEditMode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.class_id) {
      newErrors.class_id = "Class is required";
    }
    if (!formData.section_name) {
      newErrors.section_name = "Section name is required";
    }
    if (!formData.section_code.trim()) {
      newErrors.section_code = "Section code is required";
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
        class_id: formData.class_id,
        section_name: formData.section_name,
        section_code: formData.section_code,
        capacity: parseInt(formData.capacity) || 40,
        class_teacher_id: formData.class_teacher_id || null,
        room_number: formData.room_number || null,
        is_active: formData.is_active,
      };

      if (isEditMode && editId) {
        await updateMutation.mutateAsync({
          id: editId,
          updates: submitData,
        });
        toast({
          title: "Success",
          description: "Section updated successfully",
        });
      } else {
        await createMutation.mutateAsync(submitData);
        toast({
          title: "Success",
          description: "Section created successfully",
        });
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save section",
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
            <LayoutGrid className="h-5 w-5" />
            {isEditMode ? "Edit Section" : "Create Section"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the section details below."
              : "Fill in the details to create a new section."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <form onSubmit={handleSubmit} className="space-y-4 px-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class_id">
                  Class <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.class_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, class_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.class_name} ({cls.class_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.class_id && (
                  <p className="text-sm text-destructive">{errors.class_id}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="section_name">
                  Section Name <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.section_name}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, section_name: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTION_NAME_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.section_name && (
                  <p className="text-sm text-destructive">{errors.section_name}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="section_code">
                Section Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="section_code"
                placeholder="e.g., GR10-A"
                value={formData.section_code}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, section_code: e.target.value }))
                }
              />
              {errors.section_code && (
                <p className="text-sm text-destructive">{errors.section_code}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="e.g., 40"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, capacity: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room_number">Room Number</Label>
                <Input
                  id="room_number"
                  placeholder="e.g., 101"
                  value={formData.room_number}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, room_number: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="class_teacher_id">Class Teacher</Label>
              <Select
                value={formData.class_teacher_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, class_teacher_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {teachers?.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name} ({teacher.employee_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.is_active
                    ? "This section is currently active"
                    : "This section is currently inactive"}
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

export default SectionFormDialog;
