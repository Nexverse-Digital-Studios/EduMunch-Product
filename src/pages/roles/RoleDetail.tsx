/**
 * RoleDetail Page
 * =================
 * Route: /roles/:id
 * Permission: roles.view
 *
 * Displays detailed information about a specific role
 */

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Shield,
  Lock,
  Calendar,
  Loader2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRole, useDeleteRole } from "@/hooks/useSupabaseQuery";
import { useToast } from "@/hooks/use-toast";
import { DeleteRoleDialog } from "./components";

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const RoleDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch role data
  const { data: role, isLoading, error } = useRole(id);
  const deleteRoleMutation = useDeleteRole();

  // Handle delete
  const handleDelete = async () => {
    if (!id) return;

    if (role?.is_system_role) {
      toast({
        title: "Cannot Delete",
        description: "System roles cannot be deleted",
        variant: "destructive",
      });
      return;
    }

    await deleteRoleMutation.mutateAsync(id);
    navigate("/roles");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading role</p>
          <Button onClick={() => navigate("/roles")}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/roles")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Role Details</h1>
          </div>
        </div>
        <div className="flex gap-2">
          {!role.is_system_role && (
            <Button
              variant="outline"
              onClick={() => navigate(`/roles/${id}/edit`)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          <Button
            variant="outline"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setShowDeleteDialog(true)}
            disabled={role.is_system_role}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Role Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              {role.is_system_role ? (
                <Lock className="h-10 w-10 text-primary" />
              ) : (
                <Shield className="h-10 w-10 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-2xl">{role.role_name}</CardTitle>
              <CardDescription className="text-base mt-1">
                <code className="bg-muted px-2 py-1 rounded">
                  {role.role_code}
                </code>
              </CardDescription>
              <div className="flex gap-2 mt-2">
                <Badge variant={role.is_system_role ? "secondary" : "outline"}>
                  {role.is_system_role ? "System Role" : "Custom Role"}
                </Badge>
                <Badge variant={role.is_active ? "default" : "destructive"}>
                  {role.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role Type</p>
                  <p className="font-medium">
                    {role.is_system_role ? "System (Protected)" : "Custom"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">
                    {role.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{formatDate(role.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{formatDate(role.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {role.description && (
            <div className="mt-6">
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground">{role.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteRoleDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        roleName={role.role_name}
      />
    </div>
  );
};

export default RoleDetail;
