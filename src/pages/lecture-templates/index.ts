/**
 * Lecture Templates Module
 * =========================
 * 
 * Manages reusable lecture timing templates for scheduling.
 * 
 * Database Table: lecture_templates_${INDEX_TOKEN}
 * 
 * Features:
 * - Create and manage lecture templates
 * - Set default times and durations
 * - Assign default subjects and teachers
 * - Day-of-week specific templates
 * 
 * Routes:
 * - /lecture-templates - List all templates
 * - /lecture-templates/create - Create new template
 * - /lecture-templates/:id - View template details
 * - /lecture-templates/:id/edit - Edit template
 */

export * from "./components";
