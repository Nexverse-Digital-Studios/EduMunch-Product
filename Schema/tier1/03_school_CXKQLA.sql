-- ============================================================================
-- EduMunch: School-Specific Tables for CXKQLA
-- ============================================================================
-- This file creates 45 tables for School 3
-- INDEX_TOKEN: CXKQLA
-- ============================================================================

-- 1. USER MANAGEMENT & AUTHENTICATION
-- ============================================================================

-- 1.1 Users & Authentication
CREATE TABLE users_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,
  index_token VARCHAR(6) DEFAULT 'CXKQLA' NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN (
    'student', 
    'teacher', 
    'parent', 
    'admin_super', 
    'admin_hr', 
    'admin_academic', 
    'admin_finance'
  )),
  profile_photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_email_verified BOOLEAN DEFAULT false,
  is_phone_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_auth_user ON users_CXKQLA(auth_user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users_CXKQLA(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_phone ON users_CXKQLA(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users_CXKQLA(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_active ON users_CXKQLA(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_index_token ON users_CXKQLA(index_token) WHERE deleted_at IS NULL;

COMMENT ON TABL (Optional - Frontend can handle via INDEX_TOKEN in env)
CREATE TABLE sessions_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  auth_user_id UUID,
  index_token VARCHAR(6) DEFAULT 'CXKQLA' NOT NULL,
  token TEXT UNIQUE NOT NULL,
  device_info JSONB,
  ip_address VARCHAR(45),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON sessions_CXKQLA(user_id);
CREATE INDEX idx_sessions_auth_user ON sessions_CXKQLA(auth_user_id);
CREATE INDEX idx_sessions_token ON sessions_CXKQLA(token);
CREATE INDEX idx_sessions_expires ON sessions_CXKQLA(expires_at);

COMMENT ON TABLE sessions_CXKQLA IS 'Session tracking - Frontend routing handled via INDEX_TOKEN from .env';
COMMENT ON COLUMN sessions_CXKQLA.device_info IS 'JSON containing device_type, browser, os, etc.';
COMMENT ON COLUMN sessions_CXKQLA.index_token IS 'Ensures session is bound to correct school
CREATE INDEX idx_sessions_user ON sessions_CXKQLA(user_id);
CREATE INDEX idx_sessions_token ON sessions_CXKQLA(token);
CREATE INDEX idx_sessions_expires ON sessions_CXKQLA(expires_at);

COMMENT ON TABLE sessions_CXKQLA IS 'User session management for security';
COMMENT ON COLUMN sessions_CXKQLA.device_info IS 'JSON containing device_type, browser, os, etc.';

-- 1.3 Permissions
CREATE TABLE permissions_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL,
  module VARCHAR(100) NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  custom_permissions JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_permissions_role_module ON permissions_CXKQLA(role, module);

COMMENT ON TABLE permissions_CXKQLA IS 'Granular permission management for role-based access control';
COMMENT ON COLUMN permissions_CXKQLA.module IS 'Module name: attendance, fee, exam, student, teacher, etc.';

-- ============================================================================
-- 2. STUDENT MANAGEMENT
-- ============================================================================

-- 2.1 Students
CREATE TABLE students_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE,
  admission_number VARCHAR(50) UNIQUE NOT NULL,
  roll_number VARCHAR(50),
  class_id UUID NOT NULL,
  section_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  
  -- Personal Info
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  blood_group VARCHAR(5),
  aadhar_number VARCHAR(12),
  nationality VARCHAR(50) DEFAULT 'Indian',
  religion VARCHAR(50),
  caste VARCHAR(50),
  category VARCHAR(20) CHECK (category IN ('General', 'OBC', 'SC', 'ST', 'Other')),
  
  -- Contact Info
  email VARCHAR(255),
  phone VARCHAR(15),
  address_line1 TEXT,
  address_line2 TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  country VARCHAR(50) DEFAULT 'India',
  
  -- Academic Info
  previous_school TEXT,
  admission_date DATE NOT NULL,
  tc_number VARCHAR(50),
  tc_issued_date DATE,
  
  -- Medical Info
  medical_conditions JSONB,
  allergies TEXT[],
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(15),
  emergency_contact_relation VARCHAR(50),
  
  -- Documents (Cloudflare R2 URLs)
  photo_url TEXT,
  birth_certificate_url TEXT,
  aadhar_card_url TEXT,
  transfer_certificate_url TEXT,
  previous_marksheet_url TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'transferred', 'dropped')),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_students_user ON students_CXKQLA(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_admission ON students_CXKQLA(admission_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_class ON students_CXKQLA(class_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_section ON students_CXKQLA(section_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_academic_year ON students_CXKQLA(academic_year_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_status ON students_CXKQLA(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_name ON students_CXKQLA(first_name, last_name) WHERE deleted_at IS NULL;

COMMENT ON TABLE students_CXKQLA IS 'Core student information with personal, academic, and medical details';
COMMENT ON COLUMN students_CXKQLA.medical_conditions IS 'JSON array of {condition, severity, medication}';

-- 2.2 Parents/Guardians
CREATE TABLE parents_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE,
  
  -- Personal Info
  full_name VARCHAR(255) NOT NULL,
  relationship VARCHAR(50) NOT NULL CHECK (relationship IN ('Father', 'Mother', 'Guardian', 'Other')),
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
  country VARCHAR(50) DEFAULT 'India',
  
  -- Documents
  aadhar_number VARCHAR(12),
  photo_url TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_parents_user ON parents_CXKQLA(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_parents_phone ON parents_CXKQLA(phone) WHERE deleted_at IS NULL;

COMMENT ON TABLE parents_CXKQLA IS 'Parent and guardian information';

-- 2.3 Student-Parent Relations
CREATE TABLE student_parent_relations_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  parent_id UUID NOT NULL,
  is_primary_contact BOOLEAN DEFAULT false,
  can_pickup BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_student_parent_student ON student_parent_relations_CXKQLA(student_id);
CREATE INDEX idx_student_parent_parent ON student_parent_relations_CXKQLA(parent_id);
CREATE UNIQUE INDEX idx_student_parent_unique ON student_parent_relations_CXKQLA(student_id, parent_id);

COMMENT ON TABLE student_parent_relations_CXKQLA IS 'Many-to-many relationship between students and parents';

-- ============================================================================
-- 3. ACADEMIC MANAGEMENT
-- ============================================================================

-- 3.1 Academic Years
CREATE TABLE academic_years_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_code VARCHAR(20) UNIQUE NOT NULL,
  year_name VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_academic_years_current ON academic_years_CXKQLA(is_current);

COMMENT ON TABLE academic_years_CXKQLA IS 'Academic year configuration (e.g., 2024-25)';

-- 3.2 Classes
CREATE TABLE classes_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name VARCHAR(100) NOT NULL,
  class_code VARCHAR(20) UNIQUE NOT NULL,
  class_order INTEGER,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_classes_code ON classes_CXKQLA(class_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_classes_active ON classes_CXKQLA(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_classes_order ON classes_CXKQLA(class_order) WHERE deleted_at IS NULL;

COMMENT ON TABLE classes_CXKQLA IS 'Class master data (e.g., Class 1, Class 2, ..., Class 12)';

-- 3.3 Sections
CREATE TABLE sections_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL,
  section_name VARCHAR(50) NOT NULL,
  section_code VARCHAR(20) NOT NULL,
  capacity INTEGER DEFAULT 40,
  class_teacher_id UUID,
  room_number VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_sections_class ON sections_CXKQLA(class_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_sections_teacher ON sections_CXKQLA(class_teacher_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_sections_active ON sections_CXKQLA(is_active) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_sections_class_code ON sections_CXKQLA(class_id, section_code) WHERE deleted_at IS NULL;

COMMENT ON TABLE sections_CXKQLA IS 'Section/Division within a class (e.g., Section A, B, C)';

-- 3.4 Subjects
CREATE TABLE subjects_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_name VARCHAR(100) NOT NULL,
  subject_code VARCHAR(20) UNIQUE NOT NULL,
  subject_type VARCHAR(50) CHECK (subject_type IN ('Theory', 'Practical', 'General Knowledge', 'Co-curricular')),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_subjects_code ON subjects_CXKQLA(subject_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_subjects_active ON subjects_CXKQLA(is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE subjects_CXKQLA IS 'Subject master data (e.g., Mathematics, Physics, English)';

-- 3.5 Class-Subject Mapping
CREATE TABLE class_subjects_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  is_mandatory BOOLEAN DEFAULT true,
  display_order INTEGER,
  max_marks INTEGER,
  passing_marks INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_class_subjects_class ON class_subjects_CXKQLA(class_id);
CREATE INDEX idx_class_subjects_subject ON class_subjects_CXKQLA(subject_id);
CREATE UNIQUE INDEX idx_class_subjects_unique ON class_subjects_CXKQLA(class_id, subject_id);

COMMENT ON TABLE class_subjects_CXKQLA IS 'Subject allocation to classes';

-- 3.6 Topics (Chapters/Units within subjects)
CREATE TABLE topics_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL,
  topic_name VARCHAR(255) NOT NULL,
  topic_code VARCHAR(50),
  description TEXT,
  parent_topic_id UUID,
  display_order INTEGER,
  estimated_hours DECIMAL(4,1),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_topics_subject ON topics_CXKQLA(subject_id);
CREATE INDEX idx_topics_parent ON topics_CXKQLA(parent_topic_id);
CREATE INDEX idx_topics_active ON topics_CXKQLA(is_active);

COMMENT ON TABLE topics_CXKQLA IS 'Topics/chapters within subjects with hierarchical structure';
COMMENT ON COLUMN topics_CXKQLA.parent_topic_id IS 'For subtopics - references parent topic';

-- 3.7 Topic Content (Learning Materials)
CREATE TABLE topic_content_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('PDF', 'Video', 'Link', 'Document', 'Image', 'Quiz')),
  content_title VARCHAR(255) NOT NULL,
  content_url TEXT,
  description TEXT,
  display_order INTEGER,
  uploaded_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_topic_content_topic ON topic_content_CXKQLA(topic_id);
CREATE INDEX idx_topic_content_type ON topic_content_CXKQLA(content_type);

COMMENT ON TABLE topic_content_CXKQLA IS 'Learning materials attached to topics';

-- 3.8 Teachers
CREATE TABLE teachers_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE,
  employee_code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Personal Info
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),
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
  country VARCHAR(50) DEFAULT 'India',
  
  -- Professional
  qualification VARCHAR(255),
  specialization VARCHAR(255),
  experience_years INTEGER,
  joining_date DATE NOT NULL,
  employment_type VARCHAR(50) CHECK (employment_type IN ('Permanent', 'Contract', 'Part-time', 'Guest')),
  designation VARCHAR(100),
  department VARCHAR(100),
  
  -- Documents (R2 URLs)
  photo_url TEXT,
  resume_url TEXT,
  certificates_url JSONB,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'resigned', 'terminated')),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_teachers_user ON teachers_CXKQLA(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_teachers_code ON teachers_CXKQLA(employee_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_teachers_status ON teachers_CXKQLA(status) WHERE deleted_at IS NULL;

COMMENT ON TABLE teachers_CXKQLA IS 'Teacher information with professional and personal details';

-- 3.9 Teacher-Subject-Section Mapping
CREATE TABLE teacher_subject_sections_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  section_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_teacher_subject_sections_teacher ON teacher_subject_sections_CXKQLA(teacher_id);
CREATE INDEX idx_teacher_subject_sections_section ON teacher_subject_sections_CXKQLA(section_id);
CREATE INDEX idx_teacher_subject_sections_subject ON teacher_subject_sections_CXKQLA(subject_id);
CREATE UNIQUE INDEX idx_teacher_subject_sections_unique ON teacher_subject_sections_CXKQLA(section_id, subject_id, academic_year_id);

COMMENT ON TABLE teacher_subject_sections_CXKQLA IS 'Maps which teacher teaches which subject to which section';

-- 3.10 Timetable Periods Configuration
CREATE TABLE timetable_periods_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_number INTEGER NOT NULL,
  period_name VARCHAR(50),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_break BOOLEAN DEFAULT false,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_timetable_periods_number ON timetable_periods_CXKQLA(period_number);
CREATE UNIQUE INDEX idx_timetable_periods_order ON timetable_periods_CXKQLA(display_order);

COMMENT ON TABLE timetable_periods_CXKQLA IS 'School period configuration (Period 1, Break, Period 2, etc.)';

-- 3.11 Timetables
CREATE TABLE timetables_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  period_id UUID NOT NULL,
  subject_id UUID,
  teacher_id UUID,
  room_number VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_timetables_section ON timetables_CXKQLA(section_id);
CREATE INDEX idx_timetables_teacher ON timetables_CXKQLA(teacher_id);
CREATE INDEX idx_timetables_subject ON timetables_CXKQLA(subject_id);
CREATE INDEX idx_timetables_day ON timetables_CXKQLA(day_of_week);
CREATE UNIQUE INDEX idx_timetables_unique ON timetables_CXKQLA(section_id, day_of_week, period_id, academic_year_id) WHERE is_active = true;

COMMENT ON TABLE timetables_CXKQLA IS 'Weekly timetable for sections';

-- 3.12 Timetable Substitutions
CREATE TABLE timetable_substitutions_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_id UUID NOT NULL,
  original_teacher_id UUID NOT NULL,
  substitute_teacher_id UUID NOT NULL,
  substitution_date DATE NOT NULL,
  reason TEXT,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_timetable_substitutions_timetable ON timetable_substitutions_CXKQLA(timetable_id);
CREATE INDEX idx_timetable_substitutions_date ON timetable_substitutions_CXKQLA(substitution_date);

COMMENT ON TABLE timetable_substitutions_CXKQLA IS 'Substitute teacher assignments for specific dates';

-- 3.13 Lecture Templates
CREATE TABLE lecture_templates_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(255) NOT NULL,
  subject_id UUID NOT NULL,
  duration_minutes INTEGER NOT NULL,
  default_teacher_id UUID,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lecture_templates_subject ON lecture_templates_CXKQLA(subject_id);

COMMENT ON TABLE lecture_templates_CXKQLA IS 'Reusable lecture templates for quick timetable creation';

-- ============================================================================
-- 4. ATTENDANCE MANAGEMENT
-- ============================================================================

-- 4.1 Daily Attendance (Class-wise)
CREATE TABLE attendance_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  class_id UUID NOT NULL,
  section_id UUID NOT NULL,
  attendance_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late', 'Half-day', 'On-leave')),
  marked_by UUID,
  remarks TEXT,
  marked_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attendance_student ON attendance_CXKQLA(student_id);
CREATE INDEX idx_attendance_date ON attendance_CXKQLA(attendance_date);
CREATE INDEX idx_attendance_section ON attendance_CXKQLA(section_id);
CREATE INDEX idx_attendance_status ON attendance_CXKQLA(status);
CREATE UNIQUE INDEX idx_attendance_unique ON attendance_CXKQLA(student_id, attendance_date);

COMMENT ON TABLE attendance_CXKQLA IS 'Daily class-wise attendance for students';

-- 4.2 Subject-wise Attendance (for colleges/senior classes)
CREATE TABLE attendance_subject_wise_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  section_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  timetable_id UUID,
  attendance_date DATE NOT NULL,
  period_id UUID,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late')),
  marked_by UUID,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attendance_subject_student ON attendance_subject_wise_CXKQLA(student_id);
CREATE INDEX idx_attendance_subject_date ON attendance_subject_wise_CXKQLA(attendance_date);
CREATE INDEX idx_attendance_subject_subject ON attendance_subject_wise_CXKQLA(subject_id);
CREATE UNIQUE INDEX idx_attendance_subject_unique ON attendance_subject_wise_CXKQLA(student_id, subject_id, attendance_date, period_id);

COMMENT ON TABLE attendance_subject_wise_CXKQLA IS 'Subject and period-wise attendance tracking';

-- 4.3 Leave Applications
CREATE TABLE leave_applications_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('Sick', 'Medical', 'Casual', 'Emergency', 'Other')),
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  reason TEXT NOT NULL,
  medical_certificate_url TEXT,
  applied_by UUID NOT NULL,
  applied_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  approved_by UUID,
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_leave_applications_student ON leave_applications_CXKQLA(student_id);
CREATE INDEX idx_leave_applications_status ON leave_applications_CXKQLA(status);
CREATE INDEX idx_leave_applications_dates ON leave_applications_CXKQLA(from_date, to_date);

COMMENT ON TABLE leave_applications_CXKQLA IS 'Student leave application and approval system';

-- 4.4 Teacher Attendance
CREATE TABLE teacher_attendance_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  attendance_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late', 'Half-day', 'On-leave')),
  check_in_time TIME,
  check_out_time TIME,
  marked_by UUID,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_teacher_attendance_teacher ON teacher_attendance_CXKQLA(teacher_id);
CREATE INDEX idx_teacher_attendance_date ON teacher_attendance_CXKQLA(attendance_date);
CREATE UNIQUE INDEX idx_teacher_attendance_unique ON teacher_attendance_CXKQLA(teacher_id, attendance_date);

COMMENT ON TABLE teacher_attendance_CXKQLA IS 'Daily attendance tracking for teachers';

-- ============================================================================
-- 5. EXAMINATION SYSTEM
-- ============================================================================

-- 5.1 Exam Types
CREATE TABLE exam_types_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_type_name VARCHAR(100) NOT NULL,
  exam_type_code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exam_types_active ON exam_types_CXKQLA(is_active);

COMMENT ON TABLE exam_types_CXKQLA IS 'Exam type definitions (Unit Test, Mid-term, Final, etc.)';

-- 5.2 Exams
CREATE TABLE exams_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_name VARCHAR(255) NOT NULL,
  exam_code VARCHAR(50) UNIQUE NOT NULL,
  exam_type_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  result_publish_date DATE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exams_type ON exams_CXKQLA(exam_type_id);
CREATE INDEX idx_exams_academic_year ON exams_CXKQLA(academic_year_id);
CREATE INDEX idx_exams_active ON exams_CXKQLA(is_active);

COMMENT ON TABLE exams_CXKQLA IS 'Exam master data with schedules';

-- 5.3 Exam Schedules
CREATE TABLE exam_schedules_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL,
  class_id UUID NOT NULL,
  section_id UUID,
  subject_id UUID NOT NULL,
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER,
  max_marks INTEGER NOT NULL,
  passing_marks INTEGER NOT NULL,
  room_number VARCHAR(50),
  instructions TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exam_schedules_exam ON exam_schedules_CXKQLA(exam_id);
CREATE INDEX idx_exam_schedules_class ON exam_schedules_CXKQLA(class_id);
CREATE INDEX idx_exam_schedules_subject ON exam_schedules_CXKQLA(subject_id);
CREATE INDEX idx_exam_schedules_date ON exam_schedules_CXKQLA(exam_date);

COMMENT ON TABLE exam_schedules_CXKQLA IS 'Detailed exam schedule for each subject';

-- 5.4 Admit Cards
CREATE TABLE admit_cards_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL,
  student_id UUID NOT NULL,
  admit_card_number VARCHAR(50) UNIQUE NOT NULL,
  seat_number VARCHAR(50),
  exam_center VARCHAR(255),
  issued_date DATE DEFAULT CURRENT_DATE,
  pdf_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admit_cards_exam ON admit_cards_CXKQLA(exam_id);
CREATE INDEX idx_admit_cards_student ON admit_cards_CXKQLA(student_id);
CREATE UNIQUE INDEX idx_admit_cards_unique ON admit_cards_CXKQLA(exam_id, student_id);

COMMENT ON TABLE admit_cards_CXKQLA IS 'Admit card generation and tracking';

-- 5.5 Exam Marks
CREATE TABLE exam_marks_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_schedule_id UUID NOT NULL,
  student_id UUID NOT NULL,
  marks_obtained DECIMAL(5,2),
  is_absent BOOLEAN DEFAULT false,
  grade VARCHAR(5),
  remarks TEXT,
  entered_by UUID,
  verified_by UUID,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exam_marks_schedule ON exam_marks_CXKQLA(exam_schedule_id);
CREATE INDEX idx_exam_marks_student ON exam_marks_CXKQLA(student_id);
CREATE INDEX idx_exam_marks_verified ON exam_marks_CXKQLA(verified_by, verified_at);
CREATE UNIQUE INDEX idx_exam_marks_unique ON exam_marks_CXKQLA(exam_schedule_id, student_id);

COMMENT ON TABLE exam_marks_CXKQLA IS 'Student marks for each exam subject';

-- 5.6 Report Cards
CREATE TABLE report_cards_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL,
  student_id UUID NOT NULL,
  total_marks DECIMAL(7,2),
  marks_obtained DECIMAL(7,2),
  percentage DECIMAL(5,2),
  grade VARCHAR(5),
  rank INTEGER,
  attendance_percentage DECIMAL(5,2),
  remarks TEXT,
  generated_date DATE DEFAULT CURRENT_DATE,
  pdf_url TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_report_cards_exam ON report_cards_CXKQLA(exam_id);
CREATE INDEX idx_report_cards_student ON report_cards_CXKQLA(student_id);
CREATE INDEX idx_report_cards_published ON report_cards_CXKQLA(is_published);
CREATE UNIQUE INDEX idx_report_cards_unique ON report_cards_CXKQLA(exam_id, student_id);

COMMENT ON TABLE report_cards_CXKQLA IS 'Consolidated report cards for students';

-- 5.7 Grade Configuration
CREATE TABLE grade_config_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade VARCHAR(5) NOT NULL,
  min_percentage DECIMAL(5,2) NOT NULL,
  max_percentage DECIMAL(5,2) NOT NULL,
  grade_point DECIMAL(3,2),
  description VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_grade_config_range ON grade_config_CXKQLA(min_percentage, max_percentage);

COMMENT ON TABLE grade_config_CXKQLA IS 'Grade calculation configuration (A+, A, B+, etc.)';

-- ============================================================================
-- 6. FEE MANAGEMENT
-- ============================================================================

-- 6.1 Fee Components
CREATE TABLE fee_components_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_name VARCHAR(100) NOT NULL,
  component_code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  is_mandatory BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fee_components_active ON fee_components_CXKQLA(is_active);

COMMENT ON TABLE fee_components_CXKQLA IS 'Fee component definitions (Tuition, Transport, Library, etc.)';

-- 6.2 Fee Structures
CREATE TABLE fee_structures_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_name VARCHAR(255) NOT NULL,
  class_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fee_structures_class ON fee_structures_CXKQLA(class_id);
CREATE INDEX idx_fee_structures_year ON fee_structures_CXKQLA(academic_year_id);
CREATE INDEX idx_fee_structures_active ON fee_structures_CXKQLA(is_active);

COMMENT ON TABLE fee_structures_CXKQLA IS 'Class-wise fee structure for academic year';

-- 6.3 Fee Structure Components
CREATE TABLE fee_structure_components_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_structure_id UUID NOT NULL,
  fee_component_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fee_structure_components_structure ON fee_structure_components_CXKQLA(fee_structure_id);
CREATE INDEX idx_fee_structure_components_component ON fee_structure_components_CXKQLA(fee_component_id);

COMMENT ON TABLE fee_structure_components_CXKQLA IS 'Component-wise breakdown of fee structure';

-- 6.4 Student Fees
CREATE TABLE student_fees_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  fee_structure_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  discount_reason TEXT,
  final_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  due_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Partial', 'Paid', 'Overdue')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_student_fees_student ON student_fees_CXKQLA(student_id);
CREATE INDEX idx_student_fees_structure ON student_fees_CXKQLA(fee_structure_id);
CREATE INDEX idx_student_fees_status ON student_fees_CXKQLA(status);
CREATE UNIQUE INDEX idx_student_fees_unique ON student_fees_CXKQLA(student_id, academic_year_id);

COMMENT ON TABLE student_fees_CXKQLA IS 'Fee allocation to individual students with discounts';

-- 6.5 Fee Payments
CREATE TABLE fee_payments_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_fee_id UUID NOT NULL,
  student_id UUID NOT NULL,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  payment_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_mode VARCHAR(50) NOT NULL CHECK (payment_mode IN ('Cash', 'Cheque', 'UPI', 'Card', 'Net Banking', 'Other')),
  transaction_id VARCHAR(100),
  cheque_number VARCHAR(50),
  cheque_date DATE,
  bank_name VARCHAR(255),
  collected_by UUID,
  remarks TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fee_payments_student_fee ON fee_payments_CXKQLA(student_fee_id);
CREATE INDEX idx_fee_payments_student ON fee_payments_CXKQLA(student_id);
CREATE INDEX idx_fee_payments_date ON fee_payments_CXKQLA(payment_date);
CREATE INDEX idx_fee_payments_receipt ON fee_payments_CXKQLA(receipt_number);

COMMENT ON TABLE fee_payments_CXKQLA IS 'Individual fee payment transactions with receipt generation';

-- 6.6 Late Fee Configuration
CREATE TABLE late_fee_config_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL,
  due_date INTEGER NOT NULL,
  grace_period_days INTEGER DEFAULT 0,
  late_fee_amount DECIMAL(10,2) NOT NULL,
  late_fee_type VARCHAR(20) CHECK (late_fee_type IN ('Fixed', 'Percentage')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_late_fee_config_class ON late_fee_config_CXKQLA(class_id);

COMMENT ON TABLE late_fee_config_CXKQLA IS 'Late fee configuration for classes';

-- ============================================================================
-- 7. COMMUNICATION SYSTEM
-- ============================================================================

-- 7.1 Announcements
CREATE TABLE announcements_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  announcement_type VARCHAR(50) CHECK (announcement_type IN ('General', 'Academic', 'Event', 'Holiday', 'Emergency', 'Fee', 'Exam')),
  target_audience VARCHAR(50) NOT NULL CHECK (target_audience IN ('All', 'Students', 'Teachers', 'Parents', 'Staff')),
  priority VARCHAR(20) DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
  class_id UUID,
  section_id UUID,
  publish_date TIMESTAMP DEFAULT NOW(),
  expiry_date TIMESTAMP,
  attachment_url TEXT,
  created_by UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_announcements_type ON announcements_CXKQLA(announcement_type);
CREATE INDEX idx_announcements_audience ON announcements_CXKQLA(target_audience);
CREATE INDEX idx_announcements_class ON announcements_CXKQLA(class_id);
CREATE INDEX idx_announcements_active ON announcements_CXKQLA(is_active);
CREATE INDEX idx_announcements_publish ON announcements_CXKQLA(publish_date);

COMMENT ON TABLE announcements_CXKQLA IS 'School-wide and targeted announcements';

-- 7.2 Notifications
CREATE TABLE notifications_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  reference_id UUID,
  reference_type VARCHAR(50),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications_CXKQLA(user_id);
CREATE INDEX idx_notifications_read ON notifications_CXKQLA(is_read);
CREATE INDEX idx_notifications_type ON notifications_CXKQLA(notification_type);
CREATE INDEX idx_notifications_created ON notifications_CXKQLA(created_at);

COMMENT ON TABLE notifications_CXKQLA IS 'In-app notification center for users';

-- 7.3 SMS Logs
CREATE TABLE sms_logs_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_phone VARCHAR(15) NOT NULL,
  recipient_user_id UUID,
  message TEXT NOT NULL,
  sms_type VARCHAR(50),
  status VARCHAR(20) CHECK (status IN ('Pending', 'Sent', 'Failed', 'Delivered')),
  gateway_response JSONB,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sms_logs_phone ON sms_logs_CXKQLA(recipient_phone);
CREATE INDEX idx_sms_logs_user ON sms_logs_CXKQLA(recipient_user_id);
CREATE INDEX idx_sms_logs_status ON sms_logs_CXKQLA(status);
CREATE INDEX idx_sms_logs_sent ON sms_logs_CXKQLA(sent_at);

COMMENT ON TABLE sms_logs_CXKQLA IS 'SMS sending logs and delivery tracking';

-- 7.4 Email Logs
CREATE TABLE email_logs_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email VARCHAR(255) NOT NULL,
  recipient_user_id UUID,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  email_type VARCHAR(50),
  status VARCHAR(20) CHECK (status IN ('Pending', 'Sent', 'Failed', 'Bounced')),
  error_message TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_logs_email ON email_logs_CXKQLA(recipient_email);
CREATE INDEX idx_email_logs_user ON email_logs_CXKQLA(recipient_user_id);
CREATE INDEX idx_email_logs_status ON email_logs_CXKQLA(status);
CREATE INDEX idx_email_logs_sent ON email_logs_CXKQLA(sent_at);

COMMENT ON TABLE email_logs_CXKQLA IS 'Email sending logs and tracking';

-- ============================================================================
-- 8. ID CARD GENERATION
-- ============================================================================

-- 7.5 ID Cards
CREATE TABLE id_cards_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('Student', 'Teacher', 'Staff')),
  user_id UUID NOT NULL,
  card_number VARCHAR(50) UNIQUE NOT NULL,
  qr_code_data TEXT NOT NULL,
  issue_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  card_template VARCHAR(50),
  front_image_url TEXT,
  back_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_id_cards_user ON id_cards_CXKQLA(user_id, user_type);
CREATE INDEX idx_id_cards_number ON id_cards_CXKQLA(card_number);
CREATE INDEX idx_id_cards_active ON id_cards_CXKQLA(is_active);

COMMENT ON TABLE id_cards_CXKQLA IS 'ID card generation and tracking with QR codes';

-- ============================================================================
-- 9. AUDIT & LOGS
-- ============================================================================

-- 9.1 Activity Logs
CREATE TABLE activity_logs_CXKQLA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  module VARCHAR(100) NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP  FOR SINGLE SCHOOL (CXKQLA)
-- ============================================================================

-- ============================================================================

