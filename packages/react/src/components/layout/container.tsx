import { forwardRef } from "react";
import { cn } from "../../utils/cn.js";
import "../../styles/layout.css";

export type ContainerSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum width constraint. Default: "lg" (1024px) */
  maxWidth?: ContainerSize;
  /** Whether to center children vertically */
  center?: boolean;
  /** Render as a different element */
  as?: React.ElementType;
}

/**
 * Container — page-level width constraint with horizontal margins.
 *
 * Uses the `space.layout.page-margin` token (24px) for horizontal padding.
 * Centers itself horizontally via auto margins.
 *
 * ```tsx
 * <Container maxWidth="lg">
 *   <Stack gap="xl">
 *     <h1>Page Title</h1>
 *     <p>Content</p>
 *   </Stack>
 * </Container>
 * ```
 */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { maxWidth = "lg", center, as: Component = "div", className, children, ...rest },
  ref,
) {
  return (
    <Component
      ref={ref}
      className={cn(
        "entropix-container",
        `entropix-container--${maxWidth}`,
        center && "entropix-container--center",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
});
