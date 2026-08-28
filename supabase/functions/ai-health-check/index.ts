import { createSupabaseContext } from "npm:@supabase/server@^1";
import { callGemini, GeminiError } from "./gemini.ts";

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

// ------------------------------------------------------
// Phase 1 infrastructure check.
//
// Proves the full chain: authenticated request -> Edge
// Function -> Gemini -> validated response.
// ------------------------------------------------------

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

    try {
      const result = await callGemini({
        userPrompt: "Reply with exactly this sentence and nothing else: BrainiLens AI connection successful.",
        thinkingLevel: "low",
      });

      return jsonResponse({
        success: true,
        data: {
          reply: result.text,
        },
      });
    } catch (error) {
      if (error instanceof GeminiError) {
        console.error("ai-health-check GeminiError", { code: error.code, message: error.message });
        return errorResponse(error.code, error.message, 502);
      }
      console.error("Unexpected error in ai-health-check", {
        message: error instanceof Error ? error.message : String(error),
      });
      return errorResponse("INTERNAL_ERROR", "Something went wrong.", 500);
    }
  },
};
