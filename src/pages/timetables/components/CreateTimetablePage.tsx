/**
 * Create Timetable Entry Page
 * ============================
 * Create new timetable entry for a section
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Calendar } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";

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
  period_number: number;
  period_name: string | null;
  start_time: string;
  end_time: string;
  is_break: boolean;
}

interface AcademicYearDB {
  id: string;
  year_name: string;
  is_current: boolean;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const CreateTimetablePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canCreate } = useModulePermissions("timetable");

  const [formData, setFormData] = useState({
    section_id: "",
    academic_year_id: "",
    day_of_week: "",
    period_id: "",
    subject_id: "",
    teacher_id: "",
    room_number: "",
  });
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
      orderBy: { column: "display_order", ascending: true },
    }
  );

  const { data: academicYearsData } = useSupabaseTable<AcademicYearDB>(
    TABLES.ACADEMIC_YEARS,
    {
      orderBy: { column: "start_date", ascending: false },
    }
  );

  const { createMutation } = useSupabaseTable(TABLES.TIMETABLES);

  const sections = sectionsData || [];
  const subjects = subjectsData || [];
  const teachers = teachersData || [];
  const periods = (periodsData || []).filter((p) => !p.is_break);
  const academicYears = academicYearsData || [];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.section_id ||
      !formData.academic_year_id ||
      !formData.day_of_week ||
      !formData.period_id
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createMutation.mutateAsync({
        section_id: formData.section_id,
        academic_year_id: formData.academic_year_id,
        day_of_week: formData.day_of_week,
        period_id: formData.period_id,
        subject_id: formData.subject_id || null,
        teacher_id: formData.teacher_id || null,
        room_number: formData.room_number || null,
        is_active: true,
      });

      toast({
        title: "Success",
        description: "Timetable entry created successfully",
      });
      navigate("/timetable/view");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create timetable entry",
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
          You don't have permission to create timetable entries.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Create Timetable Entry
        </h1>
        <p className="text-muted-foreground">
          Add a new entry to a section's timetable
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Entry Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Section */}
              <div className="space-y-2">
                <Label htmlFor="section_id">Section *</Label>
                <Select
                  value={formData.section_id}
                  onValueChange={(value) => handleChange("section_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.section_name} ({section.section_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Academic Year */}
              <div className="space-y-2">
                <Label htmlFor="academic_year_id">Academic Year *</Label>
                <Select
                  value={formData.academic_year_id}
                  onValueChange={(value) =>
                    handleChange("academic_year_id", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.year_name} {year.is_current && "(Current)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Day of Week */}
              <div className="space-y-2">
                <Label htmlFor="day_of_week">Day of Week *</Label>
                <Select
                  value={formData.day_of_week}
                  onValueChange={(value) => handleChange("day_of_week", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Period */}
              <div className="space-y-2">
                <Label htmlFor="period_id">Period *</Label>
                <Select
                  value={formData.period_id}
                  onValueChange={(value) => handleChange("period_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((period) => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.period_name || `Period ${period.period_number}`}{" "}
                        ({period.start_time} - {period.end_time})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject_id">Subject</Label>
                <Select
                  value={formData.subject_id}
                  onValueChange={(value) => handleChange("subject_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.subject_name} ({subject.subject_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Teacher */}
              <div className="space-y-2">
                <Label htmlFor="teacher_id">Teacher</Label>
                <Select
                  value={formData.teacher_id}
                  onValueChange={(value) => handleChange("teacher_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.first_name} {teacher.last_name} (
                        {teacher.employee_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Room Number */}
              <div className="space-y-2">
                <Label htmlFor="room_number">Room Number</Label>
                <Input
                  id="room_number"
                  value={formData.room_number}
                  onChange={(e) => handleChange("room_number", e.target.value)}
                  placeholder="e.g., Room 101"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link to="/timetable">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Creating..." : "Create Entry"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTimetablePage;
