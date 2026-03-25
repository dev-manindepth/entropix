import { forwardRef, useState, useCallback, useMemo } from "react";
import { cn } from "../../utils/cn.js";
import { useLocale } from "../../i18n/i18n-context.js";
import "../../styles/date-picker.css";

export interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Currently selected date */
  value?: Date | null;
  /** Callback when a date is selected */
  onChange?: (date: Date) => void;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Whether the calendar is disabled */
  disabled?: boolean;
}


function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isDateDisabled(date: Date, minDate?: Date, maxDate?: Date): boolean {
  if (minDate) {
    const min = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    if (date < min) return true;
  }
  if (maxDate) {
    const max = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
    if (date > max) return true;
  }
  return false;
}

/**
 * Calendar — standalone calendar grid component.
 *
 * Renders a month view with navigation, day name headers, and selectable day cells.
 * Keyboard navigation: arrow keys move focus, Enter/Space selects.
 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  function Calendar(
    { value, onChange, minDate, maxDate, disabled = false, className, ...rest },
    ref,
  ) {
    const locale = useLocale();
    const today = useMemo(() => new Date(), []);
    const initialMonth = value ?? today;
    const [viewYear, setViewYear] = useState(initialMonth.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialMonth.getMonth());
    const [focusedDay, setFocusedDay] = useState<number | null>(null);

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

    const goToPrevMonth = useCallback(() => {
      setViewMonth((prev) => {
        if (prev === 0) {
          setViewYear((y) => y - 1);
          return 11;
        }
        return prev - 1;
      });
      setFocusedDay(null);
    }, []);

    const goToNextMonth = useCallback(() => {
      setViewMonth((prev) => {
        if (prev === 11) {
          setViewYear((y) => y + 1);
          return 0;
        }
        return prev + 1;
      });
      setFocusedDay(null);
    }, []);

    const handleDayClick = useCallback(
      (day: number) => {
        if (disabled) return;
        const date = new Date(viewYear, viewMonth, day);
        if (isDateDisabled(date, minDate, maxDate)) return;
        onChange?.(date);
      },
      [viewYear, viewMonth, disabled, onChange, minDate, maxDate],
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;

        const current = focusedDay ?? (value ? value.getDate() : 1);
        let next = current;

        switch (event.key) {
          case "ArrowLeft":
            next = current - 1;
            break;
          case "ArrowRight":
            next = current + 1;
            break;
          case "ArrowUp":
            next = current - 7;
            break;
          case "ArrowDown":
            next = current + 7;
            break;
          case "Enter":
          case " ":
            event.preventDefault();
            handleDayClick(current);
            return;
          default:
            return;
        }

        event.preventDefault();

        if (next < 1) {
          goToPrevMonth();
        } else if (next > daysInMonth) {
          goToNextMonth();
        } else {
          setFocusedDay(next);
        }
      },
      [disabled, focusedDay, value, daysInMonth, handleDayClick, goToPrevMonth, goToNextMonth],
    );

    // Build grid cells: empty cells for padding + day cells
    const cells: Array<{ day: number | null; key: string }> = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, key: `empty-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, key: `day-${d}` });
    }

    return (
      <div
        ref={ref}
        role="grid"
        aria-label={locale.calendar_label}
        {...rest}
        className={cn("entropix-calendar", className)}
        onKeyDown={handleKeyDown}
        data-disabled={disabled || undefined}
      >
        {/* Header: prev / month-year / next */}
        <div className="entropix-calendar__header">
          <button
            type="button"
            className="entropix-calendar__nav"
            onClick={goToPrevMonth}
            aria-label={locale.calendar_previousMonth}
            disabled={disabled}
          >
            &#8249;
          </button>
          <span className="entropix-calendar__title">
            {locale.calendar_monthNames[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            className="entropix-calendar__nav"
            onClick={goToNextMonth}
            aria-label={locale.calendar_nextMonth}
            disabled={disabled}
          >
            &#8250;
          </button>
        </div>

        {/* Day names row */}
        <div className="entropix-calendar__day-names" role="row">
          {locale.calendar_dayNames.map((name) => (
            <span
              key={name}
              className="entropix-calendar__day-name"
              role="columnheader"
              aria-label={name}
            >
              {name}
            </span>
          ))}
        </div>

        {/* Day grid */}
        <div className="entropix-calendar__grid">
          {cells.map(({ day, key }) => {
            if (day === null) {
              return <span key={key} className="entropix-calendar__cell entropix-calendar__cell--empty" />;
            }

            const date = new Date(viewYear, viewMonth, day);
            const isSelected = value ? isSameDay(date, value) : false;
            const isToday = isSameDay(date, today);
            const isDisabledDay = disabled || isDateDisabled(date, minDate, maxDate);
            const isFocused = focusedDay === day;

            return (
              <button
                key={key}
                type="button"
                role="gridcell"
                className={cn(
                  "entropix-calendar__cell",
                  isSelected && "entropix-calendar__cell--selected",
                  isToday && "entropix-calendar__cell--today",
                  isDisabledDay && "entropix-calendar__cell--disabled",
                )}
                tabIndex={isFocused || (focusedDay === null && day === 1) ? 0 : -1}
                onClick={() => handleDayClick(day)}
                disabled={isDisabledDay}
                aria-selected={isSelected}
                aria-current={isToday ? "date" : undefined}
                aria-label={locale.calendar_dayLabel(date)}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);
