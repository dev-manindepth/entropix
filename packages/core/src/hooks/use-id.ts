import { useId as reactUseId } from "react";

/**
 * Generates a stable unique ID, optionally with a prefix.
 * Wraps React's built-in useId for consistent cross-platform ID generation.
 */
export function useId(prefix?: string): string {
  const id = reactUseId();
  return prefix ? `${prefix}-${id}` : id;
}

/**
 * Generates a set of related IDs from a single base.
 *
 * Useful for components that need multiple linked IDs for ARIA relationships.
 * For example, a dialog needs title-id, description-id, and content-id
 * all derived from the same base for aria-labelledby/describedby linking.
 */
export function useIds(
  prefix: string,
  ...suffixes: string[]
): Record<string, string> {
  const baseId = useId(prefix);
  const ids: Record<string, string> = { base: baseId };
  for (const suffix of suffixes) {
    ids[suffix] = `${baseId}-${suffix}`;
  }
  return ids;
}
