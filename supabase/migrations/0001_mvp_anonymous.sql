-- ==============================================================================
-- ProblemForge MVP migration
-- Additive changes on top of supabase/schema.sql. Safe to run more than once.
--
-- Context: this product has no login. Writes happen through Supabase
-- "anonymous sign-ins" (Authentication -> Providers -> Anonymous, enable it),
-- which create a real authenticated user with no email or password. All the
-- existing row-level security policies keep working unchanged.
-- ==============================================================================

-- 1. A human-friendly name people can type when they post. Separate from the
--    unique `username` so two people can both be "Alex".
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 2. Recreate the signup trigger so it also seeds display_name. Anonymous
--    users have no email, so we fall back through the metadata Supabase does
--    provide, then to a generic label.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  friendly_name TEXT;
BEGIN
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NULLIF(SPLIT_PART(COALESCE(NEW.email, ''), '@', 1), ''),
    'user_' || SUBSTRING(NEW.id::text, 1, 8)
  );

  friendly_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    'Someone'
  );

  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    base_username || '_' || SUBSTRING(gen_random_uuid()::text, 1, 4),
    friendly_name,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
