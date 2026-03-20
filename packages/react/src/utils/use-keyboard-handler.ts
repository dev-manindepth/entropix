import { useCallback } from "react";
import type { KeyboardHandlerConfig, KeyIntent } from "@entropix/core";

/**
 * Converts a core KeyboardHandlerConfig + intent-to-callback map
 * into a React onKeyDown handler.
 *
 * Returns undefined when no keyboardConfig is provided (e.g., disabled state).
 */
export function useKeyboardHandler(
  keyboardConfig: KeyboardHandlerConfig | undefined,
  actionMap: Partial<Record<KeyIntent, () => void>>,
): React.KeyboardEventHandler<HTMLElement> | undefined {
  const handler = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (!keyboardConfig) return;

      const intent = keyboardConfig.getIntent(event.key, {
        shift: event.shiftKey,
        meta: event.metaKey,
        alt: event.altKey,
      });

      if (intent && actionMap[intent]) {
        event.preventDefault();
        actionMap[intent]!();
      }
    },
    [keyboardConfig, actionMap],
  );

  if (!keyboardConfig) return undefined;
  return handler;
}
