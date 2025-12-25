/**
 * RoleTable Component
 * ====================
 * Reusable table component for displaying roles list
 * Used in RolesList page
 */

import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Eye, Lock } from "lucide-react";
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
import { Role } from "@/hooks/useSupabaseQuery";

interface RoleTableProps {
  roles: Role[];
  onDelete: (roleId: string) => void;
}

export const RoleTable = ({ roles, onDelete }: RoleTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead>Role Name</TableHead>
            <TableHead>Role Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id} className="hover:bg-muted/20">
              <TableCell>
                <div className="flex items-center gap-3">
                  {role.is_system_role && (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span
                    className={`font-medium ${
                      role.is_system_role
                        ? "text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {role.role_name}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {role.role_code}
                </code>
              </TableCell>
              <TableCell>
                <Badge variant={role.is_system_role ? "secondary" : "outline"}>
                  {role.is_system_role ? "System" : "Custom"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={role.is_active ? "default" : "destructive"}>
                  {role.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/roles/${role.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {!role.is_system_role && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/roles/${role.id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(role.id)}
                    disabled={role.is_system_role}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RoleTable;
