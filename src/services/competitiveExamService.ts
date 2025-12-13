import { supabase } from "@/lib/supabase";
import { AuthUser } from "./auth.service";

export interface CompetitiveExam {
  id: string;
  org_id: string;
  exam_name: string;
  max_marks?: number;
  exam_date?: string;
  created_at: string;
}

export const competitiveExamService = {
  // Get all competitive exams
  async getCompetitiveExams(user: AuthUser | null) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("competitive_exams")
      .select("*")
      .eq("org_id", user.orgId)
      .order("exam_date", { ascending: false });

    return { data, error };
  },

  // Get single exam
  async getCompetitiveExamById(user: AuthUser | null, examId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("competitive_exams")
      .select("*")
      .eq("id", examId)
      .eq("org_id", user.orgId)
      .single();

    return { data, error };
  },

  // Create new competitive exam
  async createCompetitiveExam(
    user: AuthUser | null,
    exam: Omit<CompetitiveExam, "id" | "org_id" | "created_at">
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("competitive_exams")
      .insert([
        {
          ...exam,
          org_id: user.orgId,
        },
      ])
      .select()
      .single();

    return { data, error };
  },

  // Update competitive exam
  async updateCompetitiveExam(
    user: AuthUser | null,
    examId: string,
    updates: Partial<CompetitiveExam>
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("competitive_exams")
      .update(updates)
      .eq("id", examId)
      .eq("org_id", user.orgId)
      .select()
      .single();

    return { data, error };
  },

  // Delete competitive exam
  async deleteCompetitiveExam(user: AuthUser | null, examId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { error } = await supabase
      .from("competitive_exams")
      .delete()
      .eq("id", examId)
      .eq("org_id", user.orgId);

    return { data: null, error };
  },
};
