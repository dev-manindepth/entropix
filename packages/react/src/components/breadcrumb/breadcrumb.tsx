import React, { forwardRef } from "react";
import { cn } from "../../utils/cn.js";
import { useLocale } from "../../i18n/i18n-context.js";
import "../../styles/breadcrumb.css";

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /** Separator character between items. Default: "/" */
  separator?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Breadcrumb — navigation wrapper that inserts separators between items.
 *
 * Renders a <nav> with aria-label="Breadcrumb" and an ordered list.
 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  function Breadcrumb({ separator = "/", children, className, ...rest }, ref) {
    const locale = useLocale();
    const items = React.Children.toArray(children).filter(React.isValidElement);

    return (
      <nav
        ref={ref}
        aria-label={locale.breadcrumb_label}
        {...rest}
        className={cn("entropix-breadcrumb", className)}
      >
        <ol className="entropix-breadcrumb__list">
          {items.map((child, index) => (
            <li key={index} className="entropix-breadcrumb__item">
              {child}
              {index < items.length - 1 && (
                <span className="entropix-breadcrumb__separator" aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  },
);
