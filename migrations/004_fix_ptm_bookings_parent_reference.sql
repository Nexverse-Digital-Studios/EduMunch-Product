-- Migration: Fix PTM Bookings parent_user_id to reference parents.id instead of users.id
-- ======================================================================================
-- This changes the foreign key of ptm_bookings_1emaet.parent_user_id 
-- to point to parents_1emaet.id instead of users_1emaet.id

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE ptm_bookings_1emaet 
DROP CONSTRAINT IF EXISTS fk_ptm_bookings_parent;

-- Step 2: Update existing data - convert user.id values to parent.id values
UPDATE ptm_bookings_1emaet pb
SET parent_user_id = p.id
FROM parents_1emaet p
WHERE p.user_id = pb.parent_user_id;

-- Step 3: Add new foreign key constraint pointing to parents.id
ALTER TABLE ptm_bookings_1emaet 
ADD CONSTRAINT fk_ptm_bookings_parent_user 
FOREIGN KEY (parent_user_id) REFERENCES parents_1emaet(id);

-- Step 4: Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_ptm_bookings_parent_user_id 
ON ptm_bookings_1emaet(parent_user_id);

-- Verification query (run after migration)
-- SELECT 
--   pb.id,
--   pb.parent_user_id,
--   p.first_name || ' ' || p.last_name as parent_name,
--   p.user_id as parent_users_table_id,
--   s.first_name || ' ' || s.last_name as student_name
-- FROM ptm_bookings_1emaet pb
-- JOIN parents_1emaet p ON p.id = pb.parent_user_id
-- JOIN students_1emaet s ON s.id = pb.student_id;
