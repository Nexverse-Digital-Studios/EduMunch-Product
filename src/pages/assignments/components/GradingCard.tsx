/**
 * GradingCard Component
 * ======================
 * Mobile card view for grading/submissions tab
 */

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { type AssignmentDB } from "./AssignmentTable";

interface GradingCardProps {
  assignment: AssignmentDB;
  onViewSubmissions: (assignment: AssignmentDB) => void;
}

export const GradingCard = ({
  assignment,
  onViewSubmissions,
}: GradingCardProps) => {
  return (
    <div className="p-4 space-y-3 border-b border-border last:border-0">
      <div>
        <p className="font-medium">{assignment.title}</p>
        <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
          <span>
            Due:{" "}
            {assignment.deadline
              ? format(new Date(assignment.deadline), "MMM d")
              : "No deadline"}
          </span>
          <span>Max: {assignment.max_marks || "N/A"} marks</span>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2"
        onClick={() => onViewSubmissions(assignment)}
      >
        <Eye className="h-4 w-4" />
        View Submissions
      </Button>
    </div>
  );
};

export default GradingCard;
