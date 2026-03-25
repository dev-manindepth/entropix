import { forwardRef } from "react";
import { cn } from "../../utils/cn.js";

export interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLElement> {
  /** If provided, renders as a link. If omitted, renders as current page text. */
  href?: string;
  children: React.ReactNode;
}

/**
 * BreadcrumbItem — individual breadcrumb entry.
 *
 * Renders as <a> when href is provided, otherwise as <span> with aria-current="page".
 */
export const BreadcrumbItem = forwardRef<HTMLElement, BreadcrumbItemProps>(
  function BreadcrumbItem({ href, children, className, ...rest }, ref) {
    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          className={cn("entropix-breadcrumb__link", className)}
        >
          {children}
        </a>
      );
    }

    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        aria-current="page"
        {...(rest as React.HTMLAttributes<HTMLSpanElement>)}
        className={cn("entropix-breadcrumb__current", className)}
      >
        {children}
      </span>
    );
  },
);
