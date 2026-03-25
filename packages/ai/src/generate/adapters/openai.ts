import type { AIAdapter, GenerateParams, GenerateResult } from "./types.js";

declare const process: { env: Record<string, string | undefined> };

export interface OpenAIAdapterOptions {
  apiKey?: string;
  model?: string;
  baseURL?: string;
}

export function createOpenAIAdapter(
  options?: OpenAIAdapterOptions,
): AIAdapter {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const apiKey = options?.apiKey ?? process.env.OPENAI_API_KEY;
  const model = options?.model ?? "gpt-4o";
  const baseURL = options?.baseURL ?? "https://api.openai.com";

  return {
    async generate(params: GenerateParams): Promise<GenerateResult> {
      if (!apiKey) {
        throw new Error(
          "OpenAI API key is required. Pass it via options.apiKey or set OPENAI_API_KEY.",
        );
      }

      const body: Record<string, unknown> = {
        model,
        max_tokens: params.maxTokens,
        messages: [
          { role: "system" as const, content: params.system },
          { role: "user" as const, content: params.user },
        ],
      };

      if (params.responseFormat === "json") {
        body.response_format = { type: "json_object" };
      }

      const response = await fetch(`${baseURL}/v1/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `OpenAI API error (${String(response.status)}): ${errorText}`,
        );
      }

      const data = (await response.json()) as {
        choices: Array<{ message: { content: string } }>;
        usage: { prompt_tokens: number; completion_tokens: number };
      };

      const content = data.choices[0]?.message?.content;
      if (content == null) {
        throw new Error("OpenAI API returned no content in the response.");
      }

      return {
        text: content,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
        },
      };
    },
  };
}
