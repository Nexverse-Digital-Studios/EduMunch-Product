/**
 * Recruitment Page - Job Postings & Applicant Tracking
 *
 * Features:
 * - Create and manage job postings
 * - Track applicants through hiring pipeline
 * - Schedule interviews
 * - Manage candidate communications
 *
 * Note: Currently using demo data. Full Supabase integration pending.
 */
import { useState } from "react";
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  Download,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  Eye,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  FileText,
  ChevronRight,
  Building2,
  IndianRupee,
  ExternalLink,
  Filter,
  Star,
  MessageSquare,
  UserCheck,
  XCircle,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";

// Demo job postings data
const demoJobs = [
  {
    id: 1,
    title: "Senior Mathematics Teacher",
    department: "Teaching",
    location: "Main Campus",
    type: "Full-time",
    experience: "5+ years",
    salary: "₹45,000 - ₹60,000",
    postedDate: "2025-12-01",
    deadline: "2026-01-15",
    status: "active",
    applicants: 24,
    shortlisted: 8,
    interviewed: 4,
    description: "Looking for an experienced Mathematics teacher for Classes 9-12 with expertise in JEE/NEET preparation.",
  },
  {
    id: 2,
    title: "Science Lab Assistant",
    department: "Support",
    location: "Science Block",
    type: "Full-time",
    experience: "2+ years",
    salary: "₹20,000 - ₹28,000",
    postedDate: "2025-12-10",
    deadline: "2026-01-20",
    status: "active",
    applicants: 15,
    shortlisted: 5,
    interviewed: 2,
    description: "Required for managing Physics and Chemistry lab equipment and assisting in practical sessions.",
  },
  {
    id: 3,
    title: "Administrative Officer",
    department: "Administration",
    location: "Admin Block",
    type: "Full-time",
    experience: "3+ years",
    salary: "₹30,000 - ₹40,000",
    postedDate: "2025-11-15",
    deadline: "2025-12-31",
    status: "closed",
    applicants: 32,
    shortlisted: 10,
    interviewed: 6,
    description: "Experienced administrative professional to oversee daily operations and manage office workflow.",
  },
  {
    id: 4,
    title: "English Teacher",
    department: "Teaching",
    location: "Main Campus",
    type: "Full-time",
    experience: "3+ years",
    salary: "₹35,000 - ₹45,000",
    postedDate: "2025-12-20",
    deadline: "2026-01-30",
    status: "active",
    applicants: 18,
    shortlisted: 6,
    interviewed: 0,
    description: "Seeking an English teacher for Classes 6-10 with strong communication skills and creative teaching methods.",
  },
];

// Demo applicants data
const demoApplicants = [
  {
    id: 1,
    jobId: 1,
    name: "Dr. Ankit Mehta",
    email: "ankit.mehta@email.com",
    phone: "+91 98765 43210",
    experience: "8 years",
    qualification: "M.Sc Mathematics, B.Ed",
    appliedDate: "2025-12-05",
    status: "interviewed",
    rating: 4.5,
    resume: "resume_ankit.pdf",
    notes: "Strong candidate with JEE coaching experience",
  },
  {
    id: 2,
    jobId: 1,
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "+91 87654 32109",
    experience: "6 years",
    qualification: "M.Sc Mathematics",
    appliedDate: "2025-12-08",
    status: "shortlisted",
    rating: 4.0,
    resume: "resume_priya.pdf",
    notes: "Good communication skills",
  },
  {
    id: 3,
    jobId: 1,
    name: "Rahul Verma",
    email: "rahul.v@email.com",
    phone: "+91 76543 21098",
    experience: "5 years",
    qualification: "M.Sc Mathematics, Ph.D (pursuing)",
    appliedDate: "2025-12-12",
    status: "new",
    rating: 0,
    resume: "resume_rahul.pdf",
    notes: "",
  },
  {
    id: 4,
    jobId: 2,
    name: "Suresh Kumar",
    email: "suresh.k@email.com",
    phone: "+91 65432 10987",
    experience: "3 years",
    qualification: "B.Sc Chemistry",
    appliedDate: "2025-12-15",
    status: "shortlisted",
    rating: 3.5,
    resume: "resume_suresh.pdf",
    notes: "Previous experience in school lab",
  },
  {
    id: 5,
    jobId: 1,
    name: "Meera Reddy",
    email: "meera.r@email.com",
    phone: "+91 54321 09876",
    experience: "7 years",
    qualification: "M.Sc Mathematics, M.Ed",
    appliedDate: "2025-12-10",
    status: "rejected",
    rating: 2.5,
    resume: "resume_meera.pdf",
    notes: "Not suitable for senior classes",
  },
];

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
  draft: "bg-yellow-100 text-yellow-700",
  new: "bg-blue-100 text-blue-700",
  shortlisted: "bg-purple-100 text-purple-700",
  interviewed: "bg-indigo-100 text-indigo-700",
  offered: "bg-emerald-100 text-emerald-700",
  hired: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const pipelineStages = ["new", "shortlisted", "interviewed", "offered", "hired"];

export const RecruitmentPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("jobs");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedJob, setSelectedJob] = useState<typeof demoJobs[0] | null>(null);
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [isApplicantViewOpen, setIsApplicantViewOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<typeof demoApplicants[0] | null>(null);

  const stats = {
    activeJobs: demoJobs.filter(j => j.status === "active").length,
    totalApplicants: demoApplicants.length,
    shortlisted: demoApplicants.filter(a => a.status === "shortlisted").length,
    interviewed: demoApplicants.filter(a => a.status === "interviewed").length,
  };

  const filteredJobs = demoJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || job.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateJob = () => {
    toast({
      title: "Job posted",
      description: "New job posting has been created successfully.",
    });
    setIsNewJobOpen(false);
  };

  const handleViewApplicant = (applicant: typeof demoApplicants[0]) => {
    setSelectedApplicant(applicant);
    setIsApplicantViewOpen(true);
  };

  const handleUpdateStatus = (applicantId: number, newStatus: string) => {
    toast({
      title: "Status updated",
      description: `Applicant status changed to ${newStatus}.`,
    });
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const renderStars = (rating: number) => {
    if (rating === 0) return <span className="text-sm text-muted-foreground">Not rated</span>;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            Recruitment
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage job postings and track applicants
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsNewJobOpen(true)} className="bg-primary">
            <Plus className="h-4 w-4 mr-2" />
            Post Job
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeJobs}</p>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalApplicants}</p>
                <p className="text-sm text-muted-foreground">Applicants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.shortlisted}</p>
                <p className="text-sm text-muted-foreground">Shortlisted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.interviewed}</p>
                <p className="text-sm text-muted-foreground">Interviewed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
          <TabsTrigger value="applicants">All Applicants</TabsTrigger>
          <TabsTrigger value="pipeline">Hiring Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search job postings..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full lg:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Jobs List */}
          <div className="grid gap-4">
            {filteredJobs.map(job => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {job.department}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {job.type}
                            </span>
                            <span className="flex items-center gap-1">
                              <Banknote className="h-4 w-4" />
                              {job.salary}
                            </span>
                          </div>
                        </div>
                        <Badge className={statusColors[job.status]}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span><strong>{job.applicants}</strong> Applicants</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <UserCheck className="h-4 w-4 text-purple-600" />
                          <span><strong>{job.shortlisted}</strong> Shortlisted</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MessageSquare className="h-4 w-4 text-indigo-600" />
                          <span><strong>{job.interviewed}</strong> Interviewed</span>
                        </div>
                        <Separator orientation="vertical" className="h-4" />
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Posted {formatDistanceToNow(new Date(job.postedDate))} ago</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Deadline: {format(new Date(job.deadline), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedJob(job)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Job
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Share Link
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Close Job
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="applicants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Applicants</CardTitle>
              <CardDescription>Track and manage all job applicants</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoApplicants.map(applicant => {
                    const job = demoJobs.find(j => j.id === applicant.jobId);
                    return (
                      <TableRow key={applicant.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {getInitials(applicant.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{applicant.name}</p>
                              <p className="text-xs text-muted-foreground">{applicant.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{job?.title}</p>
                        </TableCell>
                        <TableCell>{applicant.experience}</TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {format(new Date(applicant.appliedDate), "MMM d")}
                          </span>
                        </TableCell>
                        <TableCell>{renderStars(applicant.rating)}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[applicant.status]}>
                            {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewApplicant(applicant)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleUpdateStatus(applicant.id, "shortlisted")}>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Shortlist
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Schedule Interview
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <div className="grid grid-cols-5 gap-4">
            {pipelineStages.map(stage => {
              const stageApplicants = demoApplicants.filter(a => a.status === stage);
              return (
                <Card key={stage} className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="capitalize">{stage}</span>
                      <Badge variant="secondary">{stageApplicants.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {stageApplicants.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No applicants
                      </p>
                    ) : (
                      stageApplicants.map(applicant => (
                        <Card 
                          key={applicant.id} 
                          className="cursor-pointer hover:shadow-sm"
                          onClick={() => handleViewApplicant(applicant)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                  {getInitials(applicant.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{applicant.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {demoJobs.find(j => j.id === applicant.jobId)?.title}
                                </p>
                              </div>
                            </div>
                            {applicant.rating > 0 && (
                              <div className="mt-2">
                                {renderStars(applicant.rating)}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* View Applicant Modal */}
      <Dialog open={isApplicantViewOpen} onOpenChange={setIsApplicantViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Applicant Details</DialogTitle>
          </DialogHeader>
          {selectedApplicant && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {getInitials(selectedApplicant.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedApplicant.name}</h3>
                  <p className="text-muted-foreground">{selectedApplicant.qualification}</p>
                  <Badge className={`mt-1 ${statusColors[selectedApplicant.status]}`}>
                    {selectedApplicant.status.charAt(0).toUpperCase() + selectedApplicant.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedApplicant.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedApplicant.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedApplicant.experience} experience</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>Applied for: {demoJobs.find(j => j.id === selectedApplicant.jobId)?.title}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Applied on: {format(new Date(selectedApplicant.appliedDate), "MMMM d, yyyy")}</span>
                </div>
              </div>

              {selectedApplicant.rating > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Rating</p>
                  {renderStars(selectedApplicant.rating)}
                </div>
              )}

              {selectedApplicant.notes && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{selectedApplicant.notes}</p>
                </div>
              )}

              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                View Resume
              </Button>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsApplicantViewOpen(false)}>
              Close
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <UserCheck className="h-4 w-4 mr-2" />
              Shortlist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Job Modal */}
      <Dialog open={isNewJobOpen} onOpenChange={setIsNewJobOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Post New Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input placeholder="e.g., Senior Mathematics Teacher" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teaching">Teaching</SelectItem>
                    <SelectItem value="admin">Administration</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="accounts">Accounts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="e.g., Main Campus" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Experience Required</Label>
                <Input placeholder="e.g., 3+ years" />
              </div>
              <div className="space-y-2">
                <Label>Salary Range</Label>
                <Input placeholder="e.g., ₹35,000 - ₹45,000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Application Deadline</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Job Description</Label>
              <Textarea placeholder="Describe the role and requirements..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewJobOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateJob} className="bg-primary">
              <Plus className="h-4 w-4 mr-2" />
              Post Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecruitmentPage;
