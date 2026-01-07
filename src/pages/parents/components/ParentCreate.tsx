/**
 * ParentCreate Component
 * ======================
 * Page for creating a new parent/guardian record with full onboarding
 * 
 * NOTE: This is a legacy page. Prefer using ParentFormDialog from ParentsList.
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, RefreshCw, Key, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

import { ParentForm } from "./ParentForm";
import { ParentFormData } from "./types";
import { onboardUser, generatePassword, ROLE_CODES } from "@/services/userOnboardingService";

export function ParentCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Login credentials state
  const [createLoginCredentials, setCreateLoginCredentials] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState(() => generatePassword());
  const [showPassword, setShowPassword] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);

  const handleGeneratePassword = () => {
    setLoginPassword(generatePassword());
  };

  const handleSubmit = async (data: ParentFormData) => {
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

        setCreatedCredentials({ email, password: loginPassword });
        
        toast({
          title: "Parent Created Successfully",
          description: `${data.full_name} can now log in.`,
        });
      }
    } catch (error: any) {
      console.error('Parent creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create parent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show credentials after successful creation
  if (createdCredentials) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/parents")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold">Parent Created Successfully</h1>
              <p className="text-muted-foreground">Share the credentials below with the parent</p>
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
          <Button onClick={() => navigate("/parents")}>Back to Parents</Button>
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/parents">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add New Parent</h1>
          <p className="text-muted-foreground">
            Create a new parent or guardian record
          </p>
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
          <CardDescription>These credentials will allow the parent to log into the portal.</CardDescription>
        </CardHeader>
        {createLoginCredentials && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="loginEmail">Login Email *</Label>
                <Input id="loginEmail" type="email" placeholder="parent@example.com" 
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

      {/* Form */}
      <ParentForm
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitLabel="Create Parent"
      />
    </div>
  );
}
