import { useParams, useNavigate } from "react-router-dom";
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

export function ExamEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canUpdate } = useModulePermissions("exams");

  const {
    data: exams,
    isLoading,
    error,
    updateMutation,
  } = useSupabaseTable<ExamDB>(`exams_${INDEX_TOKEN}`, {
    filters: { id },
  });

  const { data: academicYears } = useSupabaseTable<AcademicYearDB>(
    `academic_years_${INDEX_TOKEN}`,
    {
      orderBy: { column: "year_name", ascending: false },
    }
  );

  const exam = exams?.[0];

  const handleSubmit = async (data: ExamFormData) => {
    if (!exam) return;

    try {
      await updateMutation.mutateAsync({
        id: exam.id,
        updates: {
          exam_name: data.exam_name,
          exam_type: data.exam_type as ExamDB["exam_type"],
          academic_year_id: data.academic_year_id,
          start_date: data.start_date,
          end_date: data.end_date,
          description: data.description || null,
          max_marks: data.max_marks,
          passing_marks: data.passing_marks,
        },
      });

      toast({
        title: "Exam updated",
        description: "The exam has been successfully updated.",
      });

      navigate(`/exams/${exam.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update exam. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!canUpdate) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to edit exams.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-red-500">
            {error ? `Error: ${error.message}` : "Exam not found"}
          </p>
          <div className="flex justify-center mt-4">
            <Button onClick={() => navigate("/exams")}>Back to Exams</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/exams/${exam.id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Exam</h1>
          <p className="text-muted-foreground">
            Update exam details and configuration
          </p>
        </div>
      </div>

      <ExamForm
        initialData={{
          exam_name: exam.exam_name,
          exam_type: exam.exam_type,
          academic_year_id: exam.academic_year_id,
          start_date: exam.start_date,
          end_date: exam.end_date,
          description: exam.description || "",
          max_marks: exam.max_marks,
          passing_marks: exam.passing_marks,
        }}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/exams/${exam.id}`)}
        isSubmitting={updateMutation.isPending}
        academicYears={academicYears || []}
      />
    </div>
  );
}
