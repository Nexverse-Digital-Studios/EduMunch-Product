import { useState, useMemo } from "react";
import { X, Search, Eye, Check, XCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { format } from "date-fns";

const INDEX_TOKEN = import.meta.env.VITE_INDEX_TOKEN || '1EMAET';

interface Assignment {
  id: string;
  title: string;
  max_marks: number | null;
}

interface SubmissionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: Assignment | null;
}

interface Submission {
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
  // Joined fields
  students?: { first_name: string; last_name: string; admission_number: string } | null;
}

export const SubmissionsModal = ({ open, onOpenChange, assignment }: SubmissionsModalProps) => {
  const [showResponses, setShowResponses] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch submissions for this assignment
  const { data: submissions, isLoading } = useSupabaseQuery<Submission>(
    `assignment_submissions_${INDEX_TOKEN}`,
    ['assignment_submissions', INDEX_TOKEN, assignment?.id],
    {
      select: `
        *,
        students:student_id(first_name, last_name, admission_number)
      `,
      filter: assignment?.id ? { column: 'assignment_id', value: assignment.id } : undefined,
      orderBy: { column: 'created_at', ascending: false },
      enabled: !!assignment?.id && open,
    }
  );

  // Filter submissions
  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    return submissions.filter((sub) => {
      const studentName = `${sub.students?.first_name || ''} ${sub.students?.last_name || ''}`.toLowerCase();
      const matchesSearch = studentName.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || sub.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [submissions, searchQuery, statusFilter]);

  const handleViewResponses = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowResponses(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Evaluated': return <Badge className="bg-green-100 text-green-800">Evaluated</Badge>;
      case 'Submitted': return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
      case 'Late': return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>;
      case 'Pending': return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
      case 'Resubmit': return <Badge className="bg-orange-100 text-orange-800">Resubmit</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (showResponses && selectedSubmission) {
    return (
      <Dialog open={open} onOpenChange={(o) => {
        if (!o) setShowResponses(false);
        onOpenChange(o);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                Submission by {selectedSubmission.students?.first_name} {selectedSubmission.students?.last_name}
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowResponses(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedSubmission.status)}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Marks</p>
                  <p className="font-semibold">
                    {selectedSubmission.marks_obtained !== null 
                      ? `${selectedSubmission.marks_obtained} / ${assignment?.max_marks || 'N/A'}`
                      : 'Not graded'
                    }
                  </p>
                </div>
              </div>

              {selectedSubmission.submission_date && (
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Submitted At</p>
                  <p className="font-medium">
                    {format(new Date(selectedSubmission.submission_date), 'PPpp')}
                  </p>
                </div>
              )}

              {selectedSubmission.submission_notes && (
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Student Notes</p>
                  <p className="text-sm">{selectedSubmission.submission_notes}</p>
                </div>
              )}

              {selectedSubmission.submission_file_url && (
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Attachment</p>
                  <a 
                    href={selectedSubmission.submission_file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View Attachment
                  </a>
                </div>
              )}

              {selectedSubmission.teacher_remarks && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-2">Teacher Remarks</p>
                  <p className="text-sm">{selectedSubmission.teacher_remarks}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Submissions for "{assignment?.title || 'Assignment'}"</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search by student..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="evaluated">Evaluated</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="late">Late</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No submissions found
            </div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">
                        {submission.students?.first_name} {submission.students?.last_name}
                        <span className="block text-xs text-muted-foreground">
                          {submission.students?.admission_number}
                        </span>
                      </TableCell>
                      <TableCell>
                        {submission.submission_date 
                          ? format(new Date(submission.submission_date), 'MMM d, yyyy h:mm a')
                          : 'Not submitted'
                        }
                      </TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell>
                        {submission.marks_obtained !== null 
                          ? `${submission.marks_obtained} / ${assignment?.max_marks || '-'}`
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => handleViewResponses(submission)}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
