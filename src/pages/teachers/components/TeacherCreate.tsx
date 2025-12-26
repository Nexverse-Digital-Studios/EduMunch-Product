/**
 * Create Teacher Page
 * ====================
 * Route: /teachers/create
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import TeacherForm from "./TeacherForm";
import type { TeacherFormData } from "./types";

const TeacherCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: TeacherFormData) => {
    setIsLoading(true);
    try {
      // In real implementation, call Supabase to create
      console.log("Creating teacher:", data);

      toast({
        title: "Teacher created",
        description: `${data.first_name} ${data.last_name} has been added successfully.`,
      });
      navigate("/teachers");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create teacher.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return <TeacherForm onSubmit={handleSubmit} isLoading={isLoading} />;
};

export default TeacherCreate;
