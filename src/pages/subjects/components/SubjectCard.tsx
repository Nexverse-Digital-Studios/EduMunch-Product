/**
 * SubjectCard Component
 * ======================
 * Reusable card component for displaying subjects on mobile
 * Used in SubjectsList page
 */

import { Edit, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Subject } from "@/hooks/useSupabaseQuery";

interface SubjectCardProps {
  subject: Subject;
  onDelete: (subjectId: string) => void;
  onEdit?: (subjectId: string) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

export const SubjectCard = ({
  subject,
  onDelete,
  onEdit,
  canUpdate,
  canDelete,
}: SubjectCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">
                {subject.subject_name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs bg-muted px-2 py-0.5 rounded">
                  {subject.subject_code}
                </code>
                <Badge
                  variant={subject.is_active ? "default" : "secondary"}
                  className="text-xs"
                >
                  {subject.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {subject.subject_type || "General"}
          </Badge>
        </div>

        <div className="flex gap-2 pt-2">
          {canUpdate && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit?.(subject.id)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(subject.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectCard;
