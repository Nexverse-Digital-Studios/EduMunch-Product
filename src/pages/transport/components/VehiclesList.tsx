/**
 * VehiclesList Component
 * ======================
 * List and manage transport vehicles
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bus,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  AlertTriangle,
  Users,
  MoreHorizontal,
  Trash2,
  Wrench,
  Shield,
  FileText,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import { TransportVehicle, VehicleRouteAssignment } from "./types";

const INDEX_TOKEN = "1emaet";

export function VehiclesList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { canCreate, canUpdate, canDelete } = useModulePermissions("transport");
  const { toast } = useToast();

  // Fetch data
  const {
    data: vehicles,
    isLoading,
    deleteMutation,
  } = useSupabaseTable<TransportVehicle>(`transport_vehicles_${INDEX_TOKEN}`, {
    filters: {},
  });

  const { data: assignments } = useSupabaseTable<VehicleRouteAssignment>(
    `vehicle_route_assignments_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Check if vehicle is assigned
  const vehicleAssignments = useMemo(() => {
    if (!assignments) return new Map<string, boolean>();
    const assigned = new Map<string, boolean>();
    assignments
      .filter((a) => a.is_active)
      .forEach((a) => {
        assigned.set(a.vehicle_id, true);
      });
    return assigned;
  }, [assignments]);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];

    return vehicles.filter((vehicle) => {
      const searchLower = searchQuery.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        vehicle.vehicle_number.toLowerCase().includes(searchLower) ||
        vehicle.manufacturer?.toLowerCase().includes(searchLower) ||
        vehicle.model?.toLowerCase().includes(searchLower);

      const matchesType =
        typeFilter === "all" || vehicle.vehicle_type === typeFilter;

      const matchesStatus =
        statusFilter === "all" || vehicle.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [vehicles, searchQuery, typeFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    if (!vehicles) return { total: 0, active: 0, maintenance: 0, capacity: 0 };
    return {
      total: vehicles.length,
      active: vehicles.filter((v) => v.status === "Active").length,
      maintenance: vehicles.filter((v) => v.status === "Maintenance").length,
      capacity: vehicles
        .filter((v) => v.status === "Active")
        .reduce((sum, v) => sum + v.capacity, 0),
    };
  }, [vehicles]);

  // Check document expiry status
  const getDocumentStatus = (vehicle: TransportVehicle) => {
    const alerts: { type: string; days: number }[] = [];

    const checkExpiry = (date: string | null, type: string) => {
      if (!date) return;
      const expiry = new Date(date);
      const days = Math.ceil(
        (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (days <= 30) {
        alerts.push({ type, days });
      }
    };

    checkExpiry(vehicle.insurance_expiry, "Insurance");
    checkExpiry(vehicle.pollution_certificate_expiry, "Pollution");
    checkExpiry(vehicle.fitness_certificate_expiry, "Fitness");

    return alerts;
  };

  const handleDelete = async (vehicle: TransportVehicle) => {
    if (vehicleAssignments.get(vehicle.id)) {
      toast({
        title: "Cannot Delete",
        description:
          "This vehicle is assigned to a route. Please remove the assignment first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteMutation.mutateAsync(vehicle.id);
      toast({
        title: "Vehicle Deleted",
        description: `${vehicle.vehicle_number} has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete vehicle. Please try again.",
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/transport">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Fleet Management</h1>
            <p className="text-muted-foreground">
              {stats.active} active vehicles • {stats.capacity} total capacity
            </p>
          </div>
        </div>
        {canCreate && (
          <Button asChild>
            <Link to="/transport/vehicles/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Link>
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Bus className="h-5 w-5 text-blue-600" />
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
              <Shield className="h-5 w-5 text-green-600" />
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
              <Wrench className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <p className="text-xl font-bold">{stats.maintenance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Capacity</p>
                <p className="text-xl font-bold">{stats.capacity}</p>
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
                placeholder="Search by vehicle number, manufacturer..."
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
                <SelectItem value="Bus">Bus</SelectItem>
                <SelectItem value="Van">Van</SelectItem>
                <SelectItem value="Auto">Auto</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bus className="h-5 w-5" />
            Vehicles ({filteredVehicles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVehicles.length === 0 ? (
            <div className="text-center py-12">
              <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No vehicles found</h3>
              <p className="text-muted-foreground">
                {vehicles?.length === 0
                  ? "Start by adding vehicles to your fleet"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => {
                  const docAlerts = getDocumentStatus(vehicle);
                  const isAssigned = vehicleAssignments.get(vehicle.id);

                  return (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Bus className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {vehicle.vehicle_number}
                            </p>
                            {vehicle.manufacturer && vehicle.model && (
                              <p className="text-xs text-muted-foreground">
                                {vehicle.manufacturer} {vehicle.model}
                                {vehicle.year_of_manufacture &&
                                  ` (${vehicle.year_of_manufacture})`}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{vehicle.vehicle_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{vehicle.capacity}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {docAlerts.length > 0 ? (
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex items-center gap-1 text-amber-600">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-sm">
                                  {docAlerts.length} expiring
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                {docAlerts.map((alert, i) => (
                                  <p key={i}>
                                    {alert.type}:{" "}
                                    {alert.days <= 0
                                      ? "Expired!"
                                      : `${alert.days} days left`}
                                  </p>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <div className="flex items-center gap-1 text-green-600">
                            <Shield className="h-4 w-4" />
                            <span className="text-sm">Valid</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {isAssigned ? (
                          <Badge variant="default">Assigned</Badge>
                        ) : (
                          <Badge variant="secondary">Available</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            vehicle.status === "Active"
                              ? "default"
                              : vehicle.status === "Maintenance"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {vehicle.status}
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
                              <Link to={`/transport/vehicles/${vehicle.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {canUpdate && (
                              <>
                                <DropdownMenuItem asChild>
                                  <Link
                                    to={`/transport/vehicles/${vehicle.id}/edit`}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Vehicle
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link
                                    to={`/transport/vehicles/${vehicle.id}/maintenance`}
                                  >
                                    <Wrench className="mr-2 h-4 w-4" />
                                    Maintenance Log
                                  </Link>
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            {canDelete && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete(vehicle)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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
