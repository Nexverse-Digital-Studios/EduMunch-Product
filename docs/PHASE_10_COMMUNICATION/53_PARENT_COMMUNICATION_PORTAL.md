# Parent Communication Portal

## Overview
The Parent Communication Portal provides a centralized hub for parents to communicate with teachers, view their child's progress, access announcements, and manage educational interactions. This system enables two-way communication, document sharing, and progress monitoring.

## Module Objectives
- Enable parent-teacher messaging
- Provide student progress visibility
- Share educational resources
- Manage shared notes and documents
- Enable PTM scheduling access
- Facilitate academic discussions
- Track parent engagement

## Key Features

### 1. Parent-Teacher Messaging
- **Messaging System**
  - Direct messaging with teachers
  - Subject-based conversations
  - Message threads
  - File attachments
  - Read receipts

- **Message Types**
  - One-on-one messages
  - Class announcements
  - Broadcast messages
  - Scheduled messages

### 2. Student Progress Tracking
- **Progress Dashboard**
  - Current grades/marks
  - Attendance summary
  - Assignment status
  - Assessment results
  - Behavior notes

- **Progress Analytics**
  - Grade trends
  - Attendance patterns
  - Performance comparison (class average)
  - Areas of improvement

### 3. Shared Resources & Documents
- **Document Management**
  - Study materials
  - Assignment descriptions
  - Class notes
  - Important circulars
  - Report cards

- **Organization**
  - By subject
  - By date
  - By type
  - Search functionality

### 4. Communication Hub
- **Announcement Board**
  - School announcements
  - Class announcements
  - Teacher notices
  - Event information

- **Message Center**
  - Inbox management
  - Conversation history
  - Archive
  - Search

### 5. Student Monitoring
- **Activity Monitoring**
  - Assignment submissions
  - Test performances
  - Attendance marks
  - Behavioral incidents
  - Achievements

- **Alerts & Notifications**
  - Low attendance alerts
  - Missing assignments
  - Poor performance alerts
  - Positive achievements

### 6. PTM & Feedback Access
- **PTM Portal**
  - View PTM schedule
  - Request PTM
  - Reschedule meetings
  - View meeting notes
  - Access feedback

- **Feedback & Assessment**
  - View teacher feedback
  - Submit parent feedback
  - See assessment results
  - Progress reports

## Database Schema

### Tables

#### `parent_messages`
```sql
CREATE TABLE parent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Participants
  from_user_id UUID NOT NULL REFERENCES auth.users(id),
  to_user_id UUID NOT NULL REFERENCES auth.users(id),
  
  from_employee_id UUID REFERENCES employees(id),
  to_employee_id UUID REFERENCES employees(id),
  
  -- Context
  student_id UUID REFERENCES students(id), -- Which student is this about
  subject VARCHAR(255),
  message_thread_id UUID, -- For grouping messages
  
  message_body TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'DIRECT', -- DIRECT, ANNOUNCEMENT, BROADCAST
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  has_attachments BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `parent_message_threads`
```sql
CREATE TABLE parent_message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  parent_id UUID NOT NULL REFERENCES employees(id),
  teacher_id UUID NOT NULL REFERENCES employees(id),
  student_id UUID REFERENCES students(id),
  
  thread_subject VARCHAR(255),
  
  last_message_at TIMESTAMP,
  last_message_by UUID REFERENCES auth.users(id),
  
  is_archived BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `parent_progress_snapshot`
```sql
CREATE TABLE parent_progress_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Academic
  current_average_grade DECIMAL(5,2),
  attendance_percentage DECIMAL(5,2),
  
  -- Assignments
  completed_assignments INT DEFAULT 0,
  pending_assignments INT DEFAULT 0,
  overdue_assignments INT DEFAULT 0,
  
  -- Assessments
  last_assessment_date DATE,
  last_assessment_result DECIMAL(5,2),
  assessment_trend VARCHAR(50), -- IMPROVING, DECLINING, STABLE
  
  -- Behavior
  discipline_incidents INT DEFAULT 0,
  positive_notes INT DEFAULT 0,
  
  -- Engagement
  class_participation VARCHAR(50), -- HIGH, MEDIUM, LOW
  
  snapshot_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `parent_shared_notes`
```sql
CREATE TABLE parent_shared_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Relationship
  student_id UUID NOT NULL REFERENCES students(id),
  teacher_id UUID NOT NULL REFERENCES employees(id),
  
  -- Content
  note_title VARCHAR(255),
  note_content TEXT,
  note_category VARCHAR(50), -- ACADEMIC, BEHAVIORAL, PROGRESS, GENERAL
  
  -- Visibility
  is_private BOOLEAN DEFAULT FALSE, -- Only between teacher and parent
  can_edit BOOLEAN DEFAULT FALSE, -- Can parent edit?
  
  created_by UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `parent_alert_settings`
```sql
CREATE TABLE parent_alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Alert preferences
  attendance_threshold INT DEFAULT 80, -- Alert when below
  assignment_alert_enabled BOOLEAN DEFAULT TRUE,
  performance_alert_enabled BOOLEAN DEFAULT TRUE,
  behavior_alert_enabled BOOLEAN DEFAULT TRUE,
  achievement_alert_enabled BOOLEAN DEFAULT TRUE,
  
  -- Notification method
  email_alerts BOOLEAN DEFAULT TRUE,
  sms_alerts BOOLEAN DEFAULT FALSE,
  app_alerts BOOLEAN DEFAULT TRUE,
  
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_start_time TIME,
  quiet_end_time TIME,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `parent_resource_access`
```sql
CREATE TABLE parent_resource_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Resource
  resource_id UUID NOT NULL REFERENCES study_materials(id), -- Or other resource table
  resource_type VARCHAR(50), -- STUDY_MATERIAL, ASSIGNMENT, CLASS_NOTE, CIRCULAR
  
  resource_title VARCHAR(255),
  resource_url TEXT,
  
  -- Metadata
  subject_id UUID REFERENCES subjects(id),
  topic_id UUID REFERENCES topics(id),
  
  shared_date DATE,
  expiry_date DATE,
  
  shared_by UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `parent_engagement_log`
```sql
CREATE TABLE parent_engagement_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Activity
  activity_type VARCHAR(50), -- VIEWED_PROGRESS, VIEWED_ASSIGNMENT, RESPONDED_TO_MESSAGE, ATTENDED_PTM, SUBMITTED_FEEDBACK
  
  description TEXT,
  
  activity_date TIMESTAMP DEFAULT NOW()
);
```

### Views and Queries

#### Parent Progress Dashboard
```sql
SELECT 
  p.id as parent_id,
  s.id as student_id,
  CONCAT(s.first_name, ' ', s.last_name) as student_name,
  pps.current_average_grade,
  pps.attendance_percentage,
  pps.completed_assignments,
  pps.pending_assignments,
  pps.overdue_assignments,
  pps.assessment_trend,
  pps.snapshot_date
FROM parent_progress_snapshot pps
JOIN students s ON pps.student_id = s.id
JOIN employees p ON s.guardian_id = p.id
WHERE pps.organization_id = $1
  AND pps.snapshot_date = CURRENT_DATE
ORDER BY p.id, s.id;
```

#### Recent Messages
```sql
SELECT 
  pmt.id,
  CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
  CONCAT(st.first_name, ' ', st.last_name) as student_name,
  pmt.thread_subject,
  pmt.last_message_at,
  pmt.is_archived
FROM parent_message_threads pmt
JOIN employees t ON pmt.teacher_id = t.id
JOIN students st ON pmt.student_id = st.id
WHERE pmt.organization_id = $1
  AND pmt.is_archived = FALSE
ORDER BY pmt.last_message_at DESC;
```

## Components

### ParentPortalDashboard
Location: `src/features/parent-portal/components/ParentPortalDashboard.tsx`

**Purpose:** Main parent portal landing page

**Props:**
```typescript
interface ParentPortalDashboardProps {
  parentId: string;
  organizationId: string;
}
```

**Features:**
- Quick stats (grades, attendance)
- Recent messages
- Alerts summary
- PTM schedule
- Quick actions

### StudentProgressView
Location: `src/features/parent-portal/components/StudentProgressView.tsx`

**Purpose:** Detailed student progress dashboard

**Props:**
```typescript
interface StudentProgressViewProps {
  studentId: string;
  parentId: string;
}
```

**Features:**
- Grade trends chart
- Attendance visual
- Assignment tracker
- Assessment results
- Behavior notes

### MessageCenter
Location: `src/features/parent-portal/components/MessageCenter.tsx`

**Purpose:** Parent-teacher messaging interface

**Props:**
```typescript
interface MessageCenterProps {
  parentId: string;
  organizationId: string;
}
```

**Features:**
- Conversation list
- Message composition
- File attachment
- Read status
- Archive/delete

### SharedNotes
Location: `src/features/parent-portal/components/SharedNotes.tsx`

**Purpose:** View shared notes and documents

**Props:**
```typescript
interface SharedNotesProps {
  studentId: string;
  organizationId: string;
}
```

**Features:**
- Notes list with filters
- Note details view
- Download resources
- Comments on notes
- Collaborative editing

### StudentMonitoringBoard
Location: `src/features/parent-portal/components/StudentMonitoringBoard.tsx`

**Purpose:** Monitor student activities and alerts

**Props:**
```typescript
interface StudentMonitoringBoardProps {
  studentId: string;
  organizationId: string;
}
```

**Features:**
- Activity timeline
- Alerts display
- Achievement showcase
- Recent communications
- Alert management

## Services

### `parentPortal.service.ts`
Location: `src/features/parent-portal/services/parentPortal.service.ts`

```typescript
// Progress Tracking
async getStudentProgress(studentId: string): Promise<StudentProgress>
async getProgressSnapshot(studentId: string, date?: Date): Promise<ProgressSnapshot>
async getGradeTrends(studentId: string, daysBack?: number): Promise<GradeTrend[]>
async getAttendanceTrends(studentId: string, monthsBack?: number): Promise<AttendanceTrend[]>

// Messaging
async getMessageThreads(parentId: string): Promise<MessageThread[]>
async getMessages(threadId: string, limit?: number): Promise<ParentMessage[]>
async sendMessage(threadId: string, message: string, attachments?: File[]): Promise<void>
async markAsRead(messageId: string): Promise<void>
async archiveThread(threadId: string): Promise<void>

// Notes & Resources
async getSharedNotes(studentId: string, filter?: string): Promise<SharedNote[]>
async getNoteDetails(noteId: string): Promise<SharedNote>
async downloadResource(resourceId: string): Promise<Blob>
async getResourcesBySubject(studentId: string, subjectId: string): Promise<Resource[]>

// Alerts & Monitoring
async getAlerts(parentId: string): Promise<Alert[]>
async getProgressAlerts(studentId: string): Promise<ProgressAlert[]>
async updateAlertSettings(parentId: string, settings: AlertSettings): Promise<void>
async dismissAlert(alertId: string): Promise<void>

// Activity
async getActivityLog(studentId: string): Promise<ActivityLog[]>
async logEngagement(parentId: string, activityType: string): Promise<void>

// PTM Access
async getPTMSchedule(parentId: string, studentId: string): Promise<PTMSchedule[]>
async requestPTM(data: PTMRequestInput): Promise<void>
async getMeetingNotes(ptmScheduleId: string): Promise<MeetingNotes>

// Analytics
async getParentEngagement(organizationId: string): Promise<EngagementStats>
async getMessageStats(organizationId: string): Promise<MessageStats>
```

### `parentPortal.queries.ts`
Location: `src/features/parent-portal/services/parentPortal.queries.ts`

```typescript
// React Query hooks
export const useStudentProgress = (studentId: string)
export const useMessageThreads = (parentId: string)
export const useMessages = (threadId: string)
export const useSharedNotes = (studentId: string)
export const useAlerts = (parentId: string)
export const useProgressAlerts = (studentId: string)
export const useActivityLog = (studentId: string)
export const usePTMSchedule = (parentId: string, studentId: string)

// Mutations
export const useSendMessage = ()
export const useUpdateAlertSettings = ()
export const useRequestPTM = ()
export const useMarkAsRead = ()
export const useArchiveThread = ()
```

## API Endpoints

### REST API (via Supabase AutoAPI)

```
GET    /rest/v1/parent_messages?organization_id=eq.{id}
POST   /rest/v1/parent_messages
PATCH  /rest/v1/parent_messages/{id}

GET    /rest/v1/parent_message_threads?parent_id=eq.{id}
POST   /rest/v1/parent_message_threads
PATCH  /rest/v1/parent_message_threads/{id}

GET    /rest/v1/parent_progress_snapshot?student_id=eq.{id}
POST   /rest/v1/parent_progress_snapshot

GET    /rest/v1/parent_shared_notes?student_id=eq.{id}
POST   /rest/v1/parent_shared_notes
PATCH  /rest/v1/parent_shared_notes/{id}

GET    /rest/v1/parent_alert_settings?parent_id=eq.{id}
POST   /rest/v1/parent_alert_settings
PATCH  /rest/v1/parent_alert_settings/{id}

GET    /rest/v1/parent_resource_access?student_id=eq.{id}
POST   /rest/v1/parent_resource_access

GET    /rest/v1/parent_engagement_log?parent_id=eq.{id}
POST   /rest/v1/parent_engagement_log
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Parents can only view their child's information
CREATE POLICY parent_progress_view ON parent_progress_snapshot
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM students 
      WHERE guardian_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
    )
  );

-- Parents can view messages they're part of
CREATE POLICY parent_messages_view ON parent_messages
  FOR SELECT USING (
    from_user_id = auth.uid()
    OR to_user_id = auth.uid()
  );

-- Parents can only modify their own alert settings
CREATE POLICY parent_alert_settings_manage ON parent_alert_settings
  FOR ALL USING (
    parent_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
  );
```

## Implementation Workflow

### Phase 1: Core Setup
1. Create database tables
2. Set up notification templates
3. Initialize parent portal access

### Phase 2: Progress Tracking
1. Build StudentProgressView
2. Implement progress calculations
3. Add to portal dashboard

### Phase 3: Messaging System
1. Build MessageCenter
2. Implement message service
3. Add notification triggers

### Phase 4: Resources & Notes
1. Build SharedNotes
2. Implement resource sharing
3. Add document management

### Phase 5: Monitoring & Engagement
1. Build StudentMonitoringBoard
2. Implement alert system
3. Generate engagement reports

## Testing Strategy

### Unit Tests
- Progress calculation
- Alert generation
- Message routing
- Permission checks

### Component Tests
- Dashboard rendering
- Message composition
- Progress display
- Alert notification

### Integration Tests
- End-to-end messaging
- Progress tracking workflow
- Alert delivery

## Performance Optimization

- Cache progress snapshots
- Index on `student_id, snapshot_date`
- Index on `parent_id, created_at`
- Pagination for long lists
- Archive old messages

## Future Enhancements

- Video call integration
- Screen sharing for homework help
- AI-powered progress predictions
- Mobile app with push notifications
- Social learning features
- Student goal setting and tracking
- Recommendation engine for resources
