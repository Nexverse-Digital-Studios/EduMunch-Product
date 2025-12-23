-- ============================================================================
-- EduMunch: TIER 3 Schema - School 2 (2DDMK)
-- ============================================================================
-- TIER 3: ADVANCED FEATURES (Premium Offerings)
-- Requires TIER 1 and TIER 2 to be deployed first
-- 
-- This file adds ~37 new tables for:
-- - AI-Powered Analytics
-- - Parent-Teacher Meeting (PTM)
-- - Alumni Management
-- - Admission Management
-- - Inventory & Asset Management
-- - Certificate & Document Generation
-- - Advanced Fee Management (Online Payments)
-- - Survey & Feedback System
-- ============================================================================

-- ============================================================================
-- 1. AI-POWERED ANALYTICS
-- ============================================================================

-- 1.1 Student Performance Analytics
CREATE TABLE analytics_student_performance_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  subject_id UUID,
  
  -- Performance Metrics
  current_percentage DECIMAL(5,2),
  predicted_percentage DECIMAL(5,2),
  strength_areas TEXT[], -- Array of topic IDs
  weakness_areas TEXT[], -- Array of topic IDs
  improvement_rate DECIMAL(5,2), -- Month-over-month improvement
  
  -- AI Insights
  risk_level VARCHAR(20) CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
  personalized_suggestions TEXT,
  recommended_study_hours INTEGER,
  recommended_topics TEXT[],
  
  -- Metadata
  last_analyzed_at TIMESTAMP DEFAULT NOW(),
  data_points_count INTEGER, -- Number of exams/tests analyzed
  confidence_score DECIMAL(3,2), -- Model confidence (0-1)
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_student_performance_student ON analytics_student_performance_2DDMK(student_id);
CREATE INDEX idx_analytics_student_performance_subject ON analytics_student_performance_2DDMK(subject_id);
CREATE INDEX idx_analytics_student_performance_risk ON analytics_student_performance_2DDMK(risk_level);

COMMENT ON TABLE analytics_student_performance_2DDMK IS 'ML-based student performance analysis and predictions';

-- 1.2 Attendance Pattern Analysis
CREATE TABLE analytics_attendance_patterns_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  
  -- Attendance Metrics
  attendance_percentage DECIMAL(5,2),
  consecutive_absences INTEGER,
  irregular_pattern_detected BOOLEAN DEFAULT false,
  
  -- Risk Assessment
  dropout_risk_score DECIMAL(3,2), -- 0-1 scale
  dropout_risk_level VARCHAR(20) CHECK (dropout_risk_level IN ('Low', 'Medium', 'High', 'Critical')),
  
  -- Patterns Detected
  frequent_absence_days TEXT[], -- e.g., ['Monday', 'Friday']
  absence_reasons_distribution JSONB, -- {'Sick': 10, 'Family': 5, ...}
  
  -- Alerts
  alert_sent BOOLEAN DEFAULT false,
  alert_sent_at TIMESTAMP,
  parent_contacted BOOLEAN DEFAULT false,
  intervention_required BOOLEAN DEFAULT false,
  
  -- Analysis Window
  analysis_period_start DATE NOT NULL,
  analysis_period_end DATE NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_attendance_patterns_student ON analytics_attendance_patterns_2DDMK(student_id);
CREATE INDEX idx_analytics_attendance_patterns_risk ON analytics_attendance_patterns_2DDMK(dropout_risk_level);
CREATE INDEX idx_analytics_attendance_patterns_alert ON analytics_attendance_patterns_2DDMK(alert_sent);

COMMENT ON TABLE analytics_attendance_patterns_2DDMK IS 'Attendance pattern analysis for dropout risk detection';

-- 1.3 Academic Trend Reports
CREATE TABLE analytics_academic_trends_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Scope
  analysis_type VARCHAR(50) CHECK (analysis_type IN ('Class', 'Section', 'Subject', 'Teacher', 'School')),
  class_id UUID,
  section_id UUID,
  subject_id UUID,
  teacher_id UUID,
  academic_year_id UUID NOT NULL,
  
  -- Performance Trends
  average_percentage DECIMAL(5,2),
  pass_percentage DECIMAL(5,2),
  excellence_percentage DECIMAL(5,2), -- Above 90%
  trend_direction VARCHAR(20) CHECK (trend_direction IN ('Improving', 'Declining', 'Stable')),
  
  -- Comparative Analysis
  comparison_with_previous_year DECIMAL(5,2), -- % change
  rank_in_school INTEGER,
  
  -- Teacher Effectiveness (if teacher-specific)
  student_satisfaction_score DECIMAL(3,2),
  average_marks_improvement DECIMAL(5,2),
  teaching_effectiveness_rating DECIMAL(3,2), -- 0-5 scale
  
  -- Time Period
  analysis_period_start DATE NOT NULL,
  analysis_period_end DATE NOT NULL,
  
  -- Insights
  key_insights TEXT,
  recommendations TEXT,
  
  generated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_academic_trends_type ON analytics_academic_trends_2DDMK(analysis_type);
CREATE INDEX idx_analytics_academic_trends_class ON analytics_academic_trends_2DDMK(class_id);
CREATE INDEX idx_analytics_academic_trends_section ON analytics_academic_trends_2DDMK(section_id);
CREATE INDEX idx_analytics_academic_trends_teacher ON analytics_academic_trends_2DDMK(teacher_id);

COMMENT ON TABLE analytics_academic_trends_2DDMK IS 'Academic performance trends and comparative analysis';

-- ============================================================================
-- 2. PARENT-TEACHER MEETING (PTM)
-- ============================================================================

-- 2.1 PTM Slots
CREATE TABLE ptm_slots_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  ptm_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER DEFAULT 15,
  max_bookings INTEGER DEFAULT 1,
  location VARCHAR(255), -- Room number or online link
  is_online BOOLEAN DEFAULT false,
  meeting_link TEXT,
  status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'Booked', 'Completed', 'Cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ptm_slots_teacher ON ptm_slots_2DDMK(teacher_id);
CREATE INDEX idx_ptm_slots_date ON ptm_slots_2DDMK(ptm_date);
CREATE INDEX idx_ptm_slots_status ON ptm_slots_2DDMK(status);

COMMENT ON TABLE ptm_slots_2DDMK IS 'Teacher availability slots for PTM';

-- 2.2 PTM Bookings
CREATE TABLE ptm_bookings_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL,
  student_id UUID NOT NULL,
  parent_user_id UUID NOT NULL,
  booking_date TIMESTAMP DEFAULT NOW(),
  
  -- Meeting Details
  meeting_purpose TEXT,
  topics_to_discuss TEXT[],
  
  -- Status
  status VARCHAR(20) DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Completed', 'Cancelled', 'No Show')),
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP,
  
  -- Reminders
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ptm_bookings_slot ON ptm_bookings_2DDMK(slot_id);
CREATE INDEX idx_ptm_bookings_student ON ptm_bookings_2DDMK(student_id);
CREATE INDEX idx_ptm_bookings_parent ON ptm_bookings_2DDMK(parent_user_id);
CREATE INDEX idx_ptm_bookings_status ON ptm_bookings_2DDMK(status);

COMMENT ON TABLE ptm_bookings_2DDMK IS 'Parent booking records for PTM slots';

-- 2.3 PTM Meeting Notes
CREATE TABLE ptm_meeting_notes_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  student_id UUID NOT NULL,
  
  -- Discussion Details
  discussion_points TEXT NOT NULL,
  student_strengths TEXT,
  areas_of_improvement TEXT,
  behavioral_observations TEXT,
  academic_concerns TEXT,
  
  -- Action Items
  action_items TEXT[],
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  follow_up_completed BOOLEAN DEFAULT false,
  
  -- Recommendations
  teacher_recommendations TEXT,
  parent_feedback TEXT,
  
  -- Metadata
  meeting_duration_minutes INTEGER,
  recorded_by UUID NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ptm_meeting_notes_booking ON ptm_meeting_notes_2DDMK(booking_id);
CREATE INDEX idx_ptm_meeting_notes_student ON ptm_meeting_notes_2DDMK(student_id);
CREATE INDEX idx_ptm_meeting_notes_teacher ON ptm_meeting_notes_2DDMK(teacher_id);
CREATE INDEX idx_ptm_meeting_notes_follow_up ON ptm_meeting_notes_2DDMK(follow_up_required, follow_up_completed);

COMMENT ON TABLE ptm_meeting_notes_2DDMK IS 'Discussion notes and action items from PTM';

-- ============================================================================
-- 3. ALUMNI MANAGEMENT
-- ============================================================================

-- 3.1 Alumni Directory
CREATE TABLE alumni_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE, -- Link to users table if registered
  
  -- Personal Info
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(15),
  date_of_birth DATE,
  
  -- Academic History
  student_id UUID, -- Original student record
  batch_year INTEGER NOT NULL,
  class_graduated VARCHAR(20) NOT NULL,
  section_graduated VARCHAR(10),
  roll_number VARCHAR(50),
  
  -- Current Status
  current_occupation VARCHAR(255),
  current_company VARCHAR(255),
  current_designation VARCHAR(255),
  current_city VARCHAR(100),
  current_country VARCHAR(100),
  
  -- Social Links
  linkedin_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  
  -- Engagement
  is_mentor BOOLEAN DEFAULT false,
  willing_to_donate BOOLEAN DEFAULT false,
  interested_in_events BOOLEAN DEFAULT true,
  
  -- Profile
  photo_url TEXT,
  achievements TEXT,
  
  -- Status
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alumni_batch ON alumni_2DDMK(batch_year);
CREATE INDEX idx_alumni_email ON alumni_2DDMK(email);
CREATE INDEX idx_alumni_mentor ON alumni_2DDMK(is_mentor);
CREATE INDEX idx_alumni_active ON alumni_2DDMK(is_active);

COMMENT ON TABLE alumni_2DDMK IS 'Alumni directory with engagement preferences';

-- 3.2 Alumni Events
CREATE TABLE alumni_events_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_title VARCHAR(255) NOT NULL,
  event_description TEXT,
  event_type VARCHAR(50) CHECK (event_type IN ('Reunion', 'Webinar', 'Networking', 'Fundraiser', 'Workshop', 'Other')),
  
  -- Event Details
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  venue VARCHAR(255),
  is_online BOOLEAN DEFAULT false,
  meeting_link TEXT,
  
  -- Target Audience
  target_batches INTEGER[], -- Array of years [2010, 2011, 2012]
  is_open_to_all BOOLEAN DEFAULT true,
  max_participants INTEGER,
  
  -- Registration
  registration_required BOOLEAN DEFAULT true,
  registration_deadline DATE,
  registration_fee DECIMAL(10,2) DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'Upcoming' CHECK (status IN ('Draft', 'Published', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled')),
  
  -- Media
  banner_image_url TEXT,
  event_photos_url TEXT[],
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alumni_events_date ON alumni_events_2DDMK(event_date);
CREATE INDEX idx_alumni_events_type ON alumni_events_2DDMK(event_type);
CREATE INDEX idx_alumni_events_status ON alumni_events_2DDMK(status);

COMMENT ON TABLE alumni_events_2DDMK IS 'Alumni reunions, webinars, and networking events';

-- 3.3 Alumni Event Registrations
CREATE TABLE alumni_event_registrations_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  alumni_id UUID NOT NULL,
  registration_date TIMESTAMP DEFAULT NOW(),
  
  -- Attendance
  attended BOOLEAN DEFAULT false,
  check_in_time TIMESTAMP,
  
  -- Payment (if applicable)
  payment_status VARCHAR(20) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Waived', 'Refunded')),
  payment_transaction_id VARCHAR(100),
  payment_date TIMESTAMP,
  
  -- Additional Info
  plus_one BOOLEAN DEFAULT false,
  guest_name VARCHAR(255),
  special_requirements TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alumni_event_registrations_event ON alumni_event_registrations_2DDMK(event_id);
CREATE INDEX idx_alumni_event_registrations_alumni ON alumni_event_registrations_2DDMK(alumni_id);
CREATE UNIQUE INDEX idx_alumni_event_registrations_unique ON alumni_event_registrations_2DDMK(event_id, alumni_id);

COMMENT ON TABLE alumni_event_registrations_2DDMK IS 'Alumni event registrations and attendance';

-- 3.4 Alumni Donations
CREATE TABLE alumni_donations_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumni_id UUID NOT NULL,
  
  -- Campaign
  campaign_name VARCHAR(255),
  campaign_id UUID, -- Link to fundraising campaigns if tracked
  
  -- Donation Details
  donation_amount DECIMAL(10,2) NOT NULL,
  donation_date DATE DEFAULT CURRENT_DATE,
  donation_purpose VARCHAR(50) CHECK (donation_purpose IN ('Infrastructure', 'Scholarship', 'General', 'Emergency', 'Other')),
  purpose_description TEXT,
  
  -- Payment
  payment_mode VARCHAR(50) CHECK (payment_mode IN ('Online', 'Cheque', 'Bank Transfer', 'Cash')),
  transaction_id VARCHAR(100),
  payment_status VARCHAR(20) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Received', 'Failed')),
  
  -- Tax Receipt
  receipt_number VARCHAR(50) UNIQUE,
  receipt_issued BOOLEAN DEFAULT false,
  receipt_url TEXT,
  
  -- Recognition
  anonymous BOOLEAN DEFAULT false,
  display_on_website BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alumni_donations_alumni ON alumni_donations_2DDMK(alumni_id);
CREATE INDEX idx_alumni_donations_date ON alumni_donations_2DDMK(donation_date);
CREATE INDEX idx_alumni_donations_status ON alumni_donations_2DDMK(payment_status);

COMMENT ON TABLE alumni_donations_2DDMK IS 'Alumni fundraising and donation tracking';

-- 3.5 Alumni Mentorship Program
CREATE TABLE alumni_mentorship_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumni_id UUID NOT NULL,
  student_id UUID NOT NULL,
  
  -- Mentorship Details
  mentorship_area VARCHAR(255) NOT NULL, -- Career guidance, academics, etc.
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Session Tracking
  total_sessions INTEGER DEFAULT 0,
  last_session_date DATE,
  next_session_date DATE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Paused', 'Cancelled')),
  
  -- Feedback
  student_feedback TEXT,
  alumni_feedback TEXT,
  overall_rating DECIMAL(3,2), -- 0-5 scale
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alumni_mentorship_alumni ON alumni_mentorship_2DDMK(alumni_id);
CREATE INDEX idx_alumni_mentorship_student ON alumni_mentorship_2DDMK(student_id);
CREATE INDEX idx_alumni_mentorship_status ON alumni_mentorship_2DDMK(status);

COMMENT ON TABLE alumni_mentorship_2DDMK IS 'Alumni-student mentorship matching and tracking';

-- ============================================================================
-- 4. ADMISSION MANAGEMENT
-- ============================================================================

-- 4.1 Admission Applications
CREATE TABLE admission_applications_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Student Info
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),
  
  -- Contact
  email VARCHAR(255),
  phone VARCHAR(15) NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  
  -- Parent/Guardian
  parent_name VARCHAR(255) NOT NULL,
  parent_phone VARCHAR(15) NOT NULL,
  parent_email VARCHAR(255),
  parent_occupation VARCHAR(255),
  
  -- Admission Details
  applying_for_class VARCHAR(20) NOT NULL,
  preferred_stream VARCHAR(50), -- Science/Commerce/Arts
  academic_year VARCHAR(10) NOT NULL,
  
  -- Previous School
  previous_school_name VARCHAR(255),
  previous_class VARCHAR(20),
  previous_percentage DECIMAL(5,2),
  
  -- Documents
  photo_url TEXT,
  birth_certificate_url TEXT,
  previous_marksheet_url TEXT,
  transfer_certificate_url TEXT,
  aadhar_card_url TEXT,
  other_documents_url TEXT[],
  
  -- Application Fee
  application_fee DECIMAL(10,2) DEFAULT 0,
  fee_paid BOOLEAN DEFAULT false,
  fee_payment_id VARCHAR(100),
  fee_payment_date TIMESTAMP,
  
  -- Status
  status VARCHAR(20) DEFAULT 'Submitted' CHECK (status IN ('Draft', 'Submitted', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected', 'Admitted', 'Cancelled')),
  rejection_reason TEXT,
  
  -- Workflow
  reviewed_by UUID,
  reviewed_at TIMESTAMP,
  
  submission_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admission_applications_number ON admission_applications_2DDMK(application_number);
CREATE INDEX idx_admission_applications_status ON admission_applications_2DDMK(status);
CREATE INDEX idx_admission_applications_class ON admission_applications_2DDMK(applying_for_class);
CREATE INDEX idx_admission_applications_date ON admission_applications_2DDMK(submission_date);

COMMENT ON TABLE admission_applications_2DDMK IS 'Online admission application portal';

-- 4.2 Admission Interviews
CREATE TABLE admission_interviews_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL,
  
  -- Interview Details
  interview_date DATE NOT NULL,
  interview_time TIME NOT NULL,
  interview_mode VARCHAR(20) CHECK (interview_mode IN ('In-Person', 'Online')),
  venue VARCHAR(255),
  meeting_link TEXT,
  
  -- Panel
  interviewer_ids UUID[], -- Array of teacher/admin user IDs
  
  -- Evaluation
  communication_score INTEGER CHECK (communication_score >= 0 AND communication_score <= 10),
  aptitude_score INTEGER CHECK (aptitude_score >= 0 AND aptitude_score <= 10),
  subject_knowledge_score INTEGER CHECK (subject_knowledge_score >= 0 AND subject_knowledge_score <= 10),
  overall_impression TEXT,
  recommendation VARCHAR(20) CHECK (recommendation IN ('Strongly Recommend', 'Recommend', 'Neutral', 'Not Recommend')),
  
  -- Status
  status VARCHAR(20) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Rescheduled', 'Cancelled', 'No Show')),
  
  -- Feedback
  interviewer_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admission_interviews_application ON admission_interviews_2DDMK(application_id);
CREATE INDEX idx_admission_interviews_date ON admission_interviews_2DDMK(interview_date);
CREATE INDEX idx_admission_interviews_status ON admission_interviews_2DDMK(status);

COMMENT ON TABLE admission_interviews_2DDMK IS 'Interview scheduling and evaluation';

-- 4.3 Admission Entrance Tests
CREATE TABLE admission_entrance_tests_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name VARCHAR(255) NOT NULL,
  test_code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Test Details
  for_class VARCHAR(20) NOT NULL,
  academic_year VARCHAR(10) NOT NULL,
  test_date DATE NOT NULL,
  test_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_marks INTEGER NOT NULL,
  passing_marks INTEGER NOT NULL,
  
  -- Question Paper
  question_paper_url TEXT,
  answer_key_url TEXT,
  
  -- Venue
  venue VARCHAR(255),
  is_online BOOLEAN DEFAULT false,
  
  -- Status
  status VARCHAR(20) DEFAULT 'Scheduled' CHECK (status IN ('Draft', 'Scheduled', 'Ongoing', 'Completed', 'Cancelled')),
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admission_entrance_tests_date ON admission_entrance_tests_2DDMK(test_date);
CREATE INDEX idx_admission_entrance_tests_class ON admission_entrance_tests_2DDMK(for_class);
CREATE INDEX idx_admission_entrance_tests_status ON admission_entrance_tests_2DDMK(status);

COMMENT ON TABLE admission_entrance_tests_2DDMK IS 'Entrance test configuration';

-- 4.4 Admission Test Results
CREATE TABLE admission_test_results_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL,
  application_id UUID NOT NULL,
  
  -- Results
  marks_obtained DECIMAL(5,2) NOT NULL,
  percentage DECIMAL(5,2),
  rank INTEGER,
  result_status VARCHAR(20) CHECK (result_status IN ('Pass', 'Fail', 'Absent')),
  
  -- Answer Sheet
  answer_sheet_url TEXT,
  
  -- Published
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admission_test_results_test ON admission_test_results_2DDMK(test_id);
CREATE INDEX idx_admission_test_results_application ON admission_test_results_2DDMK(application_id);
CREATE INDEX idx_admission_test_results_rank ON admission_test_results_2DDMK(rank);
CREATE UNIQUE INDEX idx_admission_test_results_unique ON admission_test_results_2DDMK(test_id, application_id);

COMMENT ON TABLE admission_test_results_2DDMK IS 'Entrance test results and ranking';

-- 4.5 Admission Merit List
CREATE TABLE admission_merit_list_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL,
  for_class VARCHAR(20) NOT NULL,
  academic_year VARCHAR(10) NOT NULL,
  
  -- Merit Calculation
  entrance_test_marks DECIMAL(5,2),
  entrance_test_weightage DECIMAL(3,2) DEFAULT 0.60, -- 60%
  previous_academic_percentage DECIMAL(5,2),
  previous_academic_weightage DECIMAL(3,2) DEFAULT 0.30, -- 30%
  interview_score DECIMAL(5,2),
  interview_weightage DECIMAL(3,2) DEFAULT 0.10, -- 10%
  
  total_score DECIMAL(5,2) NOT NULL,
  merit_rank INTEGER NOT NULL,
  
  -- Seat Allocation
  seat_allocated BOOLEAN DEFAULT false,
  allocated_section VARCHAR(10),
  allocation_date DATE,
  
  -- Admission Confirmation
  admission_confirmed BOOLEAN DEFAULT false,
  confirmation_date DATE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'Merit List' CHECK (status IN ('Merit List', 'Waitlist', 'Not Qualified', 'Admitted')),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admission_merit_list_application ON admission_merit_list_2DDMK(application_id);
CREATE INDEX idx_admission_merit_list_class ON admission_merit_list_2DDMK(for_class);
CREATE INDEX idx_admission_merit_list_rank ON admission_merit_list_2DDMK(merit_rank);
CREATE INDEX idx_admission_merit_list_status ON admission_merit_list_2DDMK(status);

COMMENT ON TABLE admission_merit_list_2DDMK IS 'Final merit list and seat allocation';

-- ============================================================================
-- 5. INVENTORY & ASSET MANAGEMENT
-- ============================================================================

-- 5.1 Assets
CREATE TABLE assets_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_code VARCHAR(50) UNIQUE NOT NULL,
  asset_name VARCHAR(255) NOT NULL,
  
  -- Classification
  asset_category VARCHAR(50) CHECK (asset_category IN ('Furniture', 'IT Equipment', 'Lab Equipment', 'Sports Equipment', 'Vehicle', 'Other')),
  asset_type VARCHAR(100), -- Chair, Laptop, Microscope, etc.
  
  -- Details
  description TEXT,
  manufacturer VARCHAR(255),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  
  -- Financial
  purchase_date DATE,
  purchase_cost DECIMAL(10,2),
  current_value DECIMAL(10,2),
  depreciation_rate DECIMAL(5,2), -- Annual %
  useful_life_years INTEGER,
  
  -- Location
  assigned_to_department VARCHAR(100),
  assigned_to_room VARCHAR(100),
  assigned_to_user UUID, -- Teacher/Staff
  
  -- Condition
  condition_status VARCHAR(20) DEFAULT 'Good' CHECK (condition_status IN ('Excellent', 'Good', 'Fair', 'Poor', 'Damaged')),
  
  -- Documents
  invoice_url TEXT,
  warranty_document_url TEXT,
  warranty_expiry DATE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Under Maintenance', 'Retired', 'Sold', 'Donated', 'Lost')),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_assets_code ON assets_2DDMK(asset_code);
CREATE INDEX idx_assets_category ON assets_2DDMK(asset_category);
CREATE INDEX idx_assets_status ON assets_2DDMK(status);
CREATE INDEX idx_assets_assigned_user ON assets_2DDMK(assigned_to_user);

COMMENT ON TABLE assets_2DDMK IS 'School asset master (furniture, equipment, IT assets)';

-- 5.2 Asset Maintenance
CREATE TABLE asset_maintenance_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL,
  
  -- Maintenance Details
  maintenance_type VARCHAR(50) CHECK (maintenance_type IN ('Preventive', 'Corrective', 'Emergency', 'Inspection')),
  maintenance_date DATE NOT NULL,
  next_maintenance_date DATE,
  
  -- Issue & Resolution
  issue_description TEXT,
  resolution_description TEXT,
  
  -- Service Provider
  vendor_name VARCHAR(255),
  vendor_contact VARCHAR(15),
  technician_name VARCHAR(255),
  
  -- Cost
  maintenance_cost DECIMAL(10,2),
  parts_replaced TEXT[],
  
  -- Downtime
  downtime_hours DECIMAL(5,2),
  
  -- Status
  status VARCHAR(20) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')),
  
  performed_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_asset_maintenance_asset ON asset_maintenance_2DDMK(asset_id);
CREATE INDEX idx_asset_maintenance_date ON asset_maintenance_2DDMK(maintenance_date);
CREATE INDEX idx_asset_maintenance_status ON asset_maintenance_2DDMK(status);

COMMENT ON TABLE asset_maintenance_2DDMK IS 'Asset maintenance schedule and history';

-- 5.3 Lab Equipment
CREATE TABLE lab_equipment_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID, -- Link to main assets table if applicable
  equipment_code VARCHAR(50) UNIQUE NOT NULL,
  equipment_name VARCHAR(255) NOT NULL,
  
  -- Lab Info
  lab_name VARCHAR(100) NOT NULL, -- Physics Lab, Chemistry Lab, Computer Lab
  lab_room VARCHAR(50),
  
  -- Equipment Details
  equipment_type VARCHAR(100), -- Microscope, Beaker, Thermometer, Computer, etc.
  quantity INTEGER DEFAULT 1,
  unit_of_measurement VARCHAR(20), -- Piece, Set, Box
  
  -- Specifications
  specifications TEXT,
  model VARCHAR(100),
  manufacturer VARCHAR(255),
  
  -- Financial
  purchase_date DATE,
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  
  -- Status
  working_quantity INTEGER,
  damaged_quantity INTEGER DEFAULT 0,
  condition_status VARCHAR(20) DEFAULT 'Good' CHECK (condition_status IN ('Excellent', 'Good', 'Fair', 'Poor', 'Not Working')),
  
  -- Safety
  requires_safety_training BOOLEAN DEFAULT false,
  safety_precautions TEXT,
  
  -- Calibration (for instruments)
  last_calibration_date DATE,
  next_calibration_date DATE,
  calibration_certificate_url TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lab_equipment_code ON lab_equipment_2DDMK(equipment_code);
CREATE INDEX idx_lab_equipment_lab ON lab_equipment_2DDMK(lab_name);
CREATE INDEX idx_lab_equipment_type ON lab_equipment_2DDMK(equipment_type);

COMMENT ON TABLE lab_equipment_2DDMK IS 'Lab-specific equipment inventory';

-- 5.4 Lab Chemicals & Specimens
CREATE TABLE lab_chemicals_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chemical_code VARCHAR(50) UNIQUE NOT NULL,
  chemical_name VARCHAR(255) NOT NULL,
  
  -- Classification
  chemical_type VARCHAR(50) CHECK (chemical_type IN ('Acid', 'Base', 'Salt', 'Organic', 'Inorganic', 'Specimen', 'Other')),
  cas_number VARCHAR(50), -- Chemical Abstracts Service number
  
  -- Lab Info
  lab_name VARCHAR(100) NOT NULL,
  storage_location VARCHAR(100), -- Cupboard/Shelf number
  
  -- Quantity
  current_quantity DECIMAL(10,3),
  unit VARCHAR(20), -- ml, grams, pieces
  minimum_quantity DECIMAL(10,3), -- Reorder level
  maximum_quantity DECIMAL(10,3),
  
  -- Safety
  hazard_class VARCHAR(50), -- Flammable, Corrosive, Toxic, etc.
  safety_precautions TEXT NOT NULL,
  msds_url TEXT, -- Material Safety Data Sheet
  
  -- Storage Requirements
  storage_temperature VARCHAR(50),
  special_storage_requirements TEXT,
  
  -- Expiry
  expiry_date DATE,
  is_expired BOOLEAN DEFAULT false,
  
  -- Status
  status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'Low Stock', 'Out of Stock', 'Expired', 'Disposed')),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lab_chemicals_code ON lab_chemicals_2DDMK(chemical_code);
CREATE INDEX idx_lab_chemicals_lab ON lab_chemicals_2DDMK(lab_name);
CREATE INDEX idx_lab_chemicals_status ON lab_chemicals_2DDMK(status);
CREATE INDEX idx_lab_chemicals_expiry ON lab_chemicals_2DDMK(expiry_date);

COMMENT ON TABLE lab_chemicals_2DDMK IS 'Chemical and specimen inventory with safety tracking';

-- 5.5 Stationery Items
CREATE TABLE stationery_items_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code VARCHAR(50) UNIQUE NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  item_category VARCHAR(50) CHECK (item_category IN ('Office Supplies', 'Writing Materials', 'Paper', 'Files & Folders', 'Art Supplies', 'Other')),
  
  -- Stock Details
  current_stock INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 10,
  maximum_stock INTEGER,
  unit VARCHAR(20), -- Piece, Box, Ream, Packet
  
  -- Pricing
  unit_cost DECIMAL(10,2),
  last_purchase_date DATE,
  preferred_vendor VARCHAR(255),
  
  -- Status
  status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'Low Stock', 'Out of Stock')),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stationery_items_code ON stationery_items_2DDMK(item_code);
CREATE INDEX idx_stationery_items_category ON stationery_items_2DDMK(item_category);
CREATE INDEX idx_stationery_items_status ON stationery_items_2DDMK(status);

COMMENT ON TABLE stationery_items_2DDMK IS 'Stationery stock master';

-- 5.6 Stationery Transactions
CREATE TABLE stationery_transactions_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL,
  
  -- Transaction Details
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('Purchase', 'Issue', 'Return', 'Damage', 'Adjustment')),
  transaction_date DATE DEFAULT CURRENT_DATE,
  quantity INTEGER NOT NULL,
  
  -- Issued To (if applicable)
  issued_to_user_id UUID, -- Teacher/Staff
  issued_to_department VARCHAR(100),
  
  -- Purchase Details (if applicable)
  vendor_name VARCHAR(255),
  invoice_number VARCHAR(50),
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  
  -- Return/Damage
  return_reason TEXT,
  damage_description TEXT,
  
  -- Remarks
  remarks TEXT,
  
  -- Approval
  approved_by UUID,
  approved_at TIMESTAMP,
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stationery_transactions_item ON stationery_transactions_2DDMK(item_id);
CREATE INDEX idx_stationery_transactions_type ON stationery_transactions_2DDMK(transaction_type);
CREATE INDEX idx_stationery_transactions_date ON stationery_transactions_2DDMK(transaction_date);
CREATE INDEX idx_stationery_transactions_user ON stationery_transactions_2DDMK(issued_to_user_id);

COMMENT ON TABLE stationery_transactions_2DDMK IS 'Stationery issue, return, and purchase tracking';

-- ============================================================================
-- 6. CERTIFICATE & DOCUMENT GENERATION
-- ============================================================================

-- 6.1 Certificate Templates
CREATE TABLE certificate_templates_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(255) NOT NULL,
  template_code VARCHAR(50) UNIQUE NOT NULL,
  certificate_type VARCHAR(50) CHECK (certificate_type IN ('Transfer Certificate', 'Bonafide Certificate', 'Character Certificate', 'Study Certificate', 'Leaving Certificate', 'Custom')),
  
  -- Template Design
  template_html TEXT NOT NULL,
  template_css TEXT,
  letterhead_url TEXT,
  
  -- Fields/Placeholders
  dynamic_fields JSONB, -- {student_name, class, roll_number, etc.}
  
  -- Signature
  principal_signature_url TEXT,
  digital_signature_enabled BOOLEAN DEFAULT false,
  
  -- Localization
  language VARCHAR(20) DEFAULT 'English',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_certificate_templates_code ON certificate_templates_2DDMK(template_code);
CREATE INDEX idx_certificate_templates_type ON certificate_templates_2DDMK(certificate_type);
CREATE INDEX idx_certificate_templates_active ON certificate_templates_2DDMK(is_active);

COMMENT ON TABLE certificate_templates_2DDMK IS 'Certificate templates with custom design';

-- 6.2 Certificate Requests
CREATE TABLE certificate_requests_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Requester
  student_id UUID NOT NULL,
  requested_by_user_id UUID NOT NULL, -- Student or Parent
  
  -- Certificate Details
  certificate_type VARCHAR(50) NOT NULL,
  template_id UUID,
  purpose TEXT, -- Why certificate is needed
  
  -- Additional Info
  number_of_copies INTEGER DEFAULT 1,
  delivery_mode VARCHAR(20) CHECK (delivery_mode IN ('Physical', 'Digital', 'Both')),
  delivery_address TEXT,
  
  -- Workflow
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Under Review', 'Approved', 'Rejected', 'Generated', 'Delivered')),
  reviewed_by UUID,
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,
  
  -- Generated Certificate
  certificate_number VARCHAR(50),
  generation_date DATE,
  certificate_url TEXT,
  
  -- Fees (if applicable)
  certificate_fee DECIMAL(10,2) DEFAULT 0,
  fee_paid BOOLEAN DEFAULT false,
  
  request_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_certificate_requests_number ON certificate_requests_2DDMK(request_number);
CREATE INDEX idx_certificate_requests_student ON certificate_requests_2DDMK(student_id);
CREATE INDEX idx_certificate_requests_status ON certificate_requests_2DDMK(status);
CREATE INDEX idx_certificate_requests_type ON certificate_requests_2DDMK(certificate_type);

COMMENT ON TABLE certificate_requests_2DDMK IS 'Certificate request and approval workflow';

-- 6.3 Generated Certificates
CREATE TABLE generated_certificates_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  request_id UUID,
  
  -- Certificate Details
  student_id UUID NOT NULL,
  certificate_type VARCHAR(50) NOT NULL,
  template_id UUID NOT NULL,
  
  -- Content
  certificate_data JSONB NOT NULL, -- All populated field values
  certificate_pdf_url TEXT NOT NULL,
  
  -- Signature & Verification
  digital_signature TEXT,
  qr_code_url TEXT, -- For verification
  verification_url TEXT,
  
  -- Issued By
  issued_by_user_id UUID NOT NULL,
  issue_date DATE DEFAULT CURRENT_DATE,
  
  -- Validity
  valid_until DATE,
  is_valid BOOLEAN DEFAULT true,
  
  -- Tracking
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_generated_certificates_number ON generated_certificates_2DDMK(certificate_number);
CREATE INDEX idx_generated_certificates_student ON generated_certificates_2DDMK(student_id);
CREATE INDEX idx_generated_certificates_type ON generated_certificates_2DDMK(certificate_type);
CREATE INDEX idx_generated_certificates_request ON generated_certificates_2DDMK(request_id);

COMMENT ON TABLE generated_certificates_2DDMK IS 'Issued certificate log with digital signature';

-- ============================================================================
-- 7. ADVANCED FEE MANAGEMENT (ONLINE PAYMENTS)
-- ============================================================================

-- 7.1 Online Payment Transactions
CREATE TABLE online_payment_transactions_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  
  -- Payment Gateway
  gateway VARCHAR(50) CHECK (gateway IN ('Razorpay', 'Paytm', 'PhonePe', 'Stripe', 'PayU', 'Other')),
  gateway_transaction_id VARCHAR(100) UNIQUE,
  gateway_order_id VARCHAR(100),
  
  -- Payer
  student_id UUID NOT NULL,
  paid_by_user_id UUID NOT NULL, -- Parent or Student
  payer_name VARCHAR(255),
  payer_email VARCHAR(255),
  payer_phone VARCHAR(15),
  
  -- Amount
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  gateway_fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2),
  
  -- Payment Details
  payment_method VARCHAR(50), -- UPI, Card, Net Banking, Wallet
  card_type VARCHAR(20), -- Visa, Mastercard, etc.
  
  -- Fee Mapping
  fee_payment_id UUID, -- Link to fee_payments table
  fee_component VARCHAR(100), -- Tuition, Transport, etc.
  
  -- Status
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Success', 'Failed', 'Refunded')),
  
  -- Timestamps
  initiated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  -- Gateway Response
  gateway_response JSONB,
  failure_reason TEXT,
  
  -- Receipt
  receipt_number VARCHAR(50),
  receipt_url TEXT,
  receipt_sent BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_online_payment_transactions_id ON online_payment_transactions_2DDMK(transaction_id);
CREATE INDEX idx_online_payment_transactions_gateway_id ON online_payment_transactions_2DDMK(gateway_transaction_id);
CREATE INDEX idx_online_payment_transactions_student ON online_payment_transactions_2DDMK(student_id);
CREATE INDEX idx_online_payment_transactions_status ON online_payment_transactions_2DDMK(status);
CREATE INDEX idx_online_payment_transactions_date ON online_payment_transactions_2DDMK(initiated_at);

COMMENT ON TABLE online_payment_transactions_2DDMK IS 'Payment gateway transaction tracking';

-- 7.2 Payment Gateway Logs
CREATE TABLE payment_gateway_logs_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL,
  
  -- Event Details
  event_type VARCHAR(50), -- payment.success, payment.failed, refund.processed, etc.
  event_timestamp TIMESTAMP DEFAULT NOW(),
  
  -- Gateway Data
  gateway_event_id VARCHAR(100),
  webhook_payload JSONB,
  
  -- Reconciliation
  is_reconciled BOOLEAN DEFAULT false,
  reconciled_at TIMESTAMP,
  reconciliation_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payment_gateway_logs_transaction ON payment_gateway_logs_2DDMK(transaction_id);
CREATE INDEX idx_payment_gateway_logs_event ON payment_gateway_logs_2DDMK(event_type);
CREATE INDEX idx_payment_gateway_logs_reconciled ON payment_gateway_logs_2DDMK(is_reconciled);

COMMENT ON TABLE payment_gateway_logs_2DDMK IS 'Payment gateway webhook logs for reconciliation';

-- 7.3 Fee Refunds
CREATE TABLE fee_refunds_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  refund_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Student & Payment
  student_id UUID NOT NULL,
  original_payment_id UUID, -- Link to fee_payments or online_payment_transactions
  original_transaction_id VARCHAR(100),
  
  -- Refund Details
  refund_amount DECIMAL(10,2) NOT NULL,
  refund_reason TEXT NOT NULL,
  refund_type VARCHAR(50) CHECK (refund_type IN ('Full Refund', 'Partial Refund', 'Fee Adjustment')),
  
  -- Workflow
  requested_by UUID NOT NULL,
  request_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Processed', 'Completed')),
  
  -- Approval
  approved_by UUID,
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  
  -- Processing
  refund_mode VARCHAR(50) CHECK (refund_mode IN ('Bank Transfer', 'Cash', 'Cheque', 'Gateway Refund', 'Account Adjustment')),
  bank_account_number VARCHAR(50),
  ifsc_code VARCHAR(11),
  bank_transaction_id VARCHAR(100),
  gateway_refund_id VARCHAR(100),
  
  refund_processed_date DATE,
  processed_by UUID,
  
  -- Accounting
  account_adjustment_id UUID,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fee_refunds_number ON fee_refunds_2DDMK(refund_number);
CREATE INDEX idx_fee_refunds_student ON fee_refunds_2DDMK(student_id);
CREATE INDEX idx_fee_refunds_status ON fee_refunds_2DDMK(status);
CREATE INDEX idx_fee_refunds_date ON fee_refunds_2DDMK(request_date);

COMMENT ON TABLE fee_refunds_2DDMK IS 'Fee refund request and processing workflow';

-- ============================================================================
-- 8. SURVEY & FEEDBACK SYSTEM
-- ============================================================================

-- 8.1 Surveys
CREATE TABLE surveys_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_title VARCHAR(255) NOT NULL,
  survey_description TEXT,
  survey_type VARCHAR(50) CHECK (survey_type IN ('Teacher Feedback', 'Course Feedback', 'Infrastructure Feedback', 'Event Feedback', 'General Survey', 'Custom')),
  
  -- Target Audience
  target_audience VARCHAR(50) CHECK (target_audience IN ('Students', 'Teachers', 'Parents', 'Staff', 'All')),
  target_classes INTEGER[], -- Array of class IDs
  target_sections UUID[], -- Array of section IDs
  
  -- Survey Settings
  is_anonymous BOOLEAN DEFAULT false,
  allow_multiple_responses BOOLEAN DEFAULT false,
  is_mandatory BOOLEAN DEFAULT false,
  
  -- Schedule
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'Closed', 'Archived')),
  
  -- Results
  total_responses INTEGER DEFAULT 0,
  
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_surveys_type ON surveys_2DDMK(survey_type);
CREATE INDEX idx_surveys_status ON surveys_2DDMK(status);
CREATE INDEX idx_surveys_dates ON surveys_2DDMK(start_date, end_date);

COMMENT ON TABLE surveys_2DDMK IS 'Survey builder and configuration';

-- 8.2 Survey Questions
CREATE TABLE survey_questions_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL,
  
  -- Question Details
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) CHECK (question_type IN ('Multiple Choice', 'Single Choice', 'Rating Scale', 'Text Short', 'Text Long', 'Yes/No', 'Matrix')),
  
  -- Options (for choice questions)
  options JSONB, -- ['Option 1', 'Option 2', 'Option 3']
  
  -- Rating Scale (if applicable)
  rating_scale_min INTEGER,
  rating_scale_max INTEGER,
  rating_labels JSONB, -- {1: 'Poor', 5: 'Excellent'}
  
  -- Validation
  is_required BOOLEAN DEFAULT false,
  
  -- Display
  display_order INTEGER NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_survey_questions_survey ON survey_questions_2DDMK(survey_id);
CREATE INDEX idx_survey_questions_order ON survey_questions_2DDMK(survey_id, display_order);

COMMENT ON TABLE survey_questions_2DDMK IS 'Survey questions with multiple types';

-- 8.3 Survey Responses
CREATE TABLE survey_responses_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL,
  question_id UUID NOT NULL,
  
  -- Respondent
  respondent_user_id UUID, -- NULL if anonymous
  respondent_type VARCHAR(50), -- Student, Teacher, Parent
  
  -- Response
  response_text TEXT,
  response_choice VARCHAR(255),
  response_choices TEXT[], -- For multiple choice
  response_rating INTEGER,
  
  -- Metadata
  submitted_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_survey_responses_survey ON survey_responses_2DDMK(survey_id);
CREATE INDEX idx_survey_responses_question ON survey_responses_2DDMK(question_id);
CREATE INDEX idx_survey_responses_user ON survey_responses_2DDMK(respondent_user_id);

COMMENT ON TABLE survey_responses_2DDMK IS 'Survey response submissions';

-- 8.4 Feedback Analytics
CREATE TABLE feedback_analytics_2DDMK (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL,
  
  -- Response Statistics
  total_responses INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2),
  average_completion_time_seconds INTEGER,
  
  -- Sentiment Analysis (if applicable)
  overall_sentiment VARCHAR(20), -- Positive, Neutral, Negative
  sentiment_score DECIMAL(3,2), -- -1 to 1
  
  -- Key Insights
  top_positive_feedback TEXT[],
  top_negative_feedback TEXT[],
  common_themes TEXT[],
  
  -- Action Items
  action_items TEXT[],
  priority_areas TEXT[],
  
  -- Analysis Details
  analyzed_at TIMESTAMP DEFAULT NOW(),
  analyzed_by UUID,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_feedback_analytics_survey ON feedback_analytics_2DDMK(survey_id);
CREATE INDEX idx_feedback_analytics_sentiment ON feedback_analytics_2DDMK(overall_sentiment);

COMMENT ON TABLE feedback_analytics_2DDMK IS 'Survey analytics and sentiment analysis';

-- ============================================================================
-- 9. FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- AI Analytics Module
ALTER TABLE analytics_student_performance_2DDMK ADD CONSTRAINT fk_analytics_student_performance_student FOREIGN KEY (student_id) REFERENCES students_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE analytics_student_performance_2DDMK ADD CONSTRAINT fk_analytics_student_performance_year FOREIGN KEY (academic_year_id) REFERENCES academic_years_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE analytics_student_performance_2DDMK ADD CONSTRAINT fk_analytics_student_performance_subject FOREIGN KEY (subject_id) REFERENCES subjects_2DDMK(id) ON DELETE SET NULL;
ALTER TABLE analytics_attendance_patterns_2DDMK ADD CONSTRAINT fk_analytics_attendance_patterns_student FOREIGN KEY (student_id) REFERENCES students_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE analytics_attendance_patterns_2DDMK ADD CONSTRAINT fk_analytics_attendance_patterns_year FOREIGN KEY (academic_year_id) REFERENCES academic_years_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE analytics_academic_trends_2DDMK ADD CONSTRAINT fk_analytics_academic_trends_class FOREIGN KEY (class_id) REFERENCES classes_2DDMK(id) ON DELETE SET NULL;
ALTER TABLE analytics_academic_trends_2DDMK ADD CONSTRAINT fk_analytics_academic_trends_section FOREIGN KEY (section_id) REFERENCES sections_2DDMK(id) ON DELETE SET NULL;
ALTER TABLE analytics_academic_trends_2DDMK ADD CONSTRAINT fk_analytics_academic_trends_subject FOREIGN KEY (subject_id) REFERENCES subjects_2DDMK(id) ON DELETE SET NULL;
ALTER TABLE analytics_academic_trends_2DDMK ADD CONSTRAINT fk_analytics_academic_trends_teacher FOREIGN KEY (teacher_id) REFERENCES teachers_2DDMK(id) ON DELETE SET NULL;
ALTER TABLE analytics_academic_trends_2DDMK ADD CONSTRAINT fk_analytics_academic_trends_year FOREIGN KEY (academic_year_id) REFERENCES academic_years_2DDMK(id) ON DELETE CASCADE;

-- PTM Module
ALTER TABLE ptm_slots_2DDMK ADD CONSTRAINT fk_ptm_slots_teacher FOREIGN KEY (teacher_id) REFERENCES teachers_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE ptm_bookings_2DDMK ADD CONSTRAINT fk_ptm_bookings_slot FOREIGN KEY (slot_id) REFERENCES ptm_slots_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE ptm_bookings_2DDMK ADD CONSTRAINT fk_ptm_bookings_student FOREIGN KEY (student_id) REFERENCES students_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE ptm_bookings_2DDMK ADD CONSTRAINT fk_ptm_bookings_parent FOREIGN KEY (parent_user_id) REFERENCES users_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE ptm_meeting_notes_2DDMK ADD CONSTRAINT fk_ptm_meeting_notes_booking FOREIGN KEY (booking_id) REFERENCES ptm_bookings_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE ptm_meeting_notes_2DDMK ADD CONSTRAINT fk_ptm_meeting_notes_teacher FOREIGN KEY (teacher_id) REFERENCES teachers_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE ptm_meeting_notes_2DDMK ADD CONSTRAINT fk_ptm_meeting_notes_student FOREIGN KEY (student_id) REFERENCES students_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE ptm_meeting_notes_2DDMK ADD CONSTRAINT fk_ptm_meeting_notes_recorded_by FOREIGN KEY (recorded_by) REFERENCES users_2DDMK(id) ON DELETE SET NULL;

-- Alumni Module
ALTER TABLE alumni_2DDMK ADD CONSTRAINT fk_alumni_user FOREIGN KEY (user_id) REFERENCES users_2DDMK(id) ON DELETE SET NULL;
ALTER TABLE alumni_2DDMK ADD CONSTRAINT fk_alumni_student FOREIGN KEY (student_id) REFERENCES students_2DDMK(id) ON DELETE SET NULL;
ALTER TABLE alumni_events_2DDMK ADD CONSTRAINT fk_alumni_events_created_by FOREIGN KEY (created_by) REFERENCES users_2DDMK(id) ON DELETE SET NULL;
ALTER TABLE alumni_event_registrations_2DDMK ADD CONSTRAINT fk_alumni_event_registrations_event FOREIGN KEY (event_id) REFERENCES alumni_events_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE alumni_event_registrations_2DDMK ADD CONSTRAINT fk_alumni_event_registrations_alumni FOREIGN KEY (alumni_id) REFERENCES alumni_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE alumni_donations_2DDMK ADD CONSTRAINT fk_alumni_donations_alumni FOREIGN KEY (alumni_id) REFERENCES alumni_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE alumni_mentorship_2DDMK ADD CONSTRAINT fk_alumni_mentorship_alumni FOREIGN KEY (alumni_id) REFERENCES alumni_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE alumni_mentorship_2DDMK ADD CONSTRAINT fk_alumni_mentorship_student FOREIGN KEY (student_id) REFERENCES students_2DDMK(id) ON DELETE CASCADE;

-- Admission Module
ALTER TABLE admission_applications_2DDMK ADD CONSTRAINT fk_admission_applications_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users_2DDMK(id) ON DELETE SET NULL;
ALTER TABLE admission_interviews_2DDMK ADD CONSTRAINT fk_admission_interviews_application FOREIGN KEY (application_id) REFERENCES admission_applications_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE admission_entrance_tests_2DDMK ADD CONSTRAINT fk_admission_entrance_tests_created_by FOREIGN KEY (created_by) REFERENCES users_2DDMK(id) ON DELETE SET NULL;
ALTER TABLE admission_test_results_2DDMK ADD CONSTRAINT fk_admission_test_results_test FOREIGN KEY (test_id) REFERENCES admission_entrance_tests_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE admission_test_results_2DDMK ADD CONSTRAINT fk_admission_test_results_application FOREIGN KEY (application_id) REFERENCES admission_applications_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE admission_merit_list_2DDMK ADD CONSTRAINT fk_admission_merit_list_application FOREIGN KEY (application_id) REFERENCES admission_applications_2DDMK(id) ON DELETE CASCADE;

-- Asset Management Module
ALTER TABLE assets_2DDMK ADD CONSTRAINT fk_assets_assigned_user FOREIGN KEY (assigned_to_user) REFERENCES users_2DDMK(id) ON DELETE SET NULL;
ALTER TABLE asset_maintenance_2DDMK ADD CONSTRAINT fk_asset_maintenance_asset FOREIGN KEY (asset_id) REFERENCES assets_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE asset_maintenance_2DDMK ADD CONSTRAINT fk_asset_maintenance_performed_by FOREIGN KEY (performed_by) REFERENCES users_2DDMK(id) ON DELETE SET NULL;
ALTER TABLE lab_equipment_2DDMK ADD CONSTRAINT fk_lab_equipment_asset FOREIGN KEY (asset_id) REFERENCES assets_2DDMK(id) ON DELETE SET NULL;
ALTER TABLE stationery_transactions_2DDMK ADD CONSTRAINT fk_stationery_transactions_item FOREIGN KEY (item_id) REFERENCES stationery_items_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE stationery_transactions_2DDMK ADD CONSTRAINT fk_stationery_transactions_issued_to FOREIGN KEY (issued_to_user_id) REFERENCES users_2DDMK(id) ON DELETE SET NULL;
ALTER TABLE stationery_transactions_2DDMK ADD CONSTRAINT fk_stationery_transactions_approved_by FOREIGN KEY (approved_by) REFERENCES users_2DDMK(id) ON DELETE SET NULL;
ALTER TABLE stationery_transactions_2DDMK ADD CONSTRAINT fk_stationery_transactions_created_by FOREIGN KEY (created_by) REFERENCES users_2DDMK(id) ON DELETE SET NULL;

-- Certificate Module
ALTER TABLE certificate_templates_2DDMK ADD CONSTRAINT fk_certificate_templates_created_by FOREIGN KEY (created_by) REFERENCES users_2DDMK(id) ON DELETE SET NULL;
ALTER TABLE certificate_requests_2DDMK ADD CONSTRAINT fk_certificate_requests_student FOREIGN KEY (student_id) REFERENCES students_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE certificate_requests_2DDMK ADD CONSTRAINT fk_certificate_requests_requested_by FOREIGN KEY (requested_by_user_id) REFERENCES users_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE certificate_requests_2DDMK ADD CONSTRAINT fk_certificate_requests_template FOREIGN KEY (template_id) REFERENCES certificate_templates_2DDMK(id) ON DELETE SET NULL;
ALTER TABLE certificate_requests_2DDMK ADD CONSTRAINT fk_certificate_requests_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users_2DDMK(id) ON DELETE SET NULL;
ALTER TABLE generated_certificates_2DDMK ADD CONSTRAINT fk_generated_certificates_request FOREIGN KEY (request_id) REFERENCES certificate_requests_2DDMK(id) ON DELETE SET NULL;
ALTER TABLE generated_certificates_2DDMK ADD CONSTRAINT fk_generated_certificates_student FOREIGN KEY (student_id) REFERENCES students_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE generated_certificates_2DDMK ADD CONSTRAINT fk_generated_certificates_template FOREIGN KEY (template_id) REFERENCES certificate_templates_2DDMK(id) ON DELETE RESTRICT;
ALTER TABLE generated_certificates_2DDMK ADD CONSTRAINT fk_generated_certificates_issued_by FOREIGN KEY (issued_by_user_id) REFERENCES users_2DDMK(id) ON DELETE SET NULL;

-- Online Payment Module
ALTER TABLE online_payment_transactions_2DDMK ADD CONSTRAINT fk_online_payment_transactions_student FOREIGN KEY (student_id) REFERENCES students_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE online_payment_transactions_2DDMK ADD CONSTRAINT fk_online_payment_transactions_paid_by FOREIGN KEY (paid_by_user_id) REFERENCES users_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE online_payment_transactions_2DDMK ADD CONSTRAINT fk_online_payment_transactions_fee_payment FOREIGN KEY (fee_payment_id) REFERENCES fee_payments_2DDMK(id) ON DELETE SET NULL;
ALTER TABLE payment_gateway_logs_2DDMK ADD CONSTRAINT fk_payment_gateway_logs_transaction FOREIGN KEY (transaction_id) REFERENCES online_payment_transactions_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE fee_refunds_2DDMK ADD CONSTRAINT fk_fee_refunds_student FOREIGN KEY (student_id) REFERENCES students_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE fee_refunds_2DDMK ADD CONSTRAINT fk_fee_refunds_payment FOREIGN KEY (original_payment_id) REFERENCES fee_payments_2DDMK(id) ON DELETE SET NULL;
ALTER TABLE fee_refunds_2DDMK ADD CONSTRAINT fk_fee_refunds_requested_by FOREIGN KEY (requested_by) REFERENCES users_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE fee_refunds_2DDMK ADD CONSTRAINT fk_fee_refunds_approved_by FOREIGN KEY (approved_by) REFERENCES users_2DDMK(id) ON DELETE SET NULL;
ALTER TABLE fee_refunds_2DDMK ADD CONSTRAINT fk_fee_refunds_processed_by FOREIGN KEY (processed_by) REFERENCES users_2DDMK(id) ON DELETE SET NULL;

-- Survey Module
ALTER TABLE surveys_2DDMK ADD CONSTRAINT fk_surveys_created_by FOREIGN KEY (created_by) REFERENCES users_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE survey_questions_2DDMK ADD CONSTRAINT fk_survey_questions_survey FOREIGN KEY (survey_id) REFERENCES surveys_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE survey_responses_2DDMK ADD CONSTRAINT fk_survey_responses_survey FOREIGN KEY (survey_id) REFERENCES surveys_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE survey_responses_2DDMK ADD CONSTRAINT fk_survey_responses_question FOREIGN KEY (question_id) REFERENCES survey_questions_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE survey_responses_2DDMK ADD CONSTRAINT fk_survey_responses_user FOREIGN KEY (respondent_user_id) REFERENCES users_2DDMK(id) ON DELETE SET NULL;
ALTER TABLE feedback_analytics_2DDMK ADD CONSTRAINT fk_feedback_analytics_survey FOREIGN KEY (survey_id) REFERENCES surveys_2DDMK(id) ON DELETE CASCADE;
ALTER TABLE feedback_analytics_2DDMK ADD CONSTRAINT fk_feedback_analytics_analyzed_by FOREIGN KEY (analyzed_by) REFERENCES users_2DDMK(id) ON DELETE SET NULL;

-- ============================================================================
-- END OF TIER 3 SCHEMA FOR School 2
-- ============================================================================
-- Total Tables: 32 | Total Foreign Keys: 73
-- ============================================================================
-- Total Tables Added: 37
-- 
-- TIER 3 Features Covered:
-- ✓ AI-Powered Analytics (3 tables)
-- ✓ Parent-Teacher Meeting (3 tables)
-- ✓ Alumni Management (5 tables)
-- ✓ Admission Management (5 tables)
-- ✓ Inventory & Asset Management (6 tables)
-- ✓ Certificate & Document Generation (3 tables)
-- ✓ Advanced Fee Management (3 tables)
-- ✓ Survey & Feedback System (4 tables)
-- ============================================================================
