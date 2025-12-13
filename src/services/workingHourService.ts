import { supabase } from "@/lib/supabase";
import { AuthUser } from "./auth.service";

export interface WorkingHours {
  id: string;
  org_id: string;
  employee_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_week_off: boolean;
}

export const workingHourService = {
  // Get working hours for employee
  async getWorkingHours(user: AuthUser | null, employeeId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("working_hours")
      .select("*")
      .eq("org_id", user.orgId)
      .eq("employee_id", employeeId)
      .order("day_of_week");

    return { data, error };
  },

  // Get all working hours for organization
  async getAllWorkingHours(user: AuthUser | null) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("working_hours")
      .select("*")
      .eq("org_id", user.orgId)
      .order("employee_id, day_of_week");

    return { data, error };
  },

  // Add working hour entry
  async addWorkingHour(
    user: AuthUser | null,
    hours: Omit<WorkingHours, "id" | "org_id">
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("working_hours")
      .insert([
        {
          ...hours,
          org_id: user.orgId,
        },
      ])
      .select()
      .single();

    return { data, error };
  },

  // Update working hour
  async updateWorkingHour(
    user: AuthUser | null,
    hoursId: string,
    updates: Partial<WorkingHours>
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("working_hours")
      .update(updates)
      .eq("id", hoursId)
      .eq("org_id", user.orgId)
      .select()
      .single();

    return { data, error };
  },

  // Delete working hour
  async deleteWorkingHour(user: AuthUser | null, hoursId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { error } = await supabase
      .from("working_hours")
      .delete()
      .eq("id", hoursId)
      .eq("org_id", user.orgId);

    return { data: null, error };
  },

  // Set week off for employee
  async setWeekOff(
    user: AuthUser | null,
    employeeId: string,
    dayOfWeek: string
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("working_hours")
      .update({ is_week_off: true })
      .eq("org_id", user.orgId)
      .eq("employee_id", employeeId)
      .eq("day_of_week", dayOfWeek)
      .select()
      .single();

    return { data, error };
  },

  // Clear week off
  async clearWeekOff(
    user: AuthUser | null,
    employeeId: string,
    dayOfWeek: string
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("working_hours")
      .update({ is_week_off: false })
      .eq("org_id", user.orgId)
      .eq("employee_id", employeeId)
      .eq("day_of_week", dayOfWeek)
      .select()
      .single();

    return { data, error };
  },

  // Bulk set working hours
  async bulkSetWorkingHours(
    user: AuthUser | null,
    employeeId: string,
    hoursData: Array<Omit<WorkingHours, "id" | "org_id">>
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    // Delete existing entries
    await supabase
      .from("working_hours")
      .delete()
      .eq("org_id", user.orgId)
      .eq("employee_id", employeeId);

    // Insert new entries
    const { data, error } = await supabase
      .from("working_hours")
      .insert(
        hoursData.map((h) => ({
          ...h,
          org_id: user.orgId,
        }))
      )
      .select();

    return { data, error };
  },
};
