/**
 * SectionDetail Component
 * =======================
 * View detailed section information with students list
 */

import { useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  LayoutGrid,
  Users,
  UserCheck,
  DoorOpen,
  GraduationCap,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import { SectionDB, ClassDB, TeacherDB } from "./types";

const INDEX_TOKEN = "1emaet";

interface StudentInfo {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  roll_number: string | null;
  photo_url: string | null;
  status: string;
  section_id: string;
}

export function SectionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canUpdate, canDelete } = useModulePermissions("sections");

  // Fetch sections
  const { data: sections, isLoading } = useSupabaseTable<SectionDB>(
    `sections_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Fetch classes
  const { data: classes } = useSupabaseTable<ClassDB>(
    `classes_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Fetch teachers
  const { data: teachers } = useSupabaseTable<TeacherDB>(
    `employees_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Fetch students
  const { data: students } = useSupabaseTable<StudentInfo>(
    `students_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const { deleteMutation } = useSupabaseTable<SectionDB>(
    `sections_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const section = useMemo(() => {
    return sections?.find((s) => s.id === id);
  }, [sections, id]);

  const classInfo = useMemo(() => {
    if (!section || !classes) return null;
    return classes.find((c) => c.id === section.class_id);
  }, [section, classes]);

  const teacher = useMemo(() => {
    if (!section?.class_teacher_id || !teachers) return null;
    return teachers.find((t) => t.id === section.class_teacher_id);
  }, [section, teachers]);

  // Students in this section
  const sectionStudents = useMemo(() => {
    if (!students || !id) return [];
    return students
      .filter((s) => s.section_id === id && s.status === "active")
      .sort((a, b) => {
        const rollA = parseInt(a.roll_number || "999");
        const rollB = parseInt(b.roll_number || "999");
        return rollA - rollB;
      });
  }, [students, id]);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id!);
      toast({
        title: "Section deleted",
        description: "The section has been deleted.",
      });
      navigate("/sections");
    } catch (error) {
      console.error("Error deleting section:", error);
      toast({
        title: "Error",
        description: "Failed to delete section. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 md:col-span-1" />
          <Skeleton className="h-64 md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <LayoutGrid className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Section Not Found</h2>
        <p className="text-muted-foreground">
          The requested section could not be found.
        </p>
        <Button asChild>
          <Link to="/sections">Back to Sections</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/sections">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {classInfo?.class_name} - Section {section.section_name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{section.section_code}</Badge>
              {section.is_active ? (
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {canUpdate && (
            <Button variant="outline" asChild>
              <Link to={`/sections/${id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Section</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete Section{" "}
                    {section.section_name}? This will affect all students
                    assigned to this section.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Section Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <LayoutGrid className="h-10 w-10 text-primary" />
              </div>
              <h2 className="mt-4 text-xl font-semibold">
                Section {section.section_name}
              </h2>
              <p className="text-muted-foreground">{section.section_code}</p>

              <Separator className="my-4" />

              <div className="w-full space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>{classInfo?.class_name || "Unknown Class"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Capacity: {section.capacity} students</span>
                </div>
                {section.room_number && (
                  <div className="flex items-center gap-3">
                    <DoorOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{section.room_number}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Created: {formatDate(section.created_at)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Tabs */}
        <Card className="md:col-span-2">
          <Tabs defaultValue="students" className="w-full">
            <CardHeader>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="students">
                  Students ({sectionStudents.length})
                </TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="students" className="mt-0">
                {sectionStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Students</h3>
                    <p className="text-muted-foreground">
                      No students assigned to this section yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {sectionStudents.map((student, index) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-6">
                            {student.roll_number || index + 1}
                          </span>
                          <Avatar>
                            <AvatarImage src={student.photo_url || undefined} />
                            <AvatarFallback>
                              {getInitials(
                                student.first_name,
                                student.last_name
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {student.admission_number}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/students/${student.id}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="details" className="mt-0 space-y-6">
                {/* Class Teacher */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Class Teacher
                  </h3>
                  {teacher ? (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(teacher.first_name, teacher.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">
                          {teacher.first_name} {teacher.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {teacher.employee_code}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/employees/${teacher.id}`}>View</Link>
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No class teacher assigned
                    </p>
                  )}
                </div>

                <Separator />

                {/* Stats */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Section Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-2xl font-bold">
                        {sectionStudents.length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Current Students
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-2xl font-bold">{section.capacity}</p>
                      <p className="text-sm text-muted-foreground">
                        Total Capacity
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-2xl font-bold">
                        {section.capacity - sectionStudents.length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Available Seats
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-2xl font-bold">
                        {section.capacity > 0
                          ? `${(
                              (sectionStudents.length / section.capacity) *
                              100
                            ).toFixed(0)}%`
                          : "0%"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Occupancy Rate
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
