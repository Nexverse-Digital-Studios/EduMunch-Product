import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
import type { TeacherOption } from "./types";

interface BulkScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bulkDate: string;
  onBulkDateChange: (date: string) => void;
  copyFromDate: string;
  onCopyFromDateChange: (date: string) => void;
  onCopyFromWeek: () => void;
  branches: string[];
  subjects: string[];
  teachers: TeacherOption[];
  onSave: () => void;
}

const timeSlots = [
  "08:30 AM - 10:30 AM",
  "11:00 AM - 01:00 PM",
  "01:30 PM - 03:30 PM",
];

export const BulkScheduleModal = ({
  open,
  onOpenChange,
  bulkDate,
  onBulkDateChange,
  copyFromDate,
  onCopyFromDateChange,
  onCopyFromWeek,
  branches,
  subjects,
  teachers,
  onSave,
}: BulkScheduleModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Bulk Schedule Timetable for a Week</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="space-y-2">
              <Label>Select any date in the desired week</Label>
              <Input
                type="date"
                className="w-48"
                value={bulkDate}
                onChange={(e) => onBulkDateChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Copy from Previous Week</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  className="w-40"
                  value={copyFromDate}
                  onChange={(e) => onCopyFromDateChange(e.target.value)}
                />
                <Button onClick={onCopyFromWeek}>Copy</Button>
              </div>
            </div>
          </div>

          {/* Bulk Schedule Grid */}
          <ScrollArea className="h-[400px] border border-border rounded-lg">
            <div className="min-w-[1400px] p-4">
              {/* Branch Headers */}
              <div className="flex gap-4 mb-4 border-b border-border pb-4">
                {branches.slice(0, 6).map((branch) => (
                  <div key={branch} className="w-[180px] flex-shrink-0">
                    <span className="font-medium text-foreground text-sm">
                      {branch}
                    </span>
                  </div>
                ))}
              </div>

              {/* Time Slot Rows */}
              {timeSlots.map((time, timeIndex) => (
                <div
                  key={timeIndex}
                  className="flex gap-4 mb-4 pb-4 border-b border-border last:border-b-0"
                >
                  {branches.slice(0, 6).map((branch) => (
                    <div
                      key={branch}
                      className="w-[180px] flex-shrink-0 space-y-2"
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <span>{time}</span>
                      </div>
                      <Select>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem
                              key={subject}
                              value={subject.toLowerCase()}
                            >
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger className="h-8">
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
                  ))}
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="secondary">Validate Timetable</Button>
            <Button onClick={onSave}>Save Timetable</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
