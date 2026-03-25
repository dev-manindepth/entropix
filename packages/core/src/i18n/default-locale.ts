import type { EntropixLocale } from "./types.js";

/**
 * Default English (en-US) locale for Entropix components.
 *
 * Used as the fallback when no locale is provided to a Provider.
 * Consumers can override any key by passing a Partial<EntropixLocale>.
 */
export const defaultLocale: EntropixLocale = {
  locale: "en-US",
  direction: "ltr",

  // ─── Calendar ───────────────────────────────────────────
  calendar_monthNames: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  calendar_dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  calendar_label: "Calendar",
  calendar_previousMonth: "Previous month",
  calendar_nextMonth: "Next month",
  calendar_dayLabel: (date: Date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),

  // ─── DatePicker ─────────────────────────────────────────
  datePicker_label: "Date picker",
  datePicker_placeholder: "MM/DD/YYYY",

  // ─── Pagination ─────────────────────────────────────────
  pagination_label: "Pagination",
  pagination_firstPage: "First page",
  pagination_previousPage: "Previous page",
  pagination_nextPage: "Next page",
  pagination_lastPage: "Last page",
  pagination_pageLabel: (page: number) => `Page ${page}`,

  // ─── Toast ──────────────────────────────────────────────
  toast_regionLabel: "Notifications",
  toast_dismiss: "Dismiss notification",

  // ─── Breadcrumb ─────────────────────────────────────────
  breadcrumb_label: "Breadcrumb",

  // ─── Select ─────────────────────────────────────────────
  select_placeholder: "Select...",
};
