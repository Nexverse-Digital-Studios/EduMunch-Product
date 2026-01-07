/**
 * Role-Specific Dashboards - EduMunch
 * =====================================
 * 
 * This module exports all role-specific dashboard pages.
 * Each role has its own dedicated dashboard with relevant
 * information and quick actions.
 * 
 * Dashboard Mapping:
 * - AdminDashboard: super_admin, principal, ADMIN
 * - TeacherDashboard: teacher
 * - StaffDashboard: academic_coordinator, accountant, hr_manager, exam_controller, receptionist, librarian, transport_manager
 * - StudentDashboard: student
 * - ParentDashboard: parent (uses existing ParentDashboardPage)
 * - CustomDashboard: Any custom roles not matching above
 */

export { AdminDashboard } from "./AdminDashboard";
export { TeacherDashboard } from "./TeacherDashboard";
export { StaffDashboard } from "./StaffDashboard";
export { StudentDashboard } from "./StudentDashboard";
export { CustomDashboard } from "./CustomDashboard";
export { DashboardRouter } from "./DashboardRouter";
