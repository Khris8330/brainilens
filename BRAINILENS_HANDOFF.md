# BrainiLens - Full App Handoff

**Branch:** `brainilens`  
**Repo:** https://github.com/Khris8330/brainilens  
**Beta:** https://inilensbeta.vercel.app (Vercel SPA rewrite in `vercel.json`)  
**Timezone for daily logic:** `Africa/Lagos`

This document is the single entry point for continuing work on BrainiLens (whole product + first game Word Rush). Prefer reading the repo alongside this file.

---

## 1. Product overview

BrainiLens is an education platform for parents/guardians and students (children). Core loops:

| Area | Audience | Purpose |
|------|----------|---------|
| Landing + auth | Public | Marketing, role pick, parent register/login, student login |
| Parent dashboard | Parent | Children, weekly learning, assignments, reports, settings, AI insights |
| Student dashboard | Student | Learning content, assignments, assessments, progress, AI chat, **Games** |
| Games Layer | Student | Fun practice (Word Rush live; Math Sprint placeholder). **Does not feed academic reports.** |

**Brand mascot:** Official Lens robot (white/blue, glowing **b** + "brainilens" on chest). In-app avatar: `src/assets/lens-avatar.ts` → `lensAvatarSrc` (small JPEG data URL). Landing assets under `src/assets/landing/`.

**Copy rule:** Prefer no em dashes in user-facing UI copy; some code comments still have them.

---

## 2. Tech stack

| Layer | Choice |
|-------|--------|
| App | Vite + React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Routing | `react-router-dom` (`src/routes/index.tsx`) |
| Auth / DB | Supabase (`@supabase/supabase-js`) - `src/lib/supabase.ts` |
| Env | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` |
| Deploy | Vercel (SPA rewrite) |
| AI | Supabase Edge Functions + Gemini helpers under `supabase/functions/` |

Scripts: `npm run build` → `tsc -b && vite build`; `npm run lint` → `eslint .`

---

## 3. Repo map (important paths)

```
src/
  App.tsx, main.tsx
  routes/index.tsx          # all routes + routes constants
  contexts/AuthContext.tsx
  lib/                      # supabase, assessment, students, settings, time, learning-data, …
  pages/
    landing/                # LandingPage + hero/FAQ components
    auth/                   # role, login, student-login, register, callback
    parent/                 # ParentDashboardPage
    student/                # dashboard, learning, assignments, assessment, progress, AI, profile
    student/games/          # GamesHubPage, WordRushPage
    assignments/, reports/, settings/, ai/, weekly-learning/, child/, legal/
  components/common/        # BrandLogo, Header, Sidebar, RequireAuth, …
  games/
    catalog.ts              # GAME_CATALOG (word_rush available, math_sprint coming_soon)
    types.ts                # GameKey, session payloads, WORD_RUSH_ROUND_TARGET_MS
    session-api.ts          # fetchGameStatus, startGameSession, endGameSession
    word-rush/
      engine/               # types, content bank, selector, scoring, difficulty, validate
      sounds.ts             # Web Audio SFX + soft looping arpeggio BGM
  assets/
    lens-avatar.ts          # export const lensAvatarSrc = 'data:image/jpeg;base64,...'
    landing/                # hero/mascot data modules

supabase/
  functions/                # student-login, create-student, submit-assessment,
                            # generate-learning-content, ai-health-check
                            # (game-status / game-session-start / game-session-end are invoked
                            #  from session-api; confirm they exist in the Supabase project)
  migrations/               # students foundation, learning foundation

docs/
  GAMES_LAYER.md            # games time/session/unlock rules
  LENS_CHAT_SAFETY.md
  DATA_RETENTION.md

frontend-backend-handoff.md # older FE/BE mapping (assignments/progress); still useful
```

---

## 4. Auth and roles

- Roles: `parent` | `admin` | `student` | `child` (student/child treated similarly via `isStudentRole` in `src/lib/auth-roles.ts`).
- `RequireAuth role="parent"` / `role="student"` wraps dashboard route groups.
- Parent login/register vs student login (`StudentLoginPage` + `student-login` edge function).
- `AuthContext`: session mapping, `login` / `register` / `logout` / `refreshUser`.
- Home path: `homePathForRole()` → parent or student dashboard or role selection.

---

## 5. Academic product (non-games)

### Parent

- Dashboard, child progress (`/child`), weekly learning, assignments manager, reports, settings (incl. per-child settings), AI insights.
- Some parent analytics/assignment UI historically mixed **mock data** with Supabase children - see `frontend-backend-handoff.md`. Prefer live Supabase where possible.

### Student

- Learning content, assignments list/detail, **assessment** flow (`submit-assessment` edge function).
- Progress + progress review by learning content id.
- Student AI page (`/student/ai`).
- Profile.

### Assessment unlock and Games

- Games unlock only if the student has completed at least one assignment **today** (Africa/Lagos): `student_assignments.status = completed` and `submitted_at` on that calendar day.
- Enforced in games edge functions (not only UI). Details: `docs/GAMES_LAYER.md`.

---

## 6. Games Layer (shared)

**Spec:** `docs/GAMES_LAYER.md`

| Rule | Detail |
|------|--------|
| Daily allowance | **120 minutes** shared across all games |
| Calendar | `Africa/Lagos` - `game_daily_usage.usage_date` |
| Per session | Server duration; max **60 minutes** per session |
| Scores | Local during play; persisted at session end; **not** academic reports |
| Catalog | `src/games/catalog.ts` - Word Rush `available`, Math Sprint `coming_soon` |
| Hub | `/student/games` → `GamesHubPage` |
| Client API | `src/games/session-api.ts` → `game-status`, `game-session-start`, `game-session-end` |
| Tables (intended) | `game_sessions`, `game_daily_usage`, `word_rush_progress` |

Abandoned sessions: one active session per student; closed as abandoned with capped duration on status/start.

---

## 7. Word Rush (first game) - current state

**Route:** `/student/games/word-rush` → `WordRushPage.tsx`

### UX

1. **Mode picker** (`pick_mode`) - kid chooses:
   - Word Completion, Synonyms, Antonyms, Idioms, Parts of Speech, Spelling, Word Scramble, Mixed Rush  
   - Colorful gradient tiles; counts from `countForMode()`.
2. **Playing** - HUD (score, streak, round timer, today left), progress bar, **Lens says** + mascot, prompt, colorful option tiles.
3. Feedback - correct/wrong, floating points, shake, streak messages.
4. **Round end** - score, best streak, accuracy, time left; Games Hub / another mode / play again.

### Engine (`src/games/word-rush/engine/`)

| File | Role |
|------|------|
| `types.ts` | `WordRushMode`, `Challenge`, `RoundState` (`usedChallengeIds`, `mode`, …), `WORD_RUSH_MODES` |
| `content.ts` | `CHALLENGE_BANK` - ~72 challenges, multi-mode tags |
| `selector.ts` | Mode filter + avoid `usedIds` + type diversification |
| scoring / difficulty / validate | Points, adaptive difficulty, answer check |

Round length: `WORD_RUSH_ROUND_TARGET_MS` from `src/games/types.ts`.

### Audio (`sounds.ts`)

- Web Audio API: correct / wrong / streak / round end.
- Soft looping arpeggio BGM (`startMusic` / `stopMusic`).
- Mute flags in storage; start music after user gesture (`beginMode`).

### Mascot

- `import { lensAvatarSrc } from '@/assets/lens-avatar'`
- `LensAvatar` component in `WordRushPage` (mode header + "Lens says").
- Asset is a **verified small JPEG data URL** (avoid large binary PNG pushes that corrupted earlier).

### Session integration

- `beginMode` → `startGameSession('word_rush')` → load challenges → `startMusic()`.
- Timer + cleanup → `endGameSession` with score/accuracy/streak/XP fields.
- Status/unlock driven by `fetchGameStatus` on hub.

---

## 8. Edge functions (Supabase)

Present in repo under `supabase/functions/`:

| Function | Role |
|----------|------|
| `student-login` | Student auth |
| `create-student` | Parent creates child account |
| `submit-assessment` | Assessment answers |
| `generate-learning-content` | AI learning content (Gemini + lens instructions) |
| `ai-health-check` | AI health |

**Invoked by games client** (confirm deployed on project):

- `game-status`
- `game-session-start`
- `game-session-end`

Migrations: students foundation + learning foundation SQL under `supabase/migrations/`.

---

## 9. Branding and content constraints

- **Logo:** Flat navy brand mark with gold dots (SVG/components - `BrandLogo`).
- **Mascot:** Official Lens robot; use `lensAvatarSrc` for in-app avatars; keep on-brand blue/yellow.
- **No em dashes** in user-facing strings where possible.
- Games are explicitly separated from academic scoring/reports.

---

## 10. Known gaps / next work (priority hints)

1. **Math Sprint** - catalog placeholder; implement under same Games Layer (session API + 120-min pool).
2. **Game edge functions** - ensure `game-status` / start / end exist and match `docs/GAMES_LAYER.md` if not already on Supabase.
3. **Parent surfaces** - reduce remaining mock data (dashboard analytics, some assignment/report views); see `frontend-backend-handoff.md`.
4. **Word Rush content** - expand bank further or generate carefully by mode; keep anti-repeat.
5. **Mascot assets** - optional: higher-res public `lens-mascot.png` for landing; keep game avatar on `lensAvatarSrc`.
6. **Polish** - em-dash cleanup in comments; assessment review UX; mobile QA on beta.

---

## 11. How to work in Build mode

1. Connect this repo (branch `brainilens`).
2. Read this file + `docs/GAMES_LAYER.md` first.
3. For games changes: touch `src/games/**` and `src/pages/student/games/**`; keep session unlock/time rules intact.
4. For academic/auth: use `src/lib/*`, edge functions, and existing pages; do not mix game scores into reports.
5. Deploy path: push to `brainilens` → Vercel beta; hard-refresh when verifying UI.

---

## 12. Quick command reference

```bash
# Install & run (from repo root)
npm install
npm run dev

# Typecheck + production build
npm run build

# Lint
npm run lint
```

Supabase: configure project URL/keys in env; deploy edge functions from `supabase/functions/` as needed.

---

*Last focused gameplay work: Word Rush mode picker, expanded bank, Web Audio, Lens brand mascot via `lens-avatar.ts`, shared 120-min Games Layer.*
