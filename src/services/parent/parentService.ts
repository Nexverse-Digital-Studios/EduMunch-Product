/**
 * Parent Service - Parent Portal Data Operations
 * ================================================
 * Handles all parent-related database operations for the parent dashboard
 */

import { supabase, TABLES, isSupabaseConfigured } from '@/lib/supabase';

// ==========================================
// Types
// ==========================================

export interface ParentChild {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  roll_number?: string;
  photo_url?: string;
  class_id: string;
  section_id: string;
  class?: {
    id: string;
    class_name: string;
    class_code?: string;
  };
  section?: {
    id: string;
    section_name: string;
  };
}

export interface ChildWithStats extends ParentChild {
  attendance_percentage?: number;
  average_marks?: number;
  class_rank?: number;
  pending_fees?: number;
}

export interface ParentProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  email?: string;
  relationship?: string;
}

// ==========================================
// Parent Profile Operations
// ==========================================

/**
 * Get parent profile by user ID
 */
export async function getParentProfile(userId: string): Promise<ParentProfile | null> {
  if (!supabase || !isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase
    .from(TABLES.PARENTS)
    .select('id, user_id, full_name, phone, email, relationship')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching parent profile:', error);
    return null;
  }

  return data;
}

// ==========================================
// Children Operations
// ==========================================

/**
 * Get all children for a parent by user ID
 * Returns children with class and section details
 */
export async function getChildrenByParentUserId(userId: string): Promise<ParentChild[]> {
  if (!supabase || !isSupabaseConfigured) {
    return [];
  }

  // Step 1: Get parent ID from user ID
  const { data: parent, error: parentError } = await supabase
    .from(TABLES.PARENTS)
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (parentError || !parent) {
    if (parentError) console.error('Error fetching parent:', parentError);
    return [];
  }

  // Step 2: Get student-parent relations with student details
  const { data: relations, error: relError } = await supabase
    .from(TABLES.STUDENT_PARENT_RELATIONS)
    .select(`
      student_id
    `)
    .eq('parent_id', parent.id);

  if (relError || !relations?.length) {
    console.error('Error fetching student relations:', relError);
    return [];
  }

  const studentIds = relations.map((r: any) => r.student_id);

  // Step 3: Get full student details with class and section
  const { data: students, error: studentError } = await supabase
    .from(TABLES.STUDENTS)
    .select(`
      id, first_name, last_name, admission_number, roll_number, photo_url, class_id, section_id,
      class:${TABLES.CLASSES}(id, class_name, class_code),
      section:${TABLES.SECTIONS}(id, section_name)
    `)
    .in('id', studentIds)
    .eq('is_active', true);

  if (studentError) {
    console.error('Error fetching students:', studentError);
    return [];
  }

  return (students || []) as unknown as ParentChild[];
}

/**
 * Get children with additional stats (attendance, marks, fees)
 */
export async function getChildrenWithStats(userId: string): Promise<ChildWithStats[]> {
  if (!supabase || !isSupabaseConfigured) {
    return [];
  }

  // Get base children data
  const children = await getChildrenByParentUserId(userId);
  
  if (!children.length) {
    return [];
  }

  // For each child, fetch stats (attendance, fees)
  const childrenWithStats: ChildWithStats[] = await Promise.all(
    children.map(async (child) => {
      const stats = await getChildStats(child.id);
      return {
        ...child,
        ...stats,
      };
    })
  );

  return childrenWithStats;
}

/**
 * Get stats for a single child (attendance, pending fees)
 */
async function getChildStats(studentId: string): Promise<{
  attendance_percentage?: number;
  average_marks?: number;
  pending_fees?: number;
}> {
  if (!supabase || !isSupabaseConfigured) {
    return {};
  }

  const stats: any = {};

  try {
    // Get attendance for current month
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const { data: attendanceData, error: attendanceError } = await supabase
      .from(TABLES.ATTENDANCE)
      .select('status')
      .eq('student_id', studentId)
      .gte('date', firstDayOfMonth.toISOString().split('T')[0])
      .lte('date', lastDayOfMonth.toISOString().split('T')[0]);

    if (!attendanceError && attendanceData?.length) {
      const presentCount = attendanceData.filter((a: any) => 
        a.status === 'Present' || a.status === 'present'
      ).length;
      stats.attendance_percentage = Math.round((presentCount / attendanceData.length) * 100 * 10) / 10;
    }

    // Get pending fees
    const { data: feeData, error: feeError } = await supabase
      .from(TABLES.STUDENT_FEES)
      .select('total_amount, paid_amount')
      .eq('student_id', studentId)
      .eq('status', 'pending');

    if (!feeError && feeData?.length) {
      stats.pending_fees = feeData.reduce((total: number, fee: any) => {
        return total + ((fee.total_amount || 0) - (fee.paid_amount || 0));
      }, 0);
    }

    // Get average marks from recent exams
    const { data: marksData, error: marksError } = await supabase
      .from(TABLES.EXAM_MARKS)
      .select('marks_obtained, max_marks')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!marksError && marksData?.length) {
      const totalPercentage = marksData.reduce((sum: number, mark: any) => {
        if (mark.max_marks > 0) {
          return sum + (mark.marks_obtained / mark.max_marks) * 100;
        }
        return sum;
      }, 0);
      stats.average_marks = Math.round((totalPercentage / marksData.length) * 10) / 10;
    }
  } catch (error) {
    console.error('Error fetching child stats:', error);
  }

  return stats;
}

/**
 * Get a single child by ID with full details
 */
export async function getChildById(studentId: string): Promise<ParentChild | null> {
  if (!supabase || !isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase
    .from(TABLES.STUDENTS)
    .select(`
      id, first_name, last_name, admission_number, roll_number, photo_url, class_id, section_id,
      class:${TABLES.CLASSES}(id, class_name, class_code),
      section:${TABLES.SECTIONS}(id, section_name)
    `)
    .eq('id', studentId)
    .single();

  if (error) {
    console.error('Error fetching child:', error);
    return null;
  }

  return data as unknown as ParentChild;
}

// ==========================================
// Export all functions
// ==========================================

export default {
  getParentProfile,
  getChildrenByParentUserId,
  getChildrenWithStats,
  getChildById,
};
