/**
 * EmployeesList Page (CONSOLIDATED)
 * ===================================
 * Main employees listing page with search, filters, and CRUD operations.
 * Create and Edit operations now use modal dialogs instead of separate routes.
 *
 * Route: /employees
 * Route Consolidation: Replaces /employees/create and /employees/:id/edit routes
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Users, Loader2, Upload, Download } from "lucide-react";
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
  EmployeeFormDialog,
  type EmployeeDB,
  type EmployeeDisplay,
} from "./components";
import { BulkImportDialog } from "@/components/ui/bulk-import-dialog";
import {
  exportToExcel,
  EMPLOYEE_IMPORT_TEMPLATE,
  EMPLOYEE_IMPORT_CONFIG,
} from "@/lib/excel";

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

  // Modal states for create/edit (consolidation - replaces separate routes)
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editEmployeeId, setEditEmployeeId] = useState<string | null>(null);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);

  // Permission checks
  const { canCreate, canUpdate, canDelete, canExport } =
    useModulePermissions("employees");

  // Fetch employees data
  const {
    data: employees_data,
    isLoading: isLoadingEmployees,
    deleteMutation,
    createMutation,
    refetch,
  } = useSupabaseTable<EmployeeDB>(TABLES.EMPLOYEES, {
    orderBy: { column: "first_name", ascending: true },
  });

  // Fetch teachers data
  const { data: teachers_data, isLoading: isLoadingTeachers } =
    useSupabaseTable<EmployeeDB>(TABLES.TEACHERS, {
      orderBy: { column: "first_name", ascending: true },
    });

  const isLoading = isLoadingEmployees || isLoadingTeachers;

  // Combine employees and teachers
  const allStaff = useMemo(() => {
    const combined = [
      ...(employees_data?.map((e) => ({ ...e, type: "Employee" })) || []),
      ...(teachers_data?.map((t) => ({ ...t, type: "Teacher" })) || []),
    ];
    return combined;
  }, [employees_data, teachers_data]);

  // Map database records to display format
  const employees: EmployeeDisplay[] =
    allStaff.map((staff: any) => ({
      id: staff.id,
      name: `${staff.first_name} ${staff.last_name}`,
      code: staff.employee_code,
      role: staff.type || "Staff",
      designation: staff.designation || "Staff",
      avatar: `${staff.first_name[0]}${staff.last_name[0]}`,
      color: getAvatarColor(staff.first_name),
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

  // Handle opening create modal
  const handleCreateEmployee = () => {
    setEditEmployeeId(null);
    setShowEmployeeModal(true);
  };

  // Handle opening edit modal
  const handleEditEmployee = (employeeId: string) => {
    setEditEmployeeId(employeeId);
    setShowEmployeeModal(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowEmployeeModal(false);
    setEditEmployeeId(null);
  };

  // Export employees to Excel
  const handleExport = () => {
    if (!allStaff || allStaff.length === 0) {
      toast({
        title: "No Data",
        description: "No employees to export.",
        variant: "destructive",
      });
      return;
    }

    exportToExcel({
      data: allStaff,
      filename: `employees_export_${new Date().toISOString().split("T")[0]}`,
      sheetName: "Employees",
      columns: [
        { header: "Employee Code", key: "employee_code", width: 15 },
        { header: "First Name", key: "first_name", width: 15 },
        { header: "Middle Name", key: "middle_name", width: 15 },
        { header: "Last Name", key: "last_name", width: 15 },
        { header: "Email", key: "email", width: 25 },
        { header: "Phone", key: "phone", width: 15 },
        { header: "Department", key: "department", width: 15 },
        { header: "Designation", key: "designation", width: 15 },
        { header: "Status", key: "status", width: 12 },
      ],
    });

    toast({
      title: "Export Complete",
      description: `Exported ${allStaff.length} employees to Excel.`,
    });
  };

  // Bulk import handler
  const handleBulkImport = async (data: Record<string, any>[]) => {
    let success = 0;
    let failed = 0;
    const results: {
      data: Record<string, any>;
      success: boolean;
      reason?: string;
    }[] = [];

    // Get existing employee codes from both tables to check for duplicates
    const existingCodes = new Set([
      ...(employees_data?.map((e) => e.employee_code) || []),
      ...(teachers_data?.map((t) => t.employee_code) || []),
    ]);

    for (const row of data) {
      // Skip if employee code already exists
      if (existingCodes.has(row.employee_code)) {
        results.push({
          data: row,
          success: false,
          reason: `Duplicate employee code: ${row.employee_code}`,
        });
        failed++;
        continue;
      }

      try {
        await createMutation.mutateAsync({
          employee_code: row.employee_code,
          first_name: row.first_name,
          middle_name: row.middle_name || null,
          last_name: row.last_name,
          date_of_birth: row.date_of_birth || null,
          gender: row.gender || null,
          email: row.email || null,
          phone: row.phone,
          address_line1: row.address_line1 || null,
          city: row.city || null,
          state: row.state || null,
          pincode: row.pincode || null,
          country: "India",
          qualification: row.qualification || null,
          experience_years: row.experience_years
            ? parseInt(row.experience_years)
            : null,
          joining_date: row.joining_date,
          employment_type: row.employment_type || "Permanent",
          designation: row.designation || null,
          department: row.department || null,
          status: "active",
        });
        results.push({ data: row, success: true });
        success++;
        // Add to existing codes to prevent duplicates within the same import batch
        existingCodes.add(row.employee_code);
      } catch (error: any) {
        console.error("Failed to import employee:", row, error);
        results.push({
          data: row,
          success: false,
          reason: error?.message || "Database insertion failed",
        });
        failed++;
      }
    }

    refetch();
    return { success, failed, results };
  };

  // Get employee data for edit mode
  const getEditEmployeeData = () => {
    if (!editEmployeeId || !teachers) return undefined;
    const teacher = teachers.find((t) => t.id === editEmployeeId);
    if (!teacher) return undefined;
    return {
      first_name: teacher.first_name,
      middle_name: teacher.middle_name || "",
      last_name: teacher.last_name,
      employee_code: teacher.employee_code,
      email: teacher.email || "",
      phone: teacher.phone || "",
      qualification: teacher.qualification || "",
      specialization: teacher.specialization || "",
      experience_years: teacher.experience_years?.toString() || "",
      department: teacher.department || "",
      designation: teacher.designation || "",
      is_active: teacher.is_active,
    };
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
        <div className="flex gap-2">
          {canCreate && (
            <Button
              variant="outline"
              onClick={() => setShowBulkImportModal(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
          )}
          {canExport && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          {canCreate && (
            <Button
              onClick={handleCreateEmployee}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Onboard Employee
            </Button>
          )}
        </div>
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
              <Button onClick={handleCreateEmployee} className="mt-6">
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
                onEdit={handleEditEmployee}
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
                onEdit={handleEditEmployee}
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

      {/* Create/Edit Employee Modal (Consolidated - replaces /employees/create and /employees/:id/edit routes) */}
      <EmployeeFormDialog
        open={showEmployeeModal}
        onOpenChange={handleModalClose}
        mode={editEmployeeId ? "edit" : "create"}
        employeeId={editEmployeeId || undefined}
        initialData={getEditEmployeeData()}
        onSuccess={() => refetch()}
      />

      {/* Bulk Import Dialog */}
      <BulkImportDialog
        open={showBulkImportModal}
        onOpenChange={setShowBulkImportModal}
        title="Bulk Import Employees"
        description="Import multiple employees from an Excel file. Download the template to see the required format."
        importConfig={EMPLOYEE_IMPORT_CONFIG}
        templateData={EMPLOYEE_IMPORT_TEMPLATE}
        templateFilename="employees_import"
        onImport={handleBulkImport}
        entityName="employees"
        identifierField="employee_code"
      />
    </div>
  );
}
