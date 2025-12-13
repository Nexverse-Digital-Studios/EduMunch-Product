-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  
  -- Course Details
  duration_months INTEGER, -- Duration in months
  level VARCHAR(50), -- Foundation, Intermediate, Advanced, etc.
  category VARCHAR(100), -- JEE, NEET, CET, etc.
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX idx_courses_org_id ON public.courses(org_id);
CREATE INDEX idx_courses_code ON public.courses(code);
CREATE INDEX idx_courses_is_active ON public.courses(is_active);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view courses from their org"
ON public.courses FOR SELECT
USING (org_id IN (
  SELECT org_id FROM public.users WHERE id = auth.uid()
));

CREATE POLICY "Users with permission can insert courses"
ON public.courses FOR INSERT
WITH CHECK (
  org_id IN (
    SELECT org_id FROM public.users WHERE id = auth.uid()
  )
);

CREATE POLICY "Users with permission can update courses"
ON public.courses FOR UPDATE
USING (org_id IN (
  SELECT org_id FROM public.users WHERE id = auth.uid()
));

CREATE POLICY "Users with permission can delete courses"
ON public.courses FOR DELETE
USING (org_id IN (
  SELECT org_id FROM public.users WHERE id = auth.uid()
));

-- Update trigger
CREATE OR REPLACE FUNCTION public.update_courses_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER courses_update_timestamp
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_courses_timestamp();
