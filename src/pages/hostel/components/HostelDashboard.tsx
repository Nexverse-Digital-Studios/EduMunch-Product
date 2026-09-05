/**
 * HostelDashboard Component
 * =========================
 * Main dashboard for hostel management
 */

import { useState, useMemo } from "react";
import {
  Building2,
  BedDouble,
  Users,
  IndianRupee,
  AlertTriangle,
  Calendar,
  UserCheck,
  ClipboardList,
  DoorOpen,
  Wrench,
  TrendingUp,
  UserX,
  Plus,
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
import { useToast } from "@/hooks/use-toast";

import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import {
  HostelBlock,
  HostelRoom,
  HostelAllocation,
  HostelComplaint,
  HostelLeave,
  HostelStats,
} from "./types";

const INDEX_TOKEN = "1emaet";

export function HostelDashboard() {
  const { canCreate } = useModulePermissions("hostel");
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch data (will be empty until tables are created)
  const { data: blocks, isLoading: loadingBlocks } =
    useSupabaseTable<HostelBlock>(`hostel_blocks_${INDEX_TOKEN}`, {
      filters: {},
    });

  const { data: rooms, isLoading: loadingRooms } = useSupabaseTable<HostelRoom>(
    `hostel_rooms_${INDEX_TOKEN}`,
    {
      filters: {},
    }
  );

  const { data: allocations, isLoading: loadingAllocations } =
    useSupabaseTable<HostelAllocation>(`hostel_allocations_${INDEX_TOKEN}`, {
      filters: {},
    });

  const { data: complaints, isLoading: loadingComplaints } =
    useSupabaseTable<HostelComplaint>(`hostel_complaints_${INDEX_TOKEN}`, {
      filters: {},
    });

  const { data: leaves, isLoading: loadingLeaves } =
    useSupabaseTable<HostelLeave>(`hostel_leaves_${INDEX_TOKEN}`, {
      filters: {},
    });

  const isLoading =
    loadingBlocks ||
    loadingRooms ||
    loadingAllocations ||
    loadingComplaints ||
    loadingLeaves;

  // Calculate stats
  const stats: HostelStats = useMemo(() => {
    const totalRooms = rooms?.length || 0;
    const totalCapacity = rooms?.reduce((sum, r) => sum + r.capacity, 0) || 0;
    const currentOccupancy =
      rooms?.reduce((sum, r) => sum + r.current_occupancy, 0) || 0;

    return {
      totalBlocks: blocks?.filter((b) => b.is_active).length || 0,
      totalRooms,
      totalCapacity,
      currentOccupancy,
      occupancyRate:
        totalCapacity > 0 ? (currentOccupancy / totalCapacity) * 100 : 0,
      pendingFees: 0, // Would be calculated from fees table
      openComplaints:
        complaints?.filter(
          (c) => c.status === "Open" || c.status === "In Progress"
        ).length || 0,
      todayAbsent: 0, // Would be calculated from attendance
    };
  }, [blocks, rooms, complaints]);

  // Active leaves
  const activeLeaves = useMemo(() => {
    if (!leaves) return [];
    const today = new Date().toISOString().split("T")[0];
    return leaves.filter(
      (l) =>
        l.approval_status === "Approved" &&
        l.from_date <= today &&
        l.to_date >= today
    );
  }, [leaves]);

  // Room availability by block
  const blockStats = useMemo(() => {
    if (!blocks || !rooms) return [];

    return blocks
      .filter((b) => b.is_active)
      .map((block) => {
        const blockRooms = rooms.filter((r) => r.block_id === block.id);
        const available = blockRooms.filter(
          (r) => r.status === "Available"
        ).length;
        const occupied = blockRooms.filter(
          (r) => r.status === "Occupied"
        ).length;
        const maintenance = blockRooms.filter(
          (r) => r.status === "Maintenance"
        ).length;

        return {
          ...block,
          available,
          occupied,
          maintenance,
          total: blockRooms.length,
        };
      });
  }, [blocks, rooms]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddAllocation = () => {
    toast({
      title: "Allocate Room",
      description: "Room allocation will be available in the Allocations tab.",
    });
    setActiveTab("allocations");
  };

  const handleAddBlock = () => {
    toast({
      title: "Add Block",
      description: "Block creation will be available in the Blocks tab.",
    });
    setActiveTab("blocks");
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
            <Building2 className="h-6 w-6 text-primary" />
            Hostel Management
          </h1>
          <p className="text-muted-foreground">
            Manage hostel blocks, rooms, allocations, and student stay
          </p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <>
              <Button variant="outline" onClick={handleAddAllocation}>
                <UserCheck className="mr-2 h-4 w-4" />
                Allocate Room
              </Button>
              <Button onClick={handleAddBlock}>
                <Building2 className="mr-2 h-4 w-4" />
                Add Block
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Building2 className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{stats.totalBlocks}</p>
              <p className="text-xs text-muted-foreground">Blocks</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <DoorOpen className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{stats.totalRooms}</p>
              <p className="text-xs text-muted-foreground">Rooms</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <BedDouble className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">{stats.totalCapacity}</p>
              <p className="text-xs text-muted-foreground">Total Beds</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-amber-600" />
              <p className="text-2xl font-bold">{stats.currentOccupancy}</p>
              <p className="text-xs text-muted-foreground">Occupied</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-teal-600" />
              <p className="text-2xl font-bold">
                {stats.occupancyRate.toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground">Occupancy</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold">{activeLeaves.length}</p>
              <p className="text-xs text-muted-foreground">On Leave</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Wrench className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold">{stats.openComplaints}</p>
              <p className="text-xs text-muted-foreground">Complaints</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <UserX className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <p className="text-2xl font-bold">{stats.todayAbsent}</p>
              <p className="text-xs text-muted-foreground">Absent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Now using buttons to switch tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer h-full"
          onClick={() => setActiveTab("blocks")}
        >
          <CardContent className="pt-6 text-center">
            <Building2 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="font-medium">Blocks</p>
            <p className="text-xs text-muted-foreground">Manage blocks</p>
          </CardContent>
        </Card>
        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer h-full"
          onClick={() => setActiveTab("rooms")}
        >
          <CardContent className="pt-6 text-center">
            <DoorOpen className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="font-medium">Rooms</p>
            <p className="text-xs text-muted-foreground">Room management</p>
          </CardContent>
        </Card>
        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer h-full"
          onClick={() => setActiveTab("allocations")}
        >
          <CardContent className="pt-6 text-center">
            <UserCheck className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="font-medium">Allocations</p>
            <p className="text-xs text-muted-foreground">Room allocations</p>
          </CardContent>
        </Card>
        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer h-full"
          onClick={() => setActiveTab("complaints")}
        >
          <CardContent className="pt-6 text-center">
            <ClipboardList className="h-8 w-8 mx-auto mb-2 text-amber-600" />
            <p className="font-medium">Complaints</p>
            <p className="text-xs text-muted-foreground">
              {stats.openComplaints} open
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <TrendingUp className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="blocks">
            <Building2 className="mr-2 h-4 w-4" />
            Blocks
          </TabsTrigger>
          <TabsTrigger value="rooms">
            <DoorOpen className="mr-2 h-4 w-4" />
            Rooms
          </TabsTrigger>
          <TabsTrigger value="allocations">
            <UserCheck className="mr-2 h-4 w-4" />
            Allocations
          </TabsTrigger>
          <TabsTrigger value="complaints">
            <ClipboardList className="mr-2 h-4 w-4" />
            Complaints
            {stats.openComplaints > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.openComplaints}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="leaves">
            <Calendar className="mr-2 h-4 w-4" />
            Leaves
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Blocks Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Block Status</CardTitle>
              </CardHeader>
              <CardContent>
                {blockStats.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Block</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Occupancy</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blockStats.slice(0, 5).map((block) => {
                        const occupancyRate =
                          block.total > 0
                            ? (block.occupied / block.total) * 100
                            : 0;
                        return (
                          <TableRow key={block.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{block.block_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {block.block_code}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{block.block_type}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={occupancyRate}
                                  className="w-16 h-2"
                                />
                                <span className="text-sm">
                                  {occupancyRate.toFixed(0)}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No blocks configured</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by adding hostel blocks
                    </p>
                    {canCreate && (
                      <Button onClick={handleAddBlock}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Block
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Complaints Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Open Complaints</CardTitle>
              </CardHeader>
              <CardContent>
                {complaints &&
                complaints.filter((c) => c.status !== "Closed").length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {complaints
                        .filter((c) => c.status !== "Closed")
                        .slice(0, 5)
                        .map((complaint) => (
                          <TableRow key={complaint.id}>
                            <TableCell>
                              <Badge variant="outline">
                                {complaint.complaint_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  complaint.priority === "Urgent"
                                    ? "destructive"
                                    : complaint.priority === "High"
                                    ? "default"
                                    : "secondary"
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
                                    : "secondary"
                                }
                              >
                                {complaint.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No open complaints!</h3>
                    <p className="text-muted-foreground">
                      All complaints have been resolved.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blocks">
          <Card>
            <CardHeader>
              <CardTitle>Block Status</CardTitle>
            </CardHeader>
            <CardContent>
              {blockStats.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Block</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Rooms</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Occupied</TableHead>
                      <TableHead>Maintenance</TableHead>
                      <TableHead>Occupancy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blockStats.map((block) => {
                      const occupancyRate =
                        block.total > 0
                          ? (block.occupied / block.total) * 100
                          : 0;

                      return (
                        <TableRow key={block.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{block.block_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {block.block_code}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{block.block_type}</Badge>
                          </TableCell>
                          <TableCell>{block.total}</TableCell>
                          <TableCell>
                            <span className="text-green-600">
                              {block.available}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-blue-600">
                              {block.occupied}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-orange-600">
                              {block.maintenance}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={occupancyRate}
                                className="w-16 h-2"
                              />
                              <span className="text-sm">
                                {occupancyRate.toFixed(0)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No blocks configured</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding hostel blocks
                  </p>
                  {canCreate && (
                    <Button onClick={handleAddBlock}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Block
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms">
          <Card>
            <CardHeader>
              <CardTitle>Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              {rooms && rooms.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Occupancy</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell>
                          <p className="font-medium">{room.room_number}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{room.room_type}</Badge>
                        </TableCell>
                        <TableCell>{room.capacity}</TableCell>
                        <TableCell>{room.current_occupancy}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              room.status === "Available"
                                ? "default"
                                : room.status === "Occupied"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {room.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <DoorOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No rooms configured</h3>
                  <p className="text-muted-foreground mb-4">
                    Add rooms to your hostel blocks
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocations">
          <Card>
            <CardHeader>
              <CardTitle>Room Allocations</CardTitle>
            </CardHeader>
            <CardContent>
              {allocations && allocations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocations.map((allocation) => (
                      <TableRow key={allocation.id}>
                        <TableCell>{allocation.student_id}</TableCell>
                        <TableCell>{allocation.room_id}</TableCell>
                        <TableCell>
                          {new Date(allocation.from_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {allocation.to_date
                            ? new Date(allocation.to_date).toLocaleDateString()
                            : "Ongoing"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              allocation.status === "Active" ? "default" : "secondary"
                            }
                          >
                            {allocation.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No allocations</h3>
                  <p className="text-muted-foreground mb-4">
                    Allocate students to rooms
                  </p>
                  {canCreate && (
                    <Button onClick={handleAddAllocation}>
                      <Plus className="mr-2 h-4 w-4" />
                      Allocate Room
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaints">
          <Card>
            <CardHeader>
              <CardTitle>Open Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              {complaints &&
              complaints.filter((c) => c.status !== "Closed").length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complaints
                      .filter((c) => c.status !== "Closed")
                      .slice(0, 5)
                      .map((complaint) => (
                        <TableRow key={complaint.id}>
                          <TableCell>
                            <Badge variant="outline">
                              {complaint.complaint_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {complaint.description}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                complaint.priority === "Urgent"
                                  ? "destructive"
                                  : complaint.priority === "High"
                                  ? "default"
                                  : "secondary"
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
                                  : "secondary"
                              }
                            >
                              {complaint.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(
                              complaint.created_at
                            ).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No open complaints!</h3>
                  <p className="text-muted-foreground">
                    All complaints have been resolved.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves">
          <Card>
            <CardHeader>
              <CardTitle>Students on Leave</CardTitle>
            </CardHeader>
            <CardContent>
              {activeLeaves.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeLeaves.slice(0, 5).map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell>
                          <span className="font-medium">
                            {leave.student_id}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{leave.leave_type}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(leave.from_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(leave.to_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {leave.reason}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <UserCheck className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">All students present!</h3>
                  <p className="text-muted-foreground">
                    No students are currently on leave.
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
