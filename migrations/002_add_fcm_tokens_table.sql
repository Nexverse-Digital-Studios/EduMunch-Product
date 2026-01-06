-- =====================================================
-- Migration: Add FCM Tokens Table for Push Notifications
-- Index Token: 1emaet
-- Created: 2026-01-06
-- =====================================================

-- Create FCM Tokens table for storing device tokens
CREATE TABLE IF NOT EXISTS public.fcm_tokens_1emaet (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  fcm_token TEXT NOT NULL,
  platform VARCHAR(10) NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
  device_name VARCHAR(255),
  device_model VARCHAR(255),
  os_version VARCHAR(50),
  app_version VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  
  CONSTRAINT fcm_tokens_1emaet_pkey PRIMARY KEY (id),
  CONSTRAINT fk_fcm_tokens_user FOREIGN KEY (user_id) REFERENCES public.users_1emaet(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_fcm_token UNIQUE (user_id, fcm_token)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_1emaet_user_id ON public.fcm_tokens_1emaet(user_id);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_1emaet_token ON public.fcm_tokens_1emaet(fcm_token);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_1emaet_platform ON public.fcm_tokens_1emaet(platform);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_1emaet_active ON public.fcm_tokens_1emaet(is_active);

-- Note: notifications_1emaet table already exists in your schema
-- We'll use the existing table for notification history

-- Enable Row Level Security (RLS)
ALTER TABLE public.fcm_tokens_1emaet ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists (to allow re-running migration)
DROP POLICY IF EXISTS fcm_tokens_user_policy ON public.fcm_tokens_1emaet;

-- RLS Policy: Users can only see their own FCM tokens
CREATE POLICY fcm_tokens_user_policy ON public.fcm_tokens_1emaet
  FOR ALL
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_fcm_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER fcm_tokens_updated_at_trigger
  BEFORE UPDATE ON public.fcm_tokens_1emaet
  FOR EACH ROW
  EXECUTE FUNCTION update_fcm_tokens_updated_at();

-- Function to clean up old inactive tokens (run periodically)
CREATE OR REPLACE FUNCTION cleanup_inactive_fcm_tokens()
RETURNS void AS $$
BEGIN
  -- Mark tokens as inactive if not used in last 90 days
  UPDATE public.fcm_tokens_1emaet
  SET is_active = false
  WHERE last_used_at < NOW() - INTERVAL '90 days'
    AND is_active = true;
    
  -- Delete tokens inactive for more than 180 days
  DELETE FROM public.fcm_tokens_1emaet
  WHERE is_active = false
    AND updated_at < NOW() - INTERVAL '180 days';
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust based on your roles)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fcm_tokens_1emaet TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.fcm_tokens_1emaet IS 'Stores Firebase Cloud Messaging tokens for push notifications';
COMMENT ON COLUMN public.fcm_tokens_1emaet.fcm_token IS 'Firebase Cloud Messaging device token';
COMMENT ON COLUMN public.fcm_tokens_1emaet.platform IS 'Device platform: android, ios, or web';
COMMENT ON COLUMN public.fcm_tokens_1emaet.is_active IS 'Whether the token is currently active and valid';
COMMENT ON COLUMN public.fcm_tokens_1emaet.last_used_at IS 'Last time this token was successfully used to send notification';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ FCM Tokens table created successfully for index: 1emaet';
  RAISE NOTICE 'ℹ️  Using existing notifications_1emaet table for notification history';
END $$;
