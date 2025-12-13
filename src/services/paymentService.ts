import { supabase } from '@/lib/supabase';
import { AuthUser } from './auth.service';

export interface Payment {
  id: string;
  org_id: string;
  admission_id?: string;
  enrollment_id?: string;
  student_id?: string;
  student_name?: string;
  student_form_number?: string;
  course_name?: string;
  branch_id?: string;
  batch_id?: string;
  amount: number;
  payment_method?: string;
  status: 'PENDING' | 'REALIZED' | 'CANCELLED' | 'BOUNCED';
  payment_date?: string;
  realized_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentInstallment {
  id: string;
  org_id: string;
  admission_id: string;
  installment_number: number;
  due_date: string;
  amount: number;
  paid_amount: number;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'FULLY_PAID';
  created_at: string;
}

export const paymentService = {
  async getPayments(user: AuthUser, filters?: {
    status?: string;
    admission_id?: string;
    student_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<Payment[]> {
    let query = supabase
      .from('payments')
      .select('*')
      .eq('org_id', user.orgId);

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.admission_id) query = query.eq('admission_id', filters.admission_id);
    if (filters?.student_id) query = query.eq('student_id', filters.student_id);

    if (filters?.start_date) {
      query = query.gte('payment_date', filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte('payment_date', filters.end_date);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPaymentById(user: AuthUser, id: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .eq('org_id', user.orgId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async recordPayment(
    user: AuthUser,
    data: Omit<Payment, 'id' | 'org_id' | 'created_at' | 'updated_at'>
  ): Promise<Payment> {
    const { data: result, error } = await supabase
      .from('payments')
      .insert({
        ...data,
        org_id: user.orgId,
        status: 'REALIZED',
        realized_by: user.id,
        payment_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  async updatePayment(
    user: AuthUser,
    id: string,
    updates: Partial<Payment>
  ): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('org_id', user.orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePayment(user: AuthUser, id: string): Promise<void> {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id)
      .eq('org_id', user.orgId);

    if (error) throw error;
  },

  // Installment operations
  async getInstallments(user: AuthUser, admissionId: string): Promise<PaymentInstallment[]> {
    const { data, error } = await supabase
      .from('payment_installments')
      .select('*')
      .eq('org_id', user.orgId)
      .eq('admission_id', admissionId)
      .order('installment_number');

    if (error) throw error;
    return data || [];
  },

  async createInstallment(
    user: AuthUser,
    admissionId: string,
    installmentNumber: number,
    dueDate: string,
    amount: number
  ): Promise<PaymentInstallment> {
    const { data, error } = await supabase
      .from('payment_installments')
      .insert({
        org_id: user.orgId,
        admission_id: admissionId,
        installment_number: installmentNumber,
        due_date: dueDate,
        amount,
        paid_amount: 0,
        status: 'PENDING',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateInstallmentPaidAmount(
    user: AuthUser,
    installmentId: string,
    paidAmount: number
  ): Promise<PaymentInstallment> {
    let status = 'PENDING';
    if (paidAmount > 0) status = 'PARTIALLY_PAID';
    
    // Get the installment to check full amount
    const { data: installment, error: fetchError } = await supabase
      .from('payment_installments')
      .select('amount')
      .eq('id', installmentId)
      .single();

    if (fetchError) throw fetchError;
    if (installment && paidAmount >= installment.amount) {
      status = 'FULLY_PAID';
    }

    const { data, error } = await supabase
      .from('payment_installments')
      .update({
        paid_amount: paidAmount,
        status,
      })
      .eq('id', installmentId)
      .eq('org_id', user.orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getOutstandingPayments(user: AuthUser): Promise<any[]> {
    const { data, error } = await supabase
      .from('payment_installments')
      .select('*')
      .eq('org_id', user.orgId)
      .neq('status', 'FULLY_PAID')
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async calculateStudentBalance(user: AuthUser, admissionId: string): Promise<{
    totalDue: number;
    totalPaid: number;
    balance: number;
  }> {
    const { data, error } = await supabase
      .from('payment_installments')
      .select('amount, paid_amount')
      .eq('org_id', user.orgId)
      .eq('admission_id', admissionId);

    if (error) throw error;

    const totalDue = (data || []).reduce((sum: number, inst: any) => sum + (inst.amount || 0), 0);
    const totalPaid = (data || []).reduce((sum: number, inst: any) => sum + (inst.paid_amount || 0), 0);
    const balance = totalDue - totalPaid;

    return { totalDue, totalPaid, balance };
  },

  async getPaymentsByAdmission(user: AuthUser, admissionId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('org_id', user.orgId)
      .eq('admission_id', admissionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async filterPayments(user: AuthUser, filters: {
    payment_method?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<Payment[]> {
    let query = supabase
      .from('payments')
      .select('*')
      .eq('org_id', user.orgId);

    if (filters.payment_method) query = query.eq('payment_method', filters.payment_method);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.start_date) query = query.gte('payment_date', filters.start_date);
    if (filters.end_date) query = query.lte('payment_date', filters.end_date);

    const { data, error } = await query.order('payment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
