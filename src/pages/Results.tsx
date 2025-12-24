import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";

// Database types
interface ExamDB {
  id: string;
  exam_type_id: string;
  exam_name: string;
  academic_year_id: string;
  start_date?: string;
  end_date?: string;
  total_marks?: number;
  passing_marks?: number;
  is_published: boolean;
  created_at: string;
}

interface ExamMarksDB {
  id: string;
  exam_id: string;
  student_id: string;
  subject_id: string;
  marks_obtained?: number;
  grade?: string;
  remarks?: string;
}

interface BoardTemplate {
  id: string;
  name: string;
  type: "EXTERNAL" | "INTERNAL";
  subjects: string[];
}

interface CompetitiveTemplate {
  id: string;
  name: string;
  maxMarks: number;
}

interface Test {
  id: string;
  name: string;
  template: string;
  templateType: "EXTERNAL" | "INTERNAL";
  date: string;
}

interface StudentMark {
  id: string;
  studentName: string;
  marks: { [subject: string]: number };
}

const boardTemplates: BoardTemplate[] = [
  { id: "1", name: "College exam template", type: "EXTERNAL", subjects: ["Maths", "Science", "English"] },
  { id: "2", name: "WINTER 2025", type: "INTERNAL", subjects: ["Biology (Animal Kingdom)"] },
];

const competitiveTemplates: CompetitiveTemplate[] = [
  { id: "3", name: "Jee Mains", maxMarks: 700 },
  { id: "4", name: "NEET", maxMarks: 200 },
];

const boardTests: Test[] = [
  { id: "1", name: "Mid sem 2025 nov", template: "WINTER 2025", templateType: "INTERNAL", date: "11/25/2025" },
  { id: "2", name: "Dsa New", template: "WINTER 2025", templateType: "INTERNAL", date: "11/13/2025" },
  { id: "3", name: "Mid term College exam", template: "College exam template", templateType: "EXTERNAL", date: "11/13/2025" },
  { id: "4", name: "DSA", template: "WINTER 2025", templateType: "INTERNAL", date: "11/12/2025" },
];

const competitiveTests: Test[] = [
  { id: "5", name: "JEE Mock Test 1", template: "JEE Mock Template", templateType: "EXTERNAL", date: "11/20/2025" },
  { id: "6", name: "NEET Practice Test", template: "NEET Practice", templateType: "INTERNAL", date: "11/18/2025" },
];

const studentMarks: StudentMark[] = [
  { id: "1", studentName: "Student test 1", marks: { "Biology (Animal Kingdom)": 0 } },
];

const branches = [
  { id: "1", name: "Palava Branch" },
  { id: "2", name: "Thane HO Branch" },
  { id: "3", name: "Kalyan Branch" },
];

const batches = [
  { id: "1", name: "JEE Advance Batch 2026" },
  { id: "2", name: "NEET Batch 2026" },
];

const Results = () => {
  const [examType, setExamType] = useState<"board" | "competitive">("board");
  const [activeTab, setActiveTab] = useState("templates");
  const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);
  const [isAddTestOpen, setIsAddTestOpen] = useState(false);

  const [selectedBranch, setSelectedBranch] = useState("1");
  const [selectedBatch, setSelectedBatch] = useState("1");
  const [selectedTest, setSelectedTest] = useState("4");

  const templates = examType === "board" ? boardTemplates : competitiveTemplates;
  const tests = examType === "board" ? boardTests : competitiveTests;

  return (
    <div className="space-y-6">
      {/* Exam Type Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-0">
          <button
            onClick={() => setExamType("board")}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              examType === "board"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Board Exams
          </button>
          <button
            onClick={() => setExamType("competitive")}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              examType === "competitive"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Competitive Exams
          </button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-0">
          <TabsTrigger
            value="templates"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            {examType === "competitive" ? "Exam Templates" : "Templates"}
          </TabsTrigger>
          <TabsTrigger
            value="tests"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            {examType === "competitive" ? "Exams" : "Tests"}
          </TabsTrigger>
          <TabsTrigger
            value="marks"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            {examType === "competitive" ? "Results Entry" : "Marks Entry"}
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              {examType === "competitive" ? "Competitive Exam Templates" : "Test Templates"}
            </h2>
            <Button onClick={() => setIsAddTemplateOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </div>

          <div className="space-y-4">
            {examType === "board" ? (
              boardTemplates.map((template) => (
                <div key={template.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground">{template.name}</h3>
                        <Badge 
                          variant="outline" 
                          className={template.type === "EXTERNAL" 
                            ? "bg-muted text-foreground" 
                            : "bg-primary/10 text-primary"
                          }
                        >
                          {template.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Subjects: {template.subjects.join(", ")}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              competitiveTemplates.map((template) => (
                <div key={template.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">Max Marks: {template.maxMarks}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Tests Tab */}
        <TabsContent value="tests" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Tests</h2>
            <Button onClick={() => setIsAddTestOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Test
            </Button>
          </div>

          <div className="space-y-4">
            {tests.map((test) => (
              <div key={test.id} className="bg-card border border-border rounded-lg p-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">{test.name}</h3>
                  <p className="text-sm text-primary">
                    {test.template} ({test.templateType})
                  </p>
                  <p className="text-sm text-muted-foreground">Date: {test.date}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Marks Entry Tab */}
        <TabsContent value="marks" className="mt-6 space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Marks Entry</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Branch</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Batch</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Test</Label>
              <Select value={selectedTest} onValueChange={setSelectedTest}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tests.map((test) => (
                    <SelectItem key={test.id} value={test.id}>{test.name} ({test.date})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Student</TableHead>
                  <TableHead>
                    Biology (Animal Kingdom) <span className="text-muted-foreground">/ 50</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentMarks.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium text-foreground">{student.studentName}</TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        className="w-24" 
                        defaultValue={student.marks["Biology (Animal Kingdom)"]} 
                        min={0}
                        max={50}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <Button className="bg-primary hover:bg-primary/90">Save All</Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Template Modal */}
      <Dialog open={isAddTemplateOpen} onOpenChange={setIsAddTemplateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Test Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input placeholder="Enter template name" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select defaultValue="internal">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="external">External</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subjects</Label>
              <Input placeholder="Enter subjects (comma separated)" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsAddTemplateOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90">Add Template</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Test Modal */}
      <Dialog open={isAddTestOpen} onOpenChange={setIsAddTestOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Test</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Test Name</Label>
              <Input placeholder="Enter test name" />
            </div>
            <div className="space-y-2">
              <Label>Template</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsAddTestOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90">Add Test</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Results;