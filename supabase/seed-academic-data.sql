-- Insert sample courses
INSERT INTO public.courses (org_id, name, code, description, duration_months, level, category) VALUES
('YOUR_ORG_ID', '11th Grade', '11', 'Standard 11 coursework', 12, 'Intermediate', 'School'),
('YOUR_ORG_ID', 'CET 1 year', 'CET', 'Combined Entrance Test preparation', 12, 'Advanced', 'Competitive'),
('YOUR_ORG_ID', 'CET 2 years', 'C2', 'Extended CET preparation', 24, 'Advanced', 'Competitive'),
('YOUR_ORG_ID', 'JEE Foundation', 'JEE', 'JEE Main & Advanced preparation', 18, 'Foundation', 'Competitive'),
('YOUR_ORG_ID', 'NEET Foundation', 'NEET', 'NEET preparation for medical entrance', 18, 'Foundation', 'Medical');

-- Insert sample subjects
INSERT INTO public.subjects (org_id, name, code, total_chapters, total_hours) VALUES
('YOUR_ORG_ID', 'Math', 'MATH', 15, 120),
('YOUR_ORG_ID', 'Chemistry', 'CHEM', 14, 100),
('YOUR_ORG_ID', 'Biology', 'BIO', 16, 110),
('YOUR_ORG_ID', 'Physics', 'PHY', 15, 120),
('YOUR_ORG_ID', 'English', 'ENG', 12, 80),
('YOUR_ORG_ID', 'General Knowledge', 'GK', 10, 60);

-- Insert sample batches (after you have real course and branch IDs)
-- Get IDs first with:
-- SELECT id FROM public.courses WHERE code = 'JEE';
-- SELECT id FROM public.branches WHERE code = 'THN';

-- INSERT INTO public.batches (org_id, branch_id, course_id, name, code, start_date, end_date, capacity)
-- VALUES ('YOUR_ORG_ID', 'BRANCH_ID', 'COURSE_ID', '10TPF', '10TPF', '2025-11-04', '2025-11-29', 50);

-- Create faculty
INSERT INTO public.faculty (org_id, first_name, last_name, email, phone_number, qualification, specialization, experience_years) VALUES
('YOUR_ORG_ID', 'Amit', 'Singh', 'amit.singh@school.com', '9876543210', 'B.Tech', 'Mathematics', 8),
('YOUR_ORG_ID', 'Priya', 'Sharma', 'priya.sharma@school.com', '8765432109', 'M.Sc', 'Chemistry', 6),
('YOUR_ORG_ID', 'Rajesh', 'Kumar', 'rajesh.kumar@school.com', '7654321098', 'B.Sc', 'Physics', 10),
('YOUR_ORG_ID', 'Neha', 'Patel', 'neha.patel@school.com', '6543210987', 'M.Sc', 'Biology', 5),
('YOUR_ORG_ID', 'Vikram', 'Desai', 'vikram.desai@school.com', '5432109876', 'MA', 'English', 7);

-- Verify all data
SELECT COUNT(*) as total_courses FROM public.courses WHERE org_id = 'YOUR_ORG_ID';
SELECT COUNT(*) as total_subjects FROM public.subjects WHERE org_id = 'YOUR_ORG_ID';
SELECT COUNT(*) as total_faculty FROM public.faculty WHERE org_id = 'YOUR_ORG_ID';
SELECT COUNT(*) as total_batches FROM public.batches WHERE org_id = 'YOUR_ORG_ID';
