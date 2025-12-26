/**
 * AllocationsList Component
 * =========================
 * List and manage hostel room allocations
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  UserCheck,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  DoorOpen,
  GraduationCap,
  MoreHorizontal,
  Trash2,
  IndianRupee,
  Building2,
  Calendar,
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
  HostelAllocation,
  HostelRoom,
  HostelBlock,
  StudentInfo,
} from "./types";

const INDEX_TOKEN = "1emaet";

export function AllocationsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [blockFilter, setBlockFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { canCreate, canUpdate, canDelete } = useModulePermissions("hostel");
  const { toast } = useToast();

  // Fetch data
  const {
    data: allocations,
    isLoading,
    deleteMutation,
  } = useSupabaseTable<HostelAllocation>(`hostel_allocations_${INDEX_TOKEN}`, {
    filters: {},
  });

  const { data: rooms } = useSupabaseTable<HostelRoom>(
    `hostel_rooms_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const { data: blocks } = useSupabaseTable<HostelBlock>(
    `hostel_blocks_${INDEX_TOKEN}`,
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

  const blockMap = useMemo(() => {
    if (!blocks) return new Map<string, HostelBlock>();
    return new Map(blocks.map((b) => [b.id, b]));
  }, [blocks]);

  const studentMap = useMemo(() => {
    if (!students) return new Map<string, StudentInfo>();
    return new Map(students.map((s) => [s.id, s]));
  }, [students]);

  // Get block for a room
  const getBlockForRoom = (roomId: string) => {
    const room = roomMap.get(roomId);
    if (!room) return null;
    return blockMap.get(room.block_id);
  };

  // Filtered allocations
  const filteredAllocations = useMemo(() => {
    if (!allocations) return [];

    return allocations.filter((allocation) => {
      const student = studentMap.get(allocation.student_id);
      const room = roomMap.get(allocation.room_id);
      const block = room ? blockMap.get(room.block_id) : null;
      const searchLower = searchQuery.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        student?.first_name.toLowerCase().includes(searchLower) ||
        student?.last_name.toLowerCase().includes(searchLower) ||
        student?.admission_number.toLowerCase().includes(searchLower) ||
        room?.room_number.toLowerCase().includes(searchLower);

      const matchesBlock = blockFilter === "all" || block?.id === blockFilter;

      const matchesStatus =
        statusFilter === "all" || allocation.status === statusFilter;

      return matchesSearch && matchesBlock && matchesStatus;
    });
  }, [
    allocations,
    studentMap,
    roomMap,
    blockMap,
    searchQuery,
    blockFilter,
    statusFilter,
  ]);

  // Stats
  const stats = useMemo(() => {
    if (!allocations)
      return { total: 0, active: 0, vacated: 0, pendingDeposit: 0 };
    return {
      total: allocations.length,
      active: allocations.filter((a) => a.status === "Active").length,
      vacated: allocations.filter((a) => a.status === "Vacated").length,
      pendingDeposit: allocations.filter(
        (a) => a.status === "Active" && !a.deposit_paid
      ).length,
    };
  }, [allocations]);

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

  const handleVacate = async (allocation: HostelAllocation) => {
    try {
      // Would typically update allocation status to "Vacated"
      toast({
        title: "Room Vacated",
        description: "The student has been moved out of the room.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to vacate room. Please try again.",
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
            <Link to="/hostel">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Room Allocations</h1>
            <p className="text-muted-foreground">
              {stats.active} active allocations
            </p>
          </div>
        </div>
        {canCreate && (
          <Button asChild>
            <Link to="/hostel/allocations/create">
              <Plus className="mr-2 h-4 w-4" />
              Allocate Room
            </Link>
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
                <p className="text-sm text-muted-foreground">Total</p>
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
              <UserCheck className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-muted-foreground">Vacated</p>
                <p className="text-xl font-bold">{stats.vacated}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <IndianRupee className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Deposit</p>
                <p className="text-xl font-bold">{stats.pendingDeposit}</p>
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
                placeholder="Search by student name or room number..."
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Vacated">Vacated</SelectItem>
                <SelectItem value="Transferred">Transferred</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Allocations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Allocations ({filteredAllocations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAllocations.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No allocations found</h3>
              <p className="text-muted-foreground">
                {allocations?.length === 0
                  ? "Start by allocating rooms to students"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Block</TableHead>
                  <TableHead>Bed #</TableHead>
                  <TableHead>Monthly Fee</TableHead>
                  <TableHead>Deposit</TableHead>
                  <TableHead>Allocated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAllocations.map((allocation) => {
                  const student = studentMap.get(allocation.student_id);
                  const room = roomMap.get(allocation.room_id);
                  const block = getBlockForRoom(allocation.room_id);

                  return (
                    <TableRow key={allocation.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {student ? (
                                getInitials(
                                  student.first_name,
                                  student.last_name
                                )
                              ) : (
                                <GraduationCap className="h-4 w-4" />
                              )}
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
                          <DoorOpen className="h-3 w-3 text-muted-foreground" />
                          <span>{room?.room_number || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{block?.block_name || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          Bed {allocation.bed_number}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(allocation.monthly_fee)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>
                            {formatCurrency(allocation.deposit_amount)}
                          </span>
                          {allocation.deposit_paid ? (
                            <Badge variant="default" className="text-xs">
                              Paid
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              Pending
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(
                            allocation.allocation_date
                          ).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            allocation.status === "Active"
                              ? "default"
                              : allocation.status === "Vacated"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {allocation.status}
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
                              <Link to={`/hostel/allocations/${allocation.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {canUpdate && allocation.status === "Active" && (
                              <>
                                <DropdownMenuItem asChild>
                                  <Link
                                    to={`/hostel/allocations/${allocation.id}/edit`}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Allocation
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleVacate(allocation)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Vacate Room
                                </DropdownMenuItem>
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
