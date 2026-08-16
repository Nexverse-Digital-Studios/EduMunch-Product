/**
 * Supabase Client Configuration
 * ==============================
 * Central Supabase client with INDEX_TOKEN support for multi-tenant queries
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const INDEX_TOKEN = import.meta.env.VITE_INDEX_TOKEN || '1emaet';

// Check if Supabase is configured
export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// Create a real client only if configured, otherwise null
export const supabase: SupabaseClient | null = isSupabaseConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/**
 * Helper function to get table name with INDEX_TOKEN suffix
 * @param tableName - Base table name (e.g., 'users', 'roles')
 * @returns Full table name with suffix (e.g., 'users_1emaet')
 */
export const getTable = (tableName: string): string => {
  return `${tableName}_${INDEX_TOKEN}`;
};

/**
 * Table name constants for type safety
 */
export const TABLES = {
  // User Management
  USERS: getTable('users'),
  ROLES: getTable('roles'),
  USER_ROLES: getTable('user_roles'),
  PERMISSIONS: getTable('permissions'),
  ROLE_PERMISSIONS: getTable('role_permissions'),
  MODULES: getTable('modules'),
  
  // Academic Structure
  CLASSES: getTable('classes'),
  SECTIONS: getTable('sections'),
  SUBJECTS: getTable('subjects'),
  CLASS_SUBJECTS: getTable('class_subjects'),
  TOPICS: getTable('topics'),
  TOPIC_CONTENT: getTable('topic_content'),
  ACADEMIC_YEARS: getTable('academic_years'),
  
  // People
  STUDENTS: getTable('students'),
  PARENTS: getTable('parents'),
  STUDENT_PARENT_RELATIONS: getTable('student_parent_relations'),
  TEACHERS: getTable('teachers'),
  TEACHER_SUBJECT_SECTIONS: getTable('teacher_subject_sections'),
  EMPLOYEES: getTable('employees'),
  
  // Attendance
  ATTENDANCE: getTable('attendance'),
  ATTENDANCE_SUBJECT_WISE: getTable('attendance_subject_wise'),
  TEACHER_ATTENDANCE: getTable('teacher_attendance'),
  LEAVE_APPLICATIONS: getTable('leave_applications'),
  STAFF_LEAVE_APPLICATIONS: getTable('staff_leave_applications'),
  
  // Exams & Results
  EXAM_TYPES: getTable('exam_types'),
  EXAMS: getTable('exams'),
  EXAM_SCHEDULES: getTable('exam_schedules'),
  EXAM_MARKS: getTable('exam_marks'),
  GRADE_CONFIG: getTable('grade_config'),
  REPORT_CARDS: getTable('report_cards'),
  ADMIT_CARDS: getTable('admit_cards'),
  
  // Fees
  FEE_COMPONENTS: getTable('fee_components'),
  FEE_STRUCTURES: getTable('fee_structures'),
  FEE_STRUCTURE_COMPONENTS: getTable('fee_structure_components'),
  STUDENT_FEES: getTable('student_fees'),
  FEE_PAYMENTS: getTable('fee_payments'),
  FEE_REFUNDS: getTable('fee_refunds'),
  LATE_FEE_CONFIG: getTable('late_fee_config'),
  
  // Timetable
  TIMETABLE_PERIODS: getTable('timetable_periods'),
  TIMETABLES: getTable('timetables'),
  TIMETABLE_SUBSTITUTIONS: getTable('timetable_substitutions'),
  LECTURE_TEMPLATES: getTable('lecture_templates'),
  
  // Communication
  ANNOUNCEMENTS: getTable('announcements'),
  NOTIFICATIONS: getTable('notifications'),
  SMS_LOGS: getTable('sms_logs'),
  EMAIL_LOGS: getTable('email_logs'),
  
  // Assignments & Homework
  ASSIGNMENTS: getTable('assignments'),
  ASSIGNMENT_SUBMISSIONS: getTable('assignment_submissions'),
  HOMEWORK: getTable('homework'),
  HOMEWORK_SUBMISSIONS: getTable('homework_submissions'),
  STUDY_MATERIALS: getTable('study_materials'),
  
  // PTM
  PTM_SLOTS: getTable('ptm_slots'),
  PTM_BOOKINGS: getTable('ptm_bookings'),
  PTM_MEETING_NOTES: getTable('ptm_meeting_notes'),
  
  // Activity & Logs
  ACTIVITY_LOGS: getTable('activity_logs'),
  SESSIONS: getTable('sessions'),
} as const;
