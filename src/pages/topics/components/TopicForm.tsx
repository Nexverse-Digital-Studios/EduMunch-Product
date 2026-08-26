/**
 * TopicForm Component
 * ====================
 * Reusable form component for creating/editing topics
 * Used in TopicCreate and TopicEdit pages
 */

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form schema interface
export interface TopicFormData {
  subject_id: string;
  topic_name: string;
  topic_code: string;
  description: string;
  display_order: number | null;
  estimated_hours: number | null;
  is_active: boolean;
}

interface SubjectOption {
  id: string;
  subject_name: string;
}

interface TopicFormProps {
  form: UseFormReturn<TopicFormData>;
  subjects: SubjectOption[];
  isEdit?: boolean;
}

export const TopicForm = ({
  form,
  subjects,
  isEdit = false,
}: TopicFormProps) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;
  const isActive = watch("is_active");
  const selectedSubject = watch("subject_id");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subject_id">
          Subject <span className="text-destructive">*</span>
        </Label>
        <Select
          value={selectedSubject}
          onValueChange={(value) => setValue("subject_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.subject_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.subject_id && (
          <p className="text-sm text-destructive">
            {errors.subject_id.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="topic_name">
          Topic Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="topic_name"
          placeholder="e.g., Introduction to Algebra"
          {...register("topic_name", { required: "Topic name is required" })}
        />
        {errors.topic_name && (
          <p className="text-sm text-destructive">
            {errors.topic_name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="topic_code">Topic Code</Label>
        <Input
          id="topic_code"
          placeholder="e.g., MATH-ALG-01"
          {...register("topic_code")}
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
            {...register("display_order", {
              valueAsNumber: true,
              setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimated_hours">Estimated Hours</Label>
          <Input
            id="estimated_hours"
            type="number"
            step="0.5"
            placeholder="e.g., 2.5"
            {...register("estimated_hours", {
              valueAsNumber: true,
              setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
            })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter topic description (optional)"
          rows={4}
          {...register("description")}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="is_active">Active Status</Label>
          <p className="text-sm text-muted-foreground">
            {isActive
              ? "This topic is currently active"
              : "This topic is currently inactive"}
          </p>
        </div>
        <Switch
          id="is_active"
          checked={isActive}
          onCheckedChange={(checked) => setValue("is_active", checked)}
        />
      </div>
    </div>
  );
};

export default TopicForm;
