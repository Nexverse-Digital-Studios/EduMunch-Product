/**
 * UserTable Component
 * ====================
 * Reusable table component for displaying users list
 * Used in UsersList page
 */

import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, Role } from "@/hooks/useSupabaseQuery";

interface UserTableProps {
  users: User[];
  roles: Role[] | undefined;
  onDelete: (userId: string) => void;
}

// Get initials from name
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Get role name from ID
const getRoleName = (roleId: string | undefined, roles: Role[] | undefined) => {
  if (!roleId || !roles) return "No Role";
  const role = roles.find((r) => r.id === roleId);
  return role?.role_name || "No Role";
};

export const UserTable = ({ users, roles, onDelete }: UserTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-muted/20">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="bg-primary">
                    <AvatarFallback className="text-primary-foreground font-medium">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">
                    {user.full_name}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-primary">
                {user.email || "-"}
              </TableCell>
              <TableCell className="text-foreground">
                {user.phone || "-"}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {getRoleName(user.primary_role_id, roles)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.is_active ? "default" : "destructive"}>
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/users/${user.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/users/${user.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(user.id)}
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

export default UserTable;
