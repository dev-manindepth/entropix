# @entropix/ai -- Implementation Guide

This document teaches you how to think about and write code in the `@entropix/ai` package. It covers the AI generation pipeline, the spec renderer, the component registry, code export, refinement, and the MCP server.

---

## 1. How the AI Pipeline Thinks

The full flow from user prompt to rendered UI:

```
User prompt: "Create a pricing page with 3 tiers"
  |
  v
buildSystemPrompt()
  Role instructions + Component registry (compressed) + JSON format rules
  |
  v
adapter.generate({ system, user, maxTokens, responseFormat: "json" })
  Calls Claude API via an adapter (AnthropicAdapter, etc.)
  |
  v
Raw response: "```json\n{ \"version\": \"1.0\", \"root\": { ... } }\n```"
  |
  v
extractJSON()
  Strips markdown fences, finds first { or [, trims trailing content
  |
  v
JSON.parse()
  If this fails:
    repairTruncatedJSON() -- closes unclosed braces/brackets/strings
    JSON.parse() again
    If still fails: return error spec
  |
  v
validateSpec(parsed)
  Zod schema check: version string, root node(s), meta optional
  |
  v
validateSpecAgainstRegistry(spec, registry)
  Checks that all component names exist and prop values are valid
  |
  v
UISpec ready for rendering
```

### extractJSON()

The AI often wraps JSON in markdown code fences or adds explanatory text. `extractJSON()` handles all of this:

```tsx
extractJSON('Some text\n```json\n{"version":"1.0"}\n```\nMore text')
  -> '{"version":"1.0"}'

extractJSON('{"version":"1.0"}')
  -> '{"version":"1.0"}'

extractJSON('Here is the result: {"version":"1.0"} hope this helps')
  -> '{"version":"1.0"}'
```

### repairTruncatedJSON()

When the AI hits the max token limit, the JSON is cut off mid-output. This function:

1. Removes trailing commas: `{ "a": 1,` -> `{ "a": 1`
2. Removes incomplete key-value pairs: `{ "a": 1, "b":` -> `{ "a": 1`
3. Counts unmatched `{`, `[`, `"` and closes them

```tsx
repairTruncatedJSON('{"root": {"component": "Stack", "children": [{"component": "Text"')
  -> '{"root": {"component": "Stack", "children": [{"component": "Text"}]}}'
```

---

## 2. How to Add a Component to the AI Registry

The registry lives at `src/registry/registry.ts`. It tells the AI what components exist, what props they accept, and shows examples.

### Step 1: Add the component entry

```tsx
// In defaultRegistry.components:
RadarChart: {
  name: "RadarChart",
  description: "Radar/spider chart for multi-dimensional data comparison",
  category: "data",
  platform: "web",
  package: "@entropix/data",
  acceptsChildren: false,
  props: [
    {
      name: "data",
      type: "ChartData",
      required: true,
      description: "Array of {label, value} or {name, data: [{label, value}]} for multi-series",
    },
    {
      name: "height",
      type: "number",
      required: false,
      description: "Chart height in pixels",
      defaultValue: 300,
    },
    {
      name: "showLegend",
      type: "boolean",
      required: false,
      description: "Whether to show the legend",
      defaultValue: true,
    },
  ],
  examples: [
    {
      title: "Basic radar chart",
      spec: {
        component: "RadarChart",
        props: {
          data: [
            { label: "Speed", value: 80 },
            { label: "Power", value: 65 },
            { label: "Defense", value: 90 },
          ],
          height: 300,
        },
      },
    },
  ],
},
```

### Step 2: Add to the component map

In `src/renderer/component-maps.ts`, add the mapping so the renderer knows which React component to use:

```tsx
import { RadarChart } from "@entropix/data";

export const WEB_COMPONENT_MAP = {
  // ... existing components
  RadarChart,
};
```

### Step 3: Add to DATA_COMPONENTS in spec-to-code

In `src/export/spec-to-code.ts`, add the component name so code export uses the correct import:

```tsx
const DATA_COMPONENTS = new Set([
  "DataTable", "BarChart", "LineChart", "AreaChart", "PieChart",
  "RadarChart",  // <-- add here
]);
```

### Step 4: Update the registry type

In `src/registry/types.ts`, add the category if it is new:

```tsx
export type ComponentCategory = "action" | "input" | "display" | "overlay"
  | "navigation" | "data" | "layout" | "feedback";
```

---

## 3. How the Renderer Works

The `EntropixRenderer` takes a declarative `UISpec` and renders it as a React element tree.

### The Render Flow

```
UISpec: {
  version: "1.0",
  root: {
    component: "Stack",
    props: { gap: "lg" },
    children: [
      "Welcome",
      { component: "Button", props: { variant: "primary", onPress: { "$action": "save" } }, children: "Save" }
    ]
  }
}

  |  renderNode(root, data)
  v

1. Look up "Stack" in the component map
   -> Found: the Stack React component

2. resolveProps({ gap: "lg" })
   -> { gap: "lg" }  (simple passthrough for plain values)

3. resolveChildren(["Welcome", { component: "Button", ... }])
   -> ["Welcome", renderNode(buttonNode, data)]
   -> ["Welcome", <Button variant="primary" onClick={() => onAction("save")}>Save</Button>]

4. React.createElement(Stack, { gap: "lg" }, ...resolvedChildren)

5. Wrap in NodeErrorBoundary for graceful error handling
```

### Prop Resolution

The `resolveProps()` function handles special prop types:

**Plain values** -- passed through as-is:
```json
{ "gap": "lg" }  ->  { gap: "lg" }
```

**$bind** -- data context lookup:
```json
{ "label": { "$bind": "user.name" } }
// with data = { user: { name: "John" } }
  ->  { label: "John" }
```

Supports dot notation (`user.address.city`) and bracket notation (`items[0].price`).

**$action** -- creates a callback:
```json
{ "onPress": { "$action": "save", "payload": { "id": { "$bind": "item.id" } } } }
  ->  { onPress: () => onAction("save", { id: resolvedId }) }
```

Payload values are resolved at invocation time, not render time.

**$token** -- CSS custom property reference:
```json
{ "color": { "$token": "color-text-primary" } }
  ->  { color: "var(--entropix-color-text-primary)" }
```

### Children Resolution

`resolveChildren()` handles four types:

**Strings** -- rendered as text:
```json
"Hello world"  ->  "Hello world"
```

**UINode objects** -- recursively rendered:
```json
{ "component": "Button", "children": "Click" }  ->  <Button>Click</Button>
```

**Conditionals ($if):**
```json
{
  "$if": "user.isAdmin",
  "then": { "component": "Button", "children": "Admin Panel" },
  "else": "Access denied"
}
```
Resolves `user.isAdmin` from the data context. Renders `then` if truthy, `else` if falsy.

**Loops ($each):**
```json
{
  "$each": "items",
  "as": "item",
  "key": "item.id",
  "render": { "component": "Text", "children": { "$bind": "item.name" } }
}
```
Iterates over `data.items`, extending the data context with `item` (current) and `itemIndex` (position).

### Error Handling

Every node is wrapped in a `NodeErrorBoundary`. If a component throws during render, the boundary shows a red error message instead of crashing the entire tree:

```
Error rendering "BrokenComponent": Cannot read property 'foo' of undefined
```

Unknown components show a dashed red border with the component name.

---

## 4. How to Add a New MCP Tool

MCP tools are defined in `src/mcp/tools.ts` and handled in `src/mcp/handlers.ts`.

### Step 1: Define the tool schema

Add to `ENTROPIX_MCP_TOOLS` in `tools.ts`:

```tsx
{
  name: "entropix_search_components",
  description: "Search for components by keyword or use case",
  inputSchema: {
    type: "object" as const,
    properties: {
      query: {
        type: "string",
        description: "Search query (e.g., 'form input', 'data visualization')",
      },
    },
    required: ["query"],
  },
},
```

### Step 2: Add the input type

```tsx
export interface SearchComponentsInput {
  query: string;
}
```

### Step 3: Implement the handler

In `handlers.ts`, add a case to the tool dispatch:

```tsx
case "entropix_search_components": {
  const { query } = input as SearchComponentsInput;
  const results = Object.values(registry.components)
    .filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase())
    );
  return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
}
```

### Step 4: The MCP server picks it up automatically

The server in `src/mcp/server.ts` reads from `ENTROPIX_MCP_TOOLS` and dispatches to handlers, so no further wiring is needed.

---

## 5. How specToCode() Works

Converts a UISpec into importable React JSX code.

### The Flow

```
UISpec input
  |
  v
Traverse the node tree with nodeToJSX()
  - Each node: determine package (@entropix/react or @entropix/data)
  - Format props: strings -> "value", numbers -> {value}, booleans -> {value}
  - Handle special prop types:
      $bind -> {data.user.name}
      $action -> {() => onAction("save")}
      $token -> "var(--entropix-color-text-primary)"
  |
  v
Build import statements
  Group components by package, sort alphabetically
  |
  v
Output format:
  "component" -> just the JSX tree
  "page" -> full component with imports and function wrapper
```

### Example Output (page format)

Input spec:
```json
{
  "version": "1.0",
  "root": {
    "component": "Stack",
    "props": { "gap": "lg" },
    "children": [
      { "component": "Button", "props": { "variant": "primary" }, "children": "Save" }
    ]
  }
}
```

Output:
```tsx
import { Button, Stack } from "@entropix/react";

export function GeneratedUI({ data, onAction }) {
  return (
    <Stack gap="lg">
      <Button variant="primary">
        Save
      </Button>
    </Stack>
  );
}
```

### Conditionals and Loops in Code

`$if` becomes a ternary or `&&`:
```tsx
{data.user.isAdmin && (
  <Button>Admin Panel</Button>
)}
```

`$each` becomes `.map()`:
```tsx
{data.items.map((item, i) => (
  <Text>{item.name}</Text>
))}
```

---

## 6. How refineUI() Works

Refinement takes an existing spec and modifies it based on natural language instructions.

### The Approach: Spec-in-Context

Instead of trying to diff or patch, we send the **entire current spec** to the AI along with the refinement instruction, and ask for the **complete updated spec** back.

```
System prompt: same as generateUI (registry + format rules)

User prompt:
  "Here is the current UI specification:
   ```json
   { ... current spec ... }
   ```

   User's request: Make the buttons larger and add a dark background

   Return the COMPLETE updated UISpec JSON."
```

This approach is simpler and more reliable than incremental patching. The AI sees the full context and can make coordinated changes across the spec.

### The Pipeline

`refineUI()` follows the exact same extraction/parsing/validation pipeline as `generateUI()`:

```
adapter.generate() -> extractJSON() -> JSON.parse() / repairTruncatedJSON()
  -> validateSpec() -> validateSpecAgainstRegistry() -> UISpec
```

The only difference is the prompt construction.

---

## 7. The System Prompt

`buildSystemPrompt()` constructs the system message sent to the AI. It has three context modes:

- **compact** (default): Component names and brief descriptions only. Smallest token count.
- **category**: Full details for specified categories, compact for others.
- **full**: Full details for all components. Largest token count.

The registry is compressed using `compressRegistry()` to minimize token usage:

```tsx
// compact format example:
"Stack(layout): Vertical stack with gap/align. Props: gap(none|xs|sm|md|lg|xl|2xl), align(start|center|end|stretch)"
```

The system prompt also includes:
- Role and persona instructions
- UISpec JSON format specification
- Rules for valid component nesting
- Available data binding syntax

---

## 8. AI Adapter Interface

The adapter abstracts the LLM API call. Any LLM can be used by implementing:

```tsx
interface AIAdapter {
  generate(options: {
    system: string;
    user: string;
    maxTokens: number;
    responseFormat?: "json" | "text";
  }): Promise<{
    text: string;
    usage: { promptTokens: number; completionTokens: number };
  }>;
}
```

The built-in `AnthropicAdapter` uses the `@anthropic-ai/sdk` to call Claude. But you could implement an `OpenAIAdapter`, a `MockAdapter` for testing, or any other LLM backend.

---

## 9. Validation

Two levels of validation ensure the spec is usable:

**Structural validation** (`validateSpec()`): Zod schema checks that the JSON has the right shape -- version string, root with component/props/children, proper nesting.

**Registry validation** (`validateSpecAgainstRegistry()`): Checks that every `component` name in the spec exists in the registry, and that prop values match allowed values (e.g., `gap` must be one of `none|xs|sm|md|lg|xl|2xl`).

Validation results include an array of errors with paths:

```tsx
{
  valid: false,
  errors: [
    { path: "root.children[2]", message: "Unknown component: FancyWidget" },
    { path: "root.props.gap", message: "Invalid value 'huge' for gap" },
  ]
}
```

The renderer still works with invalid specs (it shows error boxes for unknown components), but validation helps the AI self-correct.
