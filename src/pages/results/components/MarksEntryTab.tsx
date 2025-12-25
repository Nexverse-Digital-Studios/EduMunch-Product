import { Label } from "@/components/ui/label";
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
import { format } from "date-fns";
import type { Exam, Branch, Batch, Student } from "./types";

interface MarksEntryTabProps {
  exams: Exam[];
  branches: Branch[];
  batches: Batch[];
  students: Student[];
  selectedBranch: string;
  onBranchChange: (value: string) => void;
  selectedBatch: string;
  onBatchChange: (value: string) => void;
  selectedExamId: string;
  onExamChange: (value: string) => void;
  canUpdate: boolean;
  onSaveAll: () => void;
}

export const MarksEntryTab = ({
  exams,
  branches,
  batches,
  students,
  selectedBranch,
  onBranchChange,
  selectedBatch,
  onBatchChange,
  selectedExamId,
  onExamChange,
  canUpdate,
  onSaveAll,
}: MarksEntryTabProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Marks Entry</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-muted-foreground">Branch</Label>
          <Select value={selectedBranch} onValueChange={onBranchChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">Batch</Label>
          <Select value={selectedBatch} onValueChange={onBatchChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Batch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {batches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">Exam</Label>
          <Select value={selectedExamId} onValueChange={onExamChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((exam) => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.exam_name} (
                  {format(new Date(exam.start_date), "MM/dd/yyyy")})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedExamId ? (
        <>
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Student</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>
                    Marks <span className="text-muted-foreground">/ 100</span>
                  </TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.slice(0, 10).map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium text-foreground">
                      {student.first_name} {student.last_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {student.roll_number || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="w-24"
                        placeholder="0"
                        min={0}
                        max={100}
                      />
                    </TableCell>
                    <TableCell>
                      <Select>
                        <SelectTrigger className="w-20">
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                          <SelectItem value="F">F</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {canUpdate && (
            <div className="flex justify-end">
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={onSaveAll}
              >
                Save All
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Please select an exam to enter marks
        </div>
      )}
    </div>
  );
};
