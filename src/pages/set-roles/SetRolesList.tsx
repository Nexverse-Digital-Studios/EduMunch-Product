/**
 * Set Roles Page - EduMunch
 * ==========================
 *
 * Admin-only route for managing roles and permissions.
 *
 * Features:
 * - View all roles with their permissions
 * - Create custom roles
 * - Edit role permissions (CRUD + Approve + Export)
 * - Manage modules and their permissions
 * - Assign permissions to roles
 *
 * Access: Admin only (role_code === 'ADMIN')
 */

import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Shield, Lock, Users, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { supabase, TABLES } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  RoleDB,
  ModuleDB,
  PermissionDB,
  RolePermissionDB,
  PermissionFormState,
  RoleFormData,
  RolesTab,
  ModulesTab,
  RoleModal,
  PermissionsModal,
  DeleteRoleDialog,
} from "./components";

export const SetRolesList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "roles";

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDB | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleDB | null>(null);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionFormState, setPermissionFormState] =
    useState<PermissionFormState>({});

  const [roleForm, setRoleForm] = useState<RoleFormData>({
    role_name: "",
    role_code: "",
    description: "",
    is_active: true,
  });

  const { toast } = useToast();

  // Fetch data
  const {
    data: roles,
    isLoading: rolesLoading,
    refetch: refetchRoles,
    createMutation: createRoleMutation,
    updateMutation: updateRoleMutation,
    deleteMutation: deleteRoleMutation,
  } = useSupabaseTable<RoleDB>(TABLES.ROLES, {
    orderBy: { column: "role_name", ascending: true },
  });

  const { data: modules, isLoading: modulesLoading } =
    useSupabaseTable<ModuleDB>(TABLES.MODULES, {
      orderBy: { column: "display_order", ascending: true },
    });

  const { data: permissions, isLoading: permissionsLoading } =
    useSupabaseTable<PermissionDB>(TABLES.PERMISSIONS, {});

  // Fetch role permissions when a role is selected
  const fetchRolePermissions = async (roleId: string) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from(TABLES.ROLE_PERMISSIONS)
        .select("*")
        .eq("role_id", roleId);

      if (error) throw error;

      // Build permission form state
      const formState: PermissionFormState = {};
      data?.forEach((rp: RolePermissionDB) => {
        formState[rp.permission_id] = {
          can_create: rp.can_create,
          can_read: rp.can_read,
          can_update: rp.can_update,
          can_delete: rp.can_delete,
          can_approve: rp.can_approve,
          can_export: rp.can_export,
        };
      });
      setPermissionFormState(formState);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
    }
  };

  // Filtered roles
  const filteredRoles = useMemo(() => {
    if (!roles) return [];
    if (!searchQuery) return roles;

    const query = searchQuery.toLowerCase();
    return roles.filter(
      (role) =>
        role.role_name.toLowerCase().includes(query) ||
        role.role_code.toLowerCase().includes(query)
    );
  }, [roles, searchQuery]);

  // Group permissions by module
  const permissionsByModule = useMemo(() => {
    if (!permissions || !modules) return {};

    const grouped: Record<
      string,
      { module: ModuleDB; permissions: PermissionDB[] }
    > = {};

    modules.forEach((module) => {
      grouped[module.id] = {
        module,
        permissions: permissions.filter((p) => p.module_id === module.id),
      };
    });

    return grouped;
  }, [permissions, modules]);

  // Open create role modal
  const openCreateRoleModal = () => {
    setEditingRole(null);
    setRoleForm({
      role_name: "",
      role_code: "",
      description: "",
      is_active: true,
    });
    setIsRoleModalOpen(true);
  };

  // Open edit role modal
  const openEditRoleModal = (role: RoleDB) => {
    setEditingRole(role);
    setRoleForm({
      role_name: role.role_name,
      role_code: role.role_code,
      description: role.description || "",
      is_active: role.is_active,
    });
    setIsRoleModalOpen(true);
  };

  // Open permissions modal for a role
  const openPermissionsModal = async (role: RoleDB) => {
    setSelectedRole(role);
    await fetchRolePermissions(role.id);
    setIsPermissionModalOpen(true);
  };

  // Handle role form submission
  const handleRoleSubmit = async () => {
    if (!roleForm.role_name || !roleForm.role_code) {
      toast({
        title: "Validation Error",
        description: "Role name and code are required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        role_name: roleForm.role_name,
        role_code: roleForm.role_code.toUpperCase().replace(/\s+/g, "_"),
        description: roleForm.description || null,
        is_active: roleForm.is_active,
        is_system_role: false,
      };

      if (editingRole) {
        await updateRoleMutation.mutateAsync({
          id: editingRole.id,
          updates: payload,
        });
        toast({ title: "Success", description: "Role updated successfully" });
      } else {
        await createRoleMutation.mutateAsync(payload);
        toast({ title: "Success", description: "Role created successfully" });
      }

      setIsRoleModalOpen(false);
      refetchRoles();
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete role
  const handleDeleteRole = async () => {
    if (!deleteRoleId) return;

    const role = roles?.find((r) => r.id === deleteRoleId);
    if (role?.is_system_role) {
      toast({
        title: "Cannot Delete",
        description: "System roles cannot be deleted",
        variant: "destructive",
      });
      setDeleteRoleId(null);
      return;
    }

    try {
      await deleteRoleMutation.mutateAsync(deleteRoleId);
      toast({ title: "Success", description: "Role deleted successfully" });
      refetchRoles();
    } catch (error) {
      // Error handled by mutation
    }
    setDeleteRoleId(null);
  };

  // Toggle permission checkbox
  const togglePermission = (
    permissionId: string,
    field: keyof PermissionFormState[string]
  ) => {
    setPermissionFormState((prev) => ({
      ...prev,
      [permissionId]: {
        can_create: false,
        can_read: false,
        can_update: false,
        can_delete: false,
        can_approve: false,
        can_export: false,
        ...prev[permissionId],
        [field]: !prev[permissionId]?.[field],
      },
    }));
  };

  // Save permissions for role
  const handleSavePermissions = async () => {
    if (!selectedRole || !supabase) return;

    setIsSubmitting(true);
    try {
      // Delete existing permissions for this role
      await supabase
        .from(TABLES.ROLE_PERMISSIONS)
        .delete()
        .eq("role_id", selectedRole.id);

      // Insert new permissions
      const insertData = Object.entries(permissionFormState)
        .filter(
          ([_, perms]) =>
            perms.can_create ||
            perms.can_read ||
            perms.can_update ||
            perms.can_delete ||
            perms.can_approve ||
            perms.can_export
        )
        .map(([permissionId, perms]) => ({
          role_id: selectedRole.id,
          permission_id: permissionId,
          ...perms,
        }));

      if (insertData.length > 0) {
        const { error } = await supabase
          .from(TABLES.ROLE_PERMISSIONS)
          .insert(insertData);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Permissions saved successfully",
      });
      setIsPermissionModalOpen(false);
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast({
        title: "Error",
        description: "Failed to save permissions",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = rolesLoading || modulesLoading || permissionsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Role Configuration
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage roles and their permissions (Admin Only)
            </p>
          </div>
        </div>
        <Badge variant="outline" className="gap-2">
          <Lock className="h-3 w-3" />
          Admin Access
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="roles" className="gap-2">
            <Users className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Modules
          </TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <RolesTab
            roles={filteredRoles}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCreateRole={openCreateRoleModal}
            onEditRole={openEditRoleModal}
            onDeleteRole={setDeleteRoleId}
            onOpenPermissions={openPermissionsModal}
          />
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <ModulesTab modules={modules || []} isLoading={isLoading} />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Role Modal */}
      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        editingRole={editingRole}
        formData={roleForm}
        onFormChange={(data) => setRoleForm((prev) => ({ ...prev, ...data }))}
        onSubmit={handleRoleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Permissions Modal */}
      <PermissionsModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        selectedRole={selectedRole}
        permissionsByModule={permissionsByModule}
        permissionFormState={permissionFormState}
        onTogglePermission={togglePermission}
        onSave={handleSavePermissions}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation */}
      <DeleteRoleDialog
        isOpen={!!deleteRoleId}
        onClose={() => setDeleteRoleId(null)}
        onConfirm={handleDeleteRole}
      />
    </div>
  );
};

export default SetRolesList;
