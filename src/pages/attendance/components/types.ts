/**
 * Attendance Module Types
 * ========================
 * Type definitions based on DB schema:
 * - attendance_1EMAET
 * - attendance_subject_wise_1EMAET
 * - leave_applications_1EMAET
 * - teacher_attendance_1EMAET
 */

// ==========================
// Student Daily Attendance
// ==========================
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half-day';

export interface AttendanceDB {
  id: string;
  student_id: string;
  class_id: string;
  section_id: string;
  attendance_date: string;
  status: AttendanceStatus;
  marked_by?: string;
  remarks?: string;
  marked_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface AttendanceFormData {
  student_id: string;
  class_id: string;
  section_id: string;
  attendance_date: string;
  status: AttendanceStatus;
  remarks?: string;
}

// ==========================
// Subject-wise Attendance
// ==========================
export type SubjectAttendanceStatus = 'Present' | 'Absent' | 'Late';

export interface AttendanceSubjectWiseDB {
  id: string;
  student_id: string;
  section_id: string;
  subject_id: string;
  timetable_id?: string;
  attendance_date: string;
  period_id?: string;
  status: SubjectAttendanceStatus;
  marked_by?: string;
  remarks?: string;
  created_at: string;
}

export interface SubjectAttendanceFormData {
  student_id: string;
  section_id: string;
  subject_id: string;
  timetable_id?: string;
  attendance_date: string;
  period_id?: string;
  status: SubjectAttendanceStatus;
  remarks?: string;
}

// ==========================
// Leave Applications
// ==========================
export type LeaveType = 'Sick' | 'Medical' | 'Casual' | 'Emergency' | 'Other';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveApplicationDB {
  id: string;
  student_id: string;
  leave_type: LeaveType;
  from_date: string;
  to_date: string;
  total_days: number;
  reason: string;
  medical_certificate_url?: string;
  applied_by: string;
  applied_at: string;
  status: LeaveStatus;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at?: string;
}

export interface LeaveApplicationFormData {
  student_id: string;
  leave_type: LeaveType;
  from_date: string;
  to_date: string;
  reason: string;
  medical_certificate_url?: string;
}

// ==========================
// Teacher Attendance
// ==========================
export interface TeacherAttendanceDB {
  id: string;
  teacher_id: string;
  attendance_date: string;
  status: AttendanceStatus;
  check_in_time?: string;
  check_out_time?: string;
  marked_by?: string;
  remarks?: string;
  created_at: string;
}

// ==========================
// Related Entities
// ==========================
export interface SectionDB {
  id: string;
  class_id: string;
  section_name: string;
  section_code: string;
}

export interface ClassDB {
  id: string;
  class_name: string;
  class_code: string;
  display_order?: number;
  is_active?: boolean;
}

export interface StudentDB {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  section_id: string;
  roll_number?: string;
  is_active?: boolean;
}

export interface TeacherDB {
  id: string;
  first_name: string;
  last_name: string;
  employee_code: string;
}

export interface SubjectDB {
  id: string;
  subject_name: string;
  subject_code: string;
  is_active?: boolean;
}

export interface TimetableDB {
  id: string;
  section_id: string;
  subject_id: string;
  teacher_id: string;
  period_id: string;
  day_of_week: number;
  room_number?: string;
  is_active: boolean;
}

export interface PeriodDB {
  id: string;
  period_name: string;
  period_number: number;
  start_time: string;
  end_time: string;
}

// ==========================
// Report Types
// ==========================
export interface AttendanceSummary {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  onLeaveDays: number;
  attendancePercentage: number;
}

export interface DailyReport {
  date: string;
  sectionId: string;
  sectionName: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  onLeave: number;
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalWorkingDays: number;
  averageAttendance: number;
  sectionWise: DailyReport[];
}

// ==========================
// Mark Attendance State
// ==========================
export interface StudentAttendanceEntry {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  rollNumber?: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface MarkAttendanceState {
  sectionId: string;
  date: string;
  entries: StudentAttendanceEntry[];
}
