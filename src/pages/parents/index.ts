/**
 * Parents Module
 * ==============
 * Module for managing parents and guardians
 *
 * Routes:
 * - /parents - List all parents
 * - /parents/create - Add new parent
 * - /parents/:id - View parent details
 * - /parents/:id/edit - Edit parent details
 */

export {
  ParentsList,
  ParentForm,
  ParentCreate,
  ParentDetail,
  ParentEdit,
} from "./components";

export type {
  ParentDB,
  StudentParentRelationDB,
  ParentWithStudentsDB,
  ParentFormData,
} from "./components";
