import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { ScheduleSlot, TeacherOption } from "./types";

interface AddEditClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: ScheduleSlot[];
  editingSlot: {
    timeIndex: number;
    branch: string;
    classInfo: {
      id: string;
      subject: string;
      teacher: string;
      isMerged?: boolean;
    } | null;
  } | null;
  formData: {
    subject: string;
    teacher: string;
    isMerged: boolean;
  };
  onFormDataChange: (data: {
    subject: string;
    teacher: string;
    isMerged: boolean;
  }) => void;
  subjects: string[];
  teachers: TeacherOption[];
  onSave: () => void;
}

export const AddEditClassModal = ({
  open,
  onOpenChange,
  schedule,
  editingSlot,
  formData,
  onFormDataChange,
  subjects,
  teachers,
  onSave,
}: AddEditClassModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingSlot?.classInfo ? "Edit Class" : "Add Class"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {editingSlot && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <p>
                <strong>Time:</strong> {schedule[editingSlot.timeIndex]?.time}
              </p>
              <p>
                <strong>Branch:</strong> {editingSlot.branch}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label>Subject</Label>
            <Select
              value={formData.subject}
              onValueChange={(v) =>
                onFormDataChange({ ...formData, subject: v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Teacher</Label>
            <Select
              value={formData.teacher}
              onValueChange={(v) =>
                onFormDataChange({ ...formData, teacher: v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isMerged"
              checked={formData.isMerged}
              onCheckedChange={(checked) =>
                onFormDataChange({ ...formData, isMerged: checked as boolean })
              }
            />
            <Label
              htmlFor="isMerged"
              className="text-sm font-normal cursor-pointer"
            >
              Mark as merged class (combined batches)
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            {editingSlot?.classInfo ? "Update" : "Add"} Class
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
