/**
 * Parents Components Index
 * ========================
 * Export all parent management components
 */

export { ParentsList } from "./ParentsList";
export { ParentForm } from "./ParentForm";
export { ParentFormDialog } from "./ParentFormDialog";
export { ParentCreate } from "./ParentCreate";
export { ParentDetail } from "./ParentDetail";
export { ParentEdit } from "./ParentEdit";

// Types
export type {
  ParentDB,
  StudentParentRelationDB,
  ParentWithStudentsDB,
  ParentFormData,
} from "./types";

export {
  RELATIONSHIP_OPTIONS,
  OCCUPATION_OPTIONS,
  INCOME_RANGE_OPTIONS,
  DEFAULT_PARENT_FORM,
} from "./types";
