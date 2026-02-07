-- LinkHub: Complete Database Setup
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- This combines all migrations (001-005) into one file

-- ============================================================
-- MIGRATION 001: Initial Schema
-- ============================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE NOT NULL,
  display_name text,
  bio text,
  avatar_url text,
  theme jsonb DEFAULT '{"primaryColor": "#6366f1", "backgroundColor": "#0f0f0f", "fontFamily": "Inter"}'::jsonb,
  is_premium boolean DEFAULT false,
  custom_domain text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Links table
CREATE TABLE IF NOT EXISTS public.links (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  icon text DEFAULT '🔗',
  position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  click_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Social embeds table
CREATE TABLE IF NOT EXISTS public.social_embeds (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  platform text NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'spotify', 'twitter', 'linkedin', 'github')),
  embed_url text NOT NULL,
  position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  link_id uuid REFERENCES public.links ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN ('page_view', 'link_click', 'social_click', 'agent_visit', 'agent_api_call')),
  referrer text,
  country text,
  device_type text,
  browser text,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_custom_domain ON public.profiles(custom_domain);
CREATE INDEX IF NOT EXISTS idx_links_profile_id ON public.links(profile_id);
CREATE INDEX IF NOT EXISTS idx_links_position ON public.links(profile_id, position);
CREATE INDEX IF NOT EXISTS idx_social_embeds_profile_id ON public.social_embeds(profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_profile_created ON public.analytics_events(profile_id, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_link_id ON public.analytics_events(link_id);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_embeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DO $$ BEGIN
  CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Links policies
DO $$ BEGIN
  CREATE POLICY "Public links are viewable by everyone" ON public.links FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own links" ON public.links FOR ALL USING (auth.uid() = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Social embeds policies
DO $$ BEGIN
  CREATE POLICY "Public embeds are viewable by everyone" ON public.social_embeds FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own embeds" ON public.social_embeds FOR ALL USING (auth.uid() = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Analytics policies
DO $$ BEGIN
  CREATE POLICY "Users can view own analytics" ON public.analytics_events FOR SELECT USING (auth.uid() = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can insert analytics" ON public.analytics_events FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    new.id,
    lower(replace(coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), ' ', '')),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION public.increment_click_count(link_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.links SET click_count = click_count + 1 WHERE id = link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

DROP TRIGGER IF EXISTS links_updated_at ON public.links;
CREATE TRIGGER links_updated_at
  BEFORE UPDATE ON public.links
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- ============================================================
-- MIGRATION 002: Agent Features
-- ============================================================

CREATE TABLE IF NOT EXISTS public.agent_visits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  agent_identifier text NOT NULL,
  agent_name text,
  user_agent text,
  endpoint text NOT NULL,
  method text DEFAULT 'GET',
  country text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_visits_profile ON public.agent_visits(profile_id);
CREATE INDEX IF NOT EXISTS idx_agent_visits_created ON public.agent_visits(profile_id, created_at);
CREATE INDEX IF NOT EXISTS idx_agent_visits_agent ON public.agent_visits(agent_identifier);

ALTER TABLE public.agent_visits ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own agent visits" ON public.agent_visits FOR SELECT USING (auth.uid() = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "System can insert agent visits" ON public.agent_visits FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- MIGRATION 003: Services
-- ============================================================

CREATE TABLE IF NOT EXISTS public.services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'other'
    CHECK (category IN ('consulting', 'freelance', 'product', 'event', 'education', 'other')),
  pricing text NOT NULL DEFAULT 'contact'
    CHECK (pricing IN ('free', 'fixed', 'hourly', 'custom', 'contact')),
  price_amount numeric,
  price_currency text DEFAULT 'USD',
  action_type text NOT NULL DEFAULT 'contact_form'
    CHECK (action_type IN ('book_meeting', 'contact_form', 'request_quote', 'buy_now', 'external_link')),
  action_config jsonb DEFAULT '{}'::jsonb,
  position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service_inquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id uuid REFERENCES public.services ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  sender_name text NOT NULL,
  sender_email text NOT NULL,
  message text,
  source text DEFAULT 'human' CHECK (source IN ('human', 'agent')),
  agent_identifier text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_services_profile ON public.services(profile_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(profile_id, is_active);
CREATE INDEX IF NOT EXISTS idx_services_position ON public.services(profile_id, position);
CREATE INDEX IF NOT EXISTS idx_inquiries_service ON public.service_inquiries(service_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_profile ON public.service_inquiries(profile_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.service_inquiries(profile_id, status);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_inquiries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public services are viewable" ON public.services FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own services" ON public.services FOR ALL USING (auth.uid() = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own inquiries" ON public.service_inquiries FOR SELECT USING (auth.uid() = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can create inquiries" ON public.service_inquiries FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP TRIGGER IF EXISTS services_updated_at ON public.services;
CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- ============================================================
-- MIGRATION 004: MCP / API Keys
-- ============================================================

CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  key_hash text NOT NULL,
  key_prefix text NOT NULL,
  name text NOT NULL DEFAULT 'Default',
  permissions jsonb DEFAULT '["read"]'::jsonb,
  rate_limit integer DEFAULT 100,
  is_active boolean DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key_id uuid REFERENCES public.api_keys ON DELETE CASCADE NOT NULL,
  window_start timestamptz NOT NULL DEFAULT now(),
  request_count integer DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_api_keys_profile ON public.api_keys(profile_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON public.api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON public.api_keys(profile_id, is_active);
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON public.api_rate_limits(key_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON public.api_rate_limits(key_id, window_start);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own api keys" ON public.api_keys FOR SELECT USING (auth.uid() = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create own api keys" ON public.api_keys FOR INSERT WITH CHECK (auth.uid() = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own api keys" ON public.api_keys FOR UPDATE USING (auth.uid() = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own api keys" ON public.api_keys FOR DELETE USING (auth.uid() = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Service role manages rate limits" ON public.api_rate_limits FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM public.api_rate_limits WHERE window_start < now() - interval '2 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- MIGRATION 005: Integrations
-- ============================================================

CREATE TABLE IF NOT EXISTS public.integrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  provider text NOT NULL
    CHECK (provider IN ('calendly', 'cal_com', 'stripe', 'webhook', 'zapier')),
  name text NOT NULL DEFAULT 'My Integration',
  config jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  connected_at timestamptz DEFAULT now(),
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS integration_id uuid REFERENCES public.integrations ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_integrations_profile ON public.integrations(profile_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON public.integrations(profile_id, provider);
CREATE INDEX IF NOT EXISTS idx_integrations_active ON public.integrations(profile_id, is_active);
CREATE INDEX IF NOT EXISTS idx_services_integration ON public.services(integration_id);

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own integrations" ON public.integrations FOR SELECT USING (auth.uid() = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create own integrations" ON public.integrations FOR INSERT WITH CHECK (auth.uid() = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own integrations" ON public.integrations FOR UPDATE USING (auth.uid() = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own integrations" ON public.integrations FOR DELETE USING (auth.uid() = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP TRIGGER IF EXISTS integrations_updated_at ON public.integrations;
CREATE TRIGGER integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- ============================================================
-- DONE! All tables created.
-- ============================================================
-- Next: Configure OAuth providers in Supabase Dashboard:
-- 1. Go to Authentication > Providers
-- 2. Enable Google (add Client ID + Secret)
-- 3. Enable GitHub (add Client ID + Secret)
-- 4. Add redirect URL: https://linkhub-iota-red.vercel.app/auth/callback
