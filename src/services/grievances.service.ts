import { supabase } from '@/lib/supabase';

export interface Grievance {
  id: string;
  org_id: string;
  grievance_number: string;
  parent_id?: string;
  parent_name?: string;
  parent_phone?: string;
  student_id?: string;
  batch_id?: string;
  subject: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'CLOSED' | 'RESOLVED';
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  submitted_date: string;
  resolved_date?: string;
  assigned_to?: string;
  attachments?: any;
  resolution_notes?: string;
  created_at?: string;
  updated_at?: string;
  parent?: any;
  student?: any;
}

class GrievancesService {
  async getGrievances(orgId: string, filters?: { status?: string; priority?: string }) {
    let query = supabase
      .from('grievances')
      .select(`
        *,
        parent:parent_id(id, first_name, last_name, email),
        student:student_id(id, first_name, last_name, email)
      `)
      .eq('org_id', orgId)
      .order('submitted_date', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Grievance[];
  }

  async getGrievanceById(id: string) {
    const { data, error } = await supabase
      .from('grievances')
      .select(`
        *,
        parent:parent_id(id, first_name, last_name, email, phone),
        student:student_id(id, first_name, last_name, email),
        assigned_user:assigned_to(id, first_name, last_name, email)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Grievance;
  }

  async createGrievance(orgId: string, grievance: Partial<Grievance>) {
    const grievanceNumber = `GRV-${Date.now()}`;
    const { data, error } = await supabase
      .from('grievances')
      .insert([
        {
          org_id: orgId,
          grievance_number: grievanceNumber,
          parent_id: grievance.parent_id,
          parent_name: grievance.parent_name,
          parent_phone: grievance.parent_phone,
          student_id: grievance.student_id,
          batch_id: grievance.batch_id,
          subject: grievance.subject,
          description: grievance.description,
          status: 'PENDING',
          priority: grievance.priority || 'NORMAL',
          attachments: grievance.attachments,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data as Grievance;
  }

  async updateGrievance(id: string, grievance: Partial<Grievance>) {
    const { data, error } = await supabase
      .from('grievances')
      .update(grievance)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Grievance;
  }

  async updateGrievanceStatus(id: string, status: string, resolutionNotes?: string) {
    const update: any = { status };
    if (status === 'RESOLVED' || status === 'CLOSED') {
      update.resolved_date = new Date().toISOString();
      if (resolutionNotes) {
        update.resolution_notes = resolutionNotes;
      }
    }

    const { data, error } = await supabase
      .from('grievances')
      .update(update)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Grievance;
  }

  async assignGrievance(id: string, assignedTo: string) {
    const { data, error } = await supabase
      .from('grievances')
      .update({ assigned_to: assignedTo })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Grievance;
  }

  async deleteGrievance(id: string) {
    const { error } = await supabase
      .from('grievances')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async searchGrievances(orgId: string, query: string) {
    const { data, error } = await supabase
      .from('grievances')
      .select(`
        *,
        parent:parent_id(id, first_name, last_name),
        student:student_id(id, first_name, last_name)
      `)
      .eq('org_id', orgId)
      .or(
        `grievance_number.ilike.%${query}%,subject.ilike.%${query}%,parent_name.ilike.%${query}%`
      );
    if (error) throw error;
    return data as Grievance[];
  }

  async getGrievanceStats(orgId: string) {
    const { data, error } = await supabase
      .from('grievances')
      .select('status', { count: 'exact' })
      .eq('org_id', orgId);
    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      pending: data?.filter((g: any) => g.status === 'PENDING').length || 0,
      inProgress: data?.filter((g: any) => g.status === 'IN_PROGRESS').length || 0,
      resolved: data?.filter((g: any) => g.status === 'RESOLVED').length || 0,
      closed: data?.filter((g: any) => g.status === 'CLOSED').length || 0,
    };
    return stats;
  }
}

export const grievancesService = new GrievancesService();
