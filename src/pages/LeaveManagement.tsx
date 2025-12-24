import { useState } from "react";
import { Search, X, Check, Ban, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

interface LeaveApplication {
  id: number;
  employeeName: string;
  designation: string;
  leaveType: string;
  days: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  deductedAs?: string;
}

const leaveApplications: LeaveApplication[] = [
  { id: 1, employeeName: "Ramswaroop Chaudhary", designation: "Maths Faculty", leaveType: "CASUAL", days: 4, startDate: "12/30/2025", endDate: "1/2/2026", reason: "Going out", status: "PENDING" },
  { id: 2, employeeName: "Ramswaroop Chaudhary", designation: "Maths Faculty", leaveType: "CASUAL", days: 2, startDate: "11/30/2025", endDate: "12/1/2025", reason: "Not available", status: "APPROVED", deductedAs: "UNPAID" },
  { id: 3, employeeName: "Ramswaroop Chaudhary", designation: "Maths Faculty", leaveType: "CASUAL", days: 3, startDate: "11/28/2025", endDate: "11/30/2025", reason: "Trip", status: "PENDING" },
  { id: 4, employeeName: "Ramswaroop Chaudhary", designation: "Maths Faculty", leaveType: "CASUAL", days: 2, startDate: "11/25/2025", endDate: "11/26/2025", reason: "Personal work", status: "APPROVED", deductedAs: "CASUAL" },
  { id: 5, employeeName: "Aniket Singh", designation: "Biology Faculty", leaveType: "SICK", days: 3, startDate: "11/20/2025", endDate: "11/22/2025", reason: "Medical appointment", status: "APPROVED" },
  { id: 6, employeeName: "Kumar Ahire", designation: "Physics Faculty", leaveType: "CASUAL", days: 1, startDate: "11/18/2025", endDate: "11/18/2025", reason: "Family function", status: "REJECTED" },
];

const getStatusColor = (status: LeaveStatus) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "APPROVED":
      return "bg-green-100 text-green-800 border-green-300";
    case "REJECTED":
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

  const filteredApplications = leaveApplications.filter((app) => {
    const matchesSearch = app.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesType = leaveTypeFilter === "all" || app.leaveType === leaveTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setLeaveTypeFilter("all");
    setFromDate("");
    setToDate("");
    setSortBy("start-new");
  };

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
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
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
                <SelectItem value="CASUAL">Casual</SelectItem>
                <SelectItem value="SICK">Sick</SelectItem>
                <SelectItem value="UNPAID">Unpaid</SelectItem>
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
            Showing <span className="font-medium text-foreground">{filteredApplications.length}</span> of <span className="font-medium text-foreground">{leaveApplications.length}</span>
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
                  <h3 className="text-lg font-semibold text-foreground">{application.employeeName}</h3>
                  <Badge variant="outline" className={getStatusColor(application.status)}>
                    {application.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{application.designation}</p>

                <div className="pt-2 space-y-1">
                  <p className="text-sm text-foreground">
                    Type: <span className="font-medium">{application.leaveType}</span> ({application.days} days)
                  </p>
                  {application.deductedAs && (
                    <p className="text-sm text-foreground">
                      Deducted as: <span className="font-medium">{application.deductedAs}</span>
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Dates: {application.startDate} to {application.endDate}
                  </p>
                  <p className="text-sm text-foreground">
                    Reason: {application.reason}
                  </p>
                </div>
              </div>

              {application.status === "PENDING" && (
                <div className="flex gap-2 self-start">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive">
                    <Ban className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveManagement;
