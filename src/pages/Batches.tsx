import { useState } from "react";
import { Plus, RefreshCw, Download, Search, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Batch {
  id: string;
  name: string;
  code: string;
  branch: string;
  course: string;
  startDate: string;
  endDate: string;
}

const batchesData: Batch[] = [
  { id: "1", name: "10TPF", code: "10TPF", branch: "Thane HO Branch", course: "NEET Foundation", startDate: "11/4/2025", endDate: "11/29/2025" },
  { id: "2", name: "26KJMA1", code: "26KJMA1", branch: "Kalyan Branch", course: "CET 1 year", startDate: "10/23/2025", endDate: "9/30/2026" },
  { id: "3", name: "26KJMC1", code: "26KJMC1", branch: "Kalyan Branch", course: "JEE Foundation", startDate: "10/22/2025", endDate: "11/20/2026" },
  { id: "4", name: "26KN1 NEET", code: "26KN1 NEET", branch: "Kalyan Branch", course: "NEET Foundation", startDate: "8/27/2025", endDate: "12/31/2026" },
  { id: "5", name: "26MJMA1", code: "26MJMA1", branch: "Manpada Branch", course: "CET 1 year", startDate: "10/7/2025", endDate: "8/20/2026" },
  { id: "6", name: "26MJMA2", code: "26MJMA2", branch: "Manpada Branch", course: "NEET Foundation", startDate: "8/14/2025", endDate: "11/26/2026" },
  { id: "7", name: "26MJMC1", code: "26MJMC1", branch: "Manpada Branch", course: "NEET Foundation", startDate: "11/4/2025", endDate: "11/29/2025" },
];

const assignedSubjects = [
  { id: "1", name: "Math", code: "Math" },
  { id: "2", name: "Chemistry", code: "Chem" },
  { id: "3", name: "Biology", code: "BIO" },
  { id: "4", name: "Phy", code: "PHY" },
];

const availableSubjects = [
  { id: "5", name: "Random Subject Name", code: "RSN" },
  { id: "6", name: "GK", code: "GK" },
];

const assignedFaculty = [
  "ASB", "KAP", "UKCH", "VMM", "VSM", "ZAP", "JYCH", "MKP", "MNCH"
];

const Batches = () => {
  const [activeTab, setActiveTab] = useState("details");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl flex items-center gap-3">
        <span>📋</span> Batch Management
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
          <TabsTrigger 
            value="details" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Batch Details
          </TabsTrigger>
          <TabsTrigger 
            value="subjects"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Manage Subjects
          </TabsTrigger>
          <TabsTrigger 
            value="faculty"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Manage Faculty
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <BatchDetailsTab batches={batchesData} />
        </TabsContent>

        <TabsContent value="subjects" className="mt-6">
          <ManageSubjectsTab />
        </TabsContent>

        <TabsContent value="faculty" className="mt-6">
          <ManageFacultyTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const BatchDetailsTab = ({ batches }: { batches: Batch[] }) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Batch
          </Button>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-10 w-[200px]" />
          </div>
          <Select defaultValue="all-branches">
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-branches">All Branches</SelectItem>
              <SelectItem value="kalyan">Kalyan Branch</SelectItem>
              <SelectItem value="thane">Thane HO Branch</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-courses">
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-courses">All Courses</SelectItem>
              <SelectItem value="jee">JEE Foundation</SelectItem>
              <SelectItem value="neet">NEET Foundation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Checkbox id="only-active" />
          <label htmlFor="only-active" className="text-sm">Only Active</label>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">From:</span>
          <Input type="date" className="w-[150px]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">To:</span>
          <Input type="date" className="w-[150px]" />
        </div>
      </div>

      <Card>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer">Batch Name ↑</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{batch.name}</p>
                      <p className="text-sm text-muted-foreground">{batch.code}</p>
                    </div>
                  </TableCell>
                  <TableCell>{batch.branch}</TableCell>
                  <TableCell>{batch.course}</TableCell>
                  <TableCell>{batch.startDate}</TableCell>
                  <TableCell>{batch.endDate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
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
          {batches.map((batch) => (
            <div key={batch.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{batch.name}</p>
                  <p className="text-sm text-muted-foreground">{batch.code}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Branch: </span>
                  {batch.branch}
                </div>
                <div>
                  <span className="text-muted-foreground">Course: </span>
                  {batch.course}
                </div>
                <div>
                  <span className="text-muted-foreground">Start: </span>
                  {batch.startDate}
                </div>
                <div>
                  <span className="text-muted-foreground">End: </span>
                  {batch.endDate}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const ManageSubjectsTab = () => {
  const [selectedAssigned, setSelectedAssigned] = useState<string[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Select Batch</label>
        <Select defaultValue="26tjma1">
          <SelectTrigger className="max-w-md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="26tjma1">26TJMA1</SelectItem>
            <SelectItem value="26kjma1">26KJMA1</SelectItem>
            <SelectItem value="26kjmc1">26KJMC1</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DualListTransfer
        assignedTitle="Assigned"
        assignedItems={assignedSubjects.map(s => ({ id: s.id, label: `${s.name} (${s.code})` }))}
        availableTitle="Available"
        availableItems={availableSubjects.map(s => ({ id: s.id, label: `${s.name} (${s.code})` }))}
      />
    </div>
  );
};

const ManageFacultyTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Select Batch</label>
        <Select defaultValue="26tjma1">
          <SelectTrigger className="max-w-md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="26tjma1">26TJMA1</SelectItem>
            <SelectItem value="26kjma1">26KJMA1</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DualListTransfer
        assignedTitle="Assigned"
        assignedItems={assignedFaculty.map((f, i) => ({ id: String(i), label: f }))}
        availableTitle="Available"
        availableItems={[]}
        emptyMessage="No available teachers"
      />
    </div>
  );
};

interface ListItem {
  id: string;
  label: string;
}

interface DualListTransferProps {
  assignedTitle: string;
  assignedItems: ListItem[];
  availableTitle: string;
  availableItems: ListItem[];
  emptyMessage?: string;
}

const DualListTransfer = ({ 
  assignedTitle, 
  assignedItems, 
  availableTitle, 
  availableItems,
  emptyMessage = "No items available"
}: DualListTransferProps) => {
  const [selectedAssigned, setSelectedAssigned] = useState<string[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);

  const toggleAssigned = (id: string) => {
    setSelectedAssigned(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAvailable = (id: string) => {
    setSelectedAvailable(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-stretch">
      {/* Assigned List */}
      <Card className="flex-1">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{assignedTitle} ({assignedItems.length})</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Select all</Button>
              <Button variant="outline" size="sm">Clear</Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3">Select items and use the arrows to move.</p>
          <ScrollArea className="h-[300px]">
            <div className="space-y-1">
              {assignedItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded cursor-pointer transition-colors",
                    selectedAssigned.includes(item.id) ? "bg-primary/20" : "hover:bg-muted"
                  )}
                  onClick={() => toggleAssigned(item.id)}
                >
                  <Checkbox checked={selectedAssigned.includes(item.id)} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Transfer Buttons */}
      <div className="flex lg:flex-col items-center justify-center gap-2">
        <Button size="icon" className="bg-primary">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="destructive">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Available List */}
      <Card className="flex-1">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{availableTitle} ({availableItems.length})</h3>
            <div className="flex gap-2">
              <Input placeholder="Search..." className="w-32 h-8" />
              <Button variant="outline" size="sm">All</Button>
              <Button variant="outline" size="sm">Clear</Button>
            </div>
          </div>
          <ScrollArea className="h-[300px]">
            {availableItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">{emptyMessage}</p>
            ) : (
              <div className="space-y-1">
                {availableItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded cursor-pointer transition-colors",
                      selectedAvailable.includes(item.id) ? "bg-primary/20" : "hover:bg-muted"
                    )}
                    onClick={() => toggleAvailable(item.id)}
                  >
                    <Checkbox checked={selectedAvailable.includes(item.id)} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Batches;
