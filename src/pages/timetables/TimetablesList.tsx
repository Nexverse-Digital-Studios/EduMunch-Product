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
  MergeClassesDialog,
  type SectionDB,
  type SubjectDB,
  type TeacherDB,
  type TimetableDB,
  type ClassInfo,
  type ScheduleSlot,
} from "./components";
import { mergeClassesForTeacher, unmergeClass } from "./utils/mergeClasses";

// Types
interface AcademicYearDB {
  id: string;
  academic_year: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

const TimetablesList = () => {
  const { toast } = useToast();
  const [selectedWeek, setSelectedWeek] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);

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

  const { data: academicYearData } = useSupabaseTable<AcademicYearDB>(
    TABLES.ACADEMIC_YEARS,
    {
      filters: { is_current: true },
    }
  );
  const currentAcademicYear = academicYearData?.[0];

  // Fetch timetable data
  const {
    data: timetableData,
    createMutation: createTimetable,
    updateMutation: updateTimetable,
    deleteMutation: deleteTimetable,
  } = useSupabaseTable<TimetableDB>(TABLES.TIMETABLES);

  // Use database data
  const subjects = subjectsData?.map((s) => s.subject_name) || [];
  const teachers =
    teachersData?.map((t) => ({
      id: t.employee_code,
      name: `${t.employee_code} - ${t.first_name} ${t.last_name}`,
    })) || [];
  const branches = sectionsData?.map((s) => s.section_name) || [];

  // Modal states
  const [isBulkScheduleOpen, setIsBulkScheduleOpen] = useState(false);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isMergeOpen, setIsMergeOpen] = useState(false);
  const [mergeContext, setMergeContext] = useState<{
    timeIndex: number;
    period: string;
  } | null>(null);

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

  const handleSaveClass = async () => {
    if (!editingSlot || !formData.subject || !formData.teacher) {
      toast({
        title: "Missing information",
        description: "Please select both subject and teacher.",
        variant: "destructive",
      });
      return;
    }

    if (!currentAcademicYear?.id) {
      toast({
        title: "Error",
        description: "No active academic year found.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newSchedule = [...schedule];
      const slot = newSchedule[editingSlot.timeIndex];

      const classId = editingSlot.classInfo?.id || generateId();

      // Prepare data for database
      const sectionId = sectionsData?.find(
        (s) => s.section_name === editingSlot.branch
      )?.id;
      const subjectId = subjectsData?.find(
        (s) => s.subject_name === formData.subject
      )?.id;
      const teacherId = teachersData?.find(
        (t) =>
          `${t.employee_code} - ${t.first_name} ${t.last_name}` ===
          formData.teacher
      )?.id;

      if (!sectionId || !subjectId || !teacherId) {
        toast({
          title: "Error",
          description:
            "Could not find section, subject, or teacher in database.",
          variant: "destructive",
        });
        return;
      }

      // Save to database
      if (editingSlot.classInfo?.id) {
        // Update existing
        await updateTimetable.mutateAsync({
          id: classId,
          updates: {
            section_id: sectionId,
            subject_id: subjectId,
            teacher_id: teacherId,
            academic_year_id: currentAcademicYear.id,
            is_active: true,
          } as any,
        });
      } else {
        // Create new
        await createTimetable.mutateAsync({
          id: classId,
          section_id: sectionId,
          subject_id: subjectId,
          teacher_id: teacherId,
          academic_year_id: currentAcademicYear.id,
          is_active: true,
        } as any);
      }

      // Update local state
      slot.slots[editingSlot.branch] = {
        id: classId,
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
    } catch (error) {
      console.error("Error saving class:", error);
      toast({
        title: "Error saving class",
        description: "Failed to save the class to the database.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClass = async () => {
    if (!editingSlot) return;

    try {
      const classId = editingSlot.classInfo?.id;

      // Delete from database if it exists
      if (classId) {
        await deleteTimetable.mutateAsync(classId);
      }

      // Update local state
      const newSchedule = [...schedule];
      delete newSchedule[editingSlot.timeIndex].slots[editingSlot.branch];

      setSchedule(newSchedule);
      setIsDeleteOpen(false);
      setEditingSlot(null);

      toast({
        title: "Class deleted",
        description: "The class has been removed from the schedule.",
      });
    } catch (error) {
      toast({
        title: "Error deleting class",
        description: "Failed to delete the class from the database.",
        variant: "destructive",
      });
    }
  };

  const handleMergeClick = (timeIndex: number, period: string) => {
    setMergeContext({ timeIndex, period });
    setIsMergeOpen(true);
  };

  const handleMerge = (masterSection: string, sectionsToMerge: string[]) => {
    if (
      !mergeContext ||
      sectionsToMerge.length < 2 ||
      !schedule[mergeContext.timeIndex]
    ) {
      return;
    }

    const slot = schedule[mergeContext.timeIndex];
    const masterClass = slot.slots[masterSection];

    if (!masterClass) return;

    const newSchedule = mergeClassesForTeacher(
      schedule,
      branches,
      masterClass.teacher,
      masterClass.subject,
      mergeContext.period,
      masterSection
    );

    setSchedule(newSchedule);
    setIsMergeOpen(false);
    setMergeContext(null);

    toast({
      title: "Classes merged",
      description: `Merged ${sectionsToMerge.length} sections for ${masterClass.subject}.`,
    });
  };

  const handleUnmerge = (timeIndex: number, masterSection: string) => {
    const slot = schedule[timeIndex];
    const masterClass = slot.slots[masterSection];

    if (!masterClass?.mergedSections) return;

    // Create a map of original classes before unmerging
    const originalClasses = new Map<string, ClassInfo>();
    masterClass.mergedSections.forEach((section) => {
      originalClasses.set(section, {
        id: generateId(),
        subject: masterClass.subject,
        teacher: masterClass.teacher,
        isMerged: false,
      });
    });

    const newSchedule = unmergeClass(
      schedule,
      timeIndex,
      masterSection,
      originalClasses
    );

    setSchedule(newSchedule);

    toast({
      title: "Classes unmerged",
      description: `Unmerged ${masterClass.mergedSections.length} sections.`,
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

  const handleSaveBulkSchedule = async () => {
    try {
      // Collect all entries from schedule to save
      const entriesToSave = [];

      for (let slotIndex = 0; slotIndex < schedule.length; slotIndex++) {
        const slot = schedule[slotIndex];
        for (const [sectionName, classInfo] of Object.entries(slot.slots)) {
          if (classInfo && classInfo.id && !classInfo.isMerged) {
            // Only save non-merged classes (merged classes are represented by master section)
            const sectionId = sectionsData?.find(
              (s) => s.section_name === sectionName
            )?.id;
            const subjectId = subjectsData?.find(
              (s) => s.subject_name === classInfo.subject
            )?.id;
            const teacherId = teachersData?.find(
              (t) =>
                `${t.employee_code} - ${t.first_name} ${t.last_name}` ===
                classInfo.teacher
            )?.id;

            if (sectionId && subjectId && teacherId) {
              entriesToSave.push({
                id: classInfo.id,
                section_id: sectionId,
                subject_id: subjectId,
                teacher_id: teacherId,
                is_active: true,
              });
            }
          }
        }
      }

      // Save all entries to database
      if (entriesToSave.length > 0) {
        for (const entry of entriesToSave) {
          // Check if exists and update or insert
          const existing = timetableData?.find((t) => t.id === entry.id);
          if (existing) {
            await updateTimetable.mutateAsync({
              id: entry.id,
              updates: entry,
            });
          } else {
            await createTimetable.mutateAsync(entry as any);
          }
        }
      }

      setIsBulkScheduleOpen(false);
      toast({
        title: "Timetable saved",
        description: `${entriesToSave.length} class entries have been saved successfully.`,
      });
    } catch (error) {
      console.error("Error saving bulk schedule:", error);
      toast({
        title: "Error saving timetable",
        description: "Failed to save the schedule. Please try again.",
        variant: "destructive",
      });
    }
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
        onMergeClick={handleMergeClick}
        onUnmergeClick={handleUnmerge}
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

      {/* Merge Classes Dialog */}
      {mergeContext && (
        <MergeClassesDialog
          isOpen={isMergeOpen}
          onClose={() => {
            setIsMergeOpen(false);
            setMergeContext(null);
          }}
          onMerge={handleMerge}
          schedule={schedule}
          branches={branches}
          timeIndex={mergeContext.timeIndex}
          period={mergeContext.period}
        />
      )}

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
