import { useState } from "react";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

interface Subject {
  id: string;
  name: string;
  code: string;
  type: string;
}

const subjectsData: Subject[] = [
  { id: "1", name: "Biology", code: "BIO", type: "Theory" },
  { id: "2", name: "Chemistry", code: "Chem", type: "Theory" },
  { id: "3", name: "GK", code: "GK", type: "General knowledge" },
  { id: "4", name: "Math", code: "Math", type: "Theory" },
  { id: "5", name: "Phy", code: "PHY", type: "Theory" },
  { id: "6", name: "Random Subject Name", code: "RSN", type: "Test purpose" },
];

const Subjects = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "", type: "" });

  const openAddModal = () => {
    setEditingSubject(null);
    setFormData({ name: "", code: "", type: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({ name: subject.name, code: subject.code, type: subject.type });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Subject Management</h1>
        </div>
        <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Subject Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjectsData.map((subject) => (
              <TableRow key={subject.id} className="hover:bg-muted/20">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{subject.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{subject.code}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {subject.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditModal(subject)}>
                      <Pencil className="h-4 w-4" />
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
        {subjectsData.map((subject) => (
          <div key={subject.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{subject.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">Code: {subject.code}</p>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {subject.type}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEditModal(subject)}>
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

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {editingSubject ? "Edit Subject" : "Add Subject"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Subject Name</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter subject name" 
              />
            </div>
            <div className="space-y-2">
              <Label>Subject Code</Label>
              <Input 
                value={formData.code} 
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Enter subject code" 
              />
            </div>
            <div className="space-y-2">
              <Label>Type (e.g., Theory)</Label>
              <Input 
                value={formData.type} 
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="Enter type" 
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button className="bg-primary hover:bg-primary/90">
                {editingSubject ? "Update Subject" : "Add Subject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subjects;