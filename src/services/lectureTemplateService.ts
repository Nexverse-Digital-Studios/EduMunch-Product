import { supabase } from '@/lib/supabase';
import { AuthUser } from './auth.service';

export interface LectureTimingTemplate {
  id: string;
  org_id: string;
  branch_id: string;
  template_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LectureTimingSlot {
  id: string;
  org_id: string;
  template_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  slot_order: number;
  created_at: string;
}

export const lectureTemplateService = {
  async getTemplatesByBranch(user: AuthUser, branchId: string): Promise<LectureTimingTemplate[]> {
    const { data, error } = await supabase
      .from('lecture_timing_templates')
      .select('*')
      .eq('org_id', user.orgId)
      .eq('branch_id', branchId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getTemplateById(user: AuthUser, templateId: string): Promise<LectureTimingTemplate | null> {
    const { data, error } = await supabase
      .from('lecture_timing_templates')
      .select('*')
      .eq('id', templateId)
      .eq('org_id', user.orgId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async createTemplate(
    user: AuthUser,
    branchId: string,
    templateName?: string
  ): Promise<LectureTimingTemplate> {
    const { data, error } = await supabase
      .from('lecture_timing_templates')
      .insert({
        org_id: user.orgId,
        branch_id: branchId,
        template_name: templateName,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTemplate(
    user: AuthUser,
    templateId: string,
    updates: Partial<LectureTimingTemplate>
  ): Promise<LectureTimingTemplate> {
    const { data, error } = await supabase
      .from('lecture_timing_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', templateId)
      .eq('org_id', user.orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTemplate(user: AuthUser, templateId: string): Promise<void> {
    const { error } = await supabase
      .from('lecture_timing_templates')
      .delete()
      .eq('id', templateId)
      .eq('org_id', user.orgId);

    if (error) throw error;
  },

  // Slot operations
  async getSlotsByTemplate(user: AuthUser, templateId: string): Promise<LectureTimingSlot[]> {
    const { data, error } = await supabase
      .from('lecture_timing_slots')
      .select('*')
      .eq('org_id', user.orgId)
      .eq('template_id', templateId)
      .order('day_of_week')
      .order('slot_order');

    if (error) throw error;
    return data || [];
  },

  async getSlotsByDay(user: AuthUser, templateId: string, dayOfWeek: string): Promise<LectureTimingSlot[]> {
    const { data, error } = await supabase
      .from('lecture_timing_slots')
      .select('*')
      .eq('org_id', user.orgId)
      .eq('template_id', templateId)
      .eq('day_of_week', dayOfWeek)
      .order('slot_order');

    if (error) throw error;
    return data || [];
  },

  async addSlot(
    user: AuthUser,
    templateId: string,
    dayOfWeek: string,
    startTime: string,
    endTime: string,
    slotOrder: number
  ): Promise<LectureTimingSlot> {
    const { data, error } = await supabase
      .from('lecture_timing_slots')
      .insert({
        org_id: user.orgId,
        template_id: templateId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        slot_order: slotOrder,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSlot(
    user: AuthUser,
    slotId: string,
    updates: Partial<Omit<LectureTimingSlot, 'id' | 'org_id' | 'created_at'>>
  ): Promise<LectureTimingSlot> {
    const { data, error } = await supabase
      .from('lecture_timing_slots')
      .update(updates)
      .eq('id', slotId)
      .eq('org_id', user.orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeSlot(user: AuthUser, slotId: string): Promise<void> {
    const { error } = await supabase
      .from('lecture_timing_slots')
      .delete()
      .eq('id', slotId)
      .eq('org_id', user.orgId);

    if (error) throw error;
  },

  async getSlotsByMultipleDays(user: AuthUser, templateId: string, days: string[]): Promise<Record<string, LectureTimingSlot[]>> {
    const { data, error } = await supabase
      .from('lecture_timing_slots')
      .select('*')
      .eq('org_id', user.orgId)
      .eq('template_id', templateId)
      .in('day_of_week', days)
      .order('day_of_week')
      .order('slot_order');

    if (error) throw error;

    const result: Record<string, LectureTimingSlot[]> = {};
    days.forEach(day => {
      result[day] = (data || []).filter((slot: any) => slot.day_of_week === day);
    });

    return result;
  },
};
