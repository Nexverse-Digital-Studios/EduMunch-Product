/**
 * UsersList Page (CONSOLIDATED)
 * ==============================
 * Route: /users
 * Permission: users.view
 *
 * Displays list of all users with filtering and search.
 * Create and Edit operations now use modal dialogs instead of separate routes.
 *
 * Consolidation: Replaces /users/create and /users/:id/edit routes
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Users as UsersIcon,
  Filter,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers, useRoles, useDeleteUser } from "@/hooks/useSupabaseQuery";
import {
  UserTable,
  UserCard,
  DeleteUserDialog,
  UserFormDialog,
} from "./components";

const UsersList = () => {
  const navigate = useNavigate();
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState("all");

  // Modal states for create/edit (consolidation - replaces separate routes)
  const [showUserModal, setShowUserModal] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);

  // Fetch data from Supabase
  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
    refetch,
  } = useUsers();
  const { data: roles } = useRoles();
  const deleteUserMutation = useDeleteUser();

  // Filter users by role
  const filteredUsers =
    filterRole === "all"
      ? users
      : users?.filter((u) => u.primary_role_id === filterRole);

  // Get user name for delete dialog
  const getUserName = (userId: string | null) => {
    if (!userId || !users) return undefined;
    const user = users.find((u) => u.id === userId);
    return user?.full_name;
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    await deleteUserMutation.mutateAsync(deleteUserId);
    setDeleteUserId(null);
  };

  // Handle opening create modal
  const handleCreateUser = () => {
    setEditUserId(null);
    setShowUserModal(true);
  };

  // Handle opening edit modal
  const handleEditUser = (userId: string) => {
    setEditUserId(userId);
    setShowUserModal(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowUserModal(false);
    setEditUserId(null);
  };

  // Get user data for edit mode
  const getEditUserData = () => {
    if (!editUserId || !users) return undefined;
    const user = users.find((u) => u.id === editUserId);
    if (!user) return undefined;
    return {
      full_name: user.full_name,
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      role_id: user.primary_role_id || "",
    };
  };

  if (usersError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading users</p>
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
          <UsersIcon className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            User Management
          </h1>
        </div>
        <Button
          onClick={handleCreateUser}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filter Section */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="space-y-2 flex-1 max-w-xs">
            <Label className="text-muted-foreground">Filter by Role</Label>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles?.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.role_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button className="bg-primary hover:bg-primary/90">
              <Filter className="h-4 w-4 mr-2" />
              Apply
            </Button>
            <Button variant="outline" onClick={() => setFilterRole("all")}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {usersLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!usersLoading && (!users || users.length === 0) && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <UsersIcon className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first user.
          </p>
          <Button onClick={handleCreateUser}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      )}

      {/* Desktop Table */}
      {!usersLoading && filteredUsers && filteredUsers.length > 0 && (
        <div className="hidden md:block">
          <UserTable
            users={filteredUsers}
            roles={roles}
            onEdit={handleEditUser}
            onDelete={setDeleteUserId}
          />
        </div>
      )}

      {/* Mobile Cards */}
      {!usersLoading && filteredUsers && filteredUsers.length > 0 && (
        <div className="md:hidden space-y-4">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              roles={roles}
              onEdit={handleEditUser}
              onDelete={setDeleteUserId}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteUserDialog
        open={!!deleteUserId}
        onOpenChange={() => setDeleteUserId(null)}
        onConfirm={handleDeleteUser}
        userName={getUserName(deleteUserId)}
      />

      {/* Create/Edit User Modal (Consolidated - replaces /users/create and /users/:id/edit routes) */}
      <UserFormDialog
        open={showUserModal}
        onOpenChange={handleModalClose}
        mode={editUserId ? "edit" : "create"}
        userId={editUserId || undefined}
        initialData={getEditUserData()}
      />
    </div>
  );
};

export default UsersList;
