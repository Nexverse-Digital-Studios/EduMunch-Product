# Course Management

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

Course Management handles the creation and administration of courses, including course details, syllabus management, and batch linking.

---

## Database Schema

### Core Course Tables

```sql
-- Courses
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  
  code VARCHAR(50) UNIQUE,                          -- Course code (e.g., 'MATH-101')
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Academic Info
  grade_level VARCHAR(50),                          -- 'Grade 1', '10th', 'BA', etc
  subject_ids UUID[],                               -- Linked subjects
  stream VARCHAR(100),                              -- 'Science', 'Commerce', 'Arts'
  curriculum_type VARCHAR(100),                     -- 'CBSE', 'ICSE', 'State Board', 'IB'
  
  -- Duration & Timing
  duration_weeks INTEGER,
  total_lectures INTEGER,
  lecture_hours DECIMAL(5, 2),
  
  -- Syllabus
  syllabus_url TEXT,                                -- Storage URL
  syllabus_file_size BIGINT,
  learning_outcomes TEXT[],
  prerequisites TEXT[],
  
  -- Settings
  max_students INTEGER,
  is_published BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Course Batches
CREATE TABLE course_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  course_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  
  batch_name VARCHAR(255),                          -- e.g., 'Batch 2025-A'
  batch_code VARCHAR(50),
  
  -- Enrollment
  start_date DATE,
  end_date DATE,
  enrollment_deadline DATE,
  max_students INTEGER,
  current_students INTEGER DEFAULT 0,
  
  -- Teachers
  primary_teacher_id UUID,                          -- Lead teacher
  co_teacher_ids UUID[],
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft',               -- 'draft', 'scheduled', 'active', 'completed'
  is_locked BOOLEAN DEFAULT false,                  -- Prevents modifications
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_course FOREIGN KEY (course_id) 
    REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_branch FOREIGN KEY (branch_id) 
    REFERENCES branches(id) ON DELETE CASCADE,
  CONSTRAINT fk_primary_teacher FOREIGN KEY (primary_teacher_id) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Batch Enrollments
CREATE TABLE batch_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL,
  student_id UUID NOT NULL,
  
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active',              -- 'active', 'dropped', 'suspended'
  dropout_date TIMESTAMP,
  dropout_reason VARCHAR(255),
  
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE,
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(batch_id, student_id)
);

CREATE INDEX idx_courses_org ON courses(org_id);
CREATE INDEX idx_courses_published ON courses(org_id, is_published);
CREATE INDEX idx_batches_course ON course_batches(course_id);
CREATE INDEX idx_batches_status ON course_batches(status);
CREATE INDEX idx_enrollments_batch ON batch_enrollments(batch_id);
CREATE INDEX idx_enrollments_student ON batch_enrollments(student_id);
```

---

## Course Management Components

### 1. Course List Component

```typescript
// src/components/admin/CourseManagement/CourseList.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOrganizationStore } from '@/store/organization.store';
import { courseService } from '@/services/academic/course.service';
import { DataTable } from '@/components/common/tables/DataTable';
import { Button } from '@/components/common/buttons/Button';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';

export const CourseList: React.FC = () => {
  const { current: org } = useOrganizationStore();
  const [search, setSearch] = useState('');
  
  const { data: courses = [], isLoading, refetch } = useQuery({
    queryKey: ['courses', org?.id, search],
    queryFn: () =>
      courseService.searchCourses(org!.id, { search }),
    enabled: !!org,
  });
  
  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (course: any) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {course.code}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Course Name',
      render: (course: any) => (
        <div>
          <p className="font-medium">{course.name}</p>
          <p className="text-sm text-gray-600">{course.grade_level}</p>
        </div>
      ),
    },
    {
      key: 'curriculum_type',
      label: 'Curriculum',
      render: (course: any) => (
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
          {course.curriculum_type}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (course: any) => (
        <span className={`px-3 py-1 rounded-full text-sm ${
          course.is_published
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {course.is_published ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (course: any) => (
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-200 rounded" title="View">
            <Eye size={16} />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded" title="Edit">
            <Edit2 size={16} />
          </button>
          <button className="p-2 hover:bg-red-200 rounded text-red-600" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Button className="flex items-center gap-2">
          <Plus size={20} />
          New Course
        </Button>
      </div>
      
      <input
        type="text"
        placeholder="Search courses..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md"
      />
      
      <DataTable
        columns={columns}
        data={courses}
        isLoading={isLoading}
      />
    </div>
  );
};
```

### 2. Create/Edit Course Form

```typescript
// src/components/admin/CourseManagement/CourseForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useOrganizationStore } from '@/store/organization.store';
import { courseService } from '@/services/academic/course.service';
import { Button } from '@/components/common/buttons/Button';
import { FormInput } from '@/components/common/forms/FormInput';

const courseSchema = z.object({
  code: z.string().min(1, 'Course code required'),
  name: z.string().min(3, 'Course name required'),
  description: z.string().optional(),
  grade_level: z.string().min(1, 'Grade level required'),
  curriculum_type: z.enum(['CBSE', 'ICSE', 'State Board', 'IB']),
  duration_weeks: z.number().min(1),
  total_lectures: z.number().min(1),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  courseId?: string;
  onSuccess: () => void;
}

export const CourseForm: React.FC<CourseFormProps> = ({ courseId, onSuccess }) => {
  const { current: org } = useOrganizationStore();
  const { register, handleSubmit, formState: { errors } } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
  });
  
  const { mutate: saveCourse, isPending } = useMutation({
    mutationFn: (data: CourseFormData) =>
      courseService.saveCourse(org!.id, courseId, data),
    onSuccess,
  });
  
  const onSubmit = (data: CourseFormData) => {
    saveCourse(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Course Code"
          placeholder="MATH-101"
          {...register('code')}
          error={errors.code?.message}
        />
        
        <FormInput
          label="Course Name"
          placeholder="Mathematics - Advanced"
          {...register('name')}
          error={errors.name?.message}
        />
      </div>
      
      <FormInput
        label="Description"
        as="textarea"
        placeholder="Course description and overview..."
        {...register('description')}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grade Level
          </label>
          <select
            {...register('grade_level')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Grade</option>
            <option value="Grade 1">Grade 1</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 12">Grade 12</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Curriculum
          </label>
          <select
            {...register('curriculum_type')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Curriculum</option>
            <option value="CBSE">CBSE</option>
            <option value="ICSE">ICSE</option>
            <option value="State Board">State Board</option>
            <option value="IB">IB</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Duration (weeks)"
          type="number"
          {...register('duration_weeks', { valueAsNumber: true })}
          error={errors.duration_weeks?.message}
        />
        
        <FormInput
          label="Total Lectures"
          type="number"
          {...register('total_lectures', { valueAsNumber: true })}
          error={errors.total_lectures?.message}
        />
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          isLoading={isPending}
          disabled={isPending}
          className="flex-1"
        >
          {courseId ? 'Update Course' : 'Create Course'}
        </Button>
      </div>
    </form>
  );
};
```

### 3. Course Service

```typescript
// src/services/academic/course.service.ts
import { supabase } from '@/services/api/client';

export const courseService = {
  async searchCourses(orgId: string, filters?: { search?: string }) {
    let query = supabase
      .from('courses')
      .select('*')
      .eq('org_id', orgId)
      .order('name');
    
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`
      );
    }
    
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  },
  
  async getCourse(courseId: string) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async saveCourse(
    orgId: string,
    courseId: string | undefined,
    courseData: any
  ) {
    if (courseId) {
      const { data, error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', courseId)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    } else {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          org_id: orgId,
          ...courseData,
        })
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    }
  },
  
  async createBatch(
    orgId: string,
    courseId: string,
    branchId: string,
    batchData: any
  ) {
    const { data, error } = await supabase
      .from('course_batches')
      .insert({
        org_id: orgId,
        course_id: courseId,
        branch_id: branchId,
        ...batchData,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async enrollStudent(batchId: string, studentId: string) {
    const { data, error } = await supabase
      .from('batch_enrollments')
      .insert({
        batch_id: batchId,
        student_id: studentId,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
};
```

---

## Course Store

```typescript
// src/store/course.store.ts
import { create } from 'zustand';
import { courseService } from '@/services/academic/course.service';

interface CourseState {
  selectedCourse: any | null;
  courses: any[];
  loadCourses: (orgId: string) => Promise<void>;
  selectCourse: (courseId: string) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set) => ({
  selectedCourse: null,
  courses: [],
  
  loadCourses: async (orgId: string) => {
    const courses = await courseService.searchCourses(orgId);
    set({ courses });
  },
  
  selectCourse: async (courseId: string) => {
    const course = await courseService.getCourse(courseId);
    set({ selectedCourse: course });
  },
}));
```

---

## Batch Management View

The batch management allows:
- Creating multiple batches per course
- Setting enrollment limits
- Assigning teachers
- Managing student enrollments
- Tracking batch status (draft → active → completed)

---

## Next Steps

1. ✅ Create course and batch tables
2. ✅ Implement course list and form
3. ✅ Create course service
4. ✅ Set up batch management
5. ✅ Proceed to `17_SUBJECT_MANAGEMENT.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Course Management Complete  
**Next Phase:** 17_SUBJECT_MANAGEMENT.md
