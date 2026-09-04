/**
 * Sections Module
 * ===============
 * Module for managing class sections/divisions
 *
 * Routes:
 * - /sections - List all sections
 * - /sections/create - Add new section
 * - /sections/:id - View section details
 * - /sections/:id/edit - Edit section details
 */

export {
  SectionsList,
  SectionForm,
  SectionCreate,
  SectionDetail,
  SectionEdit,
} from "./components";

export type {
  SectionDB,
  SectionWithRelationsDB,
  ClassDB,
  TeacherDB,
  SectionFormData,
} from "./components";
