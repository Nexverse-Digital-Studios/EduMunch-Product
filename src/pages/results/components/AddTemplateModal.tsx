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

interface AddTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateName: string;
  onTemplateNameChange: (value: string) => void;
  templateCode: string;
  onTemplateCodeChange: (value: string) => void;
  templateType: string;
  onTemplateTypeChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const AddTemplateModal = ({
  open,
  onOpenChange,
  templateName,
  onTemplateNameChange,
  templateCode,
  onTemplateCodeChange,
  templateType,
  onTemplateTypeChange,
  onSubmit,
  onCancel,
  isLoading,
}: AddTemplateModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Test Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>
              Template Name<span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Enter template name"
              value={templateName}
              onChange={(e) => onTemplateNameChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>
              Template Code<span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g., MIDTERM, FINAL"
              value={templateCode}
              onChange={(e) => onTemplateCodeChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={templateType} onValueChange={onTemplateTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INTERNAL">Internal</SelectItem>
                <SelectItem value="EXTERNAL">External</SelectItem>
              </SelectContent>
            </Select>
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
              Add Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
