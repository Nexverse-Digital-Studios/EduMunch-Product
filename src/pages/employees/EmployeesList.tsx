/**
 * EmployeesList Page
 * ===================
 * Main employees listing page with search, filters, and CRUD operations
 * Route: /employees
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import {
  EmployeeTable,
  EmployeeCard,
  DeleteEmployeeDialog,
  type EmployeeDB,
  type EmployeeDisplay,
} from "./components";

// Generate avatar color based on name
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-blue-500",
    "bg-yellow-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-cyan-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export default function EmployeesList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [designationFilter, setDesignationFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  // Permission checks
  const { canCreate, canUpdate, canDelete } = useModulePermissions("employees");

  // Fetch employees data
  const {
    data: teachers,
    isLoading,
    deleteMutation,
  } = useSupabaseTable<EmployeeDB>(TABLES.TEACHERS, {
    orderBy: { column: "first_name", ascending: true },
  });

  // Map database teachers to display format
  const employees: EmployeeDisplay[] =
    teachers?.map((t) => ({
      id: t.id,
      name: `${t.first_name} ${t.last_name}`,
      code: t.employee_code,
      role: "Teacher",
      designation: t.designation || "Faculty",
      avatar: `${t.first_name[0]}${t.last_name[0]}`,
      color: getAvatarColor(t.first_name),
    })) || [];

  // Filter employees
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Delete handler
  const handleDelete = (employeeId: string) => {
    setEmployeeToDelete(employeeId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      deleteMutation.mutate(employeeToDelete, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Employee deleted successfully",
          });
          setDeleteDialogOpen(false);
          setEmployeeToDelete(null);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to delete employee",
            variant: "destructive",
          });
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading employees...</span>
      </div>
    );
  }

  const selectedEmployee = employeeToDelete
    ? employees.find((e) => e.id === employeeToDelete)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Employee Management
            </h1>
            <p className="text-muted-foreground">
              Manage your school staff and faculty
            </p>
          </div>
        </div>
        {canCreate && (
          <Button
            onClick={() => navigate("/employees/create")}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Onboard Employee
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="arts">Arts</SelectItem>
                <SelectItem value="commerce">Commerce</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={designationFilter}
              onValueChange={setDesignationFilter}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Designations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Designations</SelectItem>
                <SelectItem value="chemistry">Chemistry Faculty</SelectItem>
                <SelectItem value="physics">Physics Faculty</SelectItem>
                <SelectItem value="biology">Biology Faculty</SelectItem>
                <SelectItem value="maths">Maths Faculty</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employees List */}
      {filteredEmployees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">
              {searchQuery ? "No employees found" : "No employees yet"}
            </p>
            <p className="text-muted-foreground text-center mt-2 max-w-md">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Get started by onboarding your first employee"}
            </p>
            {canCreate && !searchQuery && (
              <Button
                onClick={() => navigate("/employees/create")}
                className="mt-6"
              >
                <Plus className="h-4 w-4 mr-2" />
                Onboard Employee
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <Card className="hidden md:block">
            <CardContent className="pt-6">
              <EmployeeTable
                employees={filteredEmployees}
                onDelete={handleDelete}
                canUpdate={canUpdate}
                canDelete={canDelete}
              />
            </CardContent>
          </Card>

          {/* Mobile Card View */}
          <div className="md:hidden grid gap-4">
            {filteredEmployees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onDelete={handleDelete}
                canUpdate={canUpdate}
                canDelete={canDelete}
              />
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteEmployeeDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        employeeName={selectedEmployee?.name}
      />
    </div>
  );
}
