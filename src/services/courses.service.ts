import { supabase } from '@/lib/supabase';

export interface Course {
  id?: string;
  org_id?: string;
  name: string;
  code: string;
  description?: string;
  duration_months?: number;
  level?: string;
  category?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CourseBranchPricing {
  courseId: string;
  branchId: string;
  fees: number;
}

export const coursesService = {
  async getCourses(orgId: string) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('name');

    return { data: data || [], error };
  },

  async getCourseById(id: string) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  },

  async createCourse(course: Course) {
    const { data, error } = await supabase
      .from('courses')
      .insert([course])
      .select()
      .single();

    return { data, error };
  },

  async updateCourse(id: string, updates: Partial<Course>) {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  async deleteCourse(id: string) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    return { error };
  },

  async searchCourses(orgId: string, query: string) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('org_id', orgId)
      .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
      .order('name');

    return { data: data || [], error };
  },
};
