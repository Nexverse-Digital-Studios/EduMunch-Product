-- ============================================================================
-- EduMunch: Default Roles & Permissions SQL
-- ============================================================================
-- This script creates 12 default roles with complete permissions covering
-- all 340+ routes across Tier 1, 2, and 3 features.
--
-- INDEX_TOKEN Pattern: All table names use the suffix '_1EMAET'
-- To use for a different school, search and replace '1EMAET' with your token
-- 
-- Usage: Run this SQL after creating the base schema tables
-- Prerequisites: modules_1EMAET, roles_1EMAET, permissions_1EMAET, 
--                role_permissions_1EMAET tables must exist
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE MODULES
-- ============================================================================
-- Modules represent feature areas/categories in the system

-- Clear existing modules (optional - use with caution in production)
-- DELETE FROM modules_1EMAET;

-- Core System Modules (Tier 1)
INSERT INTO modules_1EMAET (id, module_code, module_name, description, display_order, icon, is_active)
VALUES 
        (gen_random_uuid(), 'dashboard', 'Dashboard', 'Main dashboard with analytics and quick stats', 1, 'LayoutDashboard', true),
        (gen_random_uuid(), 'profile', 'Profile', 'User profile management', 2, 'User', true),
        (gen_random_uuid(), 'users', 'User Management', 'Manage system users and accounts', 3, 'Users', true),
        (gen_random_uuid(), 'roles', 'Role Management', 'Manage roles and role assignments', 4, 'Shield', true),
        (gen_random_uuid(), 'permissions', 'Permission Management', 'View and manage system permissions', 5, 'Key', true),
        (gen_random_uuid(), 'students', 'Student Management', 'Manage student records and profiles', 10, 'GraduationCap', true),
        (gen_random_uuid(), 'parents', 'Parent Management', 'Manage parent records and portal', 11, 'Users', true),
        (gen_random_uuid(), 'parent', 'Parent Portal', 'Parent self-service portal', 12, 'Home', true),
        (gen_random_uuid(), 'teachers', 'Teacher Management', 'Manage teacher records and assignments', 15, 'BookOpen', true),
        (gen_random_uuid(), 'employees', 'Employee Management', 'Manage non-teaching staff', 16, 'Briefcase', true),
        (gen_random_uuid(), 'attendance', 'Student Attendance', 'Mark and view student attendance', 20, 'CheckSquare', true),
        (gen_random_uuid(), 'staff_attendance', 'Staff Attendance', 'Mark and view staff attendance', 21, 'CheckSquare', true),
        (gen_random_uuid(), 'leave', 'Student Leave', 'Manage student leave applications', 22, 'Calendar', true),
        (gen_random_uuid(), 'staff_leave', 'Staff Leave', 'Manage staff leave applications', 23, 'Calendar', true),
        (gen_random_uuid(), 'academic_years', 'Academic Years', 'Manage academic year configurations', 30, 'Calendar', true),
        (gen_random_uuid(), 'classes', 'Class Management', 'Manage classes/grades', 31, 'School', true),
        (gen_random_uuid(), 'sections', 'Section Management', 'Manage class sections/batches', 32, 'Layout', true),
        (gen_random_uuid(), 'subjects', 'Subject Management', 'Manage subjects and curriculum', 33, 'Book', true),
        (gen_random_uuid(), 'topics', 'Topic Management', 'Manage subject topics and content', 34, 'FileText', true),
        (gen_random_uuid(), 'timetable', 'Timetable Management', 'Manage class timetables and schedules', 35, 'Clock', true),
        (gen_random_uuid(), 'lecture_templates', 'Lecture Templates', 'Manage lecture schedule templates', 36, 'Layout', true),
        (gen_random_uuid(), 'exams', 'Examination Management', 'Manage exams and schedules', 40, 'ClipboardList', true),
        (gen_random_uuid(), 'marks', 'Marks Management', 'Enter and manage exam marks', 41, 'Edit', true),
        (gen_random_uuid(), 'report_cards', 'Report Cards', 'Generate and manage report cards', 42, 'FileText', true),
        (gen_random_uuid(), 'fees', 'Fee Management', 'Manage fee structures and payments', 50, 'DollarSign', true),
        (gen_random_uuid(), 'settings', 'School Settings', 'Manage school configuration', 60, 'Settings', true),
        (gen_random_uuid(), 'id_cards', 'ID Card Management', 'Generate student and staff ID cards', 61, 'CreditCard', true),
        (gen_random_uuid(), 'reports', 'Reports', 'View and generate reports', 62, 'BarChart', true),
        (gen_random_uuid(), 'announcements', 'Announcements', 'Manage school announcements', 70, 'Megaphone', true),
        (gen_random_uuid(), 'notifications', 'Notifications', 'Manage system notifications', 71, 'Bell', true),
        (gen_random_uuid(), 'messages', 'Messages', 'Send SMS and email messages', 72, 'Mail', true)
ON CONFLICT (module_code) DO NOTHING;

    -- Tier 2 Modules
    INSERT INTO modules_1EMAET (id, module_code, module_name, description, display_order, icon, is_active)
    VALUES 
        (gen_random_uuid(), 'assignments', 'Assignments', 'Manage student assignments', 80, 'FileEdit', true),
        (gen_random_uuid(), 'study_materials', 'Study Materials', 'Upload and manage study resources', 81, 'BookOpen', true),
        (gen_random_uuid(), 'online_classes', 'Online Classes', 'Schedule and conduct online classes', 82, 'Video', true),
        (gen_random_uuid(), 'homework', 'Homework', 'Manage daily homework and diary', 83, 'ClipboardCheck', true),
        (gen_random_uuid(), 'doubts', 'Doubts', 'Student doubt clarification system', 84, 'HelpCircle', true),
        (gen_random_uuid(), 'transport', 'Transport Management', 'Manage school transport', 90, 'Bus', true),
        (gen_random_uuid(), 'payroll', 'Payroll Management', 'Manage staff salaries and payslips', 100, 'Wallet', true),
        (gen_random_uuid(), 'appraisals', 'Performance Appraisals', 'Manage staff performance reviews', 101, 'Star', true),
        (gen_random_uuid(), 'recruitment', 'Recruitment', 'Manage job postings and applications', 102, 'UserPlus', true),
        (gen_random_uuid(), 'feedback', 'Feedback', 'Collect and manage feedback', 110, 'MessageCircle', true),
        (gen_random_uuid(), 'grievances', 'Grievances', 'Handle complaints and grievances', 111, 'AlertTriangle', true),
        (gen_random_uuid(), 'support', 'Support Tickets', 'Technical support ticket system', 112, 'LifeBuoy', true)
ON CONFLICT (module_code) DO NOTHING;

    -- Tier 3 Modules
    INSERT INTO modules_1EMAET (id, module_code, module_name, description, display_order, icon, is_active)
    VALUES 
        (gen_random_uuid(), 'analytics', 'Advanced Analytics', 'AI-powered analytics and insights', 120, 'TrendingUp', true),
        (gen_random_uuid(), 'ptm', 'Parent-Teacher Meeting', 'Schedule and manage PTM', 121, 'Users', true),
        (gen_random_uuid(), 'alumni', 'Alumni Management', 'Manage alumni network', 122, 'GraduationCap', true),
        (gen_random_uuid(), 'admissions', 'Admission Management', 'Handle new admissions', 123, 'UserPlus', true),
        (gen_random_uuid(), 'inventory', 'Inventory Management', 'Manage assets and inventory', 124, 'Package', true),
        (gen_random_uuid(), 'certificates', 'Certificate Management', 'Generate certificates and documents', 125, 'Award', true),
        (gen_random_uuid(), 'surveys', 'Surveys', 'Create and manage surveys', 126, 'ClipboardList', true),
        (gen_random_uuid(), 'branches', 'Branch Management', 'Multi-branch school management', 130, 'Building', true)
ON CONFLICT (module_code) DO NOTHING;

-- ============================================================================
-- STEP 2: CREATE DEFAULT ROLES
-- ============================================================================

INSERT INTO roles_1EMAET (id, role_code, role_name, description, is_system_role, is_active)
VALUES 
    -- Role 1: Super Admin
    (gen_random_uuid(), 'super_admin', 'Super Administrator', 
     'Complete system access. Can manage all features, users, roles, and permissions.', true, true),
    
    -- Role 2: Principal
    (gen_random_uuid(), 'principal', 'Principal', 
     'School head with full operational access. Cannot modify system roles.', true, true),
    
    -- Role 3: Academic Coordinator
    (gen_random_uuid(), 'academic_coordinator', 'Academic Coordinator', 
     'Manages academic structure, curriculum, exams, and timetables.', true, true),
    
    -- Role 4: Teacher
    (gen_random_uuid(), 'teacher', 'Teacher', 
     'Teaching staff with classroom management, attendance, and marks access.', true, true),
    
    -- Role 5: Accountant
    (gen_random_uuid(), 'accountant', 'Accountant', 
     'Financial management including fees, payments, and reports.', true, true),
    
    -- Role 6: HR Manager
    (gen_random_uuid(), 'hr_manager', 'HR Manager', 
     'Human resources including employee records, payroll, and recruitment.', true, true),
    
    -- Role 7: Exam Controller
    (gen_random_uuid(), 'exam_controller', 'Exam Controller', 
     'Examination management including scheduling, marks verification, report cards.', true, true),
    
    -- Role 8: Receptionist
    (gen_random_uuid(), 'receptionist', 'Receptionist', 
     'Front office operations including admissions and visitor management.', true, true),
    
    -- Role 9: Librarian
    (gen_random_uuid(), 'librarian', 'Librarian', 
     'Library and inventory management.', true, true),
    
    -- Role 10: Transport Manager
    (gen_random_uuid(), 'transport_manager', 'Transport Manager', 
     'Transport operations including routes, vehicles, and driver management.', true, true),
    
    -- Role 11: Student
    (gen_random_uuid(), 'student', 'Student', 
     'Student portal access for viewing own information.', true, true),
    
    -- Role 12: Parent
    (gen_random_uuid(), 'parent', 'Parent', 
     'Parent portal access for viewing children information.', true, true)
ON CONFLICT (role_code) DO NOTHING;

-- ============================================================================
-- STEP 3: CREATE PERMISSIONS FOR EACH MODULE
-- ============================================================================
-- Each module gets standard CRUD permissions + approve + export

INSERT INTO permissions_1EMAET (id, module_id, permission_code, permission_name, description, resource_type, is_active)
SELECT 
    gen_random_uuid(),
    m.id,
    m.module_code || '.' || p.action,
    p.name || ' ' || m.module_name,
    p.description || ' for ' || m.module_name,
    'module',
    true
FROM modules_1EMAET m
CROSS JOIN (
    VALUES 
        ('view', 'View', 'View and list records'),
        ('create', 'Create', 'Create new records'),
        ('update', 'Update', 'Edit existing records'),
        ('delete', 'Delete', 'Delete records'),
        ('approve', 'Approve', 'Approve workflow items'),
        ('export', 'Export', 'Export data')
) AS p(action, name, description)
WHERE NOT EXISTS (
    SELECT 1 FROM permissions_1EMAET 
    WHERE permission_code = m.module_code || '.' || p.action
);

-- ============================================================================
-- STEP 4: CREATE ROLE-PERMISSION MAPPINGS
-- ============================================================================

-- Helper function to get role_id
CREATE OR REPLACE FUNCTION get_role_id_1EMAET(p_role_code TEXT) 
RETURNS UUID AS $$
    SELECT id FROM roles_1EMAET WHERE role_code = p_role_code LIMIT 1;
$$ LANGUAGE SQL;

-- Helper function to get permission_id  
CREATE OR REPLACE FUNCTION get_permission_id_1EMAET(p_permission_code TEXT)
RETURNS UUID AS $$
    SELECT id FROM permissions_1EMAET WHERE permission_code = p_permission_code LIMIT 1;
$$ LANGUAGE SQL;

-- ============================================================================
-- ROLE 1: SUPER ADMIN - FULL ACCESS TO EVERYTHING
-- ============================================================================

INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT 
    gen_random_uuid(),
    get_role_id_1EMAET('super_admin'),
    p.id,
    true, true, true, true, true, true
FROM permissions_1EMAET p
WHERE NOT EXISTS (
    SELECT 1 FROM role_permissions_1EMAET rp 
    WHERE rp.role_id = get_role_id_1EMAET('super_admin') AND rp.permission_id = p.id
);

-- ============================================================================
-- ROLE 2: PRINCIPAL - FULL OPERATIONAL ACCESS (except system roles)
-- ============================================================================

-- Principal: Dashboard
INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
VALUES (gen_random_uuid(), get_role_id_1EMAET('principal'), get_permission_id_1EMAET('dashboard.view'), true, false, false, false, false, false)
ON CONFLICT DO NOTHING;

-- Principal: Users (full access)
INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('principal'), get_permission_id_1EMAET(code), 
    true, true, true, true, true, true
FROM (VALUES ('users.view'), ('users.create'), ('users.update'), ('users.delete'), ('users.approve'), ('users.export')) AS t(code)
ON CONFLICT DO NOTHING;

-- Principal: Roles (view/export only, cannot modify system roles)
INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
VALUES 
    (gen_random_uuid(), get_role_id_1EMAET('principal'), get_permission_id_1EMAET('roles.view'), true, false, false, false, false, true)
ON CONFLICT DO NOTHING;

-- Principal: Students (full access)
INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('principal'), get_permission_id_1EMAET(code), 
    true, true, true, true, true, true
FROM (VALUES ('students.view'), ('students.create'), ('students.update'), ('students.delete'), ('students.approve'), ('students.export')) AS t(code)
ON CONFLICT DO NOTHING;

-- Principal: Parents (full access)
INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('principal'), get_permission_id_1EMAET(code), 
    true, true, true, true, false, true
FROM (VALUES ('parents.view'), ('parents.create'), ('parents.update'), ('parents.delete'), ('parents.export')) AS t(code)
ON CONFLICT DO NOTHING;

-- Principal: Teachers (full access)
INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('principal'), get_permission_id_1EMAET(code), 
    true, true, true, true, true, true
FROM (VALUES ('teachers.view'), ('teachers.create'), ('teachers.update'), ('teachers.delete'), ('teachers.approve'), ('teachers.export')) AS t(code)
ON CONFLICT DO NOTHING;

-- Principal: Employees (full access)
INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('principal'), get_permission_id_1EMAET(code), 
    true, true, true, true, true, true
FROM (VALUES ('employees.view'), ('employees.create'), ('employees.update'), ('employees.delete'), ('employees.approve'), ('employees.export')) AS t(code)
ON CONFLICT DO NOTHING;

-- Principal: Attendance (full access)
INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('principal'), get_permission_id_1EMAET(code), 
    true, true, true, true, true, true
FROM (VALUES 
    ('attendance.view'), ('attendance.create'), ('attendance.update'), ('attendance.delete'), ('attendance.approve'), ('attendance.export'),
    ('staff_attendance.view'), ('staff_attendance.create'), ('staff_attendance.update'), ('staff_attendance.delete'), ('staff_attendance.approve'), ('staff_attendance.export'),
    ('leave.view'), ('leave.create'), ('leave.update'), ('leave.delete'), ('leave.approve'), ('leave.export'),
    ('staff_leave.view'), ('staff_leave.create'), ('staff_leave.update'), ('staff_leave.delete'), ('staff_leave.approve'), ('staff_leave.export')
) AS t(code)
ON CONFLICT DO NOTHING;

-- Principal: Academic Modules (full access)
INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('principal'), get_permission_id_1EMAET(code), 
    true, true, true, true, true, true
FROM (VALUES 
    ('academic_years.view'), ('academic_years.create'), ('academic_years.update'), ('academic_years.delete'), ('academic_years.approve'), ('academic_years.export'),
    ('classes.view'), ('classes.create'), ('classes.update'), ('classes.delete'), ('classes.export'),
    ('sections.view'), ('sections.create'), ('sections.update'), ('sections.delete'), ('sections.export'),
    ('subjects.view'), ('subjects.create'), ('subjects.update'), ('subjects.delete'), ('subjects.export'),
    ('topics.view'), ('topics.create'), ('topics.update'), ('topics.delete'), ('topics.export'),
    ('timetable.view'), ('timetable.create'), ('timetable.update'), ('timetable.delete'), ('timetable.approve'), ('timetable.export'),
    ('lecture_templates.view'), ('lecture_templates.create'), ('lecture_templates.update'), ('lecture_templates.delete'), ('lecture_templates.export')
) AS t(code)
ON CONFLICT DO NOTHING;

-- Principal: Exams & Marks (full access)
INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('principal'), get_permission_id_1EMAET(code), 
    true, true, true, true, true, true
FROM (VALUES 
    ('exams.view'), ('exams.create'), ('exams.update'), ('exams.delete'), ('exams.approve'), ('exams.export'),
    ('marks.view'), ('marks.create'), ('marks.update'), ('marks.delete'), ('marks.approve'), ('marks.export'),
    ('report_cards.view'), ('report_cards.create'), ('report_cards.update'), ('report_cards.approve'), ('report_cards.export')
) AS t(code)
ON CONFLICT DO NOTHING;

-- Principal: Fees (full access)
INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('principal'), get_permission_id_1EMAET(code), 
    true, true, true, true, true, true
FROM (VALUES ('fees.view'), ('fees.create'), ('fees.update'), ('fees.delete'), ('fees.approve'), ('fees.export')) AS t(code)
ON CONFLICT DO NOTHING;

-- Principal: Settings, Reports, ID Cards, Communication (full access)
INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('principal'), get_permission_id_1EMAET(code), 
    true, true, true, true, true, true
FROM (VALUES 
    ('settings.view'), ('settings.create'), ('settings.update'), ('settings.export'),
    ('id_cards.view'), ('id_cards.create'), ('id_cards.update'), ('id_cards.export'),
    ('reports.view'), ('reports.create'), ('reports.export'),
    ('announcements.view'), ('announcements.create'), ('announcements.update'), ('announcements.delete'),
    ('notifications.view'), ('notifications.create'), ('notifications.update'),
    ('messages.view'), ('messages.create')
) AS t(code)
ON CONFLICT DO NOTHING;

-- Principal: Tier 2 Modules (full access)
INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('principal'), get_permission_id_1EMAET(code), 
    true, true, true, true, true, true
FROM (VALUES 
    ('assignments.view'), ('assignments.create'), ('assignments.update'), ('assignments.delete'), ('assignments.approve'), ('assignments.export'),
    ('study_materials.view'), ('study_materials.create'), ('study_materials.update'), ('study_materials.delete'), ('study_materials.approve'), ('study_materials.export'),
    ('online_classes.view'), ('online_classes.create'), ('online_classes.update'), ('online_classes.delete'), ('online_classes.approve'), ('online_classes.export'),
    ('homework.view'), ('homework.create'), ('homework.update'), ('homework.delete'), ('homework.approve'), ('homework.export'),
    ('doubts.view'), ('doubts.create'), ('doubts.update'), ('doubts.delete'),
    ('transport.view'), ('transport.create'), ('transport.update'), ('transport.delete'), ('transport.approve'), ('transport.export'),
    ('payroll.view'), ('payroll.create'), ('payroll.update'), ('payroll.delete'), ('payroll.approve'), ('payroll.export'),
    ('appraisals.view'), ('appraisals.create'), ('appraisals.update'), ('appraisals.delete'), ('appraisals.approve'), ('appraisals.export'),
    ('recruitment.view'), ('recruitment.create'), ('recruitment.update'), ('recruitment.delete'), ('recruitment.approve'), ('recruitment.export'),
    ('feedback.view'), ('feedback.create'), ('feedback.update'), ('feedback.delete'), ('feedback.export'),
    ('grievances.view'), ('grievances.create'), ('grievances.update'), ('grievances.delete'), ('grievances.approve'), ('grievances.export'),
    ('support.view'), ('support.create'), ('support.update'), ('support.delete'), ('support.approve'), ('support.export')
) AS t(code)
ON CONFLICT DO NOTHING;

-- Principal: Tier 3 Modules (full access)
INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('principal'), get_permission_id_1EMAET(code), 
    true, true, true, true, true, true
FROM (VALUES 
    ('analytics.view'), ('analytics.export'),
    ('ptm.view'), ('ptm.create'), ('ptm.update'), ('ptm.delete'), ('ptm.approve'), ('ptm.export'),
    ('alumni.view'), ('alumni.create'), ('alumni.update'), ('alumni.delete'), ('alumni.approve'), ('alumni.export'),
    ('admissions.view'), ('admissions.create'), ('admissions.update'), ('admissions.delete'), ('admissions.approve'), ('admissions.export'),
    ('inventory.view'), ('inventory.create'), ('inventory.update'), ('inventory.delete'), ('inventory.approve'), ('inventory.export'),
    ('certificates.view'), ('certificates.create'), ('certificates.update'), ('certificates.delete'), ('certificates.approve'), ('certificates.export'),
    ('surveys.view'), ('surveys.create'), ('surveys.update'), ('surveys.delete'), ('surveys.approve'),
    ('branches.view'), ('branches.create'), ('branches.update'), ('branches.delete'), ('branches.export')
) AS t(code)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ROLE 3: ACADEMIC COORDINATOR
-- ============================================================================

INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('academic_coordinator'), get_permission_id_1EMAET(code), 
    r, c, u, d, a, e
FROM (VALUES 
    -- Dashboard (view only)
    ('dashboard.view', true, false, false, false, false, false),
    -- Students (view/export only)
    ('students.view', true, false, false, false, false, true),
    ('students.export', true, false, false, false, false, true),
    -- Teachers (view/export only)
    ('teachers.view', true, false, false, false, false, true),
    ('teachers.export', true, false, false, false, false, true),
    -- Academic Modules (full CRUD + approve)
    ('classes.view', true, true, true, true, true, true),
    ('classes.create', true, true, true, true, true, true),
    ('classes.update', true, true, true, true, true, true),
    ('classes.delete', true, true, true, true, true, true),
    ('classes.export', true, true, true, true, true, true),
    ('sections.view', true, true, true, true, true, true),
    ('sections.create', true, true, true, true, true, true),
    ('sections.update', true, true, true, true, true, true),
    ('sections.delete', true, true, true, true, true, true),
    ('sections.export', true, true, true, true, true, true),
    ('subjects.view', true, true, true, true, false, true),
    ('subjects.create', true, true, true, true, false, true),
    ('subjects.update', true, true, true, true, false, true),
    ('subjects.delete', true, true, true, true, false, true),
    ('subjects.export', true, true, true, true, false, true),
    ('topics.view', true, true, true, true, false, true),
    ('topics.create', true, true, true, true, false, true),
    ('topics.update', true, true, true, true, false, true),
    ('topics.delete', true, true, true, true, false, true),
    ('topics.export', true, true, true, true, false, true),
    ('academic_years.view', true, true, true, false, true, true),
    ('academic_years.create', true, true, true, false, true, true),
    ('academic_years.update', true, true, true, false, true, true),
    ('academic_years.export', true, true, true, false, true, true),
    ('timetable.view', true, true, true, true, true, true),
    ('timetable.create', true, true, true, true, true, true),
    ('timetable.update', true, true, true, true, true, true),
    ('timetable.delete', true, true, true, true, true, true),
    ('timetable.approve', true, true, true, true, true, true),
    ('timetable.export', true, true, true, true, true, true),
    ('lecture_templates.view', true, true, true, true, false, true),
    ('lecture_templates.create', true, true, true, true, false, true),
    ('lecture_templates.update', true, true, true, true, false, true),
    ('lecture_templates.delete', true, true, true, true, false, true),
    ('lecture_templates.export', true, true, true, true, false, true),
    -- Exams (full access)
    ('exams.view', true, true, true, true, true, true),
    ('exams.create', true, true, true, true, true, true),
    ('exams.update', true, true, true, true, true, true),
    ('exams.delete', true, true, true, true, true, true),
    ('exams.approve', true, true, true, true, true, true),
    ('exams.export', true, true, true, true, true, true),
    -- Marks (view/approve/export - not enter)
    ('marks.view', true, false, false, false, true, true),
    ('marks.approve', true, false, false, false, true, true),
    ('marks.export', true, false, false, false, true, true),
    -- Report Cards (view/create/approve/export)
    ('report_cards.view', true, true, false, false, true, true),
    ('report_cards.create', true, true, false, false, true, true),
    ('report_cards.approve', true, true, false, false, true, true),
    ('report_cards.export', true, true, false, false, true, true),
    -- Announcements
    ('announcements.view', true, true, true, true, false, false),
    ('announcements.create', true, true, true, true, false, false),
    ('announcements.update', true, true, true, true, false, false),
    ('announcements.delete', true, true, true, true, false, false),
    -- Reports
    ('reports.view', true, true, false, false, false, true),
    ('reports.create', true, true, false, false, false, true),
    ('reports.export', true, true, false, false, false, true),
    -- LMS (view + approve)
    ('assignments.view', true, false, false, false, true, true),
    ('assignments.approve', true, false, false, false, true, true),
    ('assignments.export', true, false, false, false, true, true),
    ('homework.view', true, false, false, false, true, true),
    ('homework.approve', true, false, false, false, true, true),
    ('homework.export', true, false, false, false, true, true),
    ('study_materials.view', true, true, true, true, true, true),
    ('study_materials.create', true, true, true, true, true, true),
    ('study_materials.update', true, true, true, true, true, true),
    ('study_materials.delete', true, true, true, true, true, true),
    ('study_materials.approve', true, true, true, true, true, true),
    ('study_materials.export', true, true, true, true, true, true)
) AS t(code, r, c, u, d, a, e)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ROLE 4: TEACHER
-- ============================================================================

INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('teacher'), get_permission_id_1EMAET(code), 
    r, c, u, d, a, e
FROM (VALUES 
    -- Dashboard (view only)
    ('dashboard.view', true, false, false, false, false, false),
    -- Profile (view + update own)
    ('profile.view', true, false, true, false, false, false),
    ('profile.update', true, false, true, false, false, false),
    -- Students (view/export assigned sections)
    ('students.view', true, false, false, false, false, true),
    ('students.export', true, false, false, false, false, true),
    -- Attendance (mark for assigned sections)
    ('attendance.view', true, true, true, false, false, true),
    ('attendance.create', true, true, true, false, false, true),
    ('attendance.update', true, true, true, false, false, true),
    ('attendance.export', true, true, true, false, false, true),
    -- Leave (apply own + view students)
    ('leave.view', true, true, false, false, false, false),
    ('leave.create', true, true, false, false, false, false),
    -- Academic (view only)
    ('classes.view', true, false, false, false, false, false),
    ('sections.view', true, false, false, false, false, false),
    ('subjects.view', true, false, false, false, false, false),
    ('topics.view', true, false, false, false, false, false),
    ('timetable.view', true, false, false, false, false, false),
    -- Exams (view only)
    ('exams.view', true, false, false, false, false, false),
    -- Marks (full access for assigned subjects)
    ('marks.view', true, true, true, false, false, true),
    ('marks.create', true, true, true, false, false, true),
    ('marks.update', true, true, true, false, false, true),
    ('marks.export', true, true, true, false, false, true),
    -- Report Cards (view only)
    ('report_cards.view', true, false, false, false, false, false),
    -- Announcements (view + create for sections)
    ('announcements.view', true, true, false, false, false, false),
    ('announcements.create', true, true, false, false, false, false),
    -- Notifications (view + send)
    ('notifications.view', true, true, false, false, false, false),
    ('notifications.create', true, true, false, false, false, false),
    -- Assignments (full CRUD for own assignments)
    ('assignments.view', true, true, true, true, true, true),
    ('assignments.create', true, true, true, true, true, true),
    ('assignments.update', true, true, true, true, true, true),
    ('assignments.delete', true, true, true, true, true, true),
    ('assignments.approve', true, true, true, true, true, true),
    ('assignments.export', true, true, true, true, true, true),
    -- Homework (full CRUD)
    ('homework.view', true, true, true, true, false, true),
    ('homework.create', true, true, true, true, false, true),
    ('homework.update', true, true, true, true, false, true),
    ('homework.delete', true, true, true, true, false, true),
    ('homework.export', true, true, true, true, false, true),
    -- Study Materials (full CRUD)
    ('study_materials.view', true, true, true, true, false, false),
    ('study_materials.create', true, true, true, true, false, false),
    ('study_materials.update', true, true, true, true, false, false),
    ('study_materials.delete', true, true, true, true, false, false),
    -- Online Classes (full CRUD)
    ('online_classes.view', true, true, true, true, false, false),
    ('online_classes.create', true, true, true, true, false, false),
    ('online_classes.update', true, true, true, true, false, false),
    ('online_classes.delete', true, true, true, true, false, false),
    -- Doubts (respond to doubts)
    ('doubts.view', true, true, true, true, false, false),
    ('doubts.create', true, true, true, true, false, false),
    ('doubts.update', true, true, true, true, false, false),
    ('doubts.delete', true, true, true, true, false, false),
    -- PTM (manage own slots)
    ('ptm.view', true, true, true, false, false, true),
    ('ptm.create', true, true, true, false, false, true),
    ('ptm.update', true, true, true, false, false, true),
    ('ptm.export', true, true, true, false, false, true),
    -- Staff Leave (apply own)
    ('staff_leave.view', true, true, false, false, false, false),
    ('staff_leave.create', true, true, false, false, false, false)
) AS t(code, r, c, u, d, a, e)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ROLE 5: ACCOUNTANT
-- ============================================================================

INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('accountant'), get_permission_id_1EMAET(code), 
    r, c, u, d, a, e
FROM (VALUES 
    -- Dashboard (view only)
    ('dashboard.view', true, false, false, false, false, false),
    -- Students (view for fee purposes)
    ('students.view', true, false, false, false, false, true),
    ('students.export', true, false, false, false, false, true),
    -- Fees (full access)
    ('fees.view', true, true, true, false, true, true),
    ('fees.create', true, true, true, false, true, true),
    ('fees.update', true, true, true, false, true, true),
    ('fees.approve', true, true, true, false, true, true),
    ('fees.export', true, true, true, false, true, true),
    -- Reports (financial only)
    ('reports.view', true, true, false, false, false, true),
    ('reports.create', true, true, false, false, false, true),
    ('reports.export', true, true, false, false, false, true),
    -- Announcements (view only)
    ('announcements.view', true, false, false, false, false, false),
    -- Notifications (send fee reminders)
    ('notifications.view', true, true, false, false, false, false),
    ('notifications.create', true, true, false, false, false, false),
    -- Messages (send fee reminders)
    ('messages.view', true, true, false, false, false, false),
    ('messages.create', true, true, false, false, false, false)
) AS t(code, r, c, u, d, a, e)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ROLE 6: HR MANAGER
-- ============================================================================

INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('hr_manager'), get_permission_id_1EMAET(code), 
    r, c, u, d, a, e
FROM (VALUES 
    -- Dashboard (view only)
    ('dashboard.view', true, false, false, false, false, false),
    -- Users (create/edit employee accounts)
    ('users.view', true, true, true, false, false, true),
    ('users.create', true, true, true, false, false, true),
    ('users.update', true, true, true, false, false, true),
    ('users.export', true, true, true, false, false, true),
    -- Teachers (full access except delete)
    ('teachers.view', true, true, true, false, true, true),
    ('teachers.create', true, true, true, false, true, true),
    ('teachers.update', true, true, true, false, true, true),
    ('teachers.approve', true, true, true, false, true, true),
    ('teachers.export', true, true, true, false, true, true),
    -- Employees (full access except delete)
    ('employees.view', true, true, true, false, true, true),
    ('employees.create', true, true, true, false, true, true),
    ('employees.update', true, true, true, false, true, true),
    ('employees.approve', true, true, true, false, true, true),
    ('employees.export', true, true, true, false, true, true),
    -- Staff Attendance (full access except delete)
    ('staff_attendance.view', true, true, true, false, false, true),
    ('staff_attendance.create', true, true, true, false, false, true),
    ('staff_attendance.update', true, true, true, false, false, true),
    ('staff_attendance.export', true, true, true, false, false, true),
    -- Staff Leave (full access including approve)
    ('staff_leave.view', true, true, true, false, true, true),
    ('staff_leave.create', true, true, true, false, true, true),
    ('staff_leave.update', true, true, true, false, true, true),
    ('staff_leave.approve', true, true, true, false, true, true),
    ('staff_leave.export', true, true, true, false, true, true),
    -- Payroll (full access except delete)
    ('payroll.view', true, true, true, false, true, true),
    ('payroll.create', true, true, true, false, true, true),
    ('payroll.update', true, true, true, false, true, true),
    ('payroll.approve', true, true, true, false, true, true),
    ('payroll.export', true, true, true, false, true, true),
    -- Appraisals (full access except delete)
    ('appraisals.view', true, true, true, false, true, true),
    ('appraisals.create', true, true, true, false, true, true),
    ('appraisals.update', true, true, true, false, true, true),
    ('appraisals.approve', true, true, true, false, true, true),
    ('appraisals.export', true, true, true, false, true, true),
    -- Recruitment (full access)
    ('recruitment.view', true, true, true, true, true, true),
    ('recruitment.create', true, true, true, true, true, true),
    ('recruitment.update', true, true, true, true, true, true),
    ('recruitment.delete', true, true, true, true, true, true),
    ('recruitment.approve', true, true, true, true, true, true),
    ('recruitment.export', true, true, true, true, true, true),
    -- Announcements (create HR announcements)
    ('announcements.view', true, true, true, false, false, false),
    ('announcements.create', true, true, true, false, false, false),
    ('announcements.update', true, true, true, false, false, false),
    -- Reports (HR reports)
    ('reports.view', true, true, false, false, false, true),
    ('reports.create', true, true, false, false, false, true),
    ('reports.export', true, true, false, false, false, true),
    -- ID Cards (generate staff ID cards)
    ('id_cards.view', true, true, false, false, false, false),
    ('id_cards.create', true, true, false, false, false, false)
) AS t(code, r, c, u, d, a, e)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ROLE 7: EXAM CONTROLLER
-- ============================================================================

INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('exam_controller'), get_permission_id_1EMAET(code), 
    r, c, u, d, a, e
FROM (VALUES 
    -- Dashboard (view only)
    ('dashboard.view', true, false, false, false, false, false),
    -- Students (view for exam purposes)
    ('students.view', true, false, false, false, false, true),
    ('students.export', true, false, false, false, false, true),
    -- Academic (view only)
    ('classes.view', true, false, false, false, false, false),
    ('sections.view', true, false, false, false, false, false),
    ('subjects.view', true, false, false, false, false, false),
    -- Exams (full access)
    ('exams.view', true, true, true, true, true, true),
    ('exams.create', true, true, true, true, true, true),
    ('exams.update', true, true, true, true, true, true),
    ('exams.delete', true, true, true, true, true, true),
    ('exams.approve', true, true, true, true, true, true),
    ('exams.export', true, true, true, true, true, true),
    -- Marks (full access)
    ('marks.view', true, true, true, false, true, true),
    ('marks.create', true, true, true, false, true, true),
    ('marks.update', true, true, true, false, true, true),
    ('marks.approve', true, true, true, false, true, true),
    ('marks.export', true, true, true, false, true, true),
    -- Report Cards (full access)
    ('report_cards.view', true, true, true, false, true, true),
    ('report_cards.create', true, true, true, false, true, true),
    ('report_cards.update', true, true, true, false, true, true),
    ('report_cards.approve', true, true, true, false, true, true),
    ('report_cards.export', true, true, true, false, true, true),
    -- Announcements (exam announcements)
    ('announcements.view', true, true, false, false, false, false),
    ('announcements.create', true, true, false, false, false, false),
    -- Notifications (exam notifications)
    ('notifications.view', true, true, false, false, false, false),
    ('notifications.create', true, true, false, false, false, false),
    -- Reports
    ('reports.view', true, true, false, false, false, true),
    ('reports.create', true, true, false, false, false, true),
    ('reports.export', true, true, false, false, false, true)
) AS t(code, r, c, u, d, a, e)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ROLE 8: RECEPTIONIST
-- ============================================================================

INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('receptionist'), get_permission_id_1EMAET(code), 
    r, c, u, d, a, e
FROM (VALUES 
    -- Dashboard (view only)
    ('dashboard.view', true, false, false, false, false, false),
    -- Students (view only)
    ('students.view', true, false, false, false, false, false),
    -- Parents (view only)
    ('parents.view', true, false, false, false, false, false),
    -- Teachers (view only)
    ('teachers.view', true, false, false, false, false, false),
    -- Admissions (create + manage applications)
    ('admissions.view', true, true, true, false, false, true),
    ('admissions.create', true, true, true, false, false, true),
    ('admissions.update', true, true, true, false, false, true),
    ('admissions.export', true, true, true, false, false, true),
    -- Announcements (view only)
    ('announcements.view', true, false, false, false, false, false),
    -- Notifications (send to visitors)
    ('notifications.view', true, true, false, false, false, false),
    ('notifications.create', true, true, false, false, false, false),
    -- Support Tickets (manage visitor queries)
    ('support.view', true, true, true, false, false, false),
    ('support.create', true, true, true, false, false, false),
    ('support.update', true, true, true, false, false, false)
) AS t(code, r, c, u, d, a, e)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ROLE 9: LIBRARIAN
-- ============================================================================

INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('librarian'), get_permission_id_1EMAET(code), 
    r, c, u, d, a, e
FROM (VALUES 
    -- Dashboard (view only)
    ('dashboard.view', true, false, false, false, false, false),
    -- Students (view for library purposes)
    ('students.view', true, false, false, false, false, false),
    -- Teachers (view for library purposes)
    ('teachers.view', true, false, false, false, false, false),
    -- Inventory (full access)
    ('inventory.view', true, true, true, true, false, true),
    ('inventory.create', true, true, true, true, false, true),
    ('inventory.update', true, true, true, true, false, true),
    ('inventory.delete', true, true, true, true, false, true),
    ('inventory.export', true, true, true, true, false, true),
    -- Reports (library reports)
    ('reports.view', true, true, false, false, false, true),
    ('reports.create', true, true, false, false, false, true),
    ('reports.export', true, true, false, false, false, true)
) AS t(code, r, c, u, d, a, e)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ROLE 10: TRANSPORT MANAGER
-- ============================================================================

INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('transport_manager'), get_permission_id_1EMAET(code), 
    r, c, u, d, a, e
FROM (VALUES 
    -- Dashboard (view only)
    ('dashboard.view', true, false, false, false, false, false),
    -- Students (view for transport allocation)
    ('students.view', true, false, false, false, false, true),
    ('students.export', true, false, false, false, false, true),
    -- Transport (full access)
    ('transport.view', true, true, true, true, false, true),
    ('transport.create', true, true, true, true, false, true),
    ('transport.update', true, true, true, true, false, true),
    ('transport.delete', true, true, true, true, false, true),
    ('transport.export', true, true, true, true, false, true),
    -- Reports (transport reports)
    ('reports.view', true, true, false, false, false, true),
    ('reports.create', true, true, false, false, false, true),
    ('reports.export', true, true, false, false, false, true),
    -- Announcements (transport announcements)
    ('announcements.view', true, true, false, false, false, false),
    ('announcements.create', true, true, false, false, false, false)
) AS t(code, r, c, u, d, a, e)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ROLE 11: STUDENT
-- ============================================================================

INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('student'), get_permission_id_1EMAET(code), 
    r, c, u, d, a, e
FROM (VALUES 
    -- Dashboard (view student dashboard)
    ('dashboard.view', true, false, false, false, false, false),
    -- Profile (view + update own)
    ('profile.view', true, false, true, false, false, false),
    ('profile.update', true, false, true, false, false, false),
    -- Attendance (view own only)
    ('attendance.view', true, false, false, false, false, false),
    -- Timetable (view own section)
    ('timetable.view', true, false, false, false, false, false),
    -- Exams (view own)
    ('exams.view', true, false, false, false, false, false),
    -- Marks (view own)
    ('marks.view', true, false, false, false, false, false),
    -- Report Cards (view + download own)
    ('report_cards.view', true, false, false, false, false, true),
    ('report_cards.export', true, false, false, false, false, true),
    -- Fees (view own)
    ('fees.view', true, false, false, false, false, false),
    -- Assignments (view + submit own)
    ('assignments.view', true, true, false, false, false, false),
    ('assignments.create', true, true, false, false, false, false),
    -- Homework (view + submit own)
    ('homework.view', true, true, false, false, false, false),
    ('homework.create', true, true, false, false, false, false),
    -- Study Materials (view + download)
    ('study_materials.view', true, false, false, false, false, true),
    ('study_materials.export', true, false, false, false, false, true),
    -- Online Classes (view + join)
    ('online_classes.view', true, false, false, false, false, false),
    -- Doubts (ask doubts)
    ('doubts.view', true, true, false, false, false, false),
    ('doubts.create', true, true, false, false, false, false),
    -- Announcements (view only)
    ('announcements.view', true, false, false, false, false, false),
    -- Notifications (view own)
    ('notifications.view', true, false, false, false, false, false)
) AS t(code, r, c, u, d, a, e)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ROLE 12: PARENT
-- ============================================================================

INSERT INTO role_permissions_1EMAET (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('parent'), get_permission_id_1EMAET(code), 
    r, c, u, d, a, e
FROM (VALUES 
    -- Dashboard (view parent dashboard)
    ('dashboard.view', true, false, false, false, false, false),
    -- Profile (view + update own)
    ('profile.view', true, false, true, false, false, false),
    ('profile.update', true, false, true, false, false, false),
    -- Parent Portal (full access to children's info)
    ('parent.view', true, true, true, true, false, false),
    ('parent.create', true, true, true, true, false, false),
    ('parent.update', true, true, true, true, false, false),
    ('parent.delete', true, true, true, true, false, false),
    -- Students (view children only)
    ('students.view', true, false, false, false, false, false),
    -- Attendance (view children only)
    ('attendance.view', true, false, false, false, false, false),
    -- Timetable (view children only)
    ('timetable.view', true, false, false, false, false, false),
    -- Exams (view children only)
    ('exams.view', true, false, false, false, false, false),
    -- Marks (view children only)
    ('marks.view', true, false, false, false, false, false),
    -- Report Cards (view + download children only)
    ('report_cards.view', true, false, false, false, false, true),
    ('report_cards.export', true, false, false, false, false, true),
    -- Fees (view + pay)
    ('fees.view', true, true, false, false, false, false),
    ('fees.create', true, true, false, false, false, false),
    -- Homework (view children only)
    ('homework.view', true, false, false, false, false, false),
    -- Teachers (view children's teachers)
    ('teachers.view', true, false, false, false, false, false),
    -- Announcements (view only)
    ('announcements.view', true, false, false, false, false, false),
    -- Notifications (view own)
    ('notifications.view', true, false, false, false, false, false),
    -- PTM (book + manage slots)
    ('ptm.view', true, true, true, true, false, false),
    ('ptm.create', true, true, true, true, false, false),
    ('ptm.update', true, true, true, true, false, false),
    ('ptm.delete', true, true, true, true, false, false),
    -- Feedback (submit feedback)
    ('feedback.view', true, true, false, false, false, false),
    ('feedback.create', true, true, false, false, false, false),
    -- Support (submit tickets)
    ('support.view', true, true, true, false, false, false),
    ('support.create', true, true, true, false, false, false),
    ('support.update', true, true, true, false, false, false)
) AS t(code, r, c, u, d, a, e)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CLEANUP: Drop helper functions
-- ============================================================================

DROP FUNCTION IF EXISTS get_role_id_1EMAET(TEXT);
DROP FUNCTION IF EXISTS get_permission_id_1EMAET(TEXT);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify roles were created
-- SELECT role_code, role_name, is_system_role FROM roles_1EMAET ORDER BY role_code;

-- Verify modules were created
-- SELECT module_code, module_name, display_order FROM modules_1EMAET ORDER BY display_order;

-- Verify permissions count
-- SELECT COUNT(*) AS total_permissions FROM permissions_1EMAET;

-- Verify role-permission mappings per role
-- SELECT r.role_code, COUNT(rp.id) AS permission_count 
-- FROM roles_1EMAET r
-- LEFT JOIN role_permissions_1EMAET rp ON r.id = rp.role_id
-- GROUP BY r.role_code
-- ORDER BY r.role_code;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
