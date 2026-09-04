/**
 * Edit Academic Year Page
 * ========================
 * Route: /academic-years/:id/edit
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import AcademicYearForm from "./AcademicYearForm";
import type { AcademicYearDB, AcademicYearFormData } from "./types";

const AcademicYearEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch academic year
  const { data: academicYears, isLoading } = useSupabaseTable<AcademicYearDB>(
    TABLES.ACADEMIC_YEARS,
    {
      filters: { id },
    }
  );

  const academicYear = academicYears?.[0];

  const handleSubmit = async (data: AcademicYearFormData) => {
    setIsSubmitting(true);
    try {
      // In real implementation, call Supabase to update
      console.log("Updating academic year:", id, data);

      toast({
        title: "Academic year updated",
        description: `${data.year_name} has been updated successfully.`,
      });
      navigate(`/academic-years/${id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update academic year.",
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

  if (!academicYear) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Academic year not found</p>
      </div>
    );
  }

  return (
    <AcademicYearForm
      initialData={academicYear}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
    />
  );
};

export default AcademicYearEdit;
