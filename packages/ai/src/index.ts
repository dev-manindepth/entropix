// Registry
export { defaultRegistry, compressRegistry } from "./registry/index.js";
export type {
  ComponentRegistry,
  ComponentRegistryEntry,
  PropDef,
  CompoundChildDef,
  ComponentCategory,
  Platform,
} from "./registry/index.js";

// Spec
export type {
  UISpec,
  UINode,
  UIChild,
  UIAction,
  UIBinding,
  UITokenRef,
  UIConditional,
  UILoop,
  UINodePropValue,
} from "./spec/index.js";
export {
  UISpecSchema,
  UINodeSchema,
  validateSpec,
  validateSpecAgainstRegistry,
} from "./spec/index.js";
export type { ValidationResult, ValidationError } from "./spec/index.js";

// Renderer
export { EntropixRenderer } from "./renderer/index.js";
export {
  createWebComponentMap,
  createNativeComponentMap,
} from "./renderer/index.js";
export type {
  EntropixRendererProps,
  ComponentMap,
  ActionHandler,
  DataContext,
} from "./renderer/index.js";

// Generate
export { generateUI } from "./generate/index.js";
export { refineUI } from "./generate/index.js";
export { buildSystemPrompt } from "./generate/index.js";
export { createAnthropicAdapter } from "./generate/index.js";
export { createOpenAIAdapter } from "./generate/index.js";
export type {
  GenerateUIOptions,
  GenerateUIResult,
} from "./generate/index.js";
export type { RefineUIOptions } from "./generate/index.js";
export type {
  AIAdapter,
  GenerateParams,
  GenerateResult,
  TokenUsage,
} from "./generate/index.js";

// Export
export { specToCode } from "./export/index.js";
export type {
  CodeExportOptions,
  CodeExportResult,
} from "./export/index.js";

// MCP
export { ENTROPIX_MCP_TOOLS, startMCPServer } from "./mcp/index.js";
export {
  handleListComponents,
  handleComponentInfo,
  handleRenderUI,
  handleGenerateUI,
} from "./mcp/index.js";
