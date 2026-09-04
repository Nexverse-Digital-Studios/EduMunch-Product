/**
 * Lecture Template Detail Dialog
 * ================================
 * Modal dialog for viewing lecture template details
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, BookOpen, User, FileText, Info } from "lucide-react";
import { LectureTemplateDB, DAYS_OF_WEEK } from "./types";

interface SubjectDB {
  id: string;
  subject_name: string;
  subject_code: string;
}

interface LectureTemplateDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: LectureTemplateDB | null;
  subjects: SubjectDB[];
}

export const LectureTemplateDetailDialog = ({
  open,
  onOpenChange,
  template,
  subjects,
}: LectureTemplateDetailDialogProps) => {
  if (!template) return null;

  const getSubjectName = (subjectId: string | null) => {
    if (!subjectId) return "N/A";
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.subject_name || "Unknown";
  };

  const getDayName = (dayOfWeek: number | null) => {
    if (dayOfWeek === null) return "Any Day";
    const day = DAYS_OF_WEEK.find((d) => parseInt(d.value) === dayOfWeek);
    return day?.label || "Unknown";
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} mins`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} mins`;
  };

  const formatTime = (time: string | null) => {
    if (!time) return "Not set";
    // Convert 24h to 12h format
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${period}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {template.template_name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-4 p-1">
            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={template.is_active ? "default" : "secondary"}>
                {template.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>

            {/* Schedule Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Day of Week</p>
                    <p className="font-medium">{getDayName(template.day_of_week)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{formatDuration(template.duration_minutes)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Start Time</p>
                    <p className="font-medium">{formatTime(template.start_time)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Time</p>
                    <p className="font-medium">{formatTime(template.end_time)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subject & Teacher Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      Subject
                    </p>
                    <p className="font-medium">{getSubjectName(template.subject_id)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Default Teacher
                    </p>
                    <p className="font-medium">{template.default_teacher_id || "Not assigned"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {template.description && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{template.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Template ID</p>
                    <p className="font-mono text-xs">{template.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p>
                      {template.created_at
                        ? new Date(template.created_at).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default LectureTemplateDetailDialog;
