import { supabase } from '@/lib/supabase';

export interface Employee {
  id: string;
  org_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  designation?: string;
  department?: string;
  employee_code: string;
  date_of_joining?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  qualification?: string;
  experience_years?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

class EmployeesService {
  async getEmployees(orgId: string, filters?: { department?: string; designation?: string }) {
    let query = supabase
      .from('employees')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (filters?.department) {
      query = query.eq('department', filters.department);
    }
    if (filters?.designation) {
      query = query.eq('designation', filters.designation);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Employee[];
  }

  async getEmployeeById(id: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Employee;
  }

  async createEmployee(orgId: string, employee: Partial<Employee>) {
    const { data, error } = await supabase
      .from('employees')
      .insert([
        {
          org_id: orgId,
          first_name: employee.first_name,
          last_name: employee.last_name,
          email: employee.email,
          phone: employee.phone,
          designation: employee.designation,
          department: employee.department,
          employee_code: employee.employee_code,
          date_of_joining: employee.date_of_joining,
          date_of_birth: employee.date_of_birth,
          gender: employee.gender,
          address: employee.address,
          city: employee.city,
          state: employee.state,
          postal_code: employee.postal_code,
          qualification: employee.qualification,
          experience_years: employee.experience_years,
          is_active: true,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data as Employee;
  }

  async updateEmployee(id: string, employee: Partial<Employee>) {
    const { data, error } = await supabase
      .from('employees')
      .update(employee)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Employee;
  }

  async deleteEmployee(id: string) {
    const { error } = await supabase
      .from('employees')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw error;
  }

  async searchEmployees(orgId: string, query: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,employee_code.ilike.%${query}%`
      )
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Employee[];
  }

  async getEmployeesByDepartment(orgId: string, department: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('org_id', orgId)
      .eq('department', department)
      .eq('is_active', true);
    if (error) throw error;
    return data as Employee[];
  }

  async getEmployeesCount(orgId: string) {
    const { count, error } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('is_active', true);
    if (error) throw error;
    return count || 0;
  }
}

export const employeesService = new EmployeesService();
