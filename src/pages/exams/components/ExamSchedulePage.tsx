import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash2, Calendar, Clock, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { ExamDB, ExamSubjectDB } from "./types";

const INDEX_TOKEN = "1emaet";

interface SubjectDB {
  id: string;
  subject_name: string;
  subject_code: string;
}

interface ExamSchedulePageProps {
  examId?: string;
}

export function ExamSchedulePage({ examId: propExamId }: ExamSchedulePageProps) {
  const { id: paramId } = useParams<{ id: string }>();
  const examId = propExamId || paramId;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canView, canUpdate } = useModulePermissions("exams");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    subject_id: "",
    exam_date: "",
    start_time: "",
    end_time: "",
    max_marks: 100,
    passing_marks: 33,
    room_number: "",
  });

  const { data: exams, isLoading: loadingExam } = useSupabaseTable<ExamDB>(
    `exams_${INDEX_TOKEN}`,
    { filters: { id: examId } }
  );

  const { data: subjects } = useSupabaseTable<SubjectDB>(
    `subjects_${INDEX_TOKEN}`,
    { orderBy: { column: "subject_name", ascending: true } }
  );

  const {
    data: schedules,
    isLoading: loadingSchedules,
    createMutation,
    deleteMutation,
  } = useSupabaseTable<ExamSubjectDB>(`exam_subjects_${INDEX_TOKEN}`, {
    filters: { exam_id: examId },
    orderBy: { column: "exam_date", ascending: true },
  });

  const exam = exams?.[0];

  const getSubjectName = (subjectId: string) => {
    const subject = subjects?.find((s) => s.id === subjectId);
    return subject
      ? `${subject.subject_name} (${subject.subject_code})`
      : "Unknown";
  };

  const handleAddSchedule = async () => {
    if (!exam || !newSchedule.subject_id || !newSchedule.exam_date) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        exam_id: exam.id,
        subject_id: newSchedule.subject_id,
        exam_date: newSchedule.exam_date,
        start_time: newSchedule.start_time,
        end_time: newSchedule.end_time,
        max_marks: newSchedule.max_marks,
        passing_marks: newSchedule.passing_marks,
        room_number: newSchedule.room_number || null,
      });

      toast({
        title: "Schedule added",
        description: "Exam schedule has been added successfully.",
      });

      setIsDialogOpen(false);
      setNewSchedule({
        subject_id: "",
        exam_date: "",
        start_time: "",
        end_time: "",
        max_marks: 100,
        passing_marks: 33,
        room_number: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add schedule. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await deleteMutation.mutateAsync(scheduleId);
      toast({
        title: "Schedule deleted",
        description: "Exam schedule has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete schedule.",
        variant: "destructive",
      });
    }
  };

  if (!canView) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to view exam schedules.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loadingExam) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-red-500">Exam not found</p>
          <div className="flex justify-center mt-4">
            <Button onClick={() => navigate("/exams")}>Back to Exams</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Schedule</h1>
          <p className="text-muted-foreground">
            Manage schedule for {exam.exam_name}
          </p>
        </div>
        {canUpdate && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Subject to Schedule</DialogTitle>
                <DialogDescription>
                  Add a subject with date and time to the exam schedule.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select
                    value={newSchedule.subject_id}
                    onValueChange={(value) =>
                      setNewSchedule({ ...newSchedule, subject_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects?.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.subject_name} ({subject.subject_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Exam Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newSchedule.exam_date}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        exam_date: e.target.value,
                      })
                    }
                    min={exam.start_date}
                    max={exam.end_date}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={newSchedule.start_time}
                      onChange={(e) =>
                        setNewSchedule({
                          ...newSchedule,
                          start_time: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={newSchedule.end_time}
                      onChange={(e) =>
                        setNewSchedule({
                          ...newSchedule,
                          end_time: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="max_marks">Max Marks</Label>
                    <Input
                      id="max_marks"
                      type="number"
                      value={newSchedule.max_marks}
                      onChange={(e) =>
                        setNewSchedule({
                          ...newSchedule,
                          max_marks: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="passing_marks">Passing Marks</Label>
                    <Input
                      id="passing_marks"
                      type="number"
                      value={newSchedule.passing_marks}
                      onChange={(e) =>
                        setNewSchedule({
                          ...newSchedule,
                          passing_marks: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="room">Room Number</Label>
                  <Input
                    id="room"
                    placeholder="e.g., Room 101"
                    value={newSchedule.room_number}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        room_number: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSchedule}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Adding..." : "Add Schedule"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Exam Info */}
      <Card>
        <CardHeader>
          <CardTitle>Exam Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {new Date(exam.start_date).toLocaleDateString()} -{" "}
                {new Date(exam.end_date).toLocaleDateString()}
              </span>
            </div>
            <Badge variant="outline">
              {schedules?.length || 0} subjects scheduled
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Schedule</CardTitle>
          <CardDescription>
            All scheduled subjects for this exam
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSchedules ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : schedules && schedules.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Room</TableHead>
                    {canUpdate && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">
                        {getSubjectName(schedule.subject_id)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(schedule.exam_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {schedule.start_time} - {schedule.end_time}
                        </div>
                      </TableCell>
                      <TableCell>
                        {schedule.max_marks} (Pass: {schedule.passing_marks})
                      </TableCell>
                      <TableCell>
                        {schedule.room_number ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {schedule.room_number}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      {canUpdate && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No subjects scheduled yet. Add subjects to create the exam
              schedule.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
