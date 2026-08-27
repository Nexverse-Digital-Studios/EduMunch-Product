import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { ExamDB, EXAM_TYPES, EXAM_STATUSES } from "./types";

const INDEX_TOKEN = "1emaet";

interface AcademicYearDB {
  id: string;
  year_name: string;
}

export function ExamsExportPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canExport } = useModulePermissions("exams");
  const [selectedExam, setSelectedExam] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [exportFormat, setExportFormat] = useState<string>("csv");
  const [exportOptions, setExportOptions] = useState({
    includeSchedule: true,
    includeMarks: true,
    includeStatistics: true,
    includeReportCards: false,
  });

  const { data: exams, isLoading } = useSupabaseTable<ExamDB>(
    `exams_${INDEX_TOKEN}`,
    { orderBy: { column: "start_date", ascending: false } }
  );

  const { data: academicYears } = useSupabaseTable<AcademicYearDB>(
    `academic_years_${INDEX_TOKEN}`,
    { orderBy: { column: "year_name", ascending: false } }
  );

  const filteredExams = exams?.filter((exam) => {
    if (selectedYear !== "all" && exam.academic_year_id !== selectedYear)
      return false;
    return true;
  });

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: `Exporting exam data in ${exportFormat.toUpperCase()} format...`,
    });

    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your export file is ready for download.",
      });
    }, 2000);
  };

  if (!canExport) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to export exam data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/exams")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Export Exam Data
          </h1>
          <p className="text-muted-foreground">
            Export exam results, marks, and reports
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Export Filters
            </CardTitle>
            <CardDescription>Select which data to export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Academic Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {academicYears?.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.year_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Specific Exam</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exams</SelectItem>
                  {filteredExams?.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.exam_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
            <CardDescription>Choose what data to include</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="schedule"
                checked={exportOptions.includeSchedule}
                onCheckedChange={(checked) =>
                  setExportOptions({
                    ...exportOptions,
                    includeSchedule: checked as boolean,
                  })
                }
              />
              <Label htmlFor="schedule" className="text-sm font-normal">
                Include exam schedules
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="marks"
                checked={exportOptions.includeMarks}
                onCheckedChange={(checked) =>
                  setExportOptions({
                    ...exportOptions,
                    includeMarks: checked as boolean,
                  })
                }
              />
              <Label htmlFor="marks" className="text-sm font-normal">
                Include student marks
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="statistics"
                checked={exportOptions.includeStatistics}
                onCheckedChange={(checked) =>
                  setExportOptions({
                    ...exportOptions,
                    includeStatistics: checked as boolean,
                  })
                }
              />
              <Label htmlFor="statistics" className="text-sm font-normal">
                Include statistics and analytics
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="reports"
                checked={exportOptions.includeReportCards}
                onCheckedChange={(checked) =>
                  setExportOptions({
                    ...exportOptions,
                    includeReportCards: checked as boolean,
                  })
                }
              />
              <Label htmlFor="reports" className="text-sm font-normal">
                Include report cards
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Export Summary</CardTitle>
          <CardDescription>Review what will be exported</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border">
              <div className="text-sm text-muted-foreground">
                Exams Selected
              </div>
              <div className="text-2xl font-bold">
                {selectedExam === "all" ? filteredExams?.length || 0 : 1}
              </div>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="text-sm text-muted-foreground">Format</div>
              <div className="text-2xl font-bold flex items-center gap-2">
                {exportFormat === "csv" && (
                  <FileSpreadsheet className="h-6 w-6" />
                )}
                {exportFormat === "xlsx" && (
                  <FileSpreadsheet className="h-6 w-6" />
                )}
                {exportFormat === "pdf" && <FileText className="h-6 w-6" />}
                {exportFormat === "json" && <FileText className="h-6 w-6" />}
                {exportFormat.toUpperCase()}
              </div>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="text-sm text-muted-foreground">Data Included</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {exportOptions.includeSchedule && (
                  <Badge variant="secondary">Schedule</Badge>
                )}
                {exportOptions.includeMarks && (
                  <Badge variant="secondary">Marks</Badge>
                )}
                {exportOptions.includeStatistics && (
                  <Badge variant="secondary">Stats</Badge>
                )}
                {exportOptions.includeReportCards && (
                  <Badge variant="secondary">Reports</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleExport} size="lg">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Exams Preview */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Available Exams ({filteredExams?.length || 0})
            </CardTitle>
            <CardDescription>
              Exams that will be included in the export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {filteredExams?.slice(0, 5).map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <div className="font-medium">{exam.exam_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(exam.start_date).toLocaleDateString()} -{" "}
                      {new Date(exam.end_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {
                        EXAM_TYPES.find((t) => t.value === exam.exam_type)
                          ?.label
                      }
                    </Badge>
                    <Badge
                      variant={
                        exam.status === "completed"
                          ? "default"
                          : exam.status === "ongoing"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {
                        EXAM_STATUSES.find((s) => s.value === exam.status)
                          ?.label
                      }
                    </Badge>
                  </div>
                </div>
              ))}
              {filteredExams && filteredExams.length > 5 && (
                <div className="text-center text-sm text-muted-foreground py-2">
                  And {filteredExams.length - 5} more exams...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
