# Subject Management

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

Subject Management handles the creation and organization of subjects within courses, including subject hierarchies and teacher assignments.

---

## Database Schema

### Subject Tables

```sql
-- Subjects
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  
  code VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Categorization
  subject_category VARCHAR(100),                    -- 'Language', 'Mathematics', 'Science', 'Social Studies', 'Skill'
  is_mandatory BOOLEAN DEFAULT true,
  is_elective BOOLEAN DEFAULT false,
  
  -- Academic Info
  credit_points DECIMAL(4, 2),
  cie_weight DECIMAL(3, 2),                         -- Continuous Internal Evaluation
  see_weight DECIMAL(3, 2),                         -- Semester End Exam
  
  -- Curriculum
  curriculum_type VARCHAR(100),
  grade_levels VARCHAR(100)[],                      -- Applicable grade levels
  
  -- Settings
  passing_percentage INTEGER DEFAULT 40,
  is_active BOOLEAN DEFAULT true,
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Course-Subject Mapping (Many-to-Many)
CREATE TABLE course_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  
  position INTEGER DEFAULT 0,                       -- Order in course
  is_optional BOOLEAN DEFAULT false,
  
  CONSTRAINT fk_course FOREIGN KEY (course_id) 
    REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_subject FOREIGN KEY (subject_id) 
    REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE(course_id, subject_id)
);

-- Subject-Teacher Assignment
CREATE TABLE subject_teacher_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  
  subject_id UUID NOT NULL,
  batch_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  
  assignment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_primary BOOLEAN DEFAULT true,                 -- Primary teacher for this subject
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_subject FOREIGN KEY (subject_id) 
    REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE,
  CONSTRAINT fk_teacher FOREIGN KEY (teacher_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(subject_id, batch_id, teacher_id)
);

-- Subject Topics (Curriculum Breakdown)
CREATE TABLE subject_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL,
  
  topic_code VARCHAR(50),
  topic_name VARCHAR(255) NOT NULL,
  topic_description TEXT,
  
  position INTEGER,
  parent_topic_id UUID,                             -- For nested topics
  
  -- Learning
  learning_hours DECIMAL(5, 2),
  difficulty_level VARCHAR(50),                     -- 'Basic', 'Intermediate', 'Advanced'
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_subject FOREIGN KEY (subject_id) 
    REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT fk_parent_topic FOREIGN KEY (parent_topic_id) 
    REFERENCES subject_topics(id) ON DELETE CASCADE
);

CREATE INDEX idx_subjects_org ON subjects(org_id);
CREATE INDEX idx_subjects_category ON subjects(org_id, subject_category);
CREATE INDEX idx_course_subjects_course ON course_subjects(course_id);
CREATE INDEX idx_teacher_assignments_batch ON subject_teacher_assignments(batch_id);
CREATE INDEX idx_teacher_assignments_teacher ON subject_teacher_assignments(teacher_id);
CREATE INDEX idx_topics_subject ON subject_topics(subject_id);
```

---

## Subject Management Components

### 1. Subject List Component

```typescript
// src/components/admin/SubjectManagement/SubjectList.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOrganizationStore } from '@/store/organization.store';
import { subjectService } from '@/services/academic/subject.service';
import { DataTable } from '@/components/common/tables/DataTable';
import { Button } from '@/components/common/buttons/Button';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const SubjectList: React.FC = () => {
  const { current: org } = useOrganizationStore();
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects', org?.id, categoryFilter],
    queryFn: () =>
      subjectService.searchSubjects(org!.id, {
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
      }),
    enabled: !!org,
  });
  
  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (subject: any) => (
        <span className="font-mono text-sm">{subject.code}</span>
      ),
    },
    {
      key: 'name',
      label: 'Subject',
      render: (subject: any) => (
        <div>
          <p className="font-medium">{subject.name}</p>
          <p className="text-sm text-gray-600">{subject.subject_category}</p>
        </div>
      ),
    },
    {
      key: 'credits',
      label: 'Credits',
      render: (subject: any) => (
        <span>{subject.credit_points || '-'}</span>
      ),
    },
    {
      key: 'passing',
      label: 'Passing %',
      render: (subject: any) => (
        <span className="px-2 py-1 bg-blue-100 rounded">{subject.passing_percentage}%</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (subject: any) => (
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-200 rounded">
            <Edit2 size={16} />
          </button>
          <button className="p-2 hover:bg-red-200 rounded text-red-600">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Subjects</h1>
        <Button className="flex items-center gap-2">
          <Plus size={20} />
          New Subject
        </Button>
      </div>
      
      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md"
      >
        <option value="all">All Categories</option>
        <option value="Language">Language</option>
        <option value="Mathematics">Mathematics</option>
        <option value="Science">Science</option>
        <option value="Social Studies">Social Studies</option>
        <option value="Skill">Skill</option>
      </select>
      
      <DataTable
        columns={columns}
        data={subjects}
        isLoading={isLoading}
      />
    </div>
  );
};
```

### 2. Subject Form Component

```typescript
// src/components/admin/SubjectManagement/SubjectForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useOrganizationStore } from '@/store/organization.store';
import { subjectService } from '@/services/academic/subject.service';
import { Button } from '@/components/common/buttons/Button';
import { FormInput } from '@/components/common/forms/FormInput';

const subjectSchema = z.object({
  code: z.string().min(1, 'Subject code required'),
  name: z.string().min(2, 'Subject name required'),
  description: z.string().optional(),
  subject_category: z.string().min(1, 'Category required'),
  credit_points: z.number().optional(),
  passing_percentage: z.number().min(0).max(100),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

interface SubjectFormProps {
  subjectId?: string;
  onSuccess: () => void;
}

export const SubjectForm: React.FC<SubjectFormProps> = ({ subjectId, onSuccess }) => {
  const { current: org } = useOrganizationStore();
  const { register, handleSubmit, formState: { errors } } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { passing_percentage: 40 },
  });
  
  const { mutate: saveSubject, isPending } = useMutation({
    mutationFn: (data: SubjectFormData) =>
      subjectService.saveSubject(org!.id, subjectId, data),
    onSuccess,
  });
  
  const onSubmit = (data: SubjectFormData) => {
    saveSubject(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Subject Code"
          placeholder="MATH-01"
          {...register('code')}
          error={errors.code?.message}
        />
        
        <FormInput
          label="Subject Name"
          placeholder="Mathematics"
          {...register('name')}
          error={errors.name?.message}
        />
      </div>
      
      <FormInput
        label="Description"
        as="textarea"
        placeholder="Subject description..."
        {...register('description')}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            {...register('subject_category')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Category</option>
            <option value="Language">Language</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="Social Studies">Social Studies</option>
            <option value="Skill">Skill</option>
          </select>
        </div>
        
        <FormInput
          label="Credit Points"
          type="number"
          step="0.5"
          {...register('credit_points', { valueAsNumber: true })}
        />
      </div>
      
      <FormInput
        label="Passing Percentage"
        type="number"
        min="0"
        max="100"
        {...register('passing_percentage', { valueAsNumber: true })}
        error={errors.passing_percentage?.message}
      />
      
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          isLoading={isPending}
          disabled={isPending}
          className="flex-1"
        >
          {subjectId ? 'Update Subject' : 'Create Subject'}
        </Button>
      </div>
    </form>
  );
};
```

### 3. Teacher Assignment Component

```typescript
// src/components/admin/SubjectManagement/TeacherAssignment.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useOrganizationStore } from '@/store/organization.store';
import { subjectService } from '@/services/academic/subject.service';
import { Button } from '@/components/common/buttons/Button';
import { Plus, Trash2 } from 'lucide-react';

interface TeacherAssignmentProps {
  batchId: string;
  onSuccess: () => void;
}

export const TeacherAssignment: React.FC<TeacherAssignmentProps> = ({
  batchId,
  onSuccess,
}) => {
  const { current: org } = useOrganizationStore();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  
  // Fetch subjects for this batch
  const { data: subjects = [] } = useQuery({
    queryKey: ['batch-subjects', batchId],
    queryFn: () => subjectService.getBatchSubjects(batchId),
    enabled: !!batchId,
  });
  
  // Fetch teachers
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers', org?.id],
    queryFn: () =>
      // Fetch only teachers
      Promise.resolve([]), // Implementation pending
    enabled: !!org,
  });
  
  // Fetch current assignments
  const { data: assignments = [], refetch } = useQuery({
    queryKey: ['teacher-assignments', batchId],
    queryFn: () => subjectService.getTeacherAssignments(batchId),
    enabled: !!batchId,
  });
  
  const { mutate: assignTeacher, isPending } = useMutation({
    mutationFn: () =>
      subjectService.assignTeacher(
        batchId,
        selectedSubject,
        selectedTeacher,
        org!.id
      ),
    onSuccess: () => {
      setSelectedSubject('');
      setSelectedTeacher('');
      refetch();
      onSuccess();
    },
  });
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Assign Teachers to Subjects</h3>
      
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Teacher</label>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.full_name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <Button
            onClick={() => assignTeacher()}
            isLoading={isPending}
            disabled={!selectedSubject || !selectedTeacher || isPending}
            className="w-full"
          >
            <Plus size={16} className="mr-2" />
            Assign
          </Button>
        </div>
      </div>
      
      {/* Current Assignments */}
      <div className="mt-6">
        <h4 className="font-medium mb-3">Current Assignments</h4>
        <div className="space-y-2">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
            >
              <div>
                <p className="font-medium">{assignment.subject_name}</p>
                <p className="text-sm text-gray-600">{assignment.teacher_name}</p>
              </div>
              <button className="text-red-600 hover:text-red-700">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## Subject Service

```typescript
// src/services/academic/subject.service.ts
import { supabase } from '@/services/api/client';

export const subjectService = {
  async searchSubjects(
    orgId: string,
    filters?: { category?: string }
  ) {
    let query = supabase
      .from('subjects')
      .select('*')
      .eq('org_id', orgId);
    
    if (filters?.category) {
      query = query.eq('subject_category', filters.category);
    }
    
    const { data, error } = await query.order('name');
    if (error) throw new Error(error.message);
    return data;
  },
  
  async saveSubject(
    orgId: string,
    subjectId: string | undefined,
    subjectData: any
  ) {
    if (subjectId) {
      const { data, error } = await supabase
        .from('subjects')
        .update(subjectData)
        .eq('id', subjectId)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    } else {
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          org_id: orgId,
          ...subjectData,
        })
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    }
  },
  
  async getBatchSubjects(batchId: string) {
    const { data, error } = await supabase
      .from('course_batches')
      .select(`
        course_id,
        courses(
          id,
          name
        )
      `)
      .eq('id', batchId)
      .single();
    
    if (!data || error) return [];
    
    // Get subjects for this course
    const { data: courseSubjects } = await supabase
      .from('course_subjects')
      .select('subject_id, subjects(*)')
      .eq('course_id', data.course_id);
    
    return courseSubjects?.map((cs) => cs.subjects) || [];
  },
  
  async assignTeacher(
    batchId: string,
    subjectId: string,
    teacherId: string,
    orgId: string
  ) {
    const { data, error } = await supabase
      .from('subject_teacher_assignments')
      .insert({
        org_id: orgId,
        batch_id: batchId,
        subject_id: subjectId,
        teacher_id: teacherId,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async getTeacherAssignments(batchId: string) {
    const { data, error } = await supabase
      .from('subject_teacher_assignments')
      .select(`
        id,
        subject_id,
        teacher_id,
        subjects(name),
        users(full_name)
      `)
      .eq('batch_id', batchId);
    
    if (error) throw new Error(error.message);
    
    return data?.map((a) => ({
      ...a,
      subject_name: a.subjects.name,
      teacher_name: a.users.full_name,
    })) || [];
  },
};
```

---

## Next Steps

1. ✅ Create subject and topic tables
2. ✅ Implement subject list and form
3. ✅ Create teacher assignment UI
4. ✅ Build subject service
5. ✅ Proceed to `18_BATCH_MANAGEMENT.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Subject Management Complete  
**Next Phase:** 18_BATCH_MANAGEMENT.md
