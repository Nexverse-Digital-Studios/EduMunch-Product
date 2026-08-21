/**
 * Parent-Admin Grievance Types
 * ================================
 * Type definitions for the grievance and chat system
 */

export type GrievanceCategory = 
  | 'Academic' 
  | 'Behavioral' 
  | 'Attendance' 
  | 'Homework' 
  | 'Bullying'
  | 'Health'
  | 'General' 
  | 'Other';

export type GrievancePriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export type GrievanceStatus = 
  | 'Open' 
  | 'In Progress' 
  | 'Resolved' 
  | 'Closed' 
  | 'Escalated';

export type MessageSenderType = 'Parent' | 'Admin';

export interface GrievanceDB {
  id: string;
  grievance_number: string;
  parent_id: string;
  student_id: string;
  admin_id: string;
  subject: string;
  description: string | null;
  category: GrievanceCategory;
  priority: GrievancePriority;
  status: GrievanceStatus;
  resolution_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  escalated_to: string | null;
  escalated_at: string | null;
  escalation_reason: string | null;
  last_message_at: string;
  unread_by_parent: number;
  unread_by_admin: number;
  created_at: string;
  updated_at: string;
}

export interface GrievanceMessageDB {
  id: string;
  grievance_id: string;
  sender_id: string;
  sender_type: MessageSenderType;
  message: string;
  attachment_url: string | null;
  attachment_type: string | null;
  attachment_name: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  edited_at: string | null;
  is_deleted: boolean;
}

// Extended types with joined data
export interface GrievanceWithDetails extends GrievanceDB {
  parent?: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    user_id: string | null;
  };
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    admission_number: string;
    class_name?: string;
    section_name?: string;
  };
  admin?: {
    id: string;
    full_name: string;
    email: string | null;
    user_id: string | null;
  };
  message_count?: number;
}

export interface GrievanceMessageWithSender extends GrievanceMessageDB {
  sender?: {
    id: string;
    full_name: string;
    email: string;
    profile_photo_url: string | null;
  };
}

// Form types
export interface CreateGrievanceForm {
  student_id: string;
  subject: string;
  description: string;
  category: GrievanceCategory;
  priority: GrievancePriority;
}

export interface SendMessageForm {
  message: string;
  attachment?: File;
}

// Constants
export const GRIEVANCE_CATEGORIES: { value: GrievanceCategory; label: string }[] = [
  { value: 'Academic', label: 'Academic Performance' },
  { value: 'Behavioral', label: 'Behavioral Issues' },
  { value: 'Attendance', label: 'Attendance Related' },
  { value: 'Homework', label: 'Homework/Assignments' },
  { value: 'Bullying', label: 'Bullying/Harassment' },
  { value: 'Health', label: 'Health Concerns' },
  { value: 'General', label: 'General Inquiry' },
  { value: 'Other', label: 'Other' },
];

export const GRIEVANCE_PRIORITIES: { value: GrievancePriority; label: string; color: string }[] = [
  { value: 'Low', label: 'Low', color: 'bg-gray-100 text-gray-700' },
  { value: 'Normal', label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  { value: 'High', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'Urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
];

export const GRIEVANCE_STATUSES: { value: GrievanceStatus; label: string; color: string }[] = [
  { value: 'Open', label: 'Open', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'In Progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'Resolved', label: 'Resolved', color: 'bg-green-100 text-green-700' },
  { value: 'Closed', label: 'Closed', color: 'bg-gray-100 text-gray-700' },
  { value: 'Escalated', label: 'Escalated', color: 'bg-red-100 text-red-700' },
];
