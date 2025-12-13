# Lecture Timing & Timetables

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

Lecture Timing & Timetables handle the scheduling of classes and lectures across batches, including templates, holidays, and conflict detection.

---

## Database Schema

### Timetable Tables

```sql
-- Timetable Templates
CREATE TABLE timetable_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  branch_id UUID,
  
  template_name VARCHAR(255),
  description TEXT,
  
  -- Pattern
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_branch FOREIGN KEY (branch_id) 
    REFERENCES branches(id) ON DELETE CASCADE
);

-- Daily Schedule Slots
CREATE TABLE daily_schedule_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL,
  
  day_of_week INTEGER,                              -- 0-6 (Sunday-Saturday)
  slot_number INTEGER,                              -- 1st, 2nd, 3rd period
  start_time TIME,
  end_time TIME,
  duration_minutes INTEGER,
  
  break_type VARCHAR(50),                           -- 'class', 'break', 'lunch'
  
  CONSTRAINT fk_template FOREIGN KEY (template_id) 
    REFERENCES timetable_templates(id) ON DELETE CASCADE
);

-- Batch Timetable (Instances of schedules)
CREATE TABLE batch_timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL,
  template_id UUID,
  
  -- Weekly Schedule Configuration (JSONB for flexibility)
  schedule_config JSONB DEFAULT '{}',               -- { Monday: [...slots], Tuesday: [...] }
  
  effective_from DATE,
  effective_until DATE,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE,
  CONSTRAINT fk_template FOREIGN KEY (template_id) 
    REFERENCES timetable_templates(id) ON DELETE SET NULL
);

-- Subject-Slot Assignments (Which subject in which slot)
CREATE TABLE timetable_slot_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_timetable_id UUID NOT NULL,
  
  subject_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  room_id UUID,                                     -- Classroom/Resource ID
  
  day_of_week INTEGER,
  slot_number INTEGER,
  
  classroom_name VARCHAR(100),
  classroom_capacity INTEGER,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_timetable FOREIGN KEY (batch_timetable_id) 
    REFERENCES batch_timetables(id) ON DELETE CASCADE,
  CONSTRAINT fk_subject FOREIGN KEY (subject_id) 
    REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT fk_teacher FOREIGN KEY (teacher_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

-- Holiday Calendar
CREATE TABLE holiday_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  branch_id UUID,
  
  holiday_date DATE,
  holiday_name VARCHAR(255),
  holiday_type VARCHAR(50),                         -- 'national', 'regional', 'school', 'religious'
  
  description TEXT,
  is_optional BOOLEAN DEFAULT false,               -- Teachers can choose to work
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_branch FOREIGN KEY (branch_id) 
    REFERENCES branches(id) ON DELETE CASCADE
);

-- Timetable Exceptions (Manual overrides for specific dates)
CREATE TABLE timetable_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_timetable_id UUID NOT NULL,
  
  exception_date DATE,
  exception_type VARCHAR(50),                       -- 'holiday', 'substitute_class', 'cancelled', 'rescheduled'
  
  -- For Substitute Classes
  original_subject_id UUID,
  substitute_subject_id UUID,
  reason VARCHAR(255),
  
  -- For Rescheduled
  rescheduled_to_date DATE,
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_timetable FOREIGN KEY (batch_timetable_id) 
    REFERENCES batch_timetables(id) ON DELETE CASCADE,
  CONSTRAINT fk_original_subject FOREIGN KEY (original_subject_id) 
    REFERENCES subjects(id) ON DELETE SET NULL,
  CONSTRAINT fk_substitute_subject FOREIGN KEY (substitute_subject_id) 
    REFERENCES subjects(id) ON DELETE SET NULL
);

-- Classroom/Resource Master
CREATE TABLE classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  
  classroom_code VARCHAR(50),
  classroom_name VARCHAR(100),
  description TEXT,
  
  capacity INTEGER,
  floor_number INTEGER,
  
  resources JSONB DEFAULT '{}',                     -- { projector: true, whiteboard: true, computers: 30 }
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_branch FOREIGN KEY (branch_id) 
    REFERENCES branches(id) ON DELETE CASCADE
);

CREATE INDEX idx_timetable_templates_org ON timetable_templates(org_id);
CREATE INDEX idx_batch_timetables_batch ON batch_timetables(batch_id);
CREATE INDEX idx_slot_assignments_timetable ON timetable_slot_assignments(batch_timetable_id);
CREATE INDEX idx_holidays_org_date ON holiday_calendar(org_id, holiday_date);
CREATE INDEX idx_classrooms_branch ON classrooms(branch_id);
```

---

## Timetable Components

### 1. Timetable Builder

```typescript
// src/components/admin/TimetableManagement/TimetableBuilder.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { timetableService } from '@/services/academic/timetable.service';
import { Button } from '@/components/common/buttons/Button';
import { TimeSlot } from './TimeSlot';
import { Plus, Trash2 } from 'lucide-react';

interface TimetableBuilderProps {
  batchId: string;
  onSuccess: () => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TimetableBuilder: React.FC<TimetableBuilderProps> = ({
  batchId,
  onSuccess,
}) => {
  const [timeSlots, setTimeSlots] = useState([
    { time: '09:00', endTime: '10:00' },
    { time: '10:00', endTime: '10:30' },
    { time: '10:30', endTime: '11:30' },
  ]);
  
  const [timetable, setTimetable] = useState<Record<string, any[]>>({});
  
  const { data: subjects = [] } = useQuery({
    queryKey: ['batch-subjects', batchId],
    queryFn: () => timetableService.getBatchSubjects(batchId),
  });
  
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => timetableService.getTeachers(),
  });
  
  const { data: classrooms = [] } = useQuery({
    queryKey: ['classrooms'],
    queryFn: () => timetableService.getClassrooms(),
  });
  
  const { mutate: saveTimetable, isPending } = useMutation({
    mutationFn: () =>
      timetableService.saveBatchTimetable(batchId, {
        schedule_config: timetable,
      }),
    onSuccess,
  });
  
  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { time: '12:00', endTime: '13:00' }]);
  };
  
  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };
  
  const handleSlotChange = (day: string, slotIndex: number, data: any) => {
    const daySchedule = timetable[day] || [];
    daySchedule[slotIndex] = data;
    
    setTimetable({
      ...timetable,
      [day]: daySchedule,
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Build Timetable</h2>
        <Button onClick={addTimeSlot} variant="secondary">
          <Plus size={16} className="mr-2" />
          Add Time Slot
        </Button>
      </div>
      
      {/* Time Slots Config */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="font-semibold mb-4">Time Slots</h3>
        <div className="space-y-3">
          {timeSlots.map((slot, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                type="time"
                value={slot.time}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <span>to</span>
              <input
                type="time"
                value={slot.endTime}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <button
                onClick={() => removeTimeSlot(idx)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Timetable Grid */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 p-3 bg-gray-100 w-24">Time</th>
              {DAYS.map((day) => (
                <th key={day} className="border border-gray-300 p-3 bg-gray-100">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, slotIdx) => (
              <tr key={slotIdx}>
                <td className="border border-gray-300 p-3 font-medium bg-gray-50">
                  {slot.time}
                </td>
                {DAYS.map((day) => (
                  <td key={day} className="border border-gray-300 p-2">
                    <TimeSlot
                      subjects={subjects}
                      teachers={teachers}
                      classrooms={classrooms}
                      onChange={(data) => handleSlotChange(day, slotIdx, data)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex gap-3">
        <Button
          onClick={() => saveTimetable()}
          isLoading={isPending}
          disabled={isPending}
          className="flex-1"
        >
          Save Timetable
        </Button>
      </div>
    </div>
  );
};
```

### 2. Time Slot Component

```typescript
// src/components/admin/TimetableManagement/TimeSlot.tsx
import React from 'react';

interface TimeSlotProps {
  subjects: any[];
  teachers: any[];
  classrooms: any[];
  onChange: (data: any) => void;
}

export const TimeSlot: React.FC<TimeSlotProps> = ({
  subjects,
  teachers,
  classrooms,
  onChange,
}) => {
  return (
    <div className="space-y-2 text-sm">
      <select
        onChange={(e) => onChange({ subject_id: e.target.value })}
        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
      >
        <option value="">Subject</option>
        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name}
          </option>
        ))}
      </select>
      
      <select
        onChange={(e) => onChange({ teacher_id: e.target.value })}
        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
      >
        <option value="">Teacher</option>
        {teachers.map((teacher) => (
          <option key={teacher.id} value={teacher.id}>
            {teacher.full_name}
          </option>
        ))}
      </select>
      
      <select
        onChange={(e) => onChange({ classroom_id: e.target.value })}
        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
      >
        <option value="">Room</option>
        {classrooms.map((classroom) => (
          <option key={classroom.id} value={classroom.id}>
            {classroom.classroom_name}
          </option>
        ))}
      </select>
    </div>
  );
};
```

### 3. Holiday Calendar Component

```typescript
// src/components/admin/TimetableManagement/HolidayCalendar.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { timetableService } from '@/services/academic/timetable.service';
import { useOrganizationStore } from '@/store/organization.store';
import { useBranchStore } from '@/store/branch.store';
import { Button } from '@/components/common/buttons/Button';
import { Plus, Trash2 } from 'lucide-react';

export const HolidayCalendar: React.FC = () => {
  const { current: org } = useOrganizationStore();
  const { current: branch } = useBranchStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHoliday, setNewHoliday] = useState({
    date: '',
    name: '',
    type: 'national',
  });
  
  const { data: holidays = [], isLoading, refetch } = useQuery({
    queryKey: ['holidays', org?.id, branch?.id],
    queryFn: () =>
      timetableService.getHolidays(
        org!.id,
        branch?.id
      ),
    enabled: !!org,
  });
  
  const { mutate: addHoliday, isPending } = useMutation({
    mutationFn: () =>
      timetableService.addHoliday(org!.id, branch?.id, newHoliday),
    onSuccess: () => {
      setNewHoliday({ date: '', name: '', type: 'national' });
      setShowAddForm(false);
      refetch();
    },
  });
  
  const { mutate: removeHoliday } = useMutation({
    mutationFn: (holidayId: string) =>
      timetableService.removeHoliday(holidayId),
    onSuccess: () => {
      refetch();
    },
  });
  
  return (
    <div className="space-y-4 p-6 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Holiday Calendar</h3>
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add Holiday
        </Button>
      </div>
      
      {/* Add Form */}
      {showAddForm && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
          <input
            type="date"
            value={newHoliday.date}
            onChange={(e) =>
              setNewHoliday({ ...newHoliday, date: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          
          <input
            type="text"
            placeholder="Holiday Name"
            value={newHoliday.name}
            onChange={(e) =>
              setNewHoliday({ ...newHoliday, name: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          
          <select
            value={newHoliday.type}
            onChange={(e) =>
              setNewHoliday({ ...newHoliday, type: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="national">National</option>
            <option value="regional">Regional</option>
            <option value="school">School Holiday</option>
            <option value="religious">Religious</option>
          </select>
          
          <div className="flex gap-3">
            <Button
              onClick={() => addHoliday()}
              isLoading={isPending}
              disabled={!newHoliday.date || !newHoliday.name || isPending}
              className="flex-1"
            >
              Add Holiday
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowAddForm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      {/* Holidays List */}
      {isLoading ? (
        <p className="text-gray-500">Loading holidays...</p>
      ) : holidays.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No holidays added</p>
      ) : (
        <div className="space-y-2">
          {holidays.map((holiday) => (
            <div
              key={holiday.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
            >
              <div>
                <p className="font-medium">{holiday.holiday_name}</p>
                <p className="text-sm text-gray-600">
                  {new Date(holiday.holiday_date).toLocaleDateString()} •{' '}
                  {holiday.holiday_type}
                </p>
              </div>
              <button
                onClick={() => removeHoliday(holiday.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## Timetable Service

```typescript
// src/services/academic/timetable.service.ts
import { supabase } from '@/services/api/client';

export const timetableService = {
  async getBatchSubjects(batchId: string) {
    const { data: batch } = await supabase
      .from('course_batches')
      .select('course_id')
      .eq('id', batchId)
      .single();
    
    if (!batch) return [];
    
    const { data } = await supabase
      .from('course_subjects')
      .select('subjects(*)')
      .eq('course_id', batch.course_id);
    
    return data?.map((cs) => cs.subjects) || [];
  },
  
  async getTeachers() {
    const { data } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('primary_role', 'teacher');
    
    return data || [];
  },
  
  async getClassrooms(branchId?: string) {
    let query = supabase.from('classrooms').select('*');
    
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }
    
    const { data } = await query;
    return data || [];
  },
  
  async saveBatchTimetable(batchId: string, config: any) {
    const { data, error } = await supabase
      .from('batch_timetables')
      .upsert({
        batch_id: batchId,
        schedule_config: config.schedule_config,
        effective_from: new Date(),
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async getHolidays(orgId: string, branchId?: string) {
    let query = supabase
      .from('holiday_calendar')
      .select('*')
      .eq('org_id', orgId);
    
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }
    
    const { data } = await query.order('holiday_date');
    return data || [];
  },
  
  async addHoliday(
    orgId: string,
    branchId: string | undefined,
    holidayData: any
  ) {
    const { data, error } = await supabase
      .from('holiday_calendar')
      .insert({
        org_id: orgId,
        branch_id: branchId,
        holiday_date: holidayData.date,
        holiday_name: holidayData.name,
        holiday_type: holidayData.type,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async removeHoliday(holidayId: string) {
    const { error } = await supabase
      .from('holiday_calendar')
      .delete()
      .eq('id', holidayId);
    
    if (error) throw new Error(error.message);
  },
};
```

---

## Features

✅ **Timetable Templates** - Reusable weekly schedules
✅ **Flexible Time Slots** - Configurable period timings
✅ **Subject-Teacher Assignment** - Direct mapping in timetable
✅ **Classroom Management** - Resource allocation
✅ **Holiday Calendar** - National, regional, school holidays
✅ **Timetable Exceptions** - One-off changes and rescheduling
✅ **Conflict Detection** - Prevents overlapping assignments (future enhancement)

---

## Next Steps

1. ✅ Create timetable schema
2. ✅ Implement timetable builder
3. ✅ Build holiday calendar
4. ✅ Create timetable service
5. ✅ Complete Phase 4 - Academic Foundation

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Phase 4 Complete (All 5 Files 16-20)  
**Overall Progress:** 15 of 75 files complete (20%)  
**Next Phase:** PHASE_5_STUDENT_MANAGEMENT (Files 21-25)
