# Assignment Management System

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

Assignment Management System handles creation, distribution, submission, and grading of assignments across batches and subjects.

---

## Database Schema

### Assignment Tables

```sql
-- Assignments
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL,
  batch_id UUID NOT NULL,
  
  assignment_title VARCHAR(255),
  description TEXT,
  instructions TEXT,
  
  assignment_type VARCHAR(50),                      -- 'homework', 'classwork', 'project', 'quiz'
  
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  issued_date DATE,
  due_date DATE,
  late_submission_allowed BOOLEAN DEFAULT true,
  late_submission_days INTEGER DEFAULT 3,
  
  total_marks DECIMAL(10, 2),
  passing_marks DECIMAL(10, 2),
  
  file_attachments JSONB,                           -- Array of file URLs
  
  is_deleted BOOLEAN DEFAULT false,
  
  CONSTRAINT fk_subject FOREIGN KEY (subject_id) 
    REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE RESTRICT
);

-- Assignment Submissions
CREATE TABLE assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL,
  student_id UUID NOT NULL,
  
  submitted_at TIMESTAMP,
  submission_status VARCHAR(50) DEFAULT 'not_submitted',  -- 'not_submitted', 'submitted', 'late'
  
  submission_file_urls JSONB,                       -- Array of submitted file URLs
  submission_notes TEXT,
  
  is_resubmission BOOLEAN DEFAULT false,
  
  CONSTRAINT fk_assignment FOREIGN KEY (assignment_id) 
    REFERENCES assignments(id) ON DELETE CASCADE,
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

-- Assignment Evaluation
CREATE TABLE assignment_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL,
  
  obtained_marks DECIMAL(10, 2),
  feedback TEXT,
  
  evaluation_status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'graded', 'regrade_requested'
  
  graded_by UUID,
  graded_at TIMESTAMP,
  
  rubric_scores JSONB,                              -- Rubric-based scoring
  
  CONSTRAINT fk_submission FOREIGN KEY (submission_id) 
    REFERENCES assignment_submissions(id) ON DELETE CASCADE,
  CONSTRAINT fk_graded_by FOREIGN KEY (graded_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Grading Rubrics
CREATE TABLE grading_rubrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL,
  
  rubric_name VARCHAR(255),
  criteria JSONB,                                   -- Array of criteria with levels and scores
  
  total_score DECIMAL(10, 2),
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_subject FOREIGN KEY (subject_id) 
    REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Assignment Regrade Requests
CREATE TABLE regrade_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL,
  student_id UUID NOT NULL,
  
  reason TEXT,
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  status VARCHAR(50) DEFAULT 'pending',             -- 'pending', 'approved', 'rejected'
  
  previous_marks DECIMAL(10, 2),
  revised_marks DECIMAL(10, 2),
  
  reviewer_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP,
  
  CONSTRAINT fk_evaluation FOREIGN KEY (evaluation_id) 
    REFERENCES assignment_evaluations(id) ON DELETE CASCADE,
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviewed_by FOREIGN KEY (reviewed_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_assignments_batch ON assignments(batch_id);
CREATE INDEX idx_assignments_subject ON assignments(subject_id);
CREATE INDEX idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX idx_submissions_student ON assignment_submissions(student_id);
CREATE INDEX idx_submissions_status ON assignment_submissions(submission_status);
CREATE INDEX idx_evaluations_submission ON assignment_evaluations(submission_id);
CREATE INDEX idx_evaluations_status ON assignment_evaluations(evaluation_status);
CREATE INDEX idx_regrade_status ON regrade_requests(status);
```

---

## Assignment Components

### 1. Assignment Creation Form

```typescript
// src/components/teacher/AssignmentManagement/CreateAssignmentForm.tsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { assignmentService } from '@/services/academic/assignment.service';
import { Button } from '@/components/common/buttons/Button';
import { FormInput } from '@/components/common/forms/FormInput';
import { FormSelect } from '@/components/common/forms/FormSelect';
import { FormTextarea } from '@/components/common/forms/FormTextarea';
import { Upload, Plus, X } from 'lucide-react';

const assignmentSchema = z.object({
  assignment_title: z.string().min(5),
  description: z.string().min(10),
  assignment_type: z.enum(['homework', 'classwork', 'project', 'quiz']),
  issued_date: z.string(),
  due_date: z.string(),
  total_marks: z.coerce.number().positive(),
  passing_marks: z.coerce.number().positive(),
  late_submission_allowed: z.boolean(),
  late_submission_days: z.coerce.number().int().min(0),
});

interface CreateAssignmentFormProps {
  subjectId: string;
  batchId: string;
  onSuccess: () => void;
}

export const CreateAssignmentForm: React.FC<CreateAssignmentFormProps> = ({
  subjectId,
  batchId,
  onSuccess,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(assignmentSchema),
  });
  
  const { mutate: createAssignment, isPending } = useMutation({
    mutationFn: async (data: any) => {
      return assignmentService.createAssignment({
        ...data,
        subject_id: subjectId,
        batch_id: batchId,
        files,
      });
    },
    onSuccess: () => {
      onSuccess();
    },
  });
  
  const onSubmit = (data: any) => {
    createAssignment(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Assignment Title"
          {...register('assignment_title')}
          error={errors.assignment_title?.message}
        />
        
        <FormSelect
          label="Assignment Type"
          {...register('assignment_type')}
          options={[
            { value: 'homework', label: 'Homework' },
            { value: 'classwork', label: 'Classwork' },
            { value: 'project', label: 'Project' },
            { value: 'quiz', label: 'Quiz' },
          ]}
          error={errors.assignment_type?.message}
        />
      </div>
      
      <FormTextarea
        label="Description"
        {...register('description')}
        error={errors.description?.message}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Issued Date"
          type="date"
          {...register('issued_date')}
        />
        
        <FormInput
          label="Due Date"
          type="date"
          {...register('due_date')}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Total Marks"
          type="number"
          {...register('total_marks')}
          error={errors.total_marks?.message}
        />
        
        <FormInput
          label="Passing Marks"
          type="number"
          {...register('passing_marks')}
          error={errors.passing_marks?.message}
        />
      </div>
      
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('late_submission_allowed')} />
          <span>Allow Late Submissions</span>
        </label>
        
        {watch('late_submission_allowed') && (
          <FormInput
            label="Days After Due Date"
            type="number"
            {...register('late_submission_days')}
            className="w-32"
          />
        )}
      </div>
      
      {/* File Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <label className="flex flex-col items-center cursor-pointer">
          <Upload size={32} className="text-gray-400 mb-2" />
          <span className="text-sm text-gray-600">Upload assignment files</span>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="hidden"
          />
        </label>
        
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                  className="text-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex gap-3">
        <Button
          type="submit"
          isLoading={isPending}
          disabled={isPending}
          className="flex-1"
        >
          Create Assignment
        </Button>
      </div>
    </form>
  );
};
```

### 2. Assignment Submission Interface

```typescript
// src/components/student/AssignmentSubmission/SubmissionForm.tsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { assignmentService } from '@/services/academic/assignment.service';
import { Button } from '@/components/common/buttons/Button';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface SubmissionFormProps {
  assignmentId: string;
  studentId: string;
  onSuccess: () => void;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({
  assignmentId,
  studentId,
  onSuccess,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const [isLate, setIsLate] = useState(false);
  
  const { mutate: submitAssignment, isPending } = useMutation({
    mutationFn: () =>
      assignmentService.submitAssignment(assignmentId, studentId, {
        files,
        notes,
        isLate,
      }),
    onSuccess: () => {
      onSuccess();
    },
  });
  
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Upload Your Work
        </label>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <label className="flex flex-col items-center cursor-pointer">
            <Upload size={32} className="text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Click to upload or drag files</span>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="hidden"
            />
          </label>
          
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 bg-blue-50 rounded"
                >
                  <FileText size={16} className="text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Submission Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about your submission..."
          className="w-full p-3 border border-gray-300 rounded-lg"
          rows={4}
        />
      </div>
      
      {isLate && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
          <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900">Late Submission</p>
            <p className="text-sm text-yellow-800">
              This submission will be marked as late. Late submissions may incur
              penalties as per course policy.
            </p>
          </div>
        </div>
      )}
      
      <Button
        onClick={() => submitAssignment()}
        isLoading={isPending}
        disabled={isPending || files.length === 0}
        className="w-full"
      >
        Submit Assignment
      </Button>
    </div>
  );
};
```

---

## Assignment Service

```typescript
// src/services/academic/assignment.service.ts
import { supabase } from '@/services/api/client';

export const assignmentService = {
  async createAssignment(data: any) {
    // Upload files
    const fileUrls: string[] = [];
    
    for (const file of data.files) {
      const filePath = `assignments/${data.batch_id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('assignment-files')
        .upload(filePath, file);
      
      if (uploadError) throw new Error(uploadError.message);
      
      const { data: urlData } = supabase.storage
        .from('assignment-files')
        .getPublicUrl(filePath);
      
      fileUrls.push(urlData.publicUrl);
    }
    
    // Create assignment
    const { data: assignment, error } = await supabase
      .from('assignments')
      .insert({
        subject_id: data.subject_id,
        batch_id: data.batch_id,
        assignment_title: data.assignment_title,
        description: data.description,
        assignment_type: data.assignment_type,
        issued_date: data.issued_date,
        due_date: data.due_date,
        total_marks: data.total_marks,
        passing_marks: data.passing_marks,
        late_submission_allowed: data.late_submission_allowed,
        late_submission_days: data.late_submission_days,
        file_attachments: fileUrls,
        created_by: data.created_by,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return assignment;
  },
  
  async submitAssignment(
    assignmentId: string,
    studentId: string,
    data: {
      files: File[];
      notes: string;
      isLate: boolean;
    }
  ) {
    // Upload submission files
    const fileUrls: string[] = [];
    
    for (const file of data.files) {
      const filePath = `submissions/${assignmentId}/${studentId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('submission-files')
        .upload(filePath, file);
      
      if (uploadError) throw new Error(uploadError.message);
      
      const { data: urlData } = supabase.storage
        .from('submission-files')
        .getPublicUrl(filePath);
      
      fileUrls.push(urlData.publicUrl);
    }
    
    // Create submission record
    const { data: submission, error } = await supabase
      .from('assignment_submissions')
      .upsert(
        {
          assignment_id: assignmentId,
          student_id: studentId,
          submitted_at: new Date().toISOString(),
          submission_status: data.isLate ? 'late' : 'submitted',
          submission_file_urls: fileUrls,
          submission_notes: data.notes,
        },
        {
          onConflict: 'assignment_id,student_id',
        }
      )
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return submission;
  },
  
  async getAssignmentSubmissions(assignmentId: string) {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        users:student_id(
          full_name,
          email
        ),
        assignment_evaluations(
          obtained_marks,
          evaluation_status
        )
      `)
      .eq('assignment_id', assignmentId);
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async gradeSubmission(
    submissionId: string,
    gradingData: {
      obtained_marks: number;
      feedback: string;
      rubric_scores?: Record<string, number>;
    }
  ) {
    const { data, error } = await supabase
      .from('assignment_evaluations')
      .upsert(
        {
          submission_id: submissionId,
          obtained_marks: gradingData.obtained_marks,
          feedback: gradingData.feedback,
          rubric_scores: gradingData.rubric_scores,
          evaluation_status: 'graded',
          graded_at: new Date().toISOString(),
        },
        {
          onConflict: 'submission_id',
        }
      )
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
};
```

---

## Next Steps

1. ✅ Create assignment schema
2. ✅ Implement assignment creation form
3. ✅ Build submission interface
4. ✅ Create assignment service
5. ✅ Proceed to `27_ASSESSMENT_EVALUATION.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Assignment Management Complete  
**Next Phase:** 27_ASSESSMENT_EVALUATION.md
