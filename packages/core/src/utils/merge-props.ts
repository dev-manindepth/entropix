/**
 * Merges multiple prop objects, composing function values and
 * deep-merging accessibility objects.
 *
 * When two sources both have a function for the same key,
 * they are chained together (both called in order) rather than overwritten.
 * When both have an `accessibility` key, the objects are shallow-merged.
 * All other keys: last value wins.
 */
export function mergeProps<T extends Record<string, unknown>>(
  ...sources: Array<T | undefined>
): T {
  const result: Record<string, unknown> = {};

  for (const source of sources) {
    if (!source) continue;

    for (const [key, value] of Object.entries(source)) {
      const existing = result[key];

      if (typeof existing === "function" && typeof value === "function") {
        // Compose function handlers — both get called
        result[key] = (...args: unknown[]) => {
          (existing as (...a: unknown[]) => void)(...args);
          (value as (...a: unknown[]) => void)(...args);
        };
      } else if (
        key === "accessibility" &&
        typeof existing === "object" &&
        existing !== null &&
        typeof value === "object" &&
        value !== null
      ) {
        // Deep merge accessibility objects
        result[key] = { ...existing, ...value };
      } else {
        result[key] = value;
      }
    }
  }

  return result as T;
}
