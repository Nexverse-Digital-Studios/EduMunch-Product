/**
 * User Types & Interfaces
 * ========================
 * Type definitions for user, role, and permission data structures
 */

export interface UserRole {
  id: string;
  role_code: string;
  role_name: string;
  description?: string;
  is_system_role: boolean;
}

export interface UserProfile {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  primary_role_id?: string;
  primary_role?: UserRole | null;
  index_token: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  module_code: string;
  module_name: string;
  permission_code: string;
  permission_name: string;
}

export interface UserPermissionCache {
  userId: string;
  primaryRole: {
    id: string;
    code: string;
    name: string;
    isSystemRole: boolean;
  } | null;
  permissions: string[]; // Array of permission codes like 'users.view', 'users.create'
  modules: string[]; // Array of module codes the user has access to
}

/**
 * Check if user has a specific permission
 */
export const hasPermission = (cache: UserPermissionCache | null, permissionCode: string): boolean => {
  if (!cache) return false;
  
  // Admin bypass - ADMIN role has all permissions during development
  if (cache.primaryRole?.code === 'ADMIN') {
    return true;
  }
  
  return cache.permissions.includes(permissionCode);
};

/**
 * Check if user has access to a module
 */
export const hasModuleAccess = (cache: UserPermissionCache | null, moduleCode: string): boolean => {
  if (!cache) return false;
  
  // Admin bypass
  if (cache.primaryRole?.code === 'ADMIN') {
    return true;
  }
  
  return cache.modules.includes(moduleCode);
};

/**
 * Check if user is Admin
 */
export const isAdmin = (cache: UserPermissionCache | null): boolean => {
  return cache?.primaryRole?.code === 'ADMIN';
};
