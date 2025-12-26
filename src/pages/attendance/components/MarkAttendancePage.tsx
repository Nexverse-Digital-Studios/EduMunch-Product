/**
 * Mark Attendance Page
 * =====================
 * Page for marking daily attendance for a section
 * Routes:
 * - /attendance/mark - Select section to mark
 * - /attendance/mark/:sectionId - Mark attendance for specific section
 */

import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Check,
  X,
  Clock,
  MinusCircle,
  CalendarOff,
  Save,
  ArrowLeft,
  Loader2,
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
  AttendanceDB,
  AttendanceStatus,
  StudentAttendanceEntry,
} from "./types";

// Status button configuration
const STATUS_CONFIG: Record<
  AttendanceStatus,
  { icon: React.ReactNode; color: string; label: string }
> = {
  Present: {
    icon: <Check className="h-4 w-4" />,
    color: "bg-green-500 hover:bg-green-600",
    label: "P",
  },
  Absent: {
    icon: <X className="h-4 w-4" />,
    color: "bg-red-500 hover:bg-red-600",
    label: "A",
  },
  Late: {
    icon: <Clock className="h-4 w-4" />,
    color: "bg-yellow-500 hover:bg-yellow-600",
    label: "L",
  },
  "Half-day": {
    icon: <MinusCircle className="h-4 w-4" />,
    color: "bg-orange-500 hover:bg-orange-600",
    label: "H",
  },
  "On-leave": {
    icon: <CalendarOff className="h-4 w-4" />,
    color: "bg-blue-500 hover:bg-blue-600",
    label: "OL",
  },
};

export const MarkAttendancePage = () => {
  const { sectionId } = useParams<{ sectionId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedSection, setSelectedSection] = useState<string>(
    sectionId || ""
  );
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceEntries, setAttendanceEntries] = useState<
    StudentAttendanceEntry[]
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

  const { data: students, isLoading: loadingStudents } =
    useSupabaseTable<StudentDB>(TABLES.STUDENTS, {
      filters: selectedSection ? { section_id: selectedSection } : {},
      orderBy: { column: "roll_number", ascending: true },
    });

  const { data: existingAttendance } = useSupabaseTable<AttendanceDB>(
    TABLES.ATTENDANCE,
    {
      filters: selectedSection ? { section_id: selectedSection } : {},
    }
  );

  // Get class name for section
  const getClassName = (classId: string) => {
    const cls = classes?.find((c) => c.id === classId);
    return cls?.class_name || "";
  };

  // Initialize attendance entries when section/date changes
  useMemo(() => {
    if (!selectedSection || !students || !selectedDate) return;

    const dateAttendance =
      existingAttendance?.filter(
        (a) =>
          a.attendance_date === selectedDate && a.section_id === selectedSection
      ) || [];

    const entries: StudentAttendanceEntry[] = students.map((student) => {
      const existing = dateAttendance.find((a) => a.student_id === student.id);
      return {
        studentId: student.id,
        studentName: `${student.first_name} ${student.last_name}`,
        admissionNumber: student.admission_number,
        rollNumber: student.roll_number,
        status: existing?.status || "Present",
        remarks: existing?.remarks || "",
      };
    });

    setAttendanceEntries(entries);
    setIsInitialized(true);
  }, [selectedSection, selectedDate, students, existingAttendance]);

  // Handle status change for a student
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceEntries((prev) =>
      prev.map((entry) =>
        entry.studentId === studentId ? { ...entry, status } : entry
      )
    );
  };

  // Handle remarks change
  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceEntries((prev) =>
      prev.map((entry) =>
        entry.studentId === studentId ? { ...entry, remarks } : entry
      )
    );
  };

  // Mark all as present/absent
  const handleMarkAll = (status: AttendanceStatus) => {
    setAttendanceEntries((prev) => prev.map((entry) => ({ ...entry, status })));
  };

  // Save attendance
  const handleSave = async () => {
    if (!supabase || !selectedSection) {
      toast({
        title: "Error",
        description:
          "Unable to save attendance. Please check your configuration.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const section = sections?.find((s) => s.id === selectedSection);

    try {
      // Prepare upsert data
      const upsertData = attendanceEntries.map((entry) => ({
        student_id: entry.studentId,
        class_id: section?.class_id,
        section_id: selectedSection,
        attendance_date: selectedDate,
        status: entry.status,
        remarks: entry.remarks || null,
        marked_at: new Date().toISOString(),
      }));

      // Use upsert to insert or update
      const { error } = await supabase
        .from(TABLES.ATTENDANCE)
        .upsert(upsertData, {
          onConflict: "student_id,attendance_date",
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Attendance saved for ${selectedDate}`,
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

  // Filter students by search
  const filteredEntries = attendanceEntries.filter(
    (entry) =>
      entry.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Summary stats
  const summary = useMemo(() => {
    const stats = {
      total: attendanceEntries.length,
      present: attendanceEntries.filter((e) => e.status === "Present").length,
      absent: attendanceEntries.filter((e) => e.status === "Absent").length,
      late: attendanceEntries.filter((e) => e.status === "Late").length,
      halfDay: attendanceEntries.filter((e) => e.status === "Half-day").length,
      onLeave: attendanceEntries.filter((e) => e.status === "On-leave").length,
    };
    return stats;
  }, [attendanceEntries]);

  const isLoading = loadingSections || loadingStudents;

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
          <h1 className="text-2xl font-bold">Mark Attendance</h1>
          <p className="text-muted-foreground">
            Mark daily attendance for students
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Class & Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Section
              </label>
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a section" />
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
              <label className="mb-1.5 block text-sm font-medium">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Search Student
              </label>
              <Input
                placeholder="Search by name or roll number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {selectedSection && isInitialized && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <div>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Mark all students at once</CardDescription>
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
              <Badge variant="outline" className="text-orange-600">
                Half-day: {summary.halfDay}
              </Badge>
              <Badge variant="outline" className="text-blue-600">
                On Leave: {summary.onLeave}
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
          <span className="ml-2">Loading students...</span>
        </div>
      ) : !selectedSection ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Select a section to mark attendance
          </CardContent>
        </Card>
      ) : filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No students found in this section
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Admission No</TableHead>
                  <TableHead className="w-64">Status</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry, index) => (
                  <TableRow key={entry.studentId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{entry.rollNumber || "-"}</TableCell>
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
                                  status as AttendanceStatus
                                )
                              }
                              title={status}
                            >
                              {config.label}
                            </Button>
                          )
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Add remarks"
                        value={entry.remarks || ""}
                        onChange={(e) =>
                          handleRemarksChange(entry.studentId, e.target.value)
                        }
                        className="h-8"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredEntries.map((entry, index) => (
              <Card key={entry.studentId}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{entry.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        Roll: {entry.rollNumber || "-"} |{" "}
                        {entry.admissionNumber}
                      </p>
                    </div>
                    <Badge variant="secondary">#{index + 1}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={
                          entry.status === status ? "default" : "outline"
                        }
                        className={entry.status === status ? config.color : ""}
                        onClick={() =>
                          handleStatusChange(
                            entry.studentId,
                            status as AttendanceStatus
                          )
                        }
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                  <Input
                    placeholder="Add remarks"
                    value={entry.remarks || ""}
                    onChange={(e) =>
                      handleRemarksChange(entry.studentId, e.target.value)
                    }
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4 sticky bottom-4">
            <Button variant="outline" onClick={() => navigate("/attendance")}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || attendanceEntries.length === 0}
              className="gap-2"
            >
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
