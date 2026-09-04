/**
 * Certificates Page - Certificate Generation & Management
 *
 * Features:
 * - Generate various certificate types
 * - Certificate templates management
 * - Bulk certificate generation
 * - Download and print certificates
 *
 * Note: Currently using demo data. Full Supabase integration pending.
 */
import { useState } from "react";
import {
  Award,
  Plus,
  Search,
  Download,
  Printer,
  Eye,
  MoreVertical,
  Edit,
  Trash2,
  FileText,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Filter,
  Copy,
  Send,
  GraduationCap,
  Medal,
  Trophy,
  Star,
  BookOpen,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { format } from "date-fns";

// Demo certificate types
const certificateTypes = [
  {
    id: 1,
    name: "Transfer Certificate",
    code: "TC",
    icon: FileText,
    color: "bg-blue-100 text-blue-600",
    description: "Issued when student transfers to another school",
    generated: 45,
  },
  {
    id: 2,
    name: "Character Certificate",
    code: "CC",
    icon: UserCheck,
    color: "bg-green-100 text-green-600",
    description: "Certificate of good conduct and character",
    generated: 120,
  },
  {
    id: 3,
    name: "Bonafide Certificate",
    code: "BC",
    icon: CheckCircle,
    color: "bg-purple-100 text-purple-600",
    description: "Proof of student enrollment",
    generated: 85,
  },
  {
    id: 4,
    name: "Merit Certificate",
    code: "MC",
    icon: Medal,
    color: "bg-yellow-100 text-yellow-600",
    description: "Awarded for academic excellence",
    generated: 62,
  },
  {
    id: 5,
    name: "Participation Certificate",
    code: "PC",
    icon: Trophy,
    color: "bg-orange-100 text-orange-600",
    description: "For event/competition participation",
    generated: 210,
  },
  {
    id: 6,
    name: "Completion Certificate",
    code: "COMP",
    icon: GraduationCap,
    color: "bg-indigo-100 text-indigo-600",
    description: "Course/Program completion",
    generated: 38,
  },
];

// Demo generated certificates
const demoCertificates = [
  {
    id: 1,
    certificateNo: "TC-2025-001",
    type: "Transfer Certificate",
    studentName: "Rahul Sharma",
    studentId: "STU001",
    class: "Class 10-A",
    generatedDate: "2025-12-28",
    status: "issued",
    issuedBy: "Principal",
  },
  {
    id: 2,
    certificateNo: "CC-2025-042",
    type: "Character Certificate",
    studentName: "Priya Patel",
    studentId: "STU002",
    class: "Class 12-B",
    generatedDate: "2025-12-27",
    status: "issued",
    issuedBy: "Vice Principal",
  },
  {
    id: 3,
    certificateNo: "MC-2025-015",
    type: "Merit Certificate",
    studentName: "Ananya Gupta",
    studentId: "STU003",
    class: "Class 10-A",
    generatedDate: "2025-12-25",
    status: "issued",
    issuedBy: "HOD",
  },
  {
    id: 4,
    certificateNo: "BC-2025-028",
    type: "Bonafide Certificate",
    studentName: "Vikram Singh",
    studentId: "STU004",
    class: "Class 8-C",
    generatedDate: "2025-12-30",
    status: "pending",
    issuedBy: null,
  },
  {
    id: 5,
    certificateNo: "PC-2025-089",
    type: "Participation Certificate",
    studentName: "Meera Reddy",
    studentId: "STU005",
    class: "Class 9-A",
    generatedDate: "2025-12-20",
    status: "issued",
    issuedBy: "Sports Teacher",
  },
];

const statusColors: Record<string, string> = {
  issued: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  draft: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};

export const CertificatesPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("certificates");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<typeof demoCertificates[0] | null>(null);

  const stats = {
    total: demoCertificates.length,
    issued: demoCertificates.filter(c => c.status === "issued").length,
    pending: demoCertificates.filter(c => c.status === "pending").length,
  };

  const filteredCertificates = demoCertificates.filter(cert => {
    const matchesSearch = cert.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.certificateNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || cert.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const handleGenerate = () => {
    toast({
      title: "Certificate generated",
      description: "Certificate has been generated successfully.",
    });
    setIsGenerateOpen(false);
  };

  const handlePreview = (cert: typeof demoCertificates[0]) => {
    setSelectedCertificate(cert);
    setIsPreviewOpen(true);
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Award className="h-6 w-6" />
            Certificates
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate and manage student certificates
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsGenerateOpen(true)} className="bg-primary">
            <Plus className="h-4 w-4 mr-2" />
            Generate Certificate
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{certificateTypes.reduce((acc, t) => acc + t.generated, 0)}</p>
                <p className="text-sm text-muted-foreground">Total Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.issued}</p>
                <p className="text-sm text-muted-foreground">Issued This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="certificates">Generated Certificates</TabsTrigger>
          <TabsTrigger value="types">Certificate Types</TabsTrigger>
        </TabsList>

        <TabsContent value="certificates" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student name or certificate number..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full lg:w-56">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {certificateTypes.map(type => (
                      <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Certificates Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificate No.</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertificates.map(cert => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-mono font-medium">{cert.certificateNo}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{cert.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {getInitials(cert.studentName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{cert.studentName}</p>
                            <p className="text-xs text-muted-foreground">{cert.studentId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{cert.class}</TableCell>
                      <TableCell>
                        {format(new Date(cert.generatedDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[cert.status]}>
                          {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handlePreview(cert)}>
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
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Send className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
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

        <TabsContent value="types" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificateTypes.map(type => (
              <Card key={type.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-lg ${type.color} flex items-center justify-center`}>
                      <type.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{type.name}</h3>
                        <Badge variant="secondary">{type.code}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                      <div className="flex items-center gap-2 mt-3 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{type.generated} generated</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Generate Certificate Modal */}
      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate Certificate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Certificate Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {certificateTypes.map(type => (
                    <SelectItem key={type.id} value={type.code}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Student</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Search and select student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STU001">Rahul Sharma - Class 10-A</SelectItem>
                  <SelectItem value="STU002">Priya Patel - Class 12-B</SelectItem>
                  <SelectItem value="STU003">Ananya Gupta - Class 10-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Issue Date</Label>
              <Input type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
            </div>
            <div className="space-y-2">
              <Label>Additional Notes (Optional)</Label>
              <Textarea placeholder="Any additional information to include..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} className="bg-primary">
              <Plus className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Certificate Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Certificate Preview</DialogTitle>
          </DialogHeader>
          {selectedCertificate && (
            <div className="py-4">
              {/* Certificate Preview */}
              <div className="border-4 border-double border-primary/30 p-8 bg-gradient-to-br from-white to-primary/5 rounded-lg">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <Award className="h-16 w-16 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-primary">
                      {selectedCertificate.type}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Certificate No: {selectedCertificate.certificateNo}
                    </p>
                  </div>
                  <Separator />
                  <div className="py-4">
                    <p className="text-muted-foreground">This is to certify that</p>
                    <h3 className="text-xl font-semibold mt-2">{selectedCertificate.studentName}</h3>
                    <p className="text-muted-foreground mt-1">of {selectedCertificate.class}</p>
                    <p className="text-muted-foreground mt-4">
                      has been a bonafide student of this institution.
                    </p>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-end pt-4">
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground">Date of Issue</p>
                      <p className="font-medium">
                        {format(new Date(selectedCertificate.generatedDate), "MMMM d, yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="border-t border-gray-400 pt-1 px-8">
                        <p className="text-sm text-muted-foreground">Principal</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button className="bg-primary">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CertificatesPage;
