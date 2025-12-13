-- =====================================================
-- LEAVE, LECTURE, NOTIFICATIONS, PAYMENT TABLES
-- =====================================================

-- =====================================================
-- LEAVE APPLICATIONS TABLE
-- =====================================================
CREATE TABLE leave_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type VARCHAR(100) NOT NULL, -- CASUAL, SICK, EARNED, UNPAID, MATERNITY
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_days INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, CANCELLED
  deducted_as VARCHAR(100), -- How it was deducted: CASUAL, UNPAID, etc.
  approved_by UUID REFERENCES users(id),
  approval_date TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE leave_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view leave in their org" ON leave_applications
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Employees can create leave applications" ON leave_applications
  FOR INSERT WITH CHECK (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Admins can manage leave" ON leave_applications
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE INDEX idx_leave_applications_org_id ON leave_applications(org_id);
CREATE INDEX idx_leave_applications_employee_id ON leave_applications(employee_id);
CREATE INDEX idx_leave_applications_status ON leave_applications(status);

-- =====================================================
-- LECTURE TIMING TEMPLATES TABLE
-- =====================================================
CREATE TABLE lecture_timing_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  template_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE lecture_timing_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view templates in their org" ON lecture_timing_templates
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Admins can manage templates" ON lecture_timing_templates
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE INDEX idx_lecture_timing_templates_org_id ON lecture_timing_templates(org_id);
CREATE INDEX idx_lecture_timing_templates_branch_id ON lecture_timing_templates(branch_id);

-- =====================================================
-- LECTURE TIMING SLOTS TABLE
-- =====================================================
CREATE TABLE lecture_timing_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES lecture_timing_templates(id) ON DELETE CASCADE,
  day_of_week VARCHAR(20) NOT NULL, -- MONDAY, TUESDAY, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE lecture_timing_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view slots in their org" ON lecture_timing_slots
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Admins can manage slots" ON lecture_timing_slots
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE INDEX idx_lecture_timing_slots_org_id ON lecture_timing_slots(org_id);
CREATE INDEX idx_lecture_timing_slots_template_id ON lecture_timing_slots(template_id);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(500),
  notification_type VARCHAR(100), -- ANNOUNCEMENT, ALERT, REMINDER, SYSTEM
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notifications in their org" ON notifications
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Admins can create notifications" ON notifications
  FOR INSERT WITH CHECK (org_id = auth.jwt() ->> 'org_id'::text);

CREATE INDEX idx_notifications_org_id ON notifications(org_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =====================================================
-- NOTIFICATION TARGETS (Role/Branch/Course/Batch filtering)
-- =====================================================
CREATE TABLE notification_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  target_type VARCHAR(50), -- ROLE, BRANCH, COURSE, BATCH, TIE_UP_SCHOOL
  target_value UUID,
  target_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notification_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view targets" ON notification_targets
  FOR SELECT USING (notification_id IN (
    SELECT id FROM notifications WHERE org_id = auth.jwt() ->> 'org_id'::text
  ));

CREATE INDEX idx_notification_targets_notification_id ON notification_targets(notification_id);

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  admission_id UUID REFERENCES admissions(id) ON DELETE SET NULL,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE SET NULL,
  student_id UUID,
  student_name VARCHAR(255),
  student_form_number VARCHAR(50),
  course_name VARCHAR(255),
  branch_id UUID REFERENCES branches(id),
  batch_id UUID REFERENCES batches(id),
  amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50), -- CHEQUE, CASH, CARD, UPI, TRANSFER
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, REALIZED, CANCELLED, BOUNCED
  payment_date DATE,
  realized_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payments in their org" ON payments
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Users can record payments" ON payments
  FOR INSERT WITH CHECK (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Admins can manage payments" ON payments
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE INDEX idx_payments_org_id ON payments(org_id);
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_admission_id ON payments(admission_id);

-- =====================================================
-- PAYMENT INSTALLMENTS TABLE
-- =====================================================
CREATE TABLE payment_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  admission_id UUID REFERENCES admissions(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PARTIALLY_PAID, FULLY_PAID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT installments_unique UNIQUE (admission_id, installment_number)
);

ALTER TABLE payment_installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view installments in their org" ON payment_installments
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Admins can manage installments" ON payment_installments
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE INDEX idx_payment_installments_org_id ON payment_installments(org_id);
CREATE INDEX idx_payment_installments_admission_id ON payment_installments(admission_id);

-- =====================================================
-- PAYSLIPS TABLE
-- =====================================================
CREATE TABLE payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  payroll_month VARCHAR(7), -- YYYY-MM
  payroll_year INTEGER,
  basic_salary DECIMAL(12, 2),
  allowances DECIMAL(12, 2) DEFAULT 0,
  deductions DECIMAL(12, 2) DEFAULT 0,
  gross_salary DECIMAL(12, 2),
  net_salary DECIMAL(12, 2),
  payment_date DATE,
  status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, GENERATED, FINALIZED
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT payslips_unique UNIQUE (employee_id, payroll_month)
);

ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payslips in their org" ON payslips
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Admins can manage payslips" ON payslips
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE INDEX idx_payslips_org_id ON payslips(org_id);
CREATE INDEX idx_payslips_employee_id ON payslips(employee_id);
CREATE INDEX idx_payslips_payroll_month ON payslips(payroll_month);

-- =====================================================
-- PTM REQUESTS TABLE (Parent-Teacher Meetings)
-- =====================================================
CREATE TABLE ptm_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES users(id),
  parent_name VARCHAR(255),
  teacher_id UUID REFERENCES users(id),
  teacher_name VARCHAR(255),
  student_id UUID REFERENCES users(id),
  reason VARCHAR(255) NOT NULL,
  preferred_time TIMESTAMP WITH TIME ZONE,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, AWAITING_PARENT, DECLINED, COMPLETED
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ptm_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ptm requests in their org" ON ptm_requests
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Users can create ptm requests" ON ptm_requests
  FOR INSERT WITH CHECK (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Admins can manage ptm requests" ON ptm_requests
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE INDEX idx_ptm_requests_org_id ON ptm_requests(org_id);
CREATE INDEX idx_ptm_requests_parent_id ON ptm_requests(parent_id);
CREATE INDEX idx_ptm_requests_teacher_id ON ptm_requests(teacher_id);
CREATE INDEX idx_ptm_requests_status ON ptm_requests(status);
