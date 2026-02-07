-- Services & Actions Migration
-- Adds services (consulting, freelance, products) and inquiry system

-- Services table
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

-- Service inquiries table
CREATE TABLE IF NOT EXISTS public.service_inquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id uuid REFERENCES public.services ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  sender_name text NOT NULL,
  sender_email text NOT NULL,
  message text,
  source text NOT NULL DEFAULT 'human'
    CHECK (source IN ('human', 'agent')),
  agent_identifier text,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_services_profile_id ON public.services(profile_id);
CREATE INDEX idx_services_position ON public.services(profile_id, position);
CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_active ON public.services(profile_id, is_active);
CREATE INDEX idx_inquiries_service_id ON public.service_inquiries(service_id);
CREATE INDEX idx_inquiries_profile_id ON public.service_inquiries(profile_id);
CREATE INDEX idx_inquiries_status ON public.service_inquiries(profile_id, status);
CREATE INDEX idx_inquiries_created ON public.service_inquiries(created_at);

-- RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_inquiries ENABLE ROW LEVEL SECURITY;

-- Services policies: publicly readable, users manage own
CREATE POLICY "Public services are viewable by everyone"
  ON public.services FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own services"
  ON public.services FOR ALL
  USING (auth.uid() = profile_id);

-- Inquiries policies: users can view own profile's inquiries, anyone can insert
CREATE POLICY "Users can view own inquiries"
  ON public.service_inquiries FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own inquiries"
  ON public.service_inquiries FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Anyone can submit inquiries"
  ON public.service_inquiries FOR INSERT
  WITH CHECK (true);

-- Trigger for updated_at on services
CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
