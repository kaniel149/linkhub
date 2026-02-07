-- MCP Gateway Migration
-- API keys for agent authentication + rate limiting

-- API Keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  key_hash text NOT NULL,
  key_prefix text NOT NULL,           -- first 8 chars for identification (e.g., "lh_abc12...")
  name text NOT NULL DEFAULT 'Default',
  permissions jsonb DEFAULT '["read"]'::jsonb,
  rate_limit integer DEFAULT 100,     -- requests per hour
  is_active boolean DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Rate limiting table
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key_id uuid REFERENCES public.api_keys ON DELETE CASCADE NOT NULL,
  window_start timestamptz NOT NULL DEFAULT now(),
  request_count integer DEFAULT 1
);

-- Indexes
CREATE INDEX idx_api_keys_profile ON public.api_keys(profile_id);
CREATE INDEX idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_prefix ON public.api_keys(key_prefix);
CREATE INDEX idx_api_keys_active ON public.api_keys(profile_id, is_active);
CREATE INDEX idx_rate_limits_key ON public.api_rate_limits(key_id);
CREATE INDEX idx_rate_limits_window ON public.api_rate_limits(key_id, window_start);

-- RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can manage own API keys
CREATE POLICY "Users can view own api keys"
  ON public.api_keys FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can create own api keys"
  ON public.api_keys FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own api keys"
  ON public.api_keys FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own api keys"
  ON public.api_keys FOR DELETE
  USING (auth.uid() = profile_id);

-- Rate limits: system can insert/read (using service role for MCP server)
-- No user-facing RLS needed since rate limits are managed server-side
CREATE POLICY "Service role manages rate limits"
  ON public.api_rate_limits FOR ALL
  USING (true);

-- Clean up old rate limit windows (keep last 2 hours)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM public.api_rate_limits
  WHERE window_start < now() - interval '2 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
