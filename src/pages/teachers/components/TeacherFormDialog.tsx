/**
 * TeacherFormDialog Component
 * ============================
 * Modal dialog wrapper for TeacherForm component
 * Used for inline create/edit operations (consolidation - replaces separate routes)
 * 
 * ONBOARDING FLOW (Create Mode):
 * 1. Admin fills in teacher details + login credentials (email/password)
 * 2. Edge Function creates: auth user → users table → user_roles → teachers table
 * 3. Teacher can now log in with their credentials to access teacher dashboard
 * 
 * Route Consolidation: This component replaces:
 * - /teachers/create (handled via mode="create")
 * - /teachers/:id/edit (handled via mode="edit" with teacherId)
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, RefreshCw, Key, AlertCircle, CheckCircle2 } from "lucide-react";
import TeacherForm from "./TeacherForm";
import { TeacherDB, TeacherFormData } from "./types";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { onboardUser, generatePassword, ROLE_CODES } from "@/services/userOnboardingService";

interface TeacherFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  teacherId?: string;
  initialData?: TeacherDB;
  onSuccess?: () => void;
}

export function TeacherFormDialog({
  open,
  onOpenChange,
  mode,
  teacherId,
  initialData,
  onSuccess,
}: TeacherFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Login credentials state (only for create mode)
  const [createLoginCredentials, setCreateLoginCredentials] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState(() => generatePassword());
  const [showPassword, setShowPassword] = useState(false);
  
  const { updateMutation } = useSupabaseTable<TeacherFormData>(
    TABLES.TEACHERS
  );

  const handleGeneratePassword = () => {
    setLoginPassword(generatePassword());
  };

  const handleSubmit = async (data: TeacherFormData) => {
    setIsSubmitting(true);
    
    try {
      if (mode === "create") {
        // Validate login credentials if creating them
        if (createLoginCredentials) {
          const email = loginEmail || data.email;
          if (!email) {
            toast({
              title: "Email Required",
              description: "Please provide an email address for login credentials.",
              variant: "destructive",
            });
            setIsSubmitting(false);
            return;
          }
          
          if (!loginPassword || loginPassword.length < 6) {
            toast({
              title: "Password Required",
              description: "Password must be at least 6 characters.",
              variant: "destructive",
            });
            setIsSubmitting(false);
            return;
          }

          const fullName = `${data.first_name} ${data.last_name}`.trim();

          // Use onboarding service to create auth user + teacher record
          const result = await onboardUser({
            email: email,
            password: loginPassword,
            full_name: fullName,
            phone: data.phone || undefined,
            role_code: ROLE_CODES.teacher,
            entity_type: 'teacher',
            entity_data: {
              employee_code: data.employee_code,
              first_name: data.first_name,
              middle_name: data.middle_name || null,
              last_name: data.last_name,
              date_of_birth: data.date_of_birth || null,
              gender: data.gender || null,
              blood_group: data.blood_group || null,
              email: email,
              phone: data.phone,
              address_line1: data.address_line1 || null,
              city: data.city || null,
              state: data.state || null,
              pincode: data.pincode || null,
              qualification: data.qualification || null,
              specialization: data.specialization || null,
              experience_years: data.experience_years || null,
              joining_date: data.joining_date,
              employment_type: data.employment_type || null,
              designation: data.designation || null,
              department: data.department || null,
              status: data.status || 'active',
            },
          });

          if (!result.success) {
            throw new Error(result.error || 'Failed to create teacher');
          }

          // Show success toast with credentials info
          toast({
            title: "Teacher Created Successfully",
            description: `${fullName} can now log in.\nEmail: ${email}\nPassword: ${loginPassword}`,
            duration: 10000,
          });
          
          // Copy credentials to clipboard automatically
          navigator.clipboard.writeText(
            `Email: ${email}\nPassword: ${loginPassword}`
          ).then(() => {
            toast({
              title: "Credentials Copied",
              description: "Login credentials have been copied to clipboard.",
            });
          }).catch(() => {});
        }
      } else if (mode === "edit" && teacherId) {
        // Edit mode - just update the teacher record
        await updateMutation.mutateAsync({ id: teacherId, updates: data });
        toast({
          title: "Success",
          description: "Teacher updated successfully",
        });
      }
      
      onSuccess?.();
      onOpenChange(false);
      
      // Reset form state
      setLoginEmail("");
      setLoginPassword(generatePassword());
      setShowPassword(false);
    } catch (error: any) {
      console.error('Teacher creation error:', error);
      toast({
        title: "Error",
        description: error.message || (mode === "create" ? "Failed to create teacher" : "Failed to update teacher"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {mode === "create" ? "Add New Teacher" : "Edit Teacher"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Fill in the details to add a new teacher. Login credentials will be created for dashboard access."
              : "Update the teacher information."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-100px)] px-6 pb-6">
          {/* Login Credentials Section - Only for Create Mode */}
          {mode === "create" && (
            <Card className="mb-6 border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Login Credentials
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="createCredentials"
                      checked={createLoginCredentials}
                      onCheckedChange={(checked) => setCreateLoginCredentials(checked as boolean)}
                    />
                    <Label htmlFor="createCredentials" className="text-sm">
                      Create login account
                    </Label>
                  </div>
                </div>
                <CardDescription>
                  These credentials will allow the teacher to log into the teacher dashboard.
                </CardDescription>
              </CardHeader>
              {createLoginCredentials && (
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="loginEmail">Login Email *</Label>
                      <Input
                        id="loginEmail"
                        type="email"
                        placeholder="teacher@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave empty to use the contact email from the form below.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loginPassword">Password *</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id="loginPassword"
                            type={showPassword ? "text" : "password"}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleGeneratePassword}
                          title="Generate new password"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )}
          
          <TeacherForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default TeacherFormDialog;
