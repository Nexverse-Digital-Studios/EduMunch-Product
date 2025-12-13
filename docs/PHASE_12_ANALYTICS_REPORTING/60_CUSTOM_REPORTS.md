# Custom Reports

## Overview
The Custom Reports module enables users to build, schedule, and export custom reports using a drag-and-drop report builder. It supports various data sources, filters, and export formats for business intelligence and data analysis.

## Module Objectives
- Enable report creation using report builder
- Support multiple report templates
- Provide scheduling capabilities
- Enable export in multiple formats
- Implement role-based access
- Track report usage
- Support collaborative reporting

## Key Features

### 1. Report Builder
- **Drag & Drop Interface**
  - Visual report design
  - Field selection
  - Column arrangement
  - Group by options
  - Sort configuration

- **Data Sources**
  - Student data
  - Academic performance
  - Financial data
  - Attendance records
  - HR data
  - Custom queries

### 2. Report Templates
- **Template Types**
  - Student performance reports
  - Attendance summary reports
  - Financial reports
  - Fee collection reports
  - Admission reports
  - Payroll reports
  - Custom templates

- **Template Management**
  - Create templates
  - Share templates
  - Version control
  - Duplicate templates

### 3. Report Filters
- **Filter Types**
  - Date range filters
  - Dropdown filters
  - Multi-select filters
  - Search filters
  - Numeric range filters

- **Filter Management**
  - Add/remove filters
  - Default values
  - Conditional filters
  - Save filter sets

### 4. Report Scheduling
- **Scheduling Options**
  - One-time execution
  - Recurring (Daily, Weekly, Monthly, Yearly)
  - Specific time scheduling
  - Time zone support
  - Delivery method

- **Delivery Methods**
  - Email delivery
  - Portal download
  - Cloud storage
  - Print

### 5. Export Formats
- **Supported Formats**
  - PDF (with formatting)
  - Excel (.xlsx)
  - CSV
  - JSON
  - XML
  - HTML

- **Export Features**
  - Pagination
  - Bookmarks
  - Table of contents
  - Charts and graphs

### 6. Report Analytics
- **Usage Tracking**
  - Report run history
  - User access logs
  - Performance metrics
  - Popular reports
  - Failed reports

## Database Schema

### Tables

#### `reports`
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Report
  report_name VARCHAR(255) NOT NULL,
  report_description TEXT,
  report_type VARCHAR(50), -- STANDARD, CUSTOM, TEMPLATE
  
  -- Creator
  created_by UUID NOT NULL REFERENCES employees(id),
  
  -- Data source
  data_source VARCHAR(100) NOT NULL, -- STUDENTS, ACADEMIC, FINANCIAL, ATTENDANCE, HR, CUSTOM
  
  -- Configuration
  report_config JSONB, -- {fields, grouping, sorting, filters}
  
  -- Status
  status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, ARCHIVED
  
  -- Access
  is_public BOOLEAN DEFAULT FALSE,
  shared_with JSONB, -- Array of user IDs
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `report_templates`
```sql
CREATE TABLE report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Template
  template_name VARCHAR(255) NOT NULL,
  template_description TEXT,
  template_category VARCHAR(50),
  
  -- Configuration
  template_config JSONB, -- Template structure
  default_filters JSONB,
  
  -- Metadata
  is_default BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  created_by UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `report_executions`
```sql
CREATE TABLE report_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  
  -- Execution
  execution_status VARCHAR(50) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, FAILED
  execution_start_time TIMESTAMP DEFAULT NOW(),
  execution_end_time TIMESTAMP,
  
  -- Parameters
  applied_filters JSONB,
  
  -- Output
  record_count INT DEFAULT 0,
  file_url TEXT,
  file_format VARCHAR(50), -- PDF, XLSX, CSV, JSON
  
  -- User
  executed_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Metadata
  is_scheduled BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `report_schedules`
```sql
CREATE TABLE report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  
  -- Schedule
  schedule_name VARCHAR(255),
  frequency VARCHAR(50) NOT NULL, -- ONCE, DAILY, WEEKLY, MONTHLY, YEARLY
  
  -- Timing
  scheduled_date TIMESTAMP,
  time_of_day TIME,
  
  -- Recurrence
  recurrence_end_date DATE,
  recurrence_days JSONB, -- For weekly: [0,1,2,3,4,5,6]
  
  -- Delivery
  delivery_method VARCHAR(50), -- EMAIL, PORTAL, CLOUD, PRINT
  delivery_recipients JSONB, -- Array of emails
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_execution_date TIMESTAMP,
  next_execution_date TIMESTAMP,
  
  created_by UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `report_fields`
```sql
CREATE TABLE report_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Field definition
  field_name VARCHAR(100) NOT NULL,
  field_label VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL, -- TEXT, NUMBER, DATE, BOOLEAN, EMAIL
  
  -- Organization
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Metadata
  is_filterable BOOLEAN DEFAULT TRUE,
  is_sortable BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `report_access_log`
```sql
CREATE TABLE report_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  
  -- Access
  accessed_by UUID NOT NULL REFERENCES auth.users(id),
  accessed_at TIMESTAMP DEFAULT NOW(),
  
  -- Details
  access_type VARCHAR(50), -- VIEW, EXECUTE, DOWNLOAD, SHARE
  execution_id UUID REFERENCES report_executions(id),
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Views and Queries

#### Report Usage Summary
```sql
SELECT 
  r.id,
  r.report_name,
  COUNT(DISTINCT ral.accessed_by) as unique_users,
  COUNT(re.id) as total_executions,
  MAX(re.execution_end_time) as last_executed,
  AVG(EXTRACT(SECOND FROM (re.execution_end_time - re.execution_start_time))) as avg_execution_time_seconds
FROM reports r
LEFT JOIN report_access_log ral ON r.id = ral.report_id
LEFT JOIN report_executions re ON r.id = re.report_id
WHERE r.organization_id = $1
GROUP BY r.id, r.report_name
ORDER BY total_executions DESC;
```

## Components

### ReportBuilder
Location: `src/features/custom-reports/components/ReportBuilder.tsx`

**Purpose:** Build custom reports

**Props:**
```typescript
interface ReportBuilderProps {
  organizationId: string;
  templateId?: string;
  onSave: (report: Report) => void;
}
```

**Features:**
- Drag-drop interface
- Field selection
- Filter configuration
- Preview
- Save and template

### ReportList
Location: `src/features/custom-reports/components/ReportList.tsx`

**Purpose:** List available reports

**Props:**
```typescript
interface ReportListProps {
  organizationId: string;
  userId: string;
}
```

**Features:**
- Report listing
- Filtering
- Sorting
- Usage stats
- Quick actions

### ReportExport
Location: `src/features/custom-reports/components/ReportExport.tsx`

**Purpose:** Export reports

**Props:**
```typescript
interface ReportExportProps {
  reportId: string;
  filters?: Record<string, any>;
}
```

**Features:**
- Format selection
- Export progress
- Download management
- Email delivery

### ScheduleManager
Location: `src/features/custom-reports/components/ScheduleManager.tsx`

**Purpose:** Schedule reports

**Props:**
```typescript
interface ScheduleManagerProps {
  reportId: string;
  onSuccess: () => void;
}
```

**Features:**
- Schedule creation
- Recurrence setup
- Delivery configuration
- Schedule editing

## Services

### `report.service.ts`
Location: `src/features/custom-reports/services/report.service.ts`

```typescript
// Report CRUD
async createReport(data: CreateReportInput): Promise<Report>
async getReport(reportId: string): Promise<Report>
async listReports(organizationId: string, filters?: ReportFilters): Promise<Report[]>
async updateReport(reportId: string, data: UpdateReportInput): Promise<void>
async deleteReport(reportId: string): Promise<void>

// Report Execution
async executeReport(reportId: string, filters?: FilterInput[]): Promise<ReportExecution>
async getReportData(reportId: string, filters?: FilterInput[]): Promise<ReportData>
async downloadReport(executionId: string, format: ExportFormat): Promise<Blob>
async getExecutionStatus(executionId: string): Promise<ExecutionStatus>

// Templates
async listTemplates(organizationId: string): Promise<ReportTemplate[]>
async createTemplate(data: TemplateInput): Promise<ReportTemplate>
async getTemplate(templateId: string): Promise<ReportTemplate>
async updateTemplate(templateId: string, data: TemplateInput): Promise<void>
async deleteTemplate(templateId: string): Promise<void>

// Scheduling
async scheduleReport(reportId: string, schedule: ScheduleInput): Promise<ReportSchedule>
async updateSchedule(scheduleId: string, schedule: ScheduleInput): Promise<void>
async pauseSchedule(scheduleId: string): Promise<void>
async resumeSchedule(scheduleId: string): Promise<void>
async deleteSchedule(scheduleId: string): Promise<void>
async processScheduledReports(): Promise<void>

// Sharing
async shareReport(reportId: string, userIds: string[]): Promise<void>
async unshareReport(reportId: string, userId: string): Promise<void>
async getSharedWith(reportId: string): Promise<SharedUser[]>

// Analytics
async getReportUsage(reportId: string, period: DateRange): Promise<UsageStats>
async getTopReports(organizationId: string, limit: number): Promise<Report[]>
async getAccessLog(reportId: string): Promise<AccessLog[]>
```

### `report.queries.ts`
Location: `src/features/custom-reports/services/report.queries.ts`

```typescript
// React Query hooks
export const useReport = (reportId: string)
export const useReports = (organizationId: string)
export const useMyReports = (userId: string, organizationId: string)
export const useReportData = (reportId: string, filters?: FilterInput[])
export const useReportExecution = (executionId: string)
export const useReportTemplates = (organizationId: string)
export const useReportSchedules = (reportId: string)

// Mutations
export const useCreateReport = ()
export const useExecuteReport = ()
export const useScheduleReport = ()
export const useDownloadReport = ()
export const useShareReport = ()
```

## API Endpoints

### REST API (via Supabase AutoAPI)

```
GET    /rest/v1/reports?organization_id=eq.{id}
POST   /rest/v1/reports
PATCH  /rest/v1/reports/{id}
DELETE /rest/v1/reports/{id}

GET    /rest/v1/report_templates?organization_id=eq.{id}
POST   /rest/v1/report_templates
PATCH  /rest/v1/report_templates/{id}

POST   /rest/v1/report_executions
GET    /rest/v1/report_executions?report_id=eq.{id}

GET    /rest/v1/report_schedules?report_id=eq.{id}
POST   /rest/v1/report_schedules
PATCH  /rest/v1/report_schedules/{id}
DELETE /rest/v1/report_schedules/{id}

GET    /rest/v1/report_access_log?report_id=eq.{id}
POST   /rest/v1/report_access_log
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Users can view their own reports and shared reports
CREATE POLICY reports_view ON reports
  FOR SELECT USING (
    created_by = (SELECT id FROM employees WHERE auth.uid() = user_id)
    OR is_public = TRUE
    OR (SELECT id FROM auth.users WHERE id = auth.uid()) = ANY(shared_with)
  );

-- Only report owner can edit
CREATE POLICY reports_edit ON reports
  FOR UPDATE USING (
    created_by = (SELECT id FROM employees WHERE auth.uid() = user_id)
  );
```

## Implementation Workflow

### Phase 1: Core Setup
1. Create database tables
2. Set up report configuration
3. Define available fields

### Phase 2: Report Builder
1. Build ReportBuilder
2. Implement field selection
3. Add filter configuration

### Phase 3: Execution & Export
1. Implement report execution
2. Add export formats
3. Build ReportExport

### Phase 4: Scheduling
1. Build ScheduleManager
2. Implement scheduling logic
3. Add delivery methods

### Phase 5: Analytics & Sharing
1. Implement usage tracking
2. Add sharing features
3. Generate report analytics

## Testing Strategy

### Unit Tests
- Filter logic
- Data aggregation
- Export generation
- Schedule calculation

### Component Tests
- Builder interface
- Export options
- Schedule creation

### Integration Tests
- End-to-end report creation
- Scheduled execution
- Email delivery

## Performance Optimization

- Index on `organization_id, created_by`
- Cache popular reports
- Background job for execution
- Compress exports
- Archive old executions

## Future Enhancements

- AI-powered insights from reports
- Predictive analytics
- Waterfall charts
- Heat maps
- Interactive dashboards
- Real-time report updates
- Collaborative reporting
- Mobile report viewer
