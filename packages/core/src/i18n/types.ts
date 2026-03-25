/**
 * Entropix i18n — Translation key types.
 *
 * Flat keys with underscore namespacing for type-safe autocomplete.
 * Function keys for interpolated strings.
 */
export interface EntropixLocale {
  /** BCP 47 locale tag, e.g. "en-US", "ja-JP" */
  locale: string;

  /** Text direction: "ltr" (left-to-right) or "rtl" (right-to-left) */
  direction: "ltr" | "rtl";

  // ─── Calendar ───────────────────────────────────────────
  /** Full month names, array of 12 (January..December) */
  calendar_monthNames: string[];
  /** Abbreviated day names, array of 7, starting Sunday */
  calendar_dayNames: string[];
  /** aria-label for the calendar grid */
  calendar_label: string;
  /** aria-label for previous month navigation */
  calendar_previousMonth: string;
  /** aria-label for next month navigation */
  calendar_nextMonth: string;
  /** aria-label for a specific day cell */
  calendar_dayLabel: (date: Date) => string;

  // ─── DatePicker ─────────────────────────────────────────
  /** aria-label for the date picker input */
  datePicker_label: string;
  /** Placeholder text for the date input */
  datePicker_placeholder: string;

  // ─── Pagination ─────────────────────────────────────────
  /** aria-label for the pagination nav */
  pagination_label: string;
  /** aria-label for first page button */
  pagination_firstPage: string;
  /** aria-label for previous page button */
  pagination_previousPage: string;
  /** aria-label for next page button */
  pagination_nextPage: string;
  /** aria-label for last page button */
  pagination_lastPage: string;
  /** aria-label for a specific page button */
  pagination_pageLabel: (page: number) => string;

  // ─── Toast ──────────────────────────────────────────────
  /** aria-label for the toast notification region */
  toast_regionLabel: string;
  /** aria-label for the dismiss/close button */
  toast_dismiss: string;

  // ─── Breadcrumb ─────────────────────────────────────────
  /** aria-label for the breadcrumb nav */
  breadcrumb_label: string;

  // ─── Select ─────────────────────────────────────────────
  /** Default placeholder text for select trigger */
  select_placeholder: string;
}
