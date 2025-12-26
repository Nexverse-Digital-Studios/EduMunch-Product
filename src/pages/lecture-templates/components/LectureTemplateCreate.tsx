/**
 * Create Lecture Template Page
 * =============================
 * Create a new lecture template
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import LectureTemplateForm from "./LectureTemplateForm";
import { LectureTemplateFormData } from "./types";

const LectureTemplateCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canCreate } = useModulePermissions("lecture_templates");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createMutation } = useSupabaseTable(TABLES.LECTURE_TEMPLATES);

  const handleSubmit = async (data: LectureTemplateFormData) => {
    setIsSubmitting(true);

    try {
      await createMutation.mutateAsync({
        template_name: data.template_name,
        subject_id: data.subject_id || null,
        duration_minutes: data.duration_minutes,
        default_teacher_id: data.default_teacher_id || null,
        description: data.description || null,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        day_of_week: data.day_of_week ? parseInt(data.day_of_week) : null,
        is_active: data.is_active,
      });

      toast({
        title: "Template Created",
        description: "The lecture template has been created successfully.",
      });
      navigate("/lecture-templates");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canCreate) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          You don't have permission to create lecture templates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Template</h1>
          <p className="text-muted-foreground">
            Create a new lecture timing template
          </p>
        </div>
      </div>

      {/* Form */}
      <LectureTemplateForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Create Template"
      />
    </div>
  );
};

export default LectureTemplateCreate;
