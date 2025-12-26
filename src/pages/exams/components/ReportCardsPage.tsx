import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Award,
} from "lucide-react";
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
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { ReportCardDB, ExamDB, GRADES } from "./types";

const INDEX_TOKEN = "1emaet";

interface StudentDB {
  id: string;
  first_name: string;
  last_name: string;
  roll_number: string;
  class_id: string;
}

interface ClassDB {
  id: string;
  class_name: string;
  section: string;
}

export function ReportCardsPage() {
  const navigate = useNavigate();
  const { canView, canExport } = useModulePermissions("exams");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedExam, setSelectedExam] = useState<string>("all");

  const { data: reportCards, isLoading } = useSupabaseTable<ReportCardDB>(
    `report_cards_${INDEX_TOKEN}`,
    { orderBy: { column: "generated_at", ascending: false } }
  );

  const { data: students } = useSupabaseTable<StudentDB>(
    `students_${INDEX_TOKEN}`,
    { orderBy: { column: "roll_number", ascending: true } }
  );

  const { data: classes } = useSupabaseTable<ClassDB>(
    `classes_${INDEX_TOKEN}`,
    { orderBy: { column: "class_name", ascending: true } }
  );

  const { data: exams } = useSupabaseTable<ExamDB>(`exams_${INDEX_TOKEN}`, {
    orderBy: { column: "start_date", ascending: false },
  });

  const getStudentName = (studentId: string) => {
    const student = students?.find((s) => s.id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : "Unknown";
  };

  const getStudentRollNo = (studentId: string) => {
    const student = students?.find((s) => s.id === studentId);
    return student?.roll_number || "N/A";
  };

  const getStudentClass = (studentId: string) => {
    const student = students?.find((s) => s.id === studentId);
    if (!student) return "N/A";
    const cls = classes?.find((c) => c.id === student.class_id);
    return cls ? `${cls.class_name} - ${cls.section}` : "N/A";
  };

  const getExamName = (examId: string | null) => {
    if (!examId) return "Overall";
    const exam = exams?.find((e) => e.id === examId);
    return exam?.exam_name || "Unknown";
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "bg-green-500";
    if (grade.startsWith("B")) return "bg-blue-500";
    if (grade.startsWith("C")) return "bg-yellow-500";
    if (grade.startsWith("D")) return "bg-orange-500";
    return "bg-red-500";
  };

  const filteredReportCards = reportCards?.filter((rc) => {
    const student = students?.find((s) => s.id === rc.student_id);
    const matchesSearch =
      getStudentName(rc.student_id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (student?.roll_number || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesClass =
      selectedClass === "all" || student?.class_id === selectedClass;
    const matchesExam =
      selectedExam === "all" ||
      rc.exam_id === selectedExam ||
      (!rc.exam_id && selectedExam === "overall");
    return matchesSearch && matchesClass && matchesExam;
  });

  // Statistics
  const stats = {
    total: reportCards?.length || 0,
    passed: reportCards?.filter((rc) => rc.percentage >= 33).length || 0,
    distinction: reportCards?.filter((rc) => rc.percentage >= 75).length || 0,
    avgPercentage:
      reportCards && reportCards.length > 0
        ? (
            reportCards.reduce((sum, rc) => sum + rc.percentage, 0) /
            reportCards.length
          ).toFixed(1)
        : "0",
  };

  if (!canView) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to view report cards.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/exams")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Report Cards</h1>
            <p className="text-muted-foreground">
              View and manage student report cards
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/report-cards/templates">
              <FileText className="mr-2 h-4 w-4" />
              Templates
            </Link>
          </Button>
          {canExport && (
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Report Cards
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passed</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.passed}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distinction</CardTitle>
            <Award className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.distinction}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Percentage
            </CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgPercentage}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Cards List</CardTitle>
          <CardDescription>
            Browse and download student report cards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes?.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.class_name} - {cls.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedExam} onValueChange={setSelectedExam}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by exam" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                <SelectItem value="overall">Overall</SelectItem>
                {exams?.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.exam_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredReportCards && filteredReportCards.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReportCards.map((rc) => (
                    <TableRow key={rc.id}>
                      <TableCell className="font-medium">
                        {getStudentRollNo(rc.student_id)}
                      </TableCell>
                      <TableCell>{getStudentName(rc.student_id)}</TableCell>
                      <TableCell>{getStudentClass(rc.student_id)}</TableCell>
                      <TableCell>{getExamName(rc.exam_id)}</TableCell>
                      <TableCell>
                        {rc.obtained_marks}/{rc.total_marks}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            rc.percentage >= 33 ? "default" : "destructive"
                          }
                        >
                          {rc.percentage.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getGradeColor(rc.grade)}>
                          {rc.grade}
                        </Badge>
                      </TableCell>
                      <TableCell>{rc.rank ? `#${rc.rank}` : "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/report-cards/${rc.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || selectedClass !== "all" || selectedExam !== "all"
                ? "No report cards match your filters."
                : "No report cards found. Generate report cards from the exam details page."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
          <CardDescription>
            Overview of grades across all report cards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-8">
            {GRADES.map((gradeInfo) => {
              const count =
                reportCards?.filter((rc) => rc.grade === gradeInfo.grade)
                  .length || 0;
              return (
                <div
                  key={gradeInfo.grade}
                  className="text-center p-3 rounded-lg border"
                >
                  <div
                    className={`text-2xl font-bold ${
                      gradeInfo.grade.startsWith("A")
                        ? "text-green-600"
                        : gradeInfo.grade.startsWith("B")
                        ? "text-blue-600"
                        : gradeInfo.grade.startsWith("C")
                        ? "text-yellow-600"
                        : gradeInfo.grade.startsWith("D")
                        ? "text-orange-600"
                        : "text-red-600"
                    }`}
                  >
                    {gradeInfo.grade}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {count} students
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {gradeInfo.minPercent}-{gradeInfo.maxPercent}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
