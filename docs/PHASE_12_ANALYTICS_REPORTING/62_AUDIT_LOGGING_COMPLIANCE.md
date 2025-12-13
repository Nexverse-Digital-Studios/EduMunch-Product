# Audit Logging and Compliance

## Overview
The Audit Logging and Compliance module provides comprehensive audit trails, activity logging, compliance reporting, and regulatory adherence tracking for the entire EduMunch system.

## Module Objectives
- Log all system activities
- Track user actions
- Maintain audit trails
- Enable compliance reporting
- Support data governance
- Ensure regulatory adherence
- Enable forensic analysis

## Key Features

### 1. Audit Logging
- **Audit Scope**
  - User authentication (login, logout)
  - Data modifications (create, update, delete)
  - Financial transactions
  - Administrative actions
  - System configuration changes

- **Audit Details**
  - User identification
  - Timestamp
  - Action type
  - Data before/after
  - IP address and device
  - Status (success/failure)

### 2. Activity Tracking
- **Tracked Activities**
  - Student enrollment
  - Fee payments
  - Grade entry
  - Attendance marking
  - Employee management
  - System configuration

- **Activity Metadata**
  - Actor (who performed)
  - Target (what was modified)
  - Changes (what changed)
  - Reason/comments
  - Authorization level

### 3. Compliance Reports
- **Report Types**
  - Data access reports
  - Modification reports
  - Financial transaction reports
  - User activity reports
  - Security event reports
  - Regulatory compliance reports

- **Compliance Standards**
  - GDPR compliance
  - Data protection
  - Financial audit
  - Educational standards
  - ISO compliance

### 4. Data Governance
- **Data Management**
  - Data retention policies
  - Data deletion/archival
  - Data export management
  - Personal data tracking
  - Consent management

- **Privacy Controls**
  - Data anonymization
  - Access restrictions
  - Data encryption
  - Secure deletion

### 5. Forensic Analysis
- **Investigation Tools**
  - Timeline reconstruction
  - User behavior analysis
  - Anomaly detection
  - Correlation analysis
  - Root cause analysis

### 6. Regulatory Compliance
- **Compliance Tracking**
  - Compliance checklist
  - Audit readiness
  - Gap analysis
  - Remediation tracking
  - Certification management

## Database Schema

### Tables

#### `audit_logs`
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- User
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_email VARCHAR(255),
  user_role VARCHAR(50),
  
  -- Action
  action_type VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT, DOWNLOAD
  action_module VARCHAR(100), -- Module name (students, fees, attendance, etc.)
  
  -- Target
  entity_type VARCHAR(100), -- students, payments, courses, etc.
  entity_id UUID,
  entity_name VARCHAR(255),
  
  -- Changes
  change_description TEXT,
  old_values JSONB, -- Before state
  new_values JSONB, -- After state
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(50), -- DESKTOP, MOBILE, TABLET
  
  -- Status
  status VARCHAR(50) DEFAULT 'SUCCESS', -- SUCCESS, FAILURE, PARTIAL
  error_message TEXT,
  
  -- Timestamp
  action_timestamp TIMESTAMP DEFAULT NOW(),
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_timestamp (user_id, action_timestamp),
  INDEX idx_entity_timestamp (entity_type, entity_id, action_timestamp),
  INDEX idx_organization (organization_id, action_timestamp)
);
```

#### `activity_logs`
```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Activity
  activity_type VARCHAR(50) NOT NULL, -- ENROLLMENT, PAYMENT, GRADING, ATTENDANCE, etc.
  activity_category VARCHAR(100),
  
  -- Actor
  performed_by UUID NOT NULL REFERENCES employees(id),
  
  -- Target
  student_id UUID REFERENCES students(id),
  target_entity_type VARCHAR(100),
  target_entity_id UUID,
  
  -- Details
  description TEXT,
  reason_for_activity TEXT,
  
  -- Data changes
  data_changed JSONB,
  
  -- Approval
  requires_approval BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES employees(id),
  approval_status VARCHAR(50), -- PENDING, APPROVED, REJECTED
  approval_comments TEXT,
  
  -- Timeline
  activity_timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `data_access_log`
```sql
CREATE TABLE data_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- User
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Access
  data_type VARCHAR(100), -- STUDENT_DATA, FINANCIAL_DATA, etc.
  operation_type VARCHAR(50), -- VIEW, DOWNLOAD, EXPORT, PRINT
  
  -- Data
  accessed_records_count INT,
  accessed_entity_ids JSONB, -- Array of accessed entity IDs
  
  -- Purpose
  purpose_of_access TEXT,
  business_justification TEXT,
  
  -- IP and Device
  ip_address INET,
  user_agent TEXT,
  
  -- Status
  access_status VARCHAR(50), -- SUCCESS, DENIED, PARTIAL
  denial_reason TEXT,
  
  access_timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `compliance_checklist`
```sql
CREATE TABLE compliance_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Item
  checklist_item VARCHAR(255) NOT NULL,
  compliance_area VARCHAR(100), -- GDPR, DATA_PROTECTION, FINANCIAL, EDUCATIONAL
  
  -- Status
  status VARCHAR(50) DEFAULT 'NOT_STARTED', -- NOT_STARTED, IN_PROGRESS, COMPLETED, NON_COMPLIANT
  
  -- Details
  description TEXT,
  responsible_party UUID REFERENCES employees(id),
  target_completion_date DATE,
  actual_completion_date DATE,
  
  -- Evidence
  evidence_document_url TEXT,
  verification_notes TEXT,
  
  created_by UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `compliance_reports`
```sql
CREATE TABLE compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Report
  report_type VARCHAR(50) NOT NULL, -- GDPR, AUDIT, FINANCIAL, DATA_PROTECTION
  report_name VARCHAR(255),
  
  -- Period
  report_start_date DATE,
  report_end_date DATE,
  
  -- Content
  findings JSONB,
  gaps_identified JSONB,
  recommendations JSONB,
  
  -- Status
  status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, FINALIZED, SUBMITTED
  
  // Approvals
  generated_by UUID NOT NULL REFERENCES employees(id),
  approved_by UUID REFERENCES employees(id),
  approval_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `data_retention_policy`
```sql
CREATE TABLE data_retention_policy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Policy
  data_type VARCHAR(100) NOT NULL,
  retention_days INT,
  
  -- Actions
  auto_delete BOOLEAN DEFAULT FALSE,
  auto_archive BOOLEAN DEFAULT TRUE,
  notify_before_deletion BOOLEAN DEFAULT TRUE,
  notification_days_before INT DEFAULT 30,
  
  -- Exceptions
  exceptions_allowed BOOLEAN DEFAULT FALSE,
  exception_approval_required BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `anomaly_detection`
```sql
CREATE TABLE anomaly_detection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Anomaly
  anomaly_type VARCHAR(50), -- UNUSUAL_ACCESS, BULK_DELETE, SUSPICIOUS_PATTERN
  severity VARCHAR(50), -- LOW, MEDIUM, HIGH, CRITICAL
  
  -- Details
  description TEXT,
  affected_user_id UUID REFERENCES auth.users(id),
  affected_data JSONB,
  
  -- Action
  status VARCHAR(50) DEFAULT 'FLAGGED', -- FLAGGED, INVESTIGATING, RESOLVED, FALSE_ALARM
  investigation_notes TEXT,
  
  detected_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Views and Queries

#### User Activity Timeline
```sql
SELECT 
  al.activity_timestamp,
  al.activity_type,
  CONCAT(e.first_name, ' ', e.last_name) as performed_by,
  al.description,
  al.approval_status
FROM activity_logs al
JOIN employees e ON al.performed_by = e.id
WHERE al.organization_id = $1
  AND al.activity_timestamp BETWEEN $2 AND $3
ORDER BY al.activity_timestamp DESC;
```

## Components

### AuditViewer
Location: `src/features/compliance/components/AuditViewer.tsx`

**Purpose:** View audit logs

**Props:**
```typescript
interface AuditViewerProps {
  organizationId: string;
  filters?: AuditFilters;
}
```

**Features:**
- Log filtering
- Timeline view
- Change tracking
- Search functionality
- Export

### ActivityLog
Location: `src/features/compliance/components/ActivityLog.tsx`

**Purpose:** Display activity timeline

**Props:**
```typescript
interface ActivityLogProps {
  entityType: string;
  entityId: string;
}
```

**Features:**
- Activity listing
- Timeline display
- Actor information
- Change details

### ComplianceReport
Location: `src/features/compliance/components/ComplianceReport.tsx`

**Purpose:** Generate compliance reports

**Props:**
```typescript
interface ComplianceReportProps {
  organizationId: string;
  reportType: string;
}
```

**Features:**
- Report generation
- Finding display
- Gap analysis
- Download

## Services

### `auditLog.service.ts`
Location: `src/features/compliance/services/auditLog.service.ts`

```typescript
// Audit Logging
async logAction(auditData: AuditLogInput): Promise<void>
async logDataAccess(accessData: DataAccessLogInput): Promise<void>
async getAuditLog(filters?: AuditFilters): Promise<AuditLog[]>
async getEntityChangeHistory(entityType: string, entityId: string): Promise<ChangeHistory[]>

// Activity Tracking
async logActivity(activityData: ActivityLogInput): Promise<void>
async getActivityLog(organizationId: string, filters?: ActivityFilters): Promise<ActivityLog[]>
async getUserActivityTimeline(userId: string, period: DateRange): Promise<ActivityLog[]>

// Compliance
async generateComplianceReport(reportType: string, period: DateRange): Promise<ComplianceReport>
async getComplianceStatus(organizationId: string): Promise<ComplianceStatus>
async getComplianceChecklist(organizationId: string): Promise<ChecklistItem[]>
async updateChecklistItem(itemId: string, status: string): Promise<void>

// Forensics
async analyzeUserBehavior(userId: string, period: DateRange): Promise<BehaviorAnalysis>
async detectAnomalies(organizationId: string): Promise<Anomaly[]>
async investigateIncident(anomalyId: string, notes: string): Promise<void>

// Data Governance
async applyRetentionPolicy(organizationId: string): Promise<void>
async anonymizeData(dataType: string): Promise<void>
async exportUserData(userId: string): Promise<Blob>
async deleteUserData(userId: string, reason: string): Promise<void>

// Reporting
async getDataAccessReport(period: DateRange): Promise<AccessReport>
async getModificationReport(entityType: string, period: DateRange): Promise<ModificationReport>
async getSecurityEventReport(period: DateRange): Promise<SecurityReport>
async getAuditReadinessReport(organizationId: string): Promise<ReadinessReport>
```

### `compliance.queries.ts`
Location: `src/features/compliance/services/compliance.queries.ts`

```typescript
// React Query hooks
export const useAuditLog = (filters?: AuditFilters)
export const useActivityLog = (organizationId: string, filters?: ActivityFilters)
export const useDataAccessLog = (filters?: AccessFilters)
export const useComplianceStatus = (organizationId: string)
export const useAnomalies = (organizationId: string)
export const useComplianceReport = (reportId: string)

// Mutations
export const useLogAction = ()
export const useGenerateReport = ()
export const useUpdateChecklist = ()
export const useInvestigateAnomaly = ()
```

## API Endpoints

### REST API (via Supabase AutoAPI)

```
GET    /rest/v1/audit_logs?organization_id=eq.{id}
POST   /rest/v1/audit_logs

GET    /rest/v1/activity_logs?organization_id=eq.{id}
POST   /rest/v1/activity_logs

GET    /rest/v1/data_access_log?organization_id=eq.{id}
POST   /rest/v1/data_access_log

GET    /rest/v1/compliance_checklist?organization_id=eq.{id}
PATCH  /rest/v1/compliance_checklist/{id}

GET    /rest/v1/compliance_reports?organization_id=eq.{id}
POST   /rest/v1/compliance_reports

GET    /rest/v1/anomaly_detection?organization_id=eq.{id}
POST   /rest/v1/anomaly_detection
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Only authorized personnel can view audit logs
CREATE POLICY audit_logs_view ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employee_roles 
      WHERE employee_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
      AND role_id IN (SELECT id FROM roles WHERE name IN ('ADMIN', 'COMPLIANCE_OFFICER', 'AUDITOR'))
    )
  );

-- Users can view their own activity logs
CREATE POLICY activity_logs_view ON activity_logs
  FOR SELECT USING (
    performed_by = (SELECT id FROM employees WHERE auth.uid() = user_id)
    OR EXISTS (
      SELECT 1 FROM employee_roles 
      WHERE employee_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
      AND role_id IN (SELECT id FROM roles WHERE name = 'ADMIN')
    )
  );
```

## Implementation Workflow

### Phase 1: Core Setup
1. Create database tables
2. Set up logging infrastructure
3. Configure audit policies

### Phase 2: Audit Logging
1. Implement audit logging
2. Build AuditViewer
3. Add search/filter

### Phase 3: Activity Tracking
1. Implement activity logging
2. Build ActivityLog
3. Add timeline view

### Phase 4: Compliance
1. Implement compliance tracking
2. Build ComplianceReport
3. Add checklist management

### Phase 5: Advanced Features
1. Implement anomaly detection
2. Add forensic analysis
3. Create automated reports

## Testing Strategy

### Unit Tests
- Log accuracy
- Anomaly detection
- Report generation
- Data retention

### Component Tests
- Log viewing
- Report display
- Filter functionality

### Integration Tests
- End-to-end logging
- Report generation
- Compliance verification

## Performance Optimization

- Index on `user_id, action_timestamp`
- Index on `entity_type, entity_id, action_timestamp`
- Archive old logs
- Batch log processing
- Database sharding for logs

## Future Enhancements

- Real-time alerting
- Machine learning anomaly detection
- Blockchain audit trails
- Advanced forensic tools
- Compliance automation
- Integration with external audit tools
- Advanced visualization
- Predictive compliance
