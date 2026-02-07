-- Agent Features Migration
-- Adds agent visit tracking and expanded analytics event types

-- Drop and recreate the check constraint on analytics_events to include new event types
ALTER TABLE public.analytics_events DROP CONSTRAINT IF EXISTS analytics_events_event_type_check;
ALTER TABLE public.analytics_events ADD CONSTRAINT analytics_events_event_type_check
  CHECK (event_type IN ('page_view', 'link_click', 'social_click', 'agent_visit', 'agent_api_call'));

-- Agent visits table for detailed agent tracking
CREATE TABLE IF NOT EXISTS public.agent_visits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  agent_identifier text NOT NULL DEFAULT 'unknown',
  agent_name text,
  user_agent text,
  endpoint text NOT NULL,
  method text DEFAULT 'GET',
  country text,
  created_at timestamptz DEFAULT now()
);

-- Indexes for agent_visits
CREATE INDEX idx_agent_visits_profile_created ON public.agent_visits(profile_id, created_at);
CREATE INDEX idx_agent_visits_agent ON public.agent_visits(agent_identifier);
CREATE INDEX idx_agent_visits_created ON public.agent_visits(created_at);

-- RLS for agent_visits
ALTER TABLE public.agent_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own agent visits"
  ON public.agent_visits FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Anyone can insert agent visits"
  ON public.agent_visits FOR INSERT
  WITH CHECK (true);

-- Add social_embeds platform check update to include linkedin and github
ALTER TABLE public.social_embeds DROP CONSTRAINT IF EXISTS social_embeds_platform_check;
ALTER TABLE public.social_embeds ADD CONSTRAINT social_embeds_platform_check
  CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'spotify', 'twitter', 'linkedin', 'github'));
