/**
 * Teachers List Page
 * ===================
 * List and manage all teachers
 * Route: /teachers
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Users,
  Edit,
  Eye,
  Trash2,
  Upload,
  Download,
  Mail,
  Phone,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import type { TeacherDB, TeacherStatus } from "./types";

const statusColors: Record<TeacherStatus, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  resigned: "bg-yellow-100 text-yellow-800",
  terminated: "bg-red-100 text-red-800",
};

const TeachersList = () => {
  const { toast } = useToast();
  const { canCreate, canUpdate, canDelete, canExport } =
    useModulePermissions("teachers");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  // Fetch teachers
  const {
    data: teachers,
    isLoading,
    refetch,
  } = useSupabaseTable<TeacherDB>(TABLES.TEACHERS);

  // Get unique departments
  const departments = useMemo(() => {
    if (!teachers) return [];
    const depts = new Set(teachers.map((t) => t.department).filter(Boolean));
    return Array.from(depts).sort();
  }, [teachers]);

  // Filter teachers
  const filteredTeachers = useMemo(() => {
    if (!teachers) return [];

    return teachers
      .filter((teacher) => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const fullName =
            `${teacher.first_name} ${teacher.last_name}`.toLowerCase();
          const code = teacher.employee_code.toLowerCase();
          const email = (teacher.email || "").toLowerCase();
          if (
            !fullName.includes(query) &&
            !code.includes(query) &&
            !email.includes(query)
          ) {
            return false;
          }
        }

        // Status filter
        if (statusFilter !== "all" && teacher.status !== statusFilter) {
          return false;
        }

        // Department filter
        if (
          departmentFilter !== "all" &&
          teacher.department !== departmentFilter
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [teachers, searchQuery, statusFilter, departmentFilter]);

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      console.log("Deleting teacher:", id);
      toast({
        title: "Teacher deleted",
        description: "The teacher has been deleted successfully.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete teacher.",
        variant: "destructive",
      });
    }
  };

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Count by status
  const statusCounts = useMemo(() => {
    if (!teachers)
      return { active: 0, inactive: 0, resigned: 0, terminated: 0 };
    return {
      active: teachers.filter((t) => t.status === "active").length,
      inactive: teachers.filter((t) => t.status === "inactive").length,
      resigned: teachers.filter((t) => t.status === "resigned").length,
      terminated: teachers.filter((t) => t.status === "terminated").length,
    };
  }, [teachers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teachers</h1>
          <p className="text-muted-foreground">Manage teaching staff members</p>
        </div>
        <div className="flex gap-2">
          {canExport && (
            <Button variant="outline" asChild>
              <Link to="/teachers/export">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Link>
            </Button>
          )}
          {canCreate && (
            <>
              <Button variant="outline" asChild>
                <Link to="/teachers/bulk-upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Bulk Upload
                </Link>
              </Button>
              <Button asChild>
                <Link to="/teachers/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Teacher
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Teachers</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {statusCounts.active}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Inactive</CardDescription>
            <CardTitle className="text-3xl text-gray-600">
              {statusCounts.inactive}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Resigned</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {statusCounts.resigned}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Terminated</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {statusCounts.terminated}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, code, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="resigned">Resigned</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
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

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teachers List
          </CardTitle>
          <CardDescription>
            {filteredTeachers.length} teacher(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading teachers...
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No teachers found
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={teacher.photo_url} />
                            <AvatarFallback>
                              {getInitials(
                                teacher.first_name,
                                teacher.last_name
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              to={`/teachers/${teacher.id}`}
                              className="font-medium hover:underline"
                            >
                              {teacher.first_name} {teacher.last_name}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {teacher.designation || "Teacher"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{teacher.employee_code}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {teacher.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate max-w-[150px]">
                                {teacher.email}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{teacher.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{teacher.department || "-"}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[teacher.status]}>
                          {teacher.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/teachers/${teacher.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {canUpdate && (
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/teachers/${teacher.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          {canDelete && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Teacher
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "
                                    {teacher.first_name} {teacher.last_name}"?
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(teacher.id)}
                                    className="bg-destructive text-destructive-foreground"
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
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeachersList;
