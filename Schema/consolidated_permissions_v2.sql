-- ============================================================================
-- EDUMUNCH: COMPLETE PERMISSION SCHEMA FOR CONSOLIDATED ROUTES
-- ============================================================================
-- Version: 2.0 (Aligned with Route Consolidation Plan)
-- Date: January 2026
-- 
-- Changes from previous schema:
-- 1. Reduced from 390+ routes to 60 consolidated routes
-- 2. ONE permission per module (not per action)
-- 3. CRUD flags stored in role_permissions, not permissions table
-- 4. Simplified parent access (view-only for most modules)
-- 
-- INDEX_TOKEN: Replace '1EMAET' with your school's token
-- ============================================================================

-- ============================================================================
-- STEP 0: HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_role_id_1EMAET(p_role_code TEXT)
RETURNS UUID AS $$
    SELECT id FROM roles_1emaet WHERE role_code = p_role_code LIMIT 1;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_perm_id_1EMAET(p_module_code TEXT)
RETURNS UUID AS $$
    SELECT id FROM permissions_1emaet WHERE permission_code = p_module_code LIMIT 1;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_module_id_1EMAET(p_module_code TEXT)
RETURNS UUID AS $$
    SELECT id FROM modules_1emaet WHERE module_code = p_module_code LIMIT 1;
$$ LANGUAGE SQL;


-- ============================================================================
-- STEP 1: MODULES TABLE
-- ============================================================================
-- 47 modules aligned with consolidated routes

DELETE FROM modules_1emaet;

INSERT INTO modules_1emaet (id, module_code, module_name, description, display_order, icon, is_active) VALUES
-- CORE (Always visible, Tier 1)
(gen_random_uuid(), 'dashboard', 'Dashboard', 'Main dashboard with analytics and overview', 1, 'LayoutDashboard', true),
(gen_random_uuid(), 'profile', 'My Profile', 'User profile and settings', 2, 'User', true),

-- USER MANAGEMENT (Tier 1)
(gen_random_uuid(), 'users', 'Users', 'User account management', 10, 'Users', true),
(gen_random_uuid(), 'roles', 'Roles', 'Role management and assignment', 11, 'Shield', true),
(gen_random_uuid(), 'permissions', 'Permissions', 'Permission configuration', 12, 'Key', true),

-- PEOPLE MANAGEMENT (Tier 1)
(gen_random_uuid(), 'students', 'Students', 'Student records and management', 20, 'GraduationCap', true),
(gen_random_uuid(), 'parents', 'Parents', 'Parent records management', 21, 'Users', true),
(gen_random_uuid(), 'teachers', 'Teachers', 'Teacher records and assignments', 22, 'BookOpen', true),
(gen_random_uuid(), 'employees', 'Employees', 'Non-teaching staff management', 23, 'Briefcase', true),

-- PARENT PORTAL (Tier 1 - Parent Role Only)
(gen_random_uuid(), 'parent', 'Parent Portal', 'Parent self-service portal', 25, 'Home', true),

-- ACADEMIC STRUCTURE (Tier 1)
(gen_random_uuid(), 'academic_years', 'Academic Years', 'Academic year configuration', 30, 'Calendar', true),
(gen_random_uuid(), 'classes', 'Classes', 'Class/grade management', 31, 'School', true),
(gen_random_uuid(), 'sections', 'Sections', 'Section/batch management', 32, 'Layout', true),
(gen_random_uuid(), 'subjects', 'Subjects', 'Subject curriculum management', 33, 'Book', true),
(gen_random_uuid(), 'topics', 'Topics', 'Topic and content management', 34, 'FileText', true),

-- ATTENDANCE & LEAVE (Tier 1)
(gen_random_uuid(), 'attendance', 'Student Attendance', 'Student attendance tracking', 40, 'CheckSquare', true),
(gen_random_uuid(), 'staff_attendance', 'Staff Attendance', 'Staff attendance tracking', 41, 'CheckSquare', true),
(gen_random_uuid(), 'leave', 'Student Leave', 'Student leave management', 42, 'Calendar', true),
(gen_random_uuid(), 'staff_leave', 'Staff Leave', 'Staff leave management', 43, 'Calendar', true),

-- TIMETABLE (Tier 1)
(gen_random_uuid(), 'timetable', 'Timetable', 'Timetable management', 50, 'Clock', true),
(gen_random_uuid(), 'lecture_templates', 'Lecture Templates', 'Lecture schedule templates', 51, 'Layout', true),

-- EXAMINATIONS (Tier 1)
(gen_random_uuid(), 'exams', 'Examinations', 'Exam management and scheduling', 60, 'ClipboardList', true),
(gen_random_uuid(), 'report_cards', 'Report Cards', 'Report card generation', 62, 'FileText', true),

-- FINANCE (Tier 1)
(gen_random_uuid(), 'fees', 'Fee Management', 'Fee structures and collection', 70, 'IndianRupee', true),

-- COMMUNICATION (Tier 1)
(gen_random_uuid(), 'announcements', 'Announcements', 'School announcements', 80, 'Megaphone', true),
(gen_random_uuid(), 'notifications', 'Notifications', 'User notifications', 81, 'Bell', true),
(gen_random_uuid(), 'messages', 'Messages', 'SMS/Email messaging', 82, 'MessageSquare', true),

-- SETTINGS & REPORTS (Tier 1)
(gen_random_uuid(), 'settings', 'Settings', 'System configuration', 90, 'Settings', true),
(gen_random_uuid(), 'id_cards', 'ID Cards', 'ID card generation', 91, 'CreditCard', true),
(gen_random_uuid(), 'reports', 'Reports', 'System reports', 92, 'BarChart3', true),

-- TIER 2: LEARNING
(gen_random_uuid(), 'assignments', 'Assignments', 'Assignment management', 100, 'FileEdit', true),
(gen_random_uuid(), 'study_materials', 'Study Materials', 'Learning materials', 101, 'FolderOpen', true),
(gen_random_uuid(), 'online_classes', 'Online Classes', 'Virtual classroom sessions', 102, 'Video', true),
(gen_random_uuid(), 'homework', 'Homework', 'Homework management', 103, 'BookOpen', true),
(gen_random_uuid(), 'doubts', 'Doubts', 'Student doubt resolution', 104, 'HelpCircle', true),

-- TIER 2: TRANSPORT
(gen_random_uuid(), 'transport', 'Transport', 'Transport management', 110, 'Bus', true),

-- TIER 2: HR & PAYROLL
(gen_random_uuid(), 'payroll', 'Payroll', 'Salary processing', 120, 'Wallet', true),
(gen_random_uuid(), 'appraisals', 'Appraisals', 'Performance reviews', 121, 'Award', true),
(gen_random_uuid(), 'recruitment', 'Recruitment', 'Job postings and hiring', 122, 'UserPlus', true),

-- TIER 2: SUPPORT & FEEDBACK
(gen_random_uuid(), 'feedback', 'Feedback', 'User feedback collection', 130, 'MessageCircle', true),
(gen_random_uuid(), 'grievances', 'Grievances', 'Grievance handling', 131, 'AlertTriangle', true),
(gen_random_uuid(), 'support', 'Support', 'Support ticket system', 132, 'LifeBuoy', true),

-- TIER 3: ENGAGEMENT
(gen_random_uuid(), 'ptm', 'PTM', 'Parent-teacher meetings', 140, 'Users', true),
(gen_random_uuid(), 'surveys', 'Surveys', 'Survey management', 141, 'ClipboardCheck', true),
(gen_random_uuid(), 'certificates', 'Certificates', 'Certificate generation', 142, 'Award', true),

-- TIER 3: ADMISSIONS
(gen_random_uuid(), 'admissions', 'Admissions', 'Admission management', 150, 'UserPlus', true),

-- TIER 3: INVENTORY & ASSETS
(gen_random_uuid(), 'inventory', 'Inventory', 'Inventory and assets', 160, 'Package', true),
(gen_random_uuid(), 'library', 'Library', 'Library management', 161, 'Library', true),

-- TIER 3: ANALYTICS
(gen_random_uuid(), 'analytics', 'Analytics', 'Analytics and insights', 170, 'TrendingUp', true);


-- ============================================================================
-- STEP 2: PERMISSIONS TABLE (ONE per module)
-- ============================================================================

DELETE FROM role_permissions_1emaet;
DELETE FROM permissions_1emaet;

INSERT INTO permissions_1emaet (id, module_id, permission_code, permission_name, description, is_active)
SELECT 
    gen_random_uuid(),
    m.id,
    m.module_code,
    m.module_name || ' Access',
    'Access to ' || m.module_name || ' module',
    true
FROM modules_1emaet m;


-- ============================================================================
-- STEP 3: ROLES TABLE
-- ============================================================================

DELETE FROM user_roles_1emaet;
DELETE FROM roles_1emaet;

INSERT INTO roles_1emaet (id, role_code, role_name, description, is_system_role, is_active) VALUES
(gen_random_uuid(), 'super_admin', 'Super Admin', 'Full system access - bypasses all permission checks', true, true),
(gen_random_uuid(), 'principal', 'Principal', 'School principal with full operational access', true, true),
(gen_random_uuid(), 'vice_principal', 'Vice Principal', 'Deputy school head with broad access', true, true),
(gen_random_uuid(), 'admin', 'Administrator', 'Administrative staff with management access', true, true),
(gen_random_uuid(), 'accountant', 'Accountant', 'Finance and fee management access', true, true),
(gen_random_uuid(), 'hr_manager', 'HR Manager', 'Human resources management access', true, true),
(gen_random_uuid(), 'teacher', 'Teacher', 'Teaching staff with classroom access', true, true),
(gen_random_uuid(), 'class_teacher', 'Class Teacher', 'Class teacher with section management', true, true),
(gen_random_uuid(), 'exam_coordinator', 'Exam Coordinator', 'Examination management access', true, true),
(gen_random_uuid(), 'transport_manager', 'Transport Manager', 'Transport operations access', true, true),
(gen_random_uuid(), 'librarian', 'Librarian', 'Library management access', true, true),
(gen_random_uuid(), 'parent', 'Parent', 'Parent portal access - view children info only', true, true),
(gen_random_uuid(), 'student', 'Student', 'Student self-service access', true, true);


-- ============================================================================
-- STEP 4: ROLE PERMISSIONS MAPPING
-- ============================================================================

-- ============================================================================
-- ROLE 1: SUPER_ADMIN - Full access to everything
-- ============================================================================
INSERT INTO role_permissions_1emaet (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('super_admin'), p.id, true, true, true, true, true, true
FROM permissions_1emaet p;

-- ============================================================================
-- ROLE 2: PRINCIPAL - Full access except parent portal
-- ============================================================================
INSERT INTO role_permissions_1emaet (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('principal'), p.id, true, true, true, true, true, true
FROM permissions_1emaet p
WHERE p.permission_code != 'parent';

-- ============================================================================
-- ROLE 3: VICE_PRINCIPAL - Similar to principal, limited on critical modules
-- ============================================================================
INSERT INTO role_permissions_1emaet (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('vice_principal'), p.id, 
    true,
    CASE WHEN p.permission_code IN ('roles', 'permissions', 'settings') THEN false ELSE true END,
    CASE WHEN p.permission_code IN ('roles', 'permissions') THEN false ELSE true END,
    CASE WHEN p.permission_code IN ('roles', 'permissions', 'users', 'settings') THEN false ELSE true END,
    true,
    true
FROM permissions_1emaet p
WHERE p.permission_code != 'parent';

-- ============================================================================
-- ROLE 4: ADMIN - Administrative access
-- ============================================================================
INSERT INTO role_permissions_1emaet (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('admin'), p.id,
    true, true, true, 
    CASE WHEN p.permission_code IN ('users', 'roles') THEN false ELSE true END,
    false, true
FROM permissions_1emaet p
WHERE p.permission_code IN (
    'dashboard', 'profile', 'users', 'students', 'parents', 'teachers', 'employees',
    'academic_years', 'classes', 'sections', 'subjects', 'topics',
    'attendance', 'leave', 'timetable', 'lecture_templates',
    'exams', 'report_cards', 'announcements', 'notifications', 'messages',
    'id_cards', 'reports', 'admissions', 'certificates'
);

-- ============================================================================
-- ROLE 5: ACCOUNTANT - Finance-focused access
-- ============================================================================
INSERT INTO role_permissions_1emaet (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('accountant'), p.id,
    true,
    CASE WHEN p.permission_code = 'fees' THEN true ELSE false END,
    CASE WHEN p.permission_code IN ('fees', 'profile') THEN true ELSE false END,
    false,
    CASE WHEN p.permission_code = 'fees' THEN true ELSE false END,
    true
FROM permissions_1emaet p
WHERE p.permission_code IN (
    'dashboard', 'profile', 'students', 'parents', 'fees', 'reports', 'notifications'
);

-- ============================================================================
-- ROLE 6: HR_MANAGER - HR-focused access
-- ============================================================================
INSERT INTO role_permissions_1emaet (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('hr_manager'), p.id,
    true, true, true, 
    CASE WHEN p.permission_code IN ('teachers', 'employees') THEN false ELSE true END,
    true, true
FROM permissions_1emaet p
WHERE p.permission_code IN (
    'dashboard', 'profile', 'teachers', 'employees', 'staff_attendance', 'staff_leave',
    'payroll', 'appraisals', 'recruitment', 'reports', 'notifications'
);

-- ============================================================================
-- ROLE 7: TEACHER - Classroom-focused access
-- ============================================================================
INSERT INTO role_permissions_1emaet (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('teacher'), p.id,
    true,
    CASE WHEN p.permission_code IN ('assignments', 'homework', 'study_materials', 'doubts', 'online_classes') THEN true ELSE false END,
    CASE WHEN p.permission_code IN ('profile', 'attendance', 'assignments', 'homework', 'study_materials', 'doubts', 'exams') THEN true ELSE false END,
    CASE WHEN p.permission_code IN ('assignments', 'homework', 'study_materials') THEN true ELSE false END,
    false, 
    CASE WHEN p.permission_code IN ('reports', 'report_cards') THEN true ELSE false END
FROM permissions_1emaet p
WHERE p.permission_code IN (
    'dashboard', 'profile', 'students', 'parents', 'attendance', 'timetable',
    'exams', 'report_cards', 'assignments', 'homework', 'study_materials',
    'online_classes', 'doubts', 'announcements', 'notifications', 'ptm', 'feedback'
);

-- ============================================================================
-- ROLE 8: CLASS_TEACHER - Extended teacher access for section
-- ============================================================================
INSERT INTO role_permissions_1emaet (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('class_teacher'), p.id,
    true,
    CASE WHEN p.permission_code IN ('assignments', 'homework', 'study_materials', 'doubts', 'online_classes', 'leave') THEN true ELSE false END,
    CASE WHEN p.permission_code IN ('profile', 'attendance', 'leave', 'assignments', 'homework', 'exams') THEN true ELSE false END,
    CASE WHEN p.permission_code IN ('assignments', 'homework', 'study_materials') THEN true ELSE false END,
    CASE WHEN p.permission_code = 'leave' THEN true ELSE false END,
    true
FROM permissions_1emaet p
WHERE p.permission_code IN (
    'dashboard', 'profile', 'students', 'parents', 'attendance', 'leave', 'timetable',
    'exams', 'report_cards', 'assignments', 'homework', 'study_materials',
    'online_classes', 'doubts', 'announcements', 'notifications', 'ptm', 'feedback', 'reports'
);

-- ============================================================================
-- ROLE 9: EXAM_COORDINATOR - Examination management
-- ============================================================================
INSERT INTO role_permissions_1emaet (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('exam_coordinator'), p.id,
    true, 
    CASE WHEN p.permission_code IN ('exams', 'report_cards') THEN true ELSE false END,
    CASE WHEN p.permission_code IN ('profile', 'exams', 'report_cards') THEN true ELSE false END, 
    CASE WHEN p.permission_code = 'exams' THEN true ELSE false END,
    true, true
FROM permissions_1emaet p
WHERE p.permission_code IN (
    'dashboard', 'profile', 'students', 'classes', 'sections', 'subjects',
    'exams', 'report_cards', 'reports', 'notifications', 'certificates'
);

-- ============================================================================
-- ROLE 10: TRANSPORT_MANAGER - Transport operations
-- ============================================================================
INSERT INTO role_permissions_1emaet (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('transport_manager'), p.id,
    true, 
    CASE WHEN p.permission_code = 'transport' THEN true ELSE false END,
    CASE WHEN p.permission_code IN ('profile', 'transport') THEN true ELSE false END, 
    CASE WHEN p.permission_code = 'transport' THEN true ELSE false END,
    false, true
FROM permissions_1emaet p
WHERE p.permission_code IN (
    'dashboard', 'profile', 'students', 'transport', 'notifications', 'reports'
);

-- ============================================================================
-- ROLE 11: LIBRARIAN - Library management
-- ============================================================================
INSERT INTO role_permissions_1emaet (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('librarian'), p.id,
    true, 
    CASE WHEN p.permission_code = 'library' THEN true ELSE false END,
    CASE WHEN p.permission_code IN ('profile', 'library') THEN true ELSE false END, 
    CASE WHEN p.permission_code = 'library' THEN true ELSE false END,
    false, true
FROM permissions_1emaet p
WHERE p.permission_code IN (
    'dashboard', 'profile', 'students', 'teachers', 'library', 'notifications', 'reports'
);

-- ============================================================================
-- ROLE 12: PARENT - Parent portal access (VIEW ONLY for most)
-- ============================================================================
-- CRITICAL: Parents should NOT create fee structures, only VIEW their child's fees
INSERT INTO role_permissions_1emaet (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('parent'), p.id,
    true, -- can_read: always yes
    CASE 
        WHEN p.permission_code IN ('ptm', 'feedback', 'support', 'grievances') THEN true 
        ELSE false 
    END, -- can_create: only for engagement modules
    CASE 
        WHEN p.permission_code IN ('profile', 'ptm', 'support') THEN true 
        ELSE false 
    END, -- can_update: only profile and their own bookings/tickets
    CASE 
        WHEN p.permission_code = 'ptm' THEN true 
        ELSE false 
    END, -- can_delete: only PTM bookings
    false, -- can_approve: never
    CASE 
        WHEN p.permission_code = 'report_cards' THEN true 
        ELSE false 
    END -- can_export: only report cards
FROM permissions_1emaet p
WHERE p.permission_code IN (
    'dashboard',        -- View parent dashboard
    'profile',          -- View/update own profile
    'parent',           -- Parent portal (main module)
    'attendance',       -- View child's attendance (READ ONLY)
    'timetable',        -- View child's timetable (READ ONLY)
    'exams',            -- View child's exam schedule (READ ONLY)
    'report_cards',     -- View/download child's report cards
    'homework',         -- View child's homework (READ ONLY)
    'fees',             -- View child's fees ONLY (NO CREATE!)
    'announcements',    -- View announcements (READ ONLY)
    'notifications',    -- View notifications (READ ONLY)
    'ptm',              -- Book/manage PTM slots
    'feedback',         -- Submit feedback
    'support',          -- Submit support tickets
    'grievances'        -- Submit grievances
);

-- ============================================================================
-- ROLE 13: STUDENT - Student self-service access
-- ============================================================================
INSERT INTO role_permissions_1emaet (id, role_id, permission_id, can_read, can_create, can_update, can_delete, can_approve, can_export)
SELECT gen_random_uuid(), get_role_id_1EMAET('student'), p.id,
    true, -- can_read: always yes
    CASE 
        WHEN p.permission_code IN ('doubts', 'feedback', 'support') THEN true 
        ELSE false 
    END, -- can_create: only doubts, feedback, support
    CASE 
        WHEN p.permission_code IN ('profile', 'doubts') THEN true 
        ELSE false 
    END, -- can_update: only profile and own doubts
    false, -- can_delete: never
    false, -- can_approve: never
    CASE 
        WHEN p.permission_code = 'report_cards' THEN true 
        ELSE false 
    END -- can_export: only report cards
FROM permissions_1emaet p
WHERE p.permission_code IN (
    'dashboard',        -- View student dashboard
    'profile',          -- View/update own profile
    'attendance',       -- View own attendance
    'timetable',        -- View own timetable
    'exams',            -- View exam schedule
    'report_cards',     -- View/download own report cards
    'assignments',      -- View assignments
    'homework',         -- View homework
    'study_materials',  -- View study materials
    'online_classes',   -- Join online classes
    'doubts',           -- Ask/view doubts
    'fees',             -- View own fees
    'announcements',    -- View announcements
    'notifications',    -- View notifications
    'feedback',         -- Submit feedback
    'support'           -- Submit support tickets
);


-- ============================================================================
-- STEP 5: SYNC USER_ROLES TABLE
-- ============================================================================
-- Ensure users with primary_role_id have corresponding user_roles entry

INSERT INTO user_roles_1emaet (id, user_id, role_id, is_primary, assigned_by, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    u.id,
    u.primary_role_id,
    true,
    null,
    now(),
    now()
FROM users_1emaet u
WHERE u.primary_role_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM user_roles_1emaet ur 
    WHERE ur.user_id = u.id AND ur.role_id = u.primary_role_id
);


-- ============================================================================
-- STEP 6: CLEANUP HELPER FUNCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS get_role_id_1EMAET(TEXT);
DROP FUNCTION IF EXISTS get_perm_id_1EMAET(TEXT);
DROP FUNCTION IF EXISTS get_module_id_1EMAET(TEXT);


-- ============================================================================
-- STEP 7: CREATE RPC FUNCTION FOR PERMISSION CHECK
-- ============================================================================

-- Drop existing function first to allow return type changes
DROP FUNCTION IF EXISTS get_user_permissions_1EMAET(UUID);

CREATE OR REPLACE FUNCTION get_user_permissions_1EMAET(p_user_id UUID)
RETURNS TABLE (
    permission_code TEXT,
    module_code TEXT,
    module_name TEXT,
    can_read BOOLEAN,
    can_create BOOLEAN,
    can_update BOOLEAN,
    can_delete BOOLEAN,
    can_approve BOOLEAN,
    can_export BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.permission_code::TEXT,
        m.module_code::TEXT,
        m.module_name::TEXT,
        COALESCE(MAX(rp.can_read::INT), 0)::BOOLEAN as can_read,
        COALESCE(MAX(rp.can_create::INT), 0)::BOOLEAN as can_create,
        COALESCE(MAX(rp.can_update::INT), 0)::BOOLEAN as can_update,
        COALESCE(MAX(rp.can_delete::INT), 0)::BOOLEAN as can_delete,
        COALESCE(MAX(rp.can_approve::INT), 0)::BOOLEAN as can_approve,
        COALESCE(MAX(rp.can_export::INT), 0)::BOOLEAN as can_export
    FROM user_roles_1emaet ur
    JOIN role_permissions_1emaet rp ON rp.role_id = ur.role_id
    JOIN permissions_1emaet p ON p.id = rp.permission_id
    JOIN modules_1emaet m ON m.id = p.module_id
    WHERE ur.user_id = p_user_id
    AND m.is_active = true
    AND p.is_active = true
    GROUP BY p.permission_code, m.module_code, m.module_name, m.display_order
    ORDER BY m.display_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- VERIFICATION QUERIES (Run to verify setup)
-- ============================================================================

-- Check module count (Should be 47)
SELECT COUNT(*) as module_count FROM modules_1emaet;

-- Check permission count (Should be 47)
SELECT COUNT(*) as permission_count FROM permissions_1emaet;

-- Check role count (Should be 13)
SELECT COUNT(*) as role_count FROM roles_1emaet;

-- Check role permissions distribution
SELECT r.role_name, COUNT(rp.id) as permission_count
FROM roles_1emaet r
LEFT JOIN role_permissions_1emaet rp ON rp.role_id = r.id
GROUP BY r.role_name
ORDER BY r.role_name;

-- Check parent permissions specifically (IMPORTANT!)
SELECT p.permission_code, rp.can_read, rp.can_create, rp.can_update, rp.can_delete, rp.can_export
FROM role_permissions_1emaet rp
JOIN roles_1emaet r ON r.id = rp.role_id
JOIN permissions_1emaet p ON p.id = rp.permission_id
WHERE r.role_code = 'parent'
ORDER BY p.permission_code;
