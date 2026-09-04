/**
 * ClassForm Component
 * ====================
 * Reusable form component for creating/editing classes
 * Used in ClassCreate and ClassEdit pages
 */

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

// Form schema interface
export interface ClassFormData {
  class_name: string;
  class_code: string;
  class_order: number | null;
  description: string;
  is_active: boolean;
}

interface ClassFormProps {
  form: UseFormReturn<ClassFormData>;
  isEdit?: boolean;
}

export const ClassForm = ({ form, isEdit = false }: ClassFormProps) => {
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
        <Label htmlFor="class_name">
          Class Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="class_name"
          placeholder="e.g., Grade 10, Class A"
          {...register("class_name", { required: "Class name is required" })}
        />
        {errors.class_name && (
          <p className="text-sm text-destructive">
            {errors.class_name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="class_code">
          Class Code <span className="text-destructive">*</span>
        </Label>
        <Input
          id="class_code"
          placeholder="e.g., GR10-A, CLS-001"
          {...register("class_code", { required: "Class code is required" })}
        />
        {errors.class_code && (
          <p className="text-sm text-destructive">
            {errors.class_code.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="class_order">Class Order</Label>
        <Input
          id="class_order"
          type="number"
          placeholder="e.g., 1, 2, 3..."
          {...register("class_order", {
            valueAsNumber: true,
            setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
          })}
        />
        <p className="text-xs text-muted-foreground">
          Optional: Used for sorting classes in lists
        </p>
        {errors.class_order && (
          <p className="text-sm text-destructive">
            {errors.class_order.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter class description (optional)"
          rows={4}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="is_active">Active Status</Label>
          <p className="text-sm text-muted-foreground">
            {isActive
              ? "This class is currently active"
              : "This class is currently inactive"}
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

export default ClassForm;
