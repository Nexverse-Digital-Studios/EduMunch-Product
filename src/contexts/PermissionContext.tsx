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
  version?: string; // Cache version for invalidation
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
const CACHE_VERSION = '1.0.0'; // Increment to invalidate all caches
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const BACKGROUND_REFRESH_THRESHOLD = 60 * 60 * 1000; // 1 hour - refresh if cache older than this

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
    version: CACHE_VERSION,
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
    
    // Check cache version - invalidate if outdated
    if (!parsed.version || parsed.version !== CACHE_VERSION) {
      console.log('[PermissionContext] Cache version mismatch, clearing...');
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    // Check if cache is expired
    if (Date.now() - parsed.timestamp > CACHE_DURATION) {
      console.log('[PermissionContext] Cache expired, clearing...');
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    console.log('[PermissionContext] Loaded valid cache from storage');
    return parsed;
  } catch (error) {
    console.error('[PermissionContext] Error loading cache:', error);
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
    console.log('[PermissionContext] Cache saved to storage');
  } catch (error) {
    console.error('[PermissionContext] Failed to save permission cache:', error);
  }
}

/**
 * Check if cache needs background refresh (non-blocking)
 */
function shouldRefreshCache(cache: UserPermissionCache | null): boolean {
  if (!cache) return false;
  const age = Date.now() - cache.timestamp;
  return age > BACKGROUND_REFRESH_THRESHOLD && age < CACHE_DURATION;
}

/**
 * Clear all cache data (used for logout and cross-tab sync)
 */
function clearAllCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem('edumunch_user_profile');
    console.log('[PermissionContext] All cache cleared');
  } catch (error) {
    console.error('[PermissionContext] Error clearing cache:', error);
  }
}

// =============================================================================
// PROVIDER
// =============================================================================

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  console.log('[PermissionProvider] Initializing...');
  
  const [permissions, setPermissionsState] = useState<UserPermissionCache | null>(() => {
    const cached = loadCacheFromStorage();
    console.log('[PermissionProvider] Loading from cache:', {
      cached: !!cached,
      userId: cached?.userId,
      modules: cached ? Object.keys(cached.permissions).length : 0,
    });
    return cached;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('[PermissionProvider] Permissions state changed:', {
      hasPermissions: !!permissions,
      userId: permissions?.userId,
      timestamp: permissions?.timestamp,
    });
  }, [permissions]);

  /**
   * Cross-tab synchronization - listen for storage changes
   * This ensures all tabs stay in sync when user logs out or permissions change
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Only handle our cache key
      if (e.key !== CACHE_KEY) return;

      console.log('[PermissionProvider] Storage change detected:', {
        key: e.key,
        hasNewValue: !!e.newValue,
        hasOldValue: !!e.oldValue,
      });

      // If cache was cleared in another tab, clear here too
      if (e.newValue === null && e.oldValue !== null) {
        console.log('[PermissionProvider] Cache cleared in another tab, syncing...');
        setPermissionsState(null);
        return;
      }

      // If cache was updated in another tab, load the new value
      if (e.newValue) {
        try {
          const newCache = JSON.parse(e.newValue) as UserPermissionCache;
          console.log('[PermissionProvider] Cache updated in another tab, syncing...');
          setPermissionsState(newCache);
        } catch (error) {
          console.error('[PermissionProvider] Error parsing updated cache:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * Background cache refresh for long sessions
   * Runs every 5 minutes to check if cache needs refresh
   */
  useEffect(() => {
    if (!permissions) return;

    const checkAndRefresh = async () => {
      if (shouldRefreshCache(permissions) && !isLoading) {
        console.log('[PermissionProvider] Cache aging, refreshing in background...');
        try {
          await refreshPermissions(permissions.userId);
        } catch (error) {
          console.error('[PermissionProvider] Background refresh failed:', error);
          // Don't clear cache on background refresh failure - keep using current cache
        }
      }
    };

    // Check every 5 minutes
    const intervalId = setInterval(checkAndRefresh, 5 * 60 * 1000);
    
    // Also check on visibility change (when user comes back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndRefresh();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [permissions, isLoading]);

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
    console.log('[PermissionProvider] Clearing permissions...');
    setPermissionsState(null);
    clearAllCache();
  }, []);

  /**
   * Refresh permissions from database
   * Called only when admin changes permissions or on manual refresh
   */
  const refreshPermissions = useCallback(async (userId: string, retryCount = 0) => {
    if (!supabase) {
      console.warn('[PermissionProvider] Cannot refresh - Supabase not configured');
      return;
    }

    setIsLoading(true);
    try {
      console.log('[PermissionProvider] Refreshing permissions for user:', userId);
      
      // Call the permission resolution function
      const { data: rawPermissions, error } = await supabase.rpc(
        `get_user_permissions_${INDEX_TOKEN}`,
        { p_user_id: userId }
      );

      if (error) {
        console.error('[PermissionProvider] Failed to refresh permissions:', error);
        
        // Retry once on network errors
        if (retryCount === 0 && error.message?.includes('network')) {
          console.log('[PermissionProvider] Network error, retrying...');
          setTimeout(() => refreshPermissions(userId, 1), 2000);
          return;
        }
        
        // On error, keep using existing cache if available
        if (!permissions) {
          console.error('[PermissionProvider] No existing cache, cannot recover');
        }
        return;
      }

      // Get current primary role from cache or fetch it
      const primaryRole = permissions?.primaryRole || null;

      // Build new cache
      const newCache = buildPermissionCache(userId, primaryRole, rawPermissions || []);
      setPermissions(newCache);
      console.log('[PermissionProvider] Permissions refreshed successfully');
    } catch (error) {
      console.error('[PermissionProvider] Error refreshing permissions:', error);
      // Keep existing cache on error
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
    if (!permissions) {
      console.log(`[hasPermission] No permissions cached for ${module}:${action}`);
      return false;
    }

    // ADMIN bypass - full access during development and production
    if (permissions.primaryRole?.code === 'ADMIN') {
      console.log(`[hasPermission] ADMIN bypass - allowing ${module}:${action}`);
      return true;
    }

    // Check if feature is enabled first
    if (!isModuleAvailable(module)) {
      console.log(`[hasPermission] Module ${module} not available`);
      return false;
    }

    // Check module permissions
    const modulePerms = permissions.permissions[module];
    if (!modulePerms) {
      console.log(`[hasPermission] No permissions record for module ${module}`);
      return false;
    }

    const result = (() => {
      switch (action) {
        case 'view': return modulePerms.canView;
        case 'create': return modulePerms.canCreate;
        case 'update': return modulePerms.canUpdate;
        case 'delete': return modulePerms.canDelete;
        case 'approve': return modulePerms.canApprove;
        case 'export': return modulePerms.canExport;
        default: return false;
      }
    })();
    
    console.log(`[hasPermission] ${module}:${action} = ${result}`);
    return result;
  }, [permissions]);

  /**
   * Check if user has any access to a module
   */
  const hasModuleAccess = useCallback((moduleCode: string): boolean => {
    if (!permissions) {
      console.log(`[hasModuleAccess] No permissions cached for module ${moduleCode}`);
      return false;
    }
    
    // ADMIN bypass
    if (permissions.primaryRole?.code === 'ADMIN') {
      console.log(`[hasModuleAccess] ADMIN bypass - allowing module ${moduleCode}`);
      return isModuleAvailable(moduleCode);
    }

    // Check if feature is enabled
    if (!isModuleAvailable(moduleCode)) {
      console.log(`[hasModuleAccess] Module ${moduleCode} feature not enabled`);
      return false;
    }

    // Check if user has any permission on this module
    const modulePerms = permissions.permissions[moduleCode];
    if (!modulePerms) {
      console.log(`[hasModuleAccess] No permission record for module ${moduleCode}`);
      return false;
    }

    const hasAccess = modulePerms.canView || modulePerms.canCreate || 
           modulePerms.canUpdate || modulePerms.canDelete ||
           modulePerms.canApprove || modulePerms.canExport;
    
    console.log(`[hasModuleAccess] Module ${moduleCode} access = ${hasAccess}`);
    return hasAccess;
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
