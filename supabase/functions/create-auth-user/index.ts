/**
 * Supabase Edge Function: create-auth-user
 * 
 * Purpose: Creates an auth user using admin privileges without affecting the calling user's session.
 * This is essential for admin onboarding of students, parents, teachers, and employees.
 * 
 * Request Body:
 * {
 *   email: string,
 *   password: string,
 *   full_name: string,
 *   phone?: string,
 *   role_code: string,      // e.g., 'student', 'parent', 'teacher', 'accountant', etc.
 *   index_token: string,    // School's index token (e.g., '1emaet')
 *   entity_type: 'student' | 'parent' | 'teacher' | 'employee',
 *   entity_data: object     // Role-specific data to insert into respective table
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   user_id: string,        // users_XXXXX table id
 *   auth_user_id: string,   // Supabase auth.users id
 *   entity_id: string,      // students/parents/teachers/employees table id
 *   message?: string,
 *   error?: string
 * }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ============================================
    // INITIALIZE SUPABASE ADMIN CLIENT
    // ============================================
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // ============================================
    // PARSE REQUEST BODY
    // ============================================
    
    const { 
      email, 
      password, 
      full_name, 
      phone,
      role_code, 
      index_token, 
      entity_type,
      entity_data 
    } = await req.json()

    // Validate required fields
    if (!email || !password || !full_name || !role_code || !index_token || !entity_type) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: email, password, full_name, role_code, index_token, entity_type' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate entity_type
    const validEntityTypes = ['student', 'parent', 'teacher', 'employee']
    if (!validEntityTypes.includes(entity_type)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Invalid entity_type. Must be one of: ${validEntityTypes.join(', ')}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Creating ${entity_type} user: ${email} with role: ${role_code}`)

    // ============================================
    // STEP 1: CREATE AUTH USER (using admin API - won't affect caller's session)
    // ============================================
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email so user can log in immediately
      user_metadata: { 
        full_name,
        role_code,
        entity_type
      }
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to create auth user: ${authError.message}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Auth user creation returned no user' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const authUserId = authData.user.id
    console.log(`Auth user created: ${authUserId}`)

    // ============================================
    // STEP 2: GET ROLE ID
    // ============================================
    
    const rolesTable = `roles_${index_token}`
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from(rolesTable)
      .select('id')
      .eq('role_code', role_code.toUpperCase())
      .single()

    if (roleError) {
      console.warn(`Role not found for code: ${role_code}, trying lowercase...`)
      // Try lowercase
      const { data: roleDataLower, error: roleErrorLower } = await supabaseAdmin
        .from(rolesTable)
        .select('id')
        .eq('role_code', role_code.toLowerCase())
        .single()
      
      if (roleErrorLower) {
        console.error('Role lookup error:', roleErrorLower)
        // Cleanup: Delete the auth user we just created
        await supabaseAdmin.auth.admin.deleteUser(authUserId)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Role '${role_code}' not found in roles table` 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      var roleId = roleDataLower?.id
    } else {
      var roleId = roleData?.id
    }

    console.log(`Role ID found: ${roleId}`)

    // ============================================
    // STEP 3: CREATE USER PROFILE IN users_XXXXX
    // ============================================
    
    const usersTable = `users_${index_token}`
    const { data: userData, error: userError } = await supabaseAdmin
      .from(usersTable)
      .insert({
        auth_user_id: authUserId,
        email,
        full_name,
        phone: phone || null,
        primary_role_id: roleId,
        index_token: index_token.toUpperCase(),
        is_active: true,
        is_email_verified: true, // Since we auto-confirmed
      })
      .select('id')
      .single()

    if (userError) {
      console.error('User profile creation error:', userError)
      // Cleanup: Delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(authUserId)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to create user profile: ${userError.message}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = userData.id
    console.log(`User profile created: ${userId}`)

    // ============================================
    // STEP 4: CREATE USER_ROLES ENTRY
    // ============================================
    
    const userRolesTable = `user_roles_${index_token}`
    const { error: userRoleError } = await supabaseAdmin
      .from(userRolesTable)
      .insert({
        user_id: userId,
        role_id: roleId,
        is_primary: true,
      })

    if (userRoleError) {
      console.warn('User role assignment warning:', userRoleError)
      // Don't fail the whole operation, just log warning
    } else {
      console.log('User role assigned successfully')
    }

    // ============================================
    // STEP 5: CREATE ENTITY-SPECIFIC RECORD
    // ============================================
    
    let entityTable: string
    let entityPayload: Record<string, any>

    switch (entity_type) {
      case 'student':
        entityTable = `students_${index_token}`
        entityPayload = {
          user_id: userId,
          ...entity_data,
        }
        break
      case 'parent':
        entityTable = `parents_${index_token}`
        entityPayload = {
          user_id: userId,
          ...entity_data,
        }
        break
      case 'teacher':
        entityTable = `teachers_${index_token}`
        entityPayload = {
          user_id: userId,
          ...entity_data,
        }
        break
      case 'employee':
        entityTable = `employees_${index_token}`
        entityPayload = {
          user_id: userId,
          ...entity_data,
        }
        break
      default:
        // This shouldn't happen due to validation above
        entityTable = ''
        entityPayload = {}
    }

    const { data: entityData, error: entityError } = await supabaseAdmin
      .from(entityTable)
      .insert(entityPayload)
      .select('id')
      .single()

    if (entityError) {
      console.error(`${entity_type} record creation error:`, entityError)
      // Cleanup: Delete user profile and auth user
      await supabaseAdmin.from(usersTable).delete().eq('id', userId)
      await supabaseAdmin.auth.admin.deleteUser(authUserId)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to create ${entity_type} record: ${entityError.message}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const entityId = entityData.id
    console.log(`${entity_type} record created: ${entityId}`)

    // ============================================
    // SUCCESS RESPONSE
    // ============================================
    
    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        auth_user_id: authUserId,
        entity_id: entityId,
        role_id: roleId,
        message: `${entity_type.charAt(0).toUpperCase() + entity_type.slice(1)} created successfully with login credentials`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
