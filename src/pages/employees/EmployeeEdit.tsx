/**
 * EmployeeEdit Page
 * ==================
 * Edit existing employee page
 * Route: /employees/:id/edit
 */

import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Loader2, User } from "lucide-react";
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

export default function EmployeeEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch employee data
  const {
    data: teachers,
    isLoading,
    updateMutation,
  } = useSupabaseTable<EmployeeDB>(TABLES.TEACHERS, { filters: { id } });

  const employee = teachers?.[0];

  const handleSubmit = (data: EmployeeFormData) => {
    if (!id) return;

    const updates: Partial<EmployeeDB> = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email || undefined,
      phone: data.phone,
      employee_code: data.employee_code,
      department: data.department || undefined,
      designation: data.designation || undefined,
      status: data.status,
    };

    updateMutation.mutate(
      { id, updates },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Employee updated successfully",
          });
          navigate(`/employees/${id}`);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to update employee",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading employee details...</span>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/employees")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Employee Not Found</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">
              The requested employee could not be found
            </p>
            <Button onClick={() => navigate("/employees")} className="mt-6">
              Back to Employees
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare default values for the form
  const defaultValues: Partial<EmployeeFormData> = {
    first_name: employee.first_name,
    last_name: employee.last_name,
    email: employee.email || "",
    phone: employee.phone,
    employee_code: employee.employee_code,
    department: employee.department || "",
    designation: employee.designation || "",
    status: employee.status,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/employees/${id}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Edit className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Edit Employee
            </h1>
            <p className="text-muted-foreground">
              Update details for {employee.first_name} {employee.last_name}
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
          <CardDescription>
            Update the employee details below. Required fields are marked with
            an asterisk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeForm
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/employees/${id}`)}
            isLoading={updateMutation.isPending}
            defaultValues={defaultValues}
            submitLabel="Save Changes"
          />
        </CardContent>
      </Card>
    </div>
  );
}
