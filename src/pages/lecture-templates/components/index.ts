/**
 * Lecture Templates Components Index
 * ====================================
 * Exports all lecture template components and types
 * 
 * CONSOLIDATED: Now uses modal dialogs for create/edit/view
 */

// Types
export * from "./types";

// Dialog Components (Consolidated CRUD)
export { LectureTemplateFormDialog } from "./LectureTemplateFormDialog";
export { LectureTemplateDetailDialog } from "./LectureTemplateDetailDialog";

// Legacy Components (may be removed)
export { default as LectureTemplateForm } from "./LectureTemplateForm";

// Pages
export { default as LectureTemplatesList } from "./LectureTemplatesList";

// Legacy page exports (routes removed, kept for reference)
// export { default as LectureTemplateCreate } from "./LectureTemplateCreate";
// export { default as LectureTemplateDetail } from "./LectureTemplateDetail";
// export { default as LectureTemplateEdit } from "./LectureTemplateEdit";
