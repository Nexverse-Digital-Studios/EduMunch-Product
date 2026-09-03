/**
 * Notification Targeting Functions
 * Each function implements custom filtering logic for different notification scenarios
 * All functions return an array of user_ids who should receive the notification
 */

import { supabase } from '@/lib/supabase';

const INDEX_TOKEN = import.meta.env.VITE_INDEX_TOKEN;

// ============================================================
// FILTER 1: Get Students by Class and Subject (For Assignments)
// ============================================================
export async function getStudentsForAssignment(
  classId: string,
  subjectId?: string
): Promise<string[]> {
  try {
    console.log(`🔍 Filtering students for class: ${classId}, subject: ${subjectId || 'all'}`);

    let query = supabase
      .from(`users_${INDEX_TOKEN}`)
      .select('user_id')
      .eq('role', 'student')
      .eq('class_id', classId)
      .eq('status', 'active');

    // If subject is specified, add subject filter
    if (subjectId) {
      // Assuming students table has subject enrollment info
      const { data: enrollments } = await supabase
        .from(`student_subjects_${INDEX_TOKEN}`)
        .select('user_id')
        .eq('class_id', classId)
        .eq('subject_id', subjectId);

      const enrolledUserIds = enrollments?.map(e => e.user_id) || [];
      query = query.in('user_id', enrolledUserIds);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching students:', error);
      throw error;
    }

    const userIds = data?.map(u => u.user_id) || [];
    console.log(`✅ Found ${userIds.length} students`);
    return userIds;

  } catch (error) {
    console.error('❌ getStudentsForAssignment failed:', error);
    return [];
  }
}

// ============================================================
// FILTER 2: Get All Teachers (For Admin Broadcasts)
// ============================================================
export async function getAllTeachers(): Promise<string[]> {
  try {
    console.log(`🔍 Fetching all teachers`);

    const { data, error } = await supabase
      .from(`users_${INDEX_TOKEN}`)
      .select('user_id')
      .eq('role', 'teacher')
      .eq('status', 'active');

    if (error) throw error;

    const userIds = data?.map(u => u.user_id) || [];
    console.log(`✅ Found ${userIds.length} teachers`);
    return userIds;

  } catch (error) {
    console.error('❌ getAllTeachers failed:', error);
    return [];
  }
}

// ============================================================
// FILTER 3: Get All Staff (Teachers + Admins + Staff)
// ============================================================
export async function getAllStaff(): Promise<string[]> {
  try {
    console.log(`🔍 Fetching all staff members`);

    const { data, error } = await supabase
      .from(`users_${INDEX_TOKEN}`)
      .select('user_id')
      .in('role', ['teacher', 'admin', 'staff'])
      .eq('status', 'active');

    if (error) throw error;

    const userIds = data?.map(u => u.user_id) || [];
    console.log(`✅ Found ${userIds.length} staff members`);
    return userIds;

  } catch (error) {
    console.error('❌ getAllStaff failed:', error);
    return [];
  }
}

// ============================================================
// FILTER 4: Get Parents of Specific Students
// ============================================================
export async function getParentsOfStudents(
  studentIds: string[]
): Promise<string[]> {
  try {
    console.log(`🔍 Fetching parents for ${studentIds.length} students`);

    if (!studentIds.length) return [];

    // Step 1: Get parent_ids linked to these students
    const { data: links, error: linksError } = await supabase
      .from(`student_parent_links_${INDEX_TOKEN}`)
      .select('parent_id')
      .in('student_id', studentIds);

    if (linksError) throw linksError;

    const parentIds = links?.map(l => l.parent_id) || [];

    if (!parentIds.length) {
      console.log('⚠️ No parents found for given students');
      return [];
    }

    // Step 2: Get user_ids for these parents
    const { data: parents, error: parentsError } = await supabase
      .from(`users_${INDEX_TOKEN}`)
      .select('user_id')
      .in('parent_id', parentIds)
      .eq('role', 'parent')
      .eq('status', 'active');

    if (parentsError) throw parentsError;

    const userIds = parents?.map(p => p.user_id) || [];
    console.log(`✅ Found ${userIds.length} parents`);
    return userIds;

  } catch (error) {
    console.error('❌ getParentsOfStudents failed:', error);
    return [];
  }
}

// ============================================================
// FILTER 5: Get Students with Pending Fees
// ============================================================
export async function getStudentsWithPendingFees(): Promise<string[]> {
  try {
    console.log(`🔍 Fetching students with pending fees`);

    // Get fee records that are pending and overdue
    const { data: feeRecords, error: feeError } = await supabase
      .from(`fee_payments_${INDEX_TOKEN}`)
      .select('student_id')
      .eq('status', 'pending')
      .lt('due_date', new Date().toISOString());

    if (feeError) throw feeError;

    // Remove duplicates
    const uniqueStudentIds = [...new Set(feeRecords?.map(f => f.student_id))];

    if (!uniqueStudentIds.length) {
      console.log('✅ No students with pending fees');
      return [];
    }

    // Get user_ids for these students
    const { data: users, error: usersError } = await supabase
      .from(`users_${INDEX_TOKEN}`)
      .select('user_id')
      .in('student_id', uniqueStudentIds)
      .eq('role', 'student')
      .eq('status', 'active');

    if (usersError) throw usersError;

    const userIds = users?.map(u => u.user_id) || [];
    console.log(`✅ Found ${userIds.length} students with pending fees`);
    return userIds;

  } catch (error) {
    console.error('❌ getStudentsWithPendingFees failed:', error);
    return [];
  }
}

// ============================================================
// FILTER 6: Get Students by Grade Level
// ============================================================
export async function getStudentsByGrade(grade: string): Promise<string[]> {
  try {
    console.log(`🔍 Fetching students for grade: ${grade}`);

    const { data, error } = await supabase
      .from(`users_${INDEX_TOKEN}`)
      .select('user_id')
      .eq('role', 'student')
      .eq('grade', grade)
      .eq('status', 'active');

    if (error) throw error;

    const userIds = data?.map(u => u.user_id) || [];
    console.log(`✅ Found ${userIds.length} students in grade ${grade}`);
    return userIds;

  } catch (error) {
    console.error('❌ getStudentsByGrade failed:', error);
    return [];
  }
}

// ============================================================
// FILTER 7: Get Users with Specific Permission
// ============================================================
export async function getUsersWithPermission(
  permission: string
): Promise<string[]> {
  try {
    console.log(`🔍 Fetching users with permission: ${permission}`);

    const { data, error } = await supabase
      .from(`user_permissions_${INDEX_TOKEN}`)
      .select('user_id')
      .contains('permissions', [permission]);

    if (error) throw error;

    const userIds = data?.map(u => u.user_id) || [];
    console.log(`✅ Found ${userIds.length} users with permission: ${permission}`);
    return userIds;

  } catch (error) {
    console.error('❌ getUsersWithPermission failed:', error);
    return [];
  }
}

// ============================================================
// FILTER 8: Get Absent Students' Parents (Attendance Alert)
// ============================================================
export async function getParentsOfAbsentStudents(date?: string): Promise<string[]> {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    console.log(`🔍 Fetching parents of absent students for date: ${targetDate}`);

    // Get students who are marked absent
    const { data: attendance, error: attendanceError } = await supabase
      .from(`attendance_${INDEX_TOKEN}`)
      .select('student_id')
      .eq('date', targetDate)
      .eq('status', 'absent');

    if (attendanceError) throw attendanceError;

    const absentStudentIds = attendance?.map(a => a.student_id) || [];

    if (!absentStudentIds.length) {
      console.log('✅ No absent students today');
      return [];
    }

    // Get parents of these absent students
    return await getParentsOfStudents(absentStudentIds);

  } catch (error) {
    console.error('❌ getParentsOfAbsentStudents failed:', error);
    return [];
  }
}

// ============================================================
// FILTER 9: Get All Students (School-wide Broadcast)
// ============================================================
export async function getAllStudents(): Promise<string[]> {
  try {
    console.log(`🔍 Fetching all students`);

    const { data, error } = await supabase
      .from(`users_${INDEX_TOKEN}`)
      .select('user_id')
      .eq('role', 'student')
      .eq('status', 'active');

    if (error) throw error;

    const userIds = data?.map(u => u.user_id) || [];
    console.log(`✅ Found ${userIds.length} students`);
    return userIds;

  } catch (error) {
    console.error('❌ getAllStudents failed:', error);
    return [];
  }
}

// ============================================================
// FILTER 10: Get Specific Users by IDs (Custom Selection)
// ============================================================
export async function getSpecificUsers(userIds: string[]): Promise<string[]> {
  try {
    console.log(`🔍 Validating ${userIds.length} user IDs`);

    if (!userIds.length) return [];

    // Validate that these users exist and are active
    const { data, error } = await supabase
      .from(`users_${INDEX_TOKEN}`)
      .select('user_id')
      .in('user_id', userIds)
      .eq('status', 'active');

    if (error) throw error;

    const validUserIds = data?.map(u => u.user_id) || [];
    console.log(`✅ Validated ${validUserIds.length} users`);
    return validUserIds;

  } catch (error) {
    console.error('❌ getSpecificUsers failed:', error);
    return [];
  }
}
