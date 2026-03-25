import type {
  ComponentRegistry,
  ComponentCategory,
} from "../registry/types.js";
import { compressRegistry } from "../registry/compress.js";

export interface SystemPromptOptions {
  registry: ComponentRegistry;
  contextMode: "compact" | "category" | "full";
  categories?: ComponentCategory[];
  dataSchema?: Record<string, string>;
}

export function buildSystemPrompt(options: SystemPromptOptions): string {
  const { registry, contextMode, categories, dataSchema } = options;

  const components = compressRegistry(registry, contextMode, categories);

  const sections: string[] = [];

  // 1. Role
  sections.push(
    `You are an Entropix UI generator. Your job is to produce a JSON UI specification (UISpec) that describes a user interface built from the available component library. You MUST output ONLY valid JSON — no markdown fences, no explanation, no commentary.`,
  );

  // 2. Available components
  sections.push(`## Available Components\n\n${components}`);

  // 3. Output format
  sections.push(
    `## Output Format

Your response MUST be a valid JSON object matching this schema:

{
  "version": "1.0",
  "root": <UINode | UINode[]>,
  "meta": {
    "title": "<short title>",
    "description": "<what this UI does>"
  }
}

Each UINode has the shape:
{
  "component": "<ComponentName>",
  "props": { ... },
  "children": <string | UINode | Array<string | UINode | conditional | loop>>
}`,
  );

  // 4. Rules
  sections.push(
    `## Rules

1. Only use components listed in the Available Components section above.
2. Use \`{ "$bind": "<path>" }\` for dynamic data references in prop values.
3. Use \`{ "$action": "<name>", "payload": { ... } }\` for event handlers.
4. Use \`{ "$token": "<token-name>" }\` to reference design tokens for colors, spacing, and typography.
5. Compound components must follow nesting rules — child components must be placed inside their declared parent component.
6. Every prop value must be a valid JSON type: string, number, boolean, null, object, or array.
7. Do NOT invent components that are not in the registry.
8. Do NOT include any text outside the JSON object.`,
  );

  // 5. Data schema
  if (dataSchema && Object.keys(dataSchema).length > 0) {
    const schemaLines = Object.entries(dataSchema)
      .map(([path, type]) => `  - \`${path}\`: ${type}`)
      .join("\n");
    sections.push(
      `## Available Data (for $bind paths)\n\n${schemaLines}`,
    );
  }

  return sections.join("\n\n");
}
