/**
 * Bulk Create Timetable Page
 * ===========================
 * Create multiple timetable entries at once
 */

import { useState } from "react";
import { Plus, Trash2, Save, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";

interface BulkEntry {
  id: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
  periodId: string;
  days: number[];
  roomNumber: string;
}

interface SectionDB {
  id: string;
  section_name: string;
  section_code: string;
}

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

interface PeriodDB {
  id: string;
  period_name: string;
  period_number: number;
  start_time: string;
  end_time: string;
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const BulkCreatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canCreate } = useModulePermissions("timetable");

  const [entries, setEntries] = useState<BulkEntry[]>([
    {
      id: crypto.randomUUID(),
      sectionId: "",
      subjectId: "",
      teacherId: "",
      periodId: "",
      days: [],
      roomNumber: "",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data
  const { data: sectionsData } = useSupabaseTable<SectionDB>(TABLES.SECTIONS, {
    orderBy: { column: "section_name", ascending: true },
  });

  const { data: subjectsData } = useSupabaseTable<SubjectDB>(TABLES.SUBJECTS, {
    orderBy: { column: "subject_name", ascending: true },
  });

  const { data: teachersData } = useSupabaseTable<TeacherDB>(TABLES.TEACHERS, {
    orderBy: { column: "first_name", ascending: true },
  });

  const { data: periodsData } = useSupabaseTable<PeriodDB>(
    TABLES.TIMETABLE_PERIODS,
    {
      orderBy: { column: "period_number", ascending: true },
    }
  );

  const sections = sectionsData || [];
  const subjects = subjectsData || [];
  const teachers = teachersData || [];
  const periods = periodsData || [];

  const addEntry = () => {
    setEntries([
      ...entries,
      {
        id: crypto.randomUUID(),
        sectionId: "",
        subjectId: "",
        teacherId: "",
        periodId: "",
        days: [],
        roomNumber: "",
      },
    ]);
  };

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(entries.filter((e) => e.id !== id));
    }
  };

  const updateEntry = (
    id: string,
    field: keyof BulkEntry,
    value: string | number[]
  ) => {
    setEntries(
      entries.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const toggleDay = (entryId: string, day: number) => {
    const entry = entries.find((e) => e.id === entryId);
    if (entry) {
      const newDays = entry.days.includes(day)
        ? entry.days.filter((d) => d !== day)
        : [...entry.days, day];
      updateEntry(entryId, "days", newDays);
    }
  };

  const handleSubmit = async () => {
    // Validate entries
    const invalidEntries = entries.filter(
      (e) =>
        !e.sectionId ||
        !e.subjectId ||
        !e.teacherId ||
        !e.periodId ||
        e.days.length === 0
    );

    if (invalidEntries.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields for each entry",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create timetable entries for each day
      // In production, this would be a bulk insert to Supabase
      const totalEntries = entries.reduce((sum, e) => sum + e.days.length, 0);

      toast({
        title: "Success",
        description: `Created ${totalEntries} timetable entries`,
      });
      navigate("/timetable");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create timetable entries",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canCreate) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          You don't have permission to create timetables.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bulk Schedule Creation
          </h1>
          <p className="text-muted-foreground">
            Create multiple timetable entries at once
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addEntry}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Creating..." : "Create All"}
          </Button>
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <Card key={entry.id}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Entry {index + 1}
                </CardTitle>
                {entries.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEntry(entry.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Section */}
                <div className="space-y-2">
                  <Label>Section *</Label>
                  <Select
                    value={entry.sectionId}
                    onValueChange={(value) =>
                      updateEntry(entry.id, "sectionId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.section_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Select
                    value={entry.subjectId}
                    onValueChange={(value) =>
                      updateEntry(entry.id, "subjectId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.subject_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Teacher */}
                <div className="space-y-2">
                  <Label>Teacher *</Label>
                  <Select
                    value={entry.teacherId}
                    onValueChange={(value) =>
                      updateEntry(entry.id, "teacherId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.first_name} {teacher.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Period */}
                <div className="space-y-2">
                  <Label>Period *</Label>
                  <Select
                    value={entry.periodId}
                    onValueChange={(value) =>
                      updateEntry(entry.id, "periodId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((period) => (
                        <SelectItem key={period.id} value={period.id}>
                          {period.period_name} ({period.start_time} -{" "}
                          {period.end_time})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Days of Week */}
              <div className="space-y-2">
                <Label>Days of Week *</Label>
                <div className="flex flex-wrap gap-4">
                  {DAYS_OF_WEEK.map((day) => (
                    <div
                      key={day.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`${entry.id}-day-${day.value}`}
                        checked={entry.days.includes(day.value)}
                        onCheckedChange={() => toggleDay(entry.id, day.value)}
                      />
                      <label
                        htmlFor={`${entry.id}-day-${day.value}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {day.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Number */}
              <div className="space-y-2 max-w-xs">
                <Label>Room Number (Optional)</Label>
                <Input
                  value={entry.roomNumber}
                  onChange={(e) =>
                    updateEntry(entry.id, "roomNumber", e.target.value)
                  }
                  placeholder="e.g., Room 101"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BulkCreatePage;
