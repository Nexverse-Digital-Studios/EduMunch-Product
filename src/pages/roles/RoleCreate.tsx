/**
 * RoleCreate Page
 * =================
 * Route: /roles/create
 * Permission: roles.create
 *
 * Form for creating a new role
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCreateRole } from "@/hooks/useSupabaseQuery";
import { useToast } from "@/hooks/use-toast";
import { RoleForm, RoleFormData } from "./components";

const RoleCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createRoleMutation = useCreateRole();

  // Handle create role
  const handleCreateRole = async (formData: RoleFormData) => {
    if (!formData.role_name || !formData.role_code) {
      toast({
        title: "Validation Error",
        description: "Role name and code are required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createRoleMutation.mutateAsync({
        role_name: formData.role_name,
        role_code: formData.role_code.toUpperCase().replace(/\s+/g, "_"),
        description: formData.description || undefined,
        is_system_role: false,
        is_active: true,
      });

      toast({
        title: "Success",
        description: "Role created successfully",
      });

      // Navigate back to roles list
      navigate("/roles");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create role",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/roles")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <ShieldPlus className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Create Role</h1>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Role Details</CardTitle>
          <CardDescription>
            Fill in the details below to create a new role with module
            permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoleForm
            onSubmit={handleCreateRole}
            onCancel={() => navigate("/roles")}
            isLoading={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleCreate;
