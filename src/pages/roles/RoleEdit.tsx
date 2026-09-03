/**
 * RoleEdit Page
 * ==============
 * Route: /roles/:id/edit
 * Permission: roles.update
 *
 * Form for editing an existing role
 */

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRole, useUpdateRole } from "@/hooks/useSupabaseQuery";
import { useToast } from "@/hooks/use-toast";
import { RoleForm, RoleFormData } from "./components";

const RoleEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch role data
  const { data: role, isLoading, error } = useRole(id);
  const updateRoleMutation = useUpdateRole();

  // Handle update role
  const handleUpdateRole = async (formData: RoleFormData) => {
    if (!id) return;

    if (!formData.role_name) {
      toast({
        title: "Validation Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    // Prevent editing system roles
    if (role?.is_system_role) {
      toast({
        title: "Cannot Edit",
        description: "System roles cannot be modified",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await updateRoleMutation.mutateAsync({
        id,
        data: {
          role_name: formData.role_name,
          description: formData.description || null,
        },
      });

      toast({
        title: "Success",
        description: "Role updated successfully",
      });

      // Navigate back to role detail
      navigate(`/roles/${id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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

  // Redirect if trying to edit a system role
  if (role.is_system_role) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">System roles cannot be edited</p>
          <Button onClick={() => navigate(`/roles/${id}`)}>View Role</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/roles/${id}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Edit Role</h1>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Update Role Details</CardTitle>
          <CardDescription>
            Modify the details below to update this role's information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoleForm
            initialData={{
              role_name: role.role_name,
              role_code: role.role_code,
              description: role.description || "",
              active_modules: [],
            }}
            onSubmit={handleUpdateRole}
            onCancel={() => navigate(`/roles/${id}`)}
            isEdit={true}
            isLoading={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleEdit;
