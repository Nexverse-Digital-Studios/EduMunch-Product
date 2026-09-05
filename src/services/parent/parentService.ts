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
 * Get user ID from auth_user_id or user_id
 * Handles both cases: passing auth_user_id or users table id
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

/**
 * Get parent profile by user ID
 */
export async function getParentProfile(userId: string): Promise<ParentProfile | null> {
  if (!supabase || !isSupabaseConfigured) {
    return null;
  }

  // Resolve the actual user ID
  const actualUserId = await resolveUserId(userId);
  if (!actualUserId) {
    console.error('User not found for ID:', userId);
    return null;
  }

  const { data, error } = await supabase
    .from(TABLES.PARENTS)
    .select('id, user_id, full_name, phone, email, relationship')
    .eq('user_id', actualUserId)
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

  // Resolve the actual user ID (handles both auth_user_id and user table id)
  const actualUserId = await resolveUserId(userId);
  if (!actualUserId) {
    return [];
  }

  // Step 1: Get parent ID from user ID
  const { data: parent, error: parentError } = await supabase
    .from(TABLES.PARENTS)
    .select('id')
    .eq('user_id', actualUserId)
    .maybeSingle();

  if (parentError || !parent) {
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
    .eq('status', 'active');

  if (studentError) {
    console.error('Error fetching students:', studentError);
    return [];
  }

  return (students || []) as unknown as ParentChild[];
}

/**
 * Get children with additional stats (attendance, marks, fees)
 * Optimized to fetch stats in bulk
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

  const studentIds = children.map(c => c.id);

  // Fetch all stats in parallel for all students
  const [attendanceMap, feesMap, marksMap] = await Promise.all([
    getAttendanceForStudents(studentIds),
    getFeesForStudents(studentIds),
    getMarksForStudents(studentIds),
  ]);

  // Combine children with their stats
  const childrenWithStats: ChildWithStats[] = children.map(child => ({
    ...child,
    attendance_percentage: attendanceMap.get(child.id) || 0,
    pending_fees: feesMap.get(child.id) || 0,
    average_marks: marksMap.get(child.id) || 0,
  }));

  return childrenWithStats;
}

/**
 * Get attendance for multiple students in bulk
 */
async function getAttendanceForStudents(studentIds: string[]): Promise<Map<string, number>> {
  const attendanceMap = new Map<string, number>();
  
  if (!supabase || !studentIds.length) return attendanceMap;

  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const { data, error } = await supabase
    .from(TABLES.ATTENDANCE)
    .select('student_id, status')
    .in('student_id', studentIds)
    .gte('date', firstDayOfMonth.toISOString().split('T')[0])
    .lte('date', lastDayOfMonth.toISOString().split('T')[0]);

  if (!error && data?.length) {
    const studentAttendance: Record<string, { total: number, present: number }> = {};
    
    data.forEach((record: any) => {
      if (!studentAttendance[record.student_id]) {
        studentAttendance[record.student_id] = { total: 0, present: 0 };
      }
      studentAttendance[record.student_id].total++;
      if (record.status === 'Present' || record.status === 'present') {
        studentAttendance[record.student_id].present++;
      }
    });

    Object.entries(studentAttendance).forEach(([studentId, stats]) => {
      if (stats.total > 0) {
        attendanceMap.set(studentId, Math.round((stats.present / stats.total) * 100 * 10) / 10);
      }
    });
  }

  return attendanceMap;
}

/**
 * Get pending fees for multiple students in bulk
 */
async function getFeesForStudents(studentIds: string[]): Promise<Map<string, number>> {
  const feesMap = new Map<string, number>();
  
  if (!supabase || !studentIds.length) return feesMap;

  const { data, error } = await supabase
    .from(TABLES.STUDENT_FEES)
    .select('student_id, total_amount, paid_amount')
    .in('student_id', studentIds)
    .eq('status', 'pending');

  if (!error && data?.length) {
    const studentFees: Record<string, number> = {};
    
    data.forEach((fee: any) => {
      if (!studentFees[fee.student_id]) {
        studentFees[fee.student_id] = 0;
      }
      studentFees[fee.student_id] += (fee.total_amount || 0) - (fee.paid_amount || 0);
    });

    Object.entries(studentFees).forEach(([studentId, amount]) => {
      feesMap.set(studentId, amount);
    });
  }

  return feesMap;
}

/**
 * Get average marks for multiple students in bulk
 */
async function getMarksForStudents(studentIds: string[]): Promise<Map<string, number>> {
  const marksMap = new Map<string, number>();
  
  if (!supabase || !studentIds.length) return marksMap;

  const { data, error } = await supabase
    .from(TABLES.EXAM_MARKS)
    .select('student_id, marks_obtained, max_marks, created_at')
    .in('student_id', studentIds)
    .order('created_at', { ascending: false });

  if (!error && data?.length) {
    const studentMarks: Record<string, { totalPercentage: number, count: number }> = {};
    const studentMarksCounts: Record<string, number> = {};
    
    data.forEach((mark: any) => {
      // Only take last 10 exams per student
      if (!studentMarksCounts[mark.student_id]) {
        studentMarksCounts[mark.student_id] = 0;
      }
      if (studentMarksCounts[mark.student_id] >= 10) return;
      
      if (!studentMarks[mark.student_id]) {
        studentMarks[mark.student_id] = { totalPercentage: 0, count: 0 };
      }
      
      if (mark.max_marks > 0) {
        studentMarks[mark.student_id].totalPercentage += (mark.marks_obtained / mark.max_marks) * 100;
        studentMarks[mark.student_id].count++;
        studentMarksCounts[mark.student_id]++;
      }
    });

    Object.entries(studentMarks).forEach(([studentId, stats]) => {
      if (stats.count > 0) {
        marksMap.set(studentId, Math.round((stats.totalPercentage / stats.count) * 10) / 10);
      }
    });
  }

  return marksMap;
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
 * Get raw debug info for parent - direct from DB without filters
 */
export async function getParentDebugInfo(userId: string) {
  if (!supabase || !isSupabaseConfigured) {
    return null;
  }

  try {
    // First check if this is an auth_user_id or user table id
    const { data: userByAuthId } = await supabase
      .from(TABLES.USERS)
      .select('id, auth_user_id, email, full_name')
      .eq('auth_user_id', userId)
      .maybeSingle();

    const { data: userById } = await supabase
      .from(TABLES.USERS)
      .select('id, auth_user_id, email, full_name')
      .eq('id', userId)
      .maybeSingle();

    const actualUser = userById || userByAuthId;
    const actualUserId = actualUser?.id;

    if (!actualUserId) {
      return {
        error: 'User not found in users table',
        userId,
        userLookup: {
          searchedByAuthId: userId,
          searchedById: userId,
          foundUser: null,
        },
        parent: null,
        relationCount: 0,
        relations: [],
      };
    }

    // Get parent record
    const { data: parent, error: parentError } = await supabase
      .from(TABLES.PARENTS)
      .select('*')
      .eq('user_id', actualUserId)
      .maybeSingle();

    if (parentError || !parent) {
      return {
        error: parentError?.message || 'No parent record found',
        userId,
        actualUserId,
        userLookup: actualUser,
        parent: null,
        relationCount: 0,
        relations: [],
      };
    }

    // Get all relations (no filters)
    const { data: relations, error: relError } = await supabase
      .from(TABLES.STUDENT_PARENT_RELATIONS)
      .select('*, student:students_1emaet(*)')
      .eq('parent_id', parent.id);

    return {
      userId,
      actualUserId,
      userLookup: actualUser,
      parent: {
        id: parent.id,
        full_name: parent.full_name,
        email: parent.email,
        phone: parent.phone,
      },
      relationCount: relations?.length || 0,
      relations: relations || [],
      error: relError?.message,
    };
  } catch (error: any) {
    return {
      error: error.message,
      userId,
      parent: null,
      relationCount: 0,
      relations: [],
    };
  }
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
