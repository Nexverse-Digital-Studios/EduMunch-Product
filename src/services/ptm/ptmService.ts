/**
 * PTM Service - Parent Teacher Meeting Operations
 * =================================================
 * Handles all PTM-related database operations
 */

import { supabase, TABLES, isSupabaseConfigured } from '@/lib/supabase';
import {
  PTMSlot,
  PTMSlotWithDetails,
  PTMBooking,
  PTMBookingWithDetails,
  PTMMeetingNotes,
  BulkSchedulePTMInput,
  ParentPTMRequestInput,
  ReviewPTMRequestInput,
  MeetingNotesInput,
  PTMSlotFilters,
  PTMBookingFilters,
  PTMStats,
} from '@/types/ptm';

// ==========================================
// Helper Functions
// ==========================================

/**
 * Resolve user ID from either auth_user_id or user table id
 * Handles both cases to get the actual users_1emaet.id
 */
async function resolveUserId(userId: string): Promise<string | null> {
  if (!supabase || !isSupabaseConfigured) {
    return null;
  }

  // First, try to find user by id (direct match)
  const { data: userById } = await supabase
    .from(TABLES.USERS)
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (userById) {
    return userById.id;
  }

  // If not found, try by auth_user_id
  const { data: userByAuthId } = await supabase
    .from(TABLES.USERS)
    .select('id')
    .eq('auth_user_id', userId)
    .maybeSingle();

  return userByAuthId?.id || null;
}

// ==========================================
// PTM Slot Operations
// ==========================================

/**
 * Get all PTM slots with optional filters
 */
export async function getPTMSlots(filters?: PTMSlotFilters): Promise<PTMSlotWithDetails[]> {
  if (!supabase || !isSupabaseConfigured) {
    return [];
  }

  let query = supabase
    .from(TABLES.PTM_SLOTS)
    .select(`
      *,
      teacher:${TABLES.TEACHERS}(id, first_name, last_name, employee_code, user_id),
      class:${TABLES.CLASSES}(id, class_name, class_code)
    `)
    .order('ptm_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.teacher_id) {
    query = query.eq('teacher_id', filters.teacher_id);
  }
  if (filters?.class_id) {
    query = query.eq('class_id', filters.class_id);
  }
  if (filters?.ptm_date) {
    query = query.eq('ptm_date', filters.ptm_date);
  }
  if (filters?.is_bulk_scheduled !== undefined) {
    query = query.eq('is_bulk_scheduled', filters.is_bulk_scheduled);
  }
  if (filters?.batch_id) {
    query = query.eq('batch_id', filters.batch_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching PTM slots:', error);
    throw error;
  }

  return (data || []) as unknown as PTMSlotWithDetails[];
}

/**
 * Get a single PTM slot by ID
 */
export async function getPTMSlotById(id: string): Promise<PTMSlotWithDetails | null> {
  if (!supabase || !isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase
    .from(TABLES.PTM_SLOTS)
    .select(`
      *,
      teacher:${TABLES.TEACHERS}(id, first_name, last_name, employee_code, user_id),
      class:${TABLES.CLASSES}(id, class_name, class_code)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching PTM slot:', error);
    throw error;
  }

  return data as unknown as PTMSlotWithDetails;
}

/**
 * Bulk schedule PTM slots for multiple classes
 * Creates slots for all teachers of the selected classes
 */
export async function bulkSchedulePTM(input: BulkSchedulePTMInput): Promise<{ success: boolean; slots_created: number; batch_id: string }> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  // Generate a batch ID to group these slots
  const batch_id = crypto.randomUUID();

  // Step 1: Get sections for the selected classes
  const { data: sections, error: sectionError } = await supabase
    .from(TABLES.SECTIONS)
    .select('id, class_id')
    .in('class_id', input.class_ids);

  if (sectionError || !sections?.length) {
    console.error('Error fetching sections:', sectionError);
    return { success: true, slots_created: 0, batch_id };
  }

  const sectionIds = sections.map((s: any) => s.id);
  const sectionClassMap = new Map(sections.map((s: any) => [s.id, s.class_id]));

  // Step 2: Get teachers assigned to those sections
  const { data: teacherAssignments, error: fetchError } = await supabase
    .from(TABLES.TEACHER_SUBJECT_SECTIONS)
    .select('teacher_id, section_id')
    .in('section_id', sectionIds);

  if (fetchError) {
    console.error('Error fetching teacher assignments:', fetchError);
    throw fetchError;
  }

  // Get unique teacher-class combinations
  const teacherClassMap = new Map<string, Set<string>>();
  teacherAssignments?.forEach((assignment: any) => {
    const teacher_id = assignment.teacher_id;
    const class_id = sectionClassMap.get(assignment.section_id);
    if (teacher_id && class_id) {
      if (!teacherClassMap.has(teacher_id)) {
        teacherClassMap.set(teacher_id, new Set());
      }
      teacherClassMap.get(teacher_id)!.add(class_id);
    }
  });

  // Create slots for each unique teacher
  const slotsToCreate: Partial<PTMSlot>[] = [];
  
  teacherClassMap.forEach((classIds, teacher_id) => {
    // Use the first class_id for the slot (or could create separate slots per class)
    const class_id = Array.from(classIds)[0];
    
    slotsToCreate.push({
      teacher_id,
      ptm_date: input.ptm_date,
      start_time: input.start_time,
      end_time: input.end_time,
      slot_duration_minutes: input.slot_duration_minutes,
      max_bookings: 1,
      location: input.location || null,
      is_online: input.is_online,
      meeting_link: input.meeting_link || null,
      status: 'Available',
      notes: input.notes || null,
      is_bulk_scheduled: true,
      class_id,
      batch_id,
    });
  });

  if (slotsToCreate.length === 0) {
    return { success: true, slots_created: 0, batch_id };
  }

  const { data, error } = await supabase
    .from(TABLES.PTM_SLOTS)
    .insert(slotsToCreate)
    .select();

  if (error) {
    console.error('Error creating PTM slots:', error);
    throw error;
  }

  return { success: true, slots_created: data?.length || 0, batch_id };
}

/**
 * Create a single PTM slot (for parent request after approval)
 */
export async function createPTMSlot(slot: Partial<PTMSlot>): Promise<PTMSlot> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from(TABLES.PTM_SLOTS)
    .insert(slot)
    .select()
    .single();

  if (error) {
    console.error('Error creating PTM slot:', error);
    throw error;
  }

  return data;
}

/**
 * Update a PTM slot
 */
export async function updatePTMSlot(id: string, updates: Partial<PTMSlot>): Promise<PTMSlot> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from(TABLES.PTM_SLOTS)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating PTM slot:', error);
    throw error;
  }

  return data;
}

// ==========================================
// PTM Booking Operations
// ==========================================

/**
 * Get all PTM bookings with optional filters
 */
export async function getPTMBookings(filters?: PTMBookingFilters): Promise<PTMBookingWithDetails[]> {
  if (!supabase || !isSupabaseConfigured) {
    return [];
  }

  let query = supabase
    .from(TABLES.PTM_BOOKINGS)
    .select(`
      *,
      slot:${TABLES.PTM_SLOTS}(
        *,
        teacher:${TABLES.TEACHERS}(id, first_name, last_name, employee_code, user_id)
      ),
      student:${TABLES.STUDENTS}(
        id, first_name, last_name, admission_number, class_id, section_id,
        class:${TABLES.CLASSES}(class_name),
        section:${TABLES.SECTIONS}(section_name)
      ),
      parent:${TABLES.PARENTS}(id, user_id, full_name, phone, email),
      reviewer:${TABLES.USERS}!ptm_bookings_1emaet_reviewed_by_fkey(id, full_name)
    `)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.slot_id) {
    query = query.eq('slot_id', filters.slot_id);
  }
  if (filters?.student_id) {
    query = query.eq('student_id', filters.student_id);
  }
  if (filters?.parent_id) {
    query = query.eq('parent_user_id', filters.parent_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching PTM bookings:', error);
    throw error;
  }

  return (data || []) as unknown as PTMBookingWithDetails[];
}

/**
 * Get pending PTM requests (for admin approval queue)
 */
export async function getPendingPTMRequests(): Promise<PTMBookingWithDetails[]> {
  return getPTMBookings({ status: 'Pending' });
}

/**
 * Get PTM bookings for a parent by their children
 * This resolves the user ID and finds bookings for all their children
 */
export async function getPTMBookingsForParent(parentUserId: string): Promise<PTMBookingWithDetails[]> {
  if (!supabase || !isSupabaseConfigured) {
    return [];
  }

  // Step 1: Resolve the actual user ID
  const actualUserId = await resolveUserId(parentUserId);
  if (!actualUserId) {
    return [];
  }

  // Step 2: Get parent.id from users.id
  const { data: parentRecord, error: parentError } = await supabase
    .from(TABLES.PARENTS)
    .select('id')
    .eq('user_id', actualUserId)
    .maybeSingle();

  if (parentError || !parentRecord) {
    console.error('Error finding parent:', parentError);
    return [];
  }

  // Step 3: Get PTM bookings directly by parent_id
  const { data, error } = await supabase
    .from(TABLES.PTM_BOOKINGS)
    .select(`
      *,
      slot:${TABLES.PTM_SLOTS}(
        *,
        teacher:${TABLES.TEACHERS}(id, first_name, last_name, employee_code, user_id)
      ),
      student:${TABLES.STUDENTS}(
        id, first_name, last_name, admission_number, class_id, section_id,
        class:${TABLES.CLASSES}(class_name),
        section:${TABLES.SECTIONS}(section_name)
      ),
      parent:${TABLES.PARENTS}(id, user_id, full_name, phone, email),
      reviewer:${TABLES.USERS}!ptm_bookings_1emaet_reviewed_by_fkey(id, full_name)
    `)
    .eq('parent_user_id', parentRecord.id)
    .order('created_at', { ascending: false});

  if (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }

  return (data || []) as unknown as PTMBookingWithDetails[];
}

/**
 * Create a PTM request (parent-initiated)
 * This creates both a slot with 'Requested' status and a booking with 'Pending' status
 */
export async function createPTMRequest(input: ParentPTMRequestInput, parentUserId: string): Promise<PTMBooking> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  // Resolve the actual user ID (handles both auth_user_id and users table id)
  const actualUserId = await resolveUserId(parentUserId);
  if (!actualUserId) {
    throw new Error('User not found in users table');
  }

  // Get parent.id from users.id
  const { data: parentRecord, error: parentError } = await supabase
    .from(TABLES.PARENTS)
    .select('id')
    .eq('user_id', actualUserId)
    .maybeSingle();

  if (parentError || !parentRecord) {
    console.error('Error finding parent record:', parentError);
    throw new Error('Parent record not found');
  }

  // Step 1: Create the slot with 'Requested' status
  const slotData: Partial<PTMSlot> = {
    teacher_id: input.teacher_id,
    ptm_date: input.preferred_date,
    start_time: input.preferred_start_time,
    end_time: input.preferred_end_time,
    slot_duration_minutes: 30, // Default 30 mins for parent requests
    max_bookings: 1,
    is_online: input.is_online,
    status: 'Requested',
    notes: `Parent Request: ${input.meeting_purpose}`,
    is_bulk_scheduled: false,
  };

  const { data: slot, error: slotError } = await supabase
    .from(TABLES.PTM_SLOTS)
    .insert(slotData)
    .select()
    .single();

  if (slotError) {
    console.error('Error creating PTM slot for request:', slotError);
    throw slotError;
  }

  // Step 2: Create the booking with 'Pending' status using parent.id
  const bookingData: Partial<PTMBooking> = {
    slot_id: slot.id,
    student_id: input.student_id,
    parent_user_id: parentRecord.id, // Store parent.id in parent_user_id column
    meeting_purpose: input.meeting_purpose,
    topics_to_discuss: input.topics_to_discuss || [],
    status: 'Pending',
  };

  const { data: booking, error: bookingError } = await supabase
    .from(TABLES.PTM_BOOKINGS)
    .insert(bookingData)
    .select()
    .single();

  if (bookingError) {
    console.error('Error creating PTM booking:', bookingError);
    // Rollback: delete the created slot
    await supabase.from(TABLES.PTM_SLOTS).delete().eq('id', slot.id);
    throw bookingError;
  }

  return booking;
}

/**
 * Review (approve/reject) a PTM request
 */
export async function reviewPTMRequest(input: ReviewPTMRequestInput, reviewerId: string): Promise<PTMBooking> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  // Resolve the actual user ID (handles both auth_user_id and users table id)
  const actualReviewerId = await resolveUserId(reviewerId);
  if (!actualReviewerId) {
    throw new Error('Reviewer user not found in users table');
  }

  // Get the booking to find the slot
  const { data: booking, error: fetchError } = await supabase
    .from(TABLES.PTM_BOOKINGS)
    .select('slot_id')
    .eq('id', input.booking_id)
    .single();

  if (fetchError || !booking) {
    throw new Error('Booking not found');
  }

  const now = new Date().toISOString();

  if (input.action === 'approve') {
    // Update slot to 'Booked'
    await supabase
      .from(TABLES.PTM_SLOTS)
      .update({ status: 'Booked', updated_at: now })
      .eq('id', booking.slot_id);

    // Update booking to 'Confirmed'
    const { data, error } = await supabase
      .from(TABLES.PTM_BOOKINGS)
      .update({
        status: 'Confirmed',
        reviewed_by: actualReviewerId,
        reviewed_at: now,
        updated_at: now,
      })
      .eq('id', input.booking_id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Update slot to 'Cancelled'
    await supabase
      .from(TABLES.PTM_SLOTS)
      .update({ status: 'Cancelled', updated_at: now })
      .eq('id', booking.slot_id);

    // Update booking to 'Rejected'
    const { data, error } = await supabase
      .from(TABLES.PTM_BOOKINGS)
      .update({
        status: 'Rejected',
        reviewed_by: actualReviewerId,
        reviewed_at: now,
        rejection_reason: input.rejection_reason || null,
        updated_at: now,
      })
      .eq('id', input.booking_id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

/**
 * Mark a booking as completed
 */
export async function completePTMBooking(bookingId: string): Promise<PTMBooking> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const now = new Date().toISOString();

  // Get the booking to find the slot
  const { data: booking, error: fetchError } = await supabase
    .from(TABLES.PTM_BOOKINGS)
    .select('slot_id')
    .eq('id', bookingId)
    .single();

  if (fetchError || !booking) {
    throw new Error('Booking not found');
  }

  // Update slot status
  await supabase
    .from(TABLES.PTM_SLOTS)
    .update({ status: 'Completed', updated_at: now })
    .eq('id', booking.slot_id);

  // Update booking status
  const { data, error } = await supabase
    .from(TABLES.PTM_BOOKINGS)
    .update({ status: 'Completed', updated_at: now })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Cancel a PTM booking
 */
export async function cancelPTMBooking(bookingId: string, reason: string): Promise<PTMBooking> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const now = new Date().toISOString();

  // Get the booking to find the slot
  const { data: booking, error: fetchError } = await supabase
    .from(TABLES.PTM_BOOKINGS)
    .select('slot_id')
    .eq('id', bookingId)
    .single();

  if (fetchError || !booking) {
    throw new Error('Booking not found');
  }

  // Update slot status back to Available (for bulk scheduled) or Cancelled (for requested)
  const { data: slot } = await supabase
    .from(TABLES.PTM_SLOTS)
    .select('is_bulk_scheduled')
    .eq('id', booking.slot_id)
    .single();

  const newSlotStatus = slot?.is_bulk_scheduled ? 'Available' : 'Cancelled';
  
  await supabase
    .from(TABLES.PTM_SLOTS)
    .update({ status: newSlotStatus, updated_at: now })
    .eq('id', booking.slot_id);

  // Update booking status
  const { data, error } = await supabase
    .from(TABLES.PTM_BOOKINGS)
    .update({
      status: 'Cancelled',
      cancellation_reason: reason,
      cancelled_at: now,
      updated_at: now,
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==========================================
// PTM Meeting Notes Operations
// ==========================================

/**
 * Create meeting notes after a PTM
 */
export async function createMeetingNotes(input: MeetingNotesInput, teacherId: string, studentId: string, recordedBy: string): Promise<PTMMeetingNotes> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const notesData: Partial<PTMMeetingNotes> = {
    booking_id: input.booking_id,
    teacher_id: teacherId,
    student_id: studentId,
    discussion_points: input.discussion_points,
    student_strengths: input.student_strengths || null,
    areas_of_improvement: input.areas_of_improvement || null,
    behavioral_observations: input.behavioral_observations || null,
    academic_concerns: input.academic_concerns || null,
    action_items: input.action_items || [],
    follow_up_required: input.follow_up_required,
    follow_up_date: input.follow_up_date || null,
    follow_up_completed: false,
    teacher_recommendations: input.teacher_recommendations || null,
    parent_feedback: input.parent_feedback || null,
    meeting_duration_minutes: input.meeting_duration_minutes || null,
    recorded_by: recordedBy,
  };

  const { data, error } = await supabase
    .from(TABLES.PTM_MEETING_NOTES)
    .insert(notesData)
    .select()
    .single();

  if (error) {
    console.error('Error creating meeting notes:', error);
    throw error;
  }

  // Mark the booking as completed
  await completePTMBooking(input.booking_id);

  return data;
}

/**
 * Get meeting notes by booking ID
 */
export async function getMeetingNotesByBooking(bookingId: string): Promise<PTMMeetingNotes | null> {
  if (!supabase || !isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase
    .from(TABLES.PTM_MEETING_NOTES)
    .select('*')
    .eq('booking_id', bookingId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    console.error('Error fetching meeting notes:', error);
    throw error;
  }

  return data;
}

/**
 * Get meeting notes by student ID (for parent view)
 */
export async function getMeetingNotesByStudent(studentId: string): Promise<PTMMeetingNotes[]> {
  if (!supabase || !isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from(TABLES.PTM_MEETING_NOTES)
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching meeting notes:', error);
    throw error;
  }

  return data || [];
}

// ==========================================
// Stats & Analytics
// ==========================================

/**
 * Get PTM statistics
 */
export async function getPTMStats(): Promise<PTMStats> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      total_slots: 0,
      available_slots: 0,
      booked_slots: 0,
      completed_meetings: 0,
      pending_requests: 0,
      no_shows: 0,
      upcoming_meetings: 0,
    };
  }

  const today = new Date().toISOString().split('T')[0];

  // Get slot counts
  const { data: slots } = await supabase
    .from(TABLES.PTM_SLOTS)
    .select('status');

  // Get booking counts
  const { data: bookings } = await supabase
    .from(TABLES.PTM_BOOKINGS)
    .select('status');

  // Get upcoming meetings count
  const { data: upcomingSlots } = await supabase
    .from(TABLES.PTM_SLOTS)
    .select('id')
    .gte('ptm_date', today)
    .eq('status', 'Booked');

  const slotCounts = (slots || []).reduce((acc: any, slot: any) => {
    acc[slot.status] = (acc[slot.status] || 0) + 1;
    return acc;
  }, {});

  const bookingCounts = (bookings || []).reduce((acc: any, booking: any) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {});

  return {
    total_slots: slots?.length || 0,
    available_slots: slotCounts['Available'] || 0,
    booked_slots: slotCounts['Booked'] || 0,
    completed_meetings: bookingCounts['Completed'] || 0,
    pending_requests: bookingCounts['Pending'] || 0,
    no_shows: bookingCounts['No Show'] || 0,
    upcoming_meetings: upcomingSlots?.length || 0,
  };
}

// ==========================================
// Utility Functions
// ==========================================

/**
 * Get teachers by class IDs (for scheduling)
 * Uses a two-step approach: first get sections for classes, then get teachers for those sections
 */
export async function getTeachersByClasses(classIds: string[]): Promise<any[]> {
  if (!supabase || !isSupabaseConfigured) {
    return [];
  }

  // Step 1: Get sections for the selected classes
  const { data: sections, error: sectionError } = await supabase
    .from(TABLES.SECTIONS)
    .select('id')
    .in('class_id', classIds);

  if (sectionError || !sections?.length) {
    console.error('Error fetching sections:', sectionError);
    return [];
  }

  const sectionIds = sections.map((s: any) => s.id);

  // Step 2: Get teachers assigned to those sections
  const { data, error } = await supabase
    .from(TABLES.TEACHER_SUBJECT_SECTIONS)
    .select(`
      teacher:${TABLES.TEACHERS}(id, first_name, last_name, employee_code)
    `)
    .in('section_id', sectionIds);

  if (error) {
    console.error('Error fetching teachers:', error);
    return [];
  }

  // Get unique teachers
  const uniqueTeachers = new Map();
  data?.forEach((item: any) => {
    if (item.teacher && !uniqueTeachers.has(item.teacher.id)) {
      uniqueTeachers.set(item.teacher.id, item.teacher);
    }
  });

  return Array.from(uniqueTeachers.values());
}

/**
 * Get classes list for dropdown
 */
export async function getClassesList(): Promise<any[]> {
  if (!supabase || !isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from(TABLES.CLASSES)
    .select('id, class_name, class_code, class_order')
    .eq('is_active', true)
    .order('class_order', { ascending: true });

  if (error) {
    console.error('Error fetching classes:', error);
    return [];
  }

  return data || [];
}

/**
 * Get children for a parent (for parent request form)
 */
export async function getChildrenForParent(parentUserId: string): Promise<any[]> {
  if (!supabase || !isSupabaseConfigured) {
    return [];
  }

  // First get parent ID from user ID
  const { data: parent, error: parentError } = await supabase
    .from(TABLES.PARENTS)
    .select('id')
    .eq('user_id', parentUserId)
    .single();

  if (parentError || !parent) {
    return [];
  }

  // Get student-parent relations
  const { data: relations, error: relError } = await supabase
    .from(TABLES.STUDENT_PARENT_RELATIONS)
    .select(`
      student:${TABLES.STUDENTS}(
        id, first_name, last_name, admission_number,
        class:${TABLES.CLASSES}(class_name),
        section:${TABLES.SECTIONS}(section_name)
      )
    `)
    .eq('parent_id', parent.id);

  if (relError) {
    console.error('Error fetching children:', relError);
    return [];
  }

  return relations?.map((r: any) => r.student).filter(Boolean) || [];
}

/**
 * Get teachers for a student's class (for parent request form)
 */
export async function getTeachersForStudent(studentId: string): Promise<any[]> {
  if (!supabase || !isSupabaseConfigured) {
    console.error('Supabase not configured');
    return [];
  }

  // Get student's section with class teacher
  const { data: student, error: studentError } = await supabase
    .from(TABLES.STUDENTS)
    .select(`
      section_id, 
      class_id,
      section:sections_1emaet(
        id, 
        section_name,
        class_teacher_id,
        class_teacher:teachers_1emaet(id, user_id, first_name, last_name, employee_code)
      )
    `)
    .eq('id', studentId)
    .single();

  if (studentError) {
    console.error('Error fetching student:', studentError);
    return [];
  }

  if (!student?.section_id) {
    console.error('No section_id found for student');
    return [];
  }

  const teacherMap = new Map();

  // Add class teacher first (primary teacher for PTM)
  if (student.section?.class_teacher) {
    const classTeacher = student.section.class_teacher;
    teacherMap.set(classTeacher.id, {
      id: classTeacher.id,
      user_id: classTeacher.user_id,
      first_name: classTeacher.first_name,
      last_name: classTeacher.last_name,
      employee_code: classTeacher.employee_code,
      subjects: ['Class Teacher'],
      is_class_teacher: true,
    });
  } else {
    console.warn('No class teacher assigned to section:', student.section_id);
  }

  // Get other subject teachers assigned to this section
  const { data: assignments, error: assignError } = await supabase
    .from(TABLES.TEACHER_SUBJECT_SECTIONS)
    .select(`
      teacher_id,
      subject_id,
      teacher:teachers_1emaet(id, user_id, first_name, last_name, employee_code),
      subject:subjects_1emaet(id, subject_name)
    `)
    .eq('section_id', student.section_id);

  // Add subject teachers
  if (assignments && assignments.length > 0) {
    assignments.forEach((item: any) => {
      if (item.teacher) {
        if (!teacherMap.has(item.teacher.id)) {
          teacherMap.set(item.teacher.id, {
            ...item.teacher,
            subjects: [],
            is_class_teacher: false,
          });
        }
        if (item.subject && !teacherMap.get(item.teacher.id).is_class_teacher) {
          teacherMap.get(item.teacher.id).subjects.push(item.subject.subject_name);
        }
      }
    });
  }

  const teachers = Array.from(teacherMap.values());
  
  return teachers;
}
