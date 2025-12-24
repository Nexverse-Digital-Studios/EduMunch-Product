import { useState } from "react";
import { Plus, RefreshCw, Download, Search, Edit, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

// Database types based on schema
interface ClassDB {
  id: string;
  class_name: string;
  class_code: string;
  class_order?: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SectionDB {
  id: string;
  class_id: string;
  section_name: string;
  section_code: string;
  capacity?: number;
  class_teacher_id?: string;
  room_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SubjectDB {
  id: string;
  subject_name: string;
  subject_code: string;
  is_active: boolean;
}

interface TeacherDB {
  id: string;
  user_id?: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  status: string;
}

const Batches = () => {
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();
  
  // Fetch data from Supabase
  const { 
    data: classes, 
    isLoading: loadingClasses,
    createMutation: createClass,
    deleteMutation: deleteClass 
  } = useSupabaseTable<ClassDB>(
    TABLES.CLASSES,
    { orderBy: { column: 'class_order', ascending: true } }
  );
  
  const { 
    data: sections, 
    isLoading: loadingSections,
    createMutation: createSection,
    deleteMutation: deleteSection 
  } = useSupabaseTable<SectionDB>(
    TABLES.SECTIONS,
    { orderBy: { column: 'section_name', ascending: true } }
  );
  
  const { data: subjects, isLoading: loadingSubjects } = useSupabaseTable<SubjectDB>(
    TABLES.SUBJECTS,
    { orderBy: { column: 'subject_name', ascending: true } }
  );
  
  const { data: teachers, isLoading: loadingTeachers } = useSupabaseTable<TeacherDB>(
    TABLES.TEACHERS,
    { orderBy: { column: 'first_name', ascending: true } }
  );
  
  const isLoading = loadingClasses || loadingSections;
  
  // Combine classes and sections into batches view
  const batches = (sections || []).map(section => {
    const parentClass = (classes || []).find(c => c.id === section.class_id);
    return {
      id: section.id,
      name: section.section_name,
      code: section.section_code,
      className: parentClass?.class_name || 'Unknown',
      classCode: parentClass?.class_code || '',
      capacity: section.capacity,
      roomNumber: section.room_number,
      isActive: section.is_active
    };
  });

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
          <BatchDetailsTab 
            batches={batches} 
            classes={classes || []}
            isLoading={isLoading} 
            createClass={createClass}
            createSection={createSection}
            deleteSection={deleteSection}
            toast={toast}
          />
        </TabsContent>

        <TabsContent value="subjects" className="mt-6">
          <ManageSubjectsTab sections={sections || []} subjects={subjects || []} isLoading={loadingSubjects} />
        </TabsContent>

        <TabsContent value="faculty" className="mt-6">
          <ManageFacultyTab sections={sections || []} teachers={teachers || []} isLoading={loadingTeachers} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface BatchView {
  id: string;
  name: string;
  code: string;
  className: string;
  classCode: string;
  capacity?: number;
  roomNumber?: string;
  isActive: boolean;
}

interface BatchDetailsTabProps {
  batches: BatchView[];
  classes: ClassDB[];
  isLoading: boolean;
  createClass: ReturnType<typeof useSupabaseTable<ClassDB>>['createMutation'];
  createSection: ReturnType<typeof useSupabaseTable<SectionDB>>['createMutation'];
  deleteSection: ReturnType<typeof useSupabaseTable<SectionDB>>['deleteMutation'];
  toast: ReturnType<typeof useToast>['toast'];
}

const BatchDetailsTab = ({ batches, classes, isLoading, createClass, createSection, deleteSection, toast }: BatchDetailsTabProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newBatch, setNewBatch] = useState({
    class_id: '',
    section_name: '',
    section_code: '',
    capacity: 40,
    room_number: ''
  });
  
  const handleCreate = () => {
    if (!newBatch.class_id || !newBatch.section_name.trim() || !newBatch.section_code.trim()) {
      toast({ title: "Error", description: "Please fill in required fields", variant: "destructive" });
      return;
    }
    
    createSection.mutate({
      class_id: newBatch.class_id,
      section_name: newBatch.section_name.trim(),
      section_code: newBatch.section_code.trim(),
      capacity: newBatch.capacity,
      room_number: newBatch.room_number.trim() || null,
      is_active: true
    }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Batch created successfully" });
        setShowCreateModal(false);
        setNewBatch({ class_id: '', section_name: '', section_code: '', capacity: 40, room_number: '' });
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    });
  };
  
  const handleDelete = () => {
    if (!deleteId) return;
    deleteSection.mutate(deleteId, {
      onSuccess: () => {
        toast({ title: "Success", description: "Batch deleted successfully" });
        setDeleteId(null);
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading batches...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
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
          <Select defaultValue="all-classes">
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-classes">All Classes</SelectItem>
              {classes.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.class_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Checkbox id="only-active" />
          <label htmlFor="only-active" className="text-sm">Only Active</label>
        </div>
      </div>

      <Card>
        {batches.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No batches found. Create your first batch to get started.</p>
          </div>
        ) : (
        <>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer">Section Name ↑</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Room</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{batch.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>{batch.className}</TableCell>
                  <TableCell className="text-muted-foreground">{batch.code}</TableCell>
                  <TableCell>{batch.capacity || '-'}</TableCell>
                  <TableCell>{batch.roomNumber || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(batch.id)}
                      >
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
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive"
                    onClick={() => setDeleteId(batch.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Class: </span>
                  {batch.className}
                </div>
                <div>
                  <span className="text-muted-foreground">Capacity: </span>
                  {batch.capacity || '-'}
                </div>
                <div>
                  <span className="text-muted-foreground">Room: </span>
                  {batch.roomNumber || '-'}
                </div>
              </div>
            </div>
          ))}
        </div>
        </>
        )}
      </Card>
      
      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Batch (Section)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Class</label>
              <Select 
                value={newBatch.class_id}
                onValueChange={(val) => setNewBatch(prev => ({ ...prev, class_id: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.class_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Section Name</label>
              <Input 
                placeholder="e.g., Section A" 
                value={newBatch.section_name}
                onChange={(e) => setNewBatch(prev => ({ ...prev, section_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Section Code</label>
              <Input 
                placeholder="e.g., A" 
                value={newBatch.section_code}
                onChange={(e) => setNewBatch(prev => ({ ...prev, section_code: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Capacity</label>
              <Input 
                type="number" 
                placeholder="40"
                value={newBatch.capacity}
                onChange={(e) => setNewBatch(prev => ({ ...prev, capacity: parseInt(e.target.value) || 40 }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Room Number</label>
              <Input 
                placeholder="e.g., Room 101"
                value={newBatch.room_number}
                onChange={(e) => setNewBatch(prev => ({ ...prev, room_number: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={createSection.isPending}>
                {createSection.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Batch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this batch? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
      </Card>
    </div>
  );
};

interface ManageSubjectsTabProps {
  sections: SectionDB[];
  subjects: SubjectDB[];
  isLoading: boolean;
}

const ManageSubjectsTab = ({ sections, subjects, isLoading }: ManageSubjectsTabProps) => {
  const [selectedSection, setSelectedSection] = useState<string>("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const availableSubjectItems = (subjects || [])
    .filter(s => s.is_active)
    .map(s => ({ id: s.id, label: `${s.subject_name} (${s.subject_code})` }));

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Select Batch</label>
        <Select value={selectedSection} onValueChange={setSelectedSection}>
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder="Select a batch/section" />
          </SelectTrigger>
          <SelectContent>
            {sections.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.section_name} ({s.section_code})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedSection ? (
        <DualListTransfer
          assignedTitle="Assigned Subjects"
          assignedItems={[]} // Would come from class_subjects table
          availableTitle="Available Subjects"
          availableItems={availableSubjectItems}
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>Select a batch to manage subjects</p>
        </div>
      )}
    </div>
  );
};

interface ManageFacultyTabProps {
  sections: SectionDB[];
  teachers: TeacherDB[];
  isLoading: boolean;
}

const ManageFacultyTab = ({ sections, teachers, isLoading }: ManageFacultyTabProps) => {
  const [selectedSection, setSelectedSection] = useState<string>("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const availableTeacherItems = (teachers || [])
    .filter(t => t.status === 'active')
    .map(t => ({ id: t.id, label: `${t.first_name} ${t.last_name} (${t.employee_code})` }));

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Select Batch</label>
        <Select value={selectedSection} onValueChange={setSelectedSection}>
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder="Select a batch/section" />
          </SelectTrigger>
          <SelectContent>
            {sections.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.section_name} ({s.section_code})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedSection ? (
        <DualListTransfer
          assignedTitle="Assigned Faculty"
          assignedItems={[]} // Would come from teacher_subject_sections table
          availableTitle="Available Faculty"
          availableItems={availableTeacherItems}
          emptyMessage="No available teachers"
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>Select a batch to manage faculty</p>
        </div>
      )}
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
