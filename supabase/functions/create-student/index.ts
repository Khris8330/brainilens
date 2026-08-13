import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.3"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

function randomToken(length: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (byte) => byte.toString(36)).join("").slice(0, length)
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405)

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const publishableKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const authorization = request.headers.get("Authorization")
  if (!supabaseUrl || !publishableKey || !serviceRoleKey || !authorization) {
    return json({ error: "Unauthorized" }, 401)
  }

  const userClient = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
  })
  const adminClient = createClient(supabaseUrl, serviceRoleKey)
  const { data: { user }, error: userError } = await userClient.auth.getUser()
  if (userError || !user) return json({ error: "Unauthorized" }, 401)

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle()
  if (profileError || !profile || profile.role !== "parent") return json({ error: "Parent access required" }, 403)

  let body: { full_name?: unknown; grade?: unknown }
  try { body = await request.json() } catch { return json({ error: "Invalid request" }, 400) }
  const fullName = typeof body.full_name === "string" ? body.full_name.trim() : ""
  const grade = typeof body.grade === "string" ? body.grade.trim() : ""
  if (!fullName || fullName.length > 120 || !grade || grade.length > 20) {
    return json({ error: "Full name and grade are required" }, 400)
  }

  let studentUserId: string | null = null
  let studentId = ""
  try {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = `STU-${randomToken(6).toUpperCase()}`
      const { data: existing } = await adminClient.from("students").select("id").eq("student_id", candidate).maybeSingle()
      if (!existing) { studentId = candidate; break }
    }
    if (!studentId) return json({ error: "Could not allocate student ID" }, 503)

    const temporaryCredential = randomToken(16)
    const internalEmail = `${studentId.toLowerCase()}@auth.brainilens.internal`
    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email: internalEmail,
      password: temporaryCredential,
      email_confirm: true,
      user_metadata: { role: "student", full_name: fullName },
    })
    if (createError || !created.user) throw createError ?? new Error("Student user creation failed")
    studentUserId = created.user.id

    const { error: studentError } = await adminClient.from("students").insert({
      parent_id: user.id,
      user_id: studentUserId,
      student_id: studentId,
      full_name: fullName,
      grade,
    })
    if (studentError) throw studentError

    return json({ student: { student_id: studentId, full_name: fullName, grade }, temporary_credential: temporaryCredential }, 201)
  } catch (error) {
    if (studentUserId) await adminClient.auth.admin.deleteUser(studentUserId)
    console.error("create-student failed", error)
    return json({ error: "Unable to create student" }, 500)
  }
})
