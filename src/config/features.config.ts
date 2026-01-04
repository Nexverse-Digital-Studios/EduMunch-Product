/**
 * Feature Configuration - EduMunch
 * ==================================
 * 
 * This file controls which features are available in this deployment.
 * 
 * HOW IT WORKS:
 * - Features set to `true` will show up in the sidebar and have active routes
 * - Features set to `false` will NOT:
 *   1. Appear in the sidebar navigation
 *   2. Have their routes registered (404 if accessed directly)
 *   3. Have any related code executed
 * 
 * TIERS:
 * - TIER 1 (Basic): Core school management features
 * - TIER 2 (Advanced): Extended features for larger institutions
 * - TIER 3 (Premium): Full-featured enterprise capabilities
 * 
 * USAGE:
 * - Import FEATURES object to check if a feature is enabled
 * - Import TIER to check which tier this deployment is on
 * - Use isFeatureEnabled() helper for dynamic checks
 */

// =============================================================================
// DEPLOYMENT TIER CONFIGURATION
// =============================================================================

export type TierLevel = 'tier1' | 'tier2' | 'tier3';

/**
 * Current deployment tier - determines feature availability baseline
 * Overridden by individual feature toggles in FEATURES object
 */
export const TIER: TierLevel = 'tier1';

// =============================================================================
// FEATURE DEFINITIONS
// =============================================================================

export interface FeatureConfig {
  // Core (Always enabled)
  dashboard: boolean;
  profile: boolean;
  
  // User Management (Tier 1)
  users: boolean;
  roles: boolean;
  permissions: boolean;
  
  // Student Management (Tier 1)
  students: boolean;
  parents: boolean;
  admissions: boolean;
  
  // Academic Structure (Tier 1)
  classes: boolean;         // Renamed from 'courses' - Class 1, 2, 3... 12
  sections: boolean;        // Batches/Divisions within a class
  subjects: boolean;
  topics: boolean;
  
  // Staff Management (Tier 1)
  teachers: boolean;
  employees: boolean;
  
  // Attendance (Tier 1)
  attendance: boolean;
  leaveManagement: boolean;
  
  // Timetable (Tier 1)
  timetables: boolean;
  lectureTemplates: boolean;
  
  // Exams & Results (Tier 1)
  exams: boolean;
  results: boolean;
  reportCards: boolean;
  
  // Fee Management (Tier 1)
  fees: boolean;
  payments: boolean;
  
  // Communication (Tier 1)
  announcements: boolean;
  notifications: boolean;
  
  // LMS Features (Tier 2)
  assignments: boolean;
  homework: boolean;
  doubts: boolean;
  lmsContent: boolean;
  
  // Advanced Academic (Tier 2)
  availabilitySlots: boolean;
  ptmRequests: boolean;
  
  // Feedback & Support (Tier 2)
  feedback: boolean;
  grievances: boolean;
  supportTickets: boolean;
  
  // HR & Payroll (Tier 2)
  salaryStructures: boolean;
  payslips: boolean;
  workingHours: boolean;
  
  // Multi-Branch (Tier 3)
  branches: boolean;
  tieUpSchools: boolean;
  
  // Inventory (Tier 3)
  inventory: boolean;
  
  // Advanced Features (Tier 3)
  transport: boolean;
  library: boolean;
  hostel: boolean;
  certificates: boolean;
  idCards: boolean;
  reports: boolean;  // Reports & Analytics dashboard
  
  // Admin Only
  setRoles: boolean;        // Admin route for role/permission management
  systemSettings: boolean;
  dataExport: boolean;
  auditLogs: boolean;
}

// =============================================================================
// FEATURE TOGGLES
// =============================================================================

/**
 * FEATURES - Master toggle object
 * 
 * Set features to true/false based on what this deployment should include.
 * This is the SINGLE SOURCE OF TRUTH for feature availability.
 */
export const FEATURES: FeatureConfig = {
  // ===== CORE (Always Enabled) =====
  dashboard: true,
  profile: true,
  
  // ===== USER MANAGEMENT (Tier 1) =====
  users: true,
  roles: true,
  permissions: true,
  
  // ===== STUDENT MANAGEMENT (Tier 1) =====
  students: true,
  parents: true,
  admissions: true,
  
  // ===== ACADEMIC STRUCTURE (Tier 1) =====
  classes: true,           // Class 1-12 management
  sections: true,          // Sections/Batches management
  subjects: true,
  topics: true,
  
  // ===== STAFF MANAGEMENT (Tier 1) =====
  teachers: true,
  employees: true,
  
  // ===== ATTENDANCE (Tier 1) =====
  attendance: true,
  leaveManagement: true,
  
  // ===== TIMETABLE (Tier 1) =====
  timetables: true,
  lectureTemplates: true,
  
  // ===== EXAMS & RESULTS (Tier 1) =====
  exams: true,
  results: true,
  reportCards: true,
  
  // ===== FEE MANAGEMENT (Tier 1) =====
  fees: true,
  payments: true,
  
  // ===== COMMUNICATION (Tier 1) =====
  announcements: true,
  notifications: true,
  
  // ===== LMS FEATURES (Tier 2) =====
  assignments: true,
  homework: true,
  doubts: true,
  lmsContent: true,
  
  // ===== ADVANCED ACADEMIC (Tier 2) =====
  availabilitySlots: true,
  ptmRequests: true,
  
  // ===== FEEDBACK & SUPPORT (Tier 2) =====
  feedback: true,
  grievances: true,
  supportTickets: true,
  
  // ===== HR & PAYROLL (Tier 2) =====
  salaryStructures: true,
  payslips: true,
  workingHours: true,
  
  // ===== MULTI-BRANCH (Tier 3) =====
  branches: false,          // Disabled - single school deployment
  tieUpSchools: false,      // Disabled - not a coaching center
  
  // ===== INVENTORY (Tier 3) =====
  inventory: true,          // Inventory management - assets, transfers, ledger, petty cash
  
  // ===== ADVANCED FEATURES (Tier 3) =====
  transport: true,          // Transport management - routes, vehicles, drivers
  library: true,            // Library management - books, issues, returns
  hostel: true,             // Hostel management - blocks, rooms, allocations
  certificates: false,
  idCards: true,            // ID Cards management - students, staff, templates
  reports: true,            // Reports & Analytics dashboard
  
  // ===== ADMIN ONLY =====
  setRoles: true,           // Role configuration for Admin
  systemSettings: true,
  dataExport: true,
  auditLogs: false,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a feature is enabled
 * @param featureKey - Key from FEATURES object
 * @returns boolean indicating if feature is enabled
 */
export const isFeatureEnabled = (featureKey: keyof FeatureConfig): boolean => {
  return FEATURES[featureKey] ?? false;
};

/**
 * Get all enabled features
 * @returns Array of enabled feature keys
 */
export const getEnabledFeatures = (): (keyof FeatureConfig)[] => {
  return (Object.keys(FEATURES) as (keyof FeatureConfig)[])
    .filter(key => FEATURES[key]);
};

/**
 * Get all disabled features
 * @returns Array of disabled feature keys
 */
export const getDisabledFeatures = (): (keyof FeatureConfig)[] => {
  return (Object.keys(FEATURES) as (keyof FeatureConfig)[])
    .filter(key => !FEATURES[key]);
};

/**
 * Check if current deployment meets a tier requirement
 * @param requiredTier - Minimum tier required
 * @returns boolean indicating if deployment meets tier
 */
export const meetsTierRequirement = (requiredTier: TierLevel): boolean => {
  const tierOrder: TierLevel[] = ['tier1', 'tier2', 'tier3'];
  return tierOrder.indexOf(TIER) >= tierOrder.indexOf(requiredTier);
};

/**
 * Module to feature mapping for permission checks
 * Maps database module_code to feature config keys
 */
export const MODULE_TO_FEATURE: Record<string, keyof FeatureConfig> = {
  dashboard: 'dashboard',
  profile: 'profile',
  users: 'users',
  roles: 'roles',
  permissions: 'permissions',
  students: 'students',
  parents: 'parents',
  admissions: 'admissions',
  classes: 'classes',
  sections: 'sections',
  subjects: 'subjects',
  topics: 'topics',
  teachers: 'teachers',
  employees: 'employees',
  attendance: 'attendance',
  leave: 'leaveManagement',
  timetable: 'timetables',
  lecture_templates: 'lectureTemplates',
  exams: 'exams',
  marks: 'results',
  report_cards: 'reportCards',
  fees: 'fees',
  payments: 'payments',
  announcements: 'announcements',
  notifications: 'notifications',
  assignments: 'assignments',
  homework: 'homework',
  doubts: 'doubts',
  lms_content: 'lmsContent',
  availability_slots: 'availabilitySlots',
  ptm_requests: 'ptmRequests',
  feedback: 'feedback',
  grievances: 'grievances',
  support_tickets: 'supportTickets',
  salary_structures: 'salaryStructures',
  payslips: 'payslips',
  working_hours: 'workingHours',
  branches: 'branches',
  tie_up_schools: 'tieUpSchools',
  inventory: 'inventory',
  transport: 'transport',
  library: 'library',
  hostel: 'hostel',
  certificates: 'certificates',
  id_cards: 'idCards',
  set_roles: 'setRoles',
  system_settings: 'systemSettings',
  data_export: 'dataExport',
  audit_logs: 'auditLogs',
};

/**
 * Check if a module is available (feature enabled)
 * @param moduleCode - Database module code
 * @returns boolean indicating if module feature is enabled
 */
export const isModuleAvailable = (moduleCode: string): boolean => {
  const featureKey = MODULE_TO_FEATURE[moduleCode];
  if (!featureKey) return true; // Unknown modules default to available
  return FEATURES[featureKey];
};
