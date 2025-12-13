# Parent-Teacher Meetings (PTM)

## Overview
The Parent-Teacher Meetings module facilitates scheduling and management of meetings between parents and teachers. This system enables slot availability management, automated scheduling, attendance tracking, and meeting notes documentation.

## Module Objectives
- Enable PTM request creation
- Manage teacher availability for meetings
- Automate PTM scheduling
- Track meeting attendance
- Document meeting outcomes
- Send notifications and reminders

## Key Features

### 1. PTM Request Creation
- **Request Interface**
  - Parent/student selection
  - Purpose of meeting
  - Preferred date/time slots
  - Topic/concerns to discuss
  - Documents to bring

- **Request Types**
  - Routine PTM
  - Performance discussion
  - Behavioral concerns
  - Admission/enrollment discussion
  - Progress review

### 2. Teacher Availability
- **Availability Slots**
  - Time slots per teacher
  - Meeting duration (e.g., 15 min, 30 min)
  - Buffer time between meetings
  - Lunch break exclusion
  - Recurring availability (e.g., Tuesdays 3-4 PM)

- **Bulk Availability**
  - Upload availability calendar
  - Import from Google Calendar
  - Auto-generate slots

### 3. PTM Scheduling
- **Automatic Scheduling**
  - Match parent preferred slots with teacher availability
  - Suggest alternate slots
  - Send confirmation
  - Calendar invites

- **Manual Scheduling**
  - Admin override capability
  - Reschedule option
  - Cancellation management

### 4. Meeting Management
- **Meeting Details**
  - Date, time, location
  - Participants
  - Meeting agenda/topics
  - Pre-meeting documents

- **Attendance Tracking**
  - Parent attended/no-show
  - Teacher present
  - Duration of meeting
  - Attendees recorded

### 5. Meeting Documentation
- **Notes Management**
  - Meeting notes
  - Points discussed
  - Action items
  - Follow-up required
  - Next meeting date

- **Document Sharing**
  - Attach documents
  - Share notes with parent
  - Upload recordings (if recorded)

### 6. Communication & Reminders
- **Automated Notifications**
  - Confirmation messages
  - Reminders (1 day before, 1 hour before)
  - Reschedule notifications
  - Completion feedback

## Database Schema

### Tables

#### `ptm_requests`
```sql
CREATE TABLE ptm_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Requestor
  requested_by UUID NOT NULL REFERENCES employees(id), -- Parent/Student
  requested_for UUID REFERENCES employees(id), -- Which student (if parent)
  
  -- Teacher
  teacher_id UUID NOT NULL REFERENCES employees(id),
  
  -- Content
  request_type VARCHAR(50) NOT NULL, -- ROUTINE, PERFORMANCE, BEHAVIORAL, ADMISSION, PROGRESS
  purpose TEXT,
  topics JSONB, -- Array of topics to discuss
  
  -- Status
  status VARCHAR(50) DEFAULT 'REQUESTED', -- REQUESTED, SCHEDULED, CONFIRMED, COMPLETED, CANCELLED
  
  -- Scheduling
  preferred_dates JSONB, -- Array of preferred date-times
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);
```

#### `ptm_schedule`
```sql
CREATE TABLE ptm_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptm_request_id UUID NOT NULL REFERENCES ptm_requests(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Meeting details
  meeting_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Location
  location VARCHAR(100), -- Room number, online link, etc.
  meeting_mode VARCHAR(50) DEFAULT 'IN_PERSON', -- IN_PERSON, ONLINE, PHONE
  meeting_link TEXT, -- For online meetings
  
  -- Participants
  parent_id UUID NOT NULL REFERENCES employees(id),
  teacher_id UUID NOT NULL REFERENCES employees(id),
  student_id UUID REFERENCES employees(id),
  
  -- Confirmation
  is_confirmed BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMP,
  
  -- Attendance
  status VARCHAR(50) DEFAULT 'SCHEDULED', -- SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
  parent_attended BOOLEAN,
  teacher_attended BOOLEAN,
  actual_start_time TIMESTAMP,
  actual_end_time TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `teacher_availability`
```sql
CREATE TABLE teacher_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Time slot
  day_of_week INT NOT NULL, -- 0-6 (Sunday-Saturday)
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INT DEFAULT 30,
  
  -- Recurring
  is_recurring BOOLEAN DEFAULT TRUE,
  recurrence_end_date DATE,
  
  -- Exceptions
  is_available BOOLEAN DEFAULT TRUE,
  unavailable_reason TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `ptm_specific_slots`
```sql
CREATE TABLE ptm_specific_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  is_available BOOLEAN DEFAULT TRUE,
  is_booked BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(teacher_id, slot_date, start_time)
);
```

#### `ptm_meeting_notes`
```sql
CREATE TABLE ptm_meeting_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptm_schedule_id UUID NOT NULL REFERENCES ptm_schedule(id) ON DELETE CASCADE,
  
  -- Content
  discussion_points TEXT,
  student_progress TEXT,
  areas_of_concern TEXT,
  strengths_identified TEXT,
  action_items JSONB, -- Array of {item, owner, due_date}
  
  follow_up_required BOOLEAN DEFAULT FALSE,
  next_meeting_date DATE,
  
  -- Document
  notes_by UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `ptm_attachments`
```sql
CREATE TABLE ptm_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptm_schedule_id UUID REFERENCES ptm_schedule(id) ON DELETE CASCADE,
  ptm_request_id UUID REFERENCES ptm_requests(id) ON DELETE CASCADE,
  
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

### Views and Queries

#### Upcoming PTM Schedule
```sql
SELECT 
  ps.id,
  ps.meeting_date,
  ps.start_time,
  CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
  CONCAT(p.first_name, ' ', p.last_name) as parent_name,
  ps.meeting_mode,
  ps.location
FROM ptm_schedule ps
JOIN employees t ON ps.teacher_id = t.id
JOIN employees p ON ps.parent_id = p.id
WHERE ps.organization_id = $1
  AND ps.meeting_date >= CURRENT_DATE
  AND ps.status = 'SCHEDULED'
ORDER BY ps.meeting_date, ps.start_time;
```

## Components

### PTMForm
Location: `src/features/ptm/components/PTMForm.tsx`

**Purpose:** Create PTM requests

**Props:**
```typescript
interface PTMFormProps {
  parentId: string;
  organizationId: string;
  onSuccess: (request: PTMRequest) => void;
}
```

**Features:**
- Teacher selection
- Request type selection
- Purpose/topics input
- Preferred dates
- Document attachment
- Submit confirmation

### PTMScheduler
Location: `src/features/ptm/components/PTMScheduler.tsx`

**Purpose:** Schedule approved PTM requests

**Props:**
```typescript
interface PTMSchedulerProps {
  requestId: string;
  organizationId: string;
  onSuccess: () => void;
}
```

**Features:**
- Teacher availability display
- Slot selection
- Automatic slot matching
- Alternate suggestions
- Confirmation and notification

### SlotSelector
Location: `src/features/ptm/components/SlotSelector.tsx`

**Purpose:** Select from available time slots

**Props:**
```typescript
interface SlotSelectorProps {
  teacherId: string;
  startDate: Date;
  endDate: Date;
  slotDuration: number;
  onSelect: (slot: TimeSlot) => void;
}
```

**Features:**
- Calendar view
- Available slots highlight
- Slot selection
- Conflict detection

### MeetingDetail
Location: `src/features/ptm/components/MeetingDetail.tsx`

**Purpose:** View meeting details and manage outcomes

**Props:**
```typescript
interface MeetingDetailProps {
  scheduleId: string;
  onBack: () => void;
}
```

**Features:**
- Meeting information
- Participant details
- Meeting notes
- Attachment viewing
- Action items tracking
- Attendance recording

## Services

### `ptm.service.ts`
Location: `src/features/ptm/services/ptm.service.ts`

```typescript
// PTM Requests
async createPTMRequest(data: CreatePTMRequestInput): Promise<PTMRequest>
async getPTMRequest(requestId: string): Promise<PTMRequest>
async listPTMRequests(organizationId: string, filters?: PTMFilters): Promise<PTMRequest[]>
async approvePTMRequest(requestId: string): Promise<void>
async rejectPTMRequest(requestId: string, reason: string): Promise<void>
async cancelPTMRequest(requestId: string): Promise<void>

// Scheduling
async schedulePTM(requestId: string, scheduleData: SchedulePTMInput): Promise<PTMSchedule>
async reschedule(scheduleId: string, newDate: Date, newTime: Time): Promise<void>
async confirmPTM(scheduleId: string): Promise<void>
async markNoShow(scheduleId: string): Promise<void>

// Availability Management
async setTeacherAvailability(data: TeacherAvailabilityInput): Promise<void>
async getTeacherAvailability(teacherId: string, startDate: Date, endDate: Date): Promise<TimeSlot[]>
async getAvailableSlots(teacherId: string, startDate: Date, endDate: Date): Promise<AvailableSlot[]>
async bulkSetAvailability(teacherId: string, file: File): Promise<void>

// Meeting Notes
async createMeetingNotes(scheduleId: string, notes: MeetingNotesInput): Promise<PTMMeetingNotes>
async updateMeetingNotes(notesId: string, notes: MeetingNotesInput): Promise<PTMMeetingNotes>
async getMeetingNotes(scheduleId: string): Promise<PTMMeetingNotes>

// Attachments
async uploadAttachment(scheduleId: string, file: File): Promise<PTMAttachment>
async getAttachments(scheduleId: string): Promise<PTMAttachment[]>
async deleteAttachment(attachmentId: string): Promise<void>

// Notifications
async sendPTMConfirmation(scheduleId: string): Promise<void>
async sendReminders(organizationId: string): Promise<void>
async sendMeetingNotes(scheduleId: string): Promise<void>

// Analytics
async getPTMStats(organizationId: string, period: DateRange): Promise<PTMStats>
async getTeacherPTMSummary(teacherId: string, period: DateRange): Promise<PTMSummary>
```

### `ptm.queries.ts`
Location: `src/features/ptm/services/ptm.queries.ts`

```typescript
// React Query hooks
export const usePTMRequest = (requestId: string)
export const usePTMRequests = (organizationId: string, filters?: PTMFilters)
export const useTeacherAvailability = (teacherId: string, startDate: Date, endDate: Date)
export const useUpcomingPTMs = (organizationId: string)
export const useMyPTMSchedule = (userId: string, organizationId: string)

// Mutations
export const useCreatePTMRequest = ()
export const useSchedulePTM = ()
export const useConfirmPTM = ()
export const useCreateMeetingNotes = ()
export const useUploadAttachment = ()
```

## API Endpoints

### REST API (via Supabase AutoAPI)

```
GET    /rest/v1/ptm_requests?organization_id=eq.{id}
POST   /rest/v1/ptm_requests
PATCH  /rest/v1/ptm_requests/{id}
DELETE /rest/v1/ptm_requests/{id}

GET    /rest/v1/ptm_schedule?organization_id=eq.{id}
POST   /rest/v1/ptm_schedule
PATCH  /rest/v1/ptm_schedule/{id}

GET    /rest/v1/teacher_availability?teacher_id=eq.{id}
POST   /rest/v1/teacher_availability
PATCH  /rest/v1/teacher_availability/{id}
DELETE /rest/v1/teacher_availability/{id}

GET    /rest/v1/ptm_specific_slots?teacher_id=eq.{id}
POST   /rest/v1/ptm_specific_slots

GET    /rest/v1/ptm_meeting_notes?ptm_schedule_id=eq.{id}
POST   /rest/v1/ptm_meeting_notes
PATCH  /rest/v1/ptm_meeting_notes/{id}

POST   /rest/v1/ptm_attachments
DELETE /rest/v1/ptm_attachments/{id}
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Parents can view their own PTM requests and schedules
CREATE POLICY ptm_requests_view ON ptm_requests
  FOR SELECT USING (
    requested_by = (SELECT id FROM employees WHERE auth.uid() = user_id)
  );

-- Teachers can view requests assigned to them
CREATE POLICY ptm_requests_teacher_view ON ptm_requests
  FOR SELECT USING (
    teacher_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
  );

-- Only teachers can set their availability
CREATE POLICY teacher_availability_manage ON teacher_availability
  FOR ALL USING (
    teacher_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
  );
```

## Implementation Workflow

### Phase 1: Core Setup
1. Create database tables
2. Set up notification templates
3. Initialize default configurations

### Phase 2: Request Management
1. Build PTMForm
2. Implement request workflow
3. Add to parent portal

### Phase 3: Availability & Scheduling
1. Build SlotSelector
2. Implement availability management
3. Build PTMScheduler

### Phase 4: Meeting Management
1. Build MeetingDetail
2. Implement meeting notes
3. Add attendance tracking

### Phase 5: Notifications & Analytics
1. Implement reminders
2. Build analytics dashboard
3. Generate PTM reports

## Testing Strategy

### Unit Tests
- Request validation
- Slot availability calculation
- Conflict detection
- Reminder scheduling

### Component Tests
- PTMForm validation
- SlotSelector interaction
- MeetingDetail rendering

### Integration Tests
- End-to-end PTM workflow
- Notification sending
- Schedule conflicts

## Performance Optimization

- Index on `teacher_id, meeting_date`
- Cache teacher availability
- Batch reminder sending
- Archive past PTMs

## Future Enhancements

- Video conferencing integration (Zoom, Google Meet)
- Automatic slot matching algorithm
- AI-powered meeting summary
- Parent/student feedback on meetings
- Multi-teacher PTM sessions
- Mobile app support
