/**
 * EmployeeCreate Page
 * ====================
 * Create new employee page
 * Route: /employees/create
 */

import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  EmployeeForm,
  type EmployeeDB,
  type EmployeeFormData,
} from "./components";

export default function EmployeeCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { createMutation } = useSupabaseTable<EmployeeDB>(TABLES.TEACHERS);

  const handleSubmit = (data: EmployeeFormData) => {
    const payload: Partial<EmployeeDB> = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email || undefined,
      phone: data.phone,
      employee_code: data.employee_code,
      department: data.department || undefined,
      designation: data.designation || undefined,
      status: data.status,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Employee created successfully",
        });
        navigate("/employees");
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create employee",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/employees")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <UserPlus className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Onboard New Employee
            </h1>
            <p className="text-muted-foreground">
              Add a new staff member to your institution
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
          <CardDescription>
            Enter the details for the new employee. Required fields are marked
            with an asterisk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeForm
            onSubmit={handleSubmit}
            onCancel={() => navigate("/employees")}
            isLoading={createMutation.isPending}
            submitLabel="Create Employee"
          />
        </CardContent>
      </Card>
    </div>
  );
}
