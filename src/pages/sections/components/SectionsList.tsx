/**
 * SectionsList Component
 * ======================
 * Main listing page for sections with class filter and stats
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  LayoutGrid,
  Plus,
  Search,
  Filter,
  Users,
  DoorOpen,
  UserCheck,
  ChevronRight,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";

import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { SectionDB, ClassDB, TeacherDB } from "./types";

const INDEX_TOKEN = "1emaet";

export function SectionsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { canCreate } = useModulePermissions("sections");

  // Fetch sections
  const { data: sections, isLoading: loadingSections } =
    useSupabaseTable<SectionDB>(`sections_${INDEX_TOKEN}`, { filters: {} });

  // Fetch classes for filter and display
  const { data: classes, isLoading: loadingClasses } =
    useSupabaseTable<ClassDB>(`classes_${INDEX_TOKEN}`, { filters: {} });

  // Fetch teachers for display
  const { data: teachers } = useSupabaseTable<TeacherDB>(
    `employees_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const isLoading = loadingSections || loadingClasses;

  // Create lookup maps
  const classMap = useMemo(() => {
    if (!classes) return new Map<string, ClassDB>();
    return new Map(classes.map((c) => [c.id, c]));
  }, [classes]);

  const teacherMap = useMemo(() => {
    if (!teachers) return new Map<string, TeacherDB>();
    return new Map(teachers.map((t) => [t.id, t]));
  }, [teachers]);

  // Filtered sections
  const filteredSections = useMemo(() => {
    if (!sections) return [];

    return sections.filter((section) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const className = classMap.get(section.class_id)?.class_name || "";
      const matchesSearch =
        !searchQuery ||
        section.section_name.toLowerCase().includes(searchLower) ||
        section.section_code.toLowerCase().includes(searchLower) ||
        className.toLowerCase().includes(searchLower) ||
        (section.room_number?.toLowerCase().includes(searchLower) ?? false);

      // Class filter
      const matchesClass =
        classFilter === "all" || section.class_id === classFilter;

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && section.is_active) ||
        (statusFilter === "inactive" && !section.is_active);

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [sections, searchQuery, classFilter, statusFilter, classMap]);

  // Stats
  const stats = useMemo(() => {
    if (!sections)
      return { total: 0, active: 0, totalCapacity: 0, withTeacher: 0 };

    return {
      total: sections.length,
      active: sections.filter((s) => s.is_active).length,
      totalCapacity: sections.reduce((sum, s) => sum + (s.capacity || 0), 0),
      withTeacher: sections.filter((s) => s.class_teacher_id).length,
    };
  }, [sections]);

  // Sort classes by order
  const sortedClasses = useMemo(() => {
    if (!classes) return [];
    return [...classes].sort(
      (a, b) => (a.class_order || 0) - (b.class_order || 0)
    );
  }, [classes]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sections Management</h1>
          <p className="text-muted-foreground">
            Manage class sections and divisions
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link to="/sections/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Link>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sections
            </CardTitle>
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Across all classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? `${((stats.active / stats.total) * 100).toFixed(0)}% of total`
                : "0%"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Capacity
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalCapacity}
            </div>
            <p className="text-xs text-muted-foreground">
              Student seats available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">With Teacher</CardTitle>
            <UserCheck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.withTeacher}
            </div>
            <p className="text-xs text-muted-foreground">
              Class teacher assigned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by section name, code, or room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {sortedClasses.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.class_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sections Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sections List ({filteredSections.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSections.length === 0 ? (
            <div className="text-center py-12">
              <LayoutGrid className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No sections found</h3>
              <p className="text-muted-foreground">
                {searchQuery || classFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by adding a section"}
              </p>
              {canCreate &&
                !searchQuery &&
                classFilter === "all" &&
                statusFilter === "all" && (
                  <Button className="mt-4" asChild>
                    <Link to="/sections/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Section
                    </Link>
                  </Button>
                )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Class Teacher</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSections.map((section) => {
                  const classInfo = classMap.get(section.class_id);
                  const teacher = section.class_teacher_id
                    ? teacherMap.get(section.class_teacher_id)
                    : null;

                  return (
                    <TableRow key={section.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{section.section_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {section.section_code}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {classInfo ? (
                          <Badge variant="outline">
                            {classInfo.class_name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          {section.capacity}
                        </div>
                      </TableCell>
                      <TableCell>
                        {teacher ? (
                          <div className="flex items-center gap-1">
                            <UserCheck className="h-3 w-3 text-green-500" />
                            {teacher.first_name} {teacher.last_name}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            Not assigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {section.room_number ? (
                          <div className="flex items-center gap-1">
                            <DoorOpen className="h-3 w-3 text-muted-foreground" />
                            {section.room_number}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {section.is_active ? (
                          <Badge className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/sections/${section.id}`}>
                            View
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
