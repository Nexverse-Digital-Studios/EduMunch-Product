-- =====================================================
-- EduMunch Database Schema - Phase 2: Core Infrastructure
-- Migration: 001_core_tables
-- Description: Organizations, Branches, Users, Roles, Permissions
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ORGANIZATIONS TABLE
-- =====================================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    website VARCHAR(255),
    
    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    pincode VARCHAR(10),
    
    -- Business Details
    gst_number VARCHAR(20),
    pan_number VARCHAR(20),
    
    -- Settings
    settings JSONB DEFAULT '{}',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    currency VARCHAR(10) DEFAULT 'INR',
    
    -- Subscription
    plan_type VARCHAR(50) DEFAULT 'free', -- free, basic, premium, enterprise
    plan_expires_at TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Create indexes
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_is_active ON organizations(is_active);

-- =====================================================
-- 2. BRANCHES TABLE
-- =====================================================
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    
    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    pincode VARCHAR(10),
    
    -- Branch Manager
    manager_id UUID,
    
    -- Settings
    settings JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    UNIQUE(org_id, code)
);

-- Create indexes
CREATE INDEX idx_branches_org_id ON branches(org_id);
CREATE INDEX idx_branches_is_active ON branches(is_active);
CREATE INDEX idx_branches_manager_id ON branches(manager_id);

-- =====================================================
-- 3. ROLES TABLE (Predefined + Custom)
-- =====================================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Role Type
    is_system_role BOOLEAN DEFAULT false, -- System roles cannot be deleted
    is_custom_role BOOLEAN DEFAULT false,
    
    -- Hierarchy
    level INTEGER DEFAULT 0, -- 0=highest (super_admin), 5=lowest (custom)
    
    -- Settings
    permissions JSONB DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    UNIQUE(org_id, slug)
);

-- Create indexes
CREATE INDEX idx_roles_org_id ON roles(org_id);
CREATE INDEX idx_roles_slug ON roles(slug);
CREATE INDEX idx_roles_is_system_role ON roles(is_system_role);

-- =====================================================
-- 4. PERMISSIONS TABLE
-- =====================================================
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    
    -- Grouping
    module VARCHAR(100) NOT NULL, -- academics, financial, hr, student, etc.
    category VARCHAR(100), -- Sub-category within module
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_permissions_module ON permissions(module);
CREATE INDEX idx_permissions_slug ON permissions(slug);

-- =====================================================
-- 5. ROLE_PERMISSIONS (Many-to-Many)
-- =====================================================
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    
    -- Custom restrictions per role-permission
    restrictions JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(role_id, permission_id)
);

-- Create indexes
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- =====================================================
-- 6. USERS TABLE (Extended Profile)
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    
    -- Basic Information
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(255),
    
    -- Profile
    avatar_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(20),
    
    -- Address
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    pincode VARCHAR(10),
    
    -- Role Assignment
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    
    -- Employment (for staff)
    employee_id VARCHAR(50),
    designation VARCHAR(100),
    department VARCHAR(100),
    joining_date DATE,
    
    -- Settings
    preferences JSONB DEFAULT '{}',
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    
    -- Last Activity
    last_login_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    UNIQUE(org_id, email)
);

-- Create indexes
CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_branch_id ON users(branch_id);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

-- =====================================================
-- 7. FEATURE_FLAGS TABLE
-- =====================================================
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    feature_key VARCHAR(100) NOT NULL,
    feature_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Status
    is_enabled BOOLEAN DEFAULT false,
    
    -- Configuration
    config JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(org_id, feature_key)
);

-- Create indexes
CREATE INDEX idx_feature_flags_org_id ON feature_flags(org_id);
CREATE INDEX idx_feature_flags_key ON feature_flags(feature_key);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(is_enabled);

-- =====================================================
-- 8. AUDIT_LOGS TABLE
-- =====================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Actor
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    
    -- Action
    action VARCHAR(100) NOT NULL, -- create, update, delete, login, logout, etc.
    entity_type VARCHAR(100), -- table name
    entity_id UUID,
    
    -- Details
    description TEXT,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB DEFAULT '{}',
    
    -- Request Info
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_audit_logs_org_id ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =====================================================
-- 9. CUSTOM_FIELDS TABLE
-- =====================================================
CREATE TABLE custom_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    entity_type VARCHAR(100) NOT NULL, -- student, employee, course, etc.
    field_name VARCHAR(100) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL, -- text, number, date, select, multiselect, etc.
    
    -- Configuration
    is_required BOOLEAN DEFAULT false,
    default_value TEXT,
    options JSONB, -- For select/multiselect
    validation_rules JSONB,
    
    -- Display
    display_order INTEGER DEFAULT 0,
    placeholder TEXT,
    help_text TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(org_id, entity_type, field_name)
);

-- Create indexes
CREATE INDEX idx_custom_fields_org_id ON custom_fields(org_id);
CREATE INDEX idx_custom_fields_entity_type ON custom_fields(entity_type);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_fields_updated_at BEFORE UPDATE ON custom_fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA: System Roles
-- =====================================================

INSERT INTO roles (id, org_id, name, slug, description, is_system_role, level) VALUES
    ('00000000-0000-0000-0000-000000000001', NULL, 'Super Admin', 'super_admin', 'System administrator with full access', true, 0),
    ('00000000-0000-0000-0000-000000000002', NULL, 'Branch Admin', 'branch_admin', 'Branch administrator', true, 1),
    ('00000000-0000-0000-0000-000000000003', NULL, 'Teacher', 'teacher', 'Teaching staff', true, 2),
    ('00000000-0000-0000-0000-000000000004', NULL, 'Student', 'student', 'Student user', true, 3),
    ('00000000-0000-0000-0000-000000000005', NULL, 'Parent', 'parent', 'Parent/Guardian', true, 3),
    ('00000000-0000-0000-0000-000000000006', NULL, 'Employee', 'employee', 'Non-teaching staff', true, 3),
    ('00000000-0000-0000-0000-000000000007', NULL, 'Front Desk', 'front_desk', 'Front desk staff', true, 2);

-- =====================================================
-- SEED DATA: Core Permissions
-- =====================================================

INSERT INTO permissions (name, slug, module, category, description) VALUES
    -- User Management
    ('View Users', 'users:view', 'users', 'read', 'View user list'),
    ('Create Users', 'users:create', 'users', 'write', 'Create new users'),
    ('Update Users', 'users:update', 'users', 'write', 'Update user details'),
    ('Delete Users', 'users:delete', 'users', 'write', 'Delete users'),
    
    -- Organization Management
    ('View Organization', 'organization:view', 'organization', 'read', 'View organization details'),
    ('Update Organization', 'organization:update', 'organization', 'write', 'Update organization settings'),
    
    -- Branch Management
    ('View Branches', 'branches:view', 'branches', 'read', 'View branch list'),
    ('Create Branches', 'branches:create', 'branches', 'write', 'Create new branches'),
    ('Update Branches', 'branches:update', 'branches', 'write', 'Update branch details'),
    ('Delete Branches', 'branches:delete', 'branches', 'write', 'Delete branches'),
    
    -- Role Management
    ('View Roles', 'roles:view', 'roles', 'read', 'View role list'),
    ('Create Roles', 'roles:create', 'roles', 'write', 'Create custom roles'),
    ('Update Roles', 'roles:update', 'roles', 'write', 'Update role details'),
    ('Delete Roles', 'roles:delete', 'roles', 'write', 'Delete custom roles'),
    
    -- Dashboard
    ('View Dashboard', 'dashboard:view', 'dashboard', 'read', 'Access dashboard');

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Core tables created successfully!';
    RAISE NOTICE '📊 Tables created: 9';
    RAISE NOTICE '👥 System roles created: 7';
    RAISE NOTICE '🔐 Base permissions created: 15';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Next steps:';
    RAISE NOTICE '1. Run 002_rls_policies.sql to enable Row Level Security';
    RAISE NOTICE '2. Create your first organization in Supabase dashboard';
    RAISE NOTICE '3. Set up authentication in the frontend';
END $$;
