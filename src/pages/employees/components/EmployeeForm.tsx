/**
 * EmployeeForm Component
 * =======================
 * Reusable form component for creating/editing employees
 * Used in EmployeeCreate and EmployeeEdit pages
 */

import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form schema interface
export interface EmployeeFormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  employee_code: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  status: string;
}

export interface EmployeeFormProps {
  onSubmit: (data: EmployeeFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  defaultValues?: Partial<EmployeeFormData>;
  submitLabel?: string;
}

export const EmployeeForm = ({
  onSubmit,
  onCancel,
  isLoading = false,
  defaultValues,
  submitLabel = "Save",
}: EmployeeFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<EmployeeFormData>({
    defaultValues: {
      first_name: defaultValues?.first_name || "",
      middle_name: defaultValues?.middle_name || "",
      last_name: defaultValues?.last_name || "",
      employee_code: defaultValues?.employee_code || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
      department: defaultValues?.department || "",
      designation: defaultValues?.designation || "",
      status: defaultValues?.status || "active",
    },
  });

  const department = watch("department");
  const designation = watch("designation");
  const status = watch("status");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="first_name"
            placeholder="Enter first name"
            {...register("first_name", { required: "First name is required" })}
          />
          {errors.first_name && (
            <p className="text-sm text-destructive">
              {errors.first_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="middle_name">Middle Name</Label>
          <Input
            id="middle_name"
            placeholder="Enter middle name"
            {...register("middle_name")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="last_name"
            placeholder="Enter last name"
            {...register("last_name", { required: "Last name is required" })}
          />
          {errors.last_name && (
            <p className="text-sm text-destructive">
              {errors.last_name.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="employee_code">
          Employee Code <span className="text-destructive">*</span>
        </Label>
        <Input
          id="employee_code"
          placeholder="e.g., EMP001"
          {...register("employee_code", {
            required: "Employee code is required",
          })}
        />
        {errors.employee_code && (
          <p className="text-sm text-destructive">
            {errors.employee_code.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email address"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            placeholder="Enter phone number"
            {...register("phone", { required: "Phone number is required" })}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select
            value={department}
            onValueChange={(value) => setValue("department", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="arts">Arts</SelectItem>
              <SelectItem value="commerce">Commerce</SelectItem>
              <SelectItem value="administration">Administration</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="designation">Designation</Label>
          <Select
            value={designation}
            onValueChange={(value) => setValue("designation", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select designation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Chemistry Faculty">
                Chemistry Faculty
              </SelectItem>
              <SelectItem value="Physics Faculty">Physics Faculty</SelectItem>
              <SelectItem value="Biology Faculty">Biology Faculty</SelectItem>
              <SelectItem value="Maths Faculty">Maths Faculty</SelectItem>
              <SelectItem value="English Faculty">English Faculty</SelectItem>
              <SelectItem value="Admin Staff">Admin Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={status}
          onValueChange={(value) => setValue("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;
