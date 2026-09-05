/**
 * Staff Attendance Module Types
 * ==============================
 * Type definitions based on DB schema:
 * - teacher_attendance_${INDEX_TOKEN}
 * - employees_${INDEX_TOKEN}
 * 
 * Routes:
 * - /staff/attendance - Dashboard
 * - /staff/attendance/mark - Mark attendance
 * - /staff/attendance/view - View all
 * - /staff/attendance/view/:employeeId - View specific employee
 * - /staff/attendance/reports - Reports dashboard
 * - /staff/attendance/reports/monthly - Monthly report
 * - /staff/attendance/export - Export data
 */

// ==========================
// Staff Attendance Status
// ==========================
export type StaffAttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half-day' | 'On-leave';

// ==========================
// Staff Attendance DB Record
// ==========================
export interface StaffAttendanceDB {
  id: string;
  teacher_id: string;
  attendance_date: string;
  status: StaffAttendanceStatus;
  check_in_time?: string;
  check_out_time?: string;
  marked_by?: string;
  remarks?: string;
  created_at: string;
}

export interface StaffAttendanceFormData {
  teacher_id: string;
  attendance_date: string;
  status: StaffAttendanceStatus;
  check_in_time?: string;
  check_out_time?: string;
  remarks?: string;
}

// ==========================
// Employee Reference (for linking)
// ==========================
export interface EmployeeReference {
  id: string;
  user_id?: string;
  employee_code: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  designation: string;
  department?: string;
  status: 'active' | 'inactive' | 'resigned' | 'terminated';
  photo_url?: string;
}

// ==========================
// Combined View Types
// ==========================
export interface StaffAttendanceWithEmployee extends StaffAttendanceDB {
  employee?: EmployeeReference;
  employee_name?: string;
  employee_code?: string;
}

// ==========================
// Mark Attendance Types
// ==========================
export interface MarkAttendanceEntry {
  employee_id: string;
  employee_code: string;
  employee_name: string;
  designation: string;
  status: StaffAttendanceStatus;
  check_in_time?: string;
  check_out_time?: string;
  remarks?: string;
}

export interface BulkMarkAttendanceData {
  attendance_date: string;
  entries: MarkAttendanceEntry[];
}

// ==========================
// Report Types
// ==========================
export interface AttendanceSummary {
  total_days: number;
  present: number;
  absent: number;
  late: number;
  half_day: number;
  on_leave: number;
  attendance_percentage: number;
}

export interface EmployeeAttendanceSummary extends AttendanceSummary {
  employee_id: string;
  employee_name: string;
  employee_code: string;
  designation: string;
}

export interface MonthlyAttendanceData {
  month: string;
  year: number;
  employees: EmployeeAttendanceSummary[];
  department_summaries?: {
    department: string;
    summary: AttendanceSummary;
  }[];
}

export interface DailyAttendanceStats {
  date: string;
  total_employees: number;
  present: number;
  absent: number;
  late: number;
  half_day: number;
  on_leave: number;
}

// ==========================
// Filter Types
// ==========================
export interface AttendanceFilters {
  date_from?: string;
  date_to?: string;
  status?: StaffAttendanceStatus;
  employee_id?: string;
  department?: string;
}

export interface ReportFilters {
  month?: number;
  year?: number;
  department?: string;
  employee_id?: string;
}

// ==========================
// Export Types
// ==========================
export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  date_from: string;
  date_to: string;
  include_fields: string[];
  department?: string;
}
