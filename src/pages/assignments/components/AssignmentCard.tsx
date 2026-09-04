/**
 * AssignmentCard Component
 * =========================
 * Mobile card view for assignments
 */

import { Edit, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { type AssignmentDB } from "./AssignmentTable";

interface AssignmentCardProps {
  assignment: AssignmentDB;
  onViewSubmissions: (assignment: AssignmentDB) => void;
  canUpdate: boolean;
}

const getTypeBadgeVariant = (type: string) => {
  switch (type) {
    case "Homework":
      return "default";
    case "Project":
      return "secondary";
    case "Practice":
      return "outline";
    case "Lab Work":
      return "destructive";
    default:
      return "default";
  }
};

export const AssignmentCard = ({
  assignment,
  onViewSubmissions,
  canUpdate,
}: AssignmentCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-3 border-b border-border last:border-0">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Edit className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{assignment.title}</p>
            <p className="text-sm text-muted-foreground">
              {assignment.subjects?.name || "No subject"}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Badge
            variant={getTypeBadgeVariant(assignment.assignment_type)}
            className="text-xs"
          >
            {assignment.assignment_type}
          </Badge>
        </div>
      </div>
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>
          Due:{" "}
          {assignment.deadline
            ? format(new Date(assignment.deadline), "MMM d")
            : "No deadline"}
        </span>
        <Badge
          variant={assignment.is_published ? "default" : "secondary"}
          className="text-xs"
        >
          {assignment.is_published ? "Published" : "Draft"}
        </Badge>
      </div>
      <div className="flex gap-2">
        {canUpdate && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => navigate(`/assignments/${assignment.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        )}
        <Button
          size="sm"
          className="flex-1 gap-2"
          onClick={() => onViewSubmissions(assignment)}
        >
          <Eye className="h-4 w-4" />
          Submissions
        </Button>
      </div>
    </div>
  );
};

export default AssignmentCard;
