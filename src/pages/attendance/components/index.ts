/**
 * Attendance Components Index
 * ============================
 * Exports all attendance components, pages and types
 */

// Types
export * from "./types";

// Tab Components (for main dashboard)
export { ScheduleTab } from "./ScheduleTab";
export { ReportsTab } from "./ReportsTab";
export { StudentReportTab } from "./StudentReportTab";

// Page Components
export { MarkAttendancePage } from "./MarkAttendancePage";
export { ViewAttendancePage } from "./ViewAttendancePage";
export { AttendanceReportsPage } from "./AttendanceReportsPage";
export { SubjectWiseAttendancePage } from "./SubjectWiseAttendancePage";
export { ExportAttendancePage } from "./ExportAttendancePage";

// Leave Request Pages (CONSOLIDATED - using modal dialogs)
export { LeaveRequestsPage } from "./LeaveRequestsPage";
export { LeaveFormDialog } from "./LeaveFormDialog";
export { LeaveDetailsDialog } from "./LeaveDetailsDialog";

// Legacy exports (may be removed later)
export { CreateLeaveRequestPage } from "./CreateLeaveRequestPage";
export { LeaveRequestDetailsPage } from "./LeaveRequestDetailsPage";
