-- Create admissions table
CREATE TABLE IF NOT EXISTS public.admissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  
  -- Student Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(20),
  category VARCHAR(50), -- SC, ST, OBC, General, etc.
  
  -- Academic Information
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  current_school VARCHAR(255),
  current_class VARCHAR(50),
  
  -- Admission Details
  admission_id VARCHAR(100) NOT NULL UNIQUE,
  admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_year VARCHAR(20), -- e.g., "2025-2026"
  tie_up_school VARCHAR(255),
  
  -- Address Information
  address VARCHAR(500),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  
  -- Parent/Guardian Information
  parent_name VARCHAR(100),
  parent_email VARCHAR(255),
  parent_phone VARCHAR(20),
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  
  -- Status
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, ACTIVE, REJECTED
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notes TEXT
);

-- Create index for faster queries
CREATE INDEX idx_admissions_org_id ON public.admissions(org_id);
CREATE INDEX idx_admissions_branch_id ON public.admissions(branch_id);
CREATE INDEX idx_admissions_email ON public.admissions(email);
CREATE INDEX idx_admissions_admission_id ON public.admissions(admission_id);
CREATE INDEX idx_admissions_status ON public.admissions(status);
CREATE INDEX idx_admissions_course_id ON public.admissions(course_id);

-- Enable RLS
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy: Users can view admissions from their organization
CREATE POLICY "Users can view admissions from their org"
ON public.admissions FOR SELECT
USING (org_id IN (
  SELECT org_id FROM public.users WHERE id = auth.uid()
));

-- Policy: Users with 'admissions_view' permission can view
CREATE POLICY "Permission-based view access"
ON public.admissions FOR SELECT
USING (
  org_id IN (
    SELECT org_id FROM public.users WHERE id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.role_permissions rp
    JOIN public.users u ON u.role_id = rp.role_id
    WHERE u.id = auth.uid()
    AND rp.permission_id = (SELECT id FROM public.permissions WHERE name = 'admissions_view')
  )
);

-- Policy: Users with 'admissions_create' permission can insert
CREATE POLICY "Permission-based create access"
ON public.admissions FOR INSERT
WITH CHECK (
  org_id IN (
    SELECT org_id FROM public.users WHERE id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.role_permissions rp
    JOIN public.users u ON u.role_id = rp.role_id
    WHERE u.id = auth.uid()
    AND rp.permission_id = (SELECT id FROM public.permissions WHERE name = 'admissions_create')
  )
);

-- Policy: Users with 'admissions_edit' permission can update
CREATE POLICY "Permission-based update access"
ON public.admissions FOR UPDATE
USING (
  org_id IN (
    SELECT org_id FROM public.users WHERE id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.role_permissions rp
    JOIN public.users u ON u.role_id = rp.role_id
    WHERE u.id = auth.uid()
    AND rp.permission_id = (SELECT id FROM public.permissions WHERE name = 'admissions_edit')
  )
)
WITH CHECK (
  org_id IN (
    SELECT org_id FROM public.users WHERE id = auth.uid()
  )
);

-- Policy: Users with 'admissions_delete' permission can delete
CREATE POLICY "Permission-based delete access"
ON public.admissions FOR DELETE
USING (
  org_id IN (
    SELECT org_id FROM public.users WHERE id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.role_permissions rp
    JOIN public.users u ON u.role_id = rp.role_id
    WHERE u.id = auth.uid()
    AND rp.permission_id = (SELECT id FROM public.permissions WHERE name = 'admissions_delete')
  )
);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_admissions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admissions_update_timestamp
BEFORE UPDATE ON public.admissions
FOR EACH ROW
EXECUTE FUNCTION public.update_admissions_timestamp();
