/**
 * BatchForm Component
 * ====================
 * Reusable form component for creating/editing batches (sections)
 */

import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type ClassDB } from "./BatchTable";

export interface BatchFormData {
  class_id: string;
  section_name: string;
  section_code: string;
  capacity: number;
  room_number: string;
  is_active: boolean;
}

export interface BatchFormProps {
  onSubmit: (data: BatchFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  defaultValues?: Partial<BatchFormData>;
  submitLabel?: string;
  classes: ClassDB[];
}

export const BatchForm = ({
  onSubmit,
  onCancel,
  isLoading = false,
  defaultValues,
  submitLabel = "Save",
  classes,
}: BatchFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BatchFormData>({
    defaultValues: {
      class_id: defaultValues?.class_id || "",
      section_name: defaultValues?.section_name || "",
      section_code: defaultValues?.section_code || "",
      capacity: defaultValues?.capacity || 40,
      room_number: defaultValues?.room_number || "",
      is_active: defaultValues?.is_active ?? true,
    },
  });

  const selectedClassId = watch("class_id");
  const isActive = watch("is_active");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="class_id">
          Class <span className="text-destructive">*</span>
        </Label>
        <Select
          value={selectedClassId}
          onValueChange={(value) => setValue("class_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.class_name} ({c.class_code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.class_id && (
          <p className="text-sm text-destructive">{errors.class_id.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="section_name">
            Section Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="section_name"
            placeholder="e.g., Section A"
            {...register("section_name", {
              required: "Section name is required",
            })}
          />
          {errors.section_name && (
            <p className="text-sm text-destructive">
              {errors.section_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="section_code">
            Section Code <span className="text-destructive">*</span>
          </Label>
          <Input
            id="section_code"
            placeholder="e.g., A"
            {...register("section_code", {
              required: "Section code is required",
            })}
          />
          {errors.section_code && (
            <p className="text-sm text-destructive">
              {errors.section_code.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            placeholder="40"
            {...register("capacity", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="room_number">Room Number</Label>
          <Input
            id="room_number"
            placeholder="e.g., Room 101"
            {...register("room_number")}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="is_active">Active Status</Label>
        <Switch
          id="is_active"
          checked={isActive}
          onCheckedChange={(checked) => setValue("is_active", checked)}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default BatchForm;
