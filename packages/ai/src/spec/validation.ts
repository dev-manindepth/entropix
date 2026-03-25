import { z } from "zod";
import type { UISpec } from "./types.js";
import type { ComponentRegistry } from "../registry/types.js";

// ── Zod Schemas ──────────────────────────────────────────────────────────

export const UIActionSchema = z.object({
  $action: z.string(),
  payload: z.record(z.unknown()).optional(),
});

export const UIBindingSchema = z.object({
  $bind: z.string(),
});

export const UITokenRefSchema = z.object({
  $token: z.string(),
});

export const UINodePropValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    UIActionSchema,
    UIBindingSchema,
    UITokenRefSchema,
    z.array(UINodePropValueSchema),
    z.record(UINodePropValueSchema),
  ]),
);

export const UINodeSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    component: z.string(),
    props: z.record(UINodePropValueSchema).optional(),
    children: UIChildSchema.optional(),
    key: z.string().optional(),
  }),
);

export const UIConditionalSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    $if: z.string(),
    then: UIChildSchema,
    else: UIChildSchema.optional(),
  }),
);

export const UILoopSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    $each: z.string(),
    as: z.string(),
    render: UINodeSchema,
    key: z.string().optional(),
  }),
);

export const UIChildSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    UINodeSchema,
    z.array(
      z.union([z.string(), UINodeSchema, UIConditionalSchema, UILoopSchema]),
    ),
  ]),
);

export const UISpecSchema = z.object({
  version: z.literal("1.0"),
  root: z.union([UINodeSchema, z.array(UINodeSchema)]),
  meta: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      generatedBy: z.string().optional(),
      generatedAt: z.string().optional(),
    })
    .optional(),
});

// ── Validation Types ─────────────────────────────────────────────────────

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ── Validation Functions ─────────────────────────────────────────────────

/**
 * Parse and validate a raw input as a UISpec.
 * Throws a `ZodError` when the input is structurally invalid.
 */
export function validateSpec(input: unknown): UISpec {
  return UISpecSchema.parse(input) as UISpec;
}

/**
 * Validate a (structurally valid) UISpec against a ComponentRegistry.
 *
 * Checks performed:
 * 1. Every `component` name exists in the registry.
 * 2. Required props are present.
 * 3. Prop values satisfy `allowedValues` constraints (when defined).
 * 4. Compound-children nesting rules (e.g., Tab must be inside TabList).
 */
export function validateSpecAgainstRegistry(
  spec: UISpec,
  registry: ComponentRegistry,
): ValidationResult {
  const errors: ValidationError[] = [];
  const roots = Array.isArray(spec.root) ? spec.root : [spec.root];

  for (let i = 0; i < roots.length; i++) {
    const pathPrefix = Array.isArray(spec.root)
      ? `root[${String(i)}]`
      : "root";
    validateNode(roots[i], pathPrefix, null, registry, errors);
  }

  return { valid: errors.length === 0, errors };
}

// ── Internal helpers ─────────────────────────────────────────────────────

function isUINode(v: unknown): v is { component: string; [k: string]: unknown } {
  return !!v && typeof v === "object" && "component" in v;
}

function validateNode(
  node: unknown,
  path: string,
  parentComponentName: string | null,
  registry: ComponentRegistry,
  errors: ValidationError[],
): void {
  if (!isUINode(node)) return;

  const entry = registry.components[node.component as string];

  // 1. Component must exist
  if (!entry) {
    errors.push({
      path,
      message: `Unknown component "${String(node.component)}"`,
    });
    // Can't validate further without the registry entry
    return;
  }

  // 4. Compound-children nesting check
  if (entry.parentComponent && entry.parentComponent !== parentComponentName) {
    errors.push({
      path,
      message: `"${entry.name}" must be a child of "${entry.parentComponent}", but found inside "${parentComponentName ?? "(root)}"}"`,
    });
  }

  const props = (node.props ?? {}) as Record<string, unknown>;

  // 2. Required props
  for (const propDef of entry.props) {
    // Skip "children" — it lives at node.children, not node.props.children
    if (propDef.name === "children" || propDef.isChildren) continue;
    if (propDef.required && !(propDef.name in props)) {
      errors.push({
        path: `${path}.props`,
        message: `Missing required prop "${propDef.name}" for component "${entry.name}"`,
      });
    }
  }

  // 3. Allowed values
  for (const propDef of entry.props) {
    if (
      propDef.allowedValues &&
      propDef.name in props
    ) {
      const value = props[propDef.name];
      // Only check primitives directly; bindings / actions are resolved at runtime
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        const allowed = propDef.allowedValues as readonly (string | number | boolean)[];
        if (!allowed.includes(value)) {
          errors.push({
            path: `${path}.props.${propDef.name}`,
            message: `Value "${String(value)}" is not allowed for prop "${propDef.name}". Allowed: ${allowed.map(String).join(", ")}`,
          });
        }
      }
    }
  }

  // Recurse into children
  const children = node.children as unknown;
  if (children != null) {
    validateChildren(children, `${path}.children`, entry.name, registry, errors);
  }
}

function validateChildren(
  children: unknown,
  path: string,
  parentComponentName: string,
  registry: ComponentRegistry,
  errors: ValidationError[],
): void {
  if (typeof children === "string") return;

  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (typeof child === "string") continue;

      if (isConditionalLike(child)) {
        validateConditional(child, `${path}[${String(i)}]`, parentComponentName, registry, errors);
      } else if (isLoopLike(child)) {
        validateLoop(child, `${path}[${String(i)}]`, parentComponentName, registry, errors);
      } else {
        validateNode(child, `${path}[${String(i)}]`, parentComponentName, registry, errors);
      }
    }
    return;
  }

  if (isUINode(children)) {
    validateNode(children, path, parentComponentName, registry, errors);
  }
}

function isConditionalLike(v: unknown): v is { $if: string; then: unknown; else?: unknown } {
  return !!v && typeof v === "object" && "$if" in v;
}

function isLoopLike(v: unknown): v is { $each: string; as: string; render: unknown } {
  return !!v && typeof v === "object" && "$each" in v;
}

function validateConditional(
  cond: { $if: string; then: unknown; else?: unknown },
  path: string,
  parentComponentName: string,
  registry: ComponentRegistry,
  errors: ValidationError[],
): void {
  validateChildren(cond.then, `${path}.then`, parentComponentName, registry, errors);
  if (cond.else != null) {
    validateChildren(cond.else, `${path}.else`, parentComponentName, registry, errors);
  }
}

function validateLoop(
  loop: { $each: string; as: string; render: unknown },
  path: string,
  parentComponentName: string,
  registry: ComponentRegistry,
  errors: ValidationError[],
): void {
  validateNode(loop.render, `${path}.render`, parentComponentName, registry, errors);
}
