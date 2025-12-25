/**
 * AssignmentTable Component
 * ==========================
 * Desktop table view for assignments list
 */

import { Edit, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

// Database type
export interface AssignmentDB {
  id: string;
  title: string;
  description: string | null;
  section_id: string | null;
  subject_id: string | null;
  teacher_id: string | null;
  academic_year_id: string | null;
  assignment_type: "Homework" | "Project" | "Practice" | "Lab Work";
  deadline: string | null;
  max_marks: number | null;
  attachment_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  subjects?: { name: string } | null;
  sections?: { name: string; classes?: { name: string } | null } | null;
  teachers?: { first_name: string; last_name: string } | null;
}

// Display type
export interface AssignmentDisplay {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  className: string;
  sectionName: string;
  type: string;
  deadline: string | null;
  maxMarks: number | null;
  isPublished: boolean;
}

interface AssignmentTableProps {
  assignments: AssignmentDB[];
  onViewSubmissions: (assignment: AssignmentDB) => void;
  onDelete: (id: string) => void;
  canUpdate: boolean;
  canDelete: boolean;
  isDeleting?: boolean;
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

export const AssignmentTable = ({
  assignments,
  onViewSubmissions,
  onDelete,
  canUpdate,
  canDelete,
  isDeleting = false,
}: AssignmentTableProps) => {
  const navigate = useNavigate();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Class/Section</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Deadline</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((assignment) => (
          <TableRow key={assignment.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Edit className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{assignment.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {assignment.description || "No description"}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>{assignment.subjects?.name || "N/A"}</TableCell>
            <TableCell>
              {assignment.sections?.classes?.name || ""}{" "}
              {assignment.sections?.name || "N/A"}
            </TableCell>
            <TableCell>
              <Badge variant={getTypeBadgeVariant(assignment.assignment_type)}>
                {assignment.assignment_type}
              </Badge>
            </TableCell>
            <TableCell>
              {assignment.deadline
                ? format(new Date(assignment.deadline), "MMM d, yyyy")
                : "No deadline"}
            </TableCell>
            <TableCell>
              <Badge
                variant={assignment.is_published ? "default" : "secondary"}
              >
                {assignment.is_published ? "Published" : "Draft"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                {canUpdate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      navigate(`/assignments/${assignment.id}/edit`)
                    }
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewSubmissions(assignment)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Submissions
                </Button>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(assignment.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AssignmentTable;
