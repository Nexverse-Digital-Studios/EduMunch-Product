/**
 * ClassTable Component
 * ====================
 * Reusable table component for displaying classes list
 * Used in ClassesList page
 */

import {
  Edit,
  Trash2,
  BookOpen,
  ArrowUpDown,
  MoreVertical,
} from "lucide-react";
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

// Database type
export interface ClassDB {
  id: string;
  class_name: string;
  class_code: string;
  class_order: number | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ClassTableProps {
  classes: ClassDB[];
  onDelete: (classId: string) => void;
  onEdit?: (classId: string) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

export const ClassTable = ({
  classes,
  onDelete,
  onEdit,
  canUpdate,
  canDelete,
}: ClassTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/30">
          <TableHead className="w-16">
            <ArrowUpDown className="h-4 w-4" />
          </TableHead>
          <TableHead>Class Name</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {classes.map((classItem) => (
          <TableRow key={classItem.id} className="hover:bg-muted/20">
            <TableCell className="text-muted-foreground text-sm">
              {classItem.class_order || "-"}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">{classItem.class_name}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{classItem.class_code}</Badge>
            </TableCell>
            <TableCell className="max-w-[200px] truncate text-muted-foreground">
              {classItem.description || "-"}
            </TableCell>
            <TableCell>
              <Badge variant={classItem.is_active ? "default" : "secondary"}>
                {classItem.is_active ? "Active" : "Inactive"}
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
                  {canUpdate && (
                    <DropdownMenuItem
                      onClick={() => onEdit?.(classItem.id)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(classItem.id)}
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

export default ClassTable;
