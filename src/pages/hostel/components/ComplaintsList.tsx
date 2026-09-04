/**
 * ComplaintsList Component
 * ========================
 * List and manage hostel complaints
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Wrench,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import { HostelComplaint, HostelRoom, StudentInfo } from "./types";

const INDEX_TOKEN = "1emaet";

export function ComplaintsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { canCreate, canUpdate } = useModulePermissions("hostel");
  const { toast } = useToast();

  // Fetch data
  const {
    data: complaints,
    isLoading,
    updateMutation,
  } = useSupabaseTable<HostelComplaint>(`hostel_complaints_${INDEX_TOKEN}`, {
    filters: {},
  });

  const { data: rooms } = useSupabaseTable<HostelRoom>(
    `hostel_rooms_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const { data: students } = useSupabaseTable<StudentInfo>(
    `students_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Create lookup maps
  const roomMap = useMemo(() => {
    if (!rooms) return new Map<string, HostelRoom>();
    return new Map(rooms.map((r) => [r.id, r]));
  }, [rooms]);

  const studentMap = useMemo(() => {
    if (!students) return new Map<string, StudentInfo>();
    return new Map(students.map((s) => [s.id, s]));
  }, [students]);

  // Filtered complaints
  const filteredComplaints = useMemo(() => {
    if (!complaints) return [];

    return complaints.filter((complaint) => {
      const student = complaint.student_id
        ? studentMap.get(complaint.student_id)
        : null;
      const room = complaint.room_id ? roomMap.get(complaint.room_id) : null;
      const searchLower = searchQuery.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        complaint.description.toLowerCase().includes(searchLower) ||
        student?.first_name.toLowerCase().includes(searchLower) ||
        student?.last_name.toLowerCase().includes(searchLower) ||
        room?.room_number.toLowerCase().includes(searchLower);

      const matchesType =
        typeFilter === "all" || complaint.complaint_type === typeFilter;

      const matchesPriority =
        priorityFilter === "all" || complaint.priority === priorityFilter;

      const matchesStatus =
        statusFilter === "all" || complaint.status === statusFilter;

      return matchesSearch && matchesType && matchesPriority && matchesStatus;
    });
  }, [
    complaints,
    studentMap,
    roomMap,
    searchQuery,
    typeFilter,
    priorityFilter,
    statusFilter,
  ]);

  // Stats
  const stats = useMemo(() => {
    if (!complaints)
      return { total: 0, open: 0, inProgress: 0, resolved: 0, urgent: 0 };
    return {
      total: complaints.length,
      open: complaints.filter((c) => c.status === "Open").length,
      inProgress: complaints.filter((c) => c.status === "In Progress").length,
      resolved: complaints.filter(
        (c) => c.status === "Resolved" || c.status === "Closed"
      ).length,
      urgent: complaints.filter(
        (c) => c.priority === "Urgent" && c.status !== "Closed"
      ).length,
    };
  }, [complaints]);

  const handleUpdateStatus = async (
    complaint: HostelComplaint,
    newStatus: "Open" | "In Progress" | "Resolved" | "Closed"
  ) => {
    try {
      await updateMutation.mutateAsync({
        id: complaint.id,
        updates: { status: newStatus },
      });
      toast({
        title: "Status Updated",
        description: `Complaint status changed to ${newStatus}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hostel Complaints</h1>
          <p className="text-muted-foreground">
            {stats.open + stats.inProgress} open complaints
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() =>
              toast({
                title: "New Complaint",
                description: "Complaint form coming soon.",
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            New Complaint
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-xl font-bold">{stats.open}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-xl font-bold">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Urgent</p>
                <p className="text-xl font-bold">{stats.urgent}</p>
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
                placeholder="Search complaints..."
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
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Cleanliness">Cleanliness</SelectItem>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Complaints ({filteredComplaints.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No complaints found</h3>
              <p className="text-muted-foreground">
                {complaints?.length === 0
                  ? "Great! No complaints have been logged."
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Room/Student</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints.map((complaint) => {
                  const student = complaint.student_id
                    ? studentMap.get(complaint.student_id)
                    : null;
                  const room = complaint.room_id
                    ? roomMap.get(complaint.room_id)
                    : null;

                  return (
                    <TableRow key={complaint.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {complaint.complaint_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate">{complaint.description}</p>
                      </TableCell>
                      <TableCell>
                        {room && (
                          <p className="text-sm">Room: {room.room_number}</p>
                        )}
                        {student && (
                          <p className="text-xs text-muted-foreground">
                            {student.first_name} {student.last_name}
                          </p>
                        )}
                        {!room && !student && (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            complaint.priority === "Urgent"
                              ? "destructive"
                              : complaint.priority === "High"
                              ? "default"
                              : complaint.priority === "Medium"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {complaint.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            complaint.status === "Open"
                              ? "outline"
                              : complaint.status === "In Progress"
                              ? "default"
                              : complaint.status === "Resolved"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            complaint.status === "Resolved"
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                        >
                          {complaint.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/hostel/complaints/${complaint.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {canUpdate && complaint.status !== "Closed" && (
                              <>
                                {complaint.status === "Open" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(
                                        complaint,
                                        "In Progress"
                                      )
                                    }
                                  >
                                    <Wrench className="mr-2 h-4 w-4" />
                                    Mark In Progress
                                  </DropdownMenuItem>
                                )}
                                {complaint.status === "In Progress" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(complaint, "Resolved")
                                    }
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Mark Resolved
                                  </DropdownMenuItem>
                                )}
                                {complaint.status === "Resolved" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(complaint, "Closed")
                                    }
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Close Complaint
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
