/**
 * TopicFormDialog Component
 * ==========================
 * Modal dialog for creating and editing topics
 */

import { useState, useEffect } from "react";
import { FileText, Loader2 } from "lucide-react";
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

interface TopicDB {
  id: string;
  subject_id: string;
  topic_name: string;
  topic_code: string | null;
  description: string | null;
  display_order: number | null;
  estimated_hours: number | null;
  is_active: boolean;
  created_at: string;
}

interface SubjectDB {
  id: string;
  subject_name: string;
  subject_code: string;
  is_active: boolean;
}

interface TopicFormData {
  subject_id: string;
  topic_name: string;
  topic_code: string;
  description: string;
  display_order: number | null;
  estimated_hours: number | null;
  is_active: boolean;
}

interface TopicFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: string | null;
  defaultSubjectId?: string;
  onSuccess?: () => void;
}

export function TopicFormDialog({
  open,
  onOpenChange,
  editId,
  defaultSubjectId,
  onSuccess,
}: TopicFormDialogProps) {
  const { toast } = useToast();
  const isEditMode = !!editId;

  const [formData, setFormData] = useState<TopicFormData>({
    subject_id: defaultSubjectId || "",
    topic_name: "",
    topic_code: "",
    description: "",
    display_order: null,
    estimated_hours: null,
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch topics
  const { data: topics, createMutation, updateMutation } = 
    useSupabaseTable<TopicDB>(TABLES.TOPICS);

  // Fetch subjects
  const { data: subjects } = useSupabaseTable<SubjectDB>(TABLES.SUBJECTS, {
    orderBy: { column: "subject_name", ascending: true },
  });

  // Load data for edit mode
  useEffect(() => {
    if (isEditMode && topics && open) {
      const topicToEdit = topics.find((t) => t.id === editId);
      if (topicToEdit) {
        setFormData({
          subject_id: topicToEdit.subject_id,
          topic_name: topicToEdit.topic_name,
          topic_code: topicToEdit.topic_code || "",
          description: topicToEdit.description || "",
          display_order: topicToEdit.display_order,
          estimated_hours: topicToEdit.estimated_hours,
          is_active: topicToEdit.is_active,
        });
      }
    } else if (!isEditMode && open) {
      // Reset form for create mode
      setFormData({
        subject_id: defaultSubjectId || "",
        topic_name: "",
        topic_code: "",
        description: "",
        display_order: null,
        estimated_hours: null,
        is_active: true,
      });
    }
    setErrors({});
  }, [editId, topics, isEditMode, open, defaultSubjectId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject_id) {
      newErrors.subject_id = "Subject is required";
    }
    if (!formData.topic_name.trim()) {
      newErrors.topic_name = "Topic name is required";
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
        subject_id: formData.subject_id,
        topic_name: formData.topic_name,
        topic_code: formData.topic_code || null,
        description: formData.description || null,
        display_order: formData.display_order,
        estimated_hours: formData.estimated_hours,
        is_active: formData.is_active,
      };

      if (isEditMode && editId) {
        await updateMutation.mutateAsync({
          id: editId,
          updates: submitData,
        });
        toast({
          title: "Success",
          description: "Topic updated successfully",
        });
      } else {
        await createMutation.mutateAsync(submitData);
        toast({
          title: "Success",
          description: "Topic created successfully",
        });
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save topic",
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
            <FileText className="h-5 w-5" />
            {isEditMode ? "Edit Topic" : "Create Topic"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the topic details below."
              : "Fill in the details to create a new topic."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <form onSubmit={handleSubmit} className="space-y-4 px-1">
            <div className="space-y-2">
              <Label htmlFor="subject_id">
                Subject <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.subject_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, subject_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects?.filter(s => s.is_active).map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.subject_name} ({subject.subject_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subject_id && (
                <p className="text-sm text-destructive">{errors.subject_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic_name">
                Topic Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="topic_name"
                placeholder="e.g., Introduction to Algebra"
                value={formData.topic_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, topic_name: e.target.value }))
                }
              />
              {errors.topic_name && (
                <p className="text-sm text-destructive">{errors.topic_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic_code">Topic Code</Label>
              <Input
                id="topic_code"
                placeholder="e.g., MATH-ALG-01"
                value={formData.topic_code}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, topic_code: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Optional: Unique identifier for this topic
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  placeholder="e.g., 1, 2, 3..."
                  value={formData.display_order ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      display_order: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_hours">Estimated Hours</Label>
                <Input
                  id="estimated_hours"
                  type="number"
                  step="0.5"
                  placeholder="e.g., 2.5"
                  value={formData.estimated_hours ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      estimated_hours: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter topic description (optional)"
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
                    ? "This topic is currently active"
                    : "This topic is currently inactive"}
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

export default TopicFormDialog;
