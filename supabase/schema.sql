-- ==============================================================================
-- ProblemForge / The Query Forum - Complete PostgreSQL Schema & RLS Policies
-- Supabase Free Tier Compatible (₹0 Budget)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Enums
DO $$ BEGIN
    CREATE TYPE problem_category AS ENUM (
      'education',
      'work_productivity',
      'money_finance',
      'housing_roommates',
      'food_dining',
      'local_services',
      'transport_travel',
      'health_fitness',
      'shopping_commerce',
      'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE problem_frequency AS ENUM (
      'daily',
      'several_times_a_week',
      'weekly',
      'monthly',
      'rarely'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Profiles Table (Mirrors Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Problems Table (The Core Asset)
CREATE TABLE IF NOT EXISTS public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category problem_category NOT NULL,
  frequency problem_frequency NOT NULL,
  pain_level SMALLINT NOT NULL CHECK (pain_level >= 1 AND pain_level <= 5),
  current_workaround TEXT,
  me_too_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. Problem Validations ("I Have This Problem Too")
CREATE TABLE IF NOT EXISTS public.problem_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  CONSTRAINT unique_user_problem_validation UNIQUE (problem_id, user_id)
);

-- 6. Problem Comments & Discussions
CREATE TABLE IF NOT EXISTS public.problem_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_solution_proposal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 7. Future Loop Placeholder: Problem Solvers Notify (Zero Cost)
CREATE TABLE IF NOT EXISTS public.problem_solvers_notify (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  CONSTRAINT unique_problem_user_notify UNIQUE (problem_id, user_id)
);

-- ==============================================================================
-- Indexes for High Performance Queries & Scanning
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_problems_category ON public.problems (category);
CREATE INDEX IF NOT EXISTS idx_problems_created_at ON public.problems (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_problems_me_too_count ON public.problems (me_too_count DESC);
CREATE INDEX IF NOT EXISTS idx_problems_pain_level ON public.problems (pain_level DESC);
CREATE INDEX IF NOT EXISTS idx_validations_problem_user ON public.problem_validations (problem_id, user_id);
CREATE INDEX IF NOT EXISTS idx_validations_user ON public.problem_validations (user_id);
CREATE INDEX IF NOT EXISTS idx_comments_problem_created ON public.problem_comments (problem_id, created_at ASC);

-- ==============================================================================
-- Triggers & Atomic Functions
-- ==============================================================================

-- A. Auto create profile when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
BEGIN
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1),
    'user_' || SUBSTRING(NEW.id::text, 1, 8)
  );

  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    base_username || '_' || SUBSTRING(gen_random_uuid()::text, 1, 4),
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

-- B. Atomic update for me_too_count on public.problems
CREATE OR REPLACE FUNCTION public.handle_problem_validation_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.problems
    SET me_too_count = me_too_count + 1,
        updated_at = NOW()
    WHERE id = NEW.problem_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.problems
    SET me_too_count = GREATEST(0, me_too_count - 1),
        updated_at = NOW()
    WHERE id = OLD.problem_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_problem_validation_change ON public.problem_validations;
CREATE TRIGGER on_problem_validation_change
  AFTER INSERT OR DELETE ON public.problem_validations
  FOR EACH ROW EXECUTE FUNCTION public.handle_problem_validation_change();

-- C. Atomic update for comments_count on public.problems
CREATE OR REPLACE FUNCTION public.handle_problem_comment_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.problems
    SET comments_count = comments_count + 1,
        updated_at = NOW()
    WHERE id = NEW.problem_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.problems
    SET comments_count = GREATEST(0, comments_count - 1),
        updated_at = NOW()
    WHERE id = OLD.problem_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_problem_comment_change ON public.problem_comments;
CREATE TRIGGER on_problem_comment_change
  AFTER INSERT OR DELETE ON public.problem_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_problem_comment_change();

-- D. Atomic Toggle "Me Too" Function (Callable via RPC)
CREATE OR REPLACE FUNCTION public.toggle_me_too(target_problem_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_existing_id UUID;
  v_new_count INTEGER;
  v_has_validated BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to validate a problem';
  END IF;

  SELECT id INTO v_existing_id
  FROM public.problem_validations
  WHERE problem_id = target_problem_id AND user_id = v_user_id;

  IF v_existing_id IS NOT NULL THEN
    DELETE FROM public.problem_validations WHERE id = v_existing_id;
    v_has_validated := FALSE;
  ELSE
    INSERT INTO public.problem_validations (problem_id, user_id)
    VALUES (target_problem_id, v_user_id);
    v_has_validated := TRUE;
  END IF;

  SELECT me_too_count INTO v_new_count
  FROM public.problems
  WHERE id = target_problem_id;

  RETURN jsonb_build_object(
    'validated', v_has_validated,
    'me_too_count', v_new_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- Row-Level Security (RLS) Policies
-- ==============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_solvers_notify ENABLE ROW LEVEL SECURITY;

-- 2. Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 3. Problems Policies
CREATE POLICY "Problems are viewable by everyone."
  ON public.problems FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create problems."
  ON public.problems FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own problems."
  ON public.problems FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own problems."
  ON public.problems FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- 4. Problem Validations Policies
CREATE POLICY "Problem validations are viewable by everyone."
  ON public.problem_validations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can validate problems."
  ON public.problem_validations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own validation."
  ON public.problem_validations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Problem Comments Policies
CREATE POLICY "Comments are viewable by everyone."
  ON public.problem_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments."
  ON public.problem_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own comments."
  ON public.problem_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own comments."
  ON public.problem_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- 6. Problem Solvers Notify Policies
CREATE POLICY "Users can view their own notify subscriptions."
  ON public.problem_solvers_notify FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can subscribe to problem notifications."
  ON public.problem_solvers_notify FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsubscribe from notifications."
  ON public.problem_solvers_notify FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

