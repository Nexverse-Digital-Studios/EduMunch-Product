# Assignments Management

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

Assignments Management provides comprehensive tools for creating, managing, and deploying assignments across batches. Supports multiple assignment types with templates, attachments, and deployment workflows.

---

## Database Schema

### Assignment Tables

```sql
-- Assignment Templates
CREATE TABLE assignment_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  
  template_name VARCHAR(255),
  template_description TEXT,
  
  assignment_type VARCHAR(50),                      -- 'theory', 'mcq', 'practical', 'mixed', 'project'
  
  default_instructions TEXT,
  default_duration_hours INTEGER,
  default_total_marks DECIMAL(10, 2),
  default_passing_marks DECIMAL(10, 2),
  
  question_structure JSONB,                         -- For structured assignments
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Assignments
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  template_id UUID,                                 -- Optional link to template
  
  assignment_title VARCHAR(255),
  assignment_description TEXT,
  instructions TEXT,
  
  assignment_type VARCHAR(50),                      -- 'theory', 'mcq', 'practical', 'mixed', 'project'
  
  total_marks DECIMAL(10, 2),
  passing_marks DECIMAL(10, 2),
  
  duration_hours INTEGER,
  
  attachment_urls JSONB,                            -- Array of file URLs
  reference_materials JSONB,                        -- Links and documents
  
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_subject FOREIGN KEY (subject_id) 
    REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT fk_template FOREIGN KEY (template_id) 
    REFERENCES assignment_templates(id) ON DELETE SET NULL,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE RESTRICT
);

-- Assignment Deployment (Batch Assignment)
CREATE TABLE assignment_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL,
  batch_id UUID NOT NULL,
  
  issued_date DATE,
  due_date DATE,
  due_time TIME,
  
  allow_late_submission BOOLEAN DEFAULT false,
  late_submission_penalty_percent DECIMAL(5, 2),
  
  max_attempts INTEGER DEFAULT 1,
  
  is_active BOOLEAN DEFAULT true,
  
  deployed_by UUID,
  deployed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_assignment FOREIGN KEY (assignment_id) 
    REFERENCES assignments(id) ON DELETE CASCADE,
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE,
  CONSTRAINT fk_deployed_by FOREIGN KEY (deployed_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Assignment Questions (For structured assignments)
CREATE TABLE assignment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL,
  
  question_number INTEGER,
  question_text TEXT,
  question_type VARCHAR(50),                        -- 'short_answer', 'long_answer', 'mcq', 'true_false'
  
  marks DECIMAL(5, 2),
  
  mcq_options JSONB,                                -- For MCQ type
  correct_answer TEXT,                              -- For auto-grading
  
  hints TEXT,
  
  CONSTRAINT fk_assignment FOREIGN KEY (assignment_id) 
    REFERENCES assignments(id) ON DELETE CASCADE
);

-- Assignment Statistics (Materialized View)
CREATE MATERIALIZED VIEW assignment_statistics AS
SELECT
  ab.assignment_id,
  ab.batch_id,
  COUNT(DISTINCT e.student_id) as total_students,
  COUNT(DISTINCT asub.student_id) as submitted_count,
  COUNT(DISTINCT CASE WHEN asub.submission_status = 'late' THEN asub.student_id END) as late_submissions,
  ROUND(
    (COUNT(DISTINCT asub.student_id)::numeric / NULLIF(COUNT(DISTINCT e.student_id), 0) * 100),
    2
  ) as submission_percentage,
  AVG(ag.obtained_marks) as average_marks
FROM assignment_batches ab
LEFT JOIN batch_enrollments e ON ab.batch_id = e.batch_id
LEFT JOIN assignment_submissions asub ON ab.assignment_id = asub.assignment_id AND e.student_id = asub.student_id
LEFT JOIN assignment_evaluations ag ON asub.id = ag.submission_id
WHERE e.status = 'active'
GROUP BY ab.assignment_id, ab.batch_id;

CREATE INDEX idx_assignments_subject ON assignments(subject_id);
CREATE INDEX idx_assignments_org ON assignments(org_id);
CREATE INDEX idx_assignment_batches_assignment ON assignment_batches(assignment_id);
CREATE INDEX idx_assignment_batches_batch ON assignment_batches(batch_id);
CREATE INDEX idx_assignment_questions_assignment ON assignment_questions(assignment_id);
CREATE INDEX idx_templates_org ON assignment_templates(org_id);
```

---

## Assignment Components

### 1. Assignment Creation Form

```typescript
// src/components/teacher/AssignmentManagement/CreateAssignmentForm.tsx
import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { assignmentService } from '@/services/academic/assignment.service';
import { Button } from '@/components/common/buttons/Button';
import { FormInput } from '@/components/common/forms/FormInput';
import { FormSelect } from '@/components/common/forms/FormSelect';
import { FormTextarea } from '@/components/common/forms/FormTextarea';
import { FileUpload } from '@/components/common/upload/FileUpload';
import { Plus, Trash2, Upload } from 'lucide-react';

const assignmentSchema = z.object({
  assignment_title: z.string().min(5),
  assignment_description: z.string().min(10),
  instructions: z.string().min(10),
  assignment_type: z.enum(['theory', 'mcq', 'practical', 'mixed', 'project']),
  total_marks: z.coerce.number().positive(),
  passing_marks: z.coerce.number().positive(),
  duration_hours: z.coerce.number().int().positive(),
});

interface CreateAssignmentFormProps {
  subjectId: string;
  onSuccess: () => void;
}

export const CreateAssignmentForm: React.FC<CreateAssignmentFormProps> = ({
  subjectId,
  onSuccess,
}) => {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      assignment_type: 'theory',
    },
  });
  
  const assignmentType = watch('assignment_type');
  
  const { data: templates = [] } = useQuery({
    queryKey: ['assignment-templates', subjectId],
    queryFn: () => assignmentService.getTemplates(subjectId),
  });
  
  const { mutate: createAssignment, isPending } = useMutation({
    mutationFn: (data: any) =>
      assignmentService.createAssignment({
        ...data,
        subject_id: subjectId,
        attachments,
        questions,
      }),
    onSuccess: () => {
      onSuccess();
    },
  });
  
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_number: questions.length + 1,
        question_text: '',
        question_type: 'short_answer',
        marks: 0,
      },
    ]);
  };
  
  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };
  
  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };
  
  const onSubmit = (data: any) => {
    createAssignment(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <FormInput
            label="Assignment Title"
            {...register('assignment_title')}
            error={errors.assignment_title?.message}
            placeholder="e.g., Data Structures Assignment 1"
          />
        </div>
        
        <FormSelect
          label="Assignment Type"
          {...register('assignment_type')}
          options={[
            { value: 'theory', label: 'Theory' },
            { value: 'mcq', label: 'Multiple Choice' },
            { value: 'practical', label: 'Practical' },
            { value: 'mixed', label: 'Mixed' },
            { value: 'project', label: 'Project' },
          ]}
          error={errors.assignment_type?.message}
        />
        
        <FormInput
          label="Duration (Hours)"
          type="number"
          {...register('duration_hours')}
          error={errors.duration_hours?.message}
        />
      </div>
      
      <FormTextarea
        label="Description"
        {...register('assignment_description')}
        error={errors.assignment_description?.message}
        rows={3}
      />
      
      <FormTextarea
        label="Instructions"
        {...register('instructions')}
        error={errors.instructions?.message}
        rows={4}
        placeholder="Detailed instructions for students..."
      />
      
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
      
      {/* File Attachments */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <h3 className="font-semibold mb-3">Attachments</h3>
        <FileUpload
          onFilesSelected={setAttachments}
          multiple
          accept=".pdf,.doc,.docx,.ppt,.pptx"
        />
        {attachments.length > 0 && (
          <div className="mt-4 space-y-2">
            {attachments.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Questions Section (for structured assignments) */}
      {(assignmentType === 'mcq' || assignmentType === 'mixed') && (
        <div className="border border-gray-300 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Questions</h3>
            <Button type="button" onClick={addQuestion} variant="secondary" size="sm">
              <Plus size={16} className="mr-2" />
              Add Question
            </Button>
          </div>
          
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium">Question {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <textarea
                    value={question.question_text}
                    onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                    placeholder="Enter question text..."
                    className="w-full p-2 border border-gray-300 rounded"
                    rows={2}
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={question.question_type}
                      onChange={(e) => updateQuestion(index, 'question_type', e.target.value)}
                      className="p-2 border border-gray-300 rounded"
                    >
                      <option value="short_answer">Short Answer</option>
                      <option value="long_answer">Long Answer</option>
                      <option value="mcq">Multiple Choice</option>
                      <option value="true_false">True/False</option>
                    </select>
                    
                    <input
                      type="number"
                      value={question.marks}
                      onChange={(e) => updateQuestion(index, 'marks', parseFloat(e.target.value))}
                      placeholder="Marks"
                      className="p-2 border border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex gap-3">
        <Button
          type="submit"
          isLoading={isPending}
          disabled={isPending}
          className="flex-1"
        >
          Create Assignment
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
        >
          Save as Draft
        </Button>
      </div>
    </form>
  );
};
```

### 2. Assignment Deployment Modal

```typescript
// src/components/teacher/AssignmentManagement/DeployAssignmentModal.tsx
import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { assignmentService } from '@/services/academic/assignment.service';
import { Button } from '@/components/common/buttons/Button';
import { FormInput } from '@/components/common/forms/FormInput';
import { Modal } from '@/components/common/modals/Modal';
import { Calendar, Clock, Users } from 'lucide-react';

interface DeployAssignmentModalProps {
  assignmentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeployAssignmentModal: React.FC<DeployAssignmentModalProps> = ({
  assignmentId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedBatches, setSelectedBatches] = useState<Set<string>>(new Set());
  const [issuedDate, setIssuedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [allowLateSubmission, setAllowLateSubmission] = useState(false);
  const [latePenalty, setLatePenalty] = useState(10);
  
  const { data: batches = [] } = useQuery({
    queryKey: ['available-batches'],
    queryFn: () => assignmentService.getAvailableBatches(),
  });
  
  const { mutate: deployAssignment, isPending } = useMutation({
    mutationFn: () =>
      assignmentService.deployAssignment(assignmentId, {
        batch_ids: Array.from(selectedBatches),
        issued_date: issuedDate,
        due_date: dueDate,
        due_time: dueTime,
        allow_late_submission: allowLateSubmission,
        late_submission_penalty_percent: latePenalty,
      }),
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deploy Assignment to Batches">
      <div className="space-y-6">
        {/* Batch Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Batches ({selectedBatches.size} selected)
          </label>
          <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg">
            {batches.map((batch) => (
              <label
                key={batch.id}
                className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedBatches.has(batch.id)}
                  onChange={(e) => {
                    const newSet = new Set(selectedBatches);
                    if (e.target.checked) {
                      newSet.add(batch.id);
                    } else {
                      newSet.delete(batch.id);
                    }
                    setSelectedBatches(newSet);
                  }}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium">{batch.batch_name}</p>
                  <p className="text-sm text-gray-600">
                    {batch.courses?.name} • {batch.current_students} students
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
        
        {/* Date Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Calendar size={16} className="inline mr-1" />
              Issued Date
            </label>
            <input
              type="date"
              value={issuedDate}
              onChange={(e) => setIssuedDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              <Calendar size={16} className="inline mr-1" />
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={issuedDate}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            <Clock size={16} className="inline mr-1" />
            Due Time
          </label>
          <input
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        {/* Late Submission Settings */}
        <div className="border border-gray-300 rounded-lg p-4">
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={allowLateSubmission}
              onChange={(e) => setAllowLateSubmission(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="font-medium">Allow Late Submissions</span>
          </label>
          
          {allowLateSubmission && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Late Submission Penalty (%)
              </label>
              <input
                type="number"
                value={latePenalty}
                onChange={(e) => setLatePenalty(parseFloat(e.target.value))}
                min={0}
                max={100}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={() => deployAssignment()}
            isLoading={isPending}
            disabled={isPending || selectedBatches.size === 0 || !dueDate}
            className="flex-1"
          >
            Deploy to {selectedBatches.size} Batch{selectedBatches.size !== 1 ? 'es' : ''}
          </Button>
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
```

---

## Assignment Service

```typescript
// src/services/academic/assignment.service.ts
import { supabase } from '@/services/api/client';

export const assignmentService = {
  async getTemplates(subjectId: string) {
    const { data, error } = await supabase
      .from('assignment_templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async createAssignment(assignmentData: any) {
    // Upload attachments
    const attachmentUrls: string[] = [];
    
    for (const file of assignmentData.attachments || []) {
      const filePath = `assignments/${assignmentData.subject_id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('assignment-files')
        .upload(filePath, file);
      
      if (uploadError) throw new Error(uploadError.message);
      
      const { data: urlData } = supabase.storage
        .from('assignment-files')
        .getPublicUrl(filePath);
      
      attachmentUrls.push(urlData.publicUrl);
    }
    
    // Create assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .insert({
        subject_id: assignmentData.subject_id,
        assignment_title: assignmentData.assignment_title,
        assignment_description: assignmentData.assignment_description,
        instructions: assignmentData.instructions,
        assignment_type: assignmentData.assignment_type,
        total_marks: assignmentData.total_marks,
        passing_marks: assignmentData.passing_marks,
        duration_hours: assignmentData.duration_hours,
        attachment_urls: attachmentUrls,
      })
      .select()
      .single();
    
    if (assignmentError) throw new Error(assignmentError.message);
    
    // Create questions if any
    if (assignmentData.questions?.length > 0) {
      const { error: questionsError } = await supabase
        .from('assignment_questions')
        .insert(
          assignmentData.questions.map((q: any) => ({
            assignment_id: assignment.id,
            ...q,
          }))
        );
      
      if (questionsError) throw new Error(questionsError.message);
    }
    
    return assignment;
  },
  
  async getAvailableBatches() {
    const { data, error } = await supabase
      .from('course_batches')
      .select(`
        id,
        batch_name,
        current_students,
        courses(name)
      `)
      .eq('status', 'active');
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async deployAssignment(assignmentId: string, deploymentData: any) {
    const deployments = deploymentData.batch_ids.map((batchId: string) => ({
      assignment_id: assignmentId,
      batch_id: batchId,
      issued_date: deploymentData.issued_date,
      due_date: deploymentData.due_date,
      due_time: deploymentData.due_time,
      allow_late_submission: deploymentData.allow_late_submission,
      late_submission_penalty_percent: deploymentData.late_submission_penalty_percent,
    }));
    
    const { error } = await supabase
      .from('assignment_batches')
      .insert(deployments);
    
    if (error) throw new Error(error.message);
    
    // Update assignment as published
    await supabase
      .from('assignments')
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .eq('id', assignmentId);
  },
  
  async getAssignmentStatistics(assignmentId: string) {
    const { data, error } = await supabase
      .from('assignment_statistics')
      .select('*')
      .eq('assignment_id', assignmentId);
    
    if (error) throw new Error(error.message);
    return data;
  },
};
```

---

## Next Steps

1. ✅ Create assignment schema
2. ✅ Implement assignment creation form
3. ✅ Build deployment modal
4. ✅ Create assignment service
5. ✅ Proceed to `31_ASSIGNMENT_SUBMISSIONS.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Assignments Management Complete  
**Next Phase:** 31_ASSIGNMENT_SUBMISSIONS.md
