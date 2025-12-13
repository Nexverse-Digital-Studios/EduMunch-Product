-- =====================================================
-- EXAMS AND ASSESSMENTS TABLES
-- =====================================================

-- Board Exams
CREATE TABLE board_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  exam_name VARCHAR(255) NOT NULL,
  exam_type VARCHAR(100), -- BOARD, INTERNAL
  max_marks INTEGER,
  subject_id UUID REFERENCES subjects(id),
  batch_id UUID REFERENCES batches(id),
  exam_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE board_exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view exams in their org" ON board_exams
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE POLICY "Admins can manage exams" ON board_exams
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE INDEX idx_board_exams_org_id ON board_exams(org_id);
CREATE INDEX idx_board_exams_batch_id ON board_exams(batch_id);

-- Competitive Exams
CREATE TABLE competitive_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  exam_name VARCHAR(255) NOT NULL,
  max_marks INTEGER,
  exam_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE competitive_exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view comp exams in their org" ON competitive_exams
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE POLICY "Admins can manage comp exams" ON competitive_exams
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE INDEX idx_competitive_exams_org_id ON competitive_exams(org_id);

-- Exam Results
CREATE TABLE exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES board_exams(id) ON DELETE CASCADE,
  student_id UUID,
  marks_obtained DECIMAL(10, 2),
  percentage DECIMAL(5, 2),
  grade VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view results in their org" ON exam_results
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE POLICY "Admins can manage results" ON exam_results
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE INDEX idx_exam_results_org_id ON exam_results(org_id);
CREATE INDEX idx_exam_results_exam_id ON exam_results(exam_id);

-- =====================================================
-- SUPPORT & TICKETS TABLE
-- =====================================================

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  ticket_type VARCHAR(100), -- ATTENDANCE, PAYMENT, OTHER
  status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED
  created_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view tickets in their org" ON support_tickets
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE POLICY "Users can create tickets" ON support_tickets
  FOR INSERT WITH CHECK (org_id = auth.jwt() ->> 'org_id'::text);
CREATE POLICY "Admins can manage tickets" ON support_tickets
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE INDEX idx_support_tickets_org_id ON support_tickets(org_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

-- =====================================================
-- WORKING HOURS TABLE
-- =====================================================

CREATE TABLE working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  day_of_week VARCHAR(20), -- MONDAY, TUESDAY, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_week_off BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view working hours in their org" ON working_hours
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE POLICY "Admins can manage working hours" ON working_hours
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE INDEX idx_working_hours_org_id ON working_hours(org_id);
CREATE INDEX idx_working_hours_employee_id ON working_hours(employee_id);

-- =====================================================
-- SALARY STRUCTURE TABLES
-- =====================================================

CREATE TABLE salary_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  base_salary DECIMAL(12, 2),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE salary_structures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view salary structures in their org" ON salary_structures
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE POLICY "Admins can manage salary structures" ON salary_structures
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE INDEX idx_salary_structures_org_id ON salary_structures(org_id);

-- Salary Components (Earnings)
CREATE TABLE salary_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  salary_structure_id UUID NOT NULL REFERENCES salary_structures(id) ON DELETE CASCADE,
  earning_name VARCHAR(100),
  amount DECIMAL(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE salary_earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view earnings in their org" ON salary_earnings
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE POLICY "Admins can manage earnings" ON salary_earnings
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE INDEX idx_salary_earnings_org_id ON salary_earnings(org_id);
CREATE INDEX idx_salary_earnings_structure_id ON salary_earnings(salary_structure_id);

-- Salary Deductions
CREATE TABLE salary_deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  salary_structure_id UUID NOT NULL REFERENCES salary_structures(id) ON DELETE CASCADE,
  deduction_name VARCHAR(100),
  amount DECIMAL(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE salary_deductions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view deductions in their org" ON salary_deductions
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE POLICY "Admins can manage deductions" ON salary_deductions
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE INDEX idx_salary_deductions_org_id ON salary_deductions(org_id);
CREATE INDEX idx_salary_deductions_structure_id ON salary_deductions(salary_structure_id);

-- =====================================================
-- TIMETABLE TABLES
-- =====================================================

CREATE TABLE timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  week_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view timetables in their org" ON timetables
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE POLICY "Admins can manage timetables" ON timetables
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE INDEX idx_timetables_org_id ON timetables(org_id);
CREATE INDEX idx_timetables_batch_id ON timetables(batch_id);

-- Timetable Slots
CREATE TABLE timetable_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  timetable_id UUID NOT NULL REFERENCES timetables(id) ON DELETE CASCADE,
  day_of_week VARCHAR(20),
  start_time TIME,
  end_time TIME,
  subject_id UUID REFERENCES subjects(id),
  faculty_id UUID REFERENCES batch_faculty(id),
  is_merged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE timetable_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view slots in their org" ON timetable_slots
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE POLICY "Admins can manage slots" ON timetable_slots
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE INDEX idx_timetable_slots_org_id ON timetable_slots(org_id);
CREATE INDEX idx_timetable_slots_timetable_id ON timetable_slots(timetable_id);

-- =====================================================
-- TOPICS & CONTENT HIERARCHY
-- =====================================================

CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  parent_topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  topic_name VARCHAR(255) NOT NULL,
  topic_number VARCHAR(50),
  description TEXT,
  topic_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view topics in their org" ON topics
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE POLICY "Admins can manage topics" ON topics
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE INDEX idx_topics_org_id ON topics(org_id);
CREATE INDEX idx_topics_subject_id ON topics(subject_id);
CREATE INDEX idx_topics_parent_id ON topics(parent_topic_id);

-- Content under Topics
CREATE TABLE topic_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  content_title VARCHAR(255) NOT NULL,
  content_type VARCHAR(50), -- PDF, VIDEO, DOCUMENT, LINK
  content_url TEXT,
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE topic_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view content in their org" ON topic_content
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE POLICY "Admins can manage content" ON topic_content
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);
CREATE INDEX idx_topic_content_org_id ON topic_content(org_id);
CREATE INDEX idx_topic_content_topic_id ON topic_content(topic_id);
