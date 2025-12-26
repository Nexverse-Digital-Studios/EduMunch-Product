/**
 * ID Cards Components Index
 * =========================
 * Export all ID card management components
 */

export { IDCardsDashboard } from "./IDCardsDashboard";
export { StudentIDCards } from "./StudentIDCards";
export { StaffIDCards } from "./StaffIDCards";
export { IDCardTemplates } from "./IDCardTemplates";
export { IDCardPreview } from "./IDCardPreview";

// Types
export type {
  StudentForIDCard,
  StaffForIDCard,
  ClassInfo,
  SectionInfo,
  IDCardTemplate,
  IDCardDesign,
  IDCardGenerationRequest,
} from "./types";

export {
  DEFAULT_STUDENT_TEMPLATE,
  DEFAULT_STAFF_TEMPLATE,
  BLOOD_GROUPS,
} from "./types";
