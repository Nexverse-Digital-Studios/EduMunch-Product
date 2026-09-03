/**
 * UserEdit Page
 * ==============
 * Route: /users/:id/edit
 * Permission: users.update
 *
 * Form for editing an existing user
 */

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, UserCog, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser, useRoles, useUpdateUser } from "@/hooks/useSupabaseQuery";
import { useToast } from "@/hooks/use-toast";
import { UserForm, UserFormData } from "./components";

const UserEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user and roles data
  const { data: user, isLoading, error } = useUser(id);
  const { data: roles } = useRoles();
  const updateUserMutation = useUpdateUser();

  // Handle update user
  const handleUpdateUser = async (formData: UserFormData) => {
    if (!id) return;

    if (!formData.full_name) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await updateUserMutation.mutateAsync({
        id,
        data: {
          full_name: formData.full_name,
          phone: formData.phone || null,
          primary_role_id: formData.role_id || null,
        },
      });

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      // Navigate back to user detail
      navigate(`/users/${id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
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

  if (error || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading user</p>
          <Button onClick={() => navigate("/users")}>Go Back</Button>
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
          onClick={() => navigate(`/users/${id}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <UserCog className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Edit User</h1>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Update User Details</CardTitle>
          <CardDescription>
            Modify the details below to update this user's information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm
            initialData={{
              full_name: user.full_name,
              email: user.email,
              phone: user.phone || "",
              role_id: user.primary_role_id || "",
            }}
            roles={roles}
            onSubmit={handleUpdateUser}
            onCancel={() => navigate(`/users/${id}`)}
            isEdit={true}
            isLoading={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserEdit;
