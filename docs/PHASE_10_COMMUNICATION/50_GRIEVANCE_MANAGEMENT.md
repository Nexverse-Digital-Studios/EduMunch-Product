# Grievance Management

## Overview
The Grievance Management system provides a structured process for students, parents, and staff to file complaints and grievances, track their status, and receive resolution updates. The system supports multi-level escalation, documentation, and closure tracking.

## Module Objectives
- Enable grievance filing by authorized users
- Provide structured categorization
- Implement escalation workflow
- Track grievance status
- Generate grievance reports
- Ensure timely resolution

## Key Features

### 1. Grievance Filing
- **Filing Interface**
  - Category selection
  - Detailed description
  - Document attachment
  - Anonymous option
  - Urgency indication

- **Grievance Types**
  - Academic (teaching quality, curriculum issues)
  - Financial (fee-related disputes)
  - Administrative (policy violations)
  - Behavioral (misconduct, bullying)
  - Facilities (infrastructure issues)
  - Other (custom categories)

### 2. Status Tracking
- **Grievance Status Workflow**
  - FILED: Initial submission
  - ACKNOWLEDGED: Received and assigned
  - IN_REVIEW: Under investigation
  - ESCALATED: Moved to higher authority
  - RESOLVED: Solution provided
  - CLOSED: Grievance concluded

- **SLA Management**
  - Target resolution time
  - Escalation triggers
  - Overdue alerts

### 3. Escalation Workflow
- **Multi-level Escalation**
  - Level 1: Department head
  - Level 2: Principal/Director
  - Level 3: Management committee
  - Custom escalation rules

- **Assignment Management**
  - Auto-assignment based on category
  - Manual reassignment
  - Committee assignment

### 4. Documentation & Communication
- **Grievance Documentation**
  - Original grievance with attachments
  - Investigation notes
  - Resolution details
  - Communication history

- **Communication**
  - Status update notifications
  - Action required notifications
  - Resolution notifications
  - Feedback requests

### 5. Resolution Management
- **Resolution Process**
  - Investigation documentation
  - Proposed solution
  - Implementation tracking
  - Closure confirmation

- **Follow-up**
  - Post-resolution survey
  - Satisfaction rating
  - Feedback collection

## Database Schema

### Tables

#### `grievances`
```sql
CREATE TABLE grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_number VARCHAR(20) UNIQUE NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Filer information
  filed_by UUID NOT NULL REFERENCES employees(id),
  filed_against UUID REFERENCES employees(id),
  
  -- Against whom
  against_name VARCHAR(100),
  against_type VARCHAR(50), -- EMPLOYEE, DEPARTMENT, ORGANIZATION
  
  -- Content
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- ACADEMIC, FINANCIAL, ADMINISTRATIVE, BEHAVIORAL, FACILITIES, OTHER
  
  -- Details
  grievance_date DATE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  priority VARCHAR(50) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
  
  -- Status
  status VARCHAR(50) DEFAULT 'FILED', -- FILED, ACKNOWLEDGED, IN_REVIEW, ESCALATED, RESOLVED, CLOSED
  status_changed_at TIMESTAMP,
  
  -- Resolution
  resolution_notes TEXT,
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES employees(id),
  
  -- Tracking
  acknowledgment_date TIMESTAMP,
  target_resolution_date DATE,
  actual_resolution_date DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);
```

#### `grievance_attachments`
```sql
CREATE TABLE grievance_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
  
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size INT,
  
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

#### `grievance_escalations`
```sql
CREATE TABLE grievance_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
  
  escalation_level INT NOT NULL, -- 1, 2, 3, etc.
  escalated_to UUID NOT NULL REFERENCES employees(id),
  escalated_by UUID NOT NULL REFERENCES employees(id),
  
  escalation_reason TEXT NOT NULL,
  escalation_date TIMESTAMP DEFAULT NOW(),
  
  -- Resolution at this level
  resolution_notes TEXT,
  resolved_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `grievance_comments`
```sql
CREATE TABLE grievance_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
  
  commenter_id UUID NOT NULL REFERENCES employees(id),
  comment_text TEXT NOT NULL,
  
  is_internal BOOLEAN DEFAULT FALSE, -- Not visible to filer
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `grievance_actions`
```sql
CREATE TABLE grievance_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
  
  action_type VARCHAR(50) NOT NULL, -- INVESTIGATION, HEARING, DISCIPLINARY, COMPENSATION, OTHER
  description TEXT NOT NULL,
  
  assigned_to UUID REFERENCES employees(id),
  assigned_date TIMESTAMP,
  due_date DATE,
  
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED
  completed_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `grievance_feedback`
```sql
CREATE TABLE grievance_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
  
  filer_id UUID NOT NULL REFERENCES employees(id),
  
  satisfaction_rating INT, -- 1-5
  resolution_feedback TEXT,
  
  submitted_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `grievance_notifications`
```sql
CREATE TABLE grievance_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
  
  recipient_id UUID NOT NULL REFERENCES employees(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  notification_type VARCHAR(50), -- FILED, ACKNOWLEDGED, STATUS_CHANGED, ESCALATED, RESOLVED
  message TEXT,
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Views and Queries

#### Pending Grievances
```sql
SELECT 
  g.id,
  g.grievance_number,
  g.title,
  e.first_name || ' ' || e.last_name as filer_name,
  g.category,
  g.priority,
  g.status,
  g.created_at,
  CURRENT_DATE - g.target_resolution_date as days_overdue
FROM grievances g
JOIN employees e ON g.filed_by = e.id
WHERE g.status NOT IN ('RESOLVED', 'CLOSED')
  AND g.organization_id = $1
ORDER BY DAYS_OVERDUE DESC, g.priority DESC;
```

## Components

### GrievanceForm
Location: `src/features/grievance/components/GrievanceForm.tsx`

**Purpose:** File new grievances

**Props:**
```typescript
interface GrievanceFormProps {
  organizationId: string;
  filedById: string;
  onSuccess: (grievance: Grievance) => void;
}
```

**Features:**
- Category selection
- Description input
- Document attachment
- Anonymous checkbox
- Priority selection
- Submission confirmation

### GrievanceList
Location: `src/features/grievance/components/GrievanceList.tsx`

**Purpose:** Display grievances with filtering

**Props:**
```typescript
interface GrievanceListProps {
  organizationId: string;
  filters?: GrievanceFilters;
  onSelectGrievance: (grievance: Grievance) => void;
}
```

**Features:**
- Filterable list
- Filter by status, category, priority
- Search functionality
- Sort options
- Status indicators
- Days overdue highlight

### GrievanceDetail
Location: `src/features/grievance/components/GrievanceDetail.tsx`

**Purpose:** View complete grievance with history

**Props:**
```typescript
interface GrievanceDetailProps {
  grievanceId: string;
  onBack: () => void;
}
```

**Features:**
- Full grievance details
- Attachment preview
- Escalation history
- Comments section
- Action tracking
- Status updates

### StatusTracker
Location: `src/features/grievance/components/StatusTracker.tsx`

**Purpose:** Display grievance status timeline

**Props:**
```typescript
interface StatusTrackerProps {
  grievanceId: string;
}
```

**Features:**
- Timeline view
- Status history
- Escalation tracking
- Pending actions
- Resolution notes

## Services

### `grievance.service.ts`
Location: `src/features/grievance/services/grievance.service.ts`

```typescript
// Grievance Management
async fileGrievance(data: FileGrievanceInput): Promise<Grievance>
async getGrievance(grievanceId: string): Promise<Grievance>
async updateGrievance(grievanceId: string, data: UpdateGrievanceInput): Promise<Grievance>
async deleteGrievance(grievanceId: string): Promise<void>
async listGrievances(organizationId: string, filters?: GrievanceFilters): Promise<Grievance[]>

// Status Management
async acknowledgeGrievance(grievanceId: string): Promise<void>
async updateGrievanceStatus(grievanceId: string, status: GrievanceStatus): Promise<void>
async resolveGrievance(grievanceId: string, resolutionNotes: string): Promise<void>
async closeGrievance(grievanceId: string): Promise<void>
async reopenGrievance(grievanceId: string, reason: string): Promise<void>

// Escalation
async escalateGrievance(grievanceId: string, escalateToId: string, reason: string): Promise<void>
async getEscalationHistory(grievanceId: string): Promise<GrievanceEscalation[]>
async checkEscalationRequired(grievanceId: string): Promise<boolean>

// Attachments
async uploadAttachment(grievanceId: string, file: File): Promise<GrievanceAttachment>
async deleteAttachment(attachmentId: string): Promise<void>
async getAttachments(grievanceId: string): Promise<GrievanceAttachment[]>

// Actions
async createAction(grievanceId: string, action: ActionInput): Promise<GrievanceAction>
async updateAction(actionId: string, data: UpdateActionInput): Promise<GrievanceAction>
async getActions(grievanceId: string): Promise<GrievanceAction[]>
async completeAction(actionId: string): Promise<void>

// Comments
async addComment(grievanceId: string, comment: string, isInternal: boolean): Promise<GrievanceComment>
async getComments(grievanceId: string): Promise<GrievanceComment[]>
async deleteComment(commentId: string): Promise<void>

// Feedback
async submitFeedback(grievanceId: string, feedback: FeedbackInput): Promise<void>
async getFeedback(grievanceId: string): Promise<GrievanceFeedback>

// Notifications
async getPendingGrievances(assigneeId: string): Promise<Grievance[]>
async getOverdueGrievances(organizationId: string): Promise<Grievance[]>
async getGrievanceStats(organizationId: string): Promise<GrievanceStats>
```

### `grievance.queries.ts`
Location: `src/features/grievance/services/grievance.queries.ts`

```typescript
// React Query hooks
export const useGrievance = (grievanceId: string)
export const useGrievances = (organizationId: string, filters?: GrievanceFilters)
export const usePendingGrievances = (assigneeId: string)
export const useOverdueGrievances = (organizationId: string)
export const useGrievanceStats = (organizationId: string)
export const useGrievanceHistory = (grievanceId: string)

// Mutations
export const useFileGrievance = ()
export const useUpdateGrievanceStatus = ()
export const useEscalateGrievance = ()
export const useResolveGrievance = ()
export const useAddComment = ()
```

## API Endpoints

### REST API (via Supabase AutoAPI)

```
GET    /rest/v1/grievances?organization_id=eq.{id}
POST   /rest/v1/grievances
PATCH  /rest/v1/grievances/{id}
DELETE /rest/v1/grievances/{id}

GET    /rest/v1/grievance_escalations?grievance_id=eq.{id}
POST   /rest/v1/grievance_escalations

GET    /rest/v1/grievance_comments?grievance_id=eq.{id}
POST   /rest/v1/grievance_comments
DELETE /rest/v1/grievance_comments/{id}

GET    /rest/v1/grievance_actions?grievance_id=eq.{id}
POST   /rest/v1/grievance_actions
PATCH  /rest/v1/grievance_actions/{id}

POST   /rest/v1/grievance_attachments
DELETE /rest/v1/grievance_attachments/{id}
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Filers can view their own grievances (unless anonymous)
CREATE POLICY grievances_filer_view ON grievances
  FOR SELECT USING (
    filed_by = (SELECT id FROM employees WHERE auth.uid() = user_id)
  );

-- Assigned handlers can view assigned grievances
CREATE POLICY grievances_handler_view ON grievances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM grievance_escalations ge
      WHERE ge.grievance_id = grievances.id
        AND ge.escalated_to = (SELECT id FROM employees WHERE auth.uid() = user_id)
    )
  );

-- Admins can view all grievances
CREATE POLICY grievances_admin_view ON grievances
  FOR SELECT USING (
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
2. Set up grievance categories
3. Initialize notification templates

### Phase 2: Filing & Management
1. Build GrievanceForm
2. Build GrievanceList
3. Build GrievanceDetail

### Phase 3: Status & Escalation
1. Implement status workflow
2. Implement escalation logic
3. Build StatusTracker

### Phase 4: Actions & Resolution
1. Implement action tracking
2. Implement resolution workflow
3. Add feedback collection

### Phase 5: Reporting & Analytics
1. Generate grievance reports
2. Build analytics dashboard
3. Add SLA monitoring

## Testing Strategy

### Unit Tests
- Grievance validation
- Status workflow logic
- Escalation rules
- SLA calculation

### Component Tests
- GrievanceForm submission
- GrievanceList filtering
- StatusTracker rendering

### Integration Tests
- End-to-end grievance workflow
- Escalation process
- Notification flow

## Performance Optimization

- Index on `organization_id, status, created_at`
- Index on `assigned_to, status` for handler queries
- Cache grievance stats
- Archive closed grievances

## Future Enhancements

- Automated escalation based on SLA
- Analytics and trend identification
- AI-powered grievance categorization
- Integration with disciplinary actions
- Anonymous grievance tracking with verification
- Multi-language support
- Mobile app support
