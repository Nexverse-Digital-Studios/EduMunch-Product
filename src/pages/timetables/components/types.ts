/**
 * Timetable Types
 * ================
 * Type definitions for the timetables module
 */

export interface SectionDB {
  id: string;
  class_id: string;
  section_name: string;
  section_code: string;
}

export interface SubjectDB {
  id: string;
  subject_name: string;
  subject_code: string;
}

export interface TeacherDB {
  id: string;
  first_name: string;
  last_name: string;
  employee_code: string;
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

export interface ClassInfo {
  id: string;
  subject: string;
  teacher: string;
  isMerged?: boolean;
}

export interface ScheduleSlot {
  time: string;
  slots: { [branchBatch: string]: ClassInfo | null };
}

export interface TeacherOption {
  id: string;
  name: string;
}
