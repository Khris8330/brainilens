-- Games Layer: shared session/usage tables + progress for Word Rush and Math Sprint.
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT patterns where possible.

-- Sessions
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  game_key text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'abandoned')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer,
  score integer,
  accuracy numeric,
  best_streak integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS game_sessions_one_active_per_student
  ON public.game_sessions (student_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS game_sessions_student_started_idx
  ON public.game_sessions (student_id, started_at DESC);

-- Daily usage (Africa/Lagos calendar date stored as date)
CREATE TABLE IF NOT EXISTS public.game_daily_usage (
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  usage_date date NOT NULL,
  seconds_used integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, usage_date)
);

-- Word Rush progress
CREATE TABLE IF NOT EXISTS public.word_rush_progress (
  student_id uuid PRIMARY KEY REFERENCES public.students(id) ON DELETE CASCADE,
  current_tier text NOT NULL DEFAULT 'starter',
  current_level integer NOT NULL DEFAULT 1,
  xp integer NOT NULL DEFAULT 0,
  best_score integer NOT NULL DEFAULT 0,
  best_streak integer NOT NULL DEFAULT 0,
  total_rounds integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 0,
  total_correct integer NOT NULL DEFAULT 0,
  total_game_seconds integer NOT NULL DEFAULT 0,
  last_played_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Math Sprint progress
CREATE TABLE IF NOT EXISTS public.math_sprint_progress (
  student_id uuid PRIMARY KEY REFERENCES public.students(id) ON DELETE CASCADE,
  current_tier text NOT NULL DEFAULT 'starter',
  current_level integer NOT NULL DEFAULT 1,
  xp integer NOT NULL DEFAULT 0,
  best_score integer NOT NULL DEFAULT 0,
  best_streak integer NOT NULL DEFAULT 0,
  total_rounds integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 0,
  total_correct integer NOT NULL DEFAULT 0,
  total_game_seconds integer NOT NULL DEFAULT 0,
  last_played_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: students read own rows; writes go through service role in edge functions
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_rush_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.math_sprint_progress ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'game_sessions' AND policyname = 'students_read_own_sessions'
  ) THEN
    CREATE POLICY students_read_own_sessions ON public.game_sessions
      FOR SELECT USING (
        student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'game_daily_usage' AND policyname = 'students_read_own_usage'
  ) THEN
    CREATE POLICY students_read_own_usage ON public.game_daily_usage
      FOR SELECT USING (
        student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'word_rush_progress' AND policyname = 'students_read_own_word_rush'
  ) THEN
    CREATE POLICY students_read_own_word_rush ON public.word_rush_progress
      FOR SELECT USING (
        student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'math_sprint_progress' AND policyname = 'students_read_own_math_sprint'
  ) THEN
    CREATE POLICY students_read_own_math_sprint ON public.math_sprint_progress
      FOR SELECT USING (
        student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
      );
  END IF;
END $$;
