import { useState } from "react";
import { Plus, Search, Check, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PTMRequest {
  id: string;
  parent: string;
  teacher: string;
  reason: string;
  preferredTime: string;
  status: "PENDING" | "AWAITING_PARENT" | "APPROVED" | "DECLINED";
}

const ptmRequests: PTMRequest[] = [
  { id: "1", parent: "Soham Kalani", teacher: "VSM", reason: "performance", preferredTime: "Dec 15, 2025, 12:00 PM", status: "PENDING" },
  { id: "2", parent: "Soham Kalani", teacher: "RCM", reason: "For student performance", preferredTime: "Dec 14, 2025, 12:00 PM", status: "PENDING" },
  { id: "3", parent: "Soham Kalani", teacher: "MNP", reason: "Test to keep as pending", preferredTime: "Nov 27, 2025, 12:00 PM", status: "PENDING" },
  { id: "4", parent: "Rahul Sharma", teacher: "ABC", reason: "Discuss progress", preferredTime: "Dec 10, 2025, 2:00 PM", status: "AWAITING_PARENT" },
  { id: "5", parent: "Priya Singh", teacher: "DEF", reason: "Academic review", preferredTime: "Dec 12, 2025, 11:00 AM", status: "APPROVED" },
  { id: "6", parent: "Amit Kumar", teacher: "GHI", reason: "Behavior concerns", preferredTime: "Dec 8, 2025, 3:00 PM", status: "APPROVED" },
];

const students = [
  { id: "1", name: "Student 1" },
  { id: "2", name: "Student 2" },
  { id: "3", name: "Kumar Kalani" },
];

const parents = [
  { id: "1", name: "Soham Kalani" },
  { id: "2", name: "Rahul Sharma" },
  { id: "3", name: "Priya Singh" },
];

const teachers = [
  { id: "1", name: "VSM" },
  { id: "2", name: "RCM" },
  { id: "3", name: "MNP" },
];

const PTMRequests = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const getRequestsByStatus = (status: string) => {
    return ptmRequests.filter(req => {
      const matchesStatus = 
        (status === "pending" && req.status === "PENDING") ||
        (status === "awaiting" && req.status === "AWAITING_PARENT") ||
        (status === "approved" && req.status === "APPROVED") ||
        (status === "declined" && req.status === "DECLINED");
      
      const matchesSearch = 
        req.parent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.reason.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  };

  const pendingCount = ptmRequests.filter(r => r.status === "PENDING").length;
  const awaitingCount = ptmRequests.filter(r => r.status === "AWAITING_PARENT").length;
  const approvedCount = ptmRequests.filter(r => r.status === "APPROVED").length;
  const declinedCount = ptmRequests.filter(r => r.status === "DECLINED").length;

  const renderRequests = (requests: PTMRequest[], showActions: boolean = true) => (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="bg-card border border-border rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold text-foreground">Parent: {request.parent}</h3>
              <p className="text-sm text-primary">Teacher: {request.teacher}</p>
              <p className="text-sm text-muted-foreground">Reason: {request.reason}</p>
              <p className="text-sm text-muted-foreground">Preferred Times: {request.preferredTime}</p>
            </div>
            {showActions && request.status === "PENDING" && (
              <div className="flex gap-2">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
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
      {requests.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No requests found.</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">PTM Requests</h1>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Create PTM
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-0">
          <TabsTrigger
            value="pending"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger
            value="awaiting"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Awaiting Parent ({awaitingCount})
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Approved ({approvedCount})
          </TabsTrigger>
          <TabsTrigger
            value="declined"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Declined ({declinedCount})
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search parent, teacher or reason..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Showing {getRequestsByStatus(activeTab).length} of {ptmRequests.filter(r => 
                (activeTab === "pending" && r.status === "PENDING") ||
                (activeTab === "awaiting" && r.status === "AWAITING_PARENT") ||
                (activeTab === "approved" && r.status === "APPROVED") ||
                (activeTab === "declined" && r.status === "DECLINED")
              ).length} total
            </p>
          </div>

          <TabsContent value="pending" className="mt-0">
            {renderRequests(getRequestsByStatus("pending"))}
          </TabsContent>
          <TabsContent value="awaiting" className="mt-0">
            {renderRequests(getRequestsByStatus("awaiting"), false)}
          </TabsContent>
          <TabsContent value="approved" className="mt-0">
            {renderRequests(getRequestsByStatus("approved"), false)}
          </TabsContent>
          <TabsContent value="declined" className="mt-0">
            {renderRequests(getRequestsByStatus("declined"), false)}
          </TabsContent>
        </div>
      </Tabs>

      {/* Create PTM Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New PTM Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Select Student</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="-- Select Student --" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select Parent</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="-- Select Parent --" />
                </SelectTrigger>
                <SelectContent>
                  {parents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>{parent.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select Teacher</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="-- Select Teacher --" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Scheduled Time</Label>
              <Input type="datetime-local" />
            </div>
            <div className="space-y-2">
              <Label>Reason for Meeting (Optional)</Label>
              <Textarea placeholder="Enter reason for the meeting..." rows={3} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create & Notify
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PTMRequests;