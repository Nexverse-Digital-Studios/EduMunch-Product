/**
 * Teachers Module Types
 * ======================
 * Type definitions based on DB schema:
 * - teachers_${INDEX_TOKEN}
 * - teacher_subject_sections_${INDEX_TOKEN}
 * 
 * Routes:
 * - /teachers - List all
 * - /teachers/create - Add new teacher
 * - /teachers/:id - View details
 * - /teachers/:id/edit - Edit
 * - /teachers/:id/delete - Delete
 * - /teachers/:id/subjects - View assigned subjects
 * - /teachers/:id/assign-subject - Assign subject
 * - /teachers/:id/timetable - View teacher timetable
 * - /teachers/bulk-upload - Bulk upload
 * - /teachers/export - Export list
 */

// ==========================
// Teacher Status & Types
// ==========================
export type TeacherStatus = 'active' | 'inactive' | 'resigned' | 'terminated';
export type Gender = 'Male' | 'Female' | 'Other';
export type EmploymentType = 'Permanent' | 'Contract' | 'Part-time' | 'Guest';

// ==========================
// Teacher DB Record
// ==========================
export interface TeacherDB {
  id: string;
  user_id?: string;
  employee_code: string;
  
  // Personal Info
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth?: string;
  gender?: Gender;
  blood_group?: string;
  aadhar_number?: string;
  pan_number?: string;
  
  // Contact
  email?: string;
  phone: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  
  // Professional
  qualification?: string;
  specialization?: string;
  experience_years?: number;
  joining_date: string;
  employment_type?: EmploymentType;
  designation?: string;
  department?: string;
  
  // Documents
  photo_url?: string;
  resume_url?: string;
  certificates_url?: string[];
  
  // Status
  status: TeacherStatus;
  
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface TeacherFormData {
  employee_code: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth?: string;
  gender?: Gender;
  blood_group?: string;
  email?: string;
  phone: string;
  address_line1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  qualification?: string;
  specialization?: string;
  experience_years?: number;
  joining_date: string;
  employment_type?: EmploymentType;
  designation?: string;
  department?: string;
  status?: TeacherStatus;
}

// ==========================
// Teacher-Subject-Section Mapping
// ==========================
export interface TeacherSubjectSectionDB {
  id: string;
  teacher_id: string;
  section_id: string;
  subject_id: string;
  academic_year_id: string;
  created_at: string;
}

export interface AssignSubjectFormData {
  section_id: string;
  subject_id: string;
  academic_year_id: string;
}

// ==========================
// Filter Types
// ==========================
export interface TeacherFilters {
  status?: TeacherStatus;
  department?: string;
  employment_type?: EmploymentType;
  search?: string;
}

// ==========================
// Combined View Types
// ==========================
export interface TeacherWithSubjects extends TeacherDB {
  assigned_subjects?: {
    subject_id: string;
    subject_name: string;
    section_id: string;
    section_name: string;
    class_name: string;
  }[];
}

// ==========================
// Export Types
// ==========================
export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface TeacherExportOptions {
  format: ExportFormat;
  include_fields: string[];
  status_filter?: TeacherStatus;
  department_filter?: string;
}
