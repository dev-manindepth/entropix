import type { UISpec } from "../spec/types.js";
import type {
  ComponentRegistry,
  ComponentCategory,
} from "../registry/types.js";
import type { AIAdapter, TokenUsage } from "./adapters/types.js";
import type { ValidationResult } from "../spec/validation.js";
import {
  validateSpec,
  validateSpecAgainstRegistry,
} from "../spec/validation.js";
import { buildSystemPrompt } from "./system-prompt.js";
import { defaultRegistry } from "../registry/registry.js";

export interface GenerateUIOptions {
  prompt: string;
  adapter: AIAdapter;
  registry?: ComponentRegistry;
  contextMode?: "compact" | "category" | "full";
  categories?: ComponentCategory[];
  context?: string;
  dataSchema?: Record<string, string>;
  maxTokens?: number;
  validate?: boolean;
}

export interface GenerateUIResult {
  spec: UISpec;
  validation: ValidationResult;
  usage: TokenUsage;
  raw: string;
}

/**
 * Extract JSON from a string that may contain markdown code fences,
 * leading/trailing whitespace, or other wrapping.
 */
export function extractJSON(text: string): string {
  let cleaned = text.trim();

  // Strip markdown code fences (with or without closing fence for truncated responses)
  // First try complete fence: ```json ... ```
  const completeFence = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (completeFence?.[1]) {
    cleaned = completeFence[1].trim();
  } else {
    // Truncated fence: ```json ... (no closing ```)
    const openFence = cleaned.match(/```(?:json)?\s*\n?([\s\S]+)/);
    if (openFence?.[1]) {
      cleaned = openFence[1].trim();
    }
  }

  // If still not starting with { or [, find the first { or [
  if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
    const firstBrace = cleaned.indexOf("{");
    const firstBracket = cleaned.indexOf("[");
    const start = Math.min(
      firstBrace >= 0 ? firstBrace : Infinity,
      firstBracket >= 0 ? firstBracket : Infinity,
    );
    if (start !== Infinity) {
      cleaned = cleaned.slice(start);
    }
  }

  // If trailing content after the JSON, find the matching closing brace/bracket
  if (cleaned.startsWith("{")) {
    const lastBrace = cleaned.lastIndexOf("}");
    if (lastBrace >= 0) {
      cleaned = cleaned.slice(0, lastBrace + 1);
    }
  } else if (cleaned.startsWith("[")) {
    const lastBracket = cleaned.lastIndexOf("]");
    if (lastBracket >= 0) {
      cleaned = cleaned.slice(0, lastBracket + 1);
    }
  }

  return cleaned;
}

/**
 * Attempt to repair truncated JSON by closing open braces, brackets, and strings.
 * This handles the common case where the LLM hit the max token limit mid-output.
 */
export function repairTruncatedJSON(text: string): string {
  let repaired = text.trim();

  // Remove trailing comma (common truncation point)
  repaired = repaired.replace(/,\s*$/, "");

  // Remove incomplete key-value pairs at the end (e.g., "key": or "key": "val)
  repaired = repaired.replace(/,?\s*"[^"]*":\s*("([^"\\]|\\.)*)?$/, "");
  repaired = repaired.replace(/,?\s*"[^"]*":\s*$/, "");

  // Count open vs close braces/brackets
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escape = false;

  for (const ch of repaired) {
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") openBraces++;
    if (ch === "}") openBraces--;
    if (ch === "[") openBrackets++;
    if (ch === "]") openBrackets--;
  }

  // Close unclosed strings
  if (inString) {
    repaired += '"';
  }

  // Close open brackets then braces (innermost first)
  while (openBrackets > 0) {
    repaired += "]";
    openBrackets--;
  }
  while (openBraces > 0) {
    repaired += "}";
    openBraces--;
  }

  return repaired;
}

export async function generateUI(
  options: GenerateUIOptions,
): Promise<GenerateUIResult> {
  const {
    prompt,
    adapter,
    registry = defaultRegistry,
    contextMode = "compact",
    categories,
    context,
    dataSchema,
    maxTokens = 8192,
    validate = true,
  } = options;

  // 1. Build system prompt
  const system = buildSystemPrompt({
    registry,
    contextMode,
    categories,
    dataSchema,
  });

  // 2. Build user prompt
  const userPrompt = context
    ? `${prompt}\n\nAdditional context: ${context}`
    : prompt;

  // 3. Call adapter
  const result = await adapter.generate({
    system,
    user: userPrompt,
    maxTokens,
    responseFormat: "json",
  });

  const raw = result.text;

  // 4. Extract and parse JSON (handles markdown fences, leading text, etc.)
  const cleaned = extractJSON(raw);

  let parsed: unknown;
  let wasRepaired = false;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Attempt to repair truncated JSON (common when hitting max tokens)
    try {
      const repaired = repairTruncatedJSON(cleaned);
      parsed = JSON.parse(repaired);
      wasRepaired = true;
    } catch {
      // Both attempts failed
      return {
        spec: {
          version: "1.0",
          root: {
            component: "Container",
            children: [
              {
                component: "Stack",
                props: { gap: "md" },
                children: [
                  "Generation produced invalid JSON. The prompt may be too complex — try a simpler description.",
                  `Error: Could not parse response (${raw.length} chars, ${result.usage.completionTokens} tokens used)`,
                ],
              },
            ],
          },
        } as UISpec,
        validation: {
          valid: false,
          errors: [
            {
              path: "",
              message: `Failed to parse AI response as JSON. Raw starts with: ${raw.slice(0, 100)}`,
            },
          ],
        },
        usage: result.usage,
        raw,
      };
    }
  }

  // 5. Validate with Zod
  let spec: UISpec;
  const errors: Array<{ path: string; message: string }> = [];

  if (wasRepaired) {
    errors.push({
      path: "",
      message: "JSON was truncated (hit max token limit) and auto-repaired. Some content may be missing.",
    });
  }

  try {
    spec = validateSpec(parsed);
  } catch (zodError: unknown) {
    const msg =
      zodError instanceof Error ? zodError.message : String(zodError);
    return {
      spec: (parsed ?? {
        version: "1.0",
        root: { component: "Container", children: "Schema validation failed" },
      }) as UISpec,
      validation: {
        valid: false,
        errors: [{ path: "", message: `Schema validation failed: ${msg}` }],
      },
      usage: result.usage,
      raw,
    };
  }

  // 6. Validate against registry
  let validation: ValidationResult = { valid: true, errors: [] };

  if (validate) {
    const registryValidation = validateSpecAgainstRegistry(spec, registry);
    validation = {
      valid: registryValidation.valid && errors.length === 0,
      errors: [...errors, ...registryValidation.errors],
    };
  } else {
    validation = { valid: errors.length === 0, errors };
  }

  return { spec, validation, usage: result.usage, raw };
}
