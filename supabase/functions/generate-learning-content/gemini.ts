export interface GeminiCallOptions {
  systemInstruction?: string;
  userPrompt: string;
  thinkingLevel?: "low" | "medium" | "high";
  timeoutMs?: number;
  maxRetries?: number;
}

export interface GeminiCallResult {
  text: string;
}

const GEMINI_MODEL = "gemini-3.7-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export class GeminiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callGemini(options: GeminiCallOptions): Promise<GeminiCallResult> {
  const apiKey = Deno.env.get("GOOGLE_AI_API");
  if (!apiKey) {
    throw new GeminiError("AI_NOT_CONFIGURED", "AI provider is not configured.");
  }

  const {
    systemInstruction,
    userPrompt,
    thinkingLevel = "medium",
    timeoutMs = 20_000,
    maxRetries = 3,
  } = options;

  if (!userPrompt || userPrompt.trim().length === 0) {
    throw new GeminiError("INVALID_PROMPT", "A non-empty prompt is required.");
  }

  const body: Record<string, unknown> = {
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      thinkingConfig: {
        thinkingLevel,
      },
    },
  };

  if (systemInstruction && systemInstruction.trim().length > 0) {
    body.system_instruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  let lastStatus: number | null = null;
  let lastErrorBody = "";

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch(GEMINI_ENDPOINT, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new GeminiError("AI_TIMEOUT", "The AI provider took too long to respond.");
      }
      console.error("Gemini request failed", { reason: "network_error", attempt });
      if (attempt < maxRetries) {
        await sleep(500 * Math.pow(2, attempt));
        continue;
      }
      throw new GeminiError("AI_UNAVAILABLE", "The AI provider could not be reached.");
    } finally {
      clearTimeout(timeout);
    }

    if (response.ok) {
      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        throw new GeminiError("AI_INVALID_RESPONSE", "The AI provider returned an unreadable response.");
      }

      const text = extractText(payload);
      if (text === null) {
        console.error("Gemini response missing text", {});
        throw new GeminiError("AI_INVALID_RESPONSE", "The AI provider returned an unexpected response shape.");
      }

      return { text };
    }

    lastStatus = response.status;
    try {
      lastErrorBody = (await response.text()).slice(0, 500);
    } catch {
      lastErrorBody = "";
    }

    console.error("Gemini request rejected", {
      status: response.status,
      attempt,
      bodyPreview: lastErrorBody,
    });

    if ((response.status === 503 || response.status === 429 || response.status === 500) && attempt < maxRetries) {
      await sleep(700 * Math.pow(2, attempt));
      continue;
    }

    break;
  }

  if (lastStatus === 429) {
    throw new GeminiError("AI_RATE_LIMITED", "The AI provider rate-limited the request. Please try again shortly.");
  }
  if (lastStatus === 503 || lastStatus === 500) {
    throw new GeminiError("AI_UNAVAILABLE", "The AI provider is temporarily unavailable. Please try again.");
  }
  if (lastStatus === 400) {
    throw new GeminiError("AI_REQUEST_FAILED", "The AI provider rejected the request as invalid.");
  }
  if (lastStatus === 401 || lastStatus === 403) {
    throw new GeminiError("AI_NOT_CONFIGURED", "AI provider authentication failed. Check the API key.");
  }

  throw new GeminiError("AI_REQUEST_FAILED", "The AI provider rejected the request.");
}

function extractText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const candidates = (payload as Record<string, unknown>).candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  const first = candidates[0] as Record<string, unknown>;
  const content = first?.content as Record<string, unknown> | undefined;
  const parts = content?.parts;
  if (!Array.isArray(parts) || parts.length === 0) return null;
  const textParts = parts
    .map((part) => (part && typeof part === "object" ? (part as Record<string, unknown>).text : null))
    .filter((value): value is string => typeof value === "string");
  if (textParts.length === 0) return null;
  return textParts.join("");
}
