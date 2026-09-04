/**
 * EmployeeTable Component
 * ========================
 * Reusable table component for displaying employees list
 * Used in EmployeesList page
 */

import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Eye, Calendar, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
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
export interface EmployeeDB {
  id: string;
  user_id?: string;
  employee_code: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email?: string;
  phone: string;
  designation?: string;
  department?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

// Display type
export interface EmployeeDisplay {
  id: string;
  name: string;
  code: string;
  role: string;
  designation: string;
  avatar: string;
  color: string;
}

interface EmployeeTableProps {
  employees: EmployeeDisplay[];
  onEdit: (employeeId: string) => void;
  onDelete: (employeeId: string) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

export const EmployeeTable = ({
  employees,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: EmployeeTableProps) => {
  const navigate = useNavigate();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/30">
          <TableHead>Employee</TableHead>
          <TableHead>Employee Code</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Designation</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id} className="hover:bg-muted/20">
            <TableCell>
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full ${employee.color} flex items-center justify-center text-white font-medium text-sm`}
                >
                  {employee.avatar}
                </div>
                <div>
                  <p className="font-medium text-foreground">{employee.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Code: {employee.code}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-foreground">{employee.code}</TableCell>
            <TableCell className="text-muted-foreground">
              {employee.role}
            </TableCell>
            <TableCell className="text-foreground">
              {employee.designation}
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
                    onClick={() => navigate(`/employees/${employee.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </DropdownMenuItem>
                  {canUpdate && (
                    <DropdownMenuItem
                      onClick={() => onEdit(employee.id)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(employee.id)}
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

export default EmployeeTable;
