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
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  Lock,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Settings2,
  Users,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { supabase, TABLES, INDEX_TOKEN } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { isFeatureEnabled, FEATURES } from "@/config/features.config";

// =============================================================================
// TYPES
// =============================================================================

interface RoleDB {
  id: string;
  role_code: string;
  role_name: string;
  description: string | null;
  is_system_role: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ModuleDB {
  id: string;
  module_code: string;
  module_name: string;
  parent_module_id: string | null;
  description: string | null;
  route_prefix: string | null;
  icon: string | null;
  display_order: number | null;
  is_active: boolean;
}

interface PermissionDB {
  id: string;
  module_id: string;
  permission_code: string;
  permission_name: string;
  description: string | null;
  resource_type: string | null;
  resource_path: string | null;
  is_active: boolean;
}

interface RolePermissionDB {
  id: string;
  role_id: string;
  permission_id: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_approve: boolean;
  can_export: boolean;
  constraints: Record<string, unknown> | null;
}

interface PermissionFormState {
  [permissionId: string]: {
    can_create: boolean;
    can_read: boolean;
    can_update: boolean;
    can_delete: boolean;
    can_approve: boolean;
    can_export: boolean;
  };
}

// =============================================================================
// COMPONENT
// =============================================================================

const SetRoles = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDB | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleDB | null>(null);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionFormState, setPermissionFormState] = useState<PermissionFormState>({});
  
  const [roleForm, setRoleForm] = useState({
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
    orderBy: { column: 'role_name', ascending: true } 
  });

  const { 
    data: modules, 
    isLoading: modulesLoading,
  } = useSupabaseTable<ModuleDB>(TABLES.MODULES, { 
    orderBy: { column: 'display_order', ascending: true } 
  });

  const { 
    data: permissions, 
    isLoading: permissionsLoading,
  } = useSupabaseTable<PermissionDB>(TABLES.PERMISSIONS, {});

  // Fetch role permissions when a role is selected
  const fetchRolePermissions = async (roleId: string) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from(TABLES.ROLE_PERMISSIONS)
        .select('*')
        .eq('role_id', roleId);

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
      console.error('Error fetching role permissions:', error);
    }
  };

  // Filtered roles
  const filteredRoles = useMemo(() => {
    if (!roles) return [];
    if (!searchQuery) return roles;
    
    const query = searchQuery.toLowerCase();
    return roles.filter(role => 
      role.role_name.toLowerCase().includes(query) ||
      role.role_code.toLowerCase().includes(query)
    );
  }, [roles, searchQuery]);

  // Group permissions by module
  const permissionsByModule = useMemo(() => {
    if (!permissions || !modules) return {};
    
    const grouped: Record<string, { module: ModuleDB; permissions: PermissionDB[] }> = {};
    
    modules.forEach(module => {
      grouped[module.id] = {
        module,
        permissions: permissions.filter(p => p.module_id === module.id),
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
        role_code: roleForm.role_code.toUpperCase().replace(/\s+/g, '_'),
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

    const role = roles?.find(r => r.id === deleteRoleId);
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
    setPermissionFormState(prev => ({
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

  // Toggle all permissions for a module
  const toggleModulePermissions = (
    modulePermissions: PermissionDB[], 
    field: keyof PermissionFormState[string],
    value: boolean
  ) => {
    setPermissionFormState(prev => {
      const updated = { ...prev };
      modulePermissions.forEach(perm => {
        updated[perm.id] = {
          can_create: false,
          can_read: false,
          can_update: false,
          can_delete: false,
          can_approve: false,
          can_export: false,
          ...updated[perm.id],
          [field]: value,
        };
      });
      return updated;
    });
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
        .eq('role_id', selectedRole.id);

      // Insert new permissions
      const insertData = Object.entries(permissionFormState)
        .filter(([_, perms]) => 
          perms.can_create || perms.can_read || perms.can_update || 
          perms.can_delete || perms.can_approve || perms.can_export
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

      toast({ title: "Success", description: "Permissions saved successfully" });
      setIsPermissionModalOpen(false);
    } catch (error) {
      console.error('Error saving permissions:', error);
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
            <h1 className="text-2xl font-bold text-foreground">Role Configuration</h1>
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
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'roles' | 'permissions')}>
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={openCreateRoleModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && filteredRoles.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Shield className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Roles Found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "Create your first role"}
              </p>
            </div>
          )}

          {!isLoading && filteredRoles.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRoles.map((role) => (
                <Card key={role.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {role.is_system_role && (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <CardTitle className="text-lg">{role.role_name}</CardTitle>
                      </div>
                      <Badge variant={role.is_active ? "default" : "secondary"}>
                        {role.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="outline">{role.role_code}</Badge>
                      {role.is_system_role && (
                        <Badge variant="secondary" className="text-xs">System</Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {role.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {role.description}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => openPermissionsModal(role)}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Permissions
                      </Button>
                      {!role.is_system_role && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditRoleModal(role)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteRoleId(role.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Modules Tab - Overview of all modules and their features */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Modules Overview</CardTitle>
              <CardDescription>
                View all available modules and their enabled status based on feature config
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-2">
                  {modules?.map((module) => (
                    <div 
                      key={module.id} 
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-muted p-2">
                          <Settings2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{module.module_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {module.module_code}
                            {module.route_prefix && ` • ${module.route_prefix}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {module.is_active ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}

                  {(!modules || modules.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No modules found. Modules are created via database seeding.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Role Modal */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {editingRole ? "Edit Role" : "Create New Role"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role_name">Role Name *</Label>
              <Input
                id="role_name"
                placeholder="e.g., Class Teacher, Principal"
                value={roleForm.role_name}
                onChange={(e) => setRoleForm(prev => ({ ...prev, role_name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role_code">Role Code *</Label>
              <Input
                id="role_code"
                placeholder="e.g., CLASS_TEACHER, PRINCIPAL"
                value={roleForm.role_code}
                onChange={(e) => setRoleForm(prev => ({ ...prev, role_code: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Will be converted to uppercase with underscores
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this role's responsibilities..."
                value={roleForm.description}
                onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="is_active">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Inactive roles cannot be assigned to users
                </p>
              </div>
              <Switch
                id="is_active"
                checked={roleForm.is_active}
                onCheckedChange={(checked) => setRoleForm(prev => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingRole ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Modal */}
      <Dialog open={isPermissionModalOpen} onOpenChange={setIsPermissionModalOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Permissions for: {selectedRole?.role_name}
            </DialogTitle>
            <DialogDescription>
              Configure CRUD permissions for each module. Changes are saved when you click Save.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              {Object.entries(permissionsByModule).map(([moduleId, { module, permissions: modulePerms }]) => {
                if (modulePerms.length === 0) return null;
                
                return (
                  <Collapsible key={moduleId} defaultOpen className="border rounded-lg">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{module.module_name}</span>
                        <Badge variant="outline" className="ml-2">
                          {modulePerms.length} permissions
                        </Badge>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Permission</TableHead>
                              <TableHead className="text-center w-20">View</TableHead>
                              <TableHead className="text-center w-20">Create</TableHead>
                              <TableHead className="text-center w-20">Update</TableHead>
                              <TableHead className="text-center w-20">Delete</TableHead>
                              <TableHead className="text-center w-20">Approve</TableHead>
                              <TableHead className="text-center w-20">Export</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {modulePerms.map((perm) => (
                              <TableRow key={perm.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-sm">{perm.permission_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {perm.permission_code}
                                    </p>
                                  </div>
                                </TableCell>
                                {(['can_read', 'can_create', 'can_update', 'can_delete', 'can_approve', 'can_export'] as const).map((field) => (
                                  <TableCell key={field} className="text-center">
                                    <Checkbox
                                      checked={permissionFormState[perm.id]?.[field] || false}
                                      onCheckedChange={() => togglePermission(perm.id, field)}
                                    />
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}

              {Object.keys(permissionsByModule).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No modules or permissions found.
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePermissions} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteRoleId} onOpenChange={() => setDeleteRoleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Users with this role will lose their permissions.
              You may want to deactivate the role instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SetRoles;
