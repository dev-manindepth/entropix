// ── MCP Tool Definitions ────────────────────────────────────────────────────
// Plain objects that conform to the MCP tool schema.

export interface ListComponentsInput {
  category?:
    | "action"
    | "input"
    | "display"
    | "overlay"
    | "navigation"
    | "data"
    | "layout"
    | "feedback";
  platform?: "web" | "native" | "both";
}

export interface ComponentInfoInput {
  name: string;
}

export interface RenderUIInput {
  spec: unknown;
  data?: Record<string, unknown>;
}

export interface GenerateUIInput {
  prompt: string;
  categories?: string[];
  dataSchema?: Record<string, string>;
}

export interface RefineUIInput {
  currentSpec: unknown;
  instruction: string;
}

export interface ExportCodeInput {
  spec: unknown;
  format?: "component" | "page";
  componentName?: string;
}

export interface GenerateCodeInput {
  prompt: string;
  format?: "component" | "page";
  componentName?: string;
  categories?: string[];
}

export const ENTROPIX_MCP_TOOLS = [
  {
    name: "entropix_list_components",
    description:
      "List all available Entropix design system components. Optionally filter by category or platform.",
    inputSchema: {
      type: "object" as const,
      properties: {
        category: {
          type: "string",
          enum: [
            "action",
            "input",
            "display",
            "overlay",
            "navigation",
            "data",
            "layout",
            "feedback",
          ],
          description: "Filter by component category",
        },
        platform: {
          type: "string",
          enum: ["web", "native", "both"],
          description: "Filter by platform availability",
        },
      },
    },
  },
  {
    name: "entropix_component_info",
    description:
      "Get detailed information about a specific Entropix component including all props, allowed values, compound children, and usage examples.",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description:
            "Component name (e.g., 'Button', 'DataTable', 'Dialog')",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "entropix_render_ui",
    description:
      "Validate and prepare an Entropix UI specification for rendering. The spec uses JSON to describe component trees using Entropix design system components. Returns the validated spec or validation errors.",
    inputSchema: {
      type: "object" as const,
      properties: {
        spec: {
          type: "object",
          description:
            "UISpec JSON object with version, root node(s), and optional meta",
        },
        data: {
          type: "object",
          description:
            "Data context for resolving $bind expressions in the spec",
        },
      },
      required: ["spec"],
    },
  },
  {
    name: "entropix_generate_ui",
    description:
      "Generate an Entropix UI specification from a natural language description. Returns a JSON UISpec that can be rendered with EntropixRenderer.",
    inputSchema: {
      type: "object" as const,
      properties: {
        prompt: {
          type: "string",
          description:
            "Natural language description of the UI to generate",
        },
        categories: {
          type: "array",
          items: { type: "string" },
          description:
            "Component categories to consider (narrows context for better results)",
        },
        dataSchema: {
          type: "object",
          description:
            "Shape of available data for $bind expressions, e.g. { 'user.name': 'string' }",
        },
      },
      required: ["prompt"],
    },
  },
  {
    name: "entropix_refine_ui",
    description:
      "Refine an existing Entropix UI specification based on a natural language instruction.",
    inputSchema: {
      type: "object" as const,
      properties: {
        currentSpec: {
          type: "object",
          description: "The current UISpec JSON to refine",
        },
        instruction: {
          type: "string",
          description:
            "Natural language instruction describing the desired changes",
        },
      },
      required: ["currentSpec", "instruction"],
    },
  },
  {
    name: "entropix_export_code",
    description:
      "Convert an Entropix UI specification to React JSX code.",
    inputSchema: {
      type: "object" as const,
      properties: {
        spec: {
          type: "object",
          description: "The UISpec JSON to convert to code",
        },
        format: {
          type: "string",
          enum: ["component", "page"],
          description:
            "Output format: 'component' for a JSX fragment, 'page' for a full page component (default: 'component')",
        },
        componentName: {
          type: "string",
          description:
            "Name for the generated component (default: derived from spec title or 'GeneratedUI')",
        },
      },
      required: ["spec"],
    },
  },
  {
    name: "entropix_generate_code",
    description:
      "Generate React component code from a natural language description using Entropix components.",
    inputSchema: {
      type: "object" as const,
      properties: {
        prompt: {
          type: "string",
          description:
            "Natural language description of the UI to generate as code",
        },
        format: {
          type: "string",
          enum: ["component", "page"],
          description:
            "Output format: 'component' for a JSX fragment, 'page' for a full page component (default: 'component')",
        },
        componentName: {
          type: "string",
          description:
            "Name for the generated component (default: derived from spec title or 'GeneratedUI')",
        },
        categories: {
          type: "array",
          items: { type: "string" },
          description:
            "Component categories to consider (narrows context for better results)",
        },
      },
      required: ["prompt"],
    },
  },
] as const;
