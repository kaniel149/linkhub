-- Migration: Add Google Calendar, PayMe, and LemonSqueezy providers
-- Extends the integrations table CHECK constraint

-- Drop and recreate the CHECK constraint to include new providers
ALTER TABLE public.integrations
  DROP CONSTRAINT IF EXISTS integrations_provider_check;

ALTER TABLE public.integrations
  ADD CONSTRAINT integrations_provider_check
  CHECK (provider IN ('calendly', 'cal_com', 'stripe', 'webhook', 'zapier', 'google_calendar', 'payme', 'lemonsqueezy'));
