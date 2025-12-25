import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

// Types
export interface SectionDB {
  id: string;
  class_id: string;
  section_name: string;
  section_code: string;
}

export interface TimetableDB {
  id: string;
  section_id: string;
  subject_id: string;
  teacher_id: string;
  period_id: string;
  day_of_week: number;
  room_number?: string;
  is_active: boolean;
}

interface ScheduleTabProps {
  sections: SectionDB[];
  timetables: TimetableDB[];
}

export const ScheduleTab = ({ sections, timetables }: ScheduleTabProps) => {
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const hasSchedule = timetables.length > 0;

  const handlePrevDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 flex-1">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Filter by Section (Optional)
            </label>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sections.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.section_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Select a day in week
            </label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={handleNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {!hasSchedule ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>
              No timetable data found. Create timetables first to view schedule.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Schedule cards would be rendered here based on timetable data */}
        </div>
      )}
    </div>
  );
};
