/**
 * BlocksList Component
 * ====================
 * List and manage hostel blocks
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Users,
  DoorOpen,
  MoreHorizontal,
  Trash2,
  Phone,
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
import { HostelBlock, HostelRoom, StaffInfo } from "./types";

const INDEX_TOKEN = "1emaet";

export function BlocksList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { canCreate, canUpdate, canDelete } = useModulePermissions("hostel");
  const { toast } = useToast();

  // Fetch data
  const {
    data: blocks,
    isLoading,
    deleteMutation,
  } = useSupabaseTable<HostelBlock>(`hostel_blocks_${INDEX_TOKEN}`, {
    filters: {},
  });

  const { data: rooms } = useSupabaseTable<HostelRoom>(
    `hostel_rooms_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const { data: staff } = useSupabaseTable<StaffInfo>(
    `teachers_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Staff lookup
  const staffMap = useMemo(() => {
    if (!staff) return new Map<string, StaffInfo>();
    return new Map(staff.map((s) => [s.id, s]));
  }, [staff]);

  // Room counts per block
  const roomStats = useMemo(() => {
    if (!rooms)
      return new Map<
        string,
        { total: number; available: number; occupied: number }
      >();

    const stats = new Map<
      string,
      { total: number; available: number; occupied: number }
    >();

    rooms.forEach((room) => {
      const current = stats.get(room.block_id) || {
        total: 0,
        available: 0,
        occupied: 0,
      };
      current.total++;
      if (room.status === "Available") current.available++;
      if (room.status === "Occupied") current.occupied++;
      stats.set(room.block_id, current);
    });

    return stats;
  }, [rooms]);

  // Filtered blocks
  const filteredBlocks = useMemo(() => {
    if (!blocks) return [];

    return blocks.filter((block) => {
      const searchLower = searchQuery.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        block.block_name.toLowerCase().includes(searchLower) ||
        block.block_code.toLowerCase().includes(searchLower);

      const matchesType =
        typeFilter === "all" || block.block_type === typeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && block.is_active) ||
        (statusFilter === "inactive" && !block.is_active);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [blocks, searchQuery, typeFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    if (!blocks) return { total: 0, active: 0, boys: 0, girls: 0 };
    return {
      total: blocks.length,
      active: blocks.filter((b) => b.is_active).length,
      boys: blocks.filter((b) => b.block_type === "Boys").length,
      girls: blocks.filter((b) => b.block_type === "Girls").length,
    };
  }, [blocks]);

  const handleDelete = async (block: HostelBlock) => {
    const blockRooms = roomStats.get(block.id);
    if (blockRooms && blockRooms.occupied > 0) {
      toast({
        title: "Cannot Delete",
        description: `This block has ${blockRooms.occupied} occupied rooms. Please vacate all rooms first.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteMutation.mutateAsync(block.id);
      toast({
        title: "Block Deleted",
        description: `${block.block_name} has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete block. Please try again.",
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
          <h1 className="text-2xl font-bold">Hostel Blocks</h1>
          <p className="text-muted-foreground">{stats.active} active blocks</p>
        </div>
        {canCreate && (
          <Button
            onClick={() =>
              toast({
                title: "Add Block",
                description: "Block form coming soon.",
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Block
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Blocks</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-green-600" />
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
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Boys Blocks</p>
                <p className="text-xl font-bold">{stats.boys}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-pink-500" />
              <div>
                <p className="text-sm text-muted-foreground">Girls Blocks</p>
                <p className="text-xl font-bold">{stats.girls}</p>
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
                placeholder="Search by block name or code..."
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
                <SelectItem value="Boys">Boys</SelectItem>
                <SelectItem value="Girls">Girls</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
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

      {/* Blocks Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Blocks ({filteredBlocks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBlocks.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No blocks found</h3>
              <p className="text-muted-foreground">
                {blocks?.length === 0
                  ? "Start by adding hostel blocks"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Block</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Warden</TableHead>
                  <TableHead>Floors</TableHead>
                  <TableHead>Rooms</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBlocks.map((block) => {
                  const warden = block.warden_id
                    ? staffMap.get(block.warden_id)
                    : null;
                  const blockRoom = roomStats.get(block.id) || {
                    total: 0,
                    available: 0,
                    occupied: 0,
                  };
                  const occupancyRate =
                    blockRoom.total > 0
                      ? (blockRoom.occupied / blockRoom.total) * 100
                      : 0;

                  return (
                    <TableRow key={block.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{block.block_name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {block.block_code}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            block.block_type === "Boys"
                              ? "border-blue-500 text-blue-600"
                              : block.block_type === "Girls"
                              ? "border-pink-500 text-pink-600"
                              : ""
                          }
                        >
                          {block.block_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {warden ? (
                          <div>
                            <p className="text-sm">
                              {warden.first_name} {warden.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {warden.phone}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            Not assigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{block.total_floors}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DoorOpen className="h-4 w-4 text-muted-foreground" />
                          <span>{blockRoom.total}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={occupancyRate}
                            className="w-16 h-2"
                          />
                          <span className="text-sm">
                            {blockRoom.occupied}/{blockRoom.total}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={block.is_active ? "default" : "secondary"}
                        >
                          {block.is_active ? "Active" : "Inactive"}
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
                              <Link to={`/hostel/blocks/${block.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {canUpdate && (
                              <DropdownMenuItem asChild>
                                <Link to={`/hostel/blocks/${block.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Block
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete(block)}
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
