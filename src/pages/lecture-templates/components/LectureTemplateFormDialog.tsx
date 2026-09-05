/**
 * Lecture Template Form Dialog
 * =============================
 * Modal dialog for creating/editing lecture templates
 * Used inline on LectureTemplatesList (no route navigation)
 */

import { useState, useEffect } from "react";
import { Loader2, Layout, Save, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES, supabase } from "@/lib/supabase";
import { LectureTemplateDB, LectureTemplateFormData, DAYS_OF_WEEK } from "./types";

interface LectureTemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: LectureTemplateDB | null;
  onSuccess?: () => void;
}

interface SubjectDB {
  id: string;
  subject_name: string;
  subject_code: string;
}

interface TeacherDB {
  id: string;
  first_name: string;
  last_name: string;
  employee_code: string;
}

const defaultFormData: LectureTemplateFormData = {
  template_name: "",
  subject_id: "",
  duration_minutes: 60,
  default_teacher_id: "",
  description: "",
  start_time: "",
  end_time: "",
  day_of_week: "",
  is_active: true,
};

export const LectureTemplateFormDialog = ({
  open,
  onOpenChange,
  editData,
  onSuccess,
}: LectureTemplateFormDialogProps) => {
  const { toast } = useToast();
  const isEditing = !!editData;

  const [formData, setFormData] = useState<LectureTemplateFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch subjects
  const { data: subjectsData } = useSupabaseTable<SubjectDB>(TABLES.SUBJECTS, {
    orderBy: { column: "subject_name", ascending: true },
  });

  // Fetch teachers
  const { data: teachersData } = useSupabaseTable<TeacherDB>(TABLES.TEACHERS, {
    filters: { status: "active" },
    orderBy: { column: "first_name", ascending: true },
  });

  const subjects = subjectsData || [];
  const teachers = teachersData || [];

  // Initialize form with edit data
  useEffect(() => {
    if (editData) {
      setFormData({
        template_name: editData.template_name || "",
        subject_id: editData.subject_id || "",
        duration_minutes: editData.duration_minutes || 60,
        default_teacher_id: editData.default_teacher_id || "",
        description: editData.description || "",
        start_time: editData.start_time || "",
        end_time: editData.end_time || "",
        day_of_week: editData.day_of_week?.toString() || "",
        is_active: editData.is_active ?? true,
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [editData, open]);

  const handleChange = (
    field: keyof LectureTemplateFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateDuration = () => {
    if (formData.start_time && formData.end_time) {
      const start = new Date(`2000-01-01T${formData.start_time}`);
      const end = new Date(`2000-01-01T${formData.end_time}`);
      const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
      if (diffMinutes > 0) {
        handleChange("duration_minutes", diffMinutes);
      }
    }
  };

  useEffect(() => {
    calculateDuration();
  }, [formData.start_time, formData.end_time]);

  // Validate form
  const isValid = formData.template_name.trim() !== "" && formData.subject_id !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const payload = {
        template_name: formData.template_name,
        subject_id: formData.subject_id || null,
        duration_minutes: formData.duration_minutes,
        default_teacher_id: formData.default_teacher_id || null,
        description: formData.description || null,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        day_of_week: formData.day_of_week ? parseInt(formData.day_of_week) : null,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      };

      if (isEditing && editData) {
        const { error } = await supabase
          .from(TABLES.LECTURE_TEMPLATES)
          .update(payload)
          .eq("id", editData.id);

        if (error) throw error;

        toast({
          title: "Template Updated",
          description: "The lecture template has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from(TABLES.LECTURE_TEMPLATES)
          .insert(payload);

        if (error) throw error;

        toast({
          title: "Template Created",
          description: "The lecture template has been created successfully.",
        });
      }

      onOpenChange(false);
      onSuccess?.();
      setFormData(defaultFormData);
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save lecture template",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            {isEditing ? "Edit Lecture Template" : "New Lecture Template"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the lecture template details"
              : "Create a new lecture template for scheduling"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <form onSubmit={handleSubmit} className="space-y-4 pr-4">
            {/* Template Name */}
            <div className="space-y-2">
              <Label>Template Name *</Label>
              <Input
                value={formData.template_name}
                onChange={(e) => handleChange("template_name", e.target.value)}
                placeholder="e.g., Morning Math Class"
                required
              />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Select
                value={formData.subject_id}
                onValueChange={(v) => handleChange("subject_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.subject_name} ({subject.subject_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Default Teacher */}
            <div className="space-y-2">
              <Label>Default Teacher</Label>
              <Select
                value={formData.default_teacher_id}
                onValueChange={(v) => handleChange("default_teacher_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No default teacher</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name} ({teacher.employee_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Day of Week */}
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <Select
                value={formData.day_of_week}
                onValueChange={(v) => handleChange("day_of_week", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any day</SelectItem>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleChange("start_time", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleChange("end_time", e.target.value)}
                />
              </div>
            </div>

            {/* Duration */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duration: <span className="text-primary">{formData.duration_minutes} minutes</span>
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Optional description..."
                rows={2}
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <Label>Active Template</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => handleChange("is_active", v)}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!isValid || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? "Update Template" : "Create Template"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
