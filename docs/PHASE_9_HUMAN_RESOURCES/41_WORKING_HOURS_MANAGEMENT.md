# Working Hours Management

## Overview
The Working Hours Management module defines and manages employee working hours, schedules, and availability. This system supports flexible scheduling, multi-shift configurations, and branch-specific time slots.

## Module Objectives
- Define standard working hours per organization/branch
- Support multiple shift configurations
- Manage week-off and holidays
- Track employee availability
- Support flexible working arrangements
- Validate scheduling against working hours

## Key Features

### 1. Working Hours Configuration
- **Standard Hours Setup**
  - Organization-level default hours (e.g., 09:00 AM - 05:30 PM)
  - Branch-specific hour customization
  - Employee-specific schedules
  - Shift-based configurations

- **Shift Management**
  - Multiple shifts per day
  - Shift start and end times
  - Break timings
  - Shift rotation support
  - Shift-wise holidays

### 2. Day-wise Schedule
- **Weekly Configuration**
  - Working days and week-offs
  - Multiple week-off support
  - Day-specific timings (different times for different days)
  - Holiday inclusions

- **Schedule Templates**
  - Predefined schedules (Morning, Evening, Afternoon shifts)
  - Custom schedule creation
  - Clone existing schedules
  - Template management

### 3. Week-off Management
- **Single Week-off**
  - Traditional single week-off (e.g., Sunday)
  - Customizable per employee

- **Multiple Week-offs**
  - Support for 2 separate week-off days
  - Alternate week-offs
  - Rotating week-offs

- **Floating Week-offs**
  - Employee choice in week-off day
  - Management and tracking

### 4. Availability Slots
- **Employee Availability**
  - Available time slots
  - Availability by day
  - Availability constraints
  - Slot booking

- **Unavailability Management**
  - Blocked time periods
  - Leave periods
  - Class/meeting commitments
  - Time-off requests

### 5. Special Configurations
- **Flexible Working**
  - Work-from-home slots
  - Flexible start times
  - Compressed schedules
  - Part-time arrangements

- **Seasonal Adjustments**
  - Summer schedule
  - Winter schedule
  - Exam period adjustments
  - Holiday-specific changes

## Database Schema

### Tables

#### `working_hours_config`
```sql
CREATE TABLE working_hours_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  branch_id UUID REFERENCES branches(id),
  
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Default timing
  default_start_time TIME NOT NULL,
  default_end_time TIME NOT NULL,
  lunch_break_start TIME,
  lunch_break_end TIME,
  lunch_break_duration_minutes INT DEFAULT 30,
  
  -- Working days
  monday BOOLEAN DEFAULT TRUE,
  tuesday BOOLEAN DEFAULT TRUE,
  wednesday BOOLEAN DEFAULT TRUE,
  thursday BOOLEAN DEFAULT TRUE,
  friday BOOLEAN DEFAULT TRUE,
  saturday BOOLEAN DEFAULT TRUE,
  sunday BOOLEAN DEFAULT FALSE,
  
  -- Week-offs
  primary_weekoff VARCHAR(20), -- DAY_NAME
  secondary_weekoff VARCHAR(20),
  
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);
```

#### `shifts`
```sql
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  name VARCHAR(100) NOT NULL, -- Morning, Evening, Afternoon, Night
  code VARCHAR(20),
  description TEXT,
  
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration_minutes INT DEFAULT 30,
  break_start_time TIME,
  break_end_time TIME,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(organization_id, name)
);
```

#### `employee_working_hours`
```sql
CREATE TABLE employee_working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  working_hours_config_id UUID REFERENCES working_hours_config(id),
  
  -- Employee-specific overrides
  start_time TIME,
  end_time TIME,
  break_duration_minutes INT,
  
  -- Shift assignment
  shift_id UUID REFERENCES shifts(id),
  
  -- Flexibility options
  is_flexible_start BOOLEAN DEFAULT FALSE,
  flexible_start_time_range JSONB, -- {from: TIME, to: TIME}
  is_flexible_end BOOLEAN DEFAULT FALSE,
  flexible_end_time_range JSONB, -- {from: TIME, to: TIME}
  
  -- Work arrangement type
  work_type VARCHAR(50) DEFAULT 'FULL_TIME', -- FULL_TIME, PART_TIME, FLEXIBLE, HYBRID
  work_location VARCHAR(50), -- OFFICE, HOME, HYBRID
  
  effective_from DATE NOT NULL,
  effective_to DATE,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(employee_id, effective_from)
);
```

#### `employee_weekoffs`
```sql
CREATE TABLE employee_weekoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  
  weekoff_day VARCHAR(20) NOT NULL, -- SUNDAY, MONDAY, etc.
  weekoff_type VARCHAR(50) DEFAULT 'WEEKLY', -- WEEKLY, ALTERNATE, FLOATING
  alternate_day VARCHAR(20), -- For alternate week-offs
  
  effective_from DATE NOT NULL,
  effective_to DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(employee_id, effective_from)
);
```

#### `availability_slots`
```sql
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  is_available BOOLEAN DEFAULT TRUE,
  reason TEXT, -- Leave, Meeting, Class, etc.
  related_entity_id UUID, -- Reference to leave, meeting, etc.
  related_entity_type VARCHAR(50), -- LEAVE, MEETING, CLASS, etc.
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(employee_id, slot_date, start_time)
);
```

#### `day_wise_schedule`
```sql
CREATE TABLE day_wise_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  working_hours_config_id UUID NOT NULL REFERENCES working_hours_config(id),
  
  day_name VARCHAR(20) NOT NULL, -- SUNDAY, MONDAY, etc.
  is_working_day BOOLEAN DEFAULT TRUE,
  
  start_time TIME,
  end_time TIME,
  shift_id UUID REFERENCES shifts(id),
  
  break_start_time TIME,
  break_end_time TIME,
  break_duration_minutes INT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(working_hours_config_id, day_name)
);
```

#### `schedule_templates`
```sql
CREATE TABLE schedule_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Template type
  template_type VARCHAR(50), -- MORNING, EVENING, AFTERNOON, NIGHT, CUSTOM
  
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(organization_id, name)
);
```

#### `schedule_template_details`
```sql
CREATE TABLE schedule_template_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES schedule_templates(id) ON DELETE CASCADE,
  
  day_name VARCHAR(20) NOT NULL,
  is_working_day BOOLEAN DEFAULT TRUE,
  
  start_time TIME,
  end_time TIME,
  break_start_time TIME,
  break_end_time TIME,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Views and Queries

#### Current Active Schedule
```sql
SELECT 
  e.id as employee_id,
  e.first_name || ' ' || e.last_name as employee_name,
  COALESCE(ewh.start_time, whc.default_start_time) as start_time,
  COALESCE(ewh.end_time, whc.default_end_time) as end_time,
  s.name as shift_name,
  ewh.work_type,
  ewh.work_location
FROM employees e
LEFT JOIN employee_working_hours ewh ON e.id = ewh.employee_id 
  AND ewh.is_active = TRUE 
  AND ewh.effective_from <= CURRENT_DATE 
  AND (ewh.effective_to IS NULL OR ewh.effective_to >= CURRENT_DATE)
LEFT JOIN working_hours_config whc ON ewh.working_hours_config_id = whc.id 
  OR (ewh.working_hours_config_id IS NULL AND whc.is_default = TRUE)
LEFT JOIN shifts s ON ewh.shift_id = s.id
WHERE e.organization_id = $1
ORDER BY e.first_name;
```

#### Employee Availability for a Date Range
```sql
SELECT 
  slot_date,
  start_time,
  end_time,
  is_available,
  reason
FROM availability_slots
WHERE employee_id = $1
  AND slot_date BETWEEN $2 AND $3
ORDER BY slot_date, start_time;
```

## Components

### WorkingHoursForm
Location: `src/features/workingHours/components/WorkingHoursForm.tsx`

**Purpose:** Create and edit working hours configurations

**Props:**
```typescript
interface WorkingHoursFormProps {
  config?: WorkingHoursConfig;
  organizationId: string;
  branchId?: string;
  onSuccess: (config: WorkingHoursConfig) => void;
}
```

**Features:**
- Multi-section form (Basic, Day-wise, Week-offs, Breaks)
- Day-wise time configuration
- Week-off selection
- Break configuration
- Template selection

### DayTimeConfig
Location: `src/features/workingHours/components/DayTimeConfig.tsx`

**Purpose:** Configure day-wise working hours

**Props:**
```typescript
interface DayTimeConfigProps {
  days: DayConfig[];
  onChange: (days: DayConfig[]) => void;
  showShiftSelect?: boolean;
}
```

**Features:**
- Grid-based day configuration
- Toggle working/non-working days
- Time picker for each day
- Shift assignment
- Break configuration
- Copy settings to other days

### AvailabilitySchedule
Location: `src/features/workingHours/components/AvailabilitySchedule.tsx`

**Purpose:** View and manage employee availability

**Props:**
```typescript
interface AvailabilityScheduleProps {
  employeeId: string;
  startDate: Date;
  endDate: Date;
  onSlotClick: (slot: AvailabilitySlot) => void;
}
```

**Features:**
- Calendar view of availability
- Color-coded availability status
- Hover tooltips for details
- Edit availability modal
- Bulk availability update

### ScheduleTemplateBuilder
Location: `src/features/workingHours/components/ScheduleTemplateBuilder.tsx`

**Purpose:** Create and manage schedule templates

**Props:**
```typescript
interface ScheduleTemplateBuilderProps {
  template?: ScheduleTemplate;
  organizationId: string;
  onSuccess: (template: ScheduleTemplate) => void;
}
```

**Features:**
- Template creation wizard
- Day-wise configuration grid
- Copy from existing template
- Preview schedule
- Template cloning

### EmployeeScheduleAssignment
Location: `src/features/workingHours/components/EmployeeScheduleAssignment.tsx`

**Purpose:** Assign working hours to employees

**Props:**
```typescript
interface EmployeeScheduleAssignmentProps {
  employeeId: string;
  organizationId: string;
  onSuccess: () => void;
}
```

**Features:**
- Select working hours config
- Effective date selection
- Override individual settings
- Flexible working options
- Change history view

## Services

### `workingHours.service.ts`
Location: `src/features/workingHours/services/workingHours.service.ts`

```typescript
// Configuration Management
async createWorkingHoursConfig(data: CreateConfigInput): Promise<WorkingHoursConfig>
async updateWorkingHoursConfig(configId: string, data: UpdateConfigInput): Promise<WorkingHoursConfig>
async getWorkingHoursConfig(configId: string): Promise<WorkingHoursConfig>
async getDefaultConfig(organizationId: string): Promise<WorkingHoursConfig>
async getConfigByBranch(branchId: string): Promise<WorkingHoursConfig>

// Day-wise Schedule
async updateDayWiseSchedule(configId: string, schedule: DayConfig[]): Promise<void>
async getDayWiseSchedule(configId: string): Promise<DayConfig[]>

// Employee Assignment
async assignWorkingHours(employeeId: string, configId: string, effectiveFrom: Date): Promise<void>
async updateEmployeeWorkingHours(employeeId: string, data: UpdateEmployeeHoursInput): Promise<void>
async getEmployeeWorkingHours(employeeId: string): Promise<EmployeeWorkingHours>
async getEmployeeScheduleHistory(employeeId: string): Promise<EmployeeWorkingHours[]>

// Week-off Management
async setEmployeeWeekoff(employeeId: string, weekoff: WeekoffInput): Promise<void>
async getEmployeeWeekoffs(employeeId: string): Promise<EmployeeWeekoff[]>
async updateWeekoff(weekoffId: string, data: UpdateWeekoffInput): Promise<void>

// Availability Management
async getEmployeeAvailability(employeeId: string, startDate: Date, endDate: Date): Promise<AvailabilitySlot[]>
async blockAvailability(employeeId: string, slot: AvailabilitySlotInput): Promise<void>
async unblockAvailability(slotId: string): Promise<void>
async getBulkAvailability(employeeIds: string[], date: Date): Promise<Map<string, AvailabilitySlot[]>>

// Templates
async createScheduleTemplate(data: ScheduleTemplateInput): Promise<ScheduleTemplate>
async getScheduleTemplates(organizationId: string): Promise<ScheduleTemplate[]>
async applyTemplateToEmployee(employeeId: string, templateId: string): Promise<void>
async cloneTemplate(templateId: string, newName: string): Promise<ScheduleTemplate>

// Validation
async validateScheduleConflict(employeeId: string, startTime: Time, endTime: Time, date: Date): Promise<boolean>
async getEffectiveWorkingHours(employeeId: string, date: Date): Promise<EmployeeWorkingHours>
```

### `workingHours.queries.ts`
Location: `src/features/workingHours/services/workingHours.queries.ts`

```typescript
// React Query hooks
export const useWorkingHoursConfig = (configId: string)
export const useDefaultConfig = (organizationId: string)
export const useEmployeeWorkingHours = (employeeId: string)
export const useEmployeeAvailability = (employeeId: string, startDate: Date, endDate: Date)
export const useScheduleTemplates = (organizationId: string)
export const useEmployeeWeekoffs = (employeeId: string)

// Mutations
export const useCreateWorkingHoursConfig = ()
export const useUpdateWorkingHoursConfig = ()
export const useAssignWorkingHours = ()
export const useBlockAvailability = ()
export const useCreateScheduleTemplate = ()
```

## API Endpoints

### REST API (via Supabase AutoAPI)

```
GET    /rest/v1/working_hours_config?organization_id=eq.{id}
POST   /rest/v1/working_hours_config
PATCH  /rest/v1/working_hours_config/{id}

GET    /rest/v1/shifts?organization_id=eq.{id}
POST   /rest/v1/shifts
PATCH  /rest/v1/shifts/{id}

GET    /rest/v1/employee_working_hours?employee_id=eq.{id}
POST   /rest/v1/employee_working_hours
PATCH  /rest/v1/employee_working_hours/{id}

GET    /rest/v1/employee_weekoffs?employee_id=eq.{id}
POST   /rest/v1/employee_weekoffs
PATCH  /rest/v1/employee_weekoffs/{id}

GET    /rest/v1/availability_slots?employee_id=eq.{id}&slot_date=gte.{date}
POST   /rest/v1/availability_slots
DELETE /rest/v1/availability_slots/{id}

GET    /rest/v1/schedule_templates?organization_id=eq.{id}
POST   /rest/v1/schedule_templates
PATCH  /rest/v1/schedule_templates/{id}
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Working Hours Config: Employees can view their own
CREATE POLICY working_hours_view ON working_hours_config
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organization_access WHERE user_id = auth.uid()
    )
  );

-- Employee Working Hours: Own or Manager's team members
CREATE POLICY employee_hours_view ON employee_working_hours
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = employee_id
        AND (
          e.id = (SELECT id FROM employees WHERE auth.uid() = user_id)
          OR e.reporting_manager_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
        )
    )
  );

-- Availability Slots: Own availability or team manager
CREATE POLICY availability_view ON availability_slots
  FOR SELECT USING (
    employee_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
    OR EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = employee_id
        AND e.reporting_manager_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
    )
  );
```

## Implementation Workflow

### Phase 1: Core Setup
1. Create database tables
2. Set up default configurations
3. Implement basic service functions

### Phase 2: Configuration UI
1. Build WorkingHoursForm
2. Build DayTimeConfig component
3. Create schedule templates

### Phase 3: Employee Assignment
1. Build EmployeeScheduleAssignment
2. Implement assignment service
3. Add to employee profile

### Phase 4: Availability Management
1. Build AvailabilitySchedule component
2. Implement availability blocking
3. Add to employee selection

### Phase 5: Advanced Features
1. Flexible working configurations
2. Shift rotation management
3. Seasonal schedule adjustments

## Testing Strategy

### Unit Tests
- Schedule configuration creation
- Availability calculation
- Week-off determination
- Time overlap detection

### Component Tests
- DayTimeConfig rendering
- AvailabilitySchedule interaction
- Template builder workflow

### Integration Tests
- Employee schedule assignment
- Availability blocking flow
- Schedule inheritance

## Performance Optimization

- Index on `employee_id, effective_from` for quick lookups
- Cache working hours configuration
- Batch availability slot queries
- Pre-calculate availability for scheduling

## Future Enhancements

- Biometric integration for attendance sync
- Automated schedule conflict detection
- Shift exchange requests
- Overtime tracking against working hours
- Rostering algorithm integration
