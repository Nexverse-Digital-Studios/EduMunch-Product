/**
 * Teachers Module
 * ================
 * 
 * Manages teacher profiles and their subject/section assignments.
 * 
 * Database Tables:
 * - teachers_${INDEX_TOKEN} - Teacher profiles with personal/professional info
 * - teacher_subject_sections_${INDEX_TOKEN} - Subject-section assignments
 * 
 * Features:
 * - Teacher registration and profile management
 * - Subject and section assignments
 * - Teacher timetable view
 * - Bulk upload functionality
 * - Export capabilities
 * 
 * Routes:
 * - /teachers - List all teachers
 * - /teachers/create - Add new teacher
 * - /teachers/:id - View teacher details
 * - /teachers/:id/edit - Edit teacher
 * - /teachers/:id/subjects - View assigned subjects
 * - /teachers/:id/timetable - View teacher timetable
 * - /teachers/bulk-upload - Bulk upload teachers
 * - /teachers/export - Export teachers data
 */

export * from "./components";
