/**
 * RolesList Page (CONSOLIDATED)
 * ==============================
 * Route: /roles
 * Permission: roles.view
 *
 * Displays list of all roles with create/edit modal.
 * Create and Edit operations now use modal dialogs instead of separate routes.
 *
 * Consolidation: Replaces /roles/create and /roles/:id/edit routes
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoles, useDeleteRole } from "@/hooks/useSupabaseQuery";
import { useToast } from "@/hooks/use-toast";
import {
  RoleTable,
  RoleCard,
  DeleteRoleDialog,
  RoleFormDialog,
} from "./components";

const RolesList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);

  // Modal states for create/edit (consolidation - replaces separate routes)
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);

  // Fetch roles from Supabase
  const { data: roles, isLoading, error, refetch } = useRoles();
  const deleteRoleMutation = useDeleteRole();

  // Get role name for delete dialog
  const getRoleName = (roleId: string | null) => {
    if (!roleId || !roles) return undefined;
    const role = roles.find((r) => r.id === roleId);
    return role?.role_name;
  };

  // Check if role is system role
  const isSystemRole = (roleId: string | null) => {
    if (!roleId || !roles) return false;
    const role = roles.find((r) => r.id === roleId);
    return role?.is_system_role || false;
  };

  // Handle delete role
  const handleDeleteRole = async () => {
    if (!deleteRoleId) return;

    // Check if role is a system role
    if (isSystemRole(deleteRoleId)) {
      toast({
        title: "Cannot Delete",
        description: "System roles cannot be deleted",
        variant: "destructive",
      });
      setDeleteRoleId(null);
      return;
    }

    await deleteRoleMutation.mutateAsync(deleteRoleId);
    setDeleteRoleId(null);
  };

  // Handle opening create modal
  const handleCreateRole = () => {
    setEditRoleId(null);
    setShowRoleModal(true);
  };

  // Handle opening edit modal
  const handleEditRole = (roleId: string) => {
    setEditRoleId(roleId);
    setShowRoleModal(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowRoleModal(false);
    setEditRoleId(null);
  };

  // Get role data for edit mode
  const getEditRoleData = () => {
    if (!editRoleId || !roles) return undefined;
    const role = roles.find((r) => r.id === editRoleId);
    if (!role) return undefined;
    return {
      role_name: role.role_name,
      role_code: role.role_code,
      description: role.description || "",
      is_active: role.is_active,
      active_modules: [], // Will be populated from permissions in Phase 4
    };
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading roles</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            Roles & Permissions
          </h1>
        </div>
        <Button
          onClick={handleCreateRole}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!roles || roles.length === 0) && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Shield className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Roles Found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first role.
          </p>
          <Button onClick={handleCreateRole}>
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </div>
      )}

      {/* Desktop Table */}
      {!isLoading && roles && roles.length > 0 && (
        <div className="hidden md:block">
          <RoleTable
            roles={roles}
            onEdit={handleEditRole}
            onDelete={setDeleteRoleId}
          />
        </div>
      )}

      {/* Mobile Cards */}
      {!isLoading && roles && roles.length > 0 && (
        <div className="md:hidden space-y-4">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onEdit={handleEditRole}
              onDelete={setDeleteRoleId}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteRoleDialog
        open={!!deleteRoleId}
        onOpenChange={() => setDeleteRoleId(null)}
        onConfirm={handleDeleteRole}
        roleName={getRoleName(deleteRoleId)}
      />

      {/* Create/Edit Role Modal (Consolidated - replaces /roles/create and /roles/:id/edit routes) */}
      <RoleFormDialog
        open={showRoleModal}
        onOpenChange={handleModalClose}
        mode={editRoleId ? "edit" : "create"}
        roleId={editRoleId || undefined}
        initialData={getEditRoleData()}
      />
    </div>
  );
};

export default RolesList;
