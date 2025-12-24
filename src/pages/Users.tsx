import { useState } from "react";
import { Plus, Pencil, Trash2, Users as UsersIcon, Filter, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useUsers, useRoles, useCreateUser, useDeleteUser, User, Role } from "@/hooks/useSupabaseQuery";
import { supabase, TABLES, INDEX_TOKEN } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const Users = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role_id: '',
  });

  // Fetch data from Supabase
  const { data: users, isLoading: usersLoading, error: usersError, refetch } = useUsers();
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const deleteUserMutation = useDeleteUser();

  // Filter users by role
  const filteredUsers = filterRole === "all" 
    ? users 
    : users?.filter(u => u.primary_role_id === filterRole);

  // Get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get role name from ID
  const getRoleName = (roleId: string | undefined) => {
    if (!roleId || !roles) return 'No Role';
    const role = roles.find(r => r.id === roleId);
    return role?.role_name || 'No Role';
  };

  // Handle form input change
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle create user
  const handleCreateUser = async () => {
    if (!formData.full_name || !formData.email || !formData.password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!supabase) {
      toast({
        title: 'Error',
        description: 'Database not configured',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.full_name },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // 2. Get admin role if no role selected
      let roleId = formData.role_id;
      if (!roleId && roles && roles.length > 0) {
        const adminRole = roles.find(r => r.role_code === 'ADMIN');
        roleId = adminRole?.id || roles[0].id;
      }

      // 3. Create user profile
      const { error: profileError } = await supabase
        .from(TABLES.USERS)
        .insert({
          auth_user_id: authData.user.id,
          email: formData.email,
          full_name: formData.full_name,
          phone: formData.phone || null,
          primary_role_id: roleId || null,
          index_token: INDEX_TOKEN,
          is_active: true,
        });

      if (profileError) throw profileError;

      toast({
        title: 'Success',
        description: 'User created successfully',
      });

      setIsCreateModalOpen(false);
      setFormData({ full_name: '', email: '', phone: '', password: '', role_id: '' });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <UsersIcon className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90">
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
                  <SelectItem key={role.id} value={role.id}>{role.role_name}</SelectItem>
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
          <p className="text-muted-foreground mb-4">Get started by creating your first user.</p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      )}

      {/* Desktop Table */}
      {!usersLoading && users && users.length > 0 && (
        <div className="hidden md:block border border-border rounded-lg overflow-hidden">
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
              {filteredUsers?.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="bg-primary">
                        <AvatarFallback className="text-primary-foreground font-medium">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">{user.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-primary">{user.email || "-"}</TableCell>
                  <TableCell className="text-foreground">{user.phone || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{getRoleName(user.primary_role_id)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "default" : "destructive"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteUserId(user.id)}
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
      {!usersLoading && users && users.length > 0 && (
        <div className="md:hidden space-y-4">
          {filteredUsers?.map((user) => (
            <div key={user.id} className="bg-card border border-border rounded-lg p-4">
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
                    <Badge variant="secondary" className="mt-1">{getRoleName(user.primary_role_id)}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteUserId(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24 bg-primary">
                <AvatarFallback className="text-primary-foreground text-2xl font-medium">
                  {formData.full_name ? getInitials(formData.full_name) : 'NA'}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name <span className="text-destructive">*</span></Label>
                <Input 
                  placeholder="Enter full name" 
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input 
                  type="email" 
                  placeholder="user@example.com" 
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input 
                  placeholder="Enter phone number" 
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Password <span className="text-destructive">*</span></Label>
                <Input 
                  type="password" 
                  placeholder="••••••••••" 
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Role <span className="text-destructive">*</span></Label>
                <Select value={formData.role_id} onValueChange={(v) => handleInputChange('role_id', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles?.map((role) => (
                      <SelectItem key={role.id} value={role.id}>{role.role_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90" 
                onClick={handleCreateUser}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create User'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
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

export default Users;