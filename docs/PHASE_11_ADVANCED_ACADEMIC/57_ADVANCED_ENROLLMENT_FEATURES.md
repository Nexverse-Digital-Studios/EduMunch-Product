# Advanced Enrollment Features

## Overview
The Advanced Enrollment Features module provides sophisticated enrollment management capabilities including batch transfers, waiting list management, seat allocation, enrollment rules, and complex enrollment workflows.

## Module Objectives
- Manage student batch transfers
- Handle waiting list workflows
- Manage seat availability
- Enforce enrollment prerequisites
- Implement enrollment rules
- Track enrollment history
- Support enrollment cancellation

## Key Features

### 1. Batch Transfer Workflow
- **Transfer Types**
  - Promotion to next batch
  - Transfer within same level
  - Remedial batch transfer
  - Level downgrade
  - Section change

- **Transfer Process**
  - Request creation
  - Approval workflow
  - Date management
  - Fee adjustment
  - Transcript update

### 2. Waiting List Management
- **Waiting List Features**
  - Priority-based queue
  - Automatic seat allocation
  - Timeout management
  - Notification system
  - Waitlist expiry

- **Allocation Logic**
  - FIFO (First In First Out)
  - Merit-based
  - Category-based
  - Priority-based

### 3. Seat Management
- **Seat Allocation**
  - Total capacity per batch
  - Available seats tracking
  - Reserved seats (SC/ST/OBC)
  - Blocked seats
  - Waitlist size

- **Seat Rules**
  - Minimum capacity
  - Maximum capacity
  - Reserve categories
  - Override rules

### 4. Enrollment Prerequisites
- **Prerequisite Types**
  - Minimum grade requirement
  - Previous batch completion
  - Assessment score requirement
  - Document verification
  - Payment clearance

- **Prerequisite Enforcement**
  - Validation on enrollment
  - Automatic blocking
  - Manual override option
  - Audit trail

### 5. Enrollment Rules
- **Rule Configuration**
  - Age restrictions
  - Academic eligibility
  - Duration limits
  - Enrollment period
  - Concurrent enrollment limits

- **Rule Types**
  - Hard constraints (cannot bypass)
  - Soft constraints (warnings)
  - Dynamic rules (conditional)

### 6. Enrollment History & Audit
- **History Tracking**
  - Enrollment creation
  - Modifications
  - Cancellations
  - Transfers
  - Status changes

## Database Schema

### Tables

#### `batch_transfers`
```sql
CREATE TABLE batch_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Enrollments
  from_enrollment_id UUID NOT NULL REFERENCES enrollments(id),
  to_batch_id UUID NOT NULL REFERENCES batches(id),
  
  -- Student
  student_id UUID NOT NULL REFERENCES students(id),
  
  -- Request
  transfer_type VARCHAR(50) NOT NULL, -- PROMOTION, TRANSFER, REMEDIAL, DOWNGRADE, SECTION_CHANGE
  request_reason TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'REQUESTED', -- REQUESTED, APPROVED, REJECTED, COMPLETED, CANCELLED
  approved_by UUID REFERENCES employees(id),
  approval_date TIMESTAMP,
  approval_comments TEXT,
  
  -- Transfer date
  transfer_effective_date DATE,
  
  -- Fee adjustment
  fee_adjustment_amount DECIMAL(10,2),
  refund_amount DECIMAL(10,2),
  
  -- Audit
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `waiting_list`
```sql
CREATE TABLE waiting_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Batch
  batch_id UUID NOT NULL REFERENCES batches(id),
  
  -- Student
  student_id UUID NOT NULL REFERENCES students(id),
  
  -- Position
  queue_position INT NOT NULL,
  priority_score INT DEFAULT 0,
  
  -- Dates
  added_to_waitlist_at TIMESTAMP DEFAULT NOW(),
  timeout_date TIMESTAMP, -- When offer expires
  
  -- Status
  status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, ACCEPTED, REJECTED, EXPIRED, WITHDRAWN
  accepted_at TIMESTAMP,
  
  -- Offer details
  seat_offered_date TIMESTAMP,
  seat_offered_by UUID REFERENCES employees(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `batch_seat_allocation`
```sql
CREATE TABLE batch_seat_allocation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Capacity
  total_seats INT NOT NULL,
  general_seats INT,
  reserved_sc_seats INT DEFAULT 0,
  reserved_st_seats INT DEFAULT 0,
  reserved_obc_seats INT DEFAULT 0,
  
  -- Occupied
  occupied_general_seats INT DEFAULT 0,
  occupied_reserved_seats INT DEFAULT 0,
  
  -- Available
  available_general_seats INT,
  available_reserved_seats INT,
  
  -- Blocked
  blocked_seats INT DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `enrollment_prerequisites`
```sql
CREATE TABLE enrollment_prerequisites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Prerequisite
  prerequisite_type VARCHAR(50) NOT NULL, -- GRADE, COMPLETION, SCORE, DOCUMENT, PAYMENT
  prerequisite_name VARCHAR(255),
  
  -- Details
  minimum_grade VARCHAR(2), -- For grade requirement
  minimum_score DECIMAL(5,2), -- For score requirement
  required_completion_batch_id UUID REFERENCES batches(id),
  required_document_type VARCHAR(100), -- For document requirement
  
  -- Enforcement
  is_mandatory BOOLEAN DEFAULT TRUE,
  can_override BOOLEAN DEFAULT FALSE,
  override_approval_required BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `enrollment_rules`
```sql
CREATE TABLE enrollment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Rule
  rule_name VARCHAR(255) NOT NULL,
  rule_description TEXT,
  rule_type VARCHAR(50), -- HARD, SOFT, DYNAMIC
  
  -- Configuration
  condition_logic TEXT, -- JSON with condition logic
  action_on_violation VARCHAR(50), -- BLOCK, WARN, AUTO_ADJUST
  
  -- Scope
  applies_to_batch_ids JSONB, -- Array of batch IDs, NULL for all
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_by UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `enrollment_rule_violations`
```sql
CREATE TABLE enrollment_rule_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES enrollment_rules(id),
  
  -- Violation
  violation_type VARCHAR(50), -- BLOCK, WARN
  violation_details TEXT,
  
  -- Resolution
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, WAIVED, APPROVED, DENIED
  waived_by UUID REFERENCES employees(id),
  waived_at TIMESTAMP,
  waiver_reason TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `seat_allocation_history`
```sql
CREATE TABLE seat_allocation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES batches(id),
  
  -- Allocation
  student_id UUID NOT NULL REFERENCES students(id),
  seat_category VARCHAR(50), -- GENERAL, RESERVED_SC, RESERVED_ST, RESERVED_OBC
  
  -- Status
  allocation_status VARCHAR(50), -- ALLOCATED, RELEASED, TRANSFERRED
  allocated_at TIMESTAMP DEFAULT NOW(),
  
  reason TEXT,
  allocated_by UUID REFERENCES employees(id)
);
```

### Views and Queries

#### Waitlist Status by Batch
```sql
SELECT 
  b.id as batch_id,
  b.batch_name,
  COUNT(wl.id) as waitlist_count,
  COUNT(CASE WHEN wl.status = 'ACTIVE' THEN 1 END) as active_count,
  COUNT(CASE WHEN wl.status = 'ACCEPTED' THEN 1 END) as accepted_count,
  bsa.available_general_seats + bsa.available_reserved_seats as available_seats
FROM batches b
LEFT JOIN waiting_list wl ON b.id = wl.batch_id
LEFT JOIN batch_seat_allocation bsa ON b.id = bsa.batch_id
WHERE b.organization_id = $1
GROUP BY b.id, b.batch_name, bsa.available_general_seats, bsa.available_reserved_seats;
```

## Components

### TransferRequest
Location: `src/features/advanced-enrollment/components/TransferRequest.tsx`

**Purpose:** Request batch transfer

**Props:**
```typescript
interface TransferRequestProps {
  enrollmentId: string;
  studentId: string;
  onSuccess: () => void;
}
```

**Features:**
- Batch selection
- Transfer type
- Reason entry
- Preview changes
- Fee calculation

### WaitingList
Location: `src/features/advanced-enrollment/components/WaitingList.tsx`

**Purpose:** Manage waiting lists

**Props:**
```typescript
interface WaitingListProps {
  batchId: string;
  organizationId: string;
}
```

**Features:**
- Waitlist view
- Position tracking
- Auto-allocation
- Notification sending
- Expiry management

### SeatAllocation
Location: `src/features/advanced-enrollment/components/SeatAllocation.tsx`

**Purpose:** Manage batch seat allocation

**Props:**
```typescript
interface SeatAllocationProps {
  batchId: string;
  organizationId: string;
}
```

**Features:**
- Capacity configuration
- Reserved seat allocation
- Occupancy tracking
- Blocking seats
- Availability updates

### EnrollmentValidator
Location: `src/features/advanced-enrollment/components/EnrollmentValidator.tsx`

**Purpose:** Check enrollment prerequisites

**Props:**
```typescript
interface EnrollmentValidatorProps {
  studentId: string;
  batchId: string;
  onValidate: (result: ValidationResult) => void;
}
```

**Features:**
- Prerequisite checking
- Rule validation
- Violation display
- Override handling
- Report generation

## Services

### `advancedEnrollment.service.ts`
Location: `src/features/advanced-enrollment/services/advancedEnrollment.service.ts`

```typescript
// Batch Transfers
async requestBatchTransfer(data: TransferRequestInput): Promise<BatchTransfer>
async approveBatchTransfer(transferId: string, approverComments?: string): Promise<void>
async rejectBatchTransfer(transferId: string, reason: string): Promise<void>
async completeBatchTransfer(transferId: string): Promise<void>
async getBatchTransfers(studentId: string): Promise<BatchTransfer[]>

// Waiting List
async addToWaitingList(studentId: string, batchId: string): Promise<WaitingListEntry>
async getWaitingListPosition(studentId: string, batchId: string): Promise<WaitingListEntry>
async offerSeatFromWaitlist(batchId: string): Promise<WaitingListEntry>
async acceptSeatOffer(waitlistEntryId: string): Promise<void>
async rejectSeatOffer(waitlistEntryId: string): Promise<void>
async removeFromWaitingList(waitlistEntryId: string): Promise<void>
async getWaitingListStatus(batchId: string): Promise<WaitingListStatus>

// Seat Allocation
async configureBatchSeats(batchId: string, config: SeatConfigInput): Promise<void>
async getAvailableSeats(batchId: string): Promise<SeatAvailability>
async allocateSeat(studentId: string, batchId: string, category?: string): Promise<void>
async releaseSeat(studentId: string, batchId: string): Promise<void>
async blockSeats(batchId: string, count: number, reason: string): Promise<void>

// Prerequisites
async validateEnrollmentPrerequisites(studentId: string, batchId: string): Promise<ValidationResult>
async getUnmetPrerequisites(studentId: string, batchId: string): Promise<Prerequisite[]>
async overridePrerequisite(enrollmentId: string, prerequisiteId: string, reason: string): Promise<void>

// Rules
async checkEnrollmentRules(studentId: string, batchId: string): Promise<RuleCheckResult>
async waiverRuleViolation(violationId: string, reason: string): Promise<void>
async getRuleViolations(enrollmentId: string): Promise<RuleViolation[]>

// History & Audit
async getEnrollmentHistory(studentId: string): Promise<EnrollmentHistoryRecord[]>
async getSeatAllocationHistory(batchId: string): Promise<SeatAllocationRecord[]>
async getTransferHistory(batchId: string): Promise<BatchTransfer[]>
```

### `advancedEnrollment.queries.ts`
Location: `src/features/advanced-enrollment/services/advancedEnrollment.queries.ts`

```typescript
// React Query hooks
export const useBatchTransfer = (transferId: string)
export const useStudentTransfers = (studentId: string)
export const useWaitingListEntry = (studentId: string, batchId: string)
export const useWaitingListStatus = (batchId: string)
export const useAvailableSeats = (batchId: string)
export const useEnrollmentPrerequisites = (studentId: string, batchId: string)
export const useEnrollmentRuleCheck = (studentId: string, batchId: string)

// Mutations
export const useRequestTransfer = ()
export const useAddToWaitlist = ()
export const useAcceptSeatOffer = ()
export const useValidatePrerequisites = ()
export const useWaiverViolation = ()
```

## API Endpoints

### REST API (via Supabase AutoAPI)

```
GET    /rest/v1/batch_transfers?student_id=eq.{id}
POST   /rest/v1/batch_transfers
PATCH  /rest/v1/batch_transfers/{id}

GET    /rest/v1/waiting_list?batch_id=eq.{id}
POST   /rest/v1/waiting_list
PATCH  /rest/v1/waiting_list/{id}

GET    /rest/v1/batch_seat_allocation?batch_id=eq.{id}
POST   /rest/v1/batch_seat_allocation
PATCH  /rest/v1/batch_seat_allocation/{id}

GET    /rest/v1/enrollment_prerequisites?batch_id=eq.{id}
POST   /rest/v1/enrollment_prerequisites

GET    /rest/v1/enrollment_rules?organization_id=eq.{id}
POST   /rest/v1/enrollment_rules
PATCH  /rest/v1/enrollment_rules/{id}

GET    /rest/v1/seat_allocation_history?batch_id=eq.{id}
POST   /rest/v1/seat_allocation_history
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Students can view their own transfers
CREATE POLICY batch_transfers_student_view ON batch_transfers
  FOR SELECT USING (
    student_id = (SELECT id FROM students WHERE auth.uid() = user_id)
  );

-- Admins can manage all transfers
CREATE POLICY batch_transfers_admin_manage ON batch_transfers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM employee_roles 
      WHERE employee_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
      AND role_id IN (SELECT id FROM roles WHERE name = 'ADMIN')
    )
  );

-- Students can view waitlist status
CREATE POLICY waiting_list_view ON waiting_list
  FOR SELECT USING (
    student_id = (SELECT id FROM students WHERE auth.uid() = user_id)
    OR EXISTS (
      SELECT 1 FROM employee_roles 
      WHERE employee_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
      AND role_id IN (SELECT id FROM roles WHERE name IN ('ADMIN', 'STAFF'))
    )
  );
```

## Implementation Workflow

### Phase 1: Core Setup
1. Create database tables
2. Set up seat allocation
3. Configure rules

### Phase 2: Transfer Workflow
1. Build TransferRequest
2. Implement transfer logic
3. Add approval workflow

### Phase 3: Waiting List
1. Build WaitingList
2. Implement queue management
3. Add auto-allocation

### Phase 4: Validation
1. Build EnrollmentValidator
2. Implement prerequisite checking
3. Add rule enforcement

### Phase 5: Audit & Reporting
1. Implement history tracking
2. Generate reports
3. Add compliance checks

## Testing Strategy

### Unit Tests
- Seat calculation
- Waitlist queue logic
- Prerequisite validation
- Rule enforcement

### Component Tests
- Transfer form submission
- Waitlist position display
- Seat allocation

### Integration Tests
- End-to-end transfer workflow
- Automatic seat allocation
- Rule violation handling

## Performance Optimization

- Index on `batch_id, status`
- Index on `student_id, status`
- Cache seat availability
- Batch waitlist processing
- Archive old transfers

## Future Enhancements

- Machine learning for seat prediction
- Dynamic pricing based on demand
- Waitlist analytics
- Automated transfer suggestions
- Mobile app integration
- Real-time seat availability
- Integration with financial system
