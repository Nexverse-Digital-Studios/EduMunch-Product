# Student Dashboard

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

The Student Dashboard provides students with a personalized hub for courses, assignments, grades, and learning progress tracking.

---

## Dashboard Features

### Main Dashboard View

```typescript
// src/pages/student-portal/Dashboard.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/store/user.store';
import { studentDashboardService } from '@/services/student/dashboard.service';
import { StatsCard } from '@/components/student/StatsCard';
import { CourseCard } from '@/components/student/CourseCard';
import { UpcomingAssignments } from '@/components/student/UpcomingAssignments';
import { RecentGrades } from '@/components/student/RecentGrades';
import { Loader, BookOpen, Clock, Target, Award } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useUserStore();
  
  // Fetch dashboard stats
  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ['student-stats', user?.id],
    queryFn: () => studentDashboardService.getStudentStats(user!.id),
    enabled: !!user,
  });
  
  // Fetch enrolled courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['student-courses', user?.id],
    queryFn: () => studentDashboardService.getEnrolledCourses(user!.id),
    enabled: !!user,
  });
  
  // Fetch upcoming assignments
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['upcoming-assignments', user?.id],
    queryFn: () => studentDashboardService.getUpcomingAssignments(user!.id),
    enabled: !!user,
  });
  
  // Fetch recent grades
  const { data: grades = [], isLoading: gradesLoading } = useQuery({
    queryKey: ['recent-grades', user?.id],
    queryFn: () => studentDashboardService.getRecentGrades(user!.id),
    enabled: !!user,
  });
  
  if (statsLoading || coursesLoading) return <div>Loading...</div>;
  
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.first_name}!</h1>
        <p className="text-gray-600 mt-1">Here's your learning progress</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={<BookOpen />}
          label="Active Courses"
          value={stats.active_courses || 0}
          color="blue"
        />
        <StatsCard
          icon={<Clock />}
          label="Pending Assignments"
          value={stats.pending_assignments || 0}
          color="yellow"
        />
        <StatsCard
          icon={<Award />}
          label="Average Grade"
          value={stats.average_grade || 'N/A'}
          color="green"
        />
        <StatsCard
          icon={<Target />}
          label="Attendance"
          value={`${stats.attendance_percentage || 0}%`}
          color="purple"
        />
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courses Section */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">My Courses</h2>
          <div className="grid gap-4">
            {coursesLoading ? (
              <Loader className="animate-spin" />
            ) : courses.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No active courses</p>
            ) : (
              courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            )}
          </div>
        </div>
        
        {/* Quick Links */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Quick Links</h2>
          <nav className="space-y-2">
            <a
              href="/student-portal/courses"
              className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <p className="font-medium">All Courses</p>
              <p className="text-sm text-gray-600">{courses.length} enrolled</p>
            </a>
            <a
              href="/student-portal/assignments"
              className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <p className="font-medium">Assignments</p>
              <p className="text-sm text-gray-600">{assignments.length} pending</p>
            </a>
            <a
              href="/student-portal/grades"
              className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <p className="font-medium">Grades</p>
              <p className="text-sm text-gray-600">View all results</p>
            </a>
            <a
              href="/student-portal/attendance"
              className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <p className="font-medium">Attendance</p>
              <p className="text-sm text-gray-600">{stats.attendance_percentage}% present</p>
            </a>
          </nav>
        </div>
      </div>
      
      {/* Upcoming Assignments */}
      <UpcomingAssignments assignments={assignments} isLoading={assignmentsLoading} />
      
      {/* Recent Grades */}
      <RecentGrades grades={grades} isLoading={gradesLoading} />
    </div>
  );
};
```

### Course Card Component

```typescript
// src/components/student/CourseCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Users, TrendingUp } from 'lucide-react';

interface CourseCardProps {
  course: {
    id: string;
    name: string;
    code: string;
    teacher_name: string;
    progress_percentage: number;
    total_modules: number;
    completed_modules: number;
  };
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const navigate = useNavigate();
  
  return (
    <div
      onClick={() => navigate(`/student-portal/courses/${course.id}`)}
      className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold">{course.name}</h3>
          <p className="text-sm text-gray-600">{course.code}</p>
        </div>
        <BookOpen size={24} className="text-blue-600" />
      </div>
      
      <p className="text-sm text-gray-600 mb-4">Teacher: {course.teacher_name}</p>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-gray-600">{course.progress_percentage}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600"
            style={{ width: `${course.progress_percentage}%` }}
          />
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Clock size={16} />
          <span>{course.completed_modules}/{course.total_modules} modules</span>
        </div>
      </div>
    </div>
  );
};
```

### Upcoming Assignments Component

```typescript
// src/components/student/UpcomingAssignments.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

interface UpcomingAssignmentsProps {
  assignments: any[];
  isLoading: boolean;
}

export const UpcomingAssignments: React.FC<UpcomingAssignmentsProps> = ({
  assignments,
  isLoading,
}) => {
  const navigate = useNavigate();
  
  const getStatusColor = (daysUntilDue: number) => {
    if (daysUntilDue <= 1) return 'red';
    if (daysUntilDue <= 3) return 'yellow';
    return 'green';
  };
  
  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };
  
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Upcoming Assignments</h2>
      
      {isLoading ? (
        <p className="text-gray-600">Loading...</p>
      ) : assignments.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No pending assignments</p>
      ) : (
        <div className="space-y-3">
          {assignments.slice(0, 5).map((assignment) => {
            const daysUntilDue = getDaysUntilDue(assignment.due_date);
            const statusColor = getStatusColor(daysUntilDue);
            
            return (
              <div
                key={assignment.id}
                onClick={() =>
                  navigate(`/student-portal/assignments/${assignment.id}`)
                }
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{assignment.title}</p>
                    <p className="text-sm text-gray-600">{assignment.course_name}</p>
                  </div>
                  
                  {assignment.is_submitted ? (
                    <CheckCircle size={20} className="text-green-600" />
                  ) : (
                    <div className={`px-3 py-1 rounded-full text-sm font-medium
                      ${statusColor === 'red' ? 'bg-red-100 text-red-700' : ''}
                      ${statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${statusColor === 'green' ? 'bg-green-100 text-green-700' : ''}
                    `}>
                      Due in {daysUntilDue} days
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {assignments.length > 5 && (
            <button
              onClick={() => navigate('/student-portal/assignments')}
              className="w-full text-center py-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View All Assignments ({assignments.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
};
```

---

## Dashboard Service

```typescript
// src/services/student/dashboard.service.ts
import { supabase } from '@/services/api/client';

export const studentDashboardService = {
  async getStudentStats(userId: string) {
    // Active courses
    const { count: activeCourses } = await supabase
      .from('batch_enrollments')
      .select('*', { count: 'exact' })
      .eq('student_id', userId)
      .eq('status', 'active');
    
    // Pending assignments
    const { count: pendingAssignments } = await supabase
      .from('assignments')
      .select('*', { count: 'exact' })
      .eq('assigned_to_id', userId)
      .eq('is_submitted', false);
    
    // Average grade
    const { data: grades } = await supabase
      .from('student_results')
      .select('marks_obtained')
      .eq('student_id', userId);
    
    const averageGrade = grades && grades.length > 0
      ? (grades.reduce((sum, g) => sum + g.marks_obtained, 0) / grades.length).toFixed(2)
      : 0;
    
    // Attendance
    const { data: attendance } = await supabase
      .from('attendance')
      .select('is_present')
      .eq('student_id', userId);
    
    const attendancePercentage = attendance && attendance.length > 0
      ? Math.round((attendance.filter((a) => a.is_present).length / attendance.length) * 100)
      : 0;
    
    return {
      active_courses: activeCourses || 0,
      pending_assignments: pendingAssignments || 0,
      average_grade: averageGrade,
      attendance_percentage: attendancePercentage,
    };
  },
  
  async getEnrolledCourses(userId: string) {
    const { data, error } = await supabase
      .from('batch_enrollments')
      .select(`
        course_batches(
          id,
          batch_name,
          courses(
            id,
            name,
            code
          ),
          primary_teacher_id,
          users(full_name)
        )
      `)
      .eq('student_id', userId)
      .eq('status', 'active');
    
    if (error) throw new Error(error.message);
    
    // Format response
    return data?.map((enrollment) => ({
      id: enrollment.course_batches.id,
      name: enrollment.course_batches.courses.name,
      code: enrollment.course_batches.courses.code,
      teacher_name: enrollment.course_batches.users.full_name,
      progress_percentage: 45, // TODO: Calculate from content progress
      total_modules: 12,
      completed_modules: 5,
    })) || [];
  },
  
  async getUpcomingAssignments(userId: string) {
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        id,
        title,
        due_date,
        is_submitted,
        courses(name)
      `)
      .eq('assigned_to_id', userId)
      .order('due_date')
      .limit(10);
    
    if (error) throw new Error(error.message);
    
    return data?.map((assignment) => ({
      ...assignment,
      course_name: assignment.courses.name,
    })) || [];
  },
  
  async getRecentGrades(userId: string) {
    const { data, error } = await supabase
      .from('student_results')
      .select(`
        id,
        assessment_name,
        marks_obtained,
        total_marks,
        assessment_date,
        subjects(name)
      `)
      .eq('student_id', userId)
      .order('assessment_date', { ascending: false })
      .limit(5);
    
    if (error) throw new Error(error.message);
    return data || [];
  },
};
```

---

## Next Steps

1. ✅ Create student dashboard page
2. ✅ Implement course card component
3. ✅ Build upcoming assignments widget
4. ✅ Create dashboard service
5. ✅ Proceed to `23_STUDENT_ENROLLMENT_WORKFLOW.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Student Dashboard Complete  
**Next Phase:** 23_STUDENT_ENROLLMENT_WORKFLOW.md
