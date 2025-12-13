# Academic Calendar

## Overview
The Academic Calendar module manages organizational academic schedules including terms, holidays, important dates, session planning, and working day calculations for the entire institution.

## Module Objectives
- Create and manage academic calendar
- Define academic sessions and terms
- Manage holidays and vacation periods
- Track important academic dates
- Calculate working days
- Manage semester schedules
- Support multiple calendar views

## Key Features

### 1. Academic Sessions
- **Session Management**
  - Session start and end dates
  - Year definition (e.g., 2024-2025)
  - Branch-specific sessions
  - Session status (PLANNED, ACTIVE, CLOSED)

- **Session Components**
  - Multiple terms per session
  - Break periods
  - Exam schedules
  - Graduation dates

### 2. Terms & Semesters
- **Term Definition**
  - Term start and end dates
  - Number of working days
  - Teaching days
  - Holiday count
  - Exam schedule

- **Term Types**
  - Semester (2 per year)
  - Trimester (3 per year)
  - Quarter (4 per year)
  - Custom periods

### 3. Holiday Management
- **Holiday Types**
  - National holidays
  - Festival holidays
  - Vacation periods
  - Exam breaks
  - Foundation days

- **Holiday Features**
  - Multi-day holidays
  - Optional holidays
  - Gazetted holidays
  - School-specific holidays

### 4. Important Dates
- **Academic Milestones**
  - Admission opening date
  - Last admission date
  - Course start date
  - Mid-term exam date
  - Final exam date
  - Result declaration date
  - Fee payment deadline

- **Administrative Dates**
  - Holiday list release
  - Timetable release
  - Grade submission deadline
  - Course completion date

### 5. Working Day Calculation
- **Working Day Logic**
  - Calculate based on holidays
  - Exclude weekends
  - Exclude declared holidays
  - Custom exclusions
  - Generate work calendar

- **Compliance**
  - Minimum teaching days
  - Regulatory requirements
  - Attendance calculation
  - Leave calculation

### 6. Calendar Views
- **Visualization**
  - Monthly view
  - Semester view
  - Year view
  - Custom date range
  - Export capabilities

## Database Schema

### Tables

#### `academic_sessions`
```sql
CREATE TABLE academic_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  branch_id UUID REFERENCES branches(id),
  
  -- Session
  session_name VARCHAR(50) NOT NULL, -- e.g., "2024-2025"
  session_year INT NOT NULL,
  
  -- Dates
  session_start_date DATE NOT NULL,
  session_end_date DATE NOT NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'PLANNED', -- PLANNED, ACTIVE, CLOSED
  
  -- Metadata
  is_default BOOLEAN DEFAULT FALSE,
  remarks TEXT,
  
  created_by UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `academic_terms`
```sql
CREATE TABLE academic_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
  
  -- Term
  term_name VARCHAR(100) NOT NULL, -- e.g., "Fall Semester"
  term_type VARCHAR(50) NOT NULL, -- SEMESTER, TRIMESTER, QUARTER
  term_number INT, -- 1, 2, 3, etc.
  
  -- Dates
  term_start_date DATE NOT NULL,
  term_end_date DATE NOT NULL,
  
  -- Teaching days
  total_days INT,
  teaching_days INT,
  holiday_days INT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `holidays`
```sql
CREATE TABLE holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  branch_id UUID REFERENCES branches(id),
  
  -- Holiday
  holiday_name VARCHAR(255) NOT NULL,
  holiday_type VARCHAR(50) NOT NULL, -- NATIONAL, FESTIVAL, VACATION, EXAM_BREAK, FOUNDATION_DAY
  
  -- Dates
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_days INT,
  
  -- Status
  is_gazetted BOOLEAN DEFAULT FALSE,
  is_optional BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  remarks TEXT,
  
  created_by UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `important_dates`
```sql
CREATE TABLE important_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Date
  date_name VARCHAR(255) NOT NULL,
  date_type VARCHAR(50) NOT NULL, -- ACADEMIC, ADMINISTRATIVE, ADMISSION, EXAM, FINANCIAL
  
  scheduled_date DATE NOT NULL,
  
  -- Associated entities
  session_id UUID REFERENCES academic_sessions(id),
  term_id UUID REFERENCES academic_terms(id),
  batch_id UUID REFERENCES batches(id),
  
  -- Details
  description TEXT,
  remarks TEXT,
  
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern VARCHAR(50), -- YEARLY, MONTHLY, CUSTOM
  
  created_by UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `working_days_calendar`
```sql
CREATE TABLE working_days_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
  
  -- Date
  calendar_date DATE NOT NULL,
  
  -- Type
  day_type VARCHAR(50) NOT NULL, -- WORKING, HOLIDAY, WEEKEND, EXAM, SPECIAL
  
  -- Holiday reference
  holiday_id UUID REFERENCES holidays(id),
  
  -- Metadata
  day_name VARCHAR(20),
  is_teaching_day BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(organization_id, session_id, calendar_date)
);
```

#### `calendar_notifications`
```sql
CREATE TABLE calendar_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Event
  event_type VARCHAR(50), -- HOLIDAY_APPROACHING, IMPORTANT_DATE, SESSION_START, TERM_END
  event_date DATE NOT NULL,
  
  -- Notification
  notification_title VARCHAR(255),
  notification_body TEXT,
  days_before_notification INT DEFAULT 7,
  
  -- Status
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `term_schedules`
```sql
CREATE TABLE term_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term_id UUID NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
  
  -- Schedule
  schedule_name VARCHAR(255),
  
  -- Key dates in term
  classes_start_date DATE,
  classes_end_date DATE,
  midterm_exam_date DATE,
  final_exam_date DATE,
  result_declaration_date DATE,
  
  -- Minimum requirements
  minimum_teaching_days INT,
  minimum_attendance_percentage INT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Views and Queries

#### Academic Calendar View
```sql
SELECT 
  ac.calendar_date,
  ac.day_type,
  h.holiday_name,
  DAYNAME(ac.calendar_date) as day_name,
  ac.is_teaching_day
FROM working_days_calendar ac
LEFT JOIN holidays h ON ac.holiday_id = h.id
WHERE ac.organization_id = $1
  AND ac.calendar_date BETWEEN $2 AND $3
ORDER BY ac.calendar_date;
```

#### Session Summary
```sql
SELECT 
  ast.id as term_id,
  ast.term_name,
  ast.term_start_date,
  ast.term_end_date,
  ast.total_days,
  ast.teaching_days,
  ast.holiday_days,
  ROUND(100.0 * ast.teaching_days / ast.total_days, 2) as teaching_percentage
FROM academic_terms ast
JOIN academic_sessions asess ON ast.session_id = asess.id
WHERE asess.organization_id = $1
  AND asess.session_name = $2
ORDER BY ast.term_number;
```

## Components

### CalendarView
Location: `src/features/academic-calendar/components/CalendarView.tsx`

**Purpose:** Display academic calendar

**Props:**
```typescript
interface CalendarViewProps {
  organizationId: string;
  sessionId?: string;
  viewType?: 'month' | 'semester' | 'year';
  onDateSelect?: (date: Date) => void;
}
```

**Features:**
- Month/semester/year view
- Holiday highlighting
- Important dates
- Interactive selection
- Export functionality

### HolidayManager
Location: `src/features/academic-calendar/components/HolidayManager.tsx`

**Purpose:** Manage holidays

**Props:**
```typescript
interface HolidayManagerProps {
  organizationId: string;
  sessionId: string;
}
```

**Features:**
- Holiday creation
- Date range selection
- Holiday type
- Optional holiday marking
- Bulk import

### SessionManager
Location: `src/features/academic-calendar/components/SessionManager.tsx`

**Purpose:** Manage academic sessions

**Props:**
```typescript
interface SessionManagerProps {
  organizationId: string;
  onSuccess: () => void;
}
```

**Features:**
- Session creation
- Term configuration
- Term schedule
- Validation

### DateSelector
Location: `src/features/academic-calendar/components/DateSelector.tsx`

**Purpose:** Select important dates

**Props:**
```typescript
interface DateSelectorProps {
  organizationId: string;
  sessionId: string;
  onSelect: (date: ImportantDate) => void;
}
```

**Features:**
- Date picking
- Date type selection
- Associated entity selection
- Recurring date support

## Services

### `academicCalendar.service.ts`
Location: `src/features/academic-calendar/services/academicCalendar.service.ts`

```typescript
// Session Management
async createSession(data: SessionInput): Promise<AcademicSession>
async getSession(sessionId: string): Promise<AcademicSession>
async listSessions(organizationId: string): Promise<AcademicSession[]>
async setActiveSession(sessionId: string): Promise<void>
async closeSession(sessionId: string): Promise<void>

// Term Management
async createTerm(sessionId: string, data: TermInput): Promise<AcademicTerm>
async updateTerm(termId: string, data: TermInput): Promise<void>
async listTerms(sessionId: string): Promise<AcademicTerm[]>
async calculateTeachingDays(termId: string): Promise<number>

// Holiday Management
async addHoliday(data: HolidayInput): Promise<Holiday>
async getHolidays(organizationId: string, session?: string): Promise<Holiday[]>
async updateHoliday(holidayId: string, data: HolidayInput): Promise<void>
async deleteHoliday(holidayId: string): Promise<void>
async bulkImportHolidays(file: File, organizationId: string): Promise<void>

// Important Dates
async addImportantDate(data: ImportantDateInput): Promise<ImportantDate>
async getImportantDates(organizationId: string, filter?: string): Promise<ImportantDate[]>
async updateImportantDate(dateId: string, data: ImportantDateInput): Promise<void>
async deleteImportantDate(dateId: string): Promise<void>

// Working Days Calculation
async generateWorkingDaysCalendar(sessionId: string): Promise<void>
async getWorkingDays(organizationId: string, startDate: Date, endDate: Date): Promise<number>
async isWorkingDay(organizationId: string, date: Date): Promise<boolean>
async calculateAttendanceDays(startDate: Date, endDate: Date, holidays: Holiday[]): Promise<number>

// Calendar Management
async getCalendarView(organizationId: string, startDate: Date, endDate: Date): Promise<CalendarDay[]>
async exportCalendar(organizationId: string, format: 'PDF' | 'ICS' | 'XLSX'): Promise<Blob>
async sendCalendarNotifications(organizationId: string): Promise<void>
```

### `academicCalendar.queries.ts`
Location: `src/features/academic-calendar/services/academicCalendar.queries.ts`

```typescript
// React Query hooks
export const useSession = (sessionId: string)
export const useSessions = (organizationId: string)
export const useActiveSession = (organizationId: string)
export const useTerms = (sessionId: string)
export const useHolidays = (organizationId: string)
export const useImportantDates = (organizationId: string)
export const useWorkingDaysCalendar = (organizationId: string, startDate: Date, endDate: Date)

// Mutations
export const useCreateSession = ()
export const useCreateTerm = ()
export const useAddHoliday = ()
export const useAddImportantDate = ()
export const useGenerateWorkingDaysCalendar = ()
```

## API Endpoints

### REST API (via Supabase AutoAPI)

```
GET    /rest/v1/academic_sessions?organization_id=eq.{id}
POST   /rest/v1/academic_sessions
PATCH  /rest/v1/academic_sessions/{id}

GET    /rest/v1/academic_terms?session_id=eq.{id}
POST   /rest/v1/academic_terms
PATCH  /rest/v1/academic_terms/{id}

GET    /rest/v1/holidays?organization_id=eq.{id}
POST   /rest/v1/holidays
PATCH  /rest/v1/holidays/{id}
DELETE /rest/v1/holidays/{id}

GET    /rest/v1/important_dates?organization_id=eq.{id}
POST   /rest/v1/important_dates
PATCH  /rest/v1/important_dates/{id}

GET    /rest/v1/working_days_calendar?organization_id=eq.{id}
POST   /rest/v1/working_days_calendar

GET    /rest/v1/term_schedules?term_id=eq.{id}
POST   /rest/v1/term_schedules
PATCH  /rest/v1/term_schedules/{id}
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- All authenticated users can view public calendar
CREATE POLICY academic_calendar_view ON academic_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE auth.uid() = user_id
    )
    OR EXISTS (
      SELECT 1 FROM students 
      WHERE auth.uid() = user_id
    )
  );

-- Only admins can manage calendar
CREATE POLICY academic_calendar_manage ON academic_sessions
  FOR ALL USING (
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
2. Set up default session
3. Configure holidays

### Phase 2: Session Management
1. Build SessionManager
2. Implement term creation
3. Add term schedule

### Phase 3: Calendar Views
1. Build CalendarView
2. Add visualization
3. Implement export

### Phase 4: Working Days
1. Generate working days calendar
2. Implement calculations
3. Add compliance checks

### Phase 5: Notifications
1. Add event notifications
2. Implement reminders
3. Generate calendar reports

## Testing Strategy

### Unit Tests
- Working day calculation
- Holiday logic
- Date validation
- Session overlap detection

### Component Tests
- Calendar rendering
- Holiday marking
- Date selection

### Integration Tests
- Session creation
- Holiday application
- Working day calculation

## Performance Optimization

- Cache working days calendar
- Index on `organization_id, session_id, calendar_date`
- Pre-generate calendar for year
- Archive old sessions
- Batch notification sending

## Future Enhancements

- Multi-year calendar planning
- Calendar synchronization
- Regional holiday support
- Customizable calendar views
- Mobile calendar integration
- ICS calendar feed export
- AI-powered holiday suggestions
