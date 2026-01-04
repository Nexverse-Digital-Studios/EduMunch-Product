/**
 * StudentsList Component (CONSOLIDATED)
 * =======================================
 * Main students list with search, filters, and CRUD operations.
 * Create and Edit operations now use modal dialogs instead of separate routes.
 * 
 * Route Consolidation: Replaces /students/create and /students/:id/edit routes
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  Users,
  GraduationCap,
  UserCheck,
  UserX,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { StudentDB } from "./types";
import { StudentFormDialog } from "./StudentFormDialog";

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

export function StudentsList() {
  const { toast } = useToast();
  const { canView, canCreate, canUpdate, canDelete, canExport } =
    useModulePermissions("students");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  
  // Modal states for create/edit (consolidation - replaces separate routes)
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editStudentId, setEditStudentId] = useState<string | null>(null);

  const { data: students, isLoading, refetch } = useSupabaseTable<StudentDB>(
    `students_${INDEX_TOKEN}`,
    { orderBy: { column: "first_name", ascending: true } }
  );

  const { deleteMutation } = useSupabaseTable<StudentDB>(
    `students_${INDEX_TOKEN}`
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

  const currentYear = academicYears?.find((y) => y.is_current);

  const getClassName = (classId: string) => {
    return classes?.find((c) => c.id === classId)?.class_name || "N/A";
  };

  const getSectionName = (sectionId: string) => {
    return sections?.find((s) => s.id === sectionId)?.section_name || "N/A";
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

  // Stats
  const stats = {
    total: students?.length || 0,
    active: students?.filter((s) => s.status === "active").length || 0,
    inactive: students?.filter((s) => s.status === "inactive").length || 0,
    graduated: students?.filter((s) => s.status === "graduated").length || 0,
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Success",
        description: "Student deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student.",
        variant: "destructive",
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (!canView) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to view students.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage student records and information
          </p>
        </div>
        <div className="flex gap-2">
          {canExport && (
            <Button 
              variant="outline" 
              onClick={() => toast({ title: "Export", description: "Export functionality coming soon." })}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
          {canCreate && (
            <Button onClick={() => { setEditStudentId(null); setShowStudentModal(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <UserX className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.inactive}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graduated</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.graduated}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or admission number..."
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

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents?.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={student.photo_url || undefined} />
                          <AvatarFallback>
                            {getInitials(student.first_name, student.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {student.first_name} {student.middle_name || ""}{" "}
                            {student.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {student.email || student.phone || "No contact"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      {student.admission_number}
                    </TableCell>
                    <TableCell>{getClassName(student.class_id)}</TableCell>
                    <TableCell>{getSectionName(student.section_id)}</TableCell>
                    <TableCell>{student.gender}</TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/students/${student.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {canUpdate && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => { setEditStudentId(student.id); setShowStudentModal(true); }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Student
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete{" "}
                                  {student.first_name} {student.last_name}? This
                                  action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(student.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredStudents || filteredStudents.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground h-32"
                    >
                      {searchQuery ||
                      selectedClass !== "all" ||
                      selectedSection !== "all" ||
                      selectedStatus !== "all"
                        ? "No students found matching your filters"
                        : "No students found. Add your first student!"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Student Modal (Consolidated - replaces /students/create and /students/:id/edit routes) */}
      <StudentFormDialog
        open={showStudentModal}
        onOpenChange={(open) => {
          setShowStudentModal(open);
          if (!open) setEditStudentId(null);
        }}
        mode={editStudentId ? "edit" : "create"}
        studentId={editStudentId || undefined}
        initialData={editStudentId && students ? 
          (() => {
            const student = students.find(s => s.id === editStudentId);
            if (!student) return undefined;
            return {
              first_name: student.first_name,
              middle_name: student.middle_name || "",
              last_name: student.last_name,
              admission_number: student.admission_number,
              class_id: student.class_id,
              section_id: student.section_id,
              academic_year_id: student.academic_year_id,
              date_of_birth: student.date_of_birth || "",
              gender: student.gender,
              admission_date: student.admission_date || "",
            };
          })() 
          : undefined
        }
        onSuccess={() => refetch()}
      />
    </div>
  );
}
