/**
 * useGrievances Hook
 * ====================
 * Hook for managing parent-teacher grievances
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, TABLES } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useParentChildData } from '@/hooks/useParentChildData';
import { 
  GrievanceDB, 
  GrievanceWithDetails, 
  GrievanceMessageDB, 
  GrievanceMessageWithSender,
  CreateGrievanceForm 
} from './types';

const INDEX_TOKEN = '1emaet';

// Table names
const GRIEVANCES_TABLE = `parent_teacher_grievances_${INDEX_TOKEN}`;
const MESSAGES_TABLE = `grievance_messages_${INDEX_TOKEN}`;

interface TeacherForStudent {
  id: string;
  first_name: string;
  last_name: string;
  employee_code: string;
  email: string | null;
  subject_name: string;
}

export const useGrievances = () => {
  const { userProfile } = useAuth();
  const { isParent, children } = useParentChildData();
  const [grievances, setGrievances] = useState<GrievanceWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const roleCode = userProfile?.primary_role?.role_code;
  const isTeacher = roleCode === 'teacher';
  const isAdmin = ['super_admin', 'admin', 'principal', 'vice_principal'].includes(roleCode || '');

  // Fetch grievances based on user role
  const fetchGrievances = useCallback(async () => {
    if (!supabase || !userProfile) return;
    
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from(GRIEVANCES_TABLE)
        .select(`
          *,
          parents_${INDEX_TOKEN}!parent_id (
            id, full_name, email, phone, user_id
          ),
          students_${INDEX_TOKEN}!student_id (
            id, first_name, last_name, admission_number,
            classes_${INDEX_TOKEN} (class_name),
            sections_${INDEX_TOKEN} (section_name)
          ),
          teachers_${INDEX_TOKEN}!teacher_id (
            id, first_name, last_name, employee_code, email, user_id
          )
        `)
        .order('last_message_at', { ascending: false });

      // RLS will filter based on role, but we can add explicit filters
      if (isParent) {
        // Get parent_id for current user
        const { data: parentData } = await supabase
          .from(`parents_${INDEX_TOKEN}`)
          .select('id')
          .eq('user_id', userProfile.id)
          .single();
        
        if (parentData) {
          query = query.eq('parent_id', parentData.id);
        }
      } else if (isTeacher) {
        // Get teacher_id for current user
        const { data: teacherData } = await supabase
          .from(`teachers_${INDEX_TOKEN}`)
          .select('id')
          .eq('user_id', userProfile.id)
          .single();
        
        if (teacherData) {
          query = query.eq('teacher_id', teacherData.id);
        }
      }
      // Admin sees all (no additional filter)

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('[useGrievances] Error fetching:', fetchError);
        setError(fetchError.message);
        return;
      }

      // Transform data to include nested relations
      const transformed: GrievanceWithDetails[] = (data || []).map((g: any) => ({
        ...g,
        parent: g[`parents_${INDEX_TOKEN}`],
        student: {
          ...g[`students_${INDEX_TOKEN}`],
          class_name: g[`students_${INDEX_TOKEN}`]?.[`classes_${INDEX_TOKEN}`]?.class_name,
          section_name: g[`students_${INDEX_TOKEN}`]?.[`sections_${INDEX_TOKEN}`]?.section_name,
        },
        teacher: g[`teachers_${INDEX_TOKEN}`],
      }));

      setGrievances(transformed);
    } catch (err) {
      console.error('[useGrievances] Error:', err);
      setError('Failed to load grievances');
    } finally {
      setIsLoading(false);
    }
  }, [userProfile, isParent, isTeacher]);

  // Create new grievance
  const createGrievance = useCallback(async (form: CreateGrievanceForm): Promise<{ success: boolean; error?: string; id?: string }> => {
    if (!supabase || !userProfile) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // Get parent_id for current user
      const { data: parentData, error: parentError } = await supabase
        .from(`parents_${INDEX_TOKEN}`)
        .select('id')
        .eq('user_id', userProfile.id)
        .single();

      if (parentError || !parentData) {
        return { success: false, error: 'Parent profile not found' };
      }

      const { data, error } = await supabase
        .from(GRIEVANCES_TABLE)
        .insert({
          parent_id: parentData.id,
          student_id: form.student_id,
          teacher_id: form.teacher_id,
          subject: form.subject,
          description: form.description,
          category: form.category,
          priority: form.priority,
        })
        .select('id')
        .single();

      if (error) {
        console.error('[useGrievances] Create error:', error);
        return { success: false, error: error.message };
      }

      // Add initial message
      if (form.description) {
        await supabase
          .from(MESSAGES_TABLE)
          .insert({
            grievance_id: data.id,
            sender_id: userProfile.id,
            sender_type: 'Parent',
            message: form.description,
          });
      }

      await fetchGrievances();
      return { success: true, id: data.id };
    } catch (err: any) {
      console.error('[useGrievances] Create error:', err);
      return { success: false, error: err.message };
    }
  }, [userProfile, fetchGrievances]);

  // Update grievance status
  const updateStatus = useCallback(async (
    grievanceId: string, 
    status: string, 
    resolutionNotes?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) return { success: false, error: 'Not connected' };

    try {
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString() 
      };

      if (status === 'Resolved' || status === 'Closed') {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = userProfile?.id;
        if (resolutionNotes) {
          updateData.resolution_notes = resolutionNotes;
        }
      }

      const { error } = await supabase
        .from(GRIEVANCES_TABLE)
        .update(updateData)
        .eq('id', grievanceId);

      if (error) {
        return { success: false, error: error.message };
      }

      await fetchGrievances();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [userProfile, fetchGrievances]);

  // Get teachers for a specific student
  const getTeachersForStudent = useCallback(async (studentId: string): Promise<TeacherForStudent[]> => {
    if (!supabase) return [];

    try {
      // Get student's section
      const { data: studentData } = await supabase
        .from(`students_${INDEX_TOKEN}`)
        .select('section_id')
        .eq('id', studentId)
        .single();

      if (!studentData) return [];

      // Get teachers teaching in that section
      const { data: tssData } = await supabase
        .from(`teacher_subject_sections_${INDEX_TOKEN}`)
        .select(`
          teacher_id,
          teachers_${INDEX_TOKEN}!teacher_id (
            id, first_name, last_name, employee_code, email
          ),
          subjects_${INDEX_TOKEN}!subject_id (
            subject_name
          )
        `)
        .eq('section_id', studentData.section_id);

      if (!tssData) return [];

      // Transform and deduplicate teachers
      const teacherMap = new Map<string, TeacherForStudent>();
      
      tssData.forEach((tss: any) => {
        const teacher = tss[`teachers_${INDEX_TOKEN}`];
        const subject = tss[`subjects_${INDEX_TOKEN}`];
        
        if (teacher && !teacherMap.has(teacher.id)) {
          teacherMap.set(teacher.id, {
            id: teacher.id,
            first_name: teacher.first_name,
            last_name: teacher.last_name,
            employee_code: teacher.employee_code,
            email: teacher.email,
            subject_name: subject?.subject_name || 'N/A',
          });
        }
      });

      return Array.from(teacherMap.values());
    } catch (err) {
      console.error('[useGrievances] Error fetching teachers:', err);
      return [];
    }
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(async (grievanceId: string, isParentUser: boolean) => {
    if (!supabase) return;

    try {
      // Update unread count
      const updateField = isParentUser ? 'unread_by_parent' : 'unread_by_teacher';
      await supabase
        .from(GRIEVANCES_TABLE)
        .update({ [updateField]: 0 })
        .eq('id', grievanceId);

      // Mark messages as read
      const senderTypes = isParentUser ? ['Teacher', 'Admin'] : ['Parent'];
      await supabase
        .from(MESSAGES_TABLE)
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('grievance_id', grievanceId)
        .in('sender_type', senderTypes)
        .eq('is_read', false);

      await fetchGrievances();
    } catch (err) {
      console.error('[useGrievances] Error marking as read:', err);
    }
  }, [fetchGrievances]);

  useEffect(() => {
    if (userProfile) {
      fetchGrievances();
    }
  }, [userProfile, fetchGrievances]);

  return {
    grievances,
    isLoading,
    error,
    isParent,
    isTeacher,
    isAdmin,
    children,
    createGrievance,
    updateStatus,
    getTeachersForStudent,
    markAsRead,
    refresh: fetchGrievances,
  };
};

// Hook for single grievance with messages
export const useGrievanceChat = (grievanceId: string) => {
  const { userProfile } = useAuth();
  const [grievance, setGrievance] = useState<GrievanceWithDetails | null>(null);
  const [messages, setMessages] = useState<GrievanceMessageWithSender[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const roleCode = userProfile?.primary_role?.role_code;
  const isParentUser = roleCode === 'parent';

  // Fetch grievance and messages
  const fetchData = useCallback(async () => {
    if (!supabase || !grievanceId) return;

    setIsLoading(true);
    try {
      // Fetch grievance
      const { data: gData } = await supabase
        .from(GRIEVANCES_TABLE)
        .select(`
          *,
          parents_${INDEX_TOKEN}!parent_id (
            id, full_name, email, phone, user_id
          ),
          students_${INDEX_TOKEN}!student_id (
            id, first_name, last_name, admission_number
          ),
          teachers_${INDEX_TOKEN}!teacher_id (
            id, first_name, last_name, employee_code, email, user_id
          )
        `)
        .eq('id', grievanceId)
        .single();

      if (gData) {
        setGrievance({
          ...gData,
          parent: gData[`parents_${INDEX_TOKEN}`],
          student: gData[`students_${INDEX_TOKEN}`],
          teacher: gData[`teachers_${INDEX_TOKEN}`],
        });
      }

      // Fetch messages
      const { data: mData } = await supabase
        .from(MESSAGES_TABLE)
        .select(`
          *,
          users_${INDEX_TOKEN}!sender_id (
            id, full_name, email, profile_photo_url
          )
        `)
        .eq('grievance_id', grievanceId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (mData) {
        setMessages(mData.map((m: any) => ({
          ...m,
          sender: m[`users_${INDEX_TOKEN}`],
        })));
      }
    } catch (err) {
      console.error('[useGrievanceChat] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [grievanceId]);

  // Send message
  const sendMessage = useCallback(async (message: string, attachmentUrl?: string): Promise<boolean> => {
    if (!supabase || !userProfile || !grievanceId) return false;

    try {
      const senderType = isParentUser ? 'Parent' : 
        ['super_admin', 'admin', 'principal'].includes(roleCode || '') ? 'Admin' : 'Teacher';

      const { error } = await supabase
        .from(MESSAGES_TABLE)
        .insert({
          grievance_id: grievanceId,
          sender_id: userProfile.id,
          sender_type: senderType,
          message,
          attachment_url: attachmentUrl,
        });

      if (error) {
        console.error('[useGrievanceChat] Send error:', error);
        return false;
      }

      // Update grievance status to In Progress if it was Open
      if (grievance?.status === 'Open' && !isParentUser) {
        await supabase
          .from(GRIEVANCES_TABLE)
          .update({ status: 'In Progress' })
          .eq('id', grievanceId);
      }

      await fetchData();
      return true;
    } catch (err) {
      console.error('[useGrievanceChat] Error:', err);
      return false;
    }
  }, [grievanceId, userProfile, isParentUser, roleCode, grievance, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    if (!supabase || !grievanceId) return;

    const channel = supabase
      .channel(`grievance-${grievanceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: MESSAGES_TABLE,
          filter: `grievance_id=eq.${grievanceId}`,
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [grievanceId, fetchData]);

  return {
    grievance,
    messages,
    isLoading,
    isParentUser,
    sendMessage,
    refresh: fetchData,
  };
};

export default useGrievances;
