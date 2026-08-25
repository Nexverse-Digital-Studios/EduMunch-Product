/**
 * SubjectForm Component
 * ======================
 * Reusable form component for creating/editing subjects
 * Used in SubjectCreate and SubjectEdit pages
 */

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Form schema interface
export interface SubjectFormData {
  subject_name: string;
  subject_code: string;
  subject_type: string;
  is_active: boolean;
}

interface SubjectFormProps {
  form: UseFormReturn<SubjectFormData>;
  isEdit?: boolean;
}

export const SubjectForm = ({ form, isEdit = false }: SubjectFormProps) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;
  const isActive = watch("is_active");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subject_name">
          Subject Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="subject_name"
          placeholder="e.g., Mathematics, Physics"
          {...register("subject_name", {
            required: "Subject name is required",
          })}
        />
        {errors.subject_name && (
          <p className="text-sm text-destructive">
            {errors.subject_name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject_code">
          Subject Code <span className="text-destructive">*</span>
        </Label>
        <Input
          id="subject_code"
          placeholder="e.g., MATH, PHY, ENG"
          {...register("subject_code", {
            required: "Subject code is required",
          })}
        />
        <p className="text-xs text-muted-foreground">
          Code will be automatically converted to uppercase
        </p>
        {errors.subject_code && (
          <p className="text-sm text-destructive">
            {errors.subject_code.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject_type">Subject Type</Label>
        <Input
          id="subject_type"
          placeholder="e.g., Theory, Practical, Lab"
          {...register("subject_type")}
        />
        <p className="text-xs text-muted-foreground">
          Optional: Categorize the subject type
        </p>
        {errors.subject_type && (
          <p className="text-sm text-destructive">
            {errors.subject_type.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="is_active">Active Status</Label>
          <p className="text-sm text-muted-foreground">
            {isActive
              ? "This subject is currently active"
              : "This subject is currently inactive"}
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

export default SubjectForm;
