/**
 * Named action intents that keyboard/gesture interactions can trigger.
 * Platform layers translate these into actual event handlers.
 */
export type KeyIntent =
  | "activate" // button press, link follow
  | "toggle" // checkbox/switch toggle
  | "dismiss" // close dialog, cancel
  | "confirm" // submit, confirm
  | "moveUp"
  | "moveDown"
  | "moveLeft"
  | "moveRight"
  | "moveStart"
  | "moveEnd"
  | "selectAll"
  | "selectRow"
  | "selectAllRows"
  | "focusNext"
  | "focusPrevious";

/**
 * Maps keyboard key identifiers to action intents.
 * Uses the KeyboardEvent.key values (platform-neutral string identifiers).
 */
export type InteractionKeyMap = Partial<Record<string, KeyIntent>>;

/**
 * A platform-neutral press/activation event.
 * Platform layers construct this from onClick/onPress/onKeyDown.
 */
export interface PressEvent {
  /** The intent that was triggered */
  intent: KeyIntent;
  /** Whether the meta/ctrl key was held */
  metaKey?: boolean;
  /** Whether the shift key was held */
  shiftKey?: boolean;
  /** Prevent default platform behavior */
  preventDefault: () => void;
}

/**
 * Configuration returned by createKeyboardHandler.
 * Platform layers use this to wire up actual keyboard event handlers.
 */
export interface KeyboardHandlerConfig {
  /** The key map for reference */
  keyMap: InteractionKeyMap;
  /**
   * Given a key string and modifier state, returns the intent (if any).
   * Platform layer calls this inside its onKeyDown handler.
   */
  getIntent: (
    key: string,
    modifiers?: { shift?: boolean; meta?: boolean; alt?: boolean },
  ) => KeyIntent | undefined;
}
