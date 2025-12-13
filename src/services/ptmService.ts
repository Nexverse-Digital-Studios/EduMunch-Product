import { supabase } from '@/lib/supabase';
import { AuthUser } from './auth.service';

export interface PTMRequest {
  id: string;
  org_id: string;
  parent_id?: string;
  parent_name?: string;
  teacher_id?: string;
  teacher_name?: string;
  student_id?: string;
  reason: string;
  preferred_time?: string;
  scheduled_time?: string;
  status: 'PENDING' | 'APPROVED' | 'AWAITING_PARENT' | 'DECLINED' | 'COMPLETED';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const ptmService = {
  async createPTMRequest(
    user: AuthUser,
    data: Omit<PTMRequest, 'id' | 'org_id' | 'created_at' | 'updated_at'>
  ): Promise<PTMRequest> {
    const { data: result, error } = await supabase
      .from('ptm_requests')
      .insert({
        ...data,
        org_id: user.orgId,
        status: 'PENDING',
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  async getPTMRequests(user: AuthUser, filters?: {
    status?: string;
    parent_id?: string;
    teacher_id?: string;
    student_id?: string;
  }): Promise<PTMRequest[]> {
    let query = supabase
      .from('ptm_requests')
      .select('*')
      .eq('org_id', user.orgId);

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.parent_id) query = query.eq('parent_id', filters.parent_id);
    if (filters?.teacher_id) query = query.eq('teacher_id', filters.teacher_id);
    if (filters?.student_id) query = query.eq('student_id', filters.student_id);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPTMRequestById(user: AuthUser, id: string): Promise<PTMRequest | null> {
    const { data, error } = await supabase
      .from('ptm_requests')
      .select('*')
      .eq('id', id)
      .eq('org_id', user.orgId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async updatePTMRequest(
    user: AuthUser,
    id: string,
    updates: Partial<PTMRequest>
  ): Promise<PTMRequest> {
    const { data, error } = await supabase
      .from('ptm_requests')
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

  async approvePTMRequest(
    user: AuthUser,
    id: string,
    scheduledTime: string,
    notes?: string
  ): Promise<PTMRequest> {
    const { data, error } = await supabase
      .from('ptm_requests')
      .update({
        status: 'APPROVED',
        scheduled_time: scheduledTime,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('org_id', user.orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async declinePTMRequest(
    user: AuthUser,
    id: string,
    notes?: string
  ): Promise<PTMRequest> {
    const { data, error } = await supabase
      .from('ptm_requests')
      .update({
        status: 'DECLINED',
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('org_id', user.orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async setPTMAwaitingParent(
    user: AuthUser,
    id: string,
    notes?: string
  ): Promise<PTMRequest> {
    const { data, error } = await supabase
      .from('ptm_requests')
      .update({
        status: 'AWAITING_PARENT',
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('org_id', user.orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markPTMCompleted(
    user: AuthUser,
    id: string,
    notes?: string
  ): Promise<PTMRequest> {
    const { data, error } = await supabase
      .from('ptm_requests')
      .update({
        status: 'COMPLETED',
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('org_id', user.orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePTMRequest(user: AuthUser, id: string): Promise<void> {
    const { error } = await supabase
      .from('ptm_requests')
      .delete()
      .eq('id', id)
      .eq('org_id', user.orgId);

    if (error) throw error;
  },

  async searchPTMRequests(user: AuthUser, searchTerm: string): Promise<PTMRequest[]> {
    const { data, error } = await supabase
      .from('ptm_requests')
      .select('*')
      .eq('org_id', user.orgId)
      .or(`parent_name.ilike.%${searchTerm}%,teacher_name.ilike.%${searchTerm}%,reason.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPTMRequestsByStatus(user: AuthUser, status: string): Promise<PTMRequest[]> {
    const { data, error } = await supabase
      .from('ptm_requests')
      .select('*')
      .eq('org_id', user.orgId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPTMStats(user: AuthUser): Promise<{
    pending: number;
    awaitingParent: number;
    approved: number;
    declined: number;
    completed: number;
  }> {
    const { data, error } = await supabase
      .from('ptm_requests')
      .select('status', { count: 'exact' })
      .eq('org_id', user.orgId);

    if (error) throw error;

    const stats = {
      pending: data?.filter((d: any) => d.status === 'PENDING').length || 0,
      awaitingParent: data?.filter((d: any) => d.status === 'AWAITING_PARENT').length || 0,
      approved: data?.filter((d: any) => d.status === 'APPROVED').length || 0,
      declined: data?.filter((d: any) => d.status === 'DECLINED').length || 0,
      completed: data?.filter((d: any) => d.status === 'COMPLETED').length || 0,
    };

    return stats;
  },
};
