/**
 * Staff Attendance Module Index
 * ==============================
 * Central export for all staff attendance pages
 */

export {
  StaffAttendanceDashboard,
  MarkStaffAttendancePage,
  ViewStaffAttendancePage,
  EmployeeAttendanceDetailPage,
  StaffAttendanceReportsPage,
  MonthlyReportPage,
  ExportStaffAttendancePage,
} from "./components";

// Re-export types
export type {
  StaffAttendanceDB,
  StaffAttendanceStatus,
  StaffAttendanceFormData,
  EmployeeReference,
  AttendanceSummary,
  EmployeeAttendanceSummary,
  MonthlyAttendanceData,
  DailyAttendanceStats,
  AttendanceFilters,
  ReportFilters,
  ExportFormat,
  ExportOptions,
} from "./components";
