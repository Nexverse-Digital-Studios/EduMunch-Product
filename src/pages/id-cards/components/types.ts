/**
 * ID Cards Management Types
 * =========================
 * Type definitions for ID card generation and management
 *
 * Features:
 * - Student ID cards
 * - Staff ID cards
 * - ID card templates
 * - Bulk generation
 */

export interface StudentForIDCard {
  id: string;
  admission_number: string;
  roll_number: string | null;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  blood_group: string | null;
  photo_url: string | null;
  class_id: string;
  section_id: string;
  phone: string | null;
  address_line1: string | null;
  city: string | null;
  status: string;
}

export interface StaffForIDCard {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  designation: string | null;
  department: string | null;
  date_of_joining: string | null;
  blood_group: string | null;
  photo_url: string | null;
  phone: string | null;
  emergency_contact: string | null;
  address_line1: string | null;
  city: string | null;
  status: string;
}

export interface ClassInfo {
  id: string;
  class_name: string;
  class_code: string;
}

export interface SectionInfo {
  id: string;
  section_name: string;
  section_code: string;
  class_id: string;
}

export interface IDCardTemplate {
  id: string;
  name: string;
  type: "student" | "staff";
  design: IDCardDesign;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface IDCardDesign {
  backgroundColor: string;
  headerColor: string;
  textColor: string;
  accentColor: string;
  showPhoto: boolean;
  showBloodGroup: boolean;
  showAddress: boolean;
  showEmergencyContact: boolean;
  showBarcode: boolean;
  showQRCode: boolean;
  logoPosition: "left" | "center" | "right";
  orientation: "portrait" | "landscape";
}

export interface IDCardGenerationRequest {
  type: "student" | "staff";
  ids: string[];
  templateId?: string;
}

export const DEFAULT_STUDENT_TEMPLATE: IDCardDesign = {
  backgroundColor: "#ffffff",
  headerColor: "#1e40af",
  textColor: "#1f2937",
  accentColor: "#3b82f6",
  showPhoto: true,
  showBloodGroup: true,
  showAddress: true,
  showEmergencyContact: true,
  showBarcode: false,
  showQRCode: true,
  logoPosition: "center",
  orientation: "portrait",
};

export const DEFAULT_STAFF_TEMPLATE: IDCardDesign = {
  backgroundColor: "#ffffff",
  headerColor: "#166534",
  textColor: "#1f2937",
  accentColor: "#22c55e",
  showPhoto: true,
  showBloodGroup: true,
  showAddress: false,
  showEmergencyContact: true,
  showBarcode: false,
  showQRCode: true,
  logoPosition: "center",
  orientation: "portrait",
};

export const BLOOD_GROUPS = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
] as const;
