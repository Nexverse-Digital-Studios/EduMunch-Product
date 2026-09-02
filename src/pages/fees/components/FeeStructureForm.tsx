import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";
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

interface FeeStructureFormProps {
  mode: "create" | "edit";
  initialData?: FeeStructureDB;
}

export function FeeStructureForm({ mode, initialData }: FeeStructureFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canCreate, canUpdate } = useModulePermissions("fees");

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
    structure_name: initialData?.structure_name || "",
    class_id: initialData?.class_id || "",
    academic_year_id: initialData?.academic_year_id || currentYear?.id || "",
    description: initialData?.description || "",
    is_active: initialData?.is_active ?? true,
  });

  const parseComponents = (data?: FeeStructureDB): FeeComponent[] => {
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

  const [components, setComponents] = useState<FeeComponent[]>(
    parseComponents(initialData) || [
      { id: "comp-1", name: "Tuition Fee", amount: 0, is_optional: false },
    ]
  );

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
        formData,
      });

      if (mode === "create") {
        console.log("🚀 Creating fee structure...");
        await createMutation.mutateAsync(payload);
        toast({
          title: "Success",
          description: "Fee structure created successfully.",
        });
      } else if (initialData?.id) {
        console.log("🔄 Updating fee structure:", initialData.id);
        await updateMutation.mutateAsync({
          id: initialData.id,
          updates: payload,
        });
        toast({
          title: "Success",
          description: "Fee structure updated successfully.",
        });
      }

      navigate("/fees/structures");
    } catch (error: any) {
      console.error("❌ Fee structure error:", {
        message: error?.message,
        error,
        status: error?.status,
        details: error?.details,
      });
      toast({
        title: "Error",
        description: error?.message || `Failed to ${mode} fee structure.`,
        variant: "destructive",
      });
    }
  };

  const canSubmit = mode === "create" ? canCreate : canUpdate;

  if (!canSubmit) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to {mode} fee structures.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => navigate("/fees/structures")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === "create" ? "Create Fee Structure" : "Edit Fee Structure"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "create"
              ? "Define a new fee structure for a class"
              : "Update the fee structure details"}
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            General details about the fee structure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="structure_name">Structure Name *</Label>
              <Input
                id="structure_name"
                value={formData.structure_name}
                onChange={(e) =>
                  setFormData({ ...formData, structure_name: e.target.value })
                }
                placeholder="e.g., Class 10 - Annual Fees 2024-25"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="academic_year_id">Academic Year *</Label>
              <Select
                value={formData.academic_year_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, academic_year_id: value })
                }
              >
                <SelectTrigger id="academic_year_id">
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears?.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.year_name} {year.is_current && "(Current)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="class_id">Class *</Label>
              <Select
                value={formData.class_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, class_id: value })
                }
              >
                <SelectTrigger id="class_id">
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
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label htmlFor="is_active">Active Structure</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional description about this fee structure..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Fee Components */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fee Components</CardTitle>
              <CardDescription>
                Break down the fee structure into individual components
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddComponent}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Component
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {components.map((component, index) => (
            <div
              key={component.id}
              className="flex items-start gap-4 p-4 border rounded-lg"
            >
              <div className="flex-1 grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Component Name *</Label>
                  <Input
                    value={component.name}
                    onChange={(e) =>
                      handleComponentChange(
                        component.id,
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="e.g., Tuition Fee"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount (₹) *</Label>
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
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
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
                  <Label>Optional</Label>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-8"
                onClick={() => handleRemoveComponent(component.id)}
                disabled={components.length === 1}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}

          {/* Total */}
          <div className="flex justify-end pt-4 border-t">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                Total Amount (Mandatory Components)
              </p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(totalAmount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/fees/structures")}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          <Save className="mr-2 h-4 w-4" />
          {mode === "create" ? "Create Structure" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

export function FeeStructureCreate() {
  return <FeeStructureForm mode="create" />;
}

export function FeeStructureEdit() {
  const { id } = useParams();

  const { data: structures, isLoading } = useSupabaseTable<FeeStructureDB>(
    `fee_structures_${INDEX_TOKEN}`,
    { filters: { id } }
  );

  const structure = structures?.[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!structure) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Fee structure not found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <FeeStructureForm mode="edit" initialData={structure} />;
}
