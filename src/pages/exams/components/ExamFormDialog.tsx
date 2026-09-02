/**
 * Exam Form Dialog
 * =================
 * Modal dialog for creating/editing exams
 * 
 * CONSOLIDATED: Replaces /exams/create and /exams/:id/edit routes
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { ExamDB, ExamFormData, EXAM_TYPES } from "./types";

const INDEX_TOKEN = "1emaet";

const examSchema = z
  .object({
    exam_name: z.string().min(1, "Exam name is required").max(100),
    exam_type: z.string().min(1, "Exam type is required"),
    academic_year_id: z.string().min(1, "Academic year is required"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    description: z.string().optional(),
    max_marks: z.coerce.number().min(1, "Max marks must be at least 1"),
    passing_marks: z.coerce.number().min(0, "Passing marks cannot be negative"),
  })
  .refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: "End date must be after start date",
    path: ["end_date"],
  })
  .refine((data) => data.passing_marks <= data.max_marks, {
    message: "Passing marks cannot exceed max marks",
    path: ["passing_marks"],
  });

interface AcademicYearDB {
  id: string;
  year_name: string;
  is_current: boolean;
}

interface ExamFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: ExamDB | null;
  onSuccess?: () => void;
}

export function ExamFormDialog({
  open,
  onOpenChange,
  editData,
  onSuccess,
}: ExamFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!editData;

  // Fetch academic years
  const { data: academicYears } = useSupabaseTable<AcademicYearDB>(
    `academic_years_${INDEX_TOKEN}`,
    {
      orderBy: { column: "start_date", ascending: false },
    }
  );

  const { createMutation, updateMutation } = useSupabaseTable<ExamDB>(
    `exams_${INDEX_TOKEN}`
  );

  const form = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      exam_name: "",
      exam_type: "",
      academic_year_id: "",
      start_date: "",
      end_date: "",
      description: "",
      max_marks: 100,
      passing_marks: 33,
    },
  });

  // Reset form when dialog opens/closes or editData changes
  useEffect(() => {
    if (open) {
      if (editData) {
        form.reset({
          exam_name: editData.exam_name,
          exam_type: editData.exam_type,
          academic_year_id: editData.academic_year_id,
          start_date: editData.start_date,
          end_date: editData.end_date,
          description: editData.description || "",
          max_marks: editData.max_marks,
          passing_marks: editData.passing_marks,
        });
      } else {
        form.reset({
          exam_name: "",
          exam_type: "",
          academic_year_id: "",
          start_date: "",
          end_date: "",
          description: "",
          max_marks: 100,
          passing_marks: 33,
        });
      }
    }
  }, [open, editData, form]);

  const handleSubmit = async (data: ExamFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && editData) {
        await updateMutation.mutateAsync({
          id: editData.id,
          updates: data as Partial<ExamDB>,
        });
        toast({
          title: "Success",
          description: "Exam updated successfully.",
        });
      } else {
        await createMutation.mutateAsync({
          ...data,
          exam_type: data.exam_type as ExamDB["exam_type"],
          status: "draft",
          is_published: false,
        } as Partial<ExamDB>);
        toast({
          title: "Success",
          description: "Exam created successfully.",
        });
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} exam.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Exam" : "Create New Exam"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 p-1"
            >
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Basic Information</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="exam_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exam Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Mid Term Examination 2024"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="exam_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exam Type *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select exam type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EXAM_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="academic_year_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Academic Year *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select academic year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {academicYears?.map((year) => (
                            <SelectItem key={year.id} value={year.id}>
                              {year.year_name}
                              {year.is_current && " (Current)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter exam description or instructions..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional description or instructions for this exam
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Schedule */}
              <div className="space-y-4">
                <h3 className="font-semibold">Schedule</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Marks Configuration */}
              <div className="space-y-4">
                <h3 className="font-semibold">Marks Configuration</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="max_marks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Marks *</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormDescription>
                          Total marks for this examination
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="passing_marks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passing Marks *</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormDescription>
                          Minimum marks required to pass
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Saving..."
                    : isEditMode
                    ? "Update Exam"
                    : "Create Exam"}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default ExamFormDialog;
