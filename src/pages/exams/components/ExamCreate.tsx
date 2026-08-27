import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { ExamForm } from "./ExamForm";
import { ExamDB, ExamFormData } from "./types";

const INDEX_TOKEN = "1emaet";

interface AcademicYearDB {
  id: string;
  year_name: string;
  is_active: boolean;
}

export function ExamCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canCreate } = useModulePermissions("exams");

  const { createMutation } = useSupabaseTable<ExamDB>(`exams_${INDEX_TOKEN}`);

  const { data: academicYears } = useSupabaseTable<AcademicYearDB>(
    `academic_years_${INDEX_TOKEN}`,
    {
      orderBy: { column: "year_name", ascending: false },
    }
  );

  const handleSubmit = async (data: ExamFormData) => {
    try {
      await createMutation.mutateAsync({
        exam_name: data.exam_name,
        exam_type: data.exam_type as ExamDB["exam_type"],
        academic_year_id: data.academic_year_id,
        start_date: data.start_date,
        end_date: data.end_date,
        description: data.description || null,
        max_marks: data.max_marks,
        passing_marks: data.passing_marks,
        is_published: false,
        status: "draft",
      });

      toast({
        title: "Exam created",
        description: "The exam has been successfully created.",
      });

      navigate("/exams");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create exam. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!canCreate) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to create exams.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/exams")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Exam</h1>
          <p className="text-muted-foreground">
            Set up a new examination with schedule and marks configuration
          </p>
        </div>
      </div>

      <ExamForm
        onSubmit={handleSubmit}
        onCancel={() => navigate("/exams")}
        isSubmitting={createMutation.isPending}
        academicYears={academicYears || []}
      />
    </div>
  );
}
