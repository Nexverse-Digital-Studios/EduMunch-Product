import { supabase } from '@/lib/supabase';

export interface Faculty {
  id?: string;
  org_id?: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  qualification?: string;
  specialization?: string;
  experience_years?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BatchFacultyAssignment {
  id?: string;
  batch_id: string;
  faculty_id: string;
  subject_id: string;
}

export const facultyService = {
  async getFaculty(orgId: string) {
    const { data, error } = await supabase
      .from('faculty')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('first_name');

    return { data: data || [], error };
  },

  async getFacultyById(id: string) {
    const { data, error } = await supabase
      .from('faculty')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  },

  async createFaculty(faculty: Faculty) {
    const { data, error } = await supabase
      .from('faculty')
      .insert([faculty])
      .select()
      .single();

    return { data, error };
  },

  async updateFaculty(id: string, updates: Partial<Faculty>) {
    const { data, error } = await supabase
      .from('faculty')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  async deleteFaculty(id: string) {
    const { error } = await supabase
      .from('faculty')
      .delete()
      .eq('id', id);

    return { error };
  },

  async getBatchFaculty(batchId: string) {
    const { data, error } = await supabase
      .from('batch_faculty')
      .select(`
        *,
        faculty:faculty_id(id, first_name, last_name, email),
        subject:subject_id(id, name, code)
      `)
      .eq('batch_id', batchId);

    return { data: data || [], error };
  },

  async assignFacultyToBatch(assignment: BatchFacultyAssignment) {
    const { data, error } = await supabase
      .from('batch_faculty')
      .insert([assignment])
      .select()
      .single();

    return { data, error };
  },

  async removeFacultyFromBatch(batchId: string, facultyId: string, subjectId: string) {
    const { error } = await supabase
      .from('batch_faculty')
      .delete()
      .eq('batch_id', batchId)
      .eq('faculty_id', facultyId)
      .eq('subject_id', subjectId);

    return { error };
  },
};
