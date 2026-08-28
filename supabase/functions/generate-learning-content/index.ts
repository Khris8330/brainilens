import { createSupabaseContext } from "npm:@supabase/server@^1";
import { callGemini, GeminiError } from "./gemini.ts";
import { LENS_AI_SYSTEM_INSTRUCTIONS } from "./lens-ai-instructions.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: corsHeaders });
}

function errorResponse(code: string, message: string, status: number): Response {
  return jsonResponse({ error: { code, message } }, status);
}

interface GeneratedSection {
  id: string;
  type: string;
  title: string;
  content?: string;
  question?: string;
  options?: string[];
  correct_answer?: string;
  explanation?: string;
}

interface GeneratedLesson {
  version: number;
  lesson_type: string;
  estimated_minutes: number;
  sections: GeneratedSection[];
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
}

function validateGeneratedLesson(raw: unknown): GeneratedLesson {
  if (!raw || typeof raw !== "object") {
    throw new Error("NOT_AN_OBJECT");
  }

  const obj = raw as Record<string, unknown>;

  if (!Array.isArray(obj.sections) || obj.sections.length < 3) {
    throw new Error("MISSING_OR_TOO_FEW_SECTIONS");
  }

  const seenIds = new Set<string>();
  let practiceCount = 0;

  for (const rawSection of obj.sections) {
    if (!rawSection || typeof rawSection !== "object") {
      throw new Error("INVALID_SECTION");
    }
    const section = rawSection as Record<string, unknown>;

    if (typeof section.id !== "string" || section.id.trim().length === 0) {
      throw new Error("SECTION_MISSING_ID");
    }
    if (seenIds.has(section.id)) {
      throw new Error("DUPLICATE_SECTION_ID");
    }
    seenIds.add(section.id);

    if (typeof section.type !== "string" || section.type.trim().length === 0) {
      throw new Error("SECTION_MISSING_TYPE");
    }
    if (typeof section.title !== "string" || section.title.trim().length === 0) {
      throw new Error("SECTION_MISSING_TITLE");
    }

    if (section.type === "practice") {
      practiceCount += 1;

      if (typeof section.question !== "string" || section.question.trim().length === 0) {
        throw new Error("PRACTICE_MISSING_QUESTION");
      }
      if (!Array.isArray(section.options) || section.options.length < 2) {
        throw new Error("PRACTICE_MISSING_OPTIONS");
      }
      if (typeof section.correct_answer !== "string" || section.correct_answer.trim().length === 0) {
        throw new Error("PRACTICE_MISSING_CORRECT_ANSWER");
      }

      const normalizedAnswer = section.correct_answer.trim().toLowerCase();
      const normalizedOptions = (section.options as unknown[]).map((option) =>
        typeof option === "string" ? option.trim().toLowerCase() : "",
      );
      if (!normalizedOptions.includes(normalizedAnswer)) {
        throw new Error("CORRECT_ANSWER_NOT_IN_OPTIONS");
      }
    } else {
      if (typeof section.content !== "string" || section.content.trim().length === 0) {
        throw new Error("SECTION_MISSING_CONTENT");
      }
    }
  }

  if (practiceCount < 1) {
    throw new Error("NO_PRACTICE_SECTION");
  }

  return {
    version: 1,
    lesson_type: "lesson",
    estimated_minutes:
      typeof obj.estimated_minutes === "number" && obj.estimated_minutes > 0
        ? obj.estimated_minutes
        : 15,
    sections: obj.sections as GeneratedSection[],
  };
}

function buildGenerationPrompt(params: {
  subject: string;
  topic: string;
  description: string | null;
  grade: string | null;
}): string {
  const { subject, topic, description, grade } = params;

  return `Create a short, engaging lesson for a student in grade ${grade ?? "not specified"}, on the subject "${subject}", specifically about the topic: "${topic}".
${description ? `What the student's parent wants them to learn: ${description}` : ""}

Respond with ONLY valid JSON (no markdown, no code fences, no commentary) matching exactly this structure:

{
  "version": 1,
  "lesson_type": "lesson",
  "estimated_minutes": <integer, 10-20>,
  "sections": [
    { "id": "<kebab-case-unique-id>", "type": "introduction", "title": "<short title>", "content": "<1-2 short paragraphs>" },
    { "id": "<kebab-case-unique-id>", "type": "explanation", "title": "<short title>", "content": "<1-2 short paragraphs>" },
    { "id": "<kebab-case-unique-id>", "type": "example", "title": "<short title>", "content": "<1-2 short paragraphs>" },
    { "id": "<kebab-case-unique-id>", "type": "practice", "title": "<short title>", "question": "<a clear multiple-choice question testing the lesson>", "options": ["<4 short answer options>"], "correct_answer": "<must exactly match one of the options>", "explanation": "<why this answer is correct, 1 short sentence>" },
    { "id": "<kebab-case-unique-id>", "type": "summary", "title": "<short title>", "content": "<1 short paragraph reviewing the key idea>" }
  ]
}

Requirements:
- Include exactly one "practice" section.
- Each section id must be unique, lowercase, hyphen-separated, and related to its content (e.g. "photosynthesis-introduction").
- "correct_answer" must be an exact copy of one of the strings in "options".
- Keep all text age-appropriate for the stated grade and consistent with your teaching style rules.
- Do not include any text outside the JSON object.`;
}

export default {
  fetch: async (req: Request) => {
    if (req.method === "OPTIONS") {
      return new Response("ok", { status: 200, headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return errorResponse("METHOD_NOT_ALLOWED", "Only POST requests are allowed.", 405);
    }

    const { data: ctx, error: ctxError } = await createSupabaseContext(req, { auth: "user" });

    if (ctxError || !ctx) {
      console.error("createSupabaseContext failed", { message: ctxError?.message });
      return errorResponse("UNAUTHENTICATED", "Authentication is required.", 401);
    }

    const userId = ctx.userClaims?.id ?? ctx.userClaims?.sub;
    if (!userId) {
      return errorResponse("UNAUTHENTICATED", "Authentication is required.", 401);
    }

    let body: { learningPlanItemId?: string };
    try {
      body = await req.json();
    } catch {
      return errorResponse("INVALID_JSON", "Request body must contain valid JSON.", 400);
    }

    const learningPlanItemId = body.learningPlanItemId;
    if (typeof learningPlanItemId !== "string" || learningPlanItemId.trim().length === 0) {
      return errorResponse("INVALID_REQUEST", "learningPlanItemId is required.", 400);
    }

    const { data: item, error: itemError } = await ctx.supabase
      .from("learning_plan_items")
      .select("id, student_id, parent_id, subject, topic, description, week_start_date, status")
      .eq("id", learningPlanItemId)
      .maybeSingle();

    if (itemError) {
      console.error("learning_plan_items lookup failed", { message: itemError.message });
      return errorResponse("DATABASE_ERROR", "Unable to load the learning request.", 500);
    }

    if (!item || item.parent_id !== userId) {
      return errorResponse("NOT_FOUND_OR_UNAUTHORIZED", "Learning request not found.", 404);
    }

    if (item.status === "generating") {
      return errorResponse("ALREADY_GENERATING", "This learning request is already being generated.", 409);
    }
    if (item.status === "ready") {
      return errorResponse("ALREADY_GENERATED", "This learning request already has generated content.", 409);
    }

    await ctx.supabaseAdmin
      .from("learning_plan_items")
      .update({ status: "generating", error_message: null })
      .eq("id", item.id);

    const { data: student } = await ctx.supabaseAdmin
      .from("students")
      .select("grade")
      .eq("id", item.student_id)
      .maybeSingle();

    async function fail(reasonCode: string, clientMessage: string): Promise<Response> {
      await ctx.supabaseAdmin
        .from("learning_plan_items")
        .update({ status: "failed", error_message: reasonCode })
        .eq("id", item!.id);
      return errorResponse(reasonCode, clientMessage, 502);
    }

    let generatedText: string;
    try {
      const result = await callGemini({
        systemInstruction: LENS_AI_SYSTEM_INSTRUCTIONS,
        userPrompt: buildGenerationPrompt({
          subject: item.subject,
          topic: item.topic,
          description: item.description,
          grade: student?.grade ?? null,
        }),
        thinkingLevel: "medium",
        timeoutMs: 45_000,
        maxRetries: 3,
      });
      generatedText = result.text;
    } catch (error) {
      if (error instanceof GeminiError) {
        console.error("generate-learning-content GeminiError", { code: error.code, message: error.message });
        return await fail(error.code, "The AI provider could not generate content right now.");
      }
      console.error("Unexpected error calling Gemini", {
        message: error instanceof Error ? error.message : String(error),
      });
      return await fail("AI_UNKNOWN_ERROR", "Something went wrong generating content.");
    }

    let lesson: GeneratedLesson;
    try {
      const cleaned = stripCodeFences(generatedText);
      const parsed = JSON.parse(cleaned);
      lesson = validateGeneratedLesson(parsed);
    } catch (error) {
      console.error("Generated content failed validation", {
        reason: error instanceof Error ? error.message : "unknown",
      });
      return await fail("AI_OUTPUT_INVALID", "The AI generated content in an unexpected format.");
    }

    const { data: learningContent, error: contentInsertError } = await ctx.supabaseAdmin
      .from("learning_content")
      .insert({
        title: item.topic,
        description: item.description,
        subject: item.subject,
        grade: student?.grade ?? null,
        content: JSON.stringify(lesson),
      })
      .select("id")
      .single();

    if (contentInsertError || !learningContent) {
      console.error("learning_content insert failed", { message: contentInsertError?.message });
      return await fail("PERSIST_FAILED", "Unable to save the generated content.");
    }

    const dueDate = new Date(item.week_start_date as string);
    dueDate.setDate(dueDate.getDate() + 6);

    const { data: assignment, error: assignmentInsertError } = await ctx.supabaseAdmin
      .from("assignments")
      .insert({
        learning_content_id: learningContent.id,
        title: item.topic,
        description: item.description,
        subject: item.subject,
        grade: student?.grade ?? null,
        due_date: dueDate.toISOString().slice(0, 10),
      })
      .select("id")
      .single();

    if (assignmentInsertError || !assignment) {
      console.error("assignment insert failed", { message: assignmentInsertError?.message });
      return await fail("PERSIST_FAILED", "Unable to create the assignment for the generated content.");
    }

    const { error: linkInsertError } = await ctx.supabaseAdmin.from("student_assignments").insert({
      student_id: item.student_id,
      assignment_id: assignment.id,
      status: "assigned",
    });

    if (linkInsertError) {
      console.error("student_assignments insert failed", { message: linkInsertError.message });
      return await fail("PERSIST_FAILED", "Unable to assign the generated content to the student.");
    }

    await ctx.supabaseAdmin
      .from("learning_plan_items")
      .update({
        status: "ready",
        generated_assignment_id: assignment.id,
        generated_at: new Date().toISOString(),
        error_message: null,
      })
      .eq("id", item.id);

    return jsonResponse({
      success: true,
      data: {
        assignmentId: assignment.id,
        learningContentId: learningContent.id,
      },
    });
  },
};
