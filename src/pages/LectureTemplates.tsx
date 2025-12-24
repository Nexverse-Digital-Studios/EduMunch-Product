import { useState } from "react";
import { Plus, Trash2, Clock, Calendar, Loader2 } from "lucide-react";
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
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";

// Database types
interface SectionDB {
  id: string;
  section_name: string;
  section_code: string;
}

interface LectureTemplateDB {
  id: string;
  template_name: string;
  description?: string;
  section_id?: string;
  schedule_json: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  day: string;
  slots: TimeSlot[];
}

const branches = [
  { id: "kalyan", name: "Kalyan Branch" },
  { id: "thane", name: "Thane HO Branch" },
  { id: "manpada", name: "Manpada Branch" },
];

const initialSchedule: DaySchedule[] = [
  { day: "MONDAY", slots: [
    { id: 1, startTime: "08:30 AM", endTime: "10:30 AM" },
    { id: 2, startTime: "11:00 AM", endTime: "01:00 PM" },
    { id: 3, startTime: "01:30 PM", endTime: "03:30 PM" },
    { id: 4, startTime: "04:00 PM", endTime: "06:00 PM" },
  ]},
  { day: "TUESDAY", slots: [
    { id: 5, startTime: "08:30 AM", endTime: "10:30 AM" },
    { id: 6, startTime: "11:00 AM", endTime: "01:00 PM" },
    { id: 7, startTime: "01:30 PM", endTime: "03:30 PM" },
    { id: 8, startTime: "04:00 PM", endTime: "06:00 PM" },
  ]},
  { day: "WEDNESDAY", slots: [
    { id: 9, startTime: "08:30 AM", endTime: "10:30 AM" },
    { id: 10, startTime: "11:00 AM", endTime: "01:00 PM" },
    { id: 11, startTime: "01:30 PM", endTime: "03:30 PM" },
    { id: 12, startTime: "04:00 PM", endTime: "06:00 PM" },
  ]},
  { day: "THURSDAY", slots: [
    { id: 13, startTime: "08:30 AM", endTime: "10:30 AM" },
    { id: 14, startTime: "11:00 AM", endTime: "01:00 PM" },
    { id: 15, startTime: "01:30 PM", endTime: "03:30 PM" },
    { id: 16, startTime: "04:00 PM", endTime: "06:00 PM" },
  ]},
  { day: "FRIDAY", slots: [
    { id: 17, startTime: "08:30 AM", endTime: "10:30 AM" },
    { id: 18, startTime: "11:00 AM", endTime: "01:00 PM" },
    { id: 19, startTime: "01:30 PM", endTime: "03:30 PM" },
    { id: 20, startTime: "04:00 PM", endTime: "06:00 PM" },
  ]},
  { day: "SATURDAY", slots: [
    { id: 21, startTime: "08:30 AM", endTime: "10:30 AM" },
    { id: 22, startTime: "11:00 AM", endTime: "01:00 PM" },
  ]},
  { day: "SUNDAY", slots: [] },
];

const LectureTemplates = () => {
  const [selectedBranch, setSelectedBranch] = useState("");
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);
  
  // Fetch data from Supabase
  const { data: sections, isLoading: loadingSections } = useSupabaseTable<SectionDB>(
    TABLES.SECTIONS,
    { orderBy: { column: 'section_name', ascending: true } }
  );
  
  const { data: templates, isLoading: loadingTemplates } = useSupabaseTable<LectureTemplateDB>(
    TABLES.LECTURE_TEMPLATES,
    { orderBy: { column: 'template_name', ascending: true } }
  );
  
  const isLoading = loadingSections || loadingTemplates;
  
  // Use database sections or fall back to mock branches
  const dynamicBranches = sections?.map(s => ({ id: s.id, name: s.section_name })) || branches;

  const addSlot = (dayIndex: number) => {
    const newSchedule = [...schedule];
    const newId = Math.max(...schedule.flatMap(d => d.slots.map(s => s.id)), 0) + 1;
    newSchedule[dayIndex].slots.push({
      id: newId,
      startTime: "09:00 AM",
      endTime: "10:00 AM"
    });
    setSchedule(newSchedule);
  };

  const removeSlot = (dayIndex: number, slotId: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots = newSchedule[dayIndex].slots.filter(s => s.id !== slotId);
    setSchedule(newSchedule);
  };

  const updateSlot = (dayIndex: number, slotId: number, field: 'startTime' | 'endTime', value: string) => {
    const newSchedule = [...schedule];
    const slot = newSchedule[dayIndex].slots.find(s => s.id === slotId);
    if (slot) {
      slot[field] = value;
    }
    setSchedule(newSchedule);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Lecture Timing Templates</h1>
        <p className="text-muted-foreground mt-1">Configure standard lecture slots for each branch.</p>
      </div>

      {/* Branch Selection */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="space-y-2">
          <Label className="text-muted-foreground">Select a Branch to Configure</Label>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="space-y-6">
        {schedule.map((daySchedule, dayIndex) => (
          <div key={daySchedule.day} className="bg-card border border-border rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">{daySchedule.day}</h3>
                <span className="text-sm text-muted-foreground">{daySchedule.slots.length} slot(s)</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => addSlot(dayIndex)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Slot
              </Button>
            </div>

            {daySchedule.slots.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No slots configured for this day.</p>
            ) : (
              <div className="space-y-4">
                {daySchedule.slots.map((slot) => (
                  <div key={slot.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4 items-end">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm">Start Time</Label>
                      <div className="relative">
                        <Input
                          value={slot.startTime}
                          onChange={(e) => updateSlot(dayIndex, slot.id, 'startTime', e.target.value)}
                          className="pr-10"
                        />
                        <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm">End Time</Label>
                      <div className="relative">
                        <Input
                          value={slot.endTime}
                          onChange={(e) => updateSlot(dayIndex, slot.id, 'endTime', e.target.value)}
                          className="pr-10"
                        />
                        <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeSlot(dayIndex, slot.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LectureTemplates;
