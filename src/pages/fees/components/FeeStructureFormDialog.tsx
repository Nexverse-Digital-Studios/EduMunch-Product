/**
 * Fee Structure Form Dialog
 * ==========================
 * Modal dialog for creating/editing fee structures
 *
 * CONSOLIDATED: Replaces /fees/structures/create and /fees/structures/:id/edit routes
 */

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { FeeStructureDB } from "./types";

const INDEX_TOKEN = "1emaet";

interface ClassDB {
  id: string;
  class_name: string;
}

interface AcademicYearDB {
  id: string;
  year_name: string;
  is_current: boolean;
}

interface FeeComponent {
  id: string;
  name: string;
  amount: number;
  is_optional: boolean;
}

interface FeeStructureFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: FeeStructureDB | null;
  onSuccess?: () => void;
}

export function FeeStructureFormDialog({
  open,
  onOpenChange,
  editData,
  onSuccess,
}: FeeStructureFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!editData;

  const { data: classes } = useSupabaseTable<ClassDB>(
    `classes_${INDEX_TOKEN}`,
    {
      orderBy: { column: "class_order", ascending: true },
    }
  );

  const { data: academicYears } = useSupabaseTable<AcademicYearDB>(
    `academic_years_${INDEX_TOKEN}`,
    { orderBy: { column: "year_name", ascending: false } }
  );

  const { createMutation, updateMutation } = useSupabaseTable<FeeStructureDB>(
    `fee_structures_${INDEX_TOKEN}`
  );

  const currentYear = academicYears?.find((y) => y.is_current);

  const [formData, setFormData] = useState({
    structure_name: "",
    class_id: "",
    academic_year_id: "",
    description: "",
    is_active: true,
  });

  const [components, setComponents] = useState<FeeComponent[]>([
    { id: "comp-1", name: "Tuition Fee", amount: 0, is_optional: false },
  ]);

  const parseComponents = (data?: FeeStructureDB | null): FeeComponent[] => {
    if (!data?.fee_components) return [];
    try {
      if (Array.isArray(data.fee_components)) {
        return data.fee_components.map((c, i) => ({
          id: `comp-${i}`,
          name: (c as any).name || "",
          amount: (c as any).amount || 0,
          is_optional: (c as any).is_optional || false,
        }));
      }
      return [];
    } catch {
      return [];
    }
  };

  // Reset form when dialog opens/closes or editData changes
  useEffect(() => {
    if (open) {
      if (editData) {
        setFormData({
          structure_name: editData.structure_name,
          class_id: editData.class_id,
          academic_year_id: editData.academic_year_id,
          description: editData.description || "",
          is_active: editData.is_active,
        });
        const parsedComponents = parseComponents(editData);
        setComponents(
          parsedComponents.length > 0
            ? parsedComponents
            : [
                {
                  id: "comp-1",
                  name: "Tuition Fee",
                  amount: 0,
                  is_optional: false,
                },
              ]
        );
      } else {
        setFormData({
          structure_name: "",
          class_id: "",
          academic_year_id: currentYear?.id || "",
          description: "",
          is_active: true,
        });
        setComponents([
          { id: "comp-1", name: "Tuition Fee", amount: 0, is_optional: false },
        ]);
      }
    }
  }, [open, editData, currentYear?.id]);

  const totalAmount = components.reduce(
    (sum, c) => sum + (c.is_optional ? 0 : c.amount),
    0
  );

  const handleAddComponent = () => {
    setComponents([
      ...components,
      {
        id: `comp-${Date.now()}`,
        name: "",
        amount: 0,
        is_optional: false,
      },
    ]);
  };

  const handleRemoveComponent = (id: string) => {
    if (components.length > 1) {
      setComponents(components.filter((c) => c.id !== id));
    }
  };

  const handleComponentChange = (
    id: string,
    field: keyof FeeComponent,
    value: string | number | boolean
  ) => {
    setComponents(
      components.map((c) =>
        c.id === id
          ? { ...c, [field]: field === "amount" ? Number(value) : value }
          : c
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.structure_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a structure name.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.class_id) {
      toast({
        title: "Validation Error",
        description: "Please select a class.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.academic_year_id) {
      toast({
        title: "Validation Error",
        description: "Please select an academic year.",
        variant: "destructive",
      });
      return;
    }

    if (components.some((c) => !c.name.trim())) {
      toast({
        title: "Validation Error",
        description: "Please enter names for all fee components.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        structure_name: formData.structure_name.trim(),
        class_id: formData.class_id,
        academic_year_id: formData.academic_year_id,
        description: formData.description?.trim() || null,
        total_amount: Number(totalAmount) || 0,
        is_active: Boolean(formData.is_active),
      };

      console.log("📝 Fee Structure Payload:", {
        payload,
        totalAmount,
        components: components.length,
      });

      if (isEditMode && editData?.id) {
        console.log("🔄 Updating fee structure:", editData.id);
        await updateMutation.mutateAsync({
          id: editData.id,
          updates: payload,
        });
        toast({
          title: "Success",
          description: "Fee structure updated successfully.",
        });
      } else {
        console.log("🚀 Creating fee structure...");
        await createMutation.mutateAsync(payload as Partial<FeeStructureDB>);
        toast({
          title: "Success",
          description: "Fee structure created successfully.",
        });
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${
          isEditMode ? "update" : "create"
        } fee structure.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Fee Structure" : "Create Fee Structure"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-6 p-1">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="structure_name">Structure Name *</Label>
                  <Input
                    id="structure_name"
                    placeholder="e.g., Class 10 Annual Fee"
                    value={formData.structure_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        structure_name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class_id">Class *</Label>
                  <Select
                    value={formData.class_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, class_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes?.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.class_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="academic_year_id">Academic Year *</Label>
                  <Select
                    value={formData.academic_year_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, academic_year_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears?.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.year_name}
                          {year.is_current && " (Current)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="is_active">Status</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                    />
                    <Label htmlFor="is_active" className="font-normal">
                      {formData.is_active ? "Active" : "Inactive"}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                />
              </div>
            </div>

            {/* Fee Components */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Fee Components</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddComponent}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Component
                </Button>
              </div>

              <div className="space-y-3">
                {components.map((component, index) => (
                  <Card key={component.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label>Component Name *</Label>
                            <Input
                              placeholder="e.g., Tuition Fee"
                              value={component.name}
                              onChange={(e) =>
                                handleComponentChange(
                                  component.id,
                                  "name",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Amount (₹)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={component.amount}
                              onChange={(e) =>
                                handleComponentChange(
                                  component.id,
                                  "amount",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Optional</Label>
                            <div className="flex items-center space-x-2 pt-2">
                              <Switch
                                checked={component.is_optional}
                                onCheckedChange={(checked) =>
                                  handleComponentChange(
                                    component.id,
                                    "is_optional",
                                    checked
                                  )
                                }
                              />
                              <span className="text-sm text-muted-foreground">
                                {component.is_optional ? "Yes" : "No"}
                              </span>
                            </div>
                          </div>
                        </div>
                        {components.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveComponent(component.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Total (Mandatory Components)
                  </p>
                  <p className="text-2xl font-bold">
                    ₹{totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : isEditMode
                  ? "Update Structure"
                  : "Create Structure"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default FeeStructureFormDialog;
