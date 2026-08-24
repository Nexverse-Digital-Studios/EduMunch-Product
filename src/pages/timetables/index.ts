/**
 * Timetables Module Index
 * ========================
 * Exports all timetable pages for route registration
 * 
 * Routes:
 * - /timetable - Dashboard
 * - /timetable/view - View all timetables
 * - /timetable/view/:sectionId - View section timetable
 * - /timetable/create - Create new timetable
 * - /timetable/:id/edit - Edit timetable
 * - /timetable/bulk-create - Bulk schedule creation
 * - /timetable/copy - Copy from previous week
 * - /timetable/conflicts - View schedule conflicts
 * - /timetable/substitute - Assign substitute teacher
 * - /timetable/periods - Manage period configuration
 * - /timetable/export - Export timetable
 * - /my-timetable - Student's personal timetable
 * - /class-timetable - Class timetable for students
 */

export { default as TimetablesList } from "./TimetablesList";

// Page exports
export {
  TimetableDashboard,
  ViewTimetablesPage,
  SectionTimetablePage,
  CreateTimetablePage,
  EditTimetablePage,
  BulkCreatePage,
  CopySchedulePage,
  ConflictsPage,
  SubstitutePage,
  PeriodsPage,
  ExportTimetablePage,
  MyTimetablePage,
  ClassTimetablePage,
} from "./components";

// Re-export types for external use
export type { 
  SectionDB, 
  SubjectDB, 
  TeacherDB, 
  TimetableDB, 
  ClassInfo, 
  ScheduleSlot 
} from "./components";
