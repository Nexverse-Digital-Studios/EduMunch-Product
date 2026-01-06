/**
 * Supabase Edge Function: send-notification
 * 
 * Purpose: Receives user_ids and notification data, fetches FCM tokens, sends to Firebase
 * 
 * Request Body:
 * {
 *   school_token: string,
 *   user_ids: string[],
 *   title: string,
 *   body: string,
 *   data?: object
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   sent_count: number,
 *   failed_count: number,
 *   total_users: number,
 *   total_tokens: number,
 *   index_token: string
 * }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @deno-types="npm:@types/node"
import { initializeApp, cert, getApps } from 'npm:firebase-admin@12.0.0/app'
import { getMessaging } from 'npm:firebase-admin@12.0.0/messaging'

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
    // INITIALIZE CLIENTS
    // ============================================
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Initialize Firebase Admin SDK (only once)
    if (!getApps().length) {
      const firebaseConfigStr = Deno.env.get('FIREBASE_SERVICE_ACCOUNT') ?? ''
      
      if (!firebaseConfigStr) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set')
      }
      
      let firebaseConfig
      try {
        firebaseConfig = JSON.parse(firebaseConfigStr)
      } catch (parseError) {
        throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT JSON: ${parseError}`)
      }
      
      // Validate required fields
      if (!firebaseConfig.project_id || typeof firebaseConfig.project_id !== 'string') {
        throw new Error('Firebase service account missing required field: project_id. Service account must be a valid Firebase Admin SDK JSON key file.')
      }
      
      if (!firebaseConfig.private_key || typeof firebaseConfig.private_key !== 'string') {
        throw new Error('Firebase service account missing required field: private_key')
      }
      
      if (!firebaseConfig.client_email || typeof firebaseConfig.client_email !== 'string') {
        throw new Error('Firebase service account missing required field: client_email')
      }
      
      console.log('🔥 Firebase Admin SDK initializing...')
      console.log(`   Project ID: ${firebaseConfig.project_id}`)
      
      // Ensure all fields are properly typed as strings for cert()
      const serviceAccount = {
        projectId: firebaseConfig.project_id,
        privateKey: firebaseConfig.private_key,
        clientEmail: firebaseConfig.client_email,
      }
      
      initializeApp({
        credential: cert(serviceAccount),
      })
      console.log('🔥 Firebase Admin SDK initialized successfully')
    }

    // ============================================
    // PARSE REQUEST
    // ============================================
    
    const {
      school_token,
      user_ids,
      title,
      body,
      data = {},
    } = await req.json()

    console.log(`📨 Notification request received`)
    console.log(`   School: ${school_token}`)
    console.log(`   Recipients: ${user_ids?.length || 0} users`)
    console.log(`   Title: ${title}`)

    // ============================================
    // VALIDATION
    // ============================================
    
    if (!school_token || typeof school_token !== 'string') {
      return new Response(
        JSON.stringify({ error: 'school_token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: 'user_ids must be a non-empty array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!body || typeof body !== 'string' || body.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'body is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`✅ Validation passed`)

    // ============================================
    // STEP 1: Validate school exists and get school_id
    // ============================================
    
    // Note: school_token is actually the index_token
    const index_token = school_token.toLowerCase() // Ensure lowercase for consistency
    
    const { data: schoolData, error: schoolError } = await supabaseClient
      .from('hub_school_registry')
      .select('id, index_token, school_name, is_active')
      .eq('index_token', index_token)
      .single()

    if (schoolError || !schoolData) {
      console.error('❌ School not found:', index_token)
      return new Response(
        JSON.stringify({ error: `Invalid school token: ${index_token}` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!schoolData.is_active) {
      console.error('❌ School is inactive:', index_token)
      return new Response(
        JSON.stringify({ error: `School is inactive: ${index_token}` }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const school_id = schoolData.id
    console.log(`🏫 School: ${schoolData.school_name} (${school_id})`)
    console.log(`🔑 Index Token: ${index_token}`)

    // ============================================
    // STEP 2: Fetch FCM tokens from sharded table
    // ============================================
    
    const tokensTable = `fcm_tokens_${index_token}`
    console.log(`📊 Querying table: ${tokensTable}`)

    const { data: fcmTokensData, error: tokensError } = await supabaseClient
      .from(tokensTable)
      .select('fcm_token, user_id, platform')
      .in('user_id', user_ids)

    if (tokensError) {
      console.error('❌ Error fetching FCM tokens:', tokensError)
      throw tokensError
    }

    if (!fcmTokensData || fcmTokensData.length === 0) {
      console.log('⚠️ No FCM tokens found for provided user_ids')
      return new Response(
        JSON.stringify({
          error: 'No FCM tokens found for provided user_ids',
          hint: 'Users may not have registered their devices yet',
          total_users: user_ids.length,
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const tokens = fcmTokensData.map(t => t.fcm_token)
    console.log(`🔑 Found ${tokens.length} FCM tokens`)
    console.log(`   Android: ${fcmTokensData.filter(t => t.platform === 'android').length}`)
    console.log(`   iOS: ${fcmTokensData.filter(t => t.platform === 'ios').length}`)
    console.log(`   Web: ${fcmTokensData.filter(t => t.platform === 'web').length}`)

    // ============================================
    // STEP 3: Send to Firebase Cloud Messaging
    // ============================================
    
    console.log(`📡 Sending to Firebase...`)

    const messaging = getMessaging()
    const response = await messaging.sendEachForMulticast({
      tokens: tokens,
      notification: {
        title: title,
        body: body,
      },
      data: {
        ...data,
        school_token: school_token,
        index_token: index_token,
        timestamp: new Date().toISOString(),
      },
    })

    console.log(`✅ Firebase response:`)
    console.log(`   Success: ${response.successCount}`)
    console.log(`   Failed: ${response.failureCount}`)

    // ============================================
    // STEP 4: Store notification history
    // ============================================
    
    const notificationsTable = `notifications_${index_token}`
    console.log(`💾 Storing history in: ${notificationsTable}`)

    const notificationRecords = user_ids.map((user_id) => ({
      user_id: user_id,
      title: title,
      body: body,
      data: data,
      read: false,
      created_at: new Date().toISOString(),
    }))

    const { error: insertError } = await supabaseClient
      .from(notificationsTable)
      .insert(notificationRecords)

    if (insertError) {
      console.error('⚠️ Failed to store notification history:', insertError)
      // Don't fail the request, notifications were already sent
    } else {
      console.log(`✅ Stored ${user_ids.length} notification records`)
    }

    // ============================================
    // STEP 5: Clean up failed tokens
    // ============================================
    
    if (response.failureCount > 0) {
      console.log(`🗑️ Cleaning up ${response.failureCount} failed tokens...`)
      
      const failedTokens: string[] = []
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx])
          console.log(`   ❌ Token failed: ${tokens[idx].substring(0, 20)}... - ${resp.error?.message}`)
        }
      })

      if (failedTokens.length > 0) {
        const { error: deleteError } = await supabaseClient
          .from(tokensTable)
          .delete()
          .in('fcm_token', failedTokens)
        
        if (deleteError) {
          console.error('⚠️ Failed to delete invalid tokens:', deleteError)
        } else {
          console.log(`✅ Removed ${failedTokens.length} invalid tokens`)
        }
      }
    }

    // ============================================
    // RETURN SUCCESS RESPONSE
    // ============================================
    
    return new Response(
      JSON.stringify({
        success: true,
        sent_count: response.successCount,
        failed_count: response.failureCount,
        total_users: user_ids.length,
        total_tokens: tokens.length,
        index_token: index_token,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('❌ Edge Function Error:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.toString(),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
