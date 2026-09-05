/**
 * Results Types
 * ==============
 * Type definitions for the results/exam module
 */

export interface ExamType {
  id: string;
  exam_type_name: string;
  exam_type_code: string;
  description: string | null;
  display_order: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Exam {
  id: string;
  exam_name: string;
  exam_code: string;
  exam_type_id: string;
  academic_year_id: string;
  start_date: string;
  end_date: string;
  result_publish_date: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ExamSchedule {
  id: string;
  exam_id: string;
  class_id: string;
  section_id: string | null;
  subject_id: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  max_marks: number;
  passing_marks: number;
  room_number: string | null;
}

export interface ExamMark {
  id: string;
  exam_schedule_id: string;
  student_id: string;
  marks_obtained: number | null;
  is_absent: boolean;
  grade: string | null;
  remarks: string | null;
}

export interface Branch {
  id: string;
  name: string;
}

export interface Batch {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  roll_number: string;
}
