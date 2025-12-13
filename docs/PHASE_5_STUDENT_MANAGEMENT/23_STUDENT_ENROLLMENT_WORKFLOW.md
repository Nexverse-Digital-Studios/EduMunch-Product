# Student Enrollment Workflow

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

Student Enrollment Workflow handles the complete process of students enrolling in courses, managing their enrollment status, and tracking application history.

---

## Database Schema

### Enrollment Tables

```sql
-- Enrollment Applications
CREATE TABLE enrollment_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  batch_id UUID NOT NULL,
  org_id UUID NOT NULL,
  
  application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'applied',                -- 'applied', 'approved', 'rejected', 'waitlisted'
  
  rejection_reason VARCHAR(500),
  reviewed_by UUID,
  reviewed_at TIMESTAMP,
  
  approval_notes TEXT,
  
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE,
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviewed_by FOREIGN KEY (reviewed_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Enrollment Tracking
CREATE TABLE enrollment_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL,
  
  event_type VARCHAR(100),                            -- 'enrolled', 'suspended', 'dropped', 'reactivated'
  event_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reason VARCHAR(255),
  
  triggered_by UUID,                                  -- Admin/Teacher ID
  
  CONSTRAINT fk_enrollment FOREIGN KEY (enrollment_id) 
    REFERENCES batch_enrollments(id) ON DELETE CASCADE,
  CONSTRAINT fk_triggered_by FOREIGN KEY (triggered_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Enrollment Requirements
CREATE TABLE enrollment_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL,
  
  requirement_type VARCHAR(100),                      -- 'document', 'test', 'approval'
  requirement_name VARCHAR(255),
  description TEXT,
  
  is_mandatory BOOLEAN DEFAULT true,
  order_priority INTEGER DEFAULT 0,
  
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE
);

-- Student Requirement Submission
CREATE TABLE student_requirement_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  requirement_id UUID NOT NULL,
  
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_url TEXT,                                      -- For document submissions
  submission_status VARCHAR(50) DEFAULT 'pending',    -- 'pending', 'approved', 'rejected', 'resubmit'
  
  verified_by UUID,
  verified_at TIMESTAMP,
  verification_notes TEXT,
  
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_requirement FOREIGN KEY (requirement_id) 
    REFERENCES enrollment_requirements(id) ON DELETE CASCADE,
  CONSTRAINT fk_verified_by FOREIGN KEY (verified_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_applications_student ON enrollment_applications(student_id);
CREATE INDEX idx_applications_batch ON enrollment_applications(batch_id);
CREATE INDEX idx_applications_status ON enrollment_applications(status);
CREATE INDEX idx_tracking_enrollment ON enrollment_tracking(enrollment_id);
CREATE INDEX idx_requirements_batch ON enrollment_requirements(batch_id);
CREATE INDEX idx_submissions_student ON student_requirement_submissions(student_id);
CREATE INDEX idx_submissions_requirement ON student_requirement_submissions(requirement_id);
```

---

## Enrollment Workflow Components

### 1. Course Selection & Application

```typescript
// src/components/student/EnrollmentWorkflow/CourseSelection.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOrganizationStore } from '@/store/organization.store';
import { enrollmentService } from '@/services/student/enrollment.service';
import { DataTable } from '@/components/common/tables/DataTable';
import { Button } from '@/components/common/buttons/Button';
import { Users, Calendar, BookOpen } from 'lucide-react';

interface CourseSelectionProps {
  onApply: (batchId: string) => void;
}

export const CourseSelection: React.FC<CourseSelectionProps> = ({ onApply }) => {
  const { current: org } = useOrganizationStore();
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  
  const { data: availableBatches = [], isLoading } = useQuery({
    queryKey: ['available-batches', org?.id],
    queryFn: () =>
      enrollmentService.getAvailableBatches(org!.id),
    enabled: !!org,
  });
  
  const columns = [
    {
      key: 'course_name',
      label: 'Course',
      render: (batch: any) => (
        <div>
          <p className="font-medium">{batch.courses.name}</p>
          <p className="text-sm text-gray-600">{batch.courses.code}</p>
        </div>
      ),
    },
    {
      key: 'batch_name',
      label: 'Batch',
      render: (batch: any) => (
        <span className="font-mono text-sm">{batch.batch_name}</span>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (batch: any) => (
        <div className="flex items-center gap-1 text-sm">
          <Calendar size={16} />
          {new Date(batch.start_date).toLocaleDateString()} -
          {new Date(batch.end_date).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'enrollment',
      label: 'Seats Available',
      render: (batch: any) => (
        <div>
          <p className="font-medium">
            {batch.max_students - batch.current_students}
          </p>
          <p className="text-sm text-gray-600">
            {batch.current_students}/{batch.max_students} filled
          </p>
        </div>
      ),
    },
    {
      key: 'select',
      label: '',
      render: (batch: any) => (
        <input
          type="checkbox"
          checked={selectedBatches.includes(batch.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedBatches([...selectedBatches, batch.id]);
            } else {
              setSelectedBatches(selectedBatches.filter((id) => id !== batch.id));
            }
          }}
          className="w-4 h-4"
        />
      ),
    },
  ];
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Select Courses to Enroll</h2>
      
      <DataTable
        columns={columns}
        data={availableBatches}
        isLoading={isLoading}
      />
      
      <div className="flex gap-3 pt-4">
        <Button
          onClick={() => selectedBatches.forEach((id) => onApply(id))}
          disabled={selectedBatches.length === 0}
          className="flex-1"
        >
          Apply for {selectedBatches.length} Course{selectedBatches.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
};
```

### 2. Requirement Submission

```typescript
// src/components/student/EnrollmentWorkflow/RequirementSubmission.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { enrollmentService } from '@/services/student/enrollment.service';
import { Button } from '@/components/common/buttons/Button';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface RequirementSubmissionProps {
  enrollmentApplicationId: string;
  onComplete: () => void;
}

export const RequirementSubmission: React.FC<RequirementSubmissionProps> = ({
  enrollmentApplicationId,
  onComplete,
}) => {
  const [submissions, setSubmissions] = useState<Record<string, File | null>>({});
  
  const { data: requirements = [] } = useQuery({
    queryKey: ['enrollment-requirements', enrollmentApplicationId],
    queryFn: () =>
      enrollmentService.getEnrollmentRequirements(enrollmentApplicationId),
    enabled: !!enrollmentApplicationId,
  });
  
  const { data: studentSubmissions = [] } = useQuery({
    queryKey: ['student-submissions', enrollmentApplicationId],
    queryFn: () =>
      enrollmentService.getStudentSubmissions(enrollmentApplicationId),
    enabled: !!enrollmentApplicationId,
  });
  
  const { mutate: submitRequirement, isPending } = useMutation({
    mutationFn: (data: { requirementId: string; file: File }) =>
      enrollmentService.submitRequirement(
        enrollmentApplicationId,
        data.requirementId,
        data.file
      ),
    onSuccess: () => {
      // Reset and check if all submitted
      const allSubmitted = requirements.every((req) =>
        studentSubmissions.some((sub) => sub.requirement_id === req.id && sub.submission_status !== 'rejected')
      );
      if (allSubmitted) {
        onComplete();
      }
    },
  });
  
  const getSubmissionStatus = (requirementId: string) => {
    return studentSubmissions.find((sub) => sub.requirement_id === requirementId);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Submit Required Documents</h2>
      
      <div className="space-y-4">
        {requirements.map((requirement) => {
          const submission = getSubmissionStatus(requirement.id);
          
          return (
            <div
              key={requirement.id}
              className="p-6 border border-gray-200 rounded-lg"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">
                    {requirement.requirement_name}
                  </h3>
                  {requirement.is_mandatory && (
                    <span className="text-red-600 text-sm font-medium">Required</span>
                  )}
                </div>
                
                {submission?.submission_status === 'approved' && (
                  <CheckCircle size={24} className="text-green-600" />
                )}
                {submission?.submission_status === 'rejected' && (
                  <AlertCircle size={24} className="text-red-600" />
                )}
              </div>
              
              <p className="text-gray-600 mb-4">{requirement.description}</p>
              
              {submission?.submission_status === 'approved' ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                  ✓ Submitted and approved
                </div>
              ) : submission?.submission_status === 'rejected' ? (
                <div className="space-y-2">
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    ✗ {submission.verification_notes || 'Please resubmit'}
                  </div>
                  <label className="flex items-center gap-2 p-3 border border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                    <Upload size={20} />
                    <span>Upload file</span>
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setSubmissions({
                            ...submissions,
                            [requirement.id]: e.target.files[0],
                          });
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {submissions[requirement.id] && (
                    <Button
                      onClick={() =>
                        submitRequirement({
                          requirementId: requirement.id,
                          file: submissions[requirement.id]!,
                        })
                      }
                      isLoading={isPending}
                      disabled={isPending}
                      className="w-full"
                    >
                      Resubmit
                    </Button>
                  )}
                </div>
              ) : submission?.submission_status === 'pending' ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
                  ⏳ Waiting for verification
                </div>
              ) : (
                <label className="flex items-center gap-2 p-3 border border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                  <Upload size={20} />
                  <span>Upload file</span>
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setSubmissions({
                          ...submissions,
                          [requirement.id]: e.target.files[0],
                        });
                      }
                    }}
                    className="hidden"
                  />
                </label>
              )}
              
              {submissions[requirement.id] && !submission?.submission_status && (
                <Button
                  onClick={() =>
                    submitRequirement({
                      requirementId: requirement.id,
                      file: submissions[requirement.id]!,
                    })
                  }
                  isLoading={isPending}
                  disabled={isPending}
                  className="w-full mt-3"
                >
                  Submit Document
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

---

## Enrollment Service

```typescript
// src/services/student/enrollment.service.ts
import { supabase } from '@/services/api/client';

export const enrollmentService = {
  async getAvailableBatches(orgId: string) {
    const { data, error } = await supabase
      .from('course_batches')
      .select(`
        id,
        batch_name,
        batch_code,
        start_date,
        end_date,
        max_students,
        current_students,
        courses(
          id,
          name,
          code
        )
      `)
      .eq('org_id', orgId)
      .eq('status', 'active');
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async applyForCourse(studentId: string, batchId: string, orgId: string) {
    const { data, error } = await supabase
      .from('enrollment_applications')
      .insert({
        student_id: studentId,
        batch_id: batchId,
        org_id: orgId,
        status: 'applied',
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async getEnrollmentRequirements(applicationId: string) {
    // Get batch from application
    const { data: app } = await supabase
      .from('enrollment_applications')
      .select('batch_id')
      .eq('id', applicationId)
      .single();
    
    if (!app) return [];
    
    const { data, error } = await supabase
      .from('enrollment_requirements')
      .select('*')
      .eq('batch_id', app.batch_id)
      .order('order_priority');
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async submitRequirement(
    applicationId: string,
    requirementId: string,
    file: File
  ) {
    // Get application
    const { data: app } = await supabase
      .from('enrollment_applications')
      .select('student_id')
      .eq('id', applicationId)
      .single();
    
    if (!app) throw new Error('Application not found');
    
    // Upload file
    const filePath = `requirements/${applicationId}/${requirementId}_${Date.now()}`;
    const { error: uploadError } = await supabase.storage
      .from('enrollment-requirements')
      .upload(filePath, file);
    
    if (uploadError) throw new Error(uploadError.message);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('enrollment-requirements')
      .getPublicUrl(filePath);
    
    // Create submission
    const { data, error } = await supabase
      .from('student_requirement_submissions')
      .insert({
        student_id: app.student_id,
        requirement_id: requirementId,
        file_url: urlData.publicUrl,
        submission_status: 'pending',
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async getStudentSubmissions(applicationId: string) {
    // Get batch from application
    const { data: app } = await supabase
      .from('enrollment_applications')
      .select('batch_id, student_id')
      .eq('id', applicationId)
      .single();
    
    if (!app) return [];
    
    // Get requirements
    const { data: requirements } = await supabase
      .from('enrollment_requirements')
      .select('id')
      .eq('batch_id', app.batch_id);
    
    if (!requirements) return [];
    
    // Get submissions
    const { data, error } = await supabase
      .from('student_requirement_submissions')
      .select('*')
      .eq('student_id', app.student_id)
      .in('requirement_id', requirements.map((r) => r.id));
    
    if (error) throw new Error(error.message);
    return data;
  },
};
```

---

## Next Steps

1. ✅ Create enrollment application schema
2. ✅ Implement course selection component
3. ✅ Build requirement submission UI
4. ✅ Create enrollment service
5. ✅ Proceed to `24_ATTENDANCE_SYSTEM.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Enrollment Workflow Complete  
**Next Phase:** 24_ATTENDANCE_SYSTEM.md
