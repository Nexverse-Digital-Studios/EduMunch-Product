import { supabase } from '@/lib/supabase';

export interface Enrollment {
  id: string;
  org_id: string;
  batch_id: string;
  student_id: string;
  enrollment_date: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'DROPPED';
  enrollment_number: string;
  rollno?: number;
  admission_id?: string;
  transfer_from_batch?: string;
  transfer_date?: string;
  drop_date?: string;
  created_at?: string;
  updated_at?: string;
  batch?: any;
  student?: any;
}

class EnrollmentsService {
  async getEnrollmentsByBatch(batchId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        student:student_id(id, email, first_name, last_name),
        batch:batch_id(id, name, code)
      `)
      .eq('batch_id', batchId)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Enrollment[];
  }

  async getEnrollmentById(id: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        student:student_id(id, email, first_name, last_name),
        batch:batch_id(id, name, code)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Enrollment;
  }

  async getEnrollmentsByStudent(studentId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        batch:batch_id(id, name, code)
      `)
      .eq('student_id', studentId)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Enrollment[];
  }

  async createEnrollment(orgId: string, enrollment: Partial<Enrollment>) {
    const { data, error } = await supabase
      .from('enrollments')
      .insert([
        {
          org_id: orgId,
          batch_id: enrollment.batch_id,
          student_id: enrollment.student_id,
          enrollment_date: enrollment.enrollment_date || new Date().toISOString().split('T')[0],
          status: 'ACTIVE',
          enrollment_number: enrollment.enrollment_number,
          rollno: enrollment.rollno,
          admission_id: enrollment.admission_id,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data as Enrollment;
  }

  async updateEnrollment(id: string, enrollment: Partial<Enrollment>) {
    const { data, error } = await supabase
      .from('enrollments')
      .update(enrollment)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Enrollment;
  }

  async transferStudent(enrollmentId: string, toBatchId: string) {
    const enrollment = await this.getEnrollmentById(enrollmentId);
    const { error } = await supabase
      .from('enrollments')
      .update({
        status: 'TRANSFERRED',
        transfer_from_batch: enrollment.batch_id,
        transfer_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', enrollmentId)
      .select()
      .single();
    if (error) throw error;

    // Create new enrollment in target batch
    const { data: newEnrollment, error: newError } = await supabase
      .from('enrollments')
      .insert([
        {
          org_id: enrollment.org_id,
          batch_id: toBatchId,
          student_id: enrollment.student_id,
          enrollment_date: new Date().toISOString().split('T')[0],
          status: 'ACTIVE',
          enrollment_number: `${enrollment.enrollment_number}-T1`,
          admission_id: enrollment.admission_id,
          transfer_from_batch: enrollment.batch_id,
          transfer_date: new Date().toISOString().split('T')[0],
        },
      ])
      .select()
      .single();
    if (newError) throw newError;
    return newEnrollment as Enrollment;
  }

  async dropStudent(enrollmentId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .update({
        status: 'DROPPED',
        drop_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', enrollmentId)
      .select()
      .single();
    if (error) throw error;
    return data as Enrollment;
  }

  async getEnrollmentCount(batchId: string) {
    const { count, error } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('batch_id', batchId)
      .eq('status', 'ACTIVE');
    if (error) throw error;
    return count || 0;
  }

  async searchEnrollments(orgId: string, query: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        student:student_id(id, email, first_name, last_name),
        batch:batch_id(id, name, code)
      `)
      .eq('org_id', orgId)
      .or(
        `enrollment_number.ilike.%${query}%,student->first_name.ilike.%${query}%,student->last_name.ilike.%${query}%`
      );
    if (error) throw error;
    return data as Enrollment[];
  }
}

export const enrollmentsService = new EnrollmentsService();
