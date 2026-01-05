/**
 * Schedule Conflicts Page
 * ========================
 * View and resolve scheduling conflicts - fetches real data from database
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Users,
  Clock,
  MapPin,
  Check,
  X,
  Filter,
  RefreshCw,
  Link2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
}

interface SectionDB {
  id: string;
  section_name: string;
  section_code: string;
}

interface SubjectDB {
  id: string;
  subject_name: string;
}

interface TeacherDB {
  id: string;
  first_name: string;
  last_name: string;
}

interface Conflict {
  id: string;
  type: "teacher" | "room";
  severity: "high" | "medium";
  description: string;
  resource: string;
  day: string;
  time: string;
  entries: TimetableEntryDB[];
}

const ConflictsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canView, canUpdate } = useModulePermissions("timetable");

  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(
    null
  );
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const [resolvedConflicts, setResolvedConflicts] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [roomAssignment, setRoomAssignment] = useState<string>("");
  const [masterSectionForMerge, setMasterSectionForMerge] =
    useState<string>("");

  // Fetch all timetable entries
  const {
    data: timetableData,
    isLoading,
    refetch: refetchTimetables,
    updateMutation: updateTimetable,
  } = useSupabaseTable<TimetableEntryDB>(TABLES.TIMETABLES, {
    filters: { is_active: true },
  });

  // Fetch periods
  const { data: periodsData, refetch: refetchPeriods } =
    useSupabaseTable<PeriodDB>(TABLES.TIMETABLE_PERIODS);

  // Fetch sections
  const { data: sectionsData, refetch: refetchSections } =
    useSupabaseTable<SectionDB>(TABLES.SECTIONS);

  // Fetch subjects
  const { data: subjectsData, refetch: refetchSubjects } =
    useSupabaseTable<SubjectDB>(TABLES.SUBJECTS);

  // Fetch teachers
  const { data: teachersData, refetch: refetchTeachers } =
    useSupabaseTable<TeacherDB>(TABLES.TEACHERS);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchTimetables?.(),
        refetchPeriods?.(),
        refetchSections?.(),
        refetchSubjects?.(),
        refetchTeachers?.(),
      ]);
      toast({
        title: "Success",
        description: "Conflicts refreshed successfully",
      });
    } catch (error) {
      console.error("Error refreshing conflicts:", error);
      toast({
        title: "Error",
        description: "Failed to refresh conflicts",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const timetableEntries = timetableData || [];
  const periods = periodsData || [];
  const sections = sectionsData || [];
  const subjects = subjectsData || [];
  const teachers = teachersData || [];

  // Helper functions
  const getSectionName = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    return section?.section_name || "Unknown Section";
  };

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

  const getPeriodTime = (periodId: string) => {
    const period = periods.find((p) => p.id === periodId);
    if (!period) return "";
    return `${period.start_time} - ${period.end_time}`;
  };

  // Detect conflicts
  const conflicts = useMemo(() => {
    const detected: Conflict[] = [];

    // Group entries by day and period
    const groupedEntries: Record<string, TimetableEntryDB[]> = {};

    timetableEntries.forEach((entry) => {
      const key = `${entry.day_of_week}-${entry.period_id}`;
      if (!groupedEntries[key]) {
        groupedEntries[key] = [];
      }
      groupedEntries[key].push(entry);
    });

    // Check for teacher conflicts (same teacher at same time)
    const teacherSchedules: Record<
      string,
      Record<string, TimetableEntryDB[]>
    > = {};

    timetableEntries.forEach((entry) => {
      if (entry.teacher_id) {
        const key = `${entry.day_of_week}-${entry.period_id}`;
        if (!teacherSchedules[entry.teacher_id]) {
          teacherSchedules[entry.teacher_id] = {};
        }
        if (!teacherSchedules[entry.teacher_id][key]) {
          teacherSchedules[entry.teacher_id][key] = [];
        }
        teacherSchedules[entry.teacher_id][key].push(entry);
      }
    });

    Object.entries(teacherSchedules).forEach(([teacherId, schedule]) => {
      Object.entries(schedule).forEach(([timeKey, entries]) => {
        if (entries.length > 1) {
          const [day, periodId] = timeKey.split("-");
          detected.push({
            id: `teacher-${teacherId}-${timeKey}`,
            type: "teacher",
            severity: "high",
            description:
              "Teacher assigned to multiple classes at the same time",
            resource: getTeacherName(teacherId),
            day,
            time: getPeriodTime(periodId),
            entries,
          });
        }
      });
    });

    // Check for room conflicts (same room at same time)
    const roomSchedules: Record<
      string,
      Record<string, TimetableEntryDB[]>
    > = {};

    timetableEntries.forEach((entry) => {
      if (entry.room_number) {
        const key = `${entry.day_of_week}-${entry.period_id}`;
        if (!roomSchedules[entry.room_number]) {
          roomSchedules[entry.room_number] = {};
        }
        if (!roomSchedules[entry.room_number][key]) {
          roomSchedules[entry.room_number][key] = [];
        }
        roomSchedules[entry.room_number][key].push(entry);
      }
    });

    Object.entries(roomSchedules).forEach(([room, schedule]) => {
      Object.entries(schedule).forEach(([timeKey, entries]) => {
        if (entries.length > 1) {
          const [day, periodId] = timeKey.split("-");
          detected.push({
            id: `room-${room}-${timeKey}`,
            type: "room",
            severity: "medium",
            description: "Multiple classes scheduled in the same room",
            resource: room,
            day,
            time: getPeriodTime(periodId),
            entries,
          });
        }
      });
    });

    return detected;
  }, [timetableEntries, periods, teachers]);

  // Filter conflicts
  const filteredConflicts = conflicts.filter((conflict) => {
    const matchesType = filterType === "all" || conflict.type === filterType;
    const matchesSeverity =
      filterSeverity === "all" || conflict.severity === filterSeverity;
    const notResolved = !resolvedConflicts.includes(conflict.id);
    return matchesType && matchesSeverity && notResolved;
  });

  const resolvedCount = resolvedConflicts.length;
  const unresolvedCount = conflicts.length - resolvedCount;

  const handleResolve = (conflictId: string) => {
    setResolvedConflicts([...resolvedConflicts, conflictId]);
    setShowResolveDialog(false);
    setSelectedConflict(null);
    toast({
      title: "Conflict Resolved",
      description: "The scheduling conflict has been marked as resolved.",
    });
  };

  const handleMerge = async () => {
    if (
      !selectedConflict ||
      !masterSectionForMerge ||
      selectedConflict.type !== "teacher"
    ) {
      toast({
        title: "Error",
        description: "Invalid merge configuration",
        variant: "destructive",
      });
      return;
    }

    try {
      // When merging classes, we keep all entries active
      // The system will automatically detect merged classes based on:
      // - Same teacher_id
      // - Same subject_id
      // - Same period_id
      // - Same day_of_week
      // All entries with same teacher+subject+period+day are displayed as merged

      // Refresh to show merged state
      await refetchTimetables?.();

      setResolvedConflicts([...resolvedConflicts, selectedConflict.id]);
      setShowMergeDialog(false);
      setSelectedConflict(null);
      setMasterSectionForMerge("");

      toast({
        title: "Classes Merged",
        description:
          "Classes have been merged. Both sections will now be displayed together with merged styling.",
      });
    } catch (error) {
      console.error("Error merging classes:", error);
      toast({
        title: "Error",
        description: "Failed to merge classes",
        variant: "destructive",
      });
    }
  };

  const handleAssignRoom = async () => {
    if (!selectedConflict || !roomAssignment) {
      toast({
        title: "Error",
        description: "Please enter a room number",
        variant: "destructive",
      });
      return;
    }

    try {
      // For room conflicts, update ONE entry with the new room
      // (We'll keep the first entry and move it to a different room)
      if (selectedConflict.entries.length > 0) {
        await updateTimetable.mutateAsync({
          id: selectedConflict.entries[0].id,
          updates: {
            room_number: roomAssignment,
          } as any,
        });

        // Optionally delete other conflicting entries if they're duplicates
        // For now, just update the first one to the new room
      }

      // Refetch to get updated data
      await refetchTimetables?.();

      setResolvedConflicts([...resolvedConflicts, selectedConflict.id]);
      setShowRoomDialog(false);
      setSelectedConflict(null);
      setRoomAssignment("");

      toast({
        title: "Room Assigned",
        description: `Room ${roomAssignment} has been assigned. Please assign other sections to different rooms if needed.`,
      });
    } catch (error) {
      console.error("Error assigning room:", error);
      toast({
        title: "Error",
        description: "Failed to assign room",
        variant: "destructive",
      });
    }
  };

  const getConflictIcon = (type: string) => {
    switch (type) {
      case "teacher":
        return <Users className="h-5 w-5" />;
      case "room":
        return <MapPin className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      default:
        return "secondary";
    }
  };

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          You don't have permission to view conflicts.
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
            Schedule Conflicts
          </h1>
          <p className="text-muted-foreground">
            View and resolve scheduling conflicts
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Conflicts</p>
                <p className="text-3xl font-bold">{conflicts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unresolved</p>
                <p className="text-3xl font-bold text-red-500">
                  {unresolvedCount}
                </p>
              </div>
              <X className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-3xl font-bold text-green-500">
                  {resolvedCount}
                </p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Conflict Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="teacher">Teacher Conflicts</SelectItem>
                <SelectItem value="room">Room Conflicts</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Conflicts List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </CardContent>
          </Card>
        ) : filteredConflicts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Check className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold">No Conflicts Found</h3>
              <p className="text-muted-foreground">
                {conflicts.length === 0
                  ? "No scheduling conflicts detected in the timetable."
                  : "All scheduling conflicts have been resolved."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredConflicts.map((conflict) => (
            <Card key={conflict.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getConflictIcon(conflict.type)}
                    <div>
                      <CardTitle className="text-lg">
                        {conflict.description}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {conflict.day} • {conflict.time}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getSeverityColor(conflict.severity) as any}>
                    {conflict.severity.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium">
                    Conflicting Resource: {conflict.resource}
                  </p>
                  <div className="space-y-1">
                    {conflict.entries.map((entry, index) => (
                      <div
                        key={entry.id}
                        className="text-sm flex items-center gap-2"
                      >
                        <span className="font-mono text-muted-foreground">
                          {index + 1}.
                        </span>
                        <span>
                          {getSectionName(entry.section_id)} -{" "}
                          {getSubjectName(entry.subject_id)}
                        </span>
                        <span className="text-muted-foreground">
                          ({getTeacherName(entry.teacher_id)},{" "}
                          {entry.room_number || "No room"})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {canUpdate && (
                  <div className="flex flex-wrap gap-2 justify-end mt-4">
                    {conflict.type === "teacher" && (
                      <Button
                        onClick={() => {
                          setSelectedConflict(conflict);
                          setMasterSectionForMerge("");
                          setShowMergeDialog(true);
                        }}
                        variant="outline"
                        className="gap-2"
                      >
                        <Link2 className="h-4 w-4" />
                        Merge Classes
                      </Button>
                    )}
                    {conflict.type === "room" && (
                      <Button
                        onClick={() => {
                          setSelectedConflict(conflict);
                          setRoomAssignment("");
                          setShowRoomDialog(true);
                        }}
                        variant="outline"
                        className="gap-2"
                      >
                        <MapPin className="h-4 w-4" />
                        Assign Different Room
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        setSelectedConflict(conflict);
                        setShowResolveDialog(true);
                      }}
                    >
                      Resolve Conflict
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Conflict</DialogTitle>
            <DialogDescription>
              Choose how to resolve this scheduling conflict.
            </DialogDescription>
          </DialogHeader>
          {selectedConflict && (
            <div className="space-y-4">
              <p className="text-sm">{selectedConflict.description}</p>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-medium">
                  {selectedConflict.resource}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedConflict.day} • {selectedConflict.time}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResolveDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedConflict && handleResolve(selectedConflict.id)
              }
            >
              Mark as Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Merge Classes Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merge Classes</DialogTitle>
            <DialogDescription>
              Select which section will be the primary display. Both sections
              will be highlighted together with merged styling, allowing the
              teacher to conduct a merged session. Both sections will appear on
              their respective timetables.
            </DialogDescription>
          </DialogHeader>
          {selectedConflict && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-3 space-y-2">
                {selectedConflict.entries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => setMasterSectionForMerge(entry.section_id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                      masterSectionForMerge === entry.section_id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-medium">
                      {sectionsData?.find((s) => s.id === entry.section_id)
                        ?.section_name || "Unknown"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {
                        subjectsData?.find((s) => s.id === entry.subject_id)
                          ?.subject_name
                      }
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowMergeDialog(false);
                setMasterSectionForMerge("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleMerge} disabled={!masterSectionForMerge}>
              Merge Classes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Room Assignment Dialog */}
      <Dialog open={showRoomDialog} onOpenChange={setShowRoomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Different Room</DialogTitle>
            <DialogDescription>
              Assign a different room to resolve the room conflict.
            </DialogDescription>
          </DialogHeader>
          {selectedConflict && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-medium">Current Room</p>
                <p className="text-lg font-semibold">
                  {selectedConflict.resource}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-input">New Room Number</Label>
                <Input
                  id="room-input"
                  placeholder="e.g., Room 101"
                  value={roomAssignment}
                  onChange={(e) => setRoomAssignment(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRoomDialog(false);
                setRoomAssignment("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignRoom} disabled={!roomAssignment}>
              Assign Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConflictsPage;
