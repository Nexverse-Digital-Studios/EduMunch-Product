/**
 * EmployeeFormDialog Component
 * =============================
 * Modal dialog wrapper for EmployeeForm component
 * Used for inline create/edit operations (consolidation - replaces separate routes)
 *
 * ONBOARDING FLOW (Create Mode):
 * 1. Admin fills in employee details + login credentials (email/password)
 * 2. Edge Function creates: auth user → users table → user_roles → employees table
 * 3. Employee can now log in with their credentials based on their role
 *
 * Route Consolidation: This component replaces:
 * - /employees/create (handled via mode="create")
 * - /employees/:id/edit (handled via mode="edit" with employeeId)
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
import { EmployeeForm, EmployeeFormData } from "./EmployeeForm";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { onboardUser, generatePassword, getEmployeeRoleCode } from "@/services/userOnboardingService";

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  employeeId?: string;
  initialData?: Partial<EmployeeFormData>;
  onSuccess?: () => void;
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  mode,
  employeeId,
  initialData,
  onSuccess,
}: EmployeeFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Login credentials state (only for create mode)
  const [createLoginCredentials, setCreateLoginCredentials] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState(() => generatePassword());
  const [showPassword, setShowPassword] = useState(false);
  
  // Using employees table for employee updates
  const { updateMutation } = useSupabaseTable<EmployeeFormData>(
    TABLES.EMPLOYEES
  );

  const handleGeneratePassword = () => {
    setLoginPassword(generatePassword());
  };

  const handleSubmit = async (data: EmployeeFormData) => {
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
          const roleCode = getEmployeeRoleCode(data.designation);

          // Use onboarding service to create auth user + employee record
          const result = await onboardUser({
            email: email,
            password: loginPassword,
            full_name: fullName,
            phone: data.phone || undefined,
            role_code: roleCode,
            entity_type: 'employee',
            entity_data: {
              employee_code: data.employee_code,
              first_name: data.first_name,
              middle_name: data.middle_name || null,
              last_name: data.last_name,
              email: email,
              phone: data.phone,
              department: data.department || null,
              designation: data.designation,
              joining_date: data.joining_date,
              employment_type: data.employment_type || null,
              status: data.status || 'active',
            },
          });

          if (!result.success) {
            throw new Error(result.error || 'Failed to create employee');
          }

          // Show success toast with credentials info
          toast({
            title: "Employee Created Successfully",
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
      } else if (mode === "edit" && employeeId) {
        // Edit mode - just update the employee record
        await updateMutation.mutateAsync({ id: employeeId, updates: data });
        toast({
          title: "Success",
          description: "Employee updated successfully",
        });
      }
      
      onSuccess?.();
      onOpenChange(false);
      
      // Reset form state
      setLoginEmail("");
      setLoginPassword(generatePassword());
      setShowPassword(false);
    } catch (error: any) {
      console.error('Employee creation error:', error);
      toast({
        title: "Error",
        description: error.message || (mode === "create" ? "Failed to create employee" : "Failed to update employee"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setLoginEmail("");
    setLoginPassword(generatePassword());
    setShowPassword(false);
    onOpenChange(false);
  };

  const isLoading = isSubmitting || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {mode === "create" ? "Add New Employee" : "Edit Employee"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Fill in the details to add a new staff member. Login credentials will be created for system access."
              : "Update the employee information."}
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
                  These credentials will allow the employee to log into the system based on their role.
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
                        placeholder="employee@example.com"
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
          
          <EmployeeForm
            defaultValues={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
            submitLabel={mode === "create" ? "Add Employee" : "Save Changes"}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default EmployeeFormDialog;
