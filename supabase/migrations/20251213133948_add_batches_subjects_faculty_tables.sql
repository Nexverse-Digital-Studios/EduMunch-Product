-- Create batches table
CREATE TABLE IF NOT EXISTS public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  
  -- Batch Details
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  capacity INTEGER DEFAULT 50,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  
  -- Subject Details
  total_chapters INTEGER,
  total_hours NUMERIC(5,2),
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create batch_subjects junction table (many-to-many)
CREATE TABLE IF NOT EXISTS public.batch_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  
  UNIQUE(batch_id, subject_id)
);

-- Create faculty table
CREATE TABLE IF NOT EXISTS public.faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone_number VARCHAR(20),
  
  -- Qualifications
  qualification VARCHAR(255),
  specialization VARCHAR(255),
  experience_years INTEGER,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create batch_faculty junction table (many-to-many)
CREATE TABLE IF NOT EXISTS public.batch_faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  faculty_id UUID NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  
  UNIQUE(batch_id, faculty_id, subject_id)
);

-- Create indexes
CREATE INDEX idx_batches_org_id ON public.batches(org_id);
CREATE INDEX idx_batches_branch_id ON public.batches(branch_id);
CREATE INDEX idx_batches_course_id ON public.batches(course_id);
CREATE INDEX idx_batches_code ON public.batches(code);

CREATE INDEX idx_subjects_org_id ON public.subjects(org_id);
CREATE INDEX idx_subjects_code ON public.subjects(code);

CREATE INDEX idx_faculty_org_id ON public.faculty(org_id);
CREATE INDEX idx_faculty_email ON public.faculty(email);

CREATE INDEX idx_batch_subjects_batch_id ON public.batch_subjects(batch_id);
CREATE INDEX idx_batch_subjects_subject_id ON public.batch_subjects(subject_id);

CREATE INDEX idx_batch_faculty_batch_id ON public.batch_faculty(batch_id);
CREATE INDEX idx_batch_faculty_faculty_id ON public.batch_faculty(faculty_id);

-- Enable RLS
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_faculty ENABLE ROW LEVEL SECURITY;

-- RLS Policies for batches
CREATE POLICY "Users can view batches from their org"
ON public.batches FOR SELECT
USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can create batches in their org"
ON public.batches FOR INSERT
WITH CHECK (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update batches in their org"
ON public.batches FOR UPDATE
USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete batches in their org"
ON public.batches FOR DELETE
USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- RLS Policies for subjects
CREATE POLICY "Users can view subjects from their org"
ON public.subjects FOR SELECT
USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can create subjects in their org"
ON public.subjects FOR INSERT
WITH CHECK (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update subjects in their org"
ON public.subjects FOR UPDATE
USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- RLS Policies for faculty
CREATE POLICY "Users can view faculty from their org"
ON public.faculty FOR SELECT
USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can create faculty in their org"
ON public.faculty FOR INSERT
WITH CHECK (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update faculty in their org"
ON public.faculty FOR UPDATE
USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- RLS for junction tables (allow if user can access batch)
CREATE POLICY "Users can view batch subjects"
ON public.batch_subjects FOR SELECT
USING (batch_id IN (
  SELECT id FROM public.batches 
  WHERE org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid())
));

CREATE POLICY "Users can manage batch subjects"
ON public.batch_subjects FOR INSERT
WITH CHECK (batch_id IN (
  SELECT id FROM public.batches 
  WHERE org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid())
));

-- Update triggers
CREATE OR REPLACE FUNCTION public.update_batches_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER batches_update_timestamp
BEFORE UPDATE ON public.batches
FOR EACH ROW
EXECUTE FUNCTION public.update_batches_timestamp();

CREATE OR REPLACE FUNCTION public.update_subjects_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subjects_update_timestamp
BEFORE UPDATE ON public.subjects
FOR EACH ROW
EXECUTE FUNCTION public.update_subjects_timestamp();

CREATE OR REPLACE FUNCTION public.update_faculty_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER faculty_update_timestamp
BEFORE UPDATE ON public.faculty
FOR EACH ROW
EXECUTE FUNCTION public.update_faculty_timestamp();
