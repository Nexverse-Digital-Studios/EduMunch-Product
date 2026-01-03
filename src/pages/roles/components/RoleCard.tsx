/**
 * RoleCard Component
 * ====================
 * Mobile-friendly card component for displaying role info
 * Used in RolesList page for mobile view
 */

import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Role } from "@/hooks/useSupabaseQuery";

interface RoleCardProps {
  role: Role;
  onEdit: (roleId: string) => void;
  onDelete: (roleId: string) => void;
}

export const RoleCard = ({ role, onEdit, onDelete }: RoleCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {role.is_system_role && (
            <Lock className="h-4 w-4 text-muted-foreground" />
          )}
          <div>
            <span
              className={`font-semibold ${
                role.is_system_role
                  ? "text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {role.role_name}
            </span>
            <div className="flex gap-2 mt-1">
              <Badge
                variant={role.is_system_role ? "secondary" : "outline"}
                className="text-xs"
              >
                {role.is_system_role ? "System" : "Custom"}
              </Badge>
              <code className="text-xs bg-muted px-1 rounded">
                {role.role_code}
              </code>
            </div>
            {role.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                {role.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
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
              onClick={() => onEdit(role.id)}
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
      </div>
    </div>
  );
};

export default RoleCard;
