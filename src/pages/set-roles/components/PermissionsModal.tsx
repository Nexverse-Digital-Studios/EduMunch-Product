import { Shield, Save, Loader2, ChevronDown, Settings2 } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Permissions for: {selectedRole?.role_name}
          </DialogTitle>
          <DialogDescription>
            Configure CRUD permissions for each module. Changes are saved when
            you click Save.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            {Object.entries(permissionsByModule).map(
              ([moduleId, { module, permissions: modulePerms }]) => {
                if (modulePerms.length === 0) return null;

                return (
                  <Collapsible
                    key={moduleId}
                    defaultOpen
                    className="border rounded-lg"
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {module.module_name}
                        </span>
                        <Badge variant="outline" className="ml-2">
                          {modulePerms.length} permissions
                        </Badge>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Permission</TableHead>
                              <TableHead className="text-center w-20">
                                View
                              </TableHead>
                              <TableHead className="text-center w-20">
                                Create
                              </TableHead>
                              <TableHead className="text-center w-20">
                                Update
                              </TableHead>
                              <TableHead className="text-center w-20">
                                Delete
                              </TableHead>
                              <TableHead className="text-center w-20">
                                Approve
                              </TableHead>
                              <TableHead className="text-center w-20">
                                Export
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {modulePerms.map((perm) => (
                              <TableRow key={perm.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-sm">
                                      {perm.permission_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {perm.permission_code}
                                    </p>
                                  </div>
                                </TableCell>
                                {(
                                  [
                                    "can_read",
                                    "can_create",
                                    "can_update",
                                    "can_delete",
                                    "can_approve",
                                    "can_export",
                                  ] as const
                                ).map((field) => (
                                  <TableCell
                                    key={field}
                                    className="text-center"
                                  >
                                    <Checkbox
                                      checked={
                                        permissionFormState[perm.id]?.[field] ||
                                        false
                                      }
                                      onCheckedChange={() =>
                                        onTogglePermission(perm.id, field)
                                      }
                                    />
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              }
            )}

            {Object.keys(permissionsByModule).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No modules or permissions found.
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
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
