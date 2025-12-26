/**
 * Examination System Types
 * =========================
 * Type definitions for exams, marks, and report cards modules
 * 
 * Database Tables:
 * - exams_${INDEX_TOKEN}
 * - exam_subjects_${INDEX_TOKEN}
 * - marks_${INDEX_TOKEN}
 * - report_cards_${INDEX_TOKEN}
 */

export interface ExamDB {
  id: string;
  exam_name: string;
  exam_type: "unit_test" | "mid_term" | "final" | "practical" | "internal" | "board";
  academic_year_id: string;
  start_date: string;
  end_date: string;
  description: string | null;
  max_marks: number;
  passing_marks: number;
  is_published: boolean;
  status: "draft" | "scheduled" | "ongoing" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface ExamSubjectDB {
  id: string;
  exam_id: string;
  subject_id: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  max_marks: number;
  passing_marks: number;
  room_number: string | null;
}

export interface MarksDB {
  id: string;
  exam_id: string;
  exam_subject_id: string;
  student_id: string;
  marks_obtained: number;
  is_absent: boolean;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportCardDB {
  id: string;
  student_id: string;
  academic_year_id: string;
  exam_id: string | null;
  total_marks: number;
  obtained_marks: number;
  percentage: number;
  grade: string;
  rank: number | null;
  remarks: string | null;
  generated_at: string;
  generated_by: string;
}

export interface ExamFormData {
  exam_name: string;
  exam_type: string;
  academic_year_id: string;
  start_date: string;
  end_date: string;
  description: string;
  max_marks: number;
  passing_marks: number;
}

export interface MarksEntryData {
  student_id: string;
  student_name: string;
  roll_number: string;
  marks_obtained: number | null;
  is_absent: boolean;
  remarks: string;
}

export const EXAM_TYPES = [
  { value: "unit_test", label: "Unit Test" },
  { value: "mid_term", label: "Mid Term" },
  { value: "final", label: "Final Exam" },
  { value: "practical", label: "Practical" },
  { value: "internal", label: "Internal Assessment" },
  { value: "board", label: "Board Exam" },
];

export const EXAM_STATUSES = [
  { value: "draft", label: "Draft", color: "secondary" },
  { value: "scheduled", label: "Scheduled", color: "default" },
  { value: "ongoing", label: "Ongoing", color: "destructive" },
  { value: "completed", label: "Completed", color: "default" },
  { value: "cancelled", label: "Cancelled", color: "outline" },
];

export const GRADES = [
  { grade: "A+", minPercent: 90, maxPercent: 100 },
  { grade: "A", minPercent: 80, maxPercent: 89 },
  { grade: "B+", minPercent: 70, maxPercent: 79 },
  { grade: "B", minPercent: 60, maxPercent: 69 },
  { grade: "C+", minPercent: 50, maxPercent: 59 },
  { grade: "C", minPercent: 40, maxPercent: 49 },
  { grade: "D", minPercent: 33, maxPercent: 39 },
  { grade: "F", minPercent: 0, maxPercent: 32 },
];
