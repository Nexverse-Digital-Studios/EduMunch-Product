-- =====================================================
-- HR, GRIEVANCE, FEEDBACK, INVENTORY TABLES MIGRATION
-- =====================================================

-- =====================================================
-- EMPLOYEES TABLE (HR Management)
-- =====================================================
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  designation VARCHAR(100),
  department VARCHAR(100),
  employee_code VARCHAR(50) UNIQUE NOT NULL,
  date_of_joining DATE,
  date_of_birth DATE,
  gender VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  qualification VARCHAR(255),
  experience_years INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  CONSTRAINT employees_org_id_key UNIQUE (org_id, employee_code)
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employees
CREATE POLICY "Users can view employees in their org" ON employees
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Admins can create employees" ON employees
  FOR INSERT WITH CHECK (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Admins can update employees" ON employees
  FOR UPDATE USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Admins can delete employees" ON employees
  FOR DELETE USING (org_id = auth.jwt() ->> 'org_id'::text);

-- =====================================================
-- ENROLLMENTS TABLE (Student Enrollment)
-- =====================================================
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, TRANSFERRED, DROPPED
  enrollment_number VARCHAR(50) UNIQUE NOT NULL,
  rollno INTEGER,
  admission_id UUID REFERENCES admissions(id),
  transfer_from_batch UUID REFERENCES batches(id),
  transfer_date DATE,
  drop_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT enrollments_unique_batch_student UNIQUE (batch_id, student_id)
);

-- Enable RLS
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for enrollments
CREATE POLICY "Users can view enrollments in their org" ON enrollments
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Admins can manage enrollments" ON enrollments
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);

-- =====================================================
-- GRIEVANCES TABLE (Grievance Management)
-- =====================================================
CREATE TABLE grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  grievance_number VARCHAR(50) UNIQUE NOT NULL,
  parent_id UUID REFERENCES users(id),
  parent_name VARCHAR(200),
  parent_phone VARCHAR(20),
  student_id UUID REFERENCES users(id),
  batch_id UUID REFERENCES batches(id),
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, CLOSED, RESOLVED
  priority VARCHAR(50) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH
  submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES users(id),
  attachments JSONB,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for grievances
CREATE POLICY "Users can view grievances in their org" ON grievances
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Users can create grievances in their org" ON grievances
  FOR INSERT WITH CHECK (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Admins can manage grievances" ON grievances
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);

-- =====================================================
-- FEEDBACK TEMPLATES TABLE
-- =====================================================
CREATE TABLE feedback_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  form_type VARCHAR(100) NOT NULL, -- FACULTY_REVIEW, STUDENT_FEEDBACK, etc.
  template_code VARCHAR(50) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  CONSTRAINT feedback_templates_org_code_unique UNIQUE (org_id, template_code)
);

-- Enable RLS
ALTER TABLE feedback_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view feedback templates in their org" ON feedback_templates
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Admins can manage feedback templates" ON feedback_templates
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);

-- =====================================================
-- FEEDBACK QUALITIES (Dimensions/Criteria for Feedback)
-- =====================================================
CREATE TABLE feedback_qualities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES feedback_templates(id) ON DELETE CASCADE,
  quality_name VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE feedback_qualities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view feedback qualities in their org" ON feedback_qualities
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Admins can manage feedback qualities" ON feedback_qualities
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);

-- =====================================================
-- FEEDBACK ASSIGNMENTS (Assign feedback to batches)
-- =====================================================
CREATE TABLE feedback_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES feedback_templates(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  submission_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT feedback_assignments_unique UNIQUE (batch_id, template_id)
);

-- Enable RLS
ALTER TABLE feedback_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view feedback assignments in their org" ON feedback_assignments
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Admins can manage feedback assignments" ON feedback_assignments
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);

-- =====================================================
-- FEEDBACK RESPONSES (Actual feedback submissions)
-- =====================================================
CREATE TABLE feedback_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES feedback_assignments(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES feedback_templates(id) ON DELETE CASCADE,
  respondent_id UUID REFERENCES users(id),
  subject_id UUID REFERENCES users(id),
  quality_ratings JSONB, -- {quality_id: rating}
  comments TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view feedback responses in their org" ON feedback_responses
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Users can submit feedback responses" ON feedback_responses
  FOR INSERT WITH CHECK (org_id = auth.jwt() ->> 'org_id'::text);

-- =====================================================
-- INVENTORY ITEMS TABLE
-- =====================================================
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  item_code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  item_type VARCHAR(100) NOT NULL, -- ASSET, CONSUMABLE, CASH
  unit VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT inventory_items_org_code_unique UNIQUE (org_id, item_code)
);

-- Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view inventory items in their org" ON inventory_items
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Admins can manage inventory items" ON inventory_items
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);

-- =====================================================
-- BRANCH INVENTORY TABLE (Stock at branches)
-- =====================================================
CREATE TABLE branch_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  current_quantity INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 0,
  max_quantity INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT branch_inventory_unique UNIQUE (branch_id, item_id)
);

-- Enable RLS
ALTER TABLE branch_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view branch inventory in their org" ON branch_inventory
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Admins can manage branch inventory" ON branch_inventory
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);

-- =====================================================
-- INVENTORY TRANSFERS TABLE
-- =====================================================
CREATE TABLE inventory_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  from_branch_id UUID NOT NULL REFERENCES branches(id),
  to_branch_id UUID NOT NULL REFERENCES branches(id),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_TRANSIT, COMPLETED, CANCELLED
  initiated_by UUID REFERENCES users(id),
  received_by UUID REFERENCES users(id),
  received_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE inventory_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transfers in their org" ON inventory_transfers
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Admins can manage transfers" ON inventory_transfers
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::text);

-- =====================================================
-- INVENTORY LEDGER TABLE (Transaction history)
-- =====================================================
CREATE TABLE inventory_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL, -- ADD, REMOVE, ADJUST, TRANSFER_OUT, TRANSFER_IN
  quantity_change INTEGER NOT NULL,
  reason VARCHAR(255),
  reference_id UUID,
  recorded_by UUID REFERENCES users(id),
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE inventory_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ledger in their org" ON inventory_ledger
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Users can create ledger entries" ON inventory_ledger
  FOR INSERT WITH CHECK (org_id = auth.jwt() ->> 'org_id'::text);

-- =====================================================
-- PETTY CASH LEDGER TABLE
-- =====================================================
CREATE TABLE petty_cash_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  transaction_type VARCHAR(50) NOT NULL, -- INCOME, EXPENSE
  amount DECIMAL(12, 2) NOT NULL,
  reference_type VARCHAR(100), -- TRANSFER_IN, ADJUSTMENT, EXPENSE, etc.
  reference_id UUID,
  recorded_by UUID REFERENCES users(id),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE petty_cash_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cash ledger in their org" ON petty_cash_ledger
  FOR SELECT USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY "Users can record cash transactions" ON petty_cash_ledger
  FOR INSERT WITH CHECK (org_id = auth.jwt() ->> 'org_id'::text);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_employees_org_id ON employees(org_id);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_enrollments_org_id ON enrollments(org_id);
CREATE INDEX idx_enrollments_batch_id ON enrollments(batch_id);
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_grievances_org_id ON grievances(org_id);
CREATE INDEX idx_grievances_status ON grievances(status);
CREATE INDEX idx_grievances_parent_id ON grievances(parent_id);
CREATE INDEX idx_feedback_templates_org_id ON feedback_templates(org_id);
CREATE INDEX idx_feedback_assignments_batch_id ON feedback_assignments(batch_id);
CREATE INDEX idx_feedback_responses_assignment_id ON feedback_responses(assignment_id);
CREATE INDEX idx_inventory_items_org_id ON inventory_items(org_id);
CREATE INDEX idx_branch_inventory_branch_id ON branch_inventory(branch_id);
CREATE INDEX idx_inventory_transfers_from_branch ON inventory_transfers(from_branch_id);
CREATE INDEX idx_inventory_transfers_to_branch ON inventory_transfers(to_branch_id);
CREATE INDEX idx_inventory_ledger_branch_id ON inventory_ledger(branch_id);
CREATE INDEX idx_petty_cash_ledger_branch_id ON petty_cash_ledger(branch_id);
