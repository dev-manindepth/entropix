import type {
  UINodePropValue,
  UIAction,
  UIBinding,
  UITokenRef,
} from "../spec/types.js";
import type { ActionHandler, DataContext } from "./types.js";

/** Check if a value is a UIAction */
export function isAction(v: unknown): v is UIAction {
  return !!v && typeof v === "object" && "$action" in v;
}

/** Check if a value is a UIBinding */
export function isBinding(v: unknown): v is UIBinding {
  return !!v && typeof v === "object" && "$bind" in v;
}

/** Check if a value is a UITokenRef */
export function isTokenRef(v: unknown): v is UITokenRef {
  return !!v && typeof v === "object" && "$token" in v;
}

/**
 * Safe dot-path resolution.
 *
 * Supports:
 * - Dot notation: `"user.address.city"`
 * - Bracket notation: `"items[0].price"`
 *
 * Returns `undefined` when the path cannot be fully resolved.
 */
export function resolvePath(data: DataContext, path: string): unknown {
  // Normalise bracket notation: "items[0].price" → "items.0.price"
  const normalised = path.replace(/\[(\w+)\]/g, ".$1");
  const segments = normalised.split(".");

  let current: unknown = data;
  for (const segment of segments) {
    if (current == null || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

/**
 * Resolve a single prop value.
 *
 * - `$action`  → callback that invokes `onAction`
 * - `$bind`    → resolved value from data context
 * - `$token`   → CSS custom-property string `var(--entropix-<token>)`
 * - array      → mapped recursively
 * - object     → each key resolved recursively
 * - primitives → passed through
 */
function resolveValue(
  value: UINodePropValue,
  data: DataContext,
  onAction?: ActionHandler,
): unknown {
  if (value === null || typeof value !== "object") {
    return value;
  }

  // UIAction
  if (isAction(value)) {
    const action = value;
    return () => {
      // Resolve payload bindings at invocation time
      const resolvedPayload = action.payload
        ? resolvePayload(action.payload, data, onAction)
        : undefined;
      onAction?.(action.$action, resolvedPayload);
    };
  }

  // UIBinding
  if (isBinding(value)) {
    return resolvePath(data, value.$bind);
  }

  // UITokenRef
  if (isTokenRef(value)) {
    return `var(--entropix-${value.$token})`;
  }

  // Array
  if (Array.isArray(value)) {
    return value.map((item) => resolveValue(item, data, onAction));
  }

  // Plain object — recurse over keys
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value)) {
    result[key] = resolveValue(val as UINodePropValue, data, onAction);
  }
  return result;
}

function resolvePayload(
  payload: Record<string, unknown>,
  data: DataContext,
  onAction?: ActionHandler,
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(payload)) {
    resolved[key] = resolveValue(val as UINodePropValue, data, onAction);
  }
  return resolved;
}

/** Resolve all props for a node */
export function resolveProps(
  props: Record<string, UINodePropValue>,
  data: DataContext,
  onAction?: ActionHandler,
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    resolved[key] = resolveValue(value, data, onAction);
  }
  return resolved;
}
