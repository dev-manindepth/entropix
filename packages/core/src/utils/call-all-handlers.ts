/**
 * Creates a function that calls all provided handler functions in sequence.
 * Undefined handlers are safely skipped.
 *
 * Useful for composing event handlers without losing any —
 * e.g., combining a user's onClick with an internal onClick.
 */
export function callAllHandlers<T extends unknown[]>(
  ...handlers: Array<((...args: T) => void) | undefined>
): (...args: T) => void {
  return (...args: T) => {
    for (const handler of handlers) {
      handler?.(...args);
    }
  };
}
