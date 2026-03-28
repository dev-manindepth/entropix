export { generateUI, extractJSON, repairTruncatedJSON } from "./generate-ui.js";
export type { GenerateUIOptions, GenerateUIResult } from "./generate-ui.js";

export { refineUI } from "./refine-ui.js";
export type { RefineUIOptions } from "./refine-ui.js";

export { buildSystemPrompt } from "./system-prompt.js";
export type { SystemPromptOptions } from "./system-prompt.js";

export {
  createAnthropicAdapter,
  createOpenAIAdapter,
} from "./adapters/index.js";

export type {
  AIAdapter,
  GenerateParams,
  GenerateResult,
  TokenUsage,
  AnthropicAdapterOptions,
  OpenAIAdapterOptions,
} from "./adapters/index.js";

// Re-export code export utility (server-safe, no React dependency)
export { specToCode } from "../export/spec-to-code.js";
export type { CodeExportOptions, CodeExportResult } from "../export/spec-to-code.js";
