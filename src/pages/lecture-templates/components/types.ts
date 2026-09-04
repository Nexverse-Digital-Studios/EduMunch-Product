/**
 * Lecture Template Types
 * =======================
 * Type definitions for the lecture templates module
 * 
 * Database Table: lecture_templates_${INDEX_TOKEN}
 */

export interface LectureTemplateDB {
  id: string;
  template_name: string;
  subject_id: string | null;
  duration_minutes: number;
  default_teacher_id: string | null;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  day_of_week: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LectureTemplateFormData {
  template_name: string;
  subject_id: string;
  duration_minutes: number;
  default_teacher_id: string;
  description: string;
  start_time: string;
  end_time: string;
  day_of_week: string;
  is_active: boolean;
}

export interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  templateName?: string;
  subjectId?: string;
}

export interface DaySchedule {
  day: string;
  dayNumber: number;
  slots: TimeSlot[];
}

export const DAYS_OF_WEEK = [
  { value: "1", label: "Monday", short: "MON" },
  { value: "2", label: "Tuesday", short: "TUE" },
  { value: "3", label: "Wednesday", short: "WED" },
  { value: "4", label: "Thursday", short: "THU" },
  { value: "5", label: "Friday", short: "FRI" },
  { value: "6", label: "Saturday", short: "SAT" },
  { value: "0", label: "Sunday", short: "SUN" },
];
