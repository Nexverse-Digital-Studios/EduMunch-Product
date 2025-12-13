-- =====================================================
-- CLEANUP SCRIPT: Remove Problematic Functions & Triggers
-- Run this FIRST to clean up the database
-- =====================================================

-- Drop all audit triggers
DROP TRIGGER IF EXISTS audit_organizations ON organizations CASCADE;
DROP TRIGGER IF EXISTS audit_branches ON branches CASCADE;
DROP TRIGGER IF EXISTS audit_users ON users CASCADE;
DROP TRIGGER IF EXISTS audit_roles ON roles CASCADE;

-- Drop the audit function
DROP FUNCTION IF EXISTS log_audit() CASCADE;

-- Drop all RLS policies
DROP POLICY IF EXISTS "Super admins can view all organizations" ON organizations;
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
DROP POLICY IF EXISTS "Super admins can create organizations" ON organizations;
DROP POLICY IF EXISTS "Super admins can update organizations" ON organizations;
DROP POLICY IF EXISTS "Org admins can update their organization" ON organizations;

DROP POLICY IF EXISTS "Users can view branches in their org" ON branches;
DROP POLICY IF EXISTS "Authorized users can create branches" ON branches;
DROP POLICY IF EXISTS "Authorized users can update branches" ON branches;
DROP POLICY IF EXISTS "Authorized users can delete branches" ON branches;

DROP POLICY IF EXISTS "Anyone can view system roles" ON roles;
DROP POLICY IF EXISTS "Users can view org custom roles" ON roles;
DROP POLICY IF EXISTS "Authorized users can create roles" ON roles;
DROP POLICY IF EXISTS "Authorized users can update roles" ON roles;
DROP POLICY IF EXISTS "Authorized users can delete roles" ON roles;

DROP POLICY IF EXISTS "Authenticated users can view permissions" ON permissions;
DROP POLICY IF EXISTS "Super admins can manage permissions" ON permissions;

DROP POLICY IF EXISTS "Users can view role permissions" ON role_permissions;
DROP POLICY IF EXISTS "Authorized users can manage role permissions" ON role_permissions;

DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can view org users" ON users;
DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Authorized users can create users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Authorized users can update users" ON users;
DROP POLICY IF EXISTS "Authorized users can delete users" ON users;

DROP POLICY IF EXISTS "Users can view org feature flags" ON feature_flags;
DROP POLICY IF EXISTS "Super admins can manage feature flags" ON feature_flags;

DROP POLICY IF EXISTS "Authorized users can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

DROP POLICY IF EXISTS "Users can view org custom fields" ON custom_fields;
DROP POLICY IF EXISTS "Authorized users can manage custom fields" ON custom_fields;

-- Drop helper functions
DROP FUNCTION IF EXISTS public.user_org_id() CASCADE;
DROP FUNCTION IF EXISTS public.user_branch_id() CASCADE;
DROP FUNCTION IF EXISTS public.user_role_id() CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS public.has_permission(text) CASCADE;

-- Disable RLS on all tables (we'll re-enable in migration 002)
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields DISABLE ROW LEVEL SECURITY;

-- Drop all tables
DROP TABLE IF EXISTS custom_fields CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS feature_flags CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

DO $$
BEGIN
    RAISE NOTICE '✅ Cleanup complete! Database is now clean.';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Next steps:';
    RAISE NOTICE '1. Run migration 001_core_tables.sql';
    RAISE NOTICE '2. Run migration 002_rls_policies.sql';
    RAISE NOTICE '3. Run migration 003_setup_first_org.sql';
END $$;
