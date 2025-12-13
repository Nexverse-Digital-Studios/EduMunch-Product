# Staff Attendance Tracking

## Overview
The Staff Attendance Tracking module manages employee attendance records, providing tools for marking attendance, generating reports, and tracking attendance patterns for all staff members.

## Module Objectives
- Record daily staff attendance
- Support multiple attendance marking methods
- Track attendance patterns and trends
- Generate attendance reports
- Calculate attendance percentage
- Validate against working hours

## Key Features

### 1. Attendance Marking
- **Multiple Marking Methods**
  - Manual mark (Admin/Manager)
  - Self-service mark (Employee)
  - Biometric integration (future)
  - Mobile app marking
  - Email confirmation

- **Attendance Status Types**
  - PRESENT: Employee worked full day
  - ABSENT: Employee absent without leave
  - HALF_DAY: Half day attendance (AM/PM)
  - LATE: Marked present but late arrival
  - LEAVE: On approved leave
  - WORK_FROM_HOME: Working remotely
  - HOLIDAY: Organization holiday
  - WEEKEND: Weekly off day

### 2. Attendance Recording
- **Time Tracking**
  - Clock-in time
  - Clock-out time
  - Overtime hours
  - Break duration tracking
  - Actual working hours

- **Approval Workflow**
  - Self-mark pending approval
  - Manager approval
  - Auto-approve certain scenarios
  - Rejection with reason

### 3. Attendance Reports
- **Summary Reports**
  - Daily attendance summary
  - Monthly attendance sheet
  - Attendance percentage calculation
  - Present/Absent/Leave breakdown

- **Detailed Reports**
  - Employee attendance history
  - Late arrivals tracking
  - Early departures
  - Overtime summary
  - Department-wise attendance

### 4. Absence & Late Management
- **Late Arrival Tracking**
  - Late hours calculation
  - Late frequency monitoring
  - Warnings and escalation
  - Pattern analysis

- **Absence Management**
  - Unmarked absences
  - Unplanned absences
  - Absence reason documentation
  - Absence approval

## Database Schema

### Tables

#### `staff_attendance`
```sql
CREATE TABLE staff_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  attendance_date DATE NOT NULL,
  
  -- Clock timings
  clock_in_time TIMESTAMP,
  clock_out_time TIMESTAMP,
  
  -- Status
  status VARCHAR(50) NOT NULL, -- PRESENT, ABSENT, HALF_DAY, LATE, LEAVE, WFH, HOLIDAY, WEEKEND
  
  -- Duration
  worked_hours DECIMAL(5,2),
  break_duration_minutes INT,
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  
  -- Location and device
  clock_in_location VARCHAR(100),
  clock_in_device VARCHAR(100),
  clock_out_location VARCHAR(100),
  clock_out_device VARCHAR(100),
  
  -- Approval
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES employees(id),
  approval_date TIMESTAMP,
  
  -- Reason for absence/late
  absence_reason TEXT,
  leave_application_id UUID REFERENCES leave_applications(id),
  
  -- Additional notes
  remarks TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  
  UNIQUE(employee_id, attendance_date)
);
```

#### `attendance_corrections`
```sql
CREATE TABLE attendance_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_attendance_id UUID NOT NULL REFERENCES staff_attendance(id) ON DELETE CASCADE,
  
  correction_type VARCHAR(50) NOT NULL, -- CLOCK_IN, CLOCK_OUT, STATUS_CHANGE, TIME_ADJUSTMENT
  
  old_value TEXT,
  new_value TEXT,
  
  reason TEXT NOT NULL,
  requested_by UUID NOT NULL REFERENCES employees(id),
  approved_by UUID REFERENCES employees(id),
  approval_date TIMESTAMP,
  
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(staff_attendance_id, correction_type)
);
```

#### `attendance_summary`
```sql
CREATE TABLE attendance_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Year and month
  summary_year INT NOT NULL,
  summary_month INT NOT NULL, -- 1-12
  
  -- Counts
  total_working_days INT,
  days_present INT DEFAULT 0,
  days_absent INT DEFAULT 0,
  days_leave INT DEFAULT 0,
  days_half_day INT DEFAULT 0,
  days_late INT DEFAULT 0,
  days_wfh INT DEFAULT 0,
  
  -- Percentage
  attendance_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Hours
  total_worked_hours DECIMAL(7,2) DEFAULT 0,
  total_overtime_hours DECIMAL(7,2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(employee_id, summary_year, summary_month)
);
```

#### `attendance_late_arrival`
```sql
CREATE TABLE attendance_late_arrival (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_attendance_id UUID NOT NULL REFERENCES staff_attendance(id) ON DELETE CASCADE,
  
  expected_arrival_time TIME NOT NULL,
  actual_arrival_time TIME NOT NULL,
  late_minutes INT NOT NULL,
  
  reason TEXT,
  is_excused BOOLEAN DEFAULT FALSE,
  excuse_approved_by UUID REFERENCES employees(id),
  excuse_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `attendance_policies`
```sql
CREATE TABLE attendance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  branch_id UUID REFERENCES branches(id),
  
  policy_name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Policy settings
  grace_period_minutes INT DEFAULT 5, -- Grace period for late arrival
  consecutive_absence_limit INT DEFAULT 3, -- Days before escalation
  absent_mark_after_hours INT DEFAULT 2, -- Hours after which mark as absent
  
  allow_self_marking BOOLEAN DEFAULT TRUE,
  require_approval BOOLEAN DEFAULT TRUE,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(organization_id, policy_name)
);
```

#### `attendance_deviations`
```sql
CREATE TABLE attendance_deviations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  deviation_type VARCHAR(50) NOT NULL, -- CONSECUTIVE_ABSENCE, FREQUENT_LATE, HIGH_OVERTIME, etc.
  
  deviation_date DATE NOT NULL,
  description TEXT,
  severity VARCHAR(50) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH
  
  is_escalated BOOLEAN DEFAULT FALSE,
  escalated_to UUID REFERENCES employees(id),
  escalation_date TIMESTAMP,
  
  is_resolved BOOLEAN DEFAULT FALSE,
  resolution_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Views and Queries

#### Daily Attendance Status
```sql
SELECT 
  e.id,
  e.first_name || ' ' || e.last_name as employee_name,
  d.name as designation,
  sa.attendance_date,
  sa.status,
  sa.clock_in_time,
  sa.clock_out_time,
  sa.worked_hours,
  sa.is_approved,
  CASE 
    WHEN sa.status = 'LATE' THEN sal.late_minutes
    ELSE 0
  END as late_minutes
FROM staff_attendance sa
JOIN employees e ON sa.employee_id = e.id
LEFT JOIN designations d ON e.designation_id = d.id
LEFT JOIN attendance_late_arrival sal ON sa.id = sal.staff_attendance_id
WHERE sa.organization_id = $1
  AND sa.attendance_date = CURRENT_DATE
ORDER BY e.first_name;
```

#### Monthly Attendance Summary
```sql
SELECT 
  e.id,
  e.first_name || ' ' || e.last_name as employee_name,
  summary.total_working_days,
  summary.days_present,
  summary.days_absent,
  summary.days_leave,
  summary.attendance_percentage,
  summary.total_worked_hours
FROM attendance_summary summary
JOIN employees e ON summary.employee_id = e.id
WHERE summary.organization_id = $1
  AND summary.summary_year = EXTRACT(YEAR FROM CURRENT_DATE)
  AND summary.summary_month = EXTRACT(MONTH FROM CURRENT_DATE)
ORDER BY summary.attendance_percentage DESC;
```

#### Attendance Deviations Alert
```sql
SELECT 
  e.id,
  e.first_name || ' ' || e.last_name as employee_name,
  ad.deviation_type,
  ad.severity,
  ad.description,
  ad.escalated_to,
  ad.is_escalated
FROM attendance_deviations ad
JOIN employees e ON ad.employee_id = e.id
WHERE ad.organization_id = $1
  AND ad.is_resolved = FALSE
ORDER BY ad.severity DESC, ad.deviation_date DESC;
```

## Components

### StaffAttendanceMarker
Location: `src/features/staffAttendance/components/StaffAttendanceMarker.tsx`

**Purpose:** Mark employee attendance for the day

**Props:**
```typescript
interface StaffAttendanceMarkerProps {
  organizationId: string;
  branchId: string;
  attendanceDate: Date;
  onSuccess: () => void;
}
```

**Features:**
- Employee list view
- Quick status selection
- Clock in/out time entry
- Bulk marking interface
- Leave synchronization
- Late arrival reason entry

### StaffAttendanceList
Location: `src/features/staffAttendance/components/StaffAttendanceList.tsx`

**Purpose:** Display attendance records with filtering

**Props:**
```typescript
interface StaffAttendanceListProps {
  organizationId: string;
  branchId?: string;
  filters?: AttendanceFilters;
  onSelectRecord: (record: StaffAttendance) => void;
}
```

**Features:**
- Filterable attendance list
- Date range selection
- Status-wise grouping
- Export to CSV/Excel
- Bulk correction interface
- Approval actions

### AttendanceReport
Location: `src/features/staffAttendance/components/AttendanceReport.tsx`

**Purpose:** Generate and view attendance reports

**Props:**
```typescript
interface AttendanceReportProps {
  organizationId: string;
  reportType: 'DAILY' | 'MONTHLY' | 'QUARTERLY';
  startDate: Date;
  endDate: Date;
}
```

**Features:**
- Multiple report formats
- Department-wise breakdown
- Charts and graphs
- Attendance percentage calculation
- Export functionality
- Comparisons with previous periods

### AttendanceStats
Location: `src/features/staffAttendance/components/AttendanceStats.tsx`

**Purpose:** Display attendance statistics and KPIs

**Props:**
```typescript
interface AttendanceStatsProps {
  organizationId: string;
  period: 'TODAY' | 'WEEK' | 'MONTH';
}
```

**Features:**
- KPI cards
- Attendance trends
- Late arrival trends
- Department comparison
- Real-time updates

### AttendanceDeviation
Location: `src/features/staffAttendance/components/AttendanceDeviation.tsx`

**Purpose:** View and manage attendance deviations

**Props:**
```typescript
interface AttendanceDeviationProps {
  organizationId: string;
  onEscalate: (deviationId: string) => void;
}
```

**Features:**
- List of deviations
- Severity indicators
- Escalation workflow
- Resolution tracking
- Auto-detection of patterns

## Services

### `staffAttendance.service.ts`
Location: `src/features/staffAttendance/services/staffAttendance.service.ts`

```typescript
// Attendance Marking
async markAttendance(data: MarkAttendanceInput): Promise<StaffAttendance>
async updateAttendance(attendanceId: string, data: UpdateAttendanceInput): Promise<StaffAttendance>
async getAttendanceRecord(employeeId: string, date: Date): Promise<StaffAttendance>
async getDailyAttendance(organizationId: string, date: Date): Promise<StaffAttendance[]>

// Clock In/Out
async clockIn(employeeId: string, location?: string): Promise<StaffAttendance>
async clockOut(employeeId: string, location?: string): Promise<StaffAttendance>
async getCurrentClockStatus(employeeId: string): Promise<ClockStatus>

// Corrections
async requestCorrection(attendanceId: string, correction: CorrectionInput): Promise<AttendanceCorrection>
async approveCorrection(correctionId: string): Promise<void>
async rejectCorrection(correctionId: string, reason: string): Promise<void>
async getPendingCorrections(organizationId: string): Promise<AttendanceCorrection[]>

// Late Arrival
async recordLateArrival(attendanceId: string, reason: string): Promise<AttendanceLateArrival>
async excuseLateArrival(lateArrivalId: string): Promise<void>
async getLateArrivals(employeeId: string, startDate: Date, endDate: Date): Promise<AttendanceLateArrival[]>

// Approval
async approveAttendance(attendanceId: string): Promise<void>
async rejectAttendance(attendanceId: string, reason: string): Promise<void>
async getPendingApprovals(managerId: string): Promise<StaffAttendance[]>

// Reports
async generateDailyReport(organizationId: string, date: Date): Promise<AttendanceReport>
async generateMonthlyReport(organizationId: string, year: number, month: number): Promise<AttendanceReport>
async generateEmployeeHistory(employeeId: string, startDate: Date, endDate: Date): Promise<AttendanceHistory>
async getAttendancePercentage(employeeId: string, period: DateRange): Promise<number>

// Summary
async updateAttendanceSummary(employeeId: string, year: number, month: number): Promise<AttendanceSummary>
async getMonthlyAttendanceSummary(organizationId: string, year: number, month: number): Promise<AttendanceSummary[]>

// Deviations
async detectDeviations(organizationId: string): Promise<void>
async getDeviations(organizationId: string, filters?: DeviationFilters): Promise<AttendanceDeviation[]>
async escalateDeviation(deviationId: string, escalateToId: string): Promise<void>
async resolveDeviation(deviationId: string, resolution: string): Promise<void>

// Bulk Operations
async bulkMarkAttendance(records: BulkAttendanceInput[]): Promise<void>
async bulkImportAttendance(file: File, organizationId: string): Promise<BulkImportResult>
```

### `staffAttendance.queries.ts`
Location: `src/features/staffAttendance/services/staffAttendance.queries.ts`

```typescript
// React Query hooks
export const useAttendanceRecord = (employeeId: string, date: Date)
export const useDailyAttendance = (organizationId: string, date: Date)
export const useMonthlyAttendance = (employeeId: string, year: number, month: number)
export const usePendingApprovals = (managerId: string)
export const useAttendanceReport = (organizationId: string, startDate: Date, endDate: Date)
export const useAttendanceDeviations = (organizationId: string)
export const useEmployeeAttendanceStats = (employeeId: string, period: DateRange)

// Mutations
export const useMarkAttendance = ()
export const useClockIn = ()
export const useClockOut = ()
export const useApproveAttendance = ()
export const useRequestCorrection = ()
export const useEscalateDeviation = ()
```

## API Endpoints

### REST API (via Supabase AutoAPI)

```
GET    /rest/v1/staff_attendance?organization_id=eq.{id}&attendance_date=eq.{date}
POST   /rest/v1/staff_attendance
PATCH  /rest/v1/staff_attendance/{id}

GET    /rest/v1/attendance_corrections?staff_attendance_id=eq.{id}
POST   /rest/v1/attendance_corrections
PATCH  /rest/v1/attendance_corrections/{id}

GET    /rest/v1/attendance_summary?employee_id=eq.{id}
GET    /rest/v1/attendance_summary?organization_id=eq.{id}&summary_year=eq.{year}&summary_month=eq.{month}

GET    /rest/v1/attendance_late_arrival?employee_id=eq.{id}
POST   /rest/v1/attendance_late_arrival

GET    /rest/v1/attendance_deviations?organization_id=eq.{id}
PATCH  /rest/v1/attendance_deviations/{id}
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Employees can view their own attendance
CREATE POLICY staff_attendance_self_view ON staff_attendance
  FOR SELECT USING (
    employee_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
  );

-- Managers can view team attendance
CREATE POLICY staff_attendance_team_view ON staff_attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = employee_id
        AND e.reporting_manager_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
    )
  );

-- Only HR and above can mark/approve
CREATE POLICY staff_attendance_manage ON staff_attendance
  FOR INSERT, UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('HR_MANAGER', 'ADMIN', 'SUPER_ADMIN')
    )
  );
```

## Implementation Workflow

### Phase 1: Core Setup
1. Create database tables
2. Set up attendance policies
3. Initialize default configurations

### Phase 2: Attendance Marking
1. Build StaffAttendanceMarker component
2. Implement clock in/out logic
3. Add to HR dashboard

### Phase 3: Approval Workflow
1. Implement approval system
2. Add corrections interface
3. Manage pending approvals

### Phase 4: Reports & Analytics
1. Build AttendanceReport component
2. Implement summary calculations
3. Add to analytics dashboard

### Phase 5: Deviation Management
1. Implement deviation detection
2. Build escalation workflow
3. Add alerts and notifications

## Testing Strategy

### Unit Tests
- Attendance marking logic
- Summary calculation
- Late arrival detection
- Deviation detection algorithm

### Component Tests
- StaffAttendanceMarker rendering
- Attendance filtering and sorting
- Report generation

### Integration Tests
- End-to-end attendance marking
- Approval workflow
- Summary calculation accuracy

## Performance Optimization

- Index on `employee_id, attendance_date` for quick lookups
- Batch summary calculations monthly
- Cache attendance summaries
- Archive old records for reporting

## Future Enhancements

- Biometric attendance integration
- Mobile app for attendance marking
- Geo-location based attendance
- Facial recognition support
- Integration with CCTV systems
- Predictive analytics for absenteeism
