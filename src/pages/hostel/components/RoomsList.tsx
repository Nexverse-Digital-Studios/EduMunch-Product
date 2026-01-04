/**
 * RoomsList Component
 * ===================
 * List and manage hostel rooms
 */

import { useState, useMemo } from "react";
import {
  DoorOpen,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Users,
  BedDouble,
  MoreHorizontal,
  Trash2,
  IndianRupee,
  Building2,
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
import { Progress } from "@/components/ui/progress";

import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import { HostelRoom, HostelBlock } from "./types";

const INDEX_TOKEN = "1emaet";

export function RoomsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [blockFilter, setBlockFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { canCreate, canUpdate, canDelete } = useModulePermissions("hostel");
  const { toast } = useToast();

  // Fetch data
  const {
    data: rooms,
    isLoading,
    deleteMutation,
  } = useSupabaseTable<HostelRoom>(`hostel_rooms_${INDEX_TOKEN}`, {
    filters: {},
  });

  const { data: blocks } = useSupabaseTable<HostelBlock>(
    `hostel_blocks_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Block lookup
  const blockMap = useMemo(() => {
    if (!blocks) return new Map<string, HostelBlock>();
    return new Map(blocks.map((b) => [b.id, b]));
  }, [blocks]);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    if (!rooms) return [];

    return rooms.filter((room) => {
      const block = blockMap.get(room.block_id);
      const searchLower = searchQuery.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        room.room_number.toLowerCase().includes(searchLower) ||
        block?.block_name.toLowerCase().includes(searchLower);

      const matchesBlock =
        blockFilter === "all" || room.block_id === blockFilter;

      const matchesType = typeFilter === "all" || room.room_type === typeFilter;

      const matchesStatus =
        statusFilter === "all" || room.status === statusFilter;

      return matchesSearch && matchesBlock && matchesType && matchesStatus;
    });
  }, [rooms, blockMap, searchQuery, blockFilter, typeFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    if (!rooms)
      return {
        total: 0,
        available: 0,
        occupied: 0,
        maintenance: 0,
        capacity: 0,
      };
    return {
      total: rooms.length,
      available: rooms.filter((r) => r.status === "Available").length,
      occupied: rooms.filter((r) => r.status === "Occupied").length,
      maintenance: rooms.filter((r) => r.status === "Maintenance").length,
      capacity: rooms.reduce((sum, r) => sum + r.capacity, 0),
    };
  }, [rooms]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDelete = async (room: HostelRoom) => {
    if (room.current_occupancy > 0) {
      toast({
        title: "Cannot Delete",
        description: "This room has occupants. Please vacate the room first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteMutation.mutateAsync(room.id);
      toast({
        title: "Room Deleted",
        description: `Room ${room.room_number} has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete room. Please try again.",
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
          <h1 className="text-2xl font-bold">Hostel Rooms</h1>
          <p className="text-muted-foreground">
            {stats.available} rooms available
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => toast({ title: "Add Room", description: "Room form coming soon." })}>
            <Plus className="mr-2 h-4 w-4" />
            Add Room
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DoorOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Rooms</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DoorOpen className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-xl font-bold">{stats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Occupied</p>
                <p className="text-xl font-bold">{stats.occupied}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DoorOpen className="h-5 w-5 text-orange-600" />
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
              <BedDouble className="h-5 w-5 text-amber-600" />
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
                placeholder="Search by room number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={blockFilter} onValueChange={setBlockFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Building2 className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Block" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blocks</SelectItem>
                {blocks?.map((block) => (
                  <SelectItem key={block.id} value={block.id}>
                    {block.block_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Double">Double</SelectItem>
                <SelectItem value="Triple">Triple</SelectItem>
                <SelectItem value="Dormitory">Dormitory</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Occupied">Occupied</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5" />
            Rooms ({filteredRooms.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRooms.length === 0 ? (
            <div className="text-center py-12">
              <DoorOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No rooms found</h3>
              <p className="text-muted-foreground">
                {rooms?.length === 0
                  ? "Start by adding hostel rooms"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Block</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Monthly Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => {
                  const block = blockMap.get(room.block_id);
                  const occupancyRate =
                    room.capacity > 0
                      ? (room.current_occupancy / room.capacity) * 100
                      : 0;

                  return (
                    <TableRow key={room.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DoorOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {room.room_number}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{block?.block_name || "Unknown"}</TableCell>
                      <TableCell>Floor {room.floor_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{room.room_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={occupancyRate}
                            className="w-16 h-2"
                          />
                          <span className="text-sm">
                            {room.current_occupancy}/{room.capacity}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          <span>{formatCurrency(room.room_fee)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            room.status === "Available"
                              ? "default"
                              : room.status === "Occupied"
                              ? "secondary"
                              : room.status === "Maintenance"
                              ? "outline"
                              : "default"
                          }
                          className={
                            room.status === "Available"
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                        >
                          {room.status}
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
                              <Link to={`/hostel/rooms/${room.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {canUpdate && (
                              <DropdownMenuItem asChild>
                                <Link to={`/hostel/rooms/${room.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Room
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete(room)}
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
