-- Insert sample admission data for testing
-- Run this in Supabase SQL editor after creating an organization

-- First, get your org_id (replace with your actual Demo Institute org_id)
-- SELECT id FROM organizations WHERE name = 'Demo Institute';

-- Then run the inserts below with your org_id:
-- Replace 'YOUR_ORG_ID' with the actual UUID from the organizations table

INSERT INTO public.admissions (
  org_id,
  first_name,
  last_name,
  email,
  phone_number,
  date_of_birth,
  gender,
  category,
  admission_id,
  admission_date,
  session_year,
  tie_up_school,
  current_school,
  current_class,
  city,
  state,
  status
) VALUES
(
  'YOUR_ORG_ID',
  'Rahul',
  'Sharma',
  'rahul.sharma@example.com',
  '9876543210',
  '2008-05-15',
  'Male',
  'General',
  'ADM-2025-001',
  '2025-12-10',
  '2025-2026',
  'Nalanda Group of Schools',
  'Nalanda Group of Schools',
  '11th Grade',
  'Mumbai',
  'Maharashtra',
  'ACTIVE'
),
(
  'YOUR_ORG_ID',
  'Priya',
  'Patel',
  'priya.patel@example.com',
  '8765432109',
  '2009-03-22',
  'Female',
  'OBC',
  'ADM-2025-002',
  '2025-12-08',
  '2025-2026',
  'Saint Maria School',
  'Saint Maria School',
  '10th Grade',
  'Pune',
  'Maharashtra',
  'ACTIVE'
),
(
  'YOUR_ORG_ID',
  'Arjun',
  'Kumar',
  'arjun.kumar@example.com',
  '7654321098',
  '2007-11-30',
  'Male',
  'SC',
  'ADM-2025-003',
  '2025-12-05',
  '2025-2026',
  'Delhi Public School',
  'Delhi Public School',
  '12th Grade',
  'Delhi',
  'Delhi',
  'PENDING'
),
(
  'YOUR_ORG_ID',
  'Anjali',
  'Singh',
  'anjali.singh@example.com',
  '6543210987',
  '2009-07-18',
  'Female',
  'General',
  'ADM-2025-004',
  '2025-12-01',
  '2025-2026',
  'Ryan International School',
  'Ryan International School',
  '10th Grade',
  'Bangalore',
  'Karnataka',
  'ACTIVE'
),
(
  'YOUR_ORG_ID',
  'Vikram',
  'Desai',
  'vikram.desai@example.com',
  '5432109876',
  '2008-09-12',
  'Male',
  'General',
  'ADM-2025-005',
  '2025-11-28',
  '2025-2026',
  'Cathedral School',
  'Cathedral School',
  '11th Grade',
  'Mumbai',
  'Maharashtra',
  'REJECTED'
);

-- Verify the data was inserted
SELECT id, first_name, last_name, email, admission_id, status, admission_date 
FROM public.admissions 
WHERE org_id = 'YOUR_ORG_ID'
ORDER BY admission_date DESC;
