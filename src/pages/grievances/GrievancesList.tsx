/**
 * Grievances List Page
 * =====================
 * Main page for viewing and managing parent-teacher grievances
 * Works for both parents and teachers with different views
 */

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  User,
  GraduationCap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useGrievances } from "./useGrievances";
import {
  GRIEVANCE_STATUSES,
  GRIEVANCE_PRIORITIES,
  GRIEVANCE_CATEGORIES,
  GrievanceStatus,
} from "./types";

interface GrievancesListProps {
  onCreateNew?: () => void;
}

export const GrievancesList = ({ onCreateNew }: GrievancesListProps = {}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { grievances, isLoading, isParent, isTeacher, isAdmin, refresh } =
    useGrievances();

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  // Filter grievances
  const filteredGrievances = grievances.filter((g) => {
    // Tab filter
    if (activeTab === "open" && !["Open", "In Progress"].includes(g.status))
      return false;
    if (activeTab === "resolved" && !["Resolved", "Closed"].includes(g.status))
      return false;
    if (activeTab === "escalated" && g.status !== "Escalated") return false;

    // Status filter
    if (selectedStatus !== "all" && g.status !== selectedStatus) return false;

    // Category filter
    if (selectedCategory !== "all" && g.category !== selectedCategory)
      return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        g.subject.toLowerCase().includes(query) ||
        g.grievance_number.toLowerCase().includes(query) ||
        g.student?.first_name?.toLowerCase().includes(query) ||
        g.student?.last_name?.toLowerCase().includes(query) ||
        (isParent && g.teacher?.first_name?.toLowerCase().includes(query)) ||
        (isTeacher && g.parent?.full_name?.toLowerCase().includes(query))
      );
    }

    return true;
  });

  // Stats
  const stats = {
    total: grievances.length,
    open: grievances.filter((g) => g.status === "Open").length,
    inProgress: grievances.filter((g) => g.status === "In Progress").length,
    resolved: grievances.filter((g) =>
      ["Resolved", "Closed"].includes(g.status)
    ).length,
    unread: grievances.reduce(
      (acc, g) => acc + (isParent ? g.unread_by_parent : g.unread_by_teacher),
      0
    ),
  };

  const getStatusColor = (status: GrievanceStatus) => {
    const config = GRIEVANCE_STATUSES.find((s) => s.value === status);
    return config?.color || "bg-gray-100 text-gray-700";
  };

  const getPriorityColor = (priority: string) => {
    const config = GRIEVANCE_PRIORITIES.find((p) => p.value === priority);
    return config?.color || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isParent ? "My Grievances" : "Parent Communications"}
          </h1>
          <p className="text-muted-foreground">
            {isParent
              ? "Communicate with teachers about your child"
              : "Manage parent grievances and communications"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          {isParent && onCreateNew && (
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              New Grievance
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg dark:bg-yellow-900">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.open + stats.inProgress}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.resolved}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-lg dark:bg-red-900">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.unread}</p>
                <p className="text-sm text-muted-foreground">Unread</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Active</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            {isAdmin && <TabsTrigger value="escalated">Escalated</TabsTrigger>}
          </TabsList>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search grievances..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-[250px]"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {GRIEVANCE_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {GRIEVANCE_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : filteredGrievances.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-lg font-medium">No grievances found</p>
                  <p className="text-muted-foreground">
                    {isParent
                      ? 'Click "New Grievance" to start a conversation with a teacher'
                      : "No parent communications to show"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>{isParent ? "Teacher" : "Parent"}</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGrievances.map((grievance) => {
                      const unread = isParent
                        ? grievance.unread_by_parent
                        : grievance.unread_by_teacher;

                      return (
                        <TableRow
                          key={grievance.id}
                          className={
                            unread > 0 ? "bg-blue-50 dark:bg-blue-950/20" : ""
                          }
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {unread > 0 && (
                                <span className="h-2 w-2 bg-blue-500 rounded-full" />
                              )}
                              <div>
                                <p className="font-medium">
                                  {grievance.subject}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {grievance.grievance_number}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {isParent
                                    ? grievance.teacher?.first_name?.[0]
                                    : grievance.parent?.full_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span>
                                {isParent
                                  ? `${grievance.teacher?.first_name} ${grievance.teacher?.last_name}`
                                  : grievance.parent?.full_name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-muted-foreground" />
                              {grievance.student?.first_name}{" "}
                              {grievance.student?.last_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {grievance.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getPriorityColor(grievance.priority)}
                            >
                              {grievance.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(grievance.status)}>
                              {grievance.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(
                                new Date(grievance.last_message_at),
                                {
                                  addSuffix: true,
                                }
                              )}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(`/grievances/${grievance.id}`)
                              }
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {unread > 0 ? `View (${unread})` : "View"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GrievancesList;
