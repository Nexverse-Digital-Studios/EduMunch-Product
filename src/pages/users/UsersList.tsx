/**
 * UsersList Page
 * ===============
 * Route: /users
 * Permission: users.view
 *
 * Displays list of all users with filtering and search
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
import { UserTable, UserCard, DeleteUserDialog } from "./components";

const UsersList = () => {
  const navigate = useNavigate();
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState("all");

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
          onClick={() => navigate("/users/create")}
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
          <Button onClick={() => navigate("/users/create")}>
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
    </div>
  );
};

export default UsersList;
