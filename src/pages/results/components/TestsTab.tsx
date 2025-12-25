import { Plus, Pencil, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Exam, ExamType } from "./types";

interface TestsTabProps {
  exams: Exam[];
  examTypes: ExamType[];
  isLoading: boolean;
  onRefresh: () => void;
  onAddTest: () => void;
  onEditTest: (exam: Exam) => void;
  onDeleteTest: (id: string) => void;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isDeleting: boolean;
}

export const TestsTab = ({
  exams,
  examTypes,
  isLoading,
  onRefresh,
  onAddTest,
  onEditTest,
  onDeleteTest,
  canCreate,
  canUpdate,
  canDelete,
  isDeleting,
}: TestsTabProps) => {
  const getExamTypeName = (typeId: string) => {
    const type = examTypes.find((t) => t.id === typeId);
    return type ? type.exam_type_name : "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-foreground">Tests</h2>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {canCreate && (
            <Button
              onClick={onAddTest}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Test
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">
                    {exam.exam_name}
                  </h3>
                  <p className="text-sm text-primary">
                    {getExamTypeName(exam.exam_type_id)} ({exam.exam_code})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Date: {format(new Date(exam.start_date), "MMM dd, yyyy")}
                    {exam.end_date &&
                      exam.end_date !== exam.start_date &&
                      ` - ${format(new Date(exam.end_date), "MMM dd, yyyy")}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  {canUpdate && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => onEditTest(exam)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteTest(exam.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {exams.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No exams found.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
