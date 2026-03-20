import { forwardRef } from "react";
import { cn } from "../../utils/cn.js";
import "../../styles/layout.css";

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  /** Orientation of the divider */
  orientation?: "horizontal" | "vertical";
  /** Spacing above and below (or left and right for vertical) */
  spacing?: "sm" | "md" | "lg";
}

/**
 * Divider — visual separator line.
 *
 * Uses the `color.border.default` token for line color.
 *
 * ```tsx
 * <Stack>
 *   <p>Section A</p>
 *   <Divider spacing="md" />
 *   <p>Section B</p>
 * </Stack>
 *
 * <Inline>
 *   <span>Left</span>
 *   <Divider orientation="vertical" spacing="sm" />
 *   <span>Right</span>
 * </Inline>
 * ```
 */
export const Divider = forwardRef<HTMLHRElement, DividerProps>(function Divider(
  { orientation = "horizontal", spacing, className, ...rest },
  ref,
) {
  return (
    <hr
      ref={ref}
      role={orientation === "vertical" ? "separator" : undefined}
      aria-orientation={orientation === "vertical" ? "vertical" : undefined}
      className={cn(
        "entropix-divider",
        orientation === "vertical" && "entropix-divider--vertical",
        spacing && `entropix-divider--spacing-${spacing}`,
        className,
      )}
      {...rest}
    />
  );
});
