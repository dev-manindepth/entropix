import { createAnthropicAdapter } from "@entropix/ai/generate";

export function getAdapter() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set in .env.local");
  return createAnthropicAdapter({ apiKey });
}
