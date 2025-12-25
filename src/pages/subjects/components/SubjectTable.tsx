/**
 * SubjectTable Component
 * =======================
 * Reusable table component for displaying subjects list
 * Used in SubjectsList page
 */

import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Eye, BookOpen, MoreVertical } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Subject } from "@/hooks/useSupabaseQuery";

interface SubjectTableProps {
  subjects: Subject[];
  onDelete: (subjectId: string) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

export const SubjectTable = ({
  subjects,
  onDelete,
  canUpdate,
  canDelete,
}: SubjectTableProps) => {
  const navigate = useNavigate();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/30">
          <TableHead>Subject Name</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subjects.map((subject) => (
          <TableRow key={subject.id} className="hover:bg-muted/20">
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">{subject.subject_name}</span>
              </div>
            </TableCell>
            <TableCell>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {subject.subject_code}
              </code>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {subject.subject_type || "General"}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={subject.is_active ? "default" : "secondary"}>
                {subject.is_active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => navigate(`/subjects/${subject.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  {canUpdate && (
                    <DropdownMenuItem
                      onClick={() => navigate(`/subjects/${subject.id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(subject.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SubjectTable;
