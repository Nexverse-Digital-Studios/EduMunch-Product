/**
 * Section Timetable Page
 * =======================
 * View timetable for a specific section
 */

import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Edit, Download, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface SectionDB {
  id: string;
  section_name: string;
  section_code: string;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const SectionTimetablePage = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const { canView, canUpdate, canExport } = useModulePermissions("timetable");

  // Fetch section details
  const { data: sectionsData } = useSupabaseTable<SectionDB>(TABLES.SECTIONS, {
    filters: { id: sectionId },
  });
  const section = sectionsData?.[0];

  // Fetch timetable entries for this section
  const { data: timetableData, isLoading } = useSupabaseTable<TimetableEntryDB>(
    TABLES.TIMETABLES,
    {
      filters: { section_id: sectionId, is_active: true },
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

  // Build timetable grid
  const timetableGrid = useMemo(() => {
    const grid: Record<string, Record<string, TimetableEntryDB | null>> = {};

    // Initialize grid
    DAYS_OF_WEEK.forEach((day) => {
      grid[day] = {};
      periods.forEach((period) => {
        grid[day][period.id] = null;
      });
    });

    // Fill in entries
    timetableEntries.forEach((entry) => {
      if (grid[entry.day_of_week] && entry.period_id) {
        grid[entry.day_of_week][entry.period_id] = entry;
      }
    });

    return grid;
  }, [timetableEntries, periods]);

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          You don't have permission to view this timetable.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/timetable/view">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {section?.section_name || "Section"} Timetable
            </h1>
            <p className="text-muted-foreground">
              Weekly schedule for {section?.section_code || "this section"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canExport && (
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
          {canUpdate && (
            <Button asChild>
              <Link to={`/timetable/${sectionId}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Timetable
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Timetable Grid */}
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
          ) : periods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No periods configured</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link to="/timetable/periods">Configure Periods</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Period</TableHead>
                    {DAYS_OF_WEEK.map((day) => (
                      <TableHead
                        key={day}
                        className="text-center min-w-[150px]"
                      >
                        {day}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periods.map((period) => (
                    <TableRow
                      key={period.id}
                      className={period.is_break ? "bg-muted/50" : ""}
                    >
                      <TableCell>
                        <div className="font-medium">
                          {period.period_name ||
                            `Period ${period.period_number}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(period.start_time)} -{" "}
                          {formatTime(period.end_time)}
                        </div>
                        {period.is_break && (
                          <Badge variant="secondary" className="mt-1">
                            Break
                          </Badge>
                        )}
                      </TableCell>
                      {DAYS_OF_WEEK.map((day) => {
                        const entry = timetableGrid[day]?.[period.id];
                        return (
                          <TableCell key={day} className="text-center">
                            {period.is_break ? (
                              <span className="text-muted-foreground">-</span>
                            ) : entry ? (
                              <div className="space-y-1">
                                <div className="font-medium text-sm">
                                  {getSubjectName(entry.subject_id)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {getTeacherName(entry.teacher_id)}
                                </div>
                                {entry.room_number && (
                                  <Badge variant="outline" className="text-xs">
                                    {entry.room_number}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SectionTimetablePage;
