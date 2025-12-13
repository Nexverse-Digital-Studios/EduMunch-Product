import { supabase } from '@/lib/supabase';

export interface FeedbackTemplate {
  id: string;
  org_id: string;
  title: string;
  description?: string;
  form_type: string;
  template_code: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface FeedbackQuality {
  id: string;
  org_id: string;
  template_id: string;
  quality_name: string;
  description?: string;
  display_order?: number;
  created_at?: string;
}

export interface FeedbackAssignment {
  id: string;
  org_id: string;
  batch_id: string;
  template_id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  submission_count?: number;
  created_at?: string;
  template?: FeedbackTemplate;
  batch?: any;
}

export interface FeedbackResponse {
  id: string;
  org_id: string;
  assignment_id: string;
  template_id: string;
  respondent_id?: string;
  subject_id?: string;
  quality_ratings: any;
  comments?: string;
  submitted_at?: string;
  created_at?: string;
}

class FeedbackService {
  // Template Methods
  async getTemplates(orgId: string) {
    const { data, error } = await supabase
      .from('feedback_templates')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as FeedbackTemplate[];
  }

  async getTemplateById(id: string) {
    const { data, error } = await supabase
      .from('feedback_templates')
      .select(`
        *,
        qualities:feedback_qualities(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as any;
  }

  async createTemplate(orgId: string, template: Partial<FeedbackTemplate>, qualities: string[]) {
    const { data: templateData, error: templateError } = await supabase
      .from('feedback_templates')
      .insert([
        {
          org_id: orgId,
          title: template.title,
          description: template.description,
          form_type: template.form_type,
          template_code: template.template_code,
          is_active: true,
        },
      ])
      .select()
      .single();
    if (templateError) throw templateError;

    // Add qualities
    if (qualities.length > 0) {
      const qualityRecords = qualities.map((quality, index) => ({
        org_id: orgId,
        template_id: templateData.id,
        quality_name: quality,
        display_order: index,
      }));

      const { error: qualityError } = await supabase
        .from('feedback_qualities')
        .insert(qualityRecords);
      if (qualityError) throw qualityError;
    }

    return templateData as FeedbackTemplate;
  }

  async updateTemplate(id: string, template: Partial<FeedbackTemplate>) {
    const { data, error } = await supabase
      .from('feedback_templates')
      .update(template)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as FeedbackTemplate;
  }

  async deleteTemplate(id: string) {
    const { error } = await supabase
      .from('feedback_templates')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw error;
  }

  // Assignment Methods
  async getAssignments(orgId: string, batchId?: string) {
    let query = supabase
      .from('feedback_assignments')
      .select(`
        *,
        template:template_id(id, title, template_code, form_type),
        batch:batch_id(id, name, code)
      `)
      .eq('org_id', orgId)
      .eq('is_active', true);

    if (batchId) {
      query = query.eq('batch_id', batchId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data as any[];
  }

  async assignTemplateToBatch(
    orgId: string,
    batchId: string,
    templateId: string,
    startDate: string,
    endDate: string
  ) {
    const { data, error } = await supabase
      .from('feedback_assignments')
      .insert([
        {
          org_id: orgId,
          batch_id: batchId,
          template_id: templateId,
          start_date: startDate,
          end_date: endDate,
          is_active: true,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data as FeedbackAssignment;
  }

  // Response Methods
  async submitResponse(orgId: string, response: Partial<FeedbackResponse>) {
    const { data, error } = await supabase
      .from('feedback_responses')
      .insert([
        {
          org_id: orgId,
          assignment_id: response.assignment_id,
          template_id: response.template_id,
          respondent_id: response.respondent_id,
          subject_id: response.subject_id,
          quality_ratings: response.quality_ratings,
          comments: response.comments,
        },
      ])
      .select()
      .single();
    if (error) throw error;

    // Update submission count
    await supabase
      .from('feedback_assignments')
      .update({ submission_count: supabase.rpc('increment', { count: 1 }) })
      .eq('id', response.assignment_id!);

    return data as FeedbackResponse;
  }

  async getResponses(assignmentId: string) {
    const { data, error } = await supabase
      .from('feedback_responses')
      .select('*')
      .eq('assignment_id', assignmentId);
    if (error) throw error;
    return data as FeedbackResponse[];
  }

  async getResponseAnalysis(templateId: string) {
    const { data, error } = await supabase
      .from('feedback_responses')
      .select('*')
      .eq('template_id', templateId);
    if (error) throw error;

    // Calculate averages
    const analysis: any = {};
    data?.forEach((response: any) => {
      Object.entries(response.quality_ratings || {}).forEach(([qualityId, rating]: any) => {
        if (!analysis[qualityId]) {
          analysis[qualityId] = { total: 0, count: 0 };
        }
        analysis[qualityId].total += rating;
        analysis[qualityId].count += 1;
      });
    });

    // Calculate averages
    Object.keys(analysis).forEach((key) => {
      analysis[key].average = analysis[key].total / analysis[key].count;
    });

    return analysis;
  }
}

export const feedbackService = new FeedbackService();
