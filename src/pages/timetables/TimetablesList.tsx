/**
 * Timetables List Page - Weekly Timetable Management
 * ===================================================
 * Manage class schedules with weekly grid view and bulk scheduling
 */

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import {
  WeekSelector,
  TimetableGrid,
  AddEditClassModal,
  DeleteClassDialog,
  BulkScheduleModal,
  type SectionDB,
  type SubjectDB,
  type TeacherDB,
  type TimetableDB,
  type ClassInfo,
  type ScheduleSlot,
} from "./components";

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Default mock data
const defaultSubjects = [
  "Physics",
  "Chemistry",
  "Math",
  "Biology",
  "GK",
  "English",
];
const defaultTeachers = [
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
const defaultBranches: string[] = [];

// Initial schedule data
const initialSchedule: ScheduleSlot[] = [
  {
    time: "08:00-10:00",
    slots: {
      "Manpada Branch - 27MJ1": {
        id: generateId(),
        subject: "Chemistry",
        teacher: "UKCH",
      },
      "Thane HO Branch": { id: generateId(), subject: "Math", teacher: "RCM" },
    },
  },
  {
    time: "08:30-10:30",
    slots: {
      "Kalyan Branch - 27KJ1": {
        id: generateId(),
        subject: "Physics",
        teacher: "MNP",
      },
    },
  },
  {
    time: "10:00-12:00",
    slots: {
      "Palava Branch - JEE Advance Batch 2026": {
        id: generateId(),
        subject: "GK",
        teacher: "ZAP",
      },
    },
  },
  {
    time: "10:15-12:15",
    slots: {
      "Manpada Branch - 27MJ1": {
        id: generateId(),
        subject: "Math",
        teacher: "VMM",
      },
    },
  },
  {
    time: "11:00-13:00",
    slots: {
      "Kalyan Branch - 27KJ1": {
        id: generateId(),
        subject: "Chemistry",
        teacher: "APCH",
      },
      "Kalyan Branch - 27KJ2": {
        id: generateId(),
        subject: "Math",
        teacher: "ASM",
      },
    },
  },
  { time: "13:00-15:00", slots: {} },
  {
    time: "13:30-15:30",
    slots: {
      "Kalyan Branch - 27KJ2": {
        id: generateId(),
        subject: "Biology",
        teacher: "ASB",
      },
      "Kalyan Branch - 27KN1": {
        id: generateId(),
        subject: "Math",
        teacher: "VSM",
      },
      "Kalyan Branch - 27KJ1": {
        id: generateId(),
        subject: "Chemistry",
        teacher: "MNCH",
        isMerged: true,
      },
    },
  },
  { time: "16:00-18:00", slots: {} },
];

const TimetablesList = () => {
  const { toast } = useToast();
  const [selectedWeek, setSelectedWeek] = useState("2025-12-08");
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(initialSchedule);

  // Fetch data from Supabase
  const { data: sectionsData } = useSupabaseTable<SectionDB>(TABLES.SECTIONS, {
    orderBy: { column: "section_name", ascending: true },
  });

  const { data: subjectsData } = useSupabaseTable<SubjectDB>(TABLES.SUBJECTS, {
    orderBy: { column: "subject_name", ascending: true },
  });

  const { data: teachersData } = useSupabaseTable<TeacherDB>(TABLES.TEACHERS, {
    orderBy: { column: "first_name", ascending: true },
  });

  // Use database data if available, otherwise fall back to mock data
  const subjects = subjectsData?.map((s) => s.subject_name) || defaultSubjects;
  const teachers =
    teachersData?.map((t) => ({
      id: t.employee_code,
      name: `${t.employee_code} - ${t.first_name} ${t.last_name}`,
    })) || defaultTeachers;
  const branches = sectionsData?.map((s) => s.section_name) || defaultBranches;

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

  const navigateWeek = (direction: "prev" | "next") => {
    const current = new Date(selectedWeek);
    current.setDate(current.getDate() + (direction === "next" ? 7 : -7));
    setSelectedWeek(current.toISOString().split("T")[0]);
  };

  const handleAddClass = (timeIndex: number, branch: string) => {
    setEditingSlot({ timeIndex, branch, classInfo: null });
    setFormData({ subject: "", teacher: "", isMerged: false });
    setIsAddEditOpen(true);
  };

  const handleEditClass = (
    timeIndex: number,
    branch: string,
    classInfo: ClassInfo
  ) => {
    setEditingSlot({ timeIndex, branch, classInfo });
    setFormData({
      subject: classInfo.subject,
      teacher: classInfo.teacher,
      isMerged: classInfo.isMerged || false,
    });
    setIsAddEditOpen(true);
  };

  const handleDeleteClick = (
    timeIndex: number,
    branch: string,
    classInfo: ClassInfo
  ) => {
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
      description: `${formData.subject} with ${formData.teacher} has been ${
        editingSlot.classInfo ? "updated" : "scheduled"
      }.`,
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
    const clearedSchedule = schedule.map((slot) => ({
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
      description:
        "All students and teachers have been notified about the weekly schedule.",
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
        <Button
          onClick={() => setIsBulkScheduleOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Bulk Schedule
        </Button>
      </div>

      {/* Week Selection */}
      <WeekSelector
        selectedWeek={selectedWeek}
        onWeekChange={setSelectedWeek}
        onNavigateWeek={navigateWeek}
        onClearWeek={handleClearWeek}
        onNotifyWeek={handleNotifyWeek}
      />

      {/* Timetable Grid */}
      <TimetableGrid
        schedule={schedule}
        branches={branches}
        onAddClass={handleAddClass}
        onEditClass={handleEditClass}
        onDeleteClass={handleDeleteClick}
      />

      {/* Add/Edit Class Modal */}
      <AddEditClassModal
        open={isAddEditOpen}
        onOpenChange={setIsAddEditOpen}
        schedule={schedule}
        editingSlot={editingSlot}
        formData={formData}
        onFormDataChange={setFormData}
        subjects={subjects}
        teachers={teachers}
        onSave={handleSaveClass}
      />

      {/* Delete Confirmation */}
      <DeleteClassDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteClass}
      />

      {/* Bulk Schedule Modal */}
      <BulkScheduleModal
        open={isBulkScheduleOpen}
        onOpenChange={setIsBulkScheduleOpen}
        bulkDate={bulkDate}
        onBulkDateChange={setBulkDate}
        copyFromDate={copyFromDate}
        onCopyFromDateChange={setCopyFromDate}
        onCopyFromWeek={handleCopyFromWeek}
        branches={branches}
        subjects={subjects}
        teachers={teachers}
        onSave={handleSaveBulkSchedule}
      />
    </div>
  );
};

export default TimetablesList;
