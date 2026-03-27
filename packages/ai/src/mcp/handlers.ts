import { defaultRegistry } from "../registry/registry.js";
import {
  validateSpec,
  validateSpecAgainstRegistry,
} from "../spec/validation.js";
import { generateUI } from "../generate/generate-ui.js";
import { refineUI } from "../generate/refine-ui.js";
import { specToCode } from "../export/spec-to-code.js";
import { createAnthropicAdapter } from "../generate/adapters/anthropic.js";
import type {
  ComponentCategory,
  Platform,
  ComponentRegistryEntry,
} from "../registry/types.js";
import type {
  ListComponentsInput,
  ComponentInfoInput,
  RenderUIInput,
  GenerateUIInput,
  RefineUIInput,
  ExportCodeInput,
  GenerateCodeInput,
} from "./tools.js";

// ── Result type ─────────────────────────────────────────────────────────────

export interface ToolResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function textResult(text: string, isError?: boolean): ToolResult {
  return {
    content: [{ type: "text", text }],
    ...(isError ? { isError } : {}),
  };
}

function formatComponentSummary(entry: ComponentRegistryEntry): string {
  return `- **${entry.name}** (${entry.category}, ${entry.platform}): ${entry.description}`;
}

// ── Handlers ────────────────────────────────────────────────────────────────

export function handleListComponents(input: ListComponentsInput): ToolResult {
  const { category, platform } = input;

  let entries = Object.values(defaultRegistry.components);

  if (category) {
    entries = entries.filter(
      (e) => e.category === (category as ComponentCategory),
    );
  }
  if (platform) {
    entries = entries.filter((e) => {
      if ((platform as Platform) === "both") return e.platform === "both";
      return e.platform === platform || e.platform === "both";
    });
  }

  if (entries.length === 0) {
    return textResult(
      `No components found matching category=${category ?? "any"}, platform=${platform ?? "any"}.`,
    );
  }

  const grouped = new Map<string, ComponentRegistryEntry[]>();
  for (const entry of entries) {
    const cat = entry.category;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(entry);
  }

  const lines: string[] = [`Found ${String(entries.length)} component(s):\n`];
  for (const [cat, items] of grouped) {
    lines.push(
      `## ${cat.charAt(0).toUpperCase() + cat.slice(1)} (${defaultRegistry.categories[cat as ComponentCategory]})`,
    );
    for (const item of items) {
      lines.push(formatComponentSummary(item));
    }
    lines.push("");
  }

  return textResult(lines.join("\n"));
}

export function handleComponentInfo(input: ComponentInfoInput): ToolResult {
  const { name } = input;
  const entry = defaultRegistry.components[name];

  if (!entry) {
    const available = Object.keys(defaultRegistry.components).join(", ");
    return textResult(
      `Component "${name}" not found in the registry.\n\nAvailable components: ${available}`,
      true,
    );
  }

  const sections: string[] = [
    `# ${entry.name}`,
    "",
    entry.description,
    "",
    `- **Category:** ${entry.category}`,
    `- **Platform:** ${entry.platform}`,
    `- **Package:** ${entry.package}`,
    `- **Accepts children:** ${String(entry.acceptsChildren)}`,
  ];

  if (entry.parentComponent) {
    sections.push(`- **Parent component:** ${entry.parentComponent}`);
  }

  // Props
  sections.push("", "## Props", "");
  if (entry.props.length === 0) {
    sections.push("_No props defined._");
  } else {
    for (const prop of entry.props) {
      const parts = [`**${prop.name}**`];
      parts.push(`(${prop.type})`);
      if (prop.required) parts.push("[required]");
      parts.push(`— ${prop.description}`);
      if (prop.defaultValue !== undefined) {
        parts.push(`Default: \`${JSON.stringify(prop.defaultValue)}\``);
      }
      if (prop.allowedValues && prop.allowedValues.length > 0) {
        parts.push(
          `Allowed: ${prop.allowedValues.map((v) => `\`${String(v)}\``).join(", ")}`,
        );
      }
      sections.push(`- ${parts.join(" ")}`);
    }
  }

  // Compound children
  if (entry.compoundChildren && entry.compoundChildren.length > 0) {
    sections.push("", "## Compound Children", "");
    for (const child of entry.compoundChildren) {
      const flags: string[] = [];
      if (child.required) flags.push("required");
      if (child.multiple) flags.push("multiple");
      const flagStr = flags.length > 0 ? ` [${flags.join(", ")}]` : "";
      sections.push(`- **${child.name}**${flagStr} — ${child.description}`);
    }
  }

  // Examples
  if (entry.examples.length > 0) {
    sections.push("", "## Examples", "");
    for (const ex of entry.examples) {
      sections.push(`### ${ex.title}`, "```json", JSON.stringify(ex.spec, null, 2), "```", "");
    }
  }

  return textResult(sections.join("\n"));
}

export function handleRenderUI(input: RenderUIInput): ToolResult {
  const { spec, data } = input;

  // Step 1: Structural validation via Zod
  let parsedSpec;
  try {
    parsedSpec = validateSpec(spec);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown validation error";
    return textResult(
      `Spec validation failed (structural):\n\n${message}`,
      true,
    );
  }

  // Step 2: Registry validation
  const registryResult = validateSpecAgainstRegistry(
    parsedSpec,
    defaultRegistry,
  );

  if (!registryResult.valid) {
    const errorLines = registryResult.errors.map(
      (e) => `- [${e.path}] ${e.message}`,
    );
    return textResult(
      `Spec validation failed (registry):\n\n${errorLines.join("\n")}`,
      true,
    );
  }

  // Valid spec — return it along with any data context
  const result: Record<string, unknown> = {
    valid: true,
    spec: parsedSpec,
  };
  if (data) {
    result.data = data;
  }

  return textResult(JSON.stringify(result, null, 2));
}

export async function handleGenerateUI(
  input: GenerateUIInput,
): Promise<ToolResult> {
  const { prompt, categories, dataSchema } = input;

  let adapter;
  try {
    adapter = createAnthropicAdapter();
  } catch {
    return textResult(
      "Failed to create AI adapter. Set the ANTHROPIC_API_KEY environment variable or pass an API key.\n\n" +
        "Example:\n  export ANTHROPIC_API_KEY=sk-ant-...",
      true,
    );
  }

  try {
    const result = await generateUI({
      prompt,
      adapter,
      categories: categories as ComponentCategory[] | undefined,
      dataSchema,
    });

    const output: Record<string, unknown> = {
      spec: result.spec,
      validation: result.validation,
      usage: result.usage,
    };

    return textResult(JSON.stringify(output, null, 2));
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown generation error";
    return textResult(`UI generation failed:\n\n${message}`, true);
  }
}

export async function handleRefineUI(
  input: RefineUIInput,
): Promise<ToolResult> {
  const { currentSpec, instruction } = input;

  let adapter;
  try {
    adapter = createAnthropicAdapter();
  } catch {
    return textResult(
      "Failed to create AI adapter. Set the ANTHROPIC_API_KEY environment variable or pass an API key.\n\n" +
        "Example:\n  export ANTHROPIC_API_KEY=sk-ant-...",
      true,
    );
  }

  // Validate that currentSpec is a valid UISpec first
  let parsedSpec;
  try {
    parsedSpec = validateSpec(currentSpec);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown validation error";
    return textResult(
      `Current spec validation failed:\n\n${message}`,
      true,
    );
  }

  try {
    const result = await refineUI({
      currentSpec: parsedSpec,
      instruction,
      adapter,
    });

    const output: Record<string, unknown> = {
      spec: result.spec,
      validation: result.validation,
      usage: result.usage,
    };

    return textResult(JSON.stringify(output, null, 2));
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown refinement error";
    return textResult(`UI refinement failed:\n\n${message}`, true);
  }
}

export function handleExportCode(input: ExportCodeInput): ToolResult {
  const { spec, format, componentName } = input;

  // Validate that spec is a valid UISpec first
  let parsedSpec;
  try {
    parsedSpec = validateSpec(spec);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown validation error";
    return textResult(
      `Spec validation failed:\n\n${message}`,
      true,
    );
  }

  try {
    const result = specToCode({
      spec: parsedSpec,
      format,
      componentName,
    });

    return textResult(JSON.stringify(result, null, 2));
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown export error";
    return textResult(`Code export failed:\n\n${message}`, true);
  }
}

export async function handleGenerateCode(
  input: GenerateCodeInput,
): Promise<ToolResult> {
  const { prompt, format, componentName, categories } = input;

  let adapter;
  try {
    adapter = createAnthropicAdapter();
  } catch {
    return textResult(
      "Failed to create AI adapter. Set the ANTHROPIC_API_KEY environment variable or pass an API key.\n\n" +
        "Example:\n  export ANTHROPIC_API_KEY=sk-ant-...",
      true,
    );
  }

  try {
    const genResult = await generateUI({
      prompt,
      adapter,
      categories: categories as ComponentCategory[] | undefined,
    });

    const codeResult = specToCode({
      spec: genResult.spec,
      format,
      componentName,
    });

    const output: Record<string, unknown> = {
      code: codeResult.code,
      imports: codeResult.imports,
      dependencies: codeResult.dependencies,
      validation: genResult.validation,
      usage: genResult.usage,
    };

    return textResult(JSON.stringify(output, null, 2));
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown generation error";
    return textResult(`Code generation failed:\n\n${message}`, true);
  }
}
