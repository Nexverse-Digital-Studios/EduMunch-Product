/**
 * ID Cards Module
 * ===============
 * Module for generating and managing ID cards
 *
 * Routes:
 * - /id-cards - Dashboard
 * - /id-cards/students - Student ID cards list
 * - /id-cards/students/generate - Generate student ID cards
 * - /id-cards/staff - Staff ID cards list
 * - /id-cards/staff/generate - Generate staff ID cards
 * - /id-cards/templates - ID card templates
 * - /id-cards/bulk-generate - Bulk generation
 */

export {
  IDCardsDashboard,
  StudentIDCards,
  StaffIDCards,
  IDCardTemplates,
  IDCardPreview,
} from "./components";

export type {
  StudentForIDCard,
  StaffForIDCard,
  ClassInfo,
  SectionInfo,
  IDCardTemplate,
  IDCardDesign,
} from "./components";
