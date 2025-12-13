# Assignment Submissions

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

Assignment Submissions handles the complete student submission workflow including file uploads, submission tracking, attempt management, and plagiarism detection.

---

## Database Schema

### Submission Tables

```sql
-- Assignment Submissions
CREATE TABLE assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL,
  student_id UUID NOT NULL,
  batch_id UUID NOT NULL,
  
  attempt_number INTEGER DEFAULT 1,
  
  submission_files JSONB,                           -- Array of file URLs
  submission_text TEXT,                             -- For text-based submissions
  submission_links JSONB,                           -- External links (GitHub, etc.)
  
  submission_status VARCHAR(50) DEFAULT 'not_submitted',  -- 'not_submitted', 'submitted', 'late', 'graded', 'resubmit'
  
  submitted_at TIMESTAMP,
  
  is_late BOOLEAN DEFAULT false,
  late_by_hours INTEGER,
  
  student_remarks TEXT,
  
  file_count INTEGER DEFAULT 0,
  total_file_size_mb DECIMAL(10, 2),
  
  plagiarism_score DECIMAL(5, 2),
  plagiarism_report_url TEXT,
  
  CONSTRAINT fk_assignment FOREIGN KEY (assignment_id) 
    REFERENCES assignments(id) ON DELETE CASCADE,
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE,
  CONSTRAINT unique_submission UNIQUE (assignment_id, student_id, batch_id, attempt_number)
);

-- Submission Activity Log
CREATE TABLE submission_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL,
  
  activity_type VARCHAR(100),                       -- 'file_uploaded', 'file_deleted', 'submitted', 'resubmitted'
  activity_details TEXT,
  
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_submission FOREIGN KEY (submission_id) 
    REFERENCES assignment_submissions(id) ON DELETE CASCADE
);

-- Submission Comments/Feedback
CREATE TABLE submission_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL,
  
  comment_text TEXT,
  comment_type VARCHAR(50),                         -- 'student_query', 'teacher_feedback', 'general'
  
  commented_by UUID NOT NULL,
  commented_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  is_private BOOLEAN DEFAULT false,
  
  CONSTRAINT fk_submission FOREIGN KEY (submission_id) 
    REFERENCES assignment_submissions(id) ON DELETE CASCADE,
  CONSTRAINT fk_commented_by FOREIGN KEY (commented_by) 
    REFERENCES users(id) ON DELETE CASCADE
);

-- Submission Versions (For resubmissions)
CREATE TABLE submission_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL,
  
  version_number INTEGER,
  
  files_snapshot JSONB,
  text_snapshot TEXT,
  
  submitted_at TIMESTAMP,
  
  CONSTRAINT fk_submission FOREIGN KEY (submission_id) 
    REFERENCES assignment_submissions(id) ON DELETE CASCADE
);

-- Auto-save Drafts
CREATE TABLE submission_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL,
  student_id UUID NOT NULL,
  
  draft_content JSONB,
  
  last_saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_assignment FOREIGN KEY (assignment_id) 
    REFERENCES assignments(id) ON DELETE CASCADE,
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unique_draft UNIQUE (assignment_id, student_id)
);

CREATE INDEX idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX idx_submissions_student ON assignment_submissions(student_id);
CREATE INDEX idx_submissions_status ON assignment_submissions(submission_status);
CREATE INDEX idx_activity_log_submission ON submission_activity_log(submission_id);
CREATE INDEX idx_comments_submission ON submission_comments(submission_id);
```

---

## Submission Components

### 1. Student Submission Interface

```typescript
// src/components/student/AssignmentSubmission/SubmissionInterface.tsx
import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/store/user.store';
import { submissionService } from '@/services/academic/submission.service';
import { Card } from '@/components/common/cards/Card';
import { Button } from '@/components/common/buttons/Button';
import { FileUpload } from '@/components/common/upload/FileUpload';
import { Upload, Clock, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

interface SubmissionInterfaceProps {
  assignmentId: string;
  batchId: string;
}

export const SubmissionInterface: React.FC<SubmissionInterfaceProps> = ({
  assignmentId,
  batchId,
}) => {
  const { user } = useUserStore();
  const [files, setFiles] = useState<File[]>([]);
  const [submissionText, setSubmissionText] = useState('');
  const [links, setLinks] = useState<string[]>(['']);
  const [studentRemarks, setStudentRemarks] = useState('');
  
  const { data: assignment } = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: () => submissionService.getAssignment(assignmentId, batchId),
  });
  
  const { data: existingSubmission } = useQuery({
    queryKey: ['submission', assignmentId, user?.id],
    queryFn: () => submissionService.getSubmission(assignmentId, user!.id),
    enabled: !!user,
  });
  
  const { data: draft } = useQuery({
    queryKey: ['submission-draft', assignmentId, user?.id],
    queryFn: () => submissionService.getDraft(assignmentId, user!.id),
    enabled: !!user,
  });
  
  const { mutate: saveDraft } = useMutation({
    mutationFn: () =>
      submissionService.saveDraft(assignmentId, user!.id, {
        files: files.map((f) => f.name),
        text: submissionText,
        links,
        remarks: studentRemarks,
      }),
  });
  
  const { mutate: submitAssignment, isPending } = useMutation({
    mutationFn: () =>
      submissionService.submitAssignment(assignmentId, batchId, user!.id, {
        files,
        text: submissionText,
        links: links.filter((l) => l.trim()),
        remarks: studentRemarks,
      }),
  });
  
  // Auto-save draft every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (files.length > 0 || submissionText || links.some((l) => l.trim())) {
        saveDraft();
      }
    }, 30000);
    
    return () => clearInterval(timer);
  }, [files, submissionText, links, saveDraft]);
  
  if (!assignment) {
    return <div>Loading...</div>;
  }
  
  const dueDateTime = new Date(`${assignment.due_date}T${assignment.due_time}`);
  const now = new Date();
  const isOverdue = now > dueDateTime;
  const hoursLeft = Math.max(0, (dueDateTime.getTime() - now.getTime()) / (1000 * 60 * 60));
  
  const isSubmitted = existingSubmission?.submission_status !== 'not_submitted';
  
  return (
    <div className="space-y-6">
      {/* Assignment Details */}
      <Card>
        <h1 className="text-2xl font-bold mb-2">{assignment.assignment_title}</h1>
        <p className="text-gray-600 mb-4">{assignment.assignment_description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">Due Date</p>
              <p className="font-medium">
                {new Date(assignment.due_date).toLocaleDateString()} {assignment.due_time}
              </p>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-gray-600">Total Marks</p>
            <p className="font-medium">{assignment.total_marks}</p>
          </div>
          
          <div>
            <p className="text-xs text-gray-600">Max Attempts</p>
            <p className="font-medium">{assignment.max_attempts}</p>
          </div>
        </div>
        
        {isOverdue && !isSubmitted && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded flex gap-2">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-900">Assignment Overdue</p>
              <p className="text-sm text-red-800">
                {assignment.allow_late_submission
                  ? `Late submissions allowed with ${assignment.late_submission_penalty_percent}% penalty`
                  : 'Late submissions not allowed'}
              </p>
            </div>
          </div>
        )}
        
        {!isOverdue && !isSubmitted && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              ⏰ {hoursLeft.toFixed(1)} hours remaining
            </p>
          </div>
        )}
        
        {isSubmitted && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded flex gap-2">
            <CheckCircle size={20} className="text-green-600" />
            <div>
              <p className="font-medium text-green-900">Submitted Successfully</p>
              <p className="text-sm text-green-800">
                Submitted on {new Date(existingSubmission.submitted_at).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </Card>
      
      {/* Submission Form */}
      {(!isSubmitted || assignment.max_attempts > 1) && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Submit Your Work</h2>
          
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Upload Files
            </label>
            <FileUpload
              onFilesSelected={setFiles}
              multiple
              accept=".pdf,.doc,.docx,.zip,.rar"
              maxSize={50 * 1024 * 1024} // 50MB
            />
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                      className="text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Text Submission */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Written Submission (Optional)
            </label>
            <textarea
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-3 border border-gray-300 rounded-lg"
              rows={8}
            />
          </div>
          
          {/* External Links */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              External Links (GitHub, Drive, etc.)
            </label>
            {links.map((link, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={link}
                  onChange={(e) => {
                    const newLinks = [...links];
                    newLinks[i] = e.target.value;
                    setLinks(newLinks);
                  }}
                  placeholder="https://..."
                  className="flex-1 p-2 border border-gray-300 rounded"
                />
                <button
                  onClick={() => setLinks([...links, ''])}
                  className="px-3 py-2 bg-blue-600 text-white rounded"
                >
                  +
                </button>
              </div>
            ))}
          </div>
          
          {/* Student Remarks */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Remarks / Comments (Optional)
            </label>
            <textarea
              value={studentRemarks}
              onChange={(e) => setStudentRemarks(e.target.value)}
              placeholder="Any additional notes for your teacher..."
              className="w-full p-3 border border-gray-300 rounded-lg"
              rows={3}
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => submitAssignment()}
              isLoading={isPending}
              disabled={isPending || (files.length === 0 && !submissionText)}
              className="flex-1"
            >
              <Upload size={16} className="mr-2" />
              Submit Assignment
            </Button>
            <Button onClick={() => saveDraft()} variant="secondary">
              Save Draft
            </Button>
          </div>
        </Card>
      )}
      
      {/* Previous Submissions */}
      {existingSubmission && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Submission History</h2>
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium">Attempt {existingSubmission.attempt_number}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(existingSubmission.submitted_at).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    existingSubmission.submission_status === 'graded'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {existingSubmission.submission_status}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {existingSubmission.file_count} file(s) submitted
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
```

---

## Submission Service

```typescript
// src/services/academic/submission.service.ts
import { supabase } from '@/services/api/client';

export const submissionService = {
  async getAssignment(assignmentId: string, batchId: string) {
    const { data, error } = await supabase
      .from('assignment_batches')
      .select(`
        *,
        assignments(*)
      `)
      .eq('assignment_id', assignmentId)
      .eq('batch_id', batchId)
      .single();
    
    if (error) throw new Error(error.message);
    
    return {
      ...data.assignments,
      ...data,
    };
  },
  
  async getSubmission(assignmentId: string, studentId: string) {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .eq('student_id', studentId)
      .order('attempt_number', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  },
  
  async getDraft(assignmentId: string, studentId: string) {
    const { data, error } = await supabase
      .from('submission_drafts')
      .select('*')
      .eq('assignment_id', assignmentId)
      .eq('student_id', studentId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  },
  
  async saveDraft(assignmentId: string, studentId: string, draftData: any) {
    const { error } = await supabase
      .from('submission_drafts')
      .upsert(
        {
          assignment_id: assignmentId,
          student_id: studentId,
          draft_content: draftData,
          last_saved_at: new Date().toISOString(),
        },
        {
          onConflict: 'assignment_id,student_id',
        }
      );
    
    if (error) throw new Error(error.message);
  },
  
  async submitAssignment(
    assignmentId: string,
    batchId: string,
    studentId: string,
    submissionData: any
  ) {
    // Upload files
    const fileUrls: string[] = [];
    let totalSize = 0;
    
    for (const file of submissionData.files) {
      const filePath = `submissions/${assignmentId}/${studentId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('submission-files')
        .upload(filePath, file);
      
      if (uploadError) throw new Error(uploadError.message);
      
      const { data: urlData } = supabase.storage
        .from('submission-files')
        .getPublicUrl(filePath);
      
      fileUrls.push(urlData.publicUrl);
      totalSize += file.size;
    }
    
    // Get assignment to check if late
    const assignment = await this.getAssignment(assignmentId, batchId);
    const dueDateTime = new Date(`${assignment.due_date}T${assignment.due_time}`);
    const now = new Date();
    const isLate = now > dueDateTime;
    const lateByHours = isLate
      ? Math.floor((now.getTime() - dueDateTime.getTime()) / (1000 * 60 * 60))
      : 0;
    
    // Create submission
    const { data, error } = await supabase
      .from('assignment_submissions')
      .insert({
        assignment_id: assignmentId,
        batch_id: batchId,
        student_id: studentId,
        submission_files: fileUrls,
        submission_text: submissionData.text,
        submission_links: submissionData.links,
        student_remarks: submissionData.remarks,
        submission_status: isLate ? 'late' : 'submitted',
        submitted_at: new Date().toISOString(),
        is_late: isLate,
        late_by_hours: lateByHours,
        file_count: fileUrls.length,
        total_file_size_mb: totalSize / 1024 / 1024,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    
    // Log activity
    await supabase.from('submission_activity_log').insert({
      submission_id: data.id,
      activity_type: 'submitted',
      activity_details: `Submitted ${fileUrls.length} file(s)`,
    });
    
    return data;
  },
  
  async getSubmissionsByAssignment(assignmentId: string) {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        users:student_id(
          full_name,
          email
        )
      `)
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    
    return data?.map((submission) => ({
      ...submission,
      student_name: submission.users.full_name,
      student_email: submission.users.email,
    })) || [];
  },
};
```

---

## Next Steps

1. ✅ Create submission schema
2. ✅ Implement submission interface
3. ✅ Build draft auto-save
4. ✅ Create submission service
5. ✅ Proceed to `32_GRADING_SYSTEM.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Assignment Submissions Complete  
**Next Phase:** 32_GRADING_SYSTEM.md
