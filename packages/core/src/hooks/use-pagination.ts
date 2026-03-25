import { useMemo, useCallback } from "react";

export type PaginationPage = number | "ellipsis";

export interface UsePaginationOptions {
  /** Total number of items across all pages */
  totalItems: number;
  /** Number of items per page. Default: 10 */
  pageSize?: number;
  /** Current page number (1-based) */
  currentPage: number;
  /** Called when the page changes */
  onPageChange: (page: number) => void;
  /** Number of sibling pages shown around the current page. Default: 1 */
  siblingCount?: number;
}

export interface UsePaginationReturn {
  /** Current page number (1-based) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Page items for rendering: page numbers and "ellipsis" placeholders */
  pages: PaginationPage[];
  /** Navigate to a specific page (clamped to valid range) */
  goToPage: (page: number) => void;
  /** Navigate to the next page */
  nextPage: () => void;
  /** Navigate to the previous page */
  prevPage: () => void;
  /** Whether there is a previous page */
  canGoPrev: boolean;
  /** Whether there is a next page */
  canGoNext: boolean;
}

/**
 * Builds the pagination pages array with ellipsis placeholders.
 *
 * Always shows first page, last page, and current ± siblingCount.
 * Inserts "ellipsis" between gaps.
 *
 * Example: currentPage=5, siblingCount=1, totalPages=20
 * → [1, "ellipsis", 4, 5, 6, "ellipsis", 20]
 */
function buildPages(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): PaginationPage[] {
  if (totalPages <= 0) return [];
  if (totalPages === 1) return [1];

  const rangeStart = Math.max(2, currentPage - siblingCount);
  const rangeEnd = Math.min(totalPages - 1, currentPage + siblingCount);

  const pages: PaginationPage[] = [];

  // Always include first page
  pages.push(1);

  // Left ellipsis
  if (rangeStart > 2) {
    pages.push("ellipsis");
  } else if (rangeStart === 2) {
    // No gap, just include page 2
  }

  // Sibling range (from rangeStart to rangeEnd)
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  // Right ellipsis
  if (rangeEnd < totalPages - 1) {
    pages.push("ellipsis");
  }

  // Always include last page (if more than 1 page)
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

/**
 * Headless pagination hook.
 *
 * Computes total pages, generates a pages array with ellipsis placeholders,
 * and provides navigation callbacks with boundary clamping.
 */
export function usePagination(
  options: UsePaginationOptions,
): UsePaginationReturn {
  const {
    totalItems,
    pageSize = 10,
    currentPage,
    onPageChange,
    siblingCount = 1,
  } = options;

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / pageSize)),
    [totalItems, pageSize],
  );

  const pages = useMemo(
    () => buildPages(currentPage, totalPages, siblingCount),
    [currentPage, totalPages, siblingCount],
  );

  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(page, totalPages));
      if (clamped !== currentPage) {
        onPageChange(clamped);
      }
    },
    [totalPages, currentPage, onPageChange],
  );

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return {
    currentPage,
    totalPages,
    pages,
    goToPage,
    nextPage,
    prevPage,
    canGoPrev,
    canGoNext,
  };
}
