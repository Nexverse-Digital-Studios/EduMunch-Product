/**
 * Notification Sender Service
 * Common function that validates data and calls the Edge Function
 * Used by all filtering functions to send notifications
 */

import { supabase } from '@/lib/supabase';

const SCHOOL_TOKEN = import.meta.env.VITE_SCHOOL_TOKEN;

export interface NotificationPayload {
  user_ids: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface NotificationResponse {
  success: boolean;
  sent_count: number;
  failed_count: number;
  total_users: number;
  total_tokens: number;
  index_token?: string;
  error?: string;
}

/**
 * Main function to send notifications
 * Validates data and calls the Supabase Edge Function
 */
export async function sendNotification(
  payload: NotificationPayload
): Promise<NotificationResponse> {
  try {
    console.log(`📤 Preparing to send notification...`);

    // ============================================
    // VALIDATION LAYER
    // ============================================

    // Check if school token is configured
    if (!SCHOOL_TOKEN) {
      throw new Error('SCHOOL_TOKEN not configured in environment variables');
    }

    // Validate user_ids
    if (!payload.user_ids || !Array.isArray(payload.user_ids)) {
      throw new Error('user_ids must be an array');
    }

    if (payload.user_ids.length === 0) {
      throw new Error('user_ids array is empty - no recipients to send notification to');
    }

    // Validate title
    if (!payload.title || typeof payload.title !== 'string' || payload.title.trim() === '') {
      throw new Error('title is required and must be a non-empty string');
    }

    // Validate body
    if (!payload.body || typeof payload.body !== 'string' || payload.body.trim() === '') {
      throw new Error('body is required and must be a non-empty string');
    }

    // Log validation success
    console.log(`✅ Validation passed`);
    console.log(`   Recipients: ${payload.user_ids.length} users`);
    console.log(`   Title: ${payload.title}`);
    console.log(`   Body: ${payload.body.substring(0, 50)}${payload.body.length > 50 ? '...' : ''}`);

    // ============================================
    // CALL EDGE FUNCTION
    // ============================================

    const requestBody = {
      school_token: SCHOOL_TOKEN,
      user_ids: payload.user_ids,
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
    };

    console.log(`📡 Calling Edge Function: send-notification`);

    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: requestBody,
    });

    // ============================================
    // HANDLE RESPONSE
    // ============================================

    if (error) {
      console.error('❌ Edge Function returned error:', error);
      throw new Error(`Edge Function error: ${error.message}`);
    }

    if (!data) {
      throw new Error('Edge Function returned empty response');
    }

    // Check if Edge Function returned an error in data
    if (data.error) {
      console.error('❌ Edge Function business logic error:', data.error);
      return {
        success: false,
        sent_count: 0,
        failed_count: 0,
        total_users: payload.user_ids.length,
        total_tokens: 0,
        error: data.error,
      };
    }

    // Success response
    console.log(`✅ Notification sent successfully!`);
    console.log(`   Sent: ${data.sent_count} notifications`);
    console.log(`   Failed: ${data.failed_count} notifications`);
    console.log(`   Total tokens: ${data.total_tokens}`);

    return {
      success: true,
      sent_count: data.sent_count || 0,
      failed_count: data.failed_count || 0,
      total_users: data.total_users || payload.user_ids.length,
      total_tokens: data.total_tokens || 0,
      index_token: data.index_token,
    };

  } catch (error: any) {
    console.error('❌ sendNotification failed:', error);

    return {
      success: false,
      sent_count: 0,
      failed_count: 0,
      total_users: payload.user_ids?.length || 0,
      total_tokens: 0,
      error: error.message || 'Unknown error occurred',
    };
  }
}

/**
 * Helper function to send notification with automatic error handling
 * Shows user-friendly toast messages
 */
export async function sendNotificationWithToast(
  payload: NotificationPayload,
  showToast?: (message: string, type: 'success' | 'error') => void
): Promise<boolean> {
  const result = await sendNotification(payload);

  if (result.success) {
    const message = `Notification sent to ${result.sent_count} device${result.sent_count !== 1 ? 's' : ''}`;
    if (showToast) {
      showToast(message, 'success');
    } else {
      console.log(`✅ ${message}`);
    }
    return true;
  } else {
    const message = result.error || 'Failed to send notification';
    if (showToast) {
      showToast(message, 'error');
    } else {
      console.error(`❌ ${message}`);
    }
    return false;
  }
}

/**
 * Batch send notifications (for sending multiple different notifications)
 * Useful when you need to send different messages to different groups
 */
export async function sendBatchNotifications(
  payloads: NotificationPayload[]
): Promise<NotificationResponse[]> {
  console.log(`📤 Sending batch of ${payloads.length} notifications`);

  const results: NotificationResponse[] = [];

  for (const payload of payloads) {
    const result = await sendNotification(payload);
    results.push(result);

    // Small delay between batches to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const totalSent = results.reduce((sum, r) => sum + r.sent_count, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed_count, 0);

  console.log(`✅ Batch complete: ${totalSent} sent, ${totalFailed} failed`);

  return results;
}
