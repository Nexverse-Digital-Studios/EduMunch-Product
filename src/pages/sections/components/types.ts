/**
 * Section Management Types
 * ========================
 * Type definitions for sections/divisions within classes
 *
 * Database Tables:
 * - sections_1emaet
 * - classes_1emaet (related)
 * - employees_1emaet (class teacher)
 */

export interface SectionDB {
  id: string;
  class_id: string;
  section_name: string;
  section_code: string;
  capacity: number;
  class_teacher_id: string | null;
  room_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SectionWithRelationsDB extends SectionDB {
  classes_1emaet?: {
    id: string;
    class_name: string;
    class_code: string;
  };
  employees_1emaet?: {
    id: string;
    first_name: string;
    last_name: string;
    employee_code: string;
  };
}

export interface ClassDB {
  id: string;
  class_name: string;
  class_code: string;
  class_order: number | null;
  description: string | null;
  is_active: boolean;
}

export interface TeacherDB {
  id: string;
  first_name: string;
  last_name: string;
  employee_code: string;
}

export interface SectionFormData {
  class_id: string;
  section_name: string;
  section_code: string;
  capacity: string;
  class_teacher_id: string;
  room_number: string;
  is_active: boolean;
}

export const DEFAULT_SECTION_FORM: SectionFormData = {
  class_id: "",
  section_name: "",
  section_code: "",
  capacity: "40",
  class_teacher_id: "",
  room_number: "",
  is_active: true,
};

export const SECTION_NAME_OPTIONS = [
  { value: "A", label: "Section A" },
  { value: "B", label: "Section B" },
  { value: "C", label: "Section C" },
  { value: "D", label: "Section D" },
  { value: "E", label: "Section E" },
  { value: "F", label: "Section F" },
] as const;

export const CAPACITY_OPTIONS = [
  { value: "20", label: "20 Students" },
  { value: "25", label: "25 Students" },
  { value: "30", label: "30 Students" },
  { value: "35", label: "35 Students" },
  { value: "40", label: "40 Students" },
  { value: "45", label: "45 Students" },
  { value: "50", label: "50 Students" },
  { value: "60", label: "60 Students" },
] as const;
