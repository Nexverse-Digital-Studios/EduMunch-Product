import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
}

const branchesData: Branch[] = [
  { id: "1", name: "Kalyan Branch", code: "KAL", address: "Near railway station" },
  { id: "2", name: "Manpada Branch", code: "MAN", address: "Sampangi Rama Nagara" },
  { id: "3", name: "Palava Branch", code: "PAL", address: "Palava station road" },
  { id: "4", name: "Thane HO Branch", code: "THN", address: "Near Station" },
];

const Branches = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl flex items-center gap-3">
          <span>🔄</span> Branch Management
        </h1>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Branch
        </Button>
      </div>

      <Card>
        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branchesData.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell className="text-muted-foreground">{branch.code}</TableCell>
                  <TableCell>{branch.address}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
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
        <div className="md:hidden divide-y divide-border">
          {branchesData.map((branch) => (
            <div key={branch.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{branch.name}</p>
                  <p className="text-sm text-muted-foreground">{branch.code}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm">{branch.address}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Create Branch Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Branch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Branch Name</label>
              <Input placeholder="Enter branch name" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Branch Code</label>
              <Input placeholder="Enter code (e.g., KAL)" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Address</label>
              <Input placeholder="Enter address" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button>Create Branch</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Branches;
