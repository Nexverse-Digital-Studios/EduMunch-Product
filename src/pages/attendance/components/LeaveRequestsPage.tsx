/**
 * Leave Requests List Page
 * =========================
 * Page for viewing and managing leave applications
 * Routes:
 * - /leave-requests - View all leave applications
 * - /leave-requests/create - Apply for leave
 * - /leave-requests/:id - View leave request details
 * - /leave-requests/:id/approve - Approve/reject leave
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Loader2,
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { LeaveApplicationDB, LeaveStatus, LeaveType, StudentDB } from "./types";

const STATUS_COLORS: Record<LeaveStatus, string> = {
  Pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const STATUS_ICONS: Record<LeaveStatus, React.ReactNode> = {
  Pending: <Clock className="h-4 w-4" />,
  Approved: <CheckCircle className="h-4 w-4" />,
  Rejected: <XCircle className="h-4 w-4" />,
};

const LEAVE_TYPE_COLORS: Record<LeaveType, string> = {
  Sick: "bg-red-100 text-red-800",
  Medical: "bg-purple-100 text-purple-800",
  Casual: "bg-blue-100 text-blue-800",
  Emergency: "bg-orange-100 text-orange-800",
  Other: "bg-gray-100 text-gray-800",
};

export const LeaveRequestsPage = () => {
  const navigate = useNavigate();
  const { canCreate, canApprove } = useModulePermissions("leave");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<LeaveType | "all">("all");

  // Fetch data
  const { data: leaveApplications, isLoading: loadingLeave } =
    useSupabaseTable<LeaveApplicationDB>(TABLES.LEAVE_APPLICATIONS, {
      orderBy: { column: "applied_at", ascending: false },
    });

  const { data: students, isLoading: loadingStudents } =
    useSupabaseTable<StudentDB>(TABLES.STUDENTS, {
      orderBy: { column: "first_name", ascending: true },
    });

  const isLoading = loadingLeave || loadingStudents;

  // Get student name
  const getStudentName = (studentId: string) => {
    const student = students?.find((s) => s.id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : "Unknown";
  };

  // Filter leave applications
  const filteredApplications = useMemo(() => {
    if (!leaveApplications) return [];

    return leaveApplications.filter((app) => {
      const studentName = getStudentName(app.student_id).toLowerCase();
      const matchesSearch =
        studentName.includes(searchQuery.toLowerCase()) ||
        app.reason.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || app.status === statusFilter;
      const matchesType = typeFilter === "all" || app.leave_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [leaveApplications, searchQuery, statusFilter, typeFilter, students]);

  // Summary stats
  const stats = useMemo(
    () => ({
      total: leaveApplications?.length || 0,
      pending:
        leaveApplications?.filter((a) => a.status === "Pending").length || 0,
      approved:
        leaveApplications?.filter((a) => a.status === "Approved").length || 0,
      rejected:
        leaveApplications?.filter((a) => a.status === "Rejected").length || 0,
    }),
    [leaveApplications]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Leave Requests
          </h1>
          <p className="text-muted-foreground">
            Manage student leave applications
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => navigate("/leave-requests/create")}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Leave Request
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {stats.approved}
            </p>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by student or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as LeaveStatus | "all")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as LeaveType | "all")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Sick">Sick Leave</SelectItem>
                <SelectItem value="Medical">Medical Leave</SelectItem>
                <SelectItem value="Casual">Casual Leave</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leave Applications List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading leave requests...</span>
        </div>
      ) : filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No leave requests found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">
                      {getStudentName(app.student_id)}
                    </TableCell>
                    <TableCell>
                      <Badge className={LEAVE_TYPE_COLORS[app.leave_type]}>
                        {app.leave_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(app.from_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(app.to_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{app.total_days}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          STATUS_COLORS[app.status]
                        } flex w-fit items-center gap-1`}
                      >
                        {STATUS_ICONS[app.status]}
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/leave-requests/${app.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canApprove && app.status === "Pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/leave-requests/${app.id}/approve`)
                            }
                          >
                            Review
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredApplications.map((app) => (
              <Card
                key={app.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/leave-requests/${app.id}`)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {getStudentName(app.student_id)}
                      </p>
                      <Badge className={LEAVE_TYPE_COLORS[app.leave_type]}>
                        {app.leave_type}
                      </Badge>
                    </div>
                    <Badge
                      className={`${
                        STATUS_COLORS[app.status]
                      } flex items-center gap-1`}
                    >
                      {STATUS_ICONS[app.status]}
                      {app.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      {new Date(app.from_date).toLocaleDateString()} -{" "}
                      {new Date(app.to_date).toLocaleDateString()}
                    </p>
                    <p>
                      {app.total_days} day(s) • Applied{" "}
                      {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm line-clamp-2">{app.reason}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
