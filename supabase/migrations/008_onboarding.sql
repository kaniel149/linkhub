-- ============================================================
-- MIGRATION 008: Onboarding Flow
-- ============================================================
-- Adds onboarding tracking to profiles table

-- Add onboarding completion timestamp
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz DEFAULT NULL;

-- Partial index for fast lookups of users who haven't onboarded
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding
  ON public.profiles(id) WHERE onboarding_completed_at IS NULL;

-- Backfill existing users as already onboarded (prevent redirect loop)
UPDATE public.profiles SET onboarding_completed_at = created_at
WHERE onboarding_completed_at IS NULL;
