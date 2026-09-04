/**
 * StudentFormDialog Component
 * ============================
 * Modal dialog wrapper for StudentForm component
 * Used for inline create/edit operations (consolidation - replaces separate routes)
 * 
 * ONBOARDING FLOW (Create Mode):
 * 1. Admin fills in student details + login credentials (email/password)
 * 2. Edge Function creates: auth user → users table → user_roles → students table
 * 3. Student can now log in with their credentials
 * 
 * Route Consolidation: This component replaces:
 * - /students/create (handled via mode="create")
 * - /students/:id/edit (handled via mode="edit" with studentId)
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
import { StudentForm } from "./StudentForm";
import { StudentFormData } from "./types";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useToast } from "@/hooks/use-toast";
import { onboardUser, generatePassword, ROLE_CODES } from "@/services/userOnboardingService";

const INDEX_TOKEN = "1emaet";

interface ClassDB {
  id: string;
  class_name: string;
}

interface SectionDB {
  id: string;
  section_name: string;
  class_id: string;
}

interface AcademicYearDB {
  id: string;
  year_name: string;
  is_current?: boolean;
}

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  studentId?: string;
  initialData?: Partial<StudentFormData>;
  onSuccess?: () => void;
}

export function StudentFormDialog({
  open,
  onOpenChange,
  mode,
  studentId,
  initialData,
  onSuccess,
}: StudentFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Login credentials state (only for create mode)
  const [createLoginCredentials, setCreateLoginCredentials] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState(() => generatePassword());
  const [showPassword, setShowPassword] = useState(false);
  
  const { updateMutation } = useSupabaseTable<StudentFormData>(
    `students_${INDEX_TOKEN}`
  );
  
  // Fetch dropdown data
  const { data: classes } = useSupabaseTable<ClassDB>(
    `classes_${INDEX_TOKEN}`,
    { orderBy: { column: "class_order", ascending: true } }
  );
  
  const { data: sections } = useSupabaseTable<SectionDB>(
    `sections_${INDEX_TOKEN}`
  );
  
  const { data: academicYears } = useSupabaseTable<AcademicYearDB>(
    `academic_years_${INDEX_TOKEN}`,
    { orderBy: { column: "year_name", ascending: false } }
  );

  const handleGeneratePassword = () => {
    setLoginPassword(generatePassword());
  };

  const handleSubmit = async (data: StudentFormData) => {
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

          // Use onboarding service to create auth user + student record
          const result = await onboardUser({
            email: email,
            password: loginPassword,
            full_name: `${data.first_name} ${data.last_name}`.trim(),
            phone: data.phone || undefined,
            role_code: ROLE_CODES.student,
            entity_type: 'student',
            entity_data: {
              admission_number: data.admission_number,
              roll_number: data.roll_number || null,
              class_id: data.class_id,
              section_id: data.section_id,
              academic_year_id: data.academic_year_id,
              first_name: data.first_name,
              middle_name: data.middle_name || null,
              last_name: data.last_name,
              date_of_birth: data.date_of_birth,
              gender: data.gender,
              blood_group: data.blood_group || null,
              aadhar_number: data.aadhar_number || null,
              nationality: data.nationality || 'Indian',
              religion: data.religion || null,
              caste: data.caste || null,
              category: data.category || null,
              email: email,
              phone: data.phone || null,
              address_line1: data.address_line1 || null,
              address_line2: data.address_line2 || null,
              city: data.city || null,
              state: data.state || null,
              pincode: data.pincode || null,
              country: data.country || 'India',
              previous_school: data.previous_school || null,
              admission_date: data.admission_date,
              emergency_contact_name: data.emergency_contact_name || null,
              emergency_contact_phone: data.emergency_contact_phone || null,
              emergency_contact_relation: data.emergency_contact_relation || null,
              status: 'active',
            },
          });

          if (!result.success) {
            throw new Error(result.error || 'Failed to create student');
          }

          // Show success toast with credentials info
          toast({
            title: "Student Created Successfully",
            description: `${data.first_name} ${data.last_name} can now log in.\nEmail: ${email}\nPassword: ${loginPassword}`,
            duration: 10000, // Show for 10 seconds so admin can note credentials
          });
          
          // Copy credentials to clipboard automatically
          navigator.clipboard.writeText(
            `Email: ${email}\nPassword: ${loginPassword}`
          ).then(() => {
            toast({
              title: "Credentials Copied",
              description: "Login credentials have been copied to clipboard.",
            });
          }).catch(() => {
            // Clipboard failed, user needs to note from toast
          });
        }
      } else if (mode === "edit" && studentId) {
        // Edit mode - just update the student record
        await updateMutation.mutateAsync({ id: studentId, updates: data });
        toast({
          title: "Success",
          description: "Student updated successfully",
        });
      }
      
      onSuccess?.();
      onOpenChange(false);
      
      // Reset form state
      setLoginEmail("");
      setLoginPassword(generatePassword());
      setShowPassword(false);
    } catch (error: any) {
      console.error('Student creation error:', error);
      toast({
        title: "Error",
        description: error.message || (mode === "create" ? "Failed to create student" : "Failed to update student"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset state
    setLoginEmail("");
    setLoginPassword(generatePassword());
    setShowPassword(false);
    onOpenChange(false);
  };

  const isLoading = isSubmitting || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {mode === "create" ? "Add New Student" : "Edit Student"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Fill in the details to add a new student. Login credentials will be created for portal access."
              : "Update the student information."}
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
                  These credentials will allow the student to log into the portal.
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
                        placeholder="student@example.com"
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
          
          <StudentForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isLoading}
            classes={classes || []}
            sections={sections || []}
            academicYears={academicYears || []}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default StudentFormDialog;
