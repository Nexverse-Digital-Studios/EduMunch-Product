/**
 * Assignments Module Index
 * =========================
 * Exports all assignment pages for route registration
 * 
 * Note: Unlike other modules, Assignments uses modals for CRUD operations:
 * - CreateTemplateModal: Create new assignments
 * - SubmissionsModal: View and grade submissions  
 * - AssignModal: Assign to students
 * 
 * These modals are located at @/components/assignments/
 */

export { default as AssignmentsList } from "./AssignmentsList";

// Re-export types for external use
export type { Assignment } from "./components";
