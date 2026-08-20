/**
 * Substitute Teacher Page
 * ========================
 * Assign substitute teachers for absent teachers - fetches real data from database
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCheck,
  Search,
  Calendar,
  User,
  Clock,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";

interface TeacherDB {
  id: string;
  first_name: string;
  last_name: string;
  employee_code: string;
  status: string;
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

interface SubstitutionDB {
  id: string;
  timetable_id: string;
  original_teacher_id: string;
  substitute_teacher_id: string;
  substitution_date: string;
  reason: string | null;
}

interface PeriodDB {
  id: string;
  period_number: number;
  period_name: string | null;
  start_time: string;
  end_time: string;
}

interface SectionDB {
  id: string;
  section_name: string;
}

interface SubjectDB {
  id: string;
  subject_name: string;
}

interface LeaveRequestDB {
  id: string;
  teacher_id: string;
  start_date: string;
  end_date: string;
  status: string;
  leave_type: string;
}

interface TeacherAttendanceDB {
  id: string;
  teacher_id: string;
  attendance_date: string;
  status: string;
}

const SubstitutePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canUpdate } = useModulePermissions("timetable");

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntryDB | null>(
    null
  );
  const [selectedTeacherName, setSelectedTeacherName] = useState("");
  const [selectedSubstitute, setSelectedSubstitute] = useState("");

  // Helper functions for date navigation
  const handlePreviousDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - 1);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + 1);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  // Fetch teachers
  const { data: teachersData, isLoading: teachersLoading } =
    useSupabaseTable<TeacherDB>(TABLES.TEACHERS, {
      orderBy: { column: "first_name", ascending: true },
    });

  // Fetch approved leave requests for the selected date
  const { data: leaveRequestsData } = useSupabaseTable<LeaveRequestDB>(
    TABLES.STAFF_LEAVE_APPLICATIONS,
    {
      filters: { status: "Approved" },
    }
  );

  // Fetch teacher attendance for the selected date
  const { data: attendanceData } = useSupabaseTable<TeacherAttendanceDB>(
    TABLES.TEACHER_ATTENDANCE
  );

  // Fetch timetable entries
  const { data: timetableData } = useSupabaseTable<TimetableEntryDB>(
    TABLES.TIMETABLES,
    {
      filters: { is_active: true },
    }
  );

  // Fetch existing substitutions for the date
  const { data: substitutionsData, refetch: refetchSubstitutions } =
    useSupabaseTable<SubstitutionDB>(TABLES.TIMETABLE_SUBSTITUTIONS, {
      filters: { substitution_date: selectedDate },
    });

  // Fetch periods
  const { data: periodsData } = useSupabaseTable<PeriodDB>(
    TABLES.TIMETABLE_PERIODS,
    {
      orderBy: { column: "display_order", ascending: true },
    }
  );

  // Fetch sections
  const { data: sectionsData } = useSupabaseTable<SectionDB>(TABLES.SECTIONS);

  // Fetch subjects
  const { data: subjectsData } = useSupabaseTable<SubjectDB>(TABLES.SUBJECTS);

  const { createMutation } = useSupabaseTable(TABLES.TIMETABLE_SUBSTITUTIONS);

  const teachers = teachersData || [];
  const leaveRequests = leaveRequestsData || [];
  const attendance = attendanceData || [];
  const timetableEntries = timetableData || [];
  const substitutions = substitutionsData || [];
  const periods = periodsData || [];
  const sections = sectionsData || [];
  const subjects = subjectsData || [];

  // Helper functions
  const getTeacherName = (teacherId: string | null) => {
    if (!teacherId) return "-";
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : "-";
  };

  const getTeacherCode = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher?.employee_code || "";
  };

  const getSectionName = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    return section?.section_name || "Unknown";
  };

  const getSubjectName = (subjectId: string | null) => {
    if (!subjectId) return "-";
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.subject_name || "-";
  };

  const getPeriodInfo = (periodId: string) => {
    const period = periods.find((p) => p.id === periodId);
    if (!period) return { name: "Unknown", time: "" };
    return {
      name: period.period_name || `Period ${period.period_number}`,
      time: `${period.start_time} - ${period.end_time}`,
    };
  };

  // Get teachers absent for the selected date (from leave and attendance)
  const absentTeacherIds = useMemo(() => {
    const absentIds = new Set<string>();

    // Check approved leave requests
    const selectedDateObj = new Date(selectedDate);
    leaveRequests.forEach((leave) => {
      const startDate = new Date(leave.start_date);
      const endDate = new Date(leave.end_date);
      if (selectedDateObj >= startDate && selectedDateObj <= endDate) {
        absentIds.add(leave.teacher_id);
      }
    });

    // Check teacher attendance marked as absent
    attendance.forEach((record) => {
      if (
        record.attendance_date === selectedDate &&
        (record.status === "Absent" || record.status === "absent")
      ) {
        absentIds.add(record.teacher_id);
      }
    });

    return absentIds;
  }, [leaveRequests, attendance, selectedDate]);

  // Get day of week for selected date
  const selectedDayOfWeek = new Date(selectedDate).toLocaleDateString("en-US", {
    weekday: "long",
  });

  // Get classes needing substitutes
  const classesNeedingSubstitutes = useMemo(() => {
    const existingSubTimetableIds = substitutions.map((s) => s.timetable_id);

    return timetableEntries.filter((entry) => {
      return (
        entry.teacher_id &&
        absentTeacherIds.has(entry.teacher_id) &&
        entry.day_of_week === selectedDayOfWeek &&
        !existingSubTimetableIds.includes(entry.id)
      );
    });
  }, [timetableEntries, absentTeacherIds, selectedDayOfWeek, substitutions]);

  // Group by teacher
  const absentTeachersWithClasses = useMemo(() => {
    const grouped: Record<
      string,
      { teacherId: string; leaveType: string; classes: TimetableEntryDB[] }
    > = {};

    classesNeedingSubstitutes.forEach((entry) => {
      if (entry.teacher_id) {
        if (!grouped[entry.teacher_id]) {
          // Find leave type from leave requests
          const leave = leaveRequests.find(
            (l) => l.teacher_id === entry.teacher_id
          );
          // Find attendance record
          const attendanceRecord = attendance.find(
            (a) =>
              a.teacher_id === entry.teacher_id &&
              a.attendance_date === selectedDate
          );
          const leaveType =
            leave?.leave_type || attendanceRecord?.status || "Absent";
          grouped[entry.teacher_id] = {
            teacherId: entry.teacher_id,
            leaveType,
            classes: [],
          };
        }
        grouped[entry.teacher_id].classes.push(entry);
      }
    });

    return Object.values(grouped);
  }, [classesNeedingSubstitutes, leaveRequests, attendance, selectedDate]);

  // Filter by search
  const filteredAbsentTeachers = absentTeachersWithClasses.filter((item) => {
    const teacherName = getTeacherName(item.teacherId).toLowerCase();
    const teacherCode = getTeacherCode(item.teacherId).toLowerCase();
    const query = searchQuery.toLowerCase();
    return teacherName.includes(query) || teacherCode.includes(query);
  });

  // Available substitutes (teachers not absent)
  const availableSubstitutes = teachers.filter((teacher) => {
    const isAbsent = absentTeacherIds.has(teacher.id);
    return !isAbsent && teacher.status === "active";
  });

  const handleAssignSubstitute = async () => {
    if (!selectedSubstitute || !selectedEntry) {
      toast({
        title: "Error",
        description: "Please select a substitute teacher",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        timetable_id: selectedEntry.id,
        original_teacher_id: selectedEntry.teacher_id,
        substitute_teacher_id: selectedSubstitute,
        substitution_date: selectedDate,
        reason: null,
      });

      const substituteTeacher = teachers.find(
        (t) => t.id === selectedSubstitute
      );
      toast({
        title: "Substitute Assigned",
        description: `${substituteTeacher?.first_name} ${substituteTeacher?.last_name} has been assigned as substitute`,
      });

      refetchSubstitutions();
      setShowAssignDialog(false);
      setSelectedEntry(null);
      setSelectedSubstitute("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign substitute",
        variant: "destructive",
      });
    }
  };

  if (!canUpdate) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          You don't have permission to assign substitutes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Substitute Teacher Assignment
        </h1>
        <p className="text-muted-foreground">
          Assign substitute teachers for absent staff
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label>Date</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  onClick={handlePreviousDay}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleNextDay}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <Label>Search Teacher</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {selectedDayOfWeek},{" "}
                {new Date(selectedDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{absentTeacherIds.size} teachers absent</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>
                {classesNeedingSubstitutes.length} classes need coverage
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Absent Teachers List */}
      <div className="space-y-4">
        {teachersLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </CardContent>
          </Card>
        ) : filteredAbsentTeachers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserCheck className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold">No Absent Teachers</h3>
              <p className="text-muted-foreground">
                {absentTeacherIds.size === 0
                  ? "No teachers are absent for the selected date."
                  : "All classes have been covered."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAbsentTeachers.map((item) => (
            <Card key={item.teacherId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {getTeacherName(item.teacherId)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {getTeacherCode(item.teacherId)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{item.leaveType}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium mb-3">
                  Classes Needing Coverage:
                </p>
                <div className="grid gap-3">
                  {item.classes.map((cls) => {
                    const periodInfo = getPeriodInfo(cls.period_id);
                    return (
                      <div
                        key={cls.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{periodInfo.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {getSectionName(cls.section_id)} -{" "}
                              {getSubjectName(cls.subject_id)}
                            </span>
                          </div>
                          <Badge variant="outline">{periodInfo.name}</Badge>
                          {cls.room_number && (
                            <span className="text-sm text-muted-foreground">
                              {cls.room_number}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedEntry(cls);
                            setSelectedTeacherName(
                              getTeacherName(item.teacherId)
                            );
                            setShowAssignDialog(true);
                          }}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Assign Substitute
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Assign Substitute Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Substitute Teacher</DialogTitle>
            <DialogDescription>
              Select a teacher to cover this class.
            </DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <p className="font-medium">Class Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      Absent Teacher:
                    </span>
                    <span className="ml-2">{selectedTeacherName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Section:</span>
                    <span className="ml-2">
                      {getSectionName(selectedEntry.section_id)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="ml-2">
                      {getSubjectName(selectedEntry.subject_id)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time:</span>
                    <span className="ml-2">
                      {getPeriodInfo(selectedEntry.period_id).time}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Select Substitute Teacher</Label>
                <Select
                  value={selectedSubstitute}
                  onValueChange={setSelectedSubstitute}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubstitutes.length === 0 ? (
                      <SelectItem value="" disabled>
                        No available teachers
                      </SelectItem>
                    ) : (
                      availableSubstitutes.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.first_name} {teacher.last_name} (
                          {teacher.employee_code})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignSubstitute}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubstitutePage;
