export type {
  UIAction,
  UIBinding,
  UITokenRef,
  UIConditional,
  UILoop,
  UINodePropValue,
  UIChild,
  UINode,
  UISpec,
} from "./types.js";

export {
  UIActionSchema,
  UIBindingSchema,
  UITokenRefSchema,
  UINodePropValueSchema,
  UINodeSchema,
  UIConditionalSchema,
  UILoopSchema,
  UIChildSchema,
  UISpecSchema,
  validateSpec,
  validateSpecAgainstRegistry,
} from "./validation.js";

export type { ValidationError, ValidationResult } from "./validation.js";
