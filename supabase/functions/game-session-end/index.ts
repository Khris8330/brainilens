import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.3"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const DAILY_LIMIT_SECONDS = 120 * 60
const TZ = "Africa/Lagos"

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

function lagosDateString(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d)
}

type ProgressDelta = {
  current_tier?: string
  current_level?: number
  xp_gained?: number
  round_score?: number
  round_best_streak?: number
}

async function upsertGameProgress(
  admin: ReturnType<typeof createClient>,
  table: "word_rush_progress" | "math_sprint_progress",
  studentId: string,
  delta: ProgressDelta,
  body: { questions_answered?: number; correct_answers?: number; score?: number; best_streak?: number },
  durationSeconds: number,
  endedAt: string,
) {
  const { data: existing } = await admin.from(table).select("*").eq("student_id", studentId).maybeSingle()

  const xpGained =
    typeof delta.xp_gained === "number" && delta.xp_gained > 0 ? Math.min(Math.floor(delta.xp_gained), 5000) : 0
  const roundScore =
    typeof delta.round_score === "number" && delta.round_score >= 0 ? Math.floor(delta.round_score) : 0
  const roundStreak =
    typeof delta.round_best_streak === "number" && delta.round_best_streak >= 0
      ? Math.floor(delta.round_best_streak)
      : 0
  const q =
    typeof body.questions_answered === "number" && body.questions_answered >= 0
      ? Math.floor(body.questions_answered)
      : 0
  const c =
    typeof body.correct_answers === "number" && body.correct_answers >= 0
      ? Math.floor(body.correct_answers)
      : 0

  const tiers = ["starter", "explorer", "challenger", "advanced", "master"]
  let tier = existing?.current_tier ?? "starter"
  if (typeof delta.current_tier === "string" && tiers.includes(delta.current_tier)) {
    tier = delta.current_tier
  }
  let level = existing?.current_level ?? 1
  if (typeof delta.current_level === "number" && delta.current_level >= 1) {
    level = Math.min(Math.floor(delta.current_level), 99)
  }

  const score = typeof body.score === "number" && body.score >= 0 ? Math.floor(body.score) : 0
  const bestStreak =
    typeof body.best_streak === "number" && body.best_streak >= 0 ? Math.floor(body.best_streak) : 0

  await admin.from(table).upsert(
    {
      student_id: studentId,
      current_tier: tier,
      current_level: level,
      xp: (existing?.xp ?? 0) + xpGained,
      best_score: Math.max(existing?.best_score ?? 0, roundScore, score),
      best_streak: Math.max(existing?.best_streak ?? 0, roundStreak, bestStreak),
      total_rounds: (existing?.total_rounds ?? 0) + 1,
      total_questions: (existing?.total_questions ?? 0) + q,
      total_correct: (existing?.total_correct ?? 0) + c,
      total_game_seconds: (existing?.total_game_seconds ?? 0) + durationSeconds,
      last_played_at: endedAt,
      updated_at: endedAt,
    },
    { onConflict: "student_id" },
  )
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") {
    return json({ error: { code: "METHOD_NOT_ALLOWED", message: "POST only." } }, 405)
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const authorization = req.headers.get("Authorization")

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !authorization) {
    return json({ error: { code: "UNAUTHENTICATED", message: "Authentication required." } }, 401)
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  })
  const admin = createClient(supabaseUrl, serviceRoleKey)

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser()
  if (userError || !user) {
    return json({ error: { code: "UNAUTHENTICATED", message: "Authentication required." } }, 401)
  }

  let body: {
    session_id?: string
    score?: number
    accuracy?: number
    best_streak?: number
    questions_answered?: number
    correct_answers?: number
    metadata?: Record<string, unknown>
    word_rush?: ProgressDelta
    math_sprint?: ProgressDelta
  }
  try {
    body = await req.json()
  } catch {
    return json({ error: { code: "INVALID_JSON", message: "Invalid JSON body." } }, 400)
  }

  const sessionId = typeof body.session_id === "string" ? body.session_id.trim() : ""
  if (!sessionId) {
    return json({ error: { code: "INVALID_REQUEST", message: "session_id is required." } }, 400)
  }

  const { data: student } = await admin.from("students").select("id").eq("user_id", user.id).maybeSingle()
  if (!student) {
    return json({ error: { code: "FORBIDDEN", message: "Student profile required." } }, 403)
  }

  const { data: session } = await admin
    .from("game_sessions")
    .select("id, student_id, user_id, game_key, status, started_at")
    .eq("id", sessionId)
    .maybeSingle()

  if (!session || session.student_id !== student.id || session.user_id !== user.id) {
    return json({ error: { code: "NOT_FOUND", message: "Session not found." } }, 404)
  }

  if (session.status !== "active") {
    const today = lagosDateString()
    const { data: usage } = await admin
      .from("game_daily_usage")
      .select("seconds_used")
      .eq("student_id", student.id)
      .eq("usage_date", today)
      .maybeSingle()
    const secondsUsed = Math.min(usage?.seconds_used ?? 0, DAILY_LIMIT_SECONDS)
    return json({
      success: true,
      data: {
        sessionId: session.id,
        alreadyEnded: true,
        remainingSeconds: Math.max(0, DAILY_LIMIT_SECONDS - secondsUsed),
        dailyLimitSeconds: DAILY_LIMIT_SECONDS,
      },
    })
  }

  const startedMs = new Date(session.started_at).getTime()
  const nowMs = Date.now()
  let durationSeconds = Math.max(0, Math.floor((nowMs - startedMs) / 1000))
  durationSeconds = Math.min(durationSeconds, 60 * 60)

  const today = lagosDateString()
  const { data: usageRow } = await admin
    .from("game_daily_usage")
    .select("seconds_used")
    .eq("student_id", student.id)
    .eq("usage_date", today)
    .maybeSingle()

  const previousUsed = usageRow?.seconds_used ?? 0
  const remainingBefore = Math.max(0, DAILY_LIMIT_SECONDS - previousUsed)
  durationSeconds = Math.min(durationSeconds, remainingBefore)
  const newUsed = Math.min(DAILY_LIMIT_SECONDS, previousUsed + durationSeconds)

  const score = typeof body.score === "number" && body.score >= 0 ? Math.floor(body.score) : null
  const accuracy =
    typeof body.accuracy === "number" && body.accuracy >= 0 && body.accuracy <= 100 ? body.accuracy : null
  const bestStreak =
    typeof body.best_streak === "number" && body.best_streak >= 0 ? Math.floor(body.best_streak) : null

  const endedAt = new Date().toISOString()
  await admin
    .from("game_sessions")
    .update({
      status: "ended",
      ended_at: endedAt,
      duration_seconds: durationSeconds,
      score,
      accuracy,
      best_streak: bestStreak,
      metadata: {
        ...(body.metadata && typeof body.metadata === "object" ? body.metadata : {}),
        questions_answered: body.questions_answered ?? null,
        correct_answers: body.correct_answers ?? null,
      },
    })
    .eq("id", session.id)
    .eq("status", "active")

  await admin.from("game_daily_usage").upsert(
    {
      student_id: student.id,
      usage_date: today,
      seconds_used: newUsed,
      updated_at: endedAt,
    },
    { onConflict: "student_id,usage_date" },
  )

  if (session.game_key === "word_rush" && body.word_rush) {
    await upsertGameProgress(admin, "word_rush_progress", student.id, body.word_rush, body, durationSeconds, endedAt)
  }
  if (session.game_key === "math_sprint" && body.math_sprint) {
    await upsertGameProgress(admin, "math_sprint_progress", student.id, body.math_sprint, body, durationSeconds, endedAt)
  }

  return json({
    success: true,
    data: {
      sessionId: session.id,
      durationSeconds,
      remainingSeconds: Math.max(0, DAILY_LIMIT_SECONDS - newUsed),
      dailyLimitSeconds: DAILY_LIMIT_SECONDS,
      secondsUsed: newUsed,
      usageDate: today,
      timezone: TZ,
    },
  })
})
