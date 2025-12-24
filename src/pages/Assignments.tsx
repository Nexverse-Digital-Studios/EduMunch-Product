import { useState, useMemo } from "react";
import { Plus, Search, Edit, Send, Eye, Trash2, Loader2 } from "lucide-react";
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
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

// Types based on Tier 2 schema
interface Assignment {
  id: string;
  title: string;
  description: string | null;
  section_id: string | null;
  subject_id: string | null;
  teacher_id: string | null;
  academic_year_id: string | null;
  assignment_type: 'Homework' | 'Project' | 'Practice' | 'Lab Work';
  deadline: string | null;
  max_marks: number | null;
  attachment_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  subjects?: { name: string } | null;
  sections?: { name: string; classes?: { name: string } | null } | null;
  teachers?: { first_name: string; last_name: string } | null;
}

interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_date: string | null;
  submission_file_url: string | null;
  submission_notes: string | null;
  status: 'Pending' | 'Submitted' | 'Late' | 'Evaluated' | 'Resubmit';
  marks_obtained: number | null;
  teacher_remarks: string | null;
  evaluated_by: string | null;
  evaluated_at: string | null;
  created_at: string;
}

const INDEX_TOKEN = import.meta.env.VITE_INDEX_TOKEN || '1EMAET';

const Assignments = () => {
  const [activeTab, setActiveTab] = useState("assignments");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Permission checks
  const { canRead, canCreate, canUpdate, canDelete } = useModulePermissions('ASSIGNMENTS');

  // Fetch assignments with related data
  const {
    data: assignments,
    isLoading,
    error,
    refetch,
    deleteMutation,
  } = useSupabaseTable<Assignment>(`assignments_${INDEX_TOKEN}`, {
    select: `
      *,
      subjects:subject_id(name),
      sections:section_id(name, classes:class_id(name)),
      teachers:teacher_id(first_name, last_name)
    `,
    orderBy: { column: 'created_at', ascending: false },
  });

  // Filter assignments
  const filteredAssignments = useMemo(() => {
    if (!assignments) return [];
    return assignments.filter((assignment) => {
      const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (assignment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesType = typeFilter === "all" || assignment.assignment_type.toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [assignments, searchQuery, typeFilter]);

  // Published assignments (for grading tab)
  const publishedAssignments = useMemo(() => {
    return filteredAssignments.filter(a => a.is_published);
  }, [filteredAssignments]);

  const handleViewSubmissions = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissionsModal(true);
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!canDelete) {
      toast({ title: "Access Denied", description: "You don't have permission to delete assignments", variant: "destructive" });
      return;
    }
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Success", description: "Assignment deleted successfully" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete assignment", variant: "destructive" });
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'Homework': return 'default';
      case 'Project': return 'secondary';
      case 'Practice': return 'outline';
      case 'Lab Work': return 'destructive';
      default: return 'default';
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Failed to load assignments. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
        Assignment Management
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
          <TabsTrigger 
            value="assignments" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            All Assignments
          </TabsTrigger>
          <TabsTrigger 
            value="grading"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Submissions & Grading
          </TabsTrigger>
        </TabsList>

        {/* All Assignments Tab */}
        <TabsContent value="assignments" className="mt-6 space-y-4">
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="homework">Homework</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                  <SelectItem value="lab work">Lab Work</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {canCreate && (
              <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Assignment
              </Button>
            )}
          </div>

          <Card>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted-foreground">No assignments found</p>
                {canCreate && (
                  <Button onClick={() => setShowCreateModal(true)} className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Create First Assignment
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Class/Section</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                <Edit className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{assignment.title}</p>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {assignment.description || 'No description'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{assignment.subjects?.name || 'N/A'}</TableCell>
                          <TableCell>
                            {assignment.sections?.classes?.name || ''} {assignment.sections?.name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getTypeBadgeVariant(assignment.assignment_type)}>
                              {assignment.assignment_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {assignment.deadline ? format(new Date(assignment.deadline), 'MMM d, yyyy') : 'No deadline'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={assignment.is_published ? 'default' : 'secondary'}>
                              {assignment.is_published ? 'Published' : 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {canUpdate && (
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewSubmissions(assignment)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Submissions
                              </Button>
                              {canDelete && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteAssignment(assignment.id)}
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-border">
                  {filteredAssignments.map((assignment) => (
                    <div key={assignment.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Edit className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{assignment.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {assignment.subjects?.name || 'No subject'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Badge variant={getTypeBadgeVariant(assignment.assignment_type)} className="text-xs">
                            {assignment.assignment_type}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Due: {assignment.deadline ? format(new Date(assignment.deadline), 'MMM d') : 'No deadline'}</span>
                        <Badge variant={assignment.is_published ? 'default' : 'secondary'} className="text-xs">
                          {assignment.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {canUpdate && (
                          <Button variant="outline" size="sm" className="flex-1 gap-2">
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          className="flex-1 gap-2" 
                          onClick={() => handleViewSubmissions(assignment)}
                        >
                          <Eye className="h-4 w-4" />
                          Submissions
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </TabsContent>

        {/* Submissions & Grading Tab */}
        <TabsContent value="grading" className="mt-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium">Search Published Assignments</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search by title..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Card>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : publishedAssignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted-foreground">No published assignments yet</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Assignment</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Max Marks</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {publishedAssignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">{assignment.title}</TableCell>
                          <TableCell>{assignment.subjects?.name || 'N/A'}</TableCell>
                          <TableCell>
                            {assignment.deadline ? format(new Date(assignment.deadline), 'MMM d, yyyy') : 'No deadline'}
                          </TableCell>
                          <TableCell>{assignment.max_marks || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              className="gap-2"
                              onClick={() => handleViewSubmissions(assignment)}
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
                  {publishedAssignments.map((assignment) => (
                    <div key={assignment.id} className="p-4 space-y-3">
                      <div>
                        <p className="font-medium">{assignment.title}</p>
                        <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                          <span>Due: {assignment.deadline ? format(new Date(assignment.deadline), 'MMM d') : 'No deadline'}</span>
                          <span>Max: {assignment.max_marks || 'N/A'} marks</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full gap-2"
                        onClick={() => handleViewSubmissions(assignment)}
                      >
                        <Eye className="h-4 w-4" />
                        View Submissions
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <CreateTemplateModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
        onSuccess={() => refetch()}
      />
      <SubmissionsModal 
        open={showSubmissionsModal} 
        onOpenChange={setShowSubmissionsModal}
        assignment={selectedAssignment}
      />
      <AssignModal open={showAssignModal} onOpenChange={setShowAssignModal} />
    </div>
  );
};

export default Assignments;
