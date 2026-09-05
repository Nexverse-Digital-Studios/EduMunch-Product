/**
 * User Onboarding Service
 * ========================
 * Handles complete user onboarding: auth user → users table → user_roles → entity table
 * 
 * Uses session save/restore pattern to avoid logging out the admin.
 * NO EDGE FUNCTION REQUIRED - works entirely from frontend.
 */

import { supabase, INDEX_TOKEN } from '@/lib/supabase';

export type EntityType = 'student' | 'parent' | 'teacher' | 'employee';

export interface OnboardUserRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role_code: string;
  entity_type: EntityType;
  entity_data: Record<string, any>;
}

export interface OnboardUserResponse {
  success: boolean;
  user_id?: string;
  auth_user_id?: string;
  entity_id?: string;
  role_id?: string;
  message?: string;
  error?: string;
}

/**
 * Creates a new user with auth credentials and role assignment.
 * Uses session save/restore to prevent admin logout.
 * 
 * Flow:
 * 1. Save current admin session
 * 2. Call supabase.auth.signUp() to create auth user
 * 3. Immediately restore admin session
 * 4. Create users table entry
 * 5. Create user_roles entry
 * 6. Create entity-specific record (student/parent/teacher/employee)
 * 
 * @param request - The onboarding request data
 * @returns Promise<OnboardUserResponse>
 */
export async function onboardUser(request: OnboardUserRequest): Promise<OnboardUserResponse> {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase client not configured',
    };
  }

  let auth_user_id: string | null = null;
  let user_id: string | null = null;
  let entity_id: string | null = null;
  let role_id: string | null = null;

  try {
    // Step 0: Save the current admin session BEFORE signUp
    const { data: sessionData } = await supabase.auth.getSession();
    const adminSession = sessionData.session;
    
    if (!adminSession) {
      return { success: false, error: 'No active admin session found. Please log in again.' };
    }

    // Store tokens for restoration
    const adminAccessToken = adminSession.access_token;
    const adminRefreshToken = adminSession.refresh_token;

    // Step 1: Create auth user using signUp
    console.log('Creating auth user for:', request.email);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: request.email,
      password: request.password,
      options: {
        data: {
          full_name: request.full_name,
          phone: request.phone,
        },
      },
    });

    // Step 2: IMMEDIATELY restore admin session (before any other operations)
    console.log('Restoring admin session...');
    const { error: restoreError } = await supabase.auth.setSession({
      access_token: adminAccessToken,
      refresh_token: adminRefreshToken,
    });

    if (restoreError) {
      console.error('Failed to restore admin session:', restoreError);
      // This is critical - if we can't restore, inform the user
      return {
        success: false,
        error: 'Session restoration failed. Please refresh the page and log in again.',
        auth_user_id: authData?.user?.id,
      };
    }

    // Now check if auth user creation succeeded
    if (authError) {
      console.error('Auth user creation failed:', authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create auth user - no user returned' };
    }

    auth_user_id = authData.user.id;
    console.log('Auth user created:', auth_user_id);

    // Step 3: Get the role ID from roles table
    const { data: roleData, error: roleError } = await supabase
      .from(`roles_${INDEX_TOKEN}`)
      .select('id')
      .eq('role_code', request.role_code)
      .single();

    if (roleError || !roleData) {
      console.error('Role lookup failed:', roleError);
      return { 
        success: false, 
        error: `Role '${request.role_code}' not found in database. Please ensure the role exists.`,
        auth_user_id 
      };
    }

    role_id = roleData.id;
    console.log('Found role:', role_id);

    // Step 4: Create entry in users table
    const { data: userData, error: userError } = await supabase
      .from(`users_${INDEX_TOKEN}`)
      .insert({
        auth_user_id,
        email: request.email,
        full_name: request.full_name,
        phone: request.phone || null,
        primary_role_id: role_id,
        is_active: true,
      })
      .select('id')
      .single();

    if (userError) {
      console.error('Users table insert failed:', userError);
      return { 
        success: false, 
        error: `Failed to create user record: ${userError.message}`,
        auth_user_id 
      };
    }

    user_id = userData.id;
    console.log('User record created:', user_id);

    // Step 5: Create user_roles entry (use upsert to avoid duplicate key errors)
    const { error: userRoleError } = await supabase
      .from(`user_roles_${INDEX_TOKEN}`)
      .upsert({
        user_id,
        role_id,
        is_primary: true,
      }, {
        onConflict: 'user_id,role_id',
        ignoreDuplicates: true,
      });

    if (userRoleError) {
      console.error('User roles upsert failed:', userRoleError);
      // Continue - this is not critical, we can add it later
    }

    // Step 6: Create entity-specific record (student/parent/teacher/employee)
    const entityTable = `${request.entity_type}s_${INDEX_TOKEN}`;
    const entityPayload = {
      ...request.entity_data,
      user_id, // Link to the users table
    };

    console.log('Creating entity in table:', entityTable);
    const { data: entityResult, error: entityError } = await supabase
      .from(entityTable)
      .insert(entityPayload)
      .select('id')
      .single();

    if (entityError) {
      console.error('Entity insert failed:', entityError);
      return { 
        success: false, 
        error: `Failed to create ${request.entity_type} record: ${entityError.message}`,
        auth_user_id,
        user_id 
      };
    }

    entity_id = entityResult.id;
    console.log('Entity created:', entity_id);

    return {
      success: true,
      auth_user_id,
      user_id,
      entity_id,
      role_id,
      message: `${request.entity_type} onboarded successfully`,
    };

  } catch (err) {
    console.error('Onboarding service error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
      auth_user_id: auth_user_id || undefined,
      user_id: user_id || undefined,
    };
  }
}

/**
 * Helper function to generate a random password
 * Useful when admin wants to auto-generate password for users
 */
export function generatePassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  const all = lowercase + uppercase + numbers + special;
  
  let password = '';
  // Ensure at least one of each type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Role code mappings for different entity types
 * These must match the role_code values in roles_XXXXX table
 */
export const ROLE_CODES = {
  student: 'student',
  parent: 'parent',
  teacher: 'teacher',
  class_teacher: 'class_teacher',
  // Employee roles vary based on their designation
  employee: {
    default: 'admin', // General staff defaults to admin role
    admin: 'admin',
    principal: 'principal',
    vice_principal: 'vice_principal',
    accountant: 'accountant',
    librarian: 'librarian',
    hr_manager: 'hr_manager',
    transport_manager: 'transport_manager',
    exam_coordinator: 'exam_coordinator',
  },
} as const;

/**
 * Get the appropriate role code for an employee based on designation
 */
export function getEmployeeRoleCode(designation?: string): string {
  if (!designation) return ROLE_CODES.employee.default;
  
  const designationLower = designation.toLowerCase();
  
  if (designationLower.includes('principal') && !designationLower.includes('vice')) {
    return ROLE_CODES.employee.principal;
  }
  if (designationLower.includes('vice principal') || designationLower.includes('vice-principal')) {
    return ROLE_CODES.employee.vice_principal;
  }
  if (designationLower.includes('account')) return ROLE_CODES.employee.accountant;
  if (designationLower.includes('librar')) return ROLE_CODES.employee.librarian;
  if (designationLower.includes('hr') || designationLower.includes('human resource')) {
    return ROLE_CODES.employee.hr_manager;
  }
  if (designationLower.includes('transport')) return ROLE_CODES.employee.transport_manager;
  if (designationLower.includes('exam') || designationLower.includes('coordinator')) {
    return ROLE_CODES.employee.exam_coordinator;
  }
  
  return ROLE_CODES.employee.default;
}
