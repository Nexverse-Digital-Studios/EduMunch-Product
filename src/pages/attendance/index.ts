/**
 * Attendance Module Index
 * ========================
 * Exports all attendance pages for route registration
 */

export { default as AttendanceList } from "./AttendanceList";

// Re-export types for external use
export type { SectionDB, TimetableDB, TeacherDB, StudentDB, AttendanceDB } from "./components";
