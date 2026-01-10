-- Migration: GSuite Auth Trigger
-- Links auth.users to public.users on first login
-- ================================================

-- ============================================
-- AUTH TRIGGER FUNCTION
-- Implements hybrid authentication:
-- 1. Pre-populated users get linked on first login
-- 2. New @youngmuslims.com users auto-create a record
-- 3. Non-domain emails pass through (no public.users record)
-- ============================================

CREATE OR REPLACE FUNCTION public.link_auth_to_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process @youngmuslims.com emails
  -- Other domains can authenticate but won't have app access
  IF NEW.email NOT LIKE '%@youngmuslims.com' THEN
    RETURN NEW;
  END IF;

  -- Try to link to existing pre-populated user
  UPDATE public.users
  SET
    auth_id = NEW.id,
    claimed_at = now(),
    updated_at = now(),
    -- Also grab name from Google profile if available
    first_name = COALESCE(first_name, NEW.raw_user_meta_data->>'given_name'),
    last_name = COALESCE(last_name, NEW.raw_user_meta_data->>'family_name'),
    avatar_url = COALESCE(avatar_url, NEW.raw_user_meta_data->>'avatar_url')
  WHERE email = NEW.email
    AND auth_id IS NULL;

  -- If no pre-populated user exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.users (
      id,
      email,
      auth_id,
      first_name,
      last_name,
      avatar_url,
      claimed_at,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      NEW.email,
      NEW.id,
      NEW.raw_user_meta_data->>'given_name',
      NEW.raw_user_meta_data->>'family_name',
      NEW.raw_user_meta_data->>'avatar_url',
      now(),
      now(),
      now()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- CREATE TRIGGER
-- Fires after a new auth.users record is created
-- ============================================

-- Drop existing trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.link_auth_to_user();

-- ============================================
-- HELPER FUNCTION
-- Get current user's public.users record
-- ============================================

CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;
