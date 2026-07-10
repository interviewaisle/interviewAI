-- Auth sync trigger: mirror every Supabase Auth signup into public.users.
-- (Was previously applied manually via the Supabase MCP in Phase 9 and never
--  captured as a migration — this makes the database fully reproducible.)
-- Run this in the Supabase SQL Editor after 001–004.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, subscription_status)
  VALUES (NEW.id, NEW.email, 'FREE')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
