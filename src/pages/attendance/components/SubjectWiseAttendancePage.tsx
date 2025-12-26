/**
 * Subject-wise Attendance Page
 * =============================
 * Page for marking and viewing subject-wise attendance
 * Route: /attendance/subject-wise
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Check,
  X,
  Clock,
  Save,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES, supabase } from "@/lib/supabase";
import {
  SectionDB,
  ClassDB,
  StudentDB,
  SubjectDB,
  PeriodDB,
  AttendanceSubjectWiseDB,
  SubjectAttendanceStatus,
} from "./types";

const STATUS_CONFIG: Record<
  SubjectAttendanceStatus,
  { color: string; label: string }
> = {
  Present: { color: "bg-green-500 hover:bg-green-600", label: "P" },
  Absent: { color: "bg-red-500 hover:bg-red-600", label: "A" },
  Late: { color: "bg-yellow-500 hover:bg-yellow-600", label: "L" },
};

interface StudentSubjectEntry {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  status: SubjectAttendanceStatus;
  remarks?: string;
}

export const SubjectWiseAttendancePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceEntries, setAttendanceEntries] = useState<
    StudentSubjectEntry[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch data
  const { data: sections, isLoading: loadingSections } =
    useSupabaseTable<SectionDB>(TABLES.SECTIONS, {
      orderBy: { column: "section_name", ascending: true },
    });

  const { data: classes } = useSupabaseTable<ClassDB>(TABLES.CLASSES, {
    orderBy: { column: "display_order", ascending: true },
  });

  const { data: subjects, isLoading: loadingSubjects } =
    useSupabaseTable<SubjectDB>(TABLES.SUBJECTS, {
      orderBy: { column: "subject_name", ascending: true },
    });

  const { data: periods, isLoading: loadingPeriods } =
    useSupabaseTable<PeriodDB>(TABLES.TIMETABLE_PERIODS, {
      orderBy: { column: "period_number", ascending: true },
    });

  const { data: students, isLoading: loadingStudents } =
    useSupabaseTable<StudentDB>(TABLES.STUDENTS, {
      filters: selectedSection ? { section_id: selectedSection } : {},
      orderBy: { column: "roll_number", ascending: true },
    });

  const { data: existingAttendance } =
    useSupabaseTable<AttendanceSubjectWiseDB>(TABLES.ATTENDANCE_SUBJECT_WISE, {
      filters: selectedSection ? { section_id: selectedSection } : {},
    });

  const getClassName = (classId: string) => {
    const cls = classes?.find((c) => c.id === classId);
    return cls?.class_name || "";
  };

  // Initialize attendance entries
  useMemo(() => {
    if (
      !selectedSection ||
      !selectedSubject ||
      !selectedPeriod ||
      !students ||
      !selectedDate
    ) {
      setAttendanceEntries([]);
      setIsInitialized(false);
      return;
    }

    const existing =
      existingAttendance?.filter(
        (a) =>
          a.section_id === selectedSection &&
          a.subject_id === selectedSubject &&
          a.period_id === selectedPeriod &&
          a.attendance_date === selectedDate
      ) || [];

    const entries: StudentSubjectEntry[] = students.map((student) => {
      const existingRecord = existing.find((a) => a.student_id === student.id);
      return {
        studentId: student.id,
        studentName: `${student.first_name} ${student.last_name}`,
        admissionNumber: student.admission_number,
        status: existingRecord?.status || "Present",
        remarks: existingRecord?.remarks || "",
      };
    });

    setAttendanceEntries(entries);
    setIsInitialized(true);
  }, [
    selectedSection,
    selectedSubject,
    selectedPeriod,
    selectedDate,
    students,
    existingAttendance,
  ]);

  const handleStatusChange = (
    studentId: string,
    status: SubjectAttendanceStatus
  ) => {
    setAttendanceEntries((prev) =>
      prev.map((entry) =>
        entry.studentId === studentId ? { ...entry, status } : entry
      )
    );
  };

  const handleMarkAll = (status: SubjectAttendanceStatus) => {
    setAttendanceEntries((prev) => prev.map((entry) => ({ ...entry, status })));
  };

  const handleSave = async () => {
    if (!supabase || !selectedSection || !selectedSubject || !selectedPeriod) {
      toast({
        title: "Error",
        description: "Please select all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const upsertData = attendanceEntries.map((entry) => ({
        student_id: entry.studentId,
        section_id: selectedSection,
        subject_id: selectedSubject,
        period_id: selectedPeriod,
        attendance_date: selectedDate,
        status: entry.status,
        remarks: entry.remarks || null,
      }));

      const { error } = await supabase
        .from(TABLES.ATTENDANCE_SUBJECT_WISE)
        .upsert(upsertData, {
          onConflict: "student_id,subject_id,attendance_date,period_id",
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subject-wise attendance saved successfully",
      });
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast({
        title: "Error",
        description: "Failed to save attendance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const summary = useMemo(
    () => ({
      total: attendanceEntries.length,
      present: attendanceEntries.filter((e) => e.status === "Present").length,
      absent: attendanceEntries.filter((e) => e.status === "Absent").length,
      late: attendanceEntries.filter((e) => e.status === "Late").length,
    }),
    [attendanceEntries]
  );

  const isLoading =
    loadingSections || loadingStudents || loadingSubjects || loadingPeriods;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/attendance")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Subject-wise Attendance
          </h1>
          <p className="text-muted-foreground">
            Mark attendance by subject and period
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Select Class, Subject & Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Section
              </label>
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections?.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {getClassName(section.class_id)} - {section.section_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Subject
              </label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects?.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.subject_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {periods?.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.period_name} ({period.start_time} -{" "}
                      {period.end_time})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Summary */}
      {isInitialized && attendanceEntries.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <div>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>
                {subjects?.find((s) => s.id === selectedSubject)?.subject_name}{" "}
                -{periods?.find((p) => p.id === selectedPeriod)?.period_name}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-green-500 hover:bg-green-600"
                onClick={() => handleMarkAll("Present")}
              >
                All Present
              </Button>
              <Button
                size="sm"
                className="bg-red-500 hover:bg-red-600"
                onClick={() => handleMarkAll("Absent")}
              >
                All Absent
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-4 text-sm">
              <Badge variant="outline" className="text-green-600">
                Present: {summary.present}
              </Badge>
              <Badge variant="outline" className="text-red-600">
                Absent: {summary.absent}
              </Badge>
              <Badge variant="outline" className="text-yellow-600">
                Late: {summary.late}
              </Badge>
              <Badge variant="secondary">Total: {summary.total}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !selectedSection || !selectedSubject || !selectedPeriod ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Select section, subject, and period to mark attendance
          </CardContent>
        </Card>
      ) : attendanceEntries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No students found in this section
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Admission No</TableHead>
                  <TableHead className="w-48">Status</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceEntries.map((entry, index) => (
                  <TableRow key={entry.studentId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {entry.studentName}
                    </TableCell>
                    <TableCell>{entry.admissionNumber}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {Object.entries(STATUS_CONFIG).map(
                          ([status, config]) => (
                            <Button
                              key={status}
                              size="sm"
                              variant={
                                entry.status === status ? "default" : "outline"
                              }
                              className={
                                entry.status === status ? config.color : ""
                              }
                              onClick={() =>
                                handleStatusChange(
                                  entry.studentId,
                                  status as SubjectAttendanceStatus
                                )
                              }
                            >
                              {config.label}
                            </Button>
                          )
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Remarks"
                        value={entry.remarks || ""}
                        onChange={(e) =>
                          setAttendanceEntries((prev) =>
                            prev.map((ent) =>
                              ent.studentId === entry.studentId
                                ? { ...ent, remarks: e.target.value }
                                : ent
                            )
                          )
                        }
                        className="h-8"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate("/attendance")}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Attendance
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
