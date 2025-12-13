# Results Management

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

Results Management provides comprehensive exam creation, marks entry, result calculation, report card generation, and result publishing workflows.

---

## Database Schema

### Results Tables

```sql
-- Exam Templates
CREATE TABLE exam_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  
  template_name VARCHAR(255),
  template_description TEXT,
  
  exam_type VARCHAR(50),                            -- 'unit_test', 'midterm', 'final', 'practical'
  
  default_total_marks DECIMAL(10, 2),
  default_passing_marks DECIMAL(10, 2),
  
  marking_scheme JSONB,                             -- Question-wise marks distribution
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Exams
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  batch_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  template_id UUID,
  
  exam_name VARCHAR(255),
  exam_type VARCHAR(50),
  
  exam_date DATE,
  exam_duration_minutes INTEGER,
  
  total_marks DECIMAL(10, 2),
  passing_marks DECIMAL(10, 2),
  
  weightage_percent DECIMAL(5, 2),                  -- Contribution to final grade
  
  exam_status VARCHAR(50) DEFAULT 'scheduled',      -- 'scheduled', 'ongoing', 'completed', 'results_published'
  
  is_final_exam BOOLEAN DEFAULT false,
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE,
  CONSTRAINT fk_subject FOREIGN KEY (subject_id) 
    REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT fk_template FOREIGN KEY (template_id) 
    REFERENCES exam_templates(id) ON DELETE SET NULL,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Exam Marks (Individual student marks)
CREATE TABLE exam_marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL,
  student_id UUID NOT NULL,
  
  marks_obtained DECIMAL(10, 2),
  
  is_absent BOOLEAN DEFAULT false,
  
  remarks TEXT,
  
  entered_by UUID,
  entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  verified_by UUID,
  verified_at TIMESTAMP,
  
  CONSTRAINT fk_exam FOREIGN KEY (exam_id) 
    REFERENCES exams(id) ON DELETE CASCADE,
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_entered_by FOREIGN KEY (entered_by) 
    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_verified_by FOREIGN KEY (verified_by) 
    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT unique_exam_student UNIQUE (exam_id, student_id)
);

-- Consolidated Results (Subject-wise)
CREATE TABLE subject_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  batch_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  
  internal_marks DECIMAL(10, 2),                    -- Assignments + continuous evaluation
  external_marks DECIMAL(10, 2),                    -- Exam marks
  
  total_marks DECIMAL(10, 2),
  total_marks_possible DECIMAL(10, 2),
  
  percentage DECIMAL(5, 2),
  grade VARCHAR(2),                                 -- A+, A, B+, B, C, D, F
  grade_points DECIMAL(3, 2),
  
  status VARCHAR(50),                               -- 'pass', 'fail', 'pending'
  
  result_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE,
  CONSTRAINT fk_subject FOREIGN KEY (subject_id) 
    REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT unique_student_subject UNIQUE (student_id, batch_id, subject_id)
);

-- Final Results (Overall batch results)
CREATE TABLE final_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  batch_id UUID NOT NULL,
  
  total_subjects INTEGER,
  passed_subjects INTEGER,
  failed_subjects INTEGER,
  
  total_marks_obtained DECIMAL(10, 2),
  total_marks_possible DECIMAL(10, 2),
  
  overall_percentage DECIMAL(5, 2),
  cgpa DECIMAL(3, 2),
  
  overall_grade VARCHAR(2),
  overall_status VARCHAR(50),                       -- 'pass', 'fail', 'promoted', 'detained'
  
  rank_in_batch INTEGER,
  
  result_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE,
  CONSTRAINT unique_student_batch UNIQUE (student_id, batch_id)
);

-- Report Cards
CREATE TABLE report_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  batch_id UUID NOT NULL,
  
  academic_year VARCHAR(10),
  term VARCHAR(50),
  
  report_data JSONB,                                -- Complete report card data
  
  teacher_remarks TEXT,
  principal_remarks TEXT,
  
  pdf_url TEXT,
  
  is_issued BOOLEAN DEFAULT false,
  issued_at TIMESTAMP,
  
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE
);

-- Grade Scales (Organization-specific)
CREATE TABLE grade_scales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  
  scale_name VARCHAR(255),
  
  grade_mapping JSONB,                              -- {A+: {min: 90, max: 100, points: 4.0}, ...}
  
  is_default BOOLEAN DEFAULT false,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_exams_batch ON exams(batch_id);
CREATE INDEX idx_exams_subject ON exams(subject_id);
CREATE INDEX idx_exam_marks_exam ON exam_marks(exam_id);
CREATE INDEX idx_exam_marks_student ON exam_marks(student_id);
CREATE INDEX idx_subject_results_student ON subject_results(student_id);
CREATE INDEX idx_subject_results_batch ON subject_results(batch_id);
CREATE INDEX idx_final_results_student ON final_results(student_id);
CREATE INDEX idx_final_results_batch ON final_results(batch_id);
CREATE INDEX idx_report_cards_student ON report_cards(student_id);
```

---

## Results Components

### 1. Marks Entry Interface

```typescript
// src/components/teacher/Results/MarksEntryInterface.tsx
import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { resultService } from '@/services/academic/result.service';
import { DataTable } from '@/components/common/tables/DataTable';
import { Button } from '@/components/common/buttons/Button';
import { Save, Check, X } from 'lucide-react';

interface MarksEntryInterfaceProps {
  examId: string;
}

export const MarksEntryInterface: React.FC<MarksEntryInterfaceProps> = ({
  examId,
}) => {
  const [marks, setMarks] = useState<Record<string, number | null>>({});
  const [absentStudents, setAbsentStudents] = useState<Set<string>>(new Set());
  
  const { data: exam } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => resultService.getExamDetails(examId),
  });
  
  const { data: students = [] } = useQuery({
    queryKey: ['exam-students', examId],
    queryFn: () => resultService.getExamStudents(examId),
    enabled: !!exam,
  });
  
  const { mutate: saveMarks, isPending } = useMutation({
    mutationFn: () => resultService.saveExamMarks(examId, marks, Array.from(absentStudents)),
  });
  
  const handleMarksChange = (studentId: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setMarks({ ...marks, [studentId]: numValue });
  };
  
  const toggleAbsent = (studentId: string) => {
    const newAbsent = new Set(absentStudents);
    if (newAbsent.has(studentId)) {
      newAbsent.delete(studentId);
    } else {
      newAbsent.add(studentId);
      setMarks({ ...marks, [studentId]: null });
    }
    setAbsentStudents(newAbsent);
  };
  
  const columns = [
    {
      key: 'roll_number',
      label: 'Roll No.',
      render: (student: any) => (
        <span className="font-mono">{student.roll_number || '-'}</span>
      ),
    },
    {
      key: 'student_name',
      label: 'Student Name',
      render: (student: any) => (
        <div>
          <p className="font-medium">{student.full_name}</p>
          <p className="text-sm text-gray-600">{student.email}</p>
        </div>
      ),
    },
    {
      key: 'marks',
      label: 'Marks',
      render: (student: any) => (
        <input
          type="number"
          value={marks[student.id] ?? student.existing_marks ?? ''}
          onChange={(e) => handleMarksChange(student.id, e.target.value)}
          disabled={absentStudents.has(student.id)}
          min={0}
          max={exam?.total_marks}
          step={0.5}
          className="w-24 p-2 border border-gray-300 rounded disabled:bg-gray-100"
          placeholder="0"
        />
      ),
    },
    {
      key: 'absent',
      label: 'Absent',
      render: (student: any) => (
        <button
          onClick={() => toggleAbsent(student.id)}
          className={`p-2 rounded transition-colors ${
            absentStudents.has(student.id)
              ? 'bg-red-100 text-red-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {absentStudents.has(student.id) ? <X size={16} /> : <Check size={16} />}
        </button>
      ),
    },
    {
      key: 'percentage',
      label: 'Percentage',
      render: (student: any) => {
        const mark = marks[student.id] ?? student.existing_marks;
        if (mark === null || mark === undefined) return '-';
        const percent = ((mark / exam.total_marks) * 100).toFixed(2);
        return <span className="font-medium">{percent}%</span>;
      },
    },
  ];
  
  if (!exam) {
    return <div>Loading exam details...</div>;
  }
  
  const enteredCount = Object.values(marks).filter((m) => m !== null).length;
  const totalCount = students.length;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{exam.exam_name}</h1>
          <p className="text-gray-600">
            {exam.subject_name} • Total Marks: {exam.total_marks}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Marks Entered</p>
          <p className="text-2xl font-bold text-blue-600">
            {enteredCount}/{totalCount}
          </p>
        </div>
      </div>
      
      <DataTable columns={columns} data={students} />
      
      <div className="flex gap-3">
        <Button
          onClick={() => saveMarks()}
          isLoading={isPending}
          disabled={isPending}
          className="flex-1"
        >
          <Save size={16} className="mr-2" />
          Save All Marks
        </Button>
      </div>
    </div>
  );
};
```

### 2. Result Card View

```typescript
// src/components/student/Results/ResultCardView.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/store/user.store';
import { resultService } from '@/services/academic/result.service';
import { Card } from '@/components/common/cards/Card';
import { Button } from '@/components/common/buttons/Button';
import { Download, TrendingUp, Award } from 'lucide-react';

export const ResultCardView: React.FC = () => {
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
  
  const handleDownloadReportCard = () => {
    resultService.downloadReportCard(user!.id);
  };
  
  if (!finalResult) {
    return (
      <Card>
        <p className="text-center text-gray-600 py-8">
          Results not yet published
        </p>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Overall Result */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Academic Results</h1>
          <Button onClick={handleDownloadReportCard} className="gap-2">
            <Download size={16} />
            Download Report Card
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Overall CGPA</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {finalResult.cgpa}
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Percentage</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {finalResult.overall_percentage}%
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Grade</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {finalResult.overall_grade}
            </p>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600">Batch Rank</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              #{finalResult.rank_in_batch}
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">Result Status</p>
            <p className="text-sm text-gray-600 mt-1">
              Passed {finalResult.passed_subjects} out of {finalResult.total_subjects} subjects
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-lg font-bold text-white ${
              finalResult.overall_status === 'pass'
                ? 'bg-green-600'
                : finalResult.overall_status === 'promoted'
                  ? 'bg-blue-600'
                  : 'bg-red-600'
            }`}
          >
            {finalResult.overall_status.toUpperCase()}
          </span>
        </div>
      </Card>
      
      {/* Subject-wise Results */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Subject-wise Performance</h2>
        
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
                
                <div className="text-right">
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
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Internal</p>
                  <p className="font-semibold">{result.internal_marks}</p>
                </div>
                <div>
                  <p className="text-gray-600">External</p>
                  <p className="font-semibold">{result.external_marks}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total</p>
                  <p className="font-semibold">
                    {result.total_marks}/{result.total_marks_possible}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Percentage</p>
                  <p className="font-semibold">{result.percentage}%</p>
                </div>
              </div>
            </div>
          ))}
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
  async getExamDetails(examId: string) {
    const { data, error } = await supabase
      .from('exams')
      .select(`
        *,
        subjects(name, code)
      `)
      .eq('id', examId)
      .single();
    
    if (error) throw new Error(error.message);
    
    return {
      ...data,
      subject_name: data.subjects.name,
      subject_code: data.subjects.code,
    };
  },
  
  async getExamStudents(examId: string) {
    const { data: exam } = await supabase
      .from('exams')
      .select('batch_id')
      .eq('id', examId)
      .single();
    
    if (!exam) return [];
    
    const { data, error } = await supabase
      .from('batch_enrollments')
      .select(`
        student_id,
        users:student_id(
          full_name,
          email,
          student_profiles(roll_number)
        )
      `)
      .eq('batch_id', exam.batch_id)
      .eq('status', 'active');
    
    if (error) throw new Error(error.message);
    
    // Get existing marks
    const { data: existingMarks } = await supabase
      .from('exam_marks')
      .select('student_id, marks_obtained')
      .eq('exam_id', examId);
    
    const marksMap = new Map(existingMarks?.map((m) => [m.student_id, m.marks_obtained]));
    
    return data?.map((enrollment) => ({
      id: enrollment.student_id,
      full_name: enrollment.users.full_name,
      email: enrollment.users.email,
      roll_number: enrollment.users.student_profiles?.[0]?.roll_number,
      existing_marks: marksMap.get(enrollment.student_id),
    })) || [];
  },
  
  async saveExamMarks(
    examId: string,
    marks: Record<string, number | null>,
    absentStudents: string[]
  ) {
    const marksToSave = Object.entries(marks)
      .filter(([_, mark]) => mark !== null)
      .map(([studentId, mark]) => ({
        exam_id: examId,
        student_id: studentId,
        marks_obtained: mark,
        is_absent: absentStudents.includes(studentId),
      }));
    
    const { error } = await supabase
      .from('exam_marks')
      .upsert(marksToSave, {
        onConflict: 'exam_id,student_id',
      });
    
    if (error) throw new Error(error.message);
  },
  
  async getFinalResult(studentId: string) {
    const { data, error } = await supabase
      .from('final_results')
      .select('*')
      .eq('student_id', studentId)
      .eq('result_published', true)
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
      .eq('result_published', true);
    
    if (error) throw new Error(error.message);
    
    return data?.map((result) => ({
      ...result,
      subject_name: result.subjects.name,
      subject_code: result.subjects.code,
    })) || [];
  },
  
  async downloadReportCard(studentId: string) {
    const { data, error } = await supabase
      .from('report_cards')
      .select('pdf_url')
      .eq('student_id', studentId)
      .order('issued_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) throw new Error(error.message);
    
    if (data?.pdf_url) {
      window.open(data.pdf_url, '_blank');
    }
  },
  
  async calculateAndPublishResults(batchId: string) {
    // Complex calculation logic for final results
    // This would typically be a server-side function
    
    const { error } = await supabase.rpc('calculate_batch_results', {
      batch_id: batchId,
    });
    
    if (error) throw new Error(error.message);
  },
};
```

---

## Next Steps

1. ✅ Create results schema
2. ✅ Implement marks entry interface
3. ✅ Build result card view
4. ✅ Create result service
5. ✅ Phase 7 Complete

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Results Management Complete  
**Phase 7 Complete:** All 4 files created  
**Total Progress:** 33 of 75 files (44%)

---

## Phase Summary

**Phases Completed:**
- ✅ Phase 1: Foundation (5 files)
- ✅ Phase 2: Core Infrastructure (6 files)
- ✅ Phase 3: Dashboard & Users (4 files)
- ✅ Phase 4: Academic Foundation (5 files)
- ✅ Phase 5: Student Management (5 files)
- ✅ Phase 6: Academic Operations (4 files)
- ✅ Phase 7: Assignments & Results (4 files)

**Total: 33 of 75 files created (44%)**
