/**
 * Dashboard Router - EduMunch
 * =============================
 * 
 * This component handles role-based dashboard redirection.
 * When a user accesses the root "/" path, they are automatically
 * redirected to their role-specific dashboard.
 * 
 * Role Mappings:
 * - super_admin, principal, ADMIN, admin → /admin/dashboard
 * - teacher → /teacher/dashboard
 * - academic_coordinator, accountant, hr_manager, exam_controller,
 *   receptionist, librarian, transport_manager → /staff/dashboard
 * - student → /student/dashboard
 * - parent → /parent/dashboard
 * - Any other role → /custom/dashboard
 */

import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

// Role to dashboard path mapping
const ADMIN_ROLES = ["super_admin", "principal", "ADMIN", "admin"];
const TEACHER_ROLES = ["teacher"];
const STAFF_ROLES = [
  "academic_coordinator",
  "accountant",
  "hr_manager",
  "exam_controller",
  "receptionist",
  "librarian",
  "transport_manager",
];
const STUDENT_ROLES = ["student"];
const PARENT_ROLES = ["parent"];

/**
 * Get the appropriate dashboard path based on role code
 */
export function getDashboardPathForRole(roleCode: string | undefined | null): string {
  if (!roleCode) {
    return "/custom/dashboard";
  }

  const normalizedRole = roleCode.toLowerCase();

  if (ADMIN_ROLES.map(r => r.toLowerCase()).includes(normalizedRole)) {
    return "/admin/dashboard";
  }

  if (TEACHER_ROLES.map(r => r.toLowerCase()).includes(normalizedRole)) {
    return "/teacher/dashboard";
  }

  if (STAFF_ROLES.map(r => r.toLowerCase()).includes(normalizedRole)) {
    return "/staff/dashboard";
  }

  if (STUDENT_ROLES.map(r => r.toLowerCase()).includes(normalizedRole)) {
    return "/student/dashboard";
  }

  if (PARENT_ROLES.map(r => r.toLowerCase()).includes(normalizedRole)) {
    return "/parent/dashboard";
  }

  // Default to custom dashboard for any other role
  return "/custom/dashboard";
}

/**
 * Check if a role is an admin role
 */
export function isAdminRole(roleCode: string | undefined | null): boolean {
  if (!roleCode) return false;
  return ADMIN_ROLES.map(r => r.toLowerCase()).includes(roleCode.toLowerCase());
}

/**
 * Check if a role is a parent role
 */
export function isParentRole(roleCode: string | undefined | null): boolean {
  if (!roleCode) return false;
  return PARENT_ROLES.map(r => r.toLowerCase()).includes(roleCode.toLowerCase());
}

/**
 * Check if a role is a student role
 */
export function isStudentRole(roleCode: string | undefined | null): boolean {
  if (!roleCode) return false;
  return STUDENT_ROLES.map(r => r.toLowerCase()).includes(roleCode.toLowerCase());
}

/**
 * Check if a role is a teacher role
 */
export function isTeacherRole(roleCode: string | undefined | null): boolean {
  if (!roleCode) return false;
  return TEACHER_ROLES.map(r => r.toLowerCase()).includes(roleCode.toLowerCase());
}

/**
 * Check if a role is a staff role
 */
export function isStaffRole(roleCode: string | undefined | null): boolean {
  if (!roleCode) return false;
  return STAFF_ROLES.map(r => r.toLowerCase()).includes(roleCode.toLowerCase());
}

/**
 * DashboardRouter Component
 * 
 * Renders at "/" and redirects to the appropriate dashboard based on user's role.
 * Shows a loading spinner during redirect.
 */
export function DashboardRouter() {
  const navigate = useNavigate();
  const { userProfile, permissions, loading } = useAuth();

  const roleCode = useMemo(() => {
    return permissions?.primaryRole?.code || userProfile?.primary_role?.role_code || null;
  }, [permissions, userProfile]);

  const dashboardPath = useMemo(() => {
    return getDashboardPathForRole(roleCode);
  }, [roleCode]);

  useEffect(() => {
    if (!loading && dashboardPath) {
      // Use replace to avoid back button issues
      navigate(dashboardPath, { replace: true });
    }
  }, [loading, dashboardPath, navigate]);

  // Show loading spinner while redirecting
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
