import { forwardRef, useMemo, useCallback } from "react";
import { cn } from "../../utils/cn.js";
import { useLocale } from "../../i18n/i18n-context.js";
import "../../styles/pagination.css";

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** Total number of items */
  totalItems: number;
  /** Items per page */
  pageSize: number;
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Number of sibling pages shown around active page. Default: 1 */
  siblingCount?: number;
}

/**
 * Generates the page numbers array with ellipsis markers.
 * Returns (number | "ellipsis")[] where numbers are 1-indexed pages.
 */
function generatePageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): Array<number | "ellipsis"> {
  // Always show first, last, current, and siblings around current
  const range: Set<number> = new Set();

  range.add(1);
  range.add(totalPages);

  for (
    let i = Math.max(1, currentPage - siblingCount);
    i <= Math.min(totalPages, currentPage + siblingCount);
    i++
  ) {
    range.add(i);
  }

  const sorted = Array.from(range).sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];

  for (let i = 0; i < sorted.length; i++) {
    const page = sorted[i]!;
    const prev = sorted[i - 1];

    if (prev !== undefined && page - prev > 1) {
      result.push("ellipsis");
    }
    result.push(page);
  }

  return result;
}

/**
 * Pagination — page navigation component.
 *
 * Renders first, previous, page numbers (with ellipsis), next, and last buttons.
 * Active page is marked with aria-current="page".
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  function Pagination(
    {
      totalItems,
      pageSize,
      currentPage,
      onPageChange,
      siblingCount = 1,
      className,
      ...rest
    },
    ref,
  ) {
    const locale = useLocale();
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const pages = useMemo(
      () => generatePageRange(currentPage, totalPages, siblingCount),
      [currentPage, totalPages, siblingCount],
    );

    const goToPage = useCallback(
      (page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
          onPageChange(page);
        }
      },
      [totalPages, currentPage, onPageChange],
    );

    const isFirstPage = currentPage <= 1;
    const isLastPage = currentPage >= totalPages;

    let ellipsisKey = 0;

    return (
      <nav
        ref={ref}
        aria-label={locale.pagination_label}
        {...rest}
        className={cn("entropix-pagination", className)}
      >
        {/* First */}
        <button
          type="button"
          className="entropix-pagination__button entropix-pagination__button--nav"
          onClick={() => goToPage(1)}
          disabled={isFirstPage}
          aria-label={locale.pagination_firstPage}
        >
          &laquo;
        </button>

        {/* Previous */}
        <button
          type="button"
          className="entropix-pagination__button entropix-pagination__button--nav"
          onClick={() => goToPage(currentPage - 1)}
          disabled={isFirstPage}
          aria-label={locale.pagination_previousPage}
        >
          &lsaquo;
        </button>

        {/* Page numbers */}
        {pages.map((page) => {
          if (page === "ellipsis") {
            return (
              <span
                key={`ellipsis-${++ellipsisKey}`}
                className="entropix-pagination__ellipsis"
                aria-hidden="true"
              >
                &hellip;
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              className={cn(
                "entropix-pagination__button",
                isActive && "entropix-pagination__button--active",
              )}
              onClick={() => goToPage(page)}
              aria-current={isActive ? "page" : undefined}
              aria-label={locale.pagination_pageLabel(page)}
            >
              {page}
            </button>
          );
        })}

        {/* Next */}
        <button
          type="button"
          className="entropix-pagination__button entropix-pagination__button--nav"
          onClick={() => goToPage(currentPage + 1)}
          disabled={isLastPage}
          aria-label={locale.pagination_nextPage}
        >
          &rsaquo;
        </button>

        {/* Last */}
        <button
          type="button"
          className="entropix-pagination__button entropix-pagination__button--nav"
          onClick={() => goToPage(totalPages)}
          disabled={isLastPage}
          aria-label={locale.pagination_lastPage}
        >
          &raquo;
        </button>
      </nav>
    );
  },
);
