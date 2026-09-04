/**
 * LeaveManagement.tsx - Staff Leave Applications
 * 
 * Supabase Tables (Tier 2):
 * - staff_leave_applications_1EMAET: Leave requests
 * - teachers_1EMAET: Teacher info
 * - employees_1EMAET: Staff info
 * 
 * Schema Reference:
 * - employee_id, teacher_id, employee_type
 * - leave_type (Casual/Sick/Earned/Maternity/Paternity/LOP)
 * - from_date, to_date, total_days, reason
 * - status (Pending/Approved/Rejected)
 */
import { useState, useMemo } from "react";
import { Search, X, Check, Ban, Calendar, Loader2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const INDEX_TOKEN = import.meta.env.VITE_INDEX_TOKEN || '1emaet';

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  employee_code: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_code: string;
  designation: string;
}

interface LeaveApplication {
  id: string;
  employee_id: string | null;
  teacher_id: string | null;
  employee_type: 'Teacher' | 'Staff';
  leave_type: string;
  from_date: string;
  to_date: string;
  total_days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  teachers_1EMAET?: Teacher;
  employees_1EMAET?: Employee;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "Approved":
      return "bg-green-100 text-green-800 border-green-300";
    case "Rejected":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

const LeaveManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("start-new");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { canView, canUpdate } = useModulePermissions('HR');
  const { toast } = useToast();

  // Fetch leave applications with joins
  const { data: applications = [], isLoading, refetch, updateMutation } = useSupabaseTable<LeaveApplication>(
    `staff_leave_applications_${INDEX_TOKEN}`,
    { 
      select: `*, teachers_${INDEX_TOKEN}(id, first_name, last_name, employee_code), employees_${INDEX_TOKEN}(id, first_name, last_name, employee_code, designation)`,
      orderBy: { column: 'created_at', ascending: false }
    }
  );

  const handleApprove = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, updates: { status: 'Approved', approved_at: new Date().toISOString() } });
      toast({ title: "Success", description: "Leave application approved successfully" });
      refetch();
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, updates: { status: 'Rejected' } });
      toast({ title: "Success", description: "Leave application rejected successfully" });
      refetch();
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  const getEmployeeName = (app: LeaveApplication) => {
    if (app.employee_type === 'Teacher' && app[`teachers_${INDEX_TOKEN}`]) {
      const teacher = app[`teachers_${INDEX_TOKEN}`] as Teacher;
      return `${teacher.first_name} ${teacher.last_name}`;
    } else if (app[`employees_${INDEX_TOKEN}`]) {
      const employee = app[`employees_${INDEX_TOKEN}`] as Employee;
      return `${employee.first_name} ${employee.last_name}`;
    }
    return 'Unknown';
  };

  const getDesignation = (app: LeaveApplication) => {
    if (app.employee_type === 'Teacher') {
      return 'Teacher';
    } else if (app[`employees_${INDEX_TOKEN}`]) {
      const employee = app[`employees_${INDEX_TOKEN}`] as Employee;
      return employee.designation || 'Staff';
    }
    return 'Staff';
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const name = getEmployeeName(app).toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      const matchesType = leaveTypeFilter === "all" || app.leave_type === leaveTypeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [applications, searchQuery, statusFilter, leaveTypeFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setLeaveTypeFilter("all");
    setFromDate("");
    setToDate("");
    setSortBy("start-new");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Leave Applications</h1>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2 space-y-2">
            <Label className="text-muted-foreground text-sm">Search (name or ID)</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Leave Type</Label>
            <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Casual">Casual</SelectItem>
                <SelectItem value="Sick">Sick</SelectItem>
                <SelectItem value="Earned">Earned</SelectItem>
                <SelectItem value="Maternity">Maternity</SelectItem>
                <SelectItem value="Paternity">Paternity</SelectItem>
                <SelectItem value="LOP">LOP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">From</Label>
            <div className="relative">
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder="dd-mm-yyyy"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">To</Label>
            <div className="relative">
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                placeholder="dd-mm-yyyy"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 items-start sm:items-end justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Sort by</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="start-new">Start Date (new → old)</SelectItem>
                  <SelectItem value="start-old">Start Date (old → new)</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredApplications.length}</span> of <span className="font-medium text-foreground">{applications.length}</span>
          </p>
        </div>
      </div>

      {/* Leave Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application) => (
          <div key={application.id} className="bg-card border border-border rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-semibold text-foreground">{getEmployeeName(application)}</h3>
                  <Badge variant="outline" className={getStatusColor(application.status)}>
                    {application.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{getDesignation(application)}</p>

                <div className="pt-2 space-y-1">
                  <p className="text-sm text-foreground">
                    Type: <span className="font-medium">{application.leave_type}</span> ({application.total_days} days)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Dates: {format(new Date(application.from_date), 'MMM dd, yyyy')} to {format(new Date(application.to_date), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-sm text-foreground">
                    Reason: {application.reason}
                  </p>
                </div>
              </div>

              {application.status === "Pending" && canUpdate && (
                <div className="flex gap-2 self-start">
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleApprove(application.id)}
                    disabled={updateMutation.isPending}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleReject(application.id)}
                    disabled={updateMutation.isPending}
                  >
                    <Ban className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredApplications.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No leave applications found.</p>
        )}
      </div>
    </div>
  );
};

export default LeaveManagement;
