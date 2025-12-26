/**
 * LibraryMembers Component
 * ========================
 * Manage library members
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  UserCheck,
  UserX,
  GraduationCap,
  Briefcase,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { LibraryMember, StudentInfo, TeacherInfo } from "./types";

const INDEX_TOKEN = "1emaet";

export function LibraryMembers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { canCreate, canUpdate } = useModulePermissions("library");

  // Fetch members
  const { data: members, isLoading } = useSupabaseTable<LibraryMember>(
    `library_members_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Fetch students
  const { data: students } = useSupabaseTable<StudentInfo>(
    `students_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Fetch teachers
  const { data: teachers } = useSupabaseTable<TeacherInfo>(
    `teachers_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Create lookup maps
  const studentMap = useMemo(() => {
    if (!students) return new Map<string, StudentInfo>();
    return new Map(students.map((s) => [s.id, s]));
  }, [students]);

  const teacherMap = useMemo(() => {
    if (!teachers) return new Map<string, TeacherInfo>();
    return new Map(teachers.map((t) => [t.id, t]));
  }, [teachers]);

  // Get member details
  const getMemberDetails = (member: LibraryMember) => {
    if (member.member_type === "student") {
      const student = studentMap.get(member.member_id);
      return {
        name: student
          ? `${student.first_name} ${student.last_name}`
          : "Unknown",
        code: student?.admission_number || member.membership_number,
        icon: GraduationCap,
      };
    } else {
      const teacher = teacherMap.get(member.member_id);
      return {
        name: teacher
          ? `${teacher.first_name} ${teacher.last_name}`
          : "Unknown",
        code: teacher?.employee_code || member.membership_number,
        icon: Briefcase,
      };
    }
  };

  // Filtered members
  const filteredMembers = useMemo(() => {
    if (!members) return [];

    return members.filter((member) => {
      const details = getMemberDetails(member);
      const searchLower = searchQuery.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        details.name.toLowerCase().includes(searchLower) ||
        details.code.toLowerCase().includes(searchLower) ||
        member.membership_number.toLowerCase().includes(searchLower);

      const matchesType =
        typeFilter === "all" || member.member_type === typeFilter;

      const matchesStatus =
        statusFilter === "all" || member.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [members, searchQuery, typeFilter, statusFilter, studentMap, teacherMap]);

  // Stats
  const stats = useMemo(() => {
    if (!members) return { total: 0, active: 0, students: 0, staff: 0 };
    return {
      total: members.length,
      active: members.filter((m) => m.status === "active").length,
      students: members.filter((m) => m.member_type === "student").length,
      staff: members.filter((m) => m.member_type !== "student").length,
    };
  }, [members]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/library">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Library Members</h1>
            <p className="text-muted-foreground">
              {stats.active} active members
            </p>
          </div>
        </div>
        {canCreate && (
          <Button asChild>
            <Link to="/library/members/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Link>
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-xl font-bold">{stats.students}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm text-muted-foreground">Staff</p>
                <p className="text-xl font-bold">{stats.staff}</p>
              </div>
            </div>
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
                placeholder="Search by name or membership ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="teacher">Teachers</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members ({filteredMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No members found</h3>
              <p className="text-muted-foreground">
                {members?.length === 0
                  ? "Start by adding library members"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Membership ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Books</TableHead>
                  <TableHead>Fines Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => {
                  const details = getMemberDetails(member);
                  const bookUsage =
                    (member.current_books_count / member.max_books_allowed) *
                    100;

                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              <details.icon className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{details.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {details.code}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {member.membership_number}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {member.member_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={bookUsage} className="w-16 h-2" />
                          <span className="text-sm">
                            {member.current_books_count}/
                            {member.max_books_allowed}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.total_fines_due > 0 ? (
                          <span className="text-red-600 font-medium">
                            {formatCurrency(member.total_fines_due)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.status === "active"
                              ? "default"
                              : member.status === "suspended"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {member.status === "active" && (
                            <UserCheck className="mr-1 h-3 w-3" />
                          )}
                          {member.status === "suspended" && (
                            <UserX className="mr-1 h-3 w-3" />
                          )}
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/library/members/${member.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {canUpdate && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/library/members/${member.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
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
