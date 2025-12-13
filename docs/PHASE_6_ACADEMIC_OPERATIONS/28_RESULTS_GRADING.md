# Results & Grading Management

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

Results & Grading Management handles result processing, grade calculations, grading rubrics, and result publication workflows.

---

## Database Schema

### Results & Grading Tables

```sql
-- Grading Configurations
CREATE TABLE grading_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL,
  
  grading_scale VARCHAR(50),                        -- 'percentage', 'gpa', 'letter_grade'
  
  grade_breakpoints JSONB,                          -- e.g., {A: 90, B: 80, C: 70, D: 60, F: 0}
  gpa_scale DECIMAL(3, 2) DEFAULT 4.0,
  
  pass_percentage DECIMAL(5, 2),
  
  include_internal BOOLEAN DEFAULT true,
  internal_weightage DECIMAL(5, 2),                 -- e.g., 30% internal, 70% final
  
  consider_attendance BOOLEAN DEFAULT false,
  attendance_impact JSONB,                          -- e.g., {80: 0, 75: -1, 70: -2}
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE
);

-- Subject Results
CREATE TABLE subject_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  batch_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  
  internal_assessment_marks DECIMAL(10, 2),
  external_exam_marks DECIMAL(10, 2),
  
  total_marks DECIMAL(10, 2),
  total_marks_possible DECIMAL(10, 2),
  
  percentage DECIMAL(5, 2),
  grade VARCHAR(2),                                 -- 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'
  gpa DECIMAL(3, 2),
  
  status VARCHAR(50),                               -- 'pass', 'fail', 'pending'
  
  result_published_on TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE,
  CONSTRAINT fk_subject FOREIGN KEY (subject_id) 
    REFERENCES subjects(id) ON DELETE CASCADE
);

-- Final Results/Transcripts
CREATE TABLE final_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  batch_id UUID NOT NULL,
  
  total_credits INTEGER,
  total_cgpa DECIMAL(3, 2),
  cumulative_percentage DECIMAL(5, 2),
  
  overall_status VARCHAR(50),                       -- 'pass', 'fail', 'merit', 'pass_with_condition'
  
  rank_in_batch INTEGER,
  
  result_published_on TIMESTAMP,
  
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE
);

-- Grade Appeal/Dispute
CREATE TABLE grade_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_result_id UUID NOT NULL,
  student_id UUID NOT NULL,
  
  appeal_reason TEXT,
  supporting_documents JSONB,
  
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending',             -- 'pending', 'under_review', 'approved', 'rejected'
  
  reviewer_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP,
  
  CONSTRAINT fk_subject_result FOREIGN KEY (subject_result_id) 
    REFERENCES subject_results(id) ON DELETE CASCADE,
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviewed_by FOREIGN KEY (reviewed_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Remedial Classes
CREATE TABLE remedial_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL,
  batch_id UUID NOT NULL,
  
  remedial_type VARCHAR(50),                        -- 'improvement', 'reassessment'
  
  eligibility_criteria JSONB,                       -- Conditions to be eligible
  
  scheduled_date DATE,
  duration_days INTEGER,
  
  status VARCHAR(50) DEFAULT 'planned',             -- 'planned', 'ongoing', 'completed'
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_subject FOREIGN KEY (subject_id) 
    REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Student Remedial Enrollment
CREATE TABLE student_remedial_enrollment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remedial_id UUID NOT NULL,
  student_id UUID NOT NULL,
  
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_completed BOOLEAN DEFAULT false,
  completion_date TIMESTAMP,
  
  CONSTRAINT fk_remedial FOREIGN KEY (remedial_id) 
    REFERENCES remedial_classes(id) ON DELETE CASCADE,
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

-- Result Statistics (Materialized View)
CREATE MATERIALIZED VIEW result_statistics AS
SELECT
  sr.batch_id,
  sr.subject_id,
  COUNT(DISTINCT sr.student_id) as total_students,
  COUNT(DISTINCT CASE WHEN sr.status = 'pass' THEN sr.student_id END) as passed_students,
  COUNT(DISTINCT CASE WHEN sr.status = 'fail' THEN sr.student_id END) as failed_students,
  ROUND(AVG(sr.percentage), 2) as average_percentage,
  MIN(sr.percentage) as minimum_percentage,
  MAX(sr.percentage) as maximum_percentage,
  ROUND(STDDEV(sr.percentage), 2) as std_deviation
FROM subject_results sr
GROUP BY sr.batch_id, sr.subject_id;

CREATE INDEX idx_subject_results_batch ON subject_results(batch_id);
CREATE INDEX idx_subject_results_student ON subject_results(student_id);
CREATE INDEX idx_subject_results_status ON subject_results(status);
CREATE INDEX idx_final_results_student ON final_results(student_id);
CREATE INDEX idx_grade_appeals_status ON grade_appeals(status);
```

---

## Results Components

### 1. Result Declaration Interface

```typescript
// src/components/admin/Results/ResultDeclaration.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { resultService } from '@/services/academic/result.service';
import { DataTable } from '@/components/common/tables/DataTable';
import { Button } from '@/components/common/buttons/Button';
import { Card } from '@/components/common/cards/Card';
import { Alert, AlertDescription } from '@/components/common/alerts/Alert';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ResultDeclarationProps {
  batchId: string;
}

export const ResultDeclaration: React.FC<ResultDeclarationProps> = ({
  batchId,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  
  const { data: subjects = [] } = useQuery({
    queryKey: ['batch-subjects', batchId],
    queryFn: () => resultService.getBatchSubjects(batchId),
  });
  
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['subject-results', selectedSubject],
    queryFn: () => resultService.getSubjectResults(selectedSubject!),
    enabled: !!selectedSubject,
  });
  
  const { mutate: publishResults, isPending: isPublishing } = useMutation({
    mutationFn: () => resultService.publishResults(selectedSubject!),
  });
  
  const publishedCount = results.filter((r) => r.result_published_on).length;
  const totalCount = results.length;
  const allPublished = publishedCount === totalCount && totalCount > 0;
  
  const columns = [
    {
      key: 'student_name',
      label: 'Student',
      render: (result: any) => (
        <div>
          <p className="font-medium">{result.student_name}</p>
          <p className="text-sm text-gray-600">{result.student_email}</p>
        </div>
      ),
    },
    {
      key: 'total_marks',
      label: 'Marks',
      render: (result: any) => (
        <div className="text-right">
          <p className="font-medium">{result.total_marks}</p>
          <p className="text-sm text-gray-600">{result.percentage}%</p>
        </div>
      ),
    },
    {
      key: 'grade',
      label: 'Grade',
      render: (result: any) => (
        <span
          className={`px-3 py-1 rounded font-bold text-white ${
            result.grade === 'A' || result.grade === 'A+'
              ? 'bg-green-600'
              : result.grade.startsWith('B')
                ? 'bg-blue-600'
                : result.grade.startsWith('C')
                  ? 'bg-yellow-600'
                  : 'bg-red-600'
          }`}
        >
          {result.grade}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (result: any) => (
        <span
          className={`px-2 py-1 rounded text-sm font-medium ${
            result.status === 'pass'
              ? 'bg-green-100 text-green-800'
              : result.status === 'fail'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {result.status}
        </span>
      ),
    },
    {
      key: 'published',
      label: 'Published',
      render: (result: any) => (
        <div className="flex items-center gap-2">
          {result.result_published_on ? (
            <>
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-sm">
                {new Date(result.result_published_on).toLocaleDateString()}
              </span>
            </>
          ) : (
            <>
              <Clock size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">Pending</span>
            </>
          )}
        </div>
      ),
    },
  ];
  
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-bold mb-4">Declare Results</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Subject
            </label>
            <select
              value={selectedSubject || ''}
              onChange={(e) => setSelectedSubject(e.target.value || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">-- Select Subject --</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </div>
          
          {selectedSubject && (
            <>
              <Alert variant={allPublished ? 'success' : 'info'}>
                <AlertDescription>
                  {publishedCount}/{totalCount} results published
                </AlertDescription>
              </Alert>
              
              <DataTable columns={columns} data={results} isLoading={isLoading} />
              
              <Button
                onClick={() => publishResults()}
                isLoading={isPublishing}
                disabled={isPublishing || allPublished}
                className="w-full"
              >
                {allPublished ? 'All Results Published' : 'Publish All Results'}
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
```

### 2. Student Result View

```typescript
// src/components/student/Results/ResultView.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/store/user.store';
import { resultService } from '@/services/academic/result.service';
import { Card } from '@/components/common/cards/Card';
import { ProgressBar } from '@/components/common/progress/ProgressBar';
import { TrendingUp, AlertCircle, Trophy } from 'lucide-react';

export const ResultView: React.FC = () => {
  const { user } = useUserStore();
  
  const { data: finalResult } = useQuery({
    queryKey: ['final-result', user?.id],
    queryFn: () => resultService.getFinalResult(user!.id),
    enabled: !!user,
  });
  
  const { data: subjectResults = [] } = useQuery({
    queryKey: ['subject-results', user?.id],
    queryFn: () => resultService.getStudentSubjectResults(user!.id),
    enabled: !!user,
  });
  
  const passedSubjects = subjectResults.filter((r) => r.status === 'pass').length;
  const failedSubjects = subjectResults.filter((r) => r.status === 'fail').length;
  
  return (
    <div className="space-y-6">
      {/* Overall Result */}
      {finalResult && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Overall CGPA</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {finalResult.total_cgpa}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Overall Percentage</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {finalResult.cumulative_percentage}%
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Batch Rank</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {finalResult.rank_in_batch}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p
                className={`text-xl font-bold mt-2 ${
                  finalResult.overall_status === 'pass'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {finalResult.overall_status.toUpperCase()}
              </p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Subject Results */}
      <Card>
        <h2 className="text-2xl font-bold mb-4">Subject Results</h2>
        
        <div className="space-y-4">
          {subjectResults.map((result) => (
            <div
              key={result.id}
              className={`p-4 rounded-lg border-2 ${
                result.status === 'pass'
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{result.subject_name}</h3>
                  <p className="text-sm text-gray-600">{result.subject_code}</p>
                </div>
                
                <span
                  className={`px-4 py-2 rounded font-bold text-white text-lg ${
                    result.grade === 'A' || result.grade === 'A+'
                      ? 'bg-green-600'
                      : result.grade.startsWith('B')
                        ? 'bg-blue-600'
                        : result.grade.startsWith('C')
                          ? 'bg-yellow-600'
                          : 'bg-red-600'
                  }`}
                >
                  {result.grade}
                </span>
              </div>
              
              <div className="space-y-2 mb-3">
                <ProgressBar value={result.percentage} />
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{result.percentage}%</span>
                  <span className="text-gray-600">
                    {result.total_marks}/{result.total_marks_possible}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-4 text-sm">
                <div>
                  <p className="text-gray-600">GPA</p>
                  <p className="font-semibold">{result.gpa}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p
                    className={`font-semibold ${
                      result.status === 'pass' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {result.status.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Summary */}
      <Card>
        <h3 className="font-semibold text-lg mb-4">Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">
              {subjectResults.length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Subjects</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{passedSubjects}</p>
            <p className="text-sm text-gray-600 mt-1">Passed</p>
          </div>
          {failedSubjects > 0 && (
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-3xl font-bold text-red-600">{failedSubjects}</p>
              <p className="text-sm text-gray-600 mt-1">Failed</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
```

---

## Result Service

```typescript
// src/services/academic/result.service.ts
import { supabase } from '@/services/api/client';

export const resultService = {
  async getBatchSubjects(batchId: string) {
    const { data, error } = await supabase
      .from('subjects')
      .select('id, name, code')
      .eq('batch_id', batchId);
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async getSubjectResults(subjectId: string) {
    const { data, error } = await supabase
      .from('subject_results')
      .select(`
        *,
        users:student_id(full_name, email)
      `)
      .eq('subject_id', subjectId)
      .order('percentage', { ascending: false });
    
    if (error) throw new Error(error.message);
    
    return data?.map((result) => ({
      ...result,
      student_name: result.users.full_name,
      student_email: result.users.email,
    })) || [];
  },
  
  async publishResults(subjectId: string) {
    const { error } = await supabase
      .from('subject_results')
      .update({ result_published_on: new Date().toISOString() })
      .eq('subject_id', subjectId)
      .is('result_published_on', null);
    
    if (error) throw new Error(error.message);
  },
  
  async getFinalResult(studentId: string) {
    const { data, error } = await supabase
      .from('final_results')
      .select('*')
      .eq('student_id', studentId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  },
  
  async getStudentSubjectResults(studentId: string) {
    const { data, error } = await supabase
      .from('subject_results')
      .select(`
        *,
        subjects(name, code)
      `)
      .eq('student_id', studentId)
      .order('updated_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    
    return data?.map((result) => ({
      ...result,
      subject_name: result.subjects.name,
      subject_code: result.subjects.code,
    })) || [];
  },
};
```

---

## Next Steps

1. ✅ Create results & grading schema
2. ✅ Implement result declaration interface
3. ✅ Build student result view
4. ✅ Create result service
5. ✅ Proceed to `29_REPORT_GENERATION.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Results & Grading Complete  
**Next Phase:** 29_REPORT_GENERATION.md
