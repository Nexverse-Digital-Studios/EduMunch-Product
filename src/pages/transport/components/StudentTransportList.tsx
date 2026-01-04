/**
 * StudentTransportList Component
 * ==============================
 * Manage student transport allocations
 */

import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  MapPin,
  Route,
  GraduationCap,
  MoreHorizontal,
  Trash2,
  IndianRupee,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import {
  StudentTransport,
  TransportRoute,
  TransportStop,
  StudentInfo,
} from "./types";

const INDEX_TOKEN = "1emaet";

export function StudentTransportList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [routeFilter, setRouteFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { canCreate, canUpdate, canDelete } = useModulePermissions("transport");
  const { toast } = useToast();

  // Fetch data
  const {
    data: studentTransport,
    isLoading,
    deleteMutation,
  } = useSupabaseTable<StudentTransport>(`student_transport_${INDEX_TOKEN}`, {
    filters: {},
  });

  const { data: students } = useSupabaseTable<StudentInfo>(
    `students_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const { data: routes } = useSupabaseTable<TransportRoute>(
    `transport_routes_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const { data: stops } = useSupabaseTable<TransportStop>(
    `transport_stops_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Create lookup maps
  const studentMap = useMemo(() => {
    if (!students) return new Map<string, StudentInfo>();
    return new Map(students.map((s) => [s.id, s]));
  }, [students]);

  const routeMap = useMemo(() => {
    if (!routes) return new Map<string, TransportRoute>();
    return new Map(routes.map((r) => [r.id, r]));
  }, [routes]);

  const stopMap = useMemo(() => {
    if (!stops) return new Map<string, TransportStop>();
    return new Map(stops.map((s) => [s.id, s]));
  }, [stops]);

  // Filtered allocations
  const filteredAllocations = useMemo(() => {
    if (!studentTransport) return [];

    return studentTransport.filter((st) => {
      const student = studentMap.get(st.student_id);
      const route = routeMap.get(st.route_id);
      const searchLower = searchQuery.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        student?.first_name.toLowerCase().includes(searchLower) ||
        student?.last_name.toLowerCase().includes(searchLower) ||
        student?.admission_number.toLowerCase().includes(searchLower) ||
        route?.route_name.toLowerCase().includes(searchLower);

      const matchesRoute = routeFilter === "all" || st.route_id === routeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && st.is_active) ||
        (statusFilter === "inactive" && !st.is_active);

      return matchesSearch && matchesRoute && matchesStatus;
    });
  }, [
    studentTransport,
    studentMap,
    routeMap,
    searchQuery,
    routeFilter,
    statusFilter,
  ]);

  // Stats
  const stats = useMemo(() => {
    if (!studentTransport)
      return { total: 0, active: 0, totalRevenue: 0, routeDistribution: [] };

    const active = studentTransport.filter((st) => st.is_active);
    const totalRevenue = active.reduce(
      (sum, st) => sum + (st.transport_fee || 0),
      0
    );

    // Route distribution
    const routeCounts = new Map<string, number>();
    active.forEach((st) => {
      routeCounts.set(st.route_id, (routeCounts.get(st.route_id) || 0) + 1);
    });

    return {
      total: studentTransport.length,
      active: active.length,
      totalRevenue,
      routeDistribution: Array.from(routeCounts.entries()),
    };
  }, [studentTransport]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const handleDelete = async (allocation: StudentTransport) => {
    try {
      await deleteMutation.mutateAsync(allocation.id);
      toast({
        title: "Allocation Removed",
        description: "Student transport allocation has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove allocation. Please try again.",
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
          <h1 className="text-2xl font-bold">Student Transport</h1>
          <p className="text-muted-foreground">
            {stats.active} students enrolled in transport
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => toast({ title: "Allocate Transport", description: "Allocation form coming soon." })}>
            <Plus className="mr-2 h-4 w-4" />
            Allocate Transport
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Allocations
                </p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Students</p>
                <p className="text-xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <IndianRupee className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-xl font-bold">
                  {formatCurrency(stats.totalRevenue)}
                </p>
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
                placeholder="Search by student name or admission number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={routeFilter} onValueChange={setRouteFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Route className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Route" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Routes</SelectItem>
                {routes?.map((route) => (
                  <SelectItem key={route.id} value={route.id}>
                    {route.route_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
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

      {/* Allocations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Transport Allocations ({filteredAllocations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAllocations.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No allocations found</h3>
              <p className="text-muted-foreground">
                {studentTransport?.length === 0
                  ? "Start by allocating transport to students"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Stop</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAllocations.map((allocation) => {
                  const student = studentMap.get(allocation.student_id);
                  const route = routeMap.get(allocation.route_id);
                  const stop = stopMap.get(allocation.stop_id);

                  return (
                    <TableRow key={allocation.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {student
                                ? getInitials(
                                    student.first_name,
                                    student.last_name
                                  )
                                : "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {student
                                ? `${student.first_name} ${student.last_name}`
                                : "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {student?.admission_number}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Route className="h-3 w-3 text-muted-foreground" />
                          <span>{route?.route_name || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{stop?.stop_name || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {allocation.transport_fee ? (
                          <span className="font-medium">
                            {formatCurrency(allocation.transport_fee)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(allocation.start_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            allocation.is_active ? "default" : "secondary"
                          }
                        >
                          {allocation.is_active ? "Active" : "Inactive"}
                        </Badge>
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
                              <Link to={`/transport/students/${allocation.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {canUpdate && (
                              <DropdownMenuItem asChild>
                                <Link
                                  to={`/transport/students/${allocation.id}/edit`}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Allocation
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete(allocation)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </DropdownMenuItem>
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
