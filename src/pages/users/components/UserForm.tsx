/**
 * UserForm Component
 * ====================
 * Reusable form component for creating/editing users
 * Used in UserCreate and UserEdit pages
 */

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Role } from "@/hooks/useSupabaseQuery";

export interface UserFormData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role_id: string;
}

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  roles: Role[] | undefined;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
  isLoading?: boolean;
}

// Get initials from name
const getInitials = (name: string) => {
  if (!name) return "NA";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const UserForm = ({
  initialData,
  roles,
  onSubmit,
  onCancel,
  isEdit = false,
  isLoading = false,
}: UserFormProps) => {
  const [formData, setFormData] = useState<UserFormData>({
    full_name: initialData?.full_name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    password: initialData?.password || "",
    role_id: initialData?.role_id || "",
  });

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <Avatar className="h-24 w-24 bg-primary">
          <AvatarFallback className="text-primary-foreground text-2xl font-medium">
            {getInitials(formData.full_name)}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            placeholder="Enter full name"
            value={formData.full_name}
            onChange={(e) => handleInputChange("full_name", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            type="email"
            placeholder="user@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            disabled={isEdit}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Phone Number</Label>
          <Input
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
          />
        </div>
        {!isEdit && (
          <div className="space-y-2">
            <Label>
              Password <span className="text-destructive">*</span>
            </Label>
            <Input
              type="password"
              placeholder="••••••••••"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required={!isEdit}
            />
          </div>
        )}
        <div className={`space-y-2 ${isEdit ? "" : "md:col-span-2"}`}>
          <Label>
            Role <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.role_id}
            onValueChange={(v) => handleInputChange("role_id", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              {roles?.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.role_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : isEdit ? (
            "Update User"
          ) : (
            "Create User"
          )}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
