/**
 * Edit Timetable Page
 * ====================
 * Edit section timetable in grid view
 */

import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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

interface CellEdit {
  subject_id: string;
  teacher_id: string;
}

const EditTimetablePage = () => {
  const { id: sectionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canUpdate } = useModulePermissions("timetable");

  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [cellEdits, setCellEdits] = useState<Record<string, CellEdit>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch section details
  const { data: sectionsData } = useSupabaseTable<SectionDB>(TABLES.SECTIONS, {
    filters: { id: sectionId },
  });
  const section = sectionsData?.[0];

  // Fetch timetable entries
  const {
    data: timetableData,
    isLoading,
    refetch,
  } = useSupabaseTable<TimetableEntryDB>(TABLES.TIMETABLES, {
    filters: { section_id: sectionId, is_active: true },
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

  const { updateMutation, createMutation, deleteMutation } =
    useSupabaseTable<TimetableEntryDB>(TABLES.TIMETABLES);

  const timetableEntries = timetableData || [];
  const periods = periodsData || [];
  const subjects = subjectsData || [];
  const teachers = teachersData || [];

  // Helper functions
  const getSubjectName = (subjectId: string | null) => {
    if (!subjectId) return "—";
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.subject_name || "—";
  };

  const getTeacherName = (teacherId: string | null) => {
    if (!teacherId) return "—";
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : "—";
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Build timetable grid with entry IDs
  const timetableGrid = useMemo(() => {
    const grid: Record<string, Record<string, TimetableEntryDB | null>> = {};

    DAYS_OF_WEEK.forEach((day) => {
      grid[day] = {};
      periods.forEach((period) => {
        grid[day][period.id] = null;
      });
    });

    timetableEntries.forEach((entry) => {
      if (grid[entry.day_of_week] && entry.period_id) {
        grid[entry.day_of_week][entry.period_id] = entry;
      }
    });

    return grid;
  }, [timetableEntries, periods]);

  const getCellKey = (day: string, periodId: string) => `${day}-${periodId}`;

  const handleCellClick = (day: string, periodId: string) => {
    const key = getCellKey(day, periodId);
    const entry = timetableGrid[day]?.[periodId];

    setEditingCell(key);
    setCellEdits((prev) => ({
      ...prev,
      [key]: {
        subject_id: entry?.subject_id || "",
        teacher_id: entry?.teacher_id || "",
      },
    }));
  };

  const handleCellChange = (
    key: string,
    field: keyof CellEdit,
    value: string
  ) => {
    setCellEdits((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const handleSaveCell = async (day: string, periodId: string) => {
    const key = getCellKey(day, periodId);
    const edit = cellEdits[key];
    const existingEntry = timetableGrid[day]?.[periodId];

    if (!edit) return;

    setIsSaving(true);
    try {
      if (existingEntry) {
        // Update existing entry
        await updateMutation.mutateAsync({
          id: existingEntry.id,
          updates: {
            subject_id: edit.subject_id || null,
            teacher_id: edit.teacher_id || null,
          },
        });
      } else {
        // Create new entry (need academic year)
        const academicYearEntry = timetableEntries.find(
          (e) => e.academic_year_id
        );
        if (!academicYearEntry) {
          toast({
            title: "Error",
            description:
              "No academic year found. Please create an entry first.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }

        await createMutation.mutateAsync({
          section_id: sectionId,
          academic_year_id: academicYearEntry.academic_year_id,
          day_of_week: day,
          period_id: periodId,
          subject_id: edit.subject_id || null,
          teacher_id: edit.teacher_id || null,
          is_active: true,
        });
      }

      toast({ title: "Success", description: "Cell updated successfully" });
      setEditingCell(null);
      refetch();
    } catch (error) {
      console.error("Error saving cell:", error);
      toast({
        title: "Error",
        description: "Failed to update cell",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCell = async (day: string, periodId: string) => {
    const entry = timetableGrid[day]?.[periodId];

    if (!entry) {
      toast({
        title: "Info",
        description: "No entry to delete",
        variant: "default",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Update is_active to false instead of deleting
      await updateMutation.mutateAsync({
        id: entry.id,
        updates: {
          is_active: false,
        },
      });
      toast({ title: "Success", description: "Entry deleted successfully" });
      setEditingCell(null);
      refetch();
    } catch (error) {
      console.error("Error deleting cell:", error);
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!canUpdate) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          You don't have permission to edit timetables.
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
            <Link to={`/timetable/view/${sectionId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit {section?.section_name || "Section"} Timetable
            </h1>
            <p className="text-muted-foreground">
              Click on a cell to edit subject and teacher
            </p>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Schedule Editor
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
                        className="text-center min-w-[180px]"
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
                        const key = getCellKey(day, period.id);
                        const entry = timetableGrid[day]?.[period.id];
                        const isEditing = editingCell === key;
                        const edit = cellEdits[key];

                        return (
                          <TableCell
                            key={day}
                            className={`text-center cursor-pointer hover:bg-muted/50 ${
                              period.is_break ? "cursor-default" : ""
                            }`}
                            onClick={() =>
                              !period.is_break &&
                              handleCellClick(day, period.id)
                            }
                          >
                            {period.is_break ? (
                              <span className="text-muted-foreground">—</span>
                            ) : isEditing ? (
                              <div
                                className="space-y-2 p-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Select
                                  value={edit?.subject_id || ""}
                                  onValueChange={(v) =>
                                    handleCellChange(key, "subject_id", v)
                                  }
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Subject" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {subjects.map((s) => (
                                      <SelectItem key={s.id} value={s.id}>
                                        {s.subject_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Select
                                  value={edit?.teacher_id || ""}
                                  onValueChange={(v) =>
                                    handleCellChange(key, "teacher_id", v)
                                  }
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Teacher" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {teachers.map((t) => (
                                      <SelectItem key={t.id} value={t.id}>
                                        {t.first_name} {t.last_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    className="h-6 text-xs flex-1"
                                    onClick={() =>
                                      handleSaveCell(day, period.id)
                                    }
                                    disabled={isSaving}
                                  >
                                    <Save className="h-3 w-3 mr-1" />
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-6 text-xs"
                                    onClick={() =>
                                      handleDeleteCell(day, period.id)
                                    }
                                    disabled={isSaving}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 text-xs"
                                    onClick={() => setEditingCell(null)}
                                    disabled={isSaving}
                                  >
                                    ×
                                  </Button>
                                </div>
                              </div>
                            ) : entry ? (
                              <div className="space-y-1">
                                <div className="font-medium text-sm">
                                  {getSubjectName(entry.subject_id)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {getTeacherName(entry.teacher_id)}
                                </div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground text-xs">
                                <Plus className="h-4 w-4 mx-auto" />
                              </div>
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

export default EditTimetablePage;
