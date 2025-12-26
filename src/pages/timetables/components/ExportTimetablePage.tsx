/**
 * Export Timetable Page
 * ======================
 * Export timetable data in various formats
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileDown,
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  File,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
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
import { TABLES } from "@/lib/supabase";

interface SectionDB {
  id: string;
  section_name: string;
  section_code: string;
  class_id: string;
}

interface ClassDB {
  id: string;
  class_name: string;
}

const ExportTimetablePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canExport } = useModulePermissions("timetable");

  const [exportFormat, setExportFormat] = useState("excel");
  const [exportScope, setExportScope] = useState("all");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [includeBreaks, setIncludeBreaks] = useState(true);
  const [includeTeachers, setIncludeTeachers] = useState(true);
  const [includeRooms, setIncludeRooms] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch classes
  const { data: classesData } = useSupabaseTable<ClassDB>(TABLES.CLASSES, {
    orderBy: { column: "class_name", ascending: true },
  });

  // Fetch sections
  const { data: sectionsData } = useSupabaseTable<SectionDB>(TABLES.SECTIONS, {
    orderBy: { column: "section_name", ascending: true },
  });

  const classes = classesData || [];
  const sections = sectionsData || [];

  // Filter sections by class
  const filteredSections = selectedClass
    ? sections.filter((s) => s.class_id === selectedClass)
    : sections;

  const toggleSection = (sectionId: string) => {
    if (selectedSections.includes(sectionId)) {
      setSelectedSections(selectedSections.filter((id) => id !== sectionId));
    } else {
      setSelectedSections([...selectedSections, sectionId]);
    }
  };

  const handleExport = async () => {
    if (exportScope === "selected" && selectedSections.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one section to export",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      // Simulate export
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const formatName = {
        excel: "Excel (.xlsx)",
        csv: "CSV",
        pdf: "PDF",
      }[exportFormat];

      toast({
        title: "Export Successful",
        description: `Timetable exported as ${formatName}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export timetable. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (!canExport) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          You don't have permission to export timetables.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Export Timetable
          </h1>
          <p className="text-muted-foreground">
            Download timetable data in various formats
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Format */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5" />
              Export Format
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={exportFormat}
              onValueChange={setExportFormat}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="excel" id="excel" />
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <Label htmlFor="excel" className="cursor-pointer font-medium">
                    Excel (.xlsx)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Full formatting with multiple sheets
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="csv" id="csv" />
                <FileText className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <Label htmlFor="csv" className="cursor-pointer font-medium">
                    CSV
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Simple format for data import
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="pdf" id="pdf" />
                <File className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <Label htmlFor="pdf" className="cursor-pointer font-medium">
                    PDF
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Print-ready format with grid layout
                  </p>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Include in Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-breaks"
                checked={includeBreaks}
                onCheckedChange={(checked) => setIncludeBreaks(!!checked)}
              />
              <label
                htmlFor="include-breaks"
                className="text-sm font-medium cursor-pointer"
              >
                Include break periods
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-teachers"
                checked={includeTeachers}
                onCheckedChange={(checked) => setIncludeTeachers(!!checked)}
              />
              <label
                htmlFor="include-teachers"
                className="text-sm font-medium cursor-pointer"
              >
                Include teacher names
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-rooms"
                checked={includeRooms}
                onCheckedChange={(checked) => setIncludeRooms(!!checked)}
              />
              <label
                htmlFor="include-rooms"
                className="text-sm font-medium cursor-pointer"
              >
                Include room numbers
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Scope */}
      <Card>
        <CardHeader>
          <CardTitle>Export Scope</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={exportScope}
            onValueChange={setExportScope}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all">All Sections</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="selected" id="selected" />
              <Label htmlFor="selected">Selected Sections</Label>
            </div>
          </RadioGroup>

          {exportScope === "selected" && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Filter by Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.class_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Sections</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1">
                  {filteredSections.map((section) => (
                    <div
                      key={section.id}
                      className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedSections.includes(section.id)
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => toggleSection(section.id)}
                    >
                      <Checkbox
                        checked={selectedSections.includes(section.id)}
                        onCheckedChange={() => toggleSection(section.id)}
                      />
                      <div>
                        <p className="font-medium text-sm">
                          {section.section_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {section.section_code}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Button */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button onClick={handleExport} disabled={isExporting}>
          <FileDown className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export Timetable"}
        </Button>
      </div>
    </div>
  );
};

export default ExportTimetablePage;
