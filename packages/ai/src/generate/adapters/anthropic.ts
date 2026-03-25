import type { AIAdapter, GenerateParams, GenerateResult } from "./types.js";

declare const process: { env: Record<string, string | undefined> };

export interface AnthropicAdapterOptions {
  apiKey?: string;
  model?: string;
  baseURL?: string;
}

export function createAnthropicAdapter(
  options?: AnthropicAdapterOptions,
): AIAdapter {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const apiKey = options?.apiKey ?? process.env.ANTHROPIC_API_KEY;
  const model = options?.model ?? "claude-sonnet-4-20250514";
  const baseURL = options?.baseURL ?? "https://api.anthropic.com";

  return {
    async generate(params: GenerateParams): Promise<GenerateResult> {
      if (!apiKey) {
        throw new Error(
          "Anthropic API key is required. Pass it via options.apiKey or set ANTHROPIC_API_KEY.",
        );
      }

      const body = {
        model,
        max_tokens: params.maxTokens,
        system: [{ type: "text" as const, text: params.system }],
        messages: [{ role: "user" as const, content: params.user }],
      };

      const response = await fetch(`${baseURL}/v1/messages`, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Anthropic API error (${String(response.status)}): ${errorText}`,
        );
      }

      const data = (await response.json()) as {
        content: Array<{ type: string; text: string }>;
        usage: { input_tokens: number; output_tokens: number };
      };

      const textBlock = data.content.find((block) => block.type === "text");
      if (!textBlock) {
        throw new Error("Anthropic API returned no text content block.");
      }

      return {
        text: textBlock.text,
        usage: {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
        },
      };
    },
  };
}
