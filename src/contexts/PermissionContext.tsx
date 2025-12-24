/**
 * Permission Context - EduMunch
 * ===============================
 * 
 * Centralized permission management with caching strategy.
 * Based on BUILD_ROLES.md architecture:
 * - Fetch permissions ONCE at login
 * - Cache in memory + localStorage
 * - Use for entire session (no additional DB calls)
 * 
 * THREE-LAYER PROTECTION:
 * 1. Frontend Route Guards (ProtectedRoute) - checks cached permissions
 * 2. UI Component Guards (hasPermission) - show/hide UI elements
 * 3. Backend Guards (JWT + RLS) - enforced at API/database level
 */

import React, { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  useEffect,
  useMemo 
} from 'react';
import { supabase, TABLES, INDEX_TOKEN } from '@/lib/supabase';
import { isFeatureEnabled, isModuleAvailable } from '@/config/features.config';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface ModulePermissions {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canExport: boolean;
  constraints?: Record<string, unknown>;
}

export interface PermissionCacheEntry {
  moduleCode: string;
  moduleName: string;
  permissions: ModulePermissions;
}

export interface UserPermissionCache {
  userId: string;
  primaryRole: {
    id: string;
    code: string;
    name: string;
    isSystemRole: boolean;
  } | null;
  permissions: Record<string, ModulePermissions>;
  routes: string[];
  timestamp: number;
}

export interface PermissionContextType {
  // Permission cache
  permissions: UserPermissionCache | null;
  isLoading: boolean;
  
  // Permission check methods
  hasPermission: (
    module: string, 
    action: 'view' | 'create' | 'update' | 'delete' | 'approve' | 'export'
  ) => boolean;
  hasModuleAccess: (moduleCode: string) => boolean;
  canAccessRoute: (path: string) => boolean;
  isAdmin: () => boolean;
  
  // Cache management
  setPermissions: (cache: UserPermissionCache) => void;
  clearPermissions: () => void;
  refreshPermissions: (userId: string) => Promise<void>;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const CACHE_KEY = 'edumunch_permissions';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// =============================================================================
// CONTEXT
// =============================================================================

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Build permission cache from raw database response
 */
export function buildPermissionCache(
  userId: string,
  primaryRole: { id: string; code: string; name: string; isSystemRole: boolean } | null,
  rawPermissions: Array<{
    permission_id: string;
    permission_code: string;
    permission_name: string;
    module_code: string;
    module_name: string;
    can_create: boolean;
    can_read: boolean;
    can_update: boolean;
    can_delete: boolean;
    can_approve: boolean;
    can_export: boolean;
    constraints?: Record<string, unknown>;
    resource_path?: string;
    resource_type?: string;
  }>
): UserPermissionCache {
  const cache: UserPermissionCache = {
    userId,
    primaryRole,
    permissions: {},
    routes: [],
    timestamp: Date.now(),
  };

  // Group permissions by module
  rawPermissions.forEach((perm) => {
    const moduleCode = perm.module_code;

    // Initialize module if not exists
    if (!cache.permissions[moduleCode]) {
      cache.permissions[moduleCode] = {
        canView: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canApprove: false,
        canExport: false,
      };
    }

    const modulePerms = cache.permissions[moduleCode];

    // Merge permissions (OR logic - any source grants access)
    if (perm.can_read) modulePerms.canView = true;
    if (perm.can_create) modulePerms.canCreate = true;
    if (perm.can_update) modulePerms.canUpdate = true;
    if (perm.can_delete) modulePerms.canDelete = true;
    if (perm.can_approve) modulePerms.canApprove = true;
    if (perm.can_export) modulePerms.canExport = true;

    // Store constraints if present
    if (perm.constraints) {
      modulePerms.constraints = {
        ...modulePerms.constraints,
        ...perm.constraints,
      };
    }

    // Collect route permissions
    if (perm.resource_type === 'route' && perm.can_read && perm.resource_path) {
      if (!cache.routes.includes(perm.resource_path)) {
        cache.routes.push(perm.resource_path);
      }
    }
  });

  return cache;
}

/**
 * Load permission cache from localStorage
 */
function loadCacheFromStorage(): UserPermissionCache | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed: UserPermissionCache = JSON.parse(cached);
    
    // Check if cache is expired
    if (Date.now() - parsed.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

/**
 * Save permission cache to localStorage
 */
function saveCacheToStorage(cache: UserPermissionCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to save permission cache:', error);
  }
}

// =============================================================================
// PROVIDER
// =============================================================================

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [permissions, setPermissionsState] = useState<UserPermissionCache | null>(() => 
    loadCacheFromStorage()
  );
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Set permissions and persist to localStorage
   */
  const setPermissions = useCallback((cache: UserPermissionCache) => {
    setPermissionsState(cache);
    saveCacheToStorage(cache);
  }, []);

  /**
   * Clear all cached permissions
   */
  const clearPermissions = useCallback(() => {
    setPermissionsState(null);
    localStorage.removeItem(CACHE_KEY);
  }, []);

  /**
   * Refresh permissions from database
   * Called only when admin changes permissions or on manual refresh
   */
  const refreshPermissions = useCallback(async (userId: string) => {
    if (!supabase) return;

    setIsLoading(true);
    try {
      // Call the permission resolution function
      const { data: rawPermissions, error } = await supabase.rpc(
        `get_user_permissions_${INDEX_TOKEN}`,
        { p_user_id: userId }
      );

      if (error) {
        console.error('Failed to refresh permissions:', error);
        return;
      }

      // Get current primary role from cache
      const primaryRole = permissions?.primaryRole || null;

      // Build new cache
      const newCache = buildPermissionCache(userId, primaryRole, rawPermissions || []);
      setPermissions(newCache);
    } catch (error) {
      console.error('Error refreshing permissions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [permissions?.primaryRole, setPermissions]);

  /**
   * Check if user has specific permission for a module
   * ADMIN role bypasses all permission checks
   */
  const hasPermission = useCallback((
    module: string,
    action: 'view' | 'create' | 'update' | 'delete' | 'approve' | 'export'
  ): boolean => {
    // No permissions = no access
    if (!permissions) return false;

    // ADMIN bypass - full access during development and production
    if (permissions.primaryRole?.code === 'ADMIN') {
      return true;
    }

    // Check if feature is enabled first
    if (!isModuleAvailable(module)) {
      return false;
    }

    // Check module permissions
    const modulePerms = permissions.permissions[module];
    if (!modulePerms) return false;

    switch (action) {
      case 'view': return modulePerms.canView;
      case 'create': return modulePerms.canCreate;
      case 'update': return modulePerms.canUpdate;
      case 'delete': return modulePerms.canDelete;
      case 'approve': return modulePerms.canApprove;
      case 'export': return modulePerms.canExport;
      default: return false;
    }
  }, [permissions]);

  /**
   * Check if user has any access to a module
   */
  const hasModuleAccess = useCallback((moduleCode: string): boolean => {
    if (!permissions) return false;
    
    // ADMIN bypass
    if (permissions.primaryRole?.code === 'ADMIN') {
      return isModuleAvailable(moduleCode);
    }

    // Check if feature is enabled
    if (!isModuleAvailable(moduleCode)) {
      return false;
    }

    // Check if user has any permission on this module
    const modulePerms = permissions.permissions[moduleCode];
    if (!modulePerms) return false;

    return modulePerms.canView || modulePerms.canCreate || 
           modulePerms.canUpdate || modulePerms.canDelete ||
           modulePerms.canApprove || modulePerms.canExport;
  }, [permissions]);

  /**
   * Check if user can access a specific route path
   */
  const canAccessRoute = useCallback((path: string): boolean => {
    if (!permissions) return false;
    
    // ADMIN bypass
    if (permissions.primaryRole?.code === 'ADMIN') {
      return true;
    }

    // Check cached routes
    return permissions.routes.includes(path);
  }, [permissions]);

  /**
   * Check if user is Admin
   */
  const isAdmin = useCallback((): boolean => {
    return permissions?.primaryRole?.code === 'ADMIN';
  }, [permissions]);

  // Memoize context value
  const contextValue = useMemo<PermissionContextType>(() => ({
    permissions,
    isLoading,
    hasPermission,
    hasModuleAccess,
    canAccessRoute,
    isAdmin,
    setPermissions,
    clearPermissions,
    refreshPermissions,
  }), [
    permissions,
    isLoading,
    hasPermission,
    hasModuleAccess,
    canAccessRoute,
    isAdmin,
    setPermissions,
    clearPermissions,
    refreshPermissions,
  ]);

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
};

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Main hook for permission context
 */
export function usePermissions(): PermissionContextType {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}

/**
 * Hook for checking module-specific permissions
 * Returns all CRUD permissions for a module
 */
export function useModulePermissions(moduleCode: string): ModulePermissions & { isAdmin: boolean } {
  const { hasPermission, isAdmin } = usePermissions();
  
  return useMemo(() => ({
    canView: hasPermission(moduleCode, 'view'),
    canCreate: hasPermission(moduleCode, 'create'),
    canUpdate: hasPermission(moduleCode, 'update'),
    canDelete: hasPermission(moduleCode, 'delete'),
    canApprove: hasPermission(moduleCode, 'approve'),
    canExport: hasPermission(moduleCode, 'export'),
    isAdmin: isAdmin(),
  }), [moduleCode, hasPermission, isAdmin]);
}
