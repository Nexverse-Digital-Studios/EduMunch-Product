import { useState } from "react";
import { Search, Plus, Calendar, Edit, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

// Database types
interface TeacherDB {
  id: string;
  user_id?: string;
  employee_code: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email?: string;
  phone: string;
  designation?: string;
  department?: string;
  status: string;
  created_at: string;
}

// Mock data fallback
const mockEmployees = [
  { id: "41236", name: "Akshay Pandey", code: "APCH", role: "teacher", designation: "Chemistry Faculty", avatar: "AP", color: "bg-blue-500" },
  { id: "52684", name: "Aniket Singh", code: "ASB", role: "teacher", designation: "Biology Faculty", avatar: "AS", color: "bg-yellow-500" },
  { id: "3", name: "Anup Singh", code: "ASM", role: "teacher", designation: "Maths faculty", avatar: "AS", color: "bg-teal-500" },
  { id: "74268", name: "Kumar Ahire", code: "KAP", role: "teacher", designation: "Physics Faculty", avatar: "KA", color: "bg-purple-500" },
];

const Employees = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [designationFilter, setDesignationFilter] = useState("all");
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch teachers from Supabase
  const { data: teachers, isLoading, createMutation, deleteMutation } = useSupabaseTable<TeacherDB>(
    TABLES.TEACHERS,
    { orderBy: { column: 'first_name', ascending: true } }
  );
  
  // Generate avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-teal-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-cyan-500'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };
  
  // Map database teachers to display format
  const employees = teachers?.map(t => ({
    id: t.id,
    name: `${t.first_name} ${t.last_name}`,
    code: t.employee_code,
    role: 'teacher',
    designation: t.designation || 'Faculty',
    avatar: `${t.first_name[0]}${t.last_name[0]}`,
    color: getAvatarColor(t.first_name)
  })) || mockEmployees;

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading employees...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Employee Management</h1>
        <Button onClick={() => setIsOnboardModalOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Onboard Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="science">Science</SelectItem>
            <SelectItem value="arts">Arts</SelectItem>
            <SelectItem value="commerce">Commerce</SelectItem>
          </SelectContent>
        </Select>
        <Select value={designationFilter} onValueChange={setDesignationFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Designations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Designations</SelectItem>
            <SelectItem value="chemistry">Chemistry Faculty</SelectItem>
            <SelectItem value="physics">Physics Faculty</SelectItem>
            <SelectItem value="biology">Biology Faculty</SelectItem>
            <SelectItem value="maths">Maths Faculty</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Employee</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id} className="hover:bg-muted/20">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full ${employee.color} flex items-center justify-center text-white font-medium text-sm`}>
                      {employee.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">Code: {employee.code}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-foreground">{employee.id}</TableCell>
                <TableCell className="text-muted-foreground">{employee.role}</TableCell>
                <TableCell className="text-foreground">{employee.designation}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
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
      <div className="md:hidden space-y-3">
        {filteredEmployees.map((employee) => (
          <div key={employee.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-full ${employee.color} flex items-center justify-center text-white font-medium`}>
                {employee.avatar}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{employee.name}</p>
                <p className="text-sm text-muted-foreground">Code: {employee.code}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">ID: </span>
                <span className="text-foreground">{employee.id}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Role: </span>
                <span className="text-foreground">{employee.role}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Designation: </span>
                <span className="text-foreground">{employee.designation}</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Calendar className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Onboard Employee Modal */}
      <Dialog open={isOnboardModalOpen} onOpenChange={setIsOnboardModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Onboard New Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="Enter full name" />
            </div>
            <div className="space-y-2">
              <Label>Employee Code</Label>
              <Input placeholder="Enter employee code" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="Enter email address" />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="arts">Arts</SelectItem>
                  <SelectItem value="commerce">Commerce</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chemistry">Chemistry Faculty</SelectItem>
                  <SelectItem value="physics">Physics Faculty</SelectItem>
                  <SelectItem value="biology">Biology Faculty</SelectItem>
                  <SelectItem value="maths">Maths Faculty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsOnboardModalOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-primary">Onboard Employee</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;
