/**
 * UserCard Component
 * ====================
 * Mobile-friendly card component for displaying user info
 * Used in UsersList page for mobile view
 */

import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Role } from "@/hooks/useSupabaseQuery";

interface UserCardProps {
  user: User;
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

export const UserCard = ({ user, roles, onDelete }: UserCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="bg-primary">
            <AvatarFallback className="text-primary-foreground font-medium">
              {getInitials(user.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{user.full_name}</p>
            <p className="text-sm text-primary">{user.email || "-"}</p>
            <p className="text-sm text-muted-foreground">{user.phone || "-"}</p>
            <div className="flex gap-2 mt-1">
              <Badge variant="secondary">
                {getRoleName(user.primary_role_id, roles)}
              </Badge>
              <Badge variant={user.is_active ? "default" : "destructive"}>
                {user.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
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
      </div>
    </div>
  );
};

export default UserCard;
