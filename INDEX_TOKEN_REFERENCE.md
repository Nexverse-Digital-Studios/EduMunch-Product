# EduMunch Index Token Reference Guide

## Quick Reference

### Assigned Index Tokens

| # | Token | Mnemonic | Translation |
|---|-------|----------|-------------|
| 1 | **1ENTK** | Ek Number Tuzhi Kambar | "One Number Your Chamber" |
| 2 | **2DDMRH** | Do Dil Mil Rahe Hai | "Two Hearts Uniting" |
| 3 | **3TTKB** | Teen Tigada Kaam Bigada | "Three Mistakes Spoil Work" |
| 4 | **4CBW** | Char Bottle Vodka | "Four Bottle Vodka" |
| 5 | **5HKSK** | Hai Katha Sangram Ki | "The Tale of Battle" |

---

## Database Table Naming Convention

### Pattern
```
[table_name]_[INDEX_TOKEN]
```

### All Core Tables (With Examples using 1ENTK)

#### User Management
- `users_1ENTK` - User accounts and authentication
- `sessions_1ENTK` - Session management
- `permissions_1ENTK` - Role-based permissions

#### Student Management
- `students_1ENTK` - Student information
- `parents_1ENTK` - Parent/guardian information
- `student_parent_relations_1ENTK` - M2M relationship

#### Academic Structure
- `academic_years_1ENTK` - Academic year configuration
- `courses_1ENTK` - Courses/classes (with fees_amount)
- `subjects_1ENTK` - Subject master data
- `course_subjects_1ENTK` - Course-subject mapping
- `topics_1ENTK` - Topics/chapters
- `topic_content_1ENTK` - Learning materials
- `batches_1ENTK` - Class batches/sections
- `batch_students_1ENTK` - Student enrollment

#### Teaching Staff
- `teachers_1ENTK` - Teacher information
- `teacher_subjects_1ENTK` - Subject allocation
- `lecture_templates_1ENTK` - Lecture templates

#### Attendance
- `attendance_1ENTK` - Daily attendance
- `attendance_subject_wise_1ENTK` - Subject-wise attendance
- `leave_applications_1ENTK` - Leave requests

#### Examinations
- `exam_types_1ENTK` - Exam categories
- `exams_1ENTK` - Exam schedule master
- `exam_schedules_1ENTK` - Subject-wise exam timetable
- `exam_marks_1ENTK` - Student marks
- `grade_scales_1ENTK` - Grading system

#### Fee Management
- `fee_structures_1ENTK` - Fee definitions
- `student_fees_1ENTK` - Student fee allocation
- `fee_payments_1ENTK` - Payment transactions
- `fee_concessions_1ENTK` - Scholarships/discounts

#### Communication
- `announcements_1ENTK` - Announcements
- `notifications_1ENTK` - User notifications
- `sms_logs_1ENTK` - SMS history
- `email_logs_1ENTK` - Email history

#### Timetable Management
- `timetable_periods_1ENTK` - Period definitions
- `timetables_1ENTK` - Weekly schedule
- `timetable_substitutions_1ENTK` - Substitute assignments

#### Optional (Tier 2+)
- `library_books_1ENTK` - Library books
- `library_issues_1ENTK` - Book issues/returns
- `transport_routes_1ENTK` - Transport routes
- `transport_vehicles_1ENTK` - Vehicles
- `student_transport_1ENTK` - Student transport allocation
- `hostel_buildings_1ENTK` - Hostel buildings
- `hostel_rooms_1ENTK` - Hostel rooms
- `hostel_allocations_1ENTK` - Room allocations
- `assignments_1ENTK` - Assignments
- `assignment_submissions_1ENTK` - Submissions
- `study_materials_1ENTK` - Study materials
- `staff_attendance_1ENTK` - Staff attendance
- `staff_leave_applications_1ENTK` - Staff leave
- `events_1ENTK` - Events
- `event_registrations_1ENTK` - Event registrations
- `alumni_1ENTK` - Alumni records
- `assets_1ENTK` - Asset management

---

## Environment Variables

### School Configuration
```bash
VITE_INDEX_TOKEN=1ENTK
VITE_SCHOOL_NAME=Delhi Public School
VITE_SCHOOL_CODE=DPS001

VITE_SUPABASE_URL=https://hub-mumbai-01.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### Dynamic Table Access
```typescript
// In TypeScript/JavaScript
const INDEX_TOKEN = import.meta.env.VITE_INDEX_TOKEN;
const tableName = (base: string) => `${base}_${INDEX_TOKEN}`;

// Usage
const studentTable = tableName('students'); // 'students_1ENTK'
const courseTable = tableName('courses');   // 'courses_1ENTK'
```

---

## Removed Components (No Longer in Schema)

### ❌ Removed Tables
- `branches_{INDEX_TOKEN}` - Multi-branch support removed
- `course_branch_pricing_{INDEX_TOKEN}` - Branch-wise pricing removed

### ❌ Removed Columns
From multiple tables:
- `branch_id` (students, batches, timetables)
- Branch-related indexes

### ✅ Added Components
To `courses_{INDEX_TOKEN}`:
- `fees_amount DECIMAL(10,2) NOT NULL` - Unified fee structure

---

## Migration Path

### If You Were Using Branches

1. **Identify branch data:**
   ```sql
   SELECT DISTINCT branch_id FROM batches_1ENTK;
   SELECT DISTINCT branch_id FROM students_1ENTK;
   ```

2. **Consolidate fees:**
   ```sql
   UPDATE courses_1ENTK c
   SET fees_amount = (
     SELECT fees_amount FROM course_branch_pricing_1ENTK 
     WHERE course_id = c.id LIMIT 1
   );
   ```

3. **Clean up:**
   ```sql
   ALTER TABLE students_1ENTK DROP COLUMN branch_id;
   ALTER TABLE batches_1ENTK DROP COLUMN branch_id;
   ALTER TABLE timetables_1ENTK DROP COLUMN branch_id;
   
   DROP TABLE course_branch_pricing_1ENTK;
   DROP TABLE branches_1ENTK;
   ```

---

## API Examples

### Getting Course Fees (Simplified)

**Before (Multi-Branch):**
```typescript
const { data: pricing } = await supabase
  .from(`course_branch_pricing_${INDEX_TOKEN}`)
  .select('fees_amount')
  .eq('course_id', courseId)
  .eq('branch_id', branchId)
  .single();
```

**After (Single-Branch):**
```typescript
const { data: course } = await supabase
  .from(`courses_${INDEX_TOKEN}`)
  .select('fees_amount')
  .eq('id', courseId)
  .single();
```

### Getting Batch Students

**Before:**
```typescript
const { data: students } = await supabase
  .from(`batch_students_${INDEX_TOKEN}`)
  .select(`
    *,
    student:student_id(
      *,
      user:user_id(*),
      branch:branch_id(*)
    )
  `)
  .eq('batch_id', batchId);
```

**After:**
```typescript
const { data: students } = await supabase
  .from(`batch_students_${INDEX_TOKEN}`)
  .select(`
    *,
    student:student_id(
      *,
      user:user_id(*)
    )
  `)
  .eq('batch_id', batchId);
```

---

## Future Extensions

### For Multi-Branch Support (XTRA Feature)

If you need multi-branch architecture in the future:

1. Create custom schema with:
   - `branches_[INDEX_TOKEN]`
   - `school_branch_mapping_[INDEX_TOKEN]`
   - Re-add `branch_id` to relevant tables

2. Create pricing layer:
   - Branch-wise fee structures
   - Location-specific configurations

3. Update RLS policies for branch-level access

*Contact Nexverse for implementation details.*

---

## Troubleshooting

### Table Not Found Error
**Error:** `relation "students_AZHBXC" does not exist`  
**Fix:** Update to use correct token (e.g., `1ENTK`) in table name

### Branch-Related Query Fails
**Error:** `column "branch_id" does not exist`  
**Fix:** Remove branch_id from SELECT, WHERE, and JOIN clauses

### Multi-Branch Schools
**Error:** Can't assign students to different branches  
**Solution:** This is now a custom XTRA feature. Contact Nexverse.

---

## Quick Copy-Paste Templates

### Creating New Tables
```sql
CREATE TABLE new_table_${INDEX_TOKEN} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Add columns here
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_new_table_created ON new_table_${INDEX_TOKEN}(created_at);
```

### Querying in TypeScript
```typescript
const INDEX_TOKEN = import.meta.env.VITE_INDEX_TOKEN;

const { data, error } = await supabase
  .from(`table_name_${INDEX_TOKEN}`)
  .select('*')
  .eq('id', recordId)
  .single();
```

### RLS Policy Template
```sql
CREATE POLICY "Users can view own data"
ON students_${INDEX_TOKEN}
FOR SELECT
USING (auth.uid() = user_id);
```

---

## Summary

✅ **Single-branch architecture** - Simplified data model  
✅ **New index tokens** - With meaningful mnemonics  
✅ **Unified pricing** - Fees stored directly in courses  
✅ **Better performance** - Fewer joins, simpler queries  
❌ **No multi-branch** - Custom XTRA feature if needed  

---

**Last Updated:** December 22, 2025  
**Schema Version:** 2.0  
**Valid for:** EduMunch Single-Branch Edition
