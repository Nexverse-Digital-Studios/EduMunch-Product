/**
 * Class Timetable Page (Public View)
 * ====================================
 * View timetable for a specific class - accessible to students
 * Fetches real data from database
 */

import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";

interface ClassDB {
  id: string;
  class_name: string;
  class_code: string;
}

interface SectionDB {
  id: string;
  section_name: string;
  section_code: string;
  class_id: string;
}

interface TimetableEntryDB {
  id: string;
  section_id: string;
  day_of_week: string;
  period_id: string;
  subject_id: string | null;
  teacher_id: string | null;
  room_number: string | null;
  is_active: boolean;
}

interface PeriodDB {
  id: string;
  period_number: number;
  period_name: string | null;
  start_time: string;
  end_time: string;
  is_break: boolean;
  display_order: number | null;
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
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const ClassTimetablePage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { canView } = useModulePermissions("timetable");

  const [selectedSection, setSelectedSection] = useState<string>("");
  const [currentDayIndex, setCurrentDayIndex] = useState(() => {
    const today = new Date().getDay();
    // Sunday = 0, we want Monday = 0
    return today === 0 ? 0 : today - 1;
  });

  // Fetch classes
  const { data: classesData, isLoading: classesLoading } =
    useSupabaseTable<ClassDB>(TABLES.CLASSES, {
      orderBy: { column: "class_name", ascending: true },
    });

  // Fetch sections for the selected class
  const { data: sectionsData } = useSupabaseTable<SectionDB>(TABLES.SECTIONS, {
    filters: classId ? { class_id: classId } : undefined,
    orderBy: { column: "section_name", ascending: true },
  });

  // Fetch timetable entries for the selected section
  const { data: timetableData, isLoading: timetableLoading } =
    useSupabaseTable<TimetableEntryDB>(TABLES.TIMETABLES, {
      filters: selectedSection
        ? { section_id: selectedSection, is_active: true }
        : undefined,
    });

  // Fetch periods
  const { data: periodsData } = useSupabaseTable<PeriodDB>(
    TABLES.TIMETABLE_PERIODS,
    {
      orderBy: { column: "display_order", ascending: true },
    }
  );

  // Fetch subjects
  const { data: subjectsData } = useSupabaseTable<SubjectDB>(TABLES.SUBJECTS);

  // Fetch teachers
  const { data: teachersData } = useSupabaseTable<TeacherDB>(TABLES.TEACHERS);

  const classes = classesData || [];
  const sections = sectionsData || [];
  const timetableEntries = timetableData || [];
  const periods = periodsData || [];
  const subjects = subjectsData || [];
  const teachers = teachersData || [];

  // Set default section when sections load
  useMemo(() => {
    if (sections.length > 0 && !selectedSection) {
      setSelectedSection(sections[0].id);
    }
  }, [sections, selectedSection]);

  const selectedClass = classes.find((c) => c.id === classId);
  const currentDay = DAYS[currentDayIndex];

  // Helper functions
  const getSubjectName = (subjectId: string | null) => {
    if (!subjectId) return "-";
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.subject_name || "-";
  };

  const getTeacherName = (teacherId: string | null) => {
    if (!teacherId) return "-";
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : "-";
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Build timetable for the current day
  const todaySchedule = useMemo(() => {
    return periods.map((period) => {
      const entry = timetableEntries.find(
        (e) => e.day_of_week === currentDay && e.period_id === period.id
      );
      return {
        period,
        entry,
      };
    });
  }, [timetableEntries, periods, currentDay]);

  const handlePrevDay = () => {
    setCurrentDayIndex((prev) => (prev === 0 ? DAYS.length - 1 : prev - 1));
  };

  const handleNextDay = () => {
    setCurrentDayIndex((prev) => (prev === DAYS.length - 1 ? 0 : prev + 1));
  };

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          You don't have permission to view timetables.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {selectedClass?.class_name || "Class"} Timetable
            </h1>
            <p className="text-muted-foreground">
              Weekly schedule for {selectedClass?.class_code || "this class"}
            </p>
          </div>
        </div>
      </div>

      {/* Section Selector */}
      {sections.length > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Select Section:</label>
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
              >
                <SelectTrigger className="w-[200px]">
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
          </CardContent>
        </Card>
      )}

      {/* Day Navigator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={handlePrevDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <h2 className="text-2xl font-bold">{currentDay}</h2>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <Button variant="outline" size="icon" onClick={handleNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timetable */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {currentDay}'s Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timetableLoading || classesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !selectedSection ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sections available for this class</p>
            </div>
          ) : periods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No periods configured</p>
            </div>
          ) : todaySchedule.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No classes scheduled for {currentDay}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySchedule.map(({ period, entry }) => (
                <div
                  key={period.id}
                  className={`p-4 rounded-lg ${
                    period.is_break
                      ? "bg-yellow-50 dark:bg-yellow-950/30 border-l-4 border-l-yellow-500"
                      : entry
                      ? "bg-blue-50 dark:bg-blue-950/30 border-l-4 border-l-blue-500"
                      : "bg-gray-50 dark:bg-gray-950/30 border-l-4 border-l-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {period.period_name ||
                            `Period ${period.period_number}`}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(period.start_time)} -{" "}
                          {formatTime(period.end_time)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg">
                        {period.is_break
                          ? period.period_name || "Break"
                          : entry
                          ? getSubjectName(entry.subject_id)
                          : "Free Period"}
                      </h3>
                      {!period.is_break && entry && (
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {getTeacherName(entry.teacher_id)}
                          </div>
                          {entry.room_number && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {entry.room_number}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {period.is_break ? (
                      <Badge variant="secondary">Break</Badge>
                    ) : entry ? (
                      <Badge>Class</Badge>
                    ) : (
                      <Badge variant="secondary">Free</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Week Overview - Quick Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Quick Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((day, index) => (
              <Button
                key={day}
                variant={index === currentDayIndex ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentDayIndex(index)}
              >
                {day.slice(0, 3)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassTimetablePage;
