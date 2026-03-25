/**
 * Pure date math utilities — no React, no external deps.
 *
 * Provides calendar grid generation, date formatting/parsing,
 * and comparison helpers for date picker components.
 */

export interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isDisabled: boolean;
}

export const MONTH_NAMES: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const DAY_NAMES: string[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

/**
 * Returns the number of days in a given month (0-indexed).
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Generates a 6×7 calendar grid for a given month.
 * Each row is Sun–Sat. Includes padding days from previous/next months.
 * Days outside minDate/maxDate are marked as disabled.
 */
export function getCalendarGrid(
  year: number,
  month: number,
  minDate?: Date,
  maxDate?: Date,
): CalendarDay[][] {
  const today = new Date();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun

  const daysInPrevMonth = getDaysInMonth(
    month === 0 ? year - 1 : year,
    month === 0 ? 11 : month - 1,
  );

  const grid: CalendarDay[][] = [];
  let dayCounter = 1;
  let nextMonthDay = 1;

  for (let row = 0; row < 6; row++) {
    const week: CalendarDay[] = [];

    for (let col = 0; col < 7; col++) {
      const cellIndex = row * 7 + col;

      if (cellIndex < firstDayOfWeek) {
        // Previous month padding
        const prevDay = daysInPrevMonth - firstDayOfWeek + cellIndex + 1;
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const date = new Date(prevYear, prevMonth, prevDay);

        week.push({
          date,
          day: prevDay,
          isCurrentMonth: false,
          isToday: isSameDay(date, today),
          isDisabled: isDateDisabled(date, minDate, maxDate),
        });
      } else if (dayCounter <= daysInMonth) {
        // Current month
        const date = new Date(year, month, dayCounter);

        week.push({
          date,
          day: dayCounter,
          isCurrentMonth: true,
          isToday: isSameDay(date, today),
          isDisabled: isDateDisabled(date, minDate, maxDate),
        });
        dayCounter++;
      } else {
        // Next month padding
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        const date = new Date(nextYear, nextMonth, nextMonthDay);

        week.push({
          date,
          day: nextMonthDay,
          isCurrentMonth: false,
          isToday: isSameDay(date, today),
          isDisabled: isDateDisabled(date, minDate, maxDate),
        });
        nextMonthDay++;
      }
    }

    grid.push(week);
  }

  return grid;
}

/**
 * Checks if a date falls outside the min/max range.
 */
function isDateDisabled(
  date: Date,
  minDate?: Date,
  maxDate?: Date,
): boolean {
  if (minDate && isBefore(date, minDate) && !isSameDay(date, minDate)) {
    return true;
  }
  if (maxDate && isAfter(date, maxDate) && !isSameDay(date, maxDate)) {
    return true;
  }
  return false;
}

/**
 * Formats a Date to a string.
 * Supports "YYYY-MM-DD" (default), "DD/MM/YYYY", "MM/DD/YYYY".
 */
export function formatDate(date: Date, format: string = "YYYY-MM-DD"): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  switch (format) {
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "YYYY-MM-DD":
    default:
      return `${year}-${month}-${day}`;
  }
}

/**
 * Parses a date string in common formats.
 * Supports "YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY".
 * Returns null if the string cannot be parsed into a valid date.
 */
export function parseDate(str: string): Date | null {
  if (!str || typeof str !== "string") return null;

  const trimmed = str.trim();

  // Try YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const date = new Date(
      Number(isoMatch[1]),
      Number(isoMatch[2]) - 1,
      Number(isoMatch[3]),
    );
    if (isValidDate(date)) return date;
  }

  // Try DD/MM/YYYY
  const slashMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slashMatch) {
    // Ambiguous — try DD/MM/YYYY first
    const date = new Date(
      Number(slashMatch[3]),
      Number(slashMatch[2]) - 1,
      Number(slashMatch[1]),
    );
    if (isValidDate(date)) return date;
  }

  return null;
}

function isValidDate(date: Date): boolean {
  return !isNaN(date.getTime());
}

/**
 * Returns true if two dates represent the same calendar day.
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Returns true if date `a` is before date `b` (day-level comparison).
 */
export function isBefore(a: Date, b: Date): boolean {
  const dateA = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const dateB = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return dateA.getTime() < dateB.getTime();
}

/**
 * Returns true if date `a` is after date `b` (day-level comparison).
 */
export function isAfter(a: Date, b: Date): boolean {
  const dateA = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const dateB = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return dateA.getTime() > dateB.getTime();
}

/**
 * Returns a new Date shifted by `count` months from the given date.
 * Clamps day to the last day of the target month if needed.
 */
export function addMonths(date: Date, count: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth() + count, 1);
  const maxDay = getDaysInMonth(result.getFullYear(), result.getMonth());
  result.setDate(Math.min(date.getDate(), maxDay));
  return result;
}
