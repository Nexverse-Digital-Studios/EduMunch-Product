import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";
import type { ExamType } from "./types";

interface AddTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examTypes: ExamType[];
  testName: string;
  onTestNameChange: (value: string) => void;
  testCode: string;
  onTestCodeChange: (value: string) => void;
  selectedTemplateId: string;
  onTemplateIdChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const AddTestModal = ({
  open,
  onOpenChange,
  examTypes,
  testName,
  onTestNameChange,
  testCode,
  onTestCodeChange,
  selectedTemplateId,
  onTemplateIdChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onSubmit,
  onCancel,
  isLoading,
}: AddTestModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Test</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>
              Test Name<span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Enter test name"
              value={testName}
              onChange={(e) => onTestNameChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>
              Test Code<span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g., MID2025"
              value={testCode}
              onChange={(e) => onTestCodeChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>
              Template<span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedTemplateId}
              onValueChange={onTemplateIdChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {examTypes.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.exam_type_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Start Date<span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={onSubmit}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Test
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
