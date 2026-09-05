/**
 * GradingTable Component
 * =======================
 * Table view for grading/submissions tab
 */

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { type AssignmentDB } from "./AssignmentTable";

interface GradingTableProps {
  assignments: AssignmentDB[];
  onViewSubmissions: (assignment: AssignmentDB) => void;
}

export const GradingTable = ({
  assignments,
  onViewSubmissions,
}: GradingTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Assignment</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Deadline</TableHead>
          <TableHead>Max Marks</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((assignment) => (
          <TableRow key={assignment.id}>
            <TableCell className="font-medium">{assignment.title}</TableCell>
            <TableCell>{assignment.subjects?.name || "N/A"}</TableCell>
            <TableCell>
              {assignment.deadline
                ? format(new Date(assignment.deadline), "MMM d, yyyy")
                : "No deadline"}
            </TableCell>
            <TableCell>{assignment.max_marks || "N/A"}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => onViewSubmissions(assignment)}
              >
                <Eye className="h-4 w-4" />
                View Submissions
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default GradingTable;
