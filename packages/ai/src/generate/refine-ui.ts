import type { UISpec } from "../spec/types.js";
import type {
  ComponentRegistry,
  ComponentCategory,
} from "../registry/types.js";
import type { AIAdapter } from "./adapters/types.js";
import type { ValidationResult } from "../spec/validation.js";
import {
  validateSpec,
  validateSpecAgainstRegistry,
} from "../spec/validation.js";
import { buildSystemPrompt } from "./system-prompt.js";
import { defaultRegistry } from "../registry/registry.js";
import { extractJSON, repairTruncatedJSON } from "./generate-ui.js";
import type { GenerateUIResult } from "./generate-ui.js";

export interface RefineUIOptions {
  currentSpec: UISpec;
  instruction: string;
  adapter: AIAdapter;
  registry?: ComponentRegistry;
  contextMode?: "compact" | "category" | "full";
  categories?: ComponentCategory[];
  maxTokens?: number;
  validate?: boolean;
}

export async function refineUI(
  options: RefineUIOptions,
): Promise<GenerateUIResult> {
  const {
    currentSpec,
    instruction,
    adapter,
    registry = defaultRegistry,
    contextMode = "compact",
    categories,
    maxTokens = 8192,
    validate = true,
  } = options;

  // 1. Build system prompt (same as generateUI)
  const system = buildSystemPrompt({
    registry,
    contextMode,
    categories,
  });

  // 2. Build user prompt that includes the current spec and refinement instruction
  const specJSON = JSON.stringify(currentSpec, null, 2);
  const userPrompt = `Here is the current UI specification:\n\`\`\`json\n${specJSON}\n\`\`\`\n\nUser's request: ${instruction}\n\nReturn the COMPLETE updated UISpec JSON.`;

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
                  "Refinement produced invalid JSON. The instruction may be too complex — try a simpler description.",
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
      message:
        "JSON was truncated (hit max token limit) and auto-repaired. Some content may be missing.",
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
        root: {
          component: "Container",
          children: "Schema validation failed",
        },
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
