# Learning Management System (LMS)

## Overview
The Learning Management System module provides a comprehensive platform for delivering online and blended learning content. It includes video hosting, interactive quizzes, progress tracking, and adaptive learning pathways.

## Module Objectives
- Host and stream educational video content
- Create interactive learning modules
- Track student learning progress
- Deliver adaptive learning paths
- Manage quiz and assessment content
- Provide learning analytics
- Support blended learning model

## Key Features

### 1. Video Content Management
- **Video Upload & Hosting**
  - Multi-format support (MP4, WebM, HLS)
  - Automatic transcoding
  - Quality variants (360p, 480p, 720p, 1080p)
  - Thumbnails and metadata
  - Closed captioning/subtitles

- **Video Organization**
  - Topic-based organization
  - Subject hierarchy
  - Duration and difficulty levels
  - Content tagging
  - Prerequisite videos

### 2. Video Streaming
- **Adaptive Streaming**
  - HLS (HTTP Live Streaming)
  - Automatic quality selection
  - Bandwidth optimization
  - Offline download support
  - Resume playback

- **Video Analytics**
  - View count
  - Average watch time
  - Drop-off points
  - Student engagement
  - Completion rates

### 3. Learning Modules
- **Module Creation**
  - Multi-part modules
  - Sequential learning
  - Branching pathways
  - Prerequisite enforcement
  - Estimated completion time

- **Module Components**
  - Videos
  - Quizzes
  - Assignments
  - Discussions
  - Resources
  - Assessments

### 4. Interactive Quizzes
- **Quiz Types**
  - Multiple choice
  - Short answer
  - Essay questions
  - Matching
  - Fill in the blank
  - True/False
  - Numerical answers

- **Quiz Features**
  - Timed quizzes
  - Randomized questions
  - Question shuffling
  - Instant feedback
  - Partial grading
  - Unlimited attempts or limited

### 5. Progress Tracking
- **Student Progress**
  - Module completion percentage
  - Quiz scores
  - Time spent on content
  - Badges and achievements
  - Learning streaks

- **Analytics Dashboard**
  - Progress by module
  - Performance trends
  - Weak areas identification
  - Comparative analytics
  - Predictive analytics

### 6. Adaptive Learning
- **Personalized Pathways**
  - Adaptive difficulty adjustment
  - Recommended content
  - Prerequisite enforcement
  - Skill-based routing
  - Personalized pacing

## Database Schema

### Tables

#### `video_content`
```sql
CREATE TABLE video_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Content
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Video
  video_url TEXT NOT NULL,
  video_duration_seconds INT,
  thumbnail_url TEXT,
  
  -- Organization
  subject_id UUID REFERENCES subjects(id),
  topic_id UUID REFERENCES topics(id),
  batch_id UUID REFERENCES batches(id),
  
  -- Metadata
  difficulty_level VARCHAR(50), -- BEGINNER, INTERMEDIATE, ADVANCED
  duration_minutes INT,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Quality variants
  quality_variants JSONB, -- {360p, 480p, 720p, 1080p}
  
  -- Captions
  captions_available JSONB, -- {en, es, fr, etc.}
  
  -- Status
  status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, PUBLISHED, ARCHIVED
  
  uploaded_by UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `learning_modules`
```sql
CREATE TABLE learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Module
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Organization
  subject_id UUID REFERENCES subjects(id),
  topic_id UUID REFERENCES topics(id),
  batch_id UUID REFERENCES batches(id),
  
  -- Sequence
  module_order INT,
  is_sequential BOOLEAN DEFAULT TRUE, -- Must complete in order
  estimated_duration_hours INT,
  
  -- Prerequisites
  prerequisite_module_id UUID REFERENCES learning_modules(id),
  prerequisite_modules JSONB, -- Array of module IDs
  
  -- Status
  status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, PUBLISHED, ARCHIVED
  
  created_by UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `module_content`
```sql
CREATE TABLE module_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
  
  -- Content type
  content_type VARCHAR(50) NOT NULL, -- VIDEO, QUIZ, ASSIGNMENT, DISCUSSION, RESOURCE
  content_id UUID, -- References video_content, quizzes, assignments, etc.
  
  -- Ordering
  content_order INT,
  is_required BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  duration_minutes INT,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `quizzes`
```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Quiz
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Settings
  quiz_type VARCHAR(50), -- PRACTICE, ASSESSMENT, GRADED
  time_limit_minutes INT,
  randomize_questions BOOLEAN DEFAULT FALSE,
  shuffle_answers BOOLEAN DEFAULT FALSE,
  
  -- Attempt settings
  max_attempts INT, -- NULL for unlimited
  show_correct_answer BOOLEAN DEFAULT TRUE,
  immediate_feedback BOOLEAN DEFAULT TRUE,
  
  -- Organization
  subject_id UUID REFERENCES subjects(id),
  module_id UUID REFERENCES learning_modules(id),
  
  -- Status
  status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, PUBLISHED, ARCHIVED
  
  created_by UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `quiz_questions`
```sql
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  
  -- Question
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL, -- MCQ, SHORT_ANSWER, ESSAY, MATCHING, TRUE_FALSE, NUMERICAL, FILL_BLANK
  question_order INT,
  
  -- Points
  points INT DEFAULT 1,
  negative_marks_enabled BOOLEAN DEFAULT FALSE,
  negative_marks INT DEFAULT 0,
  
  -- Answer
  correct_answer TEXT, -- JSON for multiple correct answers
  answer_explanation TEXT,
  
  -- Options for MCQ
  options JSONB, -- Array of {text, is_correct}
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `student_learning_progress`
```sql
CREATE TABLE student_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Module progress
  module_id UUID NOT NULL REFERENCES learning_modules(id),
  
  completion_percentage INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'NOT_STARTED', -- NOT_STARTED, IN_PROGRESS, COMPLETED
  
  first_accessed_at TIMESTAMP,
  last_accessed_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  total_time_spent_minutes INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(student_id, module_id)
);
```

#### `video_watch_progress`
```sql
CREATE TABLE video_watch_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES video_content(id) ON DELETE CASCADE,
  
  view_count INT DEFAULT 0,
  total_watched_seconds INT DEFAULT 0,
  last_watched_position_seconds INT DEFAULT 0,
  
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  
  first_viewed_at TIMESTAMP DEFAULT NOW(),
  last_viewed_at TIMESTAMP DEFAULT NOW()
);
```

#### `quiz_attempts`
```sql
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  
  attempt_number INT,
  started_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,
  
  total_questions INT,
  correct_answers INT,
  score DECIMAL(5,2),
  percentage DECIMAL(5,2),
  
  time_taken_seconds INT,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `quiz_responses`
```sql
CREATE TABLE quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id),
  
  student_answer TEXT,
  is_correct BOOLEAN,
  points_scored DECIMAL(5,2),
  
  answered_at TIMESTAMP DEFAULT NOW()
);
```

#### `learning_achievements`
```sql
CREATE TABLE learning_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Badge
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  badge_icon_url TEXT,
  
  -- Criteria
  criteria_type VARCHAR(50), -- COMPLETION, SCORE, STREAK, SPEED
  criteria_value INT,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `student_achievements`
```sql
CREATE TABLE student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES learning_achievements(id),
  
  earned_at TIMESTAMP DEFAULT NOW()
);
```

### Views and Queries

#### Student Progress Overview
```sql
SELECT 
  s.id as student_id,
  CONCAT(s.first_name, ' ', s.last_name) as student_name,
  COUNT(DISTINCT slp.module_id) as total_modules,
  COUNT(DISTINCT CASE WHEN slp.status = 'COMPLETED' THEN slp.module_id END) as completed_modules,
  ROUND(AVG(slp.completion_percentage), 2) as avg_completion_percentage,
  SUM(slp.total_time_spent_minutes) as total_learning_time_minutes
FROM student_learning_progress slp
JOIN students s ON slp.student_id = s.id
WHERE slp.organization_id = $1
GROUP BY s.id, s.first_name, s.last_name;
```

## Components

### VideoPlayer
Location: `src/features/lms/components/VideoPlayer.tsx`

**Purpose:** Stream video content with controls

**Props:**
```typescript
interface VideoPlayerProps {
  videoId: string;
  studentId: string;
  onProgress: (seconds: number) => void;
  onComplete: () => void;
}
```

**Features:**
- Adaptive streaming
- Quality selector
- Playback speed control
- Subtitle support
- Fullscreen mode
- Resume playback

### LearningModule
Location: `src/features/lms/components/LearningModule.tsx`

**Purpose:** Display module with all content

**Props:**
```typescript
interface LearningModuleProps {
  moduleId: string;
  studentId: string;
}
```

**Features:**
- Module content listing
- Sequential enforcement
- Progress tracking
- Content navigation
- Completion tracking

### QuizInterface
Location: `src/features/lms/components/QuizInterface.tsx`

**Purpose:** Interactive quiz taking interface

**Props:**
```typescript
interface QuizInterfaceProps {
  quizId: string;
  studentId: string;
  onSubmit: (result: QuizResult) => void;
}
```

**Features:**
- Question display
- Timer
- Navigation between questions
- Review mode
- Instant feedback

### ProgressTracker
Location: `src/features/lms/components/ProgressTracker.tsx`

**Purpose:** Display learning progress

**Props:**
```typescript
interface ProgressTrackerProps {
  studentId: string;
  organizationId: string;
}
```

**Features:**
- Module completion chart
- Time spent analysis
- Achievement badges
- Learning streaks
- Recommendations

## Services

### `lms.service.ts`
Location: `src/features/lms/services/lms.service.ts`

```typescript
// Video Management
async uploadVideo(data: VideoUploadInput): Promise<VideoContent>
async getVideo(videoId: string): Promise<VideoContent>
async listVideos(organizationId: string, filters?: VideoFilters): Promise<VideoContent[]>
async updateVideo(videoId: string, data: UpdateVideoInput): Promise<void>
async deleteVideo(videoId: string): Promise<void>

// Module Management
async createModule(data: CreateModuleInput): Promise<LearningModule>
async getModule(moduleId: string): Promise<LearningModule>
async listModules(organizationId: string): Promise<LearningModule[]>
async addContentToModule(moduleId: string, content: ModuleContentInput): Promise<void>
async reorderModuleContent(moduleId: string, contentOrder: string[]): Promise<void>

// Quiz Management
async createQuiz(data: CreateQuizInput): Promise<Quiz>
async addQuestionsToQuiz(quizId: string, questions: QuestionInput[]): Promise<void>
async getQuiz(quizId: string): Promise<Quiz>
async listQuizzes(organizationId: string): Promise<Quiz[]>

// Progress Tracking
async getStudentProgress(studentId: string): Promise<StudentProgress>
async getModuleProgress(studentId: string, moduleId: string): Promise<ModuleProgress>
async recordVideoProgress(studentId: string, videoId: string, watchedSeconds: number): Promise<void>
async recordModuleCompletion(studentId: string, moduleId: string): Promise<void>

// Quiz Attempts
async startQuizAttempt(quizId: string, studentId: string): Promise<QuizAttempt>
async submitQuizAnswer(attemptId: string, questionId: string, answer: string): Promise<void>
async submitQuizAttempt(attemptId: string): Promise<QuizResult>
async getQuizResult(attemptId: string): Promise<QuizResult>

// Analytics
async getVideoAnalytics(videoId: string): Promise<VideoAnalytics>
async getModuleAnalytics(moduleId: string): Promise<ModuleAnalytics>
async getStudentLearningAnalytics(studentId: string): Promise<LearningAnalytics>

// Achievements
async checkAndAwardAchievements(studentId: string): Promise<Achievement[]>
async getStudentAchievements(studentId: string): Promise<Achievement[]>
```

### `lms.queries.ts`
Location: `src/features/lms/services/lms.queries.ts`

```typescript
// React Query hooks
export const useVideo = (videoId: string)
export const useVideos = (organizationId: string, filters?: VideoFilters)
export const useModule = (moduleId: string)
export const useModules = (organizationId: string)
export const useQuiz = (quizId: string)
export const useStudentProgress = (studentId: string)
export const useVideoProgress = (studentId: string, videoId: string)
export const useQuizResult = (attemptId: string)

// Mutations
export const useUploadVideo = ()
export const useCreateModule = ()
export const useCreateQuiz = ()
export const useStartQuizAttempt = ()
export const useSubmitQuizAnswer = ()
export const useRecordVideoProgress = ()
```

## API Endpoints

### REST API (via Supabase AutoAPI)

```
GET    /rest/v1/video_content?organization_id=eq.{id}
POST   /rest/v1/video_content
PATCH  /rest/v1/video_content/{id}

GET    /rest/v1/learning_modules?organization_id=eq.{id}
POST   /rest/v1/learning_modules
PATCH  /rest/v1/learning_modules/{id}

GET    /rest/v1/module_content?module_id=eq.{id}
POST   /rest/v1/module_content

GET    /rest/v1/quizzes?organization_id=eq.{id}
POST   /rest/v1/quizzes
PATCH  /rest/v1/quizzes/{id}

GET    /rest/v1/quiz_questions?quiz_id=eq.{id}
POST   /rest/v1/quiz_questions

GET    /rest/v1/student_learning_progress?student_id=eq.{id}
POST   /rest/v1/student_learning_progress
PATCH  /rest/v1/student_learning_progress/{id}

POST   /rest/v1/quiz_attempts
GET    /rest/v1/quiz_attempts?student_id=eq.{id}

GET    /rest/v1/quiz_responses?quiz_attempt_id=eq.{id}
POST   /rest/v1/quiz_responses
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Students can view content assigned to their batch
CREATE POLICY video_content_view ON video_content
  FOR SELECT USING (
    batch_id IN (
      SELECT batch_id FROM enrollments 
      WHERE student_id = (SELECT id FROM students WHERE auth.uid() = user_id)
    )
  );

-- Students can only access their own progress
CREATE POLICY student_progress_view ON student_learning_progress
  FOR SELECT USING (
    student_id = (SELECT id FROM students WHERE auth.uid() = user_id)
  );

-- Teachers can view their batch content
CREATE POLICY module_content_teacher_view ON learning_modules
  FOR SELECT USING (
    batch_id IN (
      SELECT batch_id FROM batch_faculty 
      WHERE faculty_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
    )
  );
```

## Implementation Workflow

### Phase 1: Core Setup
1. Create database tables
2. Set up video storage
3. Configure streaming

### Phase 2: Video Management
1. Build VideoPlayer
2. Implement upload service
3. Add video management interface

### Phase 3: Learning Modules
1. Build LearningModule
2. Implement module creation
3. Add content management

### Phase 4: Quiz System
1. Build QuizInterface
2. Implement question bank
3. Add auto-grading

### Phase 5: Analytics & Achievements
1. Build ProgressTracker
2. Implement analytics
3. Add achievement system

## Testing Strategy

### Unit Tests
- Video transcoding
- Quiz scoring
- Progress calculation
- Achievement criteria

### Component Tests
- VideoPlayer interaction
- QuizInterface submission
- ProgressTracker rendering

### Integration Tests
- End-to-end learning workflow
- Video streaming
- Quiz completion

## Performance Optimization

- CDN for video delivery
- Cache module content
- Index on `student_id, module_id`
- Batch progress updates
- Archive old quiz attempts

## Future Enhancements

- AI-powered recommendations
- Real-time live streaming
- Collaborative learning spaces
- Gamification elements
- AI-powered question generation
- Video analytics with heatmaps
- Adaptive difficulty adjustment
- Mobile app support
