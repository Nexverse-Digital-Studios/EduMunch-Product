import { useState } from "react";
import { Plus, Pencil, Trash2, X, Link2, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
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
  DialogFooter,
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
import { Checkbox } from "@/components/ui/checkbox";

interface ClassInfo {
  id: string;
  subject: string;
  teacher: string;
  isMerged?: boolean;
}

interface ScheduleSlot {
  time: string;
  slots: { [branchBatch: string]: ClassInfo | null };
}

const branches = [
  "Kalyan Branch - 27KJ1",
  "Kalyan Branch - 27KJ2",
  "Kalyan Branch - 27KN1",
  "Manpada Branch - 27MJ1",
  "Manpada Branch - 27MJ2",
  "Palava Branch - JEE Advance Batch 2026",
  "Thane HO Branch",
];

const timeSlots = [
  "08:00-10:00",
  "08:30-10:30",
  "10:00-12:00",
  "10:15-12:15",
  "11:00-13:00",
  "13:00-15:00",
  "13:30-15:30",
  "16:00-18:00",
];

const subjects = ["Physics", "Chemistry", "Math", "Biology", "GK", "English"];
const teachers = [
  { id: "MNP", name: "MNP - Physics" },
  { id: "APCH", name: "APCH - Chemistry" },
  { id: "UKCH", name: "UKCH - Chemistry" },
  { id: "VMM", name: "VMM - Math" },
  { id: "VSM", name: "VSM - Math" },
  { id: "ASM", name: "ASM - Math" },
  { id: "RCM", name: "RCM - Math" },
  { id: "ASB", name: "ASB - Biology" },
  { id: "ZAP", name: "ZAP - GK" },
  { id: "MNCH", name: "MNCH - Chemistry" },
];

const generateId = () => Math.random().toString(36).substring(2, 9);

const initialSchedule: ScheduleSlot[] = [
  { 
    time: "08:00-10:00", 
    slots: { 
      "Manpada Branch - 27MJ1": { id: generateId(), subject: "Chemistry", teacher: "UKCH" },
      "Thane HO Branch": { id: generateId(), subject: "Math", teacher: "RCM" },
    } 
  },
  { 
    time: "08:30-10:30", 
    slots: { 
      "Kalyan Branch - 27KJ1": { id: generateId(), subject: "Physics", teacher: "MNP" },
    } 
  },
  { 
    time: "10:00-12:00", 
    slots: { 
      "Palava Branch - JEE Advance Batch 2026": { id: generateId(), subject: "GK", teacher: "ZAP" },
    } 
  },
  { 
    time: "10:15-12:15", 
    slots: { 
      "Manpada Branch - 27MJ1": { id: generateId(), subject: "Math", teacher: "VMM" },
    } 
  },
  { 
    time: "11:00-13:00", 
    slots: { 
      "Kalyan Branch - 27KJ1": { id: generateId(), subject: "Chemistry", teacher: "APCH" },
      "Kalyan Branch - 27KJ2": { id: generateId(), subject: "Math", teacher: "ASM" },
    } 
  },
  { 
    time: "13:00-15:00", 
    slots: {} 
  },
  { 
    time: "13:30-15:30", 
    slots: { 
      "Kalyan Branch - 27KJ2": { id: generateId(), subject: "Biology", teacher: "ASB" },
      "Kalyan Branch - 27KN1": { id: generateId(), subject: "Math", teacher: "VSM" },
      "Kalyan Branch - 27KJ1": { id: generateId(), subject: "Chemistry", teacher: "MNCH", isMerged: true },
    } 
  },
  { 
    time: "16:00-18:00", 
    slots: {} 
  },
];

const Timetables = () => {
  const { toast } = useToast();
  const [selectedWeek, setSelectedWeek] = useState("2025-12-08");
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(initialSchedule);
  
  // Modal states
  const [isBulkScheduleOpen, setIsBulkScheduleOpen] = useState(false);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Edit form state
  const [editingSlot, setEditingSlot] = useState<{
    timeIndex: number;
    branch: string;
    classInfo: ClassInfo | null;
  } | null>(null);
  
  const [formData, setFormData] = useState({
    subject: "",
    teacher: "",
    isMerged: false,
  });

  // Bulk schedule state
  const [bulkDate, setBulkDate] = useState("");
  const [copyFromDate, setCopyFromDate] = useState("");

  const getWeekDates = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates(selectedWeek);
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });

  const navigateWeek = (direction: 'prev' | 'next') => {
    const current = new Date(selectedWeek);
    current.setDate(current.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedWeek(current.toISOString().split('T')[0]);
  };

  const handleAddClass = (timeIndex: number, branch: string) => {
    setEditingSlot({ timeIndex, branch, classInfo: null });
    setFormData({ subject: "", teacher: "", isMerged: false });
    setIsAddEditOpen(true);
  };

  const handleEditClass = (timeIndex: number, branch: string, classInfo: ClassInfo) => {
    setEditingSlot({ timeIndex, branch, classInfo });
    setFormData({
      subject: classInfo.subject,
      teacher: classInfo.teacher,
      isMerged: classInfo.isMerged || false,
    });
    setIsAddEditOpen(true);
  };

  const handleDeleteClick = (timeIndex: number, branch: string, classInfo: ClassInfo) => {
    setEditingSlot({ timeIndex, branch, classInfo });
    setIsDeleteOpen(true);
  };

  const handleSaveClass = () => {
    if (!editingSlot || !formData.subject || !formData.teacher) {
      toast({
        title: "Missing information",
        description: "Please select both subject and teacher.",
        variant: "destructive",
      });
      return;
    }

    const newSchedule = [...schedule];
    const slot = newSchedule[editingSlot.timeIndex];
    
    slot.slots[editingSlot.branch] = {
      id: editingSlot.classInfo?.id || generateId(),
      subject: formData.subject,
      teacher: formData.teacher,
      isMerged: formData.isMerged,
    };

    setSchedule(newSchedule);
    setIsAddEditOpen(false);
    setEditingSlot(null);
    
    toast({
      title: editingSlot.classInfo ? "Class updated" : "Class added",
      description: `${formData.subject} with ${formData.teacher} has been ${editingSlot.classInfo ? 'updated' : 'scheduled'}.`,
    });
  };

  const handleDeleteClass = () => {
    if (!editingSlot) return;

    const newSchedule = [...schedule];
    delete newSchedule[editingSlot.timeIndex].slots[editingSlot.branch];
    
    setSchedule(newSchedule);
    setIsDeleteOpen(false);
    setEditingSlot(null);
    
    toast({
      title: "Class deleted",
      description: "The class has been removed from the schedule.",
    });
  };

  const handleClearWeek = () => {
    const clearedSchedule = schedule.map(slot => ({
      ...slot,
      slots: {},
    }));
    setSchedule(clearedSchedule);
    toast({
      title: "Week cleared",
      description: "All classes for this week have been removed.",
    });
  };

  const handleNotifyWeek = () => {
    toast({
      title: "Notifications sent",
      description: "All students and teachers have been notified about the weekly schedule.",
    });
  };

  const handleCopyFromWeek = () => {
    if (!copyFromDate) {
      toast({
        title: "Select source week",
        description: "Please select a week to copy from.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Schedule copied",
      description: "The schedule has been copied from the selected week.",
    });
  };

  const handleSaveBulkSchedule = () => {
    setIsBulkScheduleOpen(false);
    toast({
      title: "Timetable saved",
      description: "The bulk schedule has been saved successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Weekly Timetable</h1>
        <Button onClick={() => setIsBulkScheduleOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Bulk Schedule
        </Button>
      </div>

      {/* Week Selection */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Select Week</Label>
              <Input 
                type="date" 
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-40"
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {weekDates.map((date, i) => (
              <Badge key={i} variant="outline" className="font-normal">
                {formatDate(date)}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2 sm:ml-auto">
            <Button variant="destructive" onClick={handleClearWeek}>
              <X className="h-4 w-4 mr-2" />
              Clear Week
            </Button>
            <Button variant="outline" onClick={handleNotifyWeek}>
              <Send className="h-4 w-4 mr-2" />
              Notify Week
            </Button>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="border border-border rounded-lg overflow-hidden">
        <ScrollArea className="w-full">
          <div className="min-w-[1200px]">
            {/* Header */}
            <div className="flex bg-muted/30 border-b border-border">
              <div className="w-28 flex-shrink-0 p-3 border-r border-border">
                <span className="font-medium text-foreground">Time</span>
              </div>
              {branches.map((branch) => (
                <div key={branch} className="flex-1 min-w-[150px] p-3 border-r border-border last:border-r-0">
                  <span className="font-medium text-foreground text-sm">{branch}</span>
                </div>
              ))}
            </div>

            {/* Time Rows */}
            {schedule.map((row, rowIndex) => (
              <div key={rowIndex} className="flex border-b border-border last:border-b-0">
                <div className="w-28 flex-shrink-0 p-3 border-r border-border bg-muted/10">
                  <span className="text-sm text-foreground font-mono">{row.time}</span>
                </div>
                {branches.map((branch) => {
                  const classInfo = row.slots[branch];
                  return (
                    <div 
                      key={branch} 
                      className={`flex-1 min-w-[150px] p-2 border-r border-border last:border-r-0 min-h-[80px] group hover:bg-muted/20 transition-colors ${
                        classInfo?.isMerged ? "bg-primary/10" : ""
                      }`}
                    >
                      {classInfo ? (
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-foreground text-sm">{classInfo.subject}</p>
                              <p className="text-xs text-primary">{classInfo.teacher}</p>
                              {classInfo.isMerged && (
                                <Badge variant="outline" className="mt-1 text-xs bg-primary/10 text-primary border-primary/30">
                                  <Link2 className="h-3 w-3 mr-1" />
                                  MERGED
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6"
                                onClick={() => handleEditClass(rowIndex, branch, classInfo)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteClick(rowIndex, branch, classInfo)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-full opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                          onClick={() => handleAddClass(rowIndex, branch)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Add/Edit Class Modal */}
      <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSlot?.classInfo ? "Edit Class" : "Add Class"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {editingSlot && (
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <p><strong>Time:</strong> {schedule[editingSlot.timeIndex]?.time}</p>
                <p><strong>Branch:</strong> {editingSlot.branch}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={formData.subject} onValueChange={(v) => setFormData({ ...formData, subject: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Teacher</Label>
              <Select value={formData.teacher} onValueChange={(v) => setFormData({ ...formData, teacher: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isMerged" 
                checked={formData.isMerged}
                onCheckedChange={(checked) => setFormData({ ...formData, isMerged: checked as boolean })}
              />
              <Label htmlFor="isMerged" className="text-sm font-normal cursor-pointer">
                Mark as merged class (combined batches)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveClass}>
              {editingSlot?.classInfo ? "Update" : "Add"} Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this class from the schedule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClass} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Schedule Modal */}
      <Dialog open={isBulkScheduleOpen} onOpenChange={setIsBulkScheduleOpen}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Bulk Schedule Timetable for a Week</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="space-y-2">
                <Label>Select any date in the desired week</Label>
                <Input 
                  type="date" 
                  className="w-48" 
                  value={bulkDate}
                  onChange={(e) => setBulkDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Copy from Previous Week</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="date" 
                    className="w-40" 
                    value={copyFromDate}
                    onChange={(e) => setCopyFromDate(e.target.value)}
                  />
                  <Button onClick={handleCopyFromWeek}>
                    Copy
                  </Button>
                </div>
              </div>
            </div>

            {/* Bulk Schedule Grid */}
            <ScrollArea className="h-[400px] border border-border rounded-lg">
              <div className="min-w-[1400px] p-4">
                {/* Branch Headers */}
                <div className="flex gap-4 mb-4 border-b border-border pb-4">
                  {branches.slice(0, 6).map((branch) => (
                    <div key={branch} className="w-[180px] flex-shrink-0">
                      <span className="font-medium text-foreground text-sm">{branch}</span>
                    </div>
                  ))}
                </div>

                {/* Time Slot Rows */}
                {["08:30 AM - 10:30 AM", "11:00 AM - 01:00 PM", "01:30 PM - 03:30 PM"].map((time, timeIndex) => (
                  <div key={timeIndex} className="flex gap-4 mb-4 pb-4 border-b border-border last:border-b-0">
                    {branches.slice(0, 6).map((branch) => (
                      <div key={branch} className="w-[180px] flex-shrink-0 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Button variant="ghost" size="icon" className="h-5 w-5">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <span>{time}</span>
                        </div>
                        <Select>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject} value={subject.toLowerCase()}>{subject}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsBulkScheduleOpen(false)}>
                Cancel
              </Button>
              <Button variant="secondary">
                Validate Timetable
              </Button>
              <Button onClick={handleSaveBulkSchedule}>
                Save Timetable
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Timetables;
