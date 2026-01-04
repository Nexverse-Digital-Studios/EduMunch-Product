import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, Upload, CheckCircle, Download } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { ExamDB, MarksDB, MarksEntryData } from "./types";

const INDEX_TOKEN = "1emaet";

interface StudentDB {
  id: string;
  first_name: string;
  last_name: string;
  roll_number: string;
  class_id: string;
}

interface SubjectDB {
  id: string;
  subject_name: string;
  subject_code: string;
}

interface MarksEntryPageProps {
  examId?: string;
}

export function MarksEntryPage({ examId: propExamId }: MarksEntryPageProps) {
  const { id: paramId } = useParams<{ id: string }>();
  const examId = propExamId || paramId;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canView, canUpdate } = useModulePermissions("exams");

  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [marksData, setMarksData] = useState<MarksEntryData[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const { data: exams, isLoading: loadingExam } = useSupabaseTable<ExamDB>(
    `exams_${INDEX_TOKEN}`,
    { filters: { id: examId } }
  );

  const { data: subjects } = useSupabaseTable<SubjectDB>(
    `subjects_${INDEX_TOKEN}`,
    { orderBy: { column: "subject_name", ascending: true } }
  );

  const { data: students } = useSupabaseTable<StudentDB>(
    `students_${INDEX_TOKEN}`,
    { orderBy: { column: "roll_number", ascending: true } }
  );

  const { data: existingMarks } = useSupabaseTable<MarksDB>(
    `marks_${INDEX_TOKEN}`,
    {
      filters: { exam_id: examId },
      enabled: !!examId,
    }
  );

  const { createMutation, updateMutation } = useSupabaseTable<MarksDB>(
    `marks_${INDEX_TOKEN}`
  );

  const exam = exams?.[0];

  // Initialize marks data when subject changes
  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);

    if (students) {
      const initialMarks: MarksEntryData[] = students.map((student) => {
        const existingMark = existingMarks?.find(
          (m) => m.student_id === student.id && m.exam_subject_id === subjectId
        );

        return {
          student_id: student.id,
          student_name: `${student.first_name} ${student.last_name}`,
          roll_number: student.roll_number,
          marks_obtained: existingMark?.marks_obtained ?? null,
          is_absent: existingMark?.is_absent ?? false,
          remarks: existingMark?.remarks || "",
        };
      });

      setMarksData(initialMarks);
    }
  };

  const handleMarksChange = (studentId: string, marks: number | null) => {
    setMarksData((prev) =>
      prev.map((item) =>
        item.student_id === studentId
          ? { ...item, marks_obtained: marks, is_absent: false }
          : item
      )
    );
  };

  const handleAbsentChange = (studentId: string, isAbsent: boolean) => {
    setMarksData((prev) =>
      prev.map((item) =>
        item.student_id === studentId
          ? {
              ...item,
              is_absent: isAbsent,
              marks_obtained: isAbsent ? null : item.marks_obtained,
            }
          : item
      )
    );
  };

  const handleSaveMarks = async () => {
    if (!exam || !selectedSubject) return;

    setIsSaving(true);

    try {
      for (const entry of marksData) {
        const existingMark = existingMarks?.find(
          (m) =>
            m.student_id === entry.student_id &&
            m.exam_subject_id === selectedSubject
        );

        if (existingMark) {
          await updateMutation.mutateAsync({
            id: existingMark.id,
            updates: {
              marks_obtained: entry.marks_obtained || 0,
              is_absent: entry.is_absent,
              remarks: entry.remarks || null,
            },
          });
        } else if (entry.marks_obtained !== null || entry.is_absent) {
          await createMutation.mutateAsync({
            exam_id: exam.id,
            exam_subject_id: selectedSubject,
            student_id: entry.student_id,
            marks_obtained: entry.marks_obtained || 0,
            is_absent: entry.is_absent,
            is_verified: false,
            verified_by: null,
            verified_at: null,
            remarks: entry.remarks || null,
          });
        }
      }

      toast({
        title: "Marks saved",
        description: "All marks have been successfully saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save marks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getPassFailBadge = (marks: number | null, isAbsent: boolean) => {
    if (isAbsent) return <Badge variant="outline">Absent</Badge>;
    if (marks === null) return null;
    if (!exam) return null;

    return marks >= exam.passing_marks ? (
      <Badge variant="default" className="bg-green-500">
        Pass
      </Badge>
    ) : (
      <Badge variant="destructive">Fail</Badge>
    );
  };

  if (!canView) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to view marks.
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
          <h1 className="text-3xl font-bold tracking-tight">Marks Entry</h1>
          <p className="text-muted-foreground">
            Enter marks for {exam.exam_name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => toast({ title: "Bulk Upload", description: "Coming soon" })}
          >
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          <Button 
            variant="outline" 
            onClick={() => toast({ title: "Verify Marks", description: "Coming soon" })}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Verify Marks
          </Button>
        </div>
      </div>

      {/* Subject Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Subject</CardTitle>
          <CardDescription>Choose a subject to enter marks</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedSubject} onValueChange={handleSubjectChange}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects?.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.subject_name} ({subject.subject_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Marks Entry Table */}
      {selectedSubject && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Student Marks</CardTitle>
              <CardDescription>
                Max Marks: {exam.max_marks} | Passing Marks:{" "}
                {exam.passing_marks}
              </CardDescription>
            </div>
            {canUpdate && (
              <Button onClick={handleSaveMarks} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Marks"}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {marksData.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Marks Obtained</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marksData.map((entry) => (
                      <TableRow key={entry.student_id}>
                        <TableCell className="font-medium">
                          {entry.roll_number}
                        </TableCell>
                        <TableCell>{entry.student_name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={exam.max_marks}
                            value={entry.marks_obtained ?? ""}
                            onChange={(e) =>
                              handleMarksChange(
                                entry.student_id,
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                            disabled={entry.is_absent || !canUpdate}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={entry.is_absent}
                            onCheckedChange={(checked) =>
                              handleAbsentChange(
                                entry.student_id,
                                checked as boolean
                              )
                            }
                            disabled={!canUpdate}
                          />
                        </TableCell>
                        <TableCell>
                          {getPassFailBadge(
                            entry.marks_obtained,
                            entry.is_absent
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No students found for marks entry.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {selectedSubject && marksData.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{marksData.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Marks Entered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  marksData.filter(
                    (m) => m.marks_obtained !== null || m.is_absent
                  ).length
                }
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pass</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {
                  marksData.filter(
                    (m) =>
                      m.marks_obtained !== null &&
                      m.marks_obtained >= exam.passing_marks
                  ).length
                }
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {marksData.filter((m) => m.is_absent).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
