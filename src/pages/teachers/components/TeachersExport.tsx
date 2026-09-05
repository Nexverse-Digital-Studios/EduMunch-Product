/**
 * Export Teachers Page
 * =====================
 * Export teachers data
 * Route: /teachers/export
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import type { ExportFormat, TeacherStatus } from "./types";

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
  { id: "employee_code", label: "Employee Code", default: true },
  { id: "first_name", label: "First Name", default: true },
  { id: "last_name", label: "Last Name", default: true },
  { id: "email", label: "Email", default: true },
  { id: "phone", label: "Phone", default: true },
  { id: "designation", label: "Designation", default: true },
  { id: "department", label: "Department", default: true },
  { id: "qualification", label: "Qualification", default: false },
  { id: "specialization", label: "Specialization", default: false },
  { id: "joining_date", label: "Joining Date", default: false },
  { id: "experience_years", label: "Experience", default: false },
  { id: "employment_type", label: "Employment Type", default: false },
  { id: "status", label: "Status", default: true },
];

const TeachersExport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [format, setFormat] = useState<ExportFormat>("csv");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedFields, setSelectedFields] = useState<string[]>(
    exportFields.filter((f) => f.default).map((f) => f.id)
  );
  const [isExporting, setIsExporting] = useState(false);

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
      console.log("Exporting with options:", {
        format,
        statusFilter,
        selectedFields,
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Export successful",
        description: `Teachers data exported as ${format.toUpperCase()}.`,
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
          <h1 className="text-2xl font-bold tracking-tight">Export Teachers</h1>
          <p className="text-muted-foreground">
            Download teachers data in your preferred format
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

          {/* Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Status Filter</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                    <SelectItem value="resigned">Resigned Only</SelectItem>
                    <SelectItem value="terminated">Terminated Only</SelectItem>
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

export default TeachersExport;
