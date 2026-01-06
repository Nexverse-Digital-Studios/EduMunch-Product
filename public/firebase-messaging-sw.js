/**
 * Firebase Cloud Messaging Service Worker
 * Handles background notifications when app is not in focus
 * Configured with actual Firebase project details from .env
 */

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in service worker with actual configuration
const firebaseConfig = {
  apiKey: "AIzaSyBArOgNNsAhnFP8IxsnHZGDniVKbaJ6D4g",
  authDomain: "test-notification-all-platform.firebaseapp.com",
  projectId: "test-notification-all-platform",
  storageBucket: "test-notification-all-platform.firebasestorage.app",
  messagingSenderId: "267874216772",
  appId: "1:267874216772:web:78c906489d64cfb4954511"
};

firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  // Extract notification details
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: payload.data?.notification_id || Date.now().toString(),
    data: payload.data || {},
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  // Get notification data
  const data = event.notification.data || {};
  const actionUrl = data.action_url || data.navigate_to || '/';

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              data: data,
              url: actionUrl,
            });
            return client;
          }
        }

        // If app is not open, open it
        if (clients.openWindow) {
          return clients.openWindow(actionUrl);
        }
      })
  );
});

// Service worker installation
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker installed');
  self.skipWaiting();
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker activated');
  event.waitUntil(clients.claim());
});

// Handle push events (alternative to onBackgroundMessage)
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push event received');
  
  if (!event.data) {
    console.log('Push event has no data');
    return;
  }

  try {
    const payload = event.data.json();
    console.log('Push payload:', payload);

    const notificationTitle = payload.notification?.title || 'Notification';
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: payload.data || {},
    };

    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    );
  } catch (error) {
    console.error('Error handling push event:', error);
  }
});

console.log('[firebase-messaging-sw.js] Service Worker loaded successfully with Firebase project: test-notification-all-platform');
