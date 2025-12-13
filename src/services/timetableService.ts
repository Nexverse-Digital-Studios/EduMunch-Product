import { supabase } from "@/lib/supabase";
import { AuthUser } from "./auth.service";

export interface Timetable {
  id: string;
  org_id: string;
  batch_id: string;
  week_date: string;
  created_at: string;
}

export interface TimetableSlot {
  id: string;
  org_id: string;
  timetable_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject_id?: string;
  faculty_id?: string;
  is_merged: boolean;
}

export const timetableService = {
  // Get timetable for batch
  async getTimetableByBatch(user: AuthUser | null, batchId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("timetables")
      .select("*")
      .eq("org_id", user.orgId)
      .eq("batch_id", batchId)
      .order("week_date", { ascending: false })
      .limit(1)
      .single();

    return { data, error };
  },

  // Get all timetables
  async getAllTimetables(user: AuthUser | null) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("timetables")
      .select("*")
      .eq("org_id", user.orgId)
      .order("week_date", { ascending: false });

    return { data, error };
  },

  // Create new timetable
  async createTimetable(
    user: AuthUser | null,
    timetable: Omit<Timetable, "id" | "org_id" | "created_at">
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("timetables")
      .insert([
        {
          ...timetable,
          org_id: user.orgId,
        },
      ])
      .select()
      .single();

    return { data, error };
  },

  // Get timetable slots
  async getTimetableSlots(user: AuthUser | null, timetableId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("timetable_slots")
      .select("*")
      .eq("org_id", user.orgId)
      .eq("timetable_id", timetableId)
      .order("day_of_week, start_time");

    return { data, error };
  },

  // Add slot to timetable
  async addSlot(
    user: AuthUser | null,
    slot: Omit<TimetableSlot, "id" | "org_id">
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("timetable_slots")
      .insert([
        {
          ...slot,
          org_id: user.orgId,
        },
      ])
      .select()
      .single();

    return { data, error };
  },

  // Update slot
  async updateSlot(
    user: AuthUser | null,
    slotId: string,
    updates: Partial<TimetableSlot>
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("timetable_slots")
      .update(updates)
      .eq("id", slotId)
      .eq("org_id", user.orgId)
      .select()
      .single();

    return { data, error };
  },

  // Delete slot
  async deleteSlot(user: AuthUser | null, slotId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { error } = await supabase
      .from("timetable_slots")
      .delete()
      .eq("id", slotId)
      .eq("org_id", user.orgId);

    return { data: null, error };
  },

  // Bulk create slots
  async bulkCreateSlots(
    user: AuthUser | null,
    slots: Array<Omit<TimetableSlot, "id" | "org_id">>
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("timetable_slots")
      .insert(
        slots.map((s) => ({
          ...s,
          org_id: user.orgId,
        }))
      )
      .select();

    return { data, error };
  },

  // Delete all slots for timetable
  async deleteAllSlots(user: AuthUser | null, timetableId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { error } = await supabase
      .from("timetable_slots")
      .delete()
      .eq("timetable_id", timetableId)
      .eq("org_id", user.orgId);

    return { data: null, error };
  },

  // Get timetable with slots (complete view)
  async getTimetableComplete(user: AuthUser | null, timetableId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const timetable = await supabase
      .from("timetables")
      .select("*")
      .eq("id", timetableId)
      .eq("org_id", user.orgId)
      .single();

    const slots = await supabase
      .from("timetable_slots")
      .select("*")
      .eq("timetable_id", timetableId)
      .eq("org_id", user.orgId)
      .order("day_of_week, start_time");

    return {
      data: {
        ...timetable.data,
        slots: slots.data,
      },
      error: timetable.error || slots.error,
    };
  },

  // Get timetables by batch with slots
  async getTimetablesByBatchComplete(user: AuthUser | null, batchId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data: timetables, error: ttError } = await supabase
      .from("timetables")
      .select("*")
      .eq("org_id", user.orgId)
      .eq("batch_id", batchId)
      .order("week_date", { ascending: false });

    if (ttError) return { data: null, error: ttError };

    const timetablesWithSlots = await Promise.all(
      (timetables || []).map(async (tt: any) => {
        const slots = await supabase
          .from("timetable_slots")
          .select("*")
          .eq("timetable_id", tt.id)
          .eq("org_id", user.orgId);

        return {
          ...tt,
          slots: slots.data,
        };
      })
    );

    return { data: timetablesWithSlots, error: null };
  },
};
