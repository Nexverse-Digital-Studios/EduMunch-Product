/**
 * PTM (Parent Teacher Meeting) Types & Interfaces
 * =================================================
 * Type definitions for PTM slots, bookings, and meeting notes
 */

// ==========================================
// PTM Slot Types
// ==========================================

export type PTMSlotStatus = 'Available' | 'Booked' | 'Completed' | 'Cancelled' | 'Requested';

export interface PTMSlot {
  id: string;
  teacher_id: string;
  ptm_date: string; // ISO date string
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  slot_duration_minutes: number;
  max_bookings: number;
  location: string | null;
  is_online: boolean;
  meeting_link: string | null;
  status: PTMSlotStatus;
  notes: string | null;
  is_bulk_scheduled: boolean;
  class_id: string | null;
  batch_id: string | null;
  created_at: string;
  updated_at: string;
}

// Extended type with joined data
export interface PTMSlotWithDetails extends PTMSlot {
  teacher?: {
    id: string;
    first_name: string;
    last_name: string;
    employee_code: string;
    user_id: string;
  };
  class?: {
    id: string;
    class_name: string;
    class_code: string;
  };
  bookings_count?: number;
}

// ==========================================
// PTM Booking Types
// ==========================================

export type PTMBookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No Show' | 'Rejected';

export interface PTMBooking {
  id: string;
  slot_id: string;
  student_id: string;
  parent_user_id: string;
  booking_date: string;
  meeting_purpose: string | null;
  topics_to_discuss: string[] | null;
  status: PTMBookingStatus;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  reminder_sent: boolean;
  reminder_sent_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

// Extended type with joined data
export interface PTMBookingWithDetails extends PTMBooking {
  slot?: PTMSlotWithDetails;
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    admission_number: string;
    class_id: string;
    section_id: string;
    class?: {
      class_name: string;
    };
    section?: {
      section_name: string;
    };
  };
  parent?: {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
  reviewer?: {
    id: string;
    full_name: string;
  };
}

// ==========================================
// PTM Meeting Notes Types
// ==========================================

export interface PTMMeetingNotes {
  id: string;
  booking_id: string;
  teacher_id: string;
  student_id: string;
  discussion_points: string;
  student_strengths: string | null;
  areas_of_improvement: string | null;
  behavioral_observations: string | null;
  academic_concerns: string | null;
  action_items: string[] | null;
  follow_up_required: boolean;
  follow_up_date: string | null;
  follow_up_completed: boolean;
  teacher_recommendations: string | null;
  parent_feedback: string | null;
  meeting_duration_minutes: number | null;
  recorded_by: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// Form/Input Types
// ==========================================

export interface BulkSchedulePTMInput {
  class_ids: string[];
  ptm_date: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  location?: string;
  is_online: boolean;
  meeting_link?: string;
  notes?: string;
}

export interface ParentPTMRequestInput {
  student_id: string;
  teacher_id: string;
  preferred_date: string;
  preferred_start_time: string;
  preferred_end_time: string;
  meeting_purpose: string;
  topics_to_discuss?: string[];
  is_online: boolean;
}

export interface ReviewPTMRequestInput {
  booking_id: string;
  action: 'approve' | 'reject';
  rejection_reason?: string;
}

export interface MeetingNotesInput {
  booking_id: string;
  discussion_points: string;
  student_strengths?: string;
  areas_of_improvement?: string;
  behavioral_observations?: string;
  academic_concerns?: string;
  action_items?: string[];
  follow_up_required: boolean;
  follow_up_date?: string;
  teacher_recommendations?: string;
  parent_feedback?: string;
  meeting_duration_minutes?: number;
}

// ==========================================
// Filter Types
// ==========================================

export interface PTMSlotFilters {
  status?: PTMSlotStatus;
  teacher_id?: string;
  class_id?: string;
  ptm_date?: string;
  is_bulk_scheduled?: boolean;
  batch_id?: string;
}

export interface PTMBookingFilters {
  status?: PTMBookingStatus;
  slot_id?: string;
  student_id?: string;
  parent_user_id?: string;
  teacher_id?: string;
  class_id?: string;
  date_from?: string;
  date_to?: string;
}

// ==========================================
// Stats Types
// ==========================================

export interface PTMStats {
  total_slots: number;
  available_slots: number;
  booked_slots: number;
  completed_meetings: number;
  pending_requests: number;
  no_shows: number;
  upcoming_meetings: number;
}
