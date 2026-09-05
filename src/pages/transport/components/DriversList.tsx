/**
 * DriversList Component
 * =====================
 * List and manage vehicle drivers
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  UserCheck,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  AlertTriangle,
  Phone,
  Calendar,
  MoreHorizontal,
  Trash2,
  FileText,
  IdCard,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import { VehicleDriver, VehicleRouteAssignment } from "./types";

const INDEX_TOKEN = "1emaet";

export function DriversList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { canCreate, canUpdate, canDelete } = useModulePermissions("transport");
  const { toast } = useToast();

  // Fetch data
  const {
    data: drivers,
    isLoading,
    deleteMutation,
  } = useSupabaseTable<VehicleDriver>(`vehicle_drivers_${INDEX_TOKEN}`, {
    filters: {},
  });

  const { data: assignments } = useSupabaseTable<VehicleRouteAssignment>(
    `vehicle_route_assignments_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Check if driver is assigned
  const driverAssignments = useMemo(() => {
    if (!assignments) return new Map<string, boolean>();
    const assigned = new Map<string, boolean>();
    assignments
      .filter((a) => a.is_active)
      .forEach((a) => {
        assigned.set(a.driver_id, true);
      });
    return assigned;
  }, [assignments]);

  // Filtered drivers
  const filteredDrivers = useMemo(() => {
    if (!drivers) return [];

    return drivers.filter((driver) => {
      const searchLower = searchQuery.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        driver.full_name.toLowerCase().includes(searchLower) ||
        driver.employee_code.toLowerCase().includes(searchLower) ||
        driver.phone.includes(searchQuery) ||
        driver.license_number.toLowerCase().includes(searchLower);

      const matchesStatus =
        statusFilter === "all" || driver.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [drivers, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    if (!drivers)
      return { total: 0, active: 0, onLeave: 0, expiringLicenses: 0 };

    const expiringCount = drivers.filter((d) => {
      if (!d.license_expiry) return false;
      const days = Math.ceil(
        (new Date(d.license_expiry).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      );
      return days <= 30;
    }).length;

    return {
      total: drivers.length,
      active: drivers.filter((d) => d.status === "Active").length,
      onLeave: drivers.filter((d) => d.status === "On Leave").length,
      expiringLicenses: expiringCount,
    };
  }, [drivers]);

  // Get license status
  const getLicenseStatus = (driver: VehicleDriver) => {
    if (!driver.license_expiry) return null;
    const days = Math.ceil(
      (new Date(driver.license_expiry).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    );
    if (days <= 0) return { status: "expired", days };
    if (days <= 7) return { status: "critical", days };
    if (days <= 30) return { status: "warning", days };
    return { status: "valid", days };
  };

  const handleDelete = async (driver: VehicleDriver) => {
    if (driverAssignments.get(driver.id)) {
      toast({
        title: "Cannot Delete",
        description:
          "This driver is assigned to a route. Please remove the assignment first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteMutation.mutateAsync(driver.id);
      toast({
        title: "Driver Deleted",
        description: `${driver.full_name} has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete driver. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
          <h1 className="text-2xl font-bold">Driver Management</h1>
          <p className="text-muted-foreground">{stats.active} active drivers</p>
        </div>
        {canCreate && (
          <Button
            onClick={() =>
              toast({
                title: "Add Driver",
                description: "Driver form coming soon.",
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Driver
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Drivers</p>
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
              <Calendar className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm text-muted-foreground">On Leave</p>
                <p className="text-xl font-bold">{stats.onLeave}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">License Alerts</p>
                <p className="text-xl font-bold">{stats.expiringLicenses}</p>
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
                placeholder="Search by name, employee code, phone, or license..."
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
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
                <SelectItem value="Resigned">Resigned</SelectItem>
                <SelectItem value="Terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Drivers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Drivers ({filteredDrivers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDrivers.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No drivers found</h3>
              <p className="text-muted-foreground">
                {drivers?.length === 0
                  ? "Start by adding drivers"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>License Expiry</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => {
                  const licenseStatus = getLicenseStatus(driver);
                  const isAssigned = driverAssignments.get(driver.id);

                  return (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={driver.photo_url || undefined} />
                            <AvatarFallback>
                              {getInitials(driver.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{driver.full_name}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {driver.employee_code}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{driver.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <IdCard className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-mono">
                            {driver.license_number}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {licenseStatus ? (
                          <Tooltip>
                            <TooltipTrigger>
                              <div
                                className={`flex items-center gap-1 ${
                                  licenseStatus.status === "expired"
                                    ? "text-red-600"
                                    : licenseStatus.status === "critical"
                                    ? "text-red-600"
                                    : licenseStatus.status === "warning"
                                    ? "text-amber-600"
                                    : "text-green-600"
                                }`}
                              >
                                {(licenseStatus.status === "expired" ||
                                  licenseStatus.status === "critical" ||
                                  licenseStatus.status === "warning") && (
                                  <AlertTriangle className="h-4 w-4" />
                                )}
                                <span>
                                  {new Date(
                                    driver.license_expiry
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {licenseStatus.status === "expired"
                                ? "License has expired!"
                                : `${licenseStatus.days} days until expiry`}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-muted-foreground">-</span>
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
                            driver.status === "Active"
                              ? "default"
                              : driver.status === "On Leave"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {driver.status}
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
                              <Link to={`/transport/drivers/${driver.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {canUpdate && (
                              <DropdownMenuItem asChild>
                                <Link
                                  to={`/transport/drivers/${driver.id}/edit`}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Driver
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete(driver)}
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
