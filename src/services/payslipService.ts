import { supabase } from '@/lib/supabase';
import { AuthUser } from './auth.service';

export interface Payslip {
  id: string;
  org_id: string;
  employee_id: string;
  payroll_month: string;
  payroll_year: number;
  basic_salary?: number;
  allowances: number;
  deductions: number;
  gross_salary?: number;
  net_salary: number;
  payment_date?: string;
  status: 'DRAFT' | 'GENERATED' | 'FINALIZED';
  created_at: string;
  updated_at: string;
  employee_name?: string;
  employee_code?: string;
}

export const payslipService = {
  async getPayslips(user: AuthUser, filters?: {
    employee_id?: string;
    payroll_month?: string;
    status?: string;
  }): Promise<Payslip[]> {
    let query = supabase
      .from('payslips')
      .select('*')
      .eq('org_id', user.orgId);

    if (filters?.employee_id) query = query.eq('employee_id', filters.employee_id);
    if (filters?.payroll_month) query = query.eq('payroll_month', filters.payroll_month);
    if (filters?.status) query = query.eq('status', filters.status);

    const { data, error } = await query.order('payroll_month', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPayslipById(user: AuthUser, id: string): Promise<Payslip | null> {
    const { data, error } = await supabase
      .from('payslips')
      .select('*')
      .eq('id', id)
      .eq('org_id', user.orgId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async generatePayslips(
    user: AuthUser,
    month: string,
    year: number,
    employeeIds: string[],
    basicSalaries: Record<string, number>,
    allowances?: Record<string, number>,
    deductions?: Record<string, number>
  ): Promise<Payslip[]> {
    const payslipMonth = `${year}-${month.padStart(2, '0')}`;
    const payslips: Payslip[] = [];

    for (const employeeId of employeeIds) {
      const basic = basicSalaries[employeeId] || 0;
      const allowance = (allowances?.[employeeId] || 0);
      const deduction = (deductions?.[employeeId] || 0);
      const gross = basic + allowance;
      const net = gross - deduction;

      const { data, error } = await supabase
        .from('payslips')
        .insert({
          org_id: user.orgId,
          employee_id: employeeId,
          payroll_month: payslipMonth,
          payroll_year: year,
          basic_salary: basic,
          allowances: allowance,
          deductions: deduction,
          gross_salary: gross,
          net_salary: net,
          status: 'GENERATED',
        })
        .select()
        .single();

      if (error) throw error;
      if (data) payslips.push(data);
    }

    return payslips;
  },

  async updatePayslip(
    user: AuthUser,
    id: string,
    updates: Partial<Payslip>
  ): Promise<Payslip> {
    const { data, error } = await supabase
      .from('payslips')
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

  async finalizePayslip(
    user: AuthUser,
    id: string,
    paymentDate: string
  ): Promise<Payslip> {
    const { data, error } = await supabase
      .from('payslips')
      .update({
        status: 'FINALIZED',
        payment_date: paymentDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('org_id', user.orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePayslip(user: AuthUser, id: string): Promise<void> {
    const { error } = await supabase
      .from('payslips')
      .delete()
      .eq('id', id)
      .eq('org_id', user.orgId);

    if (error) throw error;
  },

  async getPayslipsByMonth(user: AuthUser, month: string): Promise<Payslip[]> {
    const { data, error } = await supabase
      .from('payslips')
      .select('*')
      .eq('org_id', user.orgId)
      .eq('payroll_month', month)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getEmployeePayslips(user: AuthUser, employeeId: string): Promise<Payslip[]> {
    const { data, error } = await supabase
      .from('payslips')
      .select('*')
      .eq('org_id', user.orgId)
      .eq('employee_id', employeeId)
      .order('payroll_month', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async searchPayslips(user: AuthUser, searchTerm: string): Promise<Payslip[]> {
    const { data, error } = await supabase
      .from('payslips')
      .select('*')
      .eq('org_id', user.orgId)
      .or(`employee_name.ilike.%${searchTerm}%,employee_code.ilike.%${searchTerm}%`)
      .order('payroll_month', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPayslipStats(user: AuthUser, month: string): Promise<{
    total: number;
    generated: number;
    finalized: number;
    totalNetSalary: number;
  }> {
    const { data, error } = await supabase
      .from('payslips')
      .select('status, net_salary')
      .eq('org_id', user.orgId)
      .eq('payroll_month', month);

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      generated: data?.filter((p: any) => p.status === 'GENERATED').length || 0,
      finalized: data?.filter((p: any) => p.status === 'FINALIZED').length || 0,
      totalNetSalary: data?.reduce((sum: number, p: any) => sum + (p.net_salary || 0), 0) || 0,
    };

    return stats;
  },
};
