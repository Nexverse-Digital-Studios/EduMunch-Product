/**
 * Parent Management Types
 * =======================
 * Type definitions for parents/guardians and their relationships with students
 *
 * Database Tables:
 * - parents_1emaet
 * - student_parent_relations_1emaet
 */

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

export interface StudentParentRelationDB {
  id: string;
  student_id: string;
  parent_id: string;
  is_primary_contact: boolean;
  can_pickup: boolean;
  created_at: string;
}

export interface ParentWithStudentsDB extends ParentDB {
  student_parent_relations_1emaet?: {
    id: string;
    student_id: string;
    is_primary_contact: boolean;
    can_pickup: boolean;
    students_1emaet?: {
      id: string;
      first_name: string;
      last_name: string;
      admission_number: string;
      class_id: string;
      section_id: string;
      photo_url: string | null;
      status: string;
      classes_1emaet?: {
        class_name: string;
      };
      sections_1emaet?: {
        section_name: string;
      };
    };
  }[];
}

export interface ParentFormData {
  // Personal Info
  full_name: string;
  relationship: string;
  email: string;
  phone: string;
  alternate_phone: string;
  occupation: string;
  annual_income: string;

  // Address
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;

  // Documents
  aadhar_number: string;
}

export const RELATIONSHIP_OPTIONS = [
  { value: "Father", label: "Father" },
  { value: "Mother", label: "Mother" },
  { value: "Guardian", label: "Guardian" },
  { value: "Other", label: "Other" },
] as const;

export const OCCUPATION_OPTIONS = [
  { value: "Business", label: "Business" },
  { value: "Government", label: "Government Employee" },
  { value: "Private", label: "Private Sector" },
  { value: "Self-Employed", label: "Self-Employed" },
  { value: "Doctor", label: "Doctor" },
  { value: "Engineer", label: "Engineer" },
  { value: "Teacher", label: "Teacher" },
  { value: "Lawyer", label: "Lawyer" },
  { value: "Farmer", label: "Farmer" },
  { value: "Homemaker", label: "Homemaker" },
  { value: "Retired", label: "Retired" },
  { value: "Other", label: "Other" },
] as const;

export const INCOME_RANGE_OPTIONS = [
  { value: "0-100000", label: "Below ₹1,00,000" },
  { value: "100000-300000", label: "₹1,00,000 - ₹3,00,000" },
  { value: "300000-500000", label: "₹3,00,000 - ₹5,00,000" },
  { value: "500000-1000000", label: "₹5,00,000 - ₹10,00,000" },
  { value: "1000000-2000000", label: "₹10,00,000 - ₹20,00,000" },
  { value: "2000000+", label: "Above ₹20,00,000" },
] as const;

export const DEFAULT_PARENT_FORM: ParentFormData = {
  full_name: "",
  relationship: "",
  email: "",
  phone: "",
  alternate_phone: "",
  occupation: "",
  annual_income: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  aadhar_number: "",
};
