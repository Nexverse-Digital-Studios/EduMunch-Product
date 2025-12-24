import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, Lock, Shield, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
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

interface Role {
  id: string;
  name: string;
  isSystem: boolean;
}

const rolesData: Role[] = [
  { id: "1", name: "Super Admin", isSystem: true },
  { id: "2", name: "Branch Admin", isSystem: false },
  { id: "3", name: "Front Desk", isSystem: false },
  { id: "4", name: "Teacher", isSystem: true },
  { id: "5", name: "Student", isSystem: true },
  { id: "6", name: "Parent", isSystem: true },
  { id: "7", name: "Employee", isSystem: true },
  { id: "8", name: "Branch Management", isSystem: false },
  { id: "9", name: "Branch Inventory Management", isSystem: false },
  { id: "10", name: "Support Role", isSystem: false },
];

const allModules = [
  "Payments", "Courses", "Lms Content", "Subjects", "Topics", "Batches", 
  "Batch Faculty", "Timetables", "Attendance", "Assignments", "Results", 
  "Lecture Templates", "Users", "Roles", "Branches", "Inventory", 
  "Tie-Up Schools", "Employees", "Salary Structures", "Payslips", 
  "Leave Management", "Working Hours", "Doubts", "Notifications", 
  "Feedback", "Grievances", "PTM Requests", "Support Tickets"
];

const Roles = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [activeModules, setActiveModules] = useState<string[]>([]);

  const toggleModule = (module: string) => {
    setSelectedModules(prev => 
      prev.includes(module) 
        ? prev.filter(m => m !== module)
        : [...prev, module]
    );
  };

  const moveToActive = () => {
    setActiveModules(prev => [...prev, ...selectedModules.filter(m => !prev.includes(m))]);
    setSelectedModules([]);
  };

  const moveToAll = () => {
    setActiveModules(prev => prev.filter(m => !selectedModules.includes(m)));
    setSelectedModules([]);
  };

  const openCreateModal = () => {
    setRoleName("");
    setSelectedModules([]);
    setActiveModules([]);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Roles & Permissions</h1>
        </div>
        <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Role Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rolesData.map((role) => (
              <TableRow key={role.id} className="hover:bg-muted/20">
                <TableCell>
                  <div className="flex items-center gap-3">
                    {role.isSystem && <Lock className="h-4 w-4 text-muted-foreground" />}
                    <span className={`font-medium ${role.isSystem ? "text-muted-foreground" : "text-foreground"}`}>
                      {role.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {role.isSystem ? (
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {rolesData.map((role) => (
          <div key={role.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {role.isSystem && <Lock className="h-4 w-4 text-muted-foreground" />}
                <span className={`font-semibold ${role.isSystem ? "text-muted-foreground" : "text-foreground"}`}>
                  {role.name}
                </span>
              </div>
              <div className="flex gap-2">
                {role.isSystem ? (
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button size="sm" variant="outline">
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Role Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label>Role Name</Label>
              <Input 
                value={roleName} 
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Enter role name" 
              />
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold">Modules</Label>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4">
                {/* All Modules */}
                <div className="border border-border rounded-lg">
                  <div className="p-3 border-b border-border bg-muted/30">
                    <h4 className="font-semibold text-foreground">All Modules</h4>
                  </div>
                  <ScrollArea className="h-[250px] p-3">
                    <div className="space-y-2">
                      {allModules.filter(m => !activeModules.includes(m)).map((module) => (
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
                  <Button size="sm" variant="outline" onClick={moveToActive}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={moveToAll}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>

                {/* Active Modules */}
                <div className="border border-border rounded-lg">
                  <div className="p-3 border-b border-border bg-muted/30">
                    <h4 className="font-semibold text-foreground">Active Modules</h4>
                  </div>
                  <ScrollArea className="h-[250px] p-3">
                    {activeModules.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No modules granted</p>
                    ) : (
                      <div className="space-y-2">
                        {activeModules.map((module) => (
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
              <p className="text-sm text-muted-foreground">
                Active modules will grant <span className="font-medium underline">read/write/delete</span> permissions by default.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90">Create Role</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Roles;