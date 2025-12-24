import { useState, useEffect } from "react";
import { X, Upload, Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupabaseQuery, useSupabaseInsert } from "@/hooks/useSupabaseQuery";
import { toast } from "@/hooks/use-toast";

const INDEX_TOKEN = import.meta.env.VITE_INDEX_TOKEN || '1EMAET';

interface Subject {
  id: string;
  name: string;
}

interface Section {
  id: string;
  name: string;
  class_id: string;
  classes?: { id: string; name: string } | null;
}

interface CreateTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateTemplateModal = ({ open, onOpenChange, onSuccess }: CreateTemplateModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject_id: "",
    section_id: "",
    assignment_type: "Homework" as 'Homework' | 'Project' | 'Practice' | 'Lab Work',
    deadline: "",
    max_marks: "",
    is_published: false,
  });

  // Fetch subjects
  const { data: subjects } = useSupabaseQuery<Subject>(
    `subjects_${INDEX_TOKEN}`,
    ['subjects', INDEX_TOKEN],
    { select: 'id, name', orderBy: { column: 'name', ascending: true } }
  );

  // Fetch sections with class info
  const { data: sections } = useSupabaseQuery<Section>(
    `sections_${INDEX_TOKEN}`,
    ['sections', INDEX_TOKEN],
    { 
      select: 'id, name, class_id, classes:class_id(id, name)', 
      orderBy: { column: 'name', ascending: true } 
    }
  );

  // Insert mutation
  const insertMutation = useSupabaseInsert(`assignments_${INDEX_TOKEN}`, ['assignments', INDEX_TOKEN]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }

    try {
      await insertMutation.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        subject_id: formData.subject_id || null,
        section_id: formData.section_id || null,
        assignment_type: formData.assignment_type,
        deadline: formData.deadline || null,
        max_marks: formData.max_marks ? parseInt(formData.max_marks) : null,
        is_published: formData.is_published,
      });

      toast({ title: "Success", description: "Assignment created successfully" });
      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        subject_id: "",
        section_id: "",
        assignment_type: "Homework",
        deadline: "",
        max_marks: "",
        is_published: false,
      });
    } catch (err) {
      toast({ title: "Error", description: "Failed to create assignment", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input 
                id="title"
                placeholder="Enter assignment title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select 
                value={formData.subject_id} 
                onValueChange={(value) => setFormData({ ...formData, subject_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects?.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="section">Class / Section</Label>
              <Select 
                value={formData.section_id} 
                onValueChange={(value) => setFormData({ ...formData, section_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  {sections?.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.classes?.name || ''} - {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Assignment Type</Label>
              <Select 
                value={formData.assignment_type} 
                onValueChange={(value: 'Homework' | 'Project' | 'Practice' | 'Lab Work') => 
                  setFormData({ ...formData, assignment_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Homework">Homework</SelectItem>
                  <SelectItem value="Project">Project</SelectItem>
                  <SelectItem value="Practice">Practice</SelectItem>
                  <SelectItem value="Lab Work">Lab Work</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              placeholder="Enter assignment description and instructions..." 
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Input 
                id="deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="maxMarks">Maximum Marks</Label>
              <Input 
                id="maxMarks"
                type="number"
                placeholder="e.g., 100"
                value={formData.max_marks}
                onChange={(e) => setFormData({ ...formData, max_marks: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="publish">Publish Immediately</Label>
              <p className="text-sm text-muted-foreground">
                Make this assignment visible to students right away
              </p>
            </div>
            <Switch
              id="publish"
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={insertMutation.isPending} className="gap-2">
              {insertMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create Assignment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
