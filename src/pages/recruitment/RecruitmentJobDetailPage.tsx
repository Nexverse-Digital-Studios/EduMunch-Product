/**
 * Recruitment Job Detail Page - Individual Job Posting View
 *
 * Features:
 * - View full job details
 * - Manage applicants for this job
 * - Track hiring pipeline
 * - Edit job posting
 *
 * Note: Currently using demo data. Full Supabase integration pending.
 */
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";
import {
  Briefcase,
  ArrowLeft,
  Edit,
  Trash2,
  Share2,
  MapPin,
  Clock,
  Calendar,
  Users,
  UserCheck,
  MessageSquare,
  Star,
  Eye,
  MoreVertical,
  Mail,
  Phone,
  FileText,
  XCircle,
  CheckCircle,
  Building2,
  Banknote,
  ExternalLink,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

// Demo job data
const demoJob = {
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
  description:
    "Looking for an experienced Mathematics teacher for Classes 9-12 with expertise in JEE/NEET preparation.",
  responsibilities: [
    "Teach Mathematics to Classes 9-12",
    "Prepare students for competitive exams (JEE/NEET)",
    "Develop and implement curriculum",
    "Conduct regular assessments and provide feedback",
    "Participate in parent-teacher meetings",
    "Mentor junior teachers",
  ],
  requirements: [
    "M.Sc in Mathematics with B.Ed",
    "Minimum 5 years teaching experience",
    "Experience with competitive exam preparation",
    "Strong communication skills",
    "Proficiency in digital teaching tools",
  ],
  benefits: [
    "Competitive salary package",
    "Health insurance",
    "Professional development opportunities",
    "Annual performance bonus",
    "Transportation allowance",
  ],
};

// Demo applicants for this job
const demoApplicants = [
  {
    id: 1,
    name: "Dr. Ankit Mehta",
    email: "ankit.mehta@email.com",
    phone: "+91 98765 43210",
    experience: "8 years",
    qualification: "M.Sc Mathematics, B.Ed",
    appliedDate: "2025-12-05",
    status: "interviewed",
    rating: 4.5,
    notes: "Strong candidate with JEE coaching experience",
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "+91 87654 32109",
    experience: "6 years",
    qualification: "M.Sc Mathematics",
    appliedDate: "2025-12-08",
    status: "shortlisted",
    rating: 4.0,
    notes: "Good communication skills",
  },
  {
    id: 3,
    name: "Rahul Verma",
    email: "rahul.v@email.com",
    phone: "+91 76543 21098",
    experience: "5 years",
    qualification: "M.Sc Mathematics, Ph.D (pursuing)",
    appliedDate: "2025-12-12",
    status: "new",
    rating: 0,
    notes: "",
  },
  {
    id: 4,
    name: "Meera Reddy",
    email: "meera.r@email.com",
    phone: "+91 54321 09876",
    experience: "7 years",
    qualification: "M.Sc Mathematics, M.Ed",
    appliedDate: "2025-12-10",
    status: "rejected",
    rating: 2.5,
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

export const RecruitmentJobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "details";

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };
  const [isApplicantViewOpen, setIsApplicantViewOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<
    (typeof demoApplicants)[0] | null
  >(null);

  const stats = {
    total: demoApplicants.length,
    new: demoApplicants.filter((a) => a.status === "new").length,
    shortlisted: demoApplicants.filter((a) => a.status === "shortlisted")
      .length,
    interviewed: demoApplicants.filter((a) => a.status === "interviewed")
      .length,
    rejected: demoApplicants.filter((a) => a.status === "rejected").length,
  };

  const handleViewApplicant = (applicant: (typeof demoApplicants)[0]) => {
    setSelectedApplicant(applicant);
    setIsApplicantViewOpen(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Job posting link has been copied to clipboard.",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating: number) => {
    if (rating === 0)
      return <span className="text-sm text-muted-foreground">Not rated</span>;
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
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/recruitment")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              {demoJob.title}
            </h1>
            <Badge className={statusColors[demoJob.status]}>
              {demoJob.status.charAt(0).toUpperCase() + demoJob.status.slice(1)}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {demoJob.department}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {demoJob.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {demoJob.type}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Posted {formatDistanceToNow(new Date(demoJob.postedDate))} ago
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Public Page
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Applicants</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
            <p className="text-sm text-muted-foreground">New</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {stats.shortlisted}
            </p>
            <p className="text-sm text-muted-foreground">Shortlisted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {stats.interviewed}
            </p>
            <p className="text-sm text-muted-foreground">Interviewed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="details">Job Details</TabsTrigger>
          <TabsTrigger value="applicants">
            Applicants ({stats.total})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{demoJob.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {demoJob.responsibilities.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {demoJob.requirements.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-1 shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Job Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Banknote className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Salary</p>
                      <p className="font-medium">{demoJob.salary}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Experience
                      </p>
                      <p className="font-medium">{demoJob.experience}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Deadline</p>
                      <p className="font-medium">
                        {format(new Date(demoJob.deadline), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {demoJob.benefits.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Star className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="applicants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Applicants</CardTitle>
              <CardDescription>
                Manage applicants for this position
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoApplicants.map((applicant) => (
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
                            <p className="text-xs text-muted-foreground">
                              {applicant.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {applicant.qualification}
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
                          {applicant.status.charAt(0).toUpperCase() +
                            applicant.status.slice(1)}
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
                              <DropdownMenuItem>
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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
                  <h3 className="font-semibold text-lg">
                    {selectedApplicant.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedApplicant.qualification}
                  </p>
                  <Badge
                    className={`mt-1 ${statusColors[selectedApplicant.status]}`}
                  >
                    {selectedApplicant.status.charAt(0).toUpperCase() +
                      selectedApplicant.status.slice(1)}
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
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Applied on:{" "}
                    {format(
                      new Date(selectedApplicant.appliedDate),
                      "MMMM d, yyyy"
                    )}
                  </span>
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
            <Button
              variant="outline"
              onClick={() => setIsApplicantViewOpen(false)}
            >
              Close
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <UserCheck className="h-4 w-4 mr-2" />
              Shortlist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecruitmentJobDetailPage;
