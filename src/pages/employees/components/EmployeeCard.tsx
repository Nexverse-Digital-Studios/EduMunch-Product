/**
 * EmployeeCard Component
 * =======================
 * Reusable card component for displaying employees on mobile
 * Used in EmployeesList page
 */

import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { EmployeeDisplay } from "./EmployeeTable";

interface EmployeeCardProps {
  employee: EmployeeDisplay;
  onEdit: (employeeId: string) => void;
  onDelete: (employeeId: string) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

export const EmployeeCard = ({
  employee,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: EmployeeCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div
            className={`h-12 w-12 rounded-full ${employee.color} flex items-center justify-center text-white font-medium`}
          >
            {employee.avatar}
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">{employee.name}</p>
            <p className="text-sm text-muted-foreground">
              Code: {employee.code}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Role: </span>
            <span className="text-foreground">{employee.role}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Designation: </span>
            <span className="text-foreground">{employee.designation}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate(`/employees/${employee.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Calendar className="h-4 w-4" />
          </Button>
          {canUpdate && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(employee.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => onDelete(employee.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeCard;
