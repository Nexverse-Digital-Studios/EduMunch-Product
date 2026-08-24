/**
 * Create Grievance Dialog
 * ========================
 * Dialog for parents to create a new grievance/communication with admin
 */

import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
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

export const CreateGrievanceDialog = ({
  open,
  onOpenChange,
}: CreateGrievanceDialogProps) => {
  const { toast } = useToast();
  const { children, isLoading: childrenLoading } = useParentChildData();
  const { createGrievance } = useGrievances();

  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GrievanceCategory>("General");
  const [priority, setPriority] = useState<GrievancePriority>("Normal");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedStudent("");
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
      setError("Please select a child");
      return;
    }
    if (!subject.trim()) {
      setError("Please enter a subject");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await createGrievance({
      student_id: selectedStudent,
      subject: subject.trim(),
      description: description.trim(),
      category,
      priority,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Grievance Created",
        description: "Your grievance has been submitted to the admin.",
      });
      onOpenChange(false);
    } else {
      setError(result.error || "Failed to create grievance");
    }
  };

  const selectedStudentData = children.find((c) => c.id === selectedStudent);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Grievance</DialogTitle>
          <DialogDescription>
            Submit a grievance or concern to the administration
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
                      {child.full_name} - {child.class_name}{" "}
                      {child.section_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Student Info Preview */}
          {selectedStudentData && (
            <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
              <p>
                <strong>Child:</strong> {selectedStudentData.full_name}
              </p>
              <p className="text-muted-foreground text-xs">
                {selectedStudentData.class_name}{" "}
                {selectedStudentData.section_name}
              </p>
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
