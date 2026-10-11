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

const GAME_CATALOG = [
  {
    key: "word_rush",
    title: "Word Rush",
    description: "Fast vocabulary challenges. Score, streaks, and XP stay in the Games Layer.",
    status: "available",
  },
  {
    key: "math_sprint",
    title: "Math Sprint",
    description: "Fast number challenges. Shares the same daily game time.",
    status: "available",
  },
]

async function closeAbandonedSession(
  admin: ReturnType<typeof createClient>,
  studentId: string,
  session: { id: string; started_at: string },
  today: string,
) {
  const startedMs = new Date(session.started_at).getTime()
  let durationSeconds = Math.max(0, Math.floor((Date.now() - startedMs) / 1000))
  durationSeconds = Math.min(durationSeconds, 60 * 60)

  const { data: usageRow } = await admin
    .from("game_daily_usage")
    .select("seconds_used")
    .eq("student_id", studentId)
    .eq("usage_date", today)
    .maybeSingle()

  const previousUsed = usageRow?.seconds_used ?? 0
  const remainingBefore = Math.max(0, DAILY_LIMIT_SECONDS - previousUsed)
  durationSeconds = Math.min(durationSeconds, remainingBefore)
  const newUsed = Math.min(DAILY_LIMIT_SECONDS, previousUsed + durationSeconds)
  const endedAt = new Date().toISOString()

  await admin
    .from("game_sessions")
    .update({
      status: "abandoned",
      ended_at: endedAt,
      duration_seconds: durationSeconds,
    })
    .eq("id", session.id)
    .eq("status", "active")

  await admin.from("game_daily_usage").upsert(
    {
      student_id: studentId,
      usage_date: today,
      seconds_used: newUsed,
      updated_at: endedAt,
    },
    { onConflict: "student_id,usage_date" },
  )

  return newUsed
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

  const { data: student } = await admin.from("students").select("id").eq("user_id", user.id).maybeSingle()
  if (!student) {
    return json({ error: { code: "FORBIDDEN", message: "Student profile required." } }, 403)
  }

  const today = lagosDateString()

  // Close any abandoned active session
  const { data: activeSession } = await admin
    .from("game_sessions")
    .select("id, started_at")
    .eq("student_id", student.id)
    .eq("status", "active")
    .maybeSingle()

  let secondsUsed = 0
  if (activeSession) {
    secondsUsed = await closeAbandonedSession(admin, student.id, activeSession, today)
  } else {
    const { data: usage } = await admin
      .from("game_daily_usage")
      .select("seconds_used")
      .eq("student_id", student.id)
      .eq("usage_date", today)
      .maybeSingle()
    secondsUsed = Math.min(usage?.seconds_used ?? 0, DAILY_LIMIT_SECONDS)
  }

  // Unlock: completed assignment submitted today (Lagos)
  const dayStart = `${today}T00:00:00+01:00`
  const dayEnd = `${today}T23:59:59.999+01:00`
  const { data: completedToday } = await admin
    .from("student_assignments")
    .select("id")
    .eq("student_id", student.id)
    .eq("status", "completed")
    .gte("submitted_at", dayStart)
    .lte("submitted_at", dayEnd)
    .limit(1)
    .maybeSingle()

  const gamesUnlocked = Boolean(completedToday)
  const unlockReason = gamesUnlocked
    ? "Unlocked after completing today's assessment."
    : "Complete today's learning assessment to unlock the Games Hub."

  const remainingSeconds = Math.max(0, DAILY_LIMIT_SECONDS - secondsUsed)

  const { data: wordRush } = await admin
    .from("word_rush_progress")
    .select(
      "current_tier, current_level, xp, best_score, best_streak, total_rounds, total_questions, total_correct, last_played_at",
    )
    .eq("student_id", student.id)
    .maybeSingle()

  const { data: mathSprint } = await admin
    .from("math_sprint_progress")
    .select(
      "current_tier, current_level, xp, best_score, best_streak, total_rounds, total_questions, total_correct, last_played_at",
    )
    .eq("student_id", student.id)
    .maybeSingle()

  return json({
    success: true,
    data: {
      studentId: student.id,
      gamesUnlocked,
      unlockReason,
      dailyLimitSeconds: DAILY_LIMIT_SECONDS,
      secondsUsed,
      remainingSeconds,
      usageDate: today,
      timezone: TZ,
      activeSession: null,
      wordRush: wordRush ?? null,
      mathSprint: mathSprint ?? null,
      games: GAME_CATALOG,
    },
  })
})
