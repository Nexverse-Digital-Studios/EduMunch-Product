/**
 * Sidebar Configuration Types
 * ============================
 * 
 * Types for user sidebar preferences stored in localStorage.
 * Supports two layout styles:
 * 1. Dropdown - Collapsible groups (default EduMunch style)
 * 2. Sections - Flat sections with accent-colored headers (Living Hub style)
 */

// ==========================================
// LAYOUT TYPES
// ==========================================

/**
 * Sidebar display style options
 * - dropdown: Collapsible groups with chevron arrows
 * - sections: Flat sections with accent-colored category headers
 */
export type SidebarDisplayStyle = 'dropdown' | 'sections';

// ==========================================
// CONFIGURATION TYPES
// ==========================================

/**
 * Route visibility configuration for a single route
 */
export interface RouteVisibility {
  /** Route path (e.g., '/students') */
  path: string;
  /** Whether this route is visible in sidebar */
  isVisible: boolean;
}

/**
 * Group visibility configuration
 */
export interface GroupVisibility {
  /** Group ID (e.g., 'user_management') */
  groupId: string;
  /** Whether the group is expanded by default (for dropdown style) */
  isExpanded: boolean;
}

/**
 * Complete sidebar configuration stored in localStorage
 */
export interface SidebarConfig {
  /** Version for cache invalidation */
  version: string;
  
  /** Display style: 'dropdown' or 'sections' */
  displayStyle: SidebarDisplayStyle;
  
  /** Routes visibility map - only stores non-default values to save space */
  hiddenRoutes: string[];
  
  /** Groups that should be collapsed by default (dropdown mode) */
  collapsedGroups: string[];
  
  /** Timestamp for cache management */
  updatedAt: number;
}

/**
 * Route item for configuration UI
 */
export interface ConfigurableRoute {
  /** Route path */
  path: string;
  /** Display label */
  label: string;
  /** Module code for permission check */
  moduleCode: string;
  /** Parent group ID */
  groupId: string;
  /** Parent group name */
  groupName: string;
  /** Icon name */
  icon: string;
  /** Whether this is a system route (always visible) */
  isSystemRoute: boolean;
  /** Current visibility state */
  isVisible: boolean;
}

/**
 * Group for configuration UI
 */
export interface ConfigurableGroup {
  /** Group ID */
  id: string;
  /** Group display name */
  name: string;
  /** Group icon */
  icon: string;
  /** Routes in this group */
  routes: ConfigurableRoute[];
  /** Whether group is expanded in dropdown mode */
  isExpanded: boolean;
}

// ==========================================
// DEFAULTS
// ==========================================

export const SIDEBAR_CONFIG_VERSION = '1.0.0';
export const SIDEBAR_CONFIG_KEY = 'edumunch_sidebar_config';

export const DEFAULT_SIDEBAR_CONFIG: SidebarConfig = {
  version: SIDEBAR_CONFIG_VERSION,
  displayStyle: 'dropdown',
  hiddenRoutes: [],
  collapsedGroups: [],
  updatedAt: Date.now(),
};

// System routes that are always visible and cannot be hidden
export const SYSTEM_ROUTES = ['/', '/dashboard', '/profile'];
