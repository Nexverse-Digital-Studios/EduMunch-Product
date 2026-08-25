/**
 * My Timetable Page (Student View)
 * =================================
 * Personal timetable view for students - fetches real data from database
 */

import { useMemo } from "react";
import { Calendar, Clock, BookOpen, User, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";

interface TimetableEntryDB {
  id: string;
  section_id: string;
  academic_year_id: string;
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
  employee_code: string;
}

interface StudentDB {
  id: string;
  section_id: string;
  user_id: string;
}

const DAYS = [
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
];

const MyTimetablePage = () => {
  const { user } = useAuth();
  const { canView } = useModulePermissions("timetable");

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const defaultDay = today === "Sunday" ? "Monday" : today;

  // Fetch student's section (assuming user is a student)
  const { data: studentData } = useSupabaseTable<StudentDB>(TABLES.STUDENTS, {
    filters: user?.id ? { user_id: user.id } : undefined,
  });
  const sectionId = studentData?.[0]?.section_id;

  // Fetch timetable entries for student's section
  const { data: timetableData, isLoading } = useSupabaseTable<TimetableEntryDB>(
    TABLES.TIMETABLES,
    {
      filters: sectionId
        ? { section_id: sectionId, is_active: true }
        : undefined,
    }
  );

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

  const timetableEntries = timetableData || [];
  const periods = periodsData || [];
  const subjects = subjectsData || [];
  const teachers = teachersData || [];

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

  // Build timetable by day
  const timetableByDay = useMemo(() => {
    const byDay: Record<
      string,
      Array<{
        id: string;
        period: PeriodDB;
        entry: TimetableEntryDB | null;
      }>
    > = {};

    DAYS.forEach((day) => {
      byDay[day.value] = periods.map((period) => {
        const entry = timetableEntries.find(
          (e) => e.day_of_week === day.value && e.period_id === period.id
        );
        return {
          id: `${day.value}-${period.id}`,
          period,
          entry: entry || null,
        };
      });
    });

    return byDay;
  }, [timetableEntries, periods]);

  // Calculate stats
  const todayClasses =
    timetableByDay[defaultDay]?.filter(
      (item) => item.entry && !item.period.is_break
    ).length || 0;

  const nextClass = timetableByDay[defaultDay]?.find(
    (item) => item.entry && !item.period.is_break
  );

  const getEntryStyle = (isBreak: boolean, hasClass: boolean) => {
    if (isBreak) {
      return "border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/30";
    }
    if (hasClass) {
      return "border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/30";
    }
    return "border-l-4 border-l-gray-300 bg-gray-50 dark:bg-gray-950/30";
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Timetable</h1>
        <p className="text-muted-foreground">
          Your personal class schedule for the week
        </p>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="font-semibold">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Classes Today</p>
                <p className="font-semibold">{todayClasses} Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Next Class</p>
                <p className="font-semibold">
                  {nextClass?.entry
                    ? getSubjectName(nextClass.entry.subject_id)
                    : "No classes"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timetable */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !sectionId ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No section assigned to your account</p>
              <p className="text-sm">Please contact your administrator</p>
            </div>
          ) : periods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No periods configured</p>
            </div>
          ) : (
            <Tabs defaultValue={defaultDay}>
              <TabsList className="grid grid-cols-6 w-full">
                {DAYS.map((day) => (
                  <TabsTrigger
                    key={day.value}
                    value={day.value}
                    className={
                      day.value === today ? "border-b-2 border-primary" : ""
                    }
                  >
                    {day.label.slice(0, 3)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {DAYS.map((day) => (
                <TabsContent key={day.value} value={day.value} className="mt-4">
                  <div className="space-y-3">
                    {(timetableByDay[day.value] || []).map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-lg ${getEntryStyle(
                          item.period.is_break,
                          !!item.entry
                        )}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {item.period.period_name ||
                                  `Period ${item.period.period_number}`}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatTime(item.period.start_time)} -{" "}
                                {formatTime(item.period.end_time)}
                              </span>
                            </div>
                            <h3 className="font-semibold text-lg">
                              {item.period.is_break
                                ? item.period.period_name || "Break"
                                : item.entry
                                ? getSubjectName(item.entry.subject_id)
                                : "Free Period"}
                            </h3>
                            {!item.period.is_break && item.entry && (
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {getTeacherName(item.entry.teacher_id)}
                                </div>
                                {item.entry.room_number && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {item.entry.room_number}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {item.period.is_break ? (
                            <Badge variant="secondary">Break</Badge>
                          ) : item.entry ? (
                            <Badge>Class</Badge>
                          ) : (
                            <Badge variant="secondary">Free</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {(timetableByDay[day.value] || []).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No schedule for {day.label}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyTimetablePage;
