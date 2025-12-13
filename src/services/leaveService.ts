import { supabase } from '@/lib/supabase';
import { AuthUser } from './auth.service';

export interface LeaveApplication {
  id: string;
  org_id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  deducted_as?: string;
  approved_by?: string;
  approval_date?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  employee_name?: string;
}

export const leaveService = {
  async getLeaveApplications(user: AuthUser | null, filters?: {
    status?: string;
    leave_type?: string;
    start_date?: string;
    end_date?: string;
    employee_id?: string;
  }): Promise<LeaveApplication[]> {
    if (!user?.orgId) return [];
    let query = supabase
      .from('leave_applications')
      .select('*')
      .eq('org_id', user.orgId);

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.leave_type) query = query.eq('leave_type', filters.leave_type);
    if (filters?.employee_id) query = query.eq('employee_id', filters.employee_id);
    
    if (filters?.start_date) {
      query = query.gte('start_date', filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte('end_date', filters.end_date);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getLeaveById(user: AuthUser, id: string): Promise<LeaveApplication | null> {
    const { data, error } = await supabase
      .from('leave_applications')
      .select('*')
      .eq('id', id)
      .eq('org_id', user.orgId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async createLeaveApplication(
    user: AuthUser,
    data: Omit<LeaveApplication, 'id' | 'org_id' | 'created_at' | 'updated_at'>
  ): Promise<LeaveApplication> {
    const { data: result, error } = await supabase
      .from('leave_applications')
      .insert({
        ...data,
        org_id: user.orgId,
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  async updateLeaveApplication(
    user: AuthUser,
    id: string,
    updates: Partial<LeaveApplication>
  ): Promise<LeaveApplication> {
    const { data, error } = await supabase
      .from('leave_applications')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('org_id', user.orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async approveLeave(
    user: AuthUser,
    id: string,
    deductedAs: string
  ): Promise<LeaveApplication> {
    const { data, error } = await supabase
      .from('leave_applications')
      .update({
        status: 'APPROVED',
        deducted_as: deductedAs,
        approved_by: user.id,
        approval_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('org_id', user.orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async rejectLeave(
    user: AuthUser,
    id: string,
    reason: string
  ): Promise<LeaveApplication> {
    const { data, error } = await supabase
      .from('leave_applications')
      .update({
        status: 'REJECTED',
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('org_id', user.orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteLeaveApplication(user: AuthUser, id: string): Promise<void> {
    const { error } = await supabase
      .from('leave_applications')
      .delete()
      .eq('id', id)
      .eq('org_id', user.orgId);

    if (error) throw error;
  },

  async searchLeaveApplications(user: AuthUser, searchTerm: string): Promise<LeaveApplication[]> {
    // Search across employee names, leave types, and reasons
    const { data, error } = await supabase
      .from('leave_applications')
      .select('*')
      .eq('org_id', user.orgId)
      .or(`reason.ilike.%${searchTerm}%,leave_type.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getLeaveStats(user: AuthUser): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    const { data, error } = await supabase
      .from('leave_applications')
      .select('status', { count: 'exact' })
      .eq('org_id', user.orgId);

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      pending: data?.filter(d => d.status === 'PENDING').length || 0,
      approved: data?.filter(d => d.status === 'APPROVED').length || 0,
      rejected: data?.filter(d => d.status === 'REJECTED').length || 0,
    };

    return stats;
  },
};
