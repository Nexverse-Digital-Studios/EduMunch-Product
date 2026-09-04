/**
 * SectionCreate Component
 * =======================
 * Page for creating a new section
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";

import { SectionForm } from "./SectionForm";
import { SectionDB, SectionFormData } from "./types";

const INDEX_TOKEN = "1emaet";

export function SectionCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createMutation } = useSupabaseTable<SectionDB>(
    `sections_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const handleSubmit = async (data: SectionFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        class_id: data.class_id,
        section_name: data.section_name,
        section_code: data.section_code,
        capacity: parseInt(data.capacity) || 40,
        class_teacher_id: data.class_teacher_id || null,
        room_number: data.room_number || null,
        is_active: data.is_active,
      };

      await createMutation.mutateAsync(payload);

      toast({
        title: "Section created",
        description: `Section ${data.section_name} has been created successfully.`,
      });

      navigate("/sections");
    } catch (error) {
      console.error("Error creating section:", error);
      toast({
        title: "Error",
        description: "Failed to create section. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/sections">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add New Section</h1>
          <p className="text-muted-foreground">
            Create a new section/division for a class
          </p>
        </div>
      </div>

      {/* Form */}
      <SectionForm
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitLabel="Create Section"
      />
    </div>
  );
}
