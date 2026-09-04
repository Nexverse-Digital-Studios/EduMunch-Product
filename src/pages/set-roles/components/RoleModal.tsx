import { Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RoleDB, RoleFormData } from "./types";

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRole: RoleDB | null;
  formData: RoleFormData;
  onFormChange: (data: Partial<RoleFormData>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const RoleModal = ({
  isOpen,
  onClose,
  editingRole,
  formData,
  onFormChange,
  onSubmit,
  isSubmitting,
}: RoleModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {editingRole ? "Edit Role" : "Create New Role"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role_name">Role Name *</Label>
            <Input
              id="role_name"
              placeholder="e.g., Class Teacher, Principal"
              value={formData.role_name}
              onChange={(e) => onFormChange({ role_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role_code">Role Code *</Label>
            <Input
              id="role_code"
              placeholder="e.g., CLASS_TEACHER, PRINCIPAL"
              value={formData.role_code}
              onChange={(e) => onFormChange({ role_code: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Will be converted to uppercase with underscores
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe this role's responsibilities..."
              value={formData.description}
              onChange={(e) => onFormChange({ description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="is_active">Active Status</Label>
              <p className="text-sm text-muted-foreground">
                Inactive roles cannot be assigned to users
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                onFormChange({ is_active: checked })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {editingRole ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
