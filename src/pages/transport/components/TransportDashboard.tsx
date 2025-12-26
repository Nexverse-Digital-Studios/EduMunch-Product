/**
 * TransportDashboard Component
 * ============================
 * Main dashboard for transport management
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Bus,
  MapPin,
  Users,
  Wrench,
  Route,
  Car,
  UserCheck,
  AlertTriangle,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import {
  TransportRoute,
  TransportVehicle,
  VehicleDriver,
  StudentTransport,
  VehicleMaintenance,
} from "./types";

const INDEX_TOKEN = "1emaet";

export function TransportDashboard() {
  const { canCreate } = useModulePermissions("transport");

  // Fetch data
  const { data: routes, isLoading: loadingRoutes } =
    useSupabaseTable<TransportRoute>(`transport_routes_${INDEX_TOKEN}`, {
      filters: {},
    });

  const { data: vehicles, isLoading: loadingVehicles } =
    useSupabaseTable<TransportVehicle>(`transport_vehicles_${INDEX_TOKEN}`, {
      filters: {},
    });

  const { data: drivers, isLoading: loadingDrivers } =
    useSupabaseTable<VehicleDriver>(`vehicle_drivers_${INDEX_TOKEN}`, {
      filters: {},
    });

  const { data: studentTransport, isLoading: loadingStudentTransport } =
    useSupabaseTable<StudentTransport>(`student_transport_${INDEX_TOKEN}`, {
      filters: {},
    });

  const { data: maintenance, isLoading: loadingMaintenance } =
    useSupabaseTable<VehicleMaintenance>(`vehicle_maintenance_${INDEX_TOKEN}`, {
      filters: {},
    });

  const isLoading =
    loadingRoutes ||
    loadingVehicles ||
    loadingDrivers ||
    loadingStudentTransport ||
    loadingMaintenance;

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalRoutes: routes?.filter((r) => r.is_active).length || 0,
      totalVehicles: vehicles?.filter((v) => v.status === "Active").length || 0,
      totalDrivers: drivers?.filter((d) => d.status === "Active").length || 0,
      studentsEnrolled:
        studentTransport?.filter((st) => st.is_active).length || 0,
      vehiclesInMaintenance:
        vehicles?.filter((v) => v.status === "Maintenance").length || 0,
      upcomingMaintenance:
        maintenance?.filter((m) => m.status === "Scheduled").length || 0,
    };
  }, [routes, vehicles, drivers, studentTransport, maintenance]);

  // Alerts
  const alerts = useMemo(() => {
    const alertList: { type: string; message: string; severity: string }[] = [];

    // License expiry alerts
    drivers?.forEach((driver) => {
      if (driver.license_expiry) {
        const expiry = new Date(driver.license_expiry);
        const daysUntilExpiry = Math.ceil(
          (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
          alertList.push({
            type: "license",
            message: `${driver.full_name}'s license expires in ${daysUntilExpiry} days`,
            severity: daysUntilExpiry <= 7 ? "high" : "medium",
          });
        } else if (daysUntilExpiry <= 0) {
          alertList.push({
            type: "license",
            message: `${driver.full_name}'s license has expired!`,
            severity: "critical",
          });
        }
      }
    });

    // Vehicle document expiry alerts
    vehicles?.forEach((vehicle) => {
      if (vehicle.insurance_expiry) {
        const expiry = new Date(vehicle.insurance_expiry);
        const daysUntilExpiry = Math.ceil(
          (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
          alertList.push({
            type: "insurance",
            message: `${vehicle.vehicle_number} insurance expires in ${daysUntilExpiry} days`,
            severity: daysUntilExpiry <= 7 ? "high" : "medium",
          });
        }
      }

      if (vehicle.fitness_certificate_expiry) {
        const expiry = new Date(vehicle.fitness_certificate_expiry);
        const daysUntilExpiry = Math.ceil(
          (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
          alertList.push({
            type: "fitness",
            message: `${vehicle.vehicle_number} fitness certificate expires in ${daysUntilExpiry} days`,
            severity: daysUntilExpiry <= 7 ? "high" : "medium",
          });
        }
      }
    });

    return alertList.slice(0, 5);
  }, [drivers, vehicles]);

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
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
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
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bus className="h-6 w-6 text-primary" />
            Transport Management
          </h1>
          <p className="text-muted-foreground">
            Manage routes, vehicles, drivers, and student transport
          </p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <>
              <Button variant="outline" asChild>
                <Link to="/transport/vehicles/create">
                  <Car className="mr-2 h-4 w-4" />
                  Add Vehicle
                </Link>
              </Button>
              <Button asChild>
                <Link to="/transport/routes/create">
                  <Route className="mr-2 h-4 w-4" />
                  Add Route
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Route className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalRoutes}</p>
                <p className="text-xs text-muted-foreground">Active Routes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Bus className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalVehicles}</p>
                <p className="text-xs text-muted-foreground">Active Vehicles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalDrivers}</p>
                <p className="text-xs text-muted-foreground">Active Drivers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-amber-600" />
              <div>
                <p className="text-2xl font-bold">{stats.studentsEnrolled}</p>
                <p className="text-xs text-muted-foreground">
                  Students Enrolled
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Wrench className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {stats.vehiclesInMaintenance}
                </p>
                <p className="text-xs text-muted-foreground">In Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">
                  {stats.upcomingMaintenance}
                </p>
                <p className="text-xs text-muted-foreground">
                  Scheduled Service
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/transport/routes" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6 text-center">
              <Route className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="font-medium">Routes</p>
              <p className="text-xs text-muted-foreground">Manage routes</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/transport/vehicles" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6 text-center">
              <Bus className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="font-medium">Vehicles</p>
              <p className="text-xs text-muted-foreground">Fleet management</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/transport/drivers" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6 text-center">
              <UserCheck className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="font-medium">Drivers</p>
              <p className="text-xs text-muted-foreground">Driver management</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/transport/students" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-amber-600" />
              <p className="font-medium">Students</p>
              <p className="text-xs text-muted-foreground">
                Transport allocation
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="routes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="routes">
            <Route className="mr-2 h-4 w-4" />
            Routes Overview
          </TabsTrigger>
          <TabsTrigger value="vehicles">
            <Bus className="mr-2 h-4 w-4" />
            Fleet Status
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Alerts
            {alerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {alerts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="routes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Active Routes</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/transport/routes">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {routes && routes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route</TableHead>
                      <TableHead>From - To</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Fare</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routes.slice(0, 5).map((route) => (
                      <TableRow key={route.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{route.route_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {route.route_code}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {route.start_location} → {route.end_location}
                          </div>
                        </TableCell>
                        <TableCell>
                          {route.total_distance_km
                            ? `${route.total_distance_km} km`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {route.estimated_duration_minutes
                            ? `${route.estimated_duration_minutes} min`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {route.fare_amount
                            ? formatCurrency(route.fare_amount)
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={route.is_active ? "default" : "secondary"}
                          >
                            {route.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No routes configured</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding transport routes
                  </p>
                  {canCreate && (
                    <Button asChild>
                      <Link to="/transport/routes/create">Add Route</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Fleet Status</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/transport/vehicles">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {vehicles && vehicles.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Insurance Expiry</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.slice(0, 5).map((vehicle) => {
                      const insuranceDays = vehicle.insurance_expiry
                        ? Math.ceil(
                            (new Date(vehicle.insurance_expiry).getTime() -
                              Date.now()) /
                              (1000 * 60 * 60 * 24)
                          )
                        : null;

                      return (
                        <TableRow key={vehicle.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Bus className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">
                                  {vehicle.vehicle_number}
                                </p>
                                {vehicle.manufacturer && vehicle.model && (
                                  <p className="text-xs text-muted-foreground">
                                    {vehicle.manufacturer} {vehicle.model}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{vehicle.vehicle_type}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {vehicle.capacity}
                            </div>
                          </TableCell>
                          <TableCell>
                            {vehicle.insurance_expiry ? (
                              <div className="flex items-center gap-2">
                                <span
                                  className={
                                    insuranceDays !== null &&
                                    insuranceDays <= 30
                                      ? "text-red-600"
                                      : ""
                                  }
                                >
                                  {new Date(
                                    vehicle.insurance_expiry
                                  ).toLocaleDateString()}
                                </span>
                                {insuranceDays !== null &&
                                  insuranceDays <= 30 && (
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                  )}
                              </div>
                            ) : (
                              "-"
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
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No vehicles added</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding vehicles to your fleet
                  </p>
                  {canCreate && (
                    <Button asChild>
                      <Link to="/transport/vehicles/create">Add Vehicle</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Alerts & Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        alert.severity === "critical"
                          ? "bg-red-50 border-red-200 dark:bg-red-950"
                          : alert.severity === "high"
                          ? "bg-orange-50 border-orange-200 dark:bg-orange-950"
                          : "bg-amber-50 border-amber-200 dark:bg-amber-950"
                      }`}
                    >
                      <AlertTriangle
                        className={`h-5 w-5 ${
                          alert.severity === "critical"
                            ? "text-red-600"
                            : alert.severity === "high"
                            ? "text-orange-600"
                            : "text-amber-600"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-medium capitalize">{alert.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.message}
                        </p>
                      </div>
                      <Badge
                        variant={
                          alert.severity === "critical"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">All clear!</h3>
                  <p className="text-muted-foreground">
                    No alerts or expiring documents at this time.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
