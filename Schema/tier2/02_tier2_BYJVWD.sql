-- ============================================================================
-- EduMunch: TIER 2 Schema - School 2 (BYJVWD)
-- ============================================================================
-- TIER 2: STANDARD FEATURES (Competitive Edge)
-- Requires TIER 1 to be deployed first
-- 
-- This file adds ~25 new tables for:
-- - LMS (Online Learning Management)
-- - Transport Management
-- - Advanced HR & Payroll
-- - Homework & Diary
-- ============================================================================

-- ============================================================================
-- 1. ONLINE LEARNING MANAGEMENT (LMS)
-- ============================================================================

-- 1.1 Assignments
CREATE TABLE assignments_BYJVWD (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  section_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  assignment_type VARCHAR(50) CHECK (assignment_type IN ('Homework', 'Project', 'Practice', 'Lab Work')),
  deadline TIMESTAMP NOT NULL,
  max_marks INTEGER,
  attachment_url TEXT,
  instructions TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_assignments_section ON assignments_BYJVWD(section_id);
CREATE INDEX idx_assignments_subject ON assignments_BYJVWD(subject_id);
CREATE INDEX idx_assignments_teacher ON assignments_BYJVWD(teacher_id);
CREATE INDEX idx_assignments_deadline ON assignments_BYJVWD(deadline);
CREATE INDEX idx_assignments_published ON assignments_BYJVWD(is_published);

COMMENT ON TABLE assignments_BYJVWD IS 'Teacher-created assignments with deadlines';

-- 1.2 Assignment Submissions
CREATE TABLE assignment_submissions_BYJVWD (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL,
  student_id UUID NOT NULL,
  submission_date TIMESTAMP DEFAULT NOW(),
  submission_file_url TEXT,
  submission_text TEXT,
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Submitted', 'Late', 'Evaluated', 'Resubmit')),
  marks_obtained DECIMAL(5,2),
  teacher_remarks TEXT,
  evaluated_by UUID,
  evaluated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_assignment_submissions_assignment ON assignment_submissions_BYJVWD(assignment_id);
CREATE INDEX idx_assignment_submissions_student ON assignment_submissions_BYJVWD(student_id);
CREATE INDEX idx_assignment_submissions_status ON assignment_submissions_BYJVWD(status);
CREATE UNIQUE INDEX idx_assignment_submissions_unique ON assignment_submissions_BYJVWD(assignment_id, student_id);

COMMENT ON TABLE assignment_submissions_BYJVWD IS 'Student assignment submissions and evaluations';

-- 1.3 Study Materials
CREATE TABLE study_materials_BYJVWD (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  class_id UUID NOT NULL,
  section_id UUID,
  subject_id UUID NOT NULL,
  topic_id UUID,
  material_type VARCHAR(50) NOT NULL CHECK (material_type IN ('PDF', 'Video', 'Link', 'Document', 'PPT', 'Image')),
  file_url TEXT,
  video_url TEXT,
  external_link TEXT,
  uploaded_by UUID NOT NULL,
  is_published BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_study_materials_class ON study_materials_BYJVWD(class_id);
CREATE INDEX idx_study_materials_section ON study_materials_BYJVWD(section_id);
CREATE INDEX idx_study_materials_subject ON study_materials_BYJVWD(subject_id);
CREATE INDEX idx_study_materials_topic ON study_materials_BYJVWD(topic_id);
CREATE INDEX idx_study_materials_type ON study_materials_BYJVWD(material_type);

COMMENT ON TABLE study_materials_BYJVWD IS 'Subject-wise study materials repository';

-- 1.4 Online Class Sessions
CREATE TABLE online_class_sessions_BYJVWD (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_title VARCHAR(255) NOT NULL,
  section_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  platform VARCHAR(50) CHECK (platform IN ('Zoom', 'Google Meet', 'Microsoft Teams', 'Other')),
  meeting_link TEXT NOT NULL,
  meeting_id VARCHAR(100),
  meeting_password VARCHAR(100),
  description TEXT,
  status VARCHAR(20) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Live', 'Completed', 'Cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_online_class_sessions_section ON online_class_sessions_BYJVWD(section_id);
CREATE INDEX idx_online_class_sessions_subject ON online_class_sessions_BYJVWD(subject_id);
CREATE INDEX idx_online_class_sessions_teacher ON online_class_sessions_BYJVWD(teacher_id);
CREATE INDEX idx_online_class_sessions_date ON online_class_sessions_BYJVWD(session_date);
CREATE INDEX idx_online_class_sessions_status ON online_class_sessions_BYJVWD(status);

COMMENT ON TABLE online_class_sessions_BYJVWD IS 'Online class scheduling with meeting links';

-- 1.5 Class Recordings
CREATE TABLE class_recordings_BYJVWD (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  recording_title VARCHAR(255) NOT NULL,
  recording_url TEXT NOT NULL,
  duration_minutes INTEGER,
  file_size_mb DECIMAL(10,2),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  is_available BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_class_recordings_session ON class_recordings_BYJVWD(session_id);
CREATE INDEX idx_class_recordings_available ON class_recordings_BYJVWD(is_available);

COMMENT ON TABLE class_recordings_BYJVWD IS 'Recorded online class videos';

-- 1.6 Material Access Logs
CREATE TABLE material_access_logs_BYJVWD (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  material_id UUID,
  recording_id UUID,
  access_type VARCHAR(50) CHECK (access_type IN ('Study Material', 'Recording', 'Assignment')),
  accessed_at TIMESTAMP DEFAULT NOW(),
  duration_seconds INTEGER
);

CREATE INDEX idx_material_access_logs_student ON material_access_logs_BYJVWD(student_id);
CREATE INDEX idx_material_access_logs_material ON material_access_logs_BYJVWD(material_id);
CREATE INDEX idx_material_access_logs_recording ON material_access_logs_BYJVWD(recording_id);

COMMENT ON TABLE material_access_logs_BYJVWD IS 'Track student engagement with learning materials';

-- ============================================================================
-- 2. TRANSPORT MANAGEMENT
-- ============================================================================

-- 2.1 Transport Routes
CREATE TABLE transport_routes_BYJVWD (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name VARCHAR(255) NOT NULL,
  route_code VARCHAR(50) UNIQUE NOT NULL,
  route_description TEXT,
  start_location VARCHAR(255) NOT NULL,
  end_location VARCHAR(255) NOT NULL,
  total_distance_km DECIMAL(6,2),
  estimated_duration_minutes INTEGER,
  fare_amount DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transport_routes_code ON transport_routes_BYJVWD(route_code);
CREATE INDEX idx_transport_routes_active ON transport_routes_BYJVWD(is_active);

COMMENT ON TABLE transport_routes_BYJVWD IS 'Bus route master data';

-- 2.2 Transport Stops
CREATE TABLE transport_stops_BYJVWD (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL,
  stop_name VARCHAR(255) NOT NULL,
  stop_order INTEGER NOT NULL,
  landmark VARCHAR(255),
  pickup_time TIME,
  drop_time TIME,
  distance_from_school_km DECIMAL(6,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transport_stops_route ON transport_stops_BYJVWD(route_id);
CREATE INDEX idx_transport_stops_order ON transport_stops_BYJVWD(route_id, stop_order);

COMMENT ON TABLE transport_stops_BYJVWD IS 'Stops along each route';

-- 2.3 Transport Vehicles
CREATE TABLE transport_vehicles_BYJVWD (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_number VARCHAR(50) UNIQUE NOT NULL,
  vehicle_type VARCHAR(50) CHECK (vehicle_type IN ('Bus', 'Van', 'Auto', 'Other')),
  capacity INTEGER NOT NULL,
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  year_of_manufacture INTEGER,
  registration_date DATE,
  insurance_number VARCHAR(100),
  insurance_expiry DATE,
  pollution_certificate_expiry DATE,
  fitness_certificate_expiry DATE,
  gps_device_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Maintenance', 'Retired')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transport_vehicles_number ON transport_vehicles_BYJVWD(vehicle_number);
CREATE INDEX idx_transport_vehicles_status ON transport_vehicles_BYJVWD(status);

COMMENT ON TABLE transport_vehicles_BYJVWD IS 'School vehicle master data';

-- 2.4 Vehicle Drivers
CREATE TABLE vehicle_drivers_BYJVWD (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  employee_code VARCHAR(50) UNIQUE NOT NULL,
  phone VARCHAR(15) NOT NULL,
  alternate_phone VARCHAR(15),
  license_number VARCHAR(50) UNIQUE NOT NULL,
  license_expiry DATE NOT NULL,
  address TEXT,
  photo_url TEXT,
  date_of_birth DATE,
  joining_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave', 'Resigned', 'Terminated')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vehicle_drivers_code ON vehicle_drivers_BYJVWD(employee_code);
CREATE INDEX idx_vehicle_drivers_status ON vehicle_drivers_BYJVWD(status);

COMMENT ON TABLE vehicle_drivers_BYJVWD IS 'Driver information and credentials';

-- 2.5 Vehicle Route Assignments
CREATE TABLE vehicle_route_assignments_BYJVWD (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL,
  vehicle_id UUID NOT NULL,
  driver_id UUID NOT NULL,
  conductor_id UUID,
  assignment_date DATE NOT NULL,
  shift VARCHAR(20) CHECK (shift IN ('Morning', 'Evening', 'Both')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vehicle_route_assignments_route ON vehicle_route_assignments_BYJVWD(route_id);
CREATE INDEX idx_vehicle_route_assignments_vehicle ON vehicle_route_assignments_BYJVWD(vehicle_id);
CREATE INDEX idx_vehicle_route_assignments_driver ON vehicle_route_assignments_BYJVWD(driver_id);
CREATE INDEX idx_vehicle_route_assignments_active ON vehicle_route_assignments_BYJVWD(is_active);

COMMENT ON TABLE vehicle_route_assignments_BYJVWD IS 'Daily vehicle-route-driver assignments';

-- 2.6 Student Transport
CREATE TABLE student_transport_BYJVWD (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  route_id UUID NOT NULL,
  stop_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  transport_fee DECIMAL(10,2),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_student_transport_student ON student_transport_BYJVWD(student_id);
CREATE INDEX idx_student_transport_route ON student_transport_BYJVWD(route_id);
CREATE INDEX idx_student_transport_stop ON student_transport_BYJVWD(stop_id);
CREATE INDEX idx_student_transport_active ON student_transport_BYJVWD(is_active);

COMMENT ON TABLE student_transport_BYJVWD IS 'Student transport allocation';

-- 2.7 Vehicle Maintenance
CREATE TABLE vehicle_maintenance_BYJVWD (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL,
  maintenance_type VARCHAR(50) CHECK (maintenance_type IN ('Regular Service', 'Repair', 'Inspection', 'Emergency')),
  maintenance_date DATE NOT NULL,
  description TEXT,
  cost DECIMAL(10,2),
  vendor_name VARCHAR(255),
  next_service_date DATE,
  odometer_reading INTEGER,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vehicle_maintenance_vehicle ON vehicle_maintenance_BYJVWD(vehicle_id);
CREATE INDEX idx_vehicle_maintenance_date ON vehicle_maintenance_BYJVWD(maintenance_date);

COMMENT ON TABLE vehicle_maintenance_BYJVWD IS 'Vehicle maintenance and service history';

-- ============================================================================
-- 3. ADVANCED HR & PAYROLL
-- ============================================================================

-- 3.1 Employees (Non-Teaching Staff)
CREATE TABLE employees_BYJVWD (
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
  
  -- Employment
  designation VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  joining_date DATE NOT NULL,
  employment_type VARCHAR(50) CHECK (employment_type IN ('Permanent', 'Contract', 'Part-time', 'Temporary')),
  
  -- Documents
  photo_url TEXT,
  resume_url TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'resigned', 'terminated')),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_employees_code ON employees_BYJVWD(employee_code);
CREATE INDEX idx_employees_status ON employees_BYJVWD(status);

COMMENT ON TABLE employees_BYJVWD IS 'Non-teaching staff records (admin, support staff, etc.)';

-- 3.2 Salary Structures
CREATE TABLE salary_structures_BYJVWD (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_name VARCHAR(255) NOT NULL,
  designation VARCHAR(100),
  employment_type VARCHAR(50),
  basic_salary DECIMAL(10,2) NOT NULL,
  effective_from DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_salary_structures_designation ON salary_structures_BYJVWD(designation);
CREATE INDEX idx_salary_structures_active ON salary_structures_BYJVWD(is_active);

COMMENT ON TABLE salary_structures_BYJVWD IS 'Salary structure templates by designation';

-- 3.3 Salary Components
CREATE TABLE salary_components_BYJVWD (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salary_structure_id UUID NOT NULL,
  component_name VARCHAR(100) NOT NULL,
  component_type VARCHAR(50) CHECK (component_type IN ('Earning', 'Deduction')),
  calculation_type VARCHAR(50) CHECK (calculation_type IN ('Fixed', 'Percentage')),
  amount DECIMAL(10,2),
  percentage DECIMAL(5,2),
  is_taxable BOOLEAN DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_salary_components_structure ON salary_components_BYJVWD(salary_structure_id);

COMMENT ON TABLE salary_components_BYJVWD IS 'Breakdown of salary components (HRA, DA, PF, etc.)';

-- 3.4 Monthly Payroll
CREATE TABLE monthly_payroll_BYJVWD (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID,
  teacher_id UUID,
  employee_type VARCHAR(20) CHECK (employee_type IN ('Teacher', 'Staff')),
  salary_month DATE NOT NULL,
  basic_salary DECIMAL(10,2) NOT NULL,
  total_earnings DECIMAL(10,2) NOT NULL,
  total_deductions DECIMAL(10,2) NOT NULL,
  net_salary DECIMAL(10,2) NOT NULL,
  payment_date DATE,
  payment_mode VARCHAR(50) CHECK (payment_mode IN ('Bank Transfer', 'Cash', 'Cheque')),
  bank_transaction_id VARCHAR(100),
  salary_slip_url TEXT,
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processed', 'Paid')),
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_monthly_payroll_employee ON monthly_payroll_BYJVWD(employee_id);
CREATE INDEX idx_monthly_payroll_teacher ON monthly_payroll_BYJVWD(teacher_id);
CREATE INDEX idx_monthly_payroll_month ON monthly_payroll_BYJVWD(salary_month);
CREATE INDEX idx_monthly_payroll_status ON monthly_payroll_BYJVWD(status);

COMMENT ON TABLE monthly_payroll_BYJVWD IS 'Monthly salary processing for all staff';

-- 3.5 PF/ESI Records
CREATE TABLE pf_esi_records_BYJVWD (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID,
  teacher_id UUID,
  employee_type VARCHAR(20) CHECK (employee_type IN ('Teacher', 'Staff')),
  financial_year VARCHAR(10) NOT NULL,
  pf_number VARCHAR(50),
  esi_number VARCHAR(50),
  total_pf_employee DECIMAL(10,2) DEFAULT 0,
  total_pf_employer DECIMAL(10,2) DEFAULT 0,
  total_esi_employee DECIMAL(10,2) DEFAULT 0,
  total_esi_employer DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pf_esi_records_employee ON pf_esi_records_BYJVWD(employee_id);
CREATE INDEX idx_pf_esi_records_teacher ON pf_esi_records_BYJVWD(teacher_id);
CREATE INDEX idx_pf_esi_records_year ON pf_esi_records_BYJVWD(financial_year);

COMMENT ON TABLE pf_esi_records_BYJVWD IS 'PF and ESI statutory contribution records';

-- 3.6 Performance Reviews
CREATE TABLE performance_reviews_BYJVWD (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID,
  teacher_id UUID,
  employee_type VARCHAR(20) CHECK (employee_type IN ('Teacher', 'Staff')),
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  reviewer_id UUID NOT NULL,
  overall_rating DECIMAL(3,2),
  strengths TEXT,
  areas_of_improvement TEXT,
  goals_achieved TEXT,
  goals_next_period TEXT,
  increment_recommended DECIMAL(5,2),
  status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Approved')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_performance_reviews_employee ON performance_reviews_BYJVWD(employee_id);
CREATE INDEX idx_performance_reviews_teacher ON performance_reviews_BYJVWD(teacher_id);
CREATE INDEX idx_performance_reviews_period ON performance_reviews_BYJVWD(review_period_start, review_period_end);

COMMENT ON TABLE performance_reviews_BYJVWD IS 'Employee performance appraisal records';

-- 3.7 Recruitment Applications
CREATE TABLE recruitment_applications_BYJVWD (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  applicant_name VARCHAR(255) NOT NULL,
  applicant_email VARCHAR(255) NOT NULL,
  applicant_phone VARCHAR(15) NOT NULL,
  resume_url TEXT,
  cover_letter TEXT,
  experience_years INTEGER,
  expected_salary DECIMAL(10,2),
  application_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'Applied' CHECK (status IN ('Applied', 'Shortlisted', 'Interview Scheduled', 'Interviewed', 'Selected', 'Rejected', 'Joined')),
  interview_date DATE,
  interview_feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_recruitment_applications_status ON recruitment_applications_BYJVWD(status);
CREATE INDEX idx_recruitment_applications_date ON recruitment_applications_BYJVWD(application_date);

COMMENT ON TABLE recruitment_applications_BYJVWD IS 'Job application tracking system';

-- 3.8 Staff Leave Applications
CREATE TABLE staff_leave_applications_BYJVWD (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID,
  teacher_id UUID,
  employee_type VARCHAR(20) CHECK (employee_type IN ('Teacher', 'Staff')),
  leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('Casual', 'Sick', 'Earned', 'Maternity', 'Paternity', 'LOP')),
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  total_days DECIMAL(3,1) NOT NULL,
  reason TEXT NOT NULL,
  medical_certificate_url TEXT,
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  approved_by UUID,
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_staff_leave_applications_employee ON staff_leave_applications_BYJVWD(employee_id);
CREATE INDEX idx_staff_leave_applications_teacher ON staff_leave_applications_BYJVWD(teacher_id);
CREATE INDEX idx_staff_leave_applications_status ON staff_leave_applications_BYJVWD(status);
CREATE INDEX idx_staff_leave_applications_dates ON staff_leave_applications_BYJVWD(from_date, to_date);

COMMENT ON TABLE staff_leave_applications_BYJVWD IS 'Leave application system for all staff';

-- ============================================================================
-- 4. HOMEWORK & DIARY
-- ============================================================================

-- 4.1 Homework
CREATE TABLE homework_BYJVWD (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  section_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  homework_date DATE NOT NULL,
  due_date DATE,
  attachment_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_homework_section ON homework_BYJVWD(section_id);
CREATE INDEX idx_homework_subject ON homework_BYJVWD(subject_id);
CREATE INDEX idx_homework_date ON homework_BYJVWD(homework_date);
CREATE INDEX idx_homework_published ON homework_BYJVWD(is_published);

COMMENT ON TABLE homework_BYJVWD IS 'Daily homework diary by teachers';

-- 4.2 Homework Submissions
CREATE TABLE homework_submissions_BYJVWD (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  homework_id UUID NOT NULL,
  student_id UUID NOT NULL,
  submission_date TIMESTAMP DEFAULT NOW(),
  submission_file_url TEXT,
  submission_notes TEXT,
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Submitted', 'Evaluated')),
  evaluation_remarks TEXT,
  evaluated_by UUID,
  evaluated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_homework_submissions_homework ON homework_submissions_BYJVWD(homework_id);
CREATE INDEX idx_homework_submissions_student ON homework_submissions_BYJVWD(student_id);
CREATE INDEX idx_homework_submissions_status ON homework_submissions_BYJVWD(status);
CREATE UNIQUE INDEX idx_homework_submissions_unique ON homework_submissions_BYJVWD(homework_id, student_id);

COMMENT ON TABLE homework_submissions_BYJVWD IS 'Student homework submission and evaluation';

-- ============================================================================
-- END OF TIER 2 SCHEMA FOR School 2
-- ============================================================================
-- Total Tables Added: 25
-- 
-- TIER 2 Features Covered:
-- ✓ LMS (6 tables)
-- ✓ Transport Management (7 tables)
-- ✓ Advanced HR & Payroll (8 tables)
-- ✓ Homework & Diary (2 tables)
-- ✓ Staff Management (2 tables - employees, staff_leave_applications)
-- ============================================================================
