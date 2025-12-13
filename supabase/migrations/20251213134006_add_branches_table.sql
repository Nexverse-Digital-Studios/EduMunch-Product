-- Create branches table (if not exists)
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) NOT NULL,
  
  -- Address
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  
  -- Contact
  phone_number VARCHAR(20),
  email VARCHAR(255),
  
  -- Manager
  manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_branches_org_id ON public.branches(org_id);
CREATE INDEX IF NOT EXISTS idx_branches_code ON public.branches(code);
CREATE INDEX IF NOT EXISTS idx_branches_city ON public.branches(city);

-- Enable RLS
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view branches from their org"
ON public.branches FOR SELECT
USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can create branches in their org"
ON public.branches FOR INSERT
WITH CHECK (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update branches in their org"
ON public.branches FOR UPDATE
USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete branches in their org"
ON public.branches FOR DELETE
USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Update trigger
CREATE OR REPLACE FUNCTION public.update_branches_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER branches_update_timestamp
BEFORE UPDATE ON public.branches
FOR EACH ROW
EXECUTE FUNCTION public.update_branches_timestamp();
