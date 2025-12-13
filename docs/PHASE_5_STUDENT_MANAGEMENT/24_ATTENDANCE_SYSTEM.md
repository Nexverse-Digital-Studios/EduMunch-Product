# Attendance System

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

The Attendance System tracks student attendance across classes and provides analytics for attendance monitoring and reporting.

---

## Database Schema

### Attendance Tables

```sql
-- Attendance Records
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  
  class_date DATE,
  class_time TIME,
  
  lecture_id UUID,                                   -- Reference to scheduled lecture
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE,
  CONSTRAINT fk_subject FOREIGN KEY (subject_id) 
    REFERENCES subjects(id) ON DELETE CASCADE
);

-- Individual Student Attendance
CREATE TABLE student_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id UUID NOT NULL,
  student_id UUID NOT NULL,
  
  is_present BOOLEAN DEFAULT false,
  is_late BOOLEAN DEFAULT false,
  leave_type VARCHAR(50),                            -- NULL, 'sick', 'personal', 'excused'
  
  notes TEXT,
  marked_by UUID,
  marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_attendance FOREIGN KEY (attendance_id) 
    REFERENCES attendance(id) ON DELETE CASCADE,
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_marked_by FOREIGN KEY (marked_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Leave Applications
CREATE TABLE leave_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  batch_id UUID NOT NULL,
  
  leave_type VARCHAR(50),                            -- 'sick', 'personal', 'medical', 'other'
  reason TEXT,
  
  start_date DATE,
  end_date DATE,
  number_of_days INTEGER,
  
  status VARCHAR(50) DEFAULT 'pending',              -- 'pending', 'approved', 'rejected'
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  approved_by UUID,
  approved_at TIMESTAMP,
  approval_notes TEXT,
  
  supporting_document_url TEXT,
  
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE,
  CONSTRAINT fk_approved_by FOREIGN KEY (approved_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Attendance Summary (Materialized View)
CREATE MATERIALIZED VIEW attendance_summary AS
SELECT
  sa.student_id,
  a.batch_id,
  a.subject_id,
  COUNT(*) as total_classes,
  COUNT(CASE WHEN sa.is_present THEN 1 END) as classes_present,
  COUNT(CASE WHEN sa.is_late THEN 1 END) as classes_late,
  COUNT(CASE WHEN sa.leave_type IS NOT NULL THEN 1 END) as classes_leave,
  ROUND(
    (COUNT(CASE WHEN sa.is_present THEN 1 END)::numeric / COUNT(*) * 100),
    2
  ) as attendance_percentage
FROM student_attendance sa
JOIN attendance a ON sa.attendance_id = a.id
GROUP BY sa.student_id, a.batch_id, a.subject_id;

-- Attendance Alerts
CREATE TABLE attendance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  batch_id UUID NOT NULL,
  
  alert_type VARCHAR(50),                            -- 'low_attendance', 'consecutive_absences'
  threshold_percentage INTEGER,
  current_percentage DECIMAL(5, 2),
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  acknowledged_at TIMESTAMP,
  
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) 
    REFERENCES course_batches(id) ON DELETE CASCADE
);

CREATE INDEX idx_student_attendance_student ON student_attendance(student_id);
CREATE INDEX idx_student_attendance_date ON student_attendance(marked_at);
CREATE INDEX idx_attendance_batch_date ON attendance(batch_id, class_date);
CREATE INDEX idx_leave_applications_student ON leave_applications(student_id);
CREATE INDEX idx_leave_applications_status ON leave_applications(status);
CREATE INDEX idx_attendance_alerts_student ON attendance_alerts(student_id);
```

---

## Attendance Components

### 1. Attendance Marking Interface

```typescript
// src/components/teacher/AttendanceMarking/AttendanceMarking.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { attendanceService } from '@/services/academic/attendance.service';
import { DataTable } from '@/components/common/tables/DataTable';
import { Button } from '@/components/common/buttons/Button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface AttendanceMarkingProps {
  batchId: string;
  subjectId: string;
}

export const AttendanceMarking: React.FC<AttendanceMarkingProps> = ({
  batchId,
  subjectId,
}) => {
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [lateStudents, setLateStudents] = useState<Set<string>>(new Set());
  
  const { data: students = [] } = useQuery({
    queryKey: ['batch-students', batchId],
    queryFn: () => attendanceService.getBatchStudents(batchId),
  });
  
  const { mutate: saveAttendance, isPending } = useMutation({
    mutationFn: () =>
      attendanceService.markAttendance(batchId, subjectId, {
        attendance,
        lateStudents: Array.from(lateStudents),
      }),
  });
  
  const toggleAttendance = (studentId: string) => {
    setAttendance({
      ...attendance,
      [studentId]: !attendance[studentId],
    });
  };
  
  const toggleLate = (studentId: string) => {
    const newLateStudents = new Set(lateStudents);
    if (newLateStudents.has(studentId)) {
      newLateStudents.delete(studentId);
    } else {
      newLateStudents.add(studentId);
    }
    setLateStudents(newLateStudents);
  };
  
  const presentCount = Object.values(attendance).filter(Boolean).length;
  const totalCount = students.length;
  
  const columns = [
    {
      key: 'full_name',
      label: 'Student Name',
      render: (student: any) => (
        <div>
          <p className="font-medium">{student.full_name}</p>
          <p className="text-sm text-gray-600">{student.email}</p>
        </div>
      ),
    },
    {
      key: 'roll_number',
      label: 'Roll No.',
      render: (student: any) => (
        <span className="font-mono">{student.roll_number || '-'}</span>
      ),
    },
    {
      key: 'attendance',
      label: 'Attendance',
      render: (student: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleAttendance(student.id)}
            className={`p-2 rounded transition-colors ${
              attendance[student.id]
                ? 'bg-green-100 text-green-600'
                : 'bg-red-100 text-red-600'
            }`}
          >
            {attendance[student.id] ? (
              <CheckCircle size={20} />
            ) : (
              <XCircle size={20} />
            )}
          </button>
          
          {attendance[student.id] && (
            <button
              onClick={() => toggleLate(student.id)}
              className={`p-2 rounded transition-colors ${
                lateStudents.has(student.id)
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
              title="Mark Late"
            >
              <Clock size={20} />
            </button>
          )}
        </div>
      ),
    },
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mark Attendance</h2>
        <div className="text-right">
          <p className="text-sm text-gray-600">Present: {presentCount}/{totalCount}</p>
          <p className="text-xl font-bold text-green-600">
            {totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>
      
      <DataTable columns={columns} data={students} />
      
      <div className="flex gap-3 pt-4">
        <Button
          onClick={() => saveAttendance()}
          isLoading={isPending}
          disabled={isPending}
          className="flex-1"
        >
          Save Attendance
        </Button>
      </div>
    </div>
  );
};
```

### 2. Attendance Report Component

```typescript
// src/components/student/AttendanceReport.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/store/user.store';
import { attendanceService } from '@/services/academic/attendance.service';
import { Card } from '@/components/common/cards/Card';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

export const AttendanceReport: React.FC = () => {
  const { user } = useUserStore();
  
  const { data: summary = [] } = useQuery({
    queryKey: ['attendance-summary', user?.id],
    queryFn: () => attendanceService.getAttendanceSummary(user!.id),
    enabled: !!user,
  });
  
  const overallAttendance = summary.length > 0
    ? (summary.reduce((sum, s) => sum + (s.attendance_percentage || 0), 0) / summary.length).toFixed(2)
    : 0;
  
  const attendanceStatus = parseFloat(overallAttendance as string);
  const isLow = attendanceStatus < 75;
  
  return (
    <div className="space-y-6">
      {isLow && (
        <Card className="border-yellow-200 bg-yellow-50">
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900">Low Attendance Warning</h3>
              <p className="text-sm text-yellow-800 mt-1">
                Your attendance is below 75%. You may be at risk of academic penalties.
              </p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Overall Attendance */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Overall Attendance</h2>
        <div className="text-center">
          <p className="text-5xl font-bold text-blue-600">{overallAttendance}%</p>
          <p className="text-gray-600 mt-2">across all courses</p>
        </div>
      </Card>
      
      {/* Subject-wise Attendance */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Subject-wise Attendance</h2>
        <div className="space-y-3">
          {summary.map((item) => (
            <div key={item.subject_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{item.subject_name}</p>
                <p className="text-sm text-gray-600">
                  {item.classes_present}/{item.total_classes} classes attended
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-xl font-bold">{item.attendance_percentage}%</p>
                {item.attendance_percentage >= 75 ? (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp size={16} />
                    Good
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <TrendingDown size={16} />
                    Low
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
```

---

## Attendance Service

```typescript
// src/services/academic/attendance.service.ts
import { supabase } from '@/services/api/client';

export const attendanceService = {
  async getBatchStudents(batchId: string) {
    const { data, error } = await supabase
      .from('batch_enrollments')
      .select(`
        student_id,
        users(
          id,
          full_name,
          email,
          student_profiles(roll_number)
        )
      `)
      .eq('batch_id', batchId)
      .eq('status', 'active');
    
    if (error) throw new Error(error.message);
    
    return data?.map((enrollment) => ({
      id: enrollment.student_id,
      full_name: enrollment.users.full_name,
      email: enrollment.users.email,
      roll_number: enrollment.users.student_profiles?.[0]?.roll_number,
    })) || [];
  },
  
  async markAttendance(
    batchId: string,
    subjectId: string,
    attendanceData: {
      attendance: Record<string, boolean>;
      lateStudents: string[];
    }
  ) {
    // Create attendance record
    const { data: attendanceRecord, error: attendanceError } = await supabase
      .from('attendance')
      .insert({
        batch_id: batchId,
        subject_id: subjectId,
        class_date: new Date().toISOString().split('T')[0],
        class_time: new Date().toTimeString().split(' ')[0],
      })
      .select()
      .single();
    
    if (attendanceError) throw new Error(attendanceError.message);
    
    // Mark individual attendance
    const studentRecords = Object.entries(attendanceData.attendance).map(
      ([studentId, isPresent]) => ({
        attendance_id: attendanceRecord.id,
        student_id: studentId,
        is_present: isPresent,
        is_late: attendanceData.lateStudents.includes(studentId),
      })
    );
    
    const { error: studentError } = await supabase
      .from('student_attendance')
      .insert(studentRecords);
    
    if (studentError) throw new Error(studentError.message);
    
    return attendanceRecord;
  },
  
  async getAttendanceSummary(userId: string) {
    // Get student profile to find batch
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (!profile) return [];
    
    // Query materialized view
    const { data, error } = await supabase
      .from('attendance_summary')
      .select(`
        *,
        subjects(name)
      `)
      .eq('student_id', userId);
    
    if (error) throw new Error(error.message);
    
    return data?.map((summary) => ({
      ...summary,
      subject_name: summary.subjects.name,
    })) || [];
  },
  
  async applyForLeave(
    studentId: string,
    batchId: string,
    leaveData: any
  ) {
    const { data, error } = await supabase
      .from('leave_applications')
      .insert({
        student_id: studentId,
        batch_id: batchId,
        ...leaveData,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
};
```

---

## Next Steps

1. ✅ Create attendance schema
2. ✅ Implement attendance marking UI
3. ✅ Build attendance report
4. ✅ Create attendance service
5. ✅ Proceed to `25_STUDENT_PROGRESSION.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Attendance System Complete  
**Next Phase:** 25_STUDENT_PROGRESSION.md
