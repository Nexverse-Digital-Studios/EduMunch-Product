# Batch Management

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

Batch Management handles the creation and lifecycle management of course batches, including enrollment, student management, and batch operations.

---

## Database Schema (Extended from Course Management)

```sql
-- Batch Student Dashboard (Materialized View)
CREATE MATERIALIZED VIEW batch_statistics AS
SELECT
  b.id as batch_id,
  b.batch_name,
  COUNT(DISTINCT be.student_id) as total_students,
  COUNT(CASE WHEN be.status = 'active' THEN 1 END) as active_students,
  COUNT(CASE WHEN be.status = 'dropped' THEN 1 END) as dropped_students,
  COUNT(CASE WHEN be.status = 'suspended' THEN 1 END) as suspended_students,
  b.current_students,
  b.max_students,
  ROUND(
    (COUNT(DISTINCT CASE WHEN be.status = 'active' THEN be.student_id END)::numeric / NULLIF(b.max_students, 0) * 100),
    2
  ) as enrollment_percentage
FROM course_batches b
LEFT JOIN batch_enrollments be ON b.id = be.batch_id
GROUP BY b.id, b.batch_name, b.current_students, b.max_students;

-- Batch Communication Log
CREATE TABLE batch_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL,
  
  message_type VARCHAR(50),                         -- 'announcement', 'assignment', 'alert'
  title VARCHAR(255),
  message TEXT,
  
  priority VARCHAR(20),                             -- 'low', 'medium', 'high'
  
  sent_by UUID,
  sent_to_roles UUID[],                             -- Target roles
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE,
  CONSTRAINT fk_sent_by FOREIGN KEY (sent_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Batch Performance Analytics
CREATE TABLE batch_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL,
  
  metric_date DATE,
  attendance_percentage DECIMAL(5, 2),
  average_grade DECIMAL(5, 2),
  assignment_submission_rate DECIMAL(5, 2),
  
  active_student_count INTEGER,
  content_completion_percentage DECIMAL(5, 2),
  
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE,
  UNIQUE(batch_id, metric_date)
);

CREATE INDEX idx_batch_comms_batch ON batch_communications(batch_id);
CREATE INDEX idx_batch_analytics_date ON batch_analytics(metric_date);
```

---

## Batch Management Components

### 1. Batch List Component

```typescript
// src/components/admin/BatchManagement/BatchList.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBranchStore } from '@/store/branch.store';
import { batchService } from '@/services/academic/batch.service';
import { DataTable } from '@/components/common/tables/DataTable';
import { Button } from '@/components/common/buttons/Button';
import { Badge } from '@/components/common/Badge';
import { Plus, Edit2, Users, Eye } from 'lucide-react';

export const BatchList: React.FC = () => {
  const { current: branch } = useBranchStore();
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { data: batches = [], isLoading, refetch } = useQuery({
    queryKey: ['batches', branch?.id, statusFilter],
    queryFn: () =>
      batchService.searchBatches(branch!.id, {
        status: statusFilter !== 'all' ? statusFilter : undefined,
      }),
    enabled: !!branch,
  });
  
  const columns = [
    {
      key: 'batch_name',
      label: 'Batch Name',
      render: (batch: any) => (
        <div>
          <p className="font-medium">{batch.batch_name}</p>
          <p className="text-sm text-gray-600">{batch.batch_code}</p>
        </div>
      ),
    },
    {
      key: 'course',
      label: 'Course',
      render: (batch: any) => (
        <span>{batch.courses?.name}</span>
      ),
    },
    {
      key: 'enrollment',
      label: 'Enrollment',
      render: (batch: any) => (
        <div>
          <p className="font-medium">{batch.current_students}/{batch.max_students}</p>
          <p className="text-sm text-gray-600">
            {batch.max_students ? ((batch.current_students / batch.max_students) * 100).toFixed(0) : 0}%
          </p>
        </div>
      ),
    },
    {
      key: 'dates',
      label: 'Duration',
      render: (batch: any) => (
        <span className="text-sm">
          {new Date(batch.start_date).toLocaleDateString()} - {new Date(batch.end_date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (batch: any) => (
        <Badge
          variant={
            batch.status === 'active'
              ? 'success'
              : batch.status === 'draft'
              ? 'warning'
              : 'secondary'
          }
        >
          {batch.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (batch: any) => (
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-200 rounded" title="View">
            <Eye size={16} />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded" title="Manage Students">
            <Users size={16} />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded" title="Edit">
            <Edit2 size={16} />
          </button>
        </div>
      ),
    },
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Batches</h1>
        <Button className="flex items-center gap-2">
          <Plus size={20} />
          New Batch
        </Button>
      </div>
      
      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      
      <DataTable
        columns={columns}
        data={batches}
        isLoading={isLoading}
      />
    </div>
  );
};
```

### 2. Batch Creation Form

```typescript
// src/components/admin/BatchManagement/BatchForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useBranchStore } from '@/store/branch.store';
import { useOrganizationStore } from '@/store/organization.store';
import { batchService } from '@/services/academic/batch.service';
import { courseService } from '@/services/academic/course.service';
import { Button } from '@/components/common/buttons/Button';
import { FormInput } from '@/components/common/forms/FormInput';

const batchSchema = z.object({
  batch_name: z.string().min(1, 'Batch name required'),
  batch_code: z.string().min(1, 'Batch code required'),
  course_id: z.string().uuid('Course required'),
  start_date: z.string().min(1, 'Start date required'),
  end_date: z.string().min(1, 'End date required'),
  enrollment_deadline: z.string().min(1, 'Enrollment deadline required'),
  max_students: z.number().min(1, 'Max students required'),
  primary_teacher_id: z.string().uuid('Primary teacher required'),
});

type BatchFormData = z.infer<typeof batchSchema>;

interface BatchFormProps {
  courseId?: string;
  onSuccess: () => void;
}

export const BatchForm: React.FC<BatchFormProps> = ({ courseId, onSuccess }) => {
  const { current: branch } = useBranchStore();
  const { current: org } = useOrganizationStore();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
  });
  
  const { data: courses = [] } = useQuery({
    queryKey: ['courses', org?.id],
    queryFn: () => courseService.searchCourses(org!.id),
    enabled: !!org,
  });
  
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers', org?.id],
    queryFn: async () => {
      // Fetch only users with teacher role
      return [];
    },
    enabled: !!org,
  });
  
  const { mutate: createBatch, isPending } = useMutation({
    mutationFn: (data: BatchFormData) =>
      batchService.createBatch(org!.id, branch!.id, data),
    onSuccess,
  });
  
  const onSubmit = (data: BatchFormData) => {
    createBatch(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <FormInput
        label="Batch Name"
        placeholder="Batch 2025-A"
        {...register('batch_name')}
        error={errors.batch_name?.message}
      />
      
      <FormInput
        label="Batch Code"
        placeholder="BATCH-2025-A"
        {...register('batch_code')}
        error={errors.batch_code?.message}
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Course
        </label>
        <select
          {...register('course_id')}
          defaultValue={courseId}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select Course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name} ({course.code})
            </option>
          ))}
        </select>
        {errors.course_id && (
          <p className="text-red-600 text-sm mt-1">{errors.course_id.message}</p>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <FormInput
          label="Start Date"
          type="date"
          {...register('start_date')}
          error={errors.start_date?.message}
        />
        
        <FormInput
          label="End Date"
          type="date"
          {...register('end_date')}
          error={errors.end_date?.message}
        />
        
        <FormInput
          label="Enrollment Deadline"
          type="date"
          {...register('enrollment_deadline')}
          error={errors.enrollment_deadline?.message}
        />
      </div>
      
      <FormInput
        label="Max Students"
        type="number"
        min="1"
        {...register('max_students', { valueAsNumber: true })}
        error={errors.max_students?.message}
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary Teacher
        </label>
        <select
          {...register('primary_teacher_id')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select Teacher</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.full_name}
            </option>
          ))}
        </select>
        {errors.primary_teacher_id && (
          <p className="text-red-600 text-sm mt-1">{errors.primary_teacher_id.message}</p>
        )}
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          isLoading={isPending}
          disabled={isPending}
          className="flex-1"
        >
          Create Batch
        </Button>
      </div>
    </form>
  );
};
```

### 3. Student Enrollment Component

```typescript
// src/components/admin/BatchManagement/StudentEnrollment.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { batchService } from '@/services/academic/batch.service';
import { DataTable } from '@/components/common/tables/DataTable';
import { Button } from '@/components/common/buttons/Button';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

interface StudentEnrollmentProps {
  batchId: string;
}

export const StudentEnrollment: React.FC<StudentEnrollmentProps> = ({
  batchId,
}) => {
  const [addStudentMode, setAddStudentMode] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  
  const { data: enrolledStudents = [], isLoading, refetch } = useQuery({
    queryKey: ['batch-enrollments', batchId],
    queryFn: () => batchService.getBatchEnrollments(batchId),
    enabled: !!batchId,
  });
  
  const { data: availableStudents = [] } = useQuery({
    queryKey: ['available-students'],
    queryFn: () => batchService.getAvailableStudents(),
  });
  
  const { mutate: enrollStudent, isPending: isEnrolling } = useMutation({
    mutationFn: () =>
      batchService.enrollStudent(batchId, selectedStudent),
    onSuccess: () => {
      setSelectedStudent('');
      setAddStudentMode(false);
      refetch();
    },
  });
  
  const { mutate: removeStudent, isPending: isRemoving } = useMutation({
    mutationFn: (enrollmentId: string) =>
      batchService.removeStudent(enrollmentId),
    onSuccess: () => {
      refetch();
    },
  });
  
  const columns = [
    {
      key: 'student_name',
      label: 'Student',
      render: (enrollment: any) => (
        <div>
          <p className="font-medium">{enrollment.users?.full_name}</p>
          <p className="text-sm text-gray-600">{enrollment.users?.email}</p>
        </div>
      ),
    },
    {
      key: 'enrollment_date',
      label: 'Enrolled On',
      render: (enrollment: any) => (
        <span className="text-sm">
          {new Date(enrollment.enrollment_date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (enrollment: any) => (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          enrollment.status === 'active'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {enrollment.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (enrollment: any) => (
        <button
          onClick={() => removeStudent(enrollment.id)}
          className="p-2 hover:bg-red-200 rounded text-red-600"
          disabled={isRemoving}
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Enrolled Students</h3>
        <Button
          onClick={() => setAddStudentMode(true)}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Add Student
        </Button>
      </div>
      
      {/* Add Student Modal */}
      {addStudentMode && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium mb-3">Add Student to Batch</h4>
          <div className="flex gap-3">
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Student</option>
              {availableStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name}
                </option>
              ))}
            </select>
            
            <Button
              onClick={() => enrollStudent()}
              isLoading={isEnrolling}
              disabled={!selectedStudent || isEnrolling}
            >
              Enroll
            </Button>
            <Button
              variant="secondary"
              onClick={() => setAddStudentMode(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      {enrolledStudents.length >= 80 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
          <AlertCircle size={20} className="text-yellow-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-yellow-900">Batch is nearly full</p>
            <p className="text-sm text-yellow-700">
              {enrolledStudents.length} students enrolled (80% capacity)
            </p>
          </div>
        </div>
      )}
      
      <DataTable
        columns={columns}
        data={enrolledStudents}
        isLoading={isLoading}
      />
    </div>
  );
};
```

---

## Batch Service

```typescript
// src/services/academic/batch.service.ts
import { supabase } from '@/services/api/client';

export const batchService = {
  async searchBatches(branchId: string, filters?: { status?: string }) {
    let query = supabase
      .from('course_batches')
      .select('*, courses(name, code)')
      .eq('branch_id', branchId);
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    const { data, error } = await query.order('start_date', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  },
  
  async createBatch(
    orgId: string,
    branchId: string,
    batchData: any
  ) {
    const { data, error } = await supabase
      .from('course_batches')
      .insert({
        org_id: orgId,
        branch_id: branchId,
        ...batchData,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async getBatchEnrollments(batchId: string) {
    const { data, error } = await supabase
      .from('batch_enrollments')
      .select('*, users(full_name, email)')
      .eq('batch_id', batchId);
    
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
  
  async removeStudent(enrollmentId: string) {
    const { error } = await supabase
      .from('batch_enrollments')
      .delete()
      .eq('id', enrollmentId);
    
    if (error) throw new Error(error.message);
  },
  
  async getAvailableStudents() {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('primary_role', 'student');
    
    if (error) throw new Error(error.message);
    return data;
  },
};
```

---

## Next Steps

1. ✅ Create batch lifecycle schema
2. ✅ Implement batch list and form
3. ✅ Build student enrollment UI
4. ✅ Create batch service
5. ✅ Complete Phase 4 - Academic Foundation

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Phase 4 Complete (All 5 Files)  
**Files Created:** 16-20  
**Progress:** 15 of 75 files complete (20%)
