import { supabase } from "@/lib/supabase";
import { AuthUser } from "./auth.service";

export interface BoardExam {
  id: string;
  org_id: string;
  exam_name: string;
  exam_type?: string;
  max_marks?: number;
  subject_id?: string;
  batch_id?: string;
  exam_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ExamResult {
  id: string;
  exam_id: string;
  student_id: string;
  marks_obtained: number;
  percentage: number;
  grade?: string;
}

export const boardExamService = {
  // Get all board exams for organization
  async getBoardExams(user: AuthUser | null, filters?: { batchId?: string }) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    let query = supabase
      .from("board_exams")
      .select("*")
      .eq("org_id", user.orgId);

    if (filters?.batchId) {
      query = query.eq("batch_id", filters.batchId);
    }

    const { data, error } = await query.order("exam_date", { ascending: false });
    return { data, error };
  },

  // Get single exam with details
  async getBoardExamById(user: AuthUser | null, examId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("board_exams")
      .select("*")
      .eq("id", examId)
      .eq("org_id", user.orgId)
      .single();

    return { data, error };
  },

  // Create new board exam
  async createBoardExam(
    user: AuthUser | null,
    exam: Omit<BoardExam, "id" | "org_id" | "created_at" | "updated_at">
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("board_exams")
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

  // Update board exam
  async updateBoardExam(
    user: AuthUser | null,
    examId: string,
    updates: Partial<BoardExam>
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("board_exams")
      .update(updates)
      .eq("id", examId)
      .eq("org_id", user.orgId)
      .select()
      .single();

    return { data, error };
  },

  // Delete board exam
  async deleteBoardExam(user: AuthUser | null, examId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("board_exams")
      .delete()
      .eq("id", examId)
      .eq("org_id", user.orgId);

    return { data, error };
  },

  // Get exam results for an exam
  async getExamResults(user: AuthUser | null, examId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("exam_results")
      .select("*")
      .eq("exam_id", examId)
      .eq("org_id", user.orgId);

    return { data, error };
  },

  // Add result for student
  async addExamResult(
    user: AuthUser | null,
    result: Omit<ExamResult, "id">
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    // Calculate percentage and grade
    let percentage = 0;
    let grade = "F";

    const examData = await supabase
      .from("board_exams")
      .select("max_marks")
      .eq("id", result.exam_id)
      .single();

    if (examData.data?.max_marks) {
      percentage = (result.marks_obtained / examData.data.max_marks) * 100;
      grade = percentage >= 90 ? "A" : percentage >= 80 ? "B" : percentage >= 70 ? "C" : "F";
    }

    const { data, error } = await supabase
      .from("exam_results")
      .insert([
        {
          ...result,
          org_id: user.orgId,
          percentage,
          grade,
        },
      ])
      .select()
      .single();

    return { data, error };
  },

  // Update exam result
  async updateExamResult(
    user: AuthUser | null,
    resultId: string,
    updates: Partial<ExamResult>
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("exam_results")
      .update(updates)
      .eq("id", resultId)
      .eq("org_id", user.orgId)
      .select()
      .single();

    return { data, error };
  },

  // Bulk import results
  async bulkImportResults(
    user: AuthUser | null,
    results: ExamResult[]
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const resultsWithOrg = results.map((r) => ({
      ...r,
      org_id: user.orgId,
    }));

    const { data, error } = await supabase
      .from("exam_results")
      .insert(resultsWithOrg)
      .select();

    return { data, error };
  },

  // Get exam statistics
  async getExamStats(user: AuthUser | null, examId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("exam_results")
      .select("marks_obtained, percentage")
      .eq("exam_id", examId)
      .eq("org_id", user.orgId);

    if (error) return { data: null, error };

    if (!data || data.length === 0) {
      return {
        data: {
          total_students: 0,
          average_marks: 0,
          highest_marks: 0,
          lowest_marks: 0,
          pass_percentage: 0,
        },
        error: null,
      };
    }

    const marks = data.map((r: any) => r.marks_obtained);
    const percentages = data.map((r: any) => r.percentage);
    const passCount = percentages.filter((p: number) => p >= 40).length;

    return {
      data: {
        total_students: data.length,
        average_marks: marks.reduce((a: number, b: number) => a + b, 0) / data.length,
        highest_marks: Math.max(...marks),
        lowest_marks: Math.min(...marks),
        pass_percentage: (passCount / data.length) * 100,
      },
      error: null,
    };
  },
};
