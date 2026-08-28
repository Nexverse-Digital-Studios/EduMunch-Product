/**
 * Notification Services - Main Export File
 * 
 * Usage:
 * import { sendNotification, getStudentsForAssignment, initializeFCM } from '@/services/notifications'
 */

// Export filtering functions
export {
  getStudentsForAssignment,
  getAllTeachers,
  getAllStaff,
  getParentsOfStudents,
  getStudentsWithPendingFees,
  getStudentsByGrade,
  getUsersWithPermission,
  getParentsOfAbsentStudents,
  getAllStudents,
  getSpecificUsers,
} from './filters';

// Export sender functions
export {
  sendNotification,
  sendNotificationWithToast,
  sendBatchNotifications,
} from './sender';

// Export FCM functions
export {
  initializeFCM,
  requestNotificationPermission,
  getFCMToken,
  registerFCMToken,
  deactivateFCMToken,
  deleteFCMToken,
  isFCMSupported,
  getNotificationPermissionStatus,
  setupForegroundMessageHandler,
} from './fcmService';

// Export types
export type { NotificationPayload, NotificationResponse } from './sender';
