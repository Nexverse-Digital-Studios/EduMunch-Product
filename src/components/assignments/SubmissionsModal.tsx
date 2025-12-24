import { useState } from "react";
import { X, Search, Eye, Check, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

interface SubmissionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentTitle: string;
}

interface Submission {
  id: string;
  student: string;
  submittedAt: string;
  status: "GRADED" | "PENDING" | "NOT_SUBMITTED";
  marks: string;
}

const submissionsData: Submission[] = [
  { id: "1", student: "Student test 1", submittedAt: "12/6/2025, 7:03:15 PM", status: "GRADED", marks: "2 / 3" },
];

interface MCQQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  studentAnswer: number;
}

const mcqQuestions: MCQQuestion[] = [
  { question: "2+2", options: ["1", "2", "3", "4"], correctAnswer: 3, studentAnswer: 3 },
  { question: "7*7", options: ["36", "47", "49", "63"], correctAnswer: 2, studentAnswer: 2 },
  { question: "Square root of 9", options: ["2", "3", "4", "5"], correctAnswer: 1, studentAnswer: 0 },
];

export const SubmissionsModal = ({ open, onOpenChange, assignmentTitle }: SubmissionsModalProps) => {
  const [showResponses, setShowResponses] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");

  const handleViewResponses = (student: string) => {
    setSelectedStudent(student);
    setShowResponses(true);
  };

  if (showResponses) {
    return (
      <Dialog open={open} onOpenChange={(o) => {
        if (!o) setShowResponses(false);
        onOpenChange(o);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Viewing Submission by {selectedStudent}</DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowResponses(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 py-4">
              <h3 className="font-semibold">MCQ Responses</h3>
              
              {mcqQuestions.map((q, qIndex) => (
                <div key={qIndex} className="border-l-4 border-primary pl-4 space-y-2">
                  <p className="font-medium">{q.question}</p>
                  <div className="space-y-1">
                    {q.options.map((option, oIndex) => {
                      const isCorrect = oIndex === q.correctAnswer;
                      const isStudentAnswer = oIndex === q.studentAnswer;
                      const isWrong = isStudentAnswer && !isCorrect;
                      
                      return (
                        <div 
                          key={oIndex}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded",
                            isCorrect && "bg-stat-green-bg",
                            isWrong && "bg-stat-red-bg"
                          )}
                        >
                          {isCorrect && <Check className="h-4 w-4 text-stat-green" />}
                          {isWrong && <XCircle className="h-4 w-4 text-stat-red" />}
                          <span className={cn(
                            isCorrect && "font-medium",
                            isWrong && "font-medium"
                          )}>{option}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Submissions for "{assignmentTitle}"</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by student..." className="pl-10" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="newest">
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Sort: Newest Submission</SelectItem>
                <SelectItem value="oldest">Sort: Oldest Submission</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
              {submissionsData.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">{submission.student}</TableCell>
                  <TableCell>{submission.submittedAt}</TableCell>
                  <TableCell>{submission.status}</TableCell>
                  <TableCell>{submission.marks}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => handleViewResponses(submission.student)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};
