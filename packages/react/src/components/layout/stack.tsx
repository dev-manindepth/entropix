import { forwardRef } from "react";
import { cn } from "../../utils/cn.js";
import "../../styles/layout.css";

export type SpacingSize = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Gap between children. Default uses --entropix-space-layout-stack token */
  gap?: SpacingSize;
  /** Cross-axis alignment */
  align?: "start" | "center" | "end" | "stretch";
  /** Whether to take full width */
  fullWidth?: boolean;
  /** Render as a different element */
  as?: React.ElementType;
}

/**
 * Stack — vertical flex layout primitive.
 *
 * Uses the `space.layout.stack` token (16px) as default gap.
 *
 * ```tsx
 * <Stack gap="lg" align="center">
 *   <Button>First</Button>
 *   <Button>Second</Button>
 * </Stack>
 * ```
 */
export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  { gap, align, fullWidth, as: Component = "div", className, children, ...rest },
  ref,
) {
  return (
    <Component
      ref={ref}
      className={cn(
        "entropix-stack",
        gap && `entropix-stack--gap-${gap}`,
        align && `entropix-stack--align-${align}`,
        fullWidth && "entropix-stack--full-width",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
});
