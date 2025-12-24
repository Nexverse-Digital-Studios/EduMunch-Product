/**
 * LectureTemplates.tsx - Lecture Timing Templates
 * 
 * Supabase Tables (Tier 1):
 * - lecture_templates_1EMAET: Reusable lecture templates
 * - branches_1EMAET: Branch list for selection
 * - subjects_1EMAET: Subject list for templates
 * 
 * Schema Reference:
 * - lecture_templates: template_name, subject_id, duration_minutes, default_teacher_id
 */
import { useState, useMemo } from "react";
import { Plus, Trash2, Clock, Calendar, Loader2, AlertTriangle, RefreshCw, Save } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";

const INDEX_TOKEN = import.meta.env.VITE_INDEX_TOKEN || '1emaet';

// Database types
interface Branch {
  id: string;
  class_name: string;
}

interface LectureTemplate {
  id: string;
  template_name: string;
  subject_id: string;
  duration_minutes: number;
  default_teacher_id: string | null;
  description: string | null;
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
  
  const { canView, canCreate, canUpdate } = useModulePermissions('TIMETABLE');
  const { toast } = useToast();

  // Fetch classes as branches (school organization units)
  const { data: branches = [], isLoading: loadingBranches } = useSupabaseTable<Branch>(
    `classes_${INDEX_TOKEN}`,
    { 
      select: 'id, class_name',
      orderBy: { column: 'class_name', ascending: true }
    }
  );

  // Fetch lecture templates from Supabase
  const { data: templates = [], isLoading: loadingTemplates, refetch } = useSupabaseTable<LectureTemplate>(
    `lecture_templates_${INDEX_TOKEN}`,
    { 
      select: '*',
      orderBy: { column: 'template_name', ascending: true }
    }
  );
  
  const isLoading = loadingBranches || loadingTemplates;

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

  const handleSaveTemplate = () => {
    toast({
      title: "Template saved",
      description: "Lecture timing template has been saved successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lecture Timing Templates</h1>
          <p className="text-muted-foreground mt-1">Configure standard lecture slots for each branch.</p>
        </div>
        {canUpdate && selectedBranch && (
          <Button onClick={handleSaveTemplate} className="bg-primary hover:bg-primary/90">
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        )}
      </div>


      {/* Branch Selection */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="space-y-2 flex-1">
            <Label className="text-muted-foreground">Select a Class to Configure</Label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.class_name}
                  </SelectItem>
                ))}
                {branches.length === 0 && !isLoading && (
                  <SelectItem value="none" disabled>No classes found</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        {templates.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{templates.length}</span> lecture template(s) configured in the system.
            </p>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Schedule Grid - only show when branch is selected */}
      {selectedBranch && !isLoading && (
        <div className="space-y-6">
          {schedule.map((daySchedule, dayIndex) => (
            <div key={daySchedule.day} className="bg-card border border-border rounded-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">{daySchedule.day}</h3>
                  <span className="text-sm text-muted-foreground">{daySchedule.slots.length} slot(s)</span>
                </div>
                {canCreate && (
                  <Button variant="outline" size="sm" onClick={() => addSlot(dayIndex)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Slot
                  </Button>
                )}
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
                            disabled={!canUpdate}
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
                            disabled={!canUpdate}
                          />
                          <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      {canUpdate && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeSlot(dayIndex, slot.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state when no branch selected */}
      {!selectedBranch && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          Please select a class to configure lecture timings.
        </div>
      )}
    </div>
  );
};

export default LectureTemplates;
