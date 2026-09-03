/**
 * UserCreate Page
 * =================
 * Route: /users/create
 * Permission: users.create
 *
 * Form for creating a new user
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRoles } from "@/hooks/useSupabaseQuery";
import { supabase, TABLES, INDEX_TOKEN } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { UserForm, UserFormData } from "./components";

const UserCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch roles for the form
  const { data: roles } = useRoles();

  // Handle create user
  const handleCreateUser = async (formData: UserFormData) => {
    if (!formData.full_name || !formData.email || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!supabase) {
      toast({
        title: "Error",
        description: "Database not configured",
        variant: "destructive",
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
      if (!authData.user) throw new Error("Failed to create user");

      // 2. Get admin role if no role selected
      let roleId = formData.role_id;
      if (!roleId && roles && roles.length > 0) {
        const adminRole = roles.find((r) => r.role_code === "ADMIN");
        roleId = adminRole?.id || roles[0].id;
      }

      // 3. Create user profile
      const { data: profileData, error: profileError } = await supabase
        .from(TABLES.USERS)
        .insert({
          auth_user_id: authData.user.id,
          email: formData.email,
          full_name: formData.full_name,
          phone: formData.phone || null,
          primary_role_id: roleId || null,
          index_token: INDEX_TOKEN,
          is_active: true,
        })
        .select("id")
        .single();

      if (profileError) throw profileError;

      // 4. Create user_roles entry (required for permissions to work)
      if (roleId && profileData?.id) {
        const { error: userRoleError } = await supabase
          .from(TABLES.USER_ROLES)
          .insert({
            user_id: profileData.id,
            role_id: roleId,
            is_primary: true,
          });

        if (userRoleError) {
          console.error("Failed to create user_roles entry:", userRoleError);
        }
      }

      // 5. IMPORTANT: Sign out the newly created user to keep admin logged in
      // Supabase automatically logs in new users, so we need to sign them out
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.warn(
          "Warning: Could not sign out newly created user:",
          signOutError
        );
      }

      toast({
        title: "Success",
        description: "User created successfully",
      });

      // Navigate back to users list
      navigate("/users");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
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
        <Button variant="ghost" size="icon" onClick={() => navigate("/users")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <UserPlus className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Create User</h1>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>
            Fill in the details below to create a new user account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm
            roles={roles}
            onSubmit={handleCreateUser}
            onCancel={() => navigate("/users")}
            isLoading={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserCreate;
