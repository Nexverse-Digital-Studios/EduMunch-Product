# Tests and Assessments

## Overview
The Tests and Assessments module provides comprehensive testing infrastructure including test series creation, mock tests, question banks, performance analytics, and competitive exam preparation features like All India Rank (AIR) calculations.

## Module Objectives
- Create test series and mock tests
- Build question bank management
- Implement test delivery and evaluation
- Calculate test analytics and rankings
- Provide performance insights
- Support competitive exam preparation
- Track student improvement

## Key Features

### 1. Test Series Management
- **Series Definition**
  - Test series creation
  - Series metadata (name, description, type)
  - Subject/topic coverage
  - Difficulty progression
  - Test count and spacing

- **Series Types**
  - Topic-wise series
  - Full-length series
  - Chapter tests
  - Concept tests
  - Revision tests

### 2. Mock Tests
- **Mock Test Creation**
  - Question selection
  - Time allocation
  - Difficulty balance
  - Section-wise configuration
  - Auto-generated or manual

- **Mock Test Features**
  - Multiple sections
  - Section-wise time limits
  - Negative marking
  - Section switching
  - Review and analysis

### 3. Question Bank
- **Question Organization**
  - Subject-wise categorization
  - Topic-wise organization
  - Difficulty levels (Easy, Medium, Hard)
  - Question types
  - Solutions and explanations

- **Question Types**
  - Multiple choice (Single correct)
  - Multiple choice (Multiple correct)
  - Numerical answer
  - Matrix matching
  - Comprehension-based
  - Assertion-reason

### 4. Test Performance Analytics
- **Individual Analytics**
  - Accuracy percentage
  - Speed (questions per minute)
  - Time management
  - Topic-wise performance
  - Weak area identification

- **Comparative Analytics**
  - Class/batch average
  - Percentile ranking
  - All India Rank (AIR)
  - Performance trends
  - Improvement tracking

### 5. All India Rank (AIR) Calculation
- **Ranking Logic**
  - Score calculation
  - Rank determination
  - Percentile computation
  - Tie-breaking rules
  - Historical ranking

- **Analytics**
  - Target score calculation
  - Required improvement
  - Predicted rank
  - Category-wise ranking

### 6. Performance Insights
- **Detailed Analysis**
  - Difficulty-wise performance
  - Section-wise analysis
  - Question-type analysis
  - Time allocation analysis
  - Error patterns

- **Recommendations**
  - Topics to focus on
  - Time management tips
  - Weak area strategy
  - Performance improvement path

## Database Schema

### Tables

#### `test_series`
```sql
CREATE TABLE test_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Series
  series_name VARCHAR(255) NOT NULL,
  series_description TEXT,
  series_type VARCHAR(50) NOT NULL, -- TOPIC_WISE, FULL_LENGTH, CHAPTER, CONCEPT, REVISION
  
  -- Coverage
  subject_ids JSONB, -- Array of subject IDs
  topic_ids JSONB, -- Array of topic IDs
  
  -- Configuration
  total_tests INT,
  difficulty_progression VARCHAR(50), -- EASY_TO_HARD, MIXED, HARD_TO_EASY
  test_frequency_days INT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, ARCHIVED
  
  created_by UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `mock_tests`
```sql
CREATE TABLE mock_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Test
  test_name VARCHAR(255) NOT NULL,
  test_description TEXT,
  test_code VARCHAR(50),
  
  -- Series relationship
  test_series_id UUID REFERENCES test_series(id),
  test_number_in_series INT,
  
  -- Configuration
  total_questions INT,
  total_marks INT,
  total_time_minutes INT,
  
  -- Structure
  sections JSONB, -- Array of {section_name, questions_count, time_minutes, negative_marking}
  
  -- Difficulty
  average_difficulty_level VARCHAR(50), -- EASY, MEDIUM, HARD
  
  -- Status
  status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, PUBLISHED, CLOSED, ARCHIVED
  published_date TIMESTAMP,
  
  -- Availability
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  max_attempts INT,
  
  created_by UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `question_bank`
```sql
CREATE TABLE question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Question
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL, -- MCQ_SINGLE, MCQ_MULTIPLE, NUMERICAL, MATCHING, COMPREHENSION, ASSERTION
  
  -- Organization
  subject_id UUID REFERENCES subjects(id),
  topic_id UUID REFERENCES topics(id),
  
  -- Difficulty
  difficulty_level VARCHAR(50) NOT NULL, -- EASY, MEDIUM, HARD
  
  -- Options
  options JSONB, -- Array for MCQ: {text, is_correct}
  correct_answer TEXT,
  
  -- Metadata
  answer_explanation TEXT,
  solution_video_url TEXT,
  concept_link TEXT, -- Link to concept in learning material
  
  -- Tagging
  tags JSONB, -- Array of tags
  
  -- Analytics
  correct_count INT DEFAULT 0,
  attempt_count INT DEFAULT 0,
  
  created_by UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `test_questions`
```sql
CREATE TABLE test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_test_id UUID NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES question_bank(id),
  
  -- Sequencing
  question_number INT,
  section_name VARCHAR(100),
  
  -- Scoring
  marks_allocated INT,
  negative_marks INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `test_attempts`
```sql
CREATE TABLE test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_test_id UUID NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  
  -- Attempt
  attempt_number INT,
  started_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,
  
  -- Duration
  total_time_taken_seconds INT,
  time_used_minutes INT,
  
  -- Score
  total_marks_obtained DECIMAL(5,2),
  total_marks_possible INT,
  accuracy_percentage DECIMAL(5,2),
  
  -- Status
  status VARCHAR(50) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, SUBMITTED, EVALUATED
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `test_responses`
```sql
CREATE TABLE test_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_attempt_id UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES question_bank(id),
  
  -- Response
  student_answer TEXT,
  is_correct BOOLEAN,
  marks_obtained DECIMAL(5,2),
  
  -- Timing
  time_spent_seconds INT,
  
  -- Status
  was_reviewed BOOLEAN DEFAULT FALSE,
  
  answered_at TIMESTAMP DEFAULT NOW()
);
```

#### `test_analytics`
```sql
CREATE TABLE test_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_attempt_id UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  
  -- Performance
  speed_questions_per_minute DECIMAL(5,2),
  accuracy_percentage DECIMAL(5,2),
  
  -- Section-wise
  section_scores JSONB, -- {section_name: score, accuracy, time}
  
  -- Topic-wise
  topic_performance JSONB, -- {topic_name: correct, total, accuracy}
  
  -- Difficulty-wise
  difficulty_performance JSONB, -- {difficulty: correct, total, accuracy}
  
  -- Time analysis
  time_management_score INT,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `student_rankings`
```sql
CREATE TABLE student_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  mock_test_id UUID NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
  
  -- Student
  student_id UUID NOT NULL REFERENCES students(id),
  
  -- Ranking
  rank INT,
  percentile DECIMAL(5,2),
  all_india_rank INT,
  category_rank INT,
  
  -- Score
  score DECIMAL(5,2),
  accuracy DECIMAL(5,2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(organization_id, mock_test_id, student_id)
);
```

#### `performance_insights`
```sql
CREATE TABLE performance_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Analysis period
  analysis_period_start_date DATE,
  analysis_period_end_date DATE,
  
  -- Weak areas
  weak_topics JSONB, -- Array of topic IDs with low accuracy
  weak_question_types JSONB, -- Array with low performance
  
  -- Strong areas
  strong_topics JSONB,
  
  -- Recommendations
  recommendations TEXT,
  areas_to_focus JSONB,
  
  -- Progress
  improvement_percentage DECIMAL(5,2),
  target_score INT,
  predicted_rank INT,
  
  generated_at TIMESTAMP DEFAULT NOW()
);
```

### Views and Queries

#### Test Performance Leaderboard
```sql
SELECT 
  sr.rank,
  CONCAT(s.first_name, ' ', s.last_name) as student_name,
  sr.score,
  sr.accuracy,
  sr.percentile,
  sr.all_india_rank
FROM student_rankings sr
JOIN students s ON sr.student_id = s.id
WHERE sr.mock_test_id = $1
ORDER BY sr.rank
LIMIT 100;
```

## Components

### TestInterface
Location: `src/features/tests/components/TestInterface.tsx`

**Purpose:** Deliver mock tests

**Props:**
```typescript
interface TestInterfaceProps {
  testId: string;
  studentId: string;
  onSubmit: (attempt: TestAttempt) => void;
}
```

**Features:**
- Question display
- Timer management
- Section navigation
- Answer review
- Auto-save

### PerformanceAnalytics
Location: `src/features/tests/components/PerformanceAnalytics.tsx`

**Purpose:** Display test analytics

**Props:**
```typescript
interface PerformanceAnalyticsProps {
  testAttemptId: string;
  studentId: string;
}
```

**Features:**
- Score breakdown
- Accuracy charts
- Weak area identification
- Comparative stats
- Recommendations

### QuestionBank
Location: `src/features/tests/components/QuestionBank.tsx`

**Purpose:** Manage questions

**Props:**
```typescript
interface QuestionBankProps {
  organizationId: string;
}
```

**Features:**
- Question search
- Filter by difficulty
- Create/edit questions
- Bulk import
- Analytics per question

### TestBuilder
Location: `src/features/tests/components/TestBuilder.tsx`

**Purpose:** Create mock tests

**Props:**
```typescript
interface TestBuilderProps {
  organizationId: string;
  onSuccess: (test: MockTest) => void;
}
```

**Features:**
- Test configuration
- Question selection
- Section setup
- Time allocation
- Preview

## Services

### `test.service.ts`
Location: `src/features/tests/services/test.service.ts`

```typescript
// Test Series
async createTestSeries(data: TestSeriesInput): Promise<TestSeries>
async getTestSeries(seriesId: string): Promise<TestSeries>
async listTestSeries(organizationId: string): Promise<TestSeries[]>

// Mock Tests
async createMockTest(data: MockTestInput): Promise<MockTest>
async getMockTest(testId: string): Promise<MockTest>
async listMockTests(seriesId?: string): Promise<MockTest[]>
async publishMockTest(testId: string): Promise<void>

// Question Bank
async addQuestion(data: QuestionInput): Promise<Question>
async updateQuestion(questionId: string, data: QuestionInput): Promise<void>
async getQuestion(questionId: string): Promise<Question>
async listQuestions(filters?: QuestionFilters): Promise<Question[]>
async bulkImportQuestions(file: File): Promise<void>

// Test Execution
async startTestAttempt(testId: string, studentId: string): Promise<TestAttempt>
async submitAnswer(attemptId: string, questionId: string, answer: string): Promise<void>
async submitTestAttempt(attemptId: string): Promise<void>
async evaluateTest(attemptId: string): Promise<void>

// Analytics
async getTestAnalytics(attemptId: string): Promise<TestAnalytics>
async generateRankings(testId: string): Promise<void>
async getStudentPerformance(studentId: string): Promise<StudentPerformance>
async generateAIR(testId: string): Promise<void>

// Insights
async generatePerformanceInsights(studentId: string, period: DateRange): Promise<PerformanceInsight>
async getWeakTopics(studentId: string): Promise<WeakArea[]>
async getTargetScore(studentId: string, goalRank: number): Promise<TargetScore>
```

### `test.queries.ts`
Location: `src/features/tests/services/test.queries.ts`

```typescript
// React Query hooks
export const useMockTest = (testId: string)
export const useTestSeries = (seriesId: string)
export const useTestAttempt = (attemptId: string)
export const useTestAnalytics = (attemptId: string)
export const useStudentRank = (testId: string, studentId: string)
export const usePerformanceInsights = (studentId: string)

// Mutations
export const useStartTestAttempt = ()
export const useSubmitAnswer = ()
export const useSubmitTest = ()
export const useCreateMockTest = ()
```

## API Endpoints

### REST API (via Supabase AutoAPI)

```
GET    /rest/v1/test_series?organization_id=eq.{id}
POST   /rest/v1/test_series

GET    /rest/v1/mock_tests?organization_id=eq.{id}
POST   /rest/v1/mock_tests
PATCH  /rest/v1/mock_tests/{id}

GET    /rest/v1/question_bank?organization_id=eq.{id}
POST   /rest/v1/question_bank
PATCH  /rest/v1/question_bank/{id}

POST   /rest/v1/test_attempts
GET    /rest/v1/test_attempts?student_id=eq.{id}
PATCH  /rest/v1/test_attempts/{id}

GET    /rest/v1/test_responses?test_attempt_id=eq.{id}
POST   /rest/v1/test_responses

GET    /rest/v1/test_analytics?test_attempt_id=eq.{id}
POST   /rest/v1/test_analytics

GET    /rest/v1/student_rankings?mock_test_id=eq.{id}
POST   /rest/v1/student_rankings
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Students can attempt assigned tests
CREATE POLICY mock_tests_student_view ON mock_tests
  FOR SELECT USING (
    id IN (
      SELECT mt.id FROM mock_tests mt
      JOIN batch_tests bt ON mt.id = bt.test_id
      JOIN enrollments e ON bt.batch_id = e.batch_id
      WHERE e.student_id = (SELECT id FROM students WHERE auth.uid() = user_id)
    )
  );

-- Students can only view their own analytics
CREATE POLICY test_analytics_student_view ON test_analytics
  FOR SELECT USING (
    test_attempt_id IN (
      SELECT id FROM test_attempts 
      WHERE student_id = (SELECT id FROM students WHERE auth.uid() = user_id)
    )
  );
```

## Implementation Workflow

### Phase 1: Core Setup
1. Create database tables
2. Set up question bank
3. Configure test structure

### Phase 2: Test Management
1. Build TestBuilder
2. Implement test creation
3. Add question selection

### Phase 3: Test Delivery
1. Build TestInterface
2. Implement timer
3. Add answer submission

### Phase 4: Analytics
1. Build PerformanceAnalytics
2. Implement scoring
3. Calculate rankings

### Phase 5: Insights
1. Generate AIR
2. Build recommendation engine
3. Create performance reports

## Testing Strategy

### Unit Tests
- Scoring logic
- Ranking calculation
- Analytics computation
- AIR calculation

### Component Tests
- Test interface interaction
- Timer functionality
- Answer submission

### Integration Tests
- End-to-end test attempt
- Ranking generation
- Analytics accuracy

## Performance Optimization

- Index on `mock_test_id, student_id`
- Cache rankings
- Background job for analytics
- Archive old attempts
- Batch evaluate tests

## Future Enhancements

- Adaptive testing
- AI-powered question recommendations
- Video explanations
- Discussion forums
- Peer comparison
- Predictive analytics
- Mobile app support
- Live test proctoring
