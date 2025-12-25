/**
 * Timetables Module Index
 * ========================
 * Exports all timetable pages for route registration
 */

export { default as TimetablesList } from "./TimetablesList";

// Re-export types for external use
export type { 
  SectionDB, 
  SubjectDB, 
  TeacherDB, 
  TimetableDB, 
  ClassInfo, 
  ScheduleSlot 
} from "./components";
