-- ============================================================================
-- MIGRATION: Parent-Teacher to Parent-Admin Grievance System
-- ============================================================================
-- This migration updates the existing grievance system to use admin instead of teacher
-- Run this against your existing parent_teacher_grievances_1emaet table
-- ============================================================================

-- Step 1: Drop old policies
DROP POLICY IF EXISTS "grievances_teacher_access" ON parent_teacher_grievances_1emaet;
DROP POLICY IF EXISTS "grievances_parent_access" ON parent_teacher_grievances_1emaet;
DROP POLICY IF EXISTS "grievances_admin_access" ON parent_teacher_grievances_1emaet;

-- Step 2: Drop old triggers and functions
DROP TRIGGER IF EXISTS trg_update_grievance_on_message ON grievance_messages_1emaet;
DROP FUNCTION IF EXISTS update_grievance_on_message();

-- Step 3: Add admin_id column if it doesn't exist
ALTER TABLE parent_teacher_grievances_1emaet
ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES users_1emaet(id) ON DELETE CASCADE;

-- Step 4: Drop old teacher_id index
DROP INDEX IF EXISTS idx_ptg_teacher;

-- Step 5: Rename old unread column
ALTER TABLE parent_teacher_grievances_1emaet
RENAME COLUMN unread_by_teacher TO unread_by_admin;

-- Step 6: Set admin_id to the same as teacher_id for existing records (if teacher_id exists)
-- This preserves history by converting teacher assignments to admin assignments
DO $$
BEGIN
    -- Check if teacher_id column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'parent_teacher_grievances_1emaet' 
        AND column_name = 'teacher_id'
    ) THEN
        -- Copy teacher_id users to admin_id (assuming teachers might have been assigned)
        -- For now, assign to first admin if teacher_id is NULL
        UPDATE parent_teacher_grievances_1emaet
        SET admin_id = (
            SELECT u.id FROM users_1emaet u
            JOIN roles_1emaet r ON r.id = u.primary_role_id
            WHERE r.role_code = 'admin'
            LIMIT 1
        )
        WHERE admin_id IS NULL;
    END IF;
END $$;

-- Step 7: Make admin_id NOT NULL after populating
ALTER TABLE parent_teacher_grievances_1emaet
ALTER COLUMN admin_id SET NOT NULL;

-- Step 8: Update messages sender_type if Teacher exists
UPDATE grievance_messages_1emaet
SET sender_type = 'Admin'
WHERE sender_type = 'Teacher';

-- Step 9: Recreate function for new schema
CREATE OR REPLACE FUNCTION update_grievance_on_message()
RETURNS TRIGGER AS $$
BEGIN
    -- Update last_message_at and unread counts
    UPDATE parent_teacher_grievances_1emaet
    SET last_message_at = NOW(),
        updated_at = NOW(),
        -- Increment unread count for the other party
        unread_by_parent = CASE 
            WHEN NEW.sender_type = 'Admin' 
            THEN unread_by_parent + 1 
            ELSE unread_by_parent 
        END,
        unread_by_admin = CASE 
            WHEN NEW.sender_type = 'Parent' 
            THEN unread_by_admin + 1 
            ELSE unread_by_admin 
        END
    WHERE id = NEW.grievance_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Recreate trigger
CREATE TRIGGER trg_update_grievance_on_message
    AFTER INSERT ON grievance_messages_1emaet
    FOR EACH ROW
    EXECUTE FUNCTION update_grievance_on_message();

-- Step 11: Create admin_id index
CREATE INDEX IF NOT EXISTS idx_ptg_admin ON parent_teacher_grievances_1emaet(admin_id);

-- Step 12: Recreate RLS policies
CREATE POLICY "grievances_parent_access" ON parent_teacher_grievances_1emaet
    FOR ALL
    USING (
        parent_id IN (
            SELECT p.id FROM parents_1emaet p
            JOIN users_1emaet u ON u.id = p.user_id
            WHERE u.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "grievances_admin_access" ON parent_teacher_grievances_1emaet
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users_1emaet u
            JOIN roles_1emaet r ON r.id = u.primary_role_id
            WHERE u.auth_user_id = auth.uid()
            AND r.role_code IN ('super_admin', 'admin', 'principal', 'vice_principal')
        )
    );

-- Step 13: Update message sender types constraint if needed
-- The CHECK constraint on sender_type may need to be updated
-- First, let's remove old constraint and add new one
ALTER TABLE grievance_messages_1emaet
DROP CONSTRAINT IF EXISTS grievance_messages_1emaet_sender_type_check;

ALTER TABLE grievance_messages_1emaet
ADD CONSTRAINT grievance_messages_1emaet_sender_type_check 
CHECK (sender_type IN ('Parent', 'Admin'));

-- Step 14: Optional - Drop old teacher_id column if you want to clean up
-- UNCOMMENT ONLY AFTER VERIFICATION that migration worked correctly
-- ALTER TABLE parent_teacher_grievances_1emaet DROP COLUMN IF EXISTS teacher_id;

-- ============================================================================
-- VERIFICATION QUERIES - Run these to verify migration success
-- ============================================================================

-- Check column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'parent_teacher_grievances_1emaet'
AND column_name IN ('admin_id', 'unread_by_admin', 'teacher_id');

-- Check grievance count
SELECT COUNT(*) as total_grievances FROM parent_teacher_grievances_1emaet;

-- Check admin assignments
SELECT COUNT(*) as grievances_with_admin FROM parent_teacher_grievances_1emaet WHERE admin_id IS NOT NULL;

-- Check message sender types
SELECT sender_type, COUNT(*) as message_count FROM grievance_messages_1emaet GROUP BY sender_type;

-- ============================================================================
-- ROLLBACK STEPS (if needed)
-- ============================================================================
/*
-- To rollback, run:
ALTER TABLE parent_teacher_grievances_1emaet RENAME COLUMN unread_by_admin TO unread_by_teacher;
UPDATE grievance_messages_1emaet SET sender_type = 'Teacher' WHERE sender_type = 'Admin';
-- Then recreate old function and trigger
*/
