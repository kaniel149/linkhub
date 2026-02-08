-- Integrations Migration
-- External service connectors (Calendly, Stripe, Webhooks, etc.)

-- Drop pre-existing integrations table (from Kaniel OS, empty, different schema)
DROP TABLE IF EXISTS public.integrations CASCADE;

-- Integrations table
CREATE TABLE public.integrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  provider text NOT NULL
    CHECK (provider IN ('calendly', 'cal_com', 'stripe', 'webhook', 'zapier')),
  name text NOT NULL DEFAULT 'My Integration',
  config jsonb DEFAULT '{}'::jsonb,  -- Provider-specific config (encrypted at rest by Supabase)
  is_active boolean DEFAULT true,
  connected_at timestamptz DEFAULT now(),
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Link services to integrations
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS integration_id uuid REFERENCES public.integrations ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_integrations_profile ON public.integrations(profile_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON public.integrations(profile_id, provider);
CREATE INDEX IF NOT EXISTS idx_integrations_active ON public.integrations(profile_id, is_active);
CREATE INDEX IF NOT EXISTS idx_services_integration ON public.services(integration_id);

-- RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own integrations"
    ON public.integrations FOR SELECT
    USING (auth.uid() = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create own integrations"
    ON public.integrations FOR INSERT
    WITH CHECK (auth.uid() = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own integrations"
    ON public.integrations FOR UPDATE
    USING (auth.uid() = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own integrations"
    ON public.integrations FOR DELETE
    USING (auth.uid() = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS integrations_updated_at ON public.integrations;
CREATE TRIGGER integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
