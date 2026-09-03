/**
 * AddContentDialog Component
 * ===========================
 * Dialog for adding content to a topic
 * Used in TopicsList and TopicDetail pages
 */

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    content_type: string;
    content_title: string;
    content_url: string;
  }) => void;
  isPending?: boolean;
}

export const AddContentDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isPending = false,
}: AddContentDialogProps) => {
  const [formData, setFormData] = useState({
    content_type: "",
    content_title: "",
    content_url: "",
  });

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData({ content_type: "", content_title: "", content_url: "" });
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Content</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>
              Content Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.content_type}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, content_type: val }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Video">Video</SelectItem>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="Document">Document</SelectItem>
                <SelectItem value="Link">Link</SelectItem>
                <SelectItem value="Image">Image</SelectItem>
                <SelectItem value="Quiz">Quiz</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Enter content title"
              value={formData.content_title}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  content_title: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>URL / File</Label>
            <Input
              placeholder="Enter URL or upload file"
              value={formData.content_url}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  content_url: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleSubmit}
              disabled={
                isPending ||
                !formData.content_type ||
                !formData.content_title.trim()
              }
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Add Content
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddContentDialog;
