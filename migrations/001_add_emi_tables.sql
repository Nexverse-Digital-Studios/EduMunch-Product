-- ============================================================================
-- EMI Implementation - Database Migration
-- ============================================================================
-- 
-- This migration adds support for Equated Monthly Installment (EMI) 
-- payment option for student fees.
--
-- Date Created: January 5, 2026
-- Version: 1.0
-- ============================================================================

-- ============================================================================
-- 1. CREATE NEW TABLE: fee_emi_schedules_1emaet
-- ============================================================================
-- Stores individual EMI installment records for each student fee
-- One row per EMI installment

CREATE TABLE IF NOT EXISTS public.fee_emi_schedules_1emaet (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_fee_id uuid NOT NULL,
  student_id uuid NOT NULL,
  emi_number integer NOT NULL,
  emi_amount numeric(10, 2) NOT NULL,
  due_date date NOT NULL,
  payment_date date,
  paid_amount numeric(10, 2) DEFAULT 0,
  status character varying(20) DEFAULT 'Pending'::character varying
    CHECK (status::text = ANY (ARRAY['Pending'::character varying, 'Paid'::character varying, 'Overdue'::character varying, 'Cancelled'::character varying, 'Partially Paid'::character varying]::text[])),
  interest_amount numeric(10, 2) DEFAULT 0,
  penalty_amount numeric(10, 2) DEFAULT 0,
  remarks text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT fee_emi_schedules_1emaet_pkey PRIMARY KEY (id),
  CONSTRAINT fk_fee_emi_schedules_student_fee FOREIGN KEY (student_fee_id) REFERENCES public.student_fees_1emaet(id) ON DELETE CASCADE,
  CONSTRAINT fk_fee_emi_schedules_student FOREIGN KEY (student_id) REFERENCES public.students_1emaet(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_fee_emi_schedules_student_fee_id ON public.fee_emi_schedules_1emaet(student_fee_id);
CREATE INDEX IF NOT EXISTS idx_fee_emi_schedules_student_id ON public.fee_emi_schedules_1emaet(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_emi_schedules_due_date ON public.fee_emi_schedules_1emaet(due_date);
CREATE INDEX IF NOT EXISTS idx_fee_emi_schedules_status ON public.fee_emi_schedules_1emaet(status);

-- ============================================================================
-- 2. ALTER fee_payments_1emaet TABLE
-- ============================================================================
-- Add EMI-related columns to track payment type and EMI schedule reference

ALTER TABLE public.fee_payments_1emaet
ADD COLUMN IF NOT EXISTS payment_option character varying(20) DEFAULT 'Full Payment'::character varying
  CHECK (payment_option::text = ANY (ARRAY['Full Payment'::character varying, 'EMI'::character varying]::text[])),
ADD COLUMN IF NOT EXISTS emi_schedule_id uuid,
ADD COLUMN IF NOT EXISTS emi_tenure_months integer;

-- Add foreign key constraint for emi_schedule_id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_fee_payments_emi_schedule'
  ) THEN
    ALTER TABLE public.fee_payments_1emaet
    ADD CONSTRAINT fk_fee_payments_emi_schedule 
    FOREIGN KEY (emi_schedule_id) REFERENCES public.fee_emi_schedules_1emaet(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for payment_option
CREATE INDEX IF NOT EXISTS idx_fee_payments_payment_option ON public.fee_payments_1emaet(payment_option);
CREATE INDEX IF NOT EXISTS idx_fee_payments_emi_schedule_id ON public.fee_payments_1emaet(emi_schedule_id);

-- ============================================================================
-- 3. ALTER student_fees_1emaet TABLE
-- ============================================================================
-- Add EMI configuration columns to store tenure, interest rate, and start date

ALTER TABLE public.student_fees_1emaet
ADD COLUMN IF NOT EXISTS payment_plan character varying(20) DEFAULT 'Full Payment'::character varying
  CHECK (payment_plan::text = ANY (ARRAY['Full Payment'::character varying, 'EMI'::character varying]::text[])),
ADD COLUMN IF NOT EXISTS emi_tenure_months integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS emi_interest_percent numeric(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS emi_start_date date DEFAULT NULL;

-- Create index for payment_plan
CREATE INDEX IF NOT EXISTS idx_student_fees_payment_plan ON public.student_fees_1emaet(payment_plan);

-- ============================================================================
-- 4. MIGRATION VERIFICATION
-- ============================================================================
-- Run this query to verify the migration was successful

-- SELECT 
--   'fee_emi_schedules_1emaet' as table_name,
--   COUNT(*) as column_count,
--   'NEW TABLE' as status
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
--   AND table_name = 'fee_emi_schedules_1emaet'
-- UNION ALL
-- SELECT 
--   'fee_payments_1emaet',
--   COUNT(*),
--   'UPDATED'
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
--   AND table_name = 'fee_payments_1emaet'
-- UNION ALL
-- SELECT 
--   'student_fees_1emaet',
--   COUNT(*),
--   'UPDATED'
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
--   AND table_name = 'student_fees_1emaet';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
