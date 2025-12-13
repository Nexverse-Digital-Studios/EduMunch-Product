# Student Progression & Learning Path

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

Student Progression tracks learning progress, module completion, and learning paths through courses. This system enables adaptive learning pathways and progress tracking.

---

## Database Schema

### Student Progression Tables

```sql
-- Content Modules
CREATE TABLE content_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL,
  
  module_name VARCHAR(255),
  module_code VARCHAR(50),
  description TEXT,
  
  sequence_number INTEGER,
  
  estimated_hours DECIMAL(5, 2),
  difficulty_level VARCHAR(50),                     -- 'beginner', 'intermediate', 'advanced'
  
  is_mandatory BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_subject FOREIGN KEY (subject_id) 
    REFERENCES subjects(id) ON DELETE CASCADE
);

-- Learning Path Assignments
CREATE TABLE learning_path_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL,
  
  path_name VARCHAR(255),
  description TEXT,
  
  modules JSONB,                                     -- Array of module IDs and sequence
  prerequisites JSONB,                               -- Module dependencies
  
  is_linear BOOLEAN DEFAULT true,                   -- Linear vs adaptive path
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Student Module Progress
CREATE TABLE student_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  module_id UUID NOT NULL,
  batch_id UUID NOT NULL,
  
  start_date TIMESTAMP,
  completion_date TIMESTAMP,
  
  status VARCHAR(50) DEFAULT 'not_started',         -- 'not_started', 'in_progress', 'completed'
  completion_percentage DECIMAL(5, 2) DEFAULT 0,
  
  time_spent_hours DECIMAL(10, 2) DEFAULT 0,
  
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_module FOREIGN KEY (module_id) 
    REFERENCES content_modules(id) ON DELETE CASCADE,
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE
);

-- Content Item Progress (Videos, Documents, etc.)
CREATE TABLE student_content_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  content_id UUID NOT NULL,                         -- References topic_contents
  module_id UUID NOT NULL,
  
  viewed_at TIMESTAMP,
  completion_percentage DECIMAL(5, 2) DEFAULT 0,
  
  watch_duration_seconds INTEGER,
  total_duration_seconds INTEGER,
  
  last_position_seconds INTEGER,
  
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_module FOREIGN KEY (module_id) 
    REFERENCES content_modules(id) ON DELETE CASCADE
);

-- Learning Milestones
CREATE TABLE learning_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL,
  
  milestone_name VARCHAR(255),
  milestone_type VARCHAR(50),                       -- 'module_completion', 'quiz_score', 'assignment'
  
  target_date DATE,
  
  description TEXT,
  icon_url VARCHAR(500),
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Student Milestone Achievement
CREATE TABLE student_milestone_achievement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  milestone_id UUID NOT NULL,
  
  achieved_date TIMESTAMP,
  achievement_score DECIMAL(5, 2),
  
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_milestone FOREIGN KEY (milestone_id) 
    REFERENCES learning_milestones(id) ON DELETE CASCADE
);

-- Progress Analytics
CREATE MATERIALIZED VIEW student_progress_analytics AS
SELECT
  smp.student_id,
  smp.batch_id,
  COUNT(DISTINCT smp.module_id) as total_modules,
  COUNT(DISTINCT CASE WHEN smp.status = 'completed' THEN smp.module_id END) as completed_modules,
  COUNT(DISTINCT CASE WHEN smp.status = 'in_progress' THEN smp.module_id END) as in_progress_modules,
  ROUND(
    AVG(smp.completion_percentage),
    2
  ) as average_completion,
  ROUND(
    SUM(smp.time_spent_hours),
    2
  ) as total_hours_spent,
  ROUND(
    COUNT(DISTINCT CASE WHEN smp.status = 'completed' THEN smp.module_id END)::numeric / 
    NULLIF(COUNT(DISTINCT smp.module_id), 0) * 100,
    2
  ) as completion_percentage
FROM student_module_progress smp
GROUP BY smp.student_id, smp.batch_id;

CREATE INDEX idx_module_progress_student ON student_module_progress(student_id);
CREATE INDEX idx_module_progress_status ON student_module_progress(status);
CREATE INDEX idx_content_progress_student ON student_content_progress(student_id);
CREATE INDEX idx_milestone_batch ON learning_milestones(batch_id);
CREATE INDEX idx_milestone_achievement_student ON student_milestone_achievement(student_id);
```

---

## Learning Path Components

### 1. Student Learning Dashboard

```typescript
// src/components/student/LearningPath/LearningDashboard.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/store/user.store';
import { progressService } from '@/services/student/progress.service';
import { Card } from '@/components/common/cards/Card';
import { ProgressBar } from '@/components/common/progress/ProgressBar';
import { Trophy, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export const LearningDashboard: React.FC = () => {
  const { user } = useUserStore();
  
  const { data: analytics = {} } = useQuery({
    queryKey: ['learning-analytics', user?.id],
    queryFn: () => progressService.getProgressAnalytics(user!.id),
    enabled: !!user,
  });
  
  const { data: milestones = [] } = useQuery({
    queryKey: ['student-milestones', user?.id],
    queryFn: () => progressService.getStudentMilestones(user!.id),
    enabled: !!user,
  });
  
  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm">Overall Progress</p>
              <p className="text-3xl font-bold mt-2">
                {analytics.average_completion || 0}%
              </p>
            </div>
            <TrendingUp size={32} className="text-blue-600" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed Modules</p>
              <p className="text-3xl font-bold mt-2">
                {analytics.completed_modules || 0}
              </p>
            </div>
            <CheckCircle size={32} className="text-green-600" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm">Hours Invested</p>
              <p className="text-3xl font-bold mt-2">
                {analytics.total_hours_spent || 0}h
              </p>
            </div>
            <Clock size={32} className="text-orange-600" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm">Milestones Achieved</p>
              <p className="text-3xl font-bold mt-2">
                {milestones.filter((m) => m.achieved_date).length}
              </p>
            </div>
            <Trophy size={32} className="text-yellow-600" />
          </div>
        </Card>
      </div>
      
      {/* Module Progress */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Module Progress</h2>
        <div className="space-y-4">
          {analytics.modules?.map((module: any) => (
            <div key={module.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{module.name}</span>
                <span className="text-sm text-gray-600">
                  {module.completion_percentage}%
                </span>
              </div>
              <ProgressBar value={module.completion_percentage} />
            </div>
          ))}
        </div>
      </Card>
      
      {/* Recent Milestones */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Achievements</h2>
        <div className="space-y-3">
          {milestones.filter((m) => m.achieved_date).map((milestone) => (
            <div key={milestone.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Trophy size={24} className="text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium">{milestone.milestone_name}</p>
                <p className="text-sm text-gray-600">
                  Achieved on{' '}
                  {new Date(milestone.achieved_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
```

### 2. Module Progress Tracker

```typescript
// src/components/student/LearningPath/ModuleProgressTracker.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { progressService } from '@/services/student/progress.service';
import { Card } from '@/components/common/cards/Card';
import { ProgressBar } from '@/components/common/progress/ProgressBar';
import { ChevronRight, Lock } from 'lucide-react';

interface ModuleProgressTrackerProps {
  batchId: string;
  studentId: string;
}

export const ModuleProgressTracker: React.FC<ModuleProgressTrackerProps> = ({
  batchId,
  studentId,
}) => {
  const { data: modules = [] } = useQuery({
    queryKey: ['batch-modules', batchId],
    queryFn: () => progressService.getBatchModules(batchId),
  });
  
  const { data: studentProgress = {} } = useQuery({
    queryKey: ['student-module-progress', studentId, batchId],
    queryFn: () =>
      progressService.getStudentModuleProgress(studentId, batchId),
  });
  
  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">Learning Path</h2>
      
      <div className="space-y-6">
        {modules.map((module, index) => {
          const progress = studentProgress[module.id];
          const isLocked = index > 0 && !studentProgress[modules[index - 1].id]?.completed;
          
          return (
            <div
              key={module.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                isLocked
                  ? 'border-gray-200 bg-gray-50 opacity-50'
                  : progress?.status === 'completed'
                    ? 'border-green-200 bg-green-50'
                    : progress?.status === 'in_progress'
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{module.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {module.estimated_hours} hours • {module.difficulty_level}
                  </p>
                </div>
                
                {isLocked && <Lock size={24} className="text-gray-400" />}
                {progress?.status === 'completed' && (
                  <span className="text-green-600 text-sm font-bold">✓ Complete</span>
                )}
              </div>
              
              {progress && !isLocked && (
                <div className="space-y-2">
                  <ProgressBar value={progress.completion_percentage} />
                  <p className="text-xs text-gray-600">
                    {progress.completion_percentage}% complete •{' '}
                    {progress.time_spent_hours} hours spent
                  </p>
                </div>
              )}
              
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">Contents:</p>
                <ul className="mt-2 space-y-1">
                  {module.contents?.map((content: any) => {
                    const contentProgress = progress?.content_progress?.[content.id];
                    return (
                      <li key={content.id} className="text-sm text-gray-600">
                        {contentProgress?.completed ? '✓' : '○'} {content.title}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
```

---

## Progress Service

```typescript
// src/services/student/progress.service.ts
import { supabase } from '@/services/api/client';

export const progressService = {
  async getProgressAnalytics(studentId: string) {
    const { data, error } = await supabase
      .from('student_progress_analytics')
      .select('*')
      .eq('student_id', studentId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || {};
  },
  
  async getStudentMilestones(studentId: string) {
    const { data, error } = await supabase
      .from('student_milestone_achievement')
      .select(`
        *,
        learning_milestones(
          milestone_name,
          milestone_type,
          icon_url
        )
      `)
      .eq('student_id', studentId)
      .order('achieved_date', { ascending: false });
    
    if (error) throw new Error(error.message);
    
    return data?.map((achievement) => ({
      ...achievement,
      ...achievement.learning_milestones,
    })) || [];
  },
  
  async getBatchModules(batchId: string) {
    const { data, error } = await supabase
      .from('content_modules')
      .select(`
        id,
        module_name,
        description,
        estimated_hours,
        difficulty_level,
        sequence_number,
        topic_contents(
          id,
          title
        )
      `)
      .eq('batches.id', batchId)
      .order('sequence_number');
    
    if (error) throw new Error(error.message);
    return data || [];
  },
  
  async getStudentModuleProgress(studentId: string, batchId: string) {
    const { data, error } = await supabase
      .from('student_module_progress')
      .select(`
        *,
        student_content_progress(*)
      `)
      .eq('student_id', studentId)
      .eq('batch_id', batchId);
    
    if (error) throw new Error(error.message);
    
    // Transform to map
    const map: Record<string, any> = {};
    data?.forEach((progress) => {
      map[progress.module_id] = {
        ...progress,
        status: progress.status,
        completion_percentage: progress.completion_percentage,
        time_spent_hours: progress.time_spent_hours,
        content_progress: {},
      };
      
      progress.student_content_progress?.forEach((contentProgress: any) => {
        map[progress.module_id].content_progress[contentProgress.content_id] = {
          completed: contentProgress.completion_percentage >= 100,
        };
      });
    });
    
    return map;
  },
  
  async updateModuleProgress(
    studentId: string,
    moduleId: string,
    progressData: any
  ) {
    const { data, error } = await supabase
      .from('student_module_progress')
      .update(progressData)
      .eq('student_id', studentId)
      .eq('module_id', moduleId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async trackContentProgress(
    studentId: string,
    contentId: string,
    moduleId: string,
    progress: {
      completion_percentage: number;
      watch_duration_seconds?: number;
      last_position_seconds?: number;
    }
  ) {
    const { data, error } = await supabase
      .from('student_content_progress')
      .upsert(
        {
          student_id: studentId,
          content_id: contentId,
          module_id: moduleId,
          completion_percentage: progress.completion_percentage,
          watch_duration_seconds: progress.watch_duration_seconds,
          last_position_seconds: progress.last_position_seconds,
          viewed_at: new Date().toISOString(),
        },
        {
          onConflict: 'student_id,content_id',
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

## Learning Hook

```typescript
// src/hooks/student/useStudentProgress.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressService } from '@/services/student/progress.service';

export const useStudentProgress = (studentId: string, batchId: string) => {
  const queryClient = useQueryClient();
  
  const progress = useQuery({
    queryKey: ['student-progress', studentId, batchId],
    queryFn: () => progressService.getStudentModuleProgress(studentId, batchId),
  });
  
  const updateProgress = useMutation({
    mutationFn: (data: any) =>
      progressService.updateModuleProgress(studentId, data.moduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['student-progress', studentId, batchId],
      });
      queryClient.invalidateQueries({
        queryKey: ['learning-analytics', studentId],
      });
    },
  });
  
  return {
    progress: progress.data,
    isLoading: progress.isLoading,
    updateProgress: updateProgress.mutate,
    isUpdating: updateProgress.isPending,
  };
};
```

---

## Next Steps

1. ✅ Create student progression schema
2. ✅ Implement learning dashboard
3. ✅ Build module progress tracker
4. ✅ Create progress service
5. ✅ Phase 5 Complete - Proceed to Phase 6

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Student Progression Complete  
**Phase 5 Complete:** All 5 files created  
**Next Phase:** PHASE_6_ACADEMIC_OPERATIONS
