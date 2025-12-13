import { supabase } from '@/lib/supabase';

export interface Subject {
  id?: string;
  org_id?: string;
  name: string;
  code: string;
  description?: string;
  total_chapters?: number;
  total_hours?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const subjectsService = {
  async getSubjects(orgId: string) {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('name');

    return { data: data || [], error };
  },

  async getSubjectById(id: string) {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  },

  async createSubject(subject: Subject) {
    const { data, error } = await supabase
      .from('subjects')
      .insert([subject])
      .select()
      .single();

    return { data, error };
  },

  async updateSubject(id: string, updates: Partial<Subject>) {
    const { data, error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  async deleteSubject(id: string) {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    return { error };
  },

  async getBatchSubjects(batchId: string) {
    const { data, error } = await supabase
      .from('batch_subjects')
      .select(`
        *,
        subject:subject_id(id, name, code)
      `)
      .eq('batch_id', batchId);

    return { data: data || [], error };
  },

  async addSubjectToBatch(batchId: string, subjectId: string) {
    const { data, error } = await supabase
      .from('batch_subjects')
      .insert([{ batch_id: batchId, subject_id: subjectId }])
      .select()
      .single();

    return { data, error };
  },

  async removeSubjectFromBatch(batchId: string, subjectId: string) {
    const { error } = await supabase
      .from('batch_subjects')
      .delete()
      .eq('batch_id', batchId)
      .eq('subject_id', subjectId);

    return { error };
  },
};
