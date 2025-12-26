/**
 * SectionEdit Component
 * =====================
 * Page for editing an existing section
 */

import { useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";

import { SectionForm } from "./SectionForm";
import { SectionDB, SectionFormData } from "./types";

const INDEX_TOKEN = "1emaet";

export function SectionEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: sections,
    isLoading,
    updateMutation,
  } = useSupabaseTable<SectionDB>(`sections_${INDEX_TOKEN}`, { filters: {} });

  const section = useMemo(() => {
    return sections?.find((s) => s.id === id);
  }, [sections, id]);

  const initialData: Partial<SectionFormData> | undefined = useMemo(() => {
    if (!section) return undefined;

    return {
      class_id: section.class_id,
      section_name: section.section_name,
      section_code: section.section_code,
      capacity: section.capacity?.toString() || "40",
      class_teacher_id: section.class_teacher_id || "",
      room_number: section.room_number || "",
      is_active: section.is_active,
    };
  }, [section]);

  const handleSubmit = async (data: SectionFormData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      const updates = {
        class_id: data.class_id,
        section_name: data.section_name,
        section_code: data.section_code,
        capacity: parseInt(data.capacity) || 40,
        class_teacher_id: data.class_teacher_id || null,
        room_number: data.room_number || null,
        is_active: data.is_active,
        updated_at: new Date().toISOString(),
      };

      await updateMutation.mutateAsync({ id, updates });

      toast({
        title: "Section updated",
        description: `Section ${data.section_name} has been updated.`,
      });

      navigate(`/sections/${id}`);
    } catch (error) {
      console.error("Error updating section:", error);
      toast({
        title: "Error",
        description: "Failed to update section. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!section) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-xl font-semibold">Section Not Found</h2>
        <p className="text-muted-foreground">
          The requested section could not be found.
        </p>
        <Button asChild>
          <Link to="/sections">Back to Sections</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/sections/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Section</h1>
          <p className="text-muted-foreground">
            Update Section {section.section_name}'s details
          </p>
        </div>
      </div>

      {/* Form */}
      <SectionForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitLabel="Update Section"
      />
    </div>
  );
}
