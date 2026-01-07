/**
 * ParentFormDialog Component
 * ===========================
 * Modal dialog wrapper for ParentForm component
 * Used for inline create/edit operations (consolidation - replaces separate routes)
 * 
 * ONBOARDING FLOW (Create Mode):
 * 1. Admin fills in parent details + login credentials (email/password)
 * 2. Admin selects which student this parent is linked to
 * 3. System creates: auth user → users table → user_roles → parents table → student_parent_relations
 * 4. Parent can now log in with their credentials to access parent portal
 * 
 * Route Consolidation: This component replaces:
 * - /parents/create (handled via mode="create")
 * - /parents/:id/edit (handled via mode="edit" with parentId)
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, RefreshCw, Key, Users } from "lucide-react";
import { ParentForm } from "./ParentForm";
import { ParentFormData } from "./types";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useToast } from "@/hooks/use-toast";
import { onboardUser, generatePassword, ROLE_CODES } from "@/services/userOnboardingService";
import { supabase } from "@/lib/supabase";

const INDEX_TOKEN = "1emaet";

// Student type for selection dropdown
interface StudentOption {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  classes_1emaet?: { class_name: string } | null;
  sections_1emaet?: { section_name: string } | null;
}

interface ParentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  parentId?: string;
  initialData?: Partial<ParentFormData>;
  onSuccess?: () => void;
  preSelectedStudentId?: string; // If coming from student page
}

export function ParentFormDialog({
  open,
  onOpenChange,
  mode,
  parentId,
  initialData,
  onSuccess,
  preSelectedStudentId,
}: ParentFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Login credentials state (only for create mode)
  const [createLoginCredentials, setCreateLoginCredentials] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState(() => generatePassword());
  const [showPassword, setShowPassword] = useState(false);
  
  // Student linking state
  const [selectedStudentId, setSelectedStudentId] = useState<string>(preSelectedStudentId || "");
  const [isPrimaryContact, setIsPrimaryContact] = useState(true);
  
  // Fetch students for dropdown
  const { data: students } = useSupabaseTable<StudentOption>(
    `students_${INDEX_TOKEN}`,
    {
      select: "id, first_name, last_name, admission_number, classes_1emaet(class_name), sections_1emaet(section_name)",
      orderBy: { column: "first_name", ascending: true },
    }
  );
  
  const { updateMutation } = useSupabaseTable<ParentFormData>(
    `parents_${INDEX_TOKEN}`
  );

  const handleGeneratePassword = () => {
    setLoginPassword(generatePassword());
  };

  const handleSubmit = async (data: ParentFormData) => {
    setIsSubmitting(true);
    
    try {
      if (mode === "create") {
        // Validate student selection
        if (!selectedStudentId) {
          toast({
            title: "Student Required",
            description: "Please select a student to link this parent to.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

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

          // Use onboarding service to create auth user + parent record
          const result = await onboardUser({
            email: email,
            password: loginPassword,
            full_name: data.full_name,
            phone: data.phone || undefined,
            role_code: ROLE_CODES.parent,
            entity_type: 'parent',
            entity_data: {
              full_name: data.full_name,
              relationship: data.relationship,
              email: email,
              phone: data.phone,
              alternate_phone: data.alternate_phone || null,
              occupation: data.occupation || null,
              annual_income: data.annual_income ? parseFloat(data.annual_income) : null,
              address_line1: data.address_line1 || null,
              address_line2: data.address_line2 || null,
              city: data.city || null,
              state: data.state || null,
              pincode: data.pincode || null,
              country: data.country || 'India',
              aadhar_number: data.aadhar_number || null,
            },
          });

          if (!result.success) {
            throw new Error(result.error || 'Failed to create parent');
          }

          // Create student-parent relationship
          if (result.entity_id && selectedStudentId) {
            const { error: relationError } = await supabase
              .from(`student_parent_relations_${INDEX_TOKEN}`)
              .upsert({
                student_id: selectedStudentId,
                parent_id: result.entity_id,
                is_primary_contact: isPrimaryContact,
                can_pickup: true,
              }, {
                onConflict: 'student_id,parent_id',
                ignoreDuplicates: true,
              });

            if (relationError) {
              console.error('Failed to create student-parent relation:', relationError);
              // Don't fail the whole operation, just warn
              toast({
                title: "Warning",
                description: "Parent created but could not be linked to student. Please link manually.",
                variant: "destructive",
              });
            }
          }

          // Get student name for the message
          const linkedStudent = students?.find(s => s.id === selectedStudentId);
          const studentName = linkedStudent ? `${linkedStudent.first_name} ${linkedStudent.last_name}` : 'the selected student';

          // Show success toast with credentials info
          toast({
            title: "Parent Created Successfully",
            description: `${data.full_name} linked to ${studentName}.\nEmail: ${email}\nPassword: ${loginPassword}`,
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
      } else if (mode === "edit" && parentId) {
        // Edit mode - just update the parent record
        await updateMutation.mutateAsync({ id: parentId, updates: data });
        toast({
          title: "Success",
          description: "Parent updated successfully",
        });
      }
      
      onSuccess?.();
      onOpenChange(false);
      
      // Reset form state
      setLoginEmail("");
      setLoginPassword(generatePassword());
      setShowPassword(false);
      setSelectedStudentId("");
      setIsPrimaryContact(true);
    } catch (error: any) {
      console.error('Parent creation error:', error);
      toast({
        title: "Error",
        description: error.message || (mode === "create" ? "Failed to create parent" : "Failed to update parent"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {mode === "create" ? "Add New Parent" : "Edit Parent"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Fill in the details to add a new parent/guardian. Login credentials will be created for portal access."
              : "Update the parent/guardian information."}
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
                  These credentials will allow the parent to log into the parent portal.
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
                        placeholder="parent@example.com"
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

          {/* Student Selection Section - Only for Create Mode */}
          {mode === "create" && (
            <Card className="mb-6 border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Link to Student *
                </CardTitle>
                <CardDescription>
                  Select which student this parent/guardian is linked to.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="studentSelect">Select Student *</Label>
                    <Select
                      value={selectedStudentId}
                      onValueChange={setSelectedStudentId}
                    >
                      <SelectTrigger id="studentSelect">
                        <SelectValue placeholder="Choose a student..." />
                      </SelectTrigger>
                      <SelectContent>
                        {students?.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.first_name} {student.last_name}
                            {student.admission_number && ` (${student.admission_number})`}
                            {student.classes_1emaet?.class_name && ` - ${student.classes_1emaet.class_name}`}
                            {student.sections_1emaet?.section_name && ` ${student.sections_1emaet.section_name}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship Options</Label>
                    <div className="flex items-center gap-2 pt-2">
                      <Checkbox
                        id="isPrimaryContact"
                        checked={isPrimaryContact}
                        onCheckedChange={(checked) => setIsPrimaryContact(checked as boolean)}
                      />
                      <Label htmlFor="isPrimaryContact" className="text-sm font-normal">
                        Primary contact for this student
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Primary contacts receive all important notifications about the student.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <ParentForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel={mode === "create" ? "Add Parent" : "Save Changes"}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default ParentFormDialog;
