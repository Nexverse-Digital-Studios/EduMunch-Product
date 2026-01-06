/**
 * Create Grievance Dialog
 * ========================
 * Dialog for parents to create a new grievance/communication with a teacher
 */

import { useState, useEffect } from "react";
import { Loader2, AlertCircle, GraduationCap, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useParentChildData } from "@/hooks/useParentChildData";
import { useGrievances } from "./useGrievances";
import {
  GRIEVANCE_CATEGORIES,
  GRIEVANCE_PRIORITIES,
  GrievanceCategory,
  GrievancePriority,
} from "./types";

interface CreateGrievanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TeacherOption {
  id: string;
  first_name: string;
  last_name: string;
  employee_code: string;
  email: string | null;
  subject_name: string;
}

export const CreateGrievanceDialog = ({
  open,
  onOpenChange,
}: CreateGrievanceDialogProps) => {
  const { toast } = useToast();
  const { children, isLoading: childrenLoading } = useParentChildData();
  const { createGrievance, getTeachersForStudent } = useGrievances();

  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GrievanceCategory>("General");
  const [priority, setPriority] = useState<GrievancePriority>("Normal");

  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch teachers when student changes
  useEffect(() => {
    if (selectedStudent) {
      setLoadingTeachers(true);
      setSelectedTeacher("");
      getTeachersForStudent(selectedStudent)
        .then(setTeachers)
        .finally(() => setLoadingTeachers(false));
    } else {
      setTeachers([]);
    }
  }, [selectedStudent, getTeachersForStudent]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedStudent("");
      setSelectedTeacher("");
      setSubject("");
      setDescription("");
      setCategory("General");
      setPriority("Normal");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    // Validation
    if (!selectedStudent) {
      setError("Please select a student");
      return;
    }
    if (!selectedTeacher) {
      setError("Please select a teacher");
      return;
    }
    if (!subject.trim()) {
      setError("Please enter a subject");
      return;
    }
    if (!description.trim()) {
      setError("Please enter a description");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await createGrievance({
      student_id: selectedStudent,
      teacher_id: selectedTeacher,
      subject: subject.trim(),
      description: description.trim(),
      category,
      priority,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Grievance Created",
        description: "Your message has been sent to the teacher.",
      });
      onOpenChange(false);
    } else {
      setError(result.error || "Failed to create grievance");
    }
  };

  const selectedStudentData = children.find((c) => c.id === selectedStudent);
  const selectedTeacherData = teachers.find((t) => t.id === selectedTeacher);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Grievance / Communication</DialogTitle>
          <DialogDescription>
            Start a conversation with a teacher about your child
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Student Selection */}
          <div className="space-y-2">
            <Label>Select Child *</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Select your child" />
              </SelectTrigger>
              <SelectContent>
                {childrenLoading ? (
                  <div className="p-2 text-center">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  </div>
                ) : children.length === 0 ? (
                  <div className="p-2 text-center text-muted-foreground">
                    No children found
                  </div>
                ) : (
                  children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        {child.full_name} - {child.class_name}{" "}
                        {child.section_name}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Teacher Selection */}
          <div className="space-y-2">
            <Label>Select Teacher *</Label>
            <Select
              value={selectedTeacher}
              onValueChange={setSelectedTeacher}
              disabled={!selectedStudent || loadingTeachers}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingTeachers
                      ? "Loading teachers..."
                      : !selectedStudent
                      ? "First select a child"
                      : "Select a teacher"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {loadingTeachers ? (
                  <div className="p-2 text-center">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  </div>
                ) : teachers.length === 0 ? (
                  <div className="p-2 text-center text-muted-foreground">
                    No teachers found for this class
                  </div>
                ) : (
                  teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {teacher.first_name} {teacher.last_name} (
                        {teacher.subject_name})
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Info Preview */}
          {selectedStudentData && selectedTeacherData && (
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span>
                  <strong>Student:</strong> {selectedStudentData.full_name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>
                  <strong>Teacher:</strong> {selectedTeacherData.first_name}{" "}
                  {selectedTeacherData.last_name}
                </span>
              </div>
            </div>
          )}

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as GrievanceCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRIEVANCE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as GrievancePriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRIEVANCE_PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label>Subject *</Label>
            <Input
              placeholder="Brief subject of your concern"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={255}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea
              placeholder="Describe your concern in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Send to Teacher
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGrievanceDialog;
