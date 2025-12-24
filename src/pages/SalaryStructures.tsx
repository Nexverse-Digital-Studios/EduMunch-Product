/**
 * SalaryStructures.tsx - Salary Structure Management
 * 
 * Supabase Tables (Tier 2):
 * - salary_structures_1EMAET: Structure templates
 * - salary_components_1EMAET: Earnings/deductions breakdown
 * 
 * Schema Reference:
 * - structure_name, designation, employment_type, basic_salary, effective_from, is_active
 * - salary_components: component_name, component_type (Earning/Deduction), calculation_type (Fixed/Percentage)
 */
import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSupabaseQuery, useSupabaseInsert, useSupabaseDelete } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";

interface SalaryStructure {
  id: string;
  structure_name: string;
  designation: string;
  employment_type: string;
  basic_salary: number;
  effective_from: string;
  is_active: boolean;
  created_at: string;
  salary_components_1EMAET?: SalaryComponent[];
}

interface SalaryComponent {
  id: string;
  salary_structure_id: string;
  component_name: string;
  component_type: 'Earning' | 'Deduction';
  calculation_type: 'Fixed' | 'Percentage';
  amount: number | null;
  percentage: number | null;
  is_taxable: boolean;
  display_order: number;
}

const INDEX_TOKEN = import.meta.env.VITE_INDEX_TOKEN || '1EMAET';
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const SalaryStructures = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    structure_name: "",
    designation: "",
    employment_type: "",
    basic_salary: "",
    effective_from: "",
  });

  const { canRead, canCreate, canUpdate, canDelete } = useModulePermissions('HR');
  const { toast } = useToast();

  // Fetch salary structures with components
  const { data: structures = [], isLoading, error, refetch } = useSupabaseQuery<SalaryStructure>(
    `salary_structures_${INDEX_TOKEN}`,
    { 
      select: `*, salary_components_${INDEX_TOKEN}(*)`,
      orderBy: { column: 'created_at', ascending: false }
    }
  );

  // Calculate totals for each structure
  const structuresWithTotals = useMemo(() => {
    return structures.map(structure => {
      const components = structure[`salary_components_${INDEX_TOKEN}`] || [];
      const totalEarnings = components
        .filter((c: SalaryComponent) => c.component_type === 'Earning')
        .reduce((sum: number, c: SalaryComponent) => {
          if (c.calculation_type === 'Fixed') {
            return sum + (c.amount || 0);
          } else {
            return sum + (structure.basic_salary * (c.percentage || 0) / 100);
          }
        }, 0);
      
      const totalDeductions = components
        .filter((c: SalaryComponent) => c.component_type === 'Deduction')
        .reduce((sum: number, c: SalaryComponent) => {
          if (c.calculation_type === 'Fixed') {
            return sum + (c.amount || 0);
          } else {
            return sum + (structure.basic_salary * (c.percentage || 0) / 100);
          }
        }, 0);

      const netSalary = structure.basic_salary + totalEarnings - totalDeductions;

      return {
        ...structure,
        totalEarnings,
        totalDeductions,
        netSalary
      };
    });
  }, [structures]);

  // Insert mutation
  const insertMutation = useSupabaseInsert<Partial<SalaryStructure>>(
    `salary_structures_${INDEX_TOKEN}`,
    {
      onSuccess: () => {
        toast({ title: "Success", description: "Salary structure created successfully" });
        setIsCreateModalOpen(false);
        setFormData({ structure_name: "", designation: "", employment_type: "", basic_salary: "", effective_from: "" });
        refetch();
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  );

  // Delete mutation
  const deleteMutation = useSupabaseDelete(
    `salary_structures_${INDEX_TOKEN}`,
    {
      onSuccess: () => {
        toast({ title: "Success", description: "Salary structure deleted successfully" });
        refetch();
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  );

  const handleSubmit = () => {
    if (!formData.structure_name || !formData.basic_salary) {
      toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
      return;
    }

    insertMutation.mutate({
      structure_name: formData.structure_name,
      designation: formData.designation || null,
      employment_type: formData.employment_type || null,
      basic_salary: parseFloat(formData.basic_salary),
      effective_from: formData.effective_from || new Date().toISOString().split('T')[0],
      is_active: true
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this salary structure?')) {
      deleteMutation.mutate(id);
    }
  };

  // Calculate totals
  const totalBaseSalary = structuresWithTotals.reduce((sum, s) => sum + s.basic_salary, 0);
  const totalEarnings = structuresWithTotals.reduce((sum, s) => sum + s.totalEarnings, 0);
  const totalDeductions = structuresWithTotals.reduce((sum, s) => sum + s.totalDeductions, 0);
  const totalNetSalary = structuresWithTotals.reduce((sum, s) => sum + s.netSalary, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Salary Structures</h1>
        {canCreate && (
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Structure
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load salary structures: {error.message}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Base Salary</p>
          <h3 className="text-2xl font-bold text-foreground">₹{totalBaseSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Earnings</p>
          <h3 className="text-2xl font-bold text-green-600">₹{totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Deductions</p>
          <h3 className="text-2xl font-bold text-destructive">₹{totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Net Salary</p>
          <h3 className="text-2xl font-bold text-foreground">₹{totalNetSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Structure Name</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Base Salary</TableHead>
              <TableHead>Total Earnings</TableHead>
              <TableHead>Total Deductions</TableHead>
              <TableHead>Net Salary</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {structuresWithTotals.map((structure) => (
              <TableRow key={structure.id} className="hover:bg-muted/20">
                <TableCell className="font-medium text-foreground">{structure.structure_name}</TableCell>
                <TableCell className="text-muted-foreground">{structure.designation || '-'}</TableCell>
                <TableCell className="text-foreground">₹{structure.basic_salary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-green-600">₹{structure.totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-destructive">₹{structure.totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-foreground">₹{structure.netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {canUpdate && (
                      <Button size="sm" variant="outline">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => handleDelete(structure.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {structuresWithTotals.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No salary structures found. Create one to get started.
                </TableCell>
              </TableRow>
            )}
            {/* Totals Row */}
            {structuresWithTotals.length > 0 && (
              <TableRow className="bg-muted/30 font-semibold">
                <TableCell className="text-foreground">Totals</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-foreground">₹{totalBaseSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-green-600">₹{totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-destructive">₹{totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-foreground">₹{totalNetSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {structuresWithTotals.map((structure) => (
          <div key={structure.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-semibold text-foreground">{structure.structure_name}</h3>
                <p className="text-sm text-muted-foreground">{structure.designation || 'General'}</p>
              </div>
              <div className="flex gap-2">
                {canUpdate && (
                  <Button size="sm" variant="outline">
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {canDelete && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => handleDelete(structure.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Base Salary</p>
                <p className="font-medium text-foreground">₹{structure.basic_salary.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Earnings</p>
                <p className="font-medium text-green-600">₹{structure.totalEarnings.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Deductions</p>
                <p className="font-medium text-destructive">₹{structure.totalDeductions.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Net Salary</p>
                <p className="font-medium text-foreground">₹{structure.netSalary.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        ))}
        {structuresWithTotals.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No salary structures found.</p>
        )}
      </div>

      {/* Create Structure Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Salary Structure</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Structure Name *</Label>
                <Input 
                  value={formData.structure_name} 
                  onChange={(e) => setFormData({ ...formData, structure_name: e.target.value })}
                  placeholder="e.g., Senior Teacher Structure" 
                />
              </div>
              <div className="space-y-2">
                <Label>Basic Salary *</Label>
                <Input 
                  type="number"
                  value={formData.basic_salary} 
                  onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                  placeholder="Enter base salary" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input 
                  value={formData.designation} 
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g., Senior Teacher" 
                />
              </div>
              <div className="space-y-2">
                <Label>Employment Type</Label>
                <Select 
                  value={formData.employment_type} 
                  onValueChange={(value) => setFormData({ ...formData, employment_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Probation">Probation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Effective From</Label>
              <Input 
                type="date"
                value={formData.effective_from} 
                onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
              />
            </div>

            {/* Summary Preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-border rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Base</p>
                <p className="font-semibold text-foreground">
                  ₹{formData.basic_salary ? parseFloat(formData.basic_salary).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                </p>
              </div>
              <div className="border border-border rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Earnings</p>
                <p className="font-semibold text-green-600">₹0.00</p>
                <p className="text-xs text-muted-foreground">Add after creation</p>
              </div>
              <div className="border border-border rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Deductions</p>
                <p className="font-semibold text-destructive">₹0.00</p>
                <p className="text-xs text-muted-foreground">Add after creation</p>
              </div>
              <div className="border border-border rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Net</p>
                <p className="font-semibold text-foreground">
                  ₹{formData.basic_salary ? parseFloat(formData.basic_salary).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleSubmit}
                disabled={insertMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {insertMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Structure
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalaryStructures;