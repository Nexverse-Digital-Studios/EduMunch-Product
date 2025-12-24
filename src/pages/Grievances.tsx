/**
 * Grievances Page - Parent Grievance Management
 * 
 * TODO: This feature requires a grievances table to be added to the Tier 2 schema.
 * Suggested schema:
 * 
 * CREATE TABLE grievances_1EMAET (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   grievance_number VARCHAR(50) UNIQUE NOT NULL,
 *   parent_id UUID NOT NULL REFERENCES parents_1EMAET(id),
 *   student_id UUID REFERENCES students_1EMAET(id),
 *   subject VARCHAR(255) NOT NULL,
 *   description TEXT NOT NULL,
 *   category VARCHAR(50) CHECK (category IN ('Academic', 'Administrative', 'Transport', 'Fee', 'Other')),
 *   priority VARCHAR(20) DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
 *   status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved', 'Closed')),
 *   assigned_to UUID REFERENCES users_1EMAET(id),
 *   attachment_url TEXT,
 *   resolution_notes TEXT,
 *   resolved_at TIMESTAMP,
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   updated_at TIMESTAMP DEFAULT NOW()
 * );
 */

import { useState } from "react";
import { Search, RefreshCw, User, Phone, Users, MapPin, Paperclip, Clock, X, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useModulePermissions } from "@/contexts/PermissionContext";

type GrievanceStatus = "Pending" | "In Progress" | "Closed" | "Resolved";

interface Grievance {
  id: number;
  parent: string;
  phone: string;
  subject: string;
  dateSubmitted: string;
  status: GrievanceStatus;
  children: string;
  branches: string;
  description: string;
  attachments: string[];
}

const grievances: Grievance[] = [
  { id: 8, parent: "Soham Kalani", phone: "9898989898", subject: "Notes", dateSubmitted: "12/10/2025, 12:38:26 AM", status: "Pending", children: "Kumar Kalani, Rajesh Kalani", branches: "No branch info", description: "child did not receive any notes for the jee prep", attachments: ["/placeholder.svg"] },
  { id: 7, parent: "Soham Kalani", phone: "9898989898", subject: "Attention", dateSubmitted: "11/25/2025, 2:29:23 PM", status: "In Progress", children: "Kumar Kalani", branches: "Thane Branch", description: "Need more attention on child's progress", attachments: [] },
  { id: 6, parent: "Soham Kalani", phone: "9898989898", subject: "Sitting arrangement in class", dateSubmitted: "11/25/2025, 2:03:20 PM", status: "Closed", children: "Kumar Kalani", branches: "Thane Branch", description: "Sitting arrangement needs improvement", attachments: [] },
  { id: 5, parent: "Soham Kalani", phone: "9898989898", subject: "Issue with the notes", dateSubmitted: "11/17/2025, 1:28:31 AM", status: "Resolved", children: "Rajesh Kalani", branches: "Kalyan Branch", description: "Notes quality was poor", attachments: [] },
  { id: 4, parent: "Soham Kalani", phone: "9898989898", subject: "Payment issue", dateSubmitted: "11/5/2025, 1:30:28 PM", status: "Closed", children: "Kumar Kalani", branches: "Thane Branch", description: "Payment not reflecting", attachments: [] },
  { id: 3, parent: "Soham Kalani", phone: "9898989898", subject: "xyz", dateSubmitted: "11/2/2025, 7:31:00 PM", status: "Pending", children: "Kumar Kalani", branches: "Thane Branch", description: "General query", attachments: [] },
  { id: 2, parent: "Soham Kalani", phone: "9898989898", subject: "Bus Service Issue", dateSubmitted: "10/30/2025, 2:43:42 AM", status: "Resolved", children: "Rajesh Kalani", branches: "Kalyan Branch", description: "Bus timing issue", attachments: [] },
];

const getStatusColor = (status: GrievanceStatus) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "In Progress":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "Closed":
      return "bg-gray-100 text-gray-800 border-gray-300";
    case "Resolved":
      return "bg-green-100 text-green-800 border-green-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

const Grievances = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [newStatus, setNewStatus] = useState<GrievanceStatus>("Pending");

  // Permission check
  const { canRead, canUpdate } = useModulePermissions('GRIEVANCES');

  const filteredGrievances = grievances.filter((g) => {
    const matchesSearch = g.parent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const openDetails = (grievance: Grievance) => {
    setSelectedGrievance(grievance);
    setNewStatus(grievance.status);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Grievance Management</h1>

      {/* Schema Notice */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Schema Extension Required</AlertTitle>
        <AlertDescription>
          The Grievances feature requires a grievances table to be added to the schema. Currently showing demo data.
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Label className="text-muted-foreground">Search Parent or Subject</Label>
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
            <Label className="text-muted-foreground">Filter by Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={clearFilters} className="w-full lg:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="cursor-pointer hover:text-foreground">Parent ↕</TableHead>
              <TableHead className="cursor-pointer hover:text-foreground">Subject ↕</TableHead>
              <TableHead className="cursor-pointer hover:text-foreground">Date Submitted ↓</TableHead>
              <TableHead className="cursor-pointer hover:text-foreground">Status ↕</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGrievances.map((grievance) => (
              <TableRow key={grievance.id} className="hover:bg-muted/20">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium text-sm">
                      {grievance.parent.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{grievance.parent}</p>
                      <p className="text-sm text-muted-foreground">{grievance.phone}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-foreground">{grievance.subject}</TableCell>
                <TableCell className="text-muted-foreground">{grievance.dateSubmitted}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(grievance.status)}>
                    {grievance.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => openDetails(grievance)}>
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredGrievances.map((grievance) => (
          <div key={grievance.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium">
                  {grievance.parent.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-foreground">{grievance.parent}</p>
                  <p className="text-sm text-muted-foreground">{grievance.phone}</p>
                </div>
              </div>
              <Badge variant="outline" className={getStatusColor(grievance.status)}>
                {grievance.status}
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              <p><span className="text-muted-foreground">Subject:</span> <span className="text-foreground">{grievance.subject}</span></p>
              <p className="text-muted-foreground">{grievance.dateSubmitted}</p>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => openDetails(grievance)}>
              View Details
            </Button>
          </div>
        ))}
      </div>

      {/* Grievance Details Modal */}
      <Dialog open={!!selectedGrievance} onOpenChange={() => setSelectedGrievance(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Grievance Details: #{selectedGrievance?.id}</DialogTitle>
          </DialogHeader>
          
          {selectedGrievance && (
            <div className="space-y-6 pt-4">
              {/* Parent Information */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground">Parent Information</h3>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium text-lg">
                    {selectedGrievance.parent.charAt(0)}
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{selectedGrievance.parent}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{selectedGrievance.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Children:</span>
                      <span className="text-foreground">{selectedGrievance.children}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Branch(es):</span>
                      <span className="text-foreground">{selectedGrievance.branches}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grievance Details */}
              <div className="border border-border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-foreground">Grievance Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-foreground">Subject: </span>
                    <span className="text-foreground">{selectedGrievance.subject}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Description:</p>
                    <p className="text-muted-foreground mt-1">{selectedGrievance.description}</p>
                  </div>
                  {selectedGrievance.attachments.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Paperclip className="h-4 w-4" />
                        <span>Attachments</span>
                      </div>
                      <div className="flex gap-2">
                        {selectedGrievance.attachments.map((att, idx) => (
                          <div key={idx} className="w-24 h-24 rounded-lg border border-border overflow-hidden bg-muted">
                            <img src={att} alt="Attachment" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Submitted on: {selectedGrievance.dateSubmitted}</span>
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div className="border border-border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-foreground">Update Status</h3>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label className="text-muted-foreground">Set New Status</Label>
                    <Select value={newStatus} onValueChange={(v) => setNewStatus(v as GrievanceStatus)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Grievances;
