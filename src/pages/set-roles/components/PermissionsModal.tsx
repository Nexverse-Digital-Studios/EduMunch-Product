import { useState, useMemo, useEffect } from "react";
import {
  Shield,
  Save,
  Loader2,
  Check,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RoleDB, ModuleDB, PermissionDB, PermissionFormState } from "./types";

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRole: RoleDB | null;
  permissionsByModule: Record<
    string,
    { module: ModuleDB; permissions: PermissionDB[] }
  >;
  permissionFormState: PermissionFormState;
  onTogglePermission: (
    permissionId: string,
    field: keyof PermissionFormState[string]
  ) => void;
  onSave: () => void;
  isSubmitting: boolean;
}

// Permission action labels and fields mapping
const PERMISSION_ACTIONS = [
  { field: "can_read" as const, label: "View"},
  { field: "can_create" as const, label: "Create"},
  { field: "can_update" as const, label: "Update"},
  { field: "can_delete" as const, label: "Delete"},
  { field: "can_approve" as const, label: "Approve"},
  { field: "can_export" as const, label: "Export"},
];

export const PermissionsModal = ({
  isOpen,
  onClose,
  selectedRole,
  permissionsByModule,
  permissionFormState,
  onTogglePermission,
  onSave,
  isSubmitting,
}: PermissionsModalProps) => {
  // State for selected module
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");

  // Get sorted modules list (only modules with permissions)
  const modulesWithPermissions = useMemo(() => {
    return Object.entries(permissionsByModule)
      .filter(([_, { permissions }]) => permissions.length > 0)
      .map(([id, { module, permissions }]) => ({
        id,
        module,
        permissionCount: permissions.length,
      }))
      .sort(
        (a, b) =>
          (a.module.display_order ?? 999) - (b.module.display_order ?? 999)
      );
  }, [permissionsByModule]);

  // Auto-select first module when dialog opens
  useEffect(() => {
    if (isOpen && modulesWithPermissions.length > 0 && !selectedModuleId) {
      setSelectedModuleId(modulesWithPermissions[0].id);
    }
  }, [isOpen, modulesWithPermissions, selectedModuleId]);

  // Reset selection when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedModuleId("");
    }
  }, [isOpen]);

  // Get selected module's permissions
  const selectedModuleData = selectedModuleId
    ? permissionsByModule[selectedModuleId]
    : null;

  // Count total enabled permissions for a module
  const getModulePermissionCount = (moduleId: string) => {
    const moduleData = permissionsByModule[moduleId];
    if (!moduleData) return 0;

    let count = 0;
    moduleData.permissions.forEach((perm) => {
      const state = permissionFormState[perm.id];
      if (state) {
        PERMISSION_ACTIONS.forEach(({ field }) => {
          if (state[field]) count++;
        });
      }
    });
    return count;
  };

  // Toggle all permissions for a single permission entry
  const toggleAllForPermission = (permissionId: string, enable: boolean) => {
    PERMISSION_ACTIONS.forEach(({ field }) => {
      const currentValue = permissionFormState[permissionId]?.[field] || false;
      if (currentValue !== enable) {
        onTogglePermission(permissionId, field);
      }
    });
  };

  // Check if all permissions are enabled for a permission entry
  const areAllEnabled = (permissionId: string) => {
    return PERMISSION_ACTIONS.every(
      ({ field }) => permissionFormState[permissionId]?.[field]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Permissions for: {selectedRole?.role_name}
          </DialogTitle>
          <DialogDescription>
            Select a module and configure permissions. Changes are saved when
            you click Save.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Module Selector Dropdown */}
          <div className="flex items-center gap-3">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedModuleId}
              onValueChange={setSelectedModuleId}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a module..." />
              </SelectTrigger>
              <SelectContent>
                {modulesWithPermissions.map(
                  ({ id, module, permissionCount }) => {
                    const enabledCount = getModulePermissionCount(id);
                    return (
                      <SelectItem key={id} value={id}>
                        <div className="flex items-center justify-between w-full gap-3">
                          <span>{module.module_name}</span>
                          <div className="flex items-center gap-2">
                            {enabledCount > 0 && (
                              <Badge
                                variant="default"
                                className="text-xs px-1.5 py-0"
                              >
                                {enabledCount}
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className="text-xs px-1.5 py-0"
                            >
                              {permissionCount}
                            </Badge>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  }
                )}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Permissions for Selected Module */}
          <ScrollArea className="h-[45vh] pr-2">
            {selectedModuleData ? (
              <div className="space-y-3">
                {/* Permission Cards */}
                {selectedModuleData.permissions.map((perm) => (
                  <Card
                    key={perm.id}
                    className="border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <CardContent className="p-4">
                      {/* Permission Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {perm.permission_name}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {perm.permission_code}
                          </p>
                        </div>
                        <Button
                          variant={areAllEnabled(perm.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            toggleAllForPermission(perm.id, !areAllEnabled(perm.id))
                          }
                          className="h-7 text-xs"
                        >
                          {areAllEnabled(perm.id) ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              All
                            </>
                          ) : (
                            "Select All"
                          )}
                        </Button>
                      </div>

                      {/* Permission Actions Grid */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {PERMISSION_ACTIONS.map(({ field, label }) => {
                          const isChecked =
                            permissionFormState[perm.id]?.[field] || false;
                          return (
                            <label
                              key={field}
                              className={`
                                flex items-center gap-1.5 p-2 rounded-md border cursor-pointer
                                transition-all text-xs
                                ${
                                  isChecked
                                    ? "bg-primary/10 border-primary text-primary"
                                    : "bg-muted/30 border-transparent hover:bg-muted/50"
                                }
                              `}
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() =>
                                  onTogglePermission(perm.id, field)
                                }
                                className="h-3.5 w-3.5"
                              />
                              <span className="font-medium">{label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                <Layers className="h-12 w-12 mb-4 opacity-30" />
                <p className="text-sm">Select a module to configure permissions</p>
              </div>
            )}
          </ScrollArea>

        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save Permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
