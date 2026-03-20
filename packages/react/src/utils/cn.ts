/**
 * Constructs a className string from a list of class values.
 * Filters out falsy values (undefined, null, false, "").
 */
export function cn(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}
