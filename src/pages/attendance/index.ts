/**
 * Attendance Module Index
 * ========================
 * Exports all attendance pages for route registration
 */

// Main Dashboard
export { default as AttendanceList } from "./AttendanceList";

// Page Components
export { 
  MarkAttendancePage,
  ViewAttendancePage,
  AttendanceReportsPage,
  SubjectWiseAttendancePage,
  ExportAttendancePage,
  LeaveRequestsPage,
  CreateLeaveRequestPage,
  LeaveRequestDetailsPage,
} from "./components";

// Re-export types for external use
export type { 
  SectionDB, 
  TimetableDB, 
  TeacherDB, 
  StudentDB, 
  AttendanceDB,
  AttendanceSubjectWiseDB,
  LeaveApplicationDB,
  AttendanceStatus,
  LeaveStatus,
  LeaveType,
} from "./components";
