import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, Lock, Shield, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { useRoles, useCreateRole, useDeleteRole, Role } from "@/hooks/useSupabaseQuery";
import { useToast } from "@/hooks/use-toast";

const allModules = [
  "Payments", "Courses", "Lms Content", "Subjects", "Topics", "Batches", 
  "Batch Faculty", "Timetables", "Attendance", "Assignments", "Results", 
  "Lecture Templates", "Users", "Roles", "Branches", "Inventory", 
  "Tie-Up Schools", "Employees", "Salary Structures", "Payslips", 
  "Leave Management", "Working Hours", "Doubts", "Notifications", 
  "Feedback", "Grievances", "PTM Requests", "Support Tickets"
];

const Roles = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleCode, setRoleCode] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch roles from Supabase
  const { data: roles, isLoading, error, refetch } = useRoles();
  const createRoleMutation = useCreateRole();
  const deleteRoleMutation = useDeleteRole();

  const toggleModule = (module: string) => {
    setSelectedModules(prev => 
      prev.includes(module) 
        ? prev.filter(m => m !== module)
        : [...prev, module]
    );
  };

  const moveToActive = () => {
    setActiveModules(prev => [...prev, ...selectedModules.filter(m => !prev.includes(m))]);
    setSelectedModules([]);
  };

  const moveToAll = () => {
    setActiveModules(prev => prev.filter(m => !selectedModules.includes(m)));
    setSelectedModules([]);
  };

  const openCreateModal = () => {
    setRoleName("");
    setRoleCode("");
    setRoleDescription("");
    setSelectedModules([]);
    setActiveModules([]);
    setIsCreateModalOpen(true);
  };

  const handleCreateRole = async () => {
    if (!roleName || !roleCode) {
      toast({
        title: 'Validation Error',
        description: 'Role name and code are required',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createRoleMutation.mutateAsync({
        role_name: roleName,
        role_code: roleCode.toUpperCase().replace(/\s+/g, '_'),
        description: roleDescription || undefined,
        is_system_role: false,
        is_active: true,
      });
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteRoleId) return;
    
    // Check if role is a system role
    const role = roles?.find(r => r.id === deleteRoleId);
    if (role?.is_system_role) {
      toast({
        title: 'Cannot Delete',
        description: 'System roles cannot be deleted',
        variant: 'destructive',
      });
      setDeleteRoleId(null);
      return;
    }
    
    await deleteRoleMutation.mutateAsync(deleteRoleId);
    setDeleteRoleId(null);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Roles & Permissions</h1>
        </div>
        <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/90">
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
          <p className="text-muted-foreground mb-4">Get started by creating your first role.</p>
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </div>
      )}

      {/* Desktop Table */}
      {!isLoading && roles && roles.length > 0 && (
        <div className="hidden md:block border border-border rounded-lg overflow-hidden">
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
                      {role.is_system_role && <Lock className="h-4 w-4 text-muted-foreground" />}
                      <span className={`font-medium ${role.is_system_role ? "text-muted-foreground" : "text-foreground"}`}>
                        {role.role_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{role.role_code}</code>
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
                      {role.is_system_role ? (
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteRoleId(role.id)}
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
      )}

      {/* Mobile Cards */}
      {!isLoading && roles && roles.length > 0 && (
        <div className="md:hidden space-y-4">
          {roles.map((role) => (
            <div key={role.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {role.is_system_role && <Lock className="h-4 w-4 text-muted-foreground" />}
                  <div>
                    <span className={`font-semibold ${role.is_system_role ? "text-muted-foreground" : "text-foreground"}`}>
                      {role.role_name}
                    </span>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={role.is_system_role ? "secondary" : "outline"} className="text-xs">
                        {role.is_system_role ? "System" : "Custom"}
                      </Badge>
                      <code className="text-xs bg-muted px-1 rounded">{role.role_code}</code>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {role.is_system_role ? (
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteRoleId(role.id)}
                    disabled={role.is_system_role}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Role Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role Name <span className="text-destructive">*</span></Label>
                <Input 
                  value={roleName} 
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g., Branch Manager" 
                />
              </div>
              <div className="space-y-2">
                <Label>Role Code <span className="text-destructive">*</span></Label>
                <Input 
                  value={roleCode} 
                  onChange={(e) => setRoleCode(e.target.value)}
                  placeholder="e.g., BRANCH_MANAGER" 
                />
                <p className="text-xs text-muted-foreground">Unique identifier, uppercase with underscores</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={roleDescription} 
                onChange={(e) => setRoleDescription(e.target.value)}
                placeholder="Describe the role's responsibilities..." 
                rows={2}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold">Modules (Phase 4)</Label>
              <p className="text-sm text-muted-foreground">
                Module permissions will be configured in Phase 4. For now, Admin role has full access.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4">
                {/* All Modules */}
                <div className="border border-border rounded-lg">
                  <div className="p-3 border-b border-border bg-muted/30">
                    <h4 className="font-semibold text-foreground">All Modules</h4>
                  </div>
                  <ScrollArea className="h-[200px] p-3">
                    <div className="space-y-2">
                      {allModules.filter(m => !activeModules.includes(m)).map((module) => (
                        <div key={module} className="flex items-center gap-3">
                          <Checkbox 
                            checked={selectedModules.includes(module)}
                            onCheckedChange={() => toggleModule(module)}
                          />
                          <span className="text-sm text-foreground">{module}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Transfer Buttons */}
                <div className="flex md:flex-col items-center justify-center gap-2">
                  <Button size="sm" variant="outline" onClick={moveToActive}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={moveToAll}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>

                {/* Active Modules */}
                <div className="border border-border rounded-lg">
                  <div className="p-3 border-b border-border bg-muted/30">
                    <h4 className="font-semibold text-foreground">Active Modules</h4>
                  </div>
                  <ScrollArea className="h-[200px] p-3">
                    {activeModules.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No modules granted</p>
                    ) : (
                      <div className="space-y-2">
                        {activeModules.map((module) => (
                          <div key={module} className="flex items-center gap-3">
                            <Checkbox 
                              checked={selectedModules.includes(module)}
                              onCheckedChange={() => toggleModule(module)}
                            />
                            <span className="text-sm text-foreground">{module}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90" 
                onClick={handleCreateRole}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Role'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteRoleId} onOpenChange={() => setDeleteRoleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the role
              and remove it from all users assigned to it.
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

export default Roles;