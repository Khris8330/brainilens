import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.3"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const genericError = { error: "Invalid Student ID or password." }

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (request.method !== "POST") return json(genericError, 401)

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const publishableKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  if (!supabaseUrl || !publishableKey || !serviceRoleKey) return json(genericError, 401)

  let body: { student_id?: unknown; password?: unknown }
  try { body = await request.json() } catch { return json(genericError, 401) }
  const studentId = typeof body.student_id === "string" ? body.student_id.trim().toUpperCase() : ""
  const password = typeof body.password === "string" ? body.password : ""
  if (!/^STU-[A-Z0-9]{6}$/.test(studentId) || !password || password.length > 256) return json(genericError, 401)

  const adminClient = createClient(supabaseUrl, serviceRoleKey)
  const authClient = createClient(supabaseUrl, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: student } = await adminClient
    .from("students")
    .select("student_id, user_id")
    .eq("student_id", studentId)
    .maybeSingle()
  if (!student?.user_id) return json(genericError, 401)

  const { data: profile } = await adminClient
    .from("profiles")
    .select("id, role")
    .eq("id", student.user_id)
    .maybeSingle()
  if (!profile || profile.id !== student.user_id || profile.role !== "student") return json(genericError, 401)

  const internalEmail = `${student.student_id.toLowerCase()}@auth.brainilens.internal`
  const { data: authResult, error: authError } = await authClient.auth.signInWithPassword({ email: internalEmail, password })
  if (authError || !authResult.session || authResult.user?.id !== student.user_id) return json(genericError, 401)

  return json({
    session: {
      access_token: authResult.session.access_token,
      refresh_token: authResult.session.refresh_token,
      expires_in: authResult.session.expires_in,
      expires_at: authResult.session.expires_at,
      token_type: authResult.session.token_type,
    },
  })
})
