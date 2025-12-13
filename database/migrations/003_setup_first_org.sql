-- =====================================================
-- SETUP SCRIPT: Create First Organization & Super Admin
-- Run this AFTER migrations 001 and 002
-- =====================================================

-- Step 1: Create a test organization
INSERT INTO organizations (
    id,
    name,
    display_name,
    slug,
    email,
    phone,
    city,
    state,
    country,
    is_active,
    is_verified,
    plan_type
) VALUES (
    '11111111-1111-1111-1111-111111111111', -- Use a fixed UUID for testing
    'Demo Institute',
    'Demo Institute of Excellence',
    'demo-institute',
    'admin@demoinstitute.com',
    '+91-9876543210',
    'Mumbai',
    'Maharashtra',
    'India',
    true,
    true,
    'premium'
) ON CONFLICT (slug) DO NOTHING;

-- Step 2: Create main branch for the organization
INSERT INTO branches (
    id,
    org_id,
    name,
    code,
    email,
    phone,
    city,
    state,
    country,
    is_active,
    is_primary
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Main Campus',
    'MAIN',
    'main@demoinstitute.com',
    '+91-9876543210',
    'Mumbai',
    'Maharashtra',
    'India',
    true,
    true
) ON CONFLICT (org_id, code) DO NOTHING;

-- Step 3: Enable key feature flags for the organization
INSERT INTO feature_flags (org_id, feature_key, feature_name, is_enabled) VALUES
    ('11111111-1111-1111-1111-111111111111', 'academics', 'Academic Management', true),
    ('11111111-1111-1111-1111-111111111111', 'admissions', 'Student Admissions', true),
    ('11111111-1111-1111-1111-111111111111', 'financial', 'Financial Management', true),
    ('11111111-1111-1111-1111-111111111111', 'hr', 'Human Resources', true),
    ('11111111-1111-1111-1111-111111111111', 'communication', 'Communication System', true),
    ('11111111-1111-1111-1111-111111111111', 'attendance', 'Attendance Tracking', true),
    ('11111111-1111-1111-1111-111111111111', 'lms', 'Learning Management', true),
    ('11111111-1111-1111-1111-111111111111', 'reports', 'Reports & Analytics', true)
ON CONFLICT (org_id, feature_key) DO NOTHING;

-- Step 4: Grant all permissions to super_admin role
-- First, get permission IDs and insert into role_permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    '00000000-0000-0000-0000-000000000001' as role_id,
    p.id as permission_id
FROM permissions p
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =====================================================
-- MANUAL STEP: Create Super Admin User
-- =====================================================

-- After running this script:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" (or use Supabase Auth signup in your app)
-- 3. Create user with email: superadmin@demoinstitute.com
-- 4. Copy the user's UUID from the auth.users table
-- 5. Run this INSERT with that UUID:

/*
INSERT INTO users (
    id, -- USER UUID FROM AUTH.USERS
    org_id,
    branch_id,
    email,
    first_name,
    last_name,
    display_name,
    role_id,
    is_active,
    is_verified,
    email_verified
) VALUES (
    'PASTE-USER-UUID-HERE', -- Replace with actual UUID from auth.users
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'superadmin@demoinstitute.com',
    'Super',
    'Admin',
    'Super Admin',
    '00000000-0000-0000-0000-000000000001', -- super_admin role
    true,
    true,
    true
);
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check organization created
SELECT id, name, slug, is_active FROM organizations 
WHERE slug = 'demo-institute';

-- Check branch created
SELECT id, name, code, is_primary FROM branches 
WHERE org_id = '11111111-1111-1111-1111-111111111111';

-- Check feature flags
SELECT feature_key, feature_name, is_enabled FROM feature_flags 
WHERE org_id = '11111111-1111-1111-1111-111111111111';

-- Check super admin role has permissions
SELECT COUNT(*) as permission_count FROM role_permissions 
WHERE role_id = '00000000-0000-0000-0000-000000000001';

-- Check if super admin user exists (run after manual user creation)
SELECT u.email, u.display_name, r.name as role 
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE u.email = 'superadmin@demoinstitute.com';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Organization setup complete!';
    RAISE NOTICE '🏢 Organization: Demo Institute';
    RAISE NOTICE '🌳 Branch: Main Campus';
    RAISE NOTICE '🎯 Feature flags: 8 enabled';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ IMPORTANT: Now create a user in Supabase Auth Dashboard';
    RAISE NOTICE '📧 Email: superadmin@demoinstitute.com';
    RAISE NOTICE '🔑 Password: (set your own secure password)';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Then uncomment and run the INSERT INTO users query above';
    RAISE NOTICE '   with the user UUID from auth.users table';
END $$;
