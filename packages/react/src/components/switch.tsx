import { forwardRef } from "react";
import { ToggleInner } from "./toggle.js";
import type { ToggleProps } from "./toggle.js";
import "../styles/switch.css";

export type SwitchProps = ToggleProps;

/**
 * Switch component — Toggle with role="switch" semantics.
 *
 * API-identical to Toggle, but renders with `role="switch"`
 * instead of `role="checkbox"`.
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  function Switch(props, ref) {
    return <ToggleInner {...props} ref={ref} role="switch" componentClass="entropix-switch" />;
  },
);
