# Doubts & Q&A System

## Overview
The Doubts & Q&A System provides a platform for students to ask academic questions and get responses from teachers. This system includes doubt categorization, teacher response management, conversation threading, and resolution tracking.

## Module Objectives
- Enable students to post academic doubts
- Organize doubts by subject/topic
- Facilitate teacher responses
- Track doubt resolution
- Maintain conversation history
- Support collaborative learning

## Key Features

### 1. Doubt Creation
- **Doubt Posting**
  - Title and detailed description
  - Subject and topic selection
  - Attachment support (images, PDFs)
  - Priority level
  - Urgency indicator

- **Doubt Details**
  - Student information
  - Timestamp
  - Status tracking
  - Attachments
  - Related topics/chapters

### 2. Doubt Categorization
- **Subject-wise Classification**
  - Link to subjects
  - Topic/chapter selection
  - Sub-topic tagging
  - Custom tags

- **Doubt Types**
  - Conceptual doubts
  - Problem-solving doubts
  - Assignment-related doubts
  - Exam preparation doubts
  - Practical doubts

### 3. Teacher Response System
- **Response Management**
  - Teacher response to doubt
  - Detailed explanations
  - Attachment support
  - Step-by-step solutions
  - Resource links

- **Response Features**
  - Multiple responses per doubt (for discussion)
  - Response editing capability
  - Response deletion
  - Response marking as helpful

### 4. Conversation Threading
- **Thread Management**
  - Parent doubt with child responses
  - Follow-up questions/comments
  - Threaded conversation view
  - Chronological ordering

- **Discussion Features**
  - Comment-style interactions
  - Mention functionality (@teacher)
  - Real-time updates
  - Notification on responses

### 5. Doubt Resolution Tracking
- **Status Management**
  - OPEN: New doubt
  - IN_PROGRESS: Under review
  - RESOLVED: Answered satisfactorily
  - PARTIALLY_RESOLVED: Partially answered
  - CLOSED: No longer active

- **Resolution Indicators**
  - Mark as resolved by student
  - Student satisfaction rating
  - Teacher confirmation of closure
  - Resolution timestamp

### 6. Analytics & Insights
- **Tracking Metrics**
  - Average resolution time
  - Frequently asked topics
  - Teacher response rate
  - Student satisfaction

## Database Schema

### Tables

#### `doubts`
```sql
CREATE TABLE doubts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES employees(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  batch_id UUID REFERENCES batches(id),
  
  -- Content
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  
  -- Classification
  subject_id UUID REFERENCES subjects(id),
  topic_id UUID REFERENCES topics(id),
  doubt_type VARCHAR(50), -- CONCEPTUAL, PROBLEM, ASSIGNMENT, EXAM, PRACTICAL
  
  -- Metadata
  priority VARCHAR(50) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
  is_urgent BOOLEAN DEFAULT FALSE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED, PARTIALLY_RESOLVED, CLOSED
  resolution_notes TEXT,
  resolved_at TIMESTAMP,
  
  -- Feedback
  student_satisfaction INT, -- 1-5 rating
  helpful_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  
  UNIQUE(organization_id, id)
);
```

#### `doubt_responses`
```sql
CREATE TABLE doubt_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doubt_id UUID NOT NULL REFERENCES doubts(id) ON DELETE CASCADE,
  
  teacher_id UUID NOT NULL REFERENCES employees(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Content
  response_text TEXT NOT NULL,
  
  -- Metadata
  is_official_answer BOOLEAN DEFAULT FALSE,
  response_type VARCHAR(50) DEFAULT 'ANSWER', -- ANSWER, CLARIFICATION, HINT, REFERENCE
  
  -- Feedback
  is_helpful_to_student BOOLEAN,
  student_rating INT, -- 1-5 rating
  helpful_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);
```

#### `doubt_attachments`
```sql
CREATE TABLE doubt_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doubt_id UUID REFERENCES doubts(id) ON DELETE CASCADE,
  response_id UUID REFERENCES doubt_responses(id) ON DELETE CASCADE,
  
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size INT,
  
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

#### `doubt_comments`
```sql
CREATE TABLE doubt_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doubt_id UUID NOT NULL REFERENCES doubts(id) ON DELETE CASCADE,
  response_id UUID REFERENCES doubt_responses(id) ON DELETE CASCADE,
  
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_type VARCHAR(50), -- STUDENT, TEACHER, OTHER
  
  comment TEXT NOT NULL,
  
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `doubt_reactions`
```sql
CREATE TABLE doubt_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  doubt_id UUID REFERENCES doubts(id) ON DELETE CASCADE,
  response_id UUID REFERENCES doubt_responses(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES doubt_comments(id) ON DELETE CASCADE,
  
  reaction_type VARCHAR(50) NOT NULL, -- HELPFUL, THUMBS_UP, STAR, etc.
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, doubt_id, response_id, comment_id, reaction_type)
);
```

#### `doubt_notifications`
```sql
CREATE TABLE doubt_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doubt_id UUID NOT NULL REFERENCES doubts(id) ON DELETE CASCADE,
  
  recipient_id UUID NOT NULL REFERENCES employees(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  notification_type VARCHAR(50), -- NEW_RESPONSE, NEW_COMMENT, DOUBT_RESOLVED, STATUS_CHANGED
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `doubt_mentions`
```sql
CREATE TABLE doubt_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doubt_id UUID REFERENCES doubts(id) ON DELETE CASCADE,
  response_id UUID REFERENCES doubt_responses(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES doubt_comments(id) ON DELETE CASCADE,
  
  mentioned_user_id UUID NOT NULL REFERENCES employees(id),
  mentioned_by UUID NOT NULL REFERENCES auth.users(id),
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Views and Queries

#### Student's Doubts Summary
```sql
SELECT 
  d.id,
  d.title,
  d.status,
  d.priority,
  s.name as subject_name,
  COUNT(dr.id) as response_count,
  MAX(dr.created_at) as last_response_at,
  d.created_at
FROM doubts d
LEFT JOIN subjects s ON d.subject_id = s.id
LEFT JOIN doubt_responses dr ON d.id = dr.doubt_id
WHERE d.student_id = $1
GROUP BY d.id, d.title, d.status, d.priority, s.name, d.created_at
ORDER BY d.created_at DESC;
```

#### Pending Doubts for Teacher
```sql
SELECT 
  d.id,
  d.title,
  e.first_name || ' ' || e.last_name as student_name,
  s.name as subject_name,
  d.priority,
  d.created_at,
  COUNT(dr.id) as response_count
FROM doubts d
JOIN employees e ON d.student_id = e.id
LEFT JOIN subjects s ON d.subject_id = s.id
LEFT JOIN doubt_responses dr ON d.id = dr.doubt_id
WHERE d.status IN ('OPEN', 'IN_PROGRESS')
  AND s.id IN (
    SELECT subject_id FROM teacher_subjects 
    WHERE teacher_id = $1
  )
GROUP BY d.id, d.title, e.first_name, e.last_name, s.name, d.priority, d.created_at
ORDER BY d.priority DESC, d.created_at ASC;
```

## Components

### DoubtForm
Location: `src/features/doubts/components/DoubtForm.tsx`

**Purpose:** Create and post new doubts

**Props:**
```typescript
interface DoubtFormProps {
  studentId: string;
  organizationId: string;
  batchId?: string;
  onSuccess: (doubt: Doubt) => void;
}
```

**Features:**
- Title and description input
- Subject and topic selection
- Attachment upload
- Priority selection
- Save as draft
- Auto-save

### DoubtList
Location: `src/features/doubts/components/DoubtList.tsx`

**Purpose:** Display doubts with filtering

**Props:**
```typescript
interface DoubtListProps {
  organizationId: string;
  studentId?: string;
  filters?: DoubtFilters;
  onSelectDoubt: (doubt: Doubt) => void;
}
```

**Features:**
- Filterable doubt list
- Filter by status, subject, priority
- Search functionality
- Sort options
- Pagination

### DoubtDetail
Location: `src/features/doubts/components/DoubtDetail.tsx`

**Purpose:** View complete doubt with responses

**Props:**
```typescript
interface DoubtDetailProps {
  doubtId: string;
  onBack: () => void;
}
```

**Features:**
- Doubt details display
- Response thread
- Comments section
- Attachment preview
- Mark as resolved option
- Rating system

### ConversationThread
Location: `src/features/doubts/components/ConversationThread.tsx`

**Purpose:** Display and manage doubt responses

**Props:**
```typescript
interface ConversationThreadProps {
  doubtId: string;
  organizationId: string;
}
```

**Features:**
- Threaded response display
- Chronological ordering
- Comment addition
- Mention functionality
- Reaction system
- Edit/delete options

### DoubtResponseForm
Location: `src/features/doubts/components/DoubtResponseForm.tsx`

**Purpose:** Add responses to doubts

**Props:**
```typescript
interface DoubtResponseFormProps {
  doubtId: string;
  teacherId: string;
  onSuccess: () => void;
}
```

**Features:**
- Rich text editor
- Attachment upload
- Response type selection
- Official answer option
- Preview before posting

## Services

### `doubt.service.ts`
Location: `src/features/doubts/services/doubt.service.ts`

```typescript
// Doubt Management
async createDoubt(data: CreateDoubtInput): Promise<Doubt>
async getDoubt(doubtId: string): Promise<Doubt>
async updateDoubt(doubtId: string, data: UpdateDoubtInput): Promise<Doubt>
async deleteDoubt(doubtId: string): Promise<void>
async listDoubts(organizationId: string, filters?: DoubtFilters): Promise<Doubt[]>
async getStudentDoubts(studentId: string): Promise<Doubt[]>
async getTeacherDoubts(teacherId: string): Promise<Doubt[]>

// Status Management
async updateDoubtStatus(doubtId: string, status: DoubtStatus): Promise<void>
async markAsResolved(doubtId: string, resolutionNotes?: string): Promise<void>
async closeDoubt(doubtId: string): Promise<void>
async reopenDoubt(doubtId: string): Promise<void>

// Attachments
async uploadAttachment(doubtId: string, file: File): Promise<DoubtAttachment>
async getAttachments(doubtId: string): Promise<DoubtAttachment[]>
async deleteAttachment(attachmentId: string): Promise<void>

// Notifications
async getUnreadCount(userId: string, organizationId: string): Promise<number>
async markNotificationAsRead(notificationId: string): Promise<void>
async getPendingDoubts(teacherId: string, subjectId?: string): Promise<Doubt[]>
```

### `doubtResponse.service.ts`
Location: `src/features/doubts/services/doubtResponse.service.ts`

```typescript
// Response Management
async createResponse(doubtId: string, data: CreateResponseInput): Promise<DoubtResponse>
async updateResponse(responseId: string, data: UpdateResponseInput): Promise<DoubtResponse>
async deleteResponse(responseId: string): Promise<void>
async getResponses(doubtId: string): Promise<DoubtResponse[]>

// Response Feedback
async markAsHelpful(responseId: string): Promise<void>
async removeHelpfulMark(responseId: string): Promise<void>
async rateResponse(responseId: string, rating: number): Promise<void>

// Comments
async addComment(doubtId: string, comment: string, responseId?: string): Promise<DoubtComment>
async getComments(doubtId: string): Promise<DoubtComment[]>
async deleteComment(commentId: string): Promise<void>

// Reactions
async addReaction(targetId: string, reactionType: string, targetType: string): Promise<void>
async removeReaction(targetId: string, reactionType: string): Promise<void>
async getReactions(targetId: string): Promise<DoubtReaction[]>

// Mentions
async mentionUser(content: string, doubtId: string): Promise<MentionResult>
async getNotifications(userId: string, organizationId: string): Promise<DoubtNotification[]>
```

### `doubt.queries.ts`
Location: `src/features/doubts/services/doubt.queries.ts`

```typescript
// React Query hooks
export const useDoubt = (doubtId: string)
export const useStudentDoubts = (studentId: string)
export const useTeacherDoubts = (teacherId: string)
export const useDoubtResponses = (doubtId: string)
export const usePendingDoubts = (teacherId: string)
export const useDoubtNotifications = (userId: string, organizationId: string)

// Mutations
export const useCreateDoubt = ()
export const useCreateResponse = ()
export const useMarkAsResolved = ()
export const useAddComment = ()
export const useMarkAsHelpful = ()
export const useMentionUser = ()
```

## API Endpoints

### REST API (via Supabase AutoAPI)

```
GET    /rest/v1/doubts?organization_id=eq.{id}
GET    /rest/v1/doubts/{id}
POST   /rest/v1/doubts
PATCH  /rest/v1/doubts/{id}
DELETE /rest/v1/doubts/{id}

GET    /rest/v1/doubt_responses?doubt_id=eq.{id}
POST   /rest/v1/doubt_responses
PATCH  /rest/v1/doubt_responses/{id}
DELETE /rest/v1/doubt_responses/{id}

GET    /rest/v1/doubt_comments?doubt_id=eq.{id}
POST   /rest/v1/doubt_comments
DELETE /rest/v1/doubt_comments/{id}

POST   /rest/v1/doubt_reactions
DELETE /rest/v1/doubt_reactions/{id}

GET    /rest/v1/doubt_attachments?doubt_id=eq.{id}
POST   /rest/v1/doubt_attachments
DELETE /rest/v1/doubt_attachments/{id}
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Students can view all doubts, see their own details
CREATE POLICY doubts_view ON doubts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.student_id = (SELECT student_id FROM doubts d WHERE d.id = doubts.id)
        AND e.batch_id = batch_id
    ) OR student_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
  );

-- Teachers can view doubts in their subject
CREATE POLICY doubts_teacher_view ON doubts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM batch_subjects bs
      JOIN subject_teachers st ON bs.subject_id = st.subject_id
      WHERE bs.batch_id = doubts.batch_id
        AND st.teacher_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
    )
  );

-- Only teachers can respond
CREATE POLICY doubt_responses_create ON doubt_responses
  FOR INSERT USING (
    EXISTS (
      SELECT 1 FROM batch_subjects bs
      WHERE bs.batch_id = (SELECT batch_id FROM doubts WHERE doubts.id = doubt_id)
    )
  );
```

## Implementation Workflow

### Phase 1: Core Setup
1. Create database tables
2. Set up basic queries
3. Initialize doubt categories

### Phase 2: Doubt Management
1. Build DoubtForm
2. Build DoubtList
3. Build DoubtDetail

### Phase 3: Response System
1. Build DoubtResponseForm
2. Build ConversationThread
3. Implement response logic

### Phase 4: Discussion Features
1. Add comment system
2. Add mention functionality
3. Add reaction system

### Phase 5: Notifications & Analytics
1. Implement doubt notifications
2. Add analytics dashboard
3. Build teacher dashboard

## Testing Strategy

### Unit Tests
- Doubt creation and validation
- Status change logic
- Mention detection
- Attachment handling

### Component Tests
- Form validation
- Thread rendering
- Comment interaction
- Mention UI

### Integration Tests
- End-to-end doubt posting
- Response workflow
- Notification flow

## Performance Optimization

- Index on `student_id, status, created_at`
- Index on `batch_id, status` for teacher queries
- Cache frequently asked topics
- Implement pagination for thread views

## Future Enhancements

- AI-powered doubt categorization
- Suggested answers from similar doubts
- Peer-to-peer doubt resolution
- Integration with video explanations
- Analytics on frequently asked topics
- Expert teacher assignment
- Mobile app support
