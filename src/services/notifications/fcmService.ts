/**
 * FCM Service - Frontend Service for Firebase Cloud Messaging
 * Handles getting FCM token and registering with backend
 */

import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { supabase } from '@/lib/supabase';

const INDEX_TOKEN = import.meta.env.VITE_INDEX_TOKEN;
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Get messaging instance
let messaging: any = null;

try {
  // Only initialize on web (not on server-side)
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    console.log('🔄 Initializing Firebase Messaging...');
    import('@/lib/firebase').then(({ app }) => {
      try {
        messaging = getMessaging(app);
        console.log('✅ Firebase Messaging initialized successfully');
      } catch (err) {
        console.error('❌ Failed to get messaging instance:', err);
      }
    }).catch((err) => {
      console.error('❌ Failed to import Firebase app:', err);
    });
  } else {
    console.log('⚠️ Service Worker not supported on this environment');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Messaging:', error);
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      return true;
    } else if (permission === 'denied') {
      console.log('❌ Notification permission denied');
      return false;
    } else {
      console.log('⚠️ Notification permission dismissed');
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Get FCM token from Firebase
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    if (!messaging) {
      console.log('❌ Firebase Messaging not initialized');
      console.log('   Check: 1) src/lib/firebase.ts exists and configured');
      console.log('   Check: 2) VITE_FIREBASE_PROJECT_ID in .env');
      console.log('   Check: 3) public/firebase-messaging-sw.js exists');
      return null;
    }

    // Check if service worker is registered with timeout
    console.log('📋 Checking Service Worker registration...');
    
    // First check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Workers are not supported in this browser');
      return null;
    }

    // Try to get existing registrations
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log(`   Found ${registrations.length} service worker registration(s)`);
    registrations.forEach((reg, idx) => {
      console.log(`   - SW ${idx + 1}: ${reg.scope}`);
    });

    // Set a timeout for getting the ready promise
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Service Worker ready timeout after 5s')), 5000)
    );

    let registration: ServiceWorkerContainer['ready'];
    try {
      registration = await Promise.race([
        navigator.serviceWorker.ready,
        timeoutPromise
      ]);
    } catch (err) {
      console.log('❌ Service Worker not ready or timeout exceeded');
      console.log('   Error:', err instanceof Error ? err.message : String(err));
      console.log('   Troubleshooting:');
      console.log('   1) Check if public/firebase-messaging-sw.js exists');
      console.log('   2) Check browser Network tab for SW script errors');
      console.log('   3) Check Application → Service Workers in DevTools');
      console.log('   4) Try clearing browser cache and reloading');
      return null;
    }
    
    if (!registration) {
      console.log('❌ Service Worker registration object is null/undefined');
      return null;
    }

    console.log('✅ Service Worker ready');
    console.log('📋 Requesting FCM token with VAPID key...');
    
    if (!VAPID_KEY) {
      console.log('❌ VAPID_KEY is not configured');
      console.log('   Check: VITE_FIREBASE_VAPID_KEY in .env');
      return null;
    }

    console.log('   VAPID Key found:', VAPID_KEY.substring(0, 20) + '...');

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log('✅ FCM Token obtained:', token.substring(0, 20) + '...');
      console.log('   Full token length:', token.length, 'characters');
      return token;
    } else {
      console.log('⚠️ No FCM token available - Firebase may not be properly configured');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
    }
    console.log('   Possible causes:');
    console.log('   1) Service Worker not registered or ready');
    console.log('   2) Firebase Messaging failed to initialize');
    console.log('   3) VAPID key invalid or missing');
    console.log('   4) Browser does not support Web Push');
    return null;
  }
}

/**
 * Get device information for registration
 */
function getDeviceInfo() {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  
  let devicePlatform: 'android' | 'ios' | 'web' = 'web';
  let deviceName = 'Unknown Device';
  let deviceModel = 'Web Browser';
  let osVersion = 'Unknown';

  // Detect platform
  if (/android/i.test(userAgent)) {
    devicePlatform = 'android';
    deviceName = 'Android Device';
    const match = userAgent.match(/Android\s([0-9.]*)/);
    osVersion = match ? `Android ${match[1]}` : 'Android';
  } else if (/iPad|iPhone|iPod/.test(userAgent)) {
    devicePlatform = 'ios';
    deviceName = /iPad/.test(userAgent) ? 'iPad' : 'iPhone';
    const match = userAgent.match(/OS\s([0-9_]*)/);
    osVersion = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
  } else {
    // Desktop browsers
    if (/Chrome/.test(userAgent)) {
      deviceModel = 'Chrome Browser';
    } else if (/Firefox/.test(userAgent)) {
      deviceModel = 'Firefox Browser';
    } else if (/Safari/.test(userAgent)) {
      deviceModel = 'Safari Browser';
    } else if (/Edge/.test(userAgent)) {
      deviceModel = 'Edge Browser';
    }
    
    deviceName = platform;
    osVersion = navigator.userAgentData?.platform || platform;
  }

  return {
    platform: devicePlatform,
    device_name: deviceName,
    device_model: deviceModel,
    os_version: osVersion,
    app_version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  };
}

/**
 * Register FCM token with backend database
 */
export async function registerFCMToken(userId: string, fcmToken: string): Promise<boolean> {
  try {
    console.log(`📤 Registering FCM token for user: ${userId}`);
    console.log(`   Token: ${fcmToken.substring(0, 20)}...`);

    const deviceInfo = getDeviceInfo();
    console.log(`   Device Info:`, deviceInfo);

    // Insert or update FCM token in database
    console.log(`📋 Upserting to table: fcm_tokens_${INDEX_TOKEN}`);
    const { data, error } = await supabase
      .from(`fcm_tokens_${INDEX_TOKEN}`)
      .upsert(
        {
          user_id: userId,
          fcm_token: fcmToken,
          ...deviceInfo,
          is_active: true,
          last_used_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,fcm_token',
        }
      )
      .select();

    if (error) {
      console.error('❌ Error registering FCM token:', error);
      console.error('   Error code:', error.code);
      console.error('   Error message:', error.message);
      console.error('   Error details:', error.details);
      console.log('   Possible causes:');
      console.log('   1) RLS policy blocking insert');
      console.log('   2) Table does not exist: fcm_tokens_1emaet');
      console.log('   3) User does not exist in users_1emaet');
      console.log('   4) Foreign key constraint violated');
      return false;
    }

    console.log('✅ FCM token registered successfully');
    console.log('   Response data:', data);
    return true;
  } catch (error) {
    console.error('❌ Error in registerFCMToken:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
    }
    return false;
  }
}

/**
 * Complete initialization flow:
 * 1. Request permission
 * 2. Get FCM token
 * 3. Register with backend
 */
export async function initializeFCM(userId: string): Promise<boolean> {
  try {
    console.log('🔔 Initializing FCM for user:', userId);
    console.log('═══════════════════════════════════════════════════════');

    // Step 1: Request permission
    console.log('STEP 1: Requesting notification permission...');
    const hasPermission = await requestNotificationPermission();
    
    if (!hasPermission) {
      console.log('❌ STEP 1 FAILED: Cannot initialize FCM without permission');
      console.log('   If you see "Allow/Block" dialog, click "Allow"');
      console.log('   If no dialog appeared, check if notifications are blocked in browser settings');
      console.log('═══════════════════════════════════════════════════════');
      return false;
    }

    console.log('✅ STEP 1 PASSED: Permission granted');

    // Step 2: Get FCM token
    console.log('STEP 2: Getting FCM token from Firebase...');
    const fcmToken = await getFCMToken();
    
    if (!fcmToken) {
      console.log('❌ STEP 2 FAILED: Cannot get FCM token');
      console.log('   Check the error messages above for details');
      console.log('═══════════════════════════════════════════════════════');
      return false;
    }

    console.log('✅ STEP 2 PASSED: FCM token obtained');

    // Step 3: Register with backend
    console.log('STEP 3: Registering token with database...');
    const registered = await registerFCMToken(userId, fcmToken);
    
    if (!registered) {
      console.log('❌ STEP 3 FAILED: Failed to register FCM token with backend');
      console.log('   Check the error messages above for database issues');
      console.log('═══════════════════════════════════════════════════════');
      return false;
    }

    console.log('✅ STEP 3 PASSED: Token registered in database');

    // Step 4: Setup foreground message handler
    console.log('STEP 4: Setting up foreground message handler...');
    setupForegroundMessageHandler();
    console.log('✅ STEP 4 PASSED: Message handler ready');

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ FCM INITIALIZATION COMPLETE - Ready to receive notifications!');
    console.log('═══════════════════════════════════════════════════════');
    return true;
  } catch (error) {
    console.error('❌ CRITICAL ERROR during FCM initialization:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
    }
    console.log('═══════════════════════════════════════════════════════');
    return false;
  }
}

/**
 * Handle messages when app is in foreground
 */
export function setupForegroundMessageHandler() {
  if (!messaging) {
    console.log('Messaging not initialized, skipping foreground handler');
    return;
  }

  onMessage(messaging, (payload: MessagePayload) => {
    console.log('📨 Foreground message received:', payload);

    const { notification, data } = payload;

    if (notification) {
      // Show browser notification
      showBrowserNotification(
        notification.title || 'Notification',
        notification.body || '',
        notification.image,
        data
      );
    }
  });

  console.log('✅ Foreground message handler setup');
}

/**
 * Show browser notification
 */
function showBrowserNotification(
  title: string,
  body: string,
  icon?: string,
  data?: any
) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const notification = new Notification(title, {
    body,
    icon: icon || '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: data?.notification_id || Date.now().toString(),
    data: data,
    requireInteraction: false,
  });

  notification.onclick = (event) => {
    event.preventDefault();
    
    // Handle notification click
    if (data?.action_url) {
      window.open(data.action_url, '_blank');
    } else if (data?.navigate_to) {
      window.location.href = data.navigate_to;
    }
    
    notification.close();
  };
}

/**
 * Deactivate FCM token (on logout)
 */
export async function deactivateFCMToken(userId: string, fcmToken: string): Promise<boolean> {
  try {
    console.log(`🔕 Deactivating FCM token for user: ${userId}`);

    const { error } = await supabase
      .from(`fcm_tokens_${INDEX_TOKEN}`)
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('fcm_token', fcmToken);

    if (error) {
      console.error('❌ Error deactivating FCM token:', error);
      return false;
    }

    console.log('✅ FCM token deactivated');
    return true;
  } catch (error) {
    console.error('❌ Error in deactivateFCMToken:', error);
    return false;
  }
}

/**
 * Delete FCM token completely (on device uninstall/logout)
 */
export async function deleteFCMToken(userId: string, fcmToken: string): Promise<boolean> {
  try {
    console.log(`🗑️ Deleting FCM token for user: ${userId}`);

    const { error } = await supabase
      .from(`fcm_tokens_${INDEX_TOKEN}`)
      .delete()
      .eq('user_id', userId)
      .eq('fcm_token', fcmToken);

    if (error) {
      console.error('❌ Error deleting FCM token:', error);
      return false;
    }

    console.log('✅ FCM token deleted');
    return true;
  } catch (error) {
    console.error('❌ Error in deleteFCMToken:', error);
    return false;
  }
}

/**
 * Check if FCM is supported in current browser
 */
export function isFCMSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

/**
 * Get current notification permission status
 */
export function getNotificationPermissionStatus(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}
