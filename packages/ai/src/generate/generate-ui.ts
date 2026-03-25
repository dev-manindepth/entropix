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
    maxTokens = 4096,
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

  // 4. Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      spec: { version: "1.0", root: { component: "Box", children: raw } },
      validation: {
        valid: false,
        errors: [
          {
            path: "",
            message: `Failed to parse AI response as JSON: ${raw.slice(0, 200)}`,
          },
        ],
      },
      usage: result.usage,
      raw,
    };
  }

  // 5. Validate with Zod
  let spec: UISpec;
  const errors: Array<{ path: string; message: string }> = [];

  try {
    spec = validateSpec(parsed);
  } catch (zodError: unknown) {
    const msg =
      zodError instanceof Error ? zodError.message : String(zodError);
    return {
      spec: (parsed ?? {
        version: "1.0",
        root: { component: "Box" },
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
