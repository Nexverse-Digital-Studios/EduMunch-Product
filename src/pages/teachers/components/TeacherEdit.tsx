/**
 * Edit Teacher Page
 * ==================
 * Route: /teachers/:id/edit
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import TeacherForm from "./TeacherForm";
import type { TeacherDB, TeacherFormData } from "./types";

const TeacherEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch teacher
  const { data: teachers, isLoading } = useSupabaseTable<TeacherDB>(
    TABLES.TEACHERS,
    {
      filters: { id },
    }
  );

  const teacher = teachers?.[0];

  const handleSubmit = async (data: TeacherFormData) => {
    setIsSubmitting(true);
    try {
      // In real implementation, call Supabase to update
      console.log("Updating teacher:", id, data);

      toast({
        title: "Teacher updated",
        description: `${data.first_name} ${data.last_name} has been updated successfully.`,
      });
      navigate(`/teachers/${id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update teacher.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Teacher not found</p>
      </div>
    );
  }

  return (
    <TeacherForm
      initialData={teacher}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
    />
  );
};

export default TeacherEdit;
