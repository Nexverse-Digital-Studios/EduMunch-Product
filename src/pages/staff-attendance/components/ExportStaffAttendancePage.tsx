/**
 * Export Staff Attendance Page
 * =============================
 * Export attendance data in various formats
 * Route: /staff/attendance/export
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import type { EmployeeReference, ExportFormat } from "./types";

const exportFormats: {
  value: ExportFormat;
  label: string;
  icon: typeof FileSpreadsheet;
  description: string;
}[] = [
  {
    value: "csv",
    label: "CSV",
    icon: FileText,
    description: "Comma-separated values for spreadsheet import",
  },
  {
    value: "excel",
    label: "Excel",
    icon: FileSpreadsheet,
    description: "Microsoft Excel format (.xlsx)",
  },
  {
    value: "pdf",
    label: "PDF",
    icon: FileText,
    description: "Printable document format",
  },
];

const exportFields = [
  { id: "employee_name", label: "Employee Name", default: true },
  { id: "employee_code", label: "Employee Code", default: true },
  { id: "designation", label: "Designation", default: true },
  { id: "department", label: "Department", default: true },
  { id: "date", label: "Attendance Date", default: true },
  { id: "status", label: "Status", default: true },
  { id: "check_in_time", label: "Check In Time", default: false },
  { id: "check_out_time", label: "Check Out Time", default: false },
  { id: "remarks", label: "Remarks", default: false },
];

const ExportStaffAttendancePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];

  // Form state
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [dateFrom, setDateFrom] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [dateTo, setDateTo] = useState(today);
  const [department, setDepartment] = useState<string>("all");
  const [selectedFields, setSelectedFields] = useState<string[]>(
    exportFields.filter((f) => f.default).map((f) => f.id)
  );
  const [isExporting, setIsExporting] = useState(false);

  // Fetch employees for department dropdown
  const { data: employees } = useSupabaseTable<EmployeeReference>(
    TABLES.EMPLOYEES,
    {
      filters: { status: "active" },
    }
  );

  // Get unique departments
  const departments = Array.from(
    new Set(employees?.map((e) => e.department).filter(Boolean))
  ).sort();

  // Toggle field selection
  const toggleField = (fieldId: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldId)
        ? prev.filter((f) => f !== fieldId)
        : [...prev, fieldId]
    );
  };

  // Select all fields
  const selectAllFields = () => {
    setSelectedFields(exportFields.map((f) => f.id));
  };

  // Deselect all fields
  const deselectAllFields = () => {
    setSelectedFields([]);
  };

  // Handle export
  const handleExport = async () => {
    if (selectedFields.length === 0) {
      toast({
        title: "No fields selected",
        description: "Please select at least one field to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      // In real implementation, this would call an API to generate the export
      console.log("Exporting with options:", {
        format,
        dateFrom,
        dateTo,
        department,
        selectedFields,
      });

      // Simulate export delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Export successful",
        description: `Staff attendance data exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "An error occurred while exporting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Export Staff Attendance
          </h1>
          <p className="text-muted-foreground">
            Download attendance data in your preferred format
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Export Options */}
        <div className="space-y-6">
          {/* Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Format</CardTitle>
              <CardDescription>
                Choose the file format for export
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {exportFormats.map((fmt) => (
                  <div
                    key={fmt.value}
                    className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                      format === fmt.value
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/50"
                    }`}
                    onClick={() => setFormat(fmt.value)}
                  >
                    <div
                      className={`p-2 rounded ${
                        format === fmt.value ? "bg-primary/10" : "bg-muted"
                      }`}
                    >
                      <fmt.icon
                        className={`h-5 w-5 ${
                          format === fmt.value
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{fmt.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {fmt.description}
                      </p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        format === fmt.value
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {format === fmt.value && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    max={dateTo}
                  />
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    min={dateFrom}
                    max={today}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept || ""}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Field Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Select Fields</CardTitle>
                <CardDescription>
                  Choose which fields to include in the export
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllFields}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllFields}>
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exportFields.map((field) => (
                <div key={field.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={field.id}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={() => toggleField(field.id)}
                  />
                  <Label
                    htmlFor={field.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                {selectedFields.length} field(s) selected
              </p>
              <Button
                onClick={handleExport}
                disabled={isExporting || selectedFields.length === 0}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting
                  ? "Exporting..."
                  : `Export as ${format.toUpperCase()}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExportStaffAttendancePage;
