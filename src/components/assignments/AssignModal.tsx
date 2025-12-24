import { X, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AssignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssignModal = ({ open, onOpenChange }: AssignModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Assign to Batch</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Select Batch</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose a batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jee2026">JEE Advance Batch 2026 (Palava Branch)</SelectItem>
                <SelectItem value="neet2026">NEET Foundation 2026</SelectItem>
                <SelectItem value="cet2026">CET 1 Year Batch 2026</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Due Date</label>
            <Input type="date" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Instructions (Optional)</label>
            <Input placeholder="Any additional instructions..." />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="gap-2">
            <Send className="h-4 w-4" />
            Assign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
