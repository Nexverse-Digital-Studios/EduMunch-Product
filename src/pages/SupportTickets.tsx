import { useState } from "react";
import { Search, AlertCircle, RefreshCw, CheckCircle, X, User, Users, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SupportTicket {
  id: string;
  title: string;
  from: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  assignedTo: string | null;
}

const ticketsData: SupportTicket[] = [
  { id: "1", title: "Attendance: Child is absent", from: "Soham Kalani", status: "OPEN", assignedTo: null },
  { id: "2", title: "Other: Child not studying", from: "Soham Kalani", status: "OPEN", assignedTo: null },
  { id: "3", title: "Payment: issue", from: "Soham Kalani", status: "OPEN", assignedTo: null },
  { id: "4", title: "Course: Missing content", from: "Rahul Sharma", status: "IN_PROGRESS", assignedTo: "Super Admin" },
  { id: "5", title: "Technical: App not loading", from: "Priya Singh", status: "IN_PROGRESS", assignedTo: "Support Team" },
  { id: "6", title: "Batch: Schedule conflict", from: "Amit Kumar", status: "IN_PROGRESS", assignedTo: "Super Admin" },
  { id: "7", title: "Result: Marks not updated", from: "Neha Gupta", status: "IN_PROGRESS", assignedTo: "Teacher" },
  { id: "8", title: "Fee: Receipt needed", from: "Vikram Iyer", status: "RESOLVED", assignedTo: "Super Admin" },
];

const SupportTickets = () => {
  const [activeTab, setActiveTab] = useState("open");
  const [filter, setFilter] = useState<"all" | "me" | "unassigned">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");

  const getTicketsByStatus = (status: string) => {
    return ticketsData.filter(ticket => {
      const matchesStatus = 
        (status === "open" && ticket.status === "OPEN") ||
        (status === "in_progress" && ticket.status === "IN_PROGRESS") ||
        (status === "resolved" && ticket.status === "RESOLVED");
      
      const matchesFilter = 
        filter === "all" ||
        (filter === "me" && ticket.assignedTo === "Super Admin") ||
        (filter === "unassigned" && !ticket.assignedTo);
      
      const matchesSearch = 
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.from.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesFilter && matchesSearch;
    });
  };

  const openCount = ticketsData.filter(t => t.status === "OPEN").length;
  const inProgressCount = ticketsData.filter(t => t.status === "IN_PROGRESS").length;
  const resolvedCount = ticketsData.filter(t => t.status === "RESOLVED").length;

  const renderTickets = (tickets: SupportTicket[]) => (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">{ticket.title}</h3>
                <p className="text-sm text-primary">From: {ticket.from}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {ticket.assignedTo || "Unassigned"}
              </p>
              {!ticket.assignedTo && (
                <div className="h-0.5 w-8 bg-muted-foreground/30 mt-2 ml-auto" />
              )}
            </div>
          </div>
        </div>
      ))}
      {tickets.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No tickets found.</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-0">
          <TabsTrigger
            value="open"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 gap-2"
          >
            <AlertCircle className="h-4 w-4" />
            Open
            <span className="text-muted-foreground">({openCount})</span>
          </TabsTrigger>
          <TabsTrigger
            value="in_progress"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            In Progress
            <span className="text-muted-foreground">({inProgressCount})</span>
          </TabsTrigger>
          <TabsTrigger
            value="resolved"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Resolved
            <span className="text-muted-foreground">({resolvedCount})</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 space-y-4">
          {/* Filter & Search Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant={filter === "all" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button 
                variant={filter === "me" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilter("me")}
              >
                <User className="h-4 w-4 mr-1" />
                Me
              </Button>
              <Button 
                variant={filter === "unassigned" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilter("unassigned")}
              >
                <Users className="h-4 w-4 mr-1" />
                Unassigned
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => { setFilter("all"); setSearchQuery(""); }}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10 w-full sm:w-48"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="from">From</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="open" className="mt-0">
            {renderTickets(getTicketsByStatus("open"))}
          </TabsContent>
          <TabsContent value="in_progress" className="mt-0">
            {renderTickets(getTicketsByStatus("in_progress"))}
          </TabsContent>
          <TabsContent value="resolved" className="mt-0">
            {renderTickets(getTicketsByStatus("resolved"))}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SupportTickets;