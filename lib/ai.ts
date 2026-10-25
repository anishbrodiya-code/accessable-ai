import OpenAI from "openai";
import { z } from "zod";

export const resultSchema = z.object({
  simplifiedText: z.string().min(1),
  keyPoints: z.array(z.string()).max(7),
  difficultWords: z.array(z.object({
    word: z.string(), explanation: z.string(), example: z.string().optional(),
  })),
  importantInformation: z.array(z.string()),
});

// Groq uses the OpenAI-compatible chat-completions API.
// This client is server-only. Never expose GROQ_API_KEY to the browser.
export const client = () => {
  if (process.env.GROQ_API_KEY?.trim()) {
    return new OpenAI({
      apiKey: process.env.GROQ_API_KEY.trim(),
      baseURL: "https://api.groq.com/openai/v1",
      timeout: 45000,
      maxRetries: 0,
    });
  }
  if (process.env.OPENAI_API_KEY?.trim()) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY.trim(), timeout: 45000, maxRetries: 0 });
  }
  throw new Error("API_NOT_CONFIGURED");
};

type GroqModel = { id: string; active?: boolean };

async function groqModels(key: string): Promise<string[]> {
  const response = await fetch("https://api.groq.com/openai/v1/models", {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    const body = await response.text();
    throw Object.assign(new Error(`Groq model discovery failed: ${body.slice(0, 350)}`), { status: response.status });
  }
  const payload = (await response.json()) as { data?: GroqModel[] };
  return (payload.data || []).filter((m) => m.active !== false).map((m) => m.id);
}

export async function aiJson(instructions: string, text: string): Promise<any> {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const isGroq = Boolean(groqKey);
  const configured = isGroq
    ? process.env.GROQ_MODEL?.trim()
    : process.env.OPENAI_MODEL?.trim();

  // Use a model confirmed available to this Groq account.
  // Avoid extra discovery requests and retired Llama model IDs.
  const models = isGroq
    ? [...new Set([configured || "openai/gpt-oss-20b", "openai/gpt-oss-20b", "openai/gpt-oss-120b"])]
    : [configured || "gpt-4.1-mini"];

  let lastError: unknown;
  for (const model of models) {
    try {
      const response = await client().chat.completions.create({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: instructions + "\nReturn exactly one valid JSON object, without markdown fences." },
          { role: "user", content: text },
        ],
      });
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("AI_EMPTY_RESPONSE");
      return JSON.parse(content);
    } catch (error) {
      lastError = error;
      const status = (error as { status?: number })?.status;
      // Try another supported model only for model-specific failures.
      if (isGroq && (status === 404 || status === 400)) { console.error("[Groq model rejected]", model, (error as Error).message); continue; }
      throw error;
    }
  }
  throw lastError || new Error("No available AI model could complete the request.");
}

export function providerError(error: unknown): { error: string; status: number } {
  const e = error as { status?: number; code?: string; name?: string; message?: string };
  if (e?.message === "API_NOT_CONFIGURED") return { error: "Add GROQ_API_KEY to .env.local and restart the server.", status: 503 };
  if (e?.status === 401) return { error: "Groq API key was rejected. Verify GROQ_API_KEY.", status: 502 };
  if (e?.status === 429) return { error: "Groq free-tier quota or rate limit reached. Try again later or use shorter input.", status: 429 };
  if (e?.status === 404) return { error: "Groq rejected the available models. Verify your API key project has access to a text generation model.", status: 502 };
  if (e?.status === 400) return { error: "AI request was rejected. Check the model and input size in the server terminal.", status: 502 };
  if (e?.status === 403) return { error: "Groq access denied for this API key or model.", status: 502 };
  if (e?.name === "SyntaxError" || e?.message === "AI_EMPTY_RESPONSE") return { error: "The AI returned an invalid or empty JSON response. Try again.", status: 422 };
  if (e?.name === "APIConnectionTimeoutError" || e?.name === "AbortError" || e?.code === "ETIMEDOUT") return { error: "The AI request timed out. Please try again.", status: 504 };
  if (e?.status && e.status >= 500) return { error: "AI provider temporarily unavailable. Try again.", status: 503 };
  console.error("[AccessAble AI] AI request failed", { status: e?.status, code: e?.code, name: e?.name, message: e?.message });
  return { error: "AI request failed. Check the VS Code terminal for details.", status: 500 };
}
