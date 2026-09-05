/**
 * Student Management Types
 * ========================
 * Type definitions for students, parents, and related entities
 *
 * Database Tables:
 * - students_1emaet
 * - parents_1emaet
 * - student_parent_mapping_1emaet
 */

export interface StudentDB {
  id: string;
  user_id: string | null;
  admission_number: string;
  roll_number: string | null;
  class_id: string;
  section_id: string;
  academic_year_id: string;

  // Personal Info
  first_name: string;
  middle_name: string | null;
  last_name: string;
  date_of_birth: string;
  gender: "Male" | "Female" | "Other";
  blood_group: string | null;
  aadhar_number: string | null;
  nationality: string;
  religion: string | null;
  caste: string | null;
  category: "General" | "OBC" | "SC" | "ST" | "Other" | null;

  // Contact Info
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string;

  // Academic Info
  previous_school: string | null;
  admission_date: string;
  tc_number: string | null;
  tc_issued_date: string | null;

  // Medical Info
  medical_conditions: MedicalCondition[] | null;
  allergies: string[] | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;

  // Documents (Cloudflare R2 URLs)
  photo_url: string | null;
  birth_certificate_url: string | null;
  aadhar_card_url: string | null;
  transfer_certificate_url: string | null;
  previous_marksheet_url: string | null;

  // Status
  status: "active" | "inactive" | "graduated" | "transferred" | "dropped";

  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MedicalCondition {
  condition: string;
  severity: "mild" | "moderate" | "severe";
  medication?: string;
}

export interface ParentDB {
  id: string;
  user_id: string | null;

  // Personal Info
  full_name: string;
  relationship: "Father" | "Mother" | "Guardian" | "Other";
  email: string | null;
  phone: string;
  alternate_phone: string | null;
  occupation: string | null;
  annual_income: number | null;

  // Address
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string;

  // Documents
  aadhar_number: string | null;
  photo_url: string | null;

  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface StudentParentMappingDB {
  id: string;
  student_id: string;
  parent_id: string;
  is_primary_contact: boolean;
  created_at: string;
}

export interface StudentFormData {
  // Personal Info
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  aadhar_number: string;
  nationality: string;
  religion: string;
  caste: string;
  category: string;

  // Academic Info
  admission_number: string;
  roll_number: string;
  class_id: string;
  section_id: string;
  academic_year_id: string;
  admission_date: string;
  previous_school: string;

  // Contact Info
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;

  // Emergency Contact
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
}

export const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
] as const;

export const BLOOD_GROUP_OPTIONS = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
] as const;

export const CATEGORY_OPTIONS = [
  { value: "General", label: "General" },
  { value: "OBC", label: "OBC" },
  { value: "SC", label: "SC" },
  { value: "ST", label: "ST" },
  { value: "Other", label: "Other" },
] as const;

export const STUDENT_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "graduated", label: "Graduated" },
  { value: "transferred", label: "Transferred" },
  { value: "dropped", label: "Dropped" },
] as const;

export const RELATIONSHIP_OPTIONS = [
  { value: "Father", label: "Father" },
  { value: "Mother", label: "Mother" },
  { value: "Guardian", label: "Guardian" },
  { value: "Other", label: "Other" },
] as const;
