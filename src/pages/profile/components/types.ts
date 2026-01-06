export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joinDate: string;
  branch: string;
}

export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  weeklyDigest: boolean;
  attendanceAlerts: boolean;
  paymentReminders: boolean;
  systemUpdates: boolean;
}
