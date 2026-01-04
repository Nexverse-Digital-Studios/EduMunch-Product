/**
 * RoutesList Component
 * ====================
 * List and manage transport routes
 */

import { useState, useMemo } from "react";
import {
  Route,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  MapPin,
  Clock,
  IndianRupee,
  MoreHorizontal,
  Trash2,
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
import { TransportRoute, TransportStop, StudentTransport } from "./types";

const INDEX_TOKEN = "1emaet";

export function RoutesList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { canCreate, canUpdate, canDelete } = useModulePermissions("transport");
  const { toast } = useToast();

  // Fetch data
  const {
    data: routes,
    isLoading,
    deleteMutation,
  } = useSupabaseTable<TransportRoute>(`transport_routes_${INDEX_TOKEN}`, {
    filters: {},
  });

  const { data: stops } = useSupabaseTable<TransportStop>(
    `transport_stops_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const { data: studentTransport } = useSupabaseTable<StudentTransport>(
    `student_transport_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Count stops per route
  const stopsPerRoute = useMemo(() => {
    if (!stops) return new Map<string, number>();
    const counts = new Map<string, number>();
    stops.forEach((stop) => {
      counts.set(stop.route_id, (counts.get(stop.route_id) || 0) + 1);
    });
    return counts;
  }, [stops]);

  // Count students per route
  const studentsPerRoute = useMemo(() => {
    if (!studentTransport) return new Map<string, number>();
    const counts = new Map<string, number>();
    studentTransport
      .filter((st) => st.is_active)
      .forEach((st) => {
        counts.set(st.route_id, (counts.get(st.route_id) || 0) + 1);
      });
    return counts;
  }, [studentTransport]);

  // Filtered routes
  const filteredRoutes = useMemo(() => {
    if (!routes) return [];

    return routes.filter((route) => {
      const searchLower = searchQuery.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        route.route_name.toLowerCase().includes(searchLower) ||
        route.route_code.toLowerCase().includes(searchLower) ||
        route.start_location.toLowerCase().includes(searchLower) ||
        route.end_location.toLowerCase().includes(searchLower);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && route.is_active) ||
        (statusFilter === "inactive" && !route.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [routes, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    if (!routes) return { total: 0, active: 0, totalStudents: 0 };
    return {
      total: routes.length,
      active: routes.filter((r) => r.is_active).length,
      totalStudents: studentTransport?.filter((st) => st.is_active).length || 0,
    };
  }, [routes, studentTransport]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDelete = async (route: TransportRoute) => {
    const studentCount = studentsPerRoute.get(route.id) || 0;
    if (studentCount > 0) {
      toast({
        title: "Cannot Delete",
        description: `This route has ${studentCount} students assigned. Please reassign them first.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteMutation.mutateAsync(route.id);
      toast({
        title: "Route Deleted",
        description: `${route.route_name} has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete route. Please try again.",
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
          <h1 className="text-2xl font-bold">Transport Routes</h1>
          <p className="text-muted-foreground">
            {stats.active} active routes • {stats.totalStudents} students
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => toast({ title: "Add Route", description: "Route form coming soon." })}>
            <Plus className="mr-2 h-4 w-4" />
            Add Route
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by route name, code, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
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

      {/* Routes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Routes ({filteredRoutes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRoutes.length === 0 ? (
            <div className="text-center py-12">
              <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No routes found</h3>
              <p className="text-muted-foreground">
                {routes?.length === 0
                  ? "Start by adding transport routes"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>From - To</TableHead>
                  <TableHead>Stops</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{route.route_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {route.route_code}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-green-600" />
                        <span>{route.start_location}</span>
                        <span className="text-muted-foreground">→</span>
                        <MapPin className="h-3 w-3 text-red-600" />
                        <span>{route.end_location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {stopsPerRoute.get(route.id) || 0} stops
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {studentsPerRoute.get(route.id) || 0} students
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {route.total_distance_km ? (
                        <span>{route.total_distance_km} km</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {route.fare_amount ? (
                        <span className="font-medium">
                          {formatCurrency(route.fare_amount)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={route.is_active ? "default" : "secondary"}
                      >
                        {route.is_active ? "Active" : "Inactive"}
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
                            <Link to={`/transport/routes/${route.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          {canUpdate && (
                            <DropdownMenuItem asChild>
                              <Link to={`/transport/routes/${route.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Route
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(route)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
