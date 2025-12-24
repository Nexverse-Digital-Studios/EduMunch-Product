/**
 * Supabase Query Hooks
 * =====================
 * TanStack Query hooks for Supabase data fetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, TABLES, getTable } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// ============================================================================
// Tables that support soft deletes (have deleted_at column)
// ============================================================================
const TABLES_WITH_SOFT_DELETE = [
  'classes_1emaet',
  'employees_1emaet',
  'students_1emaet',
  'sections_1emaet',
  'teachers_1emaet',
  'admission_applications_1emaet',
];

// ============================================================================
// Generic CRUD Hooks
// ============================================================================

interface QueryOptions {
  enabled?: boolean;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
}

/**
 * Generic hook to fetch all records from a table
 */
export function useTableQuery<T>(
  tableName: string,
  queryKey: string[],
  options: QueryOptions = {}
) {
  const { enabled = true, select = '*', filters = {}, orderBy, limit } = options;

  console.log('[useTableQuery] Hook initialized:', {
    tableName,
    enabled,
    select,
    filters,
    queryKey,
  });

  return useQuery({
    queryKey,
    queryFn: async () => {
      console.log('[useTableQuery] Executing query:', {
        tableName,
        filters,
        select,
      });

      if (!supabase) throw new Error('Supabase not configured');

      let query = supabase.from(tableName).select(select);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        console.log('[useTableQuery] Applying filter:', { key, value, valueType: typeof value });
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      // Apply soft delete filter only to tables that support it
      if (TABLES_WITH_SOFT_DELETE.includes(tableName)) {
        query = query.is('deleted_at', null);
      }

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[useTableQuery] Query error:', { tableName, error });
        throw error;
      }

      console.log('[useTableQuery] Query succeeded:', { tableName, count: data?.length || 0 });
      return data as T[];
    },
    enabled: enabled && !!supabase,
  });
}

/**
 * Generic hook to fetch a single record by ID
 */
export function useTableRecord<T>(
  tableName: string,
  id: string | undefined,
  queryKey: string[],
  select: string = '*'
) {
  return useQuery({
    queryKey: [...queryKey, id],
    queryFn: async () => {
      if (!supabase || !id) throw new Error('Missing params');

      const { data, error } = await supabase
        .from(tableName)
        .select(select)
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      return data as T;
    },
    enabled: !!supabase && !!id,
  });
}

/**
 * Generic mutation hook for creating records
 */
export function useCreateMutation<T>(
  tableName: string,
  queryKey: string[],
  options?: { successMessage?: string }
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<T>) => {
      if (!supabase) throw new Error('Supabase not configured');

      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result as T;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: 'Success',
        description: options?.successMessage || 'Record created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Generic mutation hook for updating records
 */
export function useUpdateMutation<T>(
  tableName: string,
  queryKey: string[],
  options?: { successMessage?: string }
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
      if (!supabase) throw new Error('Supabase not configured');

      const { data: result, error } = await supabase
        .from(tableName)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as T;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: 'Success',
        description: options?.successMessage || 'Record updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Generic mutation hook for soft deleting records
 */
export function useDeleteMutation(
  tableName: string,
  queryKey: string[],
  options?: { successMessage?: string }
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Supabase not configured');

      // Soft delete - set deleted_at timestamp
      const { error } = await supabase
        .from(tableName)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: 'Success',
        description: options?.successMessage || 'Record deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ============================================================================
// Combined Table Hook - All CRUD operations in one
// ============================================================================

/**
 * Combined hook that provides all CRUD operations for a table
 * Usage: const { data, isLoading, createMutation, updateMutation, deleteMutation, refetch } = useSupabaseTable(tableName, options)
 */
export function useSupabaseTable<T>(
  tableName: string,
  options: QueryOptions = {}
) {
  const queryKey = [tableName];
  
  // Query
  const query = useTableQuery<T>(tableName, queryKey, options);
  
  // Mutations
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createMutation = useMutation({
    mutationFn: async (data: Partial<T>) => {
      if (!supabase) throw new Error('Supabase not configured');
      
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single();
        
      if (error) throw error;
      return result as T;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<T> }) => {
      if (!supabase) throw new Error('Supabase not configured');
      
      const { data: result, error } = await supabase
        .from(tableName)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return result as T;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Supabase not configured');
      
      // Soft delete
      const { error } = await supabase
        .from(tableName)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}

// ============================================================================
// Specific Entity Hooks
// ============================================================================

// --- Users ---
export interface User {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  primary_role_id?: string;
  index_token: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export const useUsers = (options?: QueryOptions) => 
  useTableQuery<User>(TABLES.USERS, ['users'], {
    ...options,
    orderBy: { column: 'full_name', ascending: true },
  });

export const useUser = (id: string | undefined) =>
  useTableRecord<User>(TABLES.USERS, id, ['users']);

export const useCreateUser = () =>
  useCreateMutation<User>(TABLES.USERS, ['users'], { successMessage: 'User created successfully' });

export const useUpdateUser = () =>
  useUpdateMutation<User>(TABLES.USERS, ['users'], { successMessage: 'User updated successfully' });

export const useDeleteUser = () =>
  useDeleteMutation(TABLES.USERS, ['users'], { successMessage: 'User deleted successfully' });

// --- Roles ---
export interface Role {
  id: string;
  role_code: string;
  role_name: string;
  description?: string;
  is_system_role: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useRoles = (options?: QueryOptions) =>
  useTableQuery<Role>(TABLES.ROLES, ['roles'], {
    ...options,
    orderBy: { column: 'role_name', ascending: true },
  });

export const useRole = (id: string | undefined) =>
  useTableRecord<Role>(TABLES.ROLES, id, ['roles']);

export const useCreateRole = () =>
  useCreateMutation<Role>(TABLES.ROLES, ['roles'], { successMessage: 'Role created successfully' });

export const useUpdateRole = () =>
  useUpdateMutation<Role>(TABLES.ROLES, ['roles'], { successMessage: 'Role updated successfully' });

export const useDeleteRole = () =>
  useDeleteMutation(TABLES.ROLES, ['roles'], { successMessage: 'Role deleted successfully' });

// --- Classes ---
export interface Class {
  id: string;
  class_name: string;
  class_code: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useClasses = (options?: QueryOptions) =>
  useTableQuery<Class>(TABLES.CLASSES, ['classes'], {
    ...options,
    orderBy: { column: 'display_order', ascending: true },
  });

export const useClass = (id: string | undefined) =>
  useTableRecord<Class>(TABLES.CLASSES, id, ['classes']);

export const useCreateClass = () =>
  useCreateMutation<Class>(TABLES.CLASSES, ['classes'], { successMessage: 'Class created successfully' });

export const useUpdateClass = () =>
  useUpdateMutation<Class>(TABLES.CLASSES, ['classes'], { successMessage: 'Class updated successfully' });

export const useDeleteClass = () =>
  useDeleteMutation(TABLES.CLASSES, ['classes'], { successMessage: 'Class deleted successfully' });

// --- Sections ---
export interface Section {
  id: string;
  class_id: string;
  section_name: string;
  class_teacher_id?: string;
  capacity?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSections = (options?: QueryOptions) =>
  useTableQuery<Section>(TABLES.SECTIONS, ['sections'], {
    ...options,
    orderBy: { column: 'section_name', ascending: true },
  });

export const useSection = (id: string | undefined) =>
  useTableRecord<Section>(TABLES.SECTIONS, id, ['sections']);

export const useCreateSection = () =>
  useCreateMutation<Section>(TABLES.SECTIONS, ['sections'], { successMessage: 'Section created successfully' });

export const useUpdateSection = () =>
  useUpdateMutation<Section>(TABLES.SECTIONS, ['sections'], { successMessage: 'Section updated successfully' });

export const useDeleteSection = () =>
  useDeleteMutation(TABLES.SECTIONS, ['sections'], { successMessage: 'Section deleted successfully' });

// --- Subjects ---
export interface Subject {
  id: string;
  subject_name: string;
  subject_code: string;
  subject_type?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSubjects = (options?: QueryOptions) =>
  useTableQuery<Subject>(TABLES.SUBJECTS, ['subjects'], {
    ...options,
    orderBy: { column: 'subject_name', ascending: true },
  });

export const useSubject = (id: string | undefined) =>
  useTableRecord<Subject>(TABLES.SUBJECTS, id, ['subjects']);

export const useCreateSubject = () =>
  useCreateMutation<Subject>(TABLES.SUBJECTS, ['subjects'], { successMessage: 'Subject created successfully' });

export const useUpdateSubject = () =>
  useUpdateMutation<Subject>(TABLES.SUBJECTS, ['subjects'], { successMessage: 'Subject updated successfully' });

export const useDeleteSubject = () =>
  useDeleteMutation(TABLES.SUBJECTS, ['subjects'], { successMessage: 'Subject deleted successfully' });

// --- Students ---
export interface Student {
  id: string;
  user_id?: string;
  admission_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  email?: string;
  phone?: string;
  class_id?: string;
  section_id?: string;
  roll_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useStudents = (options?: QueryOptions) =>
  useTableQuery<Student>(TABLES.STUDENTS, ['students'], {
    ...options,
    orderBy: { column: 'first_name', ascending: true },
  });

export const useStudent = (id: string | undefined) =>
  useTableRecord<Student>(TABLES.STUDENTS, id, ['students']);

export const useCreateStudent = () =>
  useCreateMutation<Student>(TABLES.STUDENTS, ['students'], { successMessage: 'Student created successfully' });

export const useUpdateStudent = () =>
  useUpdateMutation<Student>(TABLES.STUDENTS, ['students'], { successMessage: 'Student updated successfully' });

export const useDeleteStudent = () =>
  useDeleteMutation(TABLES.STUDENTS, ['students'], { successMessage: 'Student deleted successfully' });

// --- Teachers ---
export interface Teacher {
  id: string;
  user_id?: string;
  employee_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  phone?: string;
  qualification?: string;
  specialization?: string;
  experience_years?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useTeachers = (options?: QueryOptions) =>
  useTableQuery<Teacher>(TABLES.TEACHERS, ['teachers'], {
    ...options,
    orderBy: { column: 'first_name', ascending: true },
  });

export const useTeacher = (id: string | undefined) =>
  useTableRecord<Teacher>(TABLES.TEACHERS, id, ['teachers']);

export const useCreateTeacher = () =>
  useCreateMutation<Teacher>(TABLES.TEACHERS, ['teachers'], { successMessage: 'Teacher created successfully' });

export const useUpdateTeacher = () =>
  useUpdateMutation<Teacher>(TABLES.TEACHERS, ['teachers'], { successMessage: 'Teacher updated successfully' });

export const useDeleteTeacher = () =>
  useDeleteMutation(TABLES.TEACHERS, ['teachers'], { successMessage: 'Teacher deleted successfully' });

// --- Academic Years ---
export interface AcademicYear {
  id: string;
  year_code: string;
  year_name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export const useAcademicYears = (options?: QueryOptions) =>
  useTableQuery<AcademicYear>(TABLES.ACADEMIC_YEARS, ['academic_years'], {
    ...options,
    orderBy: { column: 'start_date', ascending: false },
  });

export const useCurrentAcademicYear = () =>
  useTableQuery<AcademicYear>(TABLES.ACADEMIC_YEARS, ['academic_years', 'current'], {
    filters: { is_current: true },
    limit: 1,
  });

export const useAcademicYear = (id: string | undefined) =>
  useTableRecord<AcademicYear>(TABLES.ACADEMIC_YEARS, id, ['academic_years']);

export const useCreateAcademicYear = () =>
  useCreateMutation<AcademicYear>(TABLES.ACADEMIC_YEARS, ['academic_years'], { successMessage: 'Academic year created successfully' });

export const useUpdateAcademicYear = () =>
  useUpdateMutation<AcademicYear>(TABLES.ACADEMIC_YEARS, ['academic_years'], { successMessage: 'Academic year updated successfully' });

// --- Announcements ---
export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  target_audience?: string;
  is_pinned: boolean;
  published_at?: string;
  expires_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useAnnouncements = (options?: QueryOptions) =>
  useTableQuery<Announcement>(TABLES.ANNOUNCEMENTS, ['announcements'], {
    ...options,
    orderBy: { column: 'created_at', ascending: false },
  });

export const useAnnouncement = (id: string | undefined) =>
  useTableRecord<Announcement>(TABLES.ANNOUNCEMENTS, id, ['announcements']);

export const useCreateAnnouncement = () =>
  useCreateMutation<Announcement>(TABLES.ANNOUNCEMENTS, ['announcements'], { successMessage: 'Announcement created successfully' });

export const useUpdateAnnouncement = () =>
  useUpdateMutation<Announcement>(TABLES.ANNOUNCEMENTS, ['announcements'], { successMessage: 'Announcement updated successfully' });

export const useDeleteAnnouncement = () =>
  useDeleteMutation(TABLES.ANNOUNCEMENTS, ['announcements'], { successMessage: 'Announcement deleted successfully' });

