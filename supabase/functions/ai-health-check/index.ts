import { createSupabaseContext } from "npm:@supabase/server@^1";
import { callGroq, GroqError } from "./groq.ts";

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
      const result = await callGroq({
        userPrompt: "Reply with exactly this sentence and nothing else: BrainiLens AI connection successful.",
        timeoutMs: 30_000,
        maxRetries: 1,
      });

      return jsonResponse({
        success: true,
        data: {
          reply: result.text,
          provider: "groq",
          model: result.model,
        },
      });
    } catch (error) {
      if (error instanceof GroqError) {
        console.error("ai-health-check GroqError", { code: error.code, message: error.message });
        return errorResponse(error.code, error.message, 502);
      }
      console.error("Unexpected error in ai-health-check", {
        message: error instanceof Error ? error.message : String(error),
      });
      return errorResponse("INTERNAL_ERROR", "Something went wrong.", 500);
    }
  },
};
