import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface SalaryStructure {
  id: string;
  title: string;
  baseSalary: number;
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
}

const structuresData: SalaryStructure[] = [
  { id: "1", title: "Basic Faculty Structure", baseSalary: 50000, totalEarnings: 8500, totalDeductions: 9925.80, netSalary: 48574.20 },
  { id: "2", title: "Priya Maam", baseSalary: 25000, totalEarnings: 3000, totalDeductions: 2200, netSalary: 25800 },
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const SalaryStructures = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    baseSalary: "",
    description: "",
  });

  // Calculate totals
  const totalBaseSalary = structuresData.reduce((sum, s) => sum + s.baseSalary, 0);
  const totalEarnings = structuresData.reduce((sum, s) => sum + s.totalEarnings, 0);
  const totalDeductions = structuresData.reduce((sum, s) => sum + s.totalDeductions, 0);
  const totalNetSalary = structuresData.reduce((sum, s) => sum + s.netSalary, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Salary Structures</h1>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Structure
        </Button>
      </div>

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
              <TableHead>Title</TableHead>
              <TableHead>Base Salary</TableHead>
              <TableHead>Total Earnings</TableHead>
              <TableHead>Total Deductions</TableHead>
              <TableHead>Net Salary</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {structuresData.map((structure) => (
              <TableRow key={structure.id} className="hover:bg-muted/20">
                <TableCell className="font-medium text-foreground">{structure.title}</TableCell>
                <TableCell className="text-foreground">₹{structure.baseSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-green-600">₹{structure.totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-destructive">₹{structure.totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-foreground">₹{structure.netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {/* Totals Row */}
            <TableRow className="bg-muted/30 font-semibold">
              <TableCell className="text-foreground">Totals</TableCell>
              <TableCell className="text-foreground">₹{totalBaseSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
              <TableCell className="text-green-600">₹{totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
              <TableCell className="text-destructive">₹{totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
              <TableCell className="text-foreground">₹{totalNetSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {structuresData.map((structure) => (
          <div key={structure.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="font-semibold text-foreground">{structure.title}</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Base Salary</p>
                <p className="font-medium text-foreground">₹{structure.baseSalary.toLocaleString('en-IN')}</p>
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
                <Label>Structure Title</Label>
                <Input 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter title" 
                />
              </div>
              <div className="space-y-2">
                <Label>Base Salary</Label>
                <Input 
                  type="number"
                  value={formData.baseSalary} 
                  onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                  placeholder="Enter base salary" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description" 
              />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-border rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Base</p>
                <p className="font-semibold text-foreground">₹0.00</p>
              </div>
              <div className="border border-border rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Earnings</p>
                <p className="font-semibold text-green-600">₹0.00</p>
              </div>
              <div className="border border-border rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Deductions</p>
                <p className="font-semibold text-destructive">₹0.00</p>
              </div>
              <div className="border border-border rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Net</p>
                <p className="font-semibold text-foreground">₹0.00</p>
              </div>
            </div>

            {/* Import Unpaid Leaves */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-foreground">Import Unpaid Leaves</h4>
                  <p className="text-sm text-muted-foreground">Fetch assigned employees and import deductions.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="Dec">
                    <SelectTrigger className="w-20">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">Year</span>
                  <Input type="number" defaultValue="2025" className="w-20" />
                  <Button variant="outline">Fetch</Button>
                </div>
              </div>
            </div>

            {/* Earnings & Deductions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-600 mb-3">Earnings</h4>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Earning
                </Button>
              </div>
              <div>
                <h4 className="font-semibold text-destructive mb-3">Deductions</h4>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Deduction
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90">Create Structure</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalaryStructures;