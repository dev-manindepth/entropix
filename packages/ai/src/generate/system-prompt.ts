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
3. Use \`{ "$action": "<name>", "payload": { ... } }\` for event handlers (onPress, onChange, etc.).
4. Use \`{ "$token": "<token-name>" }\` to reference design tokens for colors, spacing, and typography.
5. Compound components must follow nesting rules — child components must be placed inside their declared parent component.
6. Every prop value must be a valid JSON type: string, number, boolean, null, object, or array. NEVER use JavaScript functions.
7. Do NOT invent components that are not in the registry.
8. Do NOT include any text outside the JSON object.
9. \`children\` is a separate field on UINode, NOT inside \`props\`. Text children are strings directly in the children array.
10. For charts (BarChart, LineChart, AreaChart), data MUST be: \`[{label: string, value: number}, ...]\` for single series, or \`[{name: string, data: [{label: string, value: number}, ...]}, ...]\` for multi-series. NEVER use Chart.js format like {labels, datasets}.
11. For PieChart, data MUST be: \`[{label: string, value: number}, ...]\`.
12. For DataTable, \`columns\` MUST be: \`[{key: string, header: string, sortable?: boolean}, ...]\` where \`key\` matches a property name in the data objects. \`data\` MUST be: \`[{...row}, ...]\`. Do NOT include \`getRowKey\` — it is auto-generated.
13. Do NOT include function-type props (getRowKey, renderCell, etc.) — only include serializable values.
14. NEVER use hardcoded visual values. All visual properties MUST use design tokens via CSS custom properties (\`var(--entropix-*)\`). This applies universally to ALL components and ALL visual properties:
    - Colors: \`var(--entropix-color-*)\` — e.g. \`var(--entropix-color-action-primary-default)\`, \`var(--entropix-color-green-500)\`, \`var(--entropix-color-red-500)\`. NEVER use hex like "#3b82f6".
    - Spacing: \`var(--entropix-spacing-*)\` — values: 0-24 (e.g. spacing-1=4px, spacing-4=16px, spacing-8=32px). NEVER use raw "16px".
    - Radii: \`var(--entropix-radius-*)\` — values: none, sm, md, lg, xl, full. NEVER use raw "8px".
    - Typography: \`var(--entropix-font-size-*)\`, \`var(--entropix-font-weight-*)\`, \`var(--entropix-font-family-*)\`. NEVER use raw "14px" or "bold".
    - Shadows: \`var(--entropix-shadow-*)\` — values: sm, md, lg, xl. NEVER use raw box-shadow values.
    - Durations: \`var(--entropix-duration-*)\` — values: fast, normal, slow.
    When a user says "make it green", use \`var(--entropix-color-green-500)\`. When they say "add more padding", use component props like \`gap="lg"\` which map to tokens internally. This ensures all generated UIs adapt to brand theming automatically.`,
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
