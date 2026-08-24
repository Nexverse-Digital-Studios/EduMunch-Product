/**
 * BatchTable Component
 * =====================
 * Desktop table view for batches/sections list
 */

import { Edit, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Database types
export interface SectionDB {
  id: string;
  class_id: string;
  section_name: string;
  section_code: string;
  capacity?: number;
  class_teacher_id?: string;
  room_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassDB {
  id: string;
  class_name: string;
  class_code: string;
  class_order?: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BatchDisplay {
  id: string;
  name: string;
  code: string;
  className: string;
  classCode: string;
  capacity?: number;
  roomNumber?: string;
  isActive: boolean;
}

interface BatchTableProps {
  batches: BatchDisplay[];
  onDelete: (id: string) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

export const BatchTable = ({
  batches,
  onDelete,
  canUpdate,
  canDelete,
}: BatchTableProps) => {
  const navigate = useNavigate();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Section Name</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Capacity</TableHead>
          <TableHead>Room</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {batches.map((batch) => (
          <TableRow key={batch.id}>
            <TableCell>
              <p className="font-medium">{batch.name}</p>
            </TableCell>
            <TableCell>{batch.className}</TableCell>
            <TableCell className="text-muted-foreground">
              {batch.code}
            </TableCell>
            <TableCell>{batch.capacity || "-"}</TableCell>
            <TableCell>{batch.roomNumber || "-"}</TableCell>
            <TableCell>
              <Badge
                variant={batch.isActive ? "default" : "secondary"}
                className={
                  batch.isActive
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : ""
                }
              >
                {batch.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/batches/${batch.id}`)}
                  title="View details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {canUpdate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/batches/${batch.id}/edit`)}
                    title="Edit batch"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDelete(batch.id)}
                    title="Delete batch"
                  >
                    <Trash2 className="h-4 w-4" />
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

export default BatchTable;
