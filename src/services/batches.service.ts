import { supabase } from '@/lib/supabase';

export interface Batch {
  id?: string;
  org_id?: string;
  branch_id: string;
  course_id: string;
  name: string;
  code: string;
  description?: string;
  start_date: string;
  end_date: string;
  capacity?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const batchesService = {
  async getBatches(orgId: string) {
    const { data, error } = await supabase
      .from('batches')
      .select(`
        *,
        branch:branch_id(id, name, code),
        course:course_id(id, name, code)
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  },

  async getBatchById(id: string) {
    const { data, error } = await supabase
      .from('batches')
      .select(`
        *,
        branch:branch_id(id, name, code),
        course:course_id(id, name, code)
      `)
      .eq('id', id)
      .single();

    return { data, error };
  },

  async createBatch(batch: Batch) {
    const { data, error } = await supabase
      .from('batches')
      .insert([batch])
      .select()
      .single();

    return { data, error };
  },

  async updateBatch(id: string, updates: Partial<Batch>) {
    const { data, error } = await supabase
      .from('batches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  async deleteBatch(id: string) {
    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', id);

    return { error };
  },

  async searchBatches(orgId: string, query: string) {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .eq('org_id', orgId)
      .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  },

  async getBatchesByBranch(orgId: string, branchId: string) {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .eq('org_id', orgId)
      .eq('branch_id', branchId)
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  },

  async getBatchesByCourse(orgId: string, courseId: string) {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .eq('org_id', orgId)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  },
};
