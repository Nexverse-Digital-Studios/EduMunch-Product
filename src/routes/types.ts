/**
 * EduMunch Route & Sidebar Types
 * ================================
 * 
 * Type definitions for the routing system and permission-based navigation.
 */

// ==========================================
// PERMISSION TYPES
// ==========================================

/**
 * Available permission actions for each module
 */
export type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'approve' | 'export';

/**
 * Feature tier levels
 * - Tier 1: Core features (basic school operations)
 * - Tier 2: Extended features (LMS, transport, HR)
 * - Tier 3: Advanced features (analytics, admissions, multi-branch)
 */
export type FeatureTier = 1 | 2 | 3;

// ==========================================
// ROUTE CONFIGURATION TYPES
// ==========================================

/**
 * Configuration for a single route
 */
export interface RouteConfig {
  /** URL path (e.g., '/students', '/students/:id/edit') */
  path: string;
  
  /** Display title for the route */
  title: string;
  
  /** Module code for permission check (e.g., 'students', 'attendance') */
  module: string;
  
  /** Required permission action to access this route */
  action: PermissionAction;
  
  /** Feature tier (1, 2, or 3) */
  tier: FeatureTier;
  
  /** Whether this route is public (no authentication required) */
  isPublic?: boolean;
  
  /** Whether to show this route in sidebar navigation */
  showInSidebar?: boolean;
  
  /** Icon name (Lucide React icon) for sidebar display */
  icon?: string;
  
  /** Description of the route functionality */
  description?: string;
}

// ==========================================
// SIDEBAR CONFIGURATION TYPES
// ==========================================

/**
 * Configuration for a module in the sidebar
 */
export interface ModuleSidebarConfig {
  /** Module code (matches RouteConfig.module) */
  moduleCode: string;
  
  /** Display name for the module */
  displayName: string;
  
  /** Icon name (Lucide React icon) */
  icon: string;
  
  /** Base route path for navigation */
  basePath: string;
  
  /** Order within the group */
  order: number;
  
  /** Sub-items to show when expanded (based on permissions) */
  subItems?: ModuleSubItem[];
}

/**
 * Sub-item within a module (e.g., "Add Student" under "Students")
 */
export interface ModuleSubItem {
  /** Display title */
  title: string;
  
  /** Route path */
  path: string;
  
  /** Required permission action */
  action: PermissionAction;
  
  /** Icon name (optional) */
  icon?: string;
}

/**
 * Configuration for a sidebar group (collection of modules)
 */
export interface SidebarGroup {
  /** Unique identifier for the group */
  id: string;
  
  /** Display name for the group */
  groupName: string;
  
  /** Icon name (Lucide React icon) */
  icon: string;
  
  /** Order in sidebar (lower = higher) */
  order: number;
  
  /** Feature tier (for filtering) */
  tier: FeatureTier;
  
  /** List of modules in this group */
  modules: ModuleSidebarConfig[];
  
  /** Whether this group is always visible (e.g., Dashboard) */
  alwaysVisible?: boolean;
}

// ==========================================
// PERMISSION CACHE TYPES (from AuthContext)
// ==========================================

/**
 * Permission object for a single module
 */
export interface ModulePermissions {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canExport: boolean;
}

/**
 * User's complete permission cache
 */
export interface UserPermissionCache {
  userId: string;
  primaryRole: {
    id: string;
    code: string;
    name: string;
  };
  permissions: Record<string, ModulePermissions>;
  allowedRoutes: string[];
  timestamp: number;
}

// ==========================================
// HELPER TYPES
// ==========================================

/**
 * Route lookup result
 */
export interface RouteMatch {
  route: RouteConfig;
  params: Record<string, string>;
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  hasPermission: boolean;
  module: string;
  action: PermissionAction;
  reason?: string;
}
