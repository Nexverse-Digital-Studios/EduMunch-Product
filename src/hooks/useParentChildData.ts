/**
 * useParentChildData Hook
 * ========================
 * Provides parent users with their linked children's data
 * Used to filter data across all parent-facing pages
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, TABLES } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface ChildData {
  id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  class_id: string;
  section_id: string;
  class_name?: string;
  section_name?: string;
}

export interface ParentChildContext {
  isParent: boolean;
  isLoading: boolean;
  children: ChildData[];
  childIds: string[];
  sectionIds: string[];
  classIds: string[];
  // Helper to check if a student belongs to parent
  isMyChild: (studentId: string) => boolean;
  // Helper to check if a section belongs to parent's child
  isMyChildSection: (sectionId: string) => boolean;
  // Helper to check if a class belongs to parent's child
  isMyChildClass: (classId: string) => boolean;
  // Refresh child data
  refresh: () => Promise<void>;
}

export const useParentChildData = (): ParentChildContext => {
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [children, setChildren] = useState<ChildData[]>([]);

  const roleCode = userProfile?.primary_role?.role_code;
  const isParent = roleCode === 'parent';

  const fetchChildData = useCallback(async () => {
    if (!isParent || !userProfile?.id || !supabase) {
      setChildren([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Get parent profile
      const { data: parentData, error: parentError } = await supabase
        .from(TABLES.PARENTS)
        .select('id')
        .eq('user_id', userProfile.id)
        .single();

      if (parentError || !parentData) {
        console.warn('[useParentChildData] No parent profile found');
        setChildren([]);
        setIsLoading(false);
        return;
      }

      // Get linked children with class and section info
      const { data: relationsData, error: relationsError } = await supabase
        .from(TABLES.STUDENT_PARENT_RELATIONS)
        .select(`
          student_id,
          students_1emaet!inner (
            id,
            admission_number,
            first_name,
            last_name,
            class_id,
            section_id,
            classes_1emaet (
              id,
              class_name
            ),
            sections_1emaet (
              id,
              section_name
            )
          )
        `)
        .eq('parent_id', parentData.id);

      if (relationsError) {
        console.error('[useParentChildData] Error fetching children:', relationsError);
        setChildren([]);
        setIsLoading(false);
        return;
      }

      // Transform data
      const childrenData: ChildData[] = (relationsData || []).map((rel: any) => {
        const student = rel.students_1emaet;
        return {
          id: student.id,
          admission_number: student.admission_number,
          first_name: student.first_name,
          last_name: student.last_name,
          full_name: `${student.first_name} ${student.last_name}`,
          class_id: student.class_id,
          section_id: student.section_id,
          class_name: student.classes_1emaet?.class_name,
          section_name: student.sections_1emaet?.section_name,
        };
      });

      console.log('[useParentChildData] Loaded children:', childrenData.length);
      setChildren(childrenData);
    } catch (err) {
      console.error('[useParentChildData] Error:', err);
      setChildren([]);
    } finally {
      setIsLoading(false);
    }
  }, [isParent, userProfile?.id]);

  useEffect(() => {
    fetchChildData();
  }, [fetchChildData]);

  // Derived data
  const childIds = children.map(c => c.id);
  const sectionIds = [...new Set(children.map(c => c.section_id))];
  const classIds = [...new Set(children.map(c => c.class_id))];

  // Helper functions
  const isMyChild = useCallback((studentId: string) => {
    return childIds.includes(studentId);
  }, [childIds]);

  const isMyChildSection = useCallback((sectionId: string) => {
    return sectionIds.includes(sectionId);
  }, [sectionIds]);

  const isMyChildClass = useCallback((classId: string) => {
    return classIds.includes(classId);
  }, [classIds]);

  return {
    isParent,
    isLoading,
    children,
    childIds,
    sectionIds,
    classIds,
    isMyChild,
    isMyChildSection,
    isMyChildClass,
    refresh: fetchChildData,
  };
};

export default useParentChildData;
