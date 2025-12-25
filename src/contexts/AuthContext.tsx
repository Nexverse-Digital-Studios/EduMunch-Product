/**
 * Auth Context - EduMunch
 * ========================
 * Handles authentication, user profile, and permission management
 * 
 * Sign Up Flow:
 * 1. Create auth user in Supabase Auth
 * 2. Get or create Admin role in roles table
 * 3. Create user profile in users table with primary_role_id
 * 4. Create user_roles entry
 * 5. Cache permissions locally
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, TABLES, INDEX_TOKEN } from '@/lib/supabase';
import { UserProfile, UserPermissionCache, UserRole } from '@/types/user';

interface AuthContextType {
  // Auth state
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  
  // User profile & permissions
  userProfile: UserProfile | null;
  permissions: UserPermissionCache | null;
  
  // Auth actions
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  
  // Permission helpers
  hasPermission: (permissionCode: string) => boolean;
  hasModuleAccess: (moduleCode: string) => boolean;
  isAdmin: () => boolean;
  
  // Refresh user data
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<UserPermissionCache | null>(null);
  
  const isConfigured = isSupabaseConfigured;

  /**
   * Fetch user profile with primary role from database
   */
  const fetchUserProfile = useCallback(async (authUserId: string): Promise<UserProfile | null> => {
    console.log('[AuthContext] fetchUserProfile called for:', authUserId);
    if (!supabase) return null;

    try {
      console.log('[AuthContext] Fetching user profile from:', TABLES.USERS);
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select(`
          id,
          auth_user_id,
          email,
          full_name,
          phone,
          is_active,
          primary_role_id,
          index_token,
          created_at,
          updated_at
        `)
        .eq('auth_user_id', authUserId)
        .single();

      if (error) {
        console.error('[AuthContext] Error fetching user profile:', error);
        return null;
      }

      console.log('[AuthContext] User profile fetched:', {
        id: data?.id,
        email: data?.email,
        primaryRoleId: data?.primary_role_id,
      });

      // Fetch primary role if exists
      let primaryRole: UserRole | null = null;
      if (data?.primary_role_id) {
        console.log('[AuthContext] Fetching primary role:', data.primary_role_id);
        const { data: roleData } = await supabase
          .from(TABLES.ROLES)
          .select('id, role_code, role_name, description, is_system_role')
          .eq('id', data.primary_role_id)
          .single();
        
        primaryRole = roleData;
        console.log('[AuthContext] Primary role fetched:', roleData?.role_code);
      }

      return {
        ...data,
        primary_role: primaryRole,
      } as UserProfile;
    } catch (err) {
      console.error('[AuthContext] Error in fetchUserProfile:', err);
      return null;
    }
  }, []);

  /**
   * Build permission cache for the user
   */
  const buildPermissionCache = useCallback(async (profile: UserProfile): Promise<UserPermissionCache> => {
    const cache: UserPermissionCache = {
      userId: profile.id,
      primaryRole: profile.primary_role ? {
        id: profile.primary_role.id,
        code: profile.primary_role.role_code,
        name: profile.primary_role.role_name,
        isSystemRole: profile.primary_role.is_system_role,
      } : null,
      permissions: [],
      modules: [],
      timestamp: Date.now(),
      version: '1.0.0', // Match PermissionContext version
    };

    // For ADMIN, we don't need to fetch permissions - they bypass everything
    if (profile.primary_role?.role_code === 'ADMIN') {
      return cache;
    }

    // TODO: Fetch actual permissions from role_permissions for non-admin users
    // This will be implemented in Phase 4
    
    return cache;
  }, []);

  /**
   * Load user data after auth state change
   */
  const loadUserData = useCallback(async (authUser: User) => {
    const profile = await fetchUserProfile(authUser.id);
    if (profile) {
      setUserProfile(profile);
      const permCache = await buildPermissionCache(profile);
      setPermissions(permCache);
      
      // Store in localStorage for persistence
      localStorage.setItem('edumunch_user_profile', JSON.stringify(profile));
      localStorage.setItem('edumunch_permissions', JSON.stringify(permCache));
    }
  }, [fetchUserProfile, buildPermissionCache]);

  /**
   * Refresh user profile from database
   */
  const refreshUserProfile = useCallback(async () => {
    if (user) {
      await loadUserData(user);
    }
  }, [user, loadUserData]);

  /**
   * Get or create Admin role
   */
  const getOrCreateAdminRole = async (): Promise<string | null> => {
    if (!supabase) return null;

    // First, try to find existing ADMIN role
    const { data: existingRole } = await supabase
      .from(TABLES.ROLES)
      .select('id')
      .eq('role_code', 'ADMIN')
      .single();

    if (existingRole) {
      return existingRole.id;
    }

    // Create ADMIN role if it doesn't exist
    const { data: newRole, error } = await supabase
      .from(TABLES.ROLES)
      .insert({
        role_code: 'ADMIN',
        role_name: 'Administrator',
        description: 'System administrator with full access to all modules and features',
        is_system_role: true,
        is_active: true,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating Admin role:', error);
      return null;
    }

    return newRole?.id || null;
  };

  /**
   * Sign Up - Creates auth user, user profile, and assigns Admin role
   */
  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: new Error('Authentication service is not configured. Please contact the administrator.') };
    }

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: fullName },
        },
      });

      if (authError) {
        return { error: authError };
      }

      if (!authData.user) {
        return { error: new Error('Failed to create user account') };
      }

      // 2. Get or create Admin role
      const adminRoleId = await getOrCreateAdminRole();
      if (!adminRoleId) {
        console.error('Failed to get or create Admin role');
        return { error: new Error('Failed to set up user role. Please contact support.') };
      }

      // 3. Create user profile in users table
      const { data: userProfileData, error: profileError } = await supabase
        .from(TABLES.USERS)
        .insert({
          auth_user_id: authData.user.id,
          email: email,
          full_name: fullName,
          primary_role_id: adminRoleId,
          index_token: INDEX_TOKEN,
          is_active: true,
        })
        .select('id')
        .single();

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        return { error: new Error('Failed to create user profile. Please contact support.') };
      }

      // 4. Create user_roles entry
      const { error: userRoleError } = await supabase
        .from(TABLES.USER_ROLES)
        .insert({
          user_id: userProfileData.id,
          role_id: adminRoleId,
          is_primary: true,
        });

      if (userRoleError) {
        console.error('Error creating user role assignment:', userRoleError);
        // Non-critical error - user can still use the app
      }

      return { error: null };
    } catch (err) {
      console.error('Sign up error:', err);
      return { error: err as Error };
    }
  };

  /**
   * Sign In - Authenticates user and loads profile
   */
  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: new Error('Authentication service is not configured. Please contact the administrator.') };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  /**
   * Sign Out - Clears all user data and triggers cross-tab sync
   */
  const signOut = async () => {
    console.log('[AuthContext] Signing out...');
    
    if (supabase) {
      await supabase.auth.signOut();
    }
    
    // Clear state
    setUser(null);
    setSession(null);
    setUserProfile(null);
    setPermissions(null);
    
    // Clear localStorage - this will trigger 'storage' event in other tabs
    localStorage.removeItem('edumunch_user_profile');
    localStorage.removeItem('edumunch_permissions');
    
    console.log('[AuthContext] Signed out successfully');
  };

  /**
   * Permission helper - checks if user has a specific permission
   */
  const hasPermission = useCallback((permissionCode: string): boolean => {
    if (!permissions) return false;
    if (permissions.primaryRole?.code === 'ADMIN') return true;
    return permissions.permissions.includes(permissionCode);
  }, [permissions]);

  /**
   * Module access helper
   */
  const hasModuleAccess = useCallback((moduleCode: string): boolean => {
    if (!permissions) return false;
    if (permissions.primaryRole?.code === 'ADMIN') return true;
    return permissions.modules.includes(moduleCode);
  }, [permissions]);

  /**
   * Admin check helper
   */
  const isAdminCheck = useCallback((): boolean => {
    return permissions?.primaryRole?.code === 'ADMIN';
  }, [permissions]);

  /**
   * Auth state listener
   */
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      console.error('Supabase is not configured. Please set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_INDEX_TOKEN in your .env file.');
      setLoading(false);
      return;
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid potential race conditions
          setTimeout(() => loadUserData(session.user), 0);
        } else {
          setUserProfile(null);
          setPermissions(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadUserData(session.user);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        loading, 
        isConfigured,
        userProfile,
        permissions,
        signUp, 
        signIn, 
        signOut,
        hasPermission,
        hasModuleAccess,
        isAdmin: isAdminCheck,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
