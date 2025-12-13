import { supabase } from "@/lib/supabase";
import { AuthUser } from "./auth.service";

export interface SupportTicket {
  id: string;
  org_id: string;
  title: string;
  description: string;
  ticket_type?: string;
  status: string;
  created_by?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export const supportTicketService = {
  // Get all support tickets
  async getSupportTickets(
    user: AuthUser | null,
    filters?: { status?: string }
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    let query = supabase
      .from("support_tickets")
      .select("*")
      .eq("org_id", user.orgId);

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    return { data, error };
  },

  // Get tickets by status
  async getTicketsByStatus(user: AuthUser | null, status: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("org_id", user.orgId)
      .eq("status", status)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  // Create new ticket
  async createTicket(
    user: AuthUser | null,
    ticket: Omit<SupportTicket, "id" | "org_id" | "created_at" | "updated_at">
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("support_tickets")
      .insert([
        {
          ...ticket,
          org_id: user.orgId,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    return { data, error };
  },

  // Update ticket
  async updateTicket(
    user: AuthUser | null,
    ticketId: string,
    updates: Partial<SupportTicket>
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("support_tickets")
      .update(updates)
      .eq("id", ticketId)
      .eq("org_id", user.orgId)
      .select()
      .single();

    return { data, error };
  },

  // Assign ticket
  async assignTicket(
    user: AuthUser | null,
    ticketId: string,
    assignedToId: string
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("support_tickets")
      .update({
        assigned_to: assignedToId,
        status: "IN_PROGRESS",
      })
      .eq("id", ticketId)
      .eq("org_id", user.orgId)
      .select()
      .single();

    return { data, error };
  },

  // Change ticket status
  async updateTicketStatus(
    user: AuthUser | null,
    ticketId: string,
    status: string
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("support_tickets")
      .update({ status })
      .eq("id", ticketId)
      .eq("org_id", user.orgId)
      .select()
      .single();

    return { data, error };
  },

  // Get ticket statistics
  async getTicketStats(user: AuthUser | null) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("support_tickets")
      .select("status")
      .eq("org_id", user.orgId);

    if (error) return { data: null, error };

    const stats = {
      open: 0,
      in_progress: 0,
      resolved: 0,
      total: data?.length || 0,
    };

    data?.forEach((ticket: any) => {
      if (ticket.status === "OPEN") stats.open++;
      else if (ticket.status === "IN_PROGRESS") stats.in_progress++;
      else if (ticket.status === "RESOLVED") stats.resolved++;
    });

    return { data: stats, error: null };
  },

  // Search tickets
  async searchTickets(user: AuthUser | null, searchTerm: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("org_id", user.orgId)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order("created_at", { ascending: false });

    return { data, error };
  },
};
