-- ============================================================================
-- Migration: 003_ptm_workflow_support.sql
-- Description: Adds necessary status values and columns for PTM workflows
--              1. Admin bulk scheduling PTM for classes
--              2. Parent-initiated PTM requests with approval workflow
-- Date: 2026-01-07
-- ============================================================================

-- ============================================================================
-- PART 1: Update ptm_slots status constraint
-- Adding 'Requested' for parent-initiated meeting slots
-- ============================================================================

ALTER TABLE ptm_slots_1emaet 
DROP CONSTRAINT IF EXISTS ptm_slots_1emaet_status_check;

ALTER TABLE ptm_slots_1emaet 
ADD CONSTRAINT ptm_slots_1emaet_status_check 
CHECK (status::text = ANY (ARRAY[
  'Available'::text,    -- Admin created, open for booking (bulk schedule)
  'Booked'::text,       -- Slot is booked/confirmed
  'Completed'::text,    -- Meeting completed
  'Cancelled'::text,    -- Slot cancelled
  'Requested'::text     -- Parent requested this slot (pending approval)
]));

-- ============================================================================
-- PART 2: Update ptm_bookings status constraint
-- Adding 'Pending' for approval workflow and 'Rejected' for declined requests
-- ============================================================================

ALTER TABLE ptm_bookings_1emaet 
DROP CONSTRAINT IF EXISTS ptm_bookings_1emaet_status_check;

ALTER TABLE ptm_bookings_1emaet 
ADD CONSTRAINT ptm_bookings_1emaet_status_check 
CHECK (status::text = ANY (ARRAY[
  'Pending'::text,      -- Awaiting admin approval (parent-initiated)
  'Confirmed'::text,    -- Approved and confirmed
  'Completed'::text,    -- Meeting completed
  'Cancelled'::text,    -- Cancelled by parent/admin
  'No Show'::text,      -- Parent didn't attend
  'Rejected'::text      -- Admin rejected the request
]));

-- ============================================================================
-- PART 3: Add columns to ptm_bookings for approval tracking
-- ============================================================================

-- Who reviewed (approved/rejected) the booking
ALTER TABLE ptm_bookings_1emaet 
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES users_1emaet(id);

-- When was it reviewed
ALTER TABLE ptm_bookings_1emaet 
ADD COLUMN IF NOT EXISTS reviewed_at timestamp without time zone;

-- Reason for rejection (if rejected)
ALTER TABLE ptm_bookings_1emaet 
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- ============================================================================
-- PART 4: Add columns to ptm_slots for bulk scheduling support
-- ============================================================================

-- Flag to identify if slot was created via bulk scheduling
ALTER TABLE ptm_slots_1emaet 
ADD COLUMN IF NOT EXISTS is_bulk_scheduled boolean DEFAULT false;

-- Which class this PTM slot is for (for bulk scheduling)
ALTER TABLE ptm_slots_1emaet 
ADD COLUMN IF NOT EXISTS class_id uuid REFERENCES classes_1emaet(id);

-- Optional: Event/batch identifier to group slots from same bulk schedule
ALTER TABLE ptm_slots_1emaet 
ADD COLUMN IF NOT EXISTS batch_id uuid;

-- ============================================================================
-- PART 5: Create indexes for common queries
-- ============================================================================

-- Index for finding pending requests (admin approval queue)
CREATE INDEX IF NOT EXISTS idx_ptm_bookings_pending 
ON ptm_bookings_1emaet(status) 
WHERE status = 'Pending';

-- Index for finding slots by date (calendar views)
CREATE INDEX IF NOT EXISTS idx_ptm_slots_date 
ON ptm_slots_1emaet(ptm_date);

-- Index for finding slots by teacher (teacher schedule view)
CREATE INDEX IF NOT EXISTS idx_ptm_slots_teacher_date 
ON ptm_slots_1emaet(teacher_id, ptm_date);

-- Index for finding slots by class (bulk schedule view)
CREATE INDEX IF NOT EXISTS idx_ptm_slots_class 
ON ptm_slots_1emaet(class_id) 
WHERE class_id IS NOT NULL;

-- Index for finding slots by batch (grouping bulk scheduled slots)
CREATE INDEX IF NOT EXISTS idx_ptm_slots_batch 
ON ptm_slots_1emaet(batch_id) 
WHERE batch_id IS NOT NULL;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
