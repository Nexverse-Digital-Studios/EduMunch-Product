import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Filter, Search } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { StudentDB } from "./types";

const INDEX_TOKEN = "1emaet";

interface ClassDB {
  id: string;
  class_name: string;
}

interface SectionDB {
  id: string;
  section_name: string;
  class_id: string;
}

interface AcademicYearDB {
  id: string;
  year_name: string;
  is_current: boolean;
}

export function StudentsExport() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canView, canExport } = useModulePermissions("students");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [exportType, setExportType] = useState<string>("basic");

  const { data: students, isLoading } = useSupabaseTable<StudentDB>(
    `students_${INDEX_TOKEN}`,
    { orderBy: { column: "first_name", ascending: true } }
  );

  const { data: classes } = useSupabaseTable<ClassDB>(
    `classes_${INDEX_TOKEN}`,
    {
      orderBy: { column: "class_order", ascending: true },
    }
  );

  const { data: sections } = useSupabaseTable<SectionDB>(
    `sections_${INDEX_TOKEN}`
  );

  const { data: academicYears } = useSupabaseTable<AcademicYearDB>(
    `academic_years_${INDEX_TOKEN}`,
    { orderBy: { column: "year_name", ascending: false } }
  );

  const getClassName = (classId: string) => {
    return classes?.find((c) => c.id === classId)?.class_name || "N/A";
  };

  const getSectionName = (sectionId: string) => {
    return sections?.find((s) => s.id === sectionId)?.section_name || "N/A";
  };

  const getYearName = (yearId: string) => {
    return academicYears?.find((y) => y.id === yearId)?.year_name || "N/A";
  };

  // Filter students
  const filteredStudents = students?.filter((student) => {
    const fullName = `${student.first_name} ${student.middle_name || ""} ${
      student.last_name
    }`.toLowerCase();
    const admissionNum = student.admission_number.toLowerCase();

    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      admissionNum.includes(searchQuery.toLowerCase());

    const matchesClass =
      selectedClass === "all" || student.class_id === selectedClass;

    const matchesSection =
      selectedSection === "all" || student.section_id === selectedSection;

    const matchesStatus =
      selectedStatus === "all" || student.status === selectedStatus;

    return matchesSearch && matchesClass && matchesSection && matchesStatus;
  });

  // Get sections for selected class
  const filteredSections =
    selectedClass === "all"
      ? sections
      : sections?.filter((s) => s.class_id === selectedClass);

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (!canExport) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to export data.",
        variant: "destructive",
      });
      return;
    }

    // Generate export data based on export type
    let exportData: Record<string, any>[] = [];

    if (exportType === "basic") {
      exportData =
        filteredStudents?.map((s) => ({
          "Admission No": s.admission_number,
          "Roll No": s.roll_number || "",
          "First Name": s.first_name,
          "Middle Name": s.middle_name || "",
          "Last Name": s.last_name,
          Class: getClassName(s.class_id),
          Section: getSectionName(s.section_id),
          Gender: s.gender,
          "Date of Birth": s.date_of_birth,
          Status: s.status,
        })) || [];
    } else if (exportType === "detailed") {
      exportData =
        filteredStudents?.map((s) => ({
          "Admission No": s.admission_number,
          "Roll No": s.roll_number || "",
          "First Name": s.first_name,
          "Middle Name": s.middle_name || "",
          "Last Name": s.last_name,
          Class: getClassName(s.class_id),
          Section: getSectionName(s.section_id),
          "Academic Year": getYearName(s.academic_year_id),
          Gender: s.gender,
          "Date of Birth": s.date_of_birth,
          "Blood Group": s.blood_group || "",
          Nationality: s.nationality,
          Religion: s.religion || "",
          Category: s.category || "",
          Email: s.email || "",
          Phone: s.phone || "",
          Address: [
            s.address_line1,
            s.address_line2,
            s.city,
            s.state,
            s.pincode,
          ]
            .filter(Boolean)
            .join(", "),
          "Admission Date": s.admission_date,
          "Previous School": s.previous_school || "",
          "Emergency Contact": s.emergency_contact_name || "",
          "Emergency Phone": s.emergency_contact_phone || "",
          Status: s.status,
        })) || [];
    } else if (exportType === "contact") {
      exportData =
        filteredStudents?.map((s) => ({
          "Admission No": s.admission_number,
          "Student Name": `${s.first_name} ${s.middle_name || ""} ${
            s.last_name
          }`.trim(),
          Class: getClassName(s.class_id),
          Section: getSectionName(s.section_id),
          Email: s.email || "",
          Phone: s.phone || "",
          "Address Line 1": s.address_line1 || "",
          "Address Line 2": s.address_line2 || "",
          City: s.city || "",
          State: s.state || "",
          Pincode: s.pincode || "",
          "Emergency Contact Name": s.emergency_contact_name || "",
          "Emergency Contact Phone": s.emergency_contact_phone || "",
          "Emergency Contact Relation": s.emergency_contact_relation || "",
        })) || [];
    }

    // Handle CSV export
    if (format === "csv") {
      if (exportData.length === 0) {
        toast({
          title: "No Data",
          description: "No data available to export.",
          variant: "destructive",
        });
        return;
      }

      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(","),
        ...exportData.map((row) =>
          headers
            .map((h) => `"${(row[h] || "").toString().replace(/"/g, '""')}"`)
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = `students_${exportType}_${
        new Date().toISOString().split("T")[0]
      }`;
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: `${filename}.csv has been downloaded.`,
      });
    } else {
      toast({
        title: "Export Started",
        description: `Generating ${format.toUpperCase()} export...`,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        className?: string;
      }
    > = {
      active: { variant: "default", className: "bg-green-500" },
      inactive: { variant: "secondary" },
      graduated: { variant: "default", className: "bg-blue-500" },
      transferred: { variant: "outline" },
      dropped: { variant: "destructive" },
    };
    const config = statusConfig[status] || { variant: "secondary" as const };
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  if (!canView) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to view students export.
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
            onClick={() => navigate("/students")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Export Students
            </h1>
            <p className="text-muted-foreground">
              Export student records in various formats
            </p>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>
            Select the type of data and format to export
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Type</label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select export type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">
                    Basic Info (Name, Class, Section)
                  </SelectItem>
                  <SelectItem value="detailed">
                    Detailed Info (All Fields)
                  </SelectItem>
                  <SelectItem value="contact">Contact Info Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleExport("csv")}
                  disabled={!canExport}
                >
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleExport("excel")}
                  disabled={!canExport}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleExport("pdf")}
                  disabled={!canExport}
                >
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter data before exporting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedClass}
              onValueChange={(value) => {
                setSelectedClass(value);
                setSelectedSection("all");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes?.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.class_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger>
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {filteredSections?.map((sec) => (
                  <SelectItem key={sec.id} value={sec.id}>
                    {sec.section_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
                <SelectItem value="dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Preview Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
          <CardDescription>
            Showing {filteredStudents?.length || 0} records matching your
            filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admission No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents?.slice(0, 10).map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono">
                      {student.admission_number}
                    </TableCell>
                    <TableCell>
                      {student.first_name} {student.middle_name || ""}{" "}
                      {student.last_name}
                    </TableCell>
                    <TableCell>{getClassName(student.class_id)}</TableCell>
                    <TableCell>{getSectionName(student.section_id)}</TableCell>
                    <TableCell>{student.gender}</TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                  </TableRow>
                ))}
                {(!filteredStudents || filteredStudents.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      No records found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          {filteredStudents && filteredStudents.length > 10 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Showing first 10 of {filteredStudents.length} records. Export to
              see all.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
