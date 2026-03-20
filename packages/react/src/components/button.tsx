import { forwardRef, useCallback, useMemo } from "react";
import { useButton } from "@entropix/core";
import { mapAccessibilityToAria } from "../utils/map-accessibility-to-aria.js";
import { useKeyboardHandler } from "../utils/use-keyboard-handler.js";
import { cn } from "../utils/cn.js";
import "../styles/button.css";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLElement>, "disabled"> {
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Called when the button is activated */
  onPress?: () => void;
  /** Render as a different element type */
  as?: React.ElementType;
  /** Visual variant for CSS targeting via data-variant */
  variant?: string;
  /** Size for CSS targeting via data-size */
  size?: string;
}

/**
 * Button component — web adapter for @entropix/core's useButton.
 *
 * Renders a `<button>` by default. Use the `as` prop for other elements.
 * Provides data-state, data-variant, data-size attributes for CSS targeting.
 */
export const Button = forwardRef<HTMLElement, ButtonProps>(function Button(
  {
    disabled,
    loading,
    onPress,
    as: Component = "button",
    variant,
    size,
    className,
    style,
    children,
    onClick,
    onKeyDown: externalOnKeyDown,
    ...rest
  },
  ref,
) {
  const elementType =
    typeof Component === "string" ? Component : "div";

  const { isDisabled, isLoading, getButtonProps } = useButton({
    disabled,
    loading,
    onPress,
    elementType,
  });

  const propGetterReturn = getButtonProps();
  const ariaProps = mapAccessibilityToAria(propGetterReturn.accessibility);

  const actionMap = useMemo(
    () => ({
      activate: propGetterReturn.onAction ?? (() => {}),
    }),
    [propGetterReturn.onAction],
  );

  const onKeyDown = useKeyboardHandler(
    propGetterReturn.keyboardConfig,
    actionMap,
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      propGetterReturn.onAction?.();
      onClick?.(event);
    },
    [propGetterReturn.onAction, onClick],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(event);
      externalOnKeyDown?.(event);
    },
    [onKeyDown, externalOnKeyDown],
  );

  const dataState = isLoading ? "loading" : isDisabled ? "disabled" : undefined;

  return (
    <Component
      ref={ref}
      className={cn(
        "entropix-button",
        variant && `entropix-button--${variant}`,
        size && `entropix-button--${size}`,
        className,
      )}
      style={style}
      {...ariaProps}
      {...rest}
      type={Component === "button" ? "button" : undefined}
      disabled={Component === "button" && isDisabled ? true : undefined}
      onClick={propGetterReturn.onAction || onClick ? handleClick : undefined}
      onKeyDown={onKeyDown || externalOnKeyDown ? handleKeyDown : undefined}
      data-state={dataState}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </Component>
  );
});
