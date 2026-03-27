# @entropix/ai — Architecture Document

## What This Package Does

`@entropix/ai` is the AI-native layer of the Entropix design system. It enables LLMs to **generate, validate, and render UI** using only Entropix components — no random HTML, no hallucinated components, no off-brand output.

**The core problem it solves:** No design system can pre-build every possible UI. When an AI agent needs a "flight comparison card" or "crypto portfolio dashboard" that doesn't exist as a component, it either generates random markup (breaking design consistency) or fails. This package constrains AI to generate UIs **within** the design system's boundaries.

---

## How LLMs Know About Our Components

This is the most important architectural question. Here's exactly how it works:

### The Component Registry

Every Entropix component is described in a machine-readable registry (`registry/registry.ts`). This is **not** the component source code — it's a structured metadata manifest that tells the LLM:

```
For each of the 50 components:
├── name: "DataTable"
├── description: "Sortable, filterable, paginated data table"
├── category: "data" (one of 8: action, input, display, overlay, navigation, data, layout, feedback)
├── platform: "both" | "web" | "native"
├── package: "@entropix/data"
├── acceptsChildren: false
├── props[]:
│   ├── name: "data"
│   ├── type: "Array<Record<string, unknown>>"  ← exact shape, not just "any"
│   ├── required: true
│   ├── description: "Array of row objects. Example: [{ name: 'Alice', role: 'Admin' }]"
│   ├── defaultValue: undefined
│   └── allowedValues: undefined
├── compoundChildren[]:  (for compound components like Dialog → DialogTrigger/DialogContent)
│   ├── name: "Column"
│   └── required: false
└── examples[]:  (few-shot JSON specs the LLM can reference)
```

**Why a registry instead of just giving the LLM our TypeScript source?**

| Approach | Tokens | Accuracy | Maintainability |
|----------|--------|----------|-----------------|
| Raw TypeScript source | ~50K+ tokens | Low — LLM must parse imports, generics, hooks | Breaks when code changes |
| JSDoc + types | ~20K tokens | Medium — still noisy | Coupled to source |
| **Structured registry** | **2K-8K tokens** | **High — purpose-built for LLMs** | **Decoupled, versioned** |

The registry is the **single source of truth** for what an LLM can use. If a component isn't in the registry, the LLM cannot generate it.

### How The Registry Reaches The LLM

When `generateUI()` is called, the pipeline:

1. **Compresses** the registry into a token-efficient format
2. **Injects** it into a system prompt
3. **Sends** the system prompt + user prompt to the LLM
4. **Parses** the LLM's JSON response
5. **Validates** the response against the registry

```
Registry (50 components, ~75K chars)
         ↓ compressRegistry()
Compressed (2K-8K tokens depending on mode)
         ↓ buildSystemPrompt()
System Prompt = Role + Components + Format + Rules
         ↓ adapter.generate()
Claude API call
         ↓ extractJSON() + repairTruncatedJSON()
UISpec JSON
         ↓ validateSpec() + validateSpecAgainstRegistry()
Validated UISpec
```

### Registry Compression Modes

The registry is ~75K characters raw. Sending all of it every time would waste tokens. Three compression modes solve this:

**1. Compact Mode (~2K tokens)**
```
Stack(gap?: "none"|"xs"|"sm"|"md"|"lg"|"xl"|"2xl" = "md", align?: "start"|"center"|"end"|"stretch") - Vertical stack layout [children]
Button(variant?: "primary"|"secondary"|"outline"|"ghost"|"danger", size?: "sm"|"md"|"lg", disabled?: boolean) - Interactive button [children]
DataTable(data: Array<{...}> REQUIRED, columns: Array<{key,header,sortable?}> REQUIRED, pageSize?: number = 10) - Sortable data table
```

One line per component. Shows name, props with types/defaults/allowed values, description. ~2-5 tokens per component.

**2. Category Mode (~3-8K tokens)**
Full JSON for only the categories relevant to the prompt. If the user asks for "a form with inputs", only `input` + `layout` categories are sent.

**3. Full Mode (~15-20K tokens)**
Complete registry as JSON. Used only when the LLM needs full reference (rare).

**Decision:** Default is `compact` mode. It provides enough information for the LLM to generate correct props while keeping token costs low. Category mode is used when the MCP tool handler detects the prompt needs specific component details.

### What The System Prompt Tells The LLM

The system prompt has 5 sections:

```
1. ROLE: "You are an Entropix UI generator. Output ONLY valid JSON."

2. AVAILABLE COMPONENTS: [compressed registry]

3. OUTPUT FORMAT: {
     "version": "1.0",
     "root": { UINode tree },
     "meta": { "title": "...", "description": "..." }
   }

4. RULES (13 constraints):
   - ONLY use components listed above
   - Use { "$bind": "path" } for data references
   - Use { "$action": "name" } for event handlers
   - Use { "$token": "token-name" } for design tokens
   - Children go in "children" field, NOT in "props"
   - BarChart data format: [{ label: "Jan", value: 100 }]
   - DataTable columns: [{ key: "name", header: "Name" }]
   - No JavaScript functions — only serializable JSON
   - Do NOT wrap JSON in markdown code fences
   - Output RAW JSON only

5. DATA SCHEMA (optional): Available data paths for $bind
```

**Why 13 explicit rules?** LLMs hallucinate. Without explicit constraints:
- Claude generates `Box`, `Card`, `Flex` — components that don't exist in Entropix
- Claude uses Chart.js data format `{ labels: [], datasets: [] }` instead of Entropix format `[{ label, value }]`
- Claude wraps JSON in markdown fences, breaking parsing
- Claude generates JavaScript functions in JSON, which aren't serializable

Each rule exists because we observed the LLM making that specific mistake during testing.

---

## What LLMs Can and Cannot Do

### What They CAN Do

| Capability | How |
|-----------|-----|
| Generate any page layout | Compose Stack, Inline, Container, Divider |
| Create forms | Input, Textarea, Checkbox, RadioGroup, Select, DatePicker |
| Build data views | DataTable with columns, sorting, pagination |
| Create charts | BarChart, LineChart, AreaChart, PieChart with data |
| Add navigation | Tabs, Accordion, Breadcrumb, Pagination |
| Add overlays | Dialog, Popover, Tooltip, Menu |
| Add feedback | Toast triggers, Button states |
| Reference data dynamically | `{ "$bind": "user.name" }` |
| Trigger actions | `{ "$action": "submitForm", "payload": { "id": { "$bind": "item.id" } } }` |
| Reference design tokens | `{ "$token": "color-action-primary" }` |
| Conditional rendering | `{ "$if": "user.isAdmin", "then": ..., "else": ... }` |
| List rendering | `{ "$each": "products", "as": "item", "render": ... }` |

### What They CANNOT Do

| Limitation | Why | Workaround |
|-----------|-----|-----------|
| Generate CSS or styles | Specs are JSON, not code. Styling comes from components + tokens | Use design tokens via `$token` |
| Create new component types | Only registered components are valid | Compose existing ones (Stack + Inline + text = any card layout) |
| Execute JavaScript | No `eval()`, no functions in JSON | Use `$action` for event handlers, `$bind` for data |
| Access browser APIs | Specs are declarative, not imperative | Consumer handles side effects in `onAction` callback |
| Generate images/icons | No image generation capability | Use text/emoji placeholders |
| Complex state management | No useState, no reducers | Consumer manages state, passes via `data` prop |
| Animations/transitions | No CSS animations in spec | Component-level CSS handles this |
| Server-side logic | Specs describe UI only | Consumer handles API calls |

### Why These Limitations Are Correct

The spec format is intentionally **declarative and inert**. A JSON spec cannot:
- Run `fetch()` to steal API keys
- Inject `<script>` tags
- Access `localStorage`
- Modify the DOM outside the renderer

This is a security boundary. The `ComponentMap` is a whitelist — only pre-registered React components can render. No arbitrary HTML. No `dangerouslySetInnerHTML`.

---

## The JSON UI Spec Format

### Why JSON Instead of JSX/Code?

| Format | Parseable | Validatable | Renderable | Secure | LLM-friendly |
|--------|-----------|-------------|------------|--------|---------------|
| JSX string | Needs compiler | Difficult | Needs eval() | Unsafe (code execution) | Medium |
| HTML string | DOM parser | Schema validation hard | dangerouslySetInnerHTML | Unsafe (XSS) | Good |
| **JSON spec** | **JSON.parse()** | **Zod + registry** | **React.createElement** | **Safe (no execution)** | **Best** |

JSON is:
- **Parseable** — `JSON.parse()`, no compiler needed
- **Validatable** — Zod schemas check structure, registry checks components
- **Secure** — No code execution, pure data
- **LLM-native** — LLMs are trained on JSON, generate it reliably

### Spec Structure

```typescript
interface UISpec {
  version: "1.0";
  root: UINode | UINode[];              // Component tree(s)
  meta?: { title, description };        // Optional metadata
}

interface UINode {
  component: string;                     // "Button", "Stack", "DataTable"
  props?: Record<string, UINodePropValue>;
  children?: UIChild;                    // string | UINode | array | conditional | loop
  key?: string;                          // React key for reconciliation
}
```

### Dollar-Prefix Convention (`$bind`, `$action`, `$token`, `$if`, `$each`)

All dynamic values use the `$` prefix. This makes them:
1. **Instantly identifiable** — the renderer knows to resolve them
2. **Type-checkable** — `isBinding(v)` checks for `"$bind" in v`
3. **Non-conflicting** — no real prop name starts with `$`

```json
{
  "component": "Button",
  "props": {
    "variant": "primary",
    "disabled": { "$bind": "form.isSubmitting" },
    "onPress": { "$action": "submitForm", "payload": { "email": { "$bind": "form.email" } } }
  },
  "children": [{ "$if": "form.isSubmitting", "then": "Saving...", "else": "Submit" }]
}
```

**Industry comparison:**

| System | Data binding | Events | Conditionals |
|--------|-------------|--------|-------------|
| Entropix | `{ "$bind": "path" }` | `{ "$action": "name" }` | `{ "$if": "path" }` |
| Adaptive Cards (Microsoft) | `${path}` template | `Action.Submit` | `$when` expression |
| Vercel AI SDK | `{ "$state": "key" }` | Built-in handlers | Supported |
| json-render | `{ "$item": "key" }` | Actions | Supported |

Our `$`-prefix convention is closest to Vercel's approach but with explicit typing via TypeScript interfaces.

---

## How We Render LLM Output

### The EntropixRenderer

```tsx
<EntropixRenderer
  spec={generatedSpec}        // JSON from LLM
  components={webComponentMap} // Whitelist of React components
  data={{ user, products }}   // Runtime data for $bind
  onAction={(name, payload) => handleAction(name, payload)}
  fallback={ErrorFallback}    // Per-node error UI
/>
```

### Rendering Pipeline

```
UISpec
  ↓
For each UINode in spec.root:
  ↓
1. Component Lookup
   components["Button"] → <Button> React component
   If missing → render <DefaultMissing> (red dashed border with name)
  ↓
2. Prop Resolution (resolveProps)
   { variant: "primary" }         → { variant: "primary" }          (passthrough)
   { "$bind": "user.name" }       → "John Doe"                      (data lookup)
   { "$action": "save" }          → () => onAction("save", {})      (callback creation)
   { "$token": "color-primary" }  → "var(--entropix-color-primary)" (CSS variable)
  ↓
3. Children Resolution (resolveChildren)
   "Hello"                     → "Hello"              (text passthrough)
   { component: "Stack", ... } → renderNode(child)    (recursive)
   { "$if": "isAdmin", ... }   → evaluate condition   (conditional branch)
   { "$each": "items", ... }   → map + render each    (loop)
  ↓
4. Error Boundary Wrapping
   Each node wrapped in NodeErrorBoundary
   If component throws → show <ErrorFallback> instead of crashing entire tree
  ↓
5. React.createElement(Component, resolvedProps, resolvedChildren)
```

### Component Maps (Web vs Native)

```typescript
// Web map — uses @entropix/react and @entropix/data
const webComponentMap = {
  Button: EntropixButton,
  Stack: EntropixStack,
  DataTable: EntropixDataTable,
  BarChart: EntropixBarChart,
  // ... 50 components
};

// Native map — uses @entropix/react-native and @entropix/data-native
const nativeComponentMap = {
  Button: EntropixNativeButton,
  Stack: EntropixNativeStack,
  // ... 50 components
};
```

Same spec, different component maps → renders on web or mobile.

### Error Handling Strategy

| Error Type | Handling | User Sees |
|-----------|---------|-----------|
| Unknown component name | `DefaultMissing` fallback | Red dashed box: "Unknown component: Box" |
| Component throws during render | `NodeErrorBoundary` catches | Red box: "Error rendering DataTable: ..." |
| Invalid prop value | Component's own error handling | Depends on component |
| Missing data path (`$bind`) | Returns `undefined` | Component renders with undefined prop |

**Design decision:** Errors are isolated per-node. If one component in a tree of 20 fails, the other 19 still render. This is critical for AI-generated UIs where the LLM might get one component wrong.

---

## Token Optimization

### Current Token Usage

| Component | Tokens | When |
|-----------|--------|------|
| System prompt (compact mode) | ~800-1200 | Every request |
| System prompt (category mode) | ~2000-4000 | When categories specified |
| System prompt (full mode) | ~8000-15000 | Rare, full reference |
| User prompt | ~20-100 | Every request |
| LLM response | ~200-4000 | Depends on UI complexity |
| **Typical total** | **~1500-3000** | **Simple UI generation** |

### Optimization Techniques We Use

1. **Registry compression** — 3 modes reduce 75K chars to 2K-8K tokens
2. **Category filtering** — Only send relevant component categories
3. **Non-serializable prop filtering** — Skip function props that can't appear in JSON
4. **Compact prop signatures** — `gap?: "sm"|"md"|"lg" = "md"` instead of full JSON
5. **maxTokens cap** — Default 8192, prevents runaway responses

### What We Could Do Better (Production Hardening)

| Optimization | Impact | Effort | Description |
|-------------|--------|--------|-------------|
| **Prompt caching** | -50% prompt tokens on repeat calls | Low | Anthropic supports prompt caching — same system prompt across calls would be cached |
| **Streaming** | Better UX, no timeout risk | Medium | `generateUIStream()` yields partial specs progressively |
| **Constrained decoding** | 100% valid JSON guaranteed | Low | Use Anthropic's structured output mode |
| **Response size estimation** | Prevent truncation | Low | Estimate output size from prompt complexity, adjust maxTokens |
| **Registry versioning** | Cache busting | Low | Hash registry → cache compressed output |
| **Few-shot tuning** | Better accuracy | Medium | Fine-tune model on Entropix-specific examples |
| **Spec → Code export** | Developer workflow | Medium | Convert JSON spec to copy-pasteable React JSX |

---

## MCP Integration

### Why MCP?

MCP (Model Context Protocol) lets AI assistants (Claude Desktop, Claude Code, Cursor) discover and use tools natively. Without MCP, an AI assistant would need:
- Manual documentation reading
- Guessing component APIs
- No validation feedback

With MCP, the AI assistant can:
1. `entropix_list_components` → Browse what's available
2. `entropix_component_info("DataTable")` → Get exact props and examples
3. `entropix_generate_ui("pricing page")` → Generate a full UI spec
4. `entropix_render_ui(spec)` → Validate the spec before rendering

### 4 MCP Tools

| Tool | Purpose | Requires API Key |
|------|---------|-----------------|
| `entropix_list_components` | Browse components by category/platform | No |
| `entropix_component_info` | Get detailed props, examples for one component | No |
| `entropix_render_ui` | Validate a UISpec + return with data | No |
| `entropix_generate_ui` | Generate UISpec from natural language | Yes (Anthropic) |

### Running the MCP Server

```bash
# In Claude Desktop config (~/.config/claude/claude_desktop_config.json):
{
  "mcpServers": {
    "entropix": {
      "command": "node",
      "args": ["path/to/packages/ai/dist/cli.cjs", "mcp-server"],
      "env": { "ANTHROPIC_API_KEY": "sk-ant-..." }
    }
  }
}
```

The server uses stdio transport — Claude sends JSON-RPC messages via stdin, server responds via stdout.

---

## Dependencies and Why

| Dependency | Why | Alternative Considered |
|-----------|-----|----------------------|
| `@entropix/core` | Shared types (ToastType, etc.) used in registry | None — it's our own package |
| `@modelcontextprotocol/sdk` | MCP server protocol implementation | Raw JSON-RPC (too much boilerplate) |
| `zod` (peer) | Schema validation for UISpec | JSON Schema (less ergonomic in TS) |
| `react` (peer, optional) | EntropixRenderer is a React component | Required only if using renderer |

**No AI SDK dependency.** The Anthropic adapter uses raw `fetch()` — no `@anthropic-ai/sdk`. This keeps the package lightweight and avoids version conflicts.

---

## Build System

### Entry Points (tsup.config.ts)

```typescript
entry: {
  index: "src/index.ts",              // Full package
  renderer: "src/renderer/index.ts",  // Renderer only (for apps that don't generate)
  generate: "src/generate/index.ts",  // Generation only (for build scripts)
  cli: "src/mcp/cli.ts",              // MCP server binary
}
```

### Subpath Exports

```
@entropix/ai           → Full package (registry + generation + rendering + MCP)
@entropix/ai/renderer  → Just the renderer (for runtime rendering without generation)
@entropix/ai/generate  → Just the generation pipeline (for build-time scripts)
```

**Why subpath exports?** A consumer using only `<EntropixRenderer>` shouldn't download the generation pipeline. A build script generating specs doesn't need React.

### External Dependencies

These are NOT bundled — resolved from consumer's node_modules:
- `react`, `react-dom` — Consumer provides their React version
- `zod` — Consumer provides (avoids duplicate Zod instances)
- `@entropix/*` — Monorepo packages
- `@modelcontextprotocol/sdk` — Only needed for MCP server

---

## Architectural Decisions and Tradeoffs

### 1. Registry vs TypeScript Parsing

**Decision:** Hand-maintained registry
**Alternative:** Parse TypeScript source files to auto-generate registry
**Why:** Auto-parsing is fragile (generics, re-exports, conditional types). A curated registry gives us control over descriptions, examples, and what the LLM sees. The cost is manual maintenance when components change.

### 2. JSON Spec vs Code Generation

**Decision:** JSON spec rendered at runtime
**Alternative:** Generate React JSX code that developers copy-paste
**Why:** JSON is validatable, renderable without compilation, and secure (no eval). Code generation is a future enhancement, not a replacement.

### 3. Raw fetch() vs Anthropic SDK

**Decision:** Raw `fetch()` in the Anthropic adapter
**Alternative:** `@anthropic-ai/sdk`
**Why:** Avoids dependency on the SDK version. The messages API is stable — we only need `POST /v1/messages` with a body. No streaming, no tools, no complex features needed. Adding the SDK would add ~500KB to the bundle for one HTTP call.

### 4. Per-Node Error Boundaries vs Global Catch

**Decision:** Each `UINode` wrapped in `NodeErrorBoundary`
**Alternative:** Single error boundary around the entire renderer
**Why:** A single bad component (e.g., DataTable with wrong column format) shouldn't crash the entire generated page. Per-node isolation means 19 of 20 components still render even if one fails.

### 5. Compression Modes vs Single Format

**Decision:** 3 compression modes (compact/category/full)
**Alternative:** Always send full registry
**Why:** Token efficiency. A simple "contact form" doesn't need chart component metadata. Compact mode uses ~800 tokens for 50 components vs ~15K tokens for full mode. At $3/MTok for Claude, this saves ~$0.04 per request.

### 6. Truncated JSON Repair

**Decision:** Auto-repair truncated JSON by closing unclosed braces/brackets
**Alternative:** Fail and ask user to retry
**Why:** Complex UIs (landing pages, dashboards) can exceed maxTokens. Rather than showing an error, we repair the JSON and render what was generated. The LLM already produced valid structure — it just ran out of tokens mid-JSON. Closing braces recovers 80%+ of the intended UI.

### 7. MCP Low-Level Server vs McpServer Class

**Decision:** Use low-level `Server` class with `setRequestHandler`
**Alternative:** Use high-level `McpServer` class with `server.tool()`
**Why:** The `McpServer.tool()` method requires Zod schemas for parameters, but our tool definitions use JSON Schema (for compatibility with the MCP spec). The low-level `Server` class accepts JSON Schema directly via `ListToolsRequestSchema` and `CallToolRequestSchema`.

---

## File Map

```
packages/ai/
├── src/
│   ├── registry/
│   │   ├── types.ts              # ComponentRegistryEntry, PropDef, CompoundChildDef
│   │   ├── registry.ts           # defaultRegistry — 50 component definitions (~2400 lines)
│   │   ├── compress.ts           # compressRegistry() — 3 compression modes
│   │   └── index.ts
│   ├── spec/
│   │   ├── types.ts              # UISpec, UINode, UIAction, UIBinding, UITokenRef, UIConditional, UILoop
│   │   ├── validation.ts         # Zod schemas + validateSpec() + validateSpecAgainstRegistry()
│   │   └── index.ts
│   ├── renderer/
│   │   ├── entropix-renderer.tsx  # EntropixRenderer component
│   │   ├── resolve-props.ts      # $bind, $action, $token resolution
│   │   ├── resolve-children.ts   # $if, $each, string, UINode resolution
│   │   ├── error-boundary.tsx    # NodeErrorBoundary (per-node error isolation)
│   │   ├── component-maps.ts     # createWebComponentMap(), createNativeComponentMap()
│   │   ├── types.ts              # ComponentMap, ActionHandler, DataContext, EntropixRendererProps
│   │   └── index.ts
│   ├── generate/
│   │   ├── generate-ui.ts        # generateUI() — main pipeline + JSON extraction + repair
│   │   ├── system-prompt.ts      # buildSystemPrompt() — 5-section prompt builder
│   │   ├── adapters/
│   │   │   ├── types.ts          # AIAdapter interface, TokenUsage, GenerateParams
│   │   │   ├── anthropic.ts      # createAnthropicAdapter() — Claude via fetch()
│   │   │   ├── openai.ts         # createOpenAIAdapter() — GPT-4o via fetch()
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── mcp/
│   │   ├── tools.ts              # 4 MCP tool definitions with JSON Schema
│   │   ├── handlers.ts           # handleListComponents, handleComponentInfo, handleRenderUI, handleGenerateUI
│   │   ├── server.ts             # startMCPServer() — stdio transport
│   │   ├── cli.ts                # CLI entry point (npx entropix-ai mcp-server)
│   │   └── index.ts
│   └── index.ts                  # Main barrel export
├── package.json
├── tsup.config.ts
├── tsconfig.json
└── ARCHITECTURE.md               # This file
```

**Total:** ~4,600 lines of production TypeScript across 27 source files.
