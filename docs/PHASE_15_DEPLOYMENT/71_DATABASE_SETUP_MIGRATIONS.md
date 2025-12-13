# 71 - Database Setup & Migrations

## Overview

This guide covers the complete database setup process for EduMunch including schema creation, migrations, Row Level Security (RLS) policies, and initial seed data.

**Technology:** Supabase PostgreSQL, PostgreSQL migrations, RLS policies

---

## Table of Contents

1. Database Connection Setup
2. Schema Creation
3. Table Definitions
4. Indexes & Constraints
5. Row Level Security (RLS)
6. Migrations Management
7. Seed Data
8. Backup & Recovery
9. Performance Optimization
10. Troubleshooting

---

## 1. Database Connection Setup

### Supabase Project Setup

**Create Supabase Project:**
1. Go to `supabase.com`
2. Sign in to dashboard
3. Click **New Project**
4. Configure:
   - Project name
   - Database password (strong, save securely)
   - Region (choose closest to users)
5. Create project (takes 2-5 minutes)

**Getting Connection Details:**
1. Go to project **Settings**
2. Navigate to **Database**
3. Copy connection details:
   - Host: `[project].supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - User: `postgres`
   - Password: (saved during setup)

### Environment Variables

**Create `.env.local` file:**
```
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
DATABASE_URL=postgres://postgres:[password]@[project].supabase.co:5432/postgres
```

**Get Keys from Supabase:**
1. Go to **Settings → API**
2. Copy:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - Anon/Public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Service Role key (SUPABASE_SERVICE_ROLE_KEY)

### Database Client Setup

**Node.js/TypeScript:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default supabase
```

**Admin Client (Backend):**
```typescript
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default adminClient
```

---

## 2. Schema Creation

### Organizations Schema

**Execute in Supabase SQL Editor:**

```sql
-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50),
    website VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    logo_url VARCHAR(500),
    banner_url VARCHAR(500),
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(email),
    CONSTRAINT organization_status_check CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Create index for lookups
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_email ON organizations(email);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_organizations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_timestamp
BEFORE UPDATE ON organizations
FOR EACH ROW
EXECUTE FUNCTION update_organizations_timestamp();
```

### Users & Authentication Schema

```sql
-- Users table (integrates with Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    user_type VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    branch_id UUID,
    status VARCHAR(50) DEFAULT 'active',
    last_login TIMESTAMP,
    last_login_ip INET,
    login_count INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked BOOLEAN DEFAULT false,
    locked_until TIMESTAMP,
    password_changed_at TIMESTAMP,
    avatar_url VARCHAR(500),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT user_type_check CHECK (user_type IN ('student', 'teacher', 'staff', 'admin', 'parent')),
    CONSTRAINT role_check CHECK (role IN ('student', 'teacher', 'admin', 'super_admin', 'staff', 'parent', 'accountant'))
);

CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_status ON users(status);

CREATE TRIGGER users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
```

### Branches Schema

```sql
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    email VARCHAR(255),
    contact_person VARCHAR(255),
    principal_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'active',
    working_hours_start TIME,
    working_hours_end TIME,
    facilities JSONB,
    capacity INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(organization_id, email),
    CONSTRAINT branch_status_check CHECK (status IN ('active', 'inactive', 'closed'))
);

CREATE INDEX idx_branches_organization ON branches(organization_id);
CREATE INDEX idx_branches_status ON branches(status);
```

### Courses & Batches Schema

```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_hours INTEGER,
    duration_weeks INTEGER,
    department VARCHAR(100),
    level VARCHAR(50),
    capacity INTEGER,
    prerequisites TEXT,
    learning_outcomes JSONB,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(organization_id, code),
    CONSTRAINT course_status_check CHECK (status IN ('active', 'inactive', 'archived'))
);

CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id),
    code VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    capacity INTEGER,
    faculty_id UUID REFERENCES users(id),
    branch_id UUID REFERENCES branches(id),
    fees DECIMAL(12, 2),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT batch_status_check CHECK (status IN ('active', 'completed', 'cancelled'))
);

CREATE INDEX idx_batches_course ON batches(course_id);
CREATE INDEX idx_batches_faculty ON batches(faculty_id);
CREATE INDEX idx_batches_status ON batches(status);
```

### Students & Enrollment Schema

```sql
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    branch_id UUID REFERENCES branches(id),
    roll_number VARCHAR(50) UNIQUE,
    admission_date DATE,
    date_of_birth DATE,
    gender VARCHAR(20),
    father_name VARCHAR(255),
    mother_name VARCHAR(255),
    guardian_contact VARCHAR(20),
    address TEXT,
    aadhar_number VARCHAR(20),
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(20),
    category VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT gender_check CHECK (gender IN ('M', 'F', 'Other')),
    CONSTRAINT status_check CHECK (status IN ('active', 'inactive', 'suspended', 'graduated', 'dropped'))
);

CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    batch_id UUID NOT NULL REFERENCES batches(id),
    enrollment_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, batch_id),
    CONSTRAINT enrollment_status_check CHECK (status IN ('active', 'completed', 'withdrawn', 'suspended'))
);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_batch ON enrollments(batch_id);
```

---

## 3. Table Definitions (Sample Tables)

All tables follow this pattern:

```sql
CREATE TABLE [table_name] (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    [required_fields],
    [optional_fields],
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_[table_name]_organization ON [table_name](organization_id);
CREATE INDEX idx_[table_name]_status ON [table_name](status);

CREATE TRIGGER [table_name]_timestamp
BEFORE UPDATE ON [table_name]
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
```

### Core Tables to Create

1. **organizations** - Organization/School data
2. **branches** - Multiple branch locations
3. **users** - All user accounts
4. **roles** - Role definitions
5. **permissions** - Permission definitions
6. **courses** - Course definitions
7. **batches** - Course batches/sessions
8. **subjects** - Subject definitions
9. **student_profiles** - Student detailed info
10. **enrollments** - Student enrollments
11. **assignments** - Assignment definitions
12. **submissions** - Student submissions
13. **grades** - Grade records
14. **attendance** - Attendance records
15. **fees** - Fee structure and records
16. **payments** - Payment transactions
17. **inventory_items** - Inventory management
18. **resources** - Equipment/resources
19. **resource_bookings** - Resource reservations
20. **leave_requests** - Leave management

---

## 4. Indexes & Constraints

### Performance Indexes

```sql
-- Common lookup patterns
CREATE INDEX idx_users_email_organization 
ON users(email, organization_id);

CREATE INDEX idx_enrollments_batch_date 
ON enrollments(batch_id, enrollment_date);

CREATE INDEX idx_attendance_student_date 
ON attendance(student_id, attendance_date);

CREATE INDEX idx_grades_batch_subject 
ON grades(batch_id, subject_id);

CREATE INDEX idx_payments_student_date 
ON payments(student_id, payment_date);

-- Full-text search
CREATE INDEX idx_courses_search 
ON courses USING gin(to_tsvector('english', name || ' ' || description));

-- JSON queries (for preferences, metadata)
CREATE INDEX idx_users_preferences 
ON users USING gin(preferences);
```

### Foreign Key Constraints

```sql
-- Ensure referential integrity
ALTER TABLE student_profiles
ADD CONSTRAINT fk_student_organization
FOREIGN KEY (organization_id) REFERENCES organizations(id);

ALTER TABLE enrollments
ADD CONSTRAINT fk_enrollment_student
FOREIGN KEY (student_id) REFERENCES users(id);

ALTER TABLE enrollments
ADD CONSTRAINT fk_enrollment_batch
FOREIGN KEY (batch_id) REFERENCES batches(id);
```

### Unique Constraints

```sql
-- Prevent duplicates where needed
ALTER TABLE users
ADD CONSTRAINT unique_email_per_org
UNIQUE(email, organization_id);

ALTER TABLE courses
ADD CONSTRAINT unique_code_per_org
UNIQUE(code, organization_id);
```

---

## 5. Row Level Security (RLS)

### Enable RLS on Tables

```sql
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
-- ... enable on all other tables
```

### Sample RLS Policies

**Organizations Table:**
```sql
-- Admins can see own organization
CREATE POLICY org_select_own
ON organizations FOR SELECT
USING (id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid()
));

-- Admins can update own organization
CREATE POLICY org_update_own
ON organizations FOR UPDATE
USING (id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role = 'super_admin'
))
WITH CHECK (id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role = 'super_admin'
));
```

**Users Table:**
```sql
-- Users can see own profile
CREATE POLICY users_select_own
ON users FOR SELECT
USING (id = auth.uid());

-- Admins can see all users in their organization
CREATE POLICY users_select_org
ON users FOR SELECT
USING (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
));

-- Users can update own profile
CREATE POLICY users_update_own
ON users FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
```

**Enrollments Table:**
```sql
-- Students see own enrollments
CREATE POLICY enrollments_select_own
ON enrollments FOR SELECT
USING (student_id = auth.uid());

-- Teachers see students in their batches
CREATE POLICY enrollments_select_teacher
ON enrollments FOR SELECT
USING (batch_id IN (
    SELECT id FROM batches
    WHERE faculty_id = auth.uid()
));

-- Admins see all enrollments
CREATE POLICY enrollments_select_admin
ON enrollments FOR SELECT
USING (batch_id IN (
    SELECT id FROM batches
    WHERE course_id IN (
        SELECT id FROM courses
        WHERE organization_id IN (
            SELECT organization_id FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    )
));
```

---

## 6. Migrations Management

### Running Migrations

**With Supabase CLI:**
```bash
# Install CLI
npm install -D supabase

# Login
supabase login

# Initialize project
supabase init

# Run migrations
supabase db push

# Create new migration
supabase migration new [migration_name]
```

**Manual Migration:**
1. Go to Supabase Dashboard
2. SQL Editor
3. Paste SQL script
4. Review
5. Execute

### Migration Workflow

1. Create migration file: `migrations/[timestamp]_[description].sql`
2. Write SQL in migration
3. Test locally first
4. Push to production
5. Verify execution
6. Document changes

### Sample Migration File

**File: migrations/2024_01_15_001_create_initial_schema.sql**

```sql
-- Migration: Create initial schema
-- Description: Creates core tables for EduMunch
-- Author: [Your Name]
-- Date: 2024-01-15

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (...)

-- Users
CREATE TABLE IF NOT EXISTS users (...)

-- Branches
CREATE TABLE IF NOT EXISTS branches (...)

-- Courses
CREATE TABLE IF NOT EXISTS courses (...)

-- Batches
CREATE TABLE IF NOT EXISTS batches (...)

-- Create indexes
CREATE INDEX idx_organizations_status ON organizations(status);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Set RLS Policies
CREATE POLICY org_select_own ON organizations FOR SELECT USING (...);

-- Rollback script (optional)
-- DROP TABLE IF EXISTS organizations CASCADE;
```

---

## 7. Seed Data

### Create Seed Script

**File: scripts/seed.sql**

```sql
-- Seed Organizations
INSERT INTO organizations (id, name, email, city, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'EduMunch Academy', 'admin@edumunch.com', 'Delhi', 'active'),
('550e8400-e29b-41d4-a716-446655440001', 'Tech Institute', 'admin@techinst.com', 'Bangalore', 'active');

-- Seed Branches
INSERT INTO branches (organization_id, name, email, phone, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Main Campus', 'main@edumunch.com', '9876543210', 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'East Campus', 'east@edumunch.com', '9876543211', 'active');

-- Seed Courses
INSERT INTO courses (organization_id, code, name, level, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'CS101', 'Introduction to Computer Science', 'Foundation', 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'CS201', 'Data Structures', 'Intermediate', 'active');

-- Seed Batches
INSERT INTO batches (course_id, code, start_date, end_date, capacity, status) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'CS101-2024-S1', '2024-01-15', '2024-04-15', 50, 'active'),
('550e8400-e29b-41d4-a716-446655440003', 'CS201-2024-S1', '2024-01-15', '2024-04-15', 40, 'active');
```

### Running Seed Script

```bash
# Using psql
psql postgres://user:password@host/dbname < scripts/seed.sql

# Using Supabase CLI
supabase db push --seed scripts/seed.sql

# Using SQL Editor (paste and run)
```

---

## 8. Backup & Recovery

### Automatic Backups

**Configure in Supabase:**
1. Go to Project Settings
2. Navigate to **Backups**
3. Configure:
   - Backup frequency (daily recommended)
   - Retention (7-30 days)
4. Enable automatic backups

### Manual Backup

**Via Supabase Dashboard:**
1. Go to **Settings → Backups**
2. Click **Create backup**
3. Wait for backup completion
4. Download backup file

**Via PostgreSQL:**
```bash
# Full database backup
pg_dump postgres://user:password@host/dbname > backup.sql

# Compressed backup
pg_dump -Fc postgres://user:password@host/dbname > backup.dump
```

### Restore from Backup

**Via Supabase Dashboard:**
1. Go to **Settings → Backups**
2. Choose backup point
3. Click **Restore**
4. Confirm (production will have downtime)
5. Restore process starts

**Via Command Line:**
```bash
# Restore from SQL dump
psql postgres://user:password@host/dbname < backup.sql

# Restore from compressed dump
pg_restore -d postgres://user:password@host/dbname backup.dump
```

---

## 9. Performance Optimization

### Query Optimization

```sql
-- Use EXPLAIN to analyze query
EXPLAIN ANALYZE
SELECT u.*, e.*, b.* FROM users u
JOIN enrollments e ON u.id = e.student_id
JOIN batches b ON e.batch_id = b.id
WHERE u.organization_id = '550e8400-e29b-41d4-a716-446655440000';

-- Add indexes if needed
CREATE INDEX idx_enrollments_org
ON enrollments(student_id, batch_id);
```

### Connection Pooling

**Configure pgBouncer (Supabase):**
1. Go to **Database Settings**
2. Enable **Connection Pooling**
3. Set pool mode: transaction (recommended)
4. Update connection string:
   - Change port from 5432 to 6543
   - Add `?options=application_name%3D[app_name]`

**Updated Connection String:**
```
postgres://user:password@host:6543/dbname?schema=public
```

### Storage Optimization

```sql
-- Check table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Archive old records
DELETE FROM activity_logs WHERE created_at < NOW() - INTERVAL '90 days';

-- Vacuum to reclaim space
VACUUM ANALYZE;
```

---

## 10. Troubleshooting

### Common Issues

**Connection Refused**
- Check database credentials
- Verify Supabase project is active
- Check IP whitelist settings
- Ensure network connectivity

**Slow Queries**
- Run EXPLAIN ANALYZE
- Check index usage
- Optimize query structure
- Enable query logging

**RLS Policy Issues**
- Verify auth.uid() is set
- Check policy conditions
- Test with admin key first
- Review policy logs

**Migration Failures**
- Check migration SQL syntax
- Verify table dependencies
- Rollback and retry
- Check migration logs

---

**Last Updated:** [Date]  
**Database Version:** PostgreSQL 14+  
**Status:** Production Ready

