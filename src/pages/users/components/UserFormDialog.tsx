/**
 * UserFormDialog Component
 * =========================
 * Modal dialog for creating/editing users
 * Used in UsersList page for inline create/edit without navigation
 */

import { useState, useEffect } from "react";
import { UserPlus, Pencil, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRoles } from "@/hooks/useSupabaseQuery";
import { supabase, TABLES, INDEX_TOKEN } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { UserForm, UserFormData } from "./UserForm";
import type { User } from "@/hooks/useSupabaseQuery";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  userId?: string;
  user?: User | null; // Legacy: If provided, edit mode; otherwise create mode
  initialData?: Partial<UserFormData>;
  onSuccess?: () => void;
}

export const UserFormDialog = ({
  open,
  onOpenChange,
  mode = "create",
  userId,
  user,
  initialData: providedInitialData,
  onSuccess,
}: UserFormDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch roles for the form
  const { data: roles } = useRoles();

  // Support both old (user prop) and new (mode/userId/initialData) interfaces
  const isEdit = mode === "edit" || !!user;
  const editUserId = userId || user?.id;
  const editUserData =
    providedInitialData ||
    (user
      ? {
          full_name: user.full_name,
          email: user.email || "",
          phone: user.phone || "",
          role_id: user.primary_role_id || "",
        }
      : undefined);

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
          // Don't throw - user is created, role assignment is secondary
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

      onOpenChange(false);
      onSuccess?.();
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

  // Handle edit user
  const handleEditUser = async (formData: UserFormData) => {
    if (!editUserId) return;

    if (!formData.full_name) {
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
      const { error } = await supabase
        .from(TABLES.USERS)
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          primary_role_id: formData.role_id || null,
        })
        .eq("id", editUserId);

      if (error) throw error;

      // Sync user_roles table if role changed
      if (formData.role_id && formData.role_id !== user?.primary_role_id) {
        // Remove old primary role entry
        await supabase
          .from(TABLES.USER_ROLES)
          .delete()
          .eq("user_id", editUserId)
          .eq("is_primary", true);

        // Add new primary role entry
        await supabase.from(TABLES.USER_ROLES).insert({
          user_id: editUserId,
          role_id: formData.role_id,
          is_primary: true,
        });
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      onOpenChange(false);
      onSuccess?.();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEdit ? (
              <>
                <Pencil className="h-5 w-5" />
                Edit User
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Create New User
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the user details below."
              : "Fill in the details below to create a new user account."}
          </DialogDescription>
        </DialogHeader>
        <UserForm
          initialData={editUserData}
          roles={roles}
          onSubmit={isEdit ? handleEditUser : handleCreateUser}
          onCancel={() => onOpenChange(false)}
          isEdit={isEdit}
          isLoading={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;
