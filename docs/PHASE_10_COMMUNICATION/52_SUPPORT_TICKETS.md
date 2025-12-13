# Support Tickets System

## Overview
The Support Tickets module provides a helpdesk system for managing student, parent, and staff inquiries. It facilitates ticket creation, assignment, prioritization, status tracking, and resolution management with SLA monitoring.

## Module Objectives
- Enable ticket creation from multiple channels
- Assign tickets to support staff
- Track ticket status and progress
- Monitor SLA compliance
- Document resolutions
- Generate support analytics

## Key Features

### 1. Ticket Creation
- **Request Channels**
  - Web form submission
  - Email ingestion
  - Student/Parent portal
  - Chat integration
  - Phone (manual entry)

- **Ticket Categories**
  - Academic issues
  - Technical support
  - Administrative
  - Billing/Fees
  - Admissions
  - General inquiry
  - Complaint

### 2. Ticket Management
- **Ticket Properties**
  - Subject and description
  - Attachments
  - Reporter information
  - Related student/organization
  - Priority level
  - Category/subcategory

- **Workflow Status**
  - OPEN
  - ASSIGNED
  - IN_PROGRESS
  - ON_HOLD
  - WAITING_FOR_CUSTOMER
  - RESOLVED
  - CLOSED

### 3. Assignment & Routing
- **Intelligent Assignment**
  - Category-based routing
  - Load balancing
  - Skill-based assignment
  - Priority-based assignment

- **Reassignment**
  - Manual reassignment
  - Escalation
  - Transfer between teams

### 4. Communication
- **Internal Comments**
  - Staff notes
  - Status updates
  - Internal communication
  - Knowledge base linking

- **Customer Communication**
  - Public replies
  - Email notifications
  - Portal updates

### 5. SLA Management
- **SLA Tracking**
  - First response time
  - Resolution time
  - Priority-based SLAs
  - Breach alerts

- **SLA Rules**
  - Define by priority
  - Define by category
  - Auto-escalation on breach

### 6. Resolution & Closure
- **Resolution Details**
  - Resolution type
  - Solution description
  - Knowledge base article
  - Customer satisfaction rating

- **Feedback**
  - Post-closure survey
  - Satisfaction rating
  - Comments

## Database Schema

### Tables

#### `support_tickets`
```sql
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Ticket content
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  ticket_number VARCHAR(50) UNIQUE NOT NULL, -- AUTO-{ORG}-{DATE}-{SEQ}
  
  -- Reporter
  reporter_id UUID NOT NULL REFERENCES employees(id),
  reporter_email VARCHAR(255),
  reporter_phone VARCHAR(20),
  
  -- Context
  related_student_id UUID REFERENCES students(id),
  related_employee_id UUID REFERENCES employees(id),
  
  -- Classification
  category VARCHAR(50) NOT NULL, -- ACADEMIC, TECHNICAL, ADMIN, BILLING, ADMISSIONS, GENERAL, COMPLAINT
  subcategory VARCHAR(50),
  priority VARCHAR(50) DEFAULT 'MEDIUM', -- CRITICAL, HIGH, MEDIUM, LOW
  
  -- Status
  status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, ASSIGNED, IN_PROGRESS, ON_HOLD, WAITING_FOR_CUSTOMER, RESOLVED, CLOSED
  assigned_to UUID REFERENCES employees(id),
  
  -- SLA
  sla_response_time INTERVAL,
  sla_resolution_time INTERVAL,
  first_response_at TIMESTAMP,
  resolved_at TIMESTAMP,
  sla_breached BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  is_escalated BOOLEAN DEFAULT FALSE,
  escalation_reason TEXT,
  tags JSONB, -- Array of tags
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);
```

#### `ticket_assignments`
```sql
CREATE TABLE ticket_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  
  assigned_to UUID NOT NULL REFERENCES employees(id),
  assigned_by UUID NOT NULL REFERENCES employees(id),
  
  assignment_type VARCHAR(50) DEFAULT 'ASSIGNMENT', -- ASSIGNMENT, ESCALATION, TRANSFER
  reason TEXT,
  
  assigned_at TIMESTAMP DEFAULT NOW(),
  reassigned_at TIMESTAMP
);
```

#### `ticket_updates`
```sql
CREATE TABLE ticket_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  
  -- Update content
  update_type VARCHAR(50) NOT NULL, -- STATUS_CHANGE, COMMENT, ASSIGNMENT, ATTACHMENT, ESCALATION
  status_from VARCHAR(50),
  status_to VARCHAR(50),
  
  comment TEXT,
  is_public BOOLEAN DEFAULT FALSE, -- Public to customer
  is_internal BOOLEAN DEFAULT FALSE, -- Internal notes only
  
  created_by UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `ticket_attachments`
```sql
CREATE TABLE ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size BIGINT,
  
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

#### `ticket_resolution`
```sql
CREATE TABLE ticket_resolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  
  resolution_type VARCHAR(50), -- RESOLVED, DUPLICATE, WONT_FIX, CONFIGURATION_ERROR
  resolution_description TEXT,
  
  knowledge_base_link TEXT,
  solution_category VARCHAR(100),
  
  resolved_by UUID NOT NULL REFERENCES employees(id),
  resolved_at TIMESTAMP DEFAULT NOW()
);
```

#### `ticket_feedback`
```sql
CREATE TABLE ticket_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  
  satisfaction_rating INT CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  feedback_comment TEXT,
  
  response_time_rating INT,
  solution_quality_rating INT,
  staff_behavior_rating INT,
  
  submitted_at TIMESTAMP DEFAULT NOW()
);
```

#### `sla_policies`
```sql
CREATE TABLE sla_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  priority_level VARCHAR(50) NOT NULL, -- CRITICAL, HIGH, MEDIUM, LOW
  first_response_hours INT,
  resolution_hours INT,
  
  escalation_enabled BOOLEAN DEFAULT TRUE,
  escalation_after_hours INT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Views and Queries

#### Open Tickets by Priority
```sql
SELECT 
  st.id,
  st.ticket_number,
  st.subject,
  st.priority,
  st.status,
  CONCAT(e.first_name, ' ', e.last_name) as assigned_to,
  EXTRACT(DAY FROM CURRENT_TIMESTAMP - st.created_at) as days_open
FROM support_tickets st
LEFT JOIN employees e ON st.assigned_to = e.id
WHERE st.organization_id = $1
  AND st.status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS')
ORDER BY 
  CASE st.priority 
    WHEN 'CRITICAL' THEN 1
    WHEN 'HIGH' THEN 2
    WHEN 'MEDIUM' THEN 3
    WHEN 'LOW' THEN 4
  END,
  st.created_at;
```

#### SLA Compliance Report
```sql
SELECT 
  st.id,
  st.ticket_number,
  st.priority,
  st.first_response_at,
  st.resolved_at,
  EXTRACT(HOUR FROM st.first_response_at - st.created_at) as hours_to_first_response,
  EXTRACT(HOUR FROM st.resolved_at - st.created_at) as hours_to_resolution,
  CASE WHEN st.sla_breached THEN 'BREACHED' ELSE 'COMPLIANT' END as sla_status
FROM support_tickets st
WHERE st.organization_id = $1
  AND st.created_at >= ($2::date)
ORDER BY st.created_at;
```

## Components

### TicketForm
Location: `src/features/support-tickets/components/TicketForm.tsx`

**Purpose:** Create new support tickets

**Props:**
```typescript
interface TicketFormProps {
  organizationId: string;
  userId: string;
  relatedStudentId?: string;
  onSuccess: (ticket: SupportTicket) => void;
}
```

**Features:**
- Subject and description
- Category selection
- Attachment upload
- Form validation
- Submit confirmation

### TicketList
Location: `src/features/support-tickets/components/TicketList.tsx`

**Purpose:** Display and manage tickets

**Props:**
```typescript
interface TicketListProps {
  organizationId: string;
  filters?: TicketFilters;
  view?: 'open' | 'assigned' | 'all';
}
```

**Features:**
- Ticket list with sorting
- Filter by status, priority, category
- Search functionality
- Batch actions
- Quick status update

### TicketDetail
Location: `src/features/support-tickets/components/TicketDetail.tsx`

**Purpose:** View and manage individual ticket

**Props:**
```typescript
interface TicketDetailProps {
  ticketId: string;
  onBack: () => void;
}
```

**Features:**
- Ticket information
- Update history
- Comments thread
- Status management
- Assignment
- Escalation
- Resolution recording

### AssignmentForm
Location: `src/features/support-tickets/components/AssignmentForm.tsx`

**Purpose:** Assign or reassign tickets

**Props:**
```typescript
interface AssignmentFormProps {
  ticketId: string;
  currentAssigneeId?: string;
  onSuccess: () => void;
}
```

**Features:**
- Staff member selection
- Assignment reason
- Priority assignment
- Bulk assignment

## Services

### `supportTicket.service.ts`
Location: `src/features/support-tickets/services/supportTicket.service.ts`

```typescript
// Ticket CRUD
async createTicket(data: CreateTicketInput): Promise<SupportTicket>
async getTicket(ticketId: string): Promise<SupportTicket>
async listTickets(organizationId: string, filters?: TicketFilters): Promise<SupportTicket[]>
async updateTicket(ticketId: string, data: UpdateTicketInput): Promise<void>
async deleteTicket(ticketId: string): Promise<void>

// Status Management
async updateTicketStatus(ticketId: string, newStatus: TicketStatus): Promise<void>
async changeTicketPriority(ticketId: string, priority: Priority): Promise<void>

// Assignment
async assignTicket(ticketId: string, assigneeId: string, reason?: string): Promise<void>
async reassignTicket(ticketId: string, newAssigneeId: string, reason: string): Promise<void>
async getStaffWorkload(organizationId: string): Promise<StaffWorkload[]>

// Communication
async addComment(ticketId: string, comment: string, isPublic: boolean): Promise<void>
async getComments(ticketId: string): Promise<TicketComment[]>
async uploadAttachment(ticketId: string, file: File): Promise<TicketAttachment>

// Resolution
async resolveTicket(ticketId: string, resolution: ResolutionInput): Promise<void>
async reopenTicket(ticketId: string, reason: string): Promise<void>
async closeTicket(ticketId: string): Promise<void>

// Escalation
async escalateTicket(ticketId: string, reason: string): Promise<void>
async checkSLABreach(organizationId: string): Promise<SLABreach[]>

// Analytics
async getTicketStats(organizationId: string, period: DateRange): Promise<TicketStats>
async getSLAComplianceReport(organizationId: string, period: DateRange): Promise<SLAReport>
async getStaffPerformance(organizationId: string, period: DateRange): Promise<StaffPerformance[]>
async getResolutionTimeMetrics(organizationId: string): Promise<ResolutionMetrics>
```

### `supportTicket.queries.ts`
Location: `src/features/support-tickets/services/supportTicket.queries.ts`

```typescript
// React Query hooks
export const useTicket = (ticketId: string)
export const useTickets = (organizationId: string, filters?: TicketFilters)
export const useMyTickets = (userId: string, organizationId: string)
export const useOpenTickets = (organizationId: string)
export const useSLACompliance = (organizationId: string)

// Mutations
export const useCreateTicket = ()
export const useUpdateTicketStatus = ()
export const useAssignTicket = ()
export const useResolveTicket = ()
export const useAddComment = ()
export const useUploadAttachment = ()
```

## API Endpoints

### REST API (via Supabase AutoAPI)

```
GET    /rest/v1/support_tickets?organization_id=eq.{id}
POST   /rest/v1/support_tickets
GET    /rest/v1/support_tickets/{id}
PATCH  /rest/v1/support_tickets/{id}
DELETE /rest/v1/support_tickets/{id}

GET    /rest/v1/ticket_updates?ticket_id=eq.{id}
POST   /rest/v1/ticket_updates

GET    /rest/v1/ticket_attachments?ticket_id=eq.{id}
POST   /rest/v1/ticket_attachments
DELETE /rest/v1/ticket_attachments/{id}

GET    /rest/v1/ticket_resolution?ticket_id=eq.{id}
POST   /rest/v1/ticket_resolution
PATCH  /rest/v1/ticket_resolution/{id}

GET    /rest/v1/ticket_feedback?ticket_id=eq.{id}
POST   /rest/v1/ticket_feedback

GET    /rest/v1/sla_policies?organization_id=eq.{id}
POST   /rest/v1/sla_policies
PATCH  /rest/v1/sla_policies/{id}
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Users can view tickets they created
CREATE POLICY support_tickets_creator_view ON support_tickets
  FOR SELECT USING (
    reporter_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
  );

-- Support staff can view assigned tickets
CREATE POLICY support_tickets_assigned_view ON support_tickets
  FOR SELECT USING (
    assigned_to = (SELECT id FROM employees WHERE auth.uid() = user_id)
  );

-- Admin can view all tickets
CREATE POLICY support_tickets_admin_view ON support_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employee_roles 
      WHERE employee_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
      AND role_id IN (SELECT id FROM roles WHERE name = 'ADMIN')
    )
  );
```

## Implementation Workflow

### Phase 1: Core Setup
1. Create database tables
2. Set up SLA policies
3. Initialize ticket numbering

### Phase 2: Ticket Management
1. Build TicketForm
2. Implement TicketList
3. Add to support portal

### Phase 3: Assignment & Routing
1. Build AssignmentForm
2. Implement assignment logic
3. Set up automatic routing

### Phase 4: Communication & Tracking
1. Build TicketDetail
2. Implement comments
3. Add status management

### Phase 5: Analytics & Reporting
1. Build analytics dashboard
2. Implement SLA monitoring
3. Generate reports

## Testing Strategy

### Unit Tests
- Ticket creation validation
- SLA calculation
- Status transition rules
- Assignment logic

### Component Tests
- TicketForm submission
- TicketList filtering
- TicketDetail interactions

### Integration Tests
- End-to-end ticket workflow
- Notification sending
- SLA breach alerts

## Performance Optimization

- Index on `status, priority, created_at`
- Index on `assigned_to, status`
- Cache SLA policies
- Batch SLA checks
- Archive closed tickets

## Future Enhancements

- AI-powered ticket categorization
- Chatbot integration
- Auto-response system
- Knowledge base integration
- Multi-channel ticket ingestion
- Predictive analytics
- Mobile app support
