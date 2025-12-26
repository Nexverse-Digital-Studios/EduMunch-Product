/**
 * Lecture Template Form Component
 * ================================
 * Reusable form for creating and editing lecture templates
 */

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { LectureTemplateFormData, DAYS_OF_WEEK } from "./types";

interface SubjectDB {
  id: string;
  subject_name: string;
  subject_code: string;
}

interface TeacherDB {
  id: string;
  first_name: string;
  last_name: string;
  employee_code: string;
}

interface LectureTemplateFormProps {
  initialData?: Partial<LectureTemplateFormData>;
  onSubmit: (data: LectureTemplateFormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
}

const defaultFormData: LectureTemplateFormData = {
  template_name: "",
  subject_id: "",
  duration_minutes: 60,
  default_teacher_id: "",
  description: "",
  start_time: "",
  end_time: "",
  day_of_week: "",
  is_active: true,
};

const LectureTemplateForm = ({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
}: LectureTemplateFormProps) => {
  const [formData, setFormData] = useState<LectureTemplateFormData>({
    ...defaultFormData,
    ...initialData,
  });

  // Fetch subjects
  const { data: subjectsData } = useSupabaseTable<SubjectDB>(TABLES.SUBJECTS, {
    orderBy: { column: "subject_name", ascending: true },
  });

  // Fetch teachers
  const { data: teachersData } = useSupabaseTable<TeacherDB>(TABLES.TEACHERS, {
    filters: { status: "active" },
    orderBy: { column: "first_name", ascending: true },
  });

  const subjects = subjectsData || [];
  const teachers = teachersData || [];

  useEffect(() => {
    if (initialData) {
      setFormData({ ...defaultFormData, ...initialData });
    }
  }, [initialData]);

  const handleChange = (
    field: keyof LectureTemplateFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateDuration = () => {
    if (formData.start_time && formData.end_time) {
      const start = new Date(`2000-01-01T${formData.start_time}`);
      const end = new Date(`2000-01-01T${formData.end_time}`);
      const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
      if (diffMinutes > 0) {
        handleChange("duration_minutes", diffMinutes);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Template Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template_name">Template Name *</Label>
              <Input
                id="template_name"
                value={formData.template_name}
                onChange={(e) => handleChange("template_name", e.target.value)}
                placeholder="e.g., Morning Physics Class"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject_id">Subject</Label>
              <Select
                value={formData.subject_id}
                onValueChange={(value) => handleChange("subject_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific subject</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.subject_name} ({subject.subject_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_teacher_id">Default Teacher</Label>
              <Select
                value={formData.default_teacher_id}
                onValueChange={(value) =>
                  handleChange("default_teacher_id", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No default teacher</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name} (
                      {teacher.employee_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="day_of_week">Day of Week</Label>
              <Select
                value={formData.day_of_week}
                onValueChange={(value) => handleChange("day_of_week", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any day</SelectItem>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Optional description for this template..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Time Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Time Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => {
                  handleChange("start_time", e.target.value);
                  setTimeout(calculateDuration, 0);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => {
                  handleChange("end_time", e.target.value);
                  setTimeout(calculateDuration, 0);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
              <Input
                id="duration_minutes"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) =>
                  handleChange(
                    "duration_minutes",
                    parseInt(e.target.value) || 0
                  )
                }
                min={1}
                max={480}
                required
              />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Enter start and end times, and duration will be calculated
            automatically. Or set duration directly without specific times.
          </p>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is_active" className="text-base">
                Active Status
              </Label>
              <p className="text-sm text-muted-foreground">
                Inactive templates won't appear in scheduling options
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange("is_active", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default LectureTemplateForm;
