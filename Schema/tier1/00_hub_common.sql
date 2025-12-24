-- ============================================================================
-- EduMunch: Hub Common Tables
-- ============================================================================
-- This file creates shared tables for all 5 schools in the database hub
-- Run this file FIRST before creating individual school tables
-- ============================================================================

-- ============================================================================
-- EXECUTION ORDER
-- ============================================================================
-- Step 1: Run this file (00_hub_common.sql) to create shared tables
-- Step 2: Run school files in order to create school-specific tables:
--         - 01_school_1EMAET.sql   (School 1: 45 tables)
--         - 02_school_2DDMK.sql   (School 2: 45 tables)
--         - 03_school_3AAA.sql   (School 3: 45 tables)
--         - 04_school_4CBV.sql   (School 4: 45 tables)
--         - 05_school_5HKSK.sql   (School 5: 45 tables)
--
-- Final Result: 1 common table + (45 × 5) = 226 total tables
-- ============================================================================

-- ============================================================================
-- Hub School Registry - Central registry for all 5 schools
-- ============================================================================

CREATE TABLE IF NOT EXISTS hub_school_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  index_token VARCHAR(6) UNIQUE NOT NULL,
  school_name VARCHAR(255) NOT NULL,
  school_code VARCHAR(50) UNIQUE NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(15),
  address TEXT,
  domain VARCHAR(255),
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  onboarded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_hub_registry_token ON hub_school_registry(index_token);
CREATE INDEX idx_hub_registry_active ON hub_school_registry(is_active);

COMMENT ON TABLE hub_school_registry IS 'Central registry for all 5 schools in this database hub';
COMMENT ON COLUMN hub_school_registry.index_token IS 'Unique 6-character school identifier (e.g., 1EMAET)';
COMMENT ON COLUMN hub_school_registry.school_name IS 'Editable school name';
COMMENT ON COLUMN hub_school_registry.is_active IS 'School active status - can be toggled';

-- ============================================================================
-- Insert 5 Schools (Customize school names as needed)
-- ============================================================================

INSERT INTO hub_school_registry (index_token, school_name, school_code, is_active) VALUES
('1EMAET', 'School 1 - Edit Name', 'SCH001', true),
('2DDMK', 'School 2 - Edit Name', 'SCH002', true),
('3AAA', 'School 3 - Edit Name', 'SCH003', true),
('4CBV', 'School 4 - Edit Name', 'SCH004', true),
('5HKSK', 'School 5 - Edit Name', 'SCH005', true);

-- ============================================================================
-- Update School Names (Example)
-- ============================================================================
-- UPDATE hub_school_registry SET school_name = 'Green Valley School' WHERE index_token = '1EMAET';
-- UPDATE hub_school_registry SET school_name = 'Sunrise Academy' WHERE index_token = '2DDMK';
-- UPDATE hub_school_registry SET school_name = 'Bright Future School' WHERE index_token = '3AAA';
-- UPDATE hub_school_registry SET school_name = 'Excellence Public School' WHERE index_token = '4CBV';
-- UPDATE hub_school_registry SET school_name = 'Knowledge Hub' WHERE index_token = '5HKSK';

-- ============================================================================
-- IMPORTANT NOTES
-- ============================================================================
-- 1. This table is shared across all 5 schools
-- 2. INDEX_TOKEN is immutable once assigned
-- 3. School names can be edited via UPDATE statements
-- 4. auth.users (Supabase managed) is also shared but not created here
-- 5. Each school gets 45 tables with their unique INDEX_TOKEN suffix
-- ============================================================================

-- ============================================================================
-- Common tables creation complete!
-- Next: Run individual school SQL files (01 through 05)
-- ============================================================================
