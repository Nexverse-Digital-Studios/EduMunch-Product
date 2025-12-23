-- ============================================================================
-- EduMunch: School-Specific Tables for 3AAA
-- ============================================================================
-- This file creates 45 tables for School 3
-- INDEX_TOKEN: 3AAA
-- ============================================================================

-- 1. USER MANAGEMENT & AUTHENTICATION
-- ============================================================================

-- 1.1 Dynamic Roles (Replaces hardcoded ENUM)
CREATE TABLE roles_3AAA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_code VARCHAR(50) UNIQUE NOT NULL,
  role_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  index_token VARCHAR(6) DEFAULT '3AAA' NOT NULL
);

CREATE INDEX idx_roles_code ON roles_3AAA(role_code);
CREATE INDEX idx_roles_active ON roles_3AAA(is_active);
CREATE INDEX idx_roles_system ON roles_3AAA(is_system_role);

COMMENT ON TABLE roles_3AAA IS 'Dynamic role management - schools can create custom roles';
COMMENT ON COLUMN roles_3AAA.is_system_role IS 'System roles (student, teacher, parent, admin) cannot be deleted';

-- 1.2 Modules (Feature Grouping)
CREATE TABLE modules_3AAA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_code VARCHAR(50) UNIQUE NOT NULL,
  module_name VARCHAR(100) NOT NULL,
  parent_module_id UUID REFERENCES modules_3AAA(id) ON DELETE SET NULL,
  description TEXT,
  route_prefix VARCHAR(100),
  icon VARCHAR(50),
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  index_token VARCHAR(6) DEFAULT '3AAA' NOT NULL
);

CREATE INDEX idx_modules_code ON modules_3AAA(module_code);
CREATE INDEX idx_modules_parent ON modules_3AAA(parent_module_id);
CREATE INDEX idx_modules_active ON modules_3AAA(is_active);
CREATE INDEX idx_modules_order ON modules_3AAA(display_order);

COMMENT ON TABLE modules_3AAA IS 'Module hierarchy for organizing permissions';
COMMENT ON COLUMN modules_3AAA.route_prefix IS 'Frontend route prefix for this module';

-- 1.3 Permissions (Granular Actions)
CREATE TABLE permissions_3AAA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules_3AAA(id) ON DELETE CASCADE,
  permission_code VARCHAR(100) UNIQUE NOT NULL,
  permission_name VARCHAR(150) NOT NULL,
  description TEXT,
  resource_type VARCHAR(50),
  resource_path VARCHAR(255),
  http_method VARCHAR(10),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  index_token VARCHAR(6) DEFAULT '3AAA' NOT NULL
);

CREATE INDEX idx_permissions_module ON permissions_3AAA(module_id);
CREATE INDEX idx_permissions_code ON permissions_3AAA(permission_code);
CREATE INDEX idx_permissions_resource ON permissions_3AAA(resource_type, resource_path);
CREATE INDEX idx_permissions_active ON permissions_3AAA(is_active);

COMMENT ON TABLE permissions_3AAA IS 'Granular permissions - specific actions within modules';
COMMENT ON COLUMN permissions_3AAA.resource_type IS 'Type: api, route, ui_component';

-- 1.4 Role-Permission Mapping
CREATE TABLE role_permissions_3AAA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles_3AAA(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions_3AAA(id) ON DELETE CASCADE,
  can_create BOOLEAN DEFAULT false,
  can_read BOOLEAN DEFAULT false,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  can_export BOOLEAN DEFAULT false,
  constraints JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role ON role_permissions_3AAA(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions_3AAA(permission_id);

COMMENT ON TABLE role_permissions_3AAA IS 'Maps permissions to roles with CRUD + Approve + Export actions';
COMMENT ON COLUMN role_permissions_3AAA.constraints IS 'JSON constraints like amount limits, department access';

-- 1.5 Users & Authentication
CREATE TABLE users_3AAA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,
  index_token VARCHAR(6) DEFAULT '3AAA' NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  full_name VARCHAR(255) NOT NULL,
  profile_photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_email_verified BOOLEAN DEFAULT false,
  is_phone_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_auth_user ON users_3AAA(auth_user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users_3AAA(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_phone ON users_3AAA(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_active ON users_3AAA(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_index_token ON users_3AAA(index_token) WHERE deleted_at IS NULL;

COMMENT ON TABLE users_3AAA IS 'User management table - roles assigned via user_roles_3AAA';
COMMENT ON COLUMN users_3AAA.auth_user_id IS 'Links to Supabase auth.users table';

-- 1.6 User-Role Assignment
CREATE TABLE user_roles_3AAA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_3AAA(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles_3AAA(id) ON DELETE RESTRICT,
  is_primary BOOLEAN DEFAULT true,
  assigned_by UUID REFERENCES users_3AAA(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON user_roles_3AAA(user_id);
CREATE INDEX idx_user_roles_role ON user_roles_3AAA(role_id);
CREATE INDEX idx_user_roles_primary ON user_roles_3AAA(user_id, is_primary) WHERE is_primary = true;

COMMENT ON TABLE user_roles_3AAA IS 'Assigns roles to users - only admin can modify';
COMMENT ON COLUMN user_roles_3AAA.is_primary IS 'One primary role per user';

-- 1.7 Additional Permissions (Cross-Role Access)
CREATE TABLE user_additional_permissions_3AAA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_3AAA(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions_3AAA(id) ON DELETE CASCADE,
  granted_by UUID NOT NULL REFERENCES users_3AAA(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  can_create BOOLEAN DEFAULT false,
  can_read BOOLEAN DEFAULT false,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  can_export BOOLEAN DEFAULT false,
  constraints JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, permission_id)
);

CREATE INDEX idx_user_additional_permissions_user ON user_additional_permissions_3AAA(user_id);
CREATE INDEX idx_user_additional_permissions_permission ON user_additional_permissions_3AAA(permission_id);
CREATE INDEX idx_user_additional_permissions_active ON user_additional_permissions_3AAA(user_id, is_active) WHERE is_active = true;

COMMENT ON TABLE user_additional_permissions_3AAA IS 'Cross-role permissions granted by admin - permanent until revoked';
COMMENT ON COLUMN user_additional_permissions_3AAA.reason IS 'Required justification for granting permission';

-- 1.8 Permission Resolution Function
CREATE OR REPLACE FUNCTION get_user_permissions_3AAA(p_user_id UUID)
RETURNS TABLE (
  permission_id UUID,
  permission_code VARCHAR,
  permission_name VARCHAR,
  module_code VARCHAR,
  module_name VARCHAR,
  can_create BOOLEAN,
  can_read BOOLEAN,
  can_update BOOLEAN,
  can_delete BOOLEAN,
  can_approve BOOLEAN,
  can_export BOOLEAN,
  access_source VARCHAR,
  constraints JSONB
) AS $$
BEGIN
  RETURN QUERY
  -- Primary role permissions
  SELECT DISTINCT
    p.id,
    p.permission_code,
    p.permission_name,
    m.module_code,
    m.module_name,
    rp.can_create,
    rp.can_read,
    rp.can_update,
    rp.can_delete,
    rp.can_approve,
    rp.can_export,
    'primary_role'::VARCHAR,
    rp.constraints
  FROM user_roles_3AAA ur
  JOIN roles_3AAA r ON ur.role_id = r.id
  JOIN role_permissions_3AAA rp ON r.id = rp.role_id
  JOIN permissions_3AAA p ON rp.permission_id = p.id
  JOIN modules_3AAA m ON p.module_id = m.id
  WHERE ur.user_id = p_user_id
    AND r.is_active = true
    AND p.is_active = true
    AND m.is_active = true

  UNION

  -- Additional permissions
  SELECT DISTINCT
    p.id,
    p.permission_code,
    p.permission_name,
    m.module_code,
    m.module_name,
    uap.can_create,
    uap.can_read,
    uap.can_update,
    uap.can_delete,
    uap.can_approve,
    uap.can_export,
    'additional_permission'::VARCHAR,
    uap.constraints
  FROM user_additional_permissions_3AAA uap
  JOIN permissions_3AAA p ON uap.permission_id = p.id
  JOIN modules_3AAA m ON p.module_id = m.id
  WHERE uap.user_id = p_user_id
    AND uap.is_active = true
    AND p.is_active = true
    AND m.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_permissions_3AAA IS 'Returns all effective permissions for a user from role and additional permissions';

-- 1.9 Sessions
CREATE TABLE sessions_3AAA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  auth_user_id UUID,
  index_token VARCHAR(6) DEFAULT '3AAA' NOT NULL,
  token TEXT UNIQUE NOT NULL,
  device_info JSONB,
  ip_address VARCHAR(45),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON sessions_3AAA(user_id);
CREATE INDEX idx_sessions_auth_user ON sessions_3AAA(auth_user_id);
CREATE INDEX idx_sessions_token ON sessions_3AAA(token);
CREATE INDEX idx_sessions_expires ON sessions_3AAA(expires_at);

COMMENT ON TABLE sessions_3AAA IS 'Session tracking - Frontend routing handled via INDEX_TOKEN from .env';
COMMENT ON COLUMN sessions_3AAA.device_info IS 'JSON containing device_type, browser, os, etc.';
COMMENT ON COLUMN sessions_3AAA.index_token IS 'Ensures session is bound to correct school';

-- ============================================================================
-- 2. STUDENT MANAGEMENT
-- ============================================================================

-- 2.1 Students
CREATE TABLE students_3AAA (
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

CREATE INDEX idx_students_user ON students_3AAA(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_admission ON students_3AAA(admission_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_class ON students_3AAA(class_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_section ON students_3AAA(section_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_academic_year ON students_3AAA(academic_year_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_status ON students_3AAA(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_name ON students_3AAA(first_name, last_name) WHERE deleted_at IS NULL;

COMMENT ON TABLE students_3AAA IS 'Core student information with personal, academic, and medical details';
COMMENT ON COLUMN students_3AAA.medical_conditions IS 'JSON array of {condition, severity, medication}';

-- 2.2 Parents/Guardians
CREATE TABLE parents_3AAA (
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

CREATE INDEX idx_parents_user ON parents_3AAA(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_parents_phone ON parents_3AAA(phone) WHERE deleted_at IS NULL;

COMMENT ON TABLE parents_3AAA IS 'Parent and guardian information';

-- 2.3 Student-Parent Relations
CREATE TABLE student_parent_relations_3AAA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  parent_id UUID NOT NULL,
  is_primary_contact BOOLEAN DEFAULT false,
  can_pickup BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_student_parent_student ON student_parent_relations_3AAA(student_id);
CREATE INDEX idx_student_parent_parent ON student_parent_relations_3AAA(parent_id);
CREATE UNIQUE INDEX idx_student_parent_unique ON student_parent_relations_3AAA(student_id, parent_id);

COMMENT ON TABLE student_parent_relations_3AAA IS 'Many-to-many relationship between students and parents';

-- ============================================================================
-- 3. ACADEMIC MANAGEMENT
-- ============================================================================

-- 3.1 Academic Years
CREATE TABLE academic_years_3AAA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_code VARCHAR(20) UNIQUE NOT NULL,
  year_name VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_academic_years_current ON academic_years_3AAA(is_current);

COMMENT ON TABLE academic_years_3AAA IS 'Academic year configuration (e.g., 2024-25)';

-- 3.2 Classes
CREATE TABLE classes_3AAA (
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

CREATE INDEX idx_classes_code ON classes_3AAA(class_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_classes_active ON classes_3AAA(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_classes_order ON classes_3AAA(class_order) WHERE deleted_at IS NULL;

COMMENT ON TABLE classes_3AAA IS 'Class master data (e.g., Class 1, Class 2, ..., Class 12)';

-- 3.3 Sections
CREATE TABLE sections_3AAA (
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

CREATE INDEX idx_sections_class ON sections_3AAA(class_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_sections_teacher ON sections_3AAA(class_teacher_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_sections_active ON sections_3AAA(is_active) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_sections_class_code ON sections_3AAA(class_id, section_code) WHERE deleted_at IS NULL;

COMMENT ON TABLE sections_3AAA IS 'Section/Division within a class (e.g., Section A, B, C)';

-- 3.4 Subjects
CREATE TABLE subjects_3AAA (
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

CREATE INDEX idx_subjects_code ON subjects_3AAA(subject_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_subjects_active ON subjects_3AAA(is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE subjects_3AAA IS 'Subject master data (e.g., Mathematics, Physics, English)';

-- 3.5 Class-Subject Mapping
CREATE TABLE class_subjects_3AAA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  is_mandatory BOOLEAN DEFAULT true,
  display_order INTEGER,
  max_marks INTEGER,
  passing_marks INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_class_subjects_class ON class_subjects_3AAA(class_id);
CREATE INDEX idx_class_subjects_subject ON class_subjects_3AAA(subject_id);
CREATE UNIQUE INDEX idx_class_subjects_unique ON class_subjects_3AAA(class_id, subject_id);

COMMENT ON TABLE class_subjects_3AAA IS 'Subject allocation to classes';

-- 3.6 Topics (Chapters/Units within subjects)
CREATE TABLE topics_3AAA (
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

CREATE INDEX idx_topics_subject ON topics_3AAA(subject_id);
CREATE INDEX idx_topics_parent ON topics_3AAA(parent_topic_id);
CREATE INDEX idx_topics_active ON topics_3AAA(is_active);

COMMENT ON TABLE topics_3AAA IS 'Topics/chapters within subjects with hierarchical structure';
COMMENT ON COLUMN topics_3AAA.parent_topic_id IS 'For subtopics - references parent topic';

-- 3.7 Topic Content (Learning Materials)
CREATE TABLE topic_content_3AAA (
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

CREATE INDEX idx_topic_content_topic ON topic_content_3AAA(topic_id);
CREATE INDEX idx_topic_content_type ON topic_content_3AAA(content_type);

COMMENT ON TABLE topic_content_3AAA IS 'Learning materials attached to topics';

-- 3.8 Teachers
CREATE TABLE teachers_3AAA (
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

CREATE INDEX idx_teachers_user ON teachers_3AAA(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_teachers_code ON teachers_3AAA(employee_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_teachers_status ON teachers_3AAA(status) WHERE deleted_at IS NULL;

COMMENT ON TABLE teachers_3AAA IS 'Teacher information with professional and personal details';

-- 3.9 Teacher-Subject-Section Mapping
CREATE TABLE teacher_subject_sections_3AAA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  section_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_teacher_subject_sections_teacher ON teacher_subject_sections_3AAA(teacher_id);
CREATE INDEX idx_teacher_subject_sections_section ON teacher_subject_sections_3AAA(section_id);
CREATE INDEX idx_teacher_subject_sections_subject ON teacher_subject_sections_3AAA(subject_id);
CREATE UNIQUE INDEX idx_teacher_subject_sections_unique ON teacher_subject_sections_3AAA(section_id, subject_id, academic_year_id);

COMMENT ON TABLE teacher_subject_sections_3AAA IS 'Maps which teacher teaches which subject to which section';

-- 3.10 Timetable Periods Configuration
CREATE TABLE timetable_periods_3AAA (
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

CREATE INDEX idx_timetable_periods_number ON timetable_periods_3AAA(period_number);
CREATE UNIQUE INDEX idx_timetable_periods_order ON timetable_periods_3AAA(display_order);

COMMENT ON TABLE timetable_periods_3AAA IS 'School period configuration (Period 1, Break, Period 2, etc.)';

-- 3.11 Timetables
CREATE TABLE timetables_3AAA (
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

CREATE INDEX idx_timetables_section ON timetables_3AAA(section_id);
CREATE INDEX idx_timetables_teacher ON timetables_3AAA(teacher_id);
CREATE INDEX idx_timetables_subject ON timetables_3AAA(subject_id);
CREATE INDEX idx_timetables_day ON timetables_3AAA(day_of_week);
CREATE UNIQUE INDEX idx_timetables_unique ON timetables_3AAA(section_id, day_of_week, period_id, academic_year_id) WHERE is_active = true;

COMMENT ON TABLE timetables_3AAA IS 'Weekly timetable for sections';

-- 3.12 Timetable Substitutions
CREATE TABLE timetable_substitutions_3AAA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_id UUID NOT NULL,
  original_teacher_id UUID NOT NULL,
  substitute_teacher_id UUID NOT NULL,
  substitution_date DATE NOT NULL,
  reason TEXT,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_timetable_substitutions_timetable ON timetable_substitutions_3AAA(timetable_id);
CREATE INDEX idx_timetable_substitutions_date ON timetable_substitutions_3AAA(substitution_date);

COMMENT ON TABLE timetable_substitutions_3AAA IS 'Substitute teacher assignments for specific dates';

-- 3.13 Lecture Templates
CREATE TABLE lecture_templates_3AAA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(255) NOT NULL,
  subject_id UUID NOT NULL,
  duration_minutes INTEGER NOT NULL,
  default_teacher_id UUID,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lecture_templates_subject ON lecture_templates_3AAA(subject_id);

COMMENT ON TABLE lecture_templates_3AAA IS 'Reusable lecture templates for quick timetable creation';

-- ============================================================================
-- 4. ATTENDANCE MANAGEMENT
-- ============================================================================

-- 4.1 Daily Attendance (Class-wise)
CREATE TABLE attendance_3AAA (
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

CREATE INDEX idx_attendance_student ON attendance_3AAA(student_id);
CREATE INDEX idx_attendance_date ON attendance_3AAA(attendance_date);
CREATE INDEX idx_attendance_section ON attendance_3AAA(section_id);
CREATE INDEX idx_attendance_status ON attendance_3AAA(status);
CREATE UNIQUE INDEX idx_attendance_unique ON attendance_3AAA(student_id, attendance_date);

COMMENT ON TABLE attendance_3AAA IS 'Daily class-wise attendance for students';

-- 4.2 Subject-wise Attendance (for colleges/senior classes)
CREATE TABLE attendance_subject_wise_3AAA (
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

CREATE INDEX idx_attendance_subject_student ON attendance_subject_wise_3AAA(student_id);
CREATE INDEX idx_attendance_subject_date ON attendance_subject_wise_3AAA(attendance_date);
CREATE INDEX idx_attendance_subject_subject ON attendance_subject_wise_3AAA(subject_id);
CREATE UNIQUE INDEX idx_attendance_subject_unique ON attendance_subject_wise_3AAA(student_id, subject_id, attendance_date, period_id);

COMMENT ON TABLE attendance_subject_wise_3AAA IS 'Subject and period-wise attendance tracking';

-- 4.3 Leave Applications
CREATE TABLE leave_applications_3AAA (
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

CREATE INDEX idx_leave_applications_student ON leave_applications_3AAA(student_id);
CREATE INDEX idx_leave_applications_status ON leave_applications_3AAA(status);
CREATE INDEX idx_leave_applications_dates ON leave_applications_3AAA(from_date, to_date);

COMMENT ON TABLE leave_applications_3AAA IS 'Student leave application and approval system';

-- 4.4 Teacher Attendance
CREATE TABLE teacher_attendance_3AAA (
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

CREATE INDEX idx_teacher_attendance_teacher ON teacher_attendance_3AAA(teacher_id);
CREATE INDEX idx_teacher_attendance_date ON teacher_attendance_3AAA(attendance_date);
CREATE UNIQUE INDEX idx_teacher_attendance_unique ON teacher_attendance_3AAA(teacher_id, attendance_date);

COMMENT ON TABLE teacher_attendance_3AAA IS 'Daily attendance tracking for teachers';

-- ============================================================================
-- 5. EXAMINATION SYSTEM
-- ============================================================================

-- 5.1 Exam Types
CREATE TABLE exam_types_3AAA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_type_name VARCHAR(100) NOT NULL,
  exam_type_code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exam_types_active ON exam_types_3AAA(is_active);

COMMENT ON TABLE exam_types_3AAA IS 'Exam type definitions (Unit Test, Mid-term, Final, etc.)';

-- 5.2 Exams
CREATE TABLE exams_3AAA (
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

CREATE INDEX idx_exams_type ON exams_3AAA(exam_type_id);
CREATE INDEX idx_exams_academic_year ON exams_3AAA(academic_year_id);
CREATE INDEX idx_exams_active ON exams_3AAA(is_active);

COMMENT ON TABLE exams_3AAA IS 'Exam master data with schedules';

-- 5.3 Exam Schedules
CREATE TABLE exam_schedules_3AAA (
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

CREATE INDEX idx_exam_schedules_exam ON exam_schedules_3AAA(exam_id);
CREATE INDEX idx_exam_schedules_class ON exam_schedules_3AAA(class_id);
CREATE INDEX idx_exam_schedules_subject ON exam_schedules_3AAA(subject_id);
CREATE INDEX idx_exam_schedules_date ON exam_schedules_3AAA(exam_date);

COMMENT ON TABLE exam_schedules_3AAA IS 'Detailed exam schedule for each subject';

-- 5.4 Admit Cards
CREATE TABLE admit_cards_3AAA (
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

CREATE INDEX idx_admit_cards_exam ON admit_cards_3AAA(exam_id);
CREATE INDEX idx_admit_cards_student ON admit_cards_3AAA(student_id);
CREATE UNIQUE INDEX idx_admit_cards_unique ON admit_cards_3AAA(exam_id, student_id);

COMMENT ON TABLE admit_cards_3AAA IS 'Admit card generation and tracking';

-- 5.5 Exam Marks
CREATE TABLE exam_marks_3AAA (
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

CREATE INDEX idx_exam_marks_schedule ON exam_marks_3AAA(exam_schedule_id);
CREATE INDEX idx_exam_marks_student ON exam_marks_3AAA(student_id);
CREATE INDEX idx_exam_marks_verified ON exam_marks_3AAA(verified_by, verified_at);
CREATE UNIQUE INDEX idx_exam_marks_unique ON exam_marks_3AAA(exam_schedule_id, student_id);

COMMENT ON TABLE exam_marks_3AAA IS 'Student marks for each exam subject';

-- 5.6 Report Cards
CREATE TABLE report_cards_3AAA (
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

CREATE INDEX idx_report_cards_exam ON report_cards_3AAA(exam_id);
CREATE INDEX idx_report_cards_student ON report_cards_3AAA(student_id);
CREATE INDEX idx_report_cards_published ON report_cards_3AAA(is_published);
CREATE UNIQUE INDEX idx_report_cards_unique ON report_cards_3AAA(exam_id, student_id);

COMMENT ON TABLE report_cards_3AAA IS 'Consolidated report cards for students';

-- 5.7 Grade Configuration
CREATE TABLE grade_config_3AAA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade VARCHAR(5) NOT NULL,
  min_percentage DECIMAL(5,2) NOT NULL,
  max_percentage DECIMAL(5,2) NOT NULL,
  grade_point DECIMAL(3,2),
  description VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_grade_config_range ON grade_config_3AAA(min_percentage, max_percentage);

COMMENT ON TABLE grade_config_3AAA IS 'Grade calculation configuration (A+, A, B+, etc.)';

-- ============================================================================
-- 6. FEE MANAGEMENT
-- ============================================================================

-- 6.1 Fee Components
CREATE TABLE fee_components_3AAA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_name VARCHAR(100) NOT NULL,
  component_code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  is_mandatory BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fee_components_active ON fee_components_3AAA(is_active);

COMMENT ON TABLE fee_components_3AAA IS 'Fee component definitions (Tuition, Transport, Library, etc.)';

-- 6.2 Fee Structures
CREATE TABLE fee_structures_3AAA (
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

CREATE INDEX idx_fee_structures_class ON fee_structures_3AAA(class_id);
CREATE INDEX idx_fee_structures_year ON fee_structures_3AAA(academic_year_id);
CREATE INDEX idx_fee_structures_active ON fee_structures_3AAA(is_active);

COMMENT ON TABLE fee_structures_3AAA IS 'Class-wise fee structure for academic year';

-- 6.3 Fee Structure Components
CREATE TABLE fee_structure_components_3AAA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_structure_id UUID NOT NULL,
  fee_component_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fee_structure_components_structure ON fee_structure_components_3AAA(fee_structure_id);
CREATE INDEX idx_fee_structure_components_component ON fee_structure_components_3AAA(fee_component_id);

COMMENT ON TABLE fee_structure_components_3AAA IS 'Component-wise breakdown of fee structure';

-- 6.4 Student Fees
CREATE TABLE student_fees_3AAA (
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

CREATE INDEX idx_student_fees_student ON student_fees_3AAA(student_id);
CREATE INDEX idx_student_fees_structure ON student_fees_3AAA(fee_structure_id);
CREATE INDEX idx_student_fees_status ON student_fees_3AAA(status);
CREATE UNIQUE INDEX idx_student_fees_unique ON student_fees_3AAA(student_id, academic_year_id);

COMMENT ON TABLE student_fees_3AAA IS 'Fee allocation to individual students with discounts';

-- 6.5 Fee Payments
CREATE TABLE fee_payments_3AAA (
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

CREATE INDEX idx_fee_payments_student_fee ON fee_payments_3AAA(student_fee_id);
CREATE INDEX idx_fee_payments_student ON fee_payments_3AAA(student_id);
CREATE INDEX idx_fee_payments_date ON fee_payments_3AAA(payment_date);
CREATE INDEX idx_fee_payments_receipt ON fee_payments_3AAA(receipt_number);

COMMENT ON TABLE fee_payments_3AAA IS 'Individual fee payment transactions with receipt generation';

-- 6.6 Late Fee Configuration
CREATE TABLE late_fee_config_3AAA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL,
  due_date INTEGER NOT NULL,
  grace_period_days INTEGER DEFAULT 0,
  late_fee_amount DECIMAL(10,2) NOT NULL,
  late_fee_type VARCHAR(20) CHECK (late_fee_type IN ('Fixed', 'Percentage')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_late_fee_config_class ON late_fee_config_3AAA(class_id);

COMMENT ON TABLE late_fee_config_3AAA IS 'Late fee configuration for classes';

-- ============================================================================
-- 7. COMMUNICATION SYSTEM
-- ============================================================================

-- 7.1 Announcements
CREATE TABLE announcements_3AAA (
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

CREATE INDEX idx_announcements_type ON announcements_3AAA(announcement_type);
CREATE INDEX idx_announcements_audience ON announcements_3AAA(target_audience);
CREATE INDEX idx_announcements_class ON announcements_3AAA(class_id);
CREATE INDEX idx_announcements_active ON announcements_3AAA(is_active);
CREATE INDEX idx_announcements_publish ON announcements_3AAA(publish_date);

COMMENT ON TABLE announcements_3AAA IS 'School-wide and targeted announcements';

-- 7.2 Notifications
CREATE TABLE notifications_3AAA (
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

CREATE INDEX idx_notifications_user ON notifications_3AAA(user_id);
CREATE INDEX idx_notifications_read ON notifications_3AAA(is_read);
CREATE INDEX idx_notifications_type ON notifications_3AAA(notification_type);
CREATE INDEX idx_notifications_created ON notifications_3AAA(created_at);

COMMENT ON TABLE notifications_3AAA IS 'In-app notification center for users';

-- 7.3 SMS Logs
CREATE TABLE sms_logs_3AAA (
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

CREATE INDEX idx_sms_logs_phone ON sms_logs_3AAA(recipient_phone);
CREATE INDEX idx_sms_logs_user ON sms_logs_3AAA(recipient_user_id);
CREATE INDEX idx_sms_logs_status ON sms_logs_3AAA(status);
CREATE INDEX idx_sms_logs_sent ON sms_logs_3AAA(sent_at);

COMMENT ON TABLE sms_logs_3AAA IS 'SMS sending logs and delivery tracking';

-- 7.4 Email Logs
CREATE TABLE email_logs_3AAA (
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

CREATE INDEX idx_email_logs_email ON email_logs_3AAA(recipient_email);
CREATE INDEX idx_email_logs_user ON email_logs_3AAA(recipient_user_id);
CREATE INDEX idx_email_logs_status ON email_logs_3AAA(status);
CREATE INDEX idx_email_logs_sent ON email_logs_3AAA(sent_at);

COMMENT ON TABLE email_logs_3AAA IS 'Email sending logs and tracking';

-- ============================================================================
-- 8. ID CARD GENERATION
-- ============================================================================

-- 7.5 ID Cards
CREATE TABLE id_cards_3AAA (
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

CREATE INDEX idx_id_cards_user ON id_cards_3AAA(user_id, user_type);
CREATE INDEX idx_id_cards_number ON id_cards_3AAA(card_number);
CREATE INDEX idx_id_cards_active ON id_cards_3AAA(is_active);

COMMENT ON TABLE id_cards_3AAA IS 'ID card generation and tracking with QR codes';

-- ============================================================================
-- 9. AUDIT & LOGS
-- ============================================================================

-- 9.1 Activity Logs
CREATE TABLE activity_logs_3AAA (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  module VARCHAR(100) NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user ON activity_logs_3AAA(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs_3AAA(action);
CREATE INDEX idx_activity_logs_module ON activity_logs_3AAA(module);
CREATE INDEX idx_activity_logs_created ON activity_logs_3AAA(created_at);

COMMENT ON TABLE activity_logs_3AAA IS 'Audit trail for all user actions in the system';

-- ============================================================================
-- 10. FOREIGN KEY CONSTRAINTS
-- ============================================================================

ALTER TABLE roles_3AAA ADD CONSTRAINT fk_roles_created_by FOREIGN KEY (created_by) REFERENCES users_3AAA(id) ON DELETE SET NULL;
ALTER TABLE students_3AAA ADD CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users_3AAA(id) ON DELETE SET NULL;
ALTER TABLE students_3AAA ADD CONSTRAINT fk_students_class FOREIGN KEY (class_id) REFERENCES classes_3AAA(id) ON DELETE RESTRICT;
ALTER TABLE students_3AAA ADD CONSTRAINT fk_students_section FOREIGN KEY (section_id) REFERENCES sections_3AAA(id) ON DELETE RESTRICT;
ALTER TABLE students_3AAA ADD CONSTRAINT fk_students_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years_3AAA(id) ON DELETE RESTRICT;
ALTER TABLE parents_3AAA ADD CONSTRAINT fk_parents_user FOREIGN KEY (user_id) REFERENCES users_3AAA(id) ON DELETE SET NULL;
ALTER TABLE student_parent_relations_3AAA ADD CONSTRAINT fk_student_parent_student FOREIGN KEY (student_id) REFERENCES students_3AAA(id) ON DELETE CASCADE;
ALTER TABLE student_parent_relations_3AAA ADD CONSTRAINT fk_student_parent_parent FOREIGN KEY (parent_id) REFERENCES parents_3AAA(id) ON DELETE CASCADE;
ALTER TABLE sections_3AAA ADD CONSTRAINT fk_sections_class FOREIGN KEY (class_id) REFERENCES classes_3AAA(id) ON DELETE CASCADE;
ALTER TABLE sections_3AAA ADD CONSTRAINT fk_sections_teacher FOREIGN KEY (class_teacher_id) REFERENCES teachers_3AAA(id) ON DELETE SET NULL;
ALTER TABLE class_subjects_3AAA ADD CONSTRAINT fk_class_subjects_class FOREIGN KEY (class_id) REFERENCES classes_3AAA(id) ON DELETE CASCADE;
ALTER TABLE class_subjects_3AAA ADD CONSTRAINT fk_class_subjects_subject FOREIGN KEY (subject_id) REFERENCES subjects_3AAA(id) ON DELETE CASCADE;
ALTER TABLE topics_3AAA ADD CONSTRAINT fk_topics_subject FOREIGN KEY (subject_id) REFERENCES subjects_3AAA(id) ON DELETE CASCADE;
ALTER TABLE topics_3AAA ADD CONSTRAINT fk_topics_parent FOREIGN KEY (parent_topic_id) REFERENCES topics_3AAA(id) ON DELETE SET NULL;
ALTER TABLE topic_content_3AAA ADD CONSTRAINT fk_topic_content_topic FOREIGN KEY (topic_id) REFERENCES topics_3AAA(id) ON DELETE CASCADE;
ALTER TABLE topic_content_3AAA ADD CONSTRAINT fk_topic_content_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users_3AAA(id) ON DELETE SET NULL;
ALTER TABLE teachers_3AAA ADD CONSTRAINT fk_teachers_user FOREIGN KEY (user_id) REFERENCES users_3AAA(id) ON DELETE SET NULL;
ALTER TABLE teacher_subject_sections_3AAA ADD CONSTRAINT fk_teacher_subject_sections_teacher FOREIGN KEY (teacher_id) REFERENCES teachers_3AAA(id) ON DELETE CASCADE;
ALTER TABLE teacher_subject_sections_3AAA ADD CONSTRAINT fk_teacher_subject_sections_section FOREIGN KEY (section_id) REFERENCES sections_3AAA(id) ON DELETE CASCADE;
ALTER TABLE teacher_subject_sections_3AAA ADD CONSTRAINT fk_teacher_subject_sections_subject FOREIGN KEY (subject_id) REFERENCES subjects_3AAA(id) ON DELETE CASCADE;
ALTER TABLE teacher_subject_sections_3AAA ADD CONSTRAINT fk_teacher_subject_sections_year FOREIGN KEY (academic_year_id) REFERENCES academic_years_3AAA(id) ON DELETE CASCADE;
ALTER TABLE timetables_3AAA ADD CONSTRAINT fk_timetables_section FOREIGN KEY (section_id) REFERENCES sections_3AAA(id) ON DELETE CASCADE;
ALTER TABLE timetables_3AAA ADD CONSTRAINT fk_timetables_year FOREIGN KEY (academic_year_id) REFERENCES academic_years_3AAA(id) ON DELETE CASCADE;
ALTER TABLE timetables_3AAA ADD CONSTRAINT fk_timetables_period FOREIGN KEY (period_id) REFERENCES timetable_periods_3AAA(id) ON DELETE CASCADE;
ALTER TABLE timetables_3AAA ADD CONSTRAINT fk_timetables_subject FOREIGN KEY (subject_id) REFERENCES subjects_3AAA(id) ON DELETE SET NULL;
ALTER TABLE timetables_3AAA ADD CONSTRAINT fk_timetables_teacher FOREIGN KEY (teacher_id) REFERENCES teachers_3AAA(id) ON DELETE SET NULL;
ALTER TABLE timetable_substitutions_3AAA ADD CONSTRAINT fk_timetable_subs_timetable FOREIGN KEY (timetable_id) REFERENCES timetables_3AAA(id) ON DELETE CASCADE;
ALTER TABLE timetable_substitutions_3AAA ADD CONSTRAINT fk_timetable_subs_original FOREIGN KEY (original_teacher_id) REFERENCES teachers_3AAA(id) ON DELETE CASCADE;
ALTER TABLE timetable_substitutions_3AAA ADD CONSTRAINT fk_timetable_subs_substitute FOREIGN KEY (substitute_teacher_id) REFERENCES teachers_3AAA(id) ON DELETE CASCADE;
ALTER TABLE timetable_substitutions_3AAA ADD CONSTRAINT fk_timetable_subs_created_by FOREIGN KEY (created_by) REFERENCES users_3AAA(id) ON DELETE SET NULL;
ALTER TABLE lecture_templates_3AAA ADD CONSTRAINT fk_lecture_templates_subject FOREIGN KEY (subject_id) REFERENCES subjects_3AAA(id) ON DELETE CASCADE;
ALTER TABLE lecture_templates_3AAA ADD CONSTRAINT fk_lecture_templates_teacher FOREIGN KEY (default_teacher_id) REFERENCES teachers_3AAA(id) ON DELETE SET NULL;
ALTER TABLE attendance_3AAA ADD CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students_3AAA(id) ON DELETE CASCADE;
ALTER TABLE attendance_3AAA ADD CONSTRAINT fk_attendance_class FOREIGN KEY (class_id) REFERENCES classes_3AAA(id) ON DELETE CASCADE;
ALTER TABLE attendance_3AAA ADD CONSTRAINT fk_attendance_section FOREIGN KEY (section_id) REFERENCES sections_3AAA(id) ON DELETE CASCADE;
ALTER TABLE attendance_3AAA ADD CONSTRAINT fk_attendance_marked_by FOREIGN KEY (marked_by) REFERENCES users_3AAA(id) ON DELETE SET NULL;
ALTER TABLE attendance_subject_wise_3AAA ADD CONSTRAINT fk_attendance_subject_student FOREIGN KEY (student_id) REFERENCES students_3AAA(id) ON DELETE CASCADE;
ALTER TABLE attendance_subject_wise_3AAA ADD CONSTRAINT fk_attendance_subject_section FOREIGN KEY (section_id) REFERENCES sections_3AAA(id) ON DELETE CASCADE;
ALTER TABLE attendance_subject_wise_3AAA ADD CONSTRAINT fk_attendance_subject_subject FOREIGN KEY (subject_id) REFERENCES subjects_3AAA(id) ON DELETE CASCADE;
ALTER TABLE attendance_subject_wise_3AAA ADD CONSTRAINT fk_attendance_subject_timetable FOREIGN KEY (timetable_id) REFERENCES timetables_3AAA(id) ON DELETE SET NULL;
ALTER TABLE attendance_subject_wise_3AAA ADD CONSTRAINT fk_attendance_subject_period FOREIGN KEY (period_id) REFERENCES timetable_periods_3AAA(id) ON DELETE SET NULL;
ALTER TABLE attendance_subject_wise_3AAA ADD CONSTRAINT fk_attendance_subject_marked_by FOREIGN KEY (marked_by) REFERENCES users_3AAA(id) ON DELETE SET NULL;
ALTER TABLE leave_applications_3AAA ADD CONSTRAINT fk_leave_applications_student FOREIGN KEY (student_id) REFERENCES students_3AAA(id) ON DELETE CASCADE;
ALTER TABLE leave_applications_3AAA ADD CONSTRAINT fk_leave_applications_applied_by FOREIGN KEY (applied_by) REFERENCES users_3AAA(id) ON DELETE SET NULL;
ALTER TABLE leave_applications_3AAA ADD CONSTRAINT fk_leave_applications_approved_by FOREIGN KEY (approved_by) REFERENCES users_3AAA(id) ON DELETE SET NULL;
ALTER TABLE teacher_attendance_3AAA ADD CONSTRAINT fk_teacher_attendance_teacher FOREIGN KEY (teacher_id) REFERENCES teachers_3AAA(id) ON DELETE CASCADE;
ALTER TABLE teacher_attendance_3AAA ADD CONSTRAINT fk_teacher_attendance_marked_by FOREIGN KEY (marked_by) REFERENCES users_3AAA(id) ON DELETE SET NULL;
ALTER TABLE exams_3AAA ADD CONSTRAINT fk_exams_type FOREIGN KEY (exam_type_id) REFERENCES exam_types_3AAA(id) ON DELETE RESTRICT;
ALTER TABLE exams_3AAA ADD CONSTRAINT fk_exams_year FOREIGN KEY (academic_year_id) REFERENCES academic_years_3AAA(id) ON DELETE CASCADE;
ALTER TABLE exam_schedules_3AAA ADD CONSTRAINT fk_exam_schedules_exam FOREIGN KEY (exam_id) REFERENCES exams_3AAA(id) ON DELETE CASCADE;
ALTER TABLE exam_schedules_3AAA ADD CONSTRAINT fk_exam_schedules_class FOREIGN KEY (class_id) REFERENCES classes_3AAA(id) ON DELETE CASCADE;
ALTER TABLE exam_schedules_3AAA ADD CONSTRAINT fk_exam_schedules_section FOREIGN KEY (section_id) REFERENCES sections_3AAA(id) ON DELETE SET NULL;
ALTER TABLE exam_schedules_3AAA ADD CONSTRAINT fk_exam_schedules_subject FOREIGN KEY (subject_id) REFERENCES subjects_3AAA(id) ON DELETE CASCADE;
ALTER TABLE admit_cards_3AAA ADD CONSTRAINT fk_admit_cards_exam FOREIGN KEY (exam_id) REFERENCES exams_3AAA(id) ON DELETE CASCADE;
ALTER TABLE admit_cards_3AAA ADD CONSTRAINT fk_admit_cards_student FOREIGN KEY (student_id) REFERENCES students_3AAA(id) ON DELETE CASCADE;
ALTER TABLE exam_marks_3AAA ADD CONSTRAINT fk_exam_marks_schedule FOREIGN KEY (exam_schedule_id) REFERENCES exam_schedules_3AAA(id) ON DELETE CASCADE;
ALTER TABLE exam_marks_3AAA ADD CONSTRAINT fk_exam_marks_student FOREIGN KEY (student_id) REFERENCES students_3AAA(id) ON DELETE CASCADE;
ALTER TABLE exam_marks_3AAA ADD CONSTRAINT fk_exam_marks_entered_by FOREIGN KEY (entered_by) REFERENCES users_3AAA(id) ON DELETE SET NULL;
ALTER TABLE exam_marks_3AAA ADD CONSTRAINT fk_exam_marks_verified_by FOREIGN KEY (verified_by) REFERENCES users_3AAA(id) ON DELETE SET NULL;
ALTER TABLE report_cards_3AAA ADD CONSTRAINT fk_report_cards_exam FOREIGN KEY (exam_id) REFERENCES exams_3AAA(id) ON DELETE CASCADE;
ALTER TABLE report_cards_3AAA ADD CONSTRAINT fk_report_cards_student FOREIGN KEY (student_id) REFERENCES students_3AAA(id) ON DELETE CASCADE;
ALTER TABLE fee_structures_3AAA ADD CONSTRAINT fk_fee_structures_class FOREIGN KEY (class_id) REFERENCES classes_3AAA(id) ON DELETE CASCADE;
ALTER TABLE fee_structures_3AAA ADD CONSTRAINT fk_fee_structures_year FOREIGN KEY (academic_year_id) REFERENCES academic_years_3AAA(id) ON DELETE CASCADE;
ALTER TABLE fee_structure_components_3AAA ADD CONSTRAINT fk_fee_structure_components_structure FOREIGN KEY (fee_structure_id) REFERENCES fee_structures_3AAA(id) ON DELETE CASCADE;
ALTER TABLE fee_structure_components_3AAA ADD CONSTRAINT fk_fee_structure_components_component FOREIGN KEY (fee_component_id) REFERENCES fee_components_3AAA(id) ON DELETE CASCADE;
ALTER TABLE student_fees_3AAA ADD CONSTRAINT fk_student_fees_student FOREIGN KEY (student_id) REFERENCES students_3AAA(id) ON DELETE CASCADE;
ALTER TABLE student_fees_3AAA ADD CONSTRAINT fk_student_fees_structure FOREIGN KEY (fee_structure_id) REFERENCES fee_structures_3AAA(id) ON DELETE RESTRICT;
ALTER TABLE student_fees_3AAA ADD CONSTRAINT fk_student_fees_year FOREIGN KEY (academic_year_id) REFERENCES academic_years_3AAA(id) ON DELETE CASCADE;
ALTER TABLE fee_payments_3AAA ADD CONSTRAINT fk_fee_payments_student_fee FOREIGN KEY (student_fee_id) REFERENCES student_fees_3AAA(id) ON DELETE CASCADE;
ALTER TABLE fee_payments_3AAA ADD CONSTRAINT fk_fee_payments_student FOREIGN KEY (student_id) REFERENCES students_3AAA(id) ON DELETE CASCADE;
ALTER TABLE fee_payments_3AAA ADD CONSTRAINT fk_fee_payments_collected_by FOREIGN KEY (collected_by) REFERENCES users_3AAA(id) ON DELETE SET NULL;
ALTER TABLE late_fee_config_3AAA ADD CONSTRAINT fk_late_fee_config_class FOREIGN KEY (class_id) REFERENCES classes_3AAA(id) ON DELETE CASCADE;
ALTER TABLE announcements_3AAA ADD CONSTRAINT fk_announcements_class FOREIGN KEY (class_id) REFERENCES classes_3AAA(id) ON DELETE SET NULL;
ALTER TABLE announcements_3AAA ADD CONSTRAINT fk_announcements_section FOREIGN KEY (section_id) REFERENCES sections_3AAA(id) ON DELETE SET NULL;
ALTER TABLE announcements_3AAA ADD CONSTRAINT fk_announcements_created_by FOREIGN KEY (created_by) REFERENCES users_3AAA(id) ON DELETE SET NULL;
ALTER TABLE notifications_3AAA ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users_3AAA(id) ON DELETE CASCADE;
ALTER TABLE sms_logs_3AAA ADD CONSTRAINT fk_sms_logs_user FOREIGN KEY (recipient_user_id) REFERENCES users_3AAA(id) ON DELETE SET NULL;
ALTER TABLE email_logs_3AAA ADD CONSTRAINT fk_email_logs_user FOREIGN KEY (recipient_user_id) REFERENCES users_3AAA(id) ON DELETE SET NULL;
ALTER TABLE id_cards_3AAA ADD CONSTRAINT fk_id_cards_user FOREIGN KEY (user_id) REFERENCES users_3AAA(id) ON DELETE CASCADE;
ALTER TABLE activity_logs_3AAA ADD CONSTRAINT fk_activity_logs_user FOREIGN KEY (user_id) REFERENCES users_3AAA(id) ON DELETE CASCADE;

-- ============================================================================
-- END OF SCHEMA FOR SCHOOL 3 (3AAA)
-- Total Tables: 42 | Total Foreign Keys: 86
-- ============================================================================

