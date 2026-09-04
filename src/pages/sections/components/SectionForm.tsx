/**
 * SectionForm Component
 * =====================
 * Reusable form for creating and editing section records
 */

import { useForm } from "react-hook-form";
import { useMemo } from "react";
import { Loader2, LayoutGrid, Users, DoorOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import {
  SectionFormData,
  DEFAULT_SECTION_FORM,
  SECTION_NAME_OPTIONS,
  CAPACITY_OPTIONS,
  ClassDB,
  TeacherDB,
} from "./types";

const INDEX_TOKEN = "1emaet";

interface SectionFormProps {
  initialData?: Partial<SectionFormData>;
  onSubmit: (data: SectionFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function SectionForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = "Save Section",
}: SectionFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SectionFormData>({
    defaultValues: {
      ...DEFAULT_SECTION_FORM,
      ...initialData,
    },
  });

  // Fetch classes
  const { data: classes } = useSupabaseTable<ClassDB>(
    `classes_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Fetch teachers
  const { data: teachers } = useSupabaseTable<TeacherDB>(
    `teachers_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const classId = watch("class_id");
  const sectionName = watch("section_name");
  const capacity = watch("capacity");
  const classTeacherId = watch("class_teacher_id");
  const isActive = watch("is_active");

  // Sort classes by order
  const sortedClasses = classes
    ? [...classes].sort((a, b) => (a.class_order || 0) - (b.class_order || 0))
    : [];

  const handleFormSubmit = async (data: SectionFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Section Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Section Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="class_id">
              Class <span className="text-red-500">*</span>
            </Label>
            <Select
              value={classId}
              onValueChange={(value) => setValue("class_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-scroll pr-2">
                {sortedClasses.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.class_name} ({cls.class_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="hidden"
              {...register("class_id", { required: "Class is required" })}
            />
            {errors.class_id && (
              <p className="text-sm text-red-500">{errors.class_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="section_name">
              Section Name <span className="text-red-500">*</span>
            </Label>
            <Select
              value={sectionName}
              onValueChange={(value) => setValue("section_name", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-scroll pr-2">
                {SECTION_NAME_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="hidden"
              {...register("section_name", {
                required: "Section name is required",
              })}
            />
            {errors.section_name && (
              <p className="text-sm text-red-500">
                {errors.section_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="section_code">
              Section Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="section_code"
              placeholder="e.g., CLS10-A"
              {...register("section_code", {
                required: "Section code is required",
              })}
            />
            {errors.section_code && (
              <p className="text-sm text-red-500">
                {errors.section_code.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                checked={isActive}
                onCheckedChange={(checked) => setValue("is_active", checked)}
              />
              <Label className="text-sm font-normal">
                {isActive ? "Active" : "Inactive"}
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capacity & Room */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Capacity & Room
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="capacity">Student Capacity</Label>
            <Select
              value={capacity}
              onValueChange={(value) => setValue("capacity", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select capacity" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-scroll pr-2">
                {CAPACITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room_number">Room Number</Label>
            <div className="relative">
              <DoorOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="room_number"
                placeholder="e.g., Room 101, Building A"
                className="pl-10"
                {...register("room_number")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Teacher */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Class Teacher Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-w-md">
            <Label htmlFor="class_teacher_id">Class Teacher</Label>

            {/* Teacher Dropdown */}
            <Select
              value={classTeacherId}
              onValueChange={(value) => setValue("class_teacher_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class teacher (optional)" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-scroll pr-2">
                {teachers?.length > 0 ? (
                  teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name} (
                      {teacher.employee_code})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__no_match__" disabled>
                    No teachers found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The class teacher will be the primary contact for this section.
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
