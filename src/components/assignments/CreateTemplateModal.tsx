import { X, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTemplateModal = ({ open, onOpenChange }: CreateTemplateModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Assignment Template</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Title</label>
              <Input placeholder="Theory Exam" defaultValue="Theory Exam" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Subject</label>
              <Select defaultValue="biology">
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="biology">Biology</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="maths">Mathematics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <Textarea 
              placeholder="Enter assignment description..." 
              rows={4}
              defaultValue="Answer the below questions
1. Explain the anatomy of the frog.
2. Explain DNA Formation."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Attachments</label>
            <div className="flex items-center gap-3 mb-3">
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload File
              </Button>
              <span className="text-sm text-muted-foreground">Supported: Images, PDF, Docs (Max 15MB)</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="w-32 h-24 rounded-lg border border-border bg-muted flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Diagram.png</span>
              </div>
              <div className="w-32 h-24 rounded-lg border border-border bg-muted flex flex-col items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground text-center px-2 truncate w-full">file-17651809...pdf</span>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Assignment Type</label>
            <Select defaultValue="theory">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="theory">Theory</SelectItem>
                <SelectItem value="mcq">MCQ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Update Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
