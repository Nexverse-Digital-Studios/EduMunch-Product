/**
 * Supabase Edge Function: register-fcm-token
 * 
 * Purpose: Register or update FCM token for a user's device
 * Called when user logs in or app starts
 * 
 * Request Body:
 * {
 *   user_id: string,
 *   fcm_token: string,
 *   platform: 'android' | 'ios' | 'web',
 *   index_token: string
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   token_id: string
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
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Parse request body
    const { user_id, fcm_token, platform, index_token } = await req.json()

    console.log(`📱 FCM token registration request`)
    console.log(`   User ID: ${user_id}`)
    console.log(`   Platform: ${platform}`)
    console.log(`   Index Token: ${index_token}`)

    // Validation
    if (!user_id || !fcm_token || !platform || !index_token) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: user_id, fcm_token, platform, index_token' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!['android', 'ios', 'web'].includes(platform)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid platform. Must be: android, ios, or web' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user exists in users table
    const usersTable = `users_${index_token}`
    const { data: userData, error: userError } = await supabaseClient
      .from(usersTable)
      .select('user_id')
      .eq('user_id', user_id)
      .single()

    if (userError || !userData) {
      console.error('❌ User not found:', user_id)
      return new Response(
        JSON.stringify({ 
          error: `User not found in ${usersTable}` 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`✅ User verified in ${usersTable}`)

    // Upsert FCM token (insert or update if exists)
    const tokensTable = `fcm_tokens_${index_token}`
    const { data, error } = await supabaseClient
      .from(tokensTable)
      .upsert(
        {
          user_id: user_id,
          fcm_token: fcm_token,
          platform: platform,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,fcm_token',
        }
      )
      .select()

    if (error) {
      console.error('❌ Failed to register FCM token:', error)
      throw error
    }

    console.log(`✅ FCM token registered successfully in ${tokensTable}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'FCM token registered successfully',
        token_id: data?.[0]?.token_id || null,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('❌ Error registering FCM token:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to register FCM token',
        details: error.toString(),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
