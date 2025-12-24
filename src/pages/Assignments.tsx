import { useState } from "react";
import { Plus, Search, Edit, Send, Eye } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateTemplateModal } from "@/components/assignments/CreateTemplateModal";
import { SubmissionsModal } from "@/components/assignments/SubmissionsModal";
import { AssignModal } from "@/components/assignments/AssignModal";

interface Template {
  id: string;
  title: string;
  description: string;
  type: "Theory" | "MCQ";
}

interface AssignedWork {
  id: string;
  title: string;
  dueDate: string;
  submissions: number;
}

const templatesData: Template[] = [
  { id: "1", title: "Theory Exam", description: "Answer the below questions- 1. Ex...", type: "Theory" },
  { id: "2", title: "Mcq questions Maths", description: "Solve all the below (3 questions)", type: "MCQ" },
];

const assignedWorkData: AssignedWork[] = [
  { id: "1", title: "Mcq questions Maths", dueDate: "12/6/2025", submissions: 1 },
  { id: "2", title: "Theory Exam", dueDate: "12/7/2025", submissions: 1 },
  { id: "3", title: "Theory Exam", dueDate: "12/6/2025", submissions: 1 },
];

const Assignments = () => {
  const [activeTab, setActiveTab] = useState("templates");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleViewSubmissions = (title: string) => {
    setSelectedAssignment(title);
    setShowSubmissionsModal(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
        Assignment Management
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
          <TabsTrigger 
            value="templates" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Assignment Templates
          </TabsTrigger>
          <TabsTrigger 
            value="grading"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Assigned Work & Grading
          </TabsTrigger>
        </TabsList>

        {/* Assignment Templates Tab */}
        <TabsContent value="templates" className="mt-6 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="theory">Theory</SelectItem>
                  <SelectItem value="mcq">MCQ</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="newest">
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Sort: Newest</SelectItem>
                  <SelectItem value="oldest">Sort: Oldest</SelectItem>
                  <SelectItem value="title">Sort: Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          </div>

          <Card>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templatesData.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <Edit className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{template.title}</p>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={template.type === "Theory" ? "default" : "secondary"}>
                          {template.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => setShowAssignModal(true)} className="gap-2">
                            <Send className="h-4 w-4" />
                            Assign
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border">
              {templatesData.map((template) => (
                <div key={template.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Edit className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{template.title}</p>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                    </div>
                    <Badge variant={template.type === "Theory" ? "default" : "secondary"}>
                      {template.type}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button size="sm" className="flex-1 gap-2" onClick={() => setShowAssignModal(true)}>
                      <Send className="h-4 w-4" />
                      Assign
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Assigned Work & Grading Tab */}
        <TabsContent value="grading" className="mt-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Batch</label>
              <Select defaultValue="jee">
                <SelectTrigger className="w-full sm:w-[250px]">
                  <SelectValue placeholder="Select Batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jee">JEE Advance Batch 2026 (Palava Branch)</SelectItem>
                  <SelectItem value="neet">NEET Foundation 2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search title..." className="pl-10" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Sort</label>
              <Select defaultValue="newest">
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedWorkData.map((work) => (
                    <TableRow key={work.id}>
                      <TableCell className="font-medium">{work.title}</TableCell>
                      <TableCell>{work.dueDate}</TableCell>
                      <TableCell>{work.submissions}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => handleViewSubmissions(work.title)}
                        >
                          <Eye className="h-4 w-4" />
                          View Submissions
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border">
              {assignedWorkData.map((work) => (
                <div key={work.id} className="p-4 space-y-3">
                  <div>
                    <p className="font-medium">{work.title}</p>
                    <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                      <span>Due: {work.dueDate}</span>
                      <span>Submissions: {work.submissions}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2"
                    onClick={() => handleViewSubmissions(work.title)}
                  >
                    <Eye className="h-4 w-4" />
                    View Submissions
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateTemplateModal open={showCreateModal} onOpenChange={setShowCreateModal} />
      <SubmissionsModal 
        open={showSubmissionsModal} 
        onOpenChange={setShowSubmissionsModal}
        assignmentTitle={selectedAssignment}
      />
      <AssignModal open={showAssignModal} onOpenChange={setShowAssignModal} />
    </div>
  );
};

export default Assignments;
