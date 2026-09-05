/**
 * Sections Components Index
 * =========================
 * Export all section management components
 */

export { SectionsList } from "./SectionsList";
export { SectionForm } from "./SectionForm";
export { SectionFormDialog } from "./SectionFormDialog";
export { SectionCreate } from "./SectionCreate";
export { SectionDetail } from "./SectionDetail";
export { SectionEdit } from "./SectionEdit";

// Types
export type {
  SectionDB,
  SectionWithRelationsDB,
  ClassDB,
  TeacherDB,
  SectionFormData,
} from "./types";

export {
  DEFAULT_SECTION_FORM,
  SECTION_NAME_OPTIONS,
  CAPACITY_OPTIONS,
} from "./types";
