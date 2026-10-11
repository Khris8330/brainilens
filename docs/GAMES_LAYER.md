# Games Layer

## Boundaries

- Academic learning, assessments, and parent reports are unchanged.
- Games (Word Rush, Math Sprint, etc.) share one **120-minute daily** allowance.
- Game scores do **not** feed academic reports.

## Timezone / daily reset

- Calendar day for the allowance: **UTC+1** (fixed offset; same as BrainiLens greetings/time helpers).
- `game_daily_usage.usage_date` is that calendar date.
- At a new UTC+1 calendar day, a new row starts at 0 seconds used (previous days kept for history).
- Device clock is never used to grant extra time.

## Session model

1. `game-session-start` — requires student JWT, assessment unlock today, remaining time > 0; closes any prior active session; creates one active session.
2. Gameplay is local (no DB write per answer).
3. `game-session-end` — duration = `now() - started_at` on the server; capped by remaining allowance and 60 minutes max per session.

## Abandoned sessions

- Unique index: one `status = active` session per student.
- On `game-status` or `game-session-start`, any active session is closed as `abandoned` with server-computed duration (capped at 60 minutes) and added to daily usage.

## Unlock

- Games unlock when the student has at least one `student_assignments` row with `status = completed` and `submitted_at` on the current UTC+1 calendar date.
- Enforced in edge functions, not only in the UI.

## Edge functions

- `game-status`
- `game-session-start`
- `game-session-end`

## Tables

- `game_sessions`
- `game_daily_usage`
- `word_rush_progress`
- `math_sprint_progress`

Migration: `supabase/migrations/20261002000000_games_layer_math_sprint.sql`
