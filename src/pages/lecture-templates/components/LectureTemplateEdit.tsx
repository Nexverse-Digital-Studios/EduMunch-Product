/**
 * Edit Lecture Template Page
 * ===========================
 * Edit an existing lecture template
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import LectureTemplateForm from "./LectureTemplateForm";
import { LectureTemplateDB, LectureTemplateFormData } from "./types";

const LectureTemplateEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canUpdate } = useModulePermissions("lecture_templates");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch template
  const {
    data: templatesData,
    isLoading,
    updateMutation,
  } = useSupabaseTable<LectureTemplateDB>(TABLES.LECTURE_TEMPLATES, {
    filters: { id },
  });

  const template = templatesData?.[0];

  const handleSubmit = async (data: LectureTemplateFormData) => {
    if (!template) return;

    setIsSubmitting(true);

    try {
      await updateMutation.mutateAsync({
        id: template.id,
        updates: {
          template_name: data.template_name,
          subject_id: data.subject_id || null,
          duration_minutes: data.duration_minutes,
          default_teacher_id: data.default_teacher_id || null,
          description: data.description || null,
          start_time: data.start_time || null,
          end_time: data.end_time || null,
          day_of_week: data.day_of_week ? parseInt(data.day_of_week) : null,
          is_active: data.is_active,
        },
      });

      toast({
        title: "Template Updated",
        description: "The lecture template has been updated successfully.",
      });
      navigate(`/lecture-templates/${template.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canUpdate) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          You don't have permission to edit lecture templates.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading template...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground mb-4">Template not found</p>
        <Button onClick={() => navigate("/lecture-templates")}>
          Back to Templates
        </Button>
      </div>
    );
  }

  const initialData: Partial<LectureTemplateFormData> = {
    template_name: template.template_name,
    subject_id: template.subject_id || "",
    duration_minutes: template.duration_minutes,
    default_teacher_id: template.default_teacher_id || "",
    description: template.description || "",
    start_time: template.start_time || "",
    end_time: template.end_time || "",
    day_of_week: template.day_of_week?.toString() || "",
    is_active: template.is_active,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Template</h1>
          <p className="text-muted-foreground">
            Update "{template.template_name}"
          </p>
        </div>
      </div>

      {/* Form */}
      <LectureTemplateForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Save Changes"
      />
    </div>
  );
};

export default LectureTemplateEdit;
