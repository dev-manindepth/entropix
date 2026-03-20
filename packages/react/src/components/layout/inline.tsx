import { forwardRef } from "react";
import { cn } from "../../utils/cn.js";
import "../../styles/layout.css";

export type SpacingSize = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface InlineProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Gap between children. Default uses --entropix-space-layout-inline token */
  gap?: SpacingSize;
  /** Cross-axis alignment */
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  /** Main-axis justification */
  justify?: "start" | "center" | "end" | "between" | "around";
  /** Whether to wrap children */
  wrap?: boolean;
  /** Render as a different element */
  as?: React.ElementType;
}

/**
 * Inline — horizontal flex layout primitive.
 *
 * Uses the `space.layout.inline` token (12px) as default gap.
 *
 * ```tsx
 * <Inline gap="sm" justify="between" wrap>
 *   <Button variant="primary">Save</Button>
 *   <Button variant="ghost">Cancel</Button>
 * </Inline>
 * ```
 */
export const Inline = forwardRef<HTMLDivElement, InlineProps>(function Inline(
  { gap, align, justify, wrap, as: Component = "div", className, children, ...rest },
  ref,
) {
  return (
    <Component
      ref={ref}
      className={cn(
        "entropix-inline",
        gap && `entropix-inline--gap-${gap}`,
        align && `entropix-inline--align-${align}`,
        justify && `entropix-inline--justify-${justify}`,
        wrap && "entropix-inline--wrap",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
});
