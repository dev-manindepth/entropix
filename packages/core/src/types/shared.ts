/** A value that can be either the type or a function returning it */
export type MaybeFunction<T> = T | (() => T);

/** Generic callback — used for onPress, onChange, etc. */
export type CallbackFn<T = void> = (value: T) => void;

/** Controlled/uncontrolled state config */
export interface ControllableStateOptions<T> {
  /** The controlled value (if defined, component is controlled) */
  value?: T;
  /** Default value for uncontrolled mode */
  defaultValue: T;
  /** Callback when value changes */
  onChange?: CallbackFn<T>;
}
