import { useCallback, useMemo, useState } from "react";
import { useControllableState } from "./use-controllable-state.js";
import { useIds } from "./use-id.js";
import { createKeyboardHandler } from "../utils/create-keyboard-handler.js";
import {
  getCalendarGrid,
  formatDate,
  isSameDay,
  type CalendarDay,
} from "../utils/date-utils.js";
import type { PropGetterReturn } from "../types/prop-getters.js";
import type { InteractionKeyMap } from "../types/interactions.js";

const CALENDAR_KEY_MAP: InteractionKeyMap = {
  Escape: "dismiss",
};

export interface UseDatePickerOptions {
  /** Controlled selected date */
  value?: Date | null;
  /** Default date for uncontrolled mode */
  defaultValue?: Date | null;
  /** Called when the selected date changes */
  onChange?: (date: Date | null) => void;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Display format. Default: "YYYY-MM-DD" */
  format?: string;
}

export interface UseDatePickerReturn {
  /** Currently selected date */
  selectedDate: Date | null;
  /** Formatted display string for the input */
  displayValue: string;
  /** Current calendar view month (0-11) */
  calendarMonth: number;
  /** Current calendar view year */
  calendarYear: number;
  /** 6×7 grid of calendar days */
  calendarDays: CalendarDay[][];
  /** Whether the calendar dropdown is open */
  isCalendarOpen: boolean;
  /** Open the calendar */
  openCalendar: () => void;
  /** Close the calendar */
  closeCalendar: () => void;
  /** Toggle the calendar */
  toggleCalendar: () => void;
  /** Select a specific date */
  selectDate: (date: Date) => void;
  /** Navigate to the previous month */
  prevMonth: () => void;
  /** Navigate to the next month */
  nextMonth: () => void;
  /** Navigate to a specific month/year */
  goToMonth: (year: number, month: number) => void;
  /** Props for the date input element */
  getInputProps: () => PropGetterReturn;
  /** Props for the calendar container */
  getCalendarProps: () => { role: string; "aria-label": string };
  /** Props for an individual day cell */
  getDayProps: (day: CalendarDay) => PropGetterReturn;
}

/**
 * Headless date picker hook.
 *
 * Manages date selection, calendar navigation, and calendar open/close state.
 * Computes a 6×7 calendar grid with previous/next month padding.
 * Provides prop getters for input, calendar container, and day cells
 * with full ARIA support.
 */
export function useDatePicker(
  options: UseDatePickerOptions = {},
): UseDatePickerReturn {
  const {
    value: controlledValue,
    defaultValue = null,
    onChange,
    minDate,
    maxDate,
    format = "YYYY-MM-DD",
  } = options;

  const [selectedDate, setSelectedDate] = useControllableState<Date | null>({
    value: controlledValue,
    defaultValue,
    onChange,
  });

  const today = new Date();
  const initialDate = selectedDate ?? today;

  const [calendarMonth, setCalendarMonth] = useState<number>(
    initialDate.getMonth(),
  );
  const [calendarYear, setCalendarYear] = useState<number>(
    initialDate.getFullYear(),
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const datePickerIds = useIds("datepicker", "input", "calendar");

  const ids = {
    base: datePickerIds["base"]!,
    input: datePickerIds["input"]!,
    calendar: datePickerIds["calendar"]!,
  };

  const displayValue = useMemo(
    () => (selectedDate ? formatDate(selectedDate, format) : ""),
    [selectedDate, format],
  );

  const calendarDays = useMemo(
    () => getCalendarGrid(calendarYear, calendarMonth, minDate, maxDate),
    [calendarYear, calendarMonth, minDate, maxDate],
  );

  const openCalendar = useCallback(() => setIsCalendarOpen(true), []);
  const closeCalendar = useCallback(() => setIsCalendarOpen(false), []);
  const toggleCalendar = useCallback(
    () => setIsCalendarOpen((prev) => !prev),
    [],
  );

  const selectDate = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    },
    [setSelectedDate],
  );

  const prevMonth = useCallback(() => {
    setCalendarMonth((prev) => {
      if (prev === 0) {
        setCalendarYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setCalendarMonth((prev) => {
      if (prev === 11) {
        setCalendarYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  const goToMonth = useCallback((year: number, month: number) => {
    setCalendarYear(year);
    setCalendarMonth(month);
  }, []);

  const calendarKeyboardConfig = useMemo(
    () => createKeyboardHandler(CALENDAR_KEY_MAP),
    [],
  );

  const getInputProps = useCallback((): PropGetterReturn => {
    return {
      accessibility: {
        role: "combobox",
        expanded: isCalendarOpen,
        hasPopup: "dialog",
        controls: isCalendarOpen ? ids.calendar : undefined,
        label: "Date picker",
      },
      keyboardConfig: isCalendarOpen ? calendarKeyboardConfig : undefined,
      onAction: toggleCalendar,
    };
  }, [isCalendarOpen, ids.calendar, calendarKeyboardConfig, toggleCalendar]);

  const getCalendarProps = useCallback(
    () => ({
      role: "grid" as const,
      "aria-label": "Calendar",
    }),
    [],
  );

  const getDayProps = useCallback(
    (day: CalendarDay): PropGetterReturn => {
      const isSelected =
        selectedDate !== null && isSameDay(day.date, selectedDate);

      return {
        accessibility: {
          role: "gridcell",
          selected: isSelected,
          disabled: day.isDisabled || undefined,
          tabIndex: isSelected ? 0 : -1,
          label: day.date.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
        onAction: day.isDisabled ? undefined : () => selectDate(day.date),
      };
    },
    [selectedDate, selectDate],
  );

  return {
    selectedDate,
    displayValue,
    calendarMonth,
    calendarYear,
    calendarDays,
    isCalendarOpen,
    openCalendar,
    closeCalendar,
    toggleCalendar,
    selectDate,
    prevMonth,
    nextMonth,
    goToMonth,
    getInputProps,
    getCalendarProps,
    getDayProps,
  };
}
