/**
 * Export Attendance Page
 * =======================
 * Page for exporting attendance data
 * Route: /attendance/export
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Calendar,
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES, supabase } from "@/lib/supabase";
import { SectionDB, ClassDB, AttendanceDB } from "./types";

type ExportFormat = "csv" | "excel" | "pdf";

export const ExportAttendancePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState(
    new Date(new Date().setDate(1)).toISOString().split("T")[0]
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [includeRemarks, setIncludeRemarks] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch data
  const { data: sections } = useSupabaseTable<SectionDB>(TABLES.SECTIONS, {
    orderBy: { column: "section_name", ascending: true },
  });

  const { data: classes } = useSupabaseTable<ClassDB>(TABLES.CLASSES, {
    orderBy: { column: "display_order", ascending: true },
  });

  const { data: attendance } = useSupabaseTable<AttendanceDB>(
    TABLES.ATTENDANCE,
    { orderBy: { column: "attendance_date", ascending: false } }
  );

  const getClassName = (classId: string) => {
    const cls = classes?.find((c) => c.id === classId);
    return cls?.class_name || "";
  };

  // Filter attendance based on selection
  const getFilteredData = () => {
    if (!attendance) return [];

    return attendance.filter((a) => {
      const date = new Date(a.attendance_date);
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      const matchesSection =
        selectedSection === "all" || a.section_id === selectedSection;
      const matchesDate = date >= from && date <= to;
      return matchesSection && matchesDate;
    });
  };

  // Convert data to CSV
  const convertToCSV = (data: AttendanceDB[]) => {
    const headers = ["Date", "Student ID", "Section ID", "Status"];
    if (includeRemarks) headers.push("Remarks");

    const rows = data.map((record) => {
      const row = [
        record.attendance_date,
        record.student_id,
        record.section_id,
        record.status,
      ];
      if (includeRemarks) row.push(record.remarks || "");
      return row.join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  };

  // Handle export
  const handleExport = async () => {
    const filteredData = getFilteredData();

    if (filteredData.length === 0) {
      toast({
        title: "No Data",
        description: "No attendance records found for the selected filters.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      if (exportFormat === "csv") {
        const csv = convertToCSV(filteredData);
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `attendance_${dateFrom}_to_${dateTo}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Export Successful",
          description: `Exported ${filteredData.length} records to CSV`,
        });
      } else {
        // For Excel and PDF, show coming soon message
        toast({
          title: "Coming Soon",
          description: `${exportFormat.toUpperCase()} export will be available soon.`,
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export attendance data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const recordCount = getFilteredData().length;

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
            <Download className="h-6 w-6" />
            Export Attendance
          </h1>
          <p className="text-muted-foreground">
            Download attendance data in various formats
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Filter Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Data Range
            </CardTitle>
            <CardDescription>
              Choose the data you want to export
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Section
              </label>
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {sections?.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {getClassName(section.class_id)} - {section.section_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  From Date
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  To Date
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remarks"
                  checked={includeRemarks}
                  onCheckedChange={(checked) => setIncludeRemarks(!!checked)}
                />
                <Label htmlFor="remarks">Include remarks column</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="summary"
                  checked={includeSummary}
                  onCheckedChange={(checked) => setIncludeSummary(!!checked)}
                />
                <Label htmlFor="summary">Include summary sheet</Label>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>{recordCount}</strong> records will be exported
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Export Format */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Export Format</CardTitle>
            <CardDescription>Choose your preferred file format</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={exportFormat}
              onValueChange={(v) => setExportFormat(v as ExportFormat)}
            >
              <div className="space-y-4">
                <label
                  htmlFor="csv"
                  className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                    exportFormat === "csv"
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem value="csv" id="csv" />
                  <FileText className="h-8 w-8 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium">CSV File</p>
                    <p className="text-sm text-muted-foreground">
                      Comma-separated values, compatible with all spreadsheet
                      apps
                    </p>
                  </div>
                </label>

                <label
                  htmlFor="excel"
                  className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                    exportFormat === "excel"
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem value="excel" id="excel" />
                  <FileSpreadsheet className="h-8 w-8 text-green-700" />
                  <div className="flex-1">
                    <p className="font-medium">Excel File (.xlsx)</p>
                    <p className="text-sm text-muted-foreground">
                      Microsoft Excel format with formatting
                    </p>
                    <span className="text-xs text-yellow-600">Coming soon</span>
                  </div>
                </label>

                <label
                  htmlFor="pdf"
                  className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                    exportFormat === "pdf"
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem value="pdf" id="pdf" />
                  <FileText className="h-8 w-8 text-red-600" />
                  <div className="flex-1">
                    <p className="font-medium">PDF Report</p>
                    <p className="text-sm text-muted-foreground">
                      Printable report with school header
                    </p>
                    <span className="text-xs text-yellow-600">Coming soon</span>
                  </div>
                </label>
              </div>
            </RadioGroup>

            <Button
              className="w-full mt-6 gap-2"
              size="lg"
              onClick={handleExport}
              disabled={isExporting || recordCount === 0}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export {recordCount} Records
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
