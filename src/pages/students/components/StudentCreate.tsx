/**
 * StudentCreate Page
 * ===================
 * Create new student page with full onboarding (auth user + student record)
 * Route: /students/create
 * 
 * NOTE: This is a legacy page. Prefer using StudentFormDialog from StudentsList.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, RefreshCw, Key, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { StudentForm } from "./StudentForm";
import { StudentFormData } from "./types";
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
  is_current: boolean;
}

export function StudentCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canCreate } = useModulePermissions("students");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Login credentials state
  const [createLoginCredentials, setCreateLoginCredentials] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState(() => generatePassword());
  const [showPassword, setShowPassword] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);

  const { data: classes } = useSupabaseTable<ClassDB>(
    `classes_${INDEX_TOKEN}`,
    {
      orderBy: { column: "class_order", ascending: true },
    }
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

        setCreatedCredentials({ email, password: loginPassword });
        
        toast({
          title: "Student Created Successfully",
          description: `${data.first_name} ${data.last_name} can now log in.`,
        });
      }
    } catch (error: any) {
      console.error('Student creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canCreate) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to create students.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show credentials after successful creation
  if (createdCredentials) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/students")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold">Student Created Successfully</h1>
              <p className="text-muted-foreground">Share the credentials below with the student</p>
            </div>
          </div>
        </div>

        <Card className="max-w-md border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="h-4 w-4" />
              Login Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm text-muted-foreground">Email</Label>
              <div className="font-mono text-sm bg-white p-2 rounded border">{createdCredentials.email}</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Password</Label>
              <div className="font-mono text-sm bg-white p-2 rounded border">{createdCredentials.password}</div>
            </div>
          </CardContent>
        </Card>
        
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please copy these credentials now. The password cannot be viewed again.</AlertDescription>
        </Alert>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            navigator.clipboard.writeText(`Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`);
            toast({ title: "Copied to clipboard" });
          }}>Copy Credentials</Button>
          <Button onClick={() => navigate("/students")}>Back to Students</Button>
          <Button variant="outline" onClick={() => {
            setCreatedCredentials(null);
            setLoginEmail("");
            setLoginPassword(generatePassword());
          }}>Add Another</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/students")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Student</h1>
          <p className="text-muted-foreground">Fill in the details to register a new student</p>
        </div>
      </div>

      {/* Login Credentials Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="h-4 w-4" />
              Login Credentials
            </CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox id="createCredentials" checked={createLoginCredentials} 
                onCheckedChange={(checked) => setCreateLoginCredentials(checked as boolean)} />
              <Label htmlFor="createCredentials" className="text-sm">Create login account</Label>
            </div>
          </div>
          <CardDescription>These credentials will allow the student to log into the portal.</CardDescription>
        </CardHeader>
        {createLoginCredentials && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="loginEmail">Login Email *</Label>
                <Input id="loginEmail" type="email" placeholder="student@example.com" 
                  value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                <p className="text-xs text-muted-foreground">Leave empty to use the contact email from below.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="loginPassword">Password *</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input id="loginPassword" type={showPassword ? "text" : "password"} 
                      value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="pr-10" />
                    <Button type="button" variant="ghost" size="icon" 
                      className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button type="button" variant="outline" size="icon" onClick={handleGeneratePassword} title="Generate new password">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <StudentForm
        onSubmit={handleSubmit}
        onCancel={() => navigate("/students")}
        isSubmitting={isSubmitting}
        classes={classes || []}
        sections={sections || []}
        academicYears={academicYears || []}
      />
    </div>
  );
}
