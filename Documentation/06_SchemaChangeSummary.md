# EduMunch: Database Schema Summary & Key Changes

> Summary of the updated database structure aligned with VRaZ reference system

---

## Key Architecture Changes

### 1. **Course-Based Structure (instead of Class-based)**

**Old Structure:**
- `classes` → `sections` → `students`
- Simple K-12 school model

**New Structure:**
- `courses` → `batches` → `students`
- Supports schools, coaching centers, tuitions, and colleges
- Multi-branch support with branch-specific pricing

### 2. **Core Academic Tables**

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `courses_{TOKEN}` | Course master (11th, 12th, JEE, NEET, CET) | course_name, course_code, duration_months |
| `branches_{TOKEN}` | Institution branches | branch_name, branch_code, location |
| `course_branch_pricing_{TOKEN}` | Branch-specific course fees | course_id, branch_id, fees_amount |
| `subjects_{TOKEN}` | Subject master | subject_name, subject_code, subject_type |
| `course_subjects_{TOKEN}` | Course-subject mapping | course_id, subject_id |
| `topics_{TOKEN}` | Topics/chapters within subjects | subject_id, topic_name, parent_topic_id |
| `topic_content_{TOKEN}` | Learning materials for topics | topic_id, content_type, content_url |
| `batches_{TOKEN}` | Class sections/batches | course_id, branch_id, batch_name, capacity |
| `batch_students_{TOKEN}` | Student batch enrollment | batch_id, student_id, roll_number |

---

## 3. **Subject & Content Hierarchy**

```
Course (e.g., "JEE Foundation")
  ↓
Subject (e.g., "Mathematics", "Physics")
  ↓
Topic (e.g., "Calculus", "Thermodynamics")
  ↓
Subtopic (e.g., "Differentiation", "First Law")
  ↓
Content (PDFs, Videos, Links, Quizzes)
```

### Implementation:
- **`topics_{TOKEN}`**: Hierarchical structure with `parent_topic_id`
- **`topic_content_{TOKEN}`**: Attach learning materials to topics
- **`study_materials_{TOKEN}`**: Links to courses, batches, subjects, and topics

---

## 4. **Enhanced Timetable Management**

### Features:
- **Weekly timetable view** (week_start_date based)
- **Batch-specific scheduling**
- **Time-based slots** (not period-based)
- **Lecture merging** across batches
- **Substitute teacher tracking**
- **Lecture templates** for reusable scheduling

### Key Tables:

```sql
-- Weekly timetable with time slots
timetables_{TOKEN} (
  batch_id,
  week_start_date,
  day_of_week,
  start_time,
  end_time,
  subject_id,
  teacher_id,
  room_number,
  is_merged,
  merged_with_batch_ids[]
)

-- Lecture templates for reuse
lecture_templates_{TOKEN} (
  template_name,
  subject_id,
  duration_minutes,
  default_teacher_id
)

-- Substitute assignments
timetable_substitutions_{TOKEN} (
  timetable_id,
  original_teacher_id,
  substitute_teacher_id,
  substitution_date
)
```

---

## 5. **Roles & Permissions Structure**

### From VRaZ Reference:

| Role | Access Level |
|------|--------------|
| **Super Admin** | Full system access |
| **Branch Admin** | Branch-level management |
| **Front Desk** | Student enrollment, fee collection |
| **Teacher** | Batch-specific teaching access |
| **Student** | Personal data access |
| **Parent** | Child data access |
| **Employee** | Staff-level access |

### Implementation:

```sql
users_{TOKEN} (
  role: 'admin_super', 'admin_branch', 'front_desk', 
        'teacher', 'student', 'parent', 'employee'
)

permissions_{TOKEN} (
  role,
  module,
  can_view,
  can_create,
  can_edit,
  can_delete
)
```

---

## 6. **Updated Student Structure**

### Changes:
- ❌ Removed: `class_id`, `section_id`
- ✅ Added: `course_id`, `branch_id`
- Batch assignment via `batch_students_{TOKEN}` table

```sql
students_{TOKEN} (
  admission_number,
  course_id,        -- Links to courses table
  branch_id,        -- Links to branches table
  batch_year,
  ...
)

batch_students_{TOKEN} (
  batch_id,
  student_id,
  enrollment_date,
  roll_number
)
```

---

## 7. **Attendance System**

### Batch-Based Attendance:

```sql
-- Daily batch-wise attendance
attendance_{TOKEN} (
  student_id,
  batch_id,          -- Changed from class_id
  date,
  status
)

-- Subject/lecture-wise attendance
attendance_subject_wise_{TOKEN} (
  student_id,
  batch_id,
  subject_id,
  timetable_id,      -- Links to specific lecture
  date,
  status
)
```

---

## 8. **Exam & Assessment**

### Updated Structure:

```sql
exam_schedules_{TOKEN} (
  exam_id,
  batch_id,          -- Specific batch (optional)
  course_id,         -- Course-wide exams
  subject_id,
  exam_date,
  start_time,
  end_time
)
```

---

## 9. **Fee Management with Branch Pricing**

### Branch-Specific Fees:

```sql
course_branch_pricing_{TOKEN} (
  course_id,
  branch_id,
  fees_amount        -- ₹1,20,000 for Kalyan, ₹1,40,000 for Manpada
)

student_fees_{TOKEN} (
  student_id,
  academic_year_id,
  fee_structure_id,
  total_amount,
  discount_amount,
  final_amount
)
```

---

## 10. **LMS Features**

### Assignment & Study Material:

```sql
-- Assignments
assignments_{TOKEN} (
  batch_id,          -- Changed from class_id/section_id
  subject_id,
  teacher_id,
  title,
  submission_date
)

-- Study materials with topic linking
study_materials_{TOKEN} (
  course_id,
  batch_id,
  subject_id,
  topic_id,          -- NEW: Link to specific topic
  material_type,
  file_url
)
```

---

## 11. **Teacher-Subject-Batch Mapping**

```sql
teacher_subjects_{TOKEN} (
  teacher_id,
  batch_id,          -- Changed from class_id/section_id
  subject_id,
  academic_year_id
)
```

### Example:
- Teacher "ASM" teaches "Mathematics" to "Kalyan Branch - 27KJ1"
- Teacher "VMM" teaches "Mathematics" to "Manpada Branch - 27MJ1"

---

## Migration Path from Old Schema

### For Existing Schools on Old Schema:

1. **Create new tables**: courses, branches, batches, topics
2. **Data migration**:
   ```sql
   -- Map old classes to new courses
   INSERT INTO courses_TOKEN (course_name, course_code)
   SELECT class_name, class_code FROM classes_TOKEN;
   
   -- Map old sections to new batches
   INSERT INTO batches_TOKEN (course_id, batch_name, batch_code)
   SELECT new_course_id, section_name, section_code 
   FROM sections_TOKEN;
   
   -- Migrate student assignments
   INSERT INTO batch_students_TOKEN (batch_id, student_id)
   SELECT new_batch_id, id FROM students_TOKEN;
   ```

3. **Update foreign keys** in all dependent tables
4. **Test thoroughly** before removing old tables

---

## Benefits of New Structure

### 1. **Flexibility**
- ✅ Supports K-12 schools
- ✅ Supports coaching centers (JEE, NEET, CET)
- ✅ Supports tuition classes
- ✅ Supports colleges

### 2. **Multi-Branch Support**
- ✅ Branch-specific pricing
- ✅ Branch-level reporting
- ✅ Cross-branch analytics

### 3. **Better Content Organization**
- ✅ Hierarchical topic structure
- ✅ Topic-wise study materials
- ✅ Progress tracking per topic

### 4. **Advanced Scheduling**
- ✅ Weekly timetable management
- ✅ Lecture merging across batches
- ✅ Reusable lecture templates
- ✅ Time-based (not period-based)

### 5. **Scalability**
- ✅ Handles complex organizational structures
- ✅ Supports multiple courses per institution
- ✅ Batch-level granularity

---

## Backward Compatibility

For schools already using the old schema, we maintain backward compatibility through:

1. **Legacy table support** (keep old tables with `_legacy` suffix)
2. **Database views** that map old structure to new
3. **Migration tools** in Dev Panel
4. **Gradual migration** approach (both systems running parallel)

---

## Next Steps

1. **Generate SQL files** for all new tables
2. **Create migration scripts** for existing schools
3. **Update API layer** to work with new structure
4. **Update UI components** (Admin Dashboard, Web App)
5. **Test with pilot school**

---

**Status:** ✅ Schema redesign complete
**Last Updated:** December 22, 2025
**Version:** 2.0.0 (Major update with course-based structure)
