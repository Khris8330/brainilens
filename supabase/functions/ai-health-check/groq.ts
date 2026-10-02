export interface GroqCallOptions {
  systemInstruction?: string;
  userPrompt: string;
  model?: string;
  timeoutMs?: number;
  maxRetries?: number;
  temperature?: number;
  jsonMode?: boolean;
}

export interface GroqCallResult {
  text: string;
  model: string;
}

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

const MODEL_CANDIDATES = [
  "llama-3.1-8b-instant",
  "openai/gpt-oss-20b",
  "llama-3.3-70b-versatile",
  "meta-llama/llama-4-scout-17b-16e-instruct",
];

export class GroqError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callGroq(options: GroqCallOptions): Promise<GroqCallResult> {
  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey || apiKey.trim().length === 0) {
    throw new GroqError("AI_NOT_CONFIGURED", "AI provider is not configured (missing GROQ_API_KEY).");
  }

  const {
    systemInstruction,
    userPrompt,
    model: preferredModel,
    timeoutMs = 30_000,
    maxRetries = 1,
    temperature = 0.4,
  } = options;

  if (!userPrompt || userPrompt.trim().length === 0) {
    throw new GroqError("INVALID_PROMPT", "A non-empty prompt is required.");
  }

  const messages: Array<{ role: string; content: string }> = [];
  if (systemInstruction && systemInstruction.trim().length > 0) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: userPrompt });

  const modelsToTry = preferredModel
    ? [preferredModel, ...MODEL_CANDIDATES.filter((m) => m !== preferredModel)]
    : MODEL_CANDIDATES;

  let lastError: GroqError | null = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(GROQ_ENDPOINT, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ model, messages, temperature }),
          signal: controller.signal,
        });

        if (response.ok) {
          const payload = await response.json();
          const text = extractText(payload);
          if (text === null) {
            throw new GroqError("AI_INVALID_RESPONSE", "The AI provider returned an unexpected response shape.");
          }
          return { text, model };
        }

        const bodyPreview = (await response.text()).slice(0, 400);
        if (response.status === 404 || bodyPreview.includes("model_not_found")) {
          lastError = new GroqError("AI_REQUEST_FAILED", `Model ${model} not available.`);
          break;
        }
        if (response.status === 401 || response.status === 403) {
          throw new GroqError("AI_NOT_CONFIGURED", "AI provider authentication failed. Check GROQ_API_KEY.");
        }
        if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
          await sleep(800 * (attempt + 1));
          continue;
        }
        lastError = new GroqError("AI_REQUEST_FAILED", "The AI provider rejected the request.");
        break;
      } catch (error) {
        if (error instanceof GroqError) throw error;
        if (error instanceof DOMException && error.name === "AbortError") {
          if (attempt < maxRetries) {
            await sleep(800 * (attempt + 1));
            continue;
          }
          throw new GroqError("AI_TIMEOUT", "The AI provider took too long to respond.");
        }
        if (attempt < maxRetries) {
          await sleep(500 * Math.pow(2, attempt));
          continue;
        }
        lastError = new GroqError("AI_UNAVAILABLE", "The AI provider could not be reached.");
        break;
      } finally {
        clearTimeout(timeout);
      }
    }
  }

  throw lastError ?? new GroqError("AI_REQUEST_FAILED", "No available Groq model succeeded.");
}

function extractText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const choices = (payload as Record<string, unknown>).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const first = choices[0] as Record<string, unknown>;
  const message = first?.message as Record<string, unknown> | undefined;
  const content = message?.content;
  if (typeof content !== "string" || content.trim().length === 0) return null;
  return content;
}
