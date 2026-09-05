import { useState } from "react";
import { Plus, Download, Filter, ChevronDown, ChevronUp, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NewAdmissionModal } from "@/components/admissions/NewAdmissionModal";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Admission {
  id: string;
  name: string;
  admissionId: string;
  branch: string;
  course: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  admissionDate: string;
  school: string;
  avatar?: string;
}

const admissionsData: Admission[] = [];

const Admissions = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [showNewAdmission, setShowNewAdmission] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter states
  const [filters, setFilters] = useState({
    studentName: "",
    studentEmail: "",
    admissionId: "",
    branch: "all",
    course: "all",
    school: "all",
    status: "all",
  });

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
          Admission Management
        </h1>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => setShowNewAdmission(true)} className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            New Admission
          </Button>
          <Button variant="outline" className="gap-2 w-full sm:w-auto">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Visible to Excel</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search Name, Email, Admission ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="default"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 w-full lg:w-auto"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 grid gap-4 border-t border-border pt-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Student Name</label>
              <Input
                placeholder="Enter name"
                value={filters.studentName}
                onChange={(e) => setFilters({ ...filters, studentName: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Student Email</label>
              <Input
                placeholder="Enter email"
                value={filters.studentEmail}
                onChange={(e) => setFilters({ ...filters, studentEmail: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Admission ID</label>
              <Input
                placeholder="Enter ID"
                value={filters.admissionId}
                onChange={(e) => setFilters({ ...filters, admissionId: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Branch</label>
              <Select value={filters.branch} onValueChange={(v) => setFilters({ ...filters, branch: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="thane">Thane HO Branch</SelectItem>
                  <SelectItem value="palava">Palava Branch</SelectItem>
                  <SelectItem value="manpada">Manpada Branch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Course</label>
              <Select value={filters.course} onValueChange={(v) => setFilters({ ...filters, course: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="jee">JEE Foundation</SelectItem>
                  <SelectItem value="neet">NEET Foundation</SelectItem>
                  <SelectItem value="cet">CET 1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tie-Up School</label>
              <Select value={filters.school} onValueChange={(v) => setFilters({ ...filters, school: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Schools" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  <SelectItem value="nalanda">Nalanda Group of schools</SelectItem>
                  <SelectItem value="saint-maria">Saint Maria School</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Status</label>
              <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button className="gap-2 flex-1">
                <Filter className="h-4 w-4" />
                Apply
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setFilters({
                studentName: "",
                studentEmail: "",
                admissionId: "",
                branch: "all",
                course: "all",
                school: "all",
                status: "all",
              })}>
                Reset
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Table - Mobile Cards / Desktop Table */}
      <Card className="overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Admission ID</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admission Date</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admissionsData.map((admission) => (
                  <TableRow key={admission.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={admission.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {admission.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{admission.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">{admission.admissionId}</TableCell>
                    <TableCell>{admission.branch}</TableCell>
                    <TableCell>{admission.course}</TableCell>
                    <TableCell>
                      <Badge variant={admission.status === "ACTIVE" ? "default" : "secondary"}>
                        {admission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{admission.admissionDate}</TableCell>
                    <TableCell className="text-muted-foreground">{admission.school || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-border">
          {admissionsData.map((admission) => (
            <div key={admission.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={admission.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {admission.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{admission.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">{admission.admissionId}</p>
                  </div>
                </div>
                <Badge variant={admission.status === "ACTIVE" ? "default" : "secondary"}>
                  {admission.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Branch</p>
                  <p className="font-medium">{admission.branch}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Course</p>
                  <p className="font-medium">{admission.course}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{admission.admissionDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">School</p>
                  <p className="font-medium">{admission.school || "-"}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* New Admission Modal */}
      <NewAdmissionModal open={showNewAdmission} onOpenChange={setShowNewAdmission} />
    </div>
  );
};

export default Admissions;
