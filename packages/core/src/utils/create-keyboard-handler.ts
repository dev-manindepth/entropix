import type {
  InteractionKeyMap,
  KeyIntent,
  KeyboardHandlerConfig,
} from "../types/interactions.js";

/**
 * Creates a keyboard handler configuration from a key-to-intent map.
 *
 * Returns a config object that platform layers use to wire up
 * actual keyboard event handlers (onKeyDown for web, onKeyPress for native).
 *
 * This function is pure — no DOM, no event listeners. It provides
 * the intent resolution logic that platform layers call from their handlers.
 */
export function createKeyboardHandler(
  keyMap: InteractionKeyMap,
): KeyboardHandlerConfig {
  return {
    keyMap,
    getIntent(
      key: string,
      _modifiers?: { shift?: boolean; meta?: boolean; alt?: boolean },
    ): KeyIntent | undefined {
      return keyMap[key];
    },
  };
}
