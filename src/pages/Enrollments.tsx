import { useState } from "react";
import { Plus, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const batches = [
  { id: "26TJMA1", name: "26TJMA1 (Thane HO Branch)" },
  { id: "JEE2026", name: "JEE Advance Batch 2026" },
  { id: "NEET2026", name: "NEET Batch 2026" },
];

const enrolledStudents = [
  { id: 1, name: "Kumar Kalani", email: "kumar@vraz.com", phone: "9191919191", selected: false },
  { id: 2, name: "Student 2", email: "st12@gmail.com", phone: "9898988888", selected: false },
];

const Enrollments = () => {
  const [selectedBatch, setSelectedBatch] = useState("26TJMA1");
  const [students, setStudents] = useState(enrolledStudents);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  const toggleStudentSelection = (id: number) => {
    setStudents(students.map(s => 
      s.id === id ? { ...s, selected: !s.selected } : s
    ));
  };

  const selectedCount = students.filter(s => s.selected).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Enrollment Management</h1>
        <div className="flex gap-3">
          <Button onClick={() => setIsEnrollModalOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Enroll Students
          </Button>
          <Button variant="outline" disabled={selectedCount === 0} className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <Send className="h-4 w-4 mr-2" />
            Transfer Selected
          </Button>
        </div>
      </div>

      {/* Batch Selection */}
      <div className="space-y-2">
        <Label className="text-muted-foreground">Select a Batch to Manage</Label>
        <Select value={selectedBatch} onValueChange={setSelectedBatch}>
          <SelectTrigger className="w-full sm:w-80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {batches.map((batch) => (
              <SelectItem key={batch.id} value={batch.id}>
                {batch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Enrolled Students Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Enrolled Students in {selectedBatch}</h2>
          <p className="text-sm text-muted-foreground">{students.length} students enrolled</p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead className="w-12"></TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id} className="hover:bg-muted/20">
                  <TableCell>
                    <Checkbox 
                      checked={student.selected}
                      onCheckedChange={() => toggleStudentSelection(student.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{student.name}</TableCell>
                  <TableCell className="text-primary">{student.email}</TableCell>
                  <TableCell className="text-foreground">{student.phone}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {students.map((student) => (
            <div key={student.id} className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={student.selected}
                    onCheckedChange={() => toggleStudentSelection(student.id)}
                  />
                  <span className="font-medium text-foreground">{student.name}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm space-y-1 pl-8">
                <p><span className="text-muted-foreground">Email:</span> <span className="text-primary">{student.email}</span></p>
                <p><span className="text-muted-foreground">Phone:</span> <span className="text-foreground">{student.phone}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enroll Students Modal */}
      <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enroll New Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Student Name</Label>
              <Input placeholder="Enter student name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="Enter email address" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input placeholder="Enter phone number" />
            </div>
            <div className="space-y-2">
              <Label>Batch</Label>
              <Select defaultValue={selectedBatch}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsEnrollModalOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-primary">Enroll Student</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Enrollments;
