# Assessment & Evaluation System

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

Assessment & Evaluation System manages exams, quizzes, question banks, answer sheets, and evaluation workflows.

---

## Database Schema

### Assessment Tables

```sql
-- Question Banks
CREATE TABLE question_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL,
  
  bank_name VARCHAR(255),
  description TEXT,
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_subject FOREIGN KEY (subject_id) 
    REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Questions
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id UUID NOT NULL,
  
  question_text TEXT,
  question_type VARCHAR(50),                        -- 'mcq', 'true_false', 'short_answer', 'essay'
  
  difficulty_level VARCHAR(50),                     -- 'easy', 'medium', 'hard'
  bloom_level VARCHAR(50),                          -- 'knowledge', 'comprehension', 'application', 'analysis', 'synthesis', 'evaluation'
  
  correct_answer TEXT,
  explanation TEXT,
  
  marks DECIMAL(5, 2),
  negative_marks DECIMAL(5, 2) DEFAULT 0,
  
  options JSONB,                                    -- For MCQ type
  tags JSONB,                                       -- Array of tags for filtering
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_bank FOREIGN KEY (bank_id) 
    REFERENCES question_banks(id) ON DELETE CASCADE
);

-- Assessments/Exams
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  
  assessment_name VARCHAR(255),
  assessment_type VARCHAR(50),                      -- 'quiz', 'midterm', 'final_exam', 'diagnostic'
  
  description TEXT,
  
  scheduled_date TIMESTAMP,
  start_time TIME,
  end_time TIME,
  duration_minutes INTEGER,
  
  total_marks DECIMAL(10, 2),
  passing_marks DECIMAL(10, 2),
  
  assessment_status VARCHAR(50) DEFAULT 'draft',   -- 'draft', 'published', 'ongoing', 'completed'
  
  instructions TEXT,
  
  is_negative_marking BOOLEAN DEFAULT false,
  allow_review BOOLEAN DEFAULT true,
  show_answers BOOLEAN DEFAULT false,
  randomize_questions BOOLEAN DEFAULT false,
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE,
  CONSTRAINT fk_subject FOREIGN KEY (subject_id) 
    REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Assessment Questions
CREATE TABLE assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL,
  question_id UUID NOT NULL,
  
  question_sequence INTEGER,
  marks_for_question DECIMAL(5, 2),
  
  CONSTRAINT fk_assessment FOREIGN KEY (assessment_id) 
    REFERENCES assessments(id) ON DELETE CASCADE,
  CONSTRAINT fk_question FOREIGN KEY (question_id) 
    REFERENCES questions(id) ON DELETE CASCADE
);

-- Student Answers
CREATE TABLE student_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL,
  question_id UUID NOT NULL,
  student_id UUID NOT NULL,
  
  student_answer TEXT,
  is_answered BOOLEAN DEFAULT false,
  
  marked_for_review BOOLEAN DEFAULT false,
  
  answer_time TIMESTAMP,
  
  CONSTRAINT fk_assessment FOREIGN KEY (assessment_id) 
    REFERENCES assessments(id) ON DELETE CASCADE,
  CONSTRAINT fk_question FOREIGN KEY (question_id) 
    REFERENCES questions(id) ON DELETE CASCADE,
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

-- Assessment Results
CREATE TABLE assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL,
  student_id UUID NOT NULL,
  
  start_time TIMESTAMP,
  submission_time TIMESTAMP,
  
  total_questions INTEGER,
  answered_questions INTEGER,
  skipped_questions INTEGER,
  
  obtained_marks DECIMAL(10, 2),
  percentage DECIMAL(5, 2),
  
  status VARCHAR(50),                               -- 'completed', 'incomplete'
  
  CONSTRAINT fk_assessment FOREIGN KEY (assessment_id) 
    REFERENCES assessments(id) ON DELETE CASCADE,
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_questions_bank ON questions(bank_id);
CREATE INDEX idx_assessment_questions ON assessment_questions(assessment_id);
CREATE INDEX idx_student_answers ON student_answers(student_id);
CREATE INDEX idx_results_assessment ON assessment_results(assessment_id);
CREATE INDEX idx_results_student ON assessment_results(student_id);
```

---

## Assessment Components

### 1. Question Bank Manager

```typescript
// src/components/teacher/Assessment/QuestionBankManager.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { assessmentService } from '@/services/academic/assessment.service';
import { DataTable } from '@/components/common/tables/DataTable';
import { Button } from '@/components/common/buttons/Button';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

interface QuestionBankManagerProps {
  subjectId: string;
}

export const QuestionBankManager: React.FC<QuestionBankManagerProps> = ({
  subjectId,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  
  const { data: questions = [] } = useQuery({
    queryKey: ['question-bank', subjectId],
    queryFn: () => assessmentService.getQuestionsForBank(subjectId),
  });
  
  const { mutate: deleteQuestion } = useMutation({
    mutationFn: (questionId: string) =>
      assessmentService.deleteQuestion(questionId),
  });
  
  const filteredQuestions = questions.filter((q) => {
    if (search && !q.question_text.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filterType && q.question_type !== filterType) {
      return false;
    }
    return true;
  });
  
  const columns = [
    {
      key: 'question_text',
      label: 'Question',
      render: (question: any) => (
        <div>
          <p className="font-medium line-clamp-2">{question.question_text}</p>
          <p className="text-xs text-gray-600 mt-1">
            Type: {question.question_type} • Marks: {question.marks}
          </p>
        </div>
      ),
    },
    {
      key: 'difficulty_level',
      label: 'Difficulty',
      render: (question: any) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            question.difficulty_level === 'easy'
              ? 'bg-green-100 text-green-800'
              : question.difficulty_level === 'medium'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}
        >
          {question.difficulty_level}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (question: any) => (
        <div className="flex gap-2">
          <button
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => deleteQuestion(question.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        
        <select
          value={filterType || ''}
          onChange={(e) => setFilterType(e.target.value || null)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Types</option>
          <option value="mcq">MCQ</option>
          <option value="true_false">True/False</option>
          <option value="short_answer">Short Answer</option>
          <option value="essay">Essay</option>
        </select>
        
        <Button className="gap-2">
          <Plus size={16} />
          Add Question
        </Button>
      </div>
      
      <DataTable columns={columns} data={filteredQuestions} />
    </div>
  );
};
```

### 2. Assessment Creation & Execution

```typescript
// src/components/teacher/Assessment/AssessmentBuilder.tsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { assessmentService } from '@/services/academic/assessment.service';
import { Button } from '@/components/common/buttons/Button';
import { FormInput } from '@/components/common/forms/FormInput';
import { Card } from '@/components/common/cards/Card';
import { ChevronDown, Plus, X } from 'lucide-react';

interface AssessmentBuilderProps {
  batchId: string;
  subjectId: string;
  onSuccess: () => void;
}

export const AssessmentBuilder: React.FC<AssessmentBuilderProps> = ({
  batchId,
  subjectId,
  onSuccess,
}) => {
  const [assessmentName, setAssessmentName] = useState('');
  const [assessmentType, setAssessmentType] = useState('quiz');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [duration, setDuration] = useState(30);
  
  const { mutate: createAssessment, isPending } = useMutation({
    mutationFn: () =>
      assessmentService.createAssessment({
        batch_id: batchId,
        subject_id: subjectId,
        assessment_name: assessmentName,
        assessment_type: assessmentType,
        question_ids: selectedQuestions,
        duration_minutes: duration,
      }),
    onSuccess: () => {
      onSuccess();
    },
  });
  
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-bold mb-4">Create Assessment</h2>
        
        <div className="space-y-4">
          <FormInput
            label="Assessment Name"
            value={assessmentName}
            onChange={(e) => setAssessmentName(e.target.value)}
          />
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Assessment Type
            </label>
            <select
              value={assessmentType}
              onChange={(e) => setAssessmentType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="quiz">Quiz</option>
              <option value="midterm">Midterm</option>
              <option value="final_exam">Final Exam</option>
              <option value="diagnostic">Diagnostic Test</option>
            </select>
          </div>
          
          <FormInput
            label="Duration (minutes)"
            type="number"
            value={duration.toString()}
            onChange={(e) => setDuration(parseInt(e.target.value))}
          />
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Selected Questions ({selectedQuestions.length})
            </label>
            <Button className="gap-2">
              <Plus size={16} />
              Add Questions from Bank
            </Button>
          </div>
        </div>
      </Card>
      
      <Button
        onClick={() => createAssessment()}
        isLoading={isPending}
        disabled={isPending || selectedQuestions.length === 0}
        className="w-full"
      >
        Create Assessment
      </Button>
    </div>
  );
};
```

### 3. Student Assessment Interface

```typescript
// src/components/student/Assessment/AssessmentInterface.tsx
import React, { useState, useEffect } from 'react';
import { assessmentService } from '@/services/academic/assessment.service';
import { Card } from '@/components/common/cards/Card';
import { Button } from '@/components/common/buttons/Button';
import { Clock, Flag } from 'lucide-react';

interface AssessmentInterfaceProps {
  assessmentId: string;
  studentId: string;
}

export const AssessmentInterface: React.FC<AssessmentInterfaceProps> = ({
  assessmentId,
  studentId,
}) => {
  const [assessment, setAssessment] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  
  useEffect(() => {
    // Load assessment
    assessmentService.getAssessmentForStudent(assessmentId).then(setAssessment);
    
    // Set timer
    if (assessment) {
      setTimeRemaining(assessment.duration_minutes * 60);
    }
  }, [assessmentId]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const question = assessment?.questions[currentQuestion];
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleSubmit = async () => {
    await assessmentService.submitAssessment(assessmentId, studentId, answers);
  };
  
  if (!assessment) {
    return <div>Loading assessment...</div>;
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Main Assessment Area */}
      <div className="lg:col-span-3 space-y-4">
        {/* Timer and Info */}
        <Card className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold">{assessment.assessment_name}</h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {assessment.questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Time Remaining</p>
              <p className="text-2xl font-bold text-red-600">
                {formatTime(timeRemaining)}
              </p>
            </div>
          </div>
        </Card>
        
        {/* Question */}
        <Card>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{question?.question_text}</h2>
            
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm font-medium text-gray-600">Marks: {question?.marks}</p>
            </div>
            
            {/* Render question based on type */}
            {question?.question_type === 'mcq' && (
              <div className="space-y-3">
                {question.options.map((option: any, i: number) => (
                  <label key={i} className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={(e) =>
                        setAnswers({
                          ...answers,
                          [question.id]: e.target.value,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="ml-3">{option}</span>
                  </label>
                ))}
              </div>
            )}
            
            {(question?.question_type === 'essay' ||
              question?.question_type === 'short_answer') && (
              <textarea
                value={answers[question?.id] || ''}
                onChange={(e) =>
                  setAnswers({
                    ...answers,
                    [question.id]: e.target.value,
                  })
                }
                placeholder="Enter your answer..."
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={6}
              />
            )}
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() =>
                setMarkedForReview(
                  markedForReview.has(currentQuestion)
                    ? new Set(
                        [...markedForReview].filter((q) => q !== currentQuestion)
                      )
                    : new Set([...markedForReview, currentQuestion])
                )
              }
              variant="secondary"
              className="gap-2"
            >
              <Flag size={16} />
              {markedForReview.has(currentQuestion) ? 'Unmark' : 'Mark'} for Review
            </Button>
          </div>
        </Card>
      </div>
      
      {/* Question Navigator */}
      <div className="lg:col-span-1">
        <Card>
          <h3 className="font-semibold mb-4">Questions</h3>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {assessment.questions.map((q: any, i: number) => (
              <button
                key={i}
                onClick={() => setCurrentQuestion(i)}
                className={`p-2 rounded text-sm font-medium transition-colors ${
                  i === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : answers[q.id]
                      ? 'bg-green-100 text-green-800'
                      : markedForReview.has(i)
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 rounded" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-100 rounded" />
              <span>Marked for Review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 rounded" />
              <span>Not Answered</span>
            </div>
          </div>
          
          <Button
            onClick={handleSubmit}
            className="w-full mt-4"
          >
            Submit Assessment
          </Button>
        </Card>
      </div>
    </div>
  );
};
```

---

## Assessment Service

```typescript
// src/services/academic/assessment.service.ts
import { supabase } from '@/services/api/client';

export const assessmentService = {
  async getQuestionsForBank(subjectId: string) {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        question_banks(subject_id)
      `)
      .eq('question_banks.subject_id', subjectId);
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async deleteQuestion(questionId: string) {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId);
    
    if (error) throw new Error(error.message);
  },
  
  async createAssessment(data: any) {
    // Create assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        batch_id: data.batch_id,
        subject_id: data.subject_id,
        assessment_name: data.assessment_name,
        assessment_type: data.assessment_type,
        duration_minutes: data.duration_minutes,
      })
      .select()
      .single();
    
    if (assessmentError) throw new Error(assessmentError.message);
    
    // Add questions to assessment
    const questionMappings = data.question_ids.map((qid: string, idx: number) => ({
      assessment_id: assessment.id,
      question_id: qid,
      question_sequence: idx + 1,
    }));
    
    const { error: mappingError } = await supabase
      .from('assessment_questions')
      .insert(questionMappings);
    
    if (mappingError) throw new Error(mappingError.message);
    
    return assessment;
  },
  
  async getAssessmentForStudent(assessmentId: string) {
    const { data, error } = await supabase
      .from('assessments')
      .select(`
        *,
        assessment_questions(
          question_id,
          questions(*)
        )
      `)
      .eq('id', assessmentId)
      .single();
    
    if (error) throw new Error(error.message);
    
    return {
      ...data,
      questions: data.assessment_questions.map((aq: any) => aq.questions),
    };
  },
  
  async submitAssessment(assessmentId: string, studentId: string, answers: Record<string, string>) {
    // Save answers
    const answerRecords = Object.entries(answers).map(([questionId, answer]) => ({
      assessment_id: assessmentId,
      question_id: questionId,
      student_id: studentId,
      student_answer: answer,
      is_answered: true,
      answer_time: new Date().toISOString(),
    }));
    
    const { error: answerError } = await supabase
      .from('student_answers')
      .upsert(answerRecords, {
        onConflict: 'assessment_id,question_id,student_id',
      });
    
    if (answerError) throw new Error(answerError.message);
    
    // Create result record
    const { data, error } = await supabase
      .from('assessment_results')
      .insert({
        assessment_id: assessmentId,
        student_id: studentId,
        submission_time: new Date().toISOString(),
        status: 'completed',
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

1. ✅ Create assessment schema
2. ✅ Implement question bank manager
3. ✅ Build assessment interface
4. ✅ Create assessment service
5. ✅ Proceed to `28_RESULTS_GRADING.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Assessment & Evaluation Complete  
**Next Phase:** 28_RESULTS_GRADING.md
