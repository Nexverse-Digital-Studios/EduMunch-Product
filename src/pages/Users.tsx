import { useState } from "react";
import { Plus, Pencil, Trash2, Clock, Users as UsersIcon, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

interface User {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  role: string;
  avatarColor: string;
}

const usersData: User[] = [
  { id: "1", name: "APCH", initials: "AP", email: "apch@vraz.com", phone: "9658741256", role: "Teacher", avatarColor: "bg-primary" },
  { id: "2", name: "ASB", initials: "AS", email: "asb@vraz.com", phone: "8596325769", role: "Teacher", avatarColor: "bg-purple-500" },
  { id: "3", name: "ASM", initials: "AS", email: "anup@vraz.com", phone: "8596745220", role: "Teacher", avatarColor: "bg-purple-500" },
  { id: "4", name: "Aarav Sharma", initials: "AS", email: "aarav.sharma25@email.com", phone: "9820012345", role: "Student", avatarColor: "bg-green-500" },
  { id: "5", name: "Anand Gupta", initials: "AG", email: "", phone: "9685658986", role: "Parent", avatarColor: "bg-yellow-500" },
  { id: "6", name: "Anand Singh", initials: "AS", email: "", phone: "9685658987", role: "Parent", avatarColor: "bg-yellow-400" },
  { id: "7", name: "Ananya Iyer", initials: "AI", email: "ananyai@email.com", phone: "9819812345", role: "Student", avatarColor: "bg-gray-400" },
];

const roles = [
  "super_admin", "branch_admin", "front_desk", "teacher", 
  "employee", "Branch Management", "Branch Inventory management", "Support Role"
];

const branches = [
  { id: "1", name: "Palava Branch" },
  { id: "2", name: "Thane HO Branch" },
  { id: "3", name: "Kalyan Branch" },
];

const Users = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterRole, setFilterRole] = useState("all");

  const filteredUsers = filterRole === "all" 
    ? usersData 
    : usersData.filter(u => u.role.toLowerCase() === filterRole.toLowerCase());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <UsersIcon className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filter Section */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="space-y-2 flex-1 max-w-xs">
            <Label className="text-muted-foreground">Filter by Role</Label>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button className="bg-primary hover:bg-primary/90">
              <Filter className="h-4 w-4 mr-2" />
              Apply
            </Button>
            <Button variant="outline" onClick={() => setFilterRole("all")}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/20">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className={user.avatarColor}>
                      <AvatarFallback className="text-white font-medium">
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-primary">{user.email || "-"}</TableCell>
                <TableCell className="text-foreground">{user.phone}</TableCell>
                <TableCell className="text-foreground">{user.role}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Clock className="h-4 w-4" />
                    </Button>
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
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className={user.avatarColor}>
                  <AvatarFallback className="text-white font-medium">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{user.name}</p>
                  <p className="text-sm text-primary">{user.email || "-"}</p>
                  <p className="text-sm text-muted-foreground">{user.phone}</p>
                  <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24 bg-teal-600">
                <AvatarFallback className="text-white text-2xl font-medium">
                  NA
                </AvatarFallback>
              </Avatar>
              <Button variant="link" className="text-primary">Upload Photo</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name <span className="text-destructive">*</span></Label>
                <Input placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input type="email" placeholder="super@admin.com" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number <span className="text-destructive">*</span></Label>
                <Input placeholder="Enter phone number" />
              </div>
              <div className="space-y-2">
                <Label>Password <span className="text-destructive">*</span></Label>
                <Input type="password" placeholder="••••••••••" />
              </div>
              <div className="space-y-2">
                <Label>Role <span className="text-destructive">*</span></Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Branch (for staff)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Joining Date</Label>
                <Input type="date" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90">Create User</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;