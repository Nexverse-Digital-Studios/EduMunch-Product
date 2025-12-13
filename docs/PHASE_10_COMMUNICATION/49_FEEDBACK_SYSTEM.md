# Feedback System

## Overview
The Feedback System enables collection and analysis of feedback from students, parents, and other stakeholders about teachers, courses, and overall experience. This system supports feedback forms, quality metrics, rating systems, and feedback analysis.

## Module Objectives
- Create customizable feedback forms
- Collect structured feedback
- Implement rating systems
- Analyze feedback trends
- Generate feedback reports
- Support continuous improvement

## Key Features

### 1. Feedback Form Creation
- **Form Builder**
  - Question types (multiple choice, rating, text, dropdown)
  - Custom questions
  - Required/optional fields
  - Randomized question order
  - Form preview

- **Form Templates**
  - Pre-built templates
  - Custom template creation
  - Template cloning
  - Multiple language support

### 2. Feedback Types
- **Teacher Feedback**
  - Teaching quality
  - Communication skills
  - Subject knowledge
  - Availability
  - Overall rating

- **Course Feedback**
  - Content relevance
  - Course structure
  - Materials provided
  - Difficulty level
  - Overall experience

- **Institutional Feedback**
  - Infrastructure
  - Facilities
  - Support services
  - Overall satisfaction

### 3. Rating System
- **Multiple Rating Scales**
  - 5-star rating
  - Likert scale (Strongly Agree to Strongly Disagree)
  - Numeric scale (1-10)
  - Emoji scale (mood-based)

- **Rating Attributes**
  - Weighted ratings
  - Comparative ratings
  - Trend tracking

### 4. Feedback Quality Metrics
- **Metrics Tracking**
  - Response rate
  - Average ratings
  - Distribution analysis
  - Trend over time
  - Comparative analysis

### 5. Feedback Analysis
- **Data Analysis**
  - Sentiment analysis
  - Key feedback highlights
  - Problem identification
  - Improvement areas

- **Visualization**
  - Charts and graphs
  - Rating distribution
  - Trend lines
  - Comparative dashboards

## Database Schema

### Tables

#### `feedback_forms`
```sql
CREATE TABLE feedback_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Form type
  form_type VARCHAR(50) NOT NULL, -- TEACHER, COURSE, INSTITUTIONAL, CUSTOM
  
  -- Target
  target_id UUID, -- teacher_id, course_id, etc.
  target_type VARCHAR(50), -- TEACHER, COURSE, BATCH, ORGANIZATION
  
  -- Configuration
  is_anonymous BOOLEAN DEFAULT TRUE,
  randomize_questions BOOLEAN DEFAULT FALSE,
  
  -- Status and dates
  status VARCHAR(50) DEFAULT 'ACTIVE', -- DRAFT, ACTIVE, CLOSED, ARCHIVED
  open_from TIMESTAMP,
  open_to TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  
  UNIQUE(organization_id, id)
);
```

#### `feedback_questions`
```sql
CREATE TABLE feedback_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_form_id UUID NOT NULL REFERENCES feedback_forms(id) ON DELETE CASCADE,
  
  question_text VARCHAR(500) NOT NULL,
  question_type VARCHAR(50) NOT NULL, -- RATING, MULTIPLE_CHOICE, TEXT, DROPDOWN, SCALE
  
  -- Configuration
  is_required BOOLEAN DEFAULT TRUE,
  sequence_order INT,
  
  -- Options for multiple choice/dropdown
  options JSONB, -- Array of option objects
  
  -- Rating configuration
  rating_scale VARCHAR(50), -- FIVE_STAR, LIKERT, NUMERIC, EMOJI
  scale_min INT,
  scale_max INT,
  min_label VARCHAR(100),
  max_label VARCHAR(100),
  
  -- Weight for weighted calculation
  weight DECIMAL(3,2) DEFAULT 1.0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `feedback_responses`
```sql
CREATE TABLE feedback_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_form_id UUID NOT NULL REFERENCES feedback_forms(id) ON DELETE CASCADE,
  
  respondent_id UUID REFERENCES employees(id),
  respondent_type VARCHAR(50), -- STUDENT, PARENT, STAFF
  
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Response tracking
  is_anonymous BOOLEAN DEFAULT TRUE,
  completion_percentage INT,
  
  -- Timestamps
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `feedback_answers`
```sql
CREATE TABLE feedback_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_response_id UUID NOT NULL REFERENCES feedback_responses(id) ON DELETE CASCADE,
  feedback_question_id UUID NOT NULL REFERENCES feedback_questions(id),
  
  -- Answer data (flexible for different question types)
  answer_type VARCHAR(50) NOT NULL, -- RATING, TEXT, CHOICE
  rating_value INT, -- For rating questions
  text_answer TEXT, -- For text questions
  choice_value VARCHAR(100), -- For choice questions
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(feedback_response_id, feedback_question_id)
);
```

#### `feedback_metrics`
```sql
CREATE TABLE feedback_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_form_id UUID NOT NULL REFERENCES feedback_forms(id),
  
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Metrics
  total_responses INT DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  response_rate DECIMAL(5,2) DEFAULT 0, -- Percentage
  
  -- Distribution
  rating_distribution JSONB, -- {1: count, 2: count, ...}
  sentiment_score DECIMAL(3,2), -- -1 to 1
  
  -- Time period
  metric_date DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(feedback_form_id, metric_date)
);
```

#### `feedback_categories`
```sql
CREATE TABLE feedback_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(organization_id, name)
);
```

### Views and Queries

#### Feedback Summary by Teacher
```sql
SELECT 
  t.id as teacher_id,
  t.first_name || ' ' || t.last_name as teacher_name,
  fm.average_rating,
  fm.total_responses,
  fm.response_rate,
  fm.metric_date
FROM feedback_metrics fm
JOIN feedback_forms ff ON fm.feedback_form_id = ff.id
JOIN employees t ON ff.target_id = t.id
WHERE ff.form_type = 'TEACHER'
  AND fm.organization_id = $1
ORDER BY fm.metric_date DESC, fm.average_rating DESC;
```

## Components

### FeedbackForm
Location: `src/features/feedback/components/FeedbackForm.tsx`

**Purpose:** Display and fill feedback forms

**Props:**
```typescript
interface FeedbackFormProps {
  formId: string;
  respondentId?: string;
  onSuccess: () => void;
}
```

**Features:**
- Question display
- Response input (various types)
- Progress indicator
- Save draft option
- Submit with validation
- Thank you message

### FeedbackTemplate
Location: `src/features/feedback/components/FeedbackTemplate.tsx`

**Purpose:** Create feedback form templates

**Props:**
```typescript
interface FeedbackTemplateProps {
  organizationId: string;
  onSuccess: (template: FeedbackForm) => void;
}
```

**Features:**
- Question builder
- Add/remove questions
- Drag-to-reorder
- Question type selection
- Rating scale configuration
- Form preview

### RatingComponent
Location: `src/features/feedback/components/RatingComponent.tsx`

**Purpose:** Display rating input

**Props:**
```typescript
interface RatingComponentProps {
  scale: 'FIVE_STAR' | 'LIKERT' | 'NUMERIC' | 'EMOJI';
  minLabel?: string;
  maxLabel?: string;
  onChange: (rating: number) => void;
  value?: number;
}
```

**Features:**
- Visual rating display
- Multiple scale types
- Hover effects
- Keyboard support
- Accessibility

### FeedbackAnalysis
Location: `src/features/feedback/components/FeedbackAnalysis.tsx`

**Purpose:** Analyze and visualize feedback data

**Props:**
```typescript
interface FeedbackAnalysisProps {
  formId: string;
  organizationId: string;
  dateRange: DateRange;
}
```

**Features:**
- Rating distribution charts
- Average rating display
- Response rate
- Trend analysis
- Question-wise breakdown
- Export reports

## Services

### `feedback.service.ts`
Location: `src/features/feedback/services/feedback.service.ts`

```typescript
// Form Management
async createFeedbackForm(data: CreateFeedbackFormInput): Promise<FeedbackForm>
async getFeedbackForm(formId: string): Promise<FeedbackForm>
async updateFeedbackForm(formId: string, data: UpdateFeedbackFormInput): Promise<FeedbackForm>
async deleteFeedbackForm(formId: string): Promise<void>
async listFeedbackForms(organizationId: string, filters?: FormFilters): Promise<FeedbackForm[]>
async closeFeedbackForm(formId: string): Promise<void>

// Questions
async addQuestion(formId: string, question: QuestionInput): Promise<FeedbackQuestion>
async updateQuestion(questionId: string, question: QuestionInput): Promise<FeedbackQuestion>
async deleteQuestion(questionId: string): Promise<void>
async reorderQuestions(formId: string, order: {questionId: string, position: number}[]): Promise<void>

// Responses
async submitFeedbackResponse(formId: string, answers: AnswerInput[]): Promise<FeedbackResponse>
async getResponse(responseId: string): Promise<FeedbackResponse>
async getFormResponses(formId: string): Promise<FeedbackResponse[]>
async saveResponseDraft(formId: string, respondentId: string, answers: AnswerInput[]): Promise<void>

// Metrics & Analysis
async calculateMetrics(formId: string): Promise<FeedbackMetrics>
async getTeacherFeedbackSummary(teacherId: string, period: DateRange): Promise<TeacherFeedbackSummary>
async getCourseFeedbackSummary(courseId: string, period: DateRange): Promise<CourseFeedbackSummary>
async analyzeFeedbackTrends(organizationId: string, period: DateRange): Promise<TrendAnalysis>
async getTopIssues(organizationId: string, limit: number): Promise<FeedbackIssue[]>

// Reports
async generateFeedbackReport(formId: string, filters?: ReportFilters): Promise<FeedbackReport>
async exportFeedbackData(formId: string, format: 'CSV' | 'EXCEL' | 'PDF'): Promise<Blob>
```

### `feedbackAnalysis.service.ts`
Location: `src/features/feedback/services/feedbackAnalysis.service.ts`

```typescript
// Analysis
async performSentimentAnalysis(responses: FeedbackResponse[]): Promise<SentimentAnalysis>
async identifyTrendsAndPatterns(formId: string, period: DateRange): Promise<TrendPatterns>
async compareTeacherRatings(organizationId: string, period: DateRange): Promise<TeacherComparison>
async identifyAtRiskTeachers(organizationId: string, threshold: number): Promise<AtRiskTeacher[]>

// Visualization data
async getChartData(formId: string, period: DateRange): Promise<ChartData>
async getRatingDistribution(formId: string): Promise<Distribution>
async getTrendData(formId: string): Promise<TrendData>
```

### `feedback.queries.ts`
Location: `src/features/feedback/services/feedback.queries.ts`

```typescript
// React Query hooks
export const useFeedbackForm = (formId: string)
export const useFeedbackForms = (organizationId: string, filters?: FormFilters)
export const useFeedbackMetrics = (formId: string)
export const useFeedbackAnalysis = (formId: string, dateRange: DateRange)
export const useTeacherFeedbackSummary = (teacherId: string, period: DateRange)

// Mutations
export const useCreateFeedbackForm = ()
export const useSubmitFeedbackResponse = ()
export const useAddQuestion = ()
export const useCalculateMetrics = ()
```

## API Endpoints

### REST API (via Supabase AutoAPI)

```
GET    /rest/v1/feedback_forms?organization_id=eq.{id}
POST   /rest/v1/feedback_forms
PATCH  /rest/v1/feedback_forms/{id}
DELETE /rest/v1/feedback_forms/{id}

GET    /rest/v1/feedback_questions?feedback_form_id=eq.{id}
POST   /rest/v1/feedback_questions
PATCH  /rest/v1/feedback_questions/{id}
DELETE /rest/v1/feedback_questions/{id}

GET    /rest/v1/feedback_responses?feedback_form_id=eq.{id}
POST   /rest/v1/feedback_responses
GET    /rest/v1/feedback_responses/{id}

GET    /rest/v1/feedback_metrics?feedback_form_id=eq.{id}
POST   /rest/v1/feedback_metrics
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Students can fill feedback forms assigned to them
CREATE POLICY feedback_forms_fill ON feedback_forms
  FOR SELECT USING (
    status = 'ACTIVE'
    AND CURRENT_TIMESTAMP BETWEEN open_from AND open_to
  );

-- Teachers can view their own feedback summary
CREATE POLICY feedback_metrics_view ON feedback_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM feedback_forms ff
      WHERE ff.id = feedback_form_id
        AND ff.target_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
    ) OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('ADMIN', 'HR_MANAGER')
    )
  );

-- Only admins can create feedback forms
CREATE POLICY feedback_forms_manage ON feedback_forms
  FOR INSERT, UPDATE, DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('ADMIN', 'SUPER_ADMIN')
    )
  );
```

## Implementation Workflow

### Phase 1: Core Setup
1. Create database tables
2. Set up feedback form templates
3. Initialize default questions

### Phase 2: Form Management
1. Build FeedbackTemplate
2. Build FeedbackForm component
3. Implement form creation

### Phase 3: Response Collection
1. Implement response submission
2. Build response display
3. Add draft saving

### Phase 4: Analysis
1. Build FeedbackAnalysis component
2. Implement metrics calculation
3. Add trend analysis

### Phase 5: Reporting & Insights
1. Generate feedback reports
2. Build comparison dashboards
3. Add export functionality

## Testing Strategy

### Unit Tests
- Form validation
- Metric calculations
- Sentiment analysis
- Rating distribution

### Component Tests
- FeedbackForm rendering
- RatingComponent interaction
- FeedbackAnalysis visualization

### Integration Tests
- End-to-end feedback flow
- Metric calculation accuracy
- Report generation

## Performance Optimization

- Index on `feedback_form_id, completed_at`
- Cache metrics by form
- Batch metric calculations
- Archive old responses
- Optimize chart data queries

## Future Enhancements

- AI-powered sentiment analysis
- Predictive feedback analysis
- Automated action recommendations
- Integration with performance reviews
- Custom metric definitions
- Multi-language feedback support
- Mobile app support
- Anonymous feedback with verification
