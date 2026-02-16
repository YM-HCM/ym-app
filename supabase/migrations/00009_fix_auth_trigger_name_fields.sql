-- Migration: Fix auth trigger to read correct Google OAuth metadata keys
-- Google OAuth sends `full_name`/`name`, NOT `given_name`/`family_name`
-- =====================================================================

CREATE OR REPLACE FUNCTION public.link_auth_to_user()
RETURNS TRIGGER AS $$
DECLARE
  _full_name TEXT;
  _first_name TEXT;
  _last_name TEXT;
BEGIN
  -- Only process @youngmuslims.com emails
  IF NEW.email NOT LIKE '%@youngmuslims.com' THEN
    RETURN NEW;
  END IF;

  -- Extract name from Google metadata
  -- Google OAuth sends full_name and name, not given_name/family_name
  _full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    ''
  );
  _first_name := split_part(_full_name, ' ', 1);
  _last_name := NULLIF(trim(substring(_full_name from position(' ' in _full_name) + 1)), '');

  -- If full_name has no space, last_name would equal full_name from substring; fix that
  IF _last_name = _first_name THEN
    _last_name := NULL;
  END IF;

  -- Try to link to existing pre-populated user
  UPDATE public.users
  SET
    auth_id = NEW.id,
    claimed_at = now(),
    updated_at = now(),
    first_name = COALESCE(first_name, NULLIF(_first_name, '')),
    last_name = COALESCE(last_name, _last_name),
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
      NULLIF(_first_name, ''),
      _last_name,
      NEW.raw_user_meta_data->>'avatar_url',
      now(),
      now(),
      now()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
