import { supabase } from '@/lib/supabase';

export interface Branch {
  id?: string;
  org_id?: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  phone_number?: string;
  email?: string;
  manager_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const branchesService = {
  async getBranches(orgId: string) {
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('name');

    return { data: data || [], error };
  },

  async getBranchById(id: string) {
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  },

  async createBranch(branch: Branch) {
    const { data, error } = await supabase
      .from('branches')
      .insert([branch])
      .select()
      .single();

    return { data, error };
  },

  async updateBranch(id: string, updates: Partial<Branch>) {
    const { data, error } = await supabase
      .from('branches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  async deleteBranch(id: string) {
    const { error } = await supabase
      .from('branches')
      .delete()
      .eq('id', id);

    return { error };
  },

  async searchBranches(orgId: string, query: string) {
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .eq('org_id', orgId)
      .or(`name.ilike.%${query}%,code.ilike.%${query}%,city.ilike.%${query}%`)
      .order('name');

    return { data: data || [], error };
  },
};
