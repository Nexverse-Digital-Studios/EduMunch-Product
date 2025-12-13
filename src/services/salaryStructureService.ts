import { supabase } from "@/lib/supabase";
import { AuthUser } from "./auth.service";

export interface SalaryStructure {
  id: string;
  org_id: string;
  title: string;
  base_salary: number;
  description?: string;
  created_at: string;
}

export interface SalaryEarning {
  id: string;
  org_id: string;
  salary_structure_id: string;
  earning_name: string;
  amount: number;
}

export interface SalaryDeduction {
  id: string;
  org_id: string;
  salary_structure_id: string;
  deduction_name: string;
  amount: number;
}

export const salaryStructureService = {
  // Get all salary structures
  async getSalaryStructures(user: AuthUser | null) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("salary_structures")
      .select("*")
      .eq("org_id", user.orgId)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  // Get salary structure with components
  async getSalaryStructureDetails(user: AuthUser | null, structureId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const structure = await supabase
      .from("salary_structures")
      .select("*")
      .eq("id", structureId)
      .eq("org_id", user.orgId)
      .single();

    const earnings = await supabase
      .from("salary_earnings")
      .select("*")
      .eq("salary_structure_id", structureId)
      .eq("org_id", user.orgId);

    const deductions = await supabase
      .from("salary_deductions")
      .select("*")
      .eq("salary_structure_id", structureId)
      .eq("org_id", user.orgId);

    return {
      data: {
        ...structure.data,
        earnings: earnings.data,
        deductions: deductions.data,
      },
      error: structure.error || earnings.error || deductions.error,
    };
  },

  // Create new salary structure
  async createSalaryStructure(
    user: AuthUser | null,
    structure: Omit<SalaryStructure, "id" | "org_id" | "created_at">
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("salary_structures")
      .insert([
        {
          ...structure,
          org_id: user.orgId,
        },
      ])
      .select()
      .single();

    return { data, error };
  },

  // Update salary structure
  async updateSalaryStructure(
    user: AuthUser | null,
    structureId: string,
    updates: Partial<SalaryStructure>
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("salary_structures")
      .update(updates)
      .eq("id", structureId)
      .eq("org_id", user.orgId)
      .select()
      .single();

    return { data, error };
  },

  // Delete salary structure
  async deleteSalaryStructure(user: AuthUser | null, structureId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    // Delete related earnings and deductions
    await supabase
      .from("salary_earnings")
      .delete()
      .eq("salary_structure_id", structureId)
      .eq("org_id", user.orgId);

    await supabase
      .from("salary_deductions")
      .delete()
      .eq("salary_structure_id", structureId)
      .eq("org_id", user.orgId);

    const { error } = await supabase
      .from("salary_structures")
      .delete()
      .eq("id", structureId)
      .eq("org_id", user.orgId);

    return { data: null, error };
  },

  // Add earning component
  async addEarning(
    user: AuthUser | null,
    earning: Omit<SalaryEarning, "id" | "org_id">
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("salary_earnings")
      .insert([
        {
          ...earning,
          org_id: user.orgId,
        },
      ])
      .select()
      .single();

    return { data, error };
  },

  // Update earning
  async updateEarning(
    user: AuthUser | null,
    earningId: string,
    updates: Partial<SalaryEarning>
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("salary_earnings")
      .update(updates)
      .eq("id", earningId)
      .eq("org_id", user.orgId)
      .select()
      .single();

    return { data, error };
  },

  // Delete earning
  async deleteEarning(user: AuthUser | null, earningId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { error } = await supabase
      .from("salary_earnings")
      .delete()
      .eq("id", earningId)
      .eq("org_id", user.orgId);

    return { data: null, error };
  },

  // Add deduction component
  async addDeduction(
    user: AuthUser | null,
    deduction: Omit<SalaryDeduction, "id" | "org_id">
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("salary_deductions")
      .insert([
        {
          ...deduction,
          org_id: user.orgId,
        },
      ])
      .select()
      .single();

    return { data, error };
  },

  // Update deduction
  async updateDeduction(
    user: AuthUser | null,
    deductionId: string,
    updates: Partial<SalaryDeduction>
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("salary_deductions")
      .update(updates)
      .eq("id", deductionId)
      .eq("org_id", user.orgId)
      .select()
      .single();

    return { data, error };
  },

  // Delete deduction
  async deleteDeduction(user: AuthUser | null, deductionId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { error } = await supabase
      .from("salary_deductions")
      .delete()
      .eq("id", deductionId)
      .eq("org_id", user.orgId);

    return { data: null, error };
  },

  // Calculate total earnings
  async calculateTotalEarnings(
    user: AuthUser | null,
    structureId: string
  ) {
    if (!user?.orgId) return { data: 0, error: null };

    const { data, error } = await supabase
      .from("salary_earnings")
      .select("amount")
      .eq("salary_structure_id", structureId)
      .eq("org_id", user.orgId);

    if (error) return { data: 0, error };

    const total = data?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
    return { data: total, error: null };
  },

  // Calculate total deductions
  async calculateTotalDeductions(
    user: AuthUser | null,
    structureId: string
  ) {
    if (!user?.orgId) return { data: 0, error: null };

    const { data, error } = await supabase
      .from("salary_deductions")
      .select("amount")
      .eq("salary_structure_id", structureId)
      .eq("org_id", user.orgId);

    if (error) return { data: 0, error };

    const total = data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
    return { data: total, error: null };
  },
};
