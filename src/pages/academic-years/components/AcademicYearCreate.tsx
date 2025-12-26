/**
 * Create Academic Year Page
 * ==========================
 * Route: /academic-years/create
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AcademicYearForm from "./AcademicYearForm";
import type { AcademicYearFormData } from "./types";

const AcademicYearCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: AcademicYearFormData) => {
    setIsLoading(true);
    try {
      // In real implementation, call Supabase to create
      console.log("Creating academic year:", data);

      toast({
        title: "Academic year created",
        description: `${data.year_name} has been created successfully.`,
      });
      navigate("/academic-years");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create academic year.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return <AcademicYearForm onSubmit={handleSubmit} isLoading={isLoading} />;
};

export default AcademicYearCreate;
