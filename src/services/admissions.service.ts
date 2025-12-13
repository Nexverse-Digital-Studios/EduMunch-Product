import { supabase } from '@/lib/supabase';

export interface AdmissionRecord {
  id?: string;
  org_id?: string;
  branch_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  category?: string;
  course_id?: string;
  current_school?: string;
  current_class?: string;
  admission_id: string;
  admission_date?: string;
  session_year?: string;
  tie_up_school?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const admissionsService = {
  /**
   * Get all admissions for the current organization
   */
  async getAdmissions(orgId: string) {
    try {
      const { data, error } = await supabase
        .from('admissions')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  /**
   * Search admissions by student name, email, or admission ID
   */
  async searchAdmissions(orgId: string, query: string) {
    try {
      const { data, error } = await supabase
        .from('admissions')
        .select('*')
        .eq('org_id', orgId)
        .or(
          `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,admission_id.ilike.%${query}%`
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  /**
   * Get a single admission by ID
   */
  async getAdmissionById(id: string) {
    try {
      const { data, error } = await supabase
        .from('admissions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Create a new admission
   */
  async createAdmission(admission: AdmissionRecord) {
    try {
      const { data, error } = await supabase
        .from('admissions')
        .insert([admission])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Update an existing admission
   */
  async updateAdmission(id: string, updates: Partial<AdmissionRecord>) {
    try {
      const { data, error } = await supabase
        .from('admissions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Delete an admission
   */
  async deleteAdmission(id: string) {
    try {
      const { error } = await supabase
        .from('admissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  /**
   * Filter admissions by multiple criteria
   */
  async filterAdmissions(
    orgId: string,
    filters: {
      branch_id?: string;
      course_id?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    try {
      let query = supabase
        .from('admissions')
        .select('*')
        .eq('org_id', orgId);

      if (filters.branch_id) {
        query = query.eq('branch_id', filters.branch_id);
      }
      if (filters.course_id) {
        query = query.eq('course_id', filters.course_id);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.startDate) {
        query = query.gte('admission_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('admission_date', filters.endDate);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  /**
   * Update admission status
   */
  async updateAdmissionStatus(
    id: string,
    status: 'PENDING' | 'ACTIVE' | 'REJECTED'
  ) {
    try {
      const { data, error } = await supabase
        .from('admissions')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get admissions count by status
   */
  async getAdmissionsCountByStatus(orgId: string) {
    try {
      const { data, error } = await supabase
        .from('admissions')
        .select('status', { count: 'exact' })
        .eq('org_id', orgId);

      if (error) throw error;

      const counts = {
        PENDING: 0,
        ACTIVE: 0,
        REJECTED: 0,
      };

      data?.forEach((item: any) => {
        if (item.status in counts) {
          counts[item.status as keyof typeof counts]++;
        }
      });

      return { data: counts, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};
