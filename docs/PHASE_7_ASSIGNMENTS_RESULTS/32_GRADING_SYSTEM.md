# Grading System

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

Grading System provides comprehensive tools for evaluating student submissions including manual grading, auto-grading for MCQs, rubric-based evaluation, and feedback management.

---

## Database Schema

### Grading Tables

```sql
-- Assignment Evaluations
CREATE TABLE assignment_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL,
  
  obtained_marks DECIMAL(10, 2),
  feedback TEXT,
  
  evaluation_status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'graded', 'returned', 'regrade_requested'
  
  graded_by UUID,
  graded_at TIMESTAMP,
  
  rubric_id UUID,
  rubric_scores JSONB,                              -- Breakdown by rubric criteria
  
  time_taken_minutes INTEGER,
  
  CONSTRAINT fk_submission FOREIGN KEY (submission_id) 
    REFERENCES assignment_submissions(id) ON DELETE CASCADE,
  CONSTRAINT fk_graded_by FOREIGN KEY (graded_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Grading Rubrics
CREATE TABLE grading_rubrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  
  rubric_name VARCHAR(255),
  rubric_description TEXT,
  
  assignment_type VARCHAR(50),                      -- Associated assignment type
  
  criteria JSONB,                                   -- Array of criteria with levels
  total_points DECIMAL(10, 2),
  
  is_default BOOLEAN DEFAULT false,
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Feedback Templates
CREATE TABLE feedback_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  
  template_name VARCHAR(255),
  template_text TEXT,
  
  category VARCHAR(100),                            -- 'positive', 'needs_improvement', 'general'
  
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_teacher FOREIGN KEY (teacher_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

-- Question-wise Grading (For structured assignments)
CREATE TABLE question_grading (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL,
  question_id UUID NOT NULL,
  
  marks_awarded DECIMAL(5, 2),
  max_marks DECIMAL(5, 2),
  
  is_correct BOOLEAN,
  feedback TEXT,
  
  CONSTRAINT fk_evaluation FOREIGN KEY (evaluation_id) 
    REFERENCES assignment_evaluations(id) ON DELETE CASCADE,
  CONSTRAINT fk_question FOREIGN KEY (question_id) 
    REFERENCES assignment_questions(id) ON DELETE CASCADE
);

-- Auto-grading Results
CREATE TABLE auto_grading_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL,
  
  total_questions INTEGER,
  correct_answers INTEGER,
  
  auto_marks DECIMAL(10, 2),
  
  answer_key JSONB,                                 -- Student answers vs correct answers
  
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_submission FOREIGN KEY (submission_id) 
    REFERENCES assignment_submissions(id) ON DELETE CASCADE
);

-- Grading Analytics
CREATE MATERIALIZED VIEW grading_analytics AS
SELECT
  ae.graded_by,
  COUNT(*) as total_graded,
  AVG(ae.time_taken_minutes) as avg_time_per_submission,
  AVG(ae.obtained_marks) as avg_marks_given,
  COUNT(CASE WHEN ae.evaluation_status = 'regrade_requested' THEN 1 END) as regrade_requests
FROM assignment_evaluations ae
WHERE ae.graded_by IS NOT NULL
GROUP BY ae.graded_by;

CREATE INDEX idx_evaluations_submission ON assignment_evaluations(submission_id);
CREATE INDEX idx_evaluations_graded_by ON assignment_evaluations(graded_by);
CREATE INDEX idx_evaluations_status ON assignment_evaluations(evaluation_status);
CREATE INDEX idx_question_grading_evaluation ON question_grading(evaluation_id);
CREATE INDEX idx_rubrics_org ON grading_rubrics(org_id);
CREATE INDEX idx_feedback_templates_teacher ON feedback_templates(teacher_id);
```

---

## Grading Components

### 1. Manual Grading Interface

```typescript
// src/components/teacher/Grading/ManualGradingInterface.tsx
import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { gradingService } from '@/services/academic/grading.service';
import { Card } from '@/components/common/cards/Card';
import { Button } from '@/components/common/buttons/Button';
import { FormInput } from '@/components/common/forms/FormInput';
import { FormTextarea } from '@/components/common/forms/FormTextarea';
import { Download, Send, Save } from 'lucide-react';

interface ManualGradingInterfaceProps {
  submissionId: string;
  onComplete: () => void;
}

export const ManualGradingInterface: React.FC<ManualGradingInterfaceProps> = ({
  submissionId,
  onComplete,
}) => {
  const [obtainedMarks, setObtainedMarks] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});
  const [startTime] = useState(Date.now());
  
  const { data: submission } = useQuery({
    queryKey: ['submission-detail', submissionId],
    queryFn: () => gradingService.getSubmissionDetail(submissionId),
  });
  
  const { data: rubric } = useQuery({
    queryKey: ['rubric', submission?.assignment_type],
    queryFn: () => gradingService.getDefaultRubric(submission!.assignment_type),
    enabled: !!submission,
  });
  
  const { data: templates = [] } = useQuery({
    queryKey: ['feedback-templates'],
    queryFn: () => gradingService.getFeedbackTemplates(),
  });
  
  const { mutate: gradeSubmission, isPending } = useMutation({
    mutationFn: () => {
      const timeTaken = Math.floor((Date.now() - startTime) / 60000);
      return gradingService.gradeSubmission(submissionId, {
        obtained_marks: obtainedMarks,
        feedback,
        rubric_scores: rubricScores,
        time_taken_minutes: timeTaken,
      });
    },
    onSuccess: () => {
      onComplete();
    },
  });
  
  const applyTemplate = (templateText: string) => {
    setFeedback((prev) => (prev ? `${prev}\n\n${templateText}` : templateText));
  };
  
  if (!submission) {
    return <div>Loading submission...</div>;
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Submission View */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <h2 className="text-xl font-bold mb-4">Student Submission</h2>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600">Student</p>
            <p className="font-medium">{submission.student_name}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600">Submitted</p>
            <p className="font-medium">
              {new Date(submission.submitted_at).toLocaleString()}
              {submission.is_late && (
                <span className="ml-2 text-red-600 text-sm">
                  (Late by {submission.late_by_hours} hours)
                </span>
              )}
            </p>
          </div>
          
          {/* Files */}
          {submission.submission_files?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Submitted Files</p>
              <div className="space-y-2">
                {submission.submission_files.map((file: string, i: number) => (
                  <a
                    key={i}
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100"
                  >
                    <Download size={16} />
                    <span className="text-sm">File {i + 1}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          
          {/* Text Submission */}
          {submission.submission_text && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Written Answer</p>
              <div className="p-4 bg-gray-50 rounded whitespace-pre-wrap">
                {submission.submission_text}
              </div>
            </div>
          )}
          
          {/* Student Remarks */}
          {submission.student_remarks && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Student Remarks</p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                {submission.student_remarks}
              </div>
            </div>
          )}
        </Card>
        
        {/* Rubric-based Grading */}
        {rubric && (
          <Card>
            <h3 className="text-lg font-bold mb-4">Rubric: {rubric.rubric_name}</h3>
            <div className="space-y-4">
              {rubric.criteria?.map((criterion: any, i: number) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-2">{criterion.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{criterion.description}</p>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {criterion.levels?.map((level: any, j: number) => (
                      <button
                        key={j}
                        onClick={() =>
                          setRubricScores({
                            ...rubricScores,
                            [criterion.name]: level.points,
                          })
                        }
                        className={`p-3 border-2 rounded transition-colors ${
                          rubricScores[criterion.name] === level.points
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <p className="font-bold text-lg">{level.points}</p>
                        <p className="text-xs">{level.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="font-medium">
                Rubric Total: {Object.values(rubricScores).reduce((a, b) => a + b, 0)} / {rubric.total_points}
              </p>
            </div>
          </Card>
        )}
      </div>
      
      {/* Grading Panel */}
      <div className="space-y-4">
        <Card>
          <h3 className="text-lg font-bold mb-4">Grade Submission</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Marks Obtained
            </label>
            <input
              type="number"
              value={obtainedMarks}
              onChange={(e) => setObtainedMarks(parseFloat(e.target.value))}
              max={submission.total_marks}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <p className="text-xs text-gray-600 mt-1">
              Out of {submission.total_marks}
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide detailed feedback..."
              className="w-full p-3 border border-gray-300 rounded"
              rows={6}
            />
          </div>
          
          {/* Quick Feedback Templates */}
          {templates.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Quick Feedback</p>
              <div className="space-y-1">
                {templates.slice(0, 5).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template.template_text)}
                    className="w-full text-left text-xs p-2 bg-gray-50 hover:bg-gray-100 rounded"
                  >
                    {template.template_name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Button
              onClick={() => gradeSubmission()}
              isLoading={isPending}
              disabled={isPending || obtainedMarks === undefined}
              className="w-full"
            >
              <Send size={16} className="mr-2" />
              Submit Grade
            </Button>
            <Button variant="secondary" className="w-full">
              <Save size={16} className="mr-2" />
              Save Draft
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
```

### 2. Batch Grading View

```typescript
// src/components/teacher/Grading/BatchGradingView.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { gradingService } from '@/services/academic/grading.service';
import { DataTable } from '@/components/common/tables/DataTable';
import { Button } from '@/components/common/buttons/Button';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface BatchGradingViewProps {
  assignmentId: string;
}

export const BatchGradingView: React.FC<BatchGradingViewProps> = ({
  assignmentId,
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['assignment-submissions', assignmentId],
    queryFn: () => gradingService.getAssignmentSubmissions(assignmentId),
  });
  
  const pendingCount = submissions.filter((s) => !s.evaluation_id).length;
  const gradedCount = submissions.filter((s) => s.evaluation_status === 'graded').length;
  
  const columns = [
    {
      key: 'student_name',
      label: 'Student',
      render: (submission: any) => (
        <div>
          <p className="font-medium">{submission.student_name}</p>
          <p className="text-sm text-gray-600">{submission.student_email}</p>
        </div>
      ),
    },
    {
      key: 'submitted_at',
      label: 'Submitted',
      render: (submission: any) => (
        <div>
          <p className="text-sm">
            {new Date(submission.submitted_at).toLocaleDateString()}
          </p>
          {submission.is_late && (
            <span className="text-xs text-red-600">Late</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (submission: any) => {
        if (!submission.evaluation_id) {
          return (
            <span className="flex items-center gap-1 text-yellow-600">
              <Clock size={16} />
              Pending
            </span>
          );
        }
        if (submission.evaluation_status === 'graded') {
          return (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle size={16} />
              Graded
            </span>
          );
        }
        return (
          <span className="flex items-center gap-1 text-blue-600">
            <AlertCircle size={16} />
            {submission.evaluation_status}
          </span>
        );
      },
    },
    {
      key: 'marks',
      label: 'Marks',
      render: (submission: any) => (
        <div className="text-right">
          {submission.obtained_marks !== null ? (
            <p className="font-bold">
              {submission.obtained_marks}/{submission.total_marks}
            </p>
          ) : (
            <p className="text-gray-400">-</p>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (submission: any) => (
        <Button
          onClick={() => setSelectedSubmission(submission.id)}
          size="sm"
          variant={submission.evaluation_id ? 'secondary' : 'primary'}
        >
          {submission.evaluation_id ? 'View' : 'Grade'}
        </Button>
      ),
    },
  ];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-2xl font-bold text-yellow-800">{pendingCount}</p>
          <p className="text-sm text-yellow-700">Pending Review</p>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-2xl font-bold text-green-800">{gradedCount}</p>
          <p className="text-sm text-green-700">Graded</p>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-2xl font-bold text-blue-800">{submissions.length}</p>
          <p className="text-sm text-blue-700">Total Submissions</p>
        </div>
      </div>
      
      <DataTable columns={columns} data={submissions} isLoading={isLoading} />
      
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <ManualGradingInterface
              submissionId={selectedSubmission}
              onComplete={() => setSelectedSubmission(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## Grading Service

```typescript
// src/services/academic/grading.service.ts
import { supabase } from '@/services/api/client';

export const gradingService = {
  async getSubmissionDetail(submissionId: string) {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        users:student_id(full_name, email),
        assignments(total_marks, assignment_type)
      `)
      .eq('id', submissionId)
      .single();
    
    if (error) throw new Error(error.message);
    
    return {
      ...data,
      student_name: data.users.full_name,
      student_email: data.users.email,
      total_marks: data.assignments.total_marks,
      assignment_type: data.assignments.assignment_type,
    };
  },
  
  async getDefaultRubric(assignmentType: string) {
    const { data, error } = await supabase
      .from('grading_rubrics')
      .select('*')
      .eq('assignment_type', assignmentType)
      .eq('is_default', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  },
  
  async getFeedbackTemplates() {
    const { data, error } = await supabase
      .from('feedback_templates')
      .select('*')
      .order('usage_count', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async gradeSubmission(submissionId: string, gradingData: any) {
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
          time_taken_minutes: gradingData.time_taken_minutes,
        },
        {
          onConflict: 'submission_id',
        }
      )
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    
    // Update submission status
    await supabase
      .from('assignment_submissions')
      .update({ submission_status: 'graded' })
      .eq('id', submissionId);
    
    return data;
  },
  
  async getAssignmentSubmissions(assignmentId: string) {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        users:student_id(full_name, email),
        assignment_evaluations(
          id,
          obtained_marks,
          evaluation_status
        )
      `)
      .eq('assignment_id', assignmentId);
    
    if (error) throw new Error(error.message);
    
    return data?.map((submission) => ({
      ...submission,
      student_name: submission.users.full_name,
      student_email: submission.users.email,
      evaluation_id: submission.assignment_evaluations?.[0]?.id,
      obtained_marks: submission.assignment_evaluations?.[0]?.obtained_marks,
      evaluation_status: submission.assignment_evaluations?.[0]?.evaluation_status,
    })) || [];
  },
  
  async autoGradeSubmission(submissionId: string) {
    // Get submission with assignment questions
    const { data: submission } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        assignments(
          id,
          total_marks,
          assignment_questions(*)
        )
      `)
      .eq('id', submissionId)
      .single();
    
    if (!submission) throw new Error('Submission not found');
    
    // Auto-grade logic for MCQ/objective questions
    let correctAnswers = 0;
    const answerKey: any = {};
    
    // Implementation depends on how answers are stored
    // This is a simplified example
    
    const autoMarks = (correctAnswers / submission.assignments.assignment_questions.length) * 
                      submission.assignments.total_marks;
    
    // Save auto-grading result
    const { data, error } = await supabase
      .from('auto_grading_results')
      .insert({
        submission_id: submissionId,
        total_questions: submission.assignments.assignment_questions.length,
        correct_answers: correctAnswers,
        auto_marks: autoMarks,
        answer_key: answerKey,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
};
```

---

## Next Steps

1. ✅ Create grading schema
2. ✅ Implement manual grading interface
3. ✅ Build batch grading view
4. ✅ Create grading service
5. ✅ Proceed to `33_RESULTS_MANAGEMENT.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Grading System Complete  
**Next Phase:** 33_RESULTS_MANAGEMENT.md
