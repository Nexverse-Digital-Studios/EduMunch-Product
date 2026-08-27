/**
 * RoleForm Component
 * ====================
 * Reusable form component for creating/editing roles
 * Used in RoleCreate and RoleEdit pages
 */

import { useState } from "react";
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface RoleFormData {
  role_name: string;
  role_code: string;
  description: string;
  active_modules: string[];
}

interface RoleFormProps {
  initialData?: Partial<RoleFormData>;
  onSubmit: (data: RoleFormData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
  isLoading?: boolean;
}

// All available modules
const allModules = [
  "Payments",
  "Courses",
  "Lms Content",
  "Subjects",
  "Topics",
  "Batches",
  "Batch Faculty",
  "Timetables",
  "Attendance",
  "Assignments",
  "Results",
  "Lecture Templates",
  "Users",
  "Roles",
  "Branches",
  "Inventory",
  "Tie-Up Schools",
  "Employees",
  "Salary Structures",
  "Payslips",
  "Leave Management",
  "Working Hours",
  "Doubts",
  "Notifications",
  "Feedback",
  "Grievances",
  "PTM Requests",
  "Support Tickets",
];

export const RoleForm = ({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
  isLoading = false,
}: RoleFormProps) => {
  const [formData, setFormData] = useState<RoleFormData>({
    role_name: initialData?.role_name || "",
    role_code: initialData?.role_code || "",
    description: initialData?.description || "",
    active_modules: initialData?.active_modules || [],
  });
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  const handleInputChange = (field: keyof RoleFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleModule = (module: string) => {
    setSelectedModules((prev) =>
      prev.includes(module)
        ? prev.filter((m) => m !== module)
        : [...prev, module]
    );
  };

  const moveToActive = () => {
    setFormData((prev) => ({
      ...prev,
      active_modules: [
        ...prev.active_modules,
        ...selectedModules.filter((m) => !prev.active_modules.includes(m)),
      ],
    }));
    setSelectedModules([]);
  };

  const moveToAll = () => {
    setFormData((prev) => ({
      ...prev,
      active_modules: prev.active_modules.filter(
        (m) => !selectedModules.includes(m)
      ),
    }));
    setSelectedModules([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Role Name <span className="text-destructive">*</span>
          </Label>
          <Input
            value={formData.role_name}
            onChange={(e) => handleInputChange("role_name", e.target.value)}
            placeholder="e.g., Branch Manager"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>
            Role Code <span className="text-destructive">*</span>
          </Label>
          <Input
            value={formData.role_code}
            onChange={(e) => handleInputChange("role_code", e.target.value)}
            placeholder="e.g., BRANCH_MANAGER"
            disabled={isEdit}
            required
          />
          <p className="text-xs text-muted-foreground">
            Unique identifier, uppercase with underscores
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Describe the role's responsibilities..."
          rows={2}
        />
      </div>

      <div className="space-y-4">
        <Label className="text-lg font-semibold">Modules (Phase 4)</Label>
        <p className="text-sm text-muted-foreground">
          Module permissions will be configured in Phase 4. For now, Admin role
          has full access.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4">
          {/* All Modules */}
          <div className="border border-border rounded-lg">
            <div className="p-3 border-b border-border bg-muted/30">
              <h4 className="font-semibold text-foreground">All Modules</h4>
            </div>
            <ScrollArea className="h-[200px] p-3">
              <div className="space-y-2">
                {allModules
                  .filter((m) => !formData.active_modules.includes(m))
                  .map((module) => (
                    <div key={module} className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedModules.includes(module)}
                        onCheckedChange={() => toggleModule(module)}
                      />
                      <span className="text-sm text-foreground">{module}</span>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>

          {/* Transfer Buttons */}
          <div className="flex md:flex-col items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={moveToActive}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={moveToAll}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Active Modules */}
          <div className="border border-border rounded-lg">
            <div className="p-3 border-b border-border bg-muted/30">
              <h4 className="font-semibold text-foreground">Active Modules</h4>
            </div>
            <ScrollArea className="h-[200px] p-3">
              {formData.active_modules.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No modules granted
                </p>
              ) : (
                <div className="space-y-2">
                  {formData.active_modules.map((module) => (
                    <div key={module} className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedModules.includes(module)}
                        onCheckedChange={() => toggleModule(module)}
                      />
                      <span className="text-sm text-foreground">{module}</span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
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
            "Update Role"
          ) : (
            "Create Role"
          )}
        </Button>
      </div>
    </form>
  );
};

export default RoleForm;
