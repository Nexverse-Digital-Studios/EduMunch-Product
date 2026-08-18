/**
 * Admission Application Detail Page - View and Process Applications
 *
 * Features:
 * - Complete applicant information
 * - Document verification
 * - Application timeline
 * - Interview scheduling
 * - Admission decision
 *
 * Note: Currently using demo data. Full Supabase integration pending.
 */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Building,
  Eye,
  Edit,
  Printer,
  MessageSquare,
  UserCheck,
  XCircle,
  FileCheck,
  Video,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

// Demo application data
const demoApplication = {
  id: "APP-2026-0042",
  status: "under_review",
  appliedFor: "Class 6",
  academicYear: "2026-27",
  submittedAt: "2025-12-20T10:30:00",
  lastUpdated: "2026-01-03T14:20:00",

  // Student Info
  student: {
    firstName: "Aryan",
    lastName: "Mehta",
    dob: "2014-08-25",
    gender: "Male",
    bloodGroup: "A+",
    nationality: "Indian",
    religion: "Hindu",
    category: "General",
    aadharNo: "XXXX-XXXX-4521",
    previousSchool: "Delhi Public School, Dwarka",
    previousClass: "Class 5",
    passingYear: "2025",
    percentage: 92.5,
  },

  // Parent Info
  parents: {
    father: {
      name: "Mr. Vikash Mehta",
      occupation: "Software Engineer",
      company: "Infosys Ltd.",
      phone: "+91 98765 43210",
      email: "vikash.mehta@email.com",
      qualification: "B.Tech",
      annualIncome: "₹18,00,000",
    },
    mother: {
      name: "Mrs. Priya Mehta",
      occupation: "Teacher",
      company: "Kendriya Vidyalaya",
      phone: "+91 87654 32109",
      email: "priya.mehta@email.com",
      qualification: "M.A., B.Ed",
      annualIncome: "₹8,00,000",
    },
  },

  // Address
  address: {
    current: "B-42, Sector 15, Rohini, New Delhi - 110085",
    permanent: "B-42, Sector 15, Rohini, New Delhi - 110085",
    sameAsCurrent: true,
  },

  // Documents
  documents: [
    { id: 1, name: "Birth Certificate", status: "verified", uploadedAt: "2025-12-20" },
    { id: 2, name: "Previous School TC", status: "verified", uploadedAt: "2025-12-20" },
    { id: 3, name: "Report Card (Class 5)", status: "verified", uploadedAt: "2025-12-20" },
    { id: 4, name: "Aadhar Card (Student)", status: "verified", uploadedAt: "2025-12-20" },
    { id: 5, name: "Aadhar Card (Father)", status: "pending", uploadedAt: "2025-12-20" },
    { id: 6, name: "Passport Photos", status: "verified", uploadedAt: "2025-12-20" },
    { id: 7, name: "Address Proof", status: "verified", uploadedAt: "2025-12-22" },
  ],

  // Timeline
  timeline: [
    { date: "2025-12-20", event: "Application Submitted", description: "Online application received", status: "completed" },
    { date: "2025-12-22", event: "Documents Uploaded", description: "All required documents submitted", status: "completed" },
    { date: "2025-12-28", event: "Document Verification", description: "Documents under review", status: "completed" },
    { date: "2026-01-05", event: "Entrance Test", description: "Scheduled for 10:00 AM", status: "upcoming" },
    { date: "2026-01-12", event: "Interview", description: "To be scheduled after test", status: "pending" },
    { date: "2026-01-20", event: "Final Decision", description: "Admission decision", status: "pending" },
  ],

  // Notes
  notes: [
    { id: 1, author: "Mrs. Sunita (Admissions)", date: "2025-12-28", text: "All documents verified. Student has excellent academic record." },
    { id: 2, author: "Mr. Sharma (Principal)", date: "2026-01-02", text: "Shortlisted for entrance test. Good profile." },
  ],
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700", icon: FileText },
  under_review: { label: "Under Review", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  documents_pending: { label: "Documents Pending", color: "bg-orange-100 text-orange-700", icon: AlertCircle },
  test_scheduled: { label: "Test Scheduled", color: "bg-purple-100 text-purple-700", icon: ClipboardCheck },
  interview_scheduled: { label: "Interview Scheduled", color: "bg-indigo-100 text-indigo-700", icon: Video },
  approved: { label: "Approved", color: "bg-green-100 text-green-700", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
  waitlisted: { label: "Waitlisted", color: "bg-gray-100 text-gray-700", icon: Clock },
};

const docStatusColors: Record<string, string> = {
  verified: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-700",
};

const timelineStatusColors: Record<string, string> = {
  completed: "bg-green-500",
  upcoming: "bg-blue-500",
  pending: "bg-gray-300",
};

export const AdmissionApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [actionNote, setActionNote] = useState("");

  const status = statusConfig[demoApplication.status];

  const handleAction = (action: string) => {
    setSelectedAction(action);
    setActionDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name.split(" ").filter(n => n.length > 0).slice(0, 2).map(n => n[0]).join("").toUpperCase();
  };

  const verifiedDocs = demoApplication.documents.filter(d => d.status === "verified").length;
  const totalDocs = demoApplication.documents.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={status.color}>
              <status.icon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
            <span className="text-sm text-muted-foreground">{demoApplication.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {demoApplication.student.firstName} {demoApplication.student.lastName}
          </h1>
          <p className="text-muted-foreground">
            Applying for {demoApplication.appliedFor} • Academic Year {demoApplication.academicYear}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => handleAction("approve")}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </Button>
          <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => handleAction("reject")}>
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Previous Class</p>
                <p className="font-medium">{demoApplication.student.previousClass}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Percentage</p>
                <p className="font-medium">{demoApplication.student.percentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Documents</p>
                <p className="font-medium">{verifiedDocs}/{totalDocs} Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Applied On</p>
                <p className="font-medium">{format(new Date(demoApplication.submittedAt), "MMM d, yyyy")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="student">Student Details</TabsTrigger>
          <TabsTrigger value="parents">Parent Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Student Summary */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Application Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {getInitials(`${demoApplication.student.firstName} ${demoApplication.student.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{demoApplication.student.firstName} {demoApplication.student.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">{format(new Date(demoApplication.student.dob), "MMMM d, yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Previous School</p>
                      <p className="font-medium">{demoApplication.student.previousSchool}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gender / Blood Group</p>
                      <p className="font-medium">{demoApplication.student.gender} / {demoApplication.student.bloodGroup}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Current Address</p>
                      <p className="font-medium">{demoApplication.address.current}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {demoApplication.notes.map(note => (
                  <div key={note.id} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{note.text}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {note.author} • {format(new Date(note.date), "MMM d, yyyy")}
                    </p>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  Add Note
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Parent Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Parent/Guardian Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Father</p>
                  <p className="font-medium text-lg">{demoApplication.parents.father.name}</p>
                  <p className="text-sm text-muted-foreground">{demoApplication.parents.father.occupation} at {demoApplication.parents.father.company}</p>
                  <div className="flex gap-4 mt-3">
                    <span className="text-sm flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {demoApplication.parents.father.phone}
                    </span>
                    <span className="text-sm flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {demoApplication.parents.father.email}
                    </span>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Mother</p>
                  <p className="font-medium text-lg">{demoApplication.parents.mother.name}</p>
                  <p className="text-sm text-muted-foreground">{demoApplication.parents.mother.occupation} at {demoApplication.parents.mother.company}</p>
                  <div className="flex gap-4 mt-3">
                    <span className="text-sm flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {demoApplication.parents.mother.phone}
                    </span>
                    <span className="text-sm flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {demoApplication.parents.mother.email}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="student" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">First Name</p>
                  <p className="font-medium">{demoApplication.student.firstName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Name</p>
                  <p className="font-medium">{demoApplication.student.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{format(new Date(demoApplication.student.dob), "MMMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{demoApplication.student.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <p className="font-medium">{demoApplication.student.bloodGroup}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nationality</p>
                  <p className="font-medium">{demoApplication.student.nationality}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Religion</p>
                  <p className="font-medium">{demoApplication.student.religion}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{demoApplication.student.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aadhar Number</p>
                  <p className="font-medium">{demoApplication.student.aadharNo}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Previous Education</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Previous School</p>
                  <p className="font-medium">{demoApplication.student.previousSchool}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Class Attended</p>
                  <p className="font-medium">{demoApplication.student.previousClass}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year of Passing</p>
                  <p className="font-medium">{demoApplication.student.passingYear}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Percentage Obtained</p>
                  <p className="font-medium text-green-600">{demoApplication.student.percentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Current Address</p>
                  <p className="font-medium flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    {demoApplication.address.current}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Permanent Address</p>
                  <p className="font-medium flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    {demoApplication.address.permanent}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Father's Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{demoApplication.parents.father.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Occupation</p>
                  <p className="font-medium">{demoApplication.parents.father.occupation}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Company/Organization</p>
                  <p className="font-medium">{demoApplication.parents.father.company}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Qualification</p>
                  <p className="font-medium">{demoApplication.parents.father.qualification}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Annual Income</p>
                  <p className="font-medium">{demoApplication.parents.father.annualIncome}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{demoApplication.parents.father.phone}</p>
                  <p className="text-sm text-muted-foreground">{demoApplication.parents.father.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mother's Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{demoApplication.parents.mother.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Occupation</p>
                  <p className="font-medium">{demoApplication.parents.mother.occupation}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Company/Organization</p>
                  <p className="font-medium">{demoApplication.parents.mother.company}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Qualification</p>
                  <p className="font-medium">{demoApplication.parents.mother.qualification}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Annual Income</p>
                  <p className="font-medium">{demoApplication.parents.mother.annualIncome}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{demoApplication.parents.mother.phone}</p>
                  <p className="text-sm text-muted-foreground">{demoApplication.parents.mother.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
              <CardDescription>
                {verifiedDocs} of {totalDocs} documents verified
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {demoApplication.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded on {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={docStatusColors[doc.status]}>
                        {doc.status === "verified" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {doc.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                        {doc.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download All Documents
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {demoApplication.timeline.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-8 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className={`h-4 w-4 rounded-full ${timelineStatusColors[item.status]}`} />
                      {index < demoApplication.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-muted mt-2" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-medium">{item.event}</p>
                        <Badge variant="outline" className="text-xs">
                          {item.status === "completed" ? "Completed" : item.status === "upcoming" ? "Upcoming" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(item.date), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
            <Button variant="outline">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Schedule Entrance Test
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAction === "approve" ? "Approve Application" : "Reject Application"}
            </DialogTitle>
            <DialogDescription>
              {selectedAction === "approve" 
                ? `This will approve the admission application for ${demoApplication.student.firstName} ${demoApplication.student.lastName} to ${demoApplication.appliedFor}.`
                : `This will reject the admission application for ${demoApplication.student.firstName} ${demoApplication.student.lastName}.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                {selectedAction === "approve" ? "Approval Note (Optional)" : "Rejection Reason"}
              </label>
              <Textarea 
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder={selectedAction === "approve" 
                  ? "Add any notes about this approval..." 
                  : "Please provide a reason for rejection..."
                }
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className={selectedAction === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              onClick={() => setActionDialogOpen(false)}
            >
              {selectedAction === "approve" ? "Confirm Approval" : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdmissionApplicationDetailPage;
