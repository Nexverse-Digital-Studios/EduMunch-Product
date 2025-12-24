# EduMunch: Complete Database Schema Design

> Multi-tenant architecture using table prefixing with Index Tokens. All tables follow `[table_name]_[INDEX_TOKEN]` convention.
> Single-branch architecture: Each school is treated as a single branch entity.

---

## Index Token Suffixes

| School # | Suffix  | Mnemonic |
|---------|---------|----------|
| 1 | 1ENTK | Ek Number Tuzhi Kambar |
| 2 | 2DDMRH | Do Dil Mil Rahe Hai |
| 3 | 3TTKB | Teen Tigada Kaam Bigada |
| 4 | 4CBW | Char Bottle Vodka |
| 5 | 5HKSK | Hai Katha Sangram Ki |

---

## Schema Design Principles

1. **No Foreign Keys Across Tenants**: Each school's tables are isolated
2. **Strict Naming Convention**: `tablename_[INDEX_TOKEN]` format (e.g., `users_1ENTK`, `students_2DDMRH`)
3. **Single Branch Architecture**: No multi-branch support; each school is one branch
4. **UUID Primary Keys**: For global uniqueness and security
5. **Timestamps**: All tables include `created_at`, `updated_at`
6. **Soft Deletes**: `deleted_at` for data recovery
7. **JSONB for Flexibility**: Use JSONB for dynamic/optional fields
8. **RLS Enabled**: Row Level Security on all tables

---

## CORE TABLES (Required for All Schools)

### 1. Users & Authentication

#### `users_{INDEX_TOKEN}`
Primary user authentication and profile table.

```sql
CREATE TABLE users_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(15),
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'student', 'teacher', 'parent', 'admin_super', 'admin_hr', 'admin_academic', 'admin_finance'
  profile_photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_email_verified BOOLEAN DEFAULT false,
  is_phone_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users_1ENTK(email);
CREATE INDEX idx_users_role ON users_1ENTK(role);
CREATE INDEX idx_users_active ON users_1ENTK(is_active) WHERE deleted_at IS NULL;
```

#### `sessions_{INDEX_TOKEN}`
User session management for security.

```sql
CREATE TABLE sessions_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT UNIQUE NOT NULL,
  device_info JSONB, -- {device_type, browser, os, ip_address}
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON sessions_1ENTK(user_id);
CREATE INDEX idx_sessions_token ON sessions_1ENTK(token);
```

#### `permissions_{INDEX_TOKEN}`
Granular permission management.

```sql
CREATE TABLE permissions_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL,
  module VARCHAR(100) NOT NULL, -- 'attendance', 'fee', 'exam', etc.
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  custom_permissions JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_permissions_role_module ON permissions_1ENTK(role, module);
```

---

### 2. Student Management

#### `students_{INDEX_TOKEN}`
Core student information.

```sql
CREATE TABLE students_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE, -- Links to users table
  admission_number VARCHAR(50) UNIQUE NOT NULL,
  roll_number VARCHAR(50),
  course_id UUID NOT NULL,
  batch_year VARCHAR(10) NOT NULL, -- '2024-2025'
  
  -- Personal Info
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20) NOT NULL,
  blood_group VARCHAR(5),
  aadhar_number VARCHAR(12),
  nationality VARCHAR(50) DEFAULT 'Indian',
  religion VARCHAR(50),
  caste VARCHAR(50),
  category VARCHAR(20), -- 'General', 'OBC', 'SC', 'ST'
  
  -- Contact Info
  email VARCHAR(255),
  phone VARCHAR(15),
  address_line1 TEXT,
  address_line2 TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  
  -- Academic Info
  previous_school TEXT,
  admission_date DATE NOT NULL,
  tc_number VARCHAR(50),
  tc_issued_date DATE,
  
  -- Medical Info
  medical_conditions JSONB, -- [{condition, severity, medication}]
  allergies TEXT[],
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(15),
  
  -- Documents (URLs in R2)
  photo_url TEXT,
  birth_certificate_url TEXT,
  aadhar_card_url TEXT,
  transfer_certificate_url TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'graduated', 'transferred'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_students_user ON students_1ENTK(user_id);
CREATE INDEX idx_students_admission ON students_1ENTK(admission_number);
CREATE INDEX idx_students_course ON students_1ENTK(course_id);
CREATE INDEX idx_students_status ON students_1ENTK(status) WHERE deleted_at IS NULL;
```

#### `parents_{INDEX_TOKEN}`
Parent/Guardian information.

```sql
CREATE TABLE parents_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE,
  
  -- Personal Info
  full_name VARCHAR(255) NOT NULL,
  relationship VARCHAR(50) NOT NULL, -- 'Father', 'Mother', 'Guardian'
  email VARCHAR(255),
  phone VARCHAR(15) NOT NULL,
  alternate_phone VARCHAR(15),
  occupation VARCHAR(100),
  annual_income DECIMAL(12,2),
  
  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  
  -- Documents
  aadhar_number VARCHAR(12),
  photo_url TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_parents_user ON parents_1ENTK(user_id);
CREATE INDEX idx_parents_phone ON parents_1ENTK(phone);
```

#### `student_parent_relations_{INDEX_TOKEN}`
Many-to-many relationship between students and parents.

```sql
CREATE TABLE student_parent_relations_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  parent_id UUID NOT NULL,
  is_primary_contact BOOLEAN DEFAULT false,
  can_pickup BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_student_parent_student ON student_parent_relations_1ENTK(student_id);
CREATE INDEX idx_student_parent_parent ON student_parent_relations_1ENTK(parent_id);
CREATE UNIQUE INDEX idx_student_parent_unique ON student_parent_relations_1ENTK(student_id, parent_id);
```

---

### 3. Academic Structure

#### `academic_years_{INDEX_TOKEN}`
Academic year configuration.

```sql
CREATE TABLE academic_years_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_code VARCHAR(20) UNIQUE NOT NULL, -- '2024-25'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `courses_{INDEX_TOKEN}`
Course/Class master (e.g., Class 11th, JEE, NEET, CET).

```sql
CREATE TABLE courses_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_name VARCHAR(100) NOT NULL, -- '11th', 'JEE Foundation', 'NEET 2 years'
  course_code VARCHAR(20) UNIQUE NOT NULL, -- '11', 'JEE', 'NEET'
  course_order INTEGER, -- For sorting
  description TEXT,
  duration_months INTEGER, -- Course duration
  fees_amount DECIMAL(10,2) NOT NULL, -- Single fee structure for school
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_courses_code ON courses_1ENTK(course_code);
CREATE INDEX idx_courses_active ON courses_1ENTK(is_active) WHERE deleted_at IS NULL;
```

#### `subjects_{INDEX_TOKEN}`
Subject master data.

```sql
CREATE TABLE subjects_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_name VARCHAR(100) NOT NULL, -- 'Mathematics', 'Physics', 'Biology'
  subject_code VARCHAR(20) UNIQUE NOT NULL, -- 'MATH', 'PHY', 'BIO'
  subject_type VARCHAR(50), -- 'Theory', 'Practical', 'General Knowledge', 'Test purpose'
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_subjects_code ON subjects_1ENTK(subject_code);
CREATE INDEX idx_subjects_active ON subjects_1ENTK(is_active) WHERE deleted_at IS NULL;
```

#### `course_subjects_{INDEX_TOKEN}`
Subject allocation to courses.

```sql
CREATE TABLE course_subjects_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  is_mandatory BOOLEAN DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_course_subjects_course ON course_subjects_1ENTK(course_id);
CREATE INDEX idx_course_subjects_subject ON course_subjects_1ENTK(subject_id);
CREATE UNIQUE INDEX idx_course_subjects_unique ON course_subjects_1ENTK(course_id, subject_id);
```

#### `topics_{INDEX_TOKEN}`
Topics/chapters within subjects.

```sql
CREATE TABLE topics_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL,
  topic_name VARCHAR(255) NOT NULL,
  topic_code VARCHAR(50),
  description TEXT,
  parent_topic_id UUID, -- For subtopics/hierarchy
  display_order INTEGER,
  estimated_hours DECIMAL(4,1), -- Time needed to cover topic
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_topics_subject ON topics_1ENTK(subject_id);
CREATE INDEX idx_topics_parent ON topics_1ENTK(parent_topic_id);
```

#### `topic_content_{INDEX_TOKEN}`
Learning materials for topics.

```sql
CREATE TABLE topic_content_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL,
  content_type VARCHAR(50) NOT NULL, -- 'PDF', 'Video', 'Link', 'Document', 'Quiz'
  content_title VARCHAR(255) NOT NULL,
  content_url TEXT,
  description TEXT,
  display_order INTEGER,
  uploaded_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_topic_content_topic ON topic_content_1ENTK(topic_id);
```

#### `batches_{INDEX_TOKEN}`
Class batches/sections (replaces old sections table).

```sql
CREATE TABLE batches_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  batch_name VARCHAR(100) NOT NULL, -- '27KJ1', 'Morning Batch A'
  batch_code VARCHAR(50) UNIQUE NOT NULL,
  capacity INTEGER DEFAULT 40,
  start_time TIME,
  end_time TIME,
  class_days JSONB, -- ['Monday', 'Tuesday', 'Wednesday']
  batch_teacher_id UUID, -- Primary batch coordinator
  room_number VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_batches_course ON batches_1ENTK(course_id);
CREATE INDEX idx_batches_teacher ON batches_1ENTK(batch_teacher_id);
CREATE INDEX idx_batches_code ON batches_1ENTK(batch_code);
```

#### `batch_students_{INDEX_TOKEN}`
Student enrollment in batches.

```sql
CREATE TABLE batch_students_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL,
  student_id UUID NOT NULL,
  enrollment_date DATE NOT NULL,
  roll_number VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_batch_students_batch ON batch_students_1ENTK(batch_id);
CREATE INDEX idx_batch_students_student ON batch_students_1ENTK(student_id);
CREATE UNIQUE INDEX idx_batch_students_unique ON batch_students_1ENTK(batch_id, student_id);
```

#### `teachers_{INDEX_TOKEN}`
Teacher information.

```sql
CREATE TABLE teachers_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE,
  employee_code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Personal Info
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  blood_group VARCHAR(5),
  aadhar_number VARCHAR(12),
  pan_number VARCHAR(10),
  
  -- Contact
  email VARCHAR(255),
  phone VARCHAR(15) NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  
  -- Professional
  qualification VARCHAR(255),
  specialization VARCHAR(255),
  experience_years INTEGER,
  joining_date DATE NOT NULL,
  employment_type VARCHAR(50), -- 'Permanent', 'Contract', 'Part-time'
  designation VARCHAR(100),
  department VARCHAR(100),
  
  -- Documents
  photo_url TEXT,
  resume_url TEXT,
  certificates_url JSONB, -- [{name, url}]
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_teachers_user ON teachers_1ENTK(user_id);
CREATE INDEX idx_teachers_code ON teachers_1ENTK(employee_code);
CREATE INDEX idx_teachers_status ON teachers_1ENTK(status) WHERE deleted_at IS NULL;
```

#### `teacher_subjects_{INDEX_TOKEN}`
Subject allocation to teachers for specific batches.

```sql
CREATE TABLE teacher_subjects_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  batch_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_teacher_subjects_teacher ON teacher_subjects_1ENTK(teacher_id);
CREATE INDEX idx_teacher_subjects_batch ON teacher_subjects_1ENTK(batch_id);
CREATE INDEX idx_teacher_subjects_subject ON teacher_subjects_1ENTK(subject_id);
```

#### `lecture_templates_{INDEX_TOKEN}`
Reusable lecture templates for scheduling.

```sql
CREATE TABLE lecture_templates_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(255) NOT NULL,
  subject_id UUID NOT NULL,
  duration_minutes INTEGER NOT NULL, -- 60, 90, 120
  description TEXT,
  default_teacher_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lecture_templates_subject ON lecture_templates_1ENTK(subject_id);
```

---

### 4. Attendance System

#### `attendance_{INDEX_TOKEN}`
Daily attendance records (batch-wise).

```sql
CREATE TABLE attendance_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  batch_id UUID NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'present', 'absent', 'late', 'half_day', 'on_leave'
  marked_by UUID, -- teacher_id or admin_id
  marked_at TIMESTAMP,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attendance_student ON attendance_1ENTK(student_id);
CREATE INDEX idx_attendance_date ON attendance_1ENTK(date);
CREATE INDEX idx_attendance_batch ON attendance_1ENTK(batch_id);
CREATE UNIQUE INDEX idx_attendance_unique ON attendance_1ENTK(student_id, date);
```

#### `attendance_subject_wise_{INDEX_TOKEN}`
Subject-wise attendance (for detailed tracking).

```sql
CREATE TABLE attendance_subject_wise_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  batch_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  date DATE NOT NULL,
  timetable_id UUID, -- Link to specific lecture slot
  status VARCHAR(20) NOT NULL,
  marked_by UUID,
  marked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attendance_sw_student ON attendance_subject_wise_1ENTK(student_id);
CREATE INDEX idx_attendance_sw_batch ON attendance_subject_wise_1ENTK(batch_id);
CREATE INDEX idx_attendance_sw_subject ON attendance_subject_wise_1ENTK(subject_id);
CREATE INDEX idx_attendance_sw_date ON attendance_subject_wise_1ENTK(date);
```

#### `leave_applications_{INDEX_TOKEN}`
Student leave requests.

```sql
CREATE TABLE leave_applications_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  leave_type VARCHAR(50) NOT NULL, -- 'sick', 'casual', 'emergency', 'other'
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  reason TEXT NOT NULL,
  medical_certificate_url TEXT,
  applied_by UUID, -- student or parent
  applied_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  approved_by UUID,
  approved_at TIMESTAMP,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_leave_student ON leave_applications_1ENTK(student_id);
CREATE INDEX idx_leave_status ON leave_applications_1ENTK(status);
CREATE INDEX idx_leave_dates ON leave_applications_1ENTK(from_date, to_date);
```

---

### 5. Examination System

#### `exam_types_{INDEX_TOKEN}`
Exam categories.

```sql
CREATE TABLE exam_types_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_name VARCHAR(100) NOT NULL, -- 'Unit Test 1', 'Mid-Term', 'Final'
  exam_code VARCHAR(20) UNIQUE NOT NULL,
  weightage DECIMAL(5,2), -- Percentage in final grade
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `exams_{INDEX_TOKEN}`
Exam schedule master.

```sql
CREATE TABLE exams_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_type_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  exam_name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  result_date DATE,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_exams_type ON exams_1ENTK(exam_type_id);
CREATE INDEX idx_exams_dates ON exams_1ENTK(start_date, end_date);
```

#### `exam_schedules_{INDEX_TOKEN}`
Subject-wise exam timetable (batch/course-wise).

```sql
CREATE TABLE exam_schedules_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL,
  batch_id UUID, -- Specific batch (optional, can be course-wide)
  course_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_marks INTEGER NOT NULL,
  passing_marks INTEGER NOT NULL,
  room_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exam_schedule_exam ON exam_schedules_1ENTK(exam_id);
CREATE INDEX idx_exam_schedule_batch ON exam_schedules_1ENTK(batch_id);
CREATE INDEX idx_exam_schedule_course ON exam_schedules_1ENTK(course_id);
CREATE INDEX idx_exam_schedule_date ON exam_schedules_1ENTK(exam_date);
```

#### `exam_marks_{INDEX_TOKEN}`
Student marks entry.

```sql
CREATE TABLE exam_marks_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_schedule_id UUID NOT NULL,
  student_id UUID NOT NULL,
  marks_obtained DECIMAL(6,2),
  is_absent BOOLEAN DEFAULT false,
  remarks TEXT,
  entered_by UUID,
  entered_at TIMESTAMP,
  verified_by UUID,
  verified_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'submitted', 'verified'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exam_marks_schedule ON exam_marks_1ENTK(exam_schedule_id);
CREATE INDEX idx_exam_marks_student ON exam_marks_1ENTK(student_id);
CREATE UNIQUE INDEX idx_exam_marks_unique ON exam_marks_1ENTK(exam_schedule_id, student_id);
```

#### `grade_scales_{INDEX_TOKEN}`
Grading system configuration.

```sql
CREATE TABLE grade_scales_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_name VARCHAR(5) NOT NULL, -- 'A+', 'A', 'B', etc.
  min_percentage DECIMAL(5,2) NOT NULL,
  max_percentage DECIMAL(5,2) NOT NULL,
  grade_point DECIMAL(3,2), -- For CGPA calculation
  description VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 6. Fee Management

#### `fee_structures_{INDEX_TOKEN}`
Fee definition for classes.

```sql
CREATE TABLE fee_structures_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID NOT NULL,
  class_id UUID NOT NULL,
  fee_type VARCHAR(100) NOT NULL, -- 'Tuition', 'Transport', 'Library', 'Lab', 'Exam', etc.
  amount DECIMAL(10,2) NOT NULL,
  is_mandatory BOOLEAN DEFAULT true,
  due_date DATE,
  installments_allowed BOOLEAN DEFAULT false,
  installment_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fee_structure_class ON fee_structures_1ENTK(class_id);
CREATE INDEX idx_fee_structure_year ON fee_structures_1ENTK(academic_year_id);
```

#### `student_fees_{INDEX_TOKEN}`
Student-specific fee allocation.

```sql
CREATE TABLE student_fees_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  fee_structure_id UUID NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  discount_reason TEXT,
  final_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  balance_amount DECIMAL(10,2) NOT NULL,
  due_date DATE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'partial', 'paid', 'overdue'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_student_fees_student ON student_fees_1ENTK(student_id);
CREATE INDEX idx_student_fees_status ON student_fees_1ENTK(status);
CREATE INDEX idx_student_fees_due ON student_fees_1ENTK(due_date);
```

#### `fee_payments_{INDEX_TOKEN}`
Fee payment transactions.

```sql
CREATE TABLE fee_payments_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_fee_id UUID NOT NULL,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  payment_date DATE NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_mode VARCHAR(50) NOT NULL, -- 'Cash', 'Cheque', 'UPI', 'Card', 'Net Banking'
  transaction_id VARCHAR(255), -- For online payments
  cheque_number VARCHAR(50),
  cheque_date DATE,
  bank_name VARCHAR(100),
  collected_by UUID,
  remarks TEXT,
  receipt_url TEXT, -- PDF receipt in R2
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fee_payments_student_fee ON fee_payments_1ENTK(student_fee_id);
CREATE INDEX idx_fee_payments_receipt ON fee_payments_1ENTK(receipt_number);
CREATE INDEX idx_fee_payments_date ON fee_payments_1ENTK(payment_date);
```

#### `fee_concessions_{INDEX_TOKEN}`
Scholarships and discounts.

```sql
CREATE TABLE fee_concessions_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  concession_type VARCHAR(100) NOT NULL, -- 'Merit', 'Sports', 'Financial Aid', 'Staff Ward'
  percentage DECIMAL(5,2),
  fixed_amount DECIMAL(10,2),
  valid_from DATE NOT NULL,
  valid_to DATE,
  approved_by UUID,
  remarks TEXT,
  documents_url JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fee_concessions_student ON fee_concessions_1ENTK(student_id);
```

---

### 7. Communication System

#### `announcements_{INDEX_TOKEN}`
School-wide and targeted announcements.

```sql
CREATE TABLE announcements_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  announcement_type VARCHAR(50) NOT NULL, -- 'general', 'urgent', 'event', 'holiday'
  target_audience VARCHAR(50) NOT NULL, -- 'all', 'students', 'teachers', 'parents', 'specific_class'
  target_class_ids UUID[], -- For specific classes
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  attachments_url JSONB, -- [{name, url}]
  published_by UUID NOT NULL,
  published_at TIMESTAMP,
  expires_at TIMESTAMP,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_announcements_published ON announcements_1ENTK(is_published, published_at);
CREATE INDEX idx_announcements_audience ON announcements_1ENTK(target_audience);
```

#### `notifications_{INDEX_TOKEN}`
Individual user notifications.

```sql
CREATE TABLE notifications_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_type VARCHAR(100) NOT NULL, -- 'attendance', 'fee', 'exam', 'announcement', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT, -- Deep link
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications_1ENTK(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications_1ENTK(created_at DESC);
```

#### `sms_logs_{INDEX_TOKEN}`
SMS sending history.

```sql
CREATE TABLE sms_logs_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(15) NOT NULL,
  message TEXT NOT NULL,
  sms_type VARCHAR(50) NOT NULL, -- 'attendance', 'fee_reminder', 'exam', etc.
  related_entity_id UUID,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'delivered'
  provider VARCHAR(50), -- SMS gateway name
  provider_message_id VARCHAR(255),
  error_message TEXT,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sms_logs_phone ON sms_logs_1ENTK(phone_number);
CREATE INDEX idx_sms_logs_status ON sms_logs_1ENTK(status);
CREATE INDEX idx_sms_logs_type ON sms_logs_1ENTK(sms_type);
```

#### `email_logs_{INDEX_TOKEN}`
Email sending history.

```sql
CREATE TABLE email_logs_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  email_type VARCHAR(50) NOT NULL,
  related_entity_id UUID,
  attachments_url JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  provider VARCHAR(50),
  provider_message_id VARCHAR(255),
  error_message TEXT,
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_logs_email ON email_logs_1ENTK(email);
CREATE INDEX idx_email_logs_status ON email_logs_1ENTK(status);
```

---

### 8. Timetable Management

#### `timetable_periods_{INDEX_TOKEN}`
Period/time slot configuration.

```sql
CREATE TABLE timetable_periods_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_number INTEGER NOT NULL,
  period_name VARCHAR(50) NOT NULL, -- 'Period 1', 'Break', 'Period 2'
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_break BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_timetable_periods_number ON timetable_periods_1ENTK(period_number);
```

#### `timetables_{INDEX_TOKEN}`
Weekly timetable entries (batch-wise scheduling).

```sql
CREATE TABLE timetables_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  week_start_date DATE NOT NULL, -- Monday of the week
  day_of_week INTEGER NOT NULL, -- 1=Monday, 7=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  teacher_code VARCHAR(50), -- Teacher initials for display
  room_number VARCHAR(50),
  lecture_template_id UUID, -- Reference to lecture template if used
  is_merged BOOLEAN DEFAULT false, -- For merged lectures across batches
  merged_with_batch_ids UUID[], -- IDs of other batches if merged
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_timetables_batch ON timetables_1ENTK(batch_id);
CREATE INDEX idx_timetables_teacher ON timetables_1ENTK(teacher_id);
CREATE INDEX idx_timetables_subject ON timetables_1ENTK(subject_id);
CREATE INDEX idx_timetables_week ON timetables_1ENTK(week_start_date);
CREATE INDEX idx_timetables_day ON timetables_1ENTK(day_of_week);
```

#### `timetable_substitutions_{INDEX_TOKEN}`
Substitute teacher assignments.

```sql
CREATE TABLE timetable_substitutions_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_id UUID NOT NULL,
  original_teacher_id UUID NOT NULL,
  substitute_teacher_id UUID NOT NULL,
  substitution_date DATE NOT NULL,
  reason TEXT,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_timetable_substitutions_timetable ON timetable_substitutions_1ENTK(timetable_id);
CREATE INDEX idx_timetable_substitutions_date ON timetable_substitutions_1ENTK(substitution_date);
```

---

## OPTIONAL TIER 2 TABLES (Standard Features)

### 9. Library Management (Optional)

#### `library_books_{INDEX_TOKEN}`

```sql
CREATE TABLE library_books_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isbn VARCHAR(20) UNIQUE,
  book_title VARCHAR(500) NOT NULL,
  author VARCHAR(255),
  publisher VARCHAR(255),
  publication_year INTEGER,
  category VARCHAR(100), -- 'Fiction', 'Science', 'History', etc.
  language VARCHAR(50) DEFAULT 'English',
  total_copies INTEGER DEFAULT 1,
  available_copies INTEGER DEFAULT 1,
  rack_number VARCHAR(50),
  price DECIMAL(10,2),
  cover_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_library_books_isbn ON library_books_1ENTK(isbn);
CREATE INDEX idx_library_books_category ON library_books_1ENTK(category);
```

#### `library_issues_{INDEX_TOKEN}`

```sql
CREATE TABLE library_issues_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL,
  issued_to_id UUID NOT NULL, -- student_id or teacher_id
  issued_to_type VARCHAR(20) NOT NULL, -- 'student', 'teacher'
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE,
  fine_amount DECIMAL(10,2) DEFAULT 0,
  fine_paid BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'issued', -- 'issued', 'returned', 'lost'
  issued_by UUID,
  returned_by UUID,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_library_issues_book ON library_issues_1ENTK(book_id);
CREATE INDEX idx_library_issues_user ON library_issues_1ENTK(issued_to_id);
CREATE INDEX idx_library_issues_status ON library_issues_1ENTK(status);
```

---

### 10. Transport Management (Optional)

#### `transport_routes_{INDEX_TOKEN}`

```sql
CREATE TABLE transport_routes_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name VARCHAR(255) NOT NULL,
  route_code VARCHAR(20) UNIQUE NOT NULL,
  start_point VARCHAR(255),
  end_point VARCHAR(255),
  total_distance DECIMAL(6,2), -- in KM
  stops JSONB, -- [{stop_name, arrival_time, distance_from_school}]
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `transport_vehicles_{INDEX_TOKEN}`

```sql
CREATE TABLE transport_vehicles_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_number VARCHAR(50) UNIQUE NOT NULL,
  vehicle_type VARCHAR(50) NOT NULL, -- 'Bus', 'Van', 'Auto'
  capacity INTEGER NOT NULL,
  route_id UUID,
  driver_name VARCHAR(255),
  driver_phone VARCHAR(15),
  driver_license VARCHAR(50),
  conductor_name VARCHAR(255),
  conductor_phone VARCHAR(15),
  insurance_expiry DATE,
  fitness_expiry DATE,
  gps_device_id VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transport_vehicles_route ON transport_vehicles_1ENTK(route_id);
```

#### `student_transport_{INDEX_TOKEN}`

```sql
CREATE TABLE student_transport_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  route_id UUID NOT NULL,
  pickup_stop VARCHAR(255) NOT NULL,
  drop_stop VARCHAR(255) NOT NULL,
  academic_year_id UUID NOT NULL,
  monthly_fee DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_student_transport_student ON student_transport_1ENTK(student_id);
CREATE INDEX idx_student_transport_route ON student_transport_1ENTK(route_id);
```

---

### 11. Hostel Management (Optional)

#### `hostel_buildings_{INDEX_TOKEN}`

```sql
CREATE TABLE hostel_buildings_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_name VARCHAR(255) NOT NULL,
  building_code VARCHAR(20) UNIQUE NOT NULL,
  gender_type VARCHAR(20) NOT NULL, -- 'Boys', 'Girls', 'Co-ed'
  total_floors INTEGER,
  warden_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `hostel_rooms_{INDEX_TOKEN}`

```sql
CREATE TABLE hostel_rooms_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  floor_number INTEGER,
  room_type VARCHAR(50) NOT NULL, -- 'Single', 'Double', 'Triple', 'Dormitory'
  capacity INTEGER NOT NULL,
  occupied_beds INTEGER DEFAULT 0,
  monthly_rent DECIMAL(10,2),
  amenities TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_hostel_rooms_building ON hostel_rooms_1ENTK(building_id);
```

#### `hostel_allocations_{INDEX_TOKEN}`

```sql
CREATE TABLE hostel_allocations_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  room_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  allocation_date DATE NOT NULL,
  vacate_date DATE,
  bed_number VARCHAR(10),
  monthly_rent DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'vacated'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_hostel_allocations_student ON hostel_allocations_1ENTK(student_id);
CREATE INDEX idx_hostel_allocations_room ON hostel_allocations_1ENTK(room_id);
```

---

### 12. LMS (Learning Management System) (Optional)

#### `assignments_{INDEX_TOKEN}`

```sql
CREATE TABLE assignments_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  max_marks INTEGER,
  assignment_date DATE NOT NULL,
  submission_date DATE NOT NULL,
  late_submission_allowed BOOLEAN DEFAULT false,
  attachments_url JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_assignments_batch ON assignments_1ENTK(batch_id);
CREATE INDEX idx_assignments_subject ON assignments_1ENTK(subject_id);
CREATE INDEX idx_assignments_teacher ON assignments_1ENTK(teacher_id);
```

#### `assignment_submissions_{INDEX_TOKEN}`

```sql
CREATE TABLE assignment_submissions_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL,
  student_id UUID NOT NULL,
  submission_text TEXT,
  submission_files_url JSONB,
  submitted_at TIMESTAMP,
  marks_obtained DECIMAL(6,2),
  feedback TEXT,
  evaluated_by UUID,
  evaluated_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'submitted', 'late', 'evaluated'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_assignment_submissions_assignment ON assignment_submissions_1ENTK(assignment_id);
CREATE INDEX idx_assignment_submissions_student ON assignment_submissions_1ENTK(student_id);
CREATE UNIQUE INDEX idx_assignment_submissions_unique ON assignment_submissions_1ENTK(assignment_id, student_id);
```

#### `study_materials_{INDEX_TOKEN}`

```sql
CREATE TABLE study_materials_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID,
  batch_id UUID,
  subject_id UUID NOT NULL,
  topic_id UUID, -- Link to specific topic
  teacher_id UUID NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  material_type VARCHAR(50) NOT NULL, -- 'PDF', 'Video', 'Link', 'Document'
  file_url TEXT,
  external_link TEXT,
  is_public BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_study_materials_course ON study_materials_1ENTK(course_id);
CREATE INDEX idx_study_materials_batch ON study_materials_1ENTK(batch_id);
CREATE INDEX idx_study_materials_subject ON study_materials_1ENTK(subject_id);
CREATE INDEX idx_study_materials_topic ON study_materials_1ENTK(topic_id);
```

---

### 13. Staff Management (Optional)

#### `staff_attendance_{INDEX_TOKEN}`

```sql
CREATE TABLE staff_attendance_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'present', 'absent', 'half_day', 'on_leave'
  check_in_time TIME,
  check_out_time TIME,
  marked_by UUID,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_staff_attendance_teacher ON staff_attendance_1ENTK(teacher_id);
CREATE INDEX idx_staff_attendance_date ON staff_attendance_1ENTK(date);
CREATE UNIQUE INDEX idx_staff_attendance_unique ON staff_attendance_1ENTK(teacher_id, date);
```

#### `staff_leave_applications_{INDEX_TOKEN}`

```sql
CREATE TABLE staff_leave_applications_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  leave_type VARCHAR(50) NOT NULL, -- 'Casual', 'Sick', 'Earned', 'Maternity', 'Unpaid'
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  total_days DECIMAL(3,1) NOT NULL,
  reason TEXT NOT NULL,
  substitute_teacher_id UUID,
  applied_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending',
  approved_by UUID,
  approved_at TIMESTAMP,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_staff_leave_teacher ON staff_leave_applications_1ENTK(teacher_id);
CREATE INDEX idx_staff_leave_status ON staff_leave_applications_1ENTK(status);
```

---

## ADVANCED TIER 3 TABLES (Premium Features)

### 14. Events Management

#### `events_{INDEX_TOKEN}`

```sql
CREATE TABLE events_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL, -- 'Sports Day', 'Annual Function', 'Workshop', etc.
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  venue VARCHAR(255),
  description TEXT,
  target_audience VARCHAR(50), -- 'all', 'specific_classes'
  target_class_ids UUID[],
  requires_registration BOOLEAN DEFAULT false,
  max_participants INTEGER,
  banner_image_url TEXT,
  organizer_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_date ON events_1ENTK(event_date);
CREATE INDEX idx_events_type ON events_1ENTK(event_type);
```

#### `event_registrations_{INDEX_TOKEN}`

```sql
CREATE TABLE event_registrations_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  student_id UUID NOT NULL,
  registered_at TIMESTAMP DEFAULT NOW(),
  attendance_marked BOOLEAN DEFAULT false,
  certificate_issued BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_event_registrations_event ON event_registrations_1ENTK(event_id);
CREATE INDEX idx_event_registrations_student ON event_registrations_1ENTK(student_id);
CREATE UNIQUE INDEX idx_event_registrations_unique ON event_registrations_1ENTK(event_id, student_id);
```

---

### 15. Alumni Management

#### `alumni_{INDEX_TOKEN}`

```sql
CREATE TABLE alumni_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID, -- Reference to original student record
  full_name VARCHAR(255) NOT NULL,
  batch_year VARCHAR(10) NOT NULL,
  graduation_year INTEGER NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(15),
  current_company VARCHAR(255),
  designation VARCHAR(255),
  location VARCHAR(255),
  linkedin_url TEXT,
  is_willing_to_mentor BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alumni_batch ON alumni_1ENTK(batch_year);
CREATE INDEX idx_alumni_year ON alumni_1ENTK(graduation_year);
```

---

### 16. Asset & Inventory Management

#### `assets_{INDEX_TOKEN}`

```sql
CREATE TABLE assets_1ENTK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_name VARCHAR(255) NOT NULL,
  asset_code VARCHAR(50) UNIQUE NOT NULL,
  asset_type VARCHAR(100) NOT NULL, -- 'Furniture', 'IT Equipment', 'Lab Equipment', etc.
  category VARCHAR(100),
  purchase_date DATE,
  purchase_cost DECIMAL(12,2),
  vendor VARCHAR(255),
  warranty_expiry DATE,
  assigned_to VARCHAR(255), -- Department/Room/Person
  condition VARCHAR(50) DEFAULT 'Good', -- 'Excellent', 'Good', 'Fair', 'Poor', 'Damaged'
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'under_repair', 'scrapped'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_assets_type ON assets_1ENTK(asset_type);
CREATE INDEX idx_assets_code ON assets_1ENTK(asset_code);
```

---

## DEV MASTER DB TABLES (Central Registry)

These tables exist ONLY in the Dev Master DB, not in individual Hubs.

### `school_registry`
Maps schools to their DB Hub and Index Token.

```sql
CREATE TABLE school_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name VARCHAR(255) NOT NULL,
  school_code VARCHAR(50) UNIQUE NOT NULL,
  index_token VARCHAR(6) UNIQUE NOT NULL, -- e.g., '1ENTK', '2DDMRH'
  db_hub_id UUID NOT NULL,
  supabase_project_url TEXT NOT NULL,
  supabase_anon_key TEXT NOT NULL,
  subscription_tier VARCHAR(50) NOT NULL, -- 'basic', 'standard', 'advanced', 'enterprise'
  subscription_start_date DATE NOT NULL,
  subscription_end_date DATE,
  is_active BOOLEAN DEFAULT true,
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(15),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_school_registry_token ON school_registry(index_token);
CREATE INDEX idx_school_registry_hub ON school_registry(db_hub_id);
```

### `db_hubs`
DB Hub master data.

```sql
CREATE TABLE db_hubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_name VARCHAR(100) NOT NULL,
  supabase_project_url TEXT NOT NULL,
  supabase_service_key TEXT NOT NULL,
  region VARCHAR(50) NOT NULL, -- 'ap-south-1' (Mumbai)
  capacity INTEGER DEFAULT 5, -- Max 5 schools
  current_occupancy INTEGER DEFAULT 0,
  disk_usage_gb DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'full', 'maintenance'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `schema_versions`
Track schema updates across Hubs.

```sql
CREATE TABLE schema_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_code VARCHAR(20) NOT NULL, -- 'v1.0.0', 'v1.0.1'
  patch_id VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  sql_migration TEXT NOT NULL,
  applied_to_hubs UUID[], -- Array of db_hub_id
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  created_at TIMESTAMP DEFAULT NOW(),
  applied_at TIMESTAMP
);
```

---

## SQL Files for Supabase Execution

To implement this schema, I'll create individual SQL files for each module that you can run in Supabase SQL Editor. Would you like me to:

1. Generate all the CREATE TABLE SQL files
2. Create RLS (Row Level Security) policies
3. Create database functions and triggers
4. Generate seed data scripts

Let me know which you need first!

---

**Status:** Schema design complete. Ready for SQL file generation.

